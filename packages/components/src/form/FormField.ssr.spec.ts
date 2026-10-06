// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性（自 Form.ssr.spec.ts 移入的 FormField 断言）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import FormField from './FormField.vue'
import { Input } from '../input'
import type { FormFieldSlotScope } from './FormField.types'

/** FormField 的 props 片段（renderField 用）。 */
interface FieldProps {
  name: string
  label?: string
  required?: boolean
  error?: string
  help?: string
}

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('FormField ssr', () => {
  /** 单字段渲染（控件经插槽作用域 controlAttrs 绑定 Input）。 */
  function renderField(props: FieldProps): Promise<string> {
    return render(() =>
      h(FormField, props, {
        default: (s: FormFieldSlotScope) =>
          h(Input, { ...s.controlAttrs, modelValue: '' }),
      }),
    )
  }

  it('renderToString 无异常且包含 ui-form-field 根类', async () => {
    const html = await renderField({ name: 'title' })
    expect(html).toContain('ui-form-field')
    expect(html).toContain('<input')
  })

  it('label[for] 与控件 id 随 SSR 输出且严格相等（useId 稳定前缀）', async () => {
    const html = await renderField({ name: 'title', label: '标题' })
    const forMatch = /for="(ui-form-field-[^"]+)"/.exec(html)
    const idMatch = /id="(ui-form-field-[^"]+)"/.exec(html)
    expect(forMatch).not.toBeNull()
    expect(idMatch).not.toBeNull()
    expect(forMatch?.[1]).toBe(idMatch?.[1])
  })

  it('同一渲染内多个 FormField 的控件 id 互不冲突（SSR 稳定且唯一）', async () => {
    const html = await render(() =>
      h('div', [
        h(FormField, { name: 'a', label: '甲' }, {
          default: (s: FormFieldSlotScope) =>
            h(Input, { ...s.controlAttrs, modelValue: '' }),
        }),
        h(FormField, { name: 'b', label: '乙' }, {
          default: (s: FormFieldSlotScope) =>
            h(Input, { ...s.controlAttrs, modelValue: '' }),
        }),
      ]),
    )
    const ids = [...html.matchAll(/id="(ui-form-field-[^"]+)"/g)].map((m) => m[1])
    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
  })

  it('error prop：错误文案与 id 随 SSR 输出，控件获得 aria-invalid/aria-describedby', async () => {
    const html = await renderField({ name: 'title', error: '标题不能为空' })
    expect(html).toContain('标题不能为空')
    expect(html).toContain('ui-form-field__error')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toMatch(/aria-describedby="ui-form-field-[^"]+-error"/)
  })

  it('help：帮助文案与 id 随 SSR 输出，控件 aria-describedby 指向 help，无 aria-invalid', async () => {
    const html = await renderField({ name: 'title', help: '填写文档标题' })
    expect(html).toContain('填写文档标题')
    expect(html).toContain('ui-form-field__help')
    expect(html).toMatch(/aria-describedby="ui-form-field-[^"]+-help"/)
    expect(html).not.toContain('aria-invalid')
  })

  it('required：aria-required 与 aria-hidden 标记随 SSR 输出', async () => {
    const html = await renderField({ name: 'title', label: '标题', required: true })
    expect(html).toContain('aria-required="true"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('*')
  })
})
