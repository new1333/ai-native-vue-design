// a11y spec：Card 为静态泛型容器——无 role/landmark 劫持、不参与 Tab 序、内容自然可读。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Card from './Card.vue'
import CardBody from './CardBody.vue'
import CardHeader from './CardHeader.vue'

describe('Card a11y', () => {
  it('Card 为泛型容器：无 role、不产生 landmark 语义', () => {
    const wrapper = mount(Card)
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('Card 不可聚焦：无 tabindex，不参与 Tab 序', () => {
    expect(mount(Card).attributes('tabindex')).toBeUndefined()
  })

  it('CardHeader / CardBody：泛型 div 区块，无 role、不产生 banner 等语义', () => {
    const wrapper = mount(Card, {
      slots: {
        default: () => [
          h(CardHeader, null, { default: () => h('h3', '部署概览') }),
          h(CardBody, null, { default: () => '正文' }),
        ],
      },
    })
    expect(wrapper.find('.ui-card__header').attributes('role')).toBeUndefined()
    expect(wrapper.find('.ui-card__body').attributes('role')).toBeUndefined()
  })

  it('标题语义由插槽内的原生标题元素承担（组件不代选层级）', () => {
    const wrapper = mount(Card, {
      slots: {
        default: () => h(CardHeader, null, { default: () => h('h3', '部署概览') }),
      },
    })
    const heading = wrapper.find('.ui-card__header h3')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('部署概览')
  })

  it('插槽内容对读屏自然可读：文本按文档流渲染，无 aria-hidden', () => {
    const wrapper = mount(Card, {
      slots: { default: () => h(CardBody, null, { default: () => '最近一次部署完成。' }) },
    })
    const body = wrapper.find('.ui-card__body')
    expect(body.attributes('aria-hidden')).toBeUndefined()
    expect(body.text()).toBe('最近一次部署完成。')
  })

  it('内部交互元素保持原生键盘可达：组件不改写其 tabindex', () => {
    const wrapper = mount(Card, {
      slots: { default: () => h('button', { type: 'button' }, '查看日志') },
    })
    const button = wrapper.find('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('tabindex')).toBeUndefined()
  })
})
