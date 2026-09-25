// a11y spec：region 容器 / status·alert 角色 / 关闭按钮 aria / 键盘可达与原生激活不被阻止 / 不抢焦点。
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ToastHost from './ToastHost.vue'
import { TOAST_CLOSE_ARIA_LABEL, TOAST_REGION_LABEL } from './ToastHost.constants'
import { toast, toasts } from './toast'

let mounted: { unmount: () => void } | null = null

async function mountHost(): Promise<{ unmount: () => void }> {
  mounted = mount(ToastHost)
  await nextTick()
  return mounted
}

/** 推入一条并等渲染落地。 */
async function push(variant: 'success' | 'error' | 'info' | 'warning', message: string): Promise<number> {
  const id = toast[variant](message)
  await nextTick()
  await nextTick()
  return id
}

function region(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-toast[role="region"]')
}

function items(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.ui-toast__item'))
}

function closeButtons(): HTMLButtonElement[] {
  return Array.from(document.body.querySelectorAll<HTMLButtonElement>('.ui-toast__item button.ui-toast__close'))
}

afterEach(() => {
  mounted?.unmount()
  mounted = null
  toasts.value = [] // 清空单例栈
})

describe('ToastHost a11y', () => {
  it('容器 role="region" 且 aria-label="通知"', async () => {
    await mountHost()
    await push('info', '容器语义')
    const root = region()
    expect(root).not.toBeNull()
    expect(root?.getAttribute('role')).toBe('region')
    expect(root?.getAttribute('aria-label')).toBe(TOAST_REGION_LABEL)
    expect(TOAST_REGION_LABEL).toBe('通知')
  })

  it('success / info / warning 条目 role="status"', async () => {
    await mountHost()
    await push('success', '成功')
    await push('info', '信息')
    await push('warning', '警告')
    const roles = items().map(el => el.getAttribute('role'))
    expect(roles).toEqual(['status', 'status', 'status'])
  })

  it('error 条目 role="alert"（读屏立即播报）', async () => {
    await mountHost()
    await push('error', '失败')
    expect(items()[0]?.getAttribute('role')).toBe('alert')
  })

  it('关闭按钮：原生 <button type="button"> 且带 aria-label', async () => {
    await mountHost()
    await push('success', '可关闭')
    const [close] = closeButtons()
    expect(close).toBeDefined()
    expect(close.tagName).toBe('BUTTON')
    expect(close.getAttribute('type')).toBe('button')
    expect(close.getAttribute('aria-label')).toBe(TOAST_CLOSE_ARIA_LABEL)
    expect(TOAST_CLOSE_ARIA_LABEL).toBe('关闭通知')
  })

  it('关闭按钮自然进入 Tab 序（无 tabindex="-1"），条目本身不带 tabindex', async () => {
    await mountHost()
    await push('info', '焦点序')
    const [close] = closeButtons()
    expect(close.getAttribute('tabindex')).toBeNull()
    expect(items()[0]?.getAttribute('tabindex')).toBeNull()
  })

  it('键盘 Enter / Space 激活路径未被阻止（原生 button 默认激活保持可用）', async () => {
    await mountHost()
    await push('success', '键盘路径')
    const [close] = closeButtons()
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    close.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    close.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(false)
  })

  it('图标 svg 均 aria-hidden="true"（文本/aria-label 已承载语义）', async () => {
    await mountHost()
    await push('warning', '图标隐藏')
    const svgs = items()[0]?.querySelectorAll('svg')
    expect(svgs?.length).toBe(2)
    for (const svg of Array.from(svgs ?? [])) {
      expect(svg.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('推入提示不改变文档焦点（不抢焦点，被动通知）', async () => {
    await mountHost()
    const before = document.activeElement
    await push('success', '不抢焦点')
    expect(document.activeElement).toBe(before)
  })
})
