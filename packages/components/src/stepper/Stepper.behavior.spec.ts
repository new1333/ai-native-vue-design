// behavior spec：clickable 点击切换 / 网关拦截（前跳、禁用、非交互）/ v-model 受控 / 状态响应。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Stepper from './Stepper.vue'
import type { StepperStep } from './Stepper.types'

const steps: StepperStep[] = [
  { title: '账号信息' },
  { title: '公司信息' },
  { title: '完成' },
]

/** modelValue=1：第 0 步已完成、第 1 步当前、第 2 步未到。 */
function mountStepper(props: Record<string, unknown> = {}) {
  return mount(Stepper, { props: { steps, modelValue: 1, ...props } })
}

describe('Stepper behavior', () => {
  it('非 clickable：点击任意步骤不发出任何事件', async () => {
    const wrapper = mountStepper()
    const stepRoots = wrapper.findAll('.ui-stepper__step')
    await stepRoots[0].trigger('click')
    await stepRoots[1].trigger('click')
    await stepRoots[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('clickable：点击已完成步骤发出 update:modelValue + change（目标索引）', async () => {
    const wrapper = mountStepper({ clickable: true })
    await wrapper.findAll('.ui-stepper__step')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]])
    expect(wrapper.emitted('change')).toEqual([[0]])
  })

  it('clickable：点击未到步（waiting）不发出 —— 不允许跳过未完成步骤前跳', async () => {
    const wrapper = mountStepper({ clickable: true })
    await wrapper.findAll('.ui-stepper__step')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('clickable：点击当前步（process）不发出（同值不重复发出）', async () => {
    const wrapper = mountStepper({ clickable: true })
    await wrapper.findAll('.ui-stepper__step')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('clickable：禁用的已完成步被网关拦截（disabled button + 处理器兜底）', async () => {
    const wrapper = mountStepper({
      clickable: true,
      steps: [{ title: '甲', disabled: true }, { title: '乙' }, { title: '丙' }],
    })
    const button = wrapper.findAll('.ui-stepper__step')[0]
    expect(button.attributes('disabled')).toBeDefined()
    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('v-model 受控：父状态随 update:modelValue 更新；回退后状态派生整体刷新', async () => {
    const current = ref(1)
    const Host = defineComponent({
      setup() {
        return () =>
          h(Stepper, {
            steps,
            modelValue: current.value,
            clickable: true,
            'onUpdate:modelValue': (value: number) => {
              current.value = value
            },
          })
      },
    })
    const wrapper = mount(Host)
    await wrapper.findAll('.ui-stepper__step')[0].trigger('click')
    expect(current.value).toBe(0)
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items[0].classes()).toContain('ui-stepper__item--process')
    expect(items[0].attributes('aria-current')).toBe('step')
    expect(items[1].classes()).toContain('ui-stepper__item--waiting')
  })

  it('受控但父级未接住：点击仍发出 update:modelValue + change（组件不持有内部状态）', async () => {
    const wrapper = mountStepper({ clickable: true, modelValue: 2 })
    await wrapper.findAll('.ui-stepper__step')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[1]])
    expect(wrapper.emitted('change')).toEqual([[1]])
    // 状态不自行推进：仍按受控 modelValue=2 渲染
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items[1].classes()).toContain('ui-stepper__item--finish')
    expect(items[2].classes()).toContain('ui-stepper__item--process')
  })

  it('modelValue 受控推进：setProps 后各步状态与 aria-current 跟随刷新', async () => {
    const wrapper = mountStepper({ clickable: true })
    await wrapper.setProps({ modelValue: 2 })
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items[0].classes()).toContain('ui-stepper__item--finish')
    expect(items[1].classes()).toContain('ui-stepper__item--finish')
    expect(items[2].classes()).toContain('ui-stepper__item--process')
    expect(items[2].attributes('aria-current')).toBe('step')
    // 完成段连接线转成功色修饰类：前两项均 finish
    expect(wrapper.findAll('.ui-stepper__item--finish')).toHaveLength(2)
  })

  it('status 覆盖响应：setProps status="error" 后当前步转 error，前序不受影响', async () => {
    const wrapper = mountStepper()
    await wrapper.setProps({ status: 'error' })
    const items = wrapper.findAll('.ui-stepper__item')
    expect(items[0].classes()).toContain('ui-stepper__item--finish')
    expect(items[1].classes()).toContain('ui-stepper__item--error')
    expect(items[2].classes()).toContain('ui-stepper__item--waiting')
  })
})
