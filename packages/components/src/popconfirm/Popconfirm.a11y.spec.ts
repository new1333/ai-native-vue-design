// a11y spec：aria-expanded / aria-controls / role="dialog" + aria-labelledby/describedby / 初始焦点与键盘路径（Esc 关闭+焦点回归）/ 原生 button 语义。
import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
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

function cancelBtn(): HTMLButtonElement | null {
  return card()?.querySelector<HTMLButtonElement>('.ui-popconfirm__btn--cancel') ?? null
}

describe('Popconfirm a11y', () => {
  it('触发元素恒挂 aria-expanded：关闭 false / 打开 true', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    expect(triggerEl(wrapper).attributes('aria-expanded')).toBe('false')
    await open(wrapper)
    expect(triggerEl(wrapper).attributes('aria-expanded')).toBe('true')
  })

  it('打开时触发元素 aria-controls 指向气泡 id（双向关联成立）；关闭时不挂 aria-controls', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    expect(triggerEl(wrapper).attributes('aria-controls')).toBeUndefined()
    await open(wrapper)
    const controls = triggerEl(wrapper).attributes('aria-controls')
    expect(controls).toBeDefined()
    expect(card()?.id).toBe(controls)
  })

  it('气泡 role="dialog" 且 aria-labelledby 指向标题元素 id', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？', description: '删除后不可恢复。' })
    await open(wrapper)
    const el = card()
    expect(el?.getAttribute('role')).toBe('dialog')
    const labelledBy = el?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeDefined()
    expect(el?.querySelector('.ui-popconfirm__title')?.id).toBe(labelledBy)
  })

  it('有 description 时 aria-describedby 指向描述元素 id', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？', description: '删除后不可恢复。' })
    await open(wrapper)
    const describedBy = card()?.getAttribute('aria-describedby')
    expect(describedBy).toBeDefined()
    expect(card()?.querySelector('.ui-popconfirm__description')?.id).toBe(describedBy)
  })

  it('未提供 description 时不挂 aria-describedby', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    expect(card()?.hasAttribute('aria-describedby')).toBe(false)
  })

  it('无 title 时 aria-labelledby 回退指向触发元素 id（以触发动作命名气泡）', async () => {
    const wrapper = mountPopconfirm({ description: '删除后不可恢复。' })
    await open(wrapper)
    const labelledBy = card()?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeDefined()
    expect(triggerEl(wrapper).attributes('id')).toBe(labelledBy)
  })

  it('气泡非模态：不携带 aria-modal（区别于 Dialog）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    expect(card()?.hasAttribute('aria-modal')).toBe(false)
  })

  it('触发元素保持原生语义：不加 role、不改 tabindex（自然进入 Tab 序）', () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    const button = triggerEl(wrapper)
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('role')).toBeUndefined()
    expect(button.attributes('tabindex')).toBeUndefined()
  })

  it('确认/取消为原生 button，且取消在前（Tab 从初始焦点即达确认）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    const buttons = card()?.querySelectorAll('button')
    expect(buttons?.length).toBe(2)
    expect(buttons?.[0].tagName).toBe('BUTTON')
    expect(buttons?.[1].tagName).toBe('BUTTON')
    expect(buttons?.[0].classList.contains('ui-popconfirm__btn--cancel')).toBe(true)
    expect(buttons?.[1].classList.contains('ui-popconfirm__btn--confirm')).toBe(true)
  })

  it('键盘路径：打开后初始焦点落在「取消」按钮（破坏性最小动作）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    triggerEl(wrapper).element.focus()
    await open(wrapper)
    expect(document.activeElement).toBe(cancelBtn())
  })

  it('键盘路径：触发元素上 Esc 立即关闭并焦点回归触发元素', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    triggerEl(wrapper).element.focus()
    await triggerEl(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('键盘路径：气泡内 Esc 立即关闭并焦点回归触发元素', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    cancelBtn()?.focus()
    await new DOMWrapper(card() as HTMLElement).trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(card()).toBeNull()
    expect(document.activeElement).toBe(triggerEl(wrapper).element)
  })

  it('内建警示图标对读屏隐藏（aria-hidden="true"）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    expect(card()?.querySelector('.ui-popconfirm__icon svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('loading=true：确认按钮挂 aria-busy="true"（Button 家族 loading 语义）、取消按钮挂 aria-disabled', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？', loading: true })
    await open(wrapper)
    const confirm = card()?.querySelector<HTMLElement>(
      '.ui-popconfirm__btn--confirm, .ui-popconfirm__btn--danger',
    )
    expect(confirm?.getAttribute('aria-busy')).toBe('true')
    expect(cancelBtn()?.getAttribute('aria-disabled')).toBe('true')
    // 旋转指示对读屏隐藏（装饰化）
    expect(card()?.querySelector('.ui-popconfirm__btn-spinner svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('loading=false：确认按钮不挂 aria-busy、取消按钮不挂 aria-disabled（用原生可用语义）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？' })
    await open(wrapper)
    const confirm = card()?.querySelector<HTMLElement>(
      '.ui-popconfirm__btn--confirm, .ui-popconfirm__btn--danger',
    )
    expect(confirm?.hasAttribute('aria-busy')).toBe(false)
    expect(cancelBtn()?.hasAttribute('aria-disabled')).toBe(false)
  })

  it('键盘路径：loading 期间聚焦确认按钮按 Enter——不发出 confirm、气泡不关闭，且焦点保持在确认按钮（拦截不夺焦点）', async () => {
    const wrapper = mountPopconfirm({ title: '确认删除？', loading: true })
    await open(wrapper)
    // Tab 序：初始焦点（取消）→ Tab 即达确认；此处直接聚焦等价模拟
    const confirm = card()?.querySelector<HTMLElement>(
      '.ui-popconfirm__btn--confirm, .ui-popconfirm__btn--danger',
    )
    confirm?.focus()
    expect(document.activeElement).toBe(confirm)
    await new DOMWrapper(confirm as HTMLElement).trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(card()).not.toBeNull()
    // 拦截用 aria 而非原生 disabled：焦点不被告知丢失，等待结束可继续操作
    expect(document.activeElement).toBe(confirm)
  })

  it('监听器链式合并：触发元素已有的 keydown 处理器与组件的 Esc 关闭共存', async () => {
    const seen: string[] = []
    const Host = defineComponent({
      setup: () => () =>
        h(
          Popconfirm,
          { title: '确认删除？' },
          {
            trigger: () =>
              h(
                'button',
                {
                  type: 'button',
                  class: 'custom-trigger',
                  onKeydown: (event: KeyboardEvent) => seen.push(event.key),
                },
                '删除',
              ),
          },
        ),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    wrappers.push(wrapper)
    const button = wrapper.find('button.custom-trigger')
    await button.trigger('click')
    await nextTick()
    await nextTick()
    expect(card()).not.toBeNull()
    await button.trigger('keydown', { key: 'Escape' })
    expect(seen).toEqual(['Escape'])
    expect(card()).toBeNull()
  })
})
