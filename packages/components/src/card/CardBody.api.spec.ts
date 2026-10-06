// api spec：区块根类 / 默认插槽渲染（自 Card.api.spec.ts 移入的 CardBody 断言）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CardBody from './CardBody.vue'

describe('CardBody api', () => {
  it('渲染 div 区块根 ui-card__body 并承载默认插槽内容', () => {
    const wrapper = mount(CardBody, { slots: { default: () => '最近一次部署于 2 小时前完成。' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-card__body')
    expect(wrapper.text()).toBe('最近一次部署于 2 小时前完成。')
  })

  it('纯插槽驱动：无 props / emits，插槽可为任意内容', () => {
    const wrapper = mount(CardBody, { slots: { default: () => '正文' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.find('.ui-card__body').text()).toBe('正文')
  })
})
