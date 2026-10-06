// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性（FormField 的用例见 FormField.*.spec.ts；组合场景保留于此）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Form from './Form.vue'
import FormField from './FormField.vue'
import { Input } from '../input'
import type { FormSlotScope } from './Form.types'
import type { FormFieldSlotScope } from './FormField.types'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Form ssr', () => {
  it('renderToString 无异常且包含 ui-form 根类与原生 form 元素', async () => {
    const html = await render(() => h(Form, { model: {} }))
    expect(html).toContain('ui-form')
    expect(html).toContain('<form')
    expect(html).toContain('novalidate')
  })

  it('默认插槽作用域初始值随 SSR 输出：valid=true、pending=false、errors 空', async () => {
    const html = await render(() =>
      h(Form, { model: {} }, {
        default: (scope: FormSlotScope) =>
          h(
            'output',
            { class: 'form-scope' },
            `${scope.valid}|${scope.pending}|${Object.keys(scope.errors).length}`,
          ),
      }),
    )
    expect(html).toContain('true|false|0')
  })

  it('pending prop 随 SSR 输出反映到作用域', async () => {
    const html = await render(() =>
      h(Form, { model: {}, pending: true }, {
        default: (scope: FormSlotScope) =>
          h('output', { class: 'form-scope' }, `${scope.valid}|${scope.pending}`),
      }),
    )
    expect(html).toContain('true|true')
  })

  it('Form + FormField 组合在 SSR 下整体可渲染（provide/inject 不依赖浏览器）', async () => {
    const html = await render(() =>
      h(Form, { model: { title: '' }, rules: { title: [() => '不能为空'] } }, {
        default: () => [
          h(FormField, { name: 'title', label: '标题' }, {
            default: (s: FormFieldSlotScope) =>
              h(Input, { ...s.controlAttrs, modelValue: '' }),
          }),
        ],
      }),
    )
    expect(html).toContain('ui-form')
    expect(html).toContain('ui-form-field')
    expect(html).not.toContain('ui-form-field--error')
  })
})
