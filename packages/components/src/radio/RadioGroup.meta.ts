/**
 * RadioGroup 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Radio.types.ts 保持一致；states 与 RadioGroup.vue / Radio.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-radio-group',
  version: '0.1.0',
  identity: {
    name: 'RadioGroup',
    package: '@ui/components',
    export: 'RadioGroup',
    category: 'inputs',
    description: '纸面单选组容器：受控 modelValue + 必填 name + 整组 disabled，provide/inject 下发组内 Radio；原生 radio 互斥与方向键导航。',
  },
  intent: {
    what: '管理一组互斥单选：受控选中值、原生 name 分组与整组禁用，经 provide/inject 驱动组内 Radio。',
    when: [
      '多个互斥选项中恰好选一个（配送方式、可见范围、排序策略等）',
      '选项少于 5 个、无需搜索的场景（更多用 Select）',
      '需要整组禁用或随表单提交单一值',
    ],
    whenNot: [
      '可多选（含全不选）用 Checkbox：radio 互斥且必有选中',
      '开关/即时切换语义用 Switch：RadioGroup 表达「多选一」而非状态切换',
      '选项很多或需输入过滤时用 Select / Combobox',
      '不含 Radio 的静态分组用 fieldset/列表容器，不要套 radiogroup',
    ],
    userTask: '用户需要在一组互斥选项中选中恰好一个，键盘方向键即可在选项间移动',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'string | number', default: 'undefined', description: 'v-model 当前选中值（受控）；未选中为 undefined，选中某项后由 Radio 的 change 路径更新。' },
      { name: 'name', type: 'string', default: undefined, required: true, description: '原生 name（必填）：同组 radio 互斥与方向键导航的分组依据，务必保持组内唯一语义。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '整组禁用：组内全部 Radio 原生 disabled（移出 Tab 序）。' },
    ],
    slots: [
      { name: 'default', description: '组内放置若干 Radio（渲染序即原生 Tab 序与方向键导航序）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'string | number', description: '组内任一 Radio 原生 change 时发出，载荷为该 Radio 的 value。' },
    ],
    exposes: [],
  },
  constraints: {
    requires: ['Radio（组内必须放置至少一个 Radio，name 缺失时原生互斥失效）'],
    conflicts: ['Checkbox（多选）', 'Switch（单一开关语义）'],
  },
  composition: {
    patterns: [
      'FormField 包裹获得 label 与校验文案（aria-describedby 经 attrs 落组容器）',
      'RadioGroup v-model + 若干 Radio value 组成互斥选择',
      'disabled 整组置灰用于只读态展示',
    ],
    related: ['Radio', 'Checkbox', 'Switch', 'FormField', 'Form'],
    preferred: ['每组必须给唯一 name；value 建议用稳定业务标识（字符串/数字）', '选项带辅助说明时把说明文案放进 Radio 默认插槽'],
  },
  states: {
    default: '组容器只负责排布（纵向，间距 --ui-space-2）；选项视觉由 Radio 表达（未选 surface 底 + --ui-border-control 圆描边）。',
    hover: '容器无 hover 态；选项 hover 描边加深为 --ui-border-control-strong（选中与禁用除外）。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css），绘制在原生 radio 热区上；组件不改写 outline 与 tabindex。',
    active: '无按压位移反馈；点击/方向键选中即以 accent 实底 + on-accent 圆点表达。',
    disabled: '整组禁用：选项圆框灰化（sand 底 + line 描边）、圆点转 text-3、文本 text-3 + not-allowed 光标；原生 disabled 移出 Tab 序。',
    error: '无内建 error 态：校验反馈由 FormField 错误文案与 aria-describedby 承担。',
  },
  accessibility:
    '容器 role="radiogroup"（attrs 的 aria-label 等落在容器）；选项为原生 <input type="radio">：checked/disabled 原生表达，不使用 aria-checked。键盘 100% 原生：Tab 进入组、方向键在同名 radio 间移动并选中、Space 选中——组件不绑定 keydown、不改写 tabindex。根为 label 元素，点击文本即选中。',
  ssr:
    'renderToString 无异常：provide/inject 在 SSR 渲染期即生效（选中态随受控值输出）；name / checked / disabled / label 均随 SSR 输出；不访问任何浏览器 API。',
  performance:
    '无监听器、无测量、无定时器；上下文为 3 个 computed + 1 个函数。选项动效只有 border-color / background-color / opacity 过渡（--ui-motion-fast token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：组间距 --ui-space-2、未选圆框描边 --ui-border-control（hover 加深为 --ui-border-control-strong）、选中底 --ui-accent、圆点 --ui-on-accent、禁用底 --ui-surface-muted、弱文字 --ui-text-3、字号 --ui-text-md。结构性例外：border-width 1px（无 --ui-border-width token）；圆形半径取 calc(var(--ui-space-4) / 2)（无圆形半径 token）；原生控件 opacity: 0 为结构性隐藏。',
  examples: [
    "<RadioGroup v-model='shipping' name='shipping'>\n  <Radio value='express' label='快递' />\n  <Radio value='pickup' label='自提' />\n</RadioGroup>",
    "<RadioGroup v-model='scope' name='scope' disabled>\n  <Radio value='private' label='仅自己可见' />\n  <Radio value='public' label='所有人可见' />\n</RadioGroup>",
    "<RadioGroup v-model='sort' name='sort' aria-label='排序方式'>\n  <Radio value='recent'>\n    最近更新\n    <template #label>…</template>\n  </Radio>\n</RadioGroup>",
  ],
  agent: {
    keywords: ['radio group', '单选组', 'radio-group', 'radiogroup', 'name', '互斥', '单选', '选择组', 'disabled', '禁用', 'v-model', '表单'],
    selectionHints: [
      '多选一 → RadioGroup + Radio；可多选 → Checkbox；单一开关 → Switch',
      '选项 > 5 个或需搜索 → Select；RadioGroup 只适合少量平铺选项',
      'name 必填且同页唯一，否则原生互斥与方向键导航会被同名组干扰',
    ],
    commonTasks: [
      '表单单选字段（配送方式、可见范围）+ FormField 校验',
      '设置面板的模式选择（整组 disabled 做只读展示）',
    ],
    generationNotes: [
      'modelValue 为 string | number；必须与所含 Radio 的 value 类型一致',
      '选中态只由组受控值派生：改 v-model 即可编程式选中',
      'aria-label 经 attrs 落在 role=radiogroup 容器上',
      '不要给 Radio 单独传 name：分组与导航统一由组下发',
    ],
  },
}
