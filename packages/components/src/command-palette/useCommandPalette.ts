/**
 * useCommandPalette —— CommandPalette 的搜索过滤与键盘漫游 composable：
 *
 *   1. 过滤：按 query 对命令 label 做不区分大小写的子串匹配；组内全部未命中的分组
 *      整体隐藏；输出带「跨分组全局扁平下标」的分组视图与扁平命令序列（option id、
 *      aria-activedescendant 与漫游共用同一套下标）；
 *   2. 漫游：激活项为扁平下标（-1 表示无激活项）；↓/↑ 环绕移动、Home/End 首尾，
 *      均跳过 disabled；hover 接管（setActive）同样不落 disabled 项，与键盘漫游一致；
 *      query 变化时自动回到首个启用命令；
 *   3. 选中：Enter（激活项）或点击 → onSelect；disabled 命令一律忽略。
 *
 * SSR 安全：纯状态与 computed，不访问任何浏览器 API。
 */
import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import {
  COMMAND_PALETTE_KEY_ARROW_DOWN,
  COMMAND_PALETTE_KEY_ARROW_UP,
  COMMAND_PALETTE_KEY_END,
  COMMAND_PALETTE_KEY_ENTER,
  COMMAND_PALETTE_KEY_HOME,
} from './CommandPalette.constants'
import type { CommandPaletteCommand, CommandPaletteGroup } from './CommandPalette.types'

/** 分组视图条目（过滤后）：items 携带跨分组全局扁平下标。 */
export interface CommandPaletteViewGroup {
  /** 分组标识（透传自 CommandPaletteGroup.key）。 */
  key: string
  /** 分组标题（透传自 CommandPaletteGroup.label）。 */
  label?: string
  /** 组内命中命令与其全局扁平下标。 */
  items: Array<{ command: CommandPaletteCommand; index: number }>
}

/** useCommandPalette 选项。 */
export interface UseCommandPaletteOptions {
  /** 分组命令数据 getter。 */
  groups: () => readonly CommandPaletteGroup[]
  /** 搜索关键词（双向绑定到搜索输入框）。 */
  query: Ref<string>
  /** 选中回调（仅在未禁用命令上调用）。 */
  onSelect: (command: CommandPaletteCommand) => void
}

/** useCommandPalette 返回值。 */
export interface UseCommandPaletteReturn {
  /** 过滤后的分组视图（空组整体隐藏）。 */
  view: ComputedRef<CommandPaletteViewGroup[]>
  /** 过滤后的扁平命令序列（跨分组按序，entry.index === 数组下标）。 */
  options: ComputedRef<Array<{ command: CommandPaletteCommand; index: number }>>
  /** 当前激活项扁平下标（-1 表示无激活项）。 */
  activeIndex: Ref<number>
  /** 把激活项重置到首个启用命令（无启用命令时为 -1）。 */
  resetToFirstEnabled: () => void
  /** 设置激活项下标（悬停高亮用）：disabled 或越界下标不生效，与键盘漫游一致跳过 disabled。 */
  setActive: (index: number) => void
  /** 选中一条命令：disabled 忽略，否则走 onSelect。 */
  selectCommand: (command: CommandPaletteCommand) => void
  /** 搜索输入框 keydown 处理器（↓/↑ 环绕、Home/End 首尾、Enter 选中激活项）。 */
  onInputKeydown: (event: KeyboardEvent) => void
}

/** CommandPalette 搜索过滤与键盘漫游 composable（仅在 setup 中调用）。 */
export function useCommandPalette(options: UseCommandPaletteOptions): UseCommandPaletteReturn {
  /** 激活项：扁平下标（-1 = 无）。焦点恒驻搜索输入框，本下标即 aria-activedescendant 指向。 */
  const activeIndex = ref(-1)

  /** 过滤视图：label 不区分大小写子串匹配；空关键词全匹配；空组隐藏。 */
  const view = computed<CommandPaletteViewGroup[]>(() => {
    const keyword = options.query.value.trim().toLowerCase()
    let index = 0
    const result: CommandPaletteViewGroup[] = []
    for (const group of options.groups()) {
      const items = group.items
        .filter(command => keyword === '' || command.label.toLowerCase().includes(keyword))
        .map(command => ({ command, index: index++ }))
      if (items.length === 0) continue
      result.push({ key: group.key, label: group.label, items })
    }
    return result
  })

  /** 扁平命令序列（跨分组按序；entry.index === 其数组下标）。 */
  const optionList = computed(() => view.value.flatMap(group => group.items))

  /** 启用命令的扁平下标集合（漫游候选序）。 */
  const enabledIndexes = computed(() =>
    optionList.value.filter(entry => !entry.command.disabled).map(entry => entry.index),
  )

  function resetToFirstEnabled(): void {
    activeIndex.value = enabledIndexes.value[0] ?? -1
  }

  /** 悬停接管激活项：disabled（aria-disabled）或越界下标一律不接管，避免 activedescendant 指向不可操作项。 */
  function setActive(index: number): void {
    const command = optionList.value[index]?.command
    if (!command || command.disabled) return
    activeIndex.value = index
  }

  /** 从当前激活项按方向环绕移动到下一个启用命令（跳过 disabled）。 */
  function stepEnabled(direction: 1 | -1): number {
    const enabled = enabledIndexes.value
    if (enabled.length === 0) return -1
    const current = enabled.indexOf(activeIndex.value)
    if (current === -1) return direction === 1 ? enabled[0] : enabled[enabled.length - 1]
    const next = (current + direction + enabled.length) % enabled.length
    return enabled[next]
  }

  function selectCommand(command: CommandPaletteCommand): void {
    if (command.disabled) return
    options.onSelect(command)
  }

  /** 选中当前激活命令（无激活项时不动作）。 */
  function selectActive(): void {
    const entry = optionList.value[activeIndex.value]
    if (entry) selectCommand(entry.command)
  }

  /** 搜索输入框 keydown：↓/↑ 环绕漫游、Home/End 首尾、Enter 选中（Esc 交由面板级处理）。 */
  function onInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case COMMAND_PALETTE_KEY_ARROW_DOWN:
        event.preventDefault()
        activeIndex.value = stepEnabled(1)
        break
      case COMMAND_PALETTE_KEY_ARROW_UP:
        event.preventDefault()
        activeIndex.value = stepEnabled(-1)
        break
      case COMMAND_PALETTE_KEY_HOME:
        event.preventDefault()
        resetToFirstEnabled()
        break
      case COMMAND_PALETTE_KEY_END: {
        event.preventDefault()
        const enabled = enabledIndexes.value
        activeIndex.value = enabled.length > 0 ? enabled[enabled.length - 1] : -1
        break
      }
      case COMMAND_PALETTE_KEY_ENTER:
        // 统一拦截原生激活（防表单内误提交），选中走唯一路径。
        event.preventDefault()
        selectActive()
        break
      default:
        break
    }
  }

  // query 变化（输入过滤）：激活项回到首个启用命令，避免指向已被过滤掉的项。
  watch(options.query, resetToFirstEnabled)

  return {
    view,
    options: optionList,
    activeIndex,
    resetToFirstEnabled,
    setActive,
    selectCommand,
    onInputKeydown,
  }
}
