// behavior spec：Card 为静态容器——验证 prop 驱动的阴影档位切换与插槽内容的响应式更新。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Card from './Card.vue'
import CardBody from './CardBody.vue'
import CardFooter from './CardFooter.vue'
import CardHeader from './CardHeader.vue'

describe('Card behavior', () => {
  it('shadow 切换：none → rest → none，修饰类随之切换（静止面默认无阴影）', async () => {
    const wrapper = mount(Card)
    expect(wrapper.classes()).toContain('ui-card--shadow-none')
    await wrapper.setProps({ shadow: 'rest' })
    expect(wrapper.classes()).toContain('ui-card--shadow-rest')
    expect(wrapper.classes()).not.toContain('ui-card--shadow-none')
    await wrapper.setProps({ shadow: 'none' })
    expect(wrapper.classes()).toContain('ui-card--shadow-none')
    expect(wrapper.classes()).not.toContain('ui-card--shadow-rest')
  })

  it('默认插槽内容响应式更新', async () => {
    const Host = defineComponent({
      props: { text: { type: String, required: true } },
      setup: (props) => () => h(Card, null, { default: () => props.text }),
    })
    const wrapper = mount(Host, { props: { text: '第一版' } })
    expect(wrapper.find('.ui-card').text()).toBe('第一版')
    await wrapper.setProps({ text: '第二版' })
    expect(wrapper.find('.ui-card').text()).toBe('第二版')
  })

  it('区块组合的增删即时反映到 Card 根的直接子元素序列', async () => {
    const Host = defineComponent({
      props: { withFooter: { type: Boolean, default: false } },
      setup: (props) => () =>
        h(Card, null, {
          default: () => [
            h(CardHeader, { key: 'h' }, { default: () => '标题' }),
            h(CardBody, { key: 'b' }, { default: () => '正文' }),
            ...(props.withFooter
              ? [h(CardFooter, { key: 'f' }, { default: () => '底部' })]
              : []),
          ],
        }),
    })
    const wrapper = mount(Host)
    expect(wrapper.find('.ui-card').element.children).toHaveLength(2)
    await wrapper.setProps({ withFooter: true })
    expect(wrapper.find('.ui-card').element.children).toHaveLength(3)
    expect(wrapper.find('.ui-card__footer').exists()).toBe(true)
  })

  it('Card 不拦截内部交互元素的事件：内部 button 点击回调正常触发', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Card, {
      slots: { default: () => h('button', { class: 'inner-btn', onClick }, '内部按钮') },
    })
    const bubbled: Event[] = []
    wrapper.find('.ui-card').element.addEventListener('click', (e) => bubbled.push(e))
    await wrapper.find('button.inner-btn').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    // 不拦截：click 冒泡穿过 Card 根，未被 stopPropagation / preventDefault
    expect(bubbled).toHaveLength(1)
    expect(bubbled[0]?.defaultPrevented).toBe(false)
    // Card 自身不声明 click：test-utils 会把冒泡到根元素的原生 DOM click 记入 emitted()
    // （attachNativeEventListener），故按 EmptyState.behavior.spec 先例断言 emits 选项本身
    const emitsOption = (Card as unknown as { emits?: Record<string, unknown> }).emits
    expect(emitsOption).toBeUndefined()
  })
})
