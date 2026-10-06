/**
 * Dialog 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Dialog.types.ts 保持一致；states 与 Dialog.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-dialog',
  version: '0.1.1',
  identity: {
    name: 'Dialog',
    package: '@ui/components',
    export: 'Dialog',
    category: 'overlay',
    description:
      '纸面模态对话框：Teleport 至 body 的遮罩浮层，受控 v-model，含焦点圈定/还原、body 滚动锁定与 Esc/遮罩关闭，footer 插槽缺省渲染本库 Button 的「关闭」按钮。',
  },
  intent: {
    what: '在页面内容之上呈现一段需要用户处理才能继续的任务流（确认、表单、详情聚焦），遮罩阻断底层交互。',
    when: [
      '需要用户明确确认/取消的破坏性或不可逆操作',
      '短暂表单或子任务（重命名、过滤配置）在当前上下文内完成',
      '聚焦阅读的详情/预览内容，不必离开当前页',
    ],
    whenNot: [
      '纯被动通知（保存成功、网络异常）用 Toast/Alert：Dialog 要求用户交互后才会消失',
      '侧滑的导航或大面积工作区用 Drawer：Dialog 居中且宽度受 sm/md/lg 约束',
      '轻量悬浮说明（目标元素附近的提示）用 Popover/Tooltip：Dialog 有遮罩、阻断底层交互',
    ],
    userTask: '用户需要处理一个必须完成的模态任务后返回原上下文',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'boolean', default: 'false', description: '受控可见性（v-model）：true 时 Teleport 浮层渲染至 body。' },
      { name: 'title', type: 'string', description: '标题文本；被 title 插槽覆盖，两者皆空则不渲染头部与 aria-labelledby（可访问名转走兜底路径）。' },
      { name: 'ariaLabel', type: 'string', description: '无标题时的面板可访问名兜底（渲染为 aria-label）；attrs 写 aria-label 同名受理。有标题时以标题 aria-labelledby 关联优先，本 prop 不生效。' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: '尺寸档位：面板宽度 sm≈384 / md≈576 / lg≈704（由间距标尺推导），永不超出视口。' },
      { name: 'closeOnScrim', type: 'boolean', default: 'true', description: '点击遮罩是否请求关闭；表单类对话框可置 false 强制走明确动作。' },
    ],
    slots: [
      { name: 'default', description: '对话框正文（可滚动区域）。' },
      { name: 'title', description: '标题；覆盖 title prop，渲染进 aria-labelledby 指向的标题元素。' },
      { name: 'footer', description: '底部动作区；缺省渲染默认「关闭」按钮（本库 Button），点击即请求关闭（reason="footer"）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'boolean', description: 'v-model 更新：一切关闭路径（遮罩/Esc/默认按钮）发出 false。' },
      { name: 'close', payload: "'scrim' | 'esc' | 'footer'", description: '请求关闭并附带来源；与 update:modelValue false 同步发出。' },
    ],
    exposes: [
      { name: 'focus', type: '() => void', description: '将焦点移入对话框（首个可聚焦元素，否则面板自身）；仅客户端有意义。' },
    ],
  },
  constraints: {
    conflicts: ['Toast/Alert（被动通知，无需交互即消失）', 'Drawer（侧滑大面积工作区）', 'Popover/Tooltip（无遮罩的轻量悬浮）'],
    dependsOn: ['Button（footer 默认关闭按钮复用）'],
  },
  composition: {
    patterns: ['确认/取消对（footer 插槽放 primary + secondary Button）', '模态表单（closeOnScrim=false 强制显式提交）', '危险操作二次确认（danger Button + 正文说明）'],
    related: ['Button', 'Toast', 'Drawer', 'Form'],
    preferred: ['一个 footer 只放一个 primary 动作', 'Esc 与遮罩关闭保持可用，除非会丢失用户输入'],
  },
  states: {
    default: '关闭态不渲染浮层（仅 SSR/挂载前输出 hidden 占位）；打开态：scrim 遮罩 + surface 白底面板、lg 圆角、modal 阴影，居中呈现。',
    hover: '遮罩无 hover 反馈（非交互元素）；面板内容沿用内部元素（如 Button）各自的 hover 态。',
    focusVisible: '打开时焦点移入面板首个可聚焦元素，焦点环由全局 :focus-visible 约定提供（2px --ui-accent）；面板自身 tabindex="-1" 仅作程序化聚焦锚点。',
    active: '按压反馈由 footer 内 Button 等交互元素自身承载，浮层层无按压态。',
    disabled: '组件级无 disabled；内部元素各自的 disabled 语义不受影响（disabled 元素自动移出焦点圈定候选集）。',
  },
  accessibility:
    'role="dialog" + aria-modal="true"，标题元素 id 由 useId 生成并以 aria-labelledby 关联（title prop/插槽皆适用）。无标题时可访问名兜底：ariaLabel prop 渲染为面板 aria-label（attrs 写 aria-label 同名受理），attrs 透传的 aria-labelledby 亦落到面板（引用使用方自备的命名元素）；有标题时标题关联优先。键盘契约：打开时焦点移入（首个可聚焦元素，否则面板），Tab/Shift+Tab 在面板内循环圈定（焦点逃逸即拉回），Esc 请求关闭；关闭后焦点还原到打开前的元素。遮罩为纯 div（无 role、不聚焦、无 tabindex），点击命中关闭逻辑；默认关闭按钮为原生 button。body 在打开期间挂 ui-dialog-scroll-lock class 并行内锁定 overflow（经 shared/useModalLayer 模块级计数：与 Drawer 等模态浮层跨实例共享，全关才还原）。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问浏览器 API；挂载前不渲染浮层，renderToString 仅输出 hidden 的 ui-dialog 占位（输出稳定、含根类），Teleport 与焦点/滚动锁副作用全部推迟到客户端 onMounted 之后；卸载时清理滚动锁并还原焦点。',
  performance:
    '无监听器/测量/定时器；焦点圈定仅在 keydown 时查询面板内可聚焦元素。入场动效为 token 时长的 opacity/transform 动画，prefers-reduced-motion 下随 --ui-motion-* 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：z-index 走 --ui-z-modal、阴影 --ui-shadow-modal、圆角 --ui-radius-lg、遮罩 --ui-scrim、颜色/字号/间距/动效全 token 化；面板宽度由 --ui-space-* 标尺推导（sm/md/lg），组件包不引入全局 CSS。',
  examples: [
    "<Dialog v-model='open' title='删除确认'>\n  确定要删除这条记录吗？此操作不可撤销。\n</Dialog>",
    "<Dialog v-model='open' title='重命名' size='sm' :close-on-scrim='false'>\n  <form>…</form>\n  <template #footer>\n    <Button @click='open = false'>取消</Button>\n    <Button variant='primary' @click='rename'>保存</Button>\n  </template>\n</Dialog>",
    "<Dialog v-model='open' size='lg'>\n  <template #title>使用条款</template>\n  条款正文…\n</Dialog>",
  ],
  agent: {
    keywords: ['dialog', '对话框', '弹窗', 'modal', '模态', 'overlay', '浮层', '遮罩', 'scrim', '确认框', 'confirm', 'v-model', 'focus trap', '焦点圈定'],
    selectionHints: [
      '需要用户处理后才消失 → Dialog；被动通知 → Toast/Alert；侧滑工作区 → Drawer',
      '表单内容或会丢失输入的场景置 :close-on-scrim="false"',
      '宽度档位不够用时换内容布局而不是强行改宽度',
    ],
    commonTasks: ['删除/危险操作二次确认', '模态表单（重命名、新建）', '条款/详情聚焦阅读'],
    generationNotes: [
      'v-model 控制显隐；关闭只是发出 update:modelValue false，最终状态由使用方决定',
      'footer 插槽不传时自带「关闭」按钮；自定义动作区会整体替换默认按钮',
      'title prop 与 #title 插槽二选一即可获得 aria-labelledby 关联；都缺时用 ariaLabel prop 或 attrs 的 aria-labelledby 提供可访问名',
      '不要用 Dialog 承载长任务进度（用 Progress/Toast 反馈）',
    ],
  },
}
