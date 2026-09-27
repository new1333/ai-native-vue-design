// api spec：props 默认值 / status 档位 / label / detail / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import AgentStatus from './AgentStatus.vue'
import { AGENT_STATUS_LABELS, AGENT_STATUS_STATES } from './AgentStatus.constants'

describe('AgentStatus api', () => {
  it('渲染 <div> 根元素并携带 ui-agent-status 根类、role=status、aria-live=polite', () => {
    const wrapper = mount(AgentStatus)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-agent-status')
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('默认：status=queued、默认文案"排队中"、静态圆点指示器（无 Spinner）', () => {
    const wrapper = mount(AgentStatus)
    expect(wrapper.classes()).toContain('ui-agent-status--queued')
    expect(wrapper.text()).toContain('排队中')
    expect(wrapper.find('.ui-agent-status__dot').exists()).toBe(true)
    expect(wrapper.find('.ui-spinner').exists()).toBe(false)
  })

  it('status 全档位映射修饰类（§14 state semantics 八档）', () => {
    for (const status of AGENT_STATUS_STATES) {
      expect(mount(AgentStatus, { props: { status } }).classes()).toContain(`ui-agent-status--${status}`)
    }
  })

  it('label 缺省时按 status 取默认文案', () => {
    expect(mount(AgentStatus, { props: { status: 'streaming' } }).text()).toContain('流式输出中')
    expect(mount(AgentStatus, { props: { status: 'waitingForTool' } }).text()).toContain('等待工具')
    expect(mount(AgentStatus, { props: { status: 'failed' } }).text()).toContain('已失败')
  })

  it('label 覆盖默认文案', () => {
    const wrapper = mount(AgentStatus, { props: { status: 'running', label: '正在规划步骤' } })
    expect(wrapper.text()).toContain('正在规划步骤')
    expect(wrapper.text()).not.toContain('运行中')
  })

  it('detail 传入时渲染补充说明行，缺省时不渲染', () => {
    const wrapper = mount(AgentStatus, { props: { status: 'toolRunning', detail: '执行 get_weather' } })
    expect(wrapper.find('.ui-agent-status__detail').exists()).toBe(true)
    expect(wrapper.find('.ui-agent-status__detail').text()).toBe('执行 get_weather')

    const bare = mount(AgentStatus, { props: { status: 'toolRunning' } })
    expect(bare.find('.ui-agent-status__detail').exists()).toBe(false)
  })

  it('#default 插槽覆盖状态文本', () => {
    const wrapper = mount(AgentStatus, {
      props: { status: 'completed' },
      slots: { default: () => '3 / 7 步全部跑完' },
    })
    expect(wrapper.text()).toContain('3 / 7 步全部跑完')
    expect(wrapper.text()).not.toContain('已完成')
  })

  it('#icon 插槽替换默认指示器（无圆点、无 Spinner）', () => {
    const wrapper = mount(AgentStatus, {
      props: { status: 'running' },
      slots: { icon: () => h('svg', { 'data-testid': 'custom-icon' }) },
    })
    expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true)
    expect(wrapper.find('.ui-agent-status__dot').exists()).toBe(false)
    expect(wrapper.find('.ui-spinner').exists()).toBe(false)
  })

  it('运行态默认指示器组合 Spinner（size sm）', () => {
    const wrapper = mount(AgentStatus, { props: { status: 'streaming' } })
    expect(wrapper.find('.ui-spinner').exists()).toBe(true)
    expect(wrapper.find('.ui-agent-status__dot').exists()).toBe(false)
  })

  it('attrs 透传到根元素（data-testid）', () => {
    const wrapper = mount(AgentStatus, { attrs: { 'data-testid': 'run-status' } })
    expect(wrapper.attributes('data-testid')).toBe('run-status')
  })

  it('AGENT_STATUS_LABELS 覆盖全部状态档', () => {
    for (const status of AGENT_STATUS_STATES) {
      expect(AGENT_STATUS_LABELS[status]).toBeTruthy()
    }
  })
})
