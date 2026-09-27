/**
 * ToggleGroup 的组件契约元数据（ComponentDefinition）。
 * api 字段与 ToggleGroup.types.ts 保持一致；states 与 ToggleGroup.vue / ToggleItem.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-toggle-group',
  version: '0.1.0',
  identity: {
    name: 'ToggleGroup',
    package: '@ui/components',
    export: 'ToggleGroup',
    category: 'inputs',
    description:
      '纸面分段控制器/按钮组：ToggleGroup + ToggleItem 组成分段（segmented 轨道或 outline 描边），支持 single（radiogroup 语义）与 multiple（切换按钮组）两种模式与整组/单项禁用。',
  },
  intent: {
    what:
      '一组平铺分段的即时选择：受控 v-model（单值或数组）、roving tabindex 键盘导航、segmented/outline 两种形态；点击或 Space/Enter 切换。',
    when: [
      '工具栏式的内容切换（视图/列表/看板切换、对齐方式等 2-5 个平铺选项）',
      '在同一屏内即时生效的互斥选择（single 模式，radio 语义）',
      '一组可见的开关型多选标签筛选（multiple 模式，选中即增删数组）',
      '紧凑工具栏：outline 形态作按钮组，segmented 形态作分段轨道',
    ],
    whenNot: [
      '选项多到放不下或需搜索用 Select / RadioGroup；ToggleGroup 只适合少量短文案分段',
      '随表单一起提交、非即时的多选一用 RadioGroup（radiogroup 表单语义）',
      '单项布尔勾选/同意协议用 Checkbox；独立单个开关用 Switch',
      '需要 loading 异步切换的场景不做：本组件无 loading 态（见 states）',
      '命令式动作（新建/删除）用 Button，不要把动作按钮混进 ToggleGroup',
    ],
    userTask: '用户需要在少量平铺分段中即时选一项或切换若干项，键盘方向键即可移动、Space/Enter 即可切换',
  },
  api: {
    props: [
      {
        name: 'modelValue',
        type: 'string | number | Array<string | number>',
        default: 'undefined',
        description:
          'v-model 绑定值（受控）：type=single 时为单值（未选 undefined，选中后不反选）；type=multiple 时为选中值数组。',
      },
      {
        name: 'type',
        type: "'single' | 'multiple'",
        default: "'single'",
        description:
          "选择模式：single → 组 role=radiogroup、项 role=radio + aria-checked（不反选）；multiple → 组 role=group、项 role=button + aria-pressed（点击增删数组）。",
      },
      {
        name: 'variant',
        type: "'segmented' | 'outline'",
        default: "'segmented'",
        description: "视觉形态：segmented 为 sand 轨道 + 选中项「纸面浮起」thumb；outline 为独立描边按钮组，选中转 accent-soft。",
      },
      {
        name: 'items',
        type: 'ToggleItemOption[]',
        default: 'undefined',
        description:
          '声明式选项：{ value, label, disabled? } 数组，由组件内部渲染 ToggleItem（渲染在默认插槽之后）；item 作用域插槽可定制每项内容。',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: '整组禁用：组内全部 ToggleItem 原生 disabled（移出 Tab 序），点击/键盘切换均无效。',
      },
      {
        name: 'ToggleItem.value',
        type: 'string | number',
        required: true,
        description:
          '项标识（必填）：与 ToggleGroup.modelValue 匹配成为选中项，选中/切换路径以此值为载荷；与 items prop 选项的 value 字段同一契约。',
      },
      {
        name: 'ToggleItem.label',
        type: 'string',
        description:
          '可读名称：作为按钮内容渲染；与默认插槽等价，插槽优先（用于图标 + 文本等富内容）。',
      },
      {
        name: 'ToggleItem.disabled',
        type: 'boolean',
        default: 'false',
        description:
          '单项禁用：与整组 disabled 取或，原生 disabled（移出 Tab 序），点击/键盘切换均无效，方向键导航跳过。',
      },
    ],
    slots: [
      {
        name: 'default',
        description: '手动组合：放置若干 ToggleItem 子组件（value/label/disabled），渲染序即注册序。',
      },
      {
        name: 'item',
        scope: '{ item: ToggleItemOption; selected: boolean }',
        description:
          '配合 items prop 定制每个内部项的按钮内容（如图标 + 文本）；未提供时回退为 option.label。',
      },
    ],
    events: [
      {
        name: 'update:modelValue',
        payload: 'single: string | number；multiple: Array<string | number>',
        description: 'v-model 更新：single 载荷为新选中单值（不反选，重复点击不发）；multiple 载荷为切换后的完整数组。',
      },
      {
        name: 'change',
        payload: '与 update:modelValue 一致',
        description: '与 update:modelValue 同步发出，载荷一致；供只关心变化本身的监听方使用。',
      },
    ],
    exposes: [
      {
        name: 'focus',
        type: '() => void',
        description: '聚焦组内 roving-active 项（未定时首个可用项）；全部禁用时为空操作。',
      },
    ],
  },
  constraints: {
    requires: [
      'ToggleItem 或 items prop（组内必须至少一项，否则组无内容也不可聚焦）',
      '每项必须有可读名称（label / 默认插槽 / item 插槽 / aria-label 至少其一）',
    ],
    conflicts: ['RadioGroup（表单单选）', 'Checkbox（表单多选）', 'Switch（单一开关）'],
  },
  composition: {
    patterns: [
      "<ToggleGroup v-model='view' :items=\"[{ value: 'list', label: '列表' }, { value: 'board', label: '看板' }]\" />",
      'items prop + #item 插槽渲染图标 + 文本的富内容分段项',
      '默认插槽手动组合：<ToggleGroup v-model="v"><ToggleItem value="a" label="甲" /></ToggleGroup>',
      "multiple 模式做标签筛选：v-model 绑定数组，change 里触发一次过滤请求",
      'FormField 外直接使用：分段项自带可读名称；无可见名称时经 attrs 提供 aria-label（落组容器）',
    ],
    related: ['ToggleItem', 'RadioGroup', 'Radio', 'Checkbox', 'Switch', 'Tabs'],
    preferred: [
      'value 用稳定业务标识（字符串/数字），注意 1 与 \'1\' 是不同值',
      'single 模式选中后不反选：需要「可清空」语义时由使用方提供清空入口',
      '选项文案保持短语级（2-4 字最佳）；长文案或需描述的选项改用 Radio',
    ],
  },
  states: {
    default: 'segmented：sand（surface-muted）轨道 + 未选项 text-2 透明底；outline：surface 底 + line 描边 + text-2。',
    hover: '未选项文字加深为 text-1（outline 形态描边同时加深为 border-strong）；选中与禁用项不响应 hover。',
    focusVisible: '焦点环由全局 :focus-visible 约定提供（2px --ui-accent 实线 + 2px 偏移，paper.css），绘制在当前 roving-active 项按钮上；组件不改写 outline。',
    active: '无按压位移反馈；点击/Space/Enter 即切换：segmented 选中项转 surface 底 + shadow-rest + text-1（纸面浮起），outline 选中项转 accent 描边 + accent-soft 底 + accent 文字。',
    disabled: '整组或单项禁用：原生 disabled 移出 Tab 序并拦截一切切换路径；文字转 text-3、outline 禁用底转 surface-muted、not-allowed 光标。',
    error: '无内建 error 与 loading 态：校验反馈由外层 FormField 承担；异步确认场景请自行受控（先不发请求，确认后回写 modelValue）。',
  },
  accessibility:
    'single：容器 role="radiogroup"，项为原生 button 承载 role="radio" + aria-checked（不使用原生 input/radio，因分段需要 roving tabindex 与任意内容）；multiple：容器 role="group"，项 role="button" + aria-pressed。roving tabindex：Tab 只落在活动项（默认首个可用项），ArrowRight/ArrowDown/ArrowLeft/ArrowUp 在可用项间环绕移动焦点（preventDefault，不滚动页面），Home/End 跳转端点，禁用项被跳过；焦点落点即 roving 活动项（focus 事件同步）。Space/Enter 走原生 button 激活路径触发点击（不拦截 keydown）——注意：方向键只移动焦点不选中，与 APG radiogroup 的「方向键即选中」略有取舍，选中统一由 Space/Enter/点击完成。禁用项为原生 disabled（不用 aria-disabled）。装饰性内容（图标 svg）须 aria-hidden。',
  ssr:
    'renderToString 无异常：不访问任何浏览器 API（注册表在 setup 期同步建立，SSR 即有完整注册序）；role / aria-checked / aria-pressed / tabindex（首个可用项 0、其余 -1）/ disabled / 文案均随 SSR 输出；item 作用域插槽内容随 SSR 渲染。项的元素引用经闭包延迟获取，SSR 期为 null，focus 路径在 SSR 不可达。',
  performance:
    '无定时器、无测量；注册表为 ref 数组（注册/注销即替换），roving 状态为单个 ref；项的选中态/禁用态/tabindex 均为 computed 派生。动效只有 color/background-color/border-color/box-shadow 过渡（--ui-motion-fast token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：轨道底 --ui-surface-muted、thumb 底 --ui-surface + --ui-shadow-rest、描边 --ui-border/--ui-border-strong、选中 accent 形态用 --ui-accent/--ui-accent-soft、文字 --ui-text-1/2/3、内衬 --ui-space-1、项内边距 --ui-space-1/--ui-space-3、圆角 --ui-radius-sm/--ui-radius-md、字号 --ui-text-sm、字重 --ui-font-weight-medium、动效 --ui-motion-fast/--ui-ease-out。结构性例外：border-width 1px（无 --ui-border-width token，随 Button/Input/Checkbox/Radio 同一缺口，已提出需求）。',
  examples: [
    "<ToggleGroup v-model='view' :items=\"[{ value: 'list', label: '列表' }, { value: 'card', label: '卡片' }]\" />",
    "<ToggleGroup v-model='align' variant='outline' :items=\"[{ value: 'left', label: '左' }]\" />",
    "<ToggleGroup v-model='tags' type='multiple' :items='tagOptions' @change='refetch' />",
    "<ToggleGroup v-model='view'>\n  <ToggleItem value='day' label='日' />\n  <ToggleItem value='week' label='周' disabled />\n</ToggleGroup>",
    "<ToggleGroup v-model='view' :items='opts'>\n  <template #item='{ item, selected }'>\n    <svg aria-hidden='true' … />{{ item.label }}\n  </template>\n</ToggleGroup>",
  ],
  agent: {
    keywords: [
      'toggle group', 'toggle-group', '分段控制器', 'segmented', 'segmented control', '按钮组',
      'toggle', '切换组', '多选分段', '单选分段', 'roving tabindex', 'radiogroup', 'aria-pressed',
      'disabled', '禁用', 'v-model', '视图切换', '标签筛选',
    ],
    selectionHints: [
      '内容视图/平铺选项的即时切换 → ToggleGroup(single)；表单内随提交的单选 → RadioGroup',
      '多个可见筛选标签同时开关 → ToggleGroup(type=multiple) 绑定数组',
      '工具栏紧凑场景用 variant=outline；设置面板的「模式选择」用 segmented',
      '选项 > 5 个、文案长或需要辅助说明 → RadioGroup / Select',
    ],
    commonTasks: [
      '列表/看板视图切换（single + segmented）',
      '编辑器对齐方式、密度等工具栏分段（outline）',
      '多标签筛选（multiple + change 触发一次请求）',
      '整组 disabled 的只读回显',
    ],
    generationNotes: [
      'modelValue 形态必须与 type 匹配：single 传单值、multiple 传数组；类型不符时按空选中处理',
      'single 模式不反选：点击已选项不发出任何事件（radio 语义）',
      'ToggleItem 必须放在 ToggleGroup 内（脱离组无角色与选中联动）；优先 items prop，富内容才用 #item 或手动组合',
      'aria-label 经 attrs 落在组容器（role 元素）上；单项的 aria-* 经 attrs 直达按钮',
      '不要在 ToggleItem 上自行设置 tabindex/role：由组的 roving tabindex 与模式统一下发',
    ],
  },
}
