// api spec：props 默认值 / 受控值分发 / emits 声明 / slots 渲染 / attrs 透传落位。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import InputOtp from './InputOtp.vue'

describe('InputOtp api', () => {
  it('渲染 ui-input-otp 根容器（role=group）与默认 6 格原生 input', () => {
    const wrapper = mount(InputOtp)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-input-otp')
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.findAll('input.ui-input-otp__cell')).toHaveLength(6)
  })

  it('每格 maxlength=1、默认 type=text、inputmode=numeric', () => {
    const cells = mount(InputOtp).findAll('input')
    for (const cell of cells) {
      expect(cell.attributes('maxlength')).toBe('1')
      expect(cell.attributes('type')).toBe('text')
      expect(cell.attributes('inputmode')).toBe('numeric')
    }
  })

  it('modelValue 受控初值按位分发到各格 DOM value', () => {
    const cells = mount(InputOtp, { props: { modelValue: '123456' } }).findAll('input')
    expect(cells.map((c) => (c.element as HTMLInputElement).value)).toEqual([
      '1', '2', '3', '4', '5', '6',
    ])
  })

  it('外部超长值：按格数截断展示，不渲染多余格子', () => {
    const cells = mount(InputOtp, { props: { modelValue: '1234567890' } }).findAll('input')
    expect(cells).toHaveLength(6)
    expect(cells.map((c) => (c.element as HTMLInputElement).value)).toEqual([
      '1', '2', '3', '4', '5', '6',
    ])
  })

  it('masked=true：全部格子渲染为 type=password', () => {
    const cells = mount(InputOtp, { props: { masked: true } }).findAll('input')
    expect(cells).toHaveLength(6)
    for (const cell of cells) expect(cell.attributes('type')).toBe('password')
  })

  it('inputMode=alphanumeric：inputmode 属性切换为 text', () => {
    const cells = mount(InputOtp, { props: { inputMode: 'alphanumeric' } }).findAll('input')
    expect(cells[0].attributes('inputmode')).toBe('text')
  })

  it('disabled：全部格子原生 disabled + 修饰类', () => {
    const wrapper = mount(InputOtp, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('ui-input-otp--disabled')
    for (const cell of wrapper.findAll('input')) {
      expect(cell.attributes('disabled')).toBeDefined()
    }
  })

  it('首格 autocomplete=one-time-code，其余格不携带', () => {
    const cells = mount(InputOtp).findAll('input')
    expect(cells[0].attributes('autocomplete')).toBe('one-time-code')
    expect(cells[1].attributes('autocomplete')).toBeUndefined()
  })

  it('每格自带「第 N 位，共 M 位」aria-label', () => {
    const cells = mount(InputOtp).findAll('input')
    expect(cells[0].attributes('aria-label')).toBe('第 1 位，共 6 位')
    expect(cells[5].attributes('aria-label')).toBe('第 6 位，共 6 位')
  })

  it('length 响应格数（非法值回退默认 6）', () => {
    expect(mount(InputOtp, { props: { length: 4 } }).findAll('input')).toHaveLength(4)
    expect(mount(InputOtp, { props: { length: 0 } }).findAll('input')).toHaveLength(6)
  })

  it('update:modelValue 已声明：逐格输入路径以字符串载荷发出', async () => {
    const wrapper = mount(InputOtp)
    await wrapper.findAll('input')[0].setValue('5')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['5'])
  })

  it('complete 已声明：length=1 时任意输入即填满并发出', async () => {
    const wrapper = mount(InputOtp, { props: { length: 1 } })
    await wrapper.findAll('input')[0].setValue('9')
    expect(wrapper.emitted('complete')).toEqual([['9']])
  })

  it('外部初值满格不触发 complete', () => {
    const wrapper = mount(InputOtp, { props: { modelValue: '123456' } })
    expect(wrapper.emitted('complete')).toBeUndefined()
  })

  it('separator 插槽渲染于每个间隙（length - 1 处）；未提供时不渲染', () => {
    const withSep = mount(InputOtp, { props: { length: 3 }, slots: { separator: () => h('span', '-') } })
    const separators = withSep.findAll('.ui-input-otp__separator')
    expect(separators).toHaveLength(2)
    expect(separators[0].text()).toBe('-')

    const withoutSep = mount(InputOtp, { props: { length: 3 } })
    expect(withoutSep.findAll('.ui-input-otp__separator')).toHaveLength(0)
  })

  it('attrs 透传（inheritAttrs:false）：合并到 role=group 容器，不落单格', () => {
    const wrapper = mount(InputOtp, {
      attrs: { id: 'otp-field', 'aria-label': '短信验证码', 'aria-describedby': 'otp-tip' },
    })
    expect(wrapper.attributes('id')).toBe('otp-field')
    expect(wrapper.attributes('aria-label')).toBe('短信验证码')
    expect(wrapper.attributes('aria-describedby')).toBe('otp-tip')
    for (const cell of wrapper.findAll('input')) {
      expect(cell.attributes('id')).toBeUndefined()
      expect(cell.attributes('aria-describedby')).toBeUndefined()
    }
  })
})
