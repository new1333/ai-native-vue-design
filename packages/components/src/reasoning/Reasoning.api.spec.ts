// api spec：props 默认值 / emits 声明 / slots 渲染（Reasoning）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Reasoning from './Reasoning.vue'

describe('Reasoning api', () => {
  it('渲染 ui-reasoning 根容器（div）', () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-reasoning')
  })

  it('默认：非流式、非受控收起（ui-reasoning--collapsed），触发按钮 aria-expanded=false、正文 hidden', () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    expect(wrapper.classes()).toContain('ui-reasoning--collapsed')
    expect(wrapper.classes()).not.toContain('ui-reasoning--streaming')
    expect(wrapper.classes()).not.toContain('ui-reasoning--expanded')
    const trigger = wrapper.find('.ui-reasoning__trigger')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.ui-reasoning__content').attributes('hidden')).toBeDefined()
  })

  it('默认头部文案：完成态无 duration → 「思考过程」', () => {
    const wrapper = mount(Reasoning, { props: { content: '' } })
    expect(wrapper.find('.ui-reasoning__trigger').text()).toContain('思考过程')
  })

  it('duration（秒）：完成态头部展示「已思考 x.xs」（固定一位小数）', () => {
    const wrapper = mount(Reasoning, { props: { content: '', duration: 3.2 } })
    expect(wrapper.find('.ui-reasoning__trigger').text()).toContain('已思考 3.2s')
  })

  it('整秒 duration 也保留一位小数（12 → 已思考 12.0s）', () => {
    const wrapper = mount(Reasoning, { props: { content: '', duration: 12 } })
    expect(wrapper.find('.ui-reasoning__trigger').text()).toContain('已思考 12.0s')
  })

  it('streaming=true：根挂 ui-reasoning--streaming，头部文案「思考中…」，非受控下初始即展开（流式自动展开）', () => {
    const wrapper = mount(Reasoning, { props: { content: '推演中', streaming: true } })
    expect(wrapper.classes()).toContain('ui-reasoning--streaming')
    expect(wrapper.find('.ui-reasoning__trigger').text()).toContain('思考中…')
    expect(wrapper.find('.ui-reasoning__trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.ui-reasoning__content').attributes('hidden')).toBeUndefined()
  })

  it('content 默认渲染为正文文本（多行换行保留为文本节点内容）', () => {
    const wrapper = mount(Reasoning, { props: { content: '第一行\n第二行' } })
    expect(wrapper.find('.ui-reasoning__content').text()).toBe('第一行\n第二行')
  })

  it('触发按钮携带 aria-expanded 与 aria-controls；正文携带 role=region 与 aria-labelledby', () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    const trigger = wrapper.find('.ui-reasoning__trigger')
    const content = wrapper.find('.ui-reasoning__content')
    expect(trigger.attributes('aria-expanded')).toBeDefined()
    expect(content.attributes('id')).toBe(trigger.attributes('aria-controls'))
    expect(content.attributes('role')).toBe('region')
    expect(trigger.attributes('id')).toBe(content.attributes('aria-labelledby'))
  })

  it('emits 声明：toggle', () => {
    const emitsOption = (Reasoning as unknown as { emits?: string[] }).emits
    expect(emitsOption).toContain('toggle')
  })

  it('header 插槽：覆盖默认文案、渲染进触发按钮内部（成为按钮可访问名），作用域提供 expanded/streaming/duration', () => {
    const wrapper = mount(Reasoning, {
      props: { content: '', duration: 3.2 },
      slots: {
        header: (scope: { expanded: boolean; streaming: boolean; duration?: number }) =>
          h('span', { class: 'custom-header' }, `${String(scope.expanded)}|${String(scope.streaming)}|${scope.duration ?? 'none'}`),
      },
    })
    const trigger = wrapper.find('.ui-reasoning__trigger')
    expect(trigger.find('.custom-header').exists()).toBe(true)
    expect(trigger.text()).toBe('false|false|3.2')
    expect(trigger.text()).not.toContain('已思考 3.2s')
  })

  it('content 插槽：覆盖 content prop 的默认文本渲染，作用域提供 content 与 streaming', () => {
    const wrapper = mount(Reasoning, {
      props: { content: '推理原文', streaming: true },
      slots: {
        content: (scope: { content: string; streaming: boolean }) =>
          h('p', { class: 'custom-content' }, `${scope.content}|${String(scope.streaming)}`),
      },
    })
    const content = wrapper.find('.ui-reasoning__content')
    expect(content.find('.custom-content').exists()).toBe(true)
    expect(content.text()).toBe('推理原文|true')
  })

  it('chevron 指示为内联 svg（16 档，装饰性 aria-hidden）', () => {
    const wrapper = mount(Reasoning, { props: { content: '' } })
    const svg = wrapper.find('.ui-reasoning__chevron svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('aria-hidden')).toBe('true')
  })
})
