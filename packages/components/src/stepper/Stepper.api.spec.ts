// api spec：props 默认值 / emits 声明 / slots 渲染 / 状态派生与交互元素标签。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Stepper from './Stepper.vue'
import type { StepperScope, StepperStep } from './Stepper.types'

const steps: StepperStep[] = [
  { title: '账号信息' },
  { title: '公司信息', description: '选填' },
  { title: '完成' },
]

interface StepperMountProps {
  steps?: StepperStep[]
  modelValue?: number
  status?: 'waiting' | 'process' | 'finish' | 'error'
  direction?: 'horizontal' | 'vertical'
  clickable?: boolean
}

function mountStepper(props: StepperMountProps = {}) {
  return mount(Stepper, { props: { steps, ...props } })
}

describe('Stepper api', () => {
  it('渲染 ui-stepper 根类 + role="list"，默认 direction=horizontal', () => {
    const wrapper = mountStepper()
    expect(wrapper.classes()).toContain('ui-stepper')
    expect(wrapper.classes()).toContain('ui-stepper--horizontal')
    expect(wrapper.classes()).not.toContain('ui-stepper--vertical')
    expect(wrapper.attributes('role')).toBe('list')
  })

  it('direction="vertical" 落 ui-stepper--vertical 修饰类', () => {
    const wrapper = mountStepper({ direction: 'vertical' })
    expect(wrapper.classes()).toContain('ui-stepper--vertical')
  })

  it('steps 逐项渲染 li 与标题，数量与声明一致', () => {
    const wrapper = mountStepper()
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items).toHaveLength(3)
    const titles = wrapper.findAll('.ui-stepper__title')
    expect(titles.map(t => t.text())).toEqual(['账号信息', '公司信息', '完成'])
  })

  it('默认（modelValue=0）：首步 process + aria-current=step，其余 waiting', () => {
    const wrapper = mountStepper()
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items[0].classes()).toContain('ui-stepper__item--process')
    expect(items[0].attributes('aria-current')).toBe('step')
    expect(items[1].classes()).toContain('ui-stepper__item--waiting')
    expect(items[1].attributes('aria-current')).toBeUndefined()
    expect(items[2].classes()).toContain('ui-stepper__item--waiting')
  })

  it('受控 modelValue：状态派生 finish/process/waiting，aria-current 落当前步', () => {
    const wrapper = mountStepper({ modelValue: 1 })
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items[0].classes()).toContain('ui-stepper__item--finish')
    expect(items[1].classes()).toContain('ui-stepper__item--process')
    expect(items[1].attributes('aria-current')).toBe('step')
    expect(items[2].classes()).toContain('ui-stepper__item--waiting')
  })

  it('description：有则渲染描述容器，无则不渲染', () => {
    const wrapper = mountStepper()
    const descriptions = wrapper.findAll('.ui-stepper__description')
    expect(descriptions).toHaveLength(1)
    expect(descriptions[0].text()).toBe('选填')
  })

  it('icon 插槽：以 { step, index, status } 作用域替换默认序号/图标', () => {
    const wrapper = mount(Stepper, {
      props: { steps, modelValue: 1 },
      slots: {
        icon: (scope: StepperScope) => h('i', { class: 'scoped-icon' }, `${scope.index}-${scope.status}`),
      },
    })
    const icons = wrapper.findAll('.scoped-icon')
    expect(icons).toHaveLength(3)
    expect(icons[0].text()).toBe('0-finish')
    expect(icons[1].text()).toBe('1-process')
    expect(icons[2].text()).toBe('2-waiting')
  })

  it('description 插槽：以 { step, index, status } 作用域替换描述文本', () => {
    const wrapper = mount(Stepper, {
      props: { steps },
      slots: {
        description: (scope: StepperScope) => h('em', `自定描述：${scope.step.title}`),
      },
    })
    const descriptions = wrapper.findAll('.ui-stepper__description')
    expect(descriptions).toHaveLength(3)
    expect(descriptions[1].text()).toBe('自定描述：公司信息')
  })

  it('默认（无 clickable）：所有步骤根为非交互 div', () => {
    const wrapper = mountStepper({ modelValue: 1 })
    const stepRoots = wrapper.findAll('.ui-stepper__step')
    for (const root of stepRoots) {
      expect(root.element.tagName).toBe('DIV')
    }
  })

  it('clickable：仅已完成（finish）步骤为原生 button type=button，当前/未到步仍为 div', () => {
    const wrapper = mountStepper({ modelValue: 1, clickable: true })
    const stepRoots = wrapper.findAll('.ui-stepper__step')
    expect(stepRoots[0].element.tagName).toBe('BUTTON')
    expect(stepRoots[0].attributes('type')).toBe('button')
    expect(stepRoots[1].element.tagName).toBe('DIV')
    expect(stepRoots[2].element.tagName).toBe('DIV')
  })

  it('emits 已声明：clickable 下点击已完成步骤发出 update:modelValue 与 change', async () => {
    const wrapper = mountStepper({ modelValue: 1, clickable: true })
    await wrapper.find('.ui-stepper__step').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]])
    expect(wrapper.emitted('change')).toEqual([[0]])
  })

  it('status="error"：仅覆盖当前步为 error，前序仍 finish', () => {
    const wrapper = mountStepper({ modelValue: 1, status: 'error' })
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items[0].classes()).toContain('ui-stepper__item--finish')
    expect(items[1].classes()).toContain('ui-stepper__item--error')
    expect(items[1].classes()).not.toContain('ui-stepper__item--process')
    expect(items[2].classes()).toContain('ui-stepper__item--waiting')
  })

  it('disabled 已完成步（clickable）：原生 disabled button + 禁用修饰类', () => {
    const wrapper = mountStepper({
      modelValue: 1,
      clickable: true,
      steps: [{ title: '甲', disabled: true }, { title: '乙' }],
    })
    const stepRoots = wrapper.findAll('.ui-stepper__step')
    expect(stepRoots[0].element.tagName).toBe('BUTTON')
    expect(stepRoots[0].attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('.ui-stepper__item')[0].classes()).toContain('ui-stepper__item--disabled')
  })

  it('disabled 未到步：仍为非交互 div（仅置灰）', () => {
    const wrapper = mountStepper({
      modelValue: 0,
      clickable: true,
      steps: [{ title: '甲' }, { title: '乙', disabled: true }],
    })
    const stepRoots = wrapper.findAll('.ui-stepper__step')
    expect(stepRoots[1].element.tagName).toBe('DIV')
    expect(wrapper.findAll('.ui-stepper__item')[1].classes()).toContain('ui-stepper__item--disabled')
  })

  it('默认图标节点：当前/未到步渲染序号文本（index+1）', () => {
    const wrapper = mountStepper()
    const nums = wrapper.findAll('.ui-stepper__num')
    expect(nums.map(n => n.text())).toEqual(['1', '2', '3'])
  })
})
