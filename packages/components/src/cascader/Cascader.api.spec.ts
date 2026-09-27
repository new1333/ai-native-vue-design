// api spec：props 默认值 / emits 声明 / 弹层渲染面 / 多选 checkbox / attrs 与插槽透传。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Cascader from './Cascader.vue'
import type { CascaderOption } from './Cascader.types'

const TREE: CascaderOption[] = [
  {
    label: '浙江省',
    value: 'zj',
    children: [
      { label: '杭州市', value: 'hz', children: [{ label: '西湖区', value: 'xh' }, { label: '余杭区', value: 'yh', disabled: true }] },
      { label: '宁波市', value: 'nb' },
    ],
  },
  { label: '江苏省', value: 'js', disabled: true, children: [{ label: '南京市', value: 'nj' }] },
  { label: '上海市', value: 'sh', children: [{ label: '黄浦区', value: 'hp' }] },
  { label: '北京市', value: 'bj' },
]

describe('Cascader api', () => {
  it('渲染 ui-cascader 根容器与 combobox 触发器按钮', () => {
    const wrapper = mount(Cascader)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-cascader')
    const trigger = wrapper.find('button.ui-cascader__trigger')
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('role')).toBe('combobox')
  })

  it('默认：显示默认 placeholder、aria-expanded=false、无已选/无弹层', () => {
    const wrapper = mount(Cascader)
    const trigger = wrapper.find('button.ui-cascader__trigger')
    expect(trigger.text()).toContain('请选择')
    expect(wrapper.find('.ui-cascader__label--placeholder').exists()).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(document.querySelector('.ui-cascader__menu')).toBeNull()
  })

  it('placeholder prop 覆盖默认占位文案', () => {
    const trigger = mount(Cascader, { props: { placeholder: '选择地区' } }).find(
      'button.ui-cascader__trigger',
    )
    expect(trigger.text()).toContain('选择地区')
  })

  it('单选 modelValue 命中路径：触发器显示路径 label 拼接，不再走占位样式', () => {
    const wrapper = mount(Cascader, { props: { options: TREE, modelValue: ['zj', 'hz'] } })
    const trigger = wrapper.find('button.ui-cascader__trigger')
    expect(trigger.text()).toContain('浙江省 / 杭州市')
    expect(wrapper.find('.ui-cascader__label--placeholder').exists()).toBe(false)
  })

  it('modelValue 不可解析（未知值/断链）：回落 placeholder', () => {
    const unknown = mount(Cascader, { props: { options: TREE, modelValue: ['x', 'y'] } })
    expect(unknown.find('.ui-cascader__label--placeholder').exists()).toBe(true)
    const broken = mount(Cascader, { props: { options: TREE, modelValue: ['zj', 'x'] } })
    expect(broken.find('.ui-cascader__label--placeholder').exists()).toBe(true)
  })

  it('disabled：触发器原生 disabled + 根修饰类', () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE, modelValue: ['zj', 'hz'], disabled: true },
    })
    expect(wrapper.find('button.ui-cascader__trigger').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-cascader--disabled')
  })

  it('multiple：modelValue 为路径数组，触发器显示勾选路径 label 拼接', () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE, modelValue: [['zj', 'hz', 'xh']], multiple: true },
    })
    expect(wrapper.find('button.ui-cascader__trigger').text()).toContain('浙江省 / 杭州市 / 西湖区')
  })

  it('打开后：弹层渲染根级面板与选项全集，含子级选项带展开箭标，空态不出现', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    await wrapper.find('button.ui-cascader__trigger').trigger('click')
    const menu = document.querySelector('.ui-cascader__menu')
    expect(menu).not.toBeNull()
    // 打开时高亮落位首个可选根项浙江省 → 其子级面板随高亮出现（展开跟随高亮）
    const panels = menu?.querySelectorAll('.ui-cascader__panel') ?? []
    expect(panels).toHaveLength(2)
    const rootLabels = [...(panels[0]?.querySelectorAll('.ui-cascader__option') ?? [])].map((el) => el.textContent)
    expect(rootLabels).toEqual(['浙江省', '江苏省', '上海市', '北京市'])
    expect(menu?.querySelectorAll('.ui-cascader__arrow')).toHaveLength(4) // 根级 3 + 浙江子级中杭州市 1
    expect(menu?.querySelector('.ui-cascader__empty')).toBeNull()
    wrapper.unmount()
  })

  it('emptyText：options 为空数组时弹层显示空态文案（默认"暂无选项"）', async () => {
    const wrapper = mount(Cascader, { props: { options: [] }, attachTo: document.body })
    await wrapper.find('button.ui-cascader__trigger').trigger('click')
    expect(document.querySelector('.ui-cascader__empty')?.textContent).toBe('暂无选项')
    wrapper.unmount()

    const custom = mount(Cascader, {
      props: { options: [], emptyText: '加载中…' },
      attachTo: document.body,
    })
    await custom.find('button.ui-cascader__trigger').trigger('click')
    expect(document.querySelector('.ui-cascader__empty')?.textContent).toBe('加载中…')
    custom.unmount()
  })

  it('update:modelValue / change 已声明：叶子点击以完整路径为载荷发出', async () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE },
      attachTo: document.body,
    })
    await wrapper.find('button.ui-cascader__trigger').trigger('click')
    // → 展开浙江省（落位杭州市），再点叶子 西湖区（DOM 顺序：根级4 + 浙江子级2 + 杭州子级2）
    await wrapper.find('button.ui-cascader__trigger').trigger('keydown', { key: 'ArrowRight' })
    ;(document.querySelectorAll('.ui-cascader__option')[6] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([[['zj', 'hz', 'xh']]])
    expect(wrapper.emitted('change')).toEqual([[['zj', 'hz', 'xh']]])
    wrapper.unmount()
  })

  it('multiple：仅叶子渲染 checkbox（原生 input），父节点不渲染', async () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE, multiple: true },
      attachTo: document.body,
    })
    await wrapper.find('button.ui-cascader__trigger').trigger('click')
    await wrapper.find('button.ui-cascader__trigger').trigger('keydown', { key: 'ArrowRight' })
    const options = [...document.querySelectorAll('.ui-cascader__option')]
    // 第一列全为父节点/根级叶子北京市：北京市为叶子有 checkbox，前三个无
    const rootOptions = options.slice(0, 4)
    expect(rootOptions[3].querySelector('input[type="checkbox"]')).not.toBeNull()
    expect(rootOptions[0].querySelector('input[type="checkbox"]')).toBeNull()
    // 第二列（浙江省子级）：叶子宁波市有 checkbox，父节点杭州市没有
    const zjChildren = options.slice(4)
    expect(zjChildren[0].querySelector('input[type="checkbox"]')).toBeNull()
    expect(zjChildren[1].querySelector('input[type="checkbox"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('attrs 透传（inheritAttrs:false）：合并到触发器 button，不落根容器', () => {
    const wrapper = mount(Cascader, {
      attrs: { id: 'region-cascader', 'aria-describedby': 'region-error' },
    })
    const trigger = wrapper.find('button.ui-cascader__trigger')
    expect(trigger.attributes('id')).toBe('region-cascader')
    expect(trigger.attributes('aria-describedby')).toBe('region-error')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })

  it('option 插槽：自定义选项内容渲染（行容器 role/键盘仍由组件承担）', async () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE },
      attachTo: document.body,
      slots: { option: '<template #option="{ option }"><em>{{ option.label }}·{{ option.value }}</em></template>' },
    })
    await wrapper.find('button.ui-cascader__trigger').trigger('click')
    const first = document.querySelectorAll('.ui-cascader__option')[0]
    expect(first.querySelector('em')?.textContent).toBe('浙江省·zj')
    expect(first.getAttribute('role')).toBe('option')
    wrapper.unmount()
  })

  it('trigger 插槽：自定义触发器内容渲染（scope 提供 paths/labels/multiple）', () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE, modelValue: ['zj', 'hz'] },
      slots: {
        trigger:
          '<template #trigger="{ labels, multiple }"><b>{{ labels[0]?.join("-") }}|{{ multiple }}</b></template>',
      },
    })
    expect(wrapper.find('.ui-cascader__label b').text()).toBe('浙江省-杭州市|false')
  })
})
