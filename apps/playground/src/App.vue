<script setup lang="ts">
/**
 * Playground 单页演示 —— @ui/components 全部 25 个组件按产品族分区实例演示。
 *
 * 视觉一律由组件自身样式（var(--ui-*) token）承担；本文件只保留少量
 * 布局辅助类（flex/grid 间距、间距 token），不定义组件视觉。
 */
import { computed, h, ref } from 'vue'
import type { FunctionalComponent } from 'vue'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Dialog,
  Divider,
  DropdownMenu,
  EmptyState,
  Form,
  FormField,
  Heading,
  IconButton,
  Input,
  Pagination,
  Progress,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  ToastHost,
  Tooltip,
  toast,
} from '@ui/components'
import type {
  BadgeVariant,
  DropdownMenuItem,
  FormRules,
  RadioValue,
  SelectOption,
  SelectValue,
  TableColumn,
  TableSortPayload,
  TabsValue,
  ToastId,
  ToastVariant,
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
</script>

<template>
  <main class="play">
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
    </section>

    <Text as="p" size="xs" color="text-3">纸面 Paper · @ui/components playground —— 仅作演示用途。</Text>

    <!-- 全局轻提示宿主：整个应用挂载一次 -->
    <ToastHost />
  </main>
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
</style>

<style>
/* 消费方壳样式：铺底色（--ui-bg 来自 paper.css）并去掉 body 默认边距 */
body {
  margin: 0;
  background: var(--ui-bg);
}
</style>
