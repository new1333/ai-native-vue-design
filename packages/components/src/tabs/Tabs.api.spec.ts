// api spec：props 默认值 / emits 声明 / slots 渲染 / 复合组装结构。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Tabs from './Tabs.vue'
import TabsList from './TabsList.vue'
import TabsTrigger from './TabsTrigger.vue'
import TabsContent from './TabsContent.vue'

interface TabsMountProps {
  value?: string
  defaultValue?: string
  variant?: 'line' | 'pill'
}

/** 两组件页签的标准组装（甲/乙）。 */
function mountTabs(props: TabsMountProps = {}) {
  return mount(Tabs, {
    props,
    slots: {
      default: () => [
        h(TabsList, { key: 'list', 'aria-label': '章节' }, () => [
          h(TabsTrigger, { key: 'a', value: 'a' }, () => '甲'),
          h(TabsTrigger, { key: 'b', value: 'b' }, () => '乙'),
        ]),
        h(TabsContent, { key: 'ca', value: 'a' }, () => '面板甲'),
        h(TabsContent, { key: 'cb', value: 'b' }, () => '面板乙'),
      ],
    },
  })
}

describe('Tabs api', () => {
  it('渲染 ui-tabs 根类，默认 variant=line', () => {
    const wrapper = mountTabs()
    expect(wrapper.classes()).toContain('ui-tabs')
    expect(wrapper.classes()).toContain('ui-tabs--line')
    expect(wrapper.classes()).not.toContain('ui-tabs--pill')
  })

  it('variant="pill" 落 ui-tabs--pill 修饰类（视觉预留档位）', () => {
    const wrapper = mountTabs({ variant: 'pill' })
    expect(wrapper.classes()).toContain('ui-tabs--pill')
  })

  it('TabsList：role=tablist + ui-tabs-list 根类，attrs（aria-label）透传', () => {
    const wrapper = mountTabs()
    const list = wrapper.find('.ui-tabs-list')
    expect(list.attributes('role')).toBe('tablist')
    expect(list.classes()).toContain('ui-tabs-list--line')
    expect(list.attributes('aria-label')).toBe('章节')
  })

  it('TabsTrigger：原生 button、type=button、role=tab，数量与声明一致', () => {
    const wrapper = mountTabs()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(2)
    for (const tab of tabs) {
      expect(tab.element.tagName).toBe('BUTTON')
      expect(tab.attributes('type')).toBe('button')
    }
  })

  it('TabsTrigger / TabsContent 默认插槽内容渲染', () => {
    const wrapper = mountTabs()
    expect(wrapper.findAll('[role="tab"]')[0].text()).toBe('甲')
    expect(wrapper.find('[role="tabpanel"]').text()).toBe('面板甲')
  })

  it('默认（无 value/defaultValue）：自动激活首个 trigger，仅对应面板渲染', () => {
    const wrapper = mountTabs()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(tabs[1].attributes('aria-selected')).toBe('false')
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(1)
    expect(panels[0].text()).toBe('面板甲')
  })

  it('defaultValue：初始激活指定值（服务/客户端同语义）', () => {
    const wrapper = mountTabs({ defaultValue: 'b' })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.find('[role="tabpanel"]').text()).toBe('面板乙')
  })

  it('受控 value 优先于 defaultValue', () => {
    const wrapper = mountTabs({ value: 'b', defaultValue: 'a' })
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.find('[role="tabpanel"]').text()).toBe('面板乙')
  })

  it('value 支持数字类型配对', () => {
    const wrapper = mount(Tabs, {
      slots: {
        default: () => [
          h(TabsList, { key: 'list' }, () => [
            h(TabsTrigger, { key: '1', value: 1 }, () => '一'),
            h(TabsTrigger, { key: '2', value: 2 }, () => '二'),
          ]),
          h(TabsContent, { key: 'c1', value: 1 }, () => '面板一'),
        ],
      },
    })
    expect(wrapper.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')
    expect(wrapper.find('[role="tabpanel"]').text()).toBe('面板一')
  })

  it('update:value 已声明：点击 trigger 时以配对值为载荷发出', async () => {
    const wrapper = mountTabs()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['b']])
  })

  it('disabled：TabsTrigger 落原生 disabled 属性 + 修饰类', () => {
    const wrapper = mount(Tabs, {
      slots: {
        default: () => [
          h(TabsList, { key: 'list' }, () => [
            h(TabsTrigger, { key: 'a', value: 'a', disabled: true }, () => '甲'),
          ]),
        ],
      },
    })
    const tab = wrapper.find('[role="tab"]')
    expect(tab.attributes('disabled')).toBeDefined()
    expect(tab.classes()).toContain('ui-tabs-trigger--disabled')
  })
})
