// behavior spec：自动关闭计时（vi.useFakeTimers 控时）、hover 暂停/恢复、关闭路径与 onClose 语义。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ToastHost from './ToastHost.vue'
import { TOAST_DURATION_DEFAULT } from './ToastHost.constants'
import { toast, toasts } from './toast'

let mounted: { unmount: () => void } | null = null

/** 挂载 Host 并等 Teleport 渲染落地。 */
async function mountHost(): Promise<{ unmount: () => void }> {
  mounted = mount(ToastHost)
  await nextTick()
  return mounted
}

function items(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.ui-toast__item'))
}

/** 推入一条并等渲染单元挂载（其 onMounted 内起表）。 */
async function push(variant: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number, onClose?: () => void): Promise<number> {
  const id = toast[variant](message, { duration, onClose })
  await nextTick()
  await nextTick()
  return id
}

function itemWrapper(index = 0): DOMWrapper<HTMLElement> {
  const el = items()[index]
  if (!el) throw new Error('条目未渲染')
  return new DOMWrapper(el)
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  mounted?.unmount() // ToastItem 卸载 → cancel 清理计时器
  mounted = null
  toasts.value = [] // 清空单例栈
  vi.useRealTimers()
})

describe('ToastHost behavior', () => {
  it('默认时长 4000ms 自动关闭：差 1ms 仍在，归零后移除', async () => {
    await mountHost()
    await push('success', '默认时长')
    vi.advanceTimersByTime(TOAST_DURATION_DEFAULT - 1)
    expect(items()).toHaveLength(1)
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(items()).toHaveLength(0)
  })

  it('duration 覆盖：1500ms 自动关闭', async () => {
    await mountHost()
    await push('info', '短时长', 1500)
    vi.advanceTimersByTime(1499)
    expect(items()).toHaveLength(1)
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(items()).toHaveLength(0)
  })

  it('duration 0：不自动关闭，长时间推进后仍在', async () => {
    await mountHost()
    await push('error', '手动关闭', 0)
    vi.advanceTimersByTime(TOAST_DURATION_DEFAULT * 10)
    await nextTick()
    expect(items()).toHaveLength(1)
  })

  it('hover 暂停：悬停期间计时冻结，移出后按剩余时长关闭', async () => {
    await mountHost()
    await push('success', '悬停暂停')
    await itemWrapper().trigger('mouseenter')
    vi.advanceTimersByTime(TOAST_DURATION_DEFAULT * 2)
    expect(items()).toHaveLength(1) // 悬停中不关闭
    await itemWrapper().trigger('mouseleave')
    vi.advanceTimersByTime(TOAST_DURATION_DEFAULT)
    await nextTick()
    expect(items()).toHaveLength(0) // 移出后按剩余（≈全程）关闭
  })

  it('hover 暂停保留已过时长：移出后只补剩余部分', async () => {
    await mountHost()
    await push('info', '部分计时')
    vi.advanceTimersByTime(2000) // 先自然走过 2s
    await itemWrapper().trigger('mouseenter')
    vi.advanceTimersByTime(1000) // 悬停冻结，不计入
    await itemWrapper().trigger('mouseleave')
    vi.advanceTimersByTime(1999) // 剩余 2000ms 差 1ms
    expect(items()).toHaveLength(1)
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(items()).toHaveLength(0)
  })

  it('再次悬停可再次暂停', async () => {
    await mountHost()
    await push('warning', '反复暂停')
    await itemWrapper().trigger('mouseenter')
    vi.advanceTimersByTime(1000)
    await itemWrapper().trigger('mouseleave')
    vi.advanceTimersByTime(1000) // 已过 2s
    await itemWrapper().trigger('mouseenter')
    vi.advanceTimersByTime(TOAST_DURATION_DEFAULT * 3)
    expect(items()).toHaveLength(1) // 第二次悬停同样冻结
    await itemWrapper().trigger('mouseleave')
    vi.advanceTimersByTime(TOAST_DURATION_DEFAULT)
    await nextTick()
    expect(items()).toHaveLength(0)
  })

  it('点击关闭按钮：条目移除', async () => {
    await mountHost()
    await push('success', '点我关闭')
    await itemWrapper().find('button.ui-toast__close').trigger('click')
    await nextTick()
    expect(items()).toHaveLength(0)
  })

  it('onClose 在超时路径恰好触发一次', async () => {
    await mountHost()
    const onClose = vi.fn()
    await push('info', '超时回调', undefined, onClose)
    vi.advanceTimersByTime(TOAST_DURATION_DEFAULT)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('onClose 在关闭按钮路径恰好触发一次', async () => {
    await mountHost()
    const onClose = vi.fn()
    await push('success', '手动回调', undefined, onClose)
    await itemWrapper().find('button.ui-toast__close').trigger('click')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('onClose 在 toast.remove 路径触发；重复 remove 不再触发', async () => {
    await mountHost()
    const onClose = vi.fn()
    const id = await push('error', '程序式移除', undefined, onClose)
    expect(toast.remove(id)).toBe(true)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(toast.remove(id)).toBe(false)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('条目关闭不影响其余条目的计时', async () => {
    await mountHost()
    await push('info', '先关的', 1000)
    await push('info', '后关的', 3000)
    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(items().map(el => el.textContent)).toEqual(['后关的'])
    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(items()).toHaveLength(0)
  })
})
