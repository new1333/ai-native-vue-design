/**
 * useFloatingLayer spec —— 浮层引擎（黑盒经宿主组件接口）：两族定位数学、
 * 打开/方向变化重排、点击外部关闭的内外判定、Esc 出口、滚动跟随。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useFloatingLayer } from './useFloatingLayer'
import type {
  FloatingPlacement,
  FloatingStrategy,
  UseFloatingLayerOptions,
  UseFloatingLayerReturn,
} from './useFloatingLayer'

/** 锚点元素：以固定 rect 桩测量值（边界级桩，同组件 spec 的 getBoundingClientRect 桩纪律）。 */
const RECT = { top: 10, bottom: 30, left: 20, right: 60, width: 40, height: 20 }

let anchorEl: HTMLDivElement

function setAnchorRect(rect: Partial<typeof RECT>): void {
  anchorEl.getBoundingClientRect = () => ({ ...RECT, ...rect, toJSON: () => ({}) }) as DOMRect
}

/** 宿主组件：把引擎挂进 setup（onMounted 生命周期需组件上下文）。 */
function mountEngine(
  overrides: Partial<UseFloatingLayerOptions> & { strategy?: FloatingStrategy } = {},
): {
  opened: { value: boolean }
  placement: { value: FloatingPlacement }
  closed: Array<'escape' | 'outside'>
  api: () => UseFloatingLayerReturn
} {
  const opened = ref(false)
  const placement = ref<FloatingPlacement>('bottom')
  const closed: Array<'escape' | 'outside'> = []
  let api!: UseFloatingLayerReturn
  const Host = defineComponent({
    setup() {
      api = useFloatingLayer({
        isOpen: () => opened.value,
        anchor: () => anchorEl,
        strategy: 'anchored',
        placement: () => placement.value,
        onRequestClose: (source) => closed.push(source),
        ...overrides,
      })
      return () => h('div')
    },
  })
  mount(Host, { attachTo: document.body })
  return { opened, placement, closed, api: () => api }
}

async function openAndSettle(opened: { value: boolean }): Promise<void> {
  opened.value = true
  await nextTick()
  await nextTick()
}

beforeEach(() => {
  anchorEl = document.createElement('div')
  setAnchorRect({})
  document.body.appendChild(anchorEl)
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useFloatingLayer · anchored 策略', () => {
  it('bottom：水平居中于锚点，顶部贴锚点下缘 + gap token，结构性 translate', async () => {
    const { opened, api } = mountEngine()
    await openAndSettle(opened)
    expect(api().floatingStyle.value).toEqual({
      left: '40px',
      top: 'calc(30px + var(--ui-space-2))',
      transform: 'translate(-50%, 0)',
    })
  })

  it('top：贴锚点上缘并整体上移', async () => {
    const { opened, placement, api } = mountEngine()
    placement.value = 'top'
    await openAndSettle(opened)
    expect(api().floatingStyle.value).toEqual({
      left: '40px',
      top: 'calc(10px - var(--ui-space-2))',
      transform: 'translate(-50%, -100%)',
    })
  })

  it('left / right：垂直居中，水平贴锚点左右缘', async () => {
    const { opened, placement, api } = mountEngine()
    placement.value = 'left'
    await openAndSettle(opened)
    expect(api().floatingStyle.value).toEqual({
      left: 'calc(20px - var(--ui-space-2))',
      top: '20px',
      transform: 'translate(-100%, -50%)',
    })

    placement.value = 'right'
    await nextTick()
    await nextTick()
    expect(api().floatingStyle.value).toEqual({
      left: 'calc(60px + var(--ui-space-2))',
      top: '20px',
      transform: 'translate(0, -50%)',
    })
  })

  it('gap 选项：calc 内引用传入的 token', async () => {
    const { opened, api } = mountEngine({ gap: 'var(--ui-space-3)' })
    await openAndSettle(opened)
    expect(api().floatingStyle.value.top).toBe('calc(30px + var(--ui-space-3))')
  })

  it('打开期间方向变化：等 DOM 落地后重排', async () => {
    const { opened, placement, api } = mountEngine()
    await openAndSettle(opened)
    placement.value = 'top'
    await nextTick()
    await nextTick()
    expect(api().floatingStyle.value.transform).toBe('translate(-50%, -100%)')
  })
})

describe('useFloatingLayer · dropdown 策略', () => {
  it('文档坐标 top/left（含滚动换算）+ minWidth 对齐锚点宽度', async () => {
    const { opened, api } = mountEngine({ strategy: 'dropdown' })
    await openAndSettle(opened)
    expect(api().floatingStyle.value).toEqual({
      top: `${RECT.bottom + window.scrollY}px`,
      left: `${RECT.left + window.scrollX}px`,
      minWidth: '40px',
    })
  })
})

describe('useFloatingLayer · 关闭信号', () => {
  it('点击外部：onRequestClose("outside")', async () => {
    const inside = document.createElement('div')
    document.body.appendChild(inside)
    const { opened, closed } = mountEngine({
      closeOnOutsideClick: true,
      insideElements: () => [inside],
    })
    await openAndSettle(opened)

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(closed).toEqual(['outside'])

    closed.length = 0
    inside.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(closed).toEqual([])
  })

  it('未打开时点击外部不触发关闭', () => {
    const { closed } = mountEngine({ closeOnOutsideClick: true })
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(closed).toEqual([])
  })

  it('Esc：打开时 preventDefault 并 onRequestClose("escape")；未打开放行', async () => {
    const { opened, closed, api } = mountEngine()
    const settled = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    api().onKeydown(settled)
    expect(closed).toEqual([])
    expect(settled.defaultPrevented).toBe(false)

    await openAndSettle(opened)
    const heard = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    api().onKeydown(heard)
    expect(closed).toEqual(['escape'])
    expect(heard.defaultPrevented).toBe(true)
  })
})

describe('useFloatingLayer · 滚动跟随', () => {
  it('followViewport：滚动（capture）触发按新 rect 重排', async () => {
    const { opened, api } = mountEngine({ followViewport: true })
    await openAndSettle(opened)

    setAnchorRect({ top: 110, bottom: 130 })
    document.dispatchEvent(new Event('scroll', { bubbles: false }))
    expect(api().floatingStyle.value.top).toBe('calc(130px + var(--ui-space-2))')
  })
})

describe('unwrapElement', () => {
  it('原生元素原样返回；组件实例解包为 $el；null 安全', async () => {
    const { unwrapElement } = await import('./useFloatingLayer')
    const element = document.createElement('div')
    expect(unwrapElement(element)).toBe(element)
    expect(unwrapElement(null)).toBeNull()
    expect(unwrapElement({ $el: element } as never)).toBe(element)
    expect(unwrapElement({ $el: 'text-root' } as never)).toBeNull()
  })
})
