// api spec：props 默认值 / 组根类 / size 共享与覆盖 / slots 渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Button from './Button.vue'
import ButtonGroup from './ButtonGroup.vue'

describe('ButtonGroup api', () => {
  it('渲染组根容器（div）并携带 ui-button-group 根类', () => {
    const wrapper = mount(ButtonGroup, { slots: { default: () => [h(Button, { key: 'a' })] } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-button-group')
  })

  it('渲染组根类，组内 Button 未声明 size 时共享组 size', () => {
    const wrapper = mount(ButtonGroup, {
      props: { size: 'sm' },
      slots: { default: () => [h(Button, { key: 'a' }), h(Button, { key: 'b' })] },
    })
    expect(wrapper.classes()).toContain('ui-button-group')
    const buttons = wrapper.findAll('button.ui-button')
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      expect(button.classes()).toContain('ui-button--sm')
    }
  })

  it('组内 Button 显式 size 覆盖组 size；未声明 size 的回落 md', () => {
    const grouped = mount(ButtonGroup, {
      props: { size: 'sm' },
      slots: { default: () => [h(Button, { key: 'a', size: 'lg' })] },
    })
    expect(grouped.find('button.ui-button').classes()).toContain('ui-button--lg')

    const ungrouped = mount(ButtonGroup, {
      slots: { default: () => [h(Button, { key: 'a' })] },
    })
    expect(ungrouped.find('button.ui-button').classes()).toContain('ui-button--md')
  })
})
