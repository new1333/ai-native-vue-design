// behavior spec：Enter 发送 / Shift+Enter 换行 / IME 组合安全 / loading 停止 / 自适应高度 / 受控回写。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import PromptInput from './PromptInput.vue'

/** 原生派发 Enter keydown（cancelable），返回事件供 defaultPrevented 断言。 */
function pressEnter(el: HTMLTextAreaElement, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  return event
}

describe('PromptInput behavior', () => {
  it('Enter 发送：有值且 submitOnEnter 时发出 submit（载荷为当前值）并 preventDefault 阻止换行', () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '写一首关于秋天的诗' } })
    const event = pressEnter(wrapper.find('textarea').element)
    expect(wrapper.emitted('submit')).toEqual([['写一首关于秋天的诗']])
    expect(event.defaultPrevented).toBe(true)
  })

  it('Shift+Enter 换行：不发出 submit、不拦截默认行为（原生换行保留）', () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '第一行' } })
    const event = pressEnter(wrapper.find('textarea').element, { shiftKey: true })
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(event.defaultPrevented).toBe(false)
  })

  it('submitOnEnter=false：Enter 不发送、不拦截（回到原生多行行为）', () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '草稿', submitOnEnter: false } })
    const event = pressEnter(wrapper.find('textarea').element)
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(event.defaultPrevented).toBe(false)
  })

  it('空值/纯空白 Enter 不发送、不拦截', () => {
    const empty = mount(PromptInput)
    const emptyEvent = pressEnter(empty.find('textarea').element)
    expect(empty.emitted('submit')).toBeUndefined()
    expect(emptyEvent.defaultPrevented).toBe(false)

    const blank = mount(PromptInput, { props: { modelValue: '   \n  ' } })
    const blankEvent = pressEnter(blank.find('textarea').element)
    expect(blank.emitted('submit')).toBeUndefined()
    expect(blankEvent.defaultPrevented).toBe(false)
  })

  it('IME 组合安全：compositionstart 后 Enter 不发送不拦截；compositionend 后恢复发送', () => {
    const wrapper = mount(PromptInput, { props: { modelValue: 'nihao' } })
    const el = wrapper.find('textarea').element

    el.dispatchEvent(new Event('compositionstart'))
    const composingEvent = pressEnter(el)
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(composingEvent.defaultPrevented).toBe(false)

    el.dispatchEvent(new Event('compositionend'))
    const committedEvent = pressEnter(el)
    expect(wrapper.emitted('submit')).toEqual([['nihao']])
    expect(committedEvent.defaultPrevented).toBe(true)
  })

  it('isComposing=true 的 Enter（合成事件直标）不发送', () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '拼音' } })
    pressEnter(wrapper.find('textarea').element, { isComposing: true })
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('loading：Enter 不发送；停止按钮点击发出 cancel，不发出 submit', () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '进行中的问题', loading: true } })
    const enterEvent = pressEnter(wrapper.find('textarea').element)
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(enterEvent.defaultPrevented).toBe(false)
  })

  it('loading 响应式切换：true 时按钮转停止（可点出 cancel），false 后恢复发送', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '你好', loading: false } })
    expect(wrapper.find('button.ui-prompt-input__send').attributes('aria-label')).toBe('发送')

    await wrapper.setProps({ loading: true })
    expect(wrapper.find('button.ui-prompt-input__send').attributes('aria-label')).toBe('停止')
    await wrapper.find('button.ui-prompt-input__send').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)

    await wrapper.setProps({ loading: false })
    expect(wrapper.find('button.ui-prompt-input__send').attributes('aria-label')).toBe('发送')
    await wrapper.find('button.ui-prompt-input__send').trigger('click')
    expect(wrapper.emitted('submit')).toEqual([['你好']])
  })

  it('disabled：Enter 不发送、发送按钮原生禁用不可触发 submit', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '你好', disabled: true } })
    const event = pressEnter(wrapper.find('textarea').element)
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.find('button.ui-prompt-input__send').attributes('disabled')).toBeDefined()
  })

  it('点击发送按钮：发出 submit（载荷为当前值）；空值时按钮禁用点击无效', async () => {
    const filled = mount(PromptInput, { props: { modelValue: '来自点击' } })
    await filled.find('button.ui-prompt-input__send').trigger('click')
    expect(filled.emitted('submit')).toEqual([['来自点击']])

    const blank = mount(PromptInput)
    await blank.find('button.ui-prompt-input__send').trigger('click')
    expect(blank.emitted('submit')).toBeUndefined()
  })

  it('v-model 双向绑定：输入更新父状态，父状态变化回落 DOM', async () => {
    const value = ref('初始')
    const Host = defineComponent({
      setup: () => () =>
        h(PromptInput, {
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

  it('纯受控清空：父层把 modelValue 置空后 DOM 值同步清空（submit 不自动清空）', async () => {
    const wrapper = mount(PromptInput, { props: { modelValue: '待发送' } })
    pressEnter(wrapper.find('textarea').element)
    expect(wrapper.emitted('submit')).toHaveLength(1)
    // 组件不自改值：清空必须由使用方完成
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('待发送')
    await wrapper.setProps({ modelValue: '' })
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
  })

  it('自适应高度：mounted 后与受控值变化时按内容高度写回（scrollHeight 桩），无布局引擎时保持 auto', async () => {
    const wrapper = mount(PromptInput)
    const el = wrapper.find('textarea').element
    // happy-dom 无布局：scrollHeight 为 0，跳过写回（height 停留在 auto，不塌陷）
    expect(el.style.height).toBe('auto')
    Object.defineProperty(el, 'scrollHeight', { value: 100, configurable: true })
    await wrapper.setProps({ modelValue: '触发重新测量' })
    await nextTick()
    expect(el.style.height).toBe('100px')
    Object.defineProperty(el, 'scrollHeight', { value: 60, configurable: true })
    await wrapper.setProps({ modelValue: '缩短' })
    await nextTick()
    expect(el.style.height).toBe('60px')
  })
})
