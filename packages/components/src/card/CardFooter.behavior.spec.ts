// behavior spec：插槽内容响应式更新 / 区块增删即时反映（结构区块，无自有交互）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Card from './Card.vue'
import CardFooter from './CardFooter.vue'

describe('CardFooter behavior', () => {
  it('插槽内容响应式更新：宿主状态变化即时反映到区块内容', async () => {
    const Host = defineComponent({
      props: { text: { type: String, required: true } },
      setup: (props) => () => h(CardFooter, null, { default: () => props.text }),
    })
    const wrapper = mount(Host, { props: { text: '更新于 1 小时前' } })
    expect(wrapper.find('.ui-card__footer').text()).toBe('更新于 1 小时前')
    await wrapper.setProps({ text: '更新于 2 小时前' })
    expect(wrapper.find('.ui-card__footer').text()).toBe('更新于 2 小时前')
  })

  it('区块增删即时反映：footer 随宿主条件渲染出现/消失', async () => {
    const Host = defineComponent({
      props: { withFooter: { type: Boolean, default: false } },
      setup: (props) => () =>
        h(Card, null, {
          default: () => [
            h('p', { key: 'body' }, '正文'),
            ...(props.withFooter ? [h(CardFooter, { key: 'f' }, { default: () => '底部' })] : []),
          ],
        }),
    })
    const wrapper = mount(Host)
    expect(wrapper.find('.ui-card__footer').exists()).toBe(false)
    await wrapper.setProps({ withFooter: true })
    expect(wrapper.find('.ui-card__footer').exists()).toBe(true)
    await wrapper.setProps({ withFooter: false })
    expect(wrapper.find('.ui-card__footer').exists()).toBe(false)
  })
})
