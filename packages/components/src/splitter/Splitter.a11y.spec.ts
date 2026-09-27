// a11y spec：role=separator 契约（aria-orientation / aria-value* / aria-controls / aria-label）
// 与 WAI-ARIA window splitter 键盘路径（←→ / Home / End / Enter）的行为断言。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Splitter from './Splitter.vue'
import SplitterPane from './SplitterPane.vue'

function mountPanes(props: Record<string, unknown> = {}, paneCount = 2) {
  return mount(Splitter, {
    props,
    slots: {
      default: () =>
        Array.from({ length: paneCount }, (_, i) =>
          h(SplitterPane, { key: i }, { default: () => `面板 ${i}` }),
        ),
    },
  })
}

describe('Splitter a11y', () => {
  it('分隔条 role="separator" 且可聚焦（tabindex=0，WAI-ARIA window splitter）', () => {
    const wrapper = mountPanes()
    const handle = wrapper.find('.ui-splitter__handle')
    expect(handle.attributes('role')).toBe('separator')
    expect(handle.attributes('tabindex')).toBe('0')
  })

  it('aria-orientation 与分割方向互补：horizontal 分栏 → vertical；vertical 分栏 → horizontal', () => {
    const horizontal = mountPanes()
    expect(horizontal.find('.ui-splitter__handle').attributes('aria-orientation')).toBe('vertical')
    const vertical = mountPanes({ direction: 'vertical' })
    expect(vertical.find('.ui-splitter__handle').attributes('aria-orientation')).toBe('horizontal')
  })

  it('aria-value 契约：默认 50 位置（valuemin 0 / valuemax 100 / valuetext 50%）', () => {
    const wrapper = mountPanes()
    const handle = wrapper.find('.ui-splitter__handle')
    expect(handle.attributes('aria-valuenow')).toBe('50')
    expect(handle.attributes('aria-valuemin')).toBe('0')
    expect(handle.attributes('aria-valuemax')).toBe('100')
    expect(handle.attributes('aria-valuetext')).toBe('50%')
  })

  it('panes 约束进入 aria-valuemin/aria-valuemax（主面板生效范围）', () => {
    const wrapper = mountPanes({ panes: [{ min: 20, max: 70 }] })
    const handle = wrapper.find('.ui-splitter__handle')
    expect(handle.attributes('aria-valuemin')).toBe('20')
    expect(handle.attributes('aria-valuemax')).toBe('70')
  })

  it('aria-controls 指向主面板 id，且该 id 在渲染树中真实存在', () => {
    const wrapper = mountPanes()
    const handle = wrapper.find('.ui-splitter__handle')
    const controls = handle.attributes('aria-controls')
    expect(controls).toBeDefined()
    const pane0 = wrapper.find(`[id="${controls}"]`)
    expect(pane0.exists()).toBe(true)
    expect(pane0.classes()).toContain('ui-splitter__pane')
  })

  it('aria-label：缺省内置文案，panes[i].label 覆盖', () => {
    const plain = mountPanes()
    expect(plain.find('.ui-splitter__handle').attributes('aria-label')).toBe('调整面板尺寸')
    const labeled = mountPanes({ panes: [{ label: '侧栏尺寸' }] })
    expect(labeled.find('.ui-splitter__handle').attributes('aria-label')).toBe('侧栏尺寸')
  })

  it('键盘 ←：主面板减小，aria-valuenow 同步并 preventDefault（防页面滚动）', async () => {
    const wrapper = mountPanes()
    const handle = wrapper.find('.ui-splitter__handle').element
    const left = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
    handle.dispatchEvent(left)
    expect(left.defaultPrevented).toBe(true)
    await nextTick()
    expect(wrapper.find('.ui-splitter__handle').attributes('aria-valuenow')).toBe('49')
    const right = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    handle.dispatchEvent(right)
    await nextTick()
    expect(wrapper.find('.ui-splitter__handle').attributes('aria-valuenow')).toBe('50')
  })

  it('非本方向的方向键（horizontal 下的 ↑）不响应、不 preventDefault', async () => {
    const wrapper = mountPanes()
    const handle = wrapper.find('.ui-splitter__handle').element
    const up = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    handle.dispatchEvent(up)
    expect(up.defaultPrevented).toBe(false)
    await nextTick()
    expect(wrapper.find('.ui-splitter__handle').attributes('aria-valuenow')).toBe('50')
  })

  it('键盘 Home / End：aria-valuenow 落到生效 min / max', async () => {
    const wrapper = mountPanes({ panes: [{ min: 20, max: 80 }] })
    const handle = wrapper.find('.ui-splitter__handle')
    await handle.trigger('keydown', { key: 'Home' })
    expect(handle.attributes('aria-valuenow')).toBe('20')
    await handle.trigger('keydown', { key: 'End' })
    expect(handle.attributes('aria-valuenow')).toBe('80')
  })

  it('键盘 Enter：可折叠主面板折叠为 0（valuenow 0 + --collapsed），再 Enter 恢复 50', async () => {
    const wrapper = mountPanes({ panes: [{ collapsible: true }] })
    const handle = wrapper.find('.ui-splitter__handle')
    await handle.trigger('keydown', { key: 'Enter' })
    expect(handle.attributes('aria-valuenow')).toBe('0')
    expect(wrapper.findAll('.ui-splitter__pane')[0]!.classes()).toContain(
      'ui-splitter__pane--collapsed',
    )
    await handle.trigger('keydown', { key: 'Enter' })
    expect(handle.attributes('aria-valuenow')).toBe('50')
    expect(wrapper.findAll('.ui-splitter__pane')[0]!.classes()).not.toContain(
      'ui-splitter__pane--collapsed',
    )
  })

  it('折叠面板隐藏但不被 aria-hidden 伪造；面板区域无 role 劫持', () => {
    const wrapper = mountPanes({ modelValue: [0, 100] })
    const pane0 = wrapper.findAll('.ui-splitter__pane')[0]!
    expect(pane0.classes()).toContain('ui-splitter__pane--collapsed')
    expect(pane0.attributes('aria-hidden')).toBeUndefined()
    expect(pane0.attributes('role')).toBeUndefined()
    expect(wrapper.find('.ui-splitter__pane-content').attributes('role')).toBeUndefined()
  })

  it('多分隔条各自携带独立 aria 位置契约（各自主面板的 min）', () => {
    const wrapper = mountPanes({ panes: [{ min: 10 }, { min: 25 }, {}] }, 3)
    const handles = wrapper.findAll('.ui-splitter__handle')
    expect(handles).toHaveLength(2)
    expect(handles[0]!.attributes('aria-valuemin')).toBe('10')
    expect(handles[1]!.attributes('aria-valuemin')).toBe('25')
  })
})
