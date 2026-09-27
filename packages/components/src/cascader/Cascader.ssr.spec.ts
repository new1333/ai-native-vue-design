// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类；浮层仅客户端（SSR 不出现 menu/panel/option）。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Cascader from './Cascader.vue'
import type { CascaderOption } from './Cascader.types'

const TREE: CascaderOption[] = [
  {
    label: '浙江省',
    value: 'zj',
    children: [{ label: '杭州市', value: 'hz', children: [{ label: '西湖区', value: 'xh' }] }],
  },
  { label: '上海市', value: 'sh', children: [{ label: '黄浦区', value: 'hp' }] },
]

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Cascader ssr', () => {
  it('renderToString 无异常且包含 ui-cascader 根类与 combobox 触发器', async () => {
    const html = await render(() => h(Cascader))
    expect(html).toContain('ui-cascader')
    expect(html).toContain('<button')
    expect(html).toContain('role="combobox"')
  })

  it('默认档：默认 placeholder、aria-expanded=false、关闭态不输出 aria-controls，无 disabled', async () => {
    const html = await render(() => h(Cascader))
    expect(html).toContain('请选择')
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('aria-controls')
    expect(html).not.toContain('disabled')
  })

  it('浮层仅客户端：SSR 输出不含 menu / listbox / option / 空态文案', async () => {
    const html = await render(() =>
      h(Cascader, { options: [], emptyText: '暂无选项' }),
    )
    expect(html).not.toContain('ui-cascader__menu')
    expect(html).not.toContain('role="listbox"')
    expect(html).not.toContain('role="option"')
    expect(html).not.toContain('暂无选项')
  })

  it('已选路径：触发器显示路径 label 拼接而非 placeholder', async () => {
    const html = await render(() => h(Cascader, { options: TREE, modelValue: ['zj', 'hz'] }))
    expect(html).toContain('浙江省 / 杭州市')
    expect(html).not.toContain('请选择')
  })

  it('multiple：勾选路径数组随 SSR 输出为拼接文案', async () => {
    const html = await render(() =>
      h(Cascader, { options: TREE, modelValue: [['zj', 'hz', 'xh']], multiple: true }),
    )
    expect(html).toContain('浙江省 / 杭州市 / 西湖区')
  })

  it('disabled / 自定义 placeholder / 数字 value 路径随 SSR 输出', async () => {
    const html = await render(() =>
      h(Cascader, {
        options: [
          { label: '小', value: 1, children: [{ label: '特小', value: 11 }] },
          { label: '大', value: 2, children: [{ label: '特大', value: 22 }] },
        ],
        modelValue: [1, 11],
        placeholder: '选择尺寸',
        disabled: true,
      }),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('小 / 特小')
    expect(html).not.toContain('选择尺寸')
  })

  it('不可解析路径：回落 placeholder（不抛异常）', async () => {
    const html = await render(() => h(Cascader, { options: TREE, modelValue: ['x', 'y'] }))
    expect(html).toContain('请选择')
  })

  it('attrs 透传在 SSR 即落位触发器 button（id / aria-describedby）', async () => {
    const html = await render(() => h(Cascader, { id: 'ssr-cascader', 'aria-describedby': 'tip' }))
    expect(html).toMatch(/<button[^>]*id="ssr-cascader"/)
    expect(html).toMatch(/<button[^>]*aria-describedby="tip"/)
  })
})
