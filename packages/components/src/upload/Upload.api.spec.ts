// api spec：props 默认值 / emits 声明 / slots 渲染 / 受控列表渲染。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Upload from './Upload.vue'
import type { UploadFile } from './Upload.types'

const fileOf = (name: string, overrides: Partial<UploadFile> = {}): UploadFile => ({
  uid: `file-${name}`,
  name,
  size: 1024,
  status: 'success',
  percent: 100,
  ...overrides,
})

describe('Upload api', () => {
  it('渲染 ui-upload 根容器、隐藏 file input 与原生 button 触发器', () => {
    const wrapper = mount(Upload)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('ui-upload')
    expect(wrapper.find('input.ui-upload__input[type="file"]').exists()).toBe(true)
    expect(wrapper.find('button.ui-upload__trigger').exists()).toBe(true)
    expect(wrapper.find('button.ui-upload__trigger').text()).toContain('选择文件')
  })

  it('默认：不 multiple/无 accept/未禁用/非拖拽，无列表', () => {
    const wrapper = mount(Upload)
    const input = wrapper.find('input')
    expect(input.attributes('multiple')).toBeUndefined()
    expect(input.attributes('accept')).toBeUndefined()
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('ui-upload--drag')
    expect(wrapper.classes()).not.toContain('ui-upload--disabled')
    expect(wrapper.find('ul.ui-upload__list').exists()).toBe(false)
  })

  it('accept / multiple 透传到隐藏 file input 的原生属性', () => {
    const wrapper = mount(Upload, { props: { accept: 'image/*,.pdf', multiple: true } })
    const input = wrapper.find('input')
    expect(input.attributes('accept')).toBe('image/*,.pdf')
    expect(input.attributes('multiple')).toBeDefined()
  })

  it('drag：ui-upload--drag 修饰类 + 触发器默认文案切换为拖放提示', () => {
    const wrapper = mount(Upload, { props: { drag: true } })
    expect(wrapper.classes()).toContain('ui-upload--drag')
    expect(wrapper.find('button.ui-upload__trigger').text()).toContain('点击或拖拽文件到此处')
  })

  it('disabled：触发器原生 disabled + ui-upload--disabled 修饰类', () => {
    const wrapper = mount(Upload, { props: { disabled: true } })
    expect(wrapper.find('button.ui-upload__trigger').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('ui-upload--disabled')
  })

  it('modelValue 受控列表：渲染名称/尺寸/状态文本与条目修饰类', () => {
    const wrapper = mount(Upload, {
      props: {
        modelValue: [
          fileOf('报告.pdf', { size: 4096 }),
          fileOf('扫描件.png', { status: 'error', percent: 0, error: '服务端校验失败' }),
        ],
      },
    })
    const items = wrapper.findAll('li.ui-upload__item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('报告.pdf')
    expect(items[0].text()).toContain('4 KB')
    expect(items[0].text()).toContain('上传成功')
    expect(items[1].classes()).toContain('ui-upload__item--error')
    expect(items[1].text()).toContain('上传失败')
    expect(items[1].text()).toContain('服务端校验失败')
  })

  it('uploading 条目：渲染进度条（progressbar 契约 + 内联宽度）与状态文本', () => {
    const wrapper = mount(Upload, {
      props: { modelValue: [fileOf('a.zip', { status: 'uploading', percent: 37 })] },
    })
    const progress = wrapper.find('[role="progressbar"]')
    expect(progress.exists()).toBe(true)
    expect(progress.attributes('aria-valuenow')).toBe('37')
    expect(progress.attributes('aria-valuemin')).toBe('0')
    expect(progress.attributes('aria-valuemax')).toBe('100')
    expect(progress.find('.ui-upload__progress-bar').attributes('style')).toContain('width: 37%')
    expect(wrapper.find('.ui-upload__status').text()).toBe('上传中 37%')
  })

  it('error 条目：重试/移除按钮携带含文件名的 aria-label', () => {
    const wrapper = mount(Upload, {
      props: { modelValue: [fileOf('a.png', { status: 'error', percent: 0, error: '超时' })] },
    })
    expect(wrapper.find('button.ui-upload__retry').attributes('aria-label')).toBe('重试 a.png')
    expect(wrapper.find('button.ui-upload__remove').attributes('aria-label')).toBe('移除 a.png')
  })

  it('success 条目不渲染进度条与重试按钮；空列表不渲染 ul', () => {
    const withItems = mount(Upload, { props: { modelValue: [fileOf('a.txt')] } })
    expect(withItems.find('[role="progressbar"]').exists()).toBe(false)
    expect(withItems.find('button.ui-upload__retry').exists()).toBe(false)
    expect(mount(Upload).find('ul.ui-upload__list').exists()).toBe(false)
  })

  it('trigger / list / empty 插槽渲染；list 作用域暴露 files', () => {
    const files = [fileOf('a.txt'), fileOf('b.txt')]
    const wrapper = mount(Upload, {
      props: { modelValue: files },
      slots: {
        trigger: () => h('span', { class: 'my-trigger' }, '上传附件'),
        list: ({ files: scopeFiles }: { files: UploadFile[] }) =>
          h('div', { class: 'my-list' }, `共 ${scopeFiles.length} 个`),
      },
    })
    expect(wrapper.find('.my-trigger').text()).toBe('上传附件')
    expect(wrapper.find('button .my-trigger').exists()).toBe(true)
    expect(wrapper.find('.my-list').text()).toBe('共 2 个')
    expect(wrapper.find('ul.ui-upload__list').exists()).toBe(false)

    const empty = mount(Upload, { slots: { empty: () => h('p', { class: 'my-empty' }, '暂无文件') } })
    expect(empty.find('.my-empty').text()).toBe('暂无文件')
  })

  it('emits 已声明：选择路径全量发出 update:modelValue 与 change', async () => {
    const wrapper = mount(Upload, { props: { beforeUpload: () => true } })
    const input = wrapper.find('input')
    Object.defineProperty(input.element, 'files', {
      value: [new File(['x'], 'a.txt', { type: 'text/plain' })],
      configurable: true,
    })
    await input.trigger('change')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('change')).toHaveLength(1)
    const payload = wrapper.emitted('update:modelValue')?.[0]?.[0] as UploadFile[]
    expect(payload).toHaveLength(1)
    expect(payload[0].name).toBe('a.txt')
    expect(payload[0].status).toBe('success')
  })
})
