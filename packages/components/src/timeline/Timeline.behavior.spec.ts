// behavior spec：items/mode/pending 的响应式行为 + 连线连续性的布局契约。
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Timeline from './Timeline.vue'
import { TIMELINE_PENDING_TEXT } from './Timeline.constants'
import type { TimelineItem } from './Timeline.types'

// 布局契约断言：happy-dom 无布局引擎、vitest 又把样式导入 stub 成空串，
// 故用 node:fs 读 SFC 原文断言样式规则（参照 Progress.behavior.spec.ts 先例；
// 以 process.cwd() 解析——按 AGENTS.md 约定 cwd 恒为组件包根）。
const timelineSfc = readFileSync(resolve(process.cwd(), 'src/timeline/Timeline.vue'), 'utf8')

/** 取选择器声明块内的 属性 → 值 映射（本组件样式为纯声明块，无嵌套花括号）。 */
function declarationsOf(selector: RegExp): Map<string, string> {
  const block = timelineSfc.match(selector)?.[1] ?? ''
  const map = new Map<string, string>()
  const re = /([a-zA-Z-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(block))) map.set(m[1], m[2].trim())
  return map
}

const baseItems: TimelineItem[] = [
  { title: '事件一' },
  { title: '事件二' },
  { title: '事件三' },
]

describe('Timeline behavior', () => {
  it('items 响应式：增删项后节点与连线段同步增删', async () => {
    const wrapper = mount(Timeline, { props: { items: baseItems } })
    expect(wrapper.findAll('.ui-timeline__item')).toHaveLength(3)
    expect(wrapper.findAll('.ui-timeline__dot-core')).toHaveLength(3)

    await wrapper.setProps({ items: [...baseItems, { title: '事件四' }] })
    expect(wrapper.findAll('.ui-timeline__item')).toHaveLength(4)
    expect(wrapper.findAll('.ui-timeline__dot-core')).toHaveLength(4)
    expect(wrapper.text()).toContain('事件四')

    await wrapper.setProps({ items: [baseItems[0]!] })
    expect(wrapper.findAll('.ui-timeline__item')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('事件二')
  })

  it('pending 响应式：追加/移除末尾幽灵节点，且移除后无 pending 残留', async () => {
    const wrapper = mount(Timeline, { props: { items: baseItems } })
    expect(wrapper.find('.ui-timeline__item--pending').exists()).toBe(false)

    await wrapper.setProps({ pending: true })
    const pendingNode = wrapper.find('.ui-timeline__item--pending')
    expect(pendingNode.exists()).toBe(true)
    expect(pendingNode.text()).toContain(TIMELINE_PENDING_TEXT)
    expect(wrapper.findAll('.ui-timeline__dot-core--pending')).toHaveLength(1)

    await wrapper.setProps({ pending: false })
    expect(wrapper.find('.ui-timeline__item--pending').exists()).toBe(false)
    expect(wrapper.find('.ui-timeline__dot-core--pending').exists()).toBe(false)
    expect(wrapper.findAll('.ui-timeline__item')).toHaveLength(3)
  })

  it('mode 响应式：left ↔ alternate 根修饰类切换', async () => {
    const wrapper = mount(Timeline, { props: { items: baseItems } })
    expect(wrapper.classes()).not.toContain('ui-timeline--alternate')

    await wrapper.setProps({ mode: 'alternate' })
    expect(wrapper.classes()).toContain('ui-timeline--alternate')

    await wrapper.setProps({ mode: 'left' })
    expect(wrapper.classes()).not.toContain('ui-timeline--alternate')
  })

  it('alternate 侧交替：偶数下标内容居右、奇数下标加 --left-side；pending 按下标 items.length 参与交替', async () => {
    const fourItems = [...baseItems, { title: '事件四' }]
    const wrapper = mount(Timeline, { props: { items: fourItems, mode: 'alternate' } })
    let sides = wrapper.findAll('.ui-timeline__item').map((li) => li.classes())
    expect(sides[0]).not.toContain('ui-timeline__item--left-side')
    expect(sides[1]).toContain('ui-timeline__item--left-side')
    expect(sides[2]).not.toContain('ui-timeline__item--left-side')
    expect(sides[3]).toContain('ui-timeline__item--left-side')

    // 3 项 + pending：pending 下标为 3（奇数）→ 幽灵节点内容居左
    await wrapper.setProps({ items: baseItems, pending: true })
    sides = wrapper.findAll('.ui-timeline__item').map((li) => li.classes())
    expect(sides).toHaveLength(4)
    expect(sides[3]).toContain('ui-timeline__item--left-side')

    // 2 项 + pending：pending 下标为 2（偶数）→ 内容居右
    await wrapper.setProps({ items: baseItems.slice(0, 2) })
    sides = wrapper.findAll('.ui-timeline__item').map((li) => li.classes())
    expect(sides).toHaveLength(3)
    expect(sides[2]).not.toContain('ui-timeline__item--left-side')
  })

  it('items 更新后内容随数据重渲染（title/description/time 同步）', async () => {
    const wrapper = mount(Timeline, {
      props: { items: [{ title: '旧标题', description: '旧说明', time: '08:00' }] },
    })
    expect(wrapper.find('.ui-timeline__title').text()).toBe('旧标题')

    await wrapper.setProps({ items: [{ title: '新标题', time: '12:00' }] })
    expect(wrapper.find('.ui-timeline__title').text()).toBe('新标题')
    expect(wrapper.find('.ui-timeline__description').exists()).toBe(false)
    expect(wrapper.find('.ui-timeline__time').text()).toBe('12:00')
  })
})

describe('Timeline 布局契约：连线连续', () => {
  // 回归背景：连线由每个 li 的 ::before 纵贯全高、相邻项首尾相接拼成。
  // 若项间距改用 margin/row-gap 会在项间产生断线；首项线冒出节点上方、
  // 末项线悬垂同样破坏形态。此组断言钉住连线连续的四条规则。
  it('项间距用 padding-bottom（而非 margin/row-gap），保证相邻项连线首尾相接', () => {
    const declarations = declarationsOf(/\.ui-timeline__item\s*\{([^}]*)\}/)
    expect(declarations.get('padding-bottom')).toBe('var(--ui-space-5)')
    expect(declarations.has('margin')).toBe(false)
    expect(declarations.has('row-gap')).toBe(false)
    // 仅水平 column-gap，不影响纵向连续
    expect(declarations.get('column-gap')).toBe('var(--ui-space-3)')
  })

  it('连线纵贯每项全高（top: 0 / bottom: 0），宽度为结构性 1px', () => {
    const declarations = declarationsOf(/\.ui-timeline__item::before\s*\{([^}]*)\}/)
    expect(declarations.get('top')).toBe('0')
    expect(declarations.get('bottom')).toBe('0')
    expect(declarations.get('width')).toBe('1px')
  })

  it('首项线自节点圆心起（top 收敛到节点盒高度一半），不冒出节点上方', () => {
    const declarations = declarationsOf(/\.ui-timeline__item:first-child::before\s*\{([^}]*)\}/)
    expect(declarations.get('top')).toBe('calc(var(--ui-text-md) * var(--ui-leading-small) / 2)')
  })

  it('末项线隐藏（其后无节点可连）', () => {
    const declarations = declarationsOf(/\.ui-timeline__item:last-child::before\s*\{([^}]*)\}/)
    expect(declarations.get('display')).toBe('none')
  })
})
