// behavior spec：status 受控切换 → 修饰类 / 指示器（Spinner↔圆点）/ 文本随之更新。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AgentStatus from './AgentStatus.vue'

describe('AgentStatus behavior', () => {
  it('status 切换：语义档修饰类随之更新', async () => {
    const wrapper = mount(AgentStatus, { props: { status: 'queued' } })
    expect(wrapper.classes()).toContain('ui-agent-status--queued')
    await wrapper.setProps({ status: 'running' })
    expect(wrapper.classes()).toContain('ui-agent-status--running')
    expect(wrapper.classes()).not.toContain('ui-agent-status--queued')
    await wrapper.setProps({ status: 'failed' })
    expect(wrapper.classes()).toContain('ui-agent-status--failed')
    expect(wrapper.classes()).not.toContain('ui-agent-status--running')
  })

  it('进入运行态：圆点让位 Spinner；离开运行态：Spinner 还原为圆点', async () => {
    const wrapper = mount(AgentStatus, { props: { status: 'queued' } })
    expect(wrapper.find('.ui-agent-status__dot').exists()).toBe(true)
    expect(wrapper.find('.ui-spinner').exists()).toBe(false)

    await wrapper.setProps({ status: 'running' })
    expect(wrapper.find('.ui-spinner').exists()).toBe(true)
    expect(wrapper.find('.ui-agent-status__dot').exists()).toBe(false)

    await wrapper.setProps({ status: 'completed' })
    expect(wrapper.find('.ui-spinner').exists()).toBe(false)
    expect(wrapper.find('.ui-agent-status__dot').exists()).toBe(true)
  })

  it('运行态三档（running/streaming/toolRunning）均组合 Spinner', async () => {
    const wrapper = mount(AgentStatus, { props: { status: 'running' } })
    expect(wrapper.find('.ui-spinner').exists()).toBe(true)
    await wrapper.setProps({ status: 'streaming' })
    expect(wrapper.find('.ui-spinner').exists()).toBe(true)
    await wrapper.setProps({ status: 'toolRunning' })
    expect(wrapper.find('.ui-spinner').exists()).toBe(true)
  })

  it('非运行态五档（queued/waitingForTool/completed/failed/cancelled）均为静态圆点', () => {
    const nonActive = ['queued', 'waitingForTool', 'completed', 'failed', 'cancelled'] as const
    for (const status of nonActive) {
      const wrapper = mount(AgentStatus, { props: { status } })
      expect(wrapper.find('.ui-spinner').exists(), status).toBe(false)
      expect(wrapper.find('.ui-agent-status__dot').exists(), status).toBe(true)
    }
  })

  it('label 缺省时文本随 status 切换更新（live region 播报内容随之变化）', async () => {
    const wrapper = mount(AgentStatus, { props: { status: 'queued' } })
    expect(wrapper.text()).toContain('排队中')
    await wrapper.setProps({ status: 'streaming' })
    expect(wrapper.text()).toContain('流式输出中')
    expect(wrapper.text()).not.toContain('排队中')
    await wrapper.setProps({ status: 'cancelled' })
    expect(wrapper.text()).toContain('已取消')
  })

  it('label prop 切换：覆盖文本随之更新，status 默认文案不再出现', async () => {
    const wrapper = mount(AgentStatus, { props: { status: 'running', label: '正在检索资料' } })
    expect(wrapper.text()).toContain('正在检索资料')
    await wrapper.setProps({ label: '正在整理答案' })
    expect(wrapper.text()).toContain('正在整理答案')
    expect(wrapper.text()).not.toContain('正在检索资料')
  })

  it('detail 增删：补充说明行随之出现/消失', async () => {
    const wrapper = mount(AgentStatus, { props: { status: 'running' } })
    expect(wrapper.find('.ui-agent-status__detail').exists()).toBe(false)
    await wrapper.setProps({ detail: '正在执行 3/7 步' })
    expect(wrapper.find('.ui-agent-status__detail').text()).toBe('正在执行 3/7 步')
    await wrapper.setProps({ detail: undefined })
    expect(wrapper.find('.ui-agent-status__detail').exists()).toBe(false)
  })

  it('典型生命周期推进：queued → toolRunning → failed，类名/指示器/文本全程同步', async () => {
    const wrapper = mount(AgentStatus, { props: { status: 'queued', detail: '等待调度' } })
    await wrapper.setProps({ status: 'toolRunning', detail: '执行 web_search' })
    expect(wrapper.classes()).toContain('ui-agent-status--toolRunning')
    expect(wrapper.find('.ui-spinner').exists()).toBe(true)
    expect(wrapper.text()).toContain('工具执行中')
    expect(wrapper.text()).toContain('执行 web_search')
    await wrapper.setProps({ status: 'failed', detail: 'web_search 超时' })
    expect(wrapper.classes()).toContain('ui-agent-status--failed')
    expect(wrapper.find('.ui-spinner').exists()).toBe(false)
    expect(wrapper.text()).toContain('已失败')
  })
})
