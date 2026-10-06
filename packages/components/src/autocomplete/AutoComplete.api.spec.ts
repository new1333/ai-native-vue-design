// api spec：props 默认值 / emits 声明 / 建议弹层渲染面 / 插槽 / attrs 透传。
import { describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach } from 'vitest'
import { h, nextTick } from 'vue'
import AutoComplete from './AutoComplete.vue'
import type { AutoCompleteSelectedOption } from './AutoComplete.types'

// 任一用例失败时也保证卸载，避免 Teleport 弹层跨用例泄漏污染后续断言。
enableAutoUnmount(afterEach)

const OPTIONS = [
  { label: '北京', value: 'beijing' },
  { label: '南京', value: 'nanjing' },
  { label: '北海（暂不可选）', value: 'beihai', disabled: true },
]

const findInput = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find('input.ui-autocomplete__control')

async function openListbox(wrapper: ReturnType<typeof mount>): Promise<void> {
  await findInput(wrapper).trigger('click')
}

const optionLabels = () =>
  [...document.querySelectorAll('.ui-autocomplete__option')].map((el) => el.textContent?.trim())

describe('AutoComplete api', () => {
  it('渲染 ui-autocomplete 根容器与 combobox 原生输入框', () => {
    const wrapper = mount(AutoComplete)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-autocomplete')
    const input = findInput(wrapper)
    expect(input.element.tagName).toBe('INPUT')
    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('role')).toBe('combobox')
  })

  it('默认：默认 placeholder、aria-expanded=false、aria-haspopup/aria-autocomplete/aria-controls 就位、无清空按钮/无弹层', () => {
    const wrapper = mount(AutoComplete)
    const input = findInput(wrapper)
    expect(input.attributes('placeholder')).toBe('请输入')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('aria-haspopup')).toBe('listbox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('aria-controls')).toMatch(/^ui-autocomplete-listbox-/)
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
    expect(input.attributes('autocomplete')).toBe('off')
    expect(input.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('button.ui-autocomplete__clear').exists()).toBe(false)
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
  })

  it('placeholder prop 覆盖默认占位文案', () => {
    const input = mount(AutoComplete, { props: { placeholder: '搜索城市' } }).find(
      'input.ui-autocomplete__control',
    )
    expect(input.attributes('placeholder')).toBe('搜索城市')
  })

  it('modelValue 随输入框 value 呈现（值+文本合一）', () => {
    const wrapper = mount(AutoComplete, { props: { modelValue: '北京' } })
    expect((findInput(wrapper).element as HTMLInputElement).value).toBe('北京')
  })

  it('打开后：弹层渲染建议全集（含禁用项 label）', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await openListbox(wrapper)
    const listbox = document.querySelector('.ui-autocomplete__listbox')
    expect(listbox).not.toBeNull()
    expect(optionLabels()).toEqual(['北京', '南京', '北海（暂不可选）'])
    wrapper.unmount()
  })

  it('filter 默认本地过滤：label 包含关键词（不区分大小写）', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS, modelValue: '北' },
      attachTo: document.body,
    })
    await openListbox(wrapper)
    expect(optionLabels()).toEqual(['北京', '北海（暂不可选）'])
    wrapper.unmount()

    const upper = mount(AutoComplete, {
      props: { options: [{ label: 'Beijing', value: 'beijing' }], modelValue: 'JING' },
      attachTo: document.body,
    })
    await openListbox(upper)
    expect(optionLabels()).toEqual(['Beijing'])
    upper.unmount()
  })

  it('filter=false：关闭本地过滤（远程模式，全量展示）', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS, modelValue: '北', filter: false },
      attachTo: document.body,
    })
    await openListbox(wrapper)
    expect(optionLabels()).toEqual(['北京', '南京', '北海（暂不可选）'])
    wrapper.unmount()
  })

  it('clearable：文本非空时渲染清空按钮（aria-label="清空"），空文本不渲染', () => {
    const withValue = mount(AutoComplete, {
      props: { modelValue: '北京', clearable: true },
    })
    const clear = withValue.find('button.ui-autocomplete__clear')
    expect(clear.exists()).toBe(true)
    expect(clear.attributes('aria-label')).toBe('清空')
    const empty = mount(AutoComplete, { props: { clearable: true } })
    expect(empty.find('button.ui-autocomplete__clear').exists()).toBe(false)
  })

  it('disabled：输入框原生 disabled + 根修饰类，且不渲染清空按钮', () => {
    const wrapper = mount(AutoComplete, {
      props: { modelValue: '北京', disabled: true, clearable: true },
    })
    expect(findInput(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-autocomplete--disabled')
    expect(wrapper.find('button.ui-autocomplete__clear').exists()).toBe(false)
  })

  it('emptyText：建议为空时弹层显示空态文案（默认"暂无匹配"）', async () => {
    const wrapper = mount(AutoComplete, { props: { options: [] }, attachTo: document.body })
    await openListbox(wrapper)
    expect(document.querySelector('.ui-autocomplete__empty')?.textContent?.trim()).toBe('暂无匹配')
    wrapper.unmount()

    const custom = mount(AutoComplete, {
      props: { options: [], emptyText: '没有找到结果' },
      attachTo: document.body,
    })
    await openListbox(custom)
    expect(document.querySelector('.ui-autocomplete__empty')?.textContent?.trim()).toBe(
      '没有找到结果',
    )
    custom.unmount()
  })

  it('loading：建议为空时弹层显示加载行（role=status）且 listbox aria-busy=true；有建议时不显示加载行', async () => {
    const loading = mount(AutoComplete, { props: { options: [], loading: true }, attachTo: document.body })
    await openListbox(loading)
    const listbox = document.querySelector('.ui-autocomplete__listbox')
    expect(listbox?.getAttribute('aria-busy')).toBe('true')
    const row = document.querySelector('.ui-autocomplete__loading')
    expect(row?.getAttribute('role')).toBe('status')
    expect(row?.textContent?.trim()).toBe('加载中…')
    expect(document.querySelector('.ui-autocomplete__empty')).toBeNull()
    loading.unmount()

    const withOptions = mount(AutoComplete, {
      props: { options: OPTIONS, loading: true },
      attachTo: document.body,
    })
    await openListbox(withOptions)
    expect(optionLabels()).toHaveLength(3)
    expect(document.querySelector('.ui-autocomplete__loading')).toBeNull()
    withOptions.unmount()
  })

  it('emits：setValue 发出 update:modelValue；点击建议发出 select（归一化 value 保留）与 update:modelValue(label)', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    await findInput(wrapper).setValue('北')
    expect(wrapper.emitted('update:modelValue')).toEqual([['北']])
    await openListbox(wrapper)
    ;(document.querySelectorAll('.ui-autocomplete__option')[0] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toEqual([['北'], ['北京']])
    expect(wrapper.emitted('select')).toEqual([
      [{ label: '北京', value: 'beijing' }],
    ])
    wrapper.unmount()
  })

  it('select 载荷归一化：value 缺省回退为 label', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: [{ label: '杭州' }] },
      attachTo: document.body,
    })
    await openListbox(wrapper)
    ;(document.querySelector('.ui-autocomplete__option') as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('select')).toEqual([[{ label: '杭州', value: '杭州' }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([['杭州']])
    wrapper.unmount()
  })

  it('update:open 受控：初始 open=true 挂载即打开建议面板（aria-expanded=true）', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS, open: true },
      attachTo: document.body,
    })
    await nextTick()
    const listbox = document.querySelector('.ui-autocomplete__listbox')
    expect(listbox).not.toBeNull()
    expect(listbox?.parentElement).toBe(document.body)
    expect(findInput(wrapper).attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('update:open 受控：open=false 时点击输入框只派发 update:open(true) 不自行开启；父反射后跟随开合', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS, open: false },
      attachTo: document.body,
    })
    const input = findInput(wrapper)
    await input.trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull() // 完全受控：未反射即不开
    await wrapper.setProps({ open: true })
    await nextTick()
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    expect(input.attributes('aria-expanded')).toBe('true')
    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
    expect(input.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('update:open 非受控（未传 open）：点击打开/blur 关闭不回归，且完整周期上抛 [true]/[false]', async () => {
    const wrapper = mount(AutoComplete, { props: { options: OPTIONS }, attachTo: document.body })
    const input = findInput(wrapper)
    await input.trigger('click')
    expect(document.querySelector('.ui-autocomplete__listbox')).not.toBeNull()
    await input.trigger('blur')
    expect(document.querySelector('.ui-autocomplete__listbox')).toBeNull()
    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
    wrapper.unmount()
  })

  it('slots：prefix / suffix 渲染于容器两端', () => {
    const wrapper = mount(AutoComplete, {
      slots: {
        prefix: () => h('b', { class: 'pre' }, '前'),
        suffix: () => h('i', { class: 'suf' }, '后'),
      },
    })
    expect(wrapper.find('.ui-autocomplete__prefix .pre').text()).toBe('前')
    expect(wrapper.find('.ui-autocomplete__suffix .suf').text()).toBe('后')
  })

  it('option 作用域插槽：拿到归一化 option / index / active', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: OPTIONS },
      attachTo: document.body,
      slots: {
        option: (scope: { option: AutoCompleteSelectedOption; index: number; active: boolean }) =>
          h('span', { class: 'opt' }, `${String(scope.option.value)}:${scope.index}:${scope.active}`),
      },
    })
    await openListbox(wrapper)
    await findInput(wrapper).trigger('keydown', { key: 'ArrowDown' })
    const rendered = [...document.querySelectorAll('.ui-autocomplete__option .opt')].map(
      (el) => el.textContent,
    )
    expect(rendered).toEqual(['beijing:0:false', 'nanjing:1:true', 'beihai:2:false'])
    wrapper.unmount()
  })

  it('empty 插槽覆盖默认空态文案', async () => {
    const wrapper = mount(AutoComplete, {
      props: { options: [] },
      attachTo: document.body,
      slots: { empty: () => h('em', { class: 'custom-empty' }, '自定义空态') },
    })
    await openListbox(wrapper)
    expect(document.querySelector('.ui-autocomplete__empty .custom-empty')?.textContent).toBe(
      '自定义空态',
    )
    wrapper.unmount()
  })

  it('attrs 透传（inheritAttrs:false）：合并到原生 input，不落根容器', () => {
    const wrapper = mount(AutoComplete, {
      attrs: { id: 'city-input', 'aria-describedby': 'city-error' },
    })
    const input = findInput(wrapper)
    expect(input.attributes('id')).toBe('city-input')
    expect(input.attributes('aria-describedby')).toBe('city-error')
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  })
})
