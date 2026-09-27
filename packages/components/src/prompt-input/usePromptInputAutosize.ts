/**
 * usePromptInputAutosize —— PromptInput 输入区高度自适应 composable：
 * 受控值变化时把 textarea 高度写回实际内容高度（scrollHeight），
 * 配合 max-height（token 推导的行数上限，SSR 即可输出）实现
 * 「随内容长高、封顶后内部滚动」。
 *
 * SSR/门禁纪律（CONVENTIONS §5）：浏览器 API（scrollHeight 读取、style 写入）
 * 只出现在 autosize 内，autosize 只被 onMounted（及其注册的 watch 回调）调用；
 * watcher 推迟到 mounted 阶段注册，onBeforeUnmount 停止，SSR 渲染不执行任何测量。
 */
import { onBeforeUnmount, onMounted, watch } from 'vue'
import type { Ref, WatchSource } from 'vue'

/** usePromptInputAutosize 选项。 */
export interface UsePromptInputAutosizeOptions {
  /** 原生 textarea 元素引用。 */
  control: Ref<HTMLTextAreaElement | null>
  /** 触发重新测量的响应源（受控值 modelValue）。 */
  source: WatchSource<unknown>
}

export function usePromptInputAutosize(options: UsePromptInputAutosizeOptions): void {
  const { control, source } = options
  let stopWatch: (() => void) | null = null

  /**
   * 测量并写回内容高度：先置 auto 让高度回到内容自然高度，再按 scrollHeight 写回。
   * max-height（行数上限）由样式层钳制，超出后 overflow-y: auto 内部滚动。
   * 无布局引擎（happy-dom / SSR）时 scrollHeight 为 0：跳过写回，保持 auto 不塌陷。
   */
  function autosize(): void {
    const el = control.value
    if (!el) return
    el.style.height = 'auto'
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight}px`
  }

  // 测量属于 DOM 副作用：推迟到 mounted 阶段注册（SSR 不执行），卸载时停止。
  onMounted(() => {
    autosize()
    stopWatch = watch(source, () => autosize(), { flush: 'post' })
  })

  onBeforeUnmount(() => {
    stopWatch?.()
    stopWatch = null
  })
}
