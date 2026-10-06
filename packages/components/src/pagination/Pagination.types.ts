/**
 * pagination/ —— Pagination 的公共类型（Props / Emits / Slots / Item）。
 * 与 Pagination.meta.ts 的 api 字段保持一致。
 */

/** 页码项（渲染为可聚焦的页码按钮）。 */
export interface PaginationPageItem {
  type: 'page'
  /** 页码（1 起始）。 */
  page: number
}

/** 省略号占位项（非聚焦、不可交互，渲染为 aria-hidden 的占位元素）。 */
export interface PaginationEllipsisItem {
  type: 'ellipsis'
}

/** 分页渲染项：页码或省略号占位（usePagination.resolvePaginationItems 的产物）。 */
export type PaginationItem = PaginationPageItem | PaginationEllipsisItem

/** Pagination 的 Props。 */
export interface PaginationProps {
  /** 当前页（1 起始，v-model:page）；超出 [1, pageCount] 时展示层收敛（clamp）后渲染，并回发一次收敛后的 update:page（同值不重发）。 */
  page?: number
  /** 数据总条数；与 pageSize 共同推导总页数。 */
  total?: number
  /** 每页条数，默认 10（≤0 时按 1 处理，避免除零）。 */
  pageSize?: number
  /** 当前页两侧保留的页码数，默认 1；总页数 ≤ siblingCount*2+5（默认 7）时全量展示。 */
  siblingCount?: number
}

/** Pagination 的 Emits（Vue 3.3+ 元组语法：事件名 → 载荷元组）。 */
export interface PaginationEmits {
  /** v-model:page 更新：点击页码 / 上一页 / 下一页后发出目标页码（已收敛进 [1, pageCount]）；传入 page 越界时也发出一次收敛后的页码（同值不重发）。 */
  'update:page': [page: number]
}

/** Pagination 的 Slots（当前为空：无内容插槽，显式声明以固化契约面）。 */
export interface PaginationSlots {}
