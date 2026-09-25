// a11y spec：图片态 alt 可读名称 / 回退态 role="img" + aria-label / 非交互不占焦点。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from './Avatar.vue'

describe('Avatar a11y', () => {
  it('图片态：<img> 携带必填 alt；根元素无 role/aria-label（不与 img 重复播报）', () => {
    const wrapper = mount(Avatar, { props: { src: '/u/zhang.png', alt: '张三' } })
    expect(wrapper.find('img.ui-avatar__img').attributes('alt')).toBe('张三')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  it('回退态：根元素 role="img" + aria-label=alt 提供可读名称', () => {
    const wrapper = mount(Avatar, { props: { name: 'Zhang San', alt: '张三' } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('张三')
  })

  it('回退首字母为装饰性文本：aria-hidden="true"，不进入可读内容', () => {
    const wrapper = mount(Avatar, { props: { name: 'Zhang San', alt: '张三' } })
    const fallback = wrapper.find('.ui-avatar__fallback')
    expect(fallback.attributes('aria-hidden')).toBe('true')
  })

  it('图片失败进入回退态：可读名称仍由根元素 aria-label 承担', async () => {
    const wrapper = mount(Avatar, { props: { src: '/u/broken.png', alt: '张三' } })
    await wrapper.find('img').trigger('error')
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('张三')
    expect(wrapper.find('.ui-avatar__fallback').attributes('aria-hidden')).toBe('true')
  })

  it('非交互：无 tabindex、无 aria-disabled，不参与 Tab 序', () => {
    const wrapper = mount(Avatar, { props: { name: '纸面', alt: '纸面' } })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBeUndefined()
  })

  it('alt 为空串时回退态仍显式输出 aria-label 属性（由使用方保证可读名称质量）', () => {
    const wrapper = mount(Avatar, { props: { name: '纸面', alt: '' } })
    expect(wrapper.attributes('aria-label')).toBe('')
  })
})
