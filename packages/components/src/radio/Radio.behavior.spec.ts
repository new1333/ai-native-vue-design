// behavior spec：change→组受控更新 / v-model 双向 / 组与单项禁用拦截 / 选中响应式。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Radio from './Radio.vue'
import RadioGroup from './RadioGroup.vue'

/** Host：v-model 双向 + 两枚 Radio 的最小组合。 */
function createHost(props: Record<string, unknown> = {}) {
  const value = ref<string | number | undefined>(undefined)
  const Host = defineComponent({
    setup() {
      return () =>
        h(
          RadioGroup,
          {
            name: 'plan',
            modelValue: value.value,
            'onUpdate:modelValue': (v: string | number) => {
              value.value = v
            },
            ...props,
          },
          { default: () => [h(Radio, { key: 'a', value: 'a', label: '甲' }), h(Radio, { key: 'b', value: 'b', label: '乙' })] },
        )
    },
  })
  const wrapper = mount(Host)
  return { wrapper, value }
}

describe('Radio behavior', () => {
  it('点击选项：原生 change 驱动组发出 update:modelValue，载荷为该 Radio 的 value', async () => {
    const wrapper = mount(RadioGroup, {
      props: { name: 'plan' },
      slots: { default: () => [h(Radio, { key: 'a', value: 'a' }), h(Radio, { key: 'b', value: 'b' })] },
    })
    await wrapper.findAll('input')[1]?.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  })

  it('v-model 双向：点击更新父状态；父状态变化回落 DOM 选中', async () => {
    const { wrapper, value } = createHost()
    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue(true)
    expect(value.value).toBe('a')
    expect((inputs[0]?.element as HTMLInputElement).checked).toBe(true)

    value.value = 'b'
    await wrapper.vm.$nextTick()
    expect((inputs[1]?.element as HTMLInputElement).checked).toBe(true)
    expect((inputs[0]?.element as HTMLInputElement).checked).toBe(false)
  })

  it('整组 disabled：change 路径被拦截，不发出 update:modelValue', async () => {
    const { wrapper } = createHost({ disabled: true })
    await wrapper.findAll('input')[0]?.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('单项 disabled：被禁项不可选中，同组其余项照常可选', async () => {
    const wrapper = mount(RadioGroup, {
      props: { name: 'plan' },
      slots: { default: () => [h(Radio, { key: 'a', value: 'a', disabled: true }), h(Radio, { key: 'b', value: 'b' })] },
    })
    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await inputs[1]?.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  })

  it('disabled 响应式切换：组恢复后选中路径恢复', async () => {
    const wrapper = mount(RadioGroup, {
      props: { name: 'plan', disabled: true },
      slots: { default: () => [h(Radio, { key: 'a', value: 'a' })] },
    })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    // 注：禁用期 setValue 已把该 radio checked 置 true，值未再变化时 VTU 不再派发 change，
    // 组恢复后用原生 change 触发断言选中路径恢复。
    await wrapper.setProps({ disabled: false })
    await wrapper.find('input').trigger('change')
    expect(wrapper.emitted('update:modelValue')).toEqual([['a']])
  })

  it('选中态响应式：组 modelValue 外部变化时修饰类与 checked 同步', async () => {
    const wrapper = mount(RadioGroup, {
      props: { name: 'plan', modelValue: 'a' },
      slots: { default: () => [h(Radio, { key: 'a', value: 'a', label: '甲' }), h(Radio, { key: 'b', value: 'b', label: '乙' })] },
    })
    expect(wrapper.findAll('.ui-radio')[0]?.classes()).toContain('ui-radio--checked')
    await wrapper.setProps({ modelValue: 'b' })
    expect(wrapper.findAll('.ui-radio')[1]?.classes()).toContain('ui-radio--checked')
    expect(wrapper.findAll('.ui-radio')[0]?.classes()).not.toContain('ui-radio--checked')
  })
})
