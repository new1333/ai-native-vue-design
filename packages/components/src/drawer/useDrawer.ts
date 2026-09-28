/**
 * useDrawer —— Drawer 的浮层交互 composable：共享模态层（shared/useModalLayer）的薄适配层。
 *
 * 机制已收口于 shared/useModalLayer：body 滚动锁（跨实例计数）、焦点记录/移入/还原、
 * Tab 循环圈定、Esc 请求关闭、模态/非模态旁路。本文件只保留 Drawer 家族差异——
 * modal 开关语义（非模态旁路由共享层实现）与滚动锁 body class、面板可聚焦元素选择器
 * （常量来自 Drawer.constants）。
 *
 * 与 Dialog 的差异：按 modal() 区分模态/非模态——
 *   模态：遮罩关闭路径由组件层承担，共享层负责滚动锁、焦点移入/圈定/还原；
 *   非模态：不抢焦点、不锁滚动、Tab 不圈定（页面保持可交互），仅保留 Esc 关闭路径。
 *
 * 有意的行为改进：滚动锁此前 dialog/drawer 各自为政（嵌套 dialog+drawer 无法互认计数），
 * 现由共享层统一计数；且共享层按实例记账，修复了「非模态 drawer deactivate 误减计数」的潜在缺陷。
 *
 * 注：DRAWER_ESCAPE_KEY / DRAWER_TAB_KEY 仍为公共契约常量（由 Drawer.constants 导出、
 * 目录 index.ts 公共导出不变），供使用方与文档引用；模态引擎内部键名（'Escape'/'Tab'）
 * 由共享层自持，本文件不再消费这两个键名常量。
 *
 * SSR 安全：模块顶层不访问任何浏览器 API；document 只出现在由共享层管理的、
 * 仅被客户端生命周期（onMounted/watch）与用户事件调用的函数内部。
 */
import { useModalLayer } from '../shared/useModalLayer'
import { DRAWER_BODY_SCROLL_LOCK_CLASS, DRAWER_FOCUSABLE_SELECTOR } from './Drawer.constants'

/** useDrawer 选项。 */
export interface UseDrawerOptions {
  /** 焦点圈定范围（面板元素 getter）。 */
  panel: () => HTMLElement | null
  /** 是否模态（getter）：非模态跳过滚动锁/焦点移入/Tab 圈定。 */
  modal: () => boolean
  /** Esc 请求关闭回调。 */
  onEscape: () => void
}

/** useDrawer 返回值。 */
export interface UseDrawerReturn {
  /** 打开：模态时锁定滚动、记录先前焦点，并在 DOM 就绪后将焦点移入面板；非模态仅置激活标记。 */
  activate: () => void
  /** 关闭：模态时解锁滚动并将焦点还原到打开前元素（幂等）。 */
  deactivate: () => void
  /** keydown 处理器（绑定浮层根）：Esc 请求关闭；模态下 Tab 在面板内循环圈定。 */
  onKeydown: (event: KeyboardEvent) => void
  /** 将焦点移入抽屉（首个可聚焦元素，否则面板自身）。 */
  focusDrawer: () => void
}

/** Drawer 浮层交互 composable（共享模态层的薄适配：透传 modal 开关）。 */
export function useDrawer(options: UseDrawerOptions): UseDrawerReturn {
  const layer = useModalLayer({
    panel: options.panel,
    onEscape: options.onEscape,
    modal: options.modal,
    scrollLockClass: DRAWER_BODY_SCROLL_LOCK_CLASS,
    focusableSelector: DRAWER_FOCUSABLE_SELECTOR,
  })
  return {
    activate: layer.activate,
    deactivate: layer.deactivate,
    onKeydown: layer.onKeydown,
    focusDrawer: layer.focusPanel,
  }
}
