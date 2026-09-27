// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常，输出包含 ui- 根类与关键契约属性。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Upload from './Upload.vue'
import type { UploadFile } from './Upload.types'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

const presetFile = (name: string, overrides: Partial<UploadFile> = {}): UploadFile => ({
  uid: `file-${name}`,
  name,
  status: 'success',
  percent: 100,
  ...overrides,
})

describe('Upload ssr', () => {
  it('renderToString 无异常且包含 ui-upload 根类、触发器与隐藏 file input', async () => {
    const html = await render(() => h(Upload))
    expect(html).toContain('ui-upload')
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('选择文件')
    expect(html).toContain('type="file"')
  })

  it('默认档：无 disabled/drag 修饰类，空列表不渲染 ul', async () => {
    const html = await render(() => h(Upload))
    expect(html).not.toContain('ui-upload--disabled')
    expect(html).not.toContain('ui-upload--drag')
    expect(html).not.toContain('<ul')
  })

  it('accept / multiple / drag / disabled 全量随 SSR 输出', async () => {
    const html = await render(() =>
      h(Upload, { accept: 'image/*', multiple: true, drag: true, disabled: true }),
    )
    expect(html).toContain('accept="image/*"')
    expect(html).toContain('multiple')
    expect(html).toContain('ui-upload--drag')
    expect(html).toContain('ui-upload--disabled')
    expect(html).toContain('disabled')
    expect(html).toContain('点击或拖拽文件到此处')
  })

  it('受控列表：名称/尺寸/状态文本/条目修饰类随 SSR 输出', async () => {
    const html = await render(() =>
      h(Upload, {
        modelValue: [
          presetFile('报告.pdf', { size: 4096 }),
          presetFile('扫描件.png', { status: 'error', percent: 0, error: '服务端校验失败' }),
        ],
      }),
    )
    expect(html).toContain('报告.pdf')
    expect(html).toContain('4 KB')
    expect(html).toContain('上传成功')
    expect(html).toContain('ui-upload__item--error')
    expect(html).toContain('上传失败')
    expect(html).toContain('服务端校验失败')
    expect(html).toContain('aria-label="移除 报告.pdf"')
    expect(html).toContain('aria-label="重试 扫描件.png"')
  })

  it('uploading 条目：progressbar 契约与内联宽度随 SSR 输出', async () => {
    const html = await render(() =>
      h(Upload, { modelValue: [presetFile('a.zip', { status: 'uploading', percent: 37 })] }),
    )
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-label="a.zip 上传进度"')
    expect(html).toContain('aria-valuenow="37"')
    expect(html).toContain('width:37%')
    expect(html).toContain('上传中 37%')
  })

  it('trigger / list（作用域）/ empty 插槽随 SSR 输出', async () => {
    const html = await render(() =>
      h(Upload, { modelValue: [presetFile('a.txt')] }, {
        trigger: () => h('span', { class: 'my-trigger' }, '上传附件'),
        list: (scope: { files: UploadFile[] }) => h('div', `共 ${scope.files.length} 个文件`),
      }),
    )
    expect(html).toContain('上传附件')
    expect(html).toContain('共 1 个文件')
    expect(html).not.toContain('<ul')

    const empty = await render(() => h(Upload, null, { empty: () => h('p', '暂无附件') }))
    expect(empty).toContain('暂无附件')
  })

  it('隐藏 input 在 SSR 即带 aria-hidden 与 tabindex="-1"', async () => {
    const html = await render(() => h(Upload))
    expect(html).toMatch(/<input[^>]*aria-hidden="true"/)
    expect(html).toMatch(/<input[^>]*tabindex="-1"/)
  })
})
