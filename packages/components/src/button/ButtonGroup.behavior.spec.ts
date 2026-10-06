// behavior spec：连排 DOM 关系 / 组 size 响应式共享 / 子按钮独立交互 / 不承载选中态。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Button from './Button.vue'
import ButtonGroup from './ButtonGroup.vue'

describe('ButtonGroup behavior', () => {
  it('子按钮为组容器直接子元素（连排圆角依赖的 DOM 关系）', () => {
    const wrapper = mount(ButtonGroup, {
      slots: { default: () => [h(Button, { key: 'a' }), h(Button, { key: 'b' })] },
    })
    const group = wrapper.find('.ui-button-group')
    expect(group.element.children).toHaveLength(2)
    expect(group.element.children[0]?.tagName).toBe('BUTTON')
    expect(group.element.children[1]?.tagName).toBe('BUTTON')
  })

  it('组 size 变化时组内未声明 size 的 Button 跟随（响应式共享）', async () => {
    const wrapper = mount(ButtonGroup, {
      props: { size: 'sm' },
      slots: { default: () => [h(Button, { key: 'a' })] },
    })
    expect(wrapper.find('button.ui-button').classes()).toContain('ui-button--sm')
    await wrapper.setProps({ size: 'lg' })
    expect(wrapper.find('button.ui-button').classes()).toContain('ui-button--lg')
  })

  it('组内各 Button 独立触发自身 click，互不串扰', async () => {
    const clicks: string[] = []
    const Host = defineComponent({
      setup: () => () =>
        h(
          ButtonGroup,
          { size: 'sm' },
          {
            default: () => [
              h(Button, { key: 'a', onClick: () => clicks.push('a') }),
              h(Button, { key: 'b', onClick: () => clicks.push('b') }),
            ],
          },
        ),
    })
    const wrapper = mount(Host)
    const buttons = wrapper.findAll('button.ui-button')
    expect(buttons).toHaveLength(2)
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    await buttons[1].trigger('click')
    expect(clicks).toEqual(['a', 'b', 'b'])
  })

  it('点击后立即检查也无持久选中态（不承载选中语义）', async () => {
    // ButtonGroup 不承载选中语义（ButtonGroup.meta.ts：分段选择应使用专用组件）。
    // 组内 Button 的灰底是 :hover/--ui-surface-muted 瞬时态，点击不得引入任何
    // 持久选中标记（选中类 / aria-pressed / aria-selected / aria-checked）。
    // 此用例在点击后立即断言，钉住该契约，防止误加选中状态导致「高亮滞后」类回归。
    const wrapper = mount(ButtonGroup, {
      slots: { default: () => [h(Button, { key: 'a' }), h(Button, { key: 'b' })] },
    })
    const buttons = wrapper.findAll('button.ui-button')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    for (const button of buttons) {
      expect(button.classes()).not.toContain('ui-button--selected')
      expect(button.attributes('aria-pressed')).toBeUndefined()
      expect(button.attributes('aria-selected')).toBeUndefined()
      expect(button.attributes('aria-checked')).toBeUndefined()
    }
  })
})
