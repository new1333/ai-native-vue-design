// a11y spec：role=group 分组语义 / attrs 透传命名 / 组内按钮键盘可达。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Button from './Button.vue'
import ButtonGroup from './ButtonGroup.vue'

describe('ButtonGroup a11y', () => {
  it('role="group" 提供分组语义（aria-label 经 attrs 命名分组）', () => {
    const wrapper = mount(ButtonGroup, {
      attrs: { 'aria-label': '行操作' },
      slots: { default: () => [h(Button, { key: 'a' }), h(Button, { key: 'b' })] },
    })
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('行操作')
    expect(wrapper.findAll('button')).toHaveLength(2)
  })

  it('组容器不改写子按钮 tabindex：组内按钮自然进入 Tab 序', () => {
    const wrapper = mount(ButtonGroup, {
      slots: { default: () => [h(Button, { key: 'a' }), h(Button, { key: 'b' })] },
    })
    for (const button of wrapper.findAll('button.ui-button')) {
      expect(button.attributes('tabindex')).toBeUndefined()
    }
  })
})
