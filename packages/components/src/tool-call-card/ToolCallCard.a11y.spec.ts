// a11y spec：状态 live region 语义 / 原生按钮键盘可达 / 审批组语义 / 装饰圆点 / 无 role 劫持。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolCallCard from './ToolCallCard.vue'

describe('ToolCallCard a11y', () => {
  it('状态徽标是常驻 live region：aria-live="polite"，状态变化以不打断方式播报', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x' } })
    const status = wrapper.find('.ui-tool-call-card__status')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toBe('排队中')
  })

  it('状态变化时 live region 文本随之更新（读屏播报新状态）', async () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x', status: 'running' } })
    expect(wrapper.find('.ui-tool-call-card__status').text()).toBe('运行中')
    await wrapper.setProps({ status: 'waitingApproval' })
    expect(wrapper.find('.ui-tool-call-card__status').text()).toBe('待审批')
    await wrapper.setProps({ status: 'failed' })
    expect(wrapper.find('.ui-tool-call-card__status').text()).toBe('失败')
  })

  it('审批按钮为原生 button（type=button）：Tab 可达、Enter/Space 激活按平台约定', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'x', status: 'waitingApproval' },
    })
    for (const button of wrapper.findAll('button')) {
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('type')).toBe('button')
      // 组件不改写键盘行为：无 tabindex 覆写、无 aria-disabled（用原生 disabled 表达禁用）
      expect(button.attributes('tabindex')).toBeUndefined()
      expect(button.attributes('aria-disabled')).toBeUndefined()
    }
  })

  it('审批操作组语义：role="group" + aria-label="人工审批"', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'x', status: 'waitingApproval' },
    })
    const group = wrapper.find('.ui-tool-call-card__approval')
    expect(group.attributes('role')).toBe('group')
    expect(group.attributes('aria-label')).toBe('人工审批')
  })

  it('disabled 走原生 disabled：按钮移出 Tab 序与激活路径（不伪装 aria-disabled）', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'x', status: 'waitingApproval', disabled: true },
    })
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined()
    }
  })

  it('状态圆点为纯装饰：aria-hidden="true"，不向读屏输出冗余内容', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x', status: 'completed' } })
    const dot = wrapper.find('.ui-tool-call-card__status-dot')
    expect(dot.exists()).toBe(true)
    expect(dot.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.ui-tool-call-card__status').text()).toBe('已完成')
  })

  it('入参/结果区以可见文本标签 + pre 按文档流可读（无 aria-hidden 遮蔽）', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'x', args: { q: 1 }, result: 'ok' },
    })
    const sections = wrapper.findAll('.ui-tool-call-card__section')
    expect(sections).toHaveLength(2)
    expect(sections[0]!.find('.ui-tool-call-card__section-label').text()).toBe('入参')
    expect(sections[1]!.find('.ui-tool-call-card__section-label').text()).toBe('结果')
    for (const section of sections) {
      expect(section.attributes('aria-hidden')).toBeUndefined()
      expect(section.find('pre').exists()).toBe(true)
    }
  })

  it('卡片根为泛型容器：无 role、不可聚焦（不参与 Tab 序）', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it('工具名按文档流渲染：非 aria-hidden、非空（读屏可读调用对象）', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'web_search' } })
    const name = wrapper.find('.ui-tool-call-card__name')
    expect(name.attributes('aria-hidden')).toBeUndefined()
    expect(name.text()).toBe('web_search')
  })

  it('#header 接管后内置 live region 移除（播报责任移交接管方，不残留双播报）', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'x' },
      slots: { header: () => [] },
    })
    expect(wrapper.find('.ui-tool-call-card__status').exists()).toBe(false)
  })
})
