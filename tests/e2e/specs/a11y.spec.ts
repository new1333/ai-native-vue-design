import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '../fixtures'
import { FAMILY_IDS, FAMILY_TITLES } from '../pages/playground.page'
import type { FamilyId } from '../pages/playground.page'

/**
 * axe 无障碍分区扫描（E2E 集成计划 §5.3 / 任务 09）：
 * 对 playground 的 7 个产品族分区逐一执行 axe 扫描并断言 violations 为空。
 *
 * - 扫描作用域用页面对象的分区（section[aria-labelledby="#family-*"]）收窄，
 *   只检验组件演示分区本身；页面级外壳（main 之外的 Teleport 宿主等）不纳入。
 * - 不做 withTags 收窄：跑 axe 默认全量规则（含 best-practice），保持最严口径。
 * - 确有无法立即修复的违例走「豁免登记」（EXEMPTIONS）：必须精确到
 *   规则 id + 元素选择器范围，逐条注明规则 tag、原因与建议修复；
 *   且豁免必须被真实命中——未命中的登记视为「过期豁免」直接判失败，
 *   防止豁免清单随修复演变为静默跳过（禁止整页跳过、禁止静默忽略）。
 *
 * 2026-09-25 首扫结论（axe-core 4.10.2，chromium）：
 * 反馈 Feedback / 浮层 Overlay / 导航 Navigation 三分区零违例；
 * 其余四分区的违例归为四类根因（详见 EXEMPTIONS 各条目）：
 *   A. 组件 API 缺口：Switch 的 button[role=switch] 无可访问名、Progress 无命名通道；
 *   B. playground 演示缺口：Select 触发器缺 aria-label、裸 Input/Textarea 演示缺 label/placeholder；
 *   C. token 对比度：--ui-text-3（ink-400）在纸面上约 3.5:1；
 *      Badge success/warning/info 的 soft 底 + 同系文字色分别约 4.4 / 2.8 / 2.5:1，
 *      均低于 WCAG AA 4.5:1（wcag143）。修复归属 packages/tokens（Paper Profile 取值），
 *      不在本票（仅限 tests/e2e）范围内，豁免登记待 token Profile 修订后回收。
 *
 * 2026-09-28 增补（40 个新组件接入 playground 后首扫）：
 *   - 演示侧已修：新演示不用 text-3 弱化文字（一律 text-2）；role=combobox 触发器
 *     （Cascader / ModelSelector / TreeSelect，name-from-author 同 Select）补 aria-label。
 *   - 新登记沿用首扫根因分类：C（Tag/ToolCallCard soft 色对、各组件 text-3 弱化文字）、
 *     A（SplitterPane 内容盒 overflow:auto 无 tabindex，键盘不可滚动）、
 *     B（Layout 演示的 aside/main 地标嵌套于分区 region——演示壳层结构约束）。
 */

/** axe 结果类型：axe-core 是 @axe-core/playwright 的传递依赖，不直接 import，从 analyze() 推导 */
type AxeScanResult = Awaited<ReturnType<AxeBuilder['analyze']>>
type AxeViolation = AxeScanResult['violations'][number]

/**
 * 分区扫描上下文选择器：与 PlaygroundPage.section() 同源
 * （section[aria-labelledby="#family-*"]，见 pages/playground.page.ts）。
 * @axe-core/playwright 的 include 只接受 CSS 选择器字符串（不收 Locator），
 * 故在此镜像页面对象的选择器；FAMILY_IDS 单源保证两者不漂移。
 */
function sectionSelector(id: FamilyId): string {
  return `section[aria-labelledby="${id}"]`
}

/** 已登记豁免：精确到「分区 + axe 规则 id + 元素选择器范围」 */
interface A11yExemption {
  /** 豁免适用的分区 */
  family: FamilyId
  /** axe 规则 id */
  ruleId: string
  /** 规则 tag（axe 结果，wcag 映射为准） */
  ruleTags: readonly string[]
  /** 命中该规则的节点 target 选择器（axe 输出）需匹配的元素范围 */
  target: RegExp
  /** 豁免原因：缺口在 playground 演示还是组件 / token 层，为何本票不修 */
  reason: string
  /** 建议修复方式与应关联的后续 issue */
  followUp: string
}

/**
 * 豁免清单（首扫后登记；每条对应真实命中的违例节点，见文件头「首扫结论」）。
 * 任一条目不再命中真实违例时测试会以「过期豁免」失败，提醒删除登记。
 */
const EXEMPTIONS: readonly A11yExemption[] = [
  /* ── 根因 B：playground 演示缺口（Select 触发器无可访问名，任务 03 已知问题） ── */
  {
    family: 'family-inputs',
    ruleId: 'button-name',
    ruleTags: ['cat.name-role-value', 'wcag2a', 'wcag412', 'TTv5', 'TT6.a', 'EN-301-549', 'EN-9.4.1.2', 'ACT'],
    target: /button\[aria-controls="ui-select-listbox-[^"]*"\]/,
    reason:
      'Select 触发器为 button[role=combobox]（name-from-author），playground 三处演示均未传 aria-label，' +
      '可见文本 span 不构成可访问名——属 App.vue 演示缺口而非组件缺陷（任务 03 已上报同一问题）。' +
      '本票变更范围仅限 tests/e2e，不改 apps/playground。',
    followUp:
      '最小修复：apps/playground/src/App.vue 的三处 Select 演示补 aria-label（如 aria-label="部门"）；' +
      '建议在组件文档 meta.accessibility 中补充「外部需提供 aria-label」约定并关联既有 issue。',
  },

  /* ── 根因 A：组件 API 缺口（Switch / Progress 可访问名） ── */
  {
    family: 'family-inputs',
    ruleId: 'button-name',
    ruleTags: ['cat.name-role-value', 'wcag2a', 'wcag412', 'TTv5', 'TT6.a', 'EN-301-549', 'EN-9.4.1.2', 'ACT'],
    target: /\.ui-switch__control(?![\w-])/,
    reason:
      'Switch 根为 label 元素、按钮为 button[role=switch]（name-from-author），但 axe（accname 语义）' +
      '不把隐式 label 文本记给显式 role=switch 的 button，4 处演示控件全部无名——组件层缺口，' +
      '不在本票（仅限 tests/e2e）范围。',
    followUp:
      '组件修复：Switch.vue 内部将 .ui-switch__label 生成 id 并在 button 上挂 aria-labelledby（无 label 时回退使用方 attrs）；' +
      '应开组件 issue（Switch a11y）并补组件 a11y spec 断言可访问名。',
  },
  {
    family: 'family-data',
    ruleId: 'aria-progressbar-name',
    ruleTags: ['cat.aria', 'wcag2a', 'wcag111', 'EN-301-549', 'EN-9.1.1.1'],
    target: /\.ui-progress(--[\w-]+)?(?![\w-])/,
    reason:
      'Progress 根 role=progressbar 无可访问名（show-label 的数值 span 是兄弟节点未关联；' +
      '组件也无 aria-label 通道文档约定），3 处演示全部命中——组件层缺口，不在本票范围。',
    followUp:
      '组件修复：Progress 接受 aria-label 透传（attrs 已落根元素，仅需文档/meta 约定）或 aria-labelledby 关联数值标签；' +
      '应开组件 issue（Progress a11y）并同步 playground 演示。',
  },

  /* ── 根因 B：playground 演示缺口（裸 Input / Textarea 无 label 也无 placeholder） ── */
  {
    family: 'family-inputs',
    ruleId: 'label',
    ruleTags: ['cat.forms', 'wcag2a', 'wcag412', 'section508', 'section508.22.n', 'TTv5', 'TT5.c', 'EN-301-549', 'EN-9.4.1.2', 'ACT'],
    target: /^(input|textarea)\[/,
    reason:
      'Input 卡片的 readonly / error 两例与 Textarea 卡片的计数 / error / 禁用三例均无 label、无 placeholder、' +
      '无 aria-label（axe 的 label 规则认可 placeholder，但这些演示两者皆无）——属 App.vue 演示缺口。' +
      'Form 内的 Input 经 FormField 关联 label，不在命中之列。',
    followUp:
      '最小修复：apps/playground/src/App.vue 给这些演示补 placeholder 或 aria-label；' +
      '组件包无需改动（Input/Textarea 已透传 attrs）。',
  },

  /* ── 根因 C：token 对比度（--ui-text-3 ≈ 3.5:1，WCAG AA 要求 4.5:1） ── */
  {
    family: 'family-typography',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target: /\.ui-text--text-3(?![\w-])/,
    reason:
      'Text xs / text-3 弱化脚注演示：--ui-text-3（ink-400 #8B8679）在纸面底色上对比度约 3.5:1。' +
      '取值来自 Paper Profile（packages/tokens），组件与演示均按 token 消费，修复归属 token 层，不在本票范围。',
    followUp: '建议开 tokens issue：Profile 修订 text-3 档（如引入 ink-500 档）或文档化 text-3 仅用于非正文装饰性文本的边界。',
  },
  {
    family: 'family-general',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target: /\.ui-text--text-3(?![\w-])/,
    reason: '同上：Avatar 卡片脚注（Text xs / text-3）命中同一 token 对比度缺口。',
    followUp: '同 typography 分区登记的 tokens issue，一并回收。',
  },
  {
    family: 'family-inputs',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target: /(^#ui-form-field-[\w-]*-help$)|(\.ui-textarea__count(?![\w-]))|(\.ui-select__label--placeholder(?![\w-]))|(\.ui-switch--disabled .*\.ui-switch__label(?![\w-]))/,
    reason:
      '均为 text-3 同源弱化文字：FormField 帮助文本、Textarea 计数、Select 占位文本、Switch 禁用态标签，' +
      '组件样式统一消费 --ui-text-3——token 层缺口，不在本票范围。',
    followUp: '同 typography 分区登记的 tokens issue；text-3 档修订后这些豁免应全部过期并由本 spec 自动报出回收。',
  },
  {
    family: 'family-data',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target: /\.ui-empty-state__description(?![\w-])/,
    reason: 'EmptyState 描述文字消费 --ui-text-3（ink-400），同一 token 对比度缺口。',
    followUp: '同 typography 分区登记的 tokens issue。',
  },

  /* ── 根因 C：token 对比度（Badge soft 底 + 同系文字色） ── */
  {
    family: 'family-general',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target: /\.ui-badge--(success|warning|info)(?![\w-])/,
    reason:
      'Badge success / warning / info（含 dot 形态）文字色对 soft 底对比度约 4.4 / 2.8 / 2.5:1，低于 4.5:1。' +
      '色对取自状态 token（moss/amber/slate 600 对 50，packages/tokens Paper Profile），组件按 token 消费，' +
      '修复归属 token 层，不在本票范围。danger / neutral 变体未命中（达标）。',
    followUp: '建议开 tokens issue：加深 moss-600 / amber-600 / slate-500 档或为 Badge 引入 on-soft 专用文字 token。',
  },
  {
    family: 'family-data',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target: /\.ui-badge--(success|warning|info)(?![\w-])/,
    reason: 'Table 状态列 Badge（success / warning）命中与通用分区相同的 token 色对缺口。',
    followUp: '同 general 分区登记的 tokens issue，一并回收。',
  },

  /* ── 2026-09-28 增补：40 个新组件接入 playground 后的首扫增补登记 ──
   * 根因沿袭首扫两类：token 层 text-3 / soft 色对（C）；组件层结构缺口（A）。 */

  /* ── 根因 C：Tag soft 底 + 同系文字色（与 Badge soft 色对同一 token 根因） ── */
  {
    family: 'family-general',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target: /\.ui-tag--(success|warning|info)(?![\w-])/,
    reason:
      'Tag success / warning / info 变体文字色对 soft 底，取色与 Badge soft 色对同源' +
      '（--ui-{variant}-soft 底 + --ui-{variant} 文字，packages/tokens Paper Profile），' +
      '组件按 token 消费，修复归属 token 层，不在本票范围。',
    followUp: '与 general 分区 Badge soft 色对登记的 tokens issue 一并回收。',
  },

  /* ── 根因 C：新增组件内 text-3 同源弱化文字 ── */
  {
    family: 'family-inputs',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target:
      /(\.ui-cascader__label--placeholder)|(\.ui-date-picker__label--placeholder)|(\.ui-model-selector__label--placeholder)|(\.ui-slider__mark(?![\w-]))|(\.ui-upload__size(?![\w-]))/,
    reason:
      '均为 text-3 同源弱化文字：Cascader / DatePicker / ModelSelector 占位文本、Slider 刻度标签、' +
      'Upload 文件体积，组件样式统一消费 --ui-text-3——token 层缺口，不在本票范围。',
    followUp: '同 typography 分区登记的 tokens issue；text-3 档修订后应全部过期并由本 spec 自动报出回收。',
  },
  {
    family: 'family-data',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target:
      /(\.ui-message__time)|(\.ui-timeline__time)|(\.ui-tool-call-card__duration)|(\.ui-tool-call-card__section-label)|(\.ui-tool-call-card__status--(success|info|warning))/,
    reason:
      'Message 时间戳、Timeline 时间、ToolCallCard 耗时 / 分区标签均为 text-3 同源弱化文字；' +
      'ToolCallCard 状态徽标（success / info / warning）为 soft 底 + 同系文字色（Badge 同根因）——' +
      '均属 token 层缺口，不在本票范围。',
    followUp: '同 typography 分区登记的 tokens issue（text-3 档 + soft 色对），一并回收。',
  },
  {
    family: 'family-feedback',
    ruleId: 'color-contrast',
    ruleTags: ['cat.color', 'wcag2aa', 'wcag143', 'TTv5', 'TT13.c', 'EN-301-549', 'EN-9.1.4.3', 'ACT'],
    target: /\.ui-agent-status--(waitingForTool|completed) .*\.ui-agent-status__label(?![\w-])/,
    reason:
      'AgentStatus waitingForTool / completed 态根元素取 --ui-warning / --ui-success 文字色对 soft 底，' +
      '标签文字继承根色——与 Badge soft 色对同一 token 根因，修复归属 packages/tokens，不在本票范围。',
    followUp: '与 general 分区 Badge soft 色对登记的 tokens issue 一并回收。',
  },

  /* ── 根因 A：组件层缺口（SplitterPane 滚动容器键盘不可达） ── */
  {
    family: 'family-general',
    ruleId: 'scrollable-region-focusable',
    ruleTags: ['cat.keyboard', 'wcag2a', 'wcag211', 'wcag213', 'TTv5', 'TT4.a', 'EN-301-549', 'EN-9.2.1.1', 'EN-9.2.1.3'],
    target: /\.ui-splitter__pane-content(?![\w-])/,
    reason:
      'SplitterPane 根元素（内容盒）恒为 overflow: auto 且未提供 tabindex，内容超出时键盘用户无法滚动——' +
      '组件层缺口（packages/components/splitter），不在本票（仅限 tests/e2e）范围。',
    followUp:
      '组件修复：SplitterPane 内容盒在可滚动时补 tabindex="0"（或无溢出时不设 overflow: auto）；' +
      '应开组件 issue（SplitterPane 键盘可达）并补组件 a11y spec 断言。',
  },

  /* ── 根因 B（演示壳层结构）：Layout 演示的地标元素嵌套于分区 region 内 ── */
  {
    family: 'family-general',
    ruleId: 'landmark-complementary-is-top-level',
    ruleTags: ['cat.semantics', 'best-practice'],
    target: /#ui-layout-sider/,
    reason:
      'LayoutSider 渲染 <aside> 互补地标；playground 壳按产品族把演示卡片包进 section[aria-labelledby]' +
      '（region 地标）内，aside 因此嵌套于 region——属演示壳层结构约束，组件语义本身正确，不在本票范围。',
    followUp:
      '文档站整页演示不受分区 region 包裹；如需回收，可将 Layout 演示移至独立路由或壳层改用非 landmark 分组。',
  },
  {
    family: 'family-general',
    ruleId: 'landmark-main-is-top-level',
    ruleTags: ['cat.semantics', 'best-practice'],
    target: /^main$/,
    reason:
      'LayoutContent 渲染 <main> 主地标；壳层已改为 div 以保证全页仅此一个 main，但它仍嵌套于分区' +
      'region 内——演示壳层结构约束所致，组件语义本身正确，不在本票范围。',
    followUp: '同 aside 登记条目：Layout 演示移至独立路由或壳层改用非 landmark 分组后回收。',
  },
]

/** axe 节点 target（跨 frame 为数组）转为单一选择器串，供豁免匹配与失败信息展示 */
function targetToString(target: readonly unknown[]): string {
  return target.map((part) => String(part)).join(' ')
}

function formatViolation(v: AxeViolation): string {
  const tags = v.tags.join(', ')
  const nodes = v.nodes.map((n) => `    - ${targetToString(n.target)}`).join('\n')
  return `  [${v.id}] ${v.help}\n    tags: ${tags}\n${nodes}`
}

/**
 * 应用豁免：从违例中剔除「分区 + 规则 + 元素范围」均精确命中的节点。
 * 返回剩余违例与被真实命中的豁免（用于过期豁免检测）。
 */
function applyExemptions(
  family: FamilyId,
  violations: readonly AxeViolation[],
): { remaining: AxeViolation[]; consumed: Set<A11yExemption> } {
  const consumed = new Set<A11yExemption>()
  const remaining: AxeViolation[] = []
  for (const violation of violations) {
    const keptNodes = violation.nodes.filter((node) => {
      const selector = targetToString(node.target)
      const hit = EXEMPTIONS.find(
        (e) => e.family === family && e.ruleId === violation.id && e.target.test(selector),
      )
      if (hit) {
        consumed.add(hit)
        return false
      }
      return true
    })
    if (keptNodes.length > 0) remaining.push({ ...violation, nodes: keptNodes })
  }
  return { remaining, consumed }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

for (const id of FAMILY_IDS) {
  test(`axe 扫描：${FAMILY_TITLES[id]} 分区零违例`, async ({ page, playground }) => {
    // 前置：分区可见（页面对象 locator 把关扫描目标存在；选择器同源见 sectionSelector）
    await expect(playground.section(id)).toBeVisible()

    const results = await new AxeBuilder({ page }).include(sectionSelector(id)).analyze()
    const { remaining, consumed } = applyExemptions(id, results.violations)

    // 防护 1：登记的豁免必须命中至少一个真实违例，否则是「过期豁免」——
    // 问题已被修复（或规则不再命中）时必须删除登记，禁止豁免静默留存。
    const stale = EXEMPTIONS.filter((e) => e.family === id && !consumed.has(e))
    expect(
      stale.map((e) => `${e.ruleId} @ ${e.target}`),
      '以下已登记豁免未命中任何违例（过期豁免，说明对应问题已修复，请删除登记）：',
    ).toHaveLength(0)

    // 防护 2：剩余违例（未被豁免覆盖的规则/元素）必须为空
    expect(
      remaining.map(formatViolation),
      `axe 在分区 ${FAMILY_TITLES[id]} 发现未登记豁免的违例：`,
    ).toHaveLength(0)
  })
}
