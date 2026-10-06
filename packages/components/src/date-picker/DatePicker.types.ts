/**
 * date-picker/ —— DatePicker 的公共类型（Props / Emits / Expose / Slots / 单元格）。
 * 与 DatePicker.meta.ts 的 api 字段保持一致。
 */

/** 形态：单选日期 / 日期时间（含时间输入）/ 日期范围（DateRangePicker 形态）。 */
export type DatePickerType = 'date' | 'datetime' | 'range'

/** 范围值：起止两个格式化日期字符串（按 format 序列化）。 */
export type DatePickerRangeValue = [string, string]

/**
 * v-model 绑定值：date/datetime 形态为格式化字符串，range 形态为 [start, end] 元组；
 * null 表示未选（清空后以 null 更新）。值一律按 format 序列化/解析。
 */
export type DatePickerModelValue = string | DatePickerRangeValue | null

/** 面板视图年月（panelChange 载荷；month 为 1–12）。 */
export interface DatePickerPanelView {
  /** 视图年份（完整公历年份）。 */
  year: number
  /** 视图月份（1–12）。 */
  month: number
}

/** 禁用判定：返回 true 的日期不可被选中（面板中渲染为 aria-disabled）。 */
export type DatePickerDisabledDate = (date: Date) => boolean

/** 月网格单元格（42 格 = 6 周 × 7 列，周一首列，行优先）。 */
export interface DatePickerCell {
  /** 网格扁平下标（0–41）。 */
  index: number
  /** 单元格日期（当日 00:00，本地时区）。 */
  date: Date
  /** 稳定 key（当日 00:00 的时间戳）。 */
  key: number
  /** 日号（用于显示）。 */
  day: number
  /** 是否属于当前视图月份（上下月邻接日为 false）。 */
  inMonth: boolean
  /** 是否禁用（min/max/disabledDate 判定）。 */
  disabled: boolean
  /** 是否今天。 */
  today: boolean
  /** 可读名称（含年月日，供 aria-label）。 */
  label: string
}

/** DatePicker 的 Props。 */
export interface DatePickerProps {
  /** v-model 绑定值；受控，值按 format 序列化，null 表示未选。 */
  modelValue?: DatePickerModelValue
  /** 形态：date 单选日期 / datetime 日期时间 / range 日期范围（DateRangePicker）。 */
  type?: DatePickerType
  /**
   * 序列化格式（token：YYYY/MM/DD/HH/mm/ss，其余字符原样）。
   * 缺省按形态取 YYYY-MM-DD（date/range）或 YYYY-MM-DD HH:mm（datetime）。
   */
  format?: string
  /** 可选下界（按 format 解析；该日起可选，含当日）。 */
  min?: string
  /** 可选上界（按 format 解析；该日及以前可选，含当日）。 */
  max?: string
  /** 禁用判定：返回 true 的日期不可被选中（与 min/max 取并集）。 */
  disabledDate?: DatePickerDisabledDate
  /**
   * v-model:open 受控开合：传入即完全受控（open 跟随外部值，内部交互——点击触发
   * 器/选中日期/Esc/外点/blur——只发出 update:open）；未传则非受控内部自管理。
   */
  open?: boolean
  /** 占位文本（未选时显示在触发器内；不替代 label）。 */
  placeholder?: string
  /** 禁用：触发器原生 disabled（移出 Tab 序）+ 拦截开合/键盘 + 不渲染清空按钮。 */
  disabled?: boolean
  /** 加载中：触发器 aria-busy="true"、拦截开合（供异步数据源/受限日历就绪前的占位）。 */
  loading?: boolean
  /** 可清空：有已选值且非禁用/加载时渲染清空按钮（aria-label="清空"）。 */
  clearable?: boolean
}

/** DatePicker 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface DatePickerEmits {
  /**
   * v-model 更新：date/datetime 载荷为格式化字符串，range 载荷为 [start, end] 元组
   * （起止按升序归位），清空时载荷为 null。
   */
  'update:modelValue': [value: DatePickerModelValue]
  /** v-model:open 更新：受控与非受控均上抛（受控时组件只派发、不自行开合）。 */
  'update:open': [value: boolean]
  /** 面板视图年月变化（翻页按钮 / PageUp / PageDown），载荷为 { year, month }（month 1–12）。 */
  panelChange: [view: DatePickerPanelView]
  /** 点击清空按钮后触发（值已随 update:modelValue 置 null，随后焦点交还触发器）。 */
  clear: []
}

/** trigger 具名插槽的作用域参数。 */
export interface DatePickerTriggerSlotProps {
  /** 当前 v-model 值（range 为 [start, end] 元组；未选为 null）。 */
  value: DatePickerModelValue
  /** 触发器显示文案（已选值为格式化字符串/范围串，未选为占位文案）。 */
  display: string
  /** 面板是否打开。 */
  open: boolean
  /** 是否处于禁用或加载态（不可交互）。 */
  disabled: boolean
}

/** panel-footer 具名插槽的作用域参数。 */
export interface DatePickerPanelFooterSlotProps {
  /** 当前面板视图年月（month 为 1–12）。 */
  view: DatePickerPanelView
  /** 组件整体是否禁用。 */
  disabled: boolean
}

/** DatePicker 对外暴露的实例方法。 */
export interface DatePickerExpose {
  /** 聚焦触发器按钮（仅客户端有意义）。 */
  focus: (options?: FocusOptions) => void
  /** 移除焦点。 */
  blur: () => void
}
