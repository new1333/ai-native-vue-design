// api spec：toast 单例 API 面（变体方法/id 发号/remove）/ ToastHost 挂载结构 / 堆叠渲染。
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ToastHost from './ToastHost.vue'
import { TOAST_DURATION_DEFAULT } from './ToastHost.constants'
import { toast, toasts } from './toast'

let mounted: { unmount: () => void } | null = null

/** 挂载 Host 并等 Teleport 渲染落地（isMounted 翻转在 onMounted 后的下一拍生效）。 */
async function mountHost(): Promise<{ unmount: () => void }> {
  mounted = mount(ToastHost)
  await nextTick()
  return mounted
}

/** 挂载后浮层容器被 Teleport 到 document.body，统一从这里查询。 */
function region(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-toast[role="region"]')
}

function items(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.ui-toast__item'))
}

afterEach(() => {
  mounted?.unmount()
  mounted = null
  toasts.value = [] // 清空单例栈，避免跨用例泄漏
})

describe('ToastHost api', () => {
  it('空栈挂载：Teleport 到 body 渲染容器（ui-toast 根类），无条目', async () => {
    await mountHost()
    const root = region()
    expect(root).not.toBeNull()
    expect(root?.classList.contains('ui-toast')).toBe(true)
    expect(items()).toHaveLength(0)
  })

  it('Host 未挂载时推入不抛错；挂载后渲染存量提示', async () => {
    expect(() => toast.info('挂载前推入')).not.toThrow()
    expect(items()).toHaveLength(0)
    await mountHost()
    expect(items()).toHaveLength(1)
    expect(items()[0]?.textContent).toContain('挂载前推入')
  })

  it('四个变体方法推入对应修饰类', async () => {
    await mountHost()
    toast.success('成功')
    toast.error('失败')
    toast.info('信息')
    toast.warning('警告')
    await nextTick()
    const classes = items().map(el => el.className)
    expect(classes).toContain('ui-toast__item ui-toast__item--success')
    expect(classes).toContain('ui-toast__item ui-toast__item--error')
    expect(classes).toContain('ui-toast__item ui-toast__item--info')
    expect(classes).toContain('ui-toast__item ui-toast__item--warning')
  })

  it('变体方法返回严格自增 id', async () => {
    await mountHost()
    const first = toast.success('第一条')
    const second = toast.error('第二条')
    const third = toast.info('第三条')
    expect(second).toBeGreaterThan(first)
    expect(third).toBeGreaterThan(second)
  })

  it('message 文本渲染进条目', async () => {
    await mountHost()
    toast.warning('草稿即将过期')
    await nextTick()
    expect(items()[0]?.querySelector('.ui-toast__message')?.textContent).toBe('草稿即将过期')
  })

  it('多条提示按推入顺序堆叠渲染', async () => {
    await mountHost()
    toast.info('第一条')
    toast.info('第二条')
    toast.error('第三条')
    await nextTick()
    expect(items().map(el => el.textContent)).toEqual(['第一条', '第二条', '第三条'])
  })

  it('remove(id)：命中移除条目并返回 true；未命中返回 false', async () => {
    await mountHost()
    const id = toast.success('待移除')
    await nextTick()
    expect(items()).toHaveLength(1)
    expect(toast.remove(id)).toBe(true)
    await nextTick()
    expect(items()).toHaveLength(0)
    expect(toast.remove(id)).toBe(false)
  })

  it('remove(id) 只移除目标条目，其余保留', async () => {
    await mountHost()
    toast.info('保留 A')
    const target = toast.info('移除 B')
    toast.info('保留 C')
    await nextTick()
    toast.remove(target)
    await nextTick()
    expect(items().map(el => el.textContent)).toEqual(['保留 A', '保留 C'])
  })

  it('关闭按钮渲染为原生 button（结构面；aria 细节见 a11y spec）', async () => {
    await mountHost()
    toast.success('可关闭')
    await nextTick()
    const close = items()[0]?.querySelector('button.ui-toast__close')
    expect(close?.tagName).toBe('BUTTON')
  })

  it('默认展示时长常量为 4000ms（自动关闭时序断言见 behavior spec）', () => {
    expect(TOAST_DURATION_DEFAULT).toBe(4000)
  })
})
