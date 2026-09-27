// a11y spec：role=status 可访问名契约 / 图形 aria-hidden / 非交互不进 Tab 序（无键盘路径）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Spinner from './Spinner.vue'

describe('Spinner a11y', () => {
  it('根元素恒 role="status"（polite live region），两种变体一致', () => {
    expect(mount(Spinner, { props: { label: '加载中' } }).attributes('role')).toBe('status')
    expect(
      mount(Spinner, { props: { label: '加载中', variant: 'dots' } }).attributes('role'),
    ).toBe('status')
  })

  it('label 必配：sr-only 文本进入 status 区域，读屏可播报', () => {
    const wrapper = mount(Spinner, { props: { label: '正在导出文件' } })
    expect(wrapper.find('.ui-spinner__label').text()).toBe('正在导出文件')
  })

  it('#label 插槽内容同样渲染在 status 区域内（覆盖默认文本）', () => {
    const wrapper = mount(Spinner, {
      props: { label: '加载中' },
      slots: { label: '正在同步，剩余 3 项' },
    })
    expect(wrapper.find('.ui-spinner__label').text()).toBe('正在同步，剩余 3 项')
  })

  it('图形本体对读屏隐藏：svg 与 dots 均 aria-hidden="true"', () => {
    const spin = mount(Spinner, { props: { label: '加载中' } })
    expect(spin.find('.ui-spinner__svg').attributes('aria-hidden')).toBe('true')

    const dots = mount(Spinner, { props: { label: '加载中', variant: 'dots' } })
    for (const dot of dots.findAll('.ui-spinner__dot')) {
      expect(dot.attributes('aria-hidden')).toBe('true')
    }
  })

  it('非交互：无 tabindex、不进入 Tab 序、无可聚焦后代（组件无键盘路径）', () => {
    const wrapper = mount(Spinner, { props: { label: '加载中' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('[tabindex]').exists()).toBe(false)
    expect(wrapper.find('button, a, input, select, textarea').exists()).toBe(false)
  })

  it('刻意不使用量值进度语义：progressbar / aria-valuenow 属于 Progress', () => {
    const wrapper = mount(Spinner, { props: { label: '加载中' } })
    expect(wrapper.attributes('role')).not.toBe('progressbar')
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })
})
