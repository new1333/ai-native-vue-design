// a11y spec：combobox/分栏 listbox 语义 / aria 属性 / ↑↓←→ 键盘序列 / 焦点模型。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Cascader from './Cascader.vue'
import type { CascaderExpose, CascaderOption } from './Cascader.types'

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
const allOptions = () => [...document.querySelectorAll('.ui-cascader__option')]

describe('Cascader a11y', () => {
  it('触发器：原生 button + role=combobox + aria-haspopup=listbox；关闭态不挂 aria-controls（弹层已移除，避免悬空 idref）', () => {
    const wrapper = mount(Cascader, { props: { options: TREE } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
    expect(trigger.attributes('aria-controls')).toBeUndefined()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('tabindex')).toBeUndefined()
  })

  it('打开后：aria-controls 指向真实弹层 id，aria-expanded=true，根级面板为 role=listbox 且带可读名称', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const menu = document.getElementById(trigger.attributes('aria-controls') ?? '')
    expect(menu).not.toBeNull()
    expect(menu?.classList.contains('ui-cascader__menu')).toBe(true)
    const panels = [...(menu?.querySelectorAll('.ui-cascader__panel') ?? [])]
    // 打开时高亮落位首个可选根项浙江省 → 其子级面板随高亮出现（展开跟随高亮）
    expect(panels.map((el) => el.getAttribute('role'))).toEqual(['listbox', 'listbox'])
    expect(panels[0].getAttribute('aria-label')).toBe('一级候选')
    expect(panels[0].getAttribute('aria-orientation')).toBe('vertical')
    wrapper.unmount()
  })

  it('展开子级后：新面板 role=listbox 且 aria-label 为「<父级 label>的子选项」', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    const panels = [...document.querySelectorAll('.ui-cascader__panel')]
    expect(panels).toHaveLength(3)
    expect(panels[1].getAttribute('aria-label')).toBe('浙江省的子选项')
    expect(panels[2].getAttribute('aria-label')).toBe('杭州市的子选项')
    wrapper.unmount()
  })

  it('选项：role=option / aria-selected（已选叶子与其祖先链均贯穿命中）/ aria-disabled', async () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE, modelValue: ['zj', 'hz'] },
      attachTo: document.body,
    })
    await findTrigger(wrapper).trigger('click')
    const options = allOptions()
    // 打开落位已选链：根级 4 项 + 浙江省子级 2 项 + 杭州市子级 2 项
    expect(options).toHaveLength(8)
    expect(options[0].getAttribute('aria-selected')).toBe('true') // 浙江省（祖先贯穿）
    expect(options[4].getAttribute('aria-selected')).toBe('true') // 杭州市（已选）
    expect(options[1].getAttribute('aria-selected')).toBe('false')
    expect(options[1].getAttribute('aria-disabled')).toBe('true') // 江苏省
    expect(options[0].getAttribute('aria-disabled')).toBeNull()
    // 已选链面板内：余杭区（禁用叶子）aria-disabled
    expect(options[7].getAttribute('aria-disabled')).toBe('true')
    wrapper.unmount()
  })

  it('键盘 ↓：关闭态打开并把 aria-activedescendant 落在首个可选选项', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[0].id)
    wrapper.unmount()
  })

  it('键盘 ↓/↑：高亮沿当前面板可选项移动（跳过禁用项），aria-activedescendant 同步', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[2].id) // 跳过禁用的江苏省
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[3].id)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[3].id) // 末端夹住
    await trigger.trigger('keydown', { key: 'ArrowUp' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[2].id)
    wrapper.unmount()
  })

  it('键盘 →：进入子级面板（落位首个可选子项）；←：返回上级面板', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' }) // 打开，高亮浙江省
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    expect(document.querySelectorAll('.ui-cascader__panel')).toHaveLength(3)
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[4].id) // 杭州市
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[6].id) // 西湖区
    await trigger.trigger('keydown', { key: 'ArrowLeft' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[4].id)
    await trigger.trigger('keydown', { key: 'ArrowLeft' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[0].id)
    await trigger.trigger('keydown', { key: 'ArrowLeft' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[0].id) // 已在根级，不再收缩
    wrapper.unmount()
  })

  it('键盘 Home/End：高亮跳到当前面板首/尾可选选项', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'End' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[3].id) // 北京市
    await trigger.trigger('keydown', { key: 'Home' })
    expect(trigger.attributes('aria-activedescendant')).toBe(allOptions()[0].id)
    wrapper.unmount()
  })

  it('键盘 Enter：打开（关闭态）/ 叶子提交并关闭（打开态）', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    await trigger.trigger('keydown', { key: 'ArrowRight' }) // 高亮西湖区
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[['zj', 'hz', 'xh']]])
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Enter 在父节点（未开 changeOnSelect）：仅展开不提交', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' }) // 浙江省
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(document.querySelectorAll('.ui-cascader__panel')).toHaveLength(3)
    wrapper.unmount()
  })

  it('键盘 Space（" "）：打开弹层且 preventDefault（不双触发/不滚动）', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Esc：关闭弹层且不发出 update:modelValue', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-cascader__menu')).toBeNull()
    // 关闭后 aria-controls 随弹层移除（打开时已验证双向关联成立）
    expect(trigger.attributes('aria-controls')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('键盘 Tab：放行默认行为（不 preventDefault），触发器 blur 关闭弹层', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    trigger.element.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    await trigger.trigger('blur')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('焦点模型：选项不进 Tab 序（无 tabindex），焦点始终停留在触发器', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    const options = allOptions()
    expect(options.every((el) => !el.hasAttribute('tabindex'))).toBe(true)
    expect(document.activeElement).not.toBe(options[0])
    const exposed = wrapper.vm as CascaderExpose
    exposed.focus()
    expect(document.activeElement).toBe(trigger.element)
    exposed.blur()
    expect(document.activeElement).not.toBe(trigger.element)
    wrapper.unmount()
  })

  it('multiple：叶子 checkbox tabindex=-1 不进 Tab 序、disabled 叶子原生 disabled，状态与 aria-selected 同步', async () => {
    const wrapper = mount(Cascader, {
      props: { options: TREE, modelValue: [['zj', 'hz', 'xh']], multiple: true },
      attachTo: document.body,
    })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    await trigger.trigger('keydown', { key: 'ArrowRight' })
    const options = allOptions()
    const checked = options[6].querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checked.checked).toBe(true)
    expect(checked.getAttribute('tabindex')).toBe('-1')
    expect(options[6].getAttribute('aria-selected')).toBe('true')
    const disabledLeaf = options[7].querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(disabledLeaf.disabled).toBe(true) // 余杭区
    wrapper.unmount()
  })

  it('multiple：键盘 Enter 勾选叶子后弹层保持打开', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE, multiple: true }, attachTo: document.body })
    const trigger = findTrigger(wrapper)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' }) // 北京市（根级叶子）
    await trigger.trigger('keydown', { key: 'Enter' })
    // 多选载荷为路径数组：一次调用，参数为 [['bj']]
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted).toHaveLength(1)
    expect(emitted[0]?.[0]).toEqual([['bj']])
    expect(trigger.attributes('aria-expanded')).toBe('true') // 保持打开
    wrapper.unmount()
  })

  it('disabled：原生 disabled 属性（移出 Tab 序）且键盘路径不打开', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE, disabled: true } })
    const trigger = findTrigger(wrapper)
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(trigger.attributes('aria-disabled')).toBeUndefined()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.querySelector('.ui-cascader__menu')).toBeNull()
  })

  it('展开/折叠箭标 svg 带 aria-hidden，不进入可读内容', async () => {
    const wrapper = mount(Cascader, { props: { options: TREE }, attachTo: document.body })
    const chevron = wrapper.find('.ui-cascader__chevron')
    expect(chevron.attributes('aria-hidden')).toBe('true')
    expect(chevron.attributes('focusable')).toBe('false')
    await findTrigger(wrapper).trigger('click')
    for (const arrow of document.querySelectorAll('.ui-cascader__arrow')) {
      expect(arrow.getAttribute('aria-hidden')).toBe('true')
    }
    wrapper.unmount()
  })
})
