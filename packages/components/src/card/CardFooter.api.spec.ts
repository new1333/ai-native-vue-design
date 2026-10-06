// api spec：区块根类 / 默认插槽渲染（自 Card.api.spec.ts 移入的 CardFooter 断言）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CardFooter from './CardFooter.vue'

describe('CardFooter api', () => {
  it('渲染 div 区块根 ui-card__footer 并承载默认插槽内容', () => {
    const wrapper = mount(CardFooter, { slots: { default: () => '更新于 2 小时前' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-card__footer')
    expect(wrapper.text()).toBe('更新于 2 小时前')
  })

  it('纯插槽驱动：无 props / emits，插槽可为任意内容', () => {
    const wrapper = mount(CardFooter, { slots: { default: () => '底部' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.find('.ui-card__footer').text()).toBe('底部')
  })
})
