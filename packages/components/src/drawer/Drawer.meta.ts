/**
 * Drawer 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Drawer.types.ts 保持一致；states 与 Drawer.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-drawer',
  version: '0.1.0',
  identity: {
    name: 'Drawer',
    package: '@ui/components',
    export: 'Drawer',
    category: 'overlay',
    description:
      '纸面侧滑抽屉：Teleport 至 body 的四向（left/right/top/bottom）滑出浮层，受控 v-model，支持模态（遮罩 + 焦点圈定 + 滚动锁定）与非模态（页面保持可交互）两种形态，头部内置原生关闭按钮。',
  },
  intent: {
    what: '从视口边缘滑出的大面积辅助工作区（导航、详情、筛选、设置面板），模态时阻断底层交互，非模态时与页面并存。',
    when: [
      '侧滑导航或目录树等大面积工作区，内容量超出 Dialog 的居中面板承载',
      '列表/表格的筛选与详情侧栏：抽屉与页面内容保持空间连续性（从边缘滑出）',
      '设置/配置面板：非模态（modal=false）时页面仍可操作，抽屉与主内容并排工作',
    ],
    whenNot: [
      '居中的模态任务流（确认、重命名等短表单）用 Dialog：Drawer 贴边且占满滑出轴向',
      '纯被动通知（保存成功、网络异常）用 Toast/Alert：Drawer 要求用户关注后才会消失',
      '轻量悬浮说明（目标元素附近的提示）用 Tooltip/Popover：Drawer 是大面积持续驻留的浮层',
    ],
    userTask: '用户需要在不离开当前上下文的情况下，展开一片贴边的大面积工作区进行处理',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'boolean', default: 'false', description: '受控可见性（v-model）：true 时 Teleport 浮层渲染至 body。' },
      { name: 'side', type: "'left' | 'right' | 'top' | 'bottom'", default: 'right', description: '滑出方向：left/right 为纵向抽屉（size 作用于宽度），top/bottom 为横向抽屉（size 作用于高度）。' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: '尺寸档位（滑出轴向的宽/高）：sm≈320 / md≈448 / lg≈640（由间距标尺推导），永不超出视口。' },
      { name: 'modal', type: 'boolean', default: 'true', description: '是否模态：模态时渲染遮罩、移入并圈定焦点、锁定 body 滚动（aria-modal=true）；非模态时无遮罩、不抢焦点、不锁滚动、Tab 不圈定（无 aria-modal），页面保持可交互。' },
      { name: 'closeOnScrim', type: 'boolean', default: 'true', description: '模态下点击遮罩是否请求关闭（非模态无遮罩，此 prop 不生效）；表单类抽屉可置 false 强制走明确动作。' },
    ],
    slots: [
      { name: 'header', description: '头部区（标题/自定义内容），渲染进 aria-labelledby 指向的元素；头部右侧始终有内置关闭按钮。' },
      { name: 'default', description: '抽屉正文（可滚动区域）。' },
      { name: 'footer', description: '底部动作区；缺省不渲染底部元素（关闭走头部按钮 / Esc / 遮罩）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'boolean', description: 'v-model 更新：一切关闭路径（遮罩/Esc/头部关闭按钮）发出 false。' },
      { name: 'close', payload: "'esc' | 'scrim' | 'close-button'", description: '请求关闭并附带来源；与 update:modelValue false 同步发出。' },
    ],
    exposes: [
      { name: 'focus', type: '() => void', description: '将焦点移入抽屉（首个可聚焦元素，否则面板自身）；仅客户端有意义。' },
    ],
  },
  constraints: {
    conflicts: ['Dialog（居中模态任务流，短内容/短表单）', 'Toast/Alert（被动通知，无需交互即消失）', 'Tooltip/Popover（目标元素附近的轻量悬浮）'],
    dependsOn: [],
  },
  composition: {
    patterns: ['详情侧栏（side=right + footer 插槽放动作按钮）', '筛选面板（side=left，footer 放「重置/应用」对）', '非模态设置面板（modal=false，与页面并排工作）', '横向抽屉（side=top/bottom，承载数据明细/快捷操作条）'],
    related: ['Dialog', 'Button', 'Toast', 'Form'],
    preferred: ['header 插槽提供标题文本（role=dialog 的可访问名称来源）', 'footer 插槽只放一个 primary 动作', '长内容依赖 body 区内部滚动，头部/底部保持可见'],
  },
  states: {
    default: '关闭态不渲染浮层（仅 SSR/挂载前输出 hidden 占位）；打开态：模态时 scrim 遮罩 + surface 底面板贴边滑出、内侧 lg 圆角、modal 阴影；非模态时无遮罩、根层点击穿透。',
    hover: '遮罩无 hover 反馈（非交互元素）；头部关闭按钮 hover 变 --ui-text-1 文本色 + --ui-surface-muted 底色；面板内容沿用内部元素（如 Button）各自的 hover 态。',
    focusVisible: '模态打开时焦点移入面板首个可聚焦元素，焦点环由全局 :focus-visible 约定提供（2px --ui-accent）；面板自身 tabindex="-1" 仅作程序化聚焦锚点；非模态不抢焦点。',
    active: '按压反馈由 header/footer 内交互元素各自承载，浮层层无按压态。',
    disabled: '组件级无 disabled；内部元素各自的 disabled 语义不受影响（disabled 元素自动移出焦点圈定候选集）。',
  },
  accessibility:
    'role="dialog"；模态时 aria-modal="true"，非模态时省略该属性（WAI-ARIA 非模态对话框语义）。header 插槽存在时其内容渲染进 useId 生成的 id 元素，面板以 aria-labelledby 关联（无 header 插槽时不输出 aria-labelledby，使用方应自行提供可访问名称来源）。键盘契约（模态）：打开时焦点移入（首个可聚焦元素，否则面板），Tab/Shift+Tab 在面板内循环圈定（焦点逃逸即拉回），Esc 请求关闭，关闭后焦点还原到打开前的元素；非模态仅保留 Esc 路径（焦点位于抽屉内时生效），Tab 自然流转不圈定。遮罩为纯 div（无 role、不聚焦、无 tabindex），点击命中关闭逻辑；头部关闭按钮为原生 button（aria-label + aria-hidden 内联 SVG）。模态打开期间 body 挂 ui-drawer-scroll-lock class 并行内锁定 overflow。',
  ssr:
    'SSR-safe：setup 与模块顶层不访问浏览器 API；挂载前不渲染浮层，renderToString 仅输出 hidden 的 ui-drawer 占位（输出稳定、含根类），Teleport 与焦点/滚动锁副作用全部推迟到客户端 onMounted 之后；卸载时清理滚动锁并还原焦点。',
  performance:
    '无监听器/测量/定时器；焦点圈定仅在 keydown 时查询面板内可聚焦元素。入场动效为 token 时长的 opacity/transform 动画（四向滑入 + 遮罩淡入），prefers-reduced-motion 下随 --ui-motion-* 归零；无离场动画（受控关闭即卸载）。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：z-index 走 --ui-z-drawer、阴影 --ui-shadow-modal、圆角 --ui-radius-lg（仅内侧两角，外侧贴边保持直角）、遮罩 --ui-scrim、颜色/字号/间距/动效全 token 化；size 档位的宽/高由 --ui-space-8 标尺推导（sm=×5 / md=×7 / lg=×10），组件包不引入全局 CSS；描边宽度 1px 为结构性细线（--ui-border-width token 需求已提出）。',
  examples: [
    "<Drawer v-model='open'>\n  <template #header>详情</template>\n  正文内容…\n</Drawer>",
    "<Drawer v-model='open' side='left' size='sm'>\n  <template #header>筛选</template>\n  <Form>…</Form>\n  <template #footer>\n    <Button @click='open = false'>重置</Button>\n    <Button variant='primary' @click='apply'>应用</Button>\n  </template>\n</Drawer>",
    "<Drawer v-model='open' :modal='false'>\n  <template #header>设置</template>\n  页面仍可交互的并排工作区…\n</Drawer>",
  ],
  agent: {
    keywords: ['drawer', '抽屉', '侧滑', '侧边栏', '滑出', 'overlay', '浮层', '遮罩', 'scrim', 'v-model', 'focus trap', '焦点圈定', 'non-modal', '非模态'],
    selectionHints: [
      '贴边大面积工作区 → Drawer；居中模态任务流 → Dialog；被动通知 → Toast/Alert',
      '需要页面同时可操作时置 :modal="false"（无遮罩、不锁滚动、不圈定焦点）',
      'size 只控制滑出轴向的宽/高；left/right 作用宽度，top/bottom 作用高度',
      '内容会丢失输入的场景置 :close-on-scrim="false"',
    ],
    commonTasks: ['列表详情/筛选侧栏', '侧滑导航目录', '非模态设置面板', '横向明细抽屉'],
    generationNotes: [
      'v-model 控制显隐；关闭只是发出 update:modelValue false，最终状态由使用方决定',
      'header 插槽决定 aria-labelledby；footer 插槽不传时没有底部区域，关闭走头部内置按钮',
      'modal 变化建议在关闭状态下进行（打开期间切换 modal 不会迁移焦点/滚动锁副作用）',
      '无拖拽调宽、无手势滑动关闭、无嵌套路由抽屉——超出核心能力，需要时由使用方自行扩展',
    ],
  },
}
