/**
 * Slider 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Slider.types.ts 保持一致；states 与 Slider.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-slider',
  version: '0.1.0',
  identity: {
    name: 'Slider',
    package: '@ui/components',
    export: 'Slider',
    category: 'inputs',
    description: '纸面滑块：单柄/双柄范围取值（role=slider + aria-valuemin/max/now），键盘步进与指针拖拽双路径，marks 刻度与垂直方向，视觉 token-only。',
  },
  intent: {
    what: '在连续值轴上取一个值或一个范围：受控 v-model(number | [number, number])、min/max/step 对齐、marks 刻度、垂直方向；键盘与拖拽双路径。',
    when: [
      '在已知区间内选取数值（音量、透明度、价格区间等）',
      'range 模式选取一段范围（筛选器的最小/最大值）',
      '需要键盘精确步进（方向键 ±step、PageUp/PageDown 大步、Home/End 直达边界）',
      '需要刻度标记关键档位（marks + #marks 自定义标签）',
      '表单/筛选面板中的紧凑数值输入（比数字输入更直观）',
    ],
    whenNot: [
      '需要精确键入任意数值用 Input（type 由使用方约束）或 NumberInput 类组件：Slider 不做文本输入',
      '离散选项选择用 Select / Radio / Checkbox：Slider 表达连续值轴',
      '开关语义用 Switch：Slider 不是布尔开关',
      '点击刻度标签跳值不做：marks 为装饰层（aria-hidden），取值走键盘/拖拽',
      '异步加载占位语义不属于滑块：loading 仅拦截取值并置 aria-busy，无旋转指示（有别于 Switch）',
    ],
    userTask: '用户需要沿值轴拖拽或用键盘步进，选定一个数值或一段范围',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'number | [number, number]', description: 'v-model 绑定值（受控）：单柄为 number，range 模式为升序二元组；未传/非法值回落 min（range 回落 [min, max]）。' },
      { name: 'range', type: 'boolean', default: 'false', description: '双柄范围模式：渲染两个柄，值约束为升序 [低值, 高值]，两柄互相钳制不交叉。' },
      { name: 'min', type: 'number', default: '0', description: '值轴最小值。' },
      { name: 'max', type: 'number', default: '100', description: '值轴最大值。' },
      { name: 'step', type: 'number', default: '1', description: '步长：方向键按 step 步进，PageUp/PageDown 按 step×10；指针取值对齐 step（含浮点精度修正）。' },
      { name: 'marks', type: 'SliderMark[]', description: '刻度列表（{ value, label? }）：装饰层 aria-hidden，标签可用 #marks 插槽自定义。' },
      { name: 'vertical', type: 'boolean', default: 'false', description: '垂直方向：值自下而上增大，柄/填充/刻度沿值轴；需要使用方提供高度容器。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：柄 tabindex=-1 移出 Tab 序 + aria-disabled="true"，键盘与拖拽全拦截。' },
      { name: 'loading', type: 'boolean', default: 'false', description: '加载中：aria-busy="true" + 拦截一切取值路径，但不落 disabled（保持可聚焦，同 Switch 先例）。' },
      { name: 'ariaLabel', type: 'string', description: '低值柄可读名称；range 模式低柄缺省「最小值」、高柄固定「最大值」；attrs 提供的 aria-label 优先级更高。' },
    ],
    slots: [
      { name: 'tooltip', scope: '{ value: number }', description: '柄值气泡内容（hover/聚焦/拖拽时显示，装饰层 aria-hidden；缺省渲染当前数值）。' },
      { name: 'marks', scope: '{ mark: SliderMark; reached: boolean }', description: '刻度标签内容（缺省渲染 mark.label ?? mark.value；reached 表示该刻度已被当前值覆盖）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'number | [number, number]', description: 'v-model 更新：键盘步进、拖拽移动与轨道点击跳值时连续发出。' },
      { name: 'change', payload: 'number | [number, number]', description: '提交：键盘步进每键一次；拖拽/轨道点击在抬起且值有变化时发一次。' },
    ],
    exposes: [
      { name: 'focus', type: '(handle?: \'min\' | \'max\') => void', description: '聚焦柄（缺省 \'min\'；单柄模式忽略 \'max\'）。' },
      { name: 'blur', type: '(handle?: \'min\' | \'max\') => void', description: '移除柄焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Input / Textarea（精确键入文本数值）', 'Select / Radio（离散选项）'],
  },
  composition: {
    patterns: [
      '单柄受控：v-model 绑定 number，配 marks 标注关键档位',
      'range 筛选：双柄绑定 [min, max] 二元组，配 #tooltip 显示区间',
      '垂直刻度轴：vertical + marks + 固定高度容器',
      'FormField 内以 aria-describedby 关联说明文案（attrs 直达低值柄）',
    ],
    related: ['Input', 'FormField', 'Select', 'Switch'],
    preferred: [
      '务必提供可读名称：ariaLabel prop 或 attrs aria-label（单柄）；range 模式已有「最小值/最大值」缺省',
      'step 取值要落在 min/max 的整除格点上，避免 End 直达值与步进格点不一致',
      'range 模式传升序二元组；组件会把乱序输入规范化为升序',
    ],
  },
  states: {
    default: 'surface-muted 轨道 + accent 填充 + surface 柄（line-strong 描边 + rest 阴影）；刻度未覆盖 line-strong、覆盖转 accent。',
    hover: '柄描边转 accent（rail 与柄均可 pointer 命中）；disabled/loading 不响应交互。',
    focusVisible: '柄为 Tab 停靠点（range 双柄各自停靠），焦点环由全局 :focus-visible（2px accent outline）承担；同柄值气泡随焦点显示。',
    active: '拖拽中柄描边 accent 并显示值气泡；轨道点击跳值到指针位置并取最近柄开始拖拽。',
    disabled: '填充与刻度覆盖转 text-3 灰阶、柄 surface-muted 且无阴影；tabindex=-1 + aria-disabled="true"，键盘与拖拽全拦截。',
    loading: 'aria-busy="true" 且一切取值路径（键盘/拖拽/轨道点击）被拦截，但柄保持可聚焦（不落 disabled）；填充转 text-3 灰阶提示，cursor 为 progress。',
  },
  accessibility:
    '柄为 div[role="slider"]（WAI-ARIA slider 模式的标准实现：双柄范围取值无对应原生控件，非「div 自造按钮」）：tabindex=0 可聚焦（两柄各自为 Tab 停靠点），aria-valuemin/aria-valuemax/aria-valuenow 完整表达值域（range 模式两柄互为边界），vertical 时置 aria-orientation="vertical"；disabled 用 tabindex=-1 + aria-disabled="true"（无原生 disabled 可用），loading 用 aria-busy="true" 且保持可聚焦。键盘：←/↓ 减、→/↑ 加（垂直方向同 APG：↑ 加 ↓ 减）、PageUp/PageDown 大步长（step×10）、Home/End 直达柄边界，处理即 preventDefault。可读名称：ariaLabel prop 或 attrs aria-label 直达低值柄；range 模式缺省「最小值/最大值」。marks 刻度与 tooltip 气泡为装饰层（aria-hidden="true"），读屏取值以 aria-valuenow 为准。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；rect 测量与 document 拖拽监听只出现在客户端 pointerdown 事件回调及仅由其调用的函数内，onBeforeUnmount 兜底清理。role="slider"、aria-valuemin/max/now、aria-orientation、aria-disabled/aria-busy、tabindex、柄/填充/刻度的内联百分比定位与 marks 标签均随 SSR 输出；tooltip 气泡在 DOM 中常驻（CSS 控制显隐），SSR 输出其缺省数值内容。',
  performance:
    '无定时器、无 ResizeObserver；指针拖拽仅在按下后挂载 document 监听并在抬起/取消/卸载时移除。渲染期仅 computed 派生（值规范化、百分比定位、刻度覆盖）；动效只有 border-color/box-shadow 过渡与 hover 气泡显隐（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：轨道 --ui-surface-muted、填充 --ui-accent、刻度 --ui-border-strong/--ui-accent、柄 --ui-surface 底 + --ui-border-strong 描边 + --ui-shadow-rest、气泡 --ui-tooltip 深底 + --ui-color-white 文字；尺寸全部由间距 token 推导（命中区 --ui-space-4、视觉轨道 --ui-space-1、刻度点 --ui-space-1、标签行 --ui-space-5），圆角 --ui-radius-xs/--ui-radius-md/--ui-radius-sm，动效 --ui-motion-fast/--ui-ease-out，数字字体 --ui-numeric。描边宽度 1px 为结构性细线（无 --ui-border-width token，随 Input/Button 先例）。无全局 CSS 引入。',
  examples: [
    "<Slider v-model='volume' aria-label='音量' />",
    "<Slider v-model='price' range :min='0' :max='1000' :step='10' />",
    "<Slider v-model='level' :marks='[{ value: 0, label: \"低\" }, { value: 50, label: \"中\" }, { value: 100, label: \"高\" }]'>\n  <template #tooltip='{ value }'>{{ value }}%</template>\n</Slider>",
    "<Slider v-model='ratio' vertical aria-label='进度' />",
    "<Slider :model-value='40' disabled aria-label='系统锁定值' />",
  ],
  agent: {
    keywords: ['slider', '滑块', '滑杆', '范围', 'range', '双柄', '区间', '刻度', 'marks', '步长', 'step', '垂直', 'vertical', '拖拽', 'aria-valuenow', 'role=slider', '音量', '价格区间', 'disabled', 'loading'],
    selectionHints: [
      '连续值轴取值/取范围 → Slider；精确键入 → Input；离散选项 → Select/Radio',
      '范围筛选用 range + 升序二元组 v-model；区间展示配 #tooltip 插槽',
      '关键档位标注用 marks（装饰层）；键盘用户以 aria-valuenow 感知取值',
    ],
    commonTasks: [
      '音量/透明度等单值调节',
      '价格/日期区间双柄筛选',
      '垂直刻度轴上的档位选择',
    ],
    generationNotes: [
      'v-model 载荷形状随 range：单柄 number、range 升序 [number, number]；乱序/非法输入组件会规范化',
      'change 语义：键盘每键提交一次；拖拽与轨道点击在抬起且值有变化时提交一次',
      '两柄互相钳制不交叉：低柄上界为高柄当前值，高柄下界为低柄当前值',
      '轨道点击跳值并取最近柄开始拖拽；柄上按下不跳值；marks/tooltip 为 aria-hidden 装饰层',
      'vertical 需要使用方提供高度容器；attrs（aria-label/aria-describedby 等）直达低值柄',
    ],
  },
}
