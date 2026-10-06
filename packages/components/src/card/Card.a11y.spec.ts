// a11y spec：Card 为静态泛型容器——无 role/landmark 劫持、不参与 Tab 序、内容自然可读
//（CardHeader/CardBody/CardFooter 的区块断言见各自 *.{api,a11y}.spec.ts）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Card from './Card.vue'

describe('Card a11y', () => {
  it('Card 为泛型容器：无 role、不产生 landmark 语义', () => {
    const wrapper = mount(Card)
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('Card 不可聚焦：无 tabindex，不参与 Tab 序', () => {
    expect(mount(Card).attributes('tabindex')).toBeUndefined()
  })

  it('插槽内容对读屏自然可读：文本按文档流渲染，无 aria-hidden', () => {
    const wrapper = mount(Card, { slots: { default: () => '最近一次部署完成。' } })
    const root = wrapper.find('.ui-card')
    expect(root.attributes('aria-hidden')).toBeUndefined()
    expect(root.text()).toBe('最近一次部署完成。')
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
