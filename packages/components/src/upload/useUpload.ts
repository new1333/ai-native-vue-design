/**
 * useUpload —— Upload 的选择闸门与上传生命周期 composable（headless）。
 *
 * 收口全部纯逻辑，不含 DOM / 浏览器 API（FileList / DataTransfer 的解包
 * 在 SFC 事件回调内完成后才进入这里；File 实例只从事件回调传入）：
 *   1. 选择闸门：accept 匹配过滤 → multiple 截取 → maxCount 整批上限（emit exceed）；
 *   2. beforeUpload 三态：false 不入列；true/void 直接 success；Promise 即上传任务
 *      （先以 uploading/0 入列，resolve 非 false 落定 success，reject 落定 error）；
 *   3. 受控契约：一切列表变化经 onListChange 以全量新列表发出；同批次多文件
 *      追加使用本地工作列表续算（规避受控回写时差），落定/移除读取最新受控值后映射；
 *   4. 失败重试：error 项重置为 uploading 后重跑 beforeUpload（无 beforeUpload
 *      或条目无 raw 时仅重置状态，由使用方驱动后续落定）。
 *
 * SSR 安全：模块顶层与函数体不访问 window / document / File 构造器；
 * 本 composable 只在客户端事件回调路径上执行。
 */
import { computed, ref, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { UPLOAD_UID_PREFIX } from './Upload.constants'
import type { UploadBeforeUpload, UploadFile, UploadStatus } from './Upload.types'

/** uid 自增种子（进程内唯一即可）。 */
let uidSeed = 0

/** 生成下一个列表项 uid。 */
export function nextUploadUid(): string {
  uidSeed += 1
  return `${UPLOAD_UID_PREFIX}-${uidSeed}`
}

/** useUpload 选项（响应式来源 + 事件出口；组件把 emit 挂到回调上）。 */
export interface UseUploadOptions {
  /** 受控文件列表来源（响应式）。 */
  modelValue: MaybeRefOrGetter<UploadFile[]>
  /** accept 规则来源（响应式；空/缺省视为不限制）。 */
  accept?: MaybeRefOrGetter<string | undefined>
  /** 多选来源（响应式）。 */
  multiple?: MaybeRefOrGetter<boolean | undefined>
  /** 数量上限来源（响应式；缺省不设上限）。 */
  maxCount?: MaybeRefOrGetter<number | undefined>
  /** 禁用总闸来源（响应式）：选择/拖拽/移除/重试路径据此拦截。 */
  disabled?: MaybeRefOrGetter<boolean | undefined>
  /** 上传闸门 / 上传任务来源（响应式）。 */
  beforeUpload?: MaybeRefOrGetter<UploadBeforeUpload | undefined>
  /** 列表落定出口：update:modelValue 与 change 都从这里走。 */
  onListChange?: (files: UploadFile[]) => void
  /** 列表项被移除后的通知出口。 */
  onRemove?: (file: UploadFile) => void
  /** 超出 maxCount 整批拒绝的出口。 */
  onExceed?: (files: File[], fileList: UploadFile[]) => void
  /** 上传任务失败（reject / 同步抛出）的出口。 */
  onError?: (error: unknown, file: UploadFile) => void
}

/** useUpload 返回值。 */
export interface UseUploadReturn {
  /** 当前列表（受控值的只读视图）。 */
  files: ComputedRef<UploadFile[]>
  /** 拖拽悬停态（拖放区高亮用；由 SFC 的 dragover/dragleave/drop 回调驱动）。 */
  dragover: Ref<boolean>
  /** 选择入口：accept 过滤 → multiple 截取 → maxCount 上限 → 逐个准入。 */
  chooseFiles: (files: File[]) => Promise<void>
  /** 移除一个列表项（emit remove + 全量列表更新）。 */
  removeFile: (file: UploadFile) => void
  /** 重试一个 error 项：重置为 uploading 后重跑 beforeUpload。 */
  retryFile: (file: UploadFile) => Promise<void>
}

/** PromiseLike 判定（不依赖浏览器 API）。 */
function isPromiseLike(value: unknown): value is PromiseLike<boolean | void> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

/** 未知异常转可读文案。 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/** 把 percent 钳制到 [0, 100]；非有限数回退 0。 */
export function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0
  return Math.min(100, Math.max(0, percent))
}

/**
 * accept 规则匹配：逗号分隔 token，大小写不敏感；支持
 * `.ext` 后缀、`type/*` 通配、`type/subtype` 精确、裸类型名（`audio` 等价 `audio/*`）。
 */
export function matchAccept(file: File, accept: string): boolean {
  const tokens = accept.split(',').map((token) => token.trim().toLowerCase()).filter(Boolean)
  if (tokens.length === 0) return true
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    if (token.includes('/')) return type === token
    return type.startsWith(`${token}/`)
  })
}

/** 字节数转可读尺寸（B / KB / MB / GB；非法输入返回空串；一位小数并去尾零）。 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  const trim = (value: number): string => String(Number(value.toFixed(1)))
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${trim(kb)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${trim(mb)} MB`
  return `${trim(mb / 1024)} GB`
}

/** Upload 选择闸门与上传生命周期（纯逻辑，无 DOM）。 */
export function useUpload(options: UseUploadOptions): UseUploadReturn {
  const files = computed<UploadFile[]>(() => toValue(options.modelValue) ?? [])
  const dragover = ref(false)

  function isDisabled(): boolean {
    return toValue(options.disabled) === true
  }

  /** 在工作列表尾部追加一项并发出；返回新列表供同批次后续文件续算。 */
  function append(working: UploadFile[], item: UploadFile): UploadFile[] {
    const next = [...working, item]
    options.onListChange?.(next)
    return next
  }

  /** 依据最新受控值映射出新列表并发出；uid 不存在（已被外部移除）时不动作。 */
  function patch(uid: string, changes: Partial<Omit<UploadFile, 'uid'>>): void {
    const current = files.value
    let touched = false
    const next = current.map((item) => {
      if (item.uid !== uid) return item
      touched = true
      return { ...item, ...changes }
    })
    if (touched) options.onListChange?.(next)
  }

  function findByUid(uid: string): UploadFile | undefined {
    return files.value.find((item) => item.uid === uid)
  }

  /** 从最新受控列表移除一项并发出。 */
  function drop(uid: string): void {
    const current = files.value
    const next = current.filter((item) => item.uid !== uid)
    if (next.length !== current.length) options.onListChange?.(next)
  }

  /** 构造列表项（raw 必带，失败重试依赖它重跑上传任务）。 */
  function toItem(file: File, status: UploadStatus, percent: number, error?: string): UploadFile {
    const item: UploadFile = {
      uid: nextUploadUid(),
      name: file.name,
      status,
      percent,
      raw: file,
    }
    if (Number.isFinite(file.size) && file.size >= 0) item.size = file.size
    if (error !== undefined) item.error = error
    return item
  }

  /** 上传任务（Promise 形态 beforeUpload）的落定处理。 */
  async function settleTask(uid: string, task: PromiseLike<boolean | void>): Promise<void> {
    try {
      const resolved = await task
      if (resolved === false) {
        drop(uid) // 异步闸门未通过：移除 uploading 占位，不算失败
        return
      }
      patch(uid, { status: 'success', percent: 100 })
    } catch (error) {
      patch(uid, { status: 'error', error: toErrorMessage(error) })
      const failed = findByUid(uid)
      if (failed) options.onError?.(error, failed)
    }
  }

  /** 单文件准入：beforeUpload 三态分流（拒绝 / 异步任务 / 直接成功）。 */
  async function admit(file: File, batch: File[], working: UploadFile[]): Promise<UploadFile[]> {
    const before = toValue(options.beforeUpload)
    if (!before) {
      return append(working, toItem(file, 'success', 100))
    }
    let outcome: boolean | void | PromiseLike<boolean | void>
    try {
      outcome = before(file, batch)
    } catch (error) {
      // 闸门同步抛出：以 error 入列（可重试），并发出 error
      const item = toItem(file, 'error', 0, toErrorMessage(error))
      const next = append(working, item)
      options.onError?.(error, item)
      return next
    }
    if (isPromiseLike(outcome)) {
      const item = toItem(file, 'uploading', 0)
      const next = append(working, item)
      await settleTask(item.uid, outcome)
      // 任务落定后回到最新受控列表；条目被外部移除时返回剔除占位的工作列表
      return findByUid(item.uid) ? files.value : next.filter((entry) => entry.uid !== item.uid)
    }
    if (outcome === false) return working
    return append(working, toItem(file, 'success', 100))
  }

  async function chooseFiles(incoming: File[]): Promise<void> {
    if (isDisabled() || incoming.length === 0) return
    const accept = toValue(options.accept)
    const matched = accept ? incoming.filter((file) => matchAccept(file, accept)) : [...incoming]
    const chosen = toValue(options.multiple) === true ? matched : matched.slice(0, 1)
    if (chosen.length === 0) return
    const current = files.value
    const maxCount = toValue(options.maxCount)
    const room =
      maxCount == null ? Number.POSITIVE_INFINITY : Math.max(0, maxCount - current.length)
    if (chosen.length > room) {
      options.onExceed?.(chosen, current)
      return
    }
    let working = current
    for (const file of chosen) {
      working = await admit(file, chosen, working)
    }
  }

  function removeFile(file: UploadFile): void {
    if (isDisabled()) return
    const current = files.value
    const next = current.filter((item) => item.uid !== file.uid)
    if (next.length === current.length) return
    options.onRemove?.(file)
    options.onListChange?.(next)
  }

  async function retryFile(file: UploadFile): Promise<void> {
    if (file.status !== 'error' || isDisabled()) return
    patch(file.uid, { status: 'uploading', percent: 0, error: undefined })
    const before = toValue(options.beforeUpload)
    if (!before || !file.raw) return
    const raws = files.value
      .map((item) => item.raw)
      .filter((raw): raw is File => raw != null)
    let outcome: boolean | void | PromiseLike<boolean | void>
    try {
      outcome = before(file.raw, raws)
    } catch (error) {
      patch(file.uid, { status: 'error', error: toErrorMessage(error) })
      const failed = findByUid(file.uid)
      if (failed) options.onError?.(error, failed)
      return
    }
    if (isPromiseLike(outcome)) {
      await settleTask(file.uid, outcome)
      return
    }
    if (outcome === false) {
      patch(file.uid, { status: 'error' })
      return
    }
    patch(file.uid, { status: 'success', percent: 100 })
  }

  return { files, dragover, chooseFiles, removeFile, retryFile }
}
