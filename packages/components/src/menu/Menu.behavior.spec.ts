// behavior spec：点击激活 / v-model 受控 / 子菜单展开收起 / 键盘导航（←→↑↓/Home/End 移动焦点、Esc 收起）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DOMWrapper } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Menu from './Menu.vue'
import MenuItem from './MenuItem.vue'
import SubMenu from './SubMenu.vue'
import type { MenuOption } from './Menu.types'

interface MenuMountProps {
  mode?: 'horizontal' | 'vertical'
  modelValue?: string
  defaultValue?: string
}

/** 标准组合（甲 / 分组(甲一/甲二) / 乙）。 */
function buildSlot() {
  return [
    h(MenuItem, { key: 'a', value: 'a' }, () => '甲'),
    h(SubMenu, { key: 's', value: 's', title: '分组' }, () => [
      h(MenuItem, { key: 's1', value: 's1' }, () => '甲一'),
      h(MenuItem, { key: 's2', value: 's2' }, () => '甲二'),
    ]),
    h(MenuItem, { key: 'b', value: 'b' }, () => '乙'),
  ]
}

/** 三项平铺（乙 disabled），用于导航跳过 disabled 的断言。 */
function buildFlatDisabledSlot() {
  return [
    h(MenuItem, { key: 'a', value: 'a' }, () => '甲'),
    h(MenuItem, { key: 'b', value: 'b', disabled: true }, () => '乙'),
    h(MenuItem, { key: 'c', value: 'c' }, () => '丙'),
  ]
}

function mountMenu(props: MenuMountProps = {}, attach = false, slot = buildSlot) {
  return mount(Menu, {
    props,
    slots: { default: slot },
    ...(attach ? { attachTo: document.body } : {}),
  })
}

/** 按文本查找叶子项按钮。 */
function buttonByText(wrapper: ReturnType<typeof mount>, text: string): DOMWrapper<Element> {
  const found = wrapper.findAll('button').find(b => b.text() === text)
  if (found == null) throw new Error(`button not found: ${text}`)
  return found
}

const itemsWithChildren: MenuOption[] = [
  { value: 'a', label: '甲' },
  { value: 'grp', label: '分组', children: [{ value: 's1', label: '甲一' }] },
  { value: 'b', label: '乙' },
]

describe('Menu behavior', () => {
  it('点击叶子项：update:modelValue 与 select 发出，aria-current 迁移', async () => {
    const wrapper = mountMenu()
    await buttonByText(wrapper, '乙').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
    expect(wrapper.emitted('select')).toEqual([['b']])
    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1)
    expect(wrapper.findAll('[aria-current="page"]')[0].text()).toBe('乙')
  })

  it('点击当前已激活项：同值不重复发出', async () => {
    const wrapper = mountMenu({ defaultValue: 'a' })
    await buttonByText(wrapper, '甲').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('disabled 叶子项：点击不发出任何事件，激活值不变', async () => {
    const wrapper = mountMenu({ defaultValue: 'a' }, false, buildFlatDisabledSlot)
    await buttonByText(wrapper, '乙').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.findAll('[aria-current="page"]')[0].text()).toBe('甲')
  })

  it('非受控：内部状态驱动 aria-current 迁移', async () => {
    const wrapper = mountMenu()
    await buttonByText(wrapper, '乙').trigger('click')
    expect(wrapper.findAll('[aria-current="page"]')[0].text()).toBe('乙')
  })

  it('v-model:modelValue 受控：父状态随 update 更新，激活项随父状态渲染', async () => {
    const current = ref<string>('a')
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Menu,
            {
              modelValue: current.value,
              'onUpdate:modelValue': (value: string | number) => {
                current.value = String(value)
              },
            },
            { default: buildSlot },
          )
      },
    })
    const wrapper = mount(Host)
    await buttonByText(wrapper, '乙').trigger('click')
    expect(current.value).toBe('b')
    expect(wrapper.findAll('[aria-current="page"]')[0].text()).toBe('乙')
  })

  it('SubMenu 触发器点击：展开/收起切换（aria-expanded 与面板显隐同步），不发出 select', async () => {
    const wrapper = mountMenu()
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    // happy-dom 的 getComputedStyle 不回读内联样式，isVisible 不可靠；断言 v-show 的内联 display
    expect(wrapper.find('.ui-menu-submenu__panel').attributes('style')).toBeUndefined()
    expect(wrapper.find('.ui-menu-submenu').classes()).toContain('ui-menu-submenu--open')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.ui-menu-submenu__panel').attributes('style')).toContain('display: none')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('disabled 组触发器：点击不展开', async () => {
    const wrapper = mount(Menu, {
      slots: {
        default: () => [
          h(SubMenu, { key: 's', value: 's', title: '分组', disabled: true }, () => [
            h(MenuItem, { key: 's1', value: 's1' }, () => '甲一'),
          ]),
        ],
      },
    })
    await wrapper.find('.ui-menu-submenu__trigger').trigger('click')
    expect(wrapper.find('.ui-menu-submenu__trigger').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.ui-menu-submenu__panel').attributes('style')).toContain('display: none')
  })

  it('items 模式：点击叶子项发出 select，组触发器点击展开子级', async () => {
    const wrapper = mount(Menu, { props: { items: itemsWithChildren } })
    await buttonByText(wrapper, '乙').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['b']])
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.ui-menu-submenu__panel').attributes('style')).toBeUndefined()
    expect(buttonByText(wrapper, '甲一').exists()).toBe(true)
  })

  it('Esc：子菜单内叶子项收起最近一层并回焦触发器', async () => {
    const wrapper = mountMenu({}, true)
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    await trigger.trigger('click')
    const child = buttonByText(wrapper, '甲一')
    await child.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('Esc：展开组触发器上先收本组；已收起时委托外层（根层无动作）', async () => {
    const wrapper = mountMenu({}, true)
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    // 根层无 Esc 动作：不报错、焦点不被迫迁移
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('ArrowDown：收起组被整体跳过（甲 → 分组触发器 → 乙）', async () => {
    const wrapper = mountMenu({}, true)
    const a = buttonByText(wrapper, '甲')
    const trigger = wrapper.find('.ui-menu-submenu__trigger')
    await a.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(trigger.element)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '乙').element)
    wrapper.unmount()
  })

  it('展开后子级进入导航序列（甲 → 分组 → 甲一 → 甲二 → 乙）', async () => {
    const wrapper = mountMenu({}, true)
    await wrapper.find('.ui-menu-submenu__trigger').trigger('click')
    await buttonByText(wrapper, '甲').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(wrapper.find('.ui-menu-submenu__trigger').element)
    await wrapper.find('.ui-menu-submenu__trigger').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '甲一').element)
    await buttonByText(wrapper, '甲一').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '甲二').element)
    await buttonByText(wrapper, '甲二').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '乙').element)
    wrapper.unmount()
  })

  it('ArrowUp：逆向移动（展开时乙 → 甲二）；首位循环回末位', async () => {
    const wrapper = mountMenu({}, true)
    await wrapper.find('.ui-menu-submenu__trigger').trigger('click')
    await buttonByText(wrapper, '乙').trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '甲二').element)
    await buttonByText(wrapper, '甲').trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '乙').element)
    wrapper.unmount()
  })

  it('方向键只迁移 roving 焦点，不激活（不发出 select，aria-current 不变）', async () => {
    const wrapper = mountMenu({}, true)
    await buttonByText(wrapper, '甲').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(0)
    wrapper.unmount()
  })

  it('键盘导航跳过 disabled 项', async () => {
    const wrapper = mountMenu({}, true, buildFlatDisabledSlot)
    await buttonByText(wrapper, '甲').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '丙').element)
    wrapper.unmount()
  })

  it('Home 直达首个、End 直达末个（可见可用池内）', async () => {
    const wrapper = mountMenu({}, true)
    await buttonByText(wrapper, '乙').trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '甲').element)
    await buttonByText(wrapper, '甲').trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '乙').element)
    wrapper.unmount()
  })

  it('横向 mode：↑↓ 同样在项间移动焦点（任务要求横向 ↑↓ 轴）', async () => {
    const wrapper = mountMenu({ mode: 'horizontal' }, true, buildFlatDisabledSlot)
    await buttonByText(wrapper, '甲').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '丙').element)
    await buttonByText(wrapper, '丙').trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(buttonByText(wrapper, '甲').element)
    wrapper.unmount()
  })

  it('受控但父级未更新 modelValue：键盘激活仍发出 update:modelValue', async () => {
    const wrapper = mountMenu({ modelValue: 'a' })
    await buttonByText(wrapper, '乙').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  })
})
