// a11y spec：role=status + aria-live=polite / 指示器纯装饰 / 文本承载语义 / 不可聚焦。
// 组件为纯展示 live region，无键盘激活路径；断言其不产生可聚焦/伪交互语义。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import AgentStatus from './AgentStatus.vue'

describe('AgentStatus a11y', () => {
  it('live region：根元素 role="status" + aria-live="polite"，状态变化即被读屏播报', () => {
    const wrapper = mount(AgentStatus, { props: { status: 'running' } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('状态语义由文本承载：failed 状态文本"已失败"在 live region 内（不只靠颜色/图形）', () => {
    const wrapper = mount(AgentStatus, { props: { status: 'failed' } })
    expect(wrapper.text()).toContain('已失败')
    const label = wrapper.find('.ui-agent-status__label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('已失败')
  })

  it('前置指示区整体 aria-hidden="true"（运行态 Spinner / 静态圆点均为纯装饰）', () => {
    const running = mount(AgentStatus, { props: { status: 'running' } })
    const runningIcon = running.find('.ui-agent-status__icon')
    expect(runningIcon.attributes('aria-hidden')).toBe('true')
    expect(runningIcon.find('.ui-spinner').exists()).toBe(true)

    const completed = mount(AgentStatus, { props: { status: 'completed' } })
    const dot = completed.find('.ui-agent-status__dot')
    expect(dot.exists()).toBe(true)
    expect(completed.find('.ui-agent-status__icon').attributes('aria-hidden')).toBe('true')
  })

  it('#icon 插槽内容同样落在 aria-hidden 装饰区内', () => {
    const wrapper = mount(AgentStatus, {
      props: { status: 'completed' },
      slots: { icon: () => h('svg', { 'data-testid': 'icon' }) },
    })
    const iconArea = wrapper.find('.ui-agent-status__icon')
    expect(iconArea.attributes('aria-hidden')).toBe('true')
    expect(iconArea.find('[data-testid="icon"]').exists()).toBe(true)
  })

  it('不可聚焦：无 tabindex，非交互元素不进入 Tab 序', () => {
    const wrapper = mount(AgentStatus, { props: { status: 'running' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('无键盘路径：组件内不存在 button / a 等可激活元素（重试/停止由外部组合）', () => {
    const wrapper = mount(AgentStatus, { props: { status: 'waitingForTool' } })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('detail 补充行不脱离 live region：随根 role=status 一并可达', () => {
    const wrapper = mount(AgentStatus, { props: { status: 'failed', detail: 'get_weather 返回 500' } })
    expect(wrapper.find('.ui-agent-status__detail').exists()).toBe(true)
    expect(wrapper.find('[aria-hidden="true"]').text()).not.toContain('get_weather')
  })
})
