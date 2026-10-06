// api spec：区块根类 / 默认插槽渲染（自 Card.api.spec.ts 移入的 CardHeader 断言）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import CardHeader from './CardHeader.vue'

describe('CardHeader api', () => {
  it('渲染 div 区块根 ui-card__header 并承载默认插槽内容', () => {
    const wrapper = mount(CardHeader, { slots: { default: () => '部署概览' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-card__header')
    expect(wrapper.text()).toBe('部署概览')
  })

  it('纯插槽驱动：无 props / emits，插槽可为任意内容（如原生标题元素）', () => {
    const wrapper = mount(CardHeader, { slots: { default: () => h('h3', '标题') } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.find('h3').text()).toBe('标题')
  })
})
