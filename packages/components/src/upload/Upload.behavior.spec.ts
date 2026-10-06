// behavior spec：选择闸门 / beforeUpload 生命周期 / 受控回写 / 拖拽 / 移除与重试。
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import type { Ref } from 'vue'
import Upload from './Upload.vue'
import type { UploadFile, UploadProps } from './Upload.types'

const txtFile = (name = 'a.txt'): File => new File(['hello'], name, { type: 'text/plain' })
const pngFile = (name = 'a.png'): File => new File(['x'], name, { type: 'image/png' })

const presetFile = (name: string, overrides: Partial<UploadFile> = {}): UploadFile => ({
  uid: `file-${name}`,
  name,
  status: 'success',
  percent: 100,
  ...overrides,
})

/** 模拟 v-model 回写：把最近一次 update:modelValue 载荷写回 props。 */
async function syncModel(wrapper: VueWrapper): Promise<void> {
  const emitted = wrapper.emitted('update:modelValue')
  if (!emitted || emitted.length === 0) return
  const latest = emitted[emitted.length - 1][0] as UploadFile[]
  await wrapper.setProps({ modelValue: latest })
}

/** 通过隐藏 input 触发一次选择。 */
async function choose(wrapper: VueWrapper, files: File[]): Promise<void> {
  const input = wrapper.find('input.ui-upload__input')
  Object.defineProperty(input.element, 'files', { value: files, configurable: true })
  await input.trigger('change')
  await syncModel(wrapper)
}

function mountUpload(props: UploadProps = {}): VueWrapper {
  return mount(Upload, { props })
}

/**
 * 真 v-model 宿主：update:modelValue 同步回写 ref（受控契约的忠实模拟——
 * 异步上传任务的落定 patch 依赖回写后的最新列表）。
 */
function mountWithModel(initial: UploadFile[] = [], extraProps: Partial<UploadProps> = {}): {
  wrapper: VueWrapper
  files: Ref<UploadFile[]>
  errors: Array<[unknown, UploadFile]>
} {
  const files = ref<UploadFile[]>(initial)
  const errors: Array<[unknown, UploadFile]> = []
  const Host = defineComponent({
    setup: () => () =>
      h(Upload, {
        modelValue: files.value,
        'onUpdate:modelValue': (value: UploadFile[]) => {
          files.value = value
        },
        onError: (error: unknown, file: UploadFile) => {
          errors.push([error, file])
        },
        ...extraProps,
      }),
  })
  return { wrapper: mount(Host), files, errors }
}

describe('Upload behavior', () => {
  it('点击触发器唤起文件选择对话框（隐藏 input 的 click 被调用）', async () => {
    const wrapper = mountUpload()
    const spy = vi.spyOn(wrapper.find('input').element as HTMLInputElement, 'click')
      .mockImplementation(() => {})
    await wrapper.find('button.ui-upload__trigger').trigger('click')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('无 beforeUpload：选择即以上传成功入列，载荷含 uid/name/size/raw', async () => {
    const wrapper = mountUpload()
    await choose(wrapper, [txtFile()])
    const payload = wrapper.emitted('update:modelValue')?.[0]?.[0] as UploadFile[]
    expect(payload).toHaveLength(1)
    expect(payload[0].name).toBe('a.txt')
    expect(payload[0].size).toBe(5)
    expect(payload[0].status).toBe('success')
    expect(payload[0].percent).toBe(100)
    expect(payload[0].uid).toMatch(/^ui-upload-file-\d+$/)
    expect(payload[0].raw).toBeInstanceOf(File)
    expect(wrapper.find('ul.ui-upload__list').text()).toContain('a.txt')
  })

  it('beforeUpload 同步 false：不入列；同步 true：直接成功入列', async () => {
    const rejected = mountUpload({ beforeUpload: () => false })
    await choose(rejected, [txtFile()])
    expect(rejected.emitted('update:modelValue')).toBeUndefined()

    const accepted = mountUpload({ beforeUpload: () => true })
    await choose(accepted, [txtFile()])
    const payload = accepted.emitted('update:modelValue')?.[0]?.[0] as UploadFile[]
    expect(payload[0].status).toBe('success')
  })

  it('beforeUpload 返回 Promise（上传任务）：先以 uploading/0 入列，resolve 落定 success/100', async () => {
    let resolveTask!: (value: boolean | void) => void
    const { wrapper, files } = mountWithModel([], {
      beforeUpload: () => new Promise<boolean | void>((resolve) => (resolveTask = resolve)),
    })
    await choose(wrapper, [txtFile()])
    expect(files.value[0].status).toBe('uploading')
    expect(files.value[0].percent).toBe(0)
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)

    resolveTask(true)
    await flushPromises()
    expect(files.value[0].status).toBe('success')
    expect(files.value[0].percent).toBe(100)
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
  })

  it('beforeUpload Promise reject：落定 error 并发出 error，错误文案随条目渲染', async () => {
    let rejectTask!: (reason?: unknown) => void
    const { wrapper, files, errors } = mountWithModel([], {
      beforeUpload: () => new Promise<boolean | void>((_, reject) => (rejectTask = reject)),
    })
    await choose(wrapper, [txtFile()])
    rejectTask(new Error('网络中断'))
    await flushPromises()

    expect(files.value[0].status).toBe('error')
    expect(errors).toHaveLength(1)
    expect((errors[0][0] as Error).message).toBe('网络中断')
    expect(errors[0][1].name).toBe('a.txt')
    expect(wrapper.find('.ui-upload__error-text').text()).toBe('网络中断')
    expect(wrapper.find('button.ui-upload__retry').exists()).toBe(true)
  })

  it('失败重试：重试按钮把条目重置为 uploading 并重跑 beforeUpload，二次成功落定', async () => {
    let resolveRetry!: (value: boolean | void) => void
    const before = vi
      .fn<() => Promise<boolean | void>>()
      .mockImplementationOnce(() => Promise.reject(new Error('第一次失败')))
      .mockImplementationOnce(() => new Promise<boolean | void>((resolve) => (resolveRetry = resolve)))
    const { wrapper, files } = mountWithModel([], { beforeUpload: before })
    await choose(wrapper, [txtFile()])
    await flushPromises()
    expect(files.value[0].status).toBe('error')

    await wrapper.find('button.ui-upload__retry').trigger('click')
    expect(files.value[0].status).toBe('uploading')
    expect(before).toHaveBeenCalledTimes(2)

    resolveRetry(true)
    await flushPromises()
    expect(files.value[0].status).toBe('success')
    expect(wrapper.find('button.ui-upload__retry').exists()).toBe(false)
  })

  it('maxCount：超出上限整批拒绝并发出 exceed，列表保持不变', async () => {
    const preset = [presetFile('已占位.txt')]
    const wrapper = mountUpload({ multiple: true, maxCount: 2, modelValue: preset })
    await choose(wrapper, [txtFile('b.txt'), txtFile('c.txt')])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('exceed')).toHaveLength(1)
    const [files, fileList] = wrapper.emitted('exceed')![0] as [File[], UploadFile[]]
    expect(files.map((f) => f.name)).toEqual(['b.txt', 'c.txt'])
    expect(fileList).toEqual(preset)
  })

  it('accept：点击选择路径按规则过滤（.ext 后缀 / type/* 通配）', async () => {
    const byExt = mountUpload({ accept: '.png' })
    await choose(byExt, [txtFile()])
    expect(byExt.emitted('update:modelValue')).toBeUndefined()
    await choose(byExt, [pngFile()])
    expect(byExt.emitted('update:modelValue')).toHaveLength(1)

    const byType = mountUpload({ accept: 'image/*' })
    await choose(byType, [txtFile(), pngFile()])
    const payload = byType.emitted('update:modelValue')?.[0]?.[0] as UploadFile[]
    expect(payload.map((f) => f.name)).toEqual(['a.png'])
  })

  it('multiple=false：一次选择只取第一个文件', async () => {
    const wrapper = mountUpload({ multiple: false })
    await choose(wrapper, [txtFile('first.txt'), txtFile('second.txt')])
    const payload = wrapper.emitted('update:modelValue')?.[0]?.[0] as UploadFile[]
    expect(payload.map((f) => f.name)).toEqual(['first.txt'])
  })

  it('移除：点击移除按钮发出 remove 与全量更新，父状态同步清空', async () => {
    const wrapper = mountUpload({ modelValue: [presetFile('a.txt'), presetFile('b.txt')] })
    await wrapper.findAll('button.ui-upload__remove')[0].trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
    expect((wrapper.emitted('remove')![0][0] as UploadFile).name).toBe('a.txt')
    await syncModel(wrapper)
    const payload = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as UploadFile[]
    expect(payload.map((f) => f.name)).toEqual(['b.txt'])
    expect(wrapper.findAll('li.ui-upload__item')).toHaveLength(1)
  })

  it('拖拽选择：drag 模式下 drop 入列；悬停态随 dragover/dragleave 切换', async () => {
    const wrapper = mountUpload({ drag: true })
    const trigger = wrapper.find('button.ui-upload__trigger')
    await trigger.trigger('dragover')
    expect(wrapper.classes()).toContain('ui-upload--dragover')
    await trigger.trigger('dragleave')
    expect(wrapper.classes()).not.toContain('ui-upload--dragover')

    await trigger.trigger('drop', { dataTransfer: { files: [txtFile()] } })
    await syncModel(wrapper)
    const payload = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as UploadFile[]
    expect(payload.map((f) => f.name)).toEqual(['a.txt'])
    expect(wrapper.classes()).not.toContain('ui-upload--dragover')
  })

  it('拖放区扩展到整个根容器：dragover/dragleave 在容器（非仅按钮）驱动高亮，drop 在列表区同样入列', async () => {
    const wrapper = mountUpload({ drag: true, modelValue: [presetFile('已传.txt')] })
    // 落点为根容器本身（非触发器按钮）：高亮反馈一致
    await wrapper.find('.ui-upload').trigger('dragover')
    expect(wrapper.classes()).toContain('ui-upload--dragover')
    await wrapper.find('.ui-upload').trigger('dragleave')
    expect(wrapper.classes()).not.toContain('ui-upload--dragover')

    // 落点为列表区（按钮之外的触发区）：drop 走同一文件流与校验路径
    await wrapper.find('.ui-upload').trigger('dragover')
    await wrapper.find('ul.ui-upload__list').trigger('drop', { dataTransfer: { files: [txtFile('新拖入.txt')] } })
    await syncModel(wrapper)
    expect(wrapper.emitted('change')).toHaveLength(1)
    const payload = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as UploadFile[]
    expect(payload.map((f) => f.name)).toEqual(['已传.txt', '新拖入.txt'])
    expect(wrapper.classes()).not.toContain('ui-upload--dragover')
  })

  it('非 drag 模式与 disabled：容器 dragover 不高亮、容器 drop 不入列', async () => {
    const plain = mountUpload()
    await plain.find('.ui-upload').trigger('dragover')
    expect(plain.classes()).not.toContain('ui-upload--dragover')
    await plain.find('.ui-upload').trigger('drop', { dataTransfer: { files: [txtFile()] } })
    expect(plain.emitted('update:modelValue')).toBeUndefined()

    const disabled = mountUpload({ drag: true, disabled: true })
    await disabled.find('.ui-upload').trigger('dragover')
    expect(disabled.classes()).not.toContain('ui-upload--dragover')
    await disabled.find('.ui-upload').trigger('drop', { dataTransfer: { files: [txtFile()] } })
    expect(disabled.emitted('update:modelValue')).toBeUndefined()
  })

  it('disabled：点击不唤起文件选择、拖拽与移除全部拦截', async () => {
    const wrapper = mountUpload({
      disabled: true,
      drag: true,
      modelValue: [presetFile('a.txt')],
    })
    const spy = vi.spyOn(wrapper.find('input').element, 'click').mockImplementation(() => {})
    await wrapper.find('button.ui-upload__trigger').trigger('click')
    expect(spy).not.toHaveBeenCalled()

    await wrapper.find('button.ui-upload__trigger').trigger('drop', {
      dataTransfer: { files: [txtFile()] },
    })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.find('button.ui-upload__remove').trigger('click')
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('受控进度推进：外部回写 percent 后进度条 aria-valuenow 与宽度同步', async () => {
    const wrapper = mountUpload({
      modelValue: [presetFile('a.zip', { status: 'uploading', percent: 20 })],
    })
    const progress = wrapper.find('[role="progressbar"]')
    expect(progress.attributes('aria-valuenow')).toBe('20')
    await wrapper.setProps({
      modelValue: [presetFile('a.zip', { status: 'uploading', percent: 80 })],
    })
    expect(wrapper.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('80')
    expect(wrapper.find('.ui-upload__progress-bar').attributes('style')).toContain('width: 80%')
  })
})
