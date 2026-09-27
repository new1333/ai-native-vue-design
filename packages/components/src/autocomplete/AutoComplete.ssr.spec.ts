// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类；弹层仅客户端（SSR 不出现 listbox/option/空态/加载行）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import AutoComplete from './AutoComplete.vue'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('AutoComplete ssr', () => {
  it('renderToString 无异常且包含 ui-autocomplete 根类与 combobox 输入框', async () => {
    const html = await render(() => h(AutoComplete))
    expect(html).toContain('ui-autocomplete')
    expect(html).toContain('<input')
    expect(html).toContain('role="combobox"')
  })

  it('默认档：默认 placeholder、aria-expanded=false、aria-autocomplete/aria-controls 随 SSR 输出，无 disabled', async () => {
    const html = await render(() => h(AutoComplete))
    expect(html).toContain('placeholder="请输入"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-autocomplete="list"')
    expect(html).toContain('aria-haspopup="listbox"')
    expect(html).toContain('aria-controls="ui-autocomplete-listbox-')
    expect(html).not.toContain('disabled')
  })

  it('modelValue 随输入框 value 属性输出（值+文本合一）', async () => {
    const html = await render(() => h(AutoComplete, { modelValue: '北京' }))
    expect(html).toContain('value="北京"')
  })

  it('浮层仅客户端：SSR 输出不含 listbox / option / 空态 / 加载行', async () => {
    const html = await render(() =>
      h(AutoComplete, { options: [{ label: '北京', value: 'beijing' }], emptyText: '暂无匹配', loading: true }),
    )
    expect(html).not.toContain('role="listbox"')
    expect(html).not.toContain('role="option"')
    expect(html).not.toContain('暂无匹配')
    expect(html).not.toContain('加载中')
    expect(html).not.toContain('aria-busy')
  })

  it('disabled / 自定义 placeholder 随 SSR 输出', async () => {
    const html = await render(() =>
      h(AutoComplete, { options: [], placeholder: '搜索城市', disabled: true }),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('placeholder="搜索城市"')
    expect(html).not.toContain('placeholder="请输入"')
  })

  it('clearable + 有值：清空按钮与 aria-label="清空" 随 SSR 输出，空文本不渲染', async () => {
    const withValue = await render(() => h(AutoComplete, { modelValue: '北京', clearable: true }))
    expect(withValue).toContain('ui-autocomplete__clear')
    expect(withValue).toContain('aria-label="清空"')
    const empty = await render(() => h(AutoComplete, { clearable: true }))
    expect(empty).not.toContain('ui-autocomplete__clear')
  })

  it('attrs 透传在 SSR 即落位原生 input（id / aria-describedby）', async () => {
    const html = await render(() => h(AutoComplete, { id: 'ssr-ac', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<input[^>]*id="ssr-ac"/)
    expect(html).toMatch(/<input[^>]*aria-describedby="tip"/)
  })
})
