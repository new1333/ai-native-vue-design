// api spec：props 默认值 / 修饰类 / slots 渲染 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import StreamingText from './StreamingText.vue'

describe('StreamingText api', () => {
  it('默认渲染 div 并携带 ui-streaming-text 根类；content 直出（定格态）', () => {
    const wrapper = mount(StreamingText, { props: { content: '已完成文本' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-streaming-text')
    expect(wrapper.classes()).toContain('ui-streaming-text--done')
    expect(wrapper.text()).toBe('已完成文本')
  })

  it('streaming 默认 false：无光标、aria-busy="false"', () => {
    const wrapper = mount(StreamingText, { props: { content: '文本' } })
    expect(wrapper.classes()).not.toContain('ui-streaming-text--streaming')
    expect(wrapper.find('.ui-streaming-text__cursor').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBe('false')
  })

  it('streaming=true：--streaming 修饰类 + aria-busy="true" + 默认块状光标渲染', () => {
    const wrapper = mount(StreamingText, { props: { content: '文本', streaming: true } })
    expect(wrapper.classes()).toContain('ui-streaming-text--streaming')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.ui-streaming-text__cursor').exists()).toBe(true)
    expect(wrapper.find('.ui-streaming-text__caret').exists()).toBe(true)
  })

  it('markdown 默认 false（纯文本模式，无段落元素）；true 时按空行切分原生 <p>', () => {
    const plain = mount(StreamingText, { props: { content: '一段' } })
    expect(plain.classes()).not.toContain('ui-streaming-text--markdown')
    expect(plain.findAll('p')).toHaveLength(0)

    const md = mount(StreamingText, { props: { content: '第一段\n\n第二段', markdown: true } })
    expect(md.classes()).toContain('ui-streaming-text--markdown')
    const paragraphs = md.findAll('p')
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]?.text()).toBe('第一段')
    expect(paragraphs[1]?.text()).toBe('第二段')
  })

  it('markdown 段内单个换行不切分段落（保留在同一段内）', () => {
    const md = mount(StreamingText, { props: { content: '第一行\n第二行', markdown: true } })
    expect(md.findAll('p')).toHaveLength(1)
  })

  it('cursor 插槽替换默认光标（装饰容器与 aria-hidden 保留）', () => {
    const wrapper = mount(StreamingText, {
      props: { content: '文本', streaming: true },
      slots: { cursor: () => h('i', { class: 'my-cursor' }) },
    })
    expect(wrapper.find('.ui-streaming-text__caret').exists()).toBe(false)
    expect(wrapper.find('.my-cursor').exists()).toBe(true)
    const cursorWrapper = wrapper.find('.ui-streaming-text__cursor')
    expect(cursorWrapper.attributes('aria-hidden')).toBe('true')
  })

  it('default 插槽接管渲染，作用域暴露 text / streaming', () => {
    const wrapper = mount(StreamingText, {
      props: { content: '生成中文本', streaming: true },
      slots: {
        default: (scope: { text: string; streaming: boolean }) =>
          h('span', { class: 'custom' }, `${scope.text}|${String(scope.streaming)}`),
      },
    })
    expect(wrapper.find('.custom').text()).toBe('生成中文本|true')
    // 自定义渲染时光标仍由组件收口
    expect(wrapper.find('.ui-streaming-text__cursor').exists()).toBe(true)
  })

  it('attrs 透传到根元素（id / aria-label）', () => {
    const wrapper = mount(StreamingText, {
      props: { content: '文本' },
      attrs: { id: 'answer', 'aria-label': 'AI 回复' },
    })
    expect(wrapper.attributes('id')).toBe('answer')
    expect(wrapper.attributes('aria-label')).toBe('AI 回复')
  })
})
