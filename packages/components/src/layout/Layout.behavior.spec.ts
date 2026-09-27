// behavior spec：折叠触发器点击 / 受控与非受控折叠 / 断点跨越（matchMedia mock）/
// 挂载即对齐 / 清理与重接线 / has-sider 随子节点增删响应式更新。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import Layout from './Layout.vue'
import LayoutContent from './LayoutContent.vue'
import LayoutSider from './LayoutSider.vue'

type ChangeListener = (event: { matches: boolean }) => void

/**
 * matchMedia mock：返回可控行为的 MediaQueryList 替身。
 * happy-dom 无布局引擎、无真实视口，断点行为经 spy 注入后手动驱动。
 */
function stubMatchMedia(initialMatches: boolean) {
  const state = { matches: initialMatches }
  const listeners = new Set<ChangeListener>()
  const mql = {
    get matches(): boolean {
      return state.matches
    },
    addEventListener: (_type: 'change', listener: ChangeListener): void => {
      listeners.add(listener)
    },
    removeEventListener: (_type: 'change', listener: ChangeListener): void => {
      listeners.delete(listener)
    },
  }
  const spy = vi.spyOn(window, 'matchMedia').mockImplementation(() => mql as unknown as MediaQueryList)
  return {
    /** matchMedia 调用记录（查询串序列，实时快照）。 */
    get queries(): string[] {
      return spy.mock.calls.map((call) => String(call[0]))
    },
    /** 驱动视口跨越：更新 matches 并通知全部监听者。 */
    async cross(next: boolean): Promise<void> {
      state.matches = next
      for (const listener of [...listeners]) listener({ matches: next })
      await nextTick()
    },
    listenerCount: (): number => listeners.size,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Layout behavior', () => {
  it('has-sider 随 LayoutSider 直接子节点的增删响应式更新', async () => {
    const Host = defineComponent({
      props: { show: { type: Boolean, default: true } },
      setup: (hostProps) => () =>
        h(Layout, null, {
          default: () => [
            ...(hostProps.show
              ? [h(LayoutSider, { key: 's' }, { default: () => '侧栏' })]
              : []),
            h(LayoutContent, { key: 'c' }, { default: () => '内容' }),
          ],
        }),
    })
    const wrapper = mount(Host)
    expect(wrapper.classes()).toContain('ui-layout--has-sider')
    await wrapper.setProps({ show: false })
    expect(wrapper.classes()).not.toContain('ui-layout--has-sider')
    await wrapper.setProps({ show: true })
    expect(wrapper.classes()).toContain('ui-layout--has-sider')
  })
})

describe('LayoutSider behavior · 折叠触发器', () => {
  it('点击触发器：非受控内部态翻转，折叠类切换，sider-collapse 依次发出 true/false', async () => {
    const wrapper = mount(LayoutSider, { props: { collapsible: true } })
    const trigger = wrapper.find('.ui-layout__sider-trigger')
    await trigger.trigger('click')
    expect(wrapper.classes()).toContain('ui-layout__sider--collapsed')
    expect(wrapper.emitted('sider-collapse')).toEqual([[true]])
    await trigger.trigger('click')
    expect(wrapper.classes()).not.toContain('ui-layout__sider--collapsed')
    expect(wrapper.emitted('sider-collapse')).toEqual([[true], [false]])
  })

  it('defaultCollapsed 起步：点击后翻回展开并发出 false', async () => {
    const wrapper = mount(LayoutSider, { props: { collapsible: true, defaultCollapsed: true } })
    expect(wrapper.classes()).toContain('ui-layout__sider--collapsed')
    await wrapper.find('.ui-layout__sider-trigger').trigger('click')
    expect(wrapper.classes()).not.toContain('ui-layout__sider--collapsed')
    expect(wrapper.emitted('sider-collapse')).toEqual([[false]])
  })

  it('受控 collapsed：点击只发出 sider-collapse，不改视觉；父级回写 prop 后视觉跟随', async () => {
    const wrapper = mount(LayoutSider, { props: { collapsible: true, collapsed: false } })
    await wrapper.find('.ui-layout__sider-trigger').trigger('click')
    expect(wrapper.emitted('sider-collapse')).toEqual([[true]])
    // 受控：组件不写内部态，视觉保持 prop 决定的展开
    expect(wrapper.classes()).not.toContain('ui-layout__sider--collapsed')
    await wrapper.setProps({ collapsed: true })
    expect(wrapper.classes()).toContain('ui-layout__sider--collapsed')
  })

  it('断点接线即对齐时同值去重：受控目标值与视口对齐值一致则不发出 sider-collapse', async () => {
    // 视口命中但已折叠（collapsed=true）：对齐为 true 与当前一致 → 无事件
    const media = stubMatchMedia(true)
    const collapsed = mount(LayoutSider, { props: { collapsed: true, breakpoint: 'md' } })
    expect(collapsed.emitted('sider-collapse')).toBeUndefined()
    collapsed.unmount()
    // 视口未命中且已展开（collapsed=false）：对齐为 false 与当前一致 → 无事件
    await media.cross(false)
    const expanded = mount(LayoutSider, { props: { collapsed: false, breakpoint: 'md' } })
    expect(expanded.emitted('sider-collapse')).toBeUndefined()
    expanded.unmount()
  })
})

describe('LayoutSider behavior · 响应式断点', () => {
  it('breakpoint="md"：以 max-width 991px 查询接线，初始未命中保持展开', () => {
    const media = stubMatchMedia(false)
    const wrapper = mount(LayoutSider, { props: { breakpoint: 'md' } })
    expect(media.queries).toEqual(['(max-width: 991px)'])
    expect(wrapper.classes()).not.toContain('ui-layout__sider--collapsed')
    expect(wrapper.emitted('sider-collapse')).toBeUndefined()
    wrapper.unmount()
  })

  it('跌破断点：自动折叠并发出 sider-collapse(true)；回到以上：自动展开并发出 false', async () => {
    const media = stubMatchMedia(false)
    const wrapper = mount(LayoutSider, { props: { breakpoint: 'sm' } })
    await media.cross(true)
    expect(wrapper.classes()).toContain('ui-layout__sider--collapsed')
    expect(wrapper.emitted('sider-collapse')).toEqual([[true]])
    await media.cross(false)
    expect(wrapper.classes()).not.toContain('ui-layout__sider--collapsed')
    expect(wrapper.emitted('sider-collapse')).toEqual([[true], [false]])
    wrapper.unmount()
  })

  it('挂载时视口已在断点以下：立即折叠并发出 sider-collapse(true)', async () => {
    const media = stubMatchMedia(true)
    // onMounted 同步接线并折叠（事件同步发出）；折叠类的 DOM 更新经 nextTick 刷出
    const wrapper = mount(LayoutSider, { props: { breakpoint: 'lg' } })
    expect(media.queries).toEqual(['(max-width: 1199px)'])
    expect(wrapper.emitted('sider-collapse')).toEqual([[true]])
    await nextTick()
    expect(wrapper.classes()).toContain('ui-layout__sider--collapsed')
    wrapper.unmount()
  })

  it('无 breakpoint：不调用 matchMedia', () => {
    const media = stubMatchMedia(false)
    mount(LayoutSider)
    expect(media.queries).toEqual([])
  })

  it('断点 prop 变更：解除旧监听并按新断点重接线', async () => {
    const media = stubMatchMedia(false)
    const wrapper = mount(LayoutSider, { props: { breakpoint: 'md' } })
    expect(media.queries).toEqual(['(max-width: 991px)'])
    expect(media.listenerCount()).toBe(1)
    await wrapper.setProps({ breakpoint: 'lg' })
    expect(media.queries).toEqual(['(max-width: 991px)', '(max-width: 1199px)'])
    expect(media.listenerCount()).toBe(1)
    wrapper.unmount()
  })

  it('卸载清理：解除媒体查询监听，跨越不再触发事件', async () => {
    const media = stubMatchMedia(false)
    const wrapper = mount(LayoutSider, { props: { breakpoint: 'md' } })
    expect(media.listenerCount()).toBe(1)
    wrapper.unmount()
    expect(media.listenerCount()).toBe(0)
    await media.cross(true)
    expect(wrapper.emitted('sider-collapse')).toBeUndefined()
  })
})
