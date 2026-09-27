// api spec：props 默认值 / emits 声明 / slots 渲染（Layout 与 LayoutHeader/Sider/Content/Footer 组装）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Fragment, h } from 'vue'
import Layout from './Layout.vue'
import LayoutContent from './LayoutContent.vue'
import LayoutFooter from './LayoutFooter.vue'
import LayoutHeader from './LayoutHeader.vue'
import LayoutSider from './LayoutSider.vue'

/** 完整组装：顶栏 + 侧栏 + 内层纵向骨架（经典 SaaS 壳）。 */
function buildShell() {
  return [
    h(LayoutSider, { key: 'sider' }, { default: () => '侧栏导航' }),
    h(Layout, { key: 'inner' }, { default: () => [
      h(LayoutHeader, { key: 'h' }, { default: () => '顶栏' }),
      h(LayoutContent, { key: 'c' }, { default: () => '主内容' }),
      h(LayoutFooter, { key: 'f' }, { default: () => '页脚' }),
    ] }),
  ]
}

describe('Layout api', () => {
  it('渲染 ui-layout 根容器（div），默认纵向：无 --has-sider 修饰类', () => {
    const wrapper = mount(Layout, { slots: { default: () => '内容' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-layout')
    expect(wrapper.classes()).not.toContain('ui-layout--has-sider')
    expect(wrapper.text()).toContain('内容')
  })

  it('LayoutSider 为直接子节点：根自动切横向 --has-sider', () => {
    const wrapper = mount(Layout, { slots: { default: buildShell } })
    expect(wrapper.classes()).toContain('ui-layout--has-sider')
  })

  it('v-for / v-if 片段中的 LayoutSider 同样触发横向布局（Fragment 透明下探）', () => {
    // 模拟模板 v-for/v-for 槽位输出的 Fragment（数组 children）形态
    const wrapper = mount(Layout, {
      slots: { default: () => [h(Fragment, null, buildShell())] },
    })
    expect(wrapper.classes()).toContain('ui-layout--has-sider')
  })

  it('LayoutSider 被真实元素包裹（div）时不触发横向布局（与 DOM 事实一致）', () => {
    const wrapper = mount(Layout, {
      slots: { default: () => [h('div', () => h(LayoutSider))] },
    })
    expect(wrapper.classes()).not.toContain('ui-layout--has-sider')
  })

  it('LayoutHeader / LayoutContent / LayoutFooter：语义标签与区块类、插槽内容渲染', () => {
    const wrapper = mount(Layout, {
      slots: {
        default: () => [
          h(LayoutHeader, { key: 'h' }, { default: () => '顶栏' }),
          h(LayoutContent, { key: 'c' }, { default: () => '主内容' }),
          h(LayoutFooter, { key: 'f' }, { default: () => '页脚' }),
        ],
      },
    })
    const header = wrapper.find('.ui-layout__header')
    const content = wrapper.find('.ui-layout__content')
    const footer = wrapper.find('.ui-layout__footer')
    expect(header.element.tagName).toBe('HEADER')
    expect(content.element.tagName).toBe('MAIN')
    expect(footer.element.tagName).toBe('FOOTER')
    expect(header.text()).toBe('顶栏')
    expect(content.text()).toBe('主内容')
    expect(footer.text()).toBe('页脚')
  })

  it('LayoutSider：语义 aside + 区块类，插槽内容渲染', () => {
    const wrapper = mount(LayoutSider, { slots: { default: () => '侧栏导航' } })
    expect(wrapper.element.tagName).toBe('ASIDE')
    expect(wrapper.classes()).toContain('ui-layout__sider')
    expect(wrapper.text()).toContain('侧栏导航')
  })

  it('LayoutSider 默认：非折叠、无触发器（collapsible 默认 false）', () => {
    const wrapper = mount(LayoutSider)
    expect(wrapper.classes()).not.toContain('ui-layout__sider--collapsed')
    expect(wrapper.find('.ui-layout__sider-trigger').exists()).toBe(false)
  })

  it('LayoutSider defaultCollapsed：折叠档类落位，仍无触发器', () => {
    const wrapper = mount(LayoutSider, { props: { defaultCollapsed: true } })
    expect(wrapper.classes()).toContain('ui-layout__sider--collapsed')
    expect(wrapper.find('.ui-layout__sider-trigger').exists()).toBe(false)
  })

  it('LayoutSider collapsible：触发器渲染，aria-expanded 初始为 true（展开）', () => {
    const wrapper = mount(LayoutSider, { props: { collapsible: true } })
    const trigger = wrapper.find('.ui-layout__sider-trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('LayoutSider collapsed 受控：折叠档类直接由 prop 决定', () => {
    const wrapper = mount(LayoutSider, { props: { collapsed: true } })
    expect(wrapper.classes()).toContain('ui-layout__sider--collapsed')
  })

  it('emits 声明：LayoutSider 声明 sider-collapse', () => {
    const emitsOption = (LayoutSider as unknown as { emits?: string[] }).emits
    expect(Array.isArray(emitsOption)).toBe(true)
    expect(emitsOption).toContain('sider-collapse')
  })
})
