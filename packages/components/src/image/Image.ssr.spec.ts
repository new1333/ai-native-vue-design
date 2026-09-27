// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；输出包含 ui- 根类与关键契约属性。
// 服务端无 load/error 事件：状态恒为 loading（占位视图）；lazy 门闩不放行；预览浮层未打开不输出。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import Image from './Image.vue'

const GOOD_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"></svg>')

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('Image ssr', () => {
  it('renderToString 无异常且包含 ui-image 根类与 loading 占位', async () => {
    const html = await render(() => h(Image, { src: GOOD_SRC }))
    expect(html).toContain('ui-image')
    expect(html).toContain('ui-image--loading')
    expect(html).toContain('ui-image__placeholder')
    expect(html).not.toContain('ui-image__error')
  })

  it('img src / alt / object-fit 随 SSR 输出', async () => {
    const html = await render(() => h(Image, { src: GOOD_SRC, alt: '风景照', fit: 'cover' }))
    expect(html).toContain('<img')
    expect(html).toContain(`src="${GOOD_SRC}"`)
    expect(html).toContain('alt="风景照"')
    expect(html).toMatch(/object-fit:\s*cover/)
  })

  it('alt 缺省输出空字符串（装饰性语义）', async () => {
    const html = await render(() => h(Image, { src: GOOD_SRC }))
    expect(html).toMatch(/alt=""/)
  })

  it('lazy：门闩未放行，SSR 不输出 img、不发起请求', async () => {
    const html = await render(() => h(Image, { src: GOOD_SRC, lazy: true }))
    expect(html).not.toContain('<img')
    expect(html).not.toContain(GOOD_SRC)
    expect(html).toContain('ui-image__placeholder')
  })

  it('preview：触发器 button 随 SSR 输出，预览浮层未打开不输出', async () => {
    const html = await render(() => h(Image, { src: GOOD_SRC, preview: true, alt: '风景照' }))
    expect(html).toContain('ui-image__trigger')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('aria-label="预览图片：风景照"')
    expect(html).not.toContain('ui-image__preview')
  })

  it('placeholder 插槽内容随 SSR 输出', async () => {
    const html = await render(() =>
      h(Image, { src: GOOD_SRC }, { placeholder: () => h('span', { class: 'my-ph' }, '载入中') }),
    )
    expect(html).toContain('my-ph')
    expect(html).toContain('载入中')
  })
})
