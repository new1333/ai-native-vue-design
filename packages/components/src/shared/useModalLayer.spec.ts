/**
 * useModalLayer spec —— 模态层机制（黑盒经宿主组件接口）：滚动锁计数与还原、
 * 焦点移入/还原、Tab 圈定、Esc 出口、非模态旁路。
 */
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useModalLayer } from './useModalLayer'
import type { UseModalLayerOptions, UseModalLayerReturn } from './useModalLayer'

/** 宿主组件：把 composable 挂进 setup（onMounted 生命周期需组件上下文）。 */
function mountLayer(
  overrides: Partial<UseModalLayerOptions> = {},
): { api: () => UseModalLayerReturn; escapes: () => number } {
  let api!: UseModalLayerReturn
  let escapes = 0
  const Host = defineComponent({
    setup() {
      api = useModalLayer({
        panel: () => null,
        onEscape: () => {
          escapes += 1
        },
        ...overrides,
      })
      return () => h('div')
    },
  })
  mount(Host, { attachTo: document.body })
  return { api: () => api, escapes: () => escapes }
}

/** 构造带可聚焦子元素的面板并挂入文档。 */
function createPanel(buttonCount: number): HTMLDivElement {
  const panel = document.createElement('div')
  panel.setAttribute('tabindex', '-1')
  for (let i = 0; i < buttonCount; i += 1) {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = `按钮 ${i + 1}`
    panel.appendChild(button)
  }
  document.body.appendChild(panel)
  return panel
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.className = ''
  document.body.style.overflow = ''
})

describe('useModalLayer', () => {
  it('activate：锁定 body 滚动（挂 class + overflow 兜底）；deactivate：还原', () => {
    const { api } = mountLayer({ scrollLockClass: 'ui-test-scroll-lock' })
    api().activate()
    expect(document.body.classList.contains('ui-test-scroll-lock')).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    api().deactivate()
    expect(document.body.classList.contains('ui-test-scroll-lock')).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('嵌套计数：两个实例只有最后一个 deactivate 时才真正恢复滚动', () => {
    const first = mountLayer({ scrollLockClass: 'ui-test-scroll-lock' })
    const second = mountLayer({ scrollLockClass: 'ui-test-scroll-lock' })
    first.api().activate()
    second.api().activate()
    first.api().deactivate()
    expect(document.body.classList.contains('ui-test-scroll-lock')).toBe(true)
    second.api().deactivate()
    expect(document.body.classList.contains('ui-test-scroll-lock')).toBe(false)
  })

  it('activate：DOM 就绪后焦点移入面板首个可聚焦元素', async () => {
    const panel = createPanel(2)
    const { api } = mountLayer({ panel: () => panel })
    api().activate()
    await nextTick()
    expect(document.activeElement).toBe(panel.querySelector('button'))
    // 滚动锁为模块级计数：用例内对称 deactivate，避免泄漏到后续用例
    api().deactivate()
  })

  it('deactivate：焦点还原到打开前元素', async () => {
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    outside.focus()
    const panel = createPanel(1)
    const { api } = mountLayer({ panel: () => panel })
    api().activate()
    await nextTick()
    expect(document.activeElement).not.toBe(outside)
    api().deactivate()
    expect(document.activeElement).toBe(outside)
  })

  it('Tab 圈定：末元素上按 Tab 回到首个；Shift+Tab 在首元素上回到末个', async () => {
    const panel = createPanel(2)
    const [first, last] = Array.from(panel.querySelectorAll('button'))
    const { api } = mountLayer({ panel: () => panel })
    api().activate()
    await nextTick()

    last.focus()
    api().onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(document.activeElement).toBe(first)

    api().onKeydown(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }))
    expect(document.activeElement).toBe(last)

    // 滚动锁为模块级计数：用例内对称 deactivate，避免泄漏到后续用例
    api().deactivate()
  })

  it('Esc：onEscape 出口触发', () => {
    const { api, escapes } = mountLayer()
    api().onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(escapes()).toBe(1)
  })

  it('非模态：不锁滚动、不移入焦点、Tab 不圈定，Esc 仍可用', async () => {
    const panel = createPanel(2)
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    outside.focus()
    const { api, escapes } = mountLayer({
      panel: () => panel,
      modal: () => false,
      scrollLockClass: 'ui-test-scroll-lock',
    })

    api().activate()
    await nextTick()
    expect(document.body.classList.contains('ui-test-scroll-lock')).toBe(false)
    expect(document.activeElement).toBe(outside)

    api().onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }))
    expect(document.activeElement).toBe(outside)

    api().onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(escapes()).toBe(1)

    // 非模态 deactivate 不误减他实例的滚动锁
    const modal = mountLayer({ panel: () => null, scrollLockClass: 'ui-test-scroll-lock' })
    modal.api().activate()
    api().deactivate()
    expect(document.body.classList.contains('ui-test-scroll-lock')).toBe(true)
    modal.api().deactivate()
  })
})
