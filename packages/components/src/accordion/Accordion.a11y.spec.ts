// a11y spec：WAI-ARIA Accordion 模式——原生 button、aria-expanded/aria-controls、
// region/labelledby 配对、roving tabindex、Enter/Space/↑/↓/Home/End 键盘路径。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Accordion from './Accordion.vue'
import type { AccordionItem, AccordionProps } from './Accordion.types'

const ITEMS: AccordionItem[] = [
  { key: 'a', title: '条款 A', content: '条款 A 的正文。' },
  { key: 'b', title: '条款 B', content: '条款 B 的正文。' },
  { key: 'c', title: '条款 C', content: '条款 C 的正文。' },
]

const NAV_ITEMS: AccordionItem[] = [
  ITEMS[0],
  { ...ITEMS[1], disabled: true },
  ITEMS[2],
]

function mountAccordion(props: AccordionProps = { items: ITEMS }, attach = false) {
  return mount(Accordion, { props, attachTo: attach ? document.body : undefined })
}

function triggerAt(wrapper: ReturnType<typeof mountAccordion>, index: number) {
  return wrapper.findAll('.ui-accordion__trigger')[index]
}

function tabIndexes(wrapper: ReturnType<typeof mountAccordion>): string[] {
  return wrapper.findAll('.ui-accordion__trigger').map((trigger) => trigger.attributes('tabindex') ?? '')
}

function pressKey(element: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  element.dispatchEvent(event)
  return event
}

function focusableAt(wrapper: ReturnType<typeof mountAccordion>, index: number): HTMLElement {
  return triggerAt(wrapper, index).element as HTMLElement
}

describe('Accordion a11y', () => {
  it('头部为原生 <button type="button">（隐式 button 语义），组件不覆写 role', () => {
    const wrapper = mountAccordion()
    const trigger = triggerAt(wrapper, 0)
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('role')).toBeUndefined()
  })

  it('aria-expanded 随展开状态输出 true/false', () => {
    const wrapper = mountAccordion({ items: ITEMS, modelValue: 'a' })
    expect(triggerAt(wrapper, 0).attributes('aria-expanded')).toBe('true')
    expect(triggerAt(wrapper, 1).attributes('aria-expanded')).toBe('false')
  })

  it('aria-controls ↔ 面板 id 配对；面板 role="region" 且 aria-labelledby 回指头部', () => {
    const wrapper = mountAccordion()
    const trigger = triggerAt(wrapper, 1)
    const controls = trigger.attributes('aria-controls')
    expect(controls).toMatch(/^ui-accordion-/)
    const panel = wrapper.find(`[id="${controls}"]`)
    expect(panel.exists()).toBe(true)
    expect(panel.attributes('role')).toBe('region')
    expect(panel.attributes('aria-labelledby')).toBe(trigger.attributes('id'))
  })

  it('收起面板带 hidden、展开面板无 hidden（内容整体移出/回到可达性树）', () => {
    const wrapper = mountAccordion({ items: ITEMS, modelValue: 'b' })
    const panels = wrapper.findAll('.ui-accordion__panel')
    expect(panels[0]?.attributes('hidden')).toBeDefined()
    expect(panels[1]?.attributes('hidden')).toBeUndefined()
    expect(panels[2]?.attributes('hidden')).toBeDefined()
  })

  it('禁用条目：原生 disabled 属性（移出焦点环与激活路径）', () => {
    const wrapper = mountAccordion({ items: NAV_ITEMS })
    expect(triggerAt(wrapper, 1).attributes('disabled')).toBeDefined()
    expect(triggerAt(wrapper, 0).attributes('disabled')).toBeUndefined()
  })

  it('roving tabindex：初始仅首个可用条目 tabindex=0，其余（含禁用）为 -1', () => {
    const wrapper = mountAccordion({ items: NAV_ITEMS })
    expect(tabIndexes(wrapper)).toEqual(['0', '-1', '-1'])
  })

  it('roving tabindex：焦点所在头部获得停靠点（tabindex=0 跟随焦点）', async () => {
    const wrapper = mountAccordion({ items: ITEMS }, true)
    focusableAt(wrapper, 2).focus()
    await nextTick()
    expect(tabIndexes(wrapper)).toEqual(['-1', '-1', '0'])
    wrapper.unmount()
  })

  it('Enter / Space：切换展开且 preventDefault（Space 不滚动页面）', async () => {
    const wrapper = mountAccordion({ items: ITEMS }, true)
    const trigger = triggerAt(wrapper, 0)

    const enter = pressKey(trigger.element, 'Enter')
    expect(enter.defaultPrevented).toBe(true)
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')

    const space = pressKey(trigger.element, ' ')
    expect(space.defaultPrevented).toBe(true)
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('非功能键（Tab / 字母键）不触发切换、不 preventDefault', () => {
    const wrapper = mountAccordion({ items: ITEMS }, true)
    const trigger = triggerAt(wrapper, 0)
    const tab = pressKey(trigger.element, 'Tab')
    const letter = pressKey(trigger.element, 'a')
    expect(tab.defaultPrevented).toBe(false)
    expect(letter.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('ArrowDown：焦点移向下一个可用头部并跳过禁用项', () => {
    const wrapper = mountAccordion({ items: NAV_ITEMS }, true)
    const first = triggerAt(wrapper, 0)
    focusableAt(wrapper, 0).focus()

    pressKey(first.element, 'ArrowDown')
    expect(document.activeElement).toBe(triggerAt(wrapper, 2).element)
    wrapper.unmount()
  })

  it('ArrowDown / ArrowUp 循环：末尾向下回到首个可用头部', () => {
    const wrapper = mountAccordion({ items: NAV_ITEMS }, true)
    const last = triggerAt(wrapper, 2)
    focusableAt(wrapper, 2).focus()

    pressKey(last.element, 'ArrowDown')
    expect(document.activeElement).toBe(triggerAt(wrapper, 0).element)

    pressKey(triggerAt(wrapper, 0).element, 'ArrowUp')
    expect(document.activeElement).toBe(triggerAt(wrapper, 2).element)
    wrapper.unmount()
  })

  it('Home / End：焦点直达首个/末个可用头部（跳过禁用项）', () => {
    const wrapper = mountAccordion({ items: NAV_ITEMS }, true)
    const last = triggerAt(wrapper, 2)
    focusableAt(wrapper, 2).focus()

    pressKey(last.element, 'Home')
    expect(document.activeElement).toBe(triggerAt(wrapper, 0).element)

    pressKey(triggerAt(wrapper, 0).element, 'End')
    expect(document.activeElement).toBe(triggerAt(wrapper, 2).element)
    wrapper.unmount()
  })

  it('全部条目禁用：无任何 tabindex=0 停靠点，键盘导航原地不动', () => {
    const disabledItems: AccordionItem[] = ITEMS.map((item) => ({ ...item, disabled: true }))
    const wrapper = mountAccordion({ items: disabledItems }, true)
    expect(tabIndexes(wrapper)).toEqual(['-1', '-1', '-1'])

    pressKey(triggerAt(wrapper, 0).element, 'ArrowDown')
    expect(document.activeElement).not.toBe(triggerAt(wrapper, 1).element)
    wrapper.unmount()
  })

  it('缺省 chevron 图标 aria-hidden="true"，不进入读屏内容', () => {
    const wrapper = mountAccordion()
    const svgs = wrapper.findAll('.ui-accordion__icon svg')
    expect(svgs.length).toBeGreaterThan(0)
    for (const svg of svgs) {
      expect(svg.attributes('aria-hidden')).toBe('true')
    }
  })
})
