// a11y spec：group 语义 / 每格 aria-label / one-time-code / 键盘路径（方向、回退、跳边界）/ 焦点管理。
import { describe, expect, it, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import InputOtp from './InputOtp.vue'
import type { InputOtpExpose } from './InputOtp.types'

/** attachTo document.body 的 wrapper 登记处：afterEach 统一卸载，避免跨用例焦点/DOM 泄漏。 */
const attached: Array<{ unmount: () => void }> = []

afterEach(() => {
  while (attached.length) attached.pop()?.unmount()
})

describe('InputOtp a11y', () => {
  it('容器为 role=group 的原生 div；格子为原生 <input>（隐式 role=textbox），不额外书写 role', () => {
    const wrapper = mount(InputOtp)
    expect(wrapper.attributes('role')).toBe('group')
    for (const cell of wrapper.findAll('input')) {
      expect(cell.element.tagName).toBe('INPUT')
      expect(cell.attributes('role')).toBeUndefined()
    }
  })

  it('每格 aria-label「第 N 位，共 M 位」：掩码下格子无可见语义，须逐格可读', () => {
    const cells = mount(InputOtp, { props: { length: 4 } }).findAll('input')
    expect(cells.map((c) => c.attributes('aria-label'))).toEqual([
      '第 1 位，共 4 位',
      '第 2 位，共 4 位',
      '第 3 位，共 4 位',
      '第 4 位，共 4 位',
    ])
  })

  it('首格 autocomplete=one-time-code（短信验证码自动填充识别），其余格不声明', () => {
    const cells = mount(InputOtp).findAll('input')
    expect(cells[0].attributes('autocomplete')).toBe('one-time-code')
    expect(cells[1].attributes('autocomplete')).toBeUndefined()
  })

  it('masked=true：type=password 遮蔽字符（防旁人窥视）；默认 type=text', () => {
    expect(mount(InputOtp, { props: { masked: true } }).find('input').attributes('type')).toBe('password')
    expect(mount(InputOtp).find('input').attributes('type')).toBe('text')
  })

  it('disabled：原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const cell = mount(InputOtp, { props: { disabled: true } }).find('input')
    expect(cell.attributes('disabled')).toBeDefined()
    expect(cell.attributes('aria-disabled')).toBeUndefined()
  })

  it('不改写 tabindex：格子自然进入 Tab 序', () => {
    for (const cell of mount(InputOtp).findAll('input')) {
      expect(cell.attributes('tabindex')).toBeUndefined()
    }
  })

  it('aria-label / aria-describedby 经 attrs 落 role=group 容器（FormField 接入点），不覆盖每格可读名称', () => {
    const wrapper = mount(InputOtp, {
      attrs: { 'aria-label': '短信验证码', 'aria-describedby': 'otp-tip' },
    })
    expect(wrapper.attributes('aria-label')).toBe('短信验证码')
    expect(wrapper.attributes('aria-describedby')).toBe('otp-tip')
    expect(wrapper.find('input').attributes('aria-label')).toBe('第 1 位，共 6 位')
  })

  it('separator 分隔符按装饰处理：aria-hidden="true"', () => {
    const separator = mount(InputOtp, {
      props: { length: 3 },
      slots: { separator: () => h('span', '-') },
    }).find('.ui-input-otp__separator')
    expect(separator.attributes('aria-hidden')).toBe('true')
  })

  it('键盘路径：expose.focus() 聚焦首格，键入自动前进，Arrow / Home / End 移动焦点', async () => {
    const wrapper = mount(InputOtp, { props: { length: 4 }, attachTo: document.body })
    attached.push(wrapper)
    const cells = wrapper.findAll('input')
    const exposed = wrapper.vm as InputOtpExpose

    exposed.focus()
    expect(document.activeElement).toBe(cells[0].element)
    await cells[0].setValue('5')
    expect(wrapper.emitted('update:modelValue')).toEqual([['5']])
    expect(document.activeElement).toBe(cells[1].element)

    await cells[1].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(cells[2].element)
    await cells[2].trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(cells[0].element)
    await cells[0].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(cells[3].element)
    await cells[3].trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(cells[2].element)
  })

  it('键盘路径：空格子上 Backspace 回退到前一格并删除其值（连续回退可清空整串）', async () => {
    // 连续回退依赖受控值同步：以 v-model 宿主包住组件。
    const value = ref('12')
    const Host = defineComponent({
      setup: () => () =>
        h(InputOtp, {
          modelValue: value.value,
          length: 4,
          'onUpdate:modelValue': (v: string) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    attached.push(wrapper)
    const cells = wrapper.findAll('input')
    // 格位 2/3 为空：Backspace 逐格回退（值不变）直到落在本格有值的位置。
    cells[3].element.focus()
    await cells[3].trigger('keydown', { key: 'Backspace' })
    expect(value.value).toBe('12')
    expect(document.activeElement).toBe(cells[2].element)
    await cells[2].trigger('keydown', { key: 'Backspace' })
    expect(value.value).toBe('1')
    expect(document.activeElement).toBe(cells[1].element)
    await cells[1].trigger('keydown', { key: 'Backspace' })
    expect(value.value).toBe('')
    expect(document.activeElement).toBe(cells[0].element)
  })

  it('键盘路径：Delete 只清当前格，焦点不动', async () => {
    const wrapper = mount(InputOtp, { props: { modelValue: '1', length: 4 }, attachTo: document.body })
    attached.push(wrapper)
    const cells = wrapper.findAll('input')
    cells[0].element.focus()
    await cells[0].trigger('keydown', { key: 'Delete' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    expect(document.activeElement).toBe(cells[0].element)
  })

  it('expose.blur() 移除焦点；expose.focus(index) 可定向聚焦第 N 格', async () => {
    const wrapper = mount(InputOtp, { props: { length: 4 }, attachTo: document.body })
    attached.push(wrapper)
    const cells = wrapper.findAll('input')
    const exposed = wrapper.vm as InputOtpExpose
    exposed.focus(2)
    expect(document.activeElement).toBe(cells[2].element)
    exposed.blur()
    expect(document.activeElement).not.toBe(cells[2].element)
  })
})
