// behavior spec：插槽内容响应式更新（结构区块，无自有交互）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import CardBody from './CardBody.vue'

describe('CardBody behavior', () => {
  it('插槽内容响应式更新：宿主状态变化即时反映到区块内容', async () => {
    const Host = defineComponent({
      props: { text: { type: String, required: true } },
      setup: (props) => () => h(CardBody, null, { default: () => props.text }),
    })
    const wrapper = mount(Host, { props: { text: '第一版正文' } })
    expect(wrapper.find('.ui-card__body').text()).toBe('第一版正文')
    await wrapper.setProps({ text: '第二版正文' })
    expect(wrapper.find('.ui-card__body').text()).toBe('第二版正文')
  })
})
