// a11y spec：live region 语义 / aria-busy / 光标 aria-hidden / 非交互不聚焦。
// 组件为纯展示、不可聚焦（无 tabindex），不存在键盘交互路径——这里断言其不产生
// 伪交互语义（无 role / 无 tabindex），并以 live region 语义承载流式播报。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StreamingText from './StreamingText.vue'

describe('StreamingText a11y', () => {
  it('aria-live="polite"：文本更新以不打断方式播报', () => {
    const wrapper = mount(StreamingText, { props: { content: 'AI 回复' } })
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('aria-busy 随 streaming 切换：流式中 true（屏蔽逐 token 播报），定格后 false', async () => {
    const wrapper = mount(StreamingText, { props: { content: '增量', streaming: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    await wrapper.setProps({ streaming: false })
    expect(wrapper.attributes('aria-busy')).toBe('false')
  })

  it('流式光标为纯装饰：aria-hidden="true"', () => {
    const wrapper = mount(StreamingText, { props: { content: '增量', streaming: true } })
    const cursor = wrapper.find('.ui-streaming-text__cursor')
    expect(cursor.exists()).toBe(true)
    expect(cursor.attributes('aria-hidden')).toBe('true')
  })

  it('非交互元素：无 role、无 tabindex，不进入 Tab 序（无键盘路径）', () => {
    const wrapper = mount(StreamingText, { props: { content: '正文' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('markdown 模式使用原生 <p> 承载段落语义', () => {
    const md = mount(StreamingText, { props: { content: '甲段\n\n乙段', markdown: true } })
    const paragraphs = md.findAll('p')
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]?.element.tagName).toBe('P')
  })

  it('完成定格后文本为完整 content：读屏可读最终态（无半截渲染残留）', async () => {
    const wrapper = mount(StreamingText, { props: { content: '部分文本', streaming: true } })
    await wrapper.setProps({ content: '部分文本，以及后续补全的全文' })
    await wrapper.setProps({ streaming: false })
    expect(wrapper.text()).toBe('部分文本，以及后续补全的全文')
  })

  it('默认光标不含文本内容：不向读屏输出冗余字符', () => {
    const wrapper = mount(StreamingText, { props: { content: '正文', streaming: true } })
    expect(wrapper.text()).toBe('正文')
  })
})
