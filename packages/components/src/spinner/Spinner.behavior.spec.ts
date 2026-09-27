// behavior spec：variant / size / label 的响应式切换 + 动效契约（token 推导、reduced-motion 保险）。
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Spinner from './Spinner.vue'

// 样式契约断言：happy-dom 无布局引擎、vitest 又把样式导入 stub 成空串，
// 故用 node:fs 读 SFC 原文断言样式规则（参照 progress/ 先例；
// 以 process.cwd() 解析——按 AGENTS.md 约定 cwd 恒为组件包根）。
const spinnerSfc = readFileSync(resolve(process.cwd(), 'src/spinner/Spinner.vue'), 'utf8')

/** 取选择器声明块内的 属性 → 值 映射（本组件样式为纯声明块，无嵌套花括号）。 */
function declarationsOf(selector: RegExp): Map<string, string> {
  const block = spinnerSfc.match(selector)?.[1] ?? ''
  const map = new Map<string, string>()
  const re = /([a-zA-Z-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(block))) map.set(m[1], m[2].trim())
  return map
}

describe('Spinner behavior', () => {
  it('variant 响应式切换：spin ↔ dots 重建图形结构', async () => {
    const wrapper = mount(Spinner, { props: { label: '加载中' } })
    expect(wrapper.find('.ui-spinner__svg').exists()).toBe(true)
    expect(wrapper.find('.ui-spinner__dot').exists()).toBe(false)

    await wrapper.setProps({ variant: 'dots' })
    expect(wrapper.classes()).toContain('ui-spinner--dots')
    expect(wrapper.findAll('.ui-spinner__dot')).toHaveLength(3)
    expect(wrapper.find('.ui-spinner__svg').exists()).toBe(false)

    await wrapper.setProps({ variant: 'spin' })
    expect(wrapper.find('.ui-spinner__svg').exists()).toBe(true)
    expect(wrapper.find('.ui-spinner__dot').exists()).toBe(false)
  })

  it('size 响应式：档位修饰类切换（两种变体一致）', async () => {
    const spin = mount(Spinner, { props: { label: 'x' } })
    expect(spin.classes()).toContain('ui-spinner--md')
    await spin.setProps({ size: 'lg' })
    expect(spin.classes()).toContain('ui-spinner--lg')
    expect(spin.classes()).not.toContain('ui-spinner--md')

    const dots = mount(Spinner, { props: { label: 'x', variant: 'dots' } })
    await dots.setProps({ size: 'sm' })
    expect(dots.classes()).toContain('ui-spinner--sm')
    expect(dots.classes()).not.toContain('ui-spinner--lg')
  })

  it('label 响应式：sr-only 可访问名文本随 props 更新', async () => {
    const wrapper = mount(Spinner, { props: { label: '加载中' } })
    expect(wrapper.find('.ui-spinner__label').text()).toBe('加载中')

    await wrapper.setProps({ label: '正在导出报告' })
    expect(wrapper.find('.ui-spinner__label').text()).toBe('正在导出报告')
  })
})

describe('Spinner 动效契约：token 推导 + reduced-motion 双通道', () => {
  it('spin 旋转：transform 白名单动效，时长由 --ui-motion-default 推导（×4，与 Button 内建加载指示同源）', () => {
    expect(declarationsOf(/\.ui-spinner__svg\s*\{([^}]*)\}/).get('animation')).toBe(
      'ui-spinner-spin calc(var(--ui-motion-default) * 4) linear infinite',
    )
    const spinKeyframes = spinnerSfc.match(/@keyframes ui-spinner-spin\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(spinKeyframes).toContain('rotate(360deg)')
  })

  it('dots 脉冲：opacity 动效由 token 推导（×6），错相负延迟同为 token 推导', () => {
    expect(declarationsOf(/\.ui-spinner__dot\s*\{([^}]*)\}/).get('animation')).toBe(
      'ui-spinner-pulse calc(var(--ui-motion-default) * 6) ease-in-out infinite',
    )
    expect(
      declarationsOf(/\.ui-spinner__dot:nth-child\(2\)\s*\{([^}]*)\}/).get('animation-delay'),
    ).toBe('calc(var(--ui-motion-default) * -2)')
    expect(
      declarationsOf(/\.ui-spinner__dot:nth-child\(3\)\s*\{([^}]*)\}/).get('animation-delay'),
    ).toBe('calc(var(--ui-motion-default) * -4)')
  })

  it('reduced-motion 显式停用（token 归零之外的第二通道）：spin 与 dots 均覆盖', () => {
    const mediaBlock = spinnerSfc.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/,
    )?.[1]
    expect(mediaBlock).toBeTruthy()
    expect(mediaBlock).toContain('.ui-spinner__svg')
    expect(mediaBlock).toContain('.ui-spinner__dot')
    expect(mediaBlock).toContain('animation: none')
  })

  it('sr-only 可访问名：结构性裁剪契约（小盒 + overflow hidden + clip-path）', () => {
    const decls = declarationsOf(/\.ui-spinner__label\s*\{([^}]*)\}/)
    expect(decls.get('position')).toBe('absolute')
    expect(decls.get('overflow')).toBe('hidden')
    expect(decls.get('clip-path')).toBe('inset(50%)')
    expect(decls.get('width')).toBe('var(--ui-space-1)')
    expect(decls.get('height')).toBe('var(--ui-space-1)')
  })
})
