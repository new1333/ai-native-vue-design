// a11y spec：list 语义 / aria-current="step" / 原生 button 与 Tab 序 / Enter/Space 键盘路径 / 装饰性图标。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Stepper from './Stepper.vue'
import type { StepperStep } from './Stepper.types'

const steps: StepperStep[] = [
  { title: '账号信息' },
  { title: '公司信息' },
  { title: '完成' },
]

/** modelValue=1 + clickable：第 0 步为可交互 button，第 1/2 步非交互。 */
function mountStepper(attach = false) {
  return mount(Stepper, {
    props: { steps, modelValue: 1, clickable: true },
    ...(attach ? { attachTo: document.body } : {}),
  })
}

describe('Stepper a11y', () => {
  it('根为 role="list" 列表语义，步骤项为 li', () => {
    const wrapper = mountStepper()
    expect(wrapper.attributes('role')).toBe('list')
    expect(wrapper.findAll('li.ui-stepper__item')).toHaveLength(3)
  })

  it('aria-current="step" 仅落在当前步 li；受控切换后跟随新当前步', async () => {
    const wrapper = mountStepper()
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items[0].attributes('aria-current')).toBeUndefined()
    expect(items[1].attributes('aria-current')).toBe('step')
    expect(items[2].attributes('aria-current')).toBeUndefined()
    await wrapper.setProps({ modelValue: 0 })
    const after = wrapper.findAll('.ui-stepper__item')
    expect(after[0].attributes('aria-current')).toBe('step')
    expect(after[1].attributes('aria-current')).toBeUndefined()
  })

  it('可交互步骤为原生 button（在 Tab 序，无 tabindex 覆写）；非交互步骤为 div', () => {
    const wrapper = mountStepper()
    const stepRoots = wrapper.findAll('.ui-stepper__step')
    expect(stepRoots[0].element.tagName).toBe('BUTTON')
    expect(stepRoots[0].attributes('tabindex')).toBeUndefined()
    expect(stepRoots[1].element.tagName).toBe('DIV')
    expect(stepRoots[2].element.tagName).toBe('DIV')
  })

  it('键盘 Enter：激活当前聚焦的可交互步骤（keydown preventDefault，单次触发）', async () => {
    const wrapper = mountStepper()
    const button = wrapper.findAll('.ui-stepper__step')[0]
    await button.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]])
    expect(wrapper.emitted('change')).toEqual([[0]])
  })

  it('键盘 Space（" "）：同 Enter 激活', async () => {
    const wrapper = mountStepper()
    const button = wrapper.findAll('.ui-stepper__step')[0]
    await button.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]])
    expect(wrapper.emitted('change')).toEqual([[0]])
  })

  it('激活键 keydown 被 preventDefault，非激活键不拦截', () => {
    const wrapper = mountStepper()
    const button = wrapper.findAll('.ui-stepper__step')[0].element
    for (const key of ['Enter', ' ']) {
      const activation = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      button.dispatchEvent(activation)
      expect(activation.defaultPrevented, key).toBe(true)
    }
    // Enter/Space 的合法激活已产生各一次发射；非激活键不得追加发射
    const emittedBefore = wrapper.emitted('update:modelValue')?.length ?? 0
    const other = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    button.dispatchEvent(other)
    expect(other.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(emittedBefore)
  })

  it('disabled button：键盘 Enter 不激活（原生 disabled + 网关兜底）', async () => {
    const wrapper = mount(Stepper, {
      props: {
        steps: [{ title: '甲', disabled: true }, { title: '乙' }],
        modelValue: 1,
        clickable: true,
      },
    })
    const button = wrapper.findAll('.ui-stepper__step')[0]
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('disabled')).toBeDefined()
    await button.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('可交互步骤可聚焦（Tab 到达后聚焦落点正确）', () => {
    const wrapper = mountStepper(true)
    const button = wrapper.findAll('.ui-stepper__step')[0]
    ;(button.element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(button.element)
    wrapper.unmount()
  })

  it('非交互步骤不伪装按钮：无 role=button、无 tabindex', () => {
    const wrapper = mountStepper()
    const divSteps = wrapper.findAll('.ui-stepper__step').filter(r => r.element.tagName === 'DIV')
    expect(divSteps).toHaveLength(2)
    for (const step of divSteps) {
      expect(step.attributes('role')).toBeUndefined()
      expect(step.attributes('tabindex')).toBeUndefined()
    }
  })

  it('装饰性图标 aria-hidden：对勾/叉 svg 不进入可读名（序号与标题承载可读信息）', async () => {
    const errorWrapper = mount(Stepper, {
      props: { steps, modelValue: 1, status: 'error' },
    })
    const cross = errorWrapper.find('.ui-stepper__item--error svg')
    expect(cross.exists()).toBe(true)
    expect(cross.attributes('aria-hidden')).toBe('true')
    errorWrapper.unmount()

    const finishWrapper = mount(Stepper, {
      props: { steps, modelValue: 2 },
    })
    const check = finishWrapper.find('.ui-stepper__item--finish svg')
    expect(check.exists()).toBe(true)
    expect(check.attributes('aria-hidden')).toBe('true')
  })
})
