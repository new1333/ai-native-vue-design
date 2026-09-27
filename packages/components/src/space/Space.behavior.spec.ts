// behavior spec：props 响应式切换（方向/档位/换行/对齐）与插槽子元素的动态增删。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Space from './Space.vue'

describe('Space behavior', () => {
  it('direction 切换：row ↔ column 修饰类随之更新', async () => {
    const wrapper = mount(Space)
    expect(wrapper.classes()).toContain('ui-space--row')
    await wrapper.setProps({ direction: 'column' })
    expect(wrapper.classes()).toContain('ui-space--column')
    expect(wrapper.classes()).not.toContain('ui-space--row')
    await wrapper.setProps({ direction: 'row' })
    expect(wrapper.classes()).toContain('ui-space--row')
    expect(wrapper.classes()).not.toContain('ui-space--column')
  })

  it('size 切换：sm → md → lg 档位修饰类随之更新', async () => {
    const wrapper = mount(Space, { props: { size: 'sm' } })
    expect(wrapper.classes()).toContain('ui-space--sm')
    await wrapper.setProps({ size: 'md' })
    expect(wrapper.classes()).toContain('ui-space--md')
    expect(wrapper.classes()).not.toContain('ui-space--sm')
    await wrapper.setProps({ size: 'lg' })
    expect(wrapper.classes()).toContain('ui-space--lg')
    expect(wrapper.classes()).not.toContain('ui-space--md')
  })

  it('wrap 切换：开启/关闭换行类', async () => {
    const wrapper = mount(Space)
    expect(wrapper.classes()).not.toContain('ui-space--wrap')
    await wrapper.setProps({ wrap: true })
    expect(wrapper.classes()).toContain('ui-space--wrap')
    await wrapper.setProps({ wrap: false })
    expect(wrapper.classes()).not.toContain('ui-space--wrap')
  })

  it('align 切换：center → baseline → start 修饰类随之更新', async () => {
    const wrapper = mount(Space)
    expect(wrapper.classes()).toContain('ui-space--align-center')
    await wrapper.setProps({ align: 'baseline' })
    expect(wrapper.classes()).toContain('ui-space--align-baseline')
    expect(wrapper.classes()).not.toContain('ui-space--align-center')
    await wrapper.setProps({ align: 'start' })
    expect(wrapper.classes()).toContain('ui-space--align-start')
    expect(wrapper.classes()).not.toContain('ui-space--align-baseline')
  })

  it('子元素动态增删：插槽内容响应式更新且仍为根元素直接子节点', async () => {
    const count = ref(2)
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            Space,
            null,
            {
              default: () =>
                Array.from({ length: count.value }, (_, i) => h('span', { class: 'child', key: i }, `项${i + 1}`)),
            },
          )
      },
    })
    const wrapper = mount(Host)
    expect(wrapper.findAll('.child')).toHaveLength(2)
    count.value = 4
    await nextTick()
    const children = wrapper.findAll('.child')
    expect(children).toHaveLength(4)
    expect(children[3].text()).toBe('项4')
    expect(wrapper.find('.ui-space').element.children).toHaveLength(4)
    count.value = 1
    await nextTick()
    expect(wrapper.findAll('.child')).toHaveLength(1)
  })

  it('容器不拦截子元素事件：子元素 click 按发生顺序抵达各自监听', async () => {
    const clicks: string[] = []
    const push = (name: string) => () => clicks.push(name)
    const wrapper = mount(Space, {
      slots: {
        default: () => [
          h('button', { class: 'child', onClick: push('a') }, '甲'),
          h('button', { class: 'child', onClick: push('b') }, '乙'),
        ],
      },
    })
    const buttons = wrapper.findAll('button.child')
    expect(buttons).toHaveLength(2)
    await buttons[1].trigger('click')
    await buttons[0].trigger('click')
    // 容器不吞事件、不重排事件源：两次点击按发生顺序抵达各自的子元素
    expect(clicks).toEqual(['b', 'a'])
  })
})
