// a11y spec：静态语义（无 role/tabindex） / 装饰图标不进可读内容 / action 键盘路径原生可达。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import EmptyState from './EmptyState.vue'

describe('EmptyState a11y', () => {
  it('根为普通 div：不设 role / tabindex / aria-live（静态占位不抢读屏注意力）', () => {
    const wrapper = mount(EmptyState, { props: { title: '暂无数据' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('aria-live')).toBeUndefined()
  })

  it('标题与说明为根内可读文本', () => {
    const wrapper = mount(EmptyState, {
      props: { title: '暂无数据', description: '创建第一条记录试试。' },
    })
    expect(wrapper.text()).toContain('暂无数据')
    expect(wrapper.text()).toContain('创建第一条记录试试。')
  })

  it('内建图标 svg aria-hidden="true"（装饰性，不进入可读内容）', () => {
    const wrapper = mount(EmptyState)
    const svg = wrapper.find('.ui-empty-state__icon-svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('focusable')).toBe('false')
  })

  it('action 内使用方按钮为原生 <button>（Tab 自然可达、Enter/Space 平台原生激活）', () => {
    const wrapper = mount(EmptyState, {
      slots: { action: () => h('button', { type: 'button' }, '新建记录') },
    })
    const button = wrapper.find('.ui-empty-state__action button')
    expect(button.exists()).toBe(true)
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('tabindex')).toBeUndefined()
  })

  it('action 键盘路径未被阻止：Enter / Space keydown 不被 preventDefault，点击可激活', async () => {
    const activated: string[] = []
    const wrapper = mount(EmptyState, {
      slots: {
        action: () =>
          h('button', { type: 'button', onClick: () => activated.push('go') }, '下一步'),
      },
    })
    const button = wrapper.find('.ui-empty-state__action button').element
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    button.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    button.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false)
    await wrapper.find('.ui-empty-state__action button').trigger('click')
    expect(activated).toEqual(['go'])
  })

  it('icon 插槽替换后组件不加可读文案（装饰语义由使用方 svg 自行 aria-hidden）', () => {
    const wrapper = mount(EmptyState, {
      slots: { icon: () => h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }) },
    })
    expect(wrapper.find('.ui-empty-state__icon-svg').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })
})
