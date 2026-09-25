// behavior spec：点击 / v-model 受控 / 键盘导航（←→↑↓/Home/End 移动即激活）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Tabs from './Tabs.vue'
import TabsList from './TabsList.vue'
import TabsTrigger from './TabsTrigger.vue'
import TabsContent from './TabsContent.vue'

interface TabsMountProps {
  value?: string
  defaultValue?: string
}

function buildSlot() {
  return [
    h(TabsList, { key: 'list' }, () => [
      h(TabsTrigger, { key: 'a', value: 'a' }, () => '甲'),
      h(TabsTrigger, { key: 'b', value: 'b' }, () => '乙'),
    ]),
    h(TabsContent, { key: 'ca', value: 'a' }, () => '面板甲'),
    h(TabsContent, { key: 'cb', value: 'b' }, () => '面板乙'),
  ]
}

/** 两组件页签（甲/乙），attach=true 时挂到 document.body 以便焦点断言。 */
function mountTabs(props: TabsMountProps = {}, attach = false) {
  return mount(Tabs, {
    props,
    slots: { default: buildSlot },
    ...(attach ? { attachTo: document.body } : {}),
  })
}

/** 三组件页签（甲/乙 disabled/丙），用于导航跳过 disabled 的断言。 */
function mountTabs3(props: TabsMountProps = {}) {
  return mount(Tabs, {
    props,
    slots: {
      default: () => [
        h(TabsList, { key: 'list' }, () => [
          h(TabsTrigger, { key: 'a', value: 'a' }, () => '甲'),
          h(TabsTrigger, { key: 'b', value: 'b', disabled: true }, () => '乙'),
          h(TabsTrigger, { key: 'c', value: 'c' }, () => '丙'),
        ]),
        h(TabsContent, { key: 'ca', value: 'a' }, () => '面板甲'),
        h(TabsContent, { key: 'cb', value: 'b' }, () => '面板乙'),
        h(TabsContent, { key: 'cc', value: 'c' }, () => '面板丙'),
      ],
    },
  })
}

describe('Tabs behavior', () => {
  it('点击另一 trigger：激活值切换、旧面板卸载、新面板挂载、update:value 发出', async () => {
    const wrapper = mountTabs()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(1)
    expect(panels[0].text()).toBe('面板乙')
    expect(wrapper.emitted('update:value')).toEqual([['b']])
  })

  it('点击当前已激活 trigger：同值不重复发出 update:value', async () => {
    const wrapper = mountTabs()
    await wrapper.findAll('[role="tab"]')[0].trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  it('disabled trigger：点击不切换激活值', async () => {
    const wrapper = mountTabs3()
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')
    expect(wrapper.find('[role="tabpanel"]').text()).toBe('面板甲')
  })

  it('v-model:value 受控：父状态随 update:value 更新，面板随之切换', async () => {
    const current = ref<string>('a')
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Tabs,
            {
              value: current.value,
              'onUpdate:value': (value: string | number) => {
                current.value = String(value)
              },
            },
            { default: buildSlot },
          )
      },
    })
    const wrapper = mount(Host)
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    expect(current.value).toBe('b')
    expect(wrapper.find('[role="tabpanel"]').text()).toBe('面板乙')
  })

  it('ArrowRight：移动到下一 trigger 并激活，焦点跟随', async () => {
    const wrapper = mountTabs({}, true)
    await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'ArrowRight' })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:value')).toEqual([['b']])
    expect(document.activeElement).toBe(tabs[1].element)
    wrapper.unmount()
  })

  it('ArrowRight 在末位循环回首位的', async () => {
    const wrapper = mountTabs({ defaultValue: 'b' }, true)
    await wrapper.findAll('[role="tab"]')[1].trigger('keydown', { key: 'ArrowRight' })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(tabs[0].element)
    wrapper.unmount()
  })

  it('ArrowLeft 在首位循环到末位的', async () => {
    const wrapper = mountTabs({}, true)
    await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'ArrowLeft' })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:value')).toEqual([['b']])
    wrapper.unmount()
  })

  it('ArrowDown 等价前进、ArrowUp 等价后退（均以当前激活值为起点）', async () => {
    const down = mountTabs3()
    await down.findAll('[role="tab"]')[0].trigger('keydown', { key: 'ArrowDown' })
    expect(down.findAll('[role="tab"]')[2].attributes('aria-selected')).toBe('true')

    const up = mountTabs3({ defaultValue: 'c' })
    await up.findAll('[role="tab"]')[2].trigger('keydown', { key: 'ArrowUp' })
    expect(up.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')
  })

  it('Home 直达首位、End 直达末位（跳过 disabled）', async () => {
    const home = mountTabs3()
    await home.findAll('[role="tab"]')[2].trigger('keydown', { key: 'Home' })
    expect(home.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')

    const end = mountTabs3()
    await end.findAll('[role="tab"]')[0].trigger('keydown', { key: 'End' })
    expect(end.findAll('[role="tab"]')[2].attributes('aria-selected')).toBe('true')
  })

  it('键盘导航跳过 disabled trigger', async () => {
    const wrapper = mountTabs3()
    await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'ArrowRight' })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[1].attributes('aria-selected')).toBe('false')
    expect(tabs[2].attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:value')).toEqual([['c']])
  })

  it('受控但父级未更新 value：键盘导航仍发射 update:value 并移动焦点', async () => {
    const wrapper = mountTabs({ value: 'a' }, true)
    await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'ArrowRight' })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(wrapper.emitted('update:value')).toEqual([['b']])
    expect(document.activeElement).toBe(tabs[1].element)
    wrapper.unmount()
  })

  it('非导航键（x / Tab）不切换激活值', async () => {
    const wrapper = mountTabs()
    await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'x' })
    await wrapper.findAll('[role="tab"]')[0].trigger('keydown', { key: 'Tab' })
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')
  })
})
