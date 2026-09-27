// behavior spec：展开状态机——用户切换、流式自动展开/结束收起、autoCollapse、受控模式。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Reasoning from './Reasoning.vue'

describe('Reasoning behavior', () => {
  it('点击触发按钮：展开 ⇄ 收起，aria-expanded 与正文 hidden 同步，toggle 携带切换后的展开态', async () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    const trigger = wrapper.find('.ui-reasoning__trigger')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.ui-reasoning__content').attributes('hidden')).toBeUndefined()
    expect(wrapper.emitted('toggle')).toEqual([[true]])
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.ui-reasoning__content').attributes('hidden')).toBeDefined()
    expect(wrapper.emitted('toggle')).toEqual([[true], [false]])
  })

  it('流式自动展开：streaming false→true 自动展开并派发 toggle(true)', async () => {
    const wrapper = mount(Reasoning, { props: { content: '' } })
    await wrapper.setProps({ streaming: true })
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.ui-reasoning__content').attributes('hidden')).toBeUndefined()
    expect(wrapper.emitted('toggle')).toEqual([[true]])
  })

  it('结束收起：streaming true→false 且 autoCollapse（默认 true）自动收起并派发 toggle(false)', async () => {
    const wrapper = mount(Reasoning, { props: { content: '', streaming: true } })
    await wrapper.setProps({ streaming: false })
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.ui-reasoning__content').attributes('hidden')).toBeDefined()
    expect(wrapper.emitted('toggle')).toEqual([[false]])
  })

  it('autoCollapse=false：流式结束保持展开，不派发 toggle（无状态变化）', async () => {
    const wrapper = mount(Reasoning, { props: { content: '', streaming: true, autoCollapse: false } })
    await wrapper.setProps({ streaming: false })
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.ui-reasoning__content').attributes('hidden')).toBeUndefined()
    expect(wrapper.emitted('toggle')).toBeUndefined()
  })

  it('流式中用户手动收起后结束：保持收起，结束收起不重复派发（已是目标态）', async () => {
    const wrapper = mount(Reasoning, { props: { content: '', streaming: true } })
    await wrapper.find('.ui-reasoning__trigger').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([[false]])
    await wrapper.setProps({ streaming: false })
    expect(wrapper.emitted('toggle')).toEqual([[false]])
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('false')
  })

  it('流式重启：结束后再次 streaming=true 重新自动展开', async () => {
    const wrapper = mount(Reasoning, { props: { content: '', streaming: true } })
    await wrapper.setProps({ streaming: false })
    await wrapper.setProps({ streaming: true })
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('toggle')).toEqual([[false], [true]])
  })

  it('受控模式：expanded 提供时点击只派发 toggle、DOM 随 prop，不自行改状态', async () => {
    const wrapper = mount(Reasoning, { props: { content: '', expanded: false } })
    await wrapper.find('.ui-reasoning__trigger').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([[true]])
    // 父级未回写 expanded：展示保持收起（受控只上报意向）
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('false')
    // 父级回写 expanded=true：展示随之展开
    await wrapper.setProps({ expanded: true })
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.ui-reasoning__content').attributes('hidden')).toBeUndefined()
    expect(wrapper.emitted('toggle')).toEqual([[true]])
  })

  it('受控模式的流式语义：结束收起意向也以 toggle 上报，是否收起由父级决定', async () => {
    const wrapper = mount(Reasoning, { props: { content: '', expanded: true, streaming: true } })
    await wrapper.setProps({ streaming: false })
    expect(wrapper.emitted('toggle')).toEqual([[false]])
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('true')
  })

  it('duration 更新：头部耗时文案随之重渲染', async () => {
    const wrapper = mount(Reasoning, { props: { content: '', duration: 3.2 } })
    expect(wrapper.find('.ui-reasoning__trigger').text()).toContain('已思考 3.2s')
    await wrapper.setProps({ duration: 12.6 })
    expect(wrapper.find('.ui-reasoning__trigger').text()).toContain('已思考 12.6s')
  })

  it('正文内容响应式更新（content prop 随流式累计）', async () => {
    const wrapper = mount(Reasoning, { props: { content: '第一段', expanded: true } })
    expect(wrapper.find('.ui-reasoning__content').text()).toBe('第一段')
    await wrapper.setProps({ content: '第一段\n第二段' })
    expect(wrapper.find('.ui-reasoning__content').text()).toBe('第一段\n第二段')
  })
})
