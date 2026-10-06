/**
 * useControllableOpen —— 受控/非受控开合状态的共享 composable（浮层族公共接口）。
 *
 * 统一 Popover / HoverCard / Popconfirm（v-model:modelValue 语义）与下拉家族
 * select / autocomplete / cascader / tree-select / date-picker / model-selector
 * （v-model:open 语义）的显隐收口：
 *   1. 受控判定：绑定了 v-model（onUpdate:* 监听）或显式直传同名 prop 即为受控，
 *      由模板静态决定，setup（挂载）时判定一次；Vue 对 Boolean 型 prop 有布尔
 *      转型（未传时恒为 false 而非 undefined），须查原始 vnode props 的键存在性，
 *      不能凭 prop 值判空；探测的 v-model 名由 propName 指定（默认 'modelValue'，
 *      下拉家族传 'open' → 按 open / onUpdate:open 键存在性探测）；
 *   2. isOpen：受控跟随受控来源（modelValue 选项 getter），非受控走内部状态；
 *   3. setOpen：统一开合入口——同值短路（不重复 emit），受控只 onUpdate，
 *      非受控 onUpdate + 内部落位。
 *
 * SSR 安全：不访问任何浏览器 API；getCurrentInstance 只在 setup 内调用。
 */
import { computed, getCurrentInstance, ref } from 'vue'
import type { ComputedRef } from 'vue'

/** useControllableOpen 选项。 */
export interface UseControllableOpenOptions {
  /** 受控值来源（props.modelValue / props.open 等 getter；非受控时读取值不被使用）。 */
  modelValue: () => boolean | undefined
  /** 更新出口（组件把 update:modelValue / update:open 的 emit 挂到这里）。 */
  onUpdate: (value: boolean) => void
  /**
   * 受控探测的 v-model 名（默认 'modelValue'）：受控与否按「原始 vnode props 中
   * 存在 <propName> 或 onUpdate:<propName> 键」判定。下拉家族传 'open'
   * （v-model:open / :open / @update:open 任一即受控）；值与出口仍经
   * modelValue / onUpdate 注入，仅探测键名随之变化。
   */
  propName?: string
}

/** useControllableOpen 返回值。 */
export interface UseControllableOpenReturn {
  /** 是否受控（setup 时判定一次）。 */
  isControlled: boolean
  /** 当前是否打开：受控跟随 modelValue，非受控为内部状态。 */
  isOpen: ComputedRef<boolean>
  /** 统一开合入口：同值短路；受控只 onUpdate，非受控 onUpdate + 内部落位。 */
  setOpen: (value: boolean) => void
}

/** 受控/非受控开合状态 composable（仅在 setup 中调用）。 */
export function useControllableOpen(options: UseControllableOpenOptions): UseControllableOpenReturn {
  const internalOpen = ref(false)
  const propName = options.propName ?? 'modelValue'

  /**
   * 是否受控：绑定了 v-model（onUpdate:<propName> 监听）或显式直传同名 prop 即为
   * 受控（propName 缺省 'modelValue'，下拉家族传 'open'）。受控与否由模板静态决定，
   * 在 setup（挂载）时判定一次即可。
   */
  const initialRawProps = getCurrentInstance()?.vnode.props as Record<string, unknown> | undefined
  const isControlled = Boolean(
    initialRawProps && (propName in initialRawProps || `onUpdate:${propName}` in initialRawProps),
  )

  /** 当前是否打开。 */
  const isOpen = computed(() => (isControlled ? Boolean(options.modelValue()) : internalOpen.value))

  /** 统一开合入口：受控只 onUpdate，非受控 onUpdate + 内部落位。 */
  function setOpen(value: boolean): void {
    if (isOpen.value === value) return
    options.onUpdate(value)
    if (!isControlled) internalOpen.value = value
  }

  return { isControlled, isOpen, setOpen }
}
