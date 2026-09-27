/**
 * Upload 的组件契约元数据（ComponentDefinition）。
 * api 字段与 Upload.types.ts 保持一致；states 与 Upload.vue 样式实现同步。
 */
import type { ComponentDefinition } from '../shared/meta'

export const meta: ComponentDefinition = {
  id: 'ui-upload',
  version: '0.1.0',
  identity: {
    name: 'Upload',
    package: '@ui/components',
    export: 'Upload',
    category: 'inputs',
    description: '纸面文件上传：原生 button 触发器（点击/拖拽选择）+ 受控文件列表（UploadFile[]），accept/multiple/maxCount/beforeUpload 闸门，上传中态渲染进度条，失败可重试。',
  },
  intent: {
    what: '文件选择与上传状态呈现：点击或拖拽选择文件，受控 fileList 渲染名称/尺寸/状态/进度，提供移除与失败重试；上传任务本身由使用方以 beforeUpload 返回的 Promise 实现。',
    when: [
      '表单或页面中的附件/素材上传（图片、PDF、任意文件）',
      '需要拖拽投放（drag）与点击选择并存的上传入口',
      '需要限制文件类型（accept）与数量上限（maxCount）的场景',
      '需要呈现上传中进度、成功/失败状态并支持失败重试的列表',
      '上传逻辑由使用方自持（自研 fetch/XHR/直传 SDK），组件负责闸门与状态呈现',
    ],
    whenNot: [
      '不需要组件内置网络上传引擎：不提供 action/customRequest，上传任务 = beforeUpload 返回的 Promise',
      '不做文件夹上传（webkitdirectory）与目录递归选择',
      '不做粘贴板取文件、分片/断点续传、秒传等高级传输策略',
      '不做图片预览/裁剪；列表只呈现名称、尺寸、状态与进度',
      '单值表单字段选择请用 Select/Combobox；Upload 只承载文件',
    ],
    userTask: '用户需要选择或拖入文件、看到每个文件的上传进度与成败，并能移除或重试',
  },
  api: {
    props: [
      { name: 'modelValue', type: 'UploadFile[]', default: '[]', description: 'v-model 绑定的受控文件列表；任何变化（新增/状态落定/移除）都全量发出并需使用方回写（v-model 即可）。' },
      { name: 'accept', type: 'string', description: '原生 accept 透传（点击选择）；拖拽路径用同一规则过滤：`.ext` 后缀 / `type/*` 通配 / `type/subtype` 精确 / 裸类型名，大小写不敏感。' },
      { name: 'multiple', type: 'boolean', default: 'false', description: '多选：点击选择允许多文件、拖拽多文件全部入列；false 时只取第一个。' },
      { name: 'drag', type: 'boolean', default: 'false', description: '拖拽模式：触发器变为虚线拖放区并接管 dragover/dragleave/drop；悬停时拖放区转 accent 高亮。' },
      { name: 'maxCount', type: 'number', description: '数量上限：一次选择的文件会使列表超出上限时整批拒绝并发出 exceed（不部分接收）。' },
      { name: 'disabled', type: 'boolean', default: 'false', description: '禁用：触发器与列表内按钮原生 disabled（移出 Tab 序），选择/拖拽/移除/重试全部拦截。' },
      { name: 'beforeUpload', type: '(file: File, files: File[]) => boolean | void | Promise<boolean | void>', description: '上传闸门/上传任务：false 不入列；true/void 直接成功；Promise 即上传任务（先以 uploading/0 入列，resolve 非 false 落定成功，reject 落定失败并发出 error）；同步抛出按失败入列。' },
    ],
    slots: [
      { name: 'trigger', description: '自定义触发器内容（默认：上传图标 + 文案）；仍渲染在原生 button 内，键盘可达性不变。' },
      { name: 'list', scope: '{ files: UploadFile[] }', description: '自定义文件列表（默认 ul/li 渲染名称/尺寸/状态/进度/操作按钮）；作用域暴露当前受控列表。' },
      { name: 'empty', description: '列表为空时的占位内容（默认不渲染任何内容）。' },
    ],
    events: [
      { name: 'update:modelValue', payload: 'UploadFile[]', description: 'v-model 更新：列表任何变化都全量发出，使用方回写后组件按最新列表映射后续落定。' },
      { name: 'change', payload: 'UploadFile[]', description: '列表变化通知（与 update:modelValue 同载荷、同批次发出）。' },
      { name: 'remove', payload: 'UploadFile', description: '列表项被移除后发出（通知性质，不可取消）。' },
      { name: 'exceed', payload: '[files: File[], fileList: UploadFile[]]', description: '一次选择的文件数会超出 maxCount 时，整批拒绝后发出。' },
      { name: 'error', payload: '[error: unknown, file: UploadFile]', description: '上传任务 reject（或 beforeUpload 同步抛出）时发出；条目已落定为 error 且可重试。' },
    ],
    exposes: [],
  },
  constraints: {
    requires: ['使用方应用入口引入 @ui/tokens/paper.css'],
    dependsOn: ['上传任务由使用方实现（beforeUpload 返回 Promise）'],
    conflicts: ['需要内置网络引擎/分片续传时本组件不适用（见 intent.whenNot）'],
  },
  composition: {
    patterns: [
      'beforeUpload 返回 Promise 实现 XHR/fetch/直传上传，期间通过受控列表推进 percent（进度条实时呈现）',
      'accept="image/*" + drag + multiple 做图片素材拖放区',
      'maxCount + @exceed 提示数量上限',
      '#trigger 自定义触发器外观、#list 自定义条目渲染、#empty 空态占位',
      'disabled 用于表单整体禁用（原生 disabled 移出 Tab 序）',
    ],
    related: ['Button', 'Progress', 'FormField'],
    preferred: [
      '上传任务在 beforeUpload 的 Promise 中实现，用 v-model 回写推进 percent',
      '文件类型限制同时写 accept（原生对话框过滤 + 组件双路径过滤）',
      '失败原因写入条目 error 字段或由 reject 的 Error.message 自动带入',
    ],
  },
  states: {
    default: '触发器：input-bg 底 + line 描边 + ink 文字 + 上传图标；列表条目：surface 底 + line 描边。',
    hover: '触发器描边加深为 --ui-border-strong；拖放区在 dragover 时转 accent 描边 + accent-soft 底；移除按钮 hover 转 danger。',
    focusVisible: '触发器与列表内按钮均为原生元素，焦点环走全局 :focus-visible（2px accent 实线 + 2px 偏移）；隐藏 input 不参与 Tab 序（tabindex=-1）。',
    active: '触发器按压时底色转 --ui-surface-muted；条目内按钮无按压反馈，仅 hover 变色。',
    disabled: '触发器与条目按钮原生 disabled：sand 底 + text-3 文字 + not-allowed 光标，移出 Tab 序；选择/拖拽/移除/重试路径全部拦截。',
    loading: '上传中（uploading）：条目渲染「上传中 N%」真实文本 + token 化进度条（muted 轨道 + accent 填充，宽度随受控 percent 内联驱动，复用 progress 视觉配方）；aria 按 progressbar 契约暴露 valuenow。',
    error: '失败（error）：条目描边转 danger，状态文本/原因文案为 danger 色，出现重试按钮（aria-label="重试 {name}"）；重试将条目重置为 uploading 并重跑 beforeUpload。',
  },
  accessibility:
    '触发器为原生 <button type="button">（Enter/Space 平台原生激活，文本即可访问名称），隐藏 file input 以 visually-hidden 方式呈现且 aria-hidden + tabindex=-1，不与触发器争夺 Tab 序；列表为原生 ul/li，状态以真实文本（上传中 N% / 上传成功 / 上传失败）呈现给读屏；上传中条目内 role="progressbar" 携带 aria-valuemin/max/now 与 aria-label="{name} 上传进度"；移除/重试为原生 button，aria-label="移除 {name}" / "重试 {name}"，图标 svg aria-hidden；disabled 用原生 disabled 而非 aria-disabled。',
  ssr:
    'renderToString 无异常：setup 与模块顶层不访问任何浏览器 API；input.click()、FileList/DataTransfer 解包、beforeUpload 调用只发生在客户端事件回调。受控列表（名称/尺寸/状态文本/进度条 valuenow/原因文案/操作按钮 aria-label）与触发器、accept/multiple/disabled 属性均随 SSR 输出。',
  performance:
    '无监听器挂载（拖拽事件绑定在触发器上，随组件卸载自动清理）、无测量、无定时器（上传任务计时器归使用方）；逻辑集中在 useUpload 纯函数；动效只有 border-color/background-color/color/width 过渡（--ui-motion-* token），prefers-reduced-motion 下随 token 归零。',
  styling:
    '视觉只消费 --ui-* token（paper.css）：触发器底 --ui-input-bg / 圆角 --ui-input-radius / focus 语义同 Input；拖放区虚线 + accent 高亮；条目 surface 底 + line 描边，error 转 --ui-danger；进度条复用 progress 配方（--ui-surface-muted 轨道 + --ui-accent 填充 + --ui-radius-xs 端头）；间距 --ui-space-*、字号 --ui-text-xs/sm/md、数字 --ui-numeric、动效 --ui-motion-*/--ui-ease-out。无全局 CSS 引入。',
  examples: [
    "<Upload v-model='files' />",
    "<Upload v-model='files' drag multiple accept='image/*' :max-count='5' @exceed='onExceed' />",
    "<Upload v-model='files' :before-upload='uploadTask' />",
    "<Upload v-model='files'>\n  <template #trigger><span>＋ 添加附件</span></template>\n  <template #empty>暂无附件</template>\n</Upload>",
    "<Upload v-model='files' disabled />",
  ],
  agent: {
    keywords: ['upload', '上传', '文件上传', '附件', '拖拽上传', '拖放', 'file', 'fileList', '文件列表', 'accept', 'multiple', '多选', 'maxCount', '数量上限', 'exceed', '超限', 'beforeUpload', '上传前', '进度', 'progress', 'percent', '重试', 'retry', '失败', 'error', 'remove', '移除', 'disabled', '禁用'],
    selectionHints: [
      '需要文件选择/拖放 + 上传状态列表 → Upload；纯按钮点击无状态呈现 → Button + 自研',
      '上传引擎（网络请求）由使用方实现：beforeUpload 返回 Promise 即任务本体，组件不做网络 IO',
      '需要内置进度展示：通过 v-model 回写推进条目 percent，进度条与 aria 自动同步',
    ],
    commonTasks: [
      '附件上传（点击选择 + 上传进度 + 失败重试）',
      '图片素材拖放区（drag + accept="image/*" + multiple）',
      '限量上传（maxCount + exceed 提示）',
    ],
    generationNotes: [
      '受控契约：v-model 绑定 UploadFile[]；组件全量发出列表，使用方必须回写（不回写则新条目不渲染、落定不生效）',
      'beforeUpload 三态：false 不入列；true/void 直接成功；Promise 即上传任务（uploading → success/error）',
      '组件生成的条目 uid 形如 ui-upload-file-N；使用方预置列表需自行保证 uid 唯一',
      '重试依赖条目上的 raw（原始 File）：使用方预置的 error 条目若无 raw，重试仅重置为 uploading（由使用方驱动落定）',
      '上传中态渲染 role="progressbar"（aria-valuemin/max/now）；不要另叠自定义进度组件',
      '#list 接管整个列表渲染（作用域 { files }），接管后移除/重试/进度 UI 由使用方自理',
    ],
  },
}
