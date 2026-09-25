// behavior spec：value / indeterminate / showLabel / size 的响应式行为。
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Progress from './Progress.vue'

// 布局契约断言：happy-dom 无布局引擎、vitest 又把样式导入 stub 成空串，
// 故用 node:fs 读 SFC 原文断言样式规则（参照 @ui/tokens tokens.spec.ts 先例；
// 该包为 node 环境可用 import.meta.url，本包 happy-dom 下其非 file:// scheme，
// 改以 process.cwd() 解析——按 AGENTS.md 约定 cwd 恒为组件包根）。
const progressSfc = readFileSync(resolve(process.cwd(), 'src/progress/Progress.vue'), 'utf8')

/** 取选择器声明块内的 属性 → 值 映射（本组件样式为纯声明块，无嵌套花括号）。 */
function declarationsOf(selector: RegExp): Map<string, string> {
  const block = progressSfc.match(selector)?.[1] ?? ''
  const map = new Map<string, string>()
  const re = /([a-zA-Z-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(block))) map.set(m[1], m[2].trim())
  return map
}

describe('Progress behavior', () => {
  it('value 响应式：aria-valuenow 与填充宽度同步更新', async () => {
    const wrapper = mount(Progress, { props: { value: 20 } })
    const fill = wrapper.find('.ui-progress__fill')
    expect(wrapper.attributes('aria-valuenow')).toBe('20')
    expect((fill.element as HTMLElement).style.width).toBe('20%')

    await wrapper.setProps({ value: 80 })
    expect(wrapper.attributes('aria-valuenow')).toBe('80')
    expect((fill.element as HTMLElement).style.width).toBe('80%')
  })

  it('切 indeterminate：省略 aria-valuenow、加扫描修饰类、去内联宽度；切回恢复确定态', async () => {
    const wrapper = mount(Progress, { props: { value: 60 } })
    const fill = wrapper.find('.ui-progress__fill')
    expect(wrapper.attributes('aria-valuenow')).toBe('60')

    await wrapper.setProps({ indeterminate: true })
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.classes()).toContain('ui-progress--indeterminate')
    expect(fill.classes()).toContain('ui-progress__fill--indeterminate')
    expect((fill.element as HTMLElement).style.width).toBe('')

    await wrapper.setProps({ indeterminate: false, value: 30 })
    expect(wrapper.attributes('aria-valuenow')).toBe('30')
    expect((fill.element as HTMLElement).style.width).toBe('30%')
    expect(fill.classes()).not.toContain('ui-progress__fill--indeterminate')
  })

  it('showLabel 响应式：标签随 props 出现/消失，indeterminate 下隐藏', async () => {
    const wrapper = mount(Progress, { props: { value: 42, showLabel: true } })
    expect(wrapper.find('.ui-progress__label').text()).toBe('42%')

    await wrapper.setProps({ indeterminate: true })
    expect(wrapper.find('.ui-progress__label').exists()).toBe(false)

    await wrapper.setProps({ indeterminate: false })
    expect(wrapper.find('.ui-progress__label').text()).toBe('42%')

    await wrapper.setProps({ showLabel: false })
    expect(wrapper.find('.ui-progress__label').exists()).toBe(false)
  })

  it('value 响应式钳制：越界值回落后 aria-valuenow 与宽度一致', async () => {
    const wrapper = mount(Progress, { props: { value: 90 } })
    await wrapper.setProps({ value: 200 })
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
    expect((wrapper.find('.ui-progress__fill').element as HTMLElement).style.width).toBe('100%')
    await wrapper.setProps({ value: -5 })
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
    expect((wrapper.find('.ui-progress__fill').element as HTMLElement).style.width).toBe('0%')
  })

  it('size 响应式：sm/md 修饰类切换', async () => {
    const wrapper = mount(Progress)
    expect(wrapper.classes()).toContain('ui-progress--md')
    await wrapper.setProps({ size: 'sm' })
    expect(wrapper.classes()).toContain('ui-progress--sm')
    expect(wrapper.classes()).not.toContain('ui-progress--md')
  })
})

describe('Progress 布局契约：轨道不塌缩', () => {
  // 回归背景：根元素在收缩上下文（如列向 flex + align-items: flex-start）中
  // 宽度收缩为内容宽，轨道 flex-grow 无自由空间可分配，塌缩为 0px——
  // 填充 width:N% 基于 0 计算，页面只剩数值文本。此组断言钉住修复的三条规则。
  it('根元素块级满宽（width: 100%）：为轨道 flex-grow 提供真实可用宽度', () => {
    expect(declarationsOf(/\.ui-progress\s*\{([^}]*)\}/).get('width')).toBe('100%')
  })

  it('轨道 flex: 1 1 auto：弹性吃满剩余宽度，填充百分比基于真实轨道宽', () => {
    expect(declarationsOf(/\.ui-progress__track\s*\{([^}]*)\}/).get('flex')).toBe('1 1 auto')
  })

  it('数值标签 flex: none：固有宽，不与轨道争宽', () => {
    expect(declarationsOf(/\.ui-progress__label\s*\{([^}]*)\}/).get('flex')).toBe('none')
  })
})
