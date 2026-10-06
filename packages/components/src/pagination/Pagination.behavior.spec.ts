// behavior spec：窗口计算（全显阈值 / 窗口滑移 / 省略号折叠）与边界交互（首尾禁用、网关去重、受控回写）。
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import Pagination from './Pagination.vue'

/** 页码文本序列。 */
function pageLabels(wrapper: VueWrapper): string[] {
  return wrapper.findAll('button.ui-pagination__page').map((button) => button.text())
}

/** 省略号数量。 */
function ellipsisCount(wrapper: VueWrapper): number {
  return wrapper.findAll('.ui-pagination__ellipsis').length
}

/** 上一页 / 下一页按钮。 */
function navButtons(wrapper: VueWrapper) {
  return wrapper.findAll('button.ui-pagination__nav')
}

/** 当前页（aria-current="page"）按钮文本。 */
function currentPageLabel(wrapper: VueWrapper): string {
  const current = wrapper.find('button[aria-current="page"]')
  expect(current.exists()).toBe(true)
  return current.text()
}

describe('Pagination behavior - 窗口计算', () => {
  it('总页数 ≤7 全显：total=70 → 1..7，无省略号', () => {
    const wrapper = mount(Pagination, { props: { total: 70, page: 4 } })
    expect(pageLabels(wrapper)).toEqual(['1', '2', '3', '4', '5', '6', '7'])
    expect(ellipsisCount(wrapper)).toBe(0)
  })

  it('总页数 7（阈值恰好）：全显；总页数 8 进入窗口模式', () => {
    const threshold = mount(Pagination, { props: { total: 70 } })
    expect(ellipsisCount(threshold)).toBe(0)
    const overThreshold = mount(Pagination, { props: { total: 80, page: 1 } })
    expect(pageLabels(overThreshold)).toEqual(['1', '2', '3', '8'])
    expect(ellipsisCount(overThreshold)).toBe(1)
  })

  it('窗口在首缘：page=1 → 窗口 1..3，不重复渲染首页，仅右省略号', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 1 } })
    expect(pageLabels(wrapper)).toEqual(['1', '2', '3', '10'])
    expect(ellipsisCount(wrapper)).toBe(1)
  })

  it('窗口贴近首页不折叠：page=3 → 首页与窗口连排（1 2 3 4），仅右省略号', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 3 } })
    expect(pageLabels(wrapper)).toEqual(['1', '2', '3', '4', '10'])
    expect(ellipsisCount(wrapper)).toBe(1)
  })

  it('窗口中段：page=5 → 首尾 + 双省略号夹窗口 4 5 6', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 5 } })
    expect(pageLabels(wrapper)).toEqual(['1', '4', '5', '6', '10'])
    expect(ellipsisCount(wrapper)).toBe(2)
  })

  it('窗口在尾缘：page=10 → 窗口 8 9 10 贴尾页，不重复渲染尾页，仅左省略号', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 10 } })
    expect(pageLabels(wrapper)).toEqual(['1', '8', '9', '10'])
    expect(ellipsisCount(wrapper)).toBe(1)
  })

  it('siblingCount=2：窗口宽 5；且总页数 9（=2*2+5 阈值）仍全显', () => {
    const windowed = mount(Pagination, { props: { total: 100, page: 5, siblingCount: 2 } })
    expect(pageLabels(windowed)).toEqual(['1', '3', '4', '5', '6', '7', '10'])
    const threshold = mount(Pagination, { props: { total: 90, page: 5, siblingCount: 2 } })
    expect(pageLabels(threshold)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
    expect(ellipsisCount(threshold)).toBe(0)
  })

  it('siblingCount 响应式：1 → 2 时窗口实时变宽', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 5 } })
    expect(pageLabels(wrapper)).toEqual(['1', '4', '5', '6', '10'])
    await wrapper.setProps({ siblingCount: 2 })
    expect(pageLabels(wrapper)).toEqual(['1', '3', '4', '5', '6', '7', '10'])
  })

  it('pageSize 响应式：变大时总页数收缩并可回到全显', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 10, pageSize: 10 } })
    expect(pageLabels(wrapper)).toEqual(['1', '8', '9', '10'])
    await wrapper.setProps({ pageSize: 50 })
    expect(pageLabels(wrapper)).toEqual(['1', '2'])
  })

  it('pageSize ≤0 防御：按每页 1 条推导，不产生除零/NaN', () => {
    const wrapper = mount(Pagination, { props: { total: 30, page: 1, pageSize: 0 } })
    expect(pageLabels(wrapper)).toEqual(['1', '2', '3', '30'])
    expect(ellipsisCount(wrapper)).toBe(1)
  })
})

describe('Pagination behavior - 边界交互', () => {
  it('page=1：上一页原生 disabled，点击不发出 update:page', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 1 } })
    const prev = navButtons(wrapper)[0]
    expect(prev?.attributes('disabled')).toBeDefined()
    await prev?.trigger('click')
    expect(wrapper.emitted('update:page')).toBeUndefined()
  })

  it('page>1：点击上一页发出 page-1', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 2 } })
    await navButtons(wrapper)[0]?.trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[1]])
  })

  it('page=pageCount：下一页原生 disabled，点击不发出 update:page', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 10 } })
    const next = navButtons(wrapper)[1]
    expect(next?.attributes('disabled')).toBeDefined()
    await next?.trigger('click')
    expect(wrapper.emitted('update:page')).toBeUndefined()
  })

  it('page<pageCount：点击下一页发出 page+1', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 9 } })
    await navButtons(wrapper)[1]?.trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[10]])
  })

  it('点击当前页：网关去重，不发出 update:page', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 5 } })
    await wrapper.find('button[aria-current="page"]').trigger('click')
    expect(wrapper.emitted('update:page')).toBeUndefined()
  })

  it('v-model:page 受控循环：点击 → 父状态更新 → aria-current 跟随', async () => {
    const page = ref(1)
    const Host = defineComponent({
      setup: () => () =>
        h(Pagination, {
          total: 100,
          page: page.value,
          'onUpdate:page': (value: number) => {
            page.value = value
          },
        }),
    })
    const wrapper = mount(Host)
    await wrapper.findAll('button.ui-pagination__page')[1]?.trigger('click')
    expect(page.value).toBe(2)
    await nextTick()
    expect(currentPageLabel(wrapper)).toBe('2')
    // 上一页/下一页经同一条受控回路
    await navButtons(wrapper)[1]?.trigger('click')
    expect(page.value).toBe(3)
    await nextTick()
    expect(currentPageLabel(wrapper)).toBe('3')
  })

  it('page 越界收敛：page=99 渲染为末页 aria-current；total 变小后跟随收缩', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 99 } })
    expect(currentPageLabel(wrapper)).toBe('10')
    expect(navButtons(wrapper)[1]?.attributes('disabled')).toBeDefined()
    await wrapper.setProps({ total: 50 })
    expect(currentPageLabel(wrapper)).toBe('5')
    expect(navButtons(wrapper)[1]?.attributes('disabled')).toBeDefined()
    expect(navButtons(wrapper)[0]?.attributes('disabled')).toBeUndefined()
  })

  it('越界受控页码回发：page=100 共 5 页 → 挂载即发出一次 update:page=5；同值重渲染不重发', async () => {
    const wrapper = mount(Pagination, { props: { total: 50, page: 100 } })
    expect(wrapper.emitted('update:page')).toEqual([[5]])
    // 同值再渲染（父层未回写）：不重复回发
    await wrapper.setProps({ page: 100 })
    expect(wrapper.emitted('update:page')).toHaveLength(1)
    await wrapper.setProps({ siblingCount: 2 })
    expect(wrapper.emitted('update:page')).toHaveLength(1)
    // 父层回写收敛值后（回到界内）：仍不重发
    await wrapper.setProps({ page: 5 })
    expect(wrapper.emitted('update:page')).toHaveLength(1)
  })

  it('越界回发防死循环：v-model:page 父状态 page=100 → 挂载即收敛为 5 且只回发一次', async () => {
    const page = ref(100)
    const emits: number[] = []
    const Host = defineComponent({
      setup: () => () =>
        h(Pagination, {
          total: 50,
          page: page.value,
          'onUpdate:page': (value: number) => {
            emits.push(value)
            page.value = value
          },
        }),
    })
    const wrapper = mount(Host)
    expect(page.value).toBe(5)
    expect(emits).toEqual([5])
    await nextTick()
    expect(currentPageLabel(wrapper)).toBe('5')
    // 收敛后受控回路恢复正常：上一页可用并可继续翻页（收敛页=末页，下一页 disabled 属预期）
    expect(navButtons(wrapper)[1]?.attributes('disabled')).toBeDefined()
    expect(navButtons(wrapper)[0]?.attributes('disabled')).toBeUndefined()
    await navButtons(wrapper)[0]?.trigger('click')
    expect(emits).toEqual([5, 4])
  })
})
