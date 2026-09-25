// behavior spec：勾选切换 / v-model 双向 / indeterminate DOM 属性同步 / 禁用拦截。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Checkbox from './Checkbox.vue'

describe('Checkbox behavior', () => {
  it('点击（change 路径）：以勾选后的布尔值发出 update:modelValue', async () => {
    const wrapper = mount(Checkbox)
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    await wrapper.find('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('v-model 双向绑定：点击更新父状态，父状态回落 DOM', async () => {
    const checked = ref(false)
    const Host = defineComponent({
      setup: () => () =>
        h(Checkbox, {
          modelValue: checked.value,
          'onUpdate:modelValue': (v: boolean) => {
            checked.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    const control = wrapper.find('input')
    await control.setValue(true)
    expect(checked.value).toBe(true)
    checked.value = false
    await wrapper.vm.$nextTick()
    expect((control.element as HTMLInputElement).checked).toBe(false)
  })

  it('indeterminate：onMounted 同步 DOM property（客户端语义，AT 可感知）', async () => {
    const wrapper = mount(Checkbox, { props: { indeterminate: true }, attachTo: document.body })
    const control = wrapper.find('input').element as HTMLInputElement
    expect(control.indeterminate).toBe(true)
    await wrapper.setProps({ indeterminate: false })
    expect(control.indeterminate).toBe(false)
    await wrapper.setProps({ indeterminate: true })
    expect(control.indeterminate).toBe(true)
    wrapper.unmount()
  })

  it('indeterminate 初值为 false 时不残留 DOM property', async () => {
    const wrapper = mount(Checkbox, { attachTo: document.body })
    expect((wrapper.find('input').element as HTMLInputElement).indeterminate).toBe(false)
    wrapper.unmount()
  })

  it('disabled：change 路径被拦截，不发出 update:modelValue', async () => {
    const wrapper = mount(Checkbox, { props: { disabled: true } })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('disabled 响应式切换：恢复后切换路径恢复', async () => {
    const wrapper = mount(Checkbox, { props: { disabled: true } })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    // 注：禁用期 setValue 已把 DOM checked 置 true 且值未再变化时 VTU 不再派发 change，
    // 恢复后用原生 change 触发断言切换路径恢复（载荷取自控件当前勾选态）。
    await wrapper.setProps({ disabled: false })
    await wrapper.find('input').trigger('change')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('受控状态切换：修饰类随 props 增删（checked / indeterminate / disabled）', async () => {
    const wrapper = mount(Checkbox)
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.classes()).toContain('ui-checkbox--checked')
    await wrapper.setProps({ indeterminate: true })
    expect(wrapper.classes()).toContain('ui-checkbox--indeterminate')
    await wrapper.setProps({ disabled: true })
    expect(wrapper.classes()).toContain('ui-checkbox--disabled')
  })
})
