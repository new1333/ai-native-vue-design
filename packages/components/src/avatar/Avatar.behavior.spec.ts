// behavior spec：图片失败回退 / src 变化重试 / 尺寸档位响应式切换。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from './Avatar.vue'

describe('Avatar behavior', () => {
  it('图片加载失败（error 事件）：切换为首字母回退态', async () => {
    const wrapper = mount(Avatar, { props: { src: '/u/broken.png', name: 'Zhang San', alt: '张三' } })
    expect(wrapper.find('img.ui-avatar__img').exists()).toBe(true)
    await wrapper.find('img.ui-avatar__img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.ui-avatar__fallback').text()).toBe('ZS')
  })

  it('回退态内 initials 优先；无 initials 时由 name 推导', async () => {
    const wrapper = mount(Avatar, {
      props: { src: '/u/broken.png', name: 'Zhang San', alt: '张三' },
    })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('.ui-avatar__fallback').text()).toBe('ZS')
    await wrapper.setProps({ initials: 'Z' })
    expect(wrapper.find('.ui-avatar__fallback').text()).toBe('Z')
  })

  it('src 变化：failed 复位并重新渲染 <img>（自动重试新图）', async () => {
    const wrapper = mount(Avatar, { props: { src: '/u/broken.png', alt: '张三' } })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    await wrapper.setProps({ src: '/u/zhang.png' })
    expect(wrapper.find('img.ui-avatar__img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toBe('/u/zhang.png')
  })

  it('尺寸档位响应式切换：修饰类随之更新', async () => {
    const wrapper = mount(Avatar, { props: { name: '纸面', alt: '纸面' } })
    expect(wrapper.classes()).toContain('ui-avatar--md')
    await wrapper.setProps({ size: 'lg' })
    expect(wrapper.classes()).toContain('ui-avatar--lg')
    await wrapper.setProps({ size: 'sm' })
    expect(wrapper.classes()).toContain('ui-avatar--sm')
  })

  it('name 变化：回退首字母随之更新（响应式推导）', async () => {
    const wrapper = mount(Avatar, { props: { name: 'Zhang San', alt: '张三' } })
    expect(wrapper.find('.ui-avatar__fallback').text()).toBe('ZS')
    await wrapper.setProps({ name: 'Li Si' })
    expect(wrapper.find('.ui-avatar__fallback').text()).toBe('LS')
  })
})
