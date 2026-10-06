// behavior spec：插槽内容响应式更新（结构区块，无自有交互）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import CardHeader from './CardHeader.vue'

describe('CardHeader behavior', () => {
  it('插槽内容响应式更新：宿主状态变化即时反映到区块内容', async () => {
    const Host = defineComponent({
      props: { title: { type: String, required: true } },
      setup: (props) => () => h(CardHeader, null, { default: () => props.title }),
    })
    const wrapper = mount(Host, { props: { title: '第一版标题' } })
    expect(wrapper.find('.ui-card__header').text()).toBe('第一版标题')
    await wrapper.setProps({ title: '第二版标题' })
    expect(wrapper.find('.ui-card__header').text()).toBe('第二版标题')
  })
})
