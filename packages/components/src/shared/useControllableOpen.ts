/**
 * useControllableOpen —— 受控/非受控开合状态的共享 composable（浮层族公共接口）。
 *
 * 统一 Popover / HoverCard / Popconfirm 等开合类组件的显隐语义：
 *   1. 受控判定：绑定了 v-model（onUpdate:modelValue 监听）或显式直传
 *      :model-value 即为受控，由模板静态决定，setup（挂载）时判定一次；
 *      Vue 对 Boolean 型 prop 有布尔转型（未传时恒为 false 而非 undefined），
 *      须查原始 vnode props 的键存在性，不能凭 props.modelValue 判空；
 *   2. isOpen：受控跟随 modelValue，非受控走内部状态；
 *   3. setOpen：统一开合入口——同值短路（不重复 emit），受控只 emit，
 *      非受控 emit + 内部落位。
 *
 * SSR 安全：不访问任何浏览器 API；getCurrentInstance 只在 setup 内调用。
 */
import { computed, getCurrentInstance, ref } from 'vue'
import type { ComputedRef } from 'vue'

/** useControllableOpen 选项。 */
export interface UseControllableOpenOptions {
  /** 受控值来源（props.modelValue getter；非受控时读取值不被使用）。 */
  modelValue: () => boolean | undefined
  /** update:modelValue 出口（组件把 emit 挂到这里）。 */
  onUpdate: (value: boolean) => void
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

  /**
   * 是否受控：绑定了 v-model（onUpdate:modelValue 监听）或显式直传 :model-value
   * 即为受控。受控与否由模板静态决定，在 setup（挂载）时判定一次即可。
   */
  const initialRawProps = getCurrentInstance()?.vnode.props as Record<string, unknown> | undefined
  const isControlled = Boolean(
    initialRawProps && ('modelValue' in initialRawProps || 'onUpdate:modelValue' in initialRawProps),
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
