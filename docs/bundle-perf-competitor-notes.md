# 竞品包体积与 CSS 交付模型调研笔记

> 调研日期：2026-09-28。调研人：agent（资料调研，未改动任何仓库代码）。
> 调研对象：Element Plus、Ant Design Vue、Naive UI、PrimeVue（Vue 3 组件库）。
>
> **数据口径与来源约定**（全文适用）：
> - `npm view`：本机 npm CLI（镜像源，元数据与 npmjs registry 同步），字段为 `dist.unpackedSize`（解压后磁盘体积，含文档/类型/多套产物，**不等于** 引入成本）与 `dist.fileCount`。
> - **CDN 实测**：`curl -sL` 下载 unpkg / jsdelivr 文件后 `wc -c`（原样字节）；gzip 体积为本地 `gzip -c`（默认压缩级 6）管道实测。
> - **bundlephobia 口径**：`https://bundlephobia.com/api/size?package=<pkg>@<version>`，其 minified/gzip 是 webpack 从 ESM 入口全量打包的结果（含它解析到的 peer/内部依赖），**只用于横向参考，不可与 CDN 实测混用**。
> - **官方文档**：可抓取页面或仓库内文档源码（GitHub API），引文均为原文。
> - 抓不到的一律标「未能核实」。

---

## 1. Element Plus

### 1.1 npm 元数据（npm view，2026-09-28 执行）

| 项 | 值 | 来源 |
|---|---|---|
| latest | 2.14.6 | `npm view element-plus version` |
| 发布日期 | 2026-09-18（`time["2.14.6"]`） | `npm view element-plus@2.14.6 time` |
| dist.unpackedSize | 43,958,304 B（≈41.9 MiB） | `npm view` |
| dist.fileCount | 6,863 | `npm view` |
| dependencies | 15 个（含 2 个 `@types/*` 类型包） | `npm view element-plus dependencies` |
| peerDependencies | `vue: ^3.3.7` | `npm view` |
| license | MIT | `npm view element-plus license` |

15 个依赖（原文）：`dayjs ^1.11.20`、`lodash ^4.18.1`、`lodash-es ^4.18.1`、`memoize-one ^6.0.0`、`@vueuse/core 15.0.0`、`@types/lodash`、`@popperjs/core`（别名 `npm:@sxzz/popperjs-es@^2.11.8`）、`lodash-unified ^1.0.3`、`@ctrl/tinycolor ^4.2.1`、`async-validator ^4.2.5`、`@floating-ui/dom ^1.8.0`、`@types/lodash-es`、`normalize-wheel-es ^1.2.0`、`@element-plus/icons-vue ^2.3.2`、`vue-component-type-helpers ^3.3.11`。

- **sideEffects**：已声明，精确数组——`["dist/*", "theme-chalk/**/*.css", "theme-chalk/src/**/*.scss", "es/components/*/style/*", "lib/components/*/style/*"]`（`npm view element-plus sideEffects`）。即：JS 产物默认无副作用可摇树，样式入口被显式标记为副作用。
- **exports/module 形态**：提供完整 `exports` map：`.` → `import: ./es/index.mjs` / `require: ./lib/index.js`，并有 `./es/*`（`./es/*.mjs`）与 `./lib/*.js` 逐路径分支（`npm view element-plus exports`）。CJS（lib）+ ESM（es，.mjs）双产物，支持 tree-shaking 的 ESM 按路径导入。

### 1.2 CSS 交付模型（unpkg 实测）

| 产物 | URL | 原样字节 | gzip 实测 | 来源 |
|---|---|---|---|---|
| 全量 index.css | `https://unpkg.com/element-plus/dist/index.css` | 361,362 B | 48,197 B | curl 下载 `wc -c` / `gzip -c` |
| 逐组件 el-button.css | `https://unpkg.com/element-plus/theme-chalk/el-button.css` | 19,926 B | 2,161 B | 同上 |
| 暗色变量层 | `https://unpkg.com/element-plus/theme-chalk/dark/css-vars.css` | 2,946 B | 未测 | 同上（`wc -c`） |
| UMD 全量 JS | `https://unpkg.com/element-plus/dist/index.full.min.js` | 1,057,515 B | 293,343 B | 同上 |

- 逐组件样式支持：theme-chalk 根目录共 **121 个 `.css` 文件**（unpkg `?meta` 文件树统计），即每组件一个样式文件，支持手工按组件引样式。
- `index.full.min.js` 为 UMD，头部注释 `/*! Element Plus v2.14.6 */`，工厂参数为 `require("vue")`——**vue 是外部依赖，未捆绑进该文件**（文件头实测）。
- 主题体系：BEM 类名 + `--el-*` CSS 变量；官方文档 "We use the function of SCSS to automatically generate css variables for use"，SCSS 变量与 CSS 变量双层（element-plus.org/en-US/guide/theming.html，WebFetch 抓取）。
- 暗色：官方 dark-mode 文档（repo `docs/en-US/guide/dark-mode.md`，gh api 取原文）："We extracted and unified all necessary variables to make it possible to implement based on CSS Vars"——`<html class="dark">` + `import 'element-plus/theme-chalk/dark/css-vars.css'` 即启用。

### 1.3 按需引入（官方口径）

来源：element-plus.org/en-US/guide/quickstart.html（WebFetch 抓取）。

- 全量引入原话："If you don't care about the bundle size so much, it's more convenient to use full import"（需 `import 'element-plus/dist/index.css'`）。
- **官方推荐按需**：装 `unplugin-vue-components` + `unplugin-auto-import`，配 `ElementPlusResolver()`（页面标注 "Auto import Recommend"）。
- 手动引入："Element Plus provides out of box Tree Shaking functionalities based on ES Module"，即**直接 named import 可摇树**；但样式需额外装 `unplugin-element-plus`。
- 官方包体积数字：quickstart 页**未给出具体 KB 数**，仅有上面那句定性表述（未能核实到官方数字）。

### 1.4 运行时依赖 footprint（npm view dist.unpackedSize）

| 依赖 | 解压体积 | 备注 |
|---|---|---|
| @element-plus/icons-vue 2.3.2 | 3,298,455 B | 图标全集，按需摇树后远小于此 |
| lodash 4.18.1 | 1,413,741 B | 与 lodash-es 并存（双模块形态） |
| @vueuse/core 15.0.0 | 920,917 B | 运行时实用函数 |
| dayjs 1.11.23 | 681,693 B | 日期（quickstart 提示其非 ESM，pnpm 需注意提升配置） |
| lodash-es 4.18.1 | 634,630 B | 摇树形态 |
| async-validator 4.2.5 | 285,053 B | 表单校验 |
| @ctrl/tinycolor 4.2.1 | 246,848 B | 颜色计算 |
| @floating-ui/dom 1.8.0 | 174,208 B | 定位（与 popper 别名并存） |
| @sxzz/popperjs-es 2.11.8（@popperjs/core 别名） | 102,688 B | 定位 |
| normalize-wheel-es 1.2.0 | 78,114 B | 滚轮兼容 |
| vue-component-type-helpers 3.3.11 | 5,632 B | 类型辅助 |
| lodash-unified 1.0.3 | 724 B | CJS/ESM 双形态桥 |
| memoize-one 6.0.0 | 未能核实（registry 镜像未返回 unpackedSize；tarball 9,585 B；bundlephobia minified 口径 980 B） | |
| @types/lodash / @types/lodash-es | （类型包，随 dependencies 安装但非运行时代码） | |

「必需运行时」判定：除 `@types/*`、`vue-component-type-helpers`（类型）外，其余 12 个均为运行时依赖；其中 lodash/lodash-es/lodash-unified 三件套 + popper/floating 双定位方案是历史包袱（依赖列表原文）。

### 1.5 组件数与主题

- 官方文档组件页：**80 个**（repo `docs/en-US/component/[a-z-]+.md` 计数，dev 分支）；包内 `es/components/` 124 个目录（unpkg meta，含少量非组件目录）。
- 暗色主题：有（html.dark + css-vars.css 覆盖层）。
- token 体系：`--el-*` CSS 变量（运行时可改）+ SCSS 变量（编译期改），官方建议"custom css variables under a class rather than the global :root"（theming 文档原话）。

---

## 2. Ant Design Vue

### 2.1 npm 元数据

| 项 | 值 | 来源 |
|---|---|---|
| latest | 4.2.6 | `npm view ant-design-vue version` |
| 发布日期 | **2024-11-11**（`time["4.2.6"]`；截至 2026-09-28 已约 22 个月未发新版，dist-tags 无更新稳定通道） | `npm view ant-design-vue@4.2.6 time` / `dist-tags` |
| dist.unpackedSize | 77,953,156 B（≈74.3 MiB，四库最大） | `npm view` |
| dist.fileCount | 5,355 | `npm view` |
| dependencies | 22 个 | `npm view` |
| peerDependencies | `vue: >=3.2.0` | `npm view` |
| license | MIT | `npm view` |

- **sideEffects**：`["site/*", "*.vue", "*.md", "dist/*", "*.css"]`（npm view）——JS 产物未标记副作用，可摇树。
- **exports/module**：**无 `exports` 字段**；`module: es/index.js` + `main: lib/index.js` 双产物（npm view）。ESM 靠 module 字段 + 逐文件 es 目录支持摇树，但缺少现代 exports 逐路径条件分发。

### 2.2 CSS 交付模型（实测 + 官方迁移文档）

- **v4 默认 CSS-in-JS，无组件级静态 CSS 产物**。v4 迁移文档原文（repo `site/src/vueDocs/migration-v4.zh-CN.md`，gh api）：
  - "弃用 less，采用 CSS-in-JS，更好地支持动态主题。"
  - "**产物中不再包含 css 文件**……原本的 `ant-design-vue/dist/antd.css` 也已经移除，如果需要重置一些基本样式请引入 `ant-design-vue/dist/reset.css`。"
  - "Ant Design Vue v4 使用 `:where` css selector 降低 CSS-in-JS hash 值优先级"。
- unpkg `?meta` 全包文件树实测：**全包仅 3 个 `.css` 文件**，全部是 reset.css（`/dist/reset.css`、`/es/style/reset.css`、`/lib/style/reset.css`）。
- `dist/reset.css` 实测 3,713 B（curl + wc -c）。
- 样式运行时由 cssinjs 引擎（依赖含 `@emotion/hash`、`stylis`）在页面内生成与注入。

### 2.3 按需引入（官方口径）

- v4 迁移文档原文："**不再支持 `babel-plugin-import`，CSS-in-JS 本身具有按需加载的能力，不再需要插件支持**。"
- 快速上手文档（repo `site/src/vueDocs/getting-started.zh-CN.md`）给出三种注册：全局完整（`app.use(Antd)` + `import 'ant-design-vue/dist/reset.css'`，"样式文件需要单独引入"）、全局部分（`app.use(Button)`）、局部注册（named import，官方不推荐因为需逐一注册子组件）。
- 结论：**直接 named import 即为官方按需路径**（ESM 摇树 + 样式运行时生成），生态上 `unplugin-vue-components` 亦内置 `AntDesignVueResolver`（unplugin-vue-components README，npm view readme）。
- 官方包体积数字：未找到官方 KB 级表述（未能核实）。

### 2.4 bundlephobia 口径（参考）

`ant-design-vue@4.2.6`：minified 1,451,159 B / gzip 419,641 B；其中 `@ant-design/icons-vue` ≈673,555 B、`@ant-design/icons-svg` ≈665,872 B（bundlephobia API，全量打包口径）。

### 2.5 组件数与主题

- 官方文档组件页：**68 个**（repo `components/*/index.en-US.md` 计数）；包内 `es/` 106 个目录（unpkg meta，含 28 个 `vc-*` 内部实现目录及 style/_util/locale/theme/version 等）。
- 主题：**Design Token 体系**（JS 对象，非 CSS 变量）。定制主题文档（repo `site/src/vueDocs/customize-theme.zh-CN.md`）："我们把影响主题的最小元素称为 **Design Token**"；ConfigProvider `theme.token` 全局令牌 + `theme.components` 组件级 Component Token。
- 暗色：`theme.darkAlgorithm` 暗色算法（另有 default/compact 算法），运行时切换（同文档原话与示例）。

---

## 3. Naive UI

### 3.1 npm 元数据

| 项 | 值 | 来源 |
|---|---|---|
| latest | 2.45.3 | `npm view naive-ui version` |
| 发布日期 | 2026-08-27 | `npm view naive-ui@2.45.3 time` |
| dist.unpackedSize | 51,874,410 B（≈49.5 MiB） | `npm view` |
| dist.fileCount | 5,432 | `npm view` |
| dependencies | 18 个 | `npm view` |
| peerDependencies | `vue: ^3.0.0` | `npm view` |
| license | MIT | `npm view` |

- **sideEffects: `false`**（npm view 实测输出）——四库中唯一整体声明无副作用，摇树最干净。
- **exports/module**：无 `exports` 字段；`module: es/index.mjs` + `main: lib/index.js`（npm view）。es 为 .mjs ESM。
- 依赖清单：`css-render`、`@css-render/plugin-bem`、`@css-render/vue3-ssr`、`vueuc`、`vdirs`、`vooks`、`evtd`、`seemly`、`treemate`、`date-fns`、`date-fns-tz`、`async-validator`、`lodash`/`lodash-es`/`@types/*`、`csstype`、`highlight.js`（依赖列表原文）。

### 3.2 CSS 交付模型（实测）

- unpkg `?meta` 全包文件树实测：**0 个 `.css` 文件**。
- README（npm view readme，官方原文）："you don't need to import any CSS to use the components"——组件样式由 css-render **运行时生成并注入**，主题即 JS 对象（themeOverrides），无静态 CSS 产物、无 CSS 变量（"no less/sass/css variables, no webpack loaders are required"）。
- `es/index.mjs` 实测 36,972 B（curl + wc -c；纯 re-export barrel，摇树由逐文件 ESM 承担）。

### 3.3 按需引入（官方口径）

- README（官方原文）："There are more than 90 components. Hope they can help you write less code. **What's more, they are all treeshakable.**"——直接 named import 官方背书。
- `unplugin-vue-components` README 的 resolver 清单含 "Naive UI"（npm view readme），支持模板自动按需。
- SSR：依赖含 `@css-render/vue3-ssr`（CSS-in-JS 的 SSR 配套，依赖列表原文）。

### 3.4 bundlephobia 口径（参考，注意失真）

`naive-ui@2.45.3`：minified 2,199,719 B / gzip 521,478 B；其中 `date-fns` ≈1,373,486 B（bundlephobia API）。**注意**：这是从入口全量打包、date-fns 被整棵计入的口径；date-fns 本身按函数导出可摇树，真实按需引入远小于此（bundlephobia dependencySizes 原始数据，口径已注明）。

### 3.5 组件数与主题

- README："more than 90 components"；repo `src/<name>/src/` 计数 **101 个**组件目录；包内 `es/` 110 个子目录（unpkg meta，含 locales/_internal 等非组件目录）。
- 主题：TypeScript 类型安全的 `themeOverrides` 对象 + `n-config-provider`；暗色用官方 `darkTheme`（README "Theme Customizable" 章节为机制来源；darkTheme 为包内导出，未能从 SPA 文档站直接抓到页面，标注：文档站 naiveui.com 为 SPA 无法抓取正文）。

---

## 4. PrimeVue（v5）

### 4.1 npm 元数据

| 项 | 值 | 来源 |
|---|---|---|
| latest | 5.0.1 | `npm view primevue version` |
| 发布日期 | 2026-08-13 | `npm view primevue@5.0.1 time` |
| dist.unpackedSize | 9,349,144 B（≈8.9 MiB，四库最小） | `npm view` |
| dist.fileCount | 1,634 | `npm view` |
| dependencies | 8 个 | `npm view` |
| peerDependencies | **无（连 vue 都未声明）** | `npm view primevue peerDependencies` 返回空 |
| license | **"SEE LICENSE IN LICENSE.md"（非 MIT）** | `npm view primevue@5.0.1 license` |

- 依赖清单：`@primeicons/vue ^8.0.0`、`@primeui/license-manager ^1.0.0`、`@primeuix/motion`、`@primeuix/styled ^1.0.0`、`@primeuix/styles ^3.0.0`、`@primeuix/utils ^0.8.0`、`@primevue/core 5.0.1`、`@primevue/icons 5.0.1`（npm view 原文）。
  - `@primeui/license-manager`（解压 17,683 B）依赖 `@noble/ed25519` + `@noble/hashes`（签名校验），配合非 MIT 许可证字段，指向 v5 的商业化/许可校验机制（事实来自依赖与 license 字段本身；动机不做推断）。
- **sideEffects**：`["*.vue"]`（npm view）。
- **exports/module**：完整 `exports` map：`.` 与 `./*` 均给 `types`/`import`（`./index.mjs`、`./*/index.mjs`）分支；`module: ./index.mjs`（npm view）。逐组件路径 ESM，结构上支持摇树。

### 4.2 CSS 交付模型（实测 + 官方 theming 文档）

- 主包 **0 个 `.css` 文件**（unpkg `?meta` 实测；顶层即 `/umd/primevue.min.js` 与 213 个逐组件目录，每个组件目录配 `package.json` 与 `style/` 子包）。
- **styled / unstyled 双模式**（primevue.dev/theming/styled/，web_reader 抓取）。styled 模式架构原文："A theme consists of two parts; **base** and **preset**. The base is the style rules with CSS variables as placeholders whereas the preset is a set of design tokens"。
  - **base = `@primeuix/styles`**（primevue 5.0.1 的运行时依赖）：解压 488,456 B / 109 文件，全部 `.mjs`（JS 样式定义，无 css；unpkg meta + npm view 实测）。主题规则在运行时注入。
  - **preset = `@primeuix/themes`**（用户侧另装，latest 3.0.1）：解压 3,652,343 B / 1,630 文件，依赖仅 `@primeuix/styled`（npm view）。内置 Aura/Material/Lara/Nora 四 preset，及 14px 兼容变体（官方：14px legacy presets "maintained until June 2027"，v5 默认 16px）。
  - 注入引擎 `@primeuix/styled` 1.0.0：解压 48,647 B（npm view）。
- token 体系（官方 theming/styled 页原文）：三层——primitive（如 blue-500）/ semantic（如 primary.color）/ component（如 button.color）；CSS 变量默认前缀 `p`（`var(--p-primary-color)`，可配 `prefix`）；`options.cssVariables` 默认 true（组件 token 生成 CSS 变量而非内联）；`options.cssLayer` 默认 false。
- 暗色：`options.darkModeSelector` **默认 `'system'`**（生成 `@media (prefers-color-scheme: dark)`），可配 `'.my-app-dark'` 类或 `false/none` 关闭（官方 DarkMode 文档原文）。
- UMD 全量：`https://cdn.jsdelivr.net/npm/primevue@5.0.1/umd/primevue.min.js` 实测 2,184,707 B / gzip 432,617 B（curl + wc -c / gzip -c）。

### 4.3 按需引入（官方口径）

- 结构上：每组件一个目录 + `exports` 逐路径 `.mjs`，named import / 路径导入即按需（exports map 实测）。
- `unplugin-vue-components` README 的 resolver 清单含 "Prime Vue"（npm view readme）。
- 官方包体积数字：未在可抓取页面找到 KB 级表述（未能核实）。
- 兼容性注意：v5 无 peerDependencies，npm 不会约束 vue 版本（依赖字段实测）。

### 4.4 bundlephobia 口径（参考，失真明显）

`primevue@5.0.1`：minified 2,081,976 B / gzip 446,185 B；其中 `@primeuix/styles` ≈808,694 B、`@vue/runtime-core` ≈210,952 B 等（bundlephobia API）。因包未声明 peerDeps，bundlephobia 把 Vue 运行时一并打包计入了全量口径。

### 4.5 组件数与主题

- npm description（官方文案）："a rich set of **90+ components**"；主包顶层 213 个目录（unpkg meta，含大量子组件目录，如 inputcolorslider、sidebar* 系列、gallery* 系列，不可直接当组件数）。
- 主题：styled（token 三层 + `--p-*` CSS 变量）与 unstyled（无样式 + pass-through）双轨；暗色默认跟随系统。

---

## 5. 横向对照表

| 维度 | Element Plus 2.14.6 | Ant Design Vue 4.2.6 | Naive UI 2.45.3 | PrimeVue 5.0.1 |
|---|---|---|---|---|
| 发布日期 | 2026-09-18 | 2024-11-11（≈22 个月未更新） | 2026-08-27 | 2026-08-13 |
| 解压体积 / 文件数 | 43.9 MB / 6,863 | 77.9 MB / 5,355 | 51.8 MB / 5,432 | 9.3 MB / 1,634 |
| dependencies 数 | 15 | 22 | 18 | 8 |
| sideEffects | 精确数组（样式路径） | 数组（含 dist/*、*.css） | `false` | `["*.vue"]` |
| exports map | 有（es/lib 逐路径） | 无（仅 module/main） | 无（仅 module/main） | 有（逐目录 .mjs） |
| CSS 模型 | 静态 CSS（SCSS 编译） | CSS-in-JS（仅 reset.css 3.7 KB） | 运行时 css-render（0 css 文件） | styled 引擎运行时注入（0 css 文件）+ preset 包 |
| 全量 CSS 实测 | index.css 361,362 B / gzip 48,197 B | —（无全量 css） | —（无） | —（theme 为 JS：styles 488 KB + themes 3.65 MB 解压） |
| 按需样式 | 121 个逐组件 css / unplugin-element-plus | 运行时自动按需 | 运行时自动按需 | 运行时自动按需（styled 引擎） |
| 官方按需方式 | unplugin-vue-components + auto-import（推荐）；named import 可摇树 | named import（v4 弃 babel-plugin-import） | named import（README：all treeshakable） | named import + 官方 resolver |
| 组件数（官方口径） | 80 文档页 | 68 文档页 | 90+（README）/ 101 源码目录 | 90+（npm description） |
| 暗色 | html.dark + css-vars.css（2,946 B） | theme.darkAlgorithm（JS） | darkTheme（JS 主题对象） | darkModeSelector 默认 system |
| token 体系 | --el-* CSS 变量 + SCSS | Design Token（JS）+ Component Token | themeOverrides（JS 对象，无 CSS 变量） | 三层 token → --p-* CSS 变量 |
| license | MIT | MIT | MIT | SEE LICENSE IN LICENSE.md |
| bundlephobia min/gzip | 1,066,065 / 298,390 | 1,451,159 / 419,641 | 2,199,719 / 521,478 | 2,081,976 / 446,185 |

（bundlephobia 行为 API 全量打包口径，含各自被解析进包的依赖；与 CDN 实测不可比。）

## 6. 对 Paper 有用的对照点

1. **sideEffects 策略**：Naive UI 的 `sideEffects: false` 是摇树最优解；Element Plus 用精确数组把「样式入口」标为副作用。Paper 的样式全部收敛在 `@ui/tokens/paper.css`、组件包内无样式导入副作用，**组件包可以直接声明 `sideEffects: false`**，优于 EP 的补丁式数组。
2. **CSS 交付光谱与 Paper 的位置**：EP（静态 CSS，全量 gzip 48 KB / 逐组件 121 文件）↔ ADV/NUI（运行时生成，零产物但有首屏注入成本与 FOUC/SSR 复杂度）↔ PV（JS 样式对象 + 引擎注入，主题即代码）。Paper 的「token-only 静态 CSS 变量 + 使用方一次性引 paper.css」与 EP 同谱系但把样式语义上移到 token 层，理论全量体积应显著小于 48 KB gzip——建议给 Paper 建立同样的「全量 paper.css gzip 字节」基线指标并持续对照。
3. **逐组件样式是否必要**：EP 需要 121 个逐组件 css + unplugin-element-plus，根因是样式与组件目录耦合。Paper 若坚持组件零样式、视觉全由 `--ui-*` token 驱动，就永久免除这套按需样式基建——这是架构级优势，值得写进设计文档。
4. **exports 形态**：EP/PV 提供逐路径 exports map（types/import/require 分支），ADV/NUI 仅 module/main。Paper 应提供 exports map（至少 `./*` → `./*/index.mjs` + types），与 tsconfig bundler 解析对齐。
5. **暗色实现成本**：EP 的暗色 = 一个 2,946 B 的 css-vars 覆盖层 + html.dark 类；PV 默认 `system`（prefers-color-scheme）。Paper 的 `--ui-*` 双 scope（light/dark）方案与两者同构，成本最低，且应默认支持 `prefers-color-scheme` 而非要求 JS 切换。
6. **token 分层**：PV 的 primitive/semantic/component 三层与 Paper 的 token 分层可直接对标；ADV 的 Component Token（组件级隔离覆盖）是「组件级定制不污染全局」的成熟范式，Paper 的组件级 `--ui-<component>-*` 命名应保持同样的隔离性。
7. **依赖纪律**：EP 15 依赖（icons 3.3 MB、lodash 双形态、双定位库）抬高了安装与合规下限；NUI 18 依赖但全可摇树。Paper **零运行时依赖（peer 仅 vue）** 应作为硬约束维持，并把「对比 EP 的依赖清单」写进卖点。
8. **组件数预期管理**：竞品官方口径 68–90+。Paper 初期组件数少是事实，但 meta 驱动的文档自动化（EP/PV 模式）能以小规模呈现完整 API 面。
9. **维护节奏警示**：ADV 稳定版停更约 22 个月而生态仍在用，说明迁移成本高≠粘性可靠；Paper 保持小步快跑的发布节奏（EP 月更、NUI 月更）比一次性大版本更有信任价值。
10. **口径纪律**：本次调研发现同一库在「npm 解压体积 / CDN 单文件 / bundlephobia 全量打包」三个口径下差异巨大（如 naive-ui 因 date-fns 在 bundlephobia 口径虚高）。Paper 后续做基准时应像本文一样逐数字标注口径。
11. **商业化信号**：PrimeVue v5 转非 MIT 许可并内置 license-manager（含 @noble 签名校验依赖，npm 元数据实测），开源 MIT 竞品阵营（EP/ADV/NUI）之外出现分化——对 Paper 这类 MIT 开源库是定位机会。

## 附：本笔记全部一手来源

- npm CLI：`npm view <pkg> [field]`（element-plus@2.14.6 / ant-design-vue@4.2.6 / naive-ui@2.45.3 / primevue@5.0.1 / @primeuix/styles@3.0.0 / @primeuix/themes@3.0.1 / @primeuix/styled@1.0.1 / @primeui/license-manager@1.0.0 / 各运行时依赖包）。
- unpkg CDN：`dist/index.css`、`theme-chalk/el-button.css`、`theme-chalk/dark/css-vars.css`、`dist/index.full.min.js`、`dist/reset.css`、`es/index.*`、`index.mjs`、`umd/primevue.min.js`（jsdelivr）、各包 `?meta` 文件树。
- bundlephobia API：`https://bundlephobia.com/api/size?package=<pkg>@<version>` 四库均成功（2026-09-28）。
- element-plus.org：guide/quickstart.html、guide/theming.html（WebFetch）；repo `docs/en-US/guide/dark-mode.md`（gh api）。
- ant-design-vue repo（gh api）：`site/src/vueDocs/getting-started.zh-CN.md`、`migration-v4.zh-CN.md`、`customize-theme.zh-CN.md`、`faq.zh-CN.md`。
- naive-ui：npm readme（`npm view naive-ui readme`）。
- primevue.dev：`/theming/styled/`、`/installation/`（web_reader / WebFetch）；公开 GitHub 仓库 tag 停在 4.5.5，v5 源码不在其中（gh api branches/tags 实测）。
- unplugin-vue-components：npm readme（resolver 清单含 Element Plus / Ant Design Vue / Naive UI / Prime Vue）。

（未能核实项汇总：各库官方文档均未给出自家包体积的官方 KB 数字；memoize-one 的 dist.unpackedSize 镜像未返回；naiveui.com 文档站为 SPA 无法抓正文。）
