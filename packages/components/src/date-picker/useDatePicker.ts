/**
 * useDatePicker —— DatePicker 的状态机 composable（headless）。
 *
 * 收口日期选择器的全部纯逻辑，不含任何 DOM / 浏览器 API：
 *   1. 序列化：formatDate / parseDate（严格解析，回填格式化结果须与输入一致，
 *      拒绝 2026-13-01、2026-02-30 与未补零输入）；
 *   2. 开合状态（open）与月视图（viewYear/viewMonth，month 1–12）；开合受控模型
 *      收口于 shared useControllableOpen（propName 'open'）：传入 open prop 即受控
 *      ——open 完全跟随外部值，内部开合路径只经 onOpenChange 上抛；缺省非受控内部
 *      自管理（onOpenChange 受控与非受控均上抛，语义同 popover/）；受控外部翻转
 *      open（或初始即开）不经 openPanel，由开合沿 watch 补齐视图/高亮落位；
 *   3. 月网格：42 格（6 周 × 7 列，周一首列），逐格判定 disabled（min/max/disabledDate
 *      并集）、today、邻接月（inMonth）；
 *   4. 选中出口：date/datetime 直接发值（datetime 合并时间输入），range 两段式
 *      （首击落起点、再击落终点，先于起点则重置起点），完成才发 [start, end]；
 *   5. roving 键盘：←/→/↑/↓（跳过禁用格、在可选格两端夹住）、Home/End 行首尾、
 *      PageUp/PageDown 翻月（发 panelChange）、Enter/Space 选中。
 *
 * SSR 安全：不访问任何浏览器 API；KeyboardEvent 仅读取 key 并调用 preventDefault。
 */
import { computed, ref, toValue, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { useControllableOpen } from '../shared/useControllableOpen'
import {
  DATE_PICKER_FORMAT_DEFAULTS,
  DATE_PICKER_GRID_CELLS,
  DATE_PICKER_GRID_COLUMNS,
  DATE_PICKER_GRID_KEYS,
} from './DatePicker.constants'
import type {
  DatePickerCell,
  DatePickerDisabledDate,
  DatePickerModelValue,
  DatePickerPanelView,
  DatePickerRangeValue,
  DatePickerType,
} from './DatePicker.types'

/** 格式 token（大小写敏感：MM 为月、mm 为分）。 */
const FORMAT_TOKEN_PATTERN = /YYYY|MM|DD|HH|mm|ss/g

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/** 按格式 token 序列化日期（YYYY/MM/DD/HH/mm/ss，其余字符原样）。 */
export function formatDate(date: Date, format: string): string {
  return format.replace(FORMAT_TOKEN_PATTERN, (token: string) => {
    switch (token) {
      case 'YYYY':
        return String(date.getFullYear())
      case 'MM':
        return pad2(date.getMonth() + 1)
      case 'DD':
        return pad2(date.getDate())
      case 'HH':
        return pad2(date.getHours())
      case 'mm':
        return pad2(date.getMinutes())
      case 'ss':
        return pad2(date.getSeconds())
      default:
        return token
    }
  })
}

/**
 * 按 format 解析日期字符串（严格模式）：解析失败、字段越界（Date 归位后回填
 * 格式化结果与输入不一致）或未按格式补零一律返回 null。
 */
export function parseDate(value: string, format: string): Date | null {
  const tokens: string[] = []
  const source = format
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(FORMAT_TOKEN_PATTERN, (token: string) => {
      tokens.push(token)
      return '(\\d{1,4})'
    })
  const matched = new RegExp(`^${source}$`).exec(value.trim())
  if (matched === null) return null
  const fields: Partial<Record<string, number>> = {}
  tokens.forEach((token, index) => {
    fields[token] = Number(matched[index + 1])
  })
  const date = new Date(
    fields.YYYY ?? 0,
    (fields.MM ?? 1) - 1,
    fields.DD ?? 1,
    fields.HH ?? 0,
    fields.mm ?? 0,
    fields.ss ?? 0,
  )
  if (Number.isNaN(date.getTime())) return null
  if (formatDate(date, format) !== value.trim()) return null
  return date
}

/** 归一到当日 00:00（本地时区；供日粒度比较）。 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** 同一自然日判定。 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** 解析时间输入（HH:mm，支持未补零小时；越界返回 null）。 */
export function parseTimeInput(text: string): { hours: number; minutes: number } | null {
  const matched = /^(\d{1,2}):(\d{1,2})$/.exec(text.trim())
  if (matched === null) return null
  const hours = Number(matched[1])
  const minutes = Number(matched[2])
  if (hours > 23 || minutes > 59) return null
  return { hours, minutes }
}

/** useDatePicker 选项。 */
export interface UseDatePickerOptions {
  /** 形态（响应式）。 */
  type: MaybeRefOrGetter<DatePickerType>
  /** 受控当前值来源（响应式；null = 未选）。 */
  modelValue: MaybeRefOrGetter<DatePickerModelValue>
  /** 序列化格式（响应式；缺省按形态取默认格式）。 */
  format: MaybeRefOrGetter<string | undefined>
  /** 可选下界（响应式，按 format 解析）。 */
  min: MaybeRefOrGetter<string | undefined>
  /** 可选上界（响应式，按 format 解析）。 */
  max: MaybeRefOrGetter<string | undefined>
  /**
   * 禁用判定来源（响应式）：须传 ref 或 getter（返回判定函数），与 options/modelValue
   * 等选项同构；不可传裸函数——toValue 会把它当作 getter 调用。
   */
  disabledDate: MaybeRefOrGetter<DatePickerDisabledDate | undefined>
  /** 禁用总闸（响应式）：一切开合/导航/选中路径据此拦截。 */
  disabled: MaybeRefOrGetter<boolean>
  /** 加载总闸（响应式）：拦截开合。 */
  loading: MaybeRefOrGetter<boolean>
  /**
   * 受控 open 来源（响应式）：传入 open prop 的 getter 即参与受控判定——受控探测
   * 由 shared useControllableOpen 按原始 vnode props 的 open / onUpdate:open 键
   * 存在性完成（Boolean prop 布尔转型不能凭值判空），受控时 open 完全跟随该值。
   */
  open?: MaybeRefOrGetter<boolean | undefined>
  /** open 变更出口（组件把 update:open 的 emit 挂到这里；受控与非受控均上抛）。 */
  onOpenChange?: (value: boolean) => void
  /** 完成选择时的唯一出口回调（组件把 update:modelValue 的 emit 挂到这里）。 */
  onSelect: (value: DatePickerModelValue) => void
  /** 视图年月变化出口回调（组件把 panelChange 的 emit 挂到这里）。 */
  onPanelChange: (view: DatePickerPanelView) => void
  /** 面板关闭后的回调（组件用于把焦点交还触发器）。 */
  onClose?: () => void
}

/** useDatePicker 返回值。 */
export interface UseDatePickerReturn {
  /** 面板是否打开（受控 = 外部 open 来源；非受控 = 内部状态）。 */
  open: ComputedRef<boolean>
  /** 视图年份。 */
  viewYear: Ref<number>
  /** 视图月份（1–12）。 */
  viewMonth: Ref<number>
  /** 当前 roving 高亮格下标（-1 = 无高亮；关闭时复位）。 */
  activeIndex: Ref<number>
  /** 时间输入值（HH:mm；datetime 形态专用，'' = 未设置，选中时按 00:00 合并）。 */
  timeValue: Ref<string>
  /** 实际生效的序列化格式（format prop 缺省时按形态取默认）。 */
  resolvedFormat: ComputedRef<string>
  /** 月网格 42 格（扁平，周一首列、行优先）。 */
  cells: ComputedRef<DatePickerCell[]>
  /** 月网格按周分行（6 行 × 7 格）。 */
  weeks: ComputedRef<DatePickerCell[][]>
  /** 面板视图年月（panelChange 载荷同构）。 */
  panelView: ComputedRef<DatePickerPanelView>
  /** 单选态的已选日期（当日 00:00；range 形态为 null）。 */
  selectedDate: ComputedRef<Date | null>
  /** 范围态的生效起止（range 草稿优先于已选值；当日 00:00 粒度）。 */
  activeRange: ComputedRef<[Date, Date] | null>
  /** 打开面板：视图落位到已选值（否则今天），高亮落位到已选格/今天/首个可选格。 */
  openPanel: () => void
  /** 关闭面板并复位高亮/草稿/时间输入。 */
  closePanel: () => void
  /** 开 <-> 关切换（disabled/loading 拦截）。 */
  togglePanel: () => void
  /** roving 高亮移动 delta 格（±1/±7；跳过禁用格，在可选格两端夹住）。 */
  moveActive: (delta: number) => void
  /** roving 高亮跳到所在行首/行尾的可选格。 */
  toRowEdge: (edge: 'first' | 'last') => void
  /** 翻月（step = ±1）并发出 onPanelChange。 */
  changeMonth: (step: 1 | -1) => void
  /** 选中指定下标的格（禁用格忽略）：date/datetime 发值并关闭；range 走两段式。 */
  selectCell: (index: number) => void
  /** 设置时间输入（HH:mm；datetime 形态且有已选值时同步发值）。 */
  setTime: (text: string) => void
  /** 判定某日是否禁用（min/max/disabledDate 并集；日粒度）。 */
  isDisabledDay: (date: Date) => boolean
  /** 单选态判定。 */
  isSelectedDate: (date: Date) => boolean
  /** 范围态判定（起点/终点/之间）。 */
  isRangeStart: (date: Date) => boolean
  isRangeEnd: (date: Date) => boolean
  isInRange: (date: Date) => boolean
  /** 月网格键盘状态机（绑定在网格容器 keydown）：受理键一律 preventDefault。 */
  handleGridKeydown: (event: KeyboardEvent) => void
}

/** DatePicker 开合/视图/选中/键盘状态机（纯逻辑，无 DOM）。 */
export function useDatePicker(options: UseDatePickerOptions): UseDatePickerReturn {
  const type = computed(() => toValue(options.type))
  const disabled = computed(() => toValue(options.disabled) === true)
  const loading = computed(() => toValue(options.loading) === true)
  const resolvedFormat = computed(
    () => toValue(options.format) ?? DATE_PICKER_FORMAT_DEFAULTS[type.value],
  )

  /* ── 开合：受控（open / onUpdate:open 键存在）/非受控收口于 shared
     useControllableOpen；受控只上抛 onOpenChange，非受控上抛 + 内部落位 ── */
  const { isOpen: open, setOpen } = useControllableOpen({
    propName: 'open',
    modelValue: () => toValue(options.open),
    onUpdate: (value) => options.onOpenChange?.(value),
  })

  const activeIndex = ref(-1)
  const timeValue = ref('')
  const rangeDraft = ref<[Date, Date] | null>(null)

  /** 初始视图基准：已选值优先，否则今天（仅创建时取一次；打开时会重新落位）。 */
  const initialBase = parseValue(toValue(options.modelValue))[0] ?? new Date()
  const viewYear = ref(initialBase.getFullYear())
  const viewMonth = ref(initialBase.getMonth() + 1)

  /** 解析受控值为日期数组：date/datetime 为 0/1 个，range 为 0/2 个。 */
  function parseValue(value: DatePickerModelValue): Date[] {
    if (value === null) return []
    const format = resolvedFormat.value
    if (type.value === 'range') {
      if (!Array.isArray(value)) return []
      const start = value[0] !== undefined ? parseDate(value[0], format) : null
      const end = value[1] !== undefined ? parseDate(value[1], format) : null
      return start !== null && end !== null ? [start, end] : []
    }
    if (typeof value !== 'string') return []
    const parsed = parseDate(value, format)
    return parsed !== null ? [parsed] : []
  }

  const minDate = computed<Date | null>(() => {
    const value = toValue(options.min)
    return typeof value === 'string' ? parseDate(value, resolvedFormat.value) : null
  })
  const maxDate = computed<Date | null>(() => {
    const value = toValue(options.max)
    return typeof value === 'string' ? parseDate(value, resolvedFormat.value) : null
  })

  /** 禁用判定：min/max（含端点日）与 disabledDate 取并集。 */
  function isDisabledDay(date: Date): boolean {
    const min = minDate.value
    const max = maxDate.value
    if (min !== null && date.getTime() < startOfDay(min).getTime()) return true
    if (max !== null && date.getTime() > startOfDay(max).getTime()) return true
    const predicate = toValue(options.disabledDate)
    return predicate?.(date) === true
  }

  const cells = computed<DatePickerCell[]>(() => {
    const year = viewYear.value
    const monthIndex = viewMonth.value - 1
    const first = new Date(year, monthIndex, 1)
    // 周一首列：getDay() 周日=0 → 偏移 (getDay()+6)%7
    const offset = (first.getDay() + 6) % DATE_PICKER_GRID_COLUMNS
    const gridStart = new Date(year, monthIndex, 1 - offset)
    const today = new Date()
    const list: DatePickerCell[] = []
    for (let index = 0; index < DATE_PICKER_GRID_CELLS; index += 1) {
      const date = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + index,
      )
      list.push({
        index,
        date,
        key: date.getTime(),
        day: date.getDate(),
        inMonth: date.getMonth() === monthIndex,
        disabled: isDisabledDay(date),
        today: isSameDay(date, today),
        label: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
      })
    }
    return list
  })

  const weeks = computed<DatePickerCell[][]>(() => {
    const rows: DatePickerCell[][] = []
    for (let start = 0; start < cells.value.length; start += DATE_PICKER_GRID_COLUMNS) {
      rows.push(cells.value.slice(start, start + DATE_PICKER_GRID_COLUMNS))
    }
    return rows
  })

  const panelView = computed<DatePickerPanelView>(() => ({
    year: viewYear.value,
    month: viewMonth.value,
  }))

  const selectedDate = computed<Date | null>(() => {
    if (type.value === 'range') return null
    const parsed = parseValue(toValue(options.modelValue))
    return parsed.length === 1 ? startOfDay(parsed[0]) : null
  })

  const activeRange = computed<[Date, Date] | null>(() => {
    if (type.value !== 'range') return null
    const draft = rangeDraft.value
    if (draft !== null) return [startOfDay(draft[0]), startOfDay(draft[1])]
    const parsed = parseValue(toValue(options.modelValue))
    return parsed.length === 2 ? [startOfDay(parsed[0]), startOfDay(parsed[1])] : null
  })

  function isSelectedDate(date: Date): boolean {
    const selected = selectedDate.value
    return selected !== null && isSameDay(date, selected)
  }

  function isRangeStart(date: Date): boolean {
    const range = activeRange.value
    return range !== null && isSameDay(date, range[0])
  }

  function isRangeEnd(date: Date): boolean {
    const range = activeRange.value
    return range !== null && isSameDay(date, range[1])
  }

  function isInRange(date: Date): boolean {
    const range = activeRange.value
    if (range === null) return false
    const time = date.getTime()
    return time > range[0].getTime() && time < range[1].getTime()
  }

  function firstEnabledIndex(): number {
    return cells.value.findIndex((cell) => !cell.disabled)
  }

  function lastEnabledIndex(): number {
    for (let index = cells.value.length - 1; index >= 0; index -= 1) {
      if (!cells.value[index].disabled) return index
    }
    return -1
  }

  /** 在网格内定位某日的下标（禁用格不算命中）。 */
  function locateCell(date: Date | null): number | null {
    if (date === null) return null
    const index = cells.value.findIndex((cell) => isSameDay(cell.date, date))
    if (index === -1 || cells.value[index].disabled) return null
    return index
  }

  /** 打开落位：视图落位到已选值（否则今天），roving 高亮落到已选格/今天/首个可选格。 */
  function locateOnOpen(): void {
    rangeDraft.value = null
    const parsed = parseValue(toValue(options.modelValue))
    const base = parsed[0] ?? new Date()
    viewYear.value = base.getFullYear()
    viewMonth.value = base.getMonth() + 1
    timeValue.value =
      type.value === 'datetime' && parsed.length > 0
        ? `${pad2(parsed[0].getHours())}:${pad2(parsed[0].getMinutes())}`
        : ''
    const located = locateCell(parsed[0] ?? null) ?? locateCell(new Date())
    activeIndex.value = located ?? (firstEnabledIndex() === -1 ? -1 : firstEnabledIndex())
  }

  function openPanel(): void {
    if (disabled.value || loading.value || open.value) return
    setOpen(true)
    locateOnOpen()
  }

  function closePanel(): void {
    if (!open.value) return
    setOpen(false)
    activeIndex.value = -1
    rangeDraft.value = null
    timeValue.value = ''
    options.onClose?.()
  }

  function togglePanel(): void {
    if (open.value) closePanel()
    else openPanel()
  }

  function moveActive(delta: number): void {
    const list = cells.value
    if (list.length === 0) return
    let next = activeIndex.value
    next = next < 0 ? (delta >= 0 ? 0 : list.length - 1) : next + delta
    next = Math.min(Math.max(next, 0), list.length - 1)
    const step = delta >= 0 ? 1 : -1
    while (next >= 0 && next < list.length && list[next].disabled) next += step
    if (next < 0 || next >= list.length) {
      const fallback = delta >= 0 ? firstEnabledIndex() : lastEnabledIndex()
      if (fallback === -1) return
      next = fallback
    }
    activeIndex.value = next
  }

  function toRowEdge(edge: 'first' | 'last'): void {
    const list = cells.value
    if (list.length === 0) return
    const lastRow = Math.floor((list.length - 1) / DATE_PICKER_GRID_COLUMNS)
    const row = Math.min(Math.max(Math.floor(activeIndex.value / DATE_PICKER_GRID_COLUMNS), 0), lastRow)
    const start = row * DATE_PICKER_GRID_COLUMNS
    const end = Math.min(start + DATE_PICKER_GRID_COLUMNS - 1, list.length - 1)
    const step = edge === 'first' ? 1 : -1
    for (let index = edge === 'first' ? start : end; index >= start && index <= end; index += step) {
      if (!list[index].disabled) {
        activeIndex.value = index
        return
      }
    }
  }

  function changeMonth(step: 1 | -1): void {
    const next = new Date(viewYear.value, viewMonth.value - 1 + step, 1)
    viewYear.value = next.getFullYear()
    viewMonth.value = next.getMonth() + 1
    activeIndex.value = firstEnabledIndex()
    options.onPanelChange({ year: viewYear.value, month: viewMonth.value })
  }

  function selectCell(index: number): void {
    const cell = cells.value[index]
    if (cell === undefined || cell.disabled) return
    if (type.value === 'range') {
      selectRangeDay(cell.date)
      return
    }
    const selected = new Date(cell.date)
    if (type.value === 'datetime') {
      const time = parseTimeInput(timeValue.value)
      selected.setHours(time?.hours ?? 0, time?.minutes ?? 0, 0, 0)
    }
    options.onSelect(formatDate(selected, resolvedFormat.value))
    closePanel()
  }

  /** range 两段式：首击落起点（不关面板），再击落终点并发值；先于起点则重置起点。 */
  function selectRangeDay(date: Date): void {
    const day = startOfDay(date)
    if (rangeDraft.value === null) {
      rangeDraft.value = [day, day]
      const located = locateCell(day)
      if (located !== null) activeIndex.value = located
      return
    }
    const start = rangeDraft.value[0]
    if (day.getTime() < start.getTime()) {
      rangeDraft.value = [day, day]
      const located = locateCell(day)
      if (located !== null) activeIndex.value = located
      return
    }
    const payload: DatePickerRangeValue = [
      formatDate(start, resolvedFormat.value),
      formatDate(day, resolvedFormat.value),
    ]
    rangeDraft.value = null
    options.onSelect(payload)
    closePanel()
  }

  function setTime(text: string): void {
    if (type.value !== 'datetime') return
    const time = parseTimeInput(text)
    timeValue.value = time === null ? '' : `${pad2(time.hours)}:${pad2(time.minutes)}`
    if (time === null) return
    const parsed = parseValue(toValue(options.modelValue))
    if (parsed.length === 0) return
    const updated = new Date(parsed[0])
    updated.setHours(time.hours, time.minutes, 0, 0)
    options.onSelect(formatDate(updated, resolvedFormat.value))
  }

  // 开合沿的落位同步：受控外部打开（open false→true，未经 openPanel）时同样落位
  // 视图/roving 高亮（保证焦点有落点）；外部关闭复位关闭态字段（与 closePanel 对齐，
  // 不触发 onClose 焦点回交——那是内部关闭路径的语义）。内部路径（openPanel/
  // closePanel）自行落位后此处空转（纯逻辑，SSR 安全）。
  watch(
    open,
    (isOpen) => {
      if (isOpen) {
        if (activeIndex.value < 0) locateOnOpen()
      } else {
        activeIndex.value = -1
        rangeDraft.value = null
        timeValue.value = ''
      }
    },
    { immediate: true },
  )

  function handleGridKeydown(event: KeyboardEvent): void {
    if (!DATE_PICKER_GRID_KEYS.includes(event.key)) return
    event.preventDefault()
    switch (event.key) {
      case 'ArrowLeft':
        moveActive(-1)
        break
      case 'ArrowRight':
        moveActive(1)
        break
      case 'ArrowUp':
        moveActive(-DATE_PICKER_GRID_COLUMNS)
        break
      case 'ArrowDown':
        moveActive(DATE_PICKER_GRID_COLUMNS)
        break
      case 'Home':
        toRowEdge('first')
        break
      case 'End':
        toRowEdge('last')
        break
      case 'PageUp':
        changeMonth(-1)
        break
      case 'PageDown':
        changeMonth(1)
        break
      case 'Enter':
      case ' ':
        selectCell(activeIndex.value)
        break
      default:
        break
    }
  }

  return {
    open,
    viewYear,
    viewMonth,
    activeIndex,
    timeValue,
    resolvedFormat,
    cells,
    weeks,
    panelView,
    selectedDate,
    activeRange,
    openPanel,
    closePanel,
    togglePanel,
    moveActive,
    toRowEdge,
    changeMonth,
    selectCell,
    setTime,
    isDisabledDay,
    isSelectedDate,
    isRangeStart,
    isRangeEnd,
    isInRange,
    handleGridKeydown,
  }
}
