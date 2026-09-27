// behavior spec：草稿提交 / v-model 双向 / 范围钳制 / 精度取整 / 按钮与键盘步进 / 禁用拦截。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import InputNumber from './InputNumber.vue'
import type { InputNumberProps } from './InputNumber.types'

type HostWrapper = ReturnType<typeof mount> & {
  getValue: () => number | null
  /** InputNumber 实例上发出的事件记录（宿主 wrapper 只记录宿主自身的 emit，须取内层实例）。 */
  events: (name: string) => unknown[] | undefined
}

/** 受控宿主：以 v-model 语义包住 InputNumber，返回宿主 wrapper。 */
function mountHost(props: InputNumberProps = {}): HostWrapper {
  const value = ref<number | null>(props.modelValue ?? null)
  const Host = defineComponent({
    setup() {
      return () =>
        h(InputNumber, {
          ...props,
          modelValue: value.value,
          'onUpdate:modelValue': (v: number | null) => {
            value.value = v
          },
        })
    },
  })
  const wrapper = mount(Host)
  const inner = wrapper.findComponent(InputNumber) as VueWrapper
  return Object.assign(wrapper, {
    getValue: () => value.value,
    events: (name: string) => inner.emitted(name),
  })
}

describe('InputNumber behavior', () => {
  it('键入 + 回车提交：发出 update:modelValue 与 change，展示保持所键入的值', async () => {
    const wrapper = mountHost({ modelValue: 1 })
    const control = wrapper.find('input')
    await control.setValue('7')
    await control.trigger('keydown', { key: 'Enter' })
    expect(wrapper.getValue()).toBe(7)
    expect(wrapper.events('update:modelValue')).toEqual([[7]])
    expect(wrapper.events('change')).toEqual([[7]])
    expect((control.element as HTMLInputElement).value).toBe('7')
  })

  it('键入 + 失焦提交：blur 路径同样收敛草稿', async () => {
    const wrapper = mountHost()
    const control = wrapper.find('input')
    await control.setValue('42')
    await control.trigger('blur')
    expect(wrapper.getValue()).toBe(42)
    expect(wrapper.events('change')).toEqual([[42]])
  })

  it('清空输入框提交 null：update:modelValue 与 change 载荷为 null', async () => {
    const wrapper = mountHost({ modelValue: 5 })
    const control = wrapper.find('input')
    await control.setValue('')
    await control.trigger('keydown', { key: 'Enter' })
    expect(wrapper.getValue()).toBeNull()
    expect(wrapper.events('change')).toEqual([[null]])
  })

  it('越界钳制：提交超出 max 的值被钳到 max 并回写', async () => {
    const wrapper = mountHost({ modelValue: 5, min: 0, max: 10 })
    const control = wrapper.find('input')
    await control.setValue('99')
    await control.trigger('keydown', { key: 'Enter' })
    expect(wrapper.getValue()).toBe(10)
    expect(wrapper.events('change')).toEqual([[10]])
    await nextTick()
    expect((control.element as HTMLInputElement).value).toBe('10')
  })

  it('精度取整：precision=2 时提交按两位小数取整并格式化展示', async () => {
    const wrapper = mountHost({ modelValue: 0, precision: 2 })
    const control = wrapper.find('input')
    await control.setValue('3.14159')
    await control.trigger('keydown', { key: 'Enter' })
    expect(wrapper.getValue()).toBe(3.14)
    expect(wrapper.events('change')).toEqual([[3.14]])
    await nextTick()
    expect((control.element as HTMLInputElement).value).toBe('3.14')
  })

  it('无法解析的草稿：提交被忽略、不发事件、回退展示生效值', async () => {
    const wrapper = mountHost({ modelValue: 3 })
    const control = wrapper.find('input')
    await control.setValue('abc')
    await control.trigger('keydown', { key: 'Enter' })
    expect(wrapper.events('update:modelValue')).toBeUndefined()
    expect(wrapper.events('change')).toBeUndefined()
    await nextTick()
    expect((control.element as HTMLInputElement).value).toBe('3')
  })

  it('值未变化时提交不发事件', async () => {
    const wrapper = mountHost({ modelValue: 3 })
    const control = wrapper.find('input')
    await control.setValue('3')
    await control.trigger('keydown', { key: 'Enter' })
    expect(wrapper.events('update:modelValue')).toBeUndefined()
    expect(wrapper.events('change')).toBeUndefined()
  })

  it('v-model 双向绑定：外部改值回落 DOM 展示（按 precision 格式化）', async () => {
    const value = ref<number | null>(1)
    const Host = defineComponent({
      setup: () => () =>
        h(InputNumber, {
          modelValue: value.value,
          precision: 2,
          'onUpdate:modelValue': (v: number | null) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    const control = wrapper.find('input')
    expect((control.element as HTMLInputElement).value).toBe('1.00')
    value.value = 2.5
    await nextTick()
    expect((control.element as HTMLInputElement).value).toBe('2.50')
  })

  it('增加按钮：以当前值 + step 步进，发出 update:modelValue / change / step', async () => {
    const wrapper = mountHost({ modelValue: 4, step: 2 })
    await wrapper.find('button.ui-input-number__increase').trigger('click')
    expect(wrapper.getValue()).toBe(6)
    expect(wrapper.events('update:modelValue')).toEqual([[6]])
    expect(wrapper.events('change')).toEqual([[6]])
    expect(wrapper.events('step')).toEqual([['up', 6]])
  })

  it('减少按钮：步进方向 down；空值时无 min 从 0 起步、有 min 从 min 起步', async () => {
    const fromZero = mountHost({})
    await fromZero.find('button.ui-input-number__decrease').trigger('click')
    expect(fromZero.getValue()).toBe(-1)
    expect(fromZero.events('step')).toEqual([['down', -1]])
    expect(fromZero.events('update:modelValue')).toEqual([[-1]])

    const fromMin = mountHost({ min: 5 })
    await fromMin.find('button.ui-input-number__decrease').trigger('click')
    // 空值 + min=5：减少从 min 起步再被下界钳回 min，值由 null → 5 实际变化，事件照发。
    expect(fromMin.getValue()).toBe(5)
    expect(fromMin.events('update:modelValue')).toEqual([[5]])
    expect(fromMin.events('step')).toEqual([['down', 5]])
  })

  it('边界上原地步进：值被钳制为无变化时不发出任何事件', async () => {
    const wrapper = mountHost({ modelValue: 10, min: 0, max: 10 })
    await wrapper.find('button.ui-input-number__increase').trigger('click')
    expect(wrapper.events('update:modelValue')).toBeUndefined()
    expect(wrapper.events('step')).toBeUndefined()
  })

  it('编辑草稿未提交时步进：以草稿为基准并收敛草稿', async () => {
    const wrapper = mountHost({ modelValue: 1 })
    const control = wrapper.find('input')
    await control.setValue('5')
    await wrapper.find('button.ui-input-number__increase').trigger('click')
    expect(wrapper.getValue()).toBe(6)
    expect(wrapper.events('step')).toEqual([['up', 6]])
    await nextTick()
    expect((control.element as HTMLInputElement).value).toBe('6')
  })

  it('浮点噪声：0.1 + 0.2 步进得到 0.3 而非 0.30000000000000004', async () => {
    const wrapper = mountHost({ modelValue: 0.1, step: 0.2 })
    await wrapper.find('button.ui-input-number__increase').trigger('click')
    expect(wrapper.getValue()).toBe(0.3)
    expect(wrapper.events('step')).toEqual([['up', 0.3]])
  })

  it('键盘 ↑/↓：逐 step 步进并发出 step 事件', async () => {
    const wrapper = mountHost({ modelValue: 5 })
    const control = wrapper.find('input')
    await control.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.getValue()).toBe(6)
    await control.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.getValue()).toBe(5)
    expect(wrapper.events('step')).toEqual([['up', 6], ['down', 5]])
  })

  it('键盘 PageUp/PageDown：一次跨 step × 10', async () => {
    const wrapper = mountHost({ modelValue: 5 })
    const control = wrapper.find('input')
    await control.trigger('keydown', { key: 'PageUp' })
    expect(wrapper.getValue()).toBe(15)
    await control.trigger('keydown', { key: 'PageDown' })
    expect(wrapper.getValue()).toBe(5)
    expect(wrapper.events('step')).toEqual([['up', 15], ['down', 5]])
  })

  it('键盘 Home/End：跳到 min/max（边界未定义时不动）', async () => {
    const wrapper = mountHost({ modelValue: 5, min: 0, max: 100 })
    const control = wrapper.find('input')
    await control.trigger('keydown', { key: 'Home' })
    expect(wrapper.getValue()).toBe(0)
    await control.trigger('keydown', { key: 'End' })
    expect(wrapper.getValue()).toBe(100)
    expect(wrapper.events('update:modelValue')).toEqual([[0], [100]])
    // Home/End 是跳边界，不是定向步进：不发 step 事件
    expect(wrapper.events('step')).toBeUndefined()

    const unbounded = mountHost({ modelValue: 5 })
    await unbounded.find('input').trigger('keydown', { key: 'Home' })
    expect(unbounded.getValue()).toBe(5)
    expect(unbounded.events('update:modelValue')).toBeUndefined()
  })

  it('disabled：按钮点击与键盘步进全部被拦截', async () => {
    const wrapper = mountHost({ modelValue: 5, min: 0, max: 10, disabled: true })
    await wrapper.find('button.ui-input-number__increase').trigger('click')
    await wrapper.find('input').trigger('keydown', { key: 'ArrowUp' })
    await wrapper.find('input').trigger('keydown', { key: 'Home' })
    expect(wrapper.getValue()).toBe(5)
    expect(wrapper.events('update:modelValue')).toBeUndefined()
    expect(wrapper.events('change')).toBeUndefined()
    expect(wrapper.events('step')).toBeUndefined()
  })

  it('外部受控值越界：展示按钳制值，下一次步进回写钳制值', async () => {
    const value = ref<number | null>(99)
    const Host = defineComponent({
      setup: () => () =>
        h(InputNumber, {
          modelValue: value.value,
          min: 0,
          max: 10,
          'onUpdate:modelValue': (v: number | null) => {
            value.value = v
          },
        }),
    })
    const wrapper = mount(Host)
    const control = wrapper.find('input')
    expect((control.element as HTMLInputElement).value).toBe('10')
    await control.trigger('keydown', { key: 'ArrowDown' })
    expect(value.value).toBe(9)
  })
})
