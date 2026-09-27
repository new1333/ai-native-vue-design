/**
 * InputOtp 的组件契约元数据（ComponentDefinition）。
 * api 字段与 InputOtp.types.ts 保持一致；states 与 InputOtp.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-input-otp',
  version: '0.1.0',
  identity: {
    name: 'InputOtp',
    package: '@ui/components',
    export: 'InputOtp',
    category: 'inputs',
    description: '纸面验证码 / 一次性密码输入：定长逐格（每格原生 input），支持粘贴分发、Backspace 回退、自动前进、掩码与软键盘类型，attrs 全量透传到 group 容器。',
  },
  intent: {
    what: '定长验证码 / OTP 的逐格输入与展示：受控 v-model(string)、格数 length、掩码 masked、软键盘类型 inputMode，粘贴多字符自动分发到后续格位，Backspace 空格回退删除。',
    when: [
      '短信 / 邮箱验证码输入（numeric，常见 4-6 位）',
      '两步验证的一次性口令（alphanumeric，字母数字混合）',
      '需要掩码展示的敏感口令（masked）',
      '验证码分段展示（#separator 插槽做 3+3 等分组）',
    ],
    whenNot: [
      '普通单行字段（标题、搜索词等）用 Input：InputOtp 是定长逐格形态，不做自由长度文本',
      '不内置发送倒计时、提交 loading、错误校验状态与自动提交：校验期间的禁用用 disabled 由使用方驱动',
      '不做自动聚焦与校验通过后的自动提交：时机属于业务逻辑（可用 expose.focus() 在恰当时机聚焦）',
      '多行长文本 / 选项选择等语义用对应组件：InputOtp 只承载定长口令',
    ],
    userTask: '用户需要把收到的定长验证码逐位（或整段粘贴）填入并得知是否已填满',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'string', default: "''", description: 'v-model 绑定值：全部格子按序拼接；外部值按 inputMode 过滤并截断到 length（超长部分不展示也不回写）。' },
      { name: 'length', type: 'number', default: '6', description: '格数（>= 1）；非法值回退默认 6。变化时格子数量同步增减。' },
      { name: 'masked', type: 'boolean', default: 'false', description: '掩码展示：格子渲染为 type="password"（逐格掩码，不整段掩码）。' },
      { name: 'inputMode', type: "'numeric' | 'alphanumeric'", default: "'numeric'", description: "软键盘类型与字符过滤口径：numeric 只接受 0-9；alphanumeric 接受 0-9 与英文字母；被过滤的字符不产生值变化。" },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：全部格子原生 disabled（移出 Tab 序）+ 灰化，拦截输入 / 粘贴 / 键盘路径。' },
    ],
    slots: [
      { name: 'separator', description: '格间分隔内容：渲染于每个间隙（length - 1 处），按装饰处理（aria-hidden="true"），通常是「-」等分组符号。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'string', description: 'v-model 更新：用户路径（逐格输入 / 粘贴分发 / 回退删除）导致值实际变化时发出，载荷为拼接后的值。' },
      { name: 'complete', payload: 'string', description: '本次变化后全部格位填满时触发（载荷为完整值）；外部初值满格不触发。' },
    ],
    exposes: [
      { name: 'focus', type: '(index?: number) => void', description: '聚焦第 index 格（默认第 0 格；仅客户端有意义）。' },
      { name: 'blur', type: '() => void', description: '移除全部格子焦点。' },
    ],
  },
  constraints: {
    conflicts: ['Input（自由长度单行文本）'],
  },
  composition: {
    patterns: [
      '填写完成后据 complete 触发校验 / 自动提交（业务侧驱动）',
      '#separator 做 3+3 / 3+4 分组的手机验证码形态',
      'masked + 校验期间 disabled：提交验证时锁定输入',
      'FormField 包裹获得 label / 描述 / 错误文案关联（attrs 落 group 容器）',
    ],
    related: ['FormField', 'Form', 'Input'],
    preferred: [
      'label 由 FormField 提供（aria-label / aria-labelledby 经 attrs 落 group 容器），勿以视觉占位替代',
      '数值验证码保持 inputMode="numeric"（数字软键盘 + 字符过滤），混合口令用 alphanumeric',
    ],
  },
  states: {
    default: '格子 surface 底 + line 描边 + ink 文字；空格位显示空，无值格无占位符。',
    hover: '格子描边加深为 --ui-border-strong；disabled 不响应 hover。',
    focusVisible: '聚焦格描边转 --ui-input-border-focus（accent）并全选已有字符（键入即覆盖）；格子上的全局 :focus-visible 焦点环关闭（结构性重置），焦点指示由描边承担。',
    active: '格子无按压反馈；字符经 input 事件落位后焦点自动前进到下一格（末格停留）。',
    disabled: '格子 sand 底 + text-3 文字 + not-allowed 光标；全部格子原生 disabled 移出 Tab 序，输入 / 粘贴 / 键盘路径全部拦截。',
  },
  accessibility:
    '容器为 role="group"，attrs（id / aria-label / aria-labelledby / aria-describedby 等）全量落在容器上供 FormField 接入；每格为原生 <input>（隐式 role=textbox），自带 aria-label「第 N 位，共 M 位」，不改写 tabindex（Tab 逐格进入）。首格 autocomplete="one-time-code" 供短信验证码自动填充识别。自动前进、焦点移动（Arrow / Home / End / Backspace 回退）均为客户端键盘路径；disabled 用原生 disabled 而非 aria-disabled。#separator 按装饰处理（aria-hidden="true"）。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；函数 ref 在服务端不执行，焦点管理（focus/blur/自动前进）只出现在客户端事件回调与暴露方法内。格数 / 受控值 / masked(type=password) / inputmode / disabled / autocomplete / aria-label / separator 插槽 / attrs 均随 SSR 输出。',
  performance:
    '无全局监听器、无测量、无定时器；仅 computed 派生效值 / 格位数组与容器 class。事件逐格内联绑定，随 length 线性增长。动效只有 border-color / background-color 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：格子底 --ui-input-bg、圆角 --ui-input-radius、focus 描边 --ui-input-border-focus、hover 描边 --ui-border-strong、disabled 底 --ui-surface-muted、间距 --ui-space-*（格子结构尺寸消费 --ui-space-7）、字号 --ui-text-lg/--ui-text-sm、文字 --ui-text-1/--ui-text-3、动效 --ui-motion-*/--ui-ease-out。无全局 CSS 引入；格子结构尺寸 48 与 1px 描边为结构性尺寸（无对应 token，随 Input 先例在任务结果中提出需求）。',
  examples: [
    "<InputOtp v-model='code' />",
    "<InputOtp v-model='code' :length='4' masked />",
    "<InputOtp v-model='token' input-mode='alphanumeric' :length='8' />",
    "<InputOtp v-model='phone' :length='6'>\n  <template #separator>-</template>\n</InputOtp>",
    "<InputOtp v-model='code' :disabled='verifying' @complete='verify' />",
  ],
  agent: {
    keywords: ['otp', '验证码', '一次性密码', '逐格输入', '分格输入', '短信验证码', '两步验证', 'verification code', 'masked', '掩码', 'inputMode', '粘贴', 'complete', 'disabled', '禁用', 'one-time-code'],
    selectionHints: [
      '定长验证码 / 一次性口令 → InputOtp；自由长度文本 → Input',
      '数字验证码 inputMode="numeric"（默认），字母数字混合口令 inputMode="alphanumeric"',
      '填满时机用 @complete 感知；校验期间用 disabled 锁定输入',
    ],
    commonTasks: [
      '短信验证码输入 + 填满自动校验',
      '带分组分隔符的验证码形态',
      '掩码口令 + 提交期间禁用',
    ],
    generationNotes: [
      'v-model 为 string（各格拼接）；外部值按 inputMode 过滤并截断到 length，超长不回写',
      'complete 只在用户路径填满时发出：外部初值满格不触发；先 update:modelValue 后 complete',
      'Backspace 在空格子上回退删除前一格并移动焦点；Delete 只清当前格；Arrow/Home/End 移动焦点',
      'id / aria-label / aria-describedby 等经 attrs 落在 role="group" 容器（多格组件不透传到单格）',
    ],
  },
}
