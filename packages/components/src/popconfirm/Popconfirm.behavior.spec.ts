// behavior spec：点击开合、确认/取消关闭与焦点回归、Esc、外部 mousedown、rect 定位与滚动/resize 重排、卸载清理。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Popconfirm from './Popconfirm.vue'

const wrappers: Array<{ unmount: () => void }> = []

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

function mountPopconfirm(props: Record<string, unknown> = {}) {
  const wrapper = mount(
    Popconfirm,
    {
      props,
      slots: {
        trigger: () => h('button', { type: 'button', class: 'custom-trigger' }, '删除'),
      } as never,
      // attachTo document.body：触发元素在文档内，focus()/activeElement 断言才与真实使用一致。
      attachTo: document.body,
    },
  )
  wrappers.push(wrapper)
  return wrapper
}

function triggerEl(wrapper: ReturnType<typeof mountPopconfirm>): DOMWrapper<HTMLButtonElement> {
  return wrapper.find('button.custom-trigger') as DOMWrapper<HTMLButtonElement>
}

/** 点击打开并等 Teleport 渲染与定位落地。 */
async function open(wrapper: ReturnType<typeof mountPopconfirm>): Promise<void> {
  await triggerEl(wrapper).trigger('click')
  await nextTick()
  await nextTick()
}

function card(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-popconfirm__card')
}

function cardWrapper(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(card() as HTMLElement)
}

function confirmBtn(): HTMLButtonElement | null {
  return card()?.querySelector<HTMLButtonElement>('.ui-popconfirm__btn--confirm, .ui-popconfirm__btn--danger') ?? null
}

function cancelBtn(): HTMLButtonElement | null {
  return card()?.querySelector<HTMLButtonElement>('.ui-popconfirm__btn--cancel') ?? null
}

/** 模拟 rect（left 40 / top 100 / width 80 / height 20 → right 120 / bottom 120，中心 (80,110)）。 */
function mockRect(el: HTMLElement, offset = 0): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 40 + offset,
    y: 100 + offset,
    left: 40 + offset,
    top: 100 + offset,
    right: 120 + offset,
    bottom: 120 + offset,
    width: 80,
    height: 20,
    toJSON: () => ({}),
  } as DOMRect)
}

describe('Popconfirm behavior', () => {
  it('点击触发元素：气泡 Teleport 至 body 渲染；再次点击关闭（点击开合）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    expect(card()).not.toBeNull()
    expect(document.body.contains(card())).toBe(true)
    await triggerEl(wrapper).trigger('click')
    expect(card()).toBeNull()
  })

  it('确认点击：emit confirm 后关闭，焦点回归触发元素', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    cancelBtn()?.focus()
    expect(document.activeElement).toBe(cancelBtn())
    confirmBtn()?.click()
    await nextTick()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('取消点击：emit cancel 后关闭，焦点回归触发元素', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    cancelBtn()?.click()
    await nextTick()
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('Esc（触发元素上）：关闭并焦点回归触发元素，且不发出 confirm/cancel', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    triggerEl(wrapper).element.focus()
    await triggerEl(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('Esc（气泡内）：关闭并焦点回归触发元素', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    cancelBtn()?.focus()
    expect(document.activeElement).toBe(cancelBtn())
    await cardWrapper().trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('非 Esc 键不关闭', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    await triggerEl(wrapper).trigger('keydown', { key: 'ArrowDown' })
    expect(card()).not.toBeNull()
  })

  it('打开期间点击气泡之外区域：关闭；焦点原在气泡内则回归触发元素', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    // 打开后初始焦点已在「取消」按钮（气泡内）
    expect(document.activeElement).toBe(cancelBtn())
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('打开期间点击气泡之外区域：焦点不在气泡内时不抢焦点', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it('打开期间 mousedown 落在气泡内或触发元素上：不关闭（触发元素仍走 click 开合）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    await cardWrapper().trigger('mousedown')
    expect(card()).not.toBeNull()
    await triggerEl(wrapper).trigger('mousedown')
    expect(card()).not.toBeNull()
    // 触发元素 click 仍可关闭（toggle），不因 mousedown 守卫而失效
    await triggerEl(wrapper).trigger('click')
    expect(card()).toBeNull()
  })

  it('title 与 description 都未提供：点击不弹层', async () => {
    const wrapper = mountPopconfirm()
    await open(wrapper)
    expect(card()).toBeNull()
  })

  it('定位：打开后按触发元素 rect 计算（placement=top：水平居中、上缘留 token 间距）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    mockRect(triggerEl(wrapper).element)
    await open(wrapper)
    const el = card()
    expect(el?.style.left).toBe('80px')
    expect(el?.style.top).toBe('calc(100px - var(--ui-space-2))')
    expect(el?.style.transform).toBe('translate(-50%, -100%)')
  })

  it('定位：placement=right 贴触发元素右缘并垂直居中', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？', placement: 'right' })
    mockRect(triggerEl(wrapper).element)
    await open(wrapper)
    const el = card()
    expect(el?.style.left).toBe('calc(120px + var(--ui-space-2))')
    expect(el?.style.top).toBe('110px')
    expect(el?.style.transform).toBe('translate(0, -50%)')
  })

  it('打开期间切换 placement：按新方向重排', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    mockRect(triggerEl(wrapper).element)
    await open(wrapper)
    await wrapper.setProps({ placement: 'bottom' })
    await nextTick()
    await nextTick()
    const el = card()
    expect(el?.classList.contains('ui-popconfirm__card--bottom')).toBe(true)
    expect(el?.style.top).toBe('calc(120px + var(--ui-space-2))')
    expect(el?.style.transform).toBe('translate(-50%, 0)')
  })

  it('打开期间滚动/resize：按最新 rect 重排', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    mockRect(triggerEl(wrapper).element)
    await open(wrapper)
    expect(card()?.style.top).toBe('calc(100px - var(--ui-space-2))')
    // 触发元素随页面滚动移动 24px：scroll（capture）与 resize 都触发重排（重渲染等 microtask 落地）
    mockRect(triggerEl(wrapper).element, 24)
    document.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(card()?.style.top).toBe('calc(124px - var(--ui-space-2))')
    mockRect(triggerEl(wrapper).element, 48)
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(card()?.style.top).toBe('calc(148px - var(--ui-space-2))')
  })

  it('打开状态下卸载：document/window 监听被移除（后续事件不引用已卸载实例，不抛错）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    wrapper.unmount()
    expect(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      document.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('resize'))
    }).not.toThrow()
  })
})
