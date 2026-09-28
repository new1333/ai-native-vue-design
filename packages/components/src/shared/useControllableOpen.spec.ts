/**
 * useControllableOpen spec —— 受控/非受控开合状态机（黑盒经宿主组件接口）：
 * 受控判定、isOpen 跟随、setOpen 同值短路与出口语义。
 */
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useControllableOpen } from './useControllableOpen'
import type { UseControllableOpenReturn } from './useControllableOpen'

/** 宿主组件：把 composable 挂进 setup（getCurrentInstance 需组件上下文）。 */
function mountHost(props: Record<string, unknown> = {}): {
  wrapper: ReturnType<typeof mount>
  api: () => UseControllableOpenReturn
  updates: boolean[]
} {
  let api!: UseControllableOpenReturn
  const updates: boolean[] = []
  const Host = defineComponent({
    props: { modelValue: { type: Boolean, default: false } },
    emits: ['update:modelValue'],
    setup(hostProps, { emit }) {
      api = useControllableOpen({
        modelValue: () => hostProps.modelValue,
        onUpdate: (value) => {
          updates.push(value)
          emit('update:modelValue', value)
        },
      })
      return () => h('div')
    },
  })
  const wrapper = mount(Host, { props })
  return { wrapper, api: () => api, updates }
}

describe('useControllableOpen', () => {
  it('非受控：不传 modelValue 时 isControlled 为 false，isOpen 走内部状态', () => {
    const { api } = mountHost()
    expect(api().isControlled).toBe(false)
    expect(api().isOpen.value).toBe(false)
  })

  it('非受控：setOpen 经 onUpdate 出口并落内部状态', () => {
    const { api, updates } = mountHost()
    api().setOpen(true)
    expect(updates).toEqual([true])
    expect(api().isOpen.value).toBe(true)
  })

  it('非受控：setOpen 同值短路（不重复 onUpdate）', () => {
    const { api, updates } = mountHost()
    api().setOpen(true)
    api().setOpen(true)
    expect(updates).toEqual([true])
  })

  it('受控：直传 :model-value 即受控，isOpen 跟随 prop', async () => {
    const { wrapper, api } = mountHost({ modelValue: true })
    expect(api().isControlled).toBe(true)
    expect(api().isOpen.value).toBe(true)
    await wrapper.setProps({ modelValue: false })
    expect(api().isOpen.value).toBe(false)
  })

  it('受控：setOpen 只 onUpdate，不落内部状态（显隐完全跟随外部）', () => {
    const { api, updates } = mountHost({ modelValue: true })
    api().setOpen(false)
    expect(updates).toEqual([false])
    // 内部状态未变：受控侧仍显示 prop 值，直到外部回写
    expect(api().isOpen.value).toBe(true)
  })
})
