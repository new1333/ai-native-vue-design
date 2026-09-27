// a11y spec：语义 landmark（header/aside/main/footer）、折叠触发器的
// aria-expanded/aria-controls/aria-label 与原生键盘路径、attrs 透传、Tab 序。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Layout from './Layout.vue'
import LayoutContent from './LayoutContent.vue'
import LayoutFooter from './LayoutFooter.vue'
import LayoutHeader from './LayoutHeader.vue'
import LayoutSider from './LayoutSider.vue'

describe('Layout a11y', () => {
  it('区域语义由原生 landmark 标签承担：header / aside / main / footer', () => {
    const wrapper = mount(Layout, {
      slots: {
        default: () => [
          h(LayoutSider, { key: 's' }, { default: () => '侧栏' }),
          h(LayoutHeader, { key: 'h' }, { default: () => '顶栏' }),
          h(LayoutContent, { key: 'c' }, { default: () => '主内容' }),
          h(LayoutFooter, { key: 'f' }, { default: () => '页脚' }),
        ],
      },
    })
    expect(wrapper.find('.ui-layout__sider').element.tagName).toBe('ASIDE')
    expect(wrapper.find('.ui-layout__header').element.tagName).toBe('HEADER')
    expect(wrapper.find('.ui-layout__content').element.tagName).toBe('MAIN')
    expect(wrapper.find('.ui-layout__footer').element.tagName).toBe('FOOTER')
  })

  it('Layout 根为泛型容器：无 role 劫持，区域元素无 aria-hidden', () => {
    const wrapper = mount(Layout, { slots: { default: () => h(LayoutContent, () => '正文') } })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.find('.ui-layout__content').attributes('aria-hidden')).toBeUndefined()
  })

  it('区域元素不可聚焦、不参与 Tab 序', () => {
    const wrapper = mount(Layout, {
      slots: {
        default: () => [
          h(LayoutHeader, { key: 'h' }, { default: () => '顶栏' }),
          h(LayoutContent, { key: 'c' }, { default: () => '正文' }),
          h(LayoutFooter, { key: 'f' }, { default: () => '页脚' }),
        ],
      },
    })
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('.ui-layout__header').attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('.ui-layout__content').attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('.ui-layout__footer').attributes('tabindex')).toBeUndefined()
  })

  it('折叠触发器：原生 button（type=button）+ aria-label 可读名称 + aria-expanded 初始 true', () => {
    const wrapper = mount(LayoutSider, { props: { collapsible: true } })
    const trigger = wrapper.find('.ui-layout__sider-trigger')
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('aria-label')).toBe('切换侧栏')
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('折叠后 aria-expanded 翻转为 false（披露按钮表达受控区域状态）', async () => {
    const wrapper = mount(LayoutSider, { props: { collapsible: true } })
    const trigger = wrapper.find('.ui-layout__sider-trigger')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('aria-controls 指向本实例 aside 的 id（实例级唯一，可编程关联）', () => {
    const wrapper = mount(LayoutSider, { props: { collapsible: true } })
    const asideId = wrapper.attributes('id')
    expect(asideId).toMatch(/^ui-layout-sider-/)
    expect(wrapper.find('.ui-layout__sider-trigger').attributes('aria-controls')).toBe(asideId)
  })

  it('键盘路径：触发器为原生 button，平台级 Enter/Space 激活；组件不叠加 keydown 处理（不双触发）', async () => {
    const wrapper = mount(LayoutSider, { props: { collapsible: true } })
    const trigger = wrapper.find('.ui-layout__sider-trigger')
    // 原生 button 无负 tabindex：留在 Tab 序
    expect(trigger.attributes('tabindex')).toBeUndefined()
    // 组件无 keydown 处理器：keydown 不改变折叠态（激活完全交给浏览器原生行为，避免双触发）
    await trigger.trigger('keydown', { key: 'Enter' })
    await trigger.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('sider-collapse')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-layout__sider--collapsed')
  })

  it('aside landmark 可由使用方经 attrs 透传 aria-label 命名', () => {
    const wrapper = mount(LayoutSider, { attrs: { 'aria-label': '主导航' } })
    expect(wrapper.attributes('aria-label')).toBe('主导航')
  })

  it('折叠（宽度收窄）不改内容可读性：内容不被 aria-hidden，保持对读屏可见', () => {
    const wrapper = mount(LayoutSider, { props: { defaultCollapsed: true }, slots: { default: () => '菜单' } })
    const body = wrapper.find('.ui-layout__sider-body')
    expect(body.attributes('aria-hidden')).toBeUndefined()
    expect(body.text()).toContain('菜单')
  })
})
