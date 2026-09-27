// a11y spec：img alt 语义、原生 button 触发器（键盘路径）、预览 dialog 角色与 Esc/Tab 焦点路径。
// 事件驱动用 img.trigger('load') 合成事件（vitest happy-dom 不派发原生图片事件，已实测）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Image from './Image.vue'

const GOOD_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"></svg>')

describe('Image a11y', () => {
  it('img 携带 alt：缺省为空字符串（装饰性），传入时透传', () => {
    expect(mount(Image, { props: { src: GOOD_SRC } }).find('img').attributes('alt')).toBe('')
    expect(
      mount(Image, { props: { src: GOOD_SRC, alt: '产品图' } }).find('img').attributes('alt'),
    ).toBe('产品图')
  })

  it('img / 占位 / 失败视图不引入 tabindex（占位图标 aria-hidden 纯装饰）', () => {
    const wrapper = mount(Image, { props: { src: './__never__.png' } })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('[tabindex]').exists()).toBe(false)
    expect(wrapper.find('.ui-image__placeholder svg').attributes('aria-hidden')).toBe('true')
  })

  it('error 默认视图保留可读文案（读屏可感知失败）', async () => {
    const wrapper = mount(Image, { props: { src: './__never__.png' }, attachTo: document.body })
    await wrapper.find('img.ui-image__img').trigger('error')
    const errorText = wrapper.find('.ui-image__error-text')
    expect(errorText.exists()).toBe(true)
    expect(errorText.text()).not.toBe('')
    wrapper.unmount()
  })

  it('preview 触发器为原生 button（Enter/Space 平台原生激活），加载前 disabled、可读名含 alt、声明 aria-haspopup', () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC, preview: true, alt: '风景照' } })
    const trigger = wrapper.find('button.ui-image__trigger')
    expect(trigger.element.tagName).toBe('BUTTON')
    expect((trigger.element as HTMLButtonElement).disabled).toBe(true)
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    expect(trigger.attributes('aria-label')).toBe('预览图片：风景照')
  })

  it('预览浮层：role="dialog" + aria-modal + 可读名，面板 tabindex="-1" 仅程序化聚焦', async () => {
    const wrapper = mount(Image, {
      props: { src: GOOD_SRC, preview: true, alt: '山间晨雾' },
      attachTo: document.body,
    })
    await wrapper.find('img.ui-image__img').trigger('load')
    await wrapper.find('button.ui-image__trigger').trigger('click')
    const overlay = document.querySelector('.ui-image__preview') as HTMLElement
    expect(overlay.getAttribute('role')).toBe('dialog')
    expect(overlay.getAttribute('aria-modal')).toBe('true')
    expect(overlay.getAttribute('aria-label')).toBe('山间晨雾')
    expect(overlay.getAttribute('tabindex')).toBe('-1')

    // 浮层内可聚焦元素仅关闭按钮（img 无 tabindex，面板为程序化聚焦目标）
    const focusables = overlay.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
    expect(focusables).toHaveLength(1)
    expect(focusables[0].classList.contains('ui-image__preview-close')).toBe(true)
    expect((focusables[0] as HTMLButtonElement).getAttribute('aria-label')).toBe('关闭预览')
    wrapper.unmount()
  })

  it('键盘路径：聚焦触发器 → 打开预览 → 焦点移入面板 → Esc 关闭 → 焦点回归触发器', async () => {
    const wrapper = mount(Image, {
      props: { src: GOOD_SRC, preview: true, alt: '湖面' },
      attachTo: document.body,
    })
    await wrapper.find('img.ui-image__img').trigger('load')
    const trigger = wrapper.find('button.ui-image__trigger')
    ;(trigger.element as HTMLElement).focus()
    expect(document.activeElement).toBe(trigger.element)

    await trigger.trigger('click')
    const overlay = document.querySelector('.ui-image__preview') as HTMLElement
    await nextTick()
    expect(document.activeElement).toBe(overlay)

    overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(document.querySelector('.ui-image__preview')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('键盘路径：Tab 在预览浮层内圈定，不逃逸到背景页面', async () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC, preview: true }, attachTo: document.body })
    await wrapper.find('img.ui-image__img').trigger('load')
    await wrapper.find('button.ui-image__trigger').trigger('click')
    const overlay = document.querySelector('.ui-image__preview') as HTMLElement
    const closeBtn = overlay.querySelector('.ui-image__preview-close') as HTMLButtonElement
    closeBtn.focus()

    closeBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await nextTick()
    expect(overlay.contains(document.activeElement)).toBe(true)
    expect(document.activeElement).toBe(closeBtn)
    wrapper.unmount()
  })

  it('键盘路径：Esc 事件被消费（preventDefault）；大图上的点击不属于遮罩点击，浮层保持打开', async () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC, preview: true }, attachTo: document.body })
    await wrapper.find('img.ui-image__img').trigger('load')
    await wrapper.find('button.ui-image__trigger').trigger('click')
    const overlay = document.querySelector('.ui-image__preview') as HTMLElement

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    overlay.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    await nextTick()
    expect(document.querySelector('.ui-image__preview')).toBeNull()

    await wrapper.find('button.ui-image__trigger').trigger('click')
    const bigImg = document.querySelector('.ui-image__preview-img') as HTMLElement
    bigImg.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(document.querySelector('.ui-image__preview')).not.toBeNull()
    wrapper.unmount()
  })
})
