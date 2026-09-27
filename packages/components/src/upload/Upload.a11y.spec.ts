// a11y spec：原生语义 / aria 契约 / 键盘路径 / 焦点管理。
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Upload from './Upload.vue'
import type { UploadFile } from './Upload.types'

const presetFile = (name: string, overrides: Partial<UploadFile> = {}): UploadFile => ({
  uid: `file-${name}`,
  name,
  status: 'success',
  percent: 100,
  ...overrides,
})

describe('Upload a11y', () => {
  it('触发器为原生 <button type="button">（Enter/Space 平台原生激活），不书写 role', () => {
    const trigger = mount(Upload).find('button.ui-upload__trigger')
    expect(trigger.element.tagName).toBe('BUTTON')
    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('role')).toBeUndefined()
    expect(trigger.attributes('tabindex')).toBeUndefined()
  })

  it('触发器文本即可访问名称（默认文案），自定义 trigger 插槽内容随之替换', () => {
    expect(mount(Upload).find('button.ui-upload__trigger').text()).toContain('选择文件')
    const drag = mount(Upload, { props: { drag: true } })
    expect(drag.find('button.ui-upload__trigger').text()).toContain('点击或拖拽文件到此处')
  })

  it('触发器可聚焦：focus() 后成为 activeElement（键盘 Tab 可达）', async () => {
    const wrapper = mount(Upload, { attachTo: document.body })
    const trigger = wrapper.find('button.ui-upload__trigger')
    ;(trigger.element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('键盘激活路径：button 的 click（Enter/Space 的原生结果）唤起隐藏 input 的文件选择', async () => {
    const wrapper = mount(Upload, { attachTo: document.body })
    const spy = vi.spyOn(
      wrapper.find('input.ui-upload__input').element as HTMLInputElement,
      'click',
    ).mockImplementation(() => {})
    await wrapper.find('button.ui-upload__trigger').trigger('click')
    expect(spy).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('隐藏 file input：aria-hidden="true" + tabindex="-1"，不与触发器争夺读屏/Tab 序', () => {
    const input = mount(Upload).find('input.ui-upload__input')
    expect(input.attributes('aria-hidden')).toBe('true')
    expect(input.attributes('tabindex')).toBe('-1')
  })

  it('disabled：原生 disabled（移出 Tab 序），不用 aria-disabled', () => {
    const trigger = mount(Upload, { props: { disabled: true } }).find('button.ui-upload__trigger')
    expect(trigger.attributes('disabled')).toBeDefined()
    expect(trigger.attributes('aria-disabled')).toBeUndefined()
  })

  it('列表为原生 ul/li，不书写 role 改写列表语义', () => {
    const wrapper = mount(Upload, { props: { modelValue: [presetFile('a.txt')] } })
    expect(wrapper.find('ul.ui-upload__list').exists()).toBe(true)
    expect(wrapper.find('li.ui-upload__item').attributes('role')).toBeUndefined()
  })

  it('上传状态以真实文本呈现（读屏可读）：上传中 N% / 上传成功 / 上传失败', () => {
    const wrapper = mount(Upload, {
      props: {
        modelValue: [
          presetFile('a.txt', { status: 'uploading', percent: 42 }),
          presetFile('b.txt'),
          presetFile('c.txt', { status: 'error', percent: 0, error: '超时' }),
        ],
      },
    })
    const statuses = wrapper.findAll('.ui-upload__status')
    expect(statuses[0].text()).toBe('上传中 42%')
    expect(statuses[1].text()).toBe('上传成功')
    expect(statuses[2].text()).toBe('上传失败')
  })

  it('进度条 progressbar 契约：role + aria-valuemin/max/now + aria-label 含文件名', () => {
    const progress = mount(Upload, {
      props: { modelValue: [presetFile('a.zip', { status: 'uploading', percent: 55 })] },
    }).find('[role="progressbar"]')
    expect(progress.attributes('role')).toBe('progressbar')
    expect(progress.attributes('aria-label')).toBe('a.zip 上传进度')
    expect(progress.attributes('aria-valuemin')).toBe('0')
    expect(progress.attributes('aria-valuemax')).toBe('100')
    expect(progress.attributes('aria-valuenow')).toBe('55')
  })

  it('移除/重试按钮：原生 button、aria-label 含文件名、图标 aria-hidden', () => {
    const wrapper = mount(Upload, {
      props: { modelValue: [presetFile('a.png', { status: 'error', percent: 0, error: '超时' })] },
    })
    const retry = wrapper.find('button.ui-upload__retry')
    const remove = wrapper.find('button.ui-upload__remove')
    expect(retry.attributes('type')).toBe('button')
    expect(retry.attributes('aria-label')).toBe('重试 a.png')
    expect(retry.find('svg').attributes('aria-hidden')).toBe('true')
    expect(remove.attributes('type')).toBe('button')
    expect(remove.attributes('aria-label')).toBe('移除 a.png')
    expect(remove.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('键盘移除路径：移除按钮可聚焦，click（Enter/Space 原生结果）发出 remove', async () => {
    const wrapper = mount(Upload, {
      props: { modelValue: [presetFile('a.txt')] },
      attachTo: document.body,
    })
    const remove = wrapper.find('button.ui-upload__remove')
    ;(remove.element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(remove.element)
    await remove.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
    wrapper.unmount()
  })
})
