// api spec：props 默认值 / slots 渲染 / attrs 透传 / emits 声明 / 触发器回退。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Popconfirm from './Popconfirm.vue'
import {
  POPCONFIRM_CANCEL_TEXT_DEFAULT,
  POPCONFIRM_CONFIRM_TEXT_DEFAULT,
  POPCONFIRM_PLACEMENT_DEFAULT,
} from './Popconfirm.constants'

const wrappers: Array<{ unmount: () => void }> = []

afterEach(() => {
  while (wrappers.length > 0) wrappers.pop()?.unmount()
})

interface MountOptions {
  props?: Record<string, unknown>
  attrs?: Record<string, unknown>
  slots?: Record<string, unknown>
}

function mountPopconfirm(options: MountOptions = {}) {
  const slots: Record<string, unknown> = {
    trigger: () => h('button', { type: 'button', class: 'custom-trigger' }, '删除'),
  }
  if (options.slots) Object.assign(slots, options.slots)
  // 值为 null 的键表示「不提供该插槽」（显式传 undefined 会被 VTU 归一化，不可靠）
  for (const key of Object.keys(slots)) {
    if (slots[key] === null) delete slots[key]
  }
  const wrapper = mount(Popconfirm, {
    props: options.props,
    attrs: options.attrs,
    slots: slots as never,
  })
  wrappers.push(wrapper)
  return wrapper
}

/** 点击打开并等 Teleport 渲染与定位落地。 */
async function open(wrapper: ReturnType<typeof mountPopconfirm>): Promise<void> {
  await wrapper.find('button.custom-trigger').trigger('click')
  await nextTick()
  await nextTick()
}

/** 当前渲染中的气泡元素（Teleport 至 body）。 */
function card(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('.ui-popconfirm__card')
}

describe('Popconfirm api', () => {
  it('根元素带 ui-popconfirm 根类', () => {
    const wrapper = mountPopconfirm()
    expect(wrapper.classes()).toContain('ui-popconfirm')
  })

  it(`默认 placement=${POPCONFIRM_PLACEMENT_DEFAULT}：气泡携带方向修饰类`, async () => {
    const wrapper = mountPopconfirm({ props: { title: '确认删除？' } })
    await open(wrapper)
    expect(card()?.classList.contains('ui-popconfirm__card--top')).toBe(true)
  })

  it(`默认按钮文案：确认=${POPCONFIRM_CONFIRM_TEXT_DEFAULT}、取消=${POPCONFIRM_CANCEL_TEXT_DEFAULT}`, async () => {
    const wrapper = mountPopconfirm({ props: { title: '确认删除？' } })
    await open(wrapper)
    expect(card()?.querySelector('.ui-popconfirm__btn--confirm')?.textContent?.trim()).toBe(
      POPCONFIRM_CONFIRM_TEXT_DEFAULT,
    )
    expect(card()?.querySelector('.ui-popconfirm__btn--cancel')?.textContent?.trim()).toBe(
      POPCONFIRM_CANCEL_TEXT_DEFAULT,
    )
  })

  it('confirmText / cancelText 可替换按钮文案', async () => {
    const wrapper = mountPopconfirm({
      props: { title: '确认删除？', confirmText: '发布', cancelText: '再想想' },
    })
    await open(wrapper)
    expect(card()?.querySelector('.ui-popconfirm__btn--confirm')?.textContent?.trim()).toBe('发布')
    expect(card()?.querySelector('.ui-popconfirm__btn--cancel')?.textContent?.trim()).toBe('再想想')
  })

  it('默认 danger=false：确认按钮为常规档（无 danger 修饰类）', async () => {
    const wrapper = mountPopconfirm({ props: { title: '确认删除？' } })
    await open(wrapper)
    expect(card()?.querySelector('.ui-popconfirm__btn--confirm')).not.toBeNull()
    expect(card()?.querySelector('.ui-popconfirm__btn--danger')).toBeNull()
  })

  it('danger=true：确认按钮走危险档修饰类（无常规档类）', async () => {
    const wrapper = mountPopconfirm({ props: { title: '确认删除？', danger: true } })
    await open(wrapper)
    expect(card()?.querySelector('.ui-popconfirm__btn--danger')).not.toBeNull()
    expect(card()?.querySelector('.ui-popconfirm__btn--confirm')).toBeNull()
  })

  it('title 与 description 渲染进气泡', async () => {
    const wrapper = mountPopconfirm({ props: { title: '删除这条评论？', description: '删除后不可恢复。' } })
    await open(wrapper)
    expect(card()?.querySelector('.ui-popconfirm__title')?.textContent?.trim()).toBe('删除这条评论？')
    expect(card()?.querySelector('.ui-popconfirm__description')?.textContent?.trim()).toBe('删除后不可恢复。')
  })

  it('未提供 description：不渲染描述元素', async () => {
    const wrapper = mountPopconfirm({ props: { title: '确认删除？' } })
    await open(wrapper)
    expect(card()?.querySelector('.ui-popconfirm__description')).toBeNull()
  })

  it('默认渲染内建警示图标（aria-hidden 装饰）', async () => {
    const wrapper = mountPopconfirm({ props: { title: '确认删除？' } })
    await open(wrapper)
    const icon = card()?.querySelector('.ui-popconfirm__icon svg')
    expect(icon).not.toBeNull()
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
  })

  it('icon 插槽替换内建图标（内建 svg 不再渲染）', async () => {
    const wrapper = mountPopconfirm({
      props: { title: '确认删除？' },
      slots: { icon: () => h('svg', { 'data-icon': 'trash' }) },
    })
    await open(wrapper)
    expect(card()?.querySelector('.ui-popconfirm__icon svg[data-icon="trash"]')).not.toBeNull()
    expect(card()?.querySelector('.ui-popconfirm__icon-svg')).toBeNull()
  })

  it('trigger 插槽为单个元素：直接作为触发元素（无内建包装 button、无 ui-popconfirm__trigger 类）', () => {
    const wrapper = mountPopconfirm()
    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.find('button.ui-popconfirm__trigger').exists()).toBe(false)
    expect(wrapper.find('button.custom-trigger').exists()).toBe(true)
  })

  it('trigger 插槽为文本：回退内建原生 button 触发器并可点击开合', async () => {
    const wrapper = mountPopconfirm({ slots: { trigger: () => '文本触发' }, props: { title: '确认？' } })
    const fallback = wrapper.find('button.ui-popconfirm__trigger')
    expect(fallback.exists()).toBe(true)
    expect(fallback.text()).toBe('文本触发')
    expect(fallback.attributes('type')).toBe('button')
    expect(fallback.attributes('aria-expanded')).toBe('false')
    await fallback.trigger('click')
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
  })

  it('写在 <Popconfirm> 上的 attrs 透传到触发元素', () => {
    const wrapper = mountPopconfirm({ attrs: { 'data-track': 'remove', class: 'extra-cls' } })
    const trigger = wrapper.find('button.custom-trigger')
    expect(trigger.attributes('data-track')).toBe('remove')
    expect(trigger.classes()).toContain('extra-cls')
  })

  it('emits 声明：确认/取消按钮点击各发出一次对应事件（无载荷）', async () => {
    const wrapper = mountPopconfirm({ props: { title: '确认删除？' } })
    await open(wrapper)
    await clickCardButton('.ui-popconfirm__btn--confirm')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('confirm')?.[0]).toEqual([])
    expect(wrapper.emitted('cancel')).toBeUndefined()

    await open(wrapper)
    await clickCardButton('.ui-popconfirm__btn--cancel')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('cancel')?.[0]).toEqual([])
  })

  it('title 与 description 都未提供：点击不弹层', async () => {
    const wrapper = mountPopconfirm()
    await wrapper.find('button.custom-trigger').trigger('click')
    await nextTick()
    await nextTick()
    expect(card()).toBeNull()
  })
})

/** 点击当前气泡内的按钮（Teleport 至 body，经 DOMWrapper 触发）。 */
async function clickCardButton(selector: string): Promise<void> {
  await new DOMWrapper(card() as HTMLElement).find(selector).trigger('click')
}
