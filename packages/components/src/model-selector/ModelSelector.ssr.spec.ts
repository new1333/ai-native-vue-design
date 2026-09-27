// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类；浮层仅客户端（SSR 不出现 listbox/option/加载文案）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import ModelSelector from './ModelSelector.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('ModelSelector ssr', () => {
  it('renderToString 无异常且包含 ui-model-selector 根类与 combobox 触发器', async () => {
    const html = await render(() => h(ModelSelector))
    expect(html).toContain('ui-model-selector')
    expect(html).toContain('<button')
    expect(html).toContain('role="combobox"')
  })

  it('默认档：默认 placeholder、aria-expanded=false、aria-controls 随 SSR 输出，无 disabled', async () => {
    const html = await render(() => h(ModelSelector))
    expect(html).toContain('选择模型')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls="ui-model-selector-listbox-')
    expect(html).not.toContain('disabled')
  })

  it('浮层仅客户端：SSR 输出不含 listbox / option / 空态 / 加载文案', async () => {
    const html = await render(() =>
      h(ModelSelector, {
        models: [{ label: 'GPT-4o', value: 'gpt-4o' }],
        emptyText: '暂无可用模型',
        loadingText: '模型列表加载中…',
        loading: true,
      }),
    )
    expect(html).not.toContain('role="listbox"')
    expect(html).not.toContain('role="option"')
    expect(html).not.toContain('暂无可用模型')
    expect(html).not.toContain('模型列表加载中…')
  })

  it('已选模型：触发器显示模型名而非 placeholder；provider 徽标随 SSR 输出', async () => {
    const html = await render(() =>
      h(ModelSelector, {
        models: [
          { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
          { label: 'Claude', value: 'claude', provider: 'Anthropic' },
        ],
        modelValue: 'claude',
      }),
    )
    expect(html).toContain('Claude')
    expect(html).toContain('Anthropic')
    expect(html).toContain('ui-model-selector__badge')
    expect(html).not.toContain('选择模型')
  })

  it('loading：根级 aria-busy="true" 随 SSR 输出；非加载时不出现', async () => {
    const loading = await render(() => h(ModelSelector, { loading: true }))
    expect(loading).toContain('aria-busy="true"')
    const idle = await render(() => h(ModelSelector))
    expect(idle).not.toContain('aria-busy')
  })

  it('disabled / 自定义 placeholder / 数字 value 随 SSR 输出', async () => {
    const html = await render(() =>
      h(ModelSelector, {
        models: [
          { label: '快模型', value: 1 },
          { label: '强模型', value: 2 },
        ],
        modelValue: 1,
        placeholder: '选择对话模型',
        disabled: true,
      }),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('快模型')
    expect(html).not.toContain('选择对话模型')
  })

  it('attrs 透传在 SSR 即落位触发器 button（id / aria-describedby）', async () => {
    const html = await render(() => h(ModelSelector, { id: 'ssr-model-picker', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<button[^>]*id="ssr-model-picker"/)
    expect(html).toMatch(/<button[^>]*aria-describedby="tip"/)
  })
})
