// behavior spec：开合 / 展开 / 提交 / v-model 双向 / 多选勾选 / 点击外部关闭 / 状态机纯逻辑。
import { describe, expect, it, vi } from 'vitest'
import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Cascader from './Cascader.vue'
import { useCascader } from './useCascader'
import type { CascaderOption, CascaderPath } from './Cascader.types'

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

const findTrigger = (wrapper: ReturnType<typeof mount>) => wrapper.find('button.ui-cascader__trigger')

describe('Cascader behavior', () => {
  it('点击触发器打开弹层（Teleport 到 body），再点一次切换关闭', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    let menu = document.querySelector('.ui-cascader__menu')
    expect(menu).not.toBeNull()
    expect(menu?.parentElement).toBe(document.body)
    await trigger.trigger('click')
    menu = document.querySelector('.ui-cascader__menu')
    expect(menu).toBeNull()
    wrapper.unmount()
  })

  it('点击叶子选项：发出 update:modelValue 与 change（完整路径）并关闭弹层', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    await findTrigger(wrapper).trigger('keydown', { key: 'ArrowRight' })
    ;(document.querySelectorAll('.ui-cascader__option')[6] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([[['zj', 'hz', 'xh']]])
    expect(wrapper.emitted('change')).toEqual([[['zj', 'hz', 'xh']]])
    expect(document.querySelector('.ui-cascader__menu')).toBeNull()
    wrapper.unmount()
  })

  it('点击父节点：切展开下级面板（高亮跟随），不发出任何事件（未开 changeOnSelect）', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    // 打开时高亮落位首个可选根项浙江省（其子级面板随高亮出现）；点击上海市切换展开
    ;(document.querySelectorAll('.ui-cascader__option')[2] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelectorAll('.ui-cascader__panel')).toHaveLength(2)
    const secondPanelLabels = [...(document.querySelectorAll('.ui-cascader__panel')[1]?.querySelectorAll('.ui-cascader__option') ?? [])].map(
      (el) => el.textContent,
    )
    expect(secondPanelLabels).toEqual(['黄浦区'])
    wrapper.unmount()
  })

  it('changeOnSelect：点击父节点提交其路径且弹层保持打开（继续展开）', async () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE, changeOnSelect: true },
      attachTo: document.body,
    })
    await findTrigger(wrapper).trigger('click')
    ;(document.querySelectorAll('.ui-cascader__option')[0] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([[['zj']]])
    expect(wrapper.emitted('change')).toEqual([[['zj']]])
    expect(document.querySelector('.ui-cascader__menu')).not.toBeNull()
    expect(document.querySelectorAll('.ui-cascader__panel')).toHaveLength(2)
    wrapper.unmount()
  })

  it('v-model 双向绑定：选中更新父状态，父状态变化回落触发器文案', async () => {
    const value = ref<CascaderPath | null>(null)
    const Host = defineComponent({
      setup: () => () =>
        h(Cascader, {
          options: TREE,
          modelValue: value.value,
          'onUpdate:modelValue': (v: CascaderPath | CascaderPath[]) => {
            value.value = v as CascaderPath
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    await findTrigger(wrapper).trigger('keydown', { key: 'ArrowRight' })
    ;(document.querySelectorAll('.ui-cascader__option')[6] as HTMLElement).click()
    await nextTick()
    expect(value.value).toEqual(['zj', 'hz', 'xh'])
    expect(findTrigger(wrapper).text()).toContain('浙江省 / 杭州市 / 西湖区')
    value.value = ['sh', 'hp']
    await nextTick()
    expect(findTrigger(wrapper).text()).toContain('上海市 / 黄浦区')
    wrapper.unmount()
  })

  it('点击禁用选项：不发出 update:modelValue，面板不切换', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    ;(document.querySelectorAll('.ui-cascader__option')[1] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelectorAll('.ui-cascader__panel')).toHaveLength(2)
    const secondPanelLabels = [...(document.querySelectorAll('.ui-cascader__panel')[1]?.querySelectorAll('.ui-cascader__option') ?? [])].map(
      (el) => el.textContent,
    )
    expect(secondPanelLabels).toEqual(['杭州市', '宁波市']) // 仍为浙江省子级
    wrapper.unmount()
  })

  it('disabled：点击触发器不打开弹层', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE, disabled: true } })
    await findTrigger(wrapper).trigger('click')
    expect(document.querySelector('.ui-cascader__menu')).toBeNull()
  })

  it('expandTrigger="hover"：悬停含子级选项即切换展开（不提交）', async () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE, expandTrigger: 'hover' },
      attachTo: document.body,
    })
    await findTrigger(wrapper).trigger('click')
    expect(document.querySelectorAll('.ui-cascader__panel')).toHaveLength(2) // 打开高亮浙江省
    const options = [...document.querySelectorAll('.ui-cascader__option')]
    ;(options[2] as HTMLElement).dispatchEvent(new Event('mouseenter')) // 悬停上海市 → 切换展开
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.querySelectorAll('.ui-cascader__panel')).toHaveLength(2)
    const secondPanelLabels = [...(document.querySelectorAll('.ui-cascader__panel')[1]?.querySelectorAll('.ui-cascader__option') ?? [])].map(
      (el) => el.textContent,
    )
    expect(secondPanelLabels).toEqual(['黄浦区'])
    wrapper.unmount()
  })

  it('expandTrigger 默认 click：悬停不切换展开', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    const options = [...document.querySelectorAll('.ui-cascader__option')]
    ;(options[2] as HTMLElement).dispatchEvent(new Event('mouseenter'))
    await nextTick()
    const secondPanelLabels = [...(document.querySelectorAll('.ui-cascader__panel')[1]?.querySelectorAll('.ui-cascader__option') ?? [])].map(
      (el) => el.textContent,
    )
    expect(secondPanelLabels).toEqual(['杭州市', '宁波市']) // 仍为浙江省子级
    wrapper.unmount()
  })

  it('点击外部关闭：不发 update:modelValue；触发器 blur（Tab 路径）也关闭', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    outside.click()
    await nextTick()
    expect(document.querySelector('.ui-cascader__menu')).toBeNull()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    outside.remove()

    await findTrigger(wrapper).trigger('click')
    expect(document.querySelector('.ui-cascader__menu')).not.toBeNull()
    await findTrigger(wrapper).trigger('blur')
    expect(document.querySelector('.ui-cascader__menu')).toBeNull()
    wrapper.unmount()
  })

  it('multiple：点击叶子勾选（载荷为路径数组）且弹层保持打开，再次点击取消勾选（载荷为空数组）', async () => {
    const paths = ref<CascaderPath[]>([])
    const Host = defineComponent({
      setup: () => () =>
        h(Cascader, {
          options: TREE,
          modelValue: paths.value,
          multiple: true,
          'onUpdate:modelValue': (v: CascaderPath | CascaderPath[]) => {
            paths.value = v as CascaderPath[]
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    await findTrigger(wrapper).trigger('keydown', { key: 'ArrowRight' })
    const leaf = document.querySelectorAll('.ui-cascader__option')[6]
    ;(leaf as HTMLElement).click()
    await nextTick()
    expect(paths.value).toEqual([['zj', 'hz', 'xh']])
    expect(document.querySelector('.ui-cascader__menu')).not.toBeNull()
    expect((leaf.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true)
    ;(leaf as HTMLElement).click()
    await nextTick()
    expect(paths.value).toEqual([])
    expect((leaf.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(false)
    wrapper.unmount()
  })

  it('multiple：叶子 checkbox 的 change 事件走勾选路径（tabindex=-1 不进 Tab 序）', async () => {
    const paths = ref<CascaderPath[]>([])
    const Host = defineComponent({
      setup: () => () =>
        h(Cascader, {
          options: TREE,
          modelValue: paths.value,
          multiple: true,
          'onUpdate:modelValue': (v: CascaderPath | CascaderPath[]) => {
            paths.value = v as CascaderPath[]
          },
        }),
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    await findTrigger(wrapper).trigger('keydown', { key: 'ArrowRight' })
    const checkbox = document.querySelectorAll('.ui-cascader__option')[6].querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement
    expect(checkbox.getAttribute('tabindex')).toBe('-1')
    await new DOMWrapper(checkbox).setValue(true)
    await nextTick()
    expect(paths.value).toEqual([['zj', 'hz', 'xh']])
    wrapper.unmount()
  })

  it('打开时按触发器 rect 计算弹层定位，并计入页面滚动偏移（文档坐标）', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 120, 160, 32))
    document.documentElement.scrollLeft = 30
    document.documentElement.scrollTop = 400
    await trigger.trigger('click')
    await nextTick()
    const style = (document.querySelector('.ui-cascader__menu')?.getAttribute('style') ?? '').replace(/\s+/g, '')
    expect(style).toContain('top:552px') // rect.bottom 152 + scrollY 400
    expect(style).toContain('left:50px') // rect.left 20 + scrollX 30
    expect(style).toContain('min-width:160px')
    document.documentElement.scrollLeft = 0
    document.documentElement.scrollTop = 0
    wrapper.unmount()
  })

  it('卸载时移除 document 点击监听（onMounted 注册、onBeforeUnmount 移除）', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    await findTrigger(wrapper).trigger('click')
    expect(document.querySelector('.ui-cascader__menu')).not.toBeNull()
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function), true)
    removeSpy.mockRestore()
  })

  it('useCascader 纯状态机：打开落位已选路径链（含中间层级），否则首个可选根项', () => {
    const seeded = useCascader({
      options: TREE,
      modelValue: () => ['zj', 'hz'],
      onSelect: vi.fn(),
    })
    seeded.openList()
    expect(seeded.activeIndexes.value).toEqual([0, 0])
    expect(seeded.panels.value).toHaveLength(3) // 根级 + 浙江省子级 + 高亮杭州市的子级（展开跟随高亮）
    expect(seeded.displayLabels.value).toEqual([['浙江省', '杭州市']])

    const empty = useCascader({ options: TREE, modelValue: () => null, onSelect: vi.fn() })
    empty.openList()
    expect(empty.activeIndexes.value).toEqual([0]) // 首个可选根项（跳过无禁用语义，0 即浙江省）
  })

  it('useCascader 纯状态机：↓/↑ 跳过禁用项并在两端夹住，Home/End 首尾', () => {
    const state = useCascader({ options: TREE, modelValue: () => null, onSelect: vi.fn() })
    state.openList()
    expect(state.activeIndexes.value).toEqual([0])
    state.moveActive(1)
    expect(state.activeIndexes.value).toEqual([2]) // 跳过 index=1 的禁用「江苏省」
    state.moveActive(1)
    expect(state.activeIndexes.value).toEqual([3])
    state.moveActive(1)
    expect(state.activeIndexes.value).toEqual([3]) // 末端夹住
    state.moveActive(-1)
    expect(state.activeIndexes.value).toEqual([2])
    state.toEdge('last')
    expect(state.activeIndexes.value).toEqual([3])
    state.toEdge('first')
    expect(state.activeIndexes.value).toEqual([0])
  })

  it('useCascader 纯状态机：→ 进入子级（落位首个可选子项）、← 返回上级（子面板随高亮推导）', () => {
    const state = useCascader({ options: TREE, modelValue: () => null, onSelect: vi.fn() })
    state.openList()
    state.expandActive()
    expect(state.activeIndexes.value).toEqual([0, 0])
    expect(state.panels.value).toHaveLength(3) // 高亮落在含子级的杭州市 → 孙级面板出现
    state.moveActive(1)
    expect(state.activeIndexes.value).toEqual([0, 1]) // 宁波市（叶子）→ 孙级面板收起
    expect(state.panels.value).toHaveLength(2)
    state.collapseActive()
    expect(state.activeIndexes.value).toEqual([0])
    expect(state.panels.value).toHaveLength(2) // 上级高亮仍有子级 → 面板保留
    state.collapseActive()
    expect(state.activeIndexes.value).toEqual([0]) // 已在根级，不再收缩
  })

  it('useCascader 纯状态机：单选叶子提交并关闭、父节点仅展开；changeOnSelect 父节点提交并展开', () => {
    const onSelect = vi.fn()
    const state = useCascader({ options: TREE, modelValue: () => null, onSelect })
    state.openList()
    state.expandActive()
    state.moveActive(1) // 宁波市（叶子）
    state.commitActive()
    expect(onSelect).toHaveBeenCalledWith(['zj', 'nb'])
    expect(state.open.value).toBe(false)

    const onSelectStrict = vi.fn()
    const strict = useCascader({ options: TREE, modelValue: () => null, onSelect: onSelectStrict })
    strict.openList()
    strict.commitActive() // 浙江省（父节点）
    expect(onSelectStrict).not.toHaveBeenCalled()
    expect(strict.activeIndexes.value).toEqual([0, 0])

    const onSelectLoose = vi.fn()
    const loose = useCascader({
      options: TREE,
      modelValue: () => null,
      changeOnSelect: () => true,
      onSelect: onSelectLoose,
    })
    loose.openList()
    loose.commitActive()
    expect(onSelectLoose).toHaveBeenCalledWith(['zj'])
    expect(loose.activeIndexes.value).toEqual([0, 0]) // 提交后仍展开
    expect(loose.open.value).toBe(true)
  })

  it('useCascader 纯状态机：多选叶子 togglePath 勾选/取消，非叶子/禁用/断链路径被拦截', () => {
    const onSelect = vi.fn()
    const state = useCascader({
      options: TREE,
      modelValue: () => null,
      multiple: () => true,
      onSelect,
    })
    state.togglePath(['zj']) // 父节点不可勾选
    state.togglePath(['zj', 'hz', 'yh']) // 禁用叶子
    state.togglePath(['x', 'y']) // 不可解析
    state.togglePath([]) // 空路径
    expect(onSelect).not.toHaveBeenCalled()
    state.togglePath(['zj', 'hz', 'xh'])
    expect(onSelect).toHaveBeenCalledWith([['zj', 'hz', 'xh']])
    // 已勾选路径再次 toggle → 移除（selectedPaths 由 modelValue 驱动，这里手动喂回）
    const checked = useCascader({
      options: TREE,
      modelValue: () => [['zj', 'hz', 'xh']],
      multiple: () => true,
      onSelect,
    })
    checked.togglePath(['zj', 'hz', 'xh'])
    expect(onSelect).toHaveBeenLastCalledWith([])
  })

  it('useCascader 纯状态机：disabled 总闸拦截开合与键盘（受理键不 preventDefault）', () => {
    const state = useCascader({
      options: TREE,
      modelValue: () => null,
      disabled: () => true,
      onSelect: vi.fn(),
    })
    state.toggleList()
    expect(state.open.value).toBe(false)
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    state.handleKeydown(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(state.open.value).toBe(false)
  })

  it('useCascader 纯状态机：键盘状态机受理键 preventDefault，Esc 关闭、Enter 提交叶子', () => {
    const onSelect = vi.fn()
    const state = useCascader({ options: TREE, modelValue: () => null, onSelect })
    const press = (key: string) => {
      const event = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent
      state.handleKeydown(event)
      return event
    }
    expect(press('a').preventDefault).not.toHaveBeenCalled() // 非受理键放行
    expect(press('ArrowDown').preventDefault).toHaveBeenCalled()
    expect(state.open.value).toBe(true)
    press('ArrowRight')
    press('ArrowRight') // 进入杭州市子级，高亮西湖区
    expect(state.activeIndexes.value).toEqual([0, 0, 0])
    press('Enter')
    expect(onSelect).toHaveBeenCalledWith(['zj', 'hz', 'xh'])
    expect(state.open.value).toBe(false)
    press('Escape')
    expect(state.open.value).toBe(false)
  })
})
