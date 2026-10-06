// behavior spec：输入 / v-model 双向 / 清空按钮 / 状态响应式切换的交互行为。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Input from './Input.vue'

describe('Input behavior', () => {
  it('输入：input 事件驱动 update:modelValue，载荷为最新值', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'a' } })
    await wrapper.find('input').setValue('ab')
    expect(wrapper.emitted('update:modelValue')).toEqual([['ab']])
  })

  it('v-model 双向绑定：输入更新父状态，父状态变化回落 DOM', async () => {
    const value = ref('初始')
    const Host = defineComponent({
      setup: () => () =>
        h(Input, {
          modelValue: value.value,
          'onUpdate:modelValue': (v: string) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    const control = wrapper.find('input')
    expect((control.element as HTMLInputElement).value).toBe('初始')
    await control.setValue('改写')
    expect(value.value).toBe('改写')
    value.value = '外部改'
    await nextTick()
    expect((control.element as HTMLInputElement).value).toBe('外部改')
  })

  it('清空按钮：点击发出 update:modelValue("") 与 clear，v-model 下 DOM 值清空、按钮消失', async () => {
    const value = ref('有内容')
    const Host = defineComponent({
      setup: () => () =>
        h(Input, {
          modelValue: value.value,
          clearable: true,
          'onUpdate:modelValue': (v: string) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    await wrapper.find('button.ui-input__clear').trigger('click')
    expect(value.value).toBe('')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
    expect(wrapper.find('button.ui-input__clear').exists()).toBe(false)
  })

  it('clearable=false：有值也不渲染清空按钮', () => {
    const wrapper = mount(Input, { props: { clearable: false, modelValue: 'abc' } })
    expect(wrapper.find('button.ui-input__clear').exists()).toBe(false)
  })

  it('disabled / readonly：即使有值且 clearable 也不渲染清空按钮', () => {
    const disabled = mount(Input, { props: { clearable: true, modelValue: 'abc', disabled: true } })
    expect(disabled.find('button.ui-input__clear').exists()).toBe(false)
    const readonly = mount(Input, { props: { clearable: true, modelValue: 'abc', readonly: true } })
    expect(readonly.find('button.ui-input__clear').exists()).toBe(false)
  })

  it('值响应式出现：modelValue 注入后清空按钮出现', async () => {
    const wrapper = mount(Input, { props: { clearable: true } })
    expect(wrapper.find('button.ui-input__clear').exists()).toBe(false)
    await wrapper.setProps({ modelValue: 'abc' })
    expect(wrapper.find('button.ui-input__clear').exists()).toBe(true)
  })

  it('清空后焦点交还原生 input（键盘可继续输入）', async () => {
    const wrapper = mount(Input, {
      props: { clearable: true, modelValue: 'abc' },
      attachTo: document.body,
    })
    await wrapper.find('button.ui-input__clear').trigger('click')
    expect(document.activeElement).toBe(wrapper.find('input').element)
    wrapper.unmount()
  })

  it('按住清空按钮不丢焦点：mousedown preventDefault，点击后焦点仍在输入框且清空正常', async () => {
    const value = ref('有内容')
    let clearCount = 0
    const Host = defineComponent({
      setup: () => () =>
        h(Input, {
          modelValue: value.value,
          clearable: true,
          'onUpdate:modelValue': (v: string) => {
            value.value = v
          },
          onClear: () => {
            clearCount += 1
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const control = wrapper.find('input')
    const button = wrapper.find('button.ui-input__clear')
    control.element.focus()
    expect(document.activeElement).toBe(control.element)
    // 真实浏览器焦点转移发生在 mousedown 默认行为：以可取消的真实事件派发并断言被阻止
    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    button.element.dispatchEvent(mousedown)
    expect(mousedown.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(control.element)
    await button.trigger('click')
    expect(document.activeElement).toBe(control.element)
    expect(value.value).toBe('')
    expect((control.element as HTMLInputElement).value).toBe('')
    expect(clearCount).toBe(1)
    wrapper.unmount()
  })

  it('status 响应式切换：default → error 时 aria-invalid 与修饰类同步', async () => {
    const wrapper = mount(Input)
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
    await wrapper.setProps({ status: 'error' })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.classes()).toContain('ui-input--error')
    await wrapper.setProps({ status: 'default' })
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-input--error')
  })

  it('disabled 响应式切换：原生 disabled 属性随 props 增删', async () => {
    const wrapper = mount(Input)
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ disabled: false })
    expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
  })
})
