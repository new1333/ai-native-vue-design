// behavior spec：direction 切换 / label 插槽显隐带来的形态切换。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Divider from './Divider.vue'

describe('Divider behavior', () => {
  it('direction 切换：horizontal ↔ vertical 元素与修饰类随之更新', async () => {
    const wrapper = mount(Divider)
    expect(wrapper.element.tagName).toBe('HR')
    expect(wrapper.classes()).toContain('ui-divider--horizontal')
    await wrapper.setProps({ direction: 'vertical' })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-divider--vertical')
    expect(wrapper.classes()).not.toContain('ui-divider--horizontal')
    await wrapper.setProps({ direction: 'horizontal' })
    expect(wrapper.element.tagName).toBe('HR')
    expect(wrapper.classes()).toContain('ui-divider--horizontal')
  })

  it('label 插槽出现/消失：hr ↔ 带标签形态随响应式状态切换', async () => {
    const showLabel = ref(true)
    const Host = defineComponent({
      setup() {
        return () =>
          h(Divider, null, showLabel.value ? { label: () => '或' } : {})
      },
    })
    const wrapper = mount(Host)
    expect(wrapper.find('.ui-divider').element.tagName).toBe('DIV')
    expect(wrapper.find('.ui-divider').classes()).toContain('ui-divider--labeled')
    expect(wrapper.find('.ui-divider__label').text()).toBe('或')

    showLabel.value = false
    await nextTick()
    expect(wrapper.find('.ui-divider').element.tagName).toBe('HR')
    expect(wrapper.find('.ui-divider').classes()).not.toContain('ui-divider--labeled')
    expect(wrapper.find('.ui-divider__label').exists()).toBe(false)
  })

  it('无插槽的 Divider 不渲染标签与线段容器', () => {
    const wrapper = mount(Divider)
    expect(wrapper.find('.ui-divider__label').exists()).toBe(false)
    expect(wrapper.find('.ui-divider__line').exists()).toBe(false)
  })
})
