// behavior spec：props 响应式切换（形状 / 行数 / 尺寸）驱动的 DOM 变化。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Skeleton from './Skeleton.vue'

describe('Skeleton behavior', () => {
  it('variant 响应式切换：line ↔ circle ↔ rect 重建结构', async () => {
    const wrapper = mount(Skeleton, { props: { lines: 2 } })
    expect(wrapper.findAll('.ui-skeleton__line')).toHaveLength(2)

    await wrapper.setProps({ variant: 'circle' })
    expect(wrapper.classes()).toContain('ui-skeleton--circle')
    expect(wrapper.find('.ui-skeleton__line').exists()).toBe(false)

    await wrapper.setProps({ variant: 'rect' })
    expect(wrapper.classes()).toContain('ui-skeleton--rect')

    await wrapper.setProps({ variant: 'line' })
    expect(wrapper.classes()).toContain('ui-skeleton--line')
    expect(wrapper.findAll('.ui-skeleton__line')).toHaveLength(2)
  })

  it('lines 响应式：行数随 props 增减', async () => {
    const wrapper = mount(Skeleton)
    expect(wrapper.findAll('.ui-skeleton__line')).toHaveLength(3)
    await wrapper.setProps({ lines: 6 })
    expect(wrapper.findAll('.ui-skeleton__line')).toHaveLength(6)
    await wrapper.setProps({ lines: 1 })
    expect(wrapper.findAll('.ui-skeleton__line')).toHaveLength(1)
  })

  it('末行短尾：lines>1 时仅最后一行带 --last；单行无短尾', () => {
    const multi = mount(Skeleton, { props: { lines: 4 } })
    const lines = multi.findAll('.ui-skeleton__line')
    expect(lines[3].classes()).toContain('ui-skeleton__line--last')
    expect(lines[0].classes()).not.toContain('ui-skeleton__line--last')
    expect(lines[1].classes()).not.toContain('ui-skeleton__line--last')

    const single = mount(Skeleton, { props: { lines: 1 } })
    expect(single.find('.ui-skeleton__line--last').exists()).toBe(false)
  })

  it('width 响应式：内联尺寸随 props 更新（数字 px / 字符串原样）', async () => {
    const wrapper = mount(Skeleton, { props: { variant: 'rect' } })
    const el = wrapper.element as HTMLElement
    expect(el.style.width).toBe('')
    await wrapper.setProps({ width: 240 })
    expect(el.style.width).toBe('240px')
    await wrapper.setProps({ width: '50%' })
    expect(el.style.width).toBe('50%')
  })

  it('height 响应式：line 行高随 props 更新到每一行', async () => {
    const wrapper = mount(Skeleton, { props: { lines: 2 } })
    await wrapper.setProps({ height: 20 })
    for (const line of wrapper.findAll('.ui-skeleton__line')) {
      expect((line.element as HTMLElement).style.height).toBe('20px')
    }
  })
})
