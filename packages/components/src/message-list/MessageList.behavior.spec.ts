// behavior spec：挂载首帧贴底定位 / 贴底才自动滚 / nearBottom 翻转播报 / loadMore 边沿 / scroll 透传 / 卸载清理。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import type { DefineComponent } from 'vue'
import MessageList from './MessageList.vue'
import type { MessageListProps } from './MessageList.types'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages: Message[] = [
  { id: 1, role: 'user', content: '你好' },
  { id: 2, role: 'assistant', content: '你好，有什么可以帮你？' },
]

/** 泛型组件的 T 无法经 VTU mount 推断：以 Message 实参显式收窄桥接（显式类型桥接，非 any）。 */
const MessageListFixture = MessageList as unknown as DefineComponent<MessageListProps<Message>>

/** happy-dom 无布局引擎：实例级模拟滚动几何（元素卸载即消失，不污染其他用例）。 */
function mockGeometry(el: Element, scrollHeight: number, clientHeight: number): void {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollHeight })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: clientHeight })
}

/**
 * 挂载首帧几何模拟（需在 mount 前生效）：在 HTMLElement.prototype 上临时覆盖
 * scrollHeight / clientHeight。原描述符已存档，restoreViewportGeometry 精确还原
 * （clientHeight 原生 getter 就定义在 HTMLElement.prototype 上，必须按描述符写回）。
 */
const prototypeGeometry = {
  scrollHeight: Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight'),
  clientHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight'),
}

function mockViewportGeometry(scrollHeight: number, clientHeight: number): void {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  })
}

function restoreViewportGeometry(): void {
  delete (HTMLElement.prototype as unknown as { scrollHeight?: unknown }).scrollHeight
  const clientHeight = prototypeGeometry.clientHeight
  if (clientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeight)
}

describe('MessageList behavior', () => {
  describe('挂载首帧（原型级几何模拟，mount 前生效）', () => {
    it('autoScroll 默认 true：挂载即定位到滚动容器底部，并播报贴底', () => {
      mockViewportGeometry(1000, 400)
      try {
        const wrapper = mount(MessageListFixture, { props: { messages } })
        expect(wrapper.element.scrollTop).toBe(1000)
        expect(wrapper.emitted('nearBottom')).toEqual([[true]])
      } finally {
        restoreViewportGeometry()
      }
    })

    it('autoScroll=false：挂载不定位（scrollTop 保持 0），首帧播报离开贴底（distance 600 > 48）', () => {
      mockViewportGeometry(1000, 400)
      try {
        const wrapper = mount(MessageListFixture, { props: { messages, autoScroll: false } })
        expect(wrapper.element.scrollTop).toBe(0)
        expect(wrapper.emitted('nearBottom')).toEqual([[false]])
        expect(wrapper.emitted('loadMore')).toBeUndefined() // loadMore 仅由滚动触发，挂载不发
      } finally {
        restoreViewportGeometry()
      }
    })
  })

  it('贴底才自动滚：上翻离开贴底区后追加消息不跟随；回到贴底后恢复跟随', async () => {
    const wrapper = mount(MessageListFixture, { props: { messages } })
    mockGeometry(wrapper.element, 1000, 400)
    // 模拟用户向上翻阅：scrollTop 100 → distance 500 > 48，离开贴底区。
    wrapper.element.scrollTop = 100
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('nearBottom')).toEqual([[true], [false]])

    await wrapper.setProps({ messages: [...messages, { id: 3, role: 'user', content: '在吗' }] })
    expect(wrapper.element.scrollTop).toBe(100) // 不打扰阅读，未跟随

    // 滚回贴底区：distance = 1000 - 960 - 400 < 48。
    wrapper.element.scrollTop = 960
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('nearBottom')).toEqual([[true], [false], [true]])

    await wrapper.setProps({
      messages: [...messages, { id: 3, role: 'user', content: '在吗' }, { id: 4, role: 'assistant', content: '在的' }],
    })
    expect(wrapper.element.scrollTop).toBe(1000) // 恢复跟随：定位到 scrollHeight
  })

  it('autoScroll=false：内容更新后始终不自动滚动', async () => {
    const wrapper = mount(MessageListFixture, { props: { messages, autoScroll: false } })
    mockGeometry(wrapper.element, 1000, 400)
    await wrapper.setProps({ messages: [...messages, { id: 3, role: 'user', content: '在吗' }] })
    expect(wrapper.element.scrollTop).toBe(0)
  })

  it('nearBottomThreshold 阈值生效：distance ≤ 阈值判定贴底', async () => {
    const wrapper = mount(MessageListFixture, {
      props: { messages, autoScroll: false, nearBottomThreshold: 100 },
    })
    mockGeometry(wrapper.element, 1000, 400)
    // distance = 1000 - 320 - 400 = 280 > 100 → 离开贴底。
    wrapper.element.scrollTop = 320
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('nearBottom')).toEqual([[true], [false]])
    // distance = 1000 - 520 - 400 = 80 ≤ 100 → 回到贴底。
    wrapper.element.scrollTop = 520
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('nearBottom')).toEqual([[true], [false], [true]])
  })

  it('loadMore 边沿触发：进入顶部区域发一次，滞留不重复，离开后再次进入才再发', async () => {
    const wrapper = mount(MessageListFixture, { props: { messages, autoScroll: false } })
    mockGeometry(wrapper.element, 1000, 400)
    expect(wrapper.emitted('loadMore')).toBeUndefined() // 挂载不触发

    wrapper.element.scrollTop = 10
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('loadMore')).toHaveLength(1)

    wrapper.element.scrollTop = 5
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('loadMore')).toHaveLength(1) // 仍在顶部区域内：不重复发

    wrapper.element.scrollTop = 100
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('loadMore')).toHaveLength(1) // 离开区域

    wrapper.element.scrollTop = 0
    await wrapper.trigger('scroll')
    expect(wrapper.emitted('loadMore')).toHaveLength(2) // 再次进入：重新武装后再发
  })

  it('scroll 原生透传：每次滚动事件原样转发，不劫持（多次累计）', async () => {
    const wrapper = mount(MessageListFixture, { props: { messages, autoScroll: false } })
    await wrapper.trigger('scroll')
    await wrapper.trigger('scroll')
    const scrollEvents = wrapper.emitted('scroll')
    expect(scrollEvents).toHaveLength(2)
    expect(scrollEvents?.[0]?.[0]).toBeInstanceOf(Event)
  })

  it('分发模式（默认插槽）同样跟随：内容由宿主组件更新驱动 onUpdated 跟随', async () => {
    const Host = defineComponent({
      props: { count: { type: Number, required: true } },
      setup(innerProps) {
        return () =>
          h(MessageListFixture, { messages: undefined }, {
            default: () =>
              Array.from({ length: innerProps.count }, (_, i) => h('div', { key: i }, `s${i}`)),
          })
      },
    })
    const host = mount(Host, { props: { count: 2 } })
    const viewport = host.find('.ui-message-list')
    expect(viewport.find('.ui-message-list__content').exists()).toBe(true)
    expect(host.findAll('.ui-message-list__content > div')).toHaveLength(2)
    mockGeometry(viewport.element, 1000, 400)

    // 上翻离开贴底区：更新内容不跟随。
    viewport.element.scrollTop = 100
    await viewport.trigger('scroll')
    await host.setProps({ count: 3 })
    expect(viewport.element.scrollTop).toBe(100)
    expect(host.findAll('.ui-message-list__content > div')).toHaveLength(3)

    // 回到贴底区：更新内容跟随到底。
    viewport.element.scrollTop = 960
    await viewport.trigger('scroll')
    await host.setProps({ count: 4 })
    expect(viewport.element.scrollTop).toBe(1000)
  })

  it('卸载清理：onBeforeUnmount 移除 scroll 监听', () => {
    const wrapper = mount(MessageListFixture, { props: { messages } })
    const removeSpy = vi.spyOn(wrapper.element, 'removeEventListener')
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
