// @vitest-environment node
// ssr spec：node 环境 renderToString 不抛异常；挂载前仅输出 hidden 占位（ui- 根类），无浮层输出。
import { describe, expect, it } from 'vitest'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { VNode } from 'vue'
import ToastHost from './ToastHost.vue'
import { toast } from './toast'

function render(node: () => VNode): Promise<string> {
  return renderToString(createSSRApp({ render: node }))
}

describe('ToastHost ssr', () => {
  it('renderToString 无异常且包含 ui-toast 根类（hidden 占位）', async () => {
    const html = await render(() => h(ToastHost))
    expect(html).toContain('ui-toast')
    expect(html).toContain('hidden')
  })

  it('挂载前不渲染浮层：输出无 region 容器 / 条目 / 关闭按钮', async () => {
    const html = await render(() => h(ToastHost))
    expect(html).not.toContain('role="region"')
    expect(html).not.toContain('aria-label')
    expect(html).not.toContain('ui-toast__item')
    expect(html).not.toContain('ui-toast__close')
  })

  it('node 环境调用 toast 单例不抛错；已推入的提示不进入 SSR 输出', async () => {
    const id = toast.success('服务端推入')
    const html = await render(() => h(ToastHost))
    expect(html).not.toContain('服务端推入')
    expect(html).not.toContain('ui-toast__item')
    toast.remove(id) // 清理单例栈（node 与 happy-dom 用例的模块实例互相隔离，仅本文件内清理）
  })

  it('同条件两次渲染输出一致（占位稳定，可安全水合）', async () => {
    const node = () => h(ToastHost)
    const first = await render(node)
    const second = await render(node)
    expect(first).toBe(second)
  })
})
