/**
 * useInputOtp —— InputOtp 的逐格状态机 composable（headless）。
 *
 * 收口定长分格 / 字符过滤 / 分发 / 回退的全部纯逻辑，不含任何 DOM / 浏览器 API：
 *   1. 生效值（value）：受控 modelValue 按当前 inputMode 过滤后截断到 length（展示与 aria 的唯一事实源）；
 *   2. 格位数组（chars）：value 按位切分，不足 length 的尾部为空格位；
 *   3. 写入（distribute）：从某格起依次落位合法字符（逐格输入与粘贴分发共用），
 *      值实际变化才经 onChange 出口；变化后填满时再发 onComplete；
 *   4. 逐格输入（handleInput）：单字符落位并前进（自动前进仅由组件在客户端事件回调内执行焦点移动）；
 *      多字符（验证码一键填充）从当前格起分发；非法字符被过滤且不产生事件；
 *   5. 粘贴分发（handlePaste）：preventDefault 后读剪贴板文本，过滤并从当前格起分发；
 *   6. 键盘（handleKeydown）：Backspace 删除（空格子回退删除前一格）、Delete 清当前格、
 *      Arrow/Home/End 移动焦点；受理键一律 preventDefault，其余放行。
 *
 * DOM 修正与焦点移动由组件在客户端事件回调内完成：写路径返回 InputOtpWriteResult
 * （每格期望值 + 目标焦点格），焦点移动经 onFocusCell 出口回调。SSR 安全：不访问任何浏览器 API。
 */
import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import {
  INPUT_OTP_KEYS,
  INPUT_OTP_LENGTH_DEFAULT,
  INPUT_OTP_LENGTH_MIN,
} from './InputOtp.constants'
import type { InputOtpInputMode } from './InputOtp.types'

/** 一次写路径（逐格输入 / 粘贴分发 / 键盘删除）的 DOM 修正清单。 */
export interface InputOtpWriteResult {
  /** 写入后每格的期望值（组件据此收敛各格 DOM，父组件无论是否回写都正确）。 */
  cells: string[]
  /** 写入后应聚焦的格位；null = 焦点不动。 */
  focusIndex: number | null
}

/** useInputOtp 选项（各 prop 均为响应式来源）。 */
export interface UseInputOtpOptions {
  /** 受控当前值来源（各格拼接）。 */
  modelValue: MaybeRefOrGetter<string>
  /** 格数来源；非法（非有限 / < 1）时回退默认 6。 */
  length?: MaybeRefOrGetter<number | undefined>
  /** 软键盘类型来源：同时决定字符过滤口径。 */
  inputMode?: MaybeRefOrGetter<InputOtpInputMode | undefined>
  /** 禁用总闸（响应式）：输入 / 粘贴 / 键盘路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean>
  /** 值实际变化的唯一出口（组件把 update:modelValue 挂到这里）。 */
  onChange?: (value: string) => void
  /** 变化后填满 length 位的出口（组件把 complete 挂到这里）；初值满格不触发。 */
  onComplete?: (value: string) => void
  /**
   * 键盘路径需要移动焦点时的出口（组件把「聚焦第 index 格」挂到这里）。
   * 仅在键盘事件回调内被调用（客户端才存在焦点概念）。
   */
  onFocusCell?: (index: number) => void
}

/** useInputOtp 返回值。 */
export interface UseInputOtpReturn {
  /** 规范化格数：非法输入回退默认 6。 */
  effectiveLength: ComputedRef<number>
  /** 当前生效值：受控值按 inputMode 过滤并截断到格数。 */
  value: ComputedRef<string>
  /** 每格展示值：value 按位切分，尾部不足为空串。 */
  chars: ComputedRef<string[]>
  /** 按 inputMode 过滤文本：numeric 只留 0-9，alphanumeric 留 0-9 与英文字母。 */
  sanitize: (text: string) => string
  /** 逐格输入路径（原生 input 事件）：返回 DOM 修正清单；无可落位字符时返回 null。 */
  handleInput: (index: number, event: Event) => InputOtpWriteResult | null
  /** 粘贴分发路径（原生 paste 事件）：preventDefault 后分发；返回 DOM 修正清单或 null。 */
  handlePaste: (index: number, event: ClipboardEvent) => InputOtpWriteResult | null
  /**
   * 键盘状态机（绑定在各格 input 的 keydown）：
   * Backspace / Delete / ArrowLeft / ArrowRight / Home / End 受理并 preventDefault，其余放行。
   */
  handleKeydown: (index: number, event: KeyboardEvent) => void
}

/** InputOtp 逐格状态机（纯逻辑，无 DOM）。 */
export function useInputOtp(options: UseInputOtpOptions): UseInputOtpReturn {
  const disabled = computed(() => toValue(options.disabled) === true)

  const effectiveLength = computed<number>(() => {
    const raw = toValue(options.length)
    return raw !== undefined && Number.isFinite(raw) && raw >= INPUT_OTP_LENGTH_MIN
      ? Math.trunc(raw)
      : INPUT_OTP_LENGTH_DEFAULT
  })

  const effectiveInputMode = computed<InputOtpInputMode>(() =>
    toValue(options.inputMode) === 'alphanumeric' ? 'alphanumeric' : 'numeric',
  )

  /** 按 inputMode 过滤文本：只保留当前口径内的合法字符。 */
  function sanitize(text: string): string {
    const pattern = effectiveInputMode.value === 'numeric' ? /[0-9]/g : /[0-9a-zA-Z]/g
    return (text.match(pattern) ?? []).join('')
  }

  /** 生效值：受控值过滤 + 截断到格数（外部超长值被裁剪，只读路径不回写）。 */
  const value = computed<string>(() => sanitize(toValue(options.modelValue) ?? '').slice(0, effectiveLength.value))

  /** 每格展示值：按位切分，尾部不足为空串（受控单向：父不回写时也以生效值渲染）。 */
  const chars = computed<string[]>(() => cellsOf(value.value))

  /** 把拼接值切分为定长格位数组。 */
  function cellsOf(next: string): string[] {
    return Array.from({ length: effectiveLength.value }, (_, i) => next[i] ?? '')
  }

  /**
   * 值出口收口：与生效值比较，实际变化才回调 onChange；
   * 变化后填满 length 位再回调 onComplete（初值满格不经此路径）。
   */
  function commit(next: string): void {
    if (next === value.value) return
    options.onChange?.(next)
    if (next.length === effectiveLength.value) options.onComplete?.(next)
  }

  /** 从 index 格起依次落位 text 的合法字符（覆盖原值），返回写入后的完整值。 */
  function distribute(index: number, text: string): string {
    const cells = [...chars.value]
    const placeable = sanitize(text).slice(0, Math.max(0, effectiveLength.value - index))
    for (let i = 0; i < placeable.length; i += 1) cells[index + i] = placeable[i]
    return cells.join('')
  }

  /** 清空第 index 格并走值出口（清空空格子时值无变化、不发事件）。 */
  function clearAt(index: number): void {
    const cells = [...chars.value]
    cells[index] = ''
    commit(cells.join(''))
  }

  function handleInput(index: number, event: Event): InputOtpWriteResult | null {
    if (disabled.value) return null
    const target = event.target as HTMLInputElement
    const cleaned = sanitize(target.value)
    const len = effectiveLength.value
    // 非法字符（numeric 下键入字母等）：不产生事件，DOM 回写该格受控值。
    if (cleaned === '') {
      target.value = value.value[index] ?? ''
      return null
    }
    // 单字符：落位当前格；自动前进到下一格（末格停留）。
    if (cleaned.length === 1) {
      const next = distribute(index, cleaned)
      target.value = cleaned
      commit(next)
      return { cells: cellsOf(next), focusIndex: index < len - 1 ? index + 1 : null }
    }
    // 多字符（验证码一键填充进某格）：从当前格起分发，焦点落到最后被填充的格。
    const next = distribute(index, cleaned)
    commit(next)
    const placed = Math.min(cleaned.length, len - index)
    return { cells: cellsOf(next), focusIndex: Math.min(index + placed, len - 1) }
  }

  function handlePaste(index: number, event: ClipboardEvent): InputOtpWriteResult | null {
    if (disabled.value) return null
    event.preventDefault()
    const cleaned = sanitize(event.clipboardData?.getData('text') ?? '')
    if (cleaned === '') return null
    const next = distribute(index, cleaned)
    commit(next)
    const placed = Math.min(cleaned.length, effectiveLength.value - index)
    return {
      cells: cellsOf(next),
      focusIndex: Math.min(index + placed, effectiveLength.value - 1),
    }
  }

  function handleKeydown(index: number, event: KeyboardEvent): void {
    if (disabled.value) return
    if (!(INPUT_OTP_KEYS as readonly string[]).includes(event.key)) return
    event.preventDefault()
    const len = effectiveLength.value
    switch (event.key) {
      case 'Backspace':
        // 本格有值删本格；本格为空则回退删除前一格并把焦点交还它。
        if ((value.value[index] ?? '') !== '') {
          clearAt(index)
        } else if (index > 0) {
          clearAt(index - 1)
          options.onFocusCell?.(index - 1)
        }
        break
      case 'Delete':
        clearAt(index)
        break
      case 'ArrowLeft':
        if (index > 0) options.onFocusCell?.(index - 1)
        break
      case 'ArrowRight':
        if (index < len - 1) options.onFocusCell?.(index + 1)
        break
      case 'Home':
        options.onFocusCell?.(0)
        break
      case 'End':
        options.onFocusCell?.(len - 1)
        break
      default:
        break
    }
  }

  return {
    effectiveLength,
    value,
    chars,
    sanitize,
    handleInput,
    handlePaste,
    handleKeydown,
  }
}
