// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Stepper from './Stepper.vue'
import type { StepperStep } from './Stepper.types'

const steps: StepperStep[] = [
  { title: '账号信息' },
  { title: '公司信息', description: '选填' },
  { title: '完成' },
]

interface StepperSsrProps {
  steps?: StepperStep[]
  modelValue?: number
  status?: 'waiting' | 'process' | 'finish' | 'error'
  direction?: 'horizontal' | 'vertical'
  clickable?: boolean
}

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

function renderStepper(props: StepperSsrProps = {}): Promise<string> {
  return render(() => h(Stepper, { steps, ...props }))
}

describe('Stepper ssr', () => {
  it('renderToString 无异常且包含 ui-stepper 根类、role="list"', async () => {
    const html = await renderStepper()
    expect(html).toContain('ui-stepper')
    expect(html).toContain('ui-stepper--horizontal')
    expect(html).toContain('role="list"')
  })

  it('direction="vertical" 修饰类随 SSR 输出', async () => {
    const html = await renderStepper({ direction: 'vertical' })
    expect(html).toContain('ui-stepper--vertical')
  })

  it('状态派生类随 SSR 输出：默认 modelValue=0 → process/waiting，无 finish', async () => {
    const html = await renderStepper()
    expect(html).toContain('ui-stepper__item--process')
    expect(html).toContain('ui-stepper__item--waiting')
    expect(html).not.toContain('ui-stepper__item--finish')
  })

  it('受控 modelValue=1 在服务端生效：finish 段落位、aria-current 落当前步', async () => {
    const html = await renderStepper({ modelValue: 1 })
    const finishAt = html.indexOf('ui-stepper__item--finish')
    const processAt = html.indexOf('ui-stepper__item--process')
    expect(finishAt).toBeGreaterThanOrEqual(0)
    expect(processAt).toBeGreaterThan(finishAt)
    expect(html).toContain('aria-current="step"')
  })

  it('status="error" 覆盖随 SSR 输出：当前步 error、前序 finish', async () => {
    const html = await renderStepper({ modelValue: 1, status: 'error' })
    expect(html).toContain('ui-stepper__item--error')
    expect(html).toContain('ui-stepper__item--finish')
    expect(html).not.toContain('ui-stepper__item--process')
  })

  it('description 与步骤标题随 SSR 输出', async () => {
    const html = await renderStepper()
    expect(html).toContain('账号信息')
    expect(html).toContain('公司信息')
    expect(html).toContain('选填')
  })

  it('clickable：可交互步骤以原生 button 输出，disabled 落原生属性', async () => {
    const html = await renderStepper({ modelValue: 1, clickable: true })
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')

    const disabledHtml = await renderStepper({
      modelValue: 1,
      clickable: true,
      steps: [{ title: '甲', disabled: true }, { title: '乙' }],
    })
    expect(disabledHtml).toContain('disabled')
  })

  it('未开启 clickable：SSR 输出无非交互伪装按钮（无 button 元素）', async () => {
    const html = await renderStepper({ modelValue: 1 })
    expect(html).not.toContain('<button')
  })

  it('作用域插槽在 SSR 下渲染', async () => {
    const html = await render(() =>
      h(Stepper, { steps, modelValue: 1 }, {
        icon: ({ index, status }: { index: number; status: string }) =>
          h('i', `${index}-${status}`),
      }),
    )
    expect(html).toContain('0-finish')
    expect(html).toContain('1-process')
    expect(html).toContain('2-waiting')
  })
})
