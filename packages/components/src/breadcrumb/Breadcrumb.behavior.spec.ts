// behavior spec：点击（a/button/disabled）/ 键盘激活 / items 与 maxCount 响应式。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { BreadcrumbItem } from './Breadcrumb.types'
import Breadcrumb from './Breadcrumb.vue'

/** 三项路径：甲(href) / 乙(button) / 丙(末项 button)。 */
function threeItems(): BreadcrumbItem[] {
  return [
    { key: 'a', label: '甲', href: '/a' },
    { key: 'b', label: '乙' },
    { key: 'c', label: '丙' },
  ]
}

function mountBreadcrumb(items: BreadcrumbItem[] = threeItems(), maxCount?: number) {
  return mount(Breadcrumb, { props: maxCount === undefined ? { items } : { items, maxCount } })
}

/** 读取 itemClick 全部载荷。 */
function clickPayloads(wrapper: ReturnType<typeof mountBreadcrumb>): Array<{ item: BreadcrumbItem; index: number; event: MouseEvent }> {
  return (wrapper.emitted('itemClick') ?? []).map(args => args[0]) as never
}

describe('Breadcrumb behavior', () => {
  it('点击 button 项：发出 itemClick，载荷含 item/index/event（MouseEvent 实例）', async () => {
    const wrapper = mountBreadcrumb()
    await wrapper.findAll('button.ui-breadcrumb__link')[0].trigger('click')
    const payloads = clickPayloads(wrapper)
    expect(payloads).toHaveLength(1)
    expect(payloads[0].item.label).toBe('乙')
    expect(payloads[0].index).toBe(1)
    expect(payloads[0].event).toBeInstanceOf(MouseEvent)
  })

  it('点击 a 项：同样发出 itemClick（链接语义 + 点击通报并存）', async () => {
    const wrapper = mountBreadcrumb()
    await wrapper.findAll('a.ui-breadcrumb__link')[0].trigger('click')
    const payloads = clickPayloads(wrapper)
    expect(payloads).toHaveLength(1)
    expect(payloads[0].item.label).toBe('甲')
    expect(payloads[0].index).toBe(0)
    // 载荷携带可取消的原生事件（handler 内 preventDefault 可阻止 <a> 导航）
    expect(typeof payloads[0].event.preventDefault).toBe('function')
  })

  it('点击 disabled 项（span）：不发出 itemClick', async () => {
    const items = [
      { key: 'a', label: '甲', href: '/a', disabled: true },
      { key: 'b', label: '乙' },
    ]
    const wrapper = mountBreadcrumb(items)
    await wrapper.find('.ui-breadcrumb__value--disabled').trigger('click')
    expect(wrapper.emitted('itemClick')).toBeUndefined()
  })

  it('键盘 Enter 在 button 项：经 click 单一路径单次发出 itemClick', async () => {
    const wrapper = mountBreadcrumb()
    await wrapper.findAll('button.ui-breadcrumb__link')[0].trigger('keydown', { key: 'Enter' })
    const payloads = clickPayloads(wrapper)
    expect(payloads).toHaveLength(1)
    expect(payloads[0].item.label).toBe('乙')
    expect(payloads[0].event).toBeInstanceOf(MouseEvent)
  })

  it('键盘 Space 在 button 项：发出 itemClick', async () => {
    const wrapper = mountBreadcrumb()
    await wrapper.findAll('button.ui-breadcrumb__link')[0].trigger('keydown', { key: ' ' })
    expect(clickPayloads(wrapper)).toHaveLength(1)
  })

  it('非激活键（x / Tab）在 button 项：不发出 itemClick', async () => {
    const wrapper = mountBreadcrumb()
    const button = wrapper.findAll('button.ui-breadcrumb__link')[0]
    await button.trigger('keydown', { key: 'x' })
    await button.trigger('keydown', { key: 'Tab' })
    expect(wrapper.emitted('itemClick')).toBeUndefined()
  })

  it('折叠项不可点击：省略号占位不发出 itemClick', async () => {
    const items = ['一', '二', '三', '四', '五'].map((label, index) => ({ key: `k${index}`, label }))
    const wrapper = mountBreadcrumb(items, 3)
    await wrapper.find('.ui-breadcrumb__ellipsis').trigger('click')
    expect(wrapper.emitted('itemClick')).toBeUndefined()
  })

  it('items 响应式：push 新末项后 aria-current 转移到新末项', async () => {
    const items = ref<BreadcrumbItem[]>(threeItems())
    const Host = defineComponent({
      setup: () => () => h(Breadcrumb, { items: items.value }),
    })
    const wrapper = mount(Host)
    expect(wrapper.findAll('.ui-breadcrumb__value')[2].attributes('aria-current')).toBe('page')

    items.value = [...items.value, { key: 'd', label: '丁' }]
    await nextTick()
    const values = wrapper.findAll('.ui-breadcrumb__value')
    expect(values).toHaveLength(4)
    expect(values[2].attributes('aria-current')).toBeUndefined()
    expect(values[3].attributes('aria-current')).toBe('page')
    expect(values[3].text()).toBe('丁')
  })

  it('maxCount 响应式：值变大后折叠展开', async () => {
    const items = ['一', '二', '三', '四', '五'].map((label, index) => ({ key: `k${index}`, label }))
    const maxCount = ref(3)
    const Host = defineComponent({
      setup: () => () => h(Breadcrumb, { items, maxCount: maxCount.value }),
    })
    const wrapper = mount(Host)
    expect(wrapper.findAll('.ui-breadcrumb__ellipsis')).toHaveLength(1)

    maxCount.value = 10
    await nextTick()
    expect(wrapper.findAll('.ui-breadcrumb__ellipsis')).toHaveLength(0)
    expect(wrapper.findAll('.ui-breadcrumb__value')).toHaveLength(5)
  })

  it('items 响应式：折叠随数据变化重算（删到阈值内即展开）', async () => {
    const items = ref<BreadcrumbItem[]>(['一', '二', '三', '四', '五'].map((label, index) => ({ key: `k${index}`, label })))
    const Host = defineComponent({
      setup: () => () => h(Breadcrumb, { items: items.value, maxCount: 3 }),
    })
    const wrapper = mount(Host)
    expect(wrapper.findAll('.ui-breadcrumb__ellipsis')).toHaveLength(1)

    items.value = items.value.slice(0, 3)
    await nextTick()
    expect(wrapper.findAll('.ui-breadcrumb__ellipsis')).toHaveLength(0)
    expect(wrapper.findAll('.ui-breadcrumb__value')).toHaveLength(3)
  })

  it('折叠后点击仍携带源数组下标：末尾项 index 不因折叠而错位', async () => {
    const items = ['一', '二', '三', '四', '五'].map((label, index) => ({ key: `k${index}`, label }))
    const wrapper = mountBreadcrumb(items, 3)
    // 折叠后可见项：一(0) / … / 五(4)——取末尾 button 项
    const buttons = wrapper.findAll('button.ui-breadcrumb__link')
    expect(buttons).toHaveLength(2)
    await buttons[1].trigger('click')
    const payloads = clickPayloads(wrapper)
    expect(payloads[0].item.label).toBe('五')
    expect(payloads[0].index).toBe(4)
  })
})
