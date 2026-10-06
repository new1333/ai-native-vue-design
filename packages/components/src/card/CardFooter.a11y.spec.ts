// a11y spec：泛型 div 区块语义（对齐 CardHeader/CardBody 的区块 a11y 契约）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CardFooter from './CardFooter.vue'

describe('CardFooter a11y', () => {
  it('泛型 div 区块：无 role、不产生 contentinfo 等语义', () => {
    const wrapper = mount(CardFooter, { slots: { default: () => '更新于 2 小时前' } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.classes()).toContain('ui-card__footer')
  })

  it('插槽内容对读屏自然可读：无 aria-hidden、文本按文档流渲染', () => {
    const wrapper = mount(CardFooter, { slots: { default: () => '更新于 2 小时前' } })
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.text()).toBe('更新于 2 小时前')
  })
})
