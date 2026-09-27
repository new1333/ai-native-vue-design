<script setup lang="ts">
/**
 * Playground 单页演示 —— @ui/components 全部 65 个组件目录按产品族分区实例演示。
 *
 * 视觉一律由组件自身样式（var(--ui-*) token）承担；本文件只保留少量
 * 布局辅助类（flex/grid 间距、间距 token），不定义组件视觉。
 */
import { computed, h, onUnmounted, ref } from 'vue'
import type { FunctionalComponent } from 'vue'
import {
  Accordion,
  AgentStatus,
  Alert,
  Artifact,
  Avatar,
  AutoComplete,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Cascader,
  Checkbox,
  CommandPalette,
  DatePicker,
  Dialog,
  Divider,
  Drawer,
  DropdownMenu,
  EmptyState,
  Form,
  FormField,
  Heading,
  HoverCard,
  IconButton,
  Image,
  Input,
  InputNumber,
  InputOtp,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutSider,
  Menu,
  MenuItem,
  Message,
  MessageList,
  ModelSelector,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  PromptInput,
  Radio,
  RadioGroup,
  Rating,
  Reasoning,
  ScrollArea,
  Select,
  Skeleton,
  Slider,
  Space,
  Spinner,
  Splitter,
  SplitterPane,
  Statistic,
  Stepper,
  StreamingText,
  SubMenu,
  Suggestion,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  Text,
  Textarea,
  Timeline,
  ToastHost,
  ToggleGroup,
  ToolCallCard,
  Tooltip,
  Tree,
  TreeSelect,
  Upload,
  VirtualList,
  toast,
} from '@ui/components'
import type {
  AccordionItem,
  AccordionMultipleValue,
  AgentStatusState,
  ArtifactCloseReason,
  AutoCompleteOption,
  BadgeVariant,
  BreadcrumbItemClickPayload,
  CascaderOption,
  CascaderPath,
  CommandPaletteGroup,
  DatePickerModelValue,
  DropdownMenuItem,
  DrawerCloseReason,
  FormRules,
  MenuValue,
  ModelSelectorModel,
  ModelSelectorValue,
  RadioValue,
  RatingValue,
  SelectOption,
  SelectValue,
  SuggestionItem,
  StepperStep,
  TableColumn,
  TableSortPayload,
  TabsValue,
  TimelineItem,
  ToastId,
  ToastVariant,
  TreeNode,
  TreeSelectModelValue,
  TreeSelectOption,
  TreeSelectPayload,
  UploadFile,
  VirtualListRange,
} from '@ui/components'

/* ── 演示用内联图标（遵循 Icon Token：viewBox 24 / stroke 1.5 / currentColor） ── */
function makeIcon(paths: readonly string[]): FunctionalComponent {
  return () =>
    h(
      'svg',
      {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': true,
      },
      paths.map((d) => h('path', { d })),
    )
}
const SearchIcon = makeIcon(['M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14Z', 'm20 20-3.5-3.5'])
const EditIcon = makeIcon(['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'])
const LinkIcon = makeIcon([
  'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
  'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
])
const TrashIcon = makeIcon(['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v6', 'M14 11v6'])
const ChevronDownIcon = makeIcon(['m6 9 6 6 6-6'])

/* ── Avatar：一张真实可加载图（data URI）+ 一张必然 404 的图（演示 error → 首字母回退） ── */
const avatarImageSrc =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
      '<rect width="64" height="64" fill="#33594A"/>' +
      '<circle cx="32" cy="24" r="12" fill="#FFFFFF"/>' +
      '<path d="M8 64c0-13 11-22 24-22s24 9 24 22z" fill="#FFFFFF"/></svg>',
  )

/* ── Form · FormField：两字段校验示例 ── */
type SignupModel = { name: string; email: string }
const signupModel = ref<SignupModel>({ name: '', email: '' })
const signupRules: FormRules = {
  name: [(value) => (typeof value === 'string' && value.trim() !== '' ? true : '请输入姓名')],
  email: [
    (value) => (typeof value === 'string' && value.trim() !== '' ? true : '请输入邮箱'),
    (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? true : '邮箱格式不正确'),
  ],
}
const SIGNUP_DELAY_MS = 800
const signupPending = ref(false)
function onSignupSubmit(): void {
  signupPending.value = true
  window.setTimeout(() => {
    signupPending.value = false
    toast.success('表单提交成功')
  }, SIGNUP_DELAY_MS)
}

/* ── Input / Textarea / Select / Checkbox / Radio / Switch ── */
const inputTitle = ref('')
const inputSearch = ref('')
const bioDraft = ref('')
const bioCounted = ref('纸面设计系统')
const deptOptions: SelectOption[] = [
  { label: '产品', value: 'product' },
  { label: '工程', value: 'engineering' },
  { label: '设计', value: 'design' },
  { label: '运营（不可选）', value: 'operations', disabled: true },
]
const dept = ref<SelectValue | null>(null)
const checkedOnce = ref(true)
const uncheckedBox = ref(false)
const parentChecked = ref(false)
const parentIndeterminate = ref(true)
function onParentChange(value: boolean): void {
  parentChecked.value = value
  parentIndeterminate.value = false
}
const plan = ref<RadioValue | undefined>('pro')
const wifiOn = ref(true)
const btOn = ref(false)

/* ── Table：8 行示例数据 + 可排序列 + 状态徽标单元格 ── */
interface UserRow {
  id: number
  name: string
  role: string
  status: '启用' | '待激活' | '停用'
  score: number
  joined: string
}
const userRows: UserRow[] = [
  { id: 1, name: '林晚照', role: '产品经理', status: '启用', score: 92, joined: '2025-01-13' },
  { id: 2, name: '沈砚', role: '前端工程师', status: '启用', score: 88, joined: '2025-02-04' },
  { id: 3, name: '顾清桐', role: '设计师', status: '待激活', score: 75, joined: '2025-03-18' },
  { id: 4, name: '苏行舟', role: '后端工程师', status: '启用', score: 95, joined: '2025-04-22' },
  { id: 5, name: '陆知遥', role: '数据分析师', status: '停用', score: 61, joined: '2025-05-09' },
  { id: 6, name: '江雨眠', role: '市场运营', status: '启用', score: 83, joined: '2025-06-30' },
  { id: 7, name: '程既白', role: '测试工程师', status: '待激活', score: 79, joined: '2025-08-12' },
  { id: 8, name: '闻人语', role: '技术写作', status: '启用', score: 90, joined: '2025-09-01' },
]
const userColumns: TableColumn<UserRow>[] = [
  { key: 'name', label: '姓名', sortable: true },
  { key: 'role', label: '角色' },
  { key: 'status', label: '状态' },
  { key: 'score', label: '评分', align: 'right', sortable: true },
  { key: 'joined', label: '加入日期' },
]
const statusVariant: Record<UserRow['status'], BadgeVariant> = {
  启用: 'success',
  待激活: 'warning',
  停用: 'danger',
}
const tableLoading = ref(false)
const lastSort = ref('尚未排序')
function onUserSort(payload: TableSortPayload): void {
  lastSort.value = `排序列「${payload.key}」方向 ${payload.order}`
}

/* ── Pagination / Progress ── */
const PAGE_TOTAL = 88
const PAGE_SIZE = 10
const page = ref(2)
const pageCount = computed(() => Math.ceil(PAGE_TOTAL / PAGE_SIZE))

/* ── Alert ── */
const warningVisible = ref(true)

/* ── Toast：变体触发 + 常驻提示的移除 ── */
const stickyToastId = ref<ToastId | null>(null)
function pushToast(variant: ToastVariant): void {
  toast[variant](`这是一条 ${variant} 提示`)
}
function showStickyToast(): void {
  if (stickyToastId.value !== null) return
  stickyToastId.value = toast.info('常驻提示：不会自动关闭', { duration: 0 })
}
function removeStickyToast(): void {
  if (stickyToastId.value === null) return
  toast.remove(stickyToastId.value)
  stickyToastId.value = null
}

/* ── Dialog / DropdownMenu / Tabs / EmptyState ── */
const publishOpen = ref(false)
function confirmPublish(): void {
  publishOpen.value = false
  toast.success('已发布到团队空间')
}
const docMenuItems: DropdownMenuItem[] = [
  { key: 'rename', label: '重命名', icon: EditIcon },
  { key: 'copy-link', label: '复制链接', icon: LinkIcon },
  { key: 'archive', label: '归档（禁用）', disabled: true },
  { key: 'remove', label: '删除文档', danger: true, icon: TrashIcon },
]
function onDocMenuSelect(key: string): void {
  toast.info(`菜单选中：${key}`)
}
const activeTab = ref<TabsValue>('preview')
function createDraft(): void {
  toast.info('已创建草稿（演示）')
}

/* ── Accordion 折叠面板：单开（默认）与多开（初始展开一条） ── */
const faqItems: AccordionItem[] = [
  {
    key: 'tokens',
    title: '如何接入设计 token？',
    content: '在使用方应用入口一次性引入 @ui/tokens/paper.css，全部 --ui-* 变量即全局生效；组件包自身不引入任何全局 CSS。',
  },
  {
    key: 'single',
    title: '单开与多开有什么区别？',
    content: '默认单开：同一时刻至多一个面板展开，展开新条目时自动收起其余；传 multiple 后允许多个面板同时保持展开。',
  },
  {
    key: 'ssr',
    title: '服务端渲染可用吗？',
    content: '可以。aria 关联 id 由 useId 生成，setup 顶层不访问浏览器 API，renderToString 无异常，初始展开状态随服务端 HTML 输出。',
  },
]
const faqOpenKeys = ref<AccordionMultipleValue>(['tokens'])

/* ── Layout 布局：受控折叠侧栏（内置触发器与外部按钮操作同一份状态） ── */
const siderCollapsed = ref(false)

/* ── ScrollArea 滚动区 ── */
const scrollLogs = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  time: `09:${String(i * 3).padStart(2, '0')}`,
  text: `服务 health-check 第 ${i + 1} 次巡检通过，耗时 ${12 + (i % 7)}ms，实例全部健康。`,
}))

/* ── Splitter 分隔面板：受控比例 ── */
const paneSizes = ref<number[]>([60, 40])
function resetPaneSizes(): void {
  paneSizes.value = [60, 40]
}

/* ── Tag 标签：可移除标签的显隐 ── */
const tagVisible = ref(true)

/* ── AutoComplete 自动补全 ── */
const cityOptions: AutoCompleteOption[] = [
  { label: '北京', value: 'beijing' },
  { label: '南京', value: 'nanjing' },
  { label: '北海', value: 'beihai' },
  { label: '上海', value: 'shanghai' },
  { label: '杭州（暂不可选）', value: 'hangzhou', disabled: true },
]
const cityText = ref('')
const cityPicked = ref('（尚未选择）')
function onCitySelect(value: { label: string; value: string | number }): void {
  cityPicked.value = `${value.label}（${value.value}）`
}

/* ── Cascader 级联选择 ── */
const regionOptions: CascaderOption[] = [
  {
    label: '浙江省',
    value: 'cn-zj',
    children: [
      {
        label: '杭州市',
        value: 'cn-zj-hz',
        children: [
          { label: '西湖区', value: 'cn-zj-hz-xh' },
          { label: '余杭区', value: 'cn-zj-hz-yh' },
        ],
      },
      { label: '宁波市', value: 'cn-zj-nb' },
    ],
  },
  {
    label: '江苏省',
    value: 'cn-js',
    children: [
      { label: '南京市', value: 'cn-js-nj', children: [{ label: '鼓楼区', value: 'cn-js-nj-gl' }] },
      { label: '苏州市', value: 'cn-js-sz' },
    ],
  },
  { label: '北京市', value: 'cn-bj' },
]
const regionPath = ref<CascaderPath | null>(['cn-zj', 'cn-zj-hz'])
const emptyPath = ref<CascaderPath | null>(null)

/* ── DatePicker 日期选择 ── */
const publishDate = ref<DatePickerModelValue>(null)
const publishAt = ref<DatePickerModelValue>(null)

/* ── InputNumber 数字输入 ── */
const ticketCount = ref<number | null>(2)
const ticketStepCount = ref(0)

/* ── InputOtp 一次性验证码 ── */
const otpCode = ref('')
const otpMasked = ref('')
const otpDone = ref('')

/* ── ModelSelector 模型选择 ── */
const chatModels: ModelSelectorModel[] = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'Claude Sonnet', value: 'claude-sonnet', provider: 'Anthropic' },
  { label: 'DeepSeek-V3', value: 'deepseek-v3', provider: 'DeepSeek' },
  { label: '本地 Qwen2.5', value: 'qwen-local', provider: 'Local', disabled: true },
]
const currentModel = ref<ModelSelectorValue | null>('claude-sonnet')
const lastModel = ref<ModelSelectorModel | null>(null)
function onModelChange(model: ModelSelectorModel): void {
  lastModel.value = model
}

/* ── PromptInput 提示词输入：submit 不自动清空，由使用方经 v-model 置空 ── */
const promptDraft = ref('')
const promptHistory = ref<string[]>([])
function onPromptSubmit(value: string): void {
  promptHistory.value = [value, ...promptHistory.value].slice(0, 3)
  promptDraft.value = ''
}

/* ── Rating 评分 ── */
const satisfaction = ref<RatingValue | undefined>(4)

/* ── Slider 滑块 ── */
const volume = ref(30)
const sliderMarks = [
  { value: 0, label: '静音' },
  { value: 50, label: '适中' },
  { value: 100, label: '最大' },
]

/* ── Suggestion 推荐追问 ── */
const followUps: SuggestionItem[] = [
  { label: '总结要点', value: '请总结本次讨论的要点' },
  { label: '给出示例', value: '请给出一个可运行的代码示例' },
  { label: '深入原理', value: '请解释底层实现原理' },
]
const lastFollowUp = ref<SuggestionItem | null>(null)

/* ── ToggleGroup 分段切换：single（radiogroup）与 multiple（可多选） ── */
const boardViewItems = [
  { value: 'list', label: '列表' },
  { value: 'card', label: '卡片' },
  { value: 'board', label: '看板' },
]
const channelItems = [
  { value: 'email', label: '邮件' },
  { value: 'webhook', label: 'Webhook（禁用）', disabled: true },
  { value: 'sms', label: '短信' },
]
const boardView = ref('card')
const notifyChannels = ref<string[]>(['email'])

/* ── TreeSelect 树选择：单选与 checkable 级联 ── */
const regionTree: TreeSelectOption[] = [
  {
    label: '华东地区',
    value: 'east',
    children: [
      { label: '上海', value: 'shanghai' },
      { label: '杭州', value: 'hangzhou' },
    ],
  },
  { label: '华北地区', value: 'north', children: [{ label: '北京', value: 'beijing' }] },
  { label: '总部', value: 'hq' },
]
const permTree: TreeSelectOption[] = [
  {
    label: '系统管理',
    value: 'system',
    children: [
      { label: '用户管理', value: 'user' },
      { label: '角色管理', value: 'role' },
      { label: '日志审计（已下线）', value: 'audit', disabled: true },
    ],
  },
  {
    label: '内容管理',
    value: 'content',
    children: [
      { label: '文章发布', value: 'article' },
      { label: '评论审核', value: 'comment' },
    ],
  },
  { label: '数据看板', value: 'dashboard' },
]
const ownedRegion = ref<TreeSelectModelValue>('shanghai')
const grantedPerms = ref<TreeSelectModelValue>(['article'])

/* ── Upload 上传：maxCount + exceed 与整组禁用 ── */
const uploadFiles = ref<UploadFile[]>([])
const uploadNote = ref('（尚未触发 exceed）')
function onUploadExceed(files: File[], fileList: UploadFile[]): void {
  uploadNote.value = `上限 2：现有 ${fileList.length} 个，本次尝试选择 ${files.length} 个，整批拒绝。`
}
const archivedFiles = ref<UploadFile[]>([
  { uid: 'lock-1', name: '归档.pdf', size: 204800, status: 'success', percent: 100 },
])

/* ── Image 图片：data URI 演示图 + 必然 404 的主源（fallback 回落） ── */
function playSvg(label: string, background: string): string {
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="${background}"/><text x="120" y="88" font-family="sans-serif" font-size="22" fill="#FCFBF8" text-anchor="middle">${label}</text></svg>`,
    )
  )
}
const brokenSrc = '/playground/missing-image.png'

/* ── Message 会话消息：模拟流式回复（每 60ms 追加一字符） ── */
const REPLY_FULL = '本周 12 次构建：10 次通过、2 次因类型检查失败回滚，主要问题集中在 input-number 的边界值校验。'
const replyText = ref('')
const replyStreaming = ref(false)
let replyTimer: ReturnType<typeof setInterval> | null = null
function startReply(): void {
  if (replyTimer !== null) clearInterval(replyTimer)
  replyText.value = ''
  replyStreaming.value = true
  replyTimer = setInterval(() => {
    if (replyText.value.length >= REPLY_FULL.length) {
      if (replyTimer !== null) {
        clearInterval(replyTimer)
        replyTimer = null
      }
      replyStreaming.value = false
      return
    }
    replyText.value = REPLY_FULL.slice(0, replyText.value.length + 1)
  }, 60)
}

/* ── MessageList 消息列表 ── */
interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
}
const chatMessages: ChatMessage[] = [
  { id: 1, role: 'user', content: '帮我总结一下这份需求文档的要点。' },
  { id: 2, role: 'assistant', content: '好的，这份文档的要点有三：一是目标用户与场景；二是核心流程与边界；三是验收标准。' },
  { id: 3, role: 'user', content: '把第二条展开讲讲。' },
  { id: 4, role: 'assistant', content: '第二条的核心是「先跑通主流程」：登录 → 创建会话 → 发送消息 → 流式接收回复。' },
  { id: 5, role: 'user', content: '明白了，谢谢。' },
  { id: 6, role: 'assistant', content: '不客气，需要我按这个结构起草验收清单的话随时说。' },
]

/* ── Statistic 数值统计：受控倒计时（value 变更即重置） ── */
const countdownSeconds = ref(90)
const countdownFinished = ref(false)
function restartCountdown(next: number): void {
  countdownFinished.value = false
  countdownSeconds.value = next
}

/* ── StreamingText 流式文本：使用方只追加 content 并翻转 streaming ── */
const STREAM_ANSWER =
  '「纸面」以纸质文档为隐喻：低饱和墨色、克制的强调色与稳定的字阶。流式渲染时回复按节拍逐段上屏；结束后光标收起，全文定格。'
const streamed = ref('')
const streaming = ref(false)
const streamDone = ref(false)
let streamTimer: ReturnType<typeof setInterval> | null = null
function stopStream(): void {
  if (streamTimer !== null) {
    clearInterval(streamTimer)
    streamTimer = null
  }
}
function startStream(): void {
  stopStream()
  streamed.value = ''
  streamDone.value = false
  streaming.value = true
  streamTimer = setInterval(() => {
    if (streamed.value.length >= STREAM_ANSWER.length) {
      streaming.value = false
      stopStream()
      return
    }
    streamed.value = STREAM_ANSWER.slice(0, streamed.value.length + 6)
  }, 80)
}
function resetStream(): void {
  stopStream()
  streaming.value = false
  streamed.value = ''
  streamDone.value = false
}

/* ── Timeline 时间线：pending 幽灵节点（加载 900ms 后追加一条） ── */
const buildEvents = ref<TimelineItem[]>([
  { key: 'e1', title: '构建开始', description: 'paper-design-system.tar.gz', time: '15:30:00' },
  { key: 'e2', title: '类型检查通过', time: '15:30:12' },
])
const buildPending = ref(false)
let buildTimer: ReturnType<typeof setTimeout> | null = null
function appendBuildEvent(): void {
  if (buildPending.value) return
  buildPending.value = true
  buildTimer = setTimeout(() => {
    const step = buildEvents.value.length + 1
    buildEvents.value = [
      ...buildEvents.value,
      { key: `e${step}`, title: `第 ${step} 步构建完成`, time: `15:30:${String(step * 7).padStart(2, '0')}` },
    ]
    buildPending.value = false
  }, 900)
}

/* ── Tree 树形控件 ── */
const docTree: TreeNode[] = [
  {
    key: 'guide',
    title: '使用指南',
    children: [
      { key: 'install', title: '安装' },
      { key: 'tokens', title: '设计令牌' },
    ],
  },
  {
    key: 'components',
    title: '组件',
    children: [
      { key: 'general', title: '通用', children: [{ key: 'button', title: 'Button 按钮' }] },
      { key: 'data', title: '数据', children: [{ key: 'table', title: 'Table 表格' }] },
    ],
  },
  { key: 'changelog', title: '更新日志' },
]
const lastTreeNode = ref<TreeSelectPayload | null>(null)

/* ── VirtualList 虚拟列表：500 项仅渲染可视窗口 ── */
interface FeedEntry {
  id: number
  title: string
  text: string
}
const feedEntries: FeedEntry[] = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  title: `记录 ${i + 1}`,
  text: '全量 500 项中只有可视窗口附近约 20 项真实存在于 DOM，滚动时按窗口重挂载。',
}))
const feedRange = ref<VirtualListRange>({ start: 0, end: 0 })

/* ── AgentStatus 代理状态：§14 state semantics 八档 ── */
const agentStates: AgentStatusState[] = [
  'queued',
  'running',
  'streaming',
  'waitingForTool',
  'toolRunning',
  'completed',
  'failed',
  'cancelled',
]

/* ── Reasoning 思考过程：受控展开态 ── */
const reasoningExpanded = ref(false)

/* ── Spinner 加载指示：受控刷新（loading 期间 v-if 挂载） ── */
const refreshing = ref(false)
let refreshTimer: ReturnType<typeof setTimeout> | null = null
function refreshData(): void {
  refreshing.value = true
  if (refreshTimer !== null) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    refreshing.value = false
    refreshTimer = null
  }, 1200)
}
onUnmounted(() => {
  if (replyTimer !== null) clearInterval(replyTimer)
  if (streamTimer !== null) clearInterval(streamTimer)
  if (buildTimer !== null) clearTimeout(buildTimer)
  if (refreshTimer !== null) clearTimeout(refreshTimer)
})

/* ── Breadcrumb 面包屑 ── */
const breadcrumbItems = [
  { key: 'home', label: '首页', href: '#/' },
  { key: 'library', label: '组件库', href: '#/library' },
  { key: 'navigation', label: '导航', href: '#/library/navigation' },
  { key: 'current', label: '面包屑' },
]
const lastCrumb = ref('（尚未点击）')
function onCrumbClick(payload: BreadcrumbItemClickPayload): void {
  lastCrumb.value = `${payload.item.label}（第 ${payload.index} 项）`
}

/* ── CommandPalette 命令面板：演示壳不抢占全局 Ctrl/Cmd+K（hotkey=false），改由按钮打开 ── */
const paletteOpen = ref(false)
const lastCommand = ref<string | null>(null)
const paletteGroups: CommandPaletteGroup[] = [
  {
    key: 'nav',
    label: '导航',
    items: [
      { key: 'top', label: '回到页首', hint: 'G T' },
      { key: 'general', label: '查看通用组件', hint: 'G G' },
    ],
  },
  {
    key: 'action',
    label: '操作',
    items: [{ key: 'copy-link', label: '复制页面链接', hint: '⌘C' }],
  },
]
function onCommandSelect(key: string): void {
  lastCommand.value = key
}

/* ── Menu 菜单 ── */
const activeMenu = ref<MenuValue>('overview')
const lastMenuSelect = ref('（尚未选择）')
function onMenuSelect(value: MenuValue): void {
  lastMenuSelect.value = String(value)
}

/* ── Stepper 步骤条 ── */
const stepList: StepperStep[] = [{ title: '账号信息' }, { title: '公司信息' }, { title: '交付配置' }, { title: '完成' }]
const currentStep = ref(1)

/* ── Drawer 抽屉 ── */
const drawerOpen = ref(false)
const drawerCloseReason = ref<DrawerCloseReason | null>(null)
function openDrawer(): void {
  drawerCloseReason.value = null
  drawerOpen.value = true
}
function onDrawerClose(reason: DrawerCloseReason): void {
  drawerCloseReason.value = reason
}
function onArtifactClose(reason: ArtifactCloseReason): void {
  artifactCloseReason.value = reason
}

/* ── Artifact 产物画布 ── */
const artifactOpen = ref(false)
const artifactCloseReason = ref<ArtifactCloseReason | null>(null)
const artifactCode = `export function sortByTitle<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'))
}
`

/* ── Popconfirm 气泡确认 ── */
const lastConfirm = ref('（尚未操作）')
</script>

<template>
  <!-- 壳用 div 而非 main：Layout 演示的 LayoutContent 渲染 <main>，全页仅保留这一个 main 地标 -->
  <div class="play">
    <header class="play-head">
      <Heading as="h1" size="3xl">纸面 Paper · Playground</Heading>
      <Text as="p" color="text-2">
        AI-native Vue 3 组件库单页演示：25 个组件按产品族分区。视觉由组件与 paper.css 承担，页面自身只使用少量 --ui-* 布局 token。
      </Text>
    </header>

    <!-- ──────────────── 排版 Typography ──────────────── -->
    <section class="play-section" aria-labelledby="family-typography">
      <Heading as="h2" size="2xl" id="family-typography">排版 Typography</Heading>
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Heading 标题</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Heading as="h3" size="3xl">Heading 3xl</Heading>
              <Heading as="h3" size="2xl">Heading 2xl</Heading>
              <Heading as="h4" size="xl" :weight="500">Heading xl / 500</Heading>
              <Heading as="h4" size="lg" :weight="400" color="text-2">Heading lg / 400 / text-2</Heading>
            </div>
          </CardBody>
        </Card>
        <Card class="play-card">
          <CardHeader>Text 正文</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Text size="xl">Text xl 大号说明</Text>
              <Text size="md">Text md 正文默认档</Text>
              <Text size="sm" color="text-2">Text sm / text-2 次级说明</Text>
              <Text size="xs" color="text-3">Text xs / text-3 弱化脚注</Text>
              <Text size="md" :weight="600">Text md / 600 强调文字</Text>
              <Text size="md" numeric>numeric 对齐数字：1,024.50 / 3,073.50</Text>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>

    <!-- ──────────────── 通用 General ──────────────── -->
    <section class="play-section" aria-labelledby="family-general">
      <Heading as="h2" size="2xl" id="family-general">通用 General</Heading>
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Button 按钮 · ButtonGroup</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Button variant="primary">主要操作</Button>
                <Button variant="secondary">次要操作</Button>
                <Button variant="ghost">幽灵按钮</Button>
                <Button variant="danger">危险操作</Button>
              </div>
              <div class="play-row">
                <Button variant="secondary" size="sm">小号</Button>
                <Button variant="secondary" size="md">中号</Button>
                <Button variant="secondary" size="lg">大号</Button>
              </div>
              <div class="play-row">
                <Button variant="primary">
                  <template #icon><SearchIcon /></template>
                  搜索
                </Button>
                <Button variant="secondary">
                  下一步
                  <template #iconRight><ChevronDownIcon /></template>
                </Button>
                <ButtonGroup size="sm">
                  <Button variant="secondary">日</Button>
                  <Button variant="secondary">周</Button>
                  <Button variant="secondary">月</Button>
                </ButtonGroup>
              </div>
              <div class="play-row">
                <Button variant="secondary" disabled>禁用</Button>
                <Button variant="primary" loading>加载中</Button>
              </div>
              <Button variant="primary" block class="play-full">块级按钮（block）</Button>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>IconButton 图标按钮</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <IconButton variant="ghost" aria-label="搜索文档"><SearchIcon /></IconButton>
                <IconButton variant="outline" aria-label="搜索文档"><SearchIcon /></IconButton>
                <IconButton variant="primary" aria-label="搜索文档"><SearchIcon /></IconButton>
              </div>
              <div class="play-row">
                <IconButton variant="outline" size="sm" aria-label="搜索（小）"><SearchIcon /></IconButton>
                <IconButton variant="outline" size="md" aria-label="搜索（中）"><SearchIcon /></IconButton>
                <IconButton variant="outline" size="lg" aria-label="搜索（大）"><SearchIcon /></IconButton>
              </div>
              <div class="play-row">
                <IconButton variant="outline" disabled aria-label="禁用的搜索"><SearchIcon /></IconButton>
                <IconButton variant="primary" loading aria-label="加载中的搜索"><SearchIcon /></IconButton>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Badge 徽标</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Badge>neutral</Badge>
                <Badge variant="success">success</Badge>
                <Badge variant="warning">warning</Badge>
                <Badge variant="danger">danger</Badge>
                <Badge variant="info">info</Badge>
              </div>
              <div class="play-row">
                <Badge variant="success" dot>在线</Badge>
                <Badge variant="warning" dot>待审核</Badge>
                <Badge variant="danger" dot>已过期</Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Avatar 头像</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Avatar alt="林晚照的头像" name="林晚照" size="sm" />
                <Avatar alt="沈砚的头像" name="沈砚" size="md" />
                <Avatar alt="顾清桐的头像" name="顾清桐" size="lg" />
              </div>
              <div class="play-row">
                <Avatar :src="avatarImageSrc" alt="王英的头像" name="王英" size="md" />
                <Avatar src="/playground/missing-avatar.png" alt="头像加载失败回退首字母" name="赵芸" size="md" />
              </div>
              <Text size="xs" color="text-3">右一枚 src 404：演示加载失败 → 首字母回退。</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Divider 分隔线</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Text color="text-2">上方内容</Text>
              <Divider />
              <Divider>
                <template #label>协作区</template>
              </Divider>
              <div class="play-row">
                <Text color="text-2">左侧</Text>
                <Divider direction="vertical" />
                <Text color="text-2">右侧</Text>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card" shadow="none">
          <CardHeader>Card 卡片 · shadow=none（默认）</CardHeader>
          <CardBody>
            <Text as="p" size="sm" color="text-2">静止面默认无阴影，靠 1px 边界与留白分层。</Text>
          </CardBody>
          <CardFooter>
            <Button variant="secondary" size="sm">卡片动作</Button>
          </CardFooter>
        </Card>

        <Card class="play-card" shadow="rest">
          <CardHeader>Card 卡片 · shadow=rest</CardHeader>
          <CardBody>
            <Text as="p" size="sm" color="text-2">应用 --ui-shadow-rest 一档静止阴影，用于需要浮起的分组。</Text>
          </CardBody>
          <CardFooter>
            <Button variant="secondary" size="sm">卡片动作</Button>
          </CardFooter>
        </Card>
      </div>

      <!-- 40 个新组件演示带：独立 wrap 网格，避免改变上方既有卡片的换行宽度与视觉基线 -->
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Accordion 折叠面板（单开 / 多开）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Accordion :items="faqItems" />
              <Accordion v-model="faqOpenKeys" multiple :items="faqItems" />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Layout 布局（侧栏受控折叠）</CardHeader>
          <CardBody>
            <Layout class="play-page">
              <LayoutSider
                collapsible
                aria-label="演示侧栏"
                :collapsed="siderCollapsed"
                @sider-collapse="siderCollapsed = $event"
              >
                <nav class="play-sider-nav">
                  <span>概览</span>
                  <span>部署</span>
                  <span>成员</span>
                </nav>
              </LayoutSider>
              <Layout>
                <LayoutHeader>
                  <span>纸面控制台</span>
                  <Button size="sm" variant="ghost" @click="siderCollapsed = !siderCollapsed">
                    {{ siderCollapsed ? '展开侧栏' : '收起侧栏' }}
                  </Button>
                </LayoutHeader>
                <LayoutContent>
                  <Text as="p" size="sm" color="text-2">
                    主内容区填充剩余空间；内置触发器与外部按钮操作同一份受控折叠状态。
                  </Text>
                </LayoutContent>
                <LayoutFooter>© 2026 纸面 Paper</LayoutFooter>
              </Layout>
            </Layout>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>ScrollArea 滚动区（滚动查看日志）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <ScrollArea class="play-pane">
                <ul class="play-log-list">
                  <li v-for="log in scrollLogs" :key="log.id">
                    <span class="play-log-time">{{ log.time }}</span>
                    <span>{{ log.text }}</span>
                  </li>
                </ul>
              </ScrollArea>
              <Text size="xs" color="text-2">视口可键盘聚焦，内容超界时原生滚动、滚动条按需出现。</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Space 间距</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Space>
                <Button size="sm" variant="secondary">保存</Button>
                <Button size="sm" variant="secondary">取消</Button>
                <Button size="sm" variant="secondary">删除</Button>
              </Space>
              <Space size="lg">
                <Tag>md 之后 lg</Tag>
                <Tag variant="info">间距档位演示</Tag>
              </Space>
              <Space direction="column" align="start">
                <Text size="sm" color="text-2">direction=column 纵向排布</Text>
                <Button size="sm" variant="ghost">次级动作</Button>
              </Space>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Splitter 分隔面板（拖拽 / 键盘微调）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Splitter v-model="paneSizes" class="play-splitter">
                <SplitterPane key="chat">
                  <div class="play-pane-fill">
                    <Text as="p" size="sm" color="text-2">对话区：拖拽中间分隔条可调整两侧宽度。</Text>
                  </div>
                </SplitterPane>
                <SplitterPane key="artifact">
                  <div class="play-pane-fill">
                    <Text as="p" size="sm" color="text-2">产物预览区（当前 {{ Math.round(paneSizes[1]) }}%）。</Text>
                  </div>
                </SplitterPane>
              </Splitter>
              <div class="play-row">
                <Button size="sm" variant="secondary" @click="resetPaneSizes">恢复 60 / 40</Button>
                <Text size="sm" color="text-2">当前比例：{{ Math.round(paneSizes[0]) }} / {{ Math.round(paneSizes[1]) }}</Text>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Tag 标签</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Tag>neutral（默认）</Tag>
                <Tag variant="success">已认证</Tag>
                <Tag variant="warning">试用版</Tag>
                <Tag variant="danger">已停用</Tag>
                <Tag variant="info">内部项目</Tag>
              </div>
              <div class="play-row">
                <Tag v-if="tagVisible" closable @close="tagVisible = false">可移除标签</Tag>
                <Button v-else variant="ghost" size="sm" @click="tagVisible = true">恢复标签</Button>
                <Tag disabled>禁用标签</Tag>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>

    <!-- ──────────────── 表单 Inputs ──────────────── -->
    <section class="play-section" aria-labelledby="family-inputs">
      <Heading as="h2" size="2xl" id="family-inputs">表单 Inputs</Heading>
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Form / FormField · 两字段校验</CardHeader>
          <CardBody>
            <Form :model="signupModel" :rules="signupRules" :pending="signupPending" @submit="onSignupSubmit">
              <FormField name="name" label="姓名" required help="真实姓名或常用昵称">
                <template #default="{ controlAttrs, invalid }">
                  <Input
                    v-model="signupModel.name"
                    placeholder="张三"
                    :status="invalid ? 'error' : 'default'"
                    v-bind="controlAttrs"
                  />
                </template>
              </FormField>
              <FormField name="email" label="邮箱" required>
                <template #default="{ controlAttrs, invalid }">
                  <Input
                    v-model="signupModel.email"
                    placeholder="you@example.com"
                    :status="invalid ? 'error' : 'default'"
                    v-bind="controlAttrs"
                  />
                </template>
              </FormField>
              <Button type="submit" variant="primary" :loading="signupPending">提交</Button>
            </Form>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Input 输入框</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Input v-model="inputTitle" placeholder="默认输入框" />
              <Input v-model="inputSearch" placeholder="可清空 + 前缀图标" clearable>
                <template #prefix><SearchIcon /></template>
              </Input>
              <Input :model-value="'只读内容'" readonly />
              <Input :model-value="'非法字符**'" status="error" />
              <Input disabled placeholder="禁用状态" />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Textarea 多行输入</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Textarea v-model="bioDraft" placeholder="默认：可垂直拉伸" :rows="3" />
              <Textarea v-model="bioCounted" :maxlength="120" show-count :rows="2" />
              <Textarea :model-value="'校验失败的描述'" status="error" :rows="2" />
              <Textarea disabled :model-value="'禁用状态'" :rows="2" />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Select 下拉选择（可交互）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Select v-model="dept" :options="deptOptions" placeholder="选择部门" clearable />
              <Text size="sm" color="text-2">当前选择：{{ dept ?? '未选择' }}</Text>
              <Select :model-value="'design'" :options="deptOptions" disabled />
              <Select :options="[]" empty-text="暂无可选项" placeholder="空选项集" />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Checkbox 复选框</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Checkbox v-model="checkedOnce" label="默认选中" />
                <Checkbox v-model="uncheckedBox" label="未选中" />
                <Checkbox :model-value="true" disabled label="禁用选中" />
              </div>
              <Checkbox
                :model-value="parentChecked"
                :indeterminate="parentIndeterminate"
                label="全选（半选演示：点击后清除半选）"
                @update:model-value="onParentChange"
              />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Radio / RadioGroup 单选</CardHeader>
          <CardBody>
            <div class="play-stack">
              <RadioGroup v-model="plan" name="plan">
                <Radio value="basic" label="基础版" />
                <Radio value="pro" label="专业版" />
                <Radio value="team" label="团队版" />
                <Radio value="enterprise" label="旗舰版（禁用）" disabled />
              </RadioGroup>
              <Text size="sm" color="text-2">当前选择：{{ plan ?? '未选择' }}</Text>
              <RadioGroup name="region" :model-value="'cn'" disabled>
                <Radio value="cn" label="整组禁用 · 中国大陆" />
                <Radio value="intl" label="整组禁用 · 国际" />
              </RadioGroup>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Switch 开关</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Switch v-model="wifiOn" label="Wi-Fi（md）" />
              <Switch v-model="btOn" label="蓝牙（sm）" size="sm" />
              <Switch :model-value="true" disabled label="禁用" />
              <Switch :model-value="false" loading label="加载中（拦截切换）" />
            </div>
          </CardBody>
        </Card>
      </div>

      <!-- 40 个新组件演示带：独立 wrap 网格，避免改变上方既有卡片的换行宽度与视觉基线 -->
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>AutoComplete 自动补全（输入过滤 + ↓↑ 选择）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <div class="play-row">
                <label class="play-label" for="play-ac-city">城市</label>
                <AutoComplete
                  id="play-ac-city"
                  v-model="cityText"
                  :options="cityOptions"
                  placeholder="输入城市名"
                  @select="onCitySelect"
                />
              </div>
              <Text size="sm" color="text-2">当前文本：{{ cityText || '空' }} · 最近选中：{{ cityPicked }}</Text>
              <AutoComplete
                v-model="cityText"
                :options="cityOptions"
                disabled
                aria-label="禁用的自动补全"
                placeholder="禁用中，不可输入"
              />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Cascader 级联选择</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <div class="play-row">
                <label class="play-label" for="play-cascader-region">所在地区</label>
                <Cascader
                  id="play-cascader-region"
                  v-model="regionPath"
                  :options="regionOptions"
                  aria-label="所在地区"
                  placeholder="选择省 / 市 / 区"
                />
              </div>
              <Cascader v-model="emptyPath" :options="regionOptions" aria-label="未选态级联" placeholder="未选态（显示占位）" />
              <Text size="sm" color="text-2">当前路径：{{ regionPath ? JSON.stringify(regionPath) : 'null（未选）' }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>DatePicker 日期选择</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <div class="play-row">
                <label class="play-label" for="play-dp-date">发布日期</label>
                <DatePicker id="play-dp-date" v-model="publishDate" placeholder="选择发布日期" clearable />
              </div>
              <div class="play-row">
                <label class="play-label" for="play-dp-datetime">发布时间</label>
                <DatePicker id="play-dp-datetime" v-model="publishAt" type="datetime" aria-label="发布时间（含时刻）" />
              </div>
              <DatePicker :model-value="null" disabled aria-label="禁用的日期选择" placeholder="禁用状态" />
              <Text size="sm" color="text-2">日期：{{ publishDate ?? 'null（未选）' }} · 时间：{{ publishAt ?? 'null（未选）' }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>InputNumber 数字输入（↑↓ 步进）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <InputNumber v-model="ticketCount" :min="1" :max="99" aria-label="门票数量" @step="ticketStepCount++" />
              <InputNumber :model-value="5" disabled aria-label="禁用的数字输入" />
              <Text size="sm" color="text-2">当前值：{{ ticketCount ?? 'null（空）' }} · step 已触发 {{ ticketStepCount }} 次</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>InputOtp 一次性验证码</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <InputOtp v-model="otpCode" aria-label="短信验证码" @complete="otpDone = $event" />
              <InputOtp v-model="otpMasked" :length="4" masked aria-label="掩码验证码" />
              <Text size="sm" color="text-2">
                当前值：{{ otpCode === '' ? '（空）' : otpCode }}
                <span v-if="otpDone !== ''">· 已填满并触发 complete（{{ otpDone }}）</span>
              </Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>ModelSelector 模型选择</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <div class="play-row">
                <label class="play-label" for="play-ms-model">当前会话模型</label>
                <ModelSelector
                  id="play-ms-model"
                  v-model="currentModel"
                  :models="chatModels"
                  aria-label="当前会话模型"
                  @change="onModelChange"
                />
              </div>
              <ModelSelector :model-value="null" :models="chatModels" loading aria-label="加载中的模型选择" />
              <Text size="sm" color="text-2">
                当前模型：{{ currentModel ?? 'null（未选）' }} · 最近 change：{{ lastModel ? `${lastModel.label}（${lastModel.provider}）` : '—' }}
              </Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>PromptInput 提示词输入（Enter 发送）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <PromptInput
                v-model="promptDraft"
                placeholder="给 AI 的提示词，Enter 发送，Shift+Enter 换行"
                @submit="onPromptSubmit"
              />
              <Text size="sm" color="text-2">最近提交：{{ promptHistory[0] ?? '（尚未提交）' }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Rating 评分</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Rating v-model="satisfaction" aria-label="服务满意度" />
              <Rating :model-value="3" readonly aria-label="只读评分" />
              <Text size="sm" color="text-2">当前评分：{{ satisfaction ?? '未评分' }}（←→ 以焦点档步进，Enter / Space 选中）</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Slider 滑块</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Slider v-model="volume" aria-label="音量" :marks="sliderMarks" />
              <Slider :model-value="70" disabled aria-label="锁定的滑块" />
              <Text size="sm" color="text-2">当前值：{{ volume }}（方向键 ±1，PageUp / PageDown ±10，Home / End 直达边界）</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Suggestion 推荐追问</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Suggestion :items="followUps" aria-label="推荐追问" @select="lastFollowUp = $event" />
              <Text size="sm" color="text-2">最近选中：{{ lastFollowUp ? `${lastFollowUp.label}（${lastFollowUp.value}）` : '尚未选择' }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>ToggleGroup 分段切换（单选 / 多选）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <ToggleGroup v-model="boardView" :items="boardViewItems" aria-label="视图切换" />
              <ToggleGroup v-model="notifyChannels" type="multiple" :items="channelItems" aria-label="通知渠道（多选）" />
              <Text size="sm" color="text-2">视图：{{ boardView }} · 渠道：{{ notifyChannels.join('、') || '（未选）' }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>TreeSelect 树选择（单选 / 勾选级联）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <div class="play-row">
                <label class="play-label" for="play-ts-region">归属地区</label>
                <TreeSelect
                  id="play-ts-region"
                  v-model="ownedRegion"
                  :options="regionTree"
                  aria-label="归属地区"
                  placeholder="选择地区"
                />
              </div>
              <TreeSelect
                v-model="grantedPerms"
                :options="permTree"
                checkable
                clearable
                aria-label="勾选权限"
                placeholder="勾选权限"
              />
              <Text size="sm" color="text-2">地区：{{ ownedRegion ?? 'null（未选）' }} · 权限：{{ JSON.stringify(grantedPerms) }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Upload 上传（上限与禁用）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Upload v-model="uploadFiles" multiple :max-count="2" @exceed="onUploadExceed" />
              <Upload v-model="archivedFiles" disabled aria-label="禁用的上传" />
              <Text size="sm" color="text-2">
                已选 {{ uploadFiles.length }} 个：{{ uploadFiles.map((f) => f.name).join('、') || '（空列表）' }} · {{ uploadNote }}
              </Text>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>

    <!-- ──────────────── 数据 Data ──────────────── -->
    <section class="play-section" aria-labelledby="family-data">
      <Heading as="h2" size="2xl" id="family-data">数据 Data</Heading>
      <div class="play-grid">
        <Card class="play-card play-full">
          <CardHeader>Table 表格 · 8 行示例数据</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <div class="play-row">
                <Button variant="secondary" size="sm" @click="tableLoading = !tableLoading">
                  {{ tableLoading ? '停止加载' : '模拟加载' }}
                </Button>
                <Text size="sm" color="text-2">排序事件：{{ lastSort }}</Text>
              </div>
              <Table :columns="userColumns" :data="userRows" row-key="id" :loading="tableLoading" @sort="onUserSort">
                <template #cell-status="{ row }">
                  <Badge :variant="statusVariant[row.status]">{{ row.status }}</Badge>
                </template>
              </Table>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Pagination 分页</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Pagination v-model:page="page" :total="PAGE_TOTAL" :page-size="PAGE_SIZE" />
              <Text size="sm" color="text-2">当前第 {{ page }} / {{ pageCount }} 页</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Progress 进度条</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Progress :value="42" show-label />
              <Progress :value="70" size="sm" show-label />
              <Progress indeterminate />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Skeleton 骨架屏</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Skeleton :lines="3" />
              <div class="play-row">
                <Skeleton variant="circle" :width="40" />
                <Skeleton variant="rect" :width="120" :height="56" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>EmptyState 空态</CardHeader>
          <CardBody>
            <EmptyState title="暂无草稿" description="创建你的第一篇文档，或从模板开始。">
              <template #action>
                <Button variant="primary" size="sm" @click="createDraft">新建文档</Button>
              </template>
            </EmptyState>
          </CardBody>
        </Card>
      </div>

      <!-- 40 个新组件演示带：独立 wrap 网格，避免改变上方既有卡片的换行宽度与视觉基线 -->
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Image 图片（fit / 失败回退 / 预览）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Image :src="playSvg('contain', '#33594A')" alt="contain 填充示例" fit="contain" class="play-frame" />
                <Image :src="playSvg('cover', '#B8863B')" alt="cover 填充示例" fit="cover" class="play-frame" />
                <Image
                  :src="brokenSrc"
                  :fallback="playSvg('已回落备用图', '#3E7C57')"
                  alt="主源失败回退备用图"
                  fit="cover"
                  class="play-frame"
                />
              </div>
              <Image :src="playSvg('点击放大预览', '#5A4A3A')" alt="可预览图片（点击放大）" fit="cover" preview class="play-frame" />
              <Text size="xs" color="text-2">第三枚 src 必然 404：演示主源失败自动回落 fallback。</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Message 会话消息（含流式光标）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Message role="user" name="我" timestamp="14:30">帮我把这周的构建日志汇总成三条要点。</Message>
              <Message role="assistant" name="纸面助手" timestamp="14:31" :streaming="replyStreaming">
                {{ replyText }}<template v-if="!replyStreaming && replyText.length === 0">（点击下方按钮开始生成）</template>
              </Message>
              <Message role="system" timestamp="14:32">会话上下文已达上限，较早的消息已被折叠。</Message>
              <Button size="sm" variant="secondary" :disabled="replyStreaming" @click="startReply">
                {{ replyStreaming ? '生成中…' : '模拟流式回复' }}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>MessageList 消息列表（role=log）</CardHeader>
          <CardBody>
            <MessageList
              class="play-chat"
              :messages="chatMessages"
              :message-key="(message) => message.id"
              aria-label="会话消息"
            >
              <template #default="{ message }">
                <p class="play-bubble" :class="`play-bubble--${message.role}`">{{ message.content }}</p>
              </template>
            </MessageList>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Statistic 数值统计（含倒计时）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Statistic title="总营收" :value="128430.5" :precision="2" prefix="¥" />
                <Statistic title="活跃用户" :value="8642" suffix="人" />
                <Statistic title="转化率" :value="3.6" :precision="1" suffix="%" />
              </div>
              <Statistic title="距离截止" :value="countdownSeconds" countdown suffix="后截止" @finish="countdownFinished = true" />
              <div class="play-row">
                <Button size="sm" variant="secondary" @click="restartCountdown(90)">重置 90 秒</Button>
                <Text size="sm" color="text-2">{{ countdownFinished ? '已归零并发出 finish' : '倒计时进行中…' }}</Text>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>StreamingText 流式文本</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <div class="play-row">
                <Button size="sm" variant="primary" :disabled="streaming" @click="startStream">开始生成</Button>
                <Button size="sm" variant="secondary" :disabled="streaming || !streamed" @click="resetStream">重置</Button>
                <Text size="sm" color="text-2">状态：{{ streaming ? '流式生成中' : streamDone ? '已定格（complete）' : '待开始' }}</Text>
              </div>
              <StreamingText :content="streamed" :streaming="streaming" @complete="streamDone = true" />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Timeline 时间线（pending 幽灵节点）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Timeline :items="buildEvents" :pending="buildPending">
                <template #footer>
                  <Button size="sm" :disabled="buildPending" @click="appendBuildEvent">
                    {{ buildPending ? '日志写入中…' : '模拟下一步' }}
                  </Button>
                </template>
              </Timeline>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>ToolCallCard 工具调用卡片</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <ToolCallCard
                name="web_search"
                :args="{ query: '纸面 设计系统', limit: 5 }"
                result="命中 5 条结果：设计 token 规范、组件契约元数据、文档站规约。"
                status="completed"
                :duration="850"
              />
              <ToolCallCard name="run_sql" :args="{ sql: 'SELECT count(*) FROM orders' }" status="running" />
              <ToolCallCard
                name="send_email"
                :args="{ to: 'ops@example.com', subject: '部署通知' }"
                status="waitingApproval"
              />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Tree 树形控件（点击选中 / 箭头展开）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Tree :data="docTree" @select="lastTreeNode = $event" />
              <Text size="sm" color="text-2">
                最近选中：{{ lastTreeNode ? `key=${lastTreeNode.key}，selected=${lastTreeNode.selected}` : '尚未选中' }}
              </Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>VirtualList 虚拟列表（500 项仅渲染窗口）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <VirtualList
                class="play-feed"
                :items="feedEntries"
                :estimated-item-size="56"
                :get-key="(entry) => entry.id"
                aria-label="遥测记录"
                @visible-range-change="feedRange = $event"
              >
                <template #item="{ item }">
                  <div class="play-feed-item">
                    <span>{{ item.title }}</span>
                    <Text size="sm" color="text-2">{{ item.text }}</Text>
                  </div>
                </template>
              </VirtualList>
              <Text size="sm" color="text-2">当前渲染窗口：{{ feedRange.start }} – {{ feedRange.end }}（滚动列表观察读数变化）</Text>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>

    <!-- ──────────────── 反馈 Feedback ──────────────── -->
    <section class="play-section" aria-labelledby="family-feedback">
      <Heading as="h2" size="2xl" id="family-feedback">反馈 Feedback</Heading>
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Alert 提示条</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Alert severity="info" title="已开启自动保存" />
              <Alert severity="success" title="文档已同步">
                <Text as="p" size="sm">全部 3 位协作者已看到最新版本。</Text>
              </Alert>
              <Alert severity="danger" title="网络连接中断">
                <Text as="p" size="sm">本地改动已缓存，恢复联网后自动上传。</Text>
              </Alert>
              <Alert
                v-if="warningVisible"
                severity="warning"
                title="有 2 位协作者正在编辑"
                closable
                @close="warningVisible = false"
              >
                <Text as="p" size="sm">建议先沟通分工，避免段落冲突。</Text>
              </Alert>
              <Button v-else variant="ghost" size="sm" @click="warningVisible = true">恢复可关闭警告</Button>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Toast 轻提示（程序式触发，ToastHost 全局挂载一次）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Button variant="secondary" size="sm" @click="pushToast('success')">success</Button>
                <Button variant="secondary" size="sm" @click="pushToast('error')">error</Button>
                <Button variant="secondary" size="sm" @click="pushToast('info')">info</Button>
                <Button variant="secondary" size="sm" @click="pushToast('warning')">warning</Button>
              </div>
              <div class="play-row">
                <Button variant="ghost" size="sm" @click="showStickyToast">常驻提示（duration 0）</Button>
                <Button variant="ghost" size="sm" @click="removeStickyToast">立即移除</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <!-- 40 个新组件演示带：独立 wrap 网格，避免改变上方既有卡片的换行宽度与视觉基线 -->
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>AgentStatus 代理状态（八档）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-status-grid">
                <AgentStatus v-for="state in agentStates" :key="state" :status="state" />
              </div>
              <AgentStatus status="toolRunning" label="工具执行中" detail="正在执行 web_search（第 3 / 7 步）" />
              <Text size="xs" color="text-2">运行三档（running / streaming / toolRunning）自带 Spinner；状态语义由文本承载。</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Reasoning 思考过程</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Reasoning
                content="先观察数据分布与样本量：n=320 且两组方差接近，符合独立样本 t 检验的前提；再核对显著性水平 α=0.05；最后补充效应量 Cohen's d，避免只看 p 值下结论。"
                :duration="3.2"
              />
              <div class="play-row">
                <Button size="sm" variant="secondary" @click="reasoningExpanded = !reasoningExpanded">
                  外部切换（{{ reasoningExpanded ? '展开' : '收起' }}）
                </Button>
              </div>
              <Reasoning
                :expanded="reasoningExpanded"
                :duration="12.6"
                content="先把需求拆成三个子任务：数据接入、口径对齐、报表渲染……逐个评估工作量；关键风险在口径对齐——历史数据里有两个字段语义变更过，需要与数据组确认快照版本。"
                @toggle="reasoningExpanded = $event"
              />
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Spinner 加载指示</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Spinner size="sm" label="正在加载" />
                <Spinner label="正在加载" />
                <Spinner size="lg" label="正在加载" />
                <Spinner variant="dots" label="后台任务进行中" />
              </div>
              <div class="play-row">
                <Button size="sm" :disabled="refreshing" @click="refreshData">
                  {{ refreshing ? '刷新中…' : '刷新数据' }}
                </Button>
                <Spinner v-if="refreshing" size="sm" label="正在刷新数据" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>

    <!-- ──────────────── 浮层 Overlay ──────────────── -->
    <section class="play-section" aria-labelledby="family-overlay">
      <Heading as="h2" size="2xl" id="family-overlay">浮层 Overlay</Heading>
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Dialog 对话框（可交互）</CardHeader>
          <CardBody>
            <Button variant="primary" @click="publishOpen = true">打开对话框</Button>
            <Dialog v-model="publishOpen" title="发布确认">
              <Text as="p" color="text-2">确认将《季度设计回顾》发布到团队空间？发布后所有成员可见。</Text>
              <template #footer>
                <Button variant="secondary" @click="publishOpen = false">取消</Button>
                <Button variant="primary" @click="confirmPublish">确认发布</Button>
              </template>
            </Dialog>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>DropdownMenu 下拉菜单（可交互）</CardHeader>
          <CardBody>
            <DropdownMenu :items="docMenuItems" align="start" @select="onDocMenuSelect">
              <Button variant="secondary">
                文档操作
                <template #iconRight><ChevronDownIcon /></template>
              </Button>
            </DropdownMenu>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Tooltip 气泡提示（悬浮 / 键盘聚焦）</CardHeader>
          <CardBody>
            <div class="play-row">
              <Tooltip placement="top">
                <template #content>悬浮或聚焦后出现的纯提示（top）</template>
                <Button variant="secondary">方向 top</Button>
              </Tooltip>
              <Tooltip placement="right">
                <template #content>纯提示不承载交互（right）</template>
                <Button variant="secondary">方向 right</Button>
              </Tooltip>
            </div>
          </CardBody>
        </Card>
      </div>

      <!-- 40 个新组件演示带：独立 wrap 网格，避免改变上方既有卡片的换行宽度与视觉基线 -->
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Drawer 抽屉（打开后焦点圈定）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Button variant="primary" @click="openDrawer">打开抽屉</Button>
              <Drawer v-model="drawerOpen" @close="onDrawerClose">
                <template #header>照片详情</template>
                <p>这是从右侧滑出的详情抽屉。正文超出面板高度时 body 区内部滚动，头部保持可见。</p>
                <p>模态打开期间页面滚动被锁定，焦点圈定在抽屉内，关闭后还原到打开前的元素。</p>
              </Drawer>
              <Text size="sm" color="text-2">最近关闭来源：{{ drawerCloseReason ?? '尚未关闭' }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Artifact 产物画布（代码视图）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Button variant="primary" @click="artifactOpen = true">打开代码产物</Button>
              <Artifact
                v-model="artifactOpen"
                title="sortByTitle 工具函数"
                type="code"
                language="TypeScript"
                @close="onArtifactClose"
              >
                <pre class="play-code"><code>{{ artifactCode }}</code></pre>
              </Artifact>
              <Text size="sm" color="text-2">最近关闭来源：{{ artifactCloseReason ?? '尚未关闭' }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>HoverCard 悬停卡（悬浮 / 键盘聚焦）</CardHeader>
          <CardBody>
            <div class="play-row">
              <HoverCard placement="bottom">
                <template #trigger>
                  <Button variant="secondary">@林晚晴</Button>
                </template>
                <div class="play-profile">
                  <Avatar name="林晚晴" alt="林晚晴的头像" size="lg" />
                  <div>
                    <Text size="md">林晚晴</Text>
                    <Text size="sm" color="text-2">产品设计师 · 纸面设计系统</Text>
                  </div>
                </div>
              </HoverCard>
              <HoverCard>
                <template #trigger>
                  <Button variant="secondary" disabled>@已注销用户</Button>
                </template>
                <Text size="sm">禁用触发元素不派发鼠标与焦点事件，预览卡不会出现。</Text>
              </HoverCard>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Popconfirm 气泡确认</CardHeader>
          <CardBody>
            <div class="play-stack">
              <div class="play-row">
                <Popconfirm
                  title="确定提交这份表单吗？"
                  description="提交后将通知所有协作者。"
                  @confirm="lastConfirm = 'confirm'"
                  @cancel="lastConfirm = 'cancel'"
                >
                  <template #trigger>
                    <Button variant="primary">提交表单</Button>
                  </template>
                </Popconfirm>
                <Popconfirm
                  title="删除这条评论？"
                  confirm-text="删除"
                  cancel-text="再想想"
                  @confirm="lastConfirm = 'confirm（删除）'"
                  @cancel="lastConfirm = 'cancel'"
                >
                  <template #trigger>
                    <Button variant="danger">删除评论</Button>
                  </template>
                </Popconfirm>
              </div>
              <Text size="sm" color="text-2">最近动作：{{ lastConfirm }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Popover 气泡卡片（点击开合）</CardHeader>
          <CardBody>
            <div class="play-row">
              <Popover>
                <template #trigger>
                  <Button variant="secondary">点击展开补充说明</Button>
                </template>
                <Text size="md">补充说明</Text>
                <Text size="sm" color="text-2">气泡卡片可以承载任意内容；点击气泡之外区域或按 Esc 关闭，焦点回到触发元素。</Text>
              </Popover>
              <Popover placement="bottom">
                <template #trigger>
                  <Button variant="secondary">底部弹出</Button>
                </template>
                <Text size="sm">一句话的气泡内容。</Text>
              </Popover>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>

    <!-- ──────────────── 导航 Navigation ──────────────── -->
    <section class="play-section" aria-labelledby="family-navigation">
      <Heading as="h2" size="2xl" id="family-navigation">导航 Navigation</Heading>
      <div class="play-grid">
        <Card class="play-card play-full">
          <CardHeader>Tabs 标签页（键盘 ←→ 可切换）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Tabs v-model:value="activeTab">
                <TabsList>
                  <TabsTrigger value="preview">预览</TabsTrigger>
                  <TabsTrigger value="code">源码</TabsTrigger>
                  <TabsTrigger value="history" disabled>历史（禁用）</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <Text as="p" color="text-2">预览面板：渲染文档的成品视图。</Text>
                </TabsContent>
                <TabsContent value="code">
                  <Text as="p" color="text-2">源码面板：查看并编辑 Markdown 源码。</Text>
                </TabsContent>
              </Tabs>
              <Text size="sm" color="text-2">当前激活：{{ activeTab }}</Text>
            </div>
          </CardBody>
        </Card>
      </div>

      <!-- 40 个新组件演示带：独立 wrap 网格，避免改变上方既有卡片的换行宽度与视觉基线 -->
      <div class="play-grid">
        <Card class="play-card">
          <CardHeader>Breadcrumb 面包屑</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Breadcrumb :items="breadcrumbItems" @item-click="onCrumbClick" />
              <Text size="sm" color="text-2">最近点击：{{ lastCrumb }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>CommandPalette 命令面板（Esc 关闭）</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Button variant="primary" @click="paletteOpen = true">打开命令面板</Button>
              <CommandPalette v-model="paletteOpen" :groups="paletteGroups" :hotkey="false" @select="onCommandSelect" />
              <Text size="sm" color="text-2">最近执行：{{ lastCommand ?? '尚未选择' }}（面板内 ↓ / ↑ 漫游，Enter 执行）</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Menu 菜单（含子菜单与禁用项）</CardHeader>
          <CardBody>
            <div class="play-stack play-full">
              <Menu v-model:model-value="activeMenu" @select="onMenuSelect">
                <MenuItem value="overview">概览</MenuItem>
                <SubMenu value="content" title="内容管理">
                  <MenuItem value="articles">文章</MenuItem>
                  <MenuItem value="media">媒体库</MenuItem>
                </SubMenu>
                <MenuItem value="settings">设置</MenuItem>
                <MenuItem value="trash" disabled>回收站（禁用）</MenuItem>
              </Menu>
              <Text size="sm" color="text-2">当前激活：{{ activeMenu }} · 最近 select：{{ lastMenuSelect }}</Text>
            </div>
          </CardBody>
        </Card>

        <Card class="play-card">
          <CardHeader>Stepper 步骤条</CardHeader>
          <CardBody>
            <div class="play-stack">
              <Stepper v-model="currentStep" clickable :steps="stepList" />
              <div class="play-row">
                <Button size="sm" variant="secondary" :disabled="currentStep === 0" @click="currentStep--">上一步</Button>
                <Button size="sm" variant="primary" :disabled="currentStep === stepList.length - 1" @click="currentStep++">下一步</Button>
                <Text size="sm" color="text-2">当前步：{{ currentStep }}</Text>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>

    <Text as="p" size="xs" color="text-3">纸面 Paper · @ui/components playground —— 仅作演示用途。</Text>

    <!-- 全局轻提示宿主：整个应用挂载一次 -->
    <ToastHost />
  </div>
</template>

<!-- 应用壳布局：仅少量布局辅助，视觉值全部走 --ui-* token -->
<style scoped>
.play {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-7);
  max-inline-size: 72rem;
  margin-inline: auto;
  padding: var(--ui-space-7) var(--ui-space-5) var(--ui-space-8);
  font-family: var(--ui-font-sans);
}
.play-head {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}
.play-section {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-5);
}
.play-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-5);
  align-items: stretch;
}
.play-card {
  flex: 1 1 22rem;
}
.play-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-3);
}
.play-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ui-space-3);
}
.play-full {
  inline-size: 100%;
}
/* ── 新增组件演示的结构辅助类：仅布局与边界，视觉值全部走 --ui-* token ── */
.play-label {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}
.play-page {
  inline-size: 100%;
  block-size: calc(var(--ui-space-8) * 6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  overflow: hidden;
}
.play-sider-nav {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  padding: var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}
.play-pane {
  inline-size: 100%;
  block-size: calc(var(--ui-space-8) * 5);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
}
.play-log-list {
  margin: 0;
  padding: var(--ui-space-3);
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  list-style: none;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}
.play-log-time {
  margin-inline-end: var(--ui-space-2);
  font-variant-numeric: var(--ui-numeric);
  color: var(--ui-text-2);
}
.play-splitter {
  inline-size: 100%;
  block-size: calc(var(--ui-space-8) * 5);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  overflow: hidden;
}
.play-pane-fill {
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: 100%;
  padding: var(--ui-space-3);
}
.play-frame {
  inline-size: 11rem;
  block-size: 7rem;
  border-radius: var(--ui-radius-sm);
}
.play-chat {
  inline-size: 100%;
  block-size: calc(var(--ui-space-8) * 6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
}
.play-bubble {
  margin: 0;
  max-inline-size: 80%;
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-md);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
}
.play-bubble--user {
  margin-inline-start: auto;
  background: var(--ui-accent-soft);
}
.play-bubble--assistant {
  background: var(--ui-surface-muted);
}
.play-feed {
  inline-size: 100%;
  block-size: calc(var(--ui-space-8) * 6);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
}
.play-feed-item {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
  padding: var(--ui-space-2) var(--ui-space-3);
  font-size: var(--ui-text-sm);
}
.play-status-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-3);
}
.play-code {
  margin: 0;
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}
.play-profile {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
}
</style>

<style>
/* 消费方壳样式：铺底色（--ui-bg 来自 paper.css）并去掉 body 默认边距 */
body {
  margin: 0;
  background: var(--ui-bg);
}
</style>
