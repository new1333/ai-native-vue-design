// behavior spec：拖拽（px→% 换算 / clamp / 折叠吸附与拖回展开）/ 键盘调整与 Enter 折叠恢复 /
// 受控同步 / panes 约束动态更新 / 动态面板。
// 说明：happy-dom 中元素上构造的 PointerEvent 不冒泡到 window（探测确认），
// 故 pointerdown 走元素绑定，move/up 直接派发到 window（与真实浏览器冒泡后的
// 监听目标一致，均是组件挂在 window 上的拖拽监听）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import Splitter from './Splitter.vue'
import SplitterPane from './SplitterPane.vue'

/** 归一后的内联样式串（断言 flex-basis 用）。 */
function styleOf(dom: Element): string {
  return (dom.getAttribute('style') ?? '').replace(/\s+/g, '')
}

/** 让拖拽换算有确定的容器主轴尺寸（默认 200px：1px = 0.5%）。 */
function stubRect(wrapper: VueWrapper, extent = 200): void {
  const el = wrapper.element as HTMLElement
  el.getBoundingClientRect = () =>
    ({
      width: extent,
      height: extent,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: extent,
      bottom: extent,
      toJSON: () => ({}),
    }) as DOMRect
}

function mountPanes(props: Record<string, unknown> = {}, paneCount = 2): VueWrapper {
  return mount(Splitter, {
    props,
    slots: {
      default: () =>
        Array.from({ length: paneCount }, (_, i) =>
          h(SplitterPane, { key: i }, { default: () => `面板 ${i}` }),
        ),
    },
  })
}

function firePointer(target: EventTarget, type: string, clientX: number): void {
  const Ctor = window.PointerEvent ?? window.MouseEvent
  target.dispatchEvent(
    new Ctor(type, {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY: 0,
      button: 0,
    }) as PointerEvent,
  )
}

async function drag(wrapper: VueWrapper, deltaX: number): Promise<void> {
  const handle = wrapper.find('.ui-splitter__handle')
  firePointer(handle.element, 'pointerdown', 100)
  firePointer(window, 'pointermove', 100 + deltaX)
  firePointer(window, 'pointerup', 100 + deltaX)
  await nextTick()
}

function firstPane(wrapper: VueWrapper): Element {
  return wrapper.findAll('.ui-splitter__pane')[0]!.element
}

describe('Splitter behavior', () => {
  it('拖拽：右移 20px（容器 200px）→ 主面板 50% → 60%，并 emit update:modelValue / resize', async () => {
    const wrapper = mountPanes()
    stubRect(wrapper)
    await drag(wrapper, 20)
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:60%')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[60, 40]])
    expect(wrapper.emitted('resize')?.[0]).toEqual([[60, 40]])
  })

  it('拖拽中根元素带 ui-splitter--dragging，pointerup 后移除且后续 move 不再生效', async () => {
    const wrapper = mountPanes()
    stubRect(wrapper)
    const handle = wrapper.find('.ui-splitter__handle')
    firePointer(handle.element, 'pointerdown', 100)
    await nextTick()
    expect(wrapper.classes()).toContain('ui-splitter--dragging')
    firePointer(window, 'pointermove', 110)
    await nextTick()
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:55%')
    firePointer(window, 'pointerup', 110)
    await nextTick()
    expect(wrapper.classes()).not.toContain('ui-splitter--dragging')
    // 松手后 window 监听已移除：再次 move 不改变尺寸，也不追加事件
    firePointer(window, 'pointermove', 160)
    await nextTick()
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:55%')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('拖拽受 min 约束：min=40 时向左拖到 40% 为止', async () => {
    const wrapper = mountPanes({ panes: [{ min: 40 }] })
    stubRect(wrapper)
    await drag(wrapper, -60)
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:40%')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[40, 60]])
  })

  it('可折叠面板：拖拽越过吸附阈值（min 的一半）→ 折叠为 0 并 emit collapse / resize', async () => {
    const wrapper = mountPanes({ panes: [{ min: 20, collapsible: true }] })
    stubRect(wrapper)
    // -120px / 200px = -60% → 目标 -10%，低于吸附阈值（min 20 的一半 = 10）→ 折叠
    await drag(wrapper, -120)
    const pane0 = wrapper.findAll('.ui-splitter__pane')[0]!
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:0%')
    expect(pane0.classes()).toContain('ui-splitter__pane--collapsed')
    expect(wrapper.emitted('collapse')?.[0]).toEqual([{ index: 0, collapsed: true }])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[0, 100]])
  })

  it('折叠后向回拖拽：越过吸附阈值重新展开，emit collapse(collapsed:false)', async () => {
    const wrapper = mountPanes({ panes: [{ min: 20, collapsible: true }] })
    stubRect(wrapper)
    await drag(wrapper, -120)
    await drag(wrapper, 30)
    const pane0 = wrapper.findAll('.ui-splitter__pane')[0]!
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:15%')
    expect(pane0.classes()).not.toContain('ui-splitter__pane--collapsed')
    expect(wrapper.emitted('collapse')).toHaveLength(2)
    expect(wrapper.emitted('collapse')?.[1]).toEqual([{ index: 0, collapsed: false }])
  })

  it('键盘 Enter：折叠 / 再次 Enter 恢复折叠前位置（均分起点即 50%）', async () => {
    const wrapper = mountPanes({ panes: [{ collapsible: true }] })
    const handle = wrapper.find('.ui-splitter__handle')
    await handle.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('collapse')?.[0]).toEqual([{ index: 0, collapsed: true }])
    await handle.trigger('keydown', { key: 'Enter' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:50%')
    expect(wrapper.emitted('collapse')?.[1]).toEqual([{ index: 0, collapsed: false }])
  })

  it('键盘 Enter：主面板不可折叠时无操作', async () => {
    const wrapper = mountPanes()
    await wrapper.find('.ui-splitter__handle').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('collapse')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('键盘 ←→（horizontal 方向）：主面板每次 ±1%，↑↓ 不响应', async () => {
    const wrapper = mountPanes()
    const handle = wrapper.find('.ui-splitter__handle')
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:51%')
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:49%')
    await handle.trigger('keydown', { key: 'ArrowUp' })
    await handle.trigger('keydown', { key: 'ArrowDown' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:49%')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(3)
  })

  it('键盘 ↑↓（vertical 方向）：↓ 增大主面板、↑ 减小；←→ 不响应', async () => {
    const wrapper = mountPanes({ direction: 'vertical' })
    const handle = wrapper.find('.ui-splitter__handle')
    await handle.trigger('keydown', { key: 'ArrowDown' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:51%')
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:51%')
    await handle.trigger('keydown', { key: 'ArrowUp' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:50%')
  })

  it('键盘 Home / End：主面板调到生效 min / max（受双方约束）', async () => {
    const wrapper = mountPanes({ panes: [{ min: 20, max: 80 }] })
    const handle = wrapper.find('.ui-splitter__handle')
    await handle.trigger('keydown', { key: 'End' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:80%')
    await handle.trigger('keydown', { key: 'Home' })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:20%')
  })

  it('受控模式：交互 emit update:modelValue，外部新值经 watch 采纳', async () => {
    const Host = defineComponent({
      props: { value: { type: Array<number>, required: true } },
      emits: ['update:value'],
      setup: (hostProps, { emit }) => () =>
        h(
          Splitter,
          {
            modelValue: hostProps.value,
            'onUpdate:modelValue': (sizes: number[]) => emit('update:value', sizes),
          },
          {
            default: () => [
              h(SplitterPane, { key: 0 }, { default: () => '面板 0' }),
              h(SplitterPane, { key: 1 }, { default: () => '面板 1' }),
            ],
          },
        ),
    })
    const wrapper = mount(Host, { props: { value: [70, 30] } })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:70%')
    await wrapper.find('.ui-splitter__handle').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')?.[0]).toEqual([[71, 29]])
    await wrapper.setProps({ value: [10, 90] })
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:10%')
  })

  it('panes 约束动态更新：分隔条 aria-valuemin 即时反映', async () => {
    const Host = defineComponent({
      props: { min: { type: Number, default: 0 } },
      setup: (hostProps) => () =>
        h(Splitter, { panes: [{ min: hostProps.min }] }, {
          default: () => [
            h(SplitterPane, { key: 0 }, { default: () => '面板 0' }),
            h(SplitterPane, { key: 1 }, { default: () => '面板 1' }),
          ],
        }),
    })
    const wrapper = mount(Host)
    expect(wrapper.find('.ui-splitter__handle').attributes('aria-valuemin')).toBe('0')
    await wrapper.setProps({ min: 25 })
    expect(wrapper.find('.ui-splitter__handle').attributes('aria-valuemin')).toBe('25')
  })

  it('动态增删 SplitterPane：面板数变化后尺寸重建、分隔条数量同步', async () => {
    const Host = defineComponent({
      props: { three: { type: Boolean, default: false } },
      setup: (hostProps) => () =>
        h(Splitter, null, {
          default: () => [
            h(SplitterPane, { key: 0 }, { default: () => '面板 0' }),
            h(SplitterPane, { key: 1 }, { default: () => '面板 1' }),
            ...(hostProps.three ? [h(SplitterPane, { key: 2 }, { default: () => '面板 2' })] : []),
          ],
        }),
    })
    const wrapper = mount(Host)
    expect(wrapper.findAll('.ui-splitter__handle')).toHaveLength(1)
    await wrapper.setProps({ three: true })
    expect(wrapper.findAll('.ui-splitter__handle')).toHaveLength(2)
    const panes = wrapper.findAll('.ui-splitter__pane')
    expect(styleOf(panes[0]!.element)).toContain('flex-basis:33.3333%')
    await wrapper.setProps({ three: false })
    expect(wrapper.findAll('.ui-splitter__handle')).toHaveLength(1)
    expect(styleOf(firstPane(wrapper))).toContain('flex-basis:50%')
  })
})
