// behavior spec：状态机（loading→loaded/error、fallback 回落）、lazy 门闩、src 切换重置、预览开关。
// 策略：vitest 的 happy-dom 环境不派发原生图片 load/error 事件（已实测：12 个宏任务后仍无事件），
// 因此用 img.trigger('load'/'error') 同步派发合成事件驱动状态机，断言确定、无真实网络时序。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Image from './Image.vue'
import { IMAGE_ERROR_TEXT } from './Image.constants'

const GOOD_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"></svg>')
const BAD_SRC = './__never_exists_a__.png'
const BAD_FALLBACK_SRC = './__never_exists_b__.png'
/** 相对路径 fallback：happy-dom 禁用文件加载（enableImageFileLoading 关闭），patch 后不派发原生事件，
 *  可确定地断言「回落期间保持 loading」中间态；真实浏览器中该地址异步失败/成功由原生事件驱动，端态一致。 */
const FALLBACK_SRC = './__fallback__.png'

/** 可手动触发的 IntersectionObserver 替身。 */
class StubIntersectionObserver {
  static instances: StubIntersectionObserver[] = []
  observed: Element[] = []
  disconnected = false
  private callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    StubIntersectionObserver.instances.push(this)
  }
  observe(target: Element): void {
    this.observed.push(target)
  }
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true
  }
  intersect(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Image behavior', () => {
  it('加载成功：loading → loaded，占位移除，emit load（Event）', async () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC }, attachTo: document.body })
    expect(wrapper.classes()).toContain('ui-image--loading')

    await wrapper.find('img.ui-image__img').trigger('load')
    expect(wrapper.classes()).toContain('ui-image--loaded')
    expect(wrapper.find('.ui-image__img--loaded').exists()).toBe(true)
    expect(wrapper.find('.ui-image__placeholder').exists()).toBe(false)

    const loads = wrapper.emitted('load')
    expect(loads).toHaveLength(1)
    expect(loads?.[0]?.[0]).toBeInstanceOf(Event)
    expect(wrapper.emitted('error')).toBeUndefined()
    wrapper.unmount()
  })

  it('加载失败：→ error 终态，img 移除，默认失败视图渲染，emit error', async () => {
    const wrapper = mount(Image, { props: { src: BAD_SRC }, attachTo: document.body })
    await wrapper.find('img.ui-image__img').trigger('error')

    expect(wrapper.classes()).toContain('ui-image--error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.ui-image__error').exists()).toBe(true)
    expect(wrapper.find('.ui-image__error-text').text()).toBe(IMAGE_ERROR_TEXT)

    const errors = wrapper.emitted('error')
    expect(errors).toHaveLength(1)
    expect(errors?.[0]?.[0]).toBeInstanceOf(Event)
    expect(wrapper.emitted('load')).toBeUndefined()
    wrapper.unmount()
  })

  it('fallback 回落成功：主源失败切到 fallback，保持 loading → loaded；error、load 各一次', async () => {
    const wrapper = mount(Image, {
      props: { src: BAD_SRC, fallback: FALLBACK_SRC },
      attachTo: document.body,
    })
    const img = wrapper.find('img.ui-image__img')
    await img.trigger('error')

    // 回落期间保持 loading，img 地址已切换为 fallback
    expect(wrapper.classes()).toContain('ui-image--loading')
    expect(wrapper.find('img.ui-image__img').attributes('src')).toBe(FALLBACK_SRC)
    expect(wrapper.emitted('error')).toHaveLength(1)

    await wrapper.find('img.ui-image__img').trigger('load')
    expect(wrapper.classes()).toContain('ui-image--loaded')
    expect(wrapper.emitted('load')).toHaveLength(1)
    wrapper.unmount()
  })

  it('fallback 也失败：error 触发两次（主源 + fallback），落 error 终态', async () => {
    const wrapper = mount(Image, {
      props: { src: BAD_SRC, fallback: BAD_FALLBACK_SRC },
      attachTo: document.body,
    })
    const img = wrapper.find('img.ui-image__img')
    await img.trigger('error')
    expect(wrapper.classes()).toContain('ui-image--loading')
    expect(wrapper.find('img.ui-image__img').attributes('src')).toBe(BAD_FALLBACK_SRC)

    await wrapper.find('img.ui-image__img').trigger('error')
    expect(wrapper.classes()).toContain('ui-image--error')
    expect(wrapper.emitted('error')).toHaveLength(2)
    expect(wrapper.emitted('load')).toBeUndefined()
    wrapper.unmount()
  })

  it('error 插槽覆盖默认失败视图', async () => {
    const wrapper = mount(Image, {
      props: { src: BAD_SRC },
      slots: { error: '<span class="my-err">自定义失败引导</span>' },
      attachTo: document.body,
    })
    await wrapper.find('img.ui-image__img').trigger('error')
    expect(wrapper.find('.ui-image__error').exists()).toBe(true)
    expect(wrapper.find('.my-err').exists()).toBe(true)
    expect(wrapper.find('.ui-image__error-text').exists()).toBe(false)
    wrapper.unmount()
  })

  it('lazy：进入视口前不渲染 img；相交后放行加载并断开观察；不相交不放行', async () => {
    vi.stubGlobal('IntersectionObserver', StubIntersectionObserver)
    const wrapper = mount(Image, { props: { src: GOOD_SRC, lazy: true }, attachTo: document.body })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.ui-image__placeholder').exists()).toBe(true)

    const io = StubIntersectionObserver.instances.at(-1)
    expect(io).toBeDefined()
    io!.intersect(false)
    await nextTick()
    expect(wrapper.find('img').exists()).toBe(false)
    expect(io!.disconnected).toBe(false)

    io!.intersect(true)
    await nextTick()
    expect(wrapper.find('img.ui-image__img').exists()).toBe(true)
    expect(io!.disconnected).toBe(true)

    await wrapper.find('img.ui-image__img').trigger('load')
    expect(wrapper.classes()).toContain('ui-image--loaded')
    wrapper.unmount()
  })

  it('lazy 且环境无 IntersectionObserver：降级为立即加载', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const wrapper = mount(Image, { props: { src: GOOD_SRC, lazy: true } })
    // onMounted 内翻转 shouldLoad 触发的是下一轮调度渲染，需等一个 tick 再断言 DOM
    await nextTick()
    expect(wrapper.find('img.ui-image__img').exists()).toBe(true)
    expect(wrapper.classes()).toContain('ui-image--loading')
    wrapper.unmount()
  })

  it('src 响应式切换：状态机重置（loaded → loading → 新结果）', async () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC }, attachTo: document.body })
    await wrapper.find('img.ui-image__img').trigger('load')
    expect(wrapper.classes()).toContain('ui-image--loaded')

    await wrapper.setProps({ src: BAD_SRC })
    expect(wrapper.classes()).toContain('ui-image--loading')
    await wrapper.find('img.ui-image__img').trigger('error')
    expect(wrapper.classes()).toContain('ui-image--error')
    expect(wrapper.emitted('error')).toHaveLength(1)

    await wrapper.setProps({ src: GOOD_SRC })
    expect(wrapper.classes()).toContain('ui-image--loading')
    expect(wrapper.find('img.ui-image__img').attributes('src')).toBe(GOOD_SRC)
    await wrapper.find('img.ui-image__img').trigger('load')
    expect(wrapper.classes()).toContain('ui-image--loaded')
    wrapper.unmount()
  })

  it('preview：加载完成前触发器 disabled（点击不打开），完成后启用', async () => {
    const wrapper = mount(Image, {
      props: { src: BAD_SRC, preview: true },
      attachTo: document.body,
    })
    const trigger = () => wrapper.find('button.ui-image__trigger')
    expect(trigger().exists()).toBe(true)
    expect((trigger().element as HTMLButtonElement).disabled).toBe(true)

    await trigger().trigger('click')
    expect(document.querySelector('.ui-image__preview')).toBeNull()

    await wrapper.setProps({ src: GOOD_SRC })
    await trigger().find('img.ui-image__img').trigger('load')
    expect((trigger().element as HTMLButtonElement).disabled).toBe(false)
    wrapper.unmount()
  })

  it('preview：点击触发器打开浮层（dialog/aria-modal/可读名），焦点移入面板', async () => {
    const wrapper = mount(Image, {
      props: { src: GOOD_SRC, preview: true, alt: '山间晨雾' },
      attachTo: document.body,
    })
    await wrapper.find('img.ui-image__img').trigger('load')
    await wrapper.find('button.ui-image__trigger').trigger('click')

    const overlay = document.querySelector('.ui-image__preview') as HTMLElement | null
    expect(overlay).not.toBeNull()
    expect(overlay?.getAttribute('role')).toBe('dialog')
    expect(overlay?.getAttribute('aria-modal')).toBe('true')
    expect(overlay?.getAttribute('aria-label')).toBe('山间晨雾')
    expect(overlay?.getAttribute('tabindex')).toBe('-1')
    await nextTick()
    expect(document.activeElement).toBe(overlay)
    wrapper.unmount()
  })

  it('preview：Esc 关闭 + 焦点回归触发器', async () => {
    const wrapper = mount(Image, {
      props: { src: GOOD_SRC, preview: true, alt: '湖面' },
      attachTo: document.body,
    })
    await wrapper.find('img.ui-image__img').trigger('load')
    const trigger = wrapper.find('button.ui-image__trigger')
    ;(trigger.element as HTMLElement).focus()
    await trigger.trigger('click')
    const overlay = document.querySelector('.ui-image__preview') as HTMLElement
    expect(document.activeElement).toBe(overlay)

    overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(document.querySelector('.ui-image__preview')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('preview：点击遮罩关闭；点击大图不关闭；关闭按钮关闭', async () => {
    const wrapper = mount(Image, {
      props: { src: GOOD_SRC, preview: true },
      attachTo: document.body,
    })
    await wrapper.find('img.ui-image__img').trigger('load')
    await wrapper.find('button.ui-image__trigger').trigger('click')

    const overlay = document.querySelector('.ui-image__preview') as HTMLElement
    const bigImg = overlay.querySelector('.ui-image__preview-img') as HTMLElement
    bigImg.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(document.querySelector('.ui-image__preview')).not.toBeNull()

    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(document.querySelector('.ui-image__preview')).toBeNull()

    await wrapper.find('button.ui-image__trigger').trigger('click')
    const overlayAgain = document.querySelector('.ui-image__preview') as HTMLElement
    const closeBtn = overlayAgain.querySelector('.ui-image__preview-close') as HTMLButtonElement
    expect(closeBtn.getAttribute('aria-label')).toBe('关闭预览')
    closeBtn.click()
    await nextTick()
    expect(document.querySelector('.ui-image__preview')).toBeNull()
    wrapper.unmount()
  })

  it('preview：Tab 在浮层内圈定（唯一可聚焦元素为关闭按钮）', async () => {
    const wrapper = mount(Image, {
      props: { src: GOOD_SRC, preview: true },
      attachTo: document.body,
    })
    await wrapper.find('img.ui-image__img').trigger('load')
    await wrapper.find('button.ui-image__trigger').trigger('click')
    const overlay = document.querySelector('.ui-image__preview') as HTMLElement
    const closeBtn = overlay.querySelector('.ui-image__preview-close') as HTMLButtonElement
    closeBtn.focus()

    closeBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await nextTick()
    expect(document.activeElement).toBe(closeBtn)
    expect(overlay.contains(document.activeElement)).toBe(true)
    wrapper.unmount()
  })

  it('preview：src 变化时已打开的浮层自动关闭并还原焦点', async () => {
    const wrapper = mount(Image, {
      props: { src: GOOD_SRC, preview: true },
      attachTo: document.body,
    })
    await wrapper.find('img.ui-image__img').trigger('load')
    const trigger = wrapper.find('button.ui-image__trigger')
    ;(trigger.element as HTMLElement).focus()
    await trigger.trigger('click')
    expect(document.querySelector('.ui-image__preview')).not.toBeNull()

    await wrapper.setProps({ src: GOOD_SRC + '#changed' })
    await nextTick()
    expect(document.querySelector('.ui-image__preview')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })
})
