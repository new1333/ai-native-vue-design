// behavior spec：scroll 事件发射与载荷、拇指几何跟随、溢出检测与 update() 重测、
// type 档位的 scrolling 态与静默隐藏、ResizeObserver 接线与卸载清理。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ScrollArea from './ScrollArea.vue'
import { SCROLL_AREA_HIDE_DELAY_MS } from './ScrollArea.constants'

/** 视口盒模型 mock：happy-dom 无布局引擎，尺寸经原型 getter spy 注入。 */
interface Metrics {
  clientHeight: number
  clientWidth: number
  scrollHeight: number
  scrollWidth: number
}

function mockMetrics(metrics: Metrics): void {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(metrics.clientHeight)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(metrics.clientWidth)
  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(metrics.scrollHeight)
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(metrics.scrollWidth)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('ScrollArea behavior', () => {
  it('viewport scroll 事件转发为 emits("scroll")，载荷为原生 Event', async () => {
    const wrapper = mount(ScrollArea, { props: { type: 'always' } })
    const viewport = wrapper.find('.ui-scroll-area__viewport')
    await viewport.trigger('scroll')
    const events = wrapper.emitted('scroll')
    expect(events).toHaveLength(1)
    expect(events?.[0]?.[0]).toBeInstanceOf(Event)
  })

  it('拇指几何随 scrollTop / scrollLeft 更新（top/height 相对轨道的百分比）', async () => {
    // 纵向：client 100 / scroll 400 → 高 25%；scrollTop 60 → top 15%
    // 横向：client 100 / scroll 500 → 宽 20%；scrollLeft 100 → left 20%
    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 400, scrollWidth: 500 })
    const wrapper = mount(ScrollArea, { props: { direction: 'both' } })
    const viewport = wrapper.find('.ui-scroll-area__viewport').element as HTMLElement
    viewport.scrollTop = 60
    viewport.scrollLeft = 100
    await viewport.dispatchEvent(new Event('scroll'))

    const thumbY = wrapper.find('.ui-scroll-area__thumb--vertical')
    const thumbX = wrapper.find('.ui-scroll-area__thumb--horizontal')
    expect(thumbY.attributes('style')).toContain('height: 25%')
    expect(thumbY.attributes('style')).toContain('top: 15%')
    expect(thumbX.attributes('style')).toContain('width: 20%')
    expect(thumbX.attributes('style')).toContain('left: 20%')
  })

  it('溢出检测类随测量开关，update() 手动重测立即生效', async () => {
    mockMetrics({ clientHeight: 0, clientWidth: 0, scrollHeight: 0, scrollWidth: 0 })
    const wrapper = mount(ScrollArea, { props: { direction: 'both' } })
    expect(wrapper.classes()).not.toContain('ui-scroll-area--overflow-y')
    expect(wrapper.classes()).not.toContain('ui-scroll-area--overflow-x')

    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 400, scrollWidth: 500 })
    ;(wrapper.vm as unknown as { update: () => void }).update()
    await nextTick()
    expect(wrapper.classes()).toContain('ui-scroll-area--overflow-y')
    expect(wrapper.classes()).toContain('ui-scroll-area--overflow-x')

    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 100, scrollWidth: 100 })
    ;(wrapper.vm as unknown as { update: () => void }).update()
    await nextTick()
    expect(wrapper.classes()).not.toContain('ui-scroll-area--overflow-y')
    expect(wrapper.classes()).not.toContain('ui-scroll-area--overflow-x')
  })

  it('direction 排除的方向不标记溢出（纵向档横向溢出被裁剪且无横向条）', async () => {
    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 400, scrollWidth: 500 })
    const wrapper = mount(ScrollArea, { props: { direction: 'vertical' } })
    ;(wrapper.vm as unknown as { update: () => void }).update()
    await nextTick()
    expect(wrapper.classes()).toContain('ui-scroll-area--overflow-y')
    expect(wrapper.classes()).not.toContain('ui-scroll-area--overflow-x')
  })

  it('type="scroll"：滚动进入 scrolling 态，静默 SCROLL_AREA_HIDE_DELAY_MS 后退出', async () => {
    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 400, scrollWidth: 100 })
    const wrapper = mount(ScrollArea, { props: { type: 'scroll' } })
    expect(wrapper.classes()).not.toContain('ui-scroll-area--scrolling')

    vi.useFakeTimers()
    await wrapper.find('.ui-scroll-area__viewport').trigger('scroll')
    expect(wrapper.classes()).toContain('ui-scroll-area--scrolling')

    vi.advanceTimersByTime(SCROLL_AREA_HIDE_DELAY_MS - 1)
    await nextTick()
    expect(wrapper.classes()).toContain('ui-scroll-area--scrolling')
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(wrapper.classes()).not.toContain('ui-scroll-area--scrolling')
  })

  it('type="scroll"：连续滚动重置静默计时（不中途隐藏）', async () => {
    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 400, scrollWidth: 100 })
    const wrapper = mount(ScrollArea, { props: { type: 'scroll' } })
    vi.useFakeTimers()
    const viewport = wrapper.find('.ui-scroll-area__viewport')
    await viewport.trigger('scroll')
    vi.advanceTimersByTime(SCROLL_AREA_HIDE_DELAY_MS - 1)
    await viewport.trigger('scroll')
    vi.advanceTimersByTime(SCROLL_AREA_HIDE_DELAY_MS - 1)
    await nextTick()
    expect(wrapper.classes()).toContain('ui-scroll-area--scrolling')
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(wrapper.classes()).not.toContain('ui-scroll-area--scrolling')
  })

  it('type="always" / "hover"：滚动不产生 scrolling 态（显隐不依赖 JS 定时）', async () => {
    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 400, scrollWidth: 100 })
    for (const type of ['always', 'hover'] as const) {
      const wrapper = mount(ScrollArea, { props: { type } })
      await wrapper.find('.ui-scroll-area__viewport').trigger('scroll')
      expect(wrapper.classes()).not.toContain('ui-scroll-area--scrolling')
      wrapper.unmount()
    }
  })

  it('ResizeObserver 观察 viewport 与内容包裹层，回调驱动重测；卸载时 disconnect', async () => {
    class FakeResizeObserver {
      static instances: FakeResizeObserver[] = []
      observed: Element[] = []
      disconnected = false
      constructor(public callback: ResizeObserverCallback) {
        FakeResizeObserver.instances.push(this)
      }
      observe(target: Element): void {
        this.observed.push(target)
      }
      unobserve(): void {}
      disconnect(): void {
        this.disconnected = true
      }
    }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 100, scrollWidth: 100 })

    const wrapper = mount(ScrollArea)
    const observer = FakeResizeObserver.instances[0]
    expect(observer).toBeDefined()
    expect(observer.observed).toHaveLength(2)
    expect(observer.observed[0]?.classList.contains('ui-scroll-area__viewport')).toBe(true)
    expect(observer.observed[1]?.classList.contains('ui-scroll-area__content')).toBe(true)
    expect(wrapper.classes()).not.toContain('ui-scroll-area--overflow-y')

    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 400, scrollWidth: 100 })
    observer.callback([], observer as unknown as ResizeObserver)
    await nextTick()
    expect(wrapper.classes()).toContain('ui-scroll-area--overflow-y')

    wrapper.unmount()
    expect(observer.disconnected).toBe(true)
  })

  it('卸载清理：隐藏定时器被清除，卸载后推进时钟无异常', async () => {
    mockMetrics({ clientHeight: 100, clientWidth: 100, scrollHeight: 400, scrollWidth: 100 })
    const wrapper = mount(ScrollArea, { props: { type: 'scroll' } })
    vi.useFakeTimers()
    await wrapper.find('.ui-scroll-area__viewport').trigger('scroll')
    expect(wrapper.classes()).toContain('ui-scroll-area--scrolling')
    wrapper.unmount()
    expect(() => vi.advanceTimersByTime(SCROLL_AREA_HIDE_DELAY_MS + 100)).not.toThrow()
  })
})
