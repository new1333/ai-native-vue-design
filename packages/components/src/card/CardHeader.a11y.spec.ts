// a11y spec：泛型 div 区块语义（自 Card.a11y.spec.ts 移入的 CardHeader 断言）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import CardHeader from './CardHeader.vue'

describe('CardHeader a11y', () => {
  it('泛型 div 区块：无 role、不产生 banner 等语义', () => {
    const wrapper = mount(CardHeader, { slots: { default: () => h('h3', '部署概览') } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.classes()).toContain('ui-card__header')
  })

  it('标题语义由插槽内的原生标题元素承担（组件不代选层级）', () => {
    const wrapper = mount(CardHeader, { slots: { default: () => h('h3', '部署概览') } })
    const heading = wrapper.find('h3')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('部署概览')
  })

  it('插槽内容对读屏自然可读：无 aria-hidden、文本按文档流渲染', () => {
    const wrapper = mount(CardHeader, { slots: { default: () => '周报' } })
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.text()).toBe('周报')
  })
})
