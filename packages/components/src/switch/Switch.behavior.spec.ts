// behavior spec：点击切换 / v-model 双向 / disabled 与 loading 拦截 / 状态响应式。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Switch from './Switch.vue'

describe('Switch behavior', () => {
  it('点击：以 !modelValue 发出 update:modelValue（false→true→false）', async () => {
    const wrapper = mount(Switch, { props: { modelValue: false } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    await wrapper.setProps({ modelValue: true })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('v-model 双向：点击更新父状态，父状态回落 aria 与 DOM', async () => {
    const on = ref(false)
    const Host = defineComponent({
      setup: () => () =>
        h(Switch, {
          modelValue: on.value,
          'onUpdate:modelValue': (v: boolean) => {
            on.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    const control = wrapper.find('button')
    expect(control.attributes('aria-checked')).toBe('false')
    await control.trigger('click')
    expect(on.value).toBe(true)
    expect(control.attributes('aria-checked')).toBe('true')
  })

  it('disabled：点击不发出 update:modelValue（含原生 button.click() 合成路径）', async () => {
    const wrapper = mount(Switch, { props: { disabled: true } })
    await wrapper.find('button').trigger('click')
    void (wrapper.find('button').element as HTMLButtonElement).click()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('loading：点击不切换（原生路径不落 disabled，由组件语义网关拦截）', async () => {
    const wrapper = mount(Switch, { props: { loading: true } })
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    await wrapper.find('button').trigger('click')
    void (wrapper.find('button').element as HTMLButtonElement).click()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('loading 恢复后切换路径恢复', async () => {
    const wrapper = mount(Switch, { props: { loading: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ loading: false })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('受控状态响应式：modelValue 变化驱动 aria-checked 与修饰类', async () => {
    const wrapper = mount(Switch)
    expect(wrapper.classes()).not.toContain('ui-switch--checked')
    expect(wrapper.find('button').attributes('aria-checked')).toBe('false')
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.classes()).toContain('ui-switch--checked')
    expect(wrapper.find('button').attributes('aria-checked')).toBe('true')
  })

  it('loading 响应式切换：旋转指示随 props 显隐', async () => {
    const wrapper = mount(Switch)
    expect(wrapper.find('.ui-switch__spinner').exists()).toBe(false)
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('.ui-switch__spinner').exists()).toBe(true)
    await wrapper.setProps({ loading: false })
    expect(wrapper.find('.ui-switch__spinner').exists()).toBe(false)
  })
})
