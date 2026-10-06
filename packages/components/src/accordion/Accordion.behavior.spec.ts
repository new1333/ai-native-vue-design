// behavior spec：触发后的状态机行为——单开/多开切换、受控/非受控、禁用条目、items 响应式。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Accordion from './Accordion.vue'
import type { AccordionItem, AccordionProps } from './Accordion.types'

const ITEMS: AccordionItem[] = [
  { key: 'a', title: '条款 A', content: '条款 A 的正文。' },
  { key: 'b', title: '条款 B', content: '条款 B 的正文。' },
  { key: 'c', title: '条款 C', content: '条款 C 的正文。' },
]

function mountAccordion(props: AccordionProps = { items: ITEMS }) {
  return mount(Accordion, { props })
}

type Wrapper = ReturnType<typeof mountAccordion>

function triggerAt(wrapper: Wrapper, index: number) {
  return wrapper.findAll('.ui-accordion__trigger')[index]
}

function expandedTitles(wrapper: Wrapper): string[] {
  return wrapper
    .findAll('.ui-accordion__trigger')
    .filter((trigger) => trigger.attributes('aria-expanded') === 'true')
    .map((trigger) => trigger.text())
}

describe('Accordion behavior', () => {
  it('非受控单开：点击展开，再点收起（update:modelValue 依次为 key → null）', async () => {
    const wrapper = mountAccordion()
    const first = triggerAt(wrapper, 0)

    await first.trigger('click')
    expect(first.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a'])

    await first.trigger('click')
    expect(first.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([null])
  })

  it('单开互斥：展开 b 时 a 自动收起（允许全部收起）', async () => {
    const wrapper = mountAccordion()
    await triggerAt(wrapper, 0).trigger('click')
    expect(expandedTitles(wrapper)).toEqual(['条款 A'])

    await triggerAt(wrapper, 1).trigger('click')
    expect(expandedTitles(wrapper)).toEqual(['条款 B'])
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['b'])
    expect(wrapper.emitted('change')?.[1]).toEqual([{ key: 'b', expanded: true, value: 'b' }])
  })

  it('多开模式：逐个展开互不影响，值按 items 顺序规范化；收起后从数组移除', async () => {
    const wrapper = mountAccordion({ items: ITEMS, multiple: true })

    await triggerAt(wrapper, 2).trigger('click')
    await triggerAt(wrapper, 0).trigger('click')
    expect(expandedTitles(wrapper)).toEqual(['条款 A', '条款 C'])
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['a', 'c']])

    await triggerAt(wrapper, 2).trigger('click')
    expect(expandedTitles(wrapper)).toEqual(['条款 A'])
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([['a']])
  })

  it('受控模式：点击只 emit 不改状态，prop 更新后界面才跟随', async () => {
    const wrapper = mountAccordion({ items: ITEMS, modelValue: 'a' })

    await triggerAt(wrapper, 1).trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
    // 受控：prop 未变，界面保持 a 展开
    expect(expandedTitles(wrapper)).toEqual(['条款 A'])

    await wrapper.setProps({ modelValue: 'b' })
    expect(expandedTitles(wrapper)).toEqual(['条款 B'])
  })

  it('非受控 defaultValue：初始即展开默认项，交互继续可用（收起 → null、切换互斥）', async () => {
    const wrapper = mountAccordion({ items: ITEMS, defaultValue: 'b' })
    expect(expandedTitles(wrapper)).toEqual(['条款 B'])

    await triggerAt(wrapper, 1).trigger('click')
    expect(expandedTitles(wrapper)).toEqual([])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])

    await triggerAt(wrapper, 2).trigger('click')
    expect(expandedTitles(wrapper)).toEqual(['条款 C'])
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['c'])
  })

  it('受控模式 defaultValue 不生效：初始与后续均只随 modelValue', async () => {
    const wrapper = mountAccordion({ items: ITEMS, modelValue: 'a', defaultValue: 'c' })
    expect(expandedTitles(wrapper)).toEqual(['条款 A'])

    await wrapper.setProps({ modelValue: 'c' })
    expect(expandedTitles(wrapper)).toEqual(['条款 C'])
  })

  it('禁用条目：点击不产生状态变化与事件', async () => {
    const wrapper = mountAccordion({
      items: [ITEMS[0], { ...ITEMS[1], disabled: true }, ITEMS[2]],
    })
    await triggerAt(wrapper, 1).trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(expandedTitles(wrapper)).toEqual([])
  })

  it('items 响应式更新：新增条目即时渲染为可交互头部', async () => {
    const wrapper = mountAccordion({ items: ITEMS.slice(0, 2) })
    expect(wrapper.findAll('.ui-accordion__trigger')).toHaveLength(2)

    await wrapper.setProps({ items: ITEMS })
    expect(wrapper.findAll('.ui-accordion__trigger')).toHaveLength(3)
    await triggerAt(wrapper, 2).trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c'])
  })

  it('modelValue 中的未知 key：不参与渲染，切换后按 items 顺序规范化移除', async () => {
    const wrapper = mountAccordion({
      items: ITEMS,
      modelValue: ['a', 'ghost'],
      multiple: true,
    })
    // ghost 不在 items 内：只渲染 a 展开
    expect(expandedTitles(wrapper)).toEqual(['条款 A'])

    await triggerAt(wrapper, 1).trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])
  })

  it('多开受控数组形态容错：非数组值按单 key 归一化展开', () => {
    const wrapper = mountAccordion({ items: ITEMS, modelValue: 'b', multiple: true })
    expect(expandedTitles(wrapper)).toEqual(['条款 B'])
  })
})
