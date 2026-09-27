// a11y spec：WAI-ARIA Disclosure 语义——原生 button 触发、aria-expanded/aria-controls、
// region 关联、hidden 收起、装饰性 chevron。
// 说明：Enter/Space 激活由原生 button 平台行为保证（本仓库环境探针已验证 happy-dom 不为
// 原生 button 合成键盘 click，组件也不得重复实现键盘激活以免真实浏览器双触发），
// 故键盘路径断言落在「触发器为原生 button 且未被禁用/劫持」上（同 Card.a11y.spec 先例）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Reasoning from './Reasoning.vue'

describe('Reasoning a11y', () => {
  it('触发器为原生 button（type=button）：Enter/Space 键盘激活由平台行为保证，未被禁用/劫持', () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    const trigger = wrapper.find('.ui-reasoning__trigger')
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('tabindex')).toBeUndefined()
    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(trigger.attributes('aria-disabled')).toBeUndefined()
  })

  it('aria-expanded 表达展开态：收起 false、展开 true（disclosure 按钮恒携带该属性）', async () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    const trigger = wrapper.find('.ui-reasoning__trigger')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('aria-controls 关联正文区域；正文 role=region 且 aria-labelledby 回指触发按钮（id 成对）', () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    const trigger = wrapper.find('.ui-reasoning__trigger')
    const content = wrapper.find('.ui-reasoning__content')
    const triggerId = trigger.attributes('id')
    const contentId = trigger.attributes('aria-controls')
    expect(triggerId).toBeTruthy()
    expect(contentId).toBeTruthy()
    expect(content.attributes('id')).toBe(contentId)
    expect(content.attributes('role')).toBe('region')
    expect(content.attributes('aria-labelledby')).toBe(triggerId)
  })

  it('收起以 hidden 表达（内容保留 DOM、不进入可访问树），展开后移除 hidden', async () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    const content = wrapper.find('.ui-reasoning__content')
    expect(content.attributes('hidden')).toBeDefined()
    expect(content.text()).toBe('思考文本')
    await wrapper.find('.ui-reasoning__trigger').trigger('click')
    expect(content.attributes('hidden')).toBeUndefined()
  })

  it('chevron 为装饰性元素：内联 svg aria-hidden，不进入触发按钮可访问名', () => {
    const wrapper = mount(Reasoning, { props: { content: '' } })
    const svg = wrapper.find('.ui-reasoning__chevron svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('aria-hidden')).toBe('true')
  })

  it('触发按钮可访问名来自头部文案：完成态含耗时（已思考 3.2s）', () => {
    const wrapper = mount(Reasoning, { props: { content: '', duration: 3.2 } })
    expect(wrapper.find('.ui-reasoning__trigger').text()).toContain('已思考 3.2s')
  })

  it('header 插槽内容渲染进按钮内部，天然成为按钮可访问名', () => {
    const wrapper = mount(Reasoning, {
      props: { content: '' },
      slots: { header: '自定义思考标题' },
    })
    const trigger = wrapper.find('.ui-reasoning__trigger')
    expect(trigger.text()).toContain('自定义思考标题')
  })

  it('正文区域文本自然可读：无 aria-hidden', () => {
    const wrapper = mount(Reasoning, { props: { content: '推理步骤', expanded: true } })
    const content = wrapper.find('.ui-reasoning__content')
    expect(content.attributes('aria-hidden')).toBeUndefined()
    expect(content.text()).toBe('推理步骤')
  })

  it('根容器为泛型 div：无 role、不劫持 landmark 语义', () => {
    const wrapper = mount(Reasoning, { props: { content: '思考文本' } })
    expect(wrapper.attributes('role')).toBeUndefined()
  })
})
