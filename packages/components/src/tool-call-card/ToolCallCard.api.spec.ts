// api spec：props 默认值 / 状态档位映射 / emits 声明 / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import ToolCallCard from './ToolCallCard.vue'
import { TOOL_CALL_STATUS_LABELS } from './ToolCallCard.constants'
import type { ToolCallStatus } from './ToolCallCard.types'

describe('ToolCallCard api', () => {
  it('渲染 ui-tool-call-card 根容器（div）', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'web_search' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-tool-call-card')
  })

  it('默认 status=queued：根修饰 --queued、徽标 neutral 档、标签「排队中」', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'web_search' } })
    expect(wrapper.classes()).toContain('ui-tool-call-card--queued')
    const status = wrapper.find('.ui-tool-call-card__status')
    expect(status.classes()).toContain('ui-tool-call-card__status--neutral')
    expect(status.text()).toBe('排队中')
  })

  it.each([
    ['queued', 'neutral', 'ui-tool-call-card--queued'],
    ['running', 'info', 'ui-tool-call-card--running'],
    ['completed', 'success', 'ui-tool-call-card--completed'],
    ['failed', 'danger', 'ui-tool-call-card--failed'],
    ['waitingApproval', 'warning', 'ui-tool-call-card--waiting-approval'],
  ] as const)('status=%s：徽标 %s 档 + 根修饰类 + 内置标签', (status, variant, rootClass) => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x', status } })
    expect(wrapper.classes()).toContain(rootClass)
    const badge = wrapper.find('.ui-tool-call-card__status')
    expect(badge.classes()).toContain(`ui-tool-call-card__status--${variant}`)
    expect(badge.text()).toBe(TOOL_CALL_STATUS_LABELS[status as ToolCallStatus])
  })

  it('name 渲染于头部名称位', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'run_sql' } })
    expect(wrapper.find('.ui-tool-call-card__name').text()).toBe('run_sql')
  })

  it('args / result 未传：不渲染入参与结果区', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x' } })
    expect(wrapper.findAll('.ui-tool-call-card__section')).toHaveLength(0)
  })

  it('args 对象：JSON 两空格缩进展示于入参区', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x', args: { query: '纸面', limit: 5 } } })
    const sections = wrapper.findAll('.ui-tool-call-card__section')
    expect(sections).toHaveLength(1)
    expect(sections[0]!.find('.ui-tool-call-card__section-label').text()).toBe('入参')
    expect(sections[0]!.find('.ui-tool-call-card__code').text()).toBe(
      '{\n  "query": "纸面",\n  "limit": 5\n}',
    )
  })

  it('args 字符串：原样展示（不做 JSON 引号包装）', () => {
    const wrapper = mount(ToolCallCard, { props: { name: 'x', args: 'DELETE FROM users' } })
    expect(wrapper.find('.ui-tool-call-card__code').text()).toBe('DELETE FROM users')
  })

  it('result：结果区标签与内容渲染；failed 时代码块带 error 修饰类', () => {
    const ok = mount(ToolCallCard, {
      props: { name: 'x', args: { a: 1 }, result: 'done', status: 'completed' },
    })
    const sections = ok.findAll('.ui-tool-call-card__section')
    expect(sections).toHaveLength(2)
    expect(sections[1]!.find('.ui-tool-call-card__section-label').text()).toBe('结果')
    expect(sections[1]!.find('.ui-tool-call-card__code').text()).toBe('done')
    expect(sections[1]!.find('.ui-tool-call-card__code').classes()).not.toContain(
      'ui-tool-call-card__code--error',
    )

    const failed = mount(ToolCallCard, {
      props: { name: 'x', result: 'Error: denied', status: 'failed' },
    })
    expect(failed.find('.ui-tool-call-card__code').classes()).toContain(
      'ui-tool-call-card__code--error',
    )
  })

  it('duration 未传/null 不展示；850 → 850ms；1500 → 1.5s', () => {
    const none = mount(ToolCallCard, { props: { name: 'x' } })
    expect(none.find('.ui-tool-call-card__duration').exists()).toBe(false)

    const ms = mount(ToolCallCard, { props: { name: 'x', duration: 850 } })
    expect(ms.find('.ui-tool-call-card__duration').text()).toBe('850ms')

    const s = mount(ToolCallCard, { props: { name: 'x', duration: 1500 } })
    expect(s.find('.ui-tool-call-card__duration').text()).toBe('1.5s')
  })

  it('仅 waitingApproval 渲染审批按钮（批准/拒绝），disabled 传递原生 disabled', () => {
    const waiting = mount(ToolCallCard, { props: { name: 'x', status: 'waitingApproval' } })
    const buttons = waiting.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]!.text()).toBe('批准')
    expect(buttons[1]!.text()).toBe('拒绝')
    expect(buttons[0]!.attributes('disabled')).toBeUndefined()

    const other = mount(ToolCallCard, { props: { name: 'x', status: 'running' } })
    expect(other.findAll('button')).toHaveLength(0)

    const gated = mount(ToolCallCard, {
      props: { name: 'x', status: 'waitingApproval', disabled: true },
    })
    for (const button of gated.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined()
    }
  })

  it('emits 声明：approve / reject', () => {
    const emitsOption = (ToolCallCard as unknown as { emits?: string[] }).emits
    expect(emitsOption).toEqual(['approve', 'reject'])
  })

  it('#header 整体接管头部：内置名称与状态徽标不渲染', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'web_search', status: 'running' },
      slots: { header: () => h('div', { class: 'custom-header' }, '自定义头部') },
    })
    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-header').text()).toBe('自定义头部')
    expect(wrapper.find('.ui-tool-call-card__header').exists()).toBe(false)
    expect(wrapper.find('.ui-tool-call-card__name').exists()).toBe(false)
    expect(wrapper.find('.ui-tool-call-card__status').exists()).toBe(false)
  })

  it('#args / #result 覆盖区块内容：作用域提供原始值与内置序列化文本', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'x', args: { q: 1 }, result: '原始结果', status: 'completed' },
      slots: {
        args: ({ args, formatted }: { args: unknown; formatted: string }) =>
          h('div', { class: 'custom-args' }, `${JSON.stringify(args)}|${formatted}`),
        result: ({ formatted, status }: { formatted: string; status: ToolCallStatus }) =>
          h('div', { class: 'custom-result' }, `${formatted}|${status}`),
      },
    })
    expect(wrapper.find('.custom-args').text()).toBe('{"q":1}|{\n  "q": 1\n}')
    expect(wrapper.find('.custom-result').text()).toBe('原始结果|completed')
    // 区块标签仍由组件渲染
    expect(wrapper.find('.ui-tool-call-card__section-label').exists()).toBe(true)
  })

  it('#footer 渲染于卡片底部', () => {
    const wrapper = mount(ToolCallCard, {
      props: { name: 'x', status: 'failed' },
      slots: { footer: () => h('button', { type: 'button', class: 'retry' }, '重试') },
    })
    expect(wrapper.find('button.retry').exists()).toBe(true)
    expect(wrapper.find('.ui-tool-call-card__footer').text()).toBe('重试')
  })
})
