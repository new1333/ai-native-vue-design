// behavior spec：逐格输入 / 自动前进 / 粘贴分发 / Backspace 回退 / 键盘移动焦点 / v-model 双向 / 禁用拦截。
import { describe, expect, it, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DOMWrapper, VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import InputOtp from './InputOtp.vue'
import type { InputOtpProps } from './InputOtp.types'

/** attachTo document.body 的 wrapper 登记处：afterEach 统一卸载，避免跨用例焦点/DOM 泄漏。 */
const attached: Array<{ unmount: () => void }> = []

afterEach(() => {
  while (attached.length) attached.pop()?.unmount()
})

type HostWrapper = ReturnType<typeof mount> & {
  getValue: () => string
  /** InputOtp 实例上发出的事件记录（宿主 wrapper 只记录宿主自身的 emit，须取内层实例）。 */
  events: (name: string) => unknown[] | undefined
  cells: () => DOMWrapper<HTMLInputElement>[]
}

/** 受控宿主：以 v-model 语义包住 InputOtp，返回宿主 wrapper（多步交互须用它保证受控值新鲜）。 */
function mountHost(props: InputOtpProps = {}): HostWrapper {
  const value = ref(props.modelValue ?? '')
  const Host = defineComponent({
    setup() {
      return () =>
        h(InputOtp, {
          ...props,
          modelValue: value.value,
          'onUpdate:modelValue': (v: string) => {
            value.value = v
          },
        })
    },
  })
  const wrapper = mount(Host, { attachTo: document.body })
  attached.push(wrapper)
  const inner = wrapper.findComponent(InputOtp) as VueWrapper
  return Object.assign(wrapper, {
    getValue: () => value.value,
    events: (name: string) => inner.emitted(name),
    cells: () => wrapper.findAll<HTMLInputElement>('input.ui-input-otp__cell'),
  })
}

/** 在元素上派发带 clipboardData 桩的 paste 事件（VTU trigger 无法注入只读的 clipboardData）。 */
function pasteText(element: Element, text: string): void {
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } })
  element.dispatchEvent(event)
}

describe('InputOtp behavior', () => {
  it('逐格输入：字符落位当前格并发 update:modelValue，焦点自动前进到下一格', async () => {
    const wrapper = mountHost({ length: 4 })
    const cells = wrapper.cells()
    await cells[0].setValue('5')
    expect(wrapper.getValue()).toBe('5')
    expect(wrapper.events('update:modelValue')).toEqual([['5']])
    expect(document.activeElement).toBe(cells[1].element)
    expect((cells[0].element as HTMLInputElement).value).toBe('5')
  })

  it('末格输入后焦点停留（不越界）', async () => {
    const wrapper = mountHost({ length: 2 })
    const cells = wrapper.cells()
    cells[1].element.focus()
    await cells[1].setValue('9')
    expect(document.activeElement).toBe(cells[1].element)
  })

  it('逐格填满：complete 以完整值发出', async () => {
    const wrapper = mountHost({ length: 2 })
    const cells = wrapper.cells()
    await cells[0].setValue('1')
    expect(wrapper.events('complete')).toBeUndefined()
    await cells[1].setValue('2')
    expect(wrapper.events('update:modelValue')).toEqual([['1'], ['12']])
    expect(wrapper.events('complete')).toEqual([['12']])
  })

  it('同字符重输：值无变化不发事件，焦点仍前进', async () => {
    const wrapper = mountHost({ modelValue: '5', length: 4 })
    const cells = wrapper.cells()
    await cells[0].setValue('5')
    expect(wrapper.events('update:modelValue')).toBeUndefined()
    expect(document.activeElement).toBe(cells[1].element)
  })

  it('验证码一键填充（单格多字符输入）：从当前格起分发并发出 complete', async () => {
    const wrapper = mountHost({ length: 6 })
    const cells = wrapper.cells()
    await cells[0].setValue('123456')
    expect(wrapper.getValue()).toBe('123456')
    expect(wrapper.events('complete')).toEqual([['123456']])
    await nextTick()
    expect(cells.map((c) => (c.element as HTMLInputElement).value)).toEqual([
      '1', '2', '3', '4', '5', '6',
    ])
    expect(document.activeElement).toBe(cells[5].element)
  })

  it('粘贴分发：过滤空白与连字符后依次落位，焦点落在最后被填充的格', async () => {
    const wrapper = mountHost({ length: 4 })
    const cells = wrapper.cells()
    pasteText(cells[0].element, '12-34')
    await nextTick()
    expect(wrapper.getValue()).toBe('1234')
    expect(wrapper.events('complete')).toEqual([['1234']])
    expect(document.activeElement).toBe(cells[3].element)
  })

  it('粘贴分发到中段格子：只覆盖从该格起的后续格位', async () => {
    const wrapper = mountHost({ modelValue: '12', length: 4 })
    const cells = wrapper.cells()
    pasteText(cells[2].element, '9')
    await nextTick()
    expect(wrapper.getValue()).toBe('129')
    expect(document.activeElement).toBe(cells[3].element)
  })

  it('粘贴内容被完全过滤（numeric 粘贴字母）：值不变、不发事件', async () => {
    const wrapper = mountHost({ modelValue: '1', length: 4 })
    pasteText(wrapper.cells()[1].element, 'abc')
    await nextTick()
    expect(wrapper.getValue()).toBe('1')
    expect(wrapper.events('update:modelValue')).toBeUndefined()
  })

  it('numeric 过滤：非法键入不产生值变化，格子 DOM 回写受控值', async () => {
    const wrapper = mountHost({ modelValue: '1', length: 4 })
    const cells = wrapper.cells()
    await cells[1].setValue('ab')
    expect(wrapper.getValue()).toBe('1')
    expect(wrapper.events('update:modelValue')).toBeUndefined()
    expect((cells[1].element as HTMLInputElement).value).toBe('')
  })

  it('alphanumeric：接受字母并保留大小写', async () => {
    const wrapper = mountHost({ inputMode: 'alphanumeric', length: 4 })
    await wrapper.cells()[0].setValue('A')
    expect(wrapper.getValue()).toBe('A')
    await wrapper.cells()[1].setValue('中')
    expect(wrapper.getValue()).toBe('A')
  })

  it('Backspace：本格有值删本格（焦点不动，可连续删除）', async () => {
    const wrapper = mountHost({ modelValue: '12', length: 4 })
    const cells = wrapper.cells()
    cells[1].element.focus()
    await cells[1].trigger('keydown', { key: 'Backspace' })
    expect(wrapper.getValue()).toBe('1')
    expect(wrapper.events('update:modelValue')).toEqual([['1']])
    expect(document.activeElement).toBe(cells[1].element)
  })

  it('Backspace：本格为空则回退删除前一格并把焦点交还它', async () => {
    const wrapper = mountHost({ modelValue: '12', length: 4 })
    const cells = wrapper.cells()
    cells[2].element.focus()
    await cells[2].trigger('keydown', { key: 'Backspace' })
    expect(wrapper.getValue()).toBe('1')
    expect(wrapper.events('update:modelValue')).toEqual([['1']])
    expect(document.activeElement).toBe(cells[1].element)
  })

  it('Backspace：空格子的前一格也为空时只移动焦点、不发事件', async () => {
    const wrapper = mountHost({ modelValue: '1', length: 4 })
    const cells = wrapper.cells()
    cells[3].element.focus()
    await cells[3].trigger('keydown', { key: 'Backspace' })
    expect(wrapper.getValue()).toBe('1')
    expect(wrapper.events('update:modelValue')).toBeUndefined()
    expect(document.activeElement).toBe(cells[2].element)
  })

  it('Delete：清空当前格，焦点不动', async () => {
    const wrapper = mountHost({ modelValue: '12', length: 4 })
    const cells = wrapper.cells()
    cells[0].element.focus()
    await cells[0].trigger('keydown', { key: 'Delete' })
    expect(wrapper.getValue()).toBe('2')
    expect(document.activeElement).toBe(cells[0].element)
  })

  it('ArrowLeft / ArrowRight：焦点逐格移动（边界上不越界）', async () => {
    const wrapper = mountHost({ length: 4 })
    const cells = wrapper.cells()
    cells[0].element.focus()
    await cells[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(cells[0].element)
    await cells[0].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(cells[1].element)
    await cells[1].trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(cells[0].element)
    cells[3].element.focus()
    await cells[3].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(cells[3].element)
  })

  it('Home / End：焦点跳到首格 / 末格', async () => {
    const wrapper = mountHost({ length: 4 })
    const cells = wrapper.cells()
    cells[2].element.focus()
    await cells[2].trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(cells[0].element)
    await cells[0].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(cells[3].element)
  })

  it('v-model 双向绑定：外部改值回落各格 DOM', async () => {
    const value = ref('')
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
    await cells[0].setValue('7')
    expect(value.value).toBe('7')
    value.value = '90'
    await nextTick()
    expect((cells[0].element as HTMLInputElement).value).toBe('9')
    expect((cells[1].element as HTMLInputElement).value).toBe('0')
  })

  it('length 响应式变化：格子数量同步增减，值按新格数截断展示', async () => {
    const wrapper = mount(InputOtp, { props: { modelValue: '123456' } })
    expect(wrapper.findAll('input')).toHaveLength(6)
    await wrapper.setProps({ length: 3 })
    const cells = wrapper.findAll('input')
    expect(cells).toHaveLength(3)
    expect(cells.map((c) => (c.element as HTMLInputElement).value)).toEqual(['1', '2', '3'])
  })

  it('disabled：输入 / 粘贴 / 键盘路径全部拦截', async () => {
    const wrapper = mountHost({ modelValue: '1', disabled: true, length: 4 })
    const cells = wrapper.cells()
    await cells[1].setValue('5')
    pasteText(cells[2].element, '9')
    await cells[3].trigger('keydown', { key: 'Backspace' })
    await cells[3].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.getValue()).toBe('1')
    expect(wrapper.events('update:modelValue')).toBeUndefined()
    expect(wrapper.events('complete')).toBeUndefined()
  })
})
