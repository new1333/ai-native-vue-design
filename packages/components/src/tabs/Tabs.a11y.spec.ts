// a11y spec：WAI-ARIA Tabs 模式 / aria 配对 / roving tabindex / 键盘序列。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Tabs from './Tabs.vue'
import TabsList from './TabsList.vue'
import TabsTrigger from './TabsTrigger.vue'
import TabsContent from './TabsContent.vue'

function mountTabs(attach = false) {
  return mount(Tabs, {
    ...(attach ? { attachTo: document.body } : {}),
    slots: {
      default: () => [
        h(TabsList, { key: 'list' }, () => [
          h(TabsTrigger, { key: 'a', value: 'a' }, () => '甲'),
          h(TabsTrigger, { key: 'b', value: 'b' }, () => '乙'),
        ]),
        h(TabsContent, { key: 'ca', value: 'a' }, () => '面板甲'),
        h(TabsContent, { key: 'cb', value: 'b' }, () => '面板乙'),
      ],
    },
  })
}

describe('Tabs a11y', () => {
  it('结构：tablist 内含 tab，激活 tab 的 tabpanel 渲染在外层（层级正确）', () => {
    const wrapper = mountTabs()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(2)
    for (const tab of tabs) {
      expect(tab.element.closest('[role="tablist"]')).not.toBeNull()
    }
    const panel = wrapper.find('[role="tabpanel"]')
    expect(panel.exists()).toBe(true)
    expect(panel.element.closest('[role="tablist"]')).toBeNull()
  })

  it('aria-selected 值与激活状态一致，切换后随 DOM 更新', async () => {
    const wrapper = mountTabs()
    let tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(tabs[1].attributes('aria-selected')).toBe('false')
    await tabs[1].trigger('click')
    tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
  })

  it('aria-controls 指向激活面板 id；面板 aria-labelledby 指向配对 trigger id', () => {
    const wrapper = mountTabs()
    const activeTab = wrapper.findAll('[role="tab"]')[0]
    const panel = wrapper.find('[role="tabpanel"]')
    expect(activeTab.attributes('aria-controls')).toBe(panel.attributes('id'))
    expect(panel.attributes('aria-labelledby')).toBe(activeTab.attributes('id'))
  })

  it('id 稳定：切换激活前后 trigger/panel 的 id 不变', async () => {
    const wrapper = mountTabs()
    const before = {
      tabA: wrapper.findAll('[role="tab"]')[0].attributes('id'),
      tabB: wrapper.findAll('[role="tab"]')[1].attributes('id'),
    }
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('id')).toBe(before.tabA)
    expect(tabs[1].attributes('id')).toBe(before.tabB)
    const panel = wrapper.find('[role="tabpanel"]')
    expect(panel.attributes('aria-labelledby')).toBe(before.tabB)
  })

  it('roving tabindex：激活 trigger 保持 Tab 序（无 tabindex 覆写），其余 -1', () => {
    const wrapper = mountTabs()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('tabindex')).toBeUndefined()
    expect(tabs[1].attributes('tabindex')).toBe('-1')
  })

  it('roving tabindex：键盘移动后 tabindex 跟随新的激活 trigger', async () => {
    const wrapper = mountTabs()
    await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'ArrowRight' })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('tabindex')).toBe('-1')
    expect(tabs[1].attributes('tabindex')).toBeUndefined()
  })

  it('键盘 Enter：激活当前 trigger（keydown preventDefault，单次触发）', async () => {
    const wrapper = mountTabs()
    const tab = wrapper.findAll('[role="tab"]')[1]
    await tab.trigger('keydown', { key: 'Enter' })
    expect(tab.attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:value')).toEqual([['b']])
  })

  it('键盘 Space（" "）：激活当前 trigger', async () => {
    const wrapper = mountTabs()
    const tab = wrapper.findAll('[role="tab"]')[1]
    await tab.trigger('keydown', { key: ' ' })
    expect(tab.attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:value')).toEqual([['b']])
  })

  it('导航键 keydown 被 preventDefault（防滚动），非导航键不拦截', () => {
    const wrapper = mountTabs()
    // 在绑定监听的 tablist 元素上派发 cancelable 键盘事件（同 Button a11y spec 的直接派发模式）
    const list = wrapper.find('[role="tablist"]').element
    for (const key of ['ArrowRight', 'Home', 'End']) {
      const nav = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      list.dispatchEvent(nav)
      expect(nav.defaultPrevented, key).toBe(true)
    }
    const other = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true })
    list.dispatchEvent(other)
    expect(other.defaultPrevented).toBe(false)
  })

  it('tabpanel tabindex=0：无聚焦内容时面板自身可聚焦', () => {
    const wrapper = mountTabs(true)
    const panel = wrapper.find('[role="tabpanel"]')
    expect(panel.attributes('tabindex')).toBe('0')
    ;(panel.element as HTMLDivElement).focus()
    expect(document.activeElement).toBe(panel.element)
    wrapper.unmount()
  })
})
