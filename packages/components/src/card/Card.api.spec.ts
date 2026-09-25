// api spec：props 默认值 / slots 渲染（Card 与 CardHeader/CardBody/CardFooter 组合）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Card from './Card.vue'
import CardBody from './CardBody.vue'
import CardFooter from './CardFooter.vue'
import CardHeader from './CardHeader.vue'

describe('Card api', () => {
  it('渲染 ui-card 根容器（div）', () => {
    const wrapper = mount(Card)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-card')
  })

  it('默认：shadow=none → ui-card--shadow-none，且根元素不携带阴影档以外的修饰', () => {
    const wrapper = mount(Card)
    expect(wrapper.classes()).toContain('ui-card--shadow-none')
    expect(wrapper.classes()).not.toContain('ui-card--shadow-rest')
  })

  it('shadow="rest"：ui-card--shadow-rest 修饰类落位', () => {
    const wrapper = mount(Card, { props: { shadow: 'rest' } })
    expect(wrapper.classes()).toContain('ui-card--shadow-rest')
    expect(wrapper.classes()).not.toContain('ui-card--shadow-none')
  })

  it('默认插槽渲染到 Card 根内', () => {
    const wrapper = mount(Card, { slots: { default: () => '正文内容' } })
    expect(wrapper.find('.ui-card').text()).toContain('正文内容')
  })

  it('CardHeader / CardBody / CardFooter：专属区块类与插槽内容渲染', () => {
    const wrapper = mount(Card, {
      slots: {
        default: () => [
          h(CardHeader, { key: 'h' }, { default: () => '部署概览' }),
          h(CardBody, { key: 'b' }, { default: () => '最近一次部署于 2 小时前完成。' }),
          h(CardFooter, { key: 'f' }, { default: () => '更新于 2 小时前' }),
        ],
      },
    })
    const header = wrapper.find('.ui-card__header')
    const body = wrapper.find('.ui-card__body')
    const footer = wrapper.find('.ui-card__footer')
    expect(header.exists()).toBe(true)
    expect(body.exists()).toBe(true)
    expect(footer.exists()).toBe(true)
    expect(header.text()).toBe('部署概览')
    expect(body.text()).toBe('最近一次部署于 2 小时前完成。')
    expect(footer.text()).toBe('更新于 2 小时前')
  })

  it('三个区块组件为 Card 根的直接子元素（区块间距依赖的 DOM 关系）', () => {
    const wrapper = mount(Card, {
      slots: {
        default: () => [
          h(CardHeader, { key: 'h' }, { default: () => '标题' }),
          h(CardBody, { key: 'b' }, { default: () => '正文' }),
          h(CardFooter, { key: 'f' }, { default: () => '底部' }),
        ],
      },
    })
    const root = wrapper.find('.ui-card').element
    expect(root.children).toHaveLength(3)
    expect(root.children[0]?.classList.contains('ui-card__header')).toBe(true)
    expect(root.children[1]?.classList.contains('ui-card__body')).toBe(true)
    expect(root.children[2]?.classList.contains('ui-card__footer')).toBe(true)
  })

  it('Card 单独使用（无区块组件）也渲染默认插槽内容', () => {
    const wrapper = mount(Card, { slots: { default: () => h('p', '只有正文') } })
    expect(wrapper.find('.ui-card p').text()).toBe('只有正文')
  })
})
