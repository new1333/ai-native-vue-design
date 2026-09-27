// api spec：props 默认值 / emits 声明 / slots 渲染 / attrs 透传（api 契约见 meta.api）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PromptInput from './PromptInput.vue'

describe('PromptInput api', () => {
  it('渲染 ui-prompt-input 根容器、原生 textarea 控件与内建发送按钮', () => {
    const wrapper = mount(PromptInput)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-prompt-input')
    expect(wrapper.find('textarea.ui-prompt-input__control').exists()).toBe(true)
    expect(wrapper.find('button.ui-prompt-input__send').exists()).toBe(true)
  })

  it('默认：rows=1、maxRows=8（max-height token calc）、无 disabled/loading 修饰类，发送按钮 aria-label=发送', () => {
    const wrapper = mount(PromptInput)
    const control = wrapper.find('textarea')
    expect(control.attributes('rows')).toBe('1')
    expect(control.element.style.maxHeight).toContain('var(--ui-text-md)')
    expect(control.element.style.maxHeight).toContain('var(--ui-leading-small)')
    expect(control.element.style.maxHeight).toContain('* 8')
    expect(wrapper.classes()).not.toContain('ui-prompt-input--disabled')
    expect(wrapper.classes()).not.toContain('ui-prompt-input--loading')
    expect(wrapper.find('button.ui-prompt-input__send').attributes('aria-label')).toBe('发送')
  })

  it('空值时发送按钮原生禁用；有值后可提交', async () => {
    const wrapper = mount(PromptInput)
    expect(wrapper.find('button.ui-prompt-input__send').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ modelValue: '你好' })
    expect(wrapper.find('button.ui-prompt-input__send').attributes('disabled')).toBeUndefined()
  })

  it('maxRows 响应 max-height 内联样式的行数上限', async () => {
    const wrapper = mount(PromptInput, { props: { maxRows: 4 } })
    expect(wrapper.find('textarea').element.style.maxHeight).toContain('* 4')
    await wrapper.setProps({ maxRows: 12 })
    expect(wrapper.find('textarea').element.style.maxHeight).toContain('* 12')
  })

  it('placeholder / disabled 原生属性落位，disabled 附修饰类并禁用发送按钮', () => {
    const disabled = mount(PromptInput, { props: { placeholder: '给 AI 的提示词', disabled: true } })
    const control = disabled.find('textarea')
    expect(control.attributes('placeholder')).toBe('给 AI 的提示词')
    expect(control.attributes('disabled')).toBeDefined()
    expect(disabled.classes()).toContain('ui-prompt-input--disabled')
    expect(disabled.find('button.ui-prompt-input__send').attributes('disabled')).toBeDefined()
  })

  it('loading：ui-prompt-input--loading 修饰类 + 按钮切换为停止（aria-label=停止且不禁用）', () => {
    const wrapper = mount(PromptInput, { props: { loading: true } })
    expect(wrapper.classes()).toContain('ui-prompt-input--loading')
    const button = wrapper.find('button.ui-prompt-input__send')
    expect(button.attributes('aria-label')).toBe('停止')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('modelValue 初始值渲染为 textarea 内容', () => {
    const control = mount(PromptInput, { props: { modelValue: '写一首诗' } }).find('textarea')
    expect((control.element as HTMLTextAreaElement).value).toBe('写一首诗')
  })

  it('三个具名插槽渲染；未提供 prefix/suffix 时不渲染对应容器，actions 容器始终存在（内建按钮之前）', () => {
    const plain = mount(PromptInput)
    expect(plain.find('.ui-prompt-input__prefix').exists()).toBe(false)
    expect(plain.find('.ui-prompt-input__suffix').exists()).toBe(false)
    expect(plain.find('.ui-prompt-input__actions').exists()).toBe(true)

    const slotted = mount(PromptInput, {
      slots: {
        prefix: '<span class="slot-prefix">附件</span>',
        suffix: '<span class="slot-suffix">Enter 发送</span>',
        actions: '<button type="button" class="slot-action">模板</button>',
      },
    })
    expect(slotted.find('.ui-prompt-input__prefix').text()).toBe('附件')
    expect(slotted.find('.ui-prompt-input__suffix').text()).toBe('Enter 发送')
    // actions 为增量扩展：插槽内容与内建发送按钮并存
    expect(slotted.find('.slot-action').exists()).toBe(true)
    expect(slotted.find('button.ui-prompt-input__send').exists()).toBe(true)
    // DOM 序：插槽动作在内建按钮之前
    const actionIndex = slotted.findAll('.ui-prompt-input__actions > *').findIndex((n) => n.classes().includes('slot-action'))
    const sendIndex = slotted.findAll('.ui-prompt-input__actions > *').findIndex((n) => n.classes().includes('ui-prompt-input__send'))
    expect(actionIndex).toBeLessThan(sendIndex)
  })

  it('update:modelValue 已声明：输入路径以字符串载荷发出', async () => {
    const wrapper = mount(PromptInput)
    await wrapper.find('textarea').setValue('hello')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('submit / cancel 已声明：分别由发送与停止路径发出（载荷见 behavior spec）', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: 'go' } })
    await wrapper.find('button.ui-prompt-input__send').trigger('click')
    expect(wrapper.emitted('submit')).toEqual([['go']])

    const stopping = mount(PromptInput, { props: { loading: true } })
    await stopping.find('button.ui-prompt-input__send').trigger('click')
    expect(stopping.emitted('cancel')).toHaveLength(1)
    expect(stopping.emitted('submit')).toBeUndefined()
  })

  it('attrs 透传（inheritAttrs:false）：合并到原生 textarea，不落根容器', () => {
    const wrapper = mount(PromptInput, {
      attrs: { id: 'prompt-field', 'aria-label': '提示词', 'aria-describedby': 'prompt-tip' },
    })
    const control = wrapper.find('textarea')
    expect(control.attributes('id')).toBe('prompt-field')
    expect(control.attributes('aria-label')).toBe('提示词')
    expect(control.attributes('aria-describedby')).toBe('prompt-tip')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
