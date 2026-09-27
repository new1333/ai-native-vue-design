// behavior spec：点击选中 / v-model 双向 / 半星档位 / 清除 / 键盘步进与边界 / 悬停预览与 hoverChange / 只读拦截。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Rating from './Rating.vue'
import type { RatingValue } from './Rating.types'

/** Host：v-model 双向的最小组合。 */
function createHost(props: Record<string, unknown> = {}) {
  const value = ref<RatingValue | undefined>(undefined)
  const Host = defineComponent({
    setup() {
      return () =>
        h(Rating, {
          count: 5,
          modelValue: value.value,
          'onUpdate:modelValue': (v: RatingValue | undefined) => {
            value.value = v
          },
          ...props,
        })
    },
  })
  const wrapper = mount(Host, { attachTo: document.body })
  return { wrapper, value }
}

describe('Rating behavior', () => {
  it('点击档位：发出 update:modelValue，载荷为该档值', async () => {
    const wrapper = mount(Rating, { props: { count: 5 } })
    await wrapper.findAll('[role="radio"]')[2]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[3]])
  })

  it('v-model 双向：点击更新父状态；父状态变化回落 aria-checked', async () => {
    const { wrapper, value } = createHost()
    const radios = wrapper.findAll('[role="radio"]')
    await radios[3]?.trigger('click')
    expect(value.value).toBe(4)
    expect(radios[3]?.attributes('aria-checked')).toBe('true')

    value.value = 2
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[role="radio"]')[1]?.attributes('aria-checked')).toBe('true')
    expect(wrapper.findAll('[role="radio"]')[3]?.attributes('aria-checked')).toBe('false')
  })

  it('allowHalf：点击左半档发 0.5 粒度值，右半档发整星值', async () => {
    const wrapper = mount(Rating, { props: { count: 2, allowHalf: true } })
    const radios = wrapper.findAll('[role="radio"]') // [0.5, 1, 1.5, 2]
    await radios[2]?.trigger('click') // 第 2 颗星左半档
    expect(wrapper.emitted('update:modelValue')).toEqual([[1.5]])
    await radios[3]?.trigger('click') // 第 2 颗星右半档
    expect(wrapper.emitted('update:modelValue')).toEqual([[1.5], [2]])
  })

  it('clearable：再次点击当前档位清除为 undefined', async () => {
    const wrapper = mount(Rating, { props: { count: 5, modelValue: 2, clearable: true } })
    await wrapper.findAll('[role="radio"]')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[undefined]])
  })

  it('未开 clearable：再次点击当前档位仍发出该值（不清除）', async () => {
    const wrapper = mount(Rating, { props: { count: 5, modelValue: 2 } })
    await wrapper.findAll('[role="radio"]')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
  })

  it('clearable 响应式：开启前重击不清除，开启后恢复清除路径', async () => {
    const wrapper = mount(Rating, { props: { count: 3, modelValue: 2, clearable: false } })
    await wrapper.findAll('[role="radio"]')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
    await wrapper.setProps({ clearable: true })
    await wrapper.findAll('[role="radio"]')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2], [undefined]])
  })

  it('键盘 ←→ 步进：以焦点档为基准移动并选中，焦点随动', async () => {
    const { wrapper, value } = createHost({ modelValue: 2 })
    const radios = wrapper.findAll('[role="radio"]')
    ;(radios[1]?.element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(radios[1]?.element)

    await radios[1]?.trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe(3)
    expect(document.activeElement).toBe(wrapper.findAll('[role="radio"]')[2]?.element)

    await wrapper.findAll('[role="radio"]')[2]?.trigger('keydown', { key: 'ArrowLeft' })
    expect(value.value).toBe(2)
  })

  it('键盘 ↑ 增 / ↓ 减；allowHalf 时步进粒度为 0.5', async () => {
    const half = mount(Rating, {
      props: { count: 2, allowHalf: true, modelValue: 1 },
      attachTo: document.body,
    })
    const radios = half.findAll('[role="radio"]') // [0.5, 1, 1.5, 2]
    ;(radios[1]?.element as HTMLButtonElement).focus()
    await radios[1]?.trigger('keydown', { key: 'ArrowUp' })
    expect(half.emitted('update:modelValue')).toEqual([[1.5]])
    await half.findAll('[role="radio"]')[2]?.trigger('keydown', { key: 'ArrowDown' })
    expect(half.emitted('update:modelValue')).toEqual([[1.5], [1]])
    half.unmount()
  })

  it('键盘边界：首档再向左 / 末档再向右均为空操作（不发出、不改焦点）', async () => {
    const wrapper = mount(Rating, {
      props: { count: 5, modelValue: 1 },
      attachTo: document.body,
    })
    const radios = wrapper.findAll('[role="radio"]')
    ;(radios[0]?.element as HTMLButtonElement).focus()
    await radios[0]?.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.activeElement).toBe(radios[0]?.element)

    ;(radios[4]?.element as HTMLButtonElement).focus()
    await radios[4]?.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('悬停：发出 hoverChange(档位值) 并做填充预览（不改受控值）', async () => {
    const wrapper = mount(Rating, { props: { count: 3 } })
    await wrapper.findAll('[role="radio"]')[1]?.trigger('mouseenter')
    expect(wrapper.emitted('hoverChange')).toEqual([[2]])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    // 预览：悬停 2 星时前两颗星均为 full
    const icons = wrapper.findAll('.ui-rating__icon')
    expect(icons[0]?.classes()).toContain('ui-rating__icon--full')
    expect(icons[1]?.classes()).toContain('ui-rating__icon--full')
    expect(icons[2]?.classes()).toContain('ui-rating__icon--empty')
  })

  it('悬停离开根容器：hoverChange(undefined) 且预览复位', async () => {
    const wrapper = mount(Rating, { props: { count: 3 } })
    await wrapper.findAll('[role="radio"]')[1]?.trigger('mouseenter')
    await wrapper.trigger('mouseleave')
    expect(wrapper.emitted('hoverChange')).toEqual([[2], [undefined]])
    expect(wrapper.findAll('.ui-rating__icon')[1]?.classes()).toContain('ui-rating__icon--empty')
  })

  it('readonly：点击 / 键盘 / 悬停全部拦截', async () => {
    const wrapper = mount(Rating, { props: { count: 3, readonly: true }, attachTo: document.body })
    const radios = wrapper.findAll('[role="radio"]')
    await radios[2]?.trigger('click')
    ;(radios[1]?.element as HTMLButtonElement).focus()
    await radios[1]?.trigger('keydown', { key: 'ArrowRight' })
    await radios[0]?.trigger('mouseenter')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('hoverChange')).toBeUndefined()
    expect(wrapper.findAll('.ui-rating__icon')[0]?.classes()).not.toContain('ui-rating__icon--full')
    wrapper.unmount()
  })
})
