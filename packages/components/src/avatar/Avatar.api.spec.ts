// api spec：props 默认值 / 必填 alt / 尺寸档位 / 首字母回退来源。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from './Avatar.vue'
import { AVATAR_SIZES, deriveInitials } from './Avatar.constants'

describe('Avatar api', () => {
  it('渲染 ui-avatar 根元素（span）与 ui-avatar--md 默认尺寸档', () => {
    const wrapper = mount(Avatar, { props: { alt: '张三' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('ui-avatar')
    expect(wrapper.classes()).toContain('ui-avatar--md')
  })

  it('有 src：渲染 <img> 并携带 src / alt', () => {
    const wrapper = mount(Avatar, { props: { src: '/u/zhang.png', alt: '张三' } })
    const img = wrapper.find('img.ui-avatar__img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/u/zhang.png')
    expect(img.attributes('alt')).toBe('张三')
    expect(wrapper.find('.ui-avatar__fallback').exists()).toBe(false)
  })

  it('无 src 或空串 src：回退首字母，不渲染 <img>', () => {
    const noSrc = mount(Avatar, { props: { name: '纸面', alt: '纸面' } })
    expect(noSrc.find('img').exists()).toBe(false)
    expect(noSrc.find('.ui-avatar__fallback').text()).toBe('纸')

    const emptySrc = mount(Avatar, { props: { src: '', name: '纸面', alt: '纸面' } })
    expect(emptySrc.find('img').exists()).toBe(false)
    expect(emptySrc.find('.ui-avatar__fallback').exists()).toBe(true)
  })

  it('initials 优先于 name 推导', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'Zhang San', initials: 'AI', alt: 'AI 助手' },
    })
    expect(wrapper.find('.ui-avatar__fallback').text()).toBe('AI')
  })

  it('尺寸档位：sm / lg 修饰类正确落位', () => {
    expect(mount(Avatar, { props: { alt: 'a', size: 'sm' } }).classes()).toContain('ui-avatar--sm')
    expect(mount(Avatar, { props: { alt: 'a', size: 'lg' } }).classes()).toContain('ui-avatar--lg')
  })

  it('AVATAR_SIZES 全集与档位默认值收口', () => {
    expect(AVATAR_SIZES).toEqual(['sm', 'md', 'lg'])
  })

  it('deriveInitials：首末词首字符大写；单词/中文取首字符；空白名返回空串', () => {
    expect(deriveInitials('Zhang San')).toBe('ZS')
    expect(deriveInitials('zhang san li')).toBe('ZL')
    expect(deriveInitials('paper')).toBe('P')
    expect(deriveInitials('纸面')).toBe('纸')
    expect(deriveInitials('   ')).toBe('')
  })
})
