// behavior spec：单项 disabled 的 change 拦截（RadioGroup 作为组上下文；组级行为用例见 RadioGroup.*.spec.ts）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Radio from './Radio.vue'
import RadioGroup from './RadioGroup.vue'

describe('Radio behavior', () => {
  it('单项 disabled：被禁项不可选中，同组其余项照常可选', async () => {
    const wrapper = mount(RadioGroup, {
      props: { name: 'plan' },
      slots: { default: () => [h(Radio, { key: 'a', value: 'a', disabled: true }), h(Radio, { key: 'b', value: 'b' })] },
    })
    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await inputs[1]?.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  })
})
