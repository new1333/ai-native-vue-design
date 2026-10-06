// @vitest-environment node
// ssr spec：node 环境 renderToString 无异常；组根/name/checked/disabled/aria-label 随 SSR 输出（自 Radio.ssr.spec.ts 移入的 RadioGroup 断言）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Radio from './Radio.vue'
import RadioGroup from './RadioGroup.vue'
import type { RadioGroupProps, RadioValue } from './Radio.types'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

function renderGroup(
  groupProps: RadioGroupProps & Record<string, unknown>,
  radios: Array<{ value: RadioValue; label?: string; disabled?: boolean }> = [],
): Promise<string> {
  return render(() =>
    h(RadioGroup, groupProps, { default: () => radios.map((r) => h(Radio, { key: r.value, ...r })) }),
  )
}

describe('RadioGroup ssr', () => {
  it('renderToString 无异常：组根含 ui-radio-group 与 role="radiogroup"', async () => {
    const html = await renderGroup({ name: 'plan' }, [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }])
    expect(html).toContain('ui-radio-group')
    expect(html).toContain('role="radiogroup"')
    expect(html).toContain('ui-radio')
  })

  it('name 随 SSR 下发到每个原生 radio；选中项输出 checked', async () => {
    const html = await renderGroup({ name: 'plan', modelValue: 'b' }, [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }])
    expect(html.match(/name="plan"/g)).toHaveLength(2)
    expect(html).toContain('checked')
  })

  it('未选中时无 checked 输出', async () => {
    const html = await renderGroup({ name: 'plan' }, [{ value: 'a', label: '甲' }])
    expect(html).not.toContain('checked')
  })

  it('整组 disabled 与单项 disabled 均随 SSR 输出', async () => {
    const whole = await renderGroup({ name: 'plan', disabled: true }, [{ value: 'a' }])
    expect(whole).toContain('disabled')

    const single = await renderGroup({ name: 'plan' }, [{ value: 'a', disabled: true }, { value: 'b' }])
    expect(single).toContain('disabled')
  })

  it('label prop 与默认插槽文案随 SSR 输出；attrs aria-label 落组容器', async () => {
    const html = await renderGroup(
      { name: 'plan', 'aria-label': '套餐' },
      [{ value: 'a', label: '甲' }, { value: 'b' }],
    )
    expect(html).toContain('甲')
    expect(html).toContain('aria-label="套餐"')
  })
})
