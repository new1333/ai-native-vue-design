// api spec：props 默认值（src/alt/fit/lazy/preview）/ img 属性渲染 / emits 声明 / slots 渲染。
// 注意：happy-dom 会对坏地址异步派发原生 error、对有效 data URL 异步派发 load，
// 因此本文件的断言全部紧跟 mount 同步执行（在任何宏/微任务之前），不受异步事件干扰。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Image from './Image.vue'

const GOOD_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"></svg>')
const BAD_SRC = './__never_exists__.png'

/** 不触发的 IntersectionObserver 替身（观察/断开可检视，永不回调）。 */
class StubIntersectionObserver {
  static instances: StubIntersectionObserver[] = []
  observed: Element[] = []
  disconnected = false
  constructor(callback: IntersectionObserverCallback) {
    void callback
    StubIntersectionObserver.instances.push(this)
  }
  observe(target: Element): void {
    this.observed.push(target)
  }
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Image api', () => {
  it('渲染 ui-image 根元素，初始状态 loading（占位视图可见）', () => {
    const wrapper = mount(Image, { props: { src: BAD_SRC } })
    expect(wrapper.classes()).toContain('ui-image')
    expect(wrapper.classes()).toContain('ui-image--loading')
    expect(wrapper.find('.ui-image__placeholder').exists()).toBe(true)
  })

  it('img 渲染 src / alt 属性', () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC, alt: '风景照' } })
    const img = wrapper.find('img.ui-image__img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(GOOD_SRC)
    expect(img.attributes('alt')).toBe('风景照')
  })

  it('alt 缺省为空字符串（装饰性图片语义）', () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC } })
    expect(wrapper.find('img.ui-image__img').attributes('alt')).toBe('')
  })

  it('fit 缺省 fill，映射为 img 内联 object-fit', () => {
    const def = mount(Image, { props: { src: GOOD_SRC } })
    expect((def.find('img.ui-image__img').element as HTMLElement).style.objectFit).toBe('fill')

    const cover = mount(Image, { props: { src: GOOD_SRC, fit: 'cover' } })
    expect((cover.find('img.ui-image__img').element as HTMLElement).style.objectFit).toBe('cover')

    const contain = mount(Image, { props: { src: GOOD_SRC, fit: 'contain' } })
    expect((contain.find('img.ui-image__img').element as HTMLElement).style.objectFit).toBe('contain')
  })

  it('默认非 lazy：img 随组件立即渲染', () => {
    expect(mount(Image, { props: { src: GOOD_SRC } }).find('img.ui-image__img').exists()).toBe(true)
  })

  it('lazy=true：IntersectionObserver 触发前仅渲染占位、不渲染 img，且观察的是根元素', () => {
    vi.stubGlobal('IntersectionObserver', StubIntersectionObserver)
    const before = StubIntersectionObserver.instances.length
    const wrapper = mount(Image, { props: { src: GOOD_SRC, lazy: true } })
    expect(wrapper.find('img.ui-image__img').exists()).toBe(false)
    expect(wrapper.find('.ui-image__placeholder').exists()).toBe(true)
    expect(wrapper.classes()).toContain('ui-image--loading')

    const io = StubIntersectionObserver.instances.at(-1)
    expect(io).toBeDefined()
    expect(StubIntersectionObserver.instances.length).toBe(before + 1)
    expect(io?.observed).toHaveLength(1)
    expect(io?.observed[0]).toBe(wrapper.element)
  })

  it('preview 缺省关闭：不渲染触发器 button', () => {
    expect(mount(Image, { props: { src: GOOD_SRC } }).find('button').exists()).toBe(false)
  })

  it('preview=true：img 包裹于原生 button 触发器（加载前 disabled、aria-haspopup="dialog"、含 alt 的可读名）', () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC, preview: true, alt: '风景照' } })
    const trigger = wrapper.find('button.ui-image__trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.element.tagName).toBe('BUTTON')
    expect((trigger.element as HTMLButtonElement).disabled).toBe(true)
    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    expect(trigger.attributes('aria-label')).toBe('预览图片：风景照')
    expect(trigger.find('img.ui-image__img').exists()).toBe(true)
  })

  it('preview=true 且无 alt：触发器可读名用默认「预览大图」', () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC, preview: true } })
    expect(wrapper.find('button.ui-image__trigger').attributes('aria-label')).toBe('预览大图')
  })

  it('默认占位为 aria-hidden 装饰图标（无可读文本）', () => {
    const wrapper = mount(Image, { props: { src: BAD_SRC } })
    const placeholder = wrapper.find('.ui-image__placeholder')
    expect(placeholder.text()).toBe('')
    expect(placeholder.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('placeholder 插槽覆盖默认占位', () => {
    const wrapper = mount(Image, {
      props: { src: BAD_SRC },
      slots: { placeholder: '<span class="my-ph">载入中</span>' },
    })
    expect(wrapper.find('.ui-image__placeholder').exists()).toBe(true)
    expect(wrapper.find('.my-ph').exists()).toBe(true)
    expect(wrapper.find('.ui-image__placeholder svg').exists()).toBe(false)
  })

  it('emits 声明为 load / error', () => {
    const emits = (Image as unknown as { emits?: string[] }).emits ?? []
    expect(emits).toHaveLength(2)
    expect(emits).toContain('load')
    expect(emits).toContain('error')
  })

  it('无 exposes 契约：组件实例不暴露自定义方法', () => {
    const wrapper = mount(Image, { props: { src: GOOD_SRC } })
    const exposed = Object.keys((wrapper.vm as { $: { exposed: unknown } }).$.exposed ?? {})
    expect(exposed).toEqual([])
  })
})
