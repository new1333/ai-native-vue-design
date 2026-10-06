// behavior spec：输入 / v-model 双向 / 字数统计联动 / 状态响应式切换的交互行为。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Textarea from './Textarea.vue'

describe('Textarea behavior', () => {
  it('输入：input 事件驱动 update:modelValue，载荷为最新值', async () => {
    const wrapper = mount(Textarea, { props: { modelValue: 'a' } })
    await wrapper.find('textarea').setValue('ab\nc')
    expect(wrapper.emitted('update:modelValue')).toEqual([['ab\nc']])
  })

  it('v-model 双向绑定：输入更新父状态，父状态变化回落 DOM', async () => {
    const value = ref('初始')
    const Host = defineComponent({
      setup: () => () =>
        h(Textarea, {
          modelValue: value.value,
          'onUpdate:modelValue': (v: string) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    const control = wrapper.find('textarea')
    expect((control.element as HTMLTextAreaElement).value).toBe('初始')
    await control.setValue('改写')
    expect(value.value).toBe('改写')
    value.value = '外部改'
    await nextTick()
    expect((control.element as HTMLTextAreaElement).value).toBe('外部改')
  })

  it('showCount 随受控值联动：x/x 与 x/y 实时更新（统计派生自受控 modelValue）', async () => {
    const wrapper = mount(Textarea, { props: { showCount: true, maxlength: 5, modelValue: '' } })
    const count = () => wrapper.find('.ui-textarea__count').text()
    expect(count()).toBe('0/5')
    // 组件为纯受控：输入先经 update:modelValue 交父层回写，统计随之联动。
    await wrapper.setProps({ modelValue: 'ab' })
    expect(count()).toBe('2/5')
    await wrapper.setProps({ modelValue: 'abcde' })
    expect(count()).toBe('5/5')
  })

  it('showCount 响应式出现：props 打开后统计节点渲染', async () => {
    const wrapper = mount(Textarea)
    expect(wrapper.find('.ui-textarea__count').exists()).toBe(false)
    await wrapper.setProps({ showCount: true })
    expect(wrapper.find('.ui-textarea__count').exists()).toBe(true)
  })

  it('status 响应式切换：default ↔ error 时 aria-invalid 与修饰类同步', async () => {
    const wrapper = mount(Textarea)
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBeUndefined()
    await wrapper.setProps({ status: 'error' })
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true')
    expect(wrapper.classes()).toContain('ui-textarea--error')
    await wrapper.setProps({ status: 'default' })
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-textarea--error')
  })

  it('disabled / readonly 响应式切换：原生属性随 props 增删', async () => {
    const wrapper = mount(Textarea)
    expect(wrapper.find('textarea').attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ disabled: false, readonly: true })
    expect(wrapper.find('textarea').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('textarea').attributes('readonly')).toBeDefined()
  })

  it('resize 响应式切换：档位类随 props 更新', async () => {
    const wrapper = mount(Textarea)
    expect(wrapper.classes()).toContain('ui-textarea--resize-vertical')
    await wrapper.setProps({ resize: 'none' })
    expect(wrapper.classes()).toContain('ui-textarea--resize-none')
  })

  it('清空按钮：点击发出 update:modelValue("") 与 clear，v-model 下 DOM 值清空、按钮消失', async () => {
    const value = ref('多行内容')
    const Host = defineComponent({
      setup: () => () =>
        h(Textarea, {
          modelValue: value.value,
          clearable: true,
          'onUpdate:modelValue': (v: string) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    await wrapper.find('button.ui-textarea__clear').trigger('click')
    expect(value.value).toBe('')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.find('button.ui-textarea__clear').exists()).toBe(false)
  })

  it('值响应式出现：modelValue 注入后清空按钮出现，清空后随空值消失', async () => {
    const wrapper = mount(Textarea, { props: { clearable: true } })
    expect(wrapper.find('button.ui-textarea__clear').exists()).toBe(false)
    await wrapper.setProps({ modelValue: 'abc' })
    expect(wrapper.find('button.ui-textarea__clear').exists()).toBe(true)
    await wrapper.setProps({ modelValue: '' })
    expect(wrapper.find('button.ui-textarea__clear').exists()).toBe(false)
  })

  it('按住清空按钮不丢焦点：mousedown preventDefault，点击清空后焦点仍在输入区且事件齐全', async () => {
    const value = ref('有内容')
    let clearCount = 0
    const Host = defineComponent({
      setup: () => () =>
        h(Textarea, {
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
    const control = wrapper.find('textarea')
    const button = wrapper.find('button.ui-textarea__clear')
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
    expect((control.element as HTMLTextAreaElement).value).toBe('')
    expect(clearCount).toBe(1)
    wrapper.unmount()
  })
})
