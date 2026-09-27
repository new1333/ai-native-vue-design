// behavior spec：审批按钮交互、受控状态流转、内容响应式更新、禁用门控。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolCallCard from './ToolCallCard.vue'

describe('ToolCallCard behavior', () => {
  it('点击批准/拒绝：分别派发 approve / reject（无载荷）', async () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'run_sql', status: 'waitingApproval' },
    })
    const [approve, reject] = wrapper.findAll('button')
    await approve!.trigger('click')
    await reject!.trigger('click')
    await approve!.trigger('click')
    expect(wrapper.emitted('approve')).toHaveLength(2)
    expect(wrapper.emitted('reject')).toHaveLength(1)
    expect(wrapper.emitted('approve')![0]).toEqual([])
  })

  it('disabled=true：按钮携带原生 disabled 属性（交互由原生语义门控）', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'run_sql', status: 'waitingApproval', disabled: true },
    })
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined()
    }
    // 非 disabled 时属性不存在
    const enabled = mount(ToolCallCard, {
      props: { name: 'run_sql', status: 'waitingApproval' },
    })
    for (const button of enabled.findAll('button')) {
      expect(button.attributes('disabled')).toBeUndefined()
    }
  })

  it('受控状态流转：queued → running → completed，徽标档位/标签/live region 文本随之切换', async () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x' } })
    const status = () => wrapper.find('.ui-tool-call-card__status')

    expect(status().classes()).toContain('ui-tool-call-card__status--neutral')
    expect(status().text()).toBe('排队中')

    await wrapper.setProps({ status: 'running' })
    expect(wrapper.classes()).toContain('ui-tool-call-card--running')
    expect(status().classes()).toContain('ui-tool-call-card__status--info')
    expect(status().text()).toBe('运行中')

    await wrapper.setProps({ status: 'completed' })
    expect(wrapper.classes()).toContain('ui-tool-call-card--completed')
    expect(status().classes()).toContain('ui-tool-call-card__status--success')
    expect(status().text()).toBe('已完成')
  })

  it('审批流闭环：waitingApproval 下批准 → 使用方切回 completed，审批区消失、徽标转 success', async () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'run_sql', status: 'waitingApproval' },
    })
    expect(wrapper.find('.ui-tool-call-card__approval').exists()).toBe(true)
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.emitted('approve')).toHaveLength(1)

    // 使用方驱动流转：批准后进入执行并完成
    await wrapper.setProps({ status: 'running' })
    expect(wrapper.find('.ui-tool-call-card__approval').exists()).toBe(false)
    await wrapper.setProps({ status: 'completed' })
    expect(wrapper.find('.ui-tool-call-card__approval').exists()).toBe(false)
    expect(wrapper.find('.ui-tool-call-card__status').text()).toBe('已完成')
  })

  it('拒绝流：reject 派发后使用方切到 failed，结果区代码块转 error 修饰', async () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'run_sql', status: 'waitingApproval' },
    })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('reject')).toHaveLength(1)

    await wrapper.setProps({ status: 'failed', result: 'Error: rejected by user' })
    expect(wrapper.classes()).toContain('ui-tool-call-card--failed')
    expect(wrapper.find('.ui-tool-call-card__code').classes()).toContain(
      'ui-tool-call-card__code--error',
    )
    expect(wrapper.find('.ui-tool-call-card__code').text()).toBe('Error: rejected by user')
  })

  it('args / result 响应式更新：序列化文本随 prop 重算', async () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x', args: { q: 1 } } })
    expect(wrapper.find('.ui-tool-call-card__code').text()).toBe('{\n  "q": 1\n}')
    await wrapper.setProps({ args: { q: 2, page: 3 } })
    expect(wrapper.find('.ui-tool-call-card__code').text()).toBe('{\n  "q": 2,\n  "page": 3\n}')

    // 结果区首次渲染
    expect(wrapper.findAll('.ui-tool-call-card__section')).toHaveLength(1)
    await wrapper.setProps({ result: 'ok' })
    expect(wrapper.findAll('.ui-tool-call-card__section')).toHaveLength(2)
    await wrapper.setProps({ result: undefined })
    expect(wrapper.findAll('.ui-tool-call-card__section')).toHaveLength(1)
  })

  it('duration 响应式更新：null 隐藏 → 数值展示', async () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x' } })
    expect(wrapper.find('.ui-tool-call-card__duration').exists()).toBe(false)
    await wrapper.setProps({ duration: 420 })
    expect(wrapper.find('.ui-tool-call-card__duration').text()).toBe('420ms')
    await wrapper.setProps({ duration: 5250 })
    expect(wrapper.find('.ui-tool-call-card__duration').text()).toBe('5.3s')
    await wrapper.setProps({ duration: null })
    expect(wrapper.find('.ui-tool-call-card__duration').exists()).toBe(false)
  })

  it('审批派发不携带额外副作用：卡片不自行流转状态（点击后徽标保持待审批）', async () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'x', status: 'waitingApproval' },
    })
    await wrapper.findAll('button')[0]!.trigger('click')
    // 组件不持有内部状态：徽标仍为「待审批」，流转责任在使用方
    expect(wrapper.find('.ui-tool-call-card__status').text()).toBe('待审批')
    expect(wrapper.classes()).toContain('ui-tool-call-card--waiting-approval')
    expect(wrapper.emitted('approve')).toHaveLength(1)
  })
})
