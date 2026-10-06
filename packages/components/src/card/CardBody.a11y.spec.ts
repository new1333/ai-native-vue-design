// a11y spec：泛型 div 区块语义（自 Card.a11y.spec.ts 移入的 CardBody 断言）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CardBody from './CardBody.vue'

describe('CardBody a11y', () => {
  it('泛型 div 区块：无 role、不产生语义劫持', () => {
    const wrapper = mount(CardBody, { slots: { default: () => '正文' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.classes()).toContain('ui-card__body')
  })

  it('插槽内容对读屏自然可读：文本按文档流渲染，无 aria-hidden', () => {
    const wrapper = mount(CardBody, { slots: { default: () => '最近一次部署完成。' } })
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.text()).toBe('最近一次部署完成。')
  })
})
