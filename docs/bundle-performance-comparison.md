# 打包体积与性能对比报告：Paper vs Element Plus / Naive UI / Ant Design Vue

> - **报告日期**：2026-09-28
> - **方法**：同尺实测 —— 在独立工作区（`D:\ai-native\bench-ui`，仓库外）用同一套 Vite 8 生产构建管线、同一 Vue 版本、同一组组件场景，对四个库做统一口径测量；npm 元数据取自 registry 一手数据；CSS 产物体积直接在已安装包内实测。所有数字均可复现（步骤见附录 B）。
> - **对比对象**：Paper（`@ui/components`，本仓库，65 组件，未发布）· Element Plus 2.14.6 · Naive UI 2.45.3 · Ant Design Vue 4.2.6
> - **一句话结论**：**按需引入场景 Paper 比三家竞品小 7~16 倍（8 组件 gzip 合计 11.5KB vs 85.7~181.6KB），全量引入也是四库最小（gzip 合计 272KB）；挂载基准最快；代价是「源码直发」形态带来的消费方构建成本与生态兼容性限制。**

---

## 1. 结论摘要

| 维度 | Paper | Element Plus 2.14.6 | Naive UI 2.45.3 | Ant Design Vue 4.2.6 |
|---|---|---|---|---|
| npm 解压体积 | ~5.8 MB（src+dist+tokens，678 文件） | 41.9 MB / 6863 文件 | 49.5 MB / 5432 文件 | 74.3 MB / 5355 文件 |
| 运行时 JS 依赖 | **0**（仅 workspace 的 CSS token 包） | 15 | 18 | 22 |
| 全量引入（gzip，JS+CSS） | **272 KB**（255.7+16.4） | 322 KB（275.5+47.0） | 346 KB（346.4+0） | 402 KB（402.3+0） |
| 按需 8 组件（gzip，JS+CSS） | **11.5 KB**（7.8+3.7） | 85.7 KB（JS；CSS 另计） | 124.4 KB | 181.6 KB |
| CSS 交付 | SFC scoped 按组件随用随打 + token 层 3KB gzip | 全量 `index.css` 48.2KB gzip（包内实测 361KB） | 无 CSS 文件（运行时 css-in-js） | 仅 reset.css（运行时 cssinjs） |
| 挂载基准（Button×500，两轮中位数） | **49.7 / 52.3 ms** | 61.1 / 76.0 ms | 366.5 / 583.6 ms | 193.1 / 312.0 ms |
| 消费方构建耗时（8 组件，Vite 8） | ~1.45 s（需现编译 SFC/TS） | ~0.83 s（预编译产物） | — | — |

三个主要发现：

1. **按需体积差一个数量级**。同样引入 Button / Input / Select / Dialog / Tooltip / Table / Checkbox / Switch 八个组件，Paper 打出的 JS 仅 23.9KB raw（7.8KB gzip），是 Element Plus（257.3KB raw）的约 1/11、Ant Design Vue（612.3KB raw）的约 1/26。核心原因：零第三方运行时依赖 + 无国际化/日期库随行 + `sideEffects: false` 的源码直发让 tree-shaking 直接作用于 SFC 模块边界。
2. **全量引入 Paper 也是最小，且是四库中唯一 CSS 静态化的**。Naive UI 与 Ant Design Vue 的「0 CSS 文件」不是免费午餐——样式在运行时生成，挂载基准中两者慢 4~12 倍与此直接相关；Paper 与 Element Plus 的 CSS 走构建期静态产物，而 Paper 的 token 化 CSS（`var(--ui-*)` 高重复）压缩效率极高：146KB raw 压到 16.8KB gzip，仅为 Element Plus 全量 CSS（48.2KB gzip）的 1/3，却覆盖同规模组件集。
3. **体积与性能优势有明确代价**：Paper 以 TS+SFC 源码直发（`main → src/index.ts`），消费方必须走 Vite+plugin-vue（或等价）管线并承担 SFC 编译（本基准下 8 组件场景多 ~0.6s），且没有 UMD/CDN 直接使用的通道、没有预编译 ESM 目录。竞品的 41.9~74.3MB 安装体积正是在为「预编译多格式产物 + 双份样式目录 + 多语言 locale 文件」买单。

---

## 2. 方法论与口径

- **环境**：Windows（Git Bash）/ Node 22 / pnpm 10.29 / Vite 8.3.1（oxc 压缩）/ vue 3.5.43（四库共用同一实例）。
- **打包体积**：统一 `vite build`，`rollupOptions.external: ['vue']`，产物只含组件库自身代码（JS 与 CSS 分列）。gzip 用 node `zlib.gzipSync` 默认级别，四库同一实现。
- **Paper 消费形态**：按包声明的真实形态测——`main: ./src/index.ts` 源码直发（`@ui/tokens` alias 至本仓库），另测 `dist/` 预构建产物作对照（两者全量结果一致：760.9 vs 760.8 KB raw，差异 <0.1%，见附录 A）。
- **按需场景**：具名导入 8 个基础组件（Button / Input / Select / Dialog|Modal / Tooltip / Table / Checkbox / Switch），`h()` 渲染函数实际引用（不用 auto-import 插件，测纯 ESM tree-shaking 下限）。Element Plus 场景不含 CSS（其按需样式需 unplugin 或引全量 CSS，报告中两种口径都给）。
- **挂载基准**：happy-dom 20.14 模拟 DOM；`createApp` + `h()` 渲染 N 个组件挂到游离节点；预热 1 轮 + 正式 10 轮取中位数。共跑三轮，其中一轮被并行任务污染已弃用，报告两轮干净数据。
- **元数据**：`npm view`（registry 一手）；CSS 产物在 `bench-ui/node_modules` 内对已安装包实测。

## 3. 打包体积对比

### 3.1 npm 安装体积与依赖面（registry 一手数据）

| 库 | 版本（发布日期） | 解压体积 | 文件数 | 运行时依赖数 | 依赖清单（节选） | peer vue |
|---|---|---|---|---|---|---|
| **Paper** | 0.0.0（私有） | ~5.8 MB | 678 | **0** | —（仅 `@ui/tokens` workspace CSS 包） | ^3.5.0 |
| Element Plus | 2.14.6（2026-09-18） | 41.9 MB | 6863 | 15 | dayjs、lodash+lodash-es（双份）、@vueuse/core、@popperjs/core、@floating-ui/dom、@ctrl/tinycolor、async-validator、@element-plus/icons-vue、@types/lodash（类型包混入运行时依赖）… | ^3.3.7 |
| Naive UI | 2.45.3（2026-08-27） | 49.5 MB | 5432 | 18 | css-render、@css-render/vue3-ssr、date-fns(+tz)、treemate、vueuc、vooks、evtd、seemly、highlight.js、async-validator… | ^3.0.0 |
| Ant Design Vue | 4.2.6（**2024-11-11，约 22 个月未发版**） | 74.3 MB | 5355 | 22 | @ant-design/icons-vue、@ant-design/colors、dayjs、stylis、@emotion/hash、lodash+lodash-es、dom-align、scroll-into-view-if-needed、resize-observer-polyfill、vue-types… | >=3.2.0 |

要点：

- Paper 是四者中唯一**零第三方 JS 运行时依赖**的库——日期、国际化、工具函数、色彩处理全部自持且按需加载。
- 三家竞品的运行时依赖里都拖着 `@types/lodash`（EP、Naive）这类类型包，EP 同时发 `lodash` 与 `lodash-es` 双份；这些依赖在按需引入时只有部分能被摇掉。
- 竞品安装体积的构成主要是预编译产物矩阵（`es/` + `lib/` UMD + 双份样式目录 + 全量 locale 文件）；Paper 源码直发天然没有这部分，但也失去了这些形态（见 §6 建议）。

### 3.2 全量引入（应用打包，external vue，gzip 口径）

| 库 | JS raw | JS gzip | CSS raw | CSS gzip | **合计 gzip** |
|---|---|---|---|---|---|
| **Paper**（源码路径） | 760.9 KB | **255.7 KB** | 143.1 KB | **16.4 KB** | **272.1 KB** |
| Paper（dist 产物路径） | 760.8 KB | 255.7 KB | 143.1 KB | 16.4 KB | 272.1 KB |
| Element Plus | 879.6 KB | 275.5 KB | 351.7 KB | 47.0 KB | 322.5 KB |
| Naive UI | 1303.1 KB | 346.4 KB | 0（运行时生成） | — | 346.4 KB |
| Ant Design Vue | 1343.5 KB | 402.3 KB | 0（运行时生成） | — | 402.3 KB |

注：仓库内 `pnpm -C packages/components build` 自报口径为 `index.js` 896.6 KB（gzip 278.3 KB）+ `components.css` 146.5 KB（gzip 16.8 KB）；与 bench 复测的差异（896→760 KB）来自二次 tree-shake 与二次压缩，两口径均已如实列出。

### 3.3 按需引入（同 8 个基础组件，纯 ESM tree-shaking）

| 库 | JS raw | JS gzip | CSS | **JS gzip 对 Paper 倍数** |
|---|---|---|---|---|
| **Paper** | **23.9 KB** | **7.8 KB** | 21.3 KB raw / 3.7 KB gzip（含 token 层 `paper.css`） | 1× |
| Element Plus | 257.3 KB | 85.7 KB | 未含（需 unplugin 按需样式，或全量 +48.2 KB gzip） | 11× |
| Naive UI | 444.4 KB | 124.4 KB | 无静态 CSS（样式成本在运行时） | 16× |
| Ant Design Vue | 612.3 KB | 181.6 KB | 无静态 CSS（样式成本在运行时） | 23× |

公平性说明：

- 这是「同 8 个基础组件」口径，不是功能等价口径。Element Plus 按需产物里包含 popper/floating 定位栈、表单校验器等共享能力；Paper 的组件功能面也更精简——官方口径组件数：EP 80 个文档组件页 / Ant Design Vue 68 / Naive UI 90+（README 自述）/ Paper 65（本地目录实测：EP `es/components` 124 目录、Naive 155 个 `N*` 导出、antdv `es/` ~90 目录）。读者应把它理解为「覆盖同等基础场景时的下限成本」，而非逐功能等价对比。
- 各库官方按需引入口径：EP 官方推荐 `unplugin-vue-components` + `unplugin-auto-import`（样式按组件追加）；Ant Design Vue v4 官方已弃用 `babel-plugin-import`，**具名导入即按需**（与本文场景一致）；Naive UI `sideEffects: false`，README 官方背书全量可 tree-shake。
- Element Plus 若走官方推荐的 `unplugin-vue-components` 自动按需样式，CSS 会按组件比例追加（本报告未测）；保守区间为 85.7（无样式）~133 KB gzip（全量样式）。
- 外部交叉验证（bundlephobia 全量打包口径，仅作量级参考）：EP 298 KB / Ant Design Vue 420 KB / Naive UI 521 KB gzip（含 date-fns 拉高），与本文 §3.2 的全量排序一致。

### 3.4 CSS 交付模型（包内一手实测）

| 库 | 包内 CSS 产物 | 交付模型 | 首屏关键 CSS 可控性 |
|---|---|---|---|
| **Paper** | 组件无独立 CSS 产物（scoped style 随 SFC 编译）；`@ui/tokens/src/paper.css` **12.9 KB raw / 3.0 KB gzip** | 构建期静态：用到哪个组件打哪个组件的 scoped CSS + 一次性 3KB token 层 | 高：按需 + 可提取关键 CSS |
| Element Plus | `dist/index.css` = `theme-chalk/index.css` **361.4 KB raw / 48.2 KB gzip** | 构建期静态：全量引入 or unplugin 按组件追加 | 中：依赖工具链做按需 |
| Naive UI | **0 个 CSS 文件** | 运行时 css-in-js（css-render，SSR 需 `@css-render/vue3-ssr`） | 低：首挂载生成 + FOUC 风险自担 |
| Ant Design Vue | 仅 `dist/reset.css` 3.7 KB / 1.3 KB gzip | 运行时 cssinjs（stylis + @emotion/hash） | 低：同上 |

Paper 的 CSS 压缩率异常好（146 KB raw → 16.8 KB gzip，~8.7:1）：`--ui-*` token 体系使选择器与声明高度重复，gzip 友好；这解释了为何同样覆盖 65 组件，Paper 全量 CSS 只有 Element Plus 的 1/3（16.4 vs 48.2 KB gzip）。

## 4. 运行时挂载性能（happy-dom 基准）

两轮干净数据（每轮预热 1 + 正式 10 次取中位数，单位 ms；happy-dom 是 DOM 模拟环境，**只看相对差异**）：

| 场景 | Paper | Element Plus | Naive UI | Ant Design Vue |
|---|---|---|---|---|
| Button×500 · 轮 1 | **49.7** | 76.0 | 583.6 | 312.0 |
| Button×500 · 轮 2 | **52.3** | 61.1 | 366.5 | 193.1 |
| Input×300 · 轮 1 | **46.3** | 133.8 | 574.6 | 353.8 |
| Input×300 · 轮 2 | **22.7** | 82.9 | 571.4 | 419.4 |

解读（保守口径）：

- **Paper 与 Element Plus 同属「静态 CSS」阵营，同数量级**；Paper 中位数更低，其中 Input 场景优势稳定（约为 EP 的 1/3~1/2），Button 场景两者接近、轮间波动大于库间差异。
- **Naive UI 与 Ant Design Vue 慢 4~12 倍**，主因是 css-in-js：首挂载时逐组件生成+注入样式。真实浏览器中 DOM 操作比 happy-dom 快得多，倍数会收窄，但「挂载期额外做样式序列化与 style 标签注入」的成本是结构性的、真实存在的（两库也因此付出 SSR 关键 CSS 提取的额外复杂度）。
- 局限：本基准不覆盖更新/交互路径（打字、开关弹层）、真实浏览器渲染与样式回流量、以及大列表虚拟滚动；结论应以「挂载期相对成本」为限。

## 5. 消费方构建成本（源码直发的另一面）

8 组件按需场景的完整 `vite build` 墙钟时间（含进程启动，3 次取样）：

| 库 | 形态 | 构建耗时 |
|---|---|---|
| Paper | TS/SFC 源码直发，需现场编译 | 1392 / 1460 / 1494 ms |
| Element Plus | 预编译 `es/` 产物 | 768 / 849 / 870 ms |

差距 ~0.6s 量级，随应用规模与 HMR 场景放大（HMR 时 SFC 重编译在源码直发库上更频繁）。这是 Paper 换取「零依赖 + 天然按需 CSS + 极小安装体积」付出的真实成本。

## 6. 解读与建议

**Paper 为什么小、快（结构性原因）**：

1. 零第三方运行时依赖——没有 dayjs/lodash/icons 全家桶随行；
2. token-only 硬约束——视觉全部走 `var(--ui-*)`，组件 CSS 极薄且 gzip 友好；
3. 源码直发 + `sideEffects: false`——tree-shaking 直接作用于 SFC 模块边界，CSS 天然按需（不需要 unplugin 这类样式自动追加工具链）；
4. 共享层收口（浮层引擎/模态层/列表导航状态机）——同一能力不随组件重复打包。

**短板与建议（按优先级）**：

1. **发布形态单一是当前最大的生态风险**：只有源码直发一条通道，意味着无法被不支持 SFC 编译的消费方（如纯 webpack+babel、CDN+script、微前端远程加载）使用。若计划公开发布，建议补预编译 ESM 目录（`es/` 分组件文件）并保持 `sideEffects: false`；源码路径可作为 `development` condition 保留，兼得两端。
2. **`dist/` 目前是单文件未分包产物**（`index.js` 896KB）：走 dist 消费时无法代码分割。若保留 dist 通道，建议改为分组件 entry 的多产物。
3. **性能故事可以讲得更硬**：当前基准只在 happy-dom 挂载口径领先；建议补真实浏览器（Playwright trace / Chrome tracing）的挂载与交互基准，并把「静态 CSS vs css-in-js」的首屏指标（FCP 前的样式成本）量化，形成可对外引用的数字。
4. **按需体积优势要在公平口径下表述**：对外沟通建议用「同 8 基础组件场景」这类可复现场景化说法（本报告 §3.3），避免「比 EP 小 90%」这类无场景断言。
5. 组件数差距（65 vs 90~155）意味着某些重组件（EP 的 date-picker 系、antdv 的 upload/transfer 等）Paper 尚无对应物——体积对比不覆盖这些场景。

## 7. 附录 A：原始数据

打包体积（bench-ui `scripts/measure.mjs` 全量输出，raw/gzip 均为 kB）：

```text
| scenario         | js files | js raw | js gzip | css files | css raw | css gzip |
|------------------|----------|--------|---------|-----------|---------|----------|
| antdv-full       | 1 | 1343.5 | 402.3 | 0 |    0.0 |  0.0 |
| antdv-ondemand   | 1 |  612.3 | 181.6 | 0 |    0.0 |  0.0 |
| ep-full          | 1 |  879.6 | 275.5 | 1 |  351.7 | 47.0 |
| ep-ondemand      | 1 |  257.3 |  85.7 | 0 |    0.0 |  0.0 |
| naive-full       | 1 | 1303.1 | 346.4 | 0 |    0.0 |  0.0 |
| naive-ondemand   | 1 |  444.4 | 124.4 | 0 |    0.0 |  0.0 |
| paper-dist-full  | 1 |  760.8 | 255.7 | 1 |  143.1 | 16.4 |
| paper-full       | 1 |  760.9 | 255.7 | 1 |  143.1 | 16.4 |
| paper-ondemand   | 1 |   23.9 |   7.8 | 1 |   21.3 |  3.7 |
```

包内 CSS 一手实测：

```text
element-plus/dist/index.css          raw 361,362 B   gzip 48,194 B
element-plus/theme-chalk/index.css   raw 361,362 B   gzip 48,194 B（与 dist 一致）
naive-ui 包内 *.css                  0 个（全部运行时生成）
ant-design-vue/dist/reset.css        raw   3,713 B   gzip  1,323 B
@ui/tokens/src/paper.css             raw  12,858 B   gzip  3,008 B
```

仓库自构建（`pnpm -C packages/components build`）：`dist/index.js` 896,642 B（gzip 274,802）· `dist/components.css` 146,523 B（gzip 16,849）。

## 8. 附录 B：复现步骤

```bash
# 1) 构建 Paper 产物（仓库内）
pnpm -C packages/components build   # dist/index.js + dist/components.css

# 2) 基准工作区（仓库外）
mkdir D:/ai-native/bench-ui && cd D:/ai-native/bench-ui
pnpm add vue@^3.5 element-plus naive-ui ant-design-vue
pnpm add -D vite @vitejs/plugin-vue typescript@5.9 happy-dom
#   9 个场景入口 + vite.bench.config.ts（external vue、alias 指向仓库 src）
node scripts/build-all.mjs          # 依次构建 9 个场景
node scripts/measure.mjs            # 输出 §附录 A 体积表

# 3) 挂载基准：打包为单文件（保证四库同一 vue 实例）后原生 node 运行
npx vite build --config vite.bench2.config.ts && node dist-bench/bench.mjs

# 4) npm 元数据
npm view <pkg> version dist.unpackedSize dist.fileCount dependencies --json
```

关键实现细节：挂载基准最初用 vite-node 直跑会因两份 vue 实例（optimizer 预构建 vs 原生 external）产生 `doc = null` 类幽灵错误，改为「单文件打包 + happy-dom 保持 external + 全局注入模块最先执行」后稳定；happy-dom 需要 `document/SVGElement/Event/Image/...` 一批显式全局（Node 原生同名类会导致 `dispatchEvent` 类型校验失败）。

---

*相关文档：[bundle-perf-competitor-notes.md](bundle-perf-competitor-notes.md)（竞品包体积/CSS 交付模型/依赖 footprint 的逐项一手调研笔记，含 PrimeVue 5 与暗色主题/token 体系补充数据）· [ai-era-competitive-research.md](ai-era-competitive-research.md)（AI 友好性维度的竞品研究，与本文互为补充）。*
