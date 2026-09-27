// behavior spec：增量上屏节拍 / 完成定格 / complete 派发 / content 重置 / 定时器清理。
// 注意：happy-dom + @vue/test-utils 下每个文件首次 mount 会残留一个一次性环境基线
// 定时器（非组件创建、卸载不清），因此定时器数量断言一律用「相对基线」表达。
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import {
  STREAMING_TEXT_REVEAL_CATCHUP_TICKS,
  STREAMING_TEXT_REVEAL_TICK_MS,
} from './StreamingText.constants'
import StreamingText from './StreamingText.vue'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

async function flushDom(): Promise<void> {
  await nextTick()
}

describe('StreamingText behavior', () => {
  it('挂载时已有内容视为已上屏（增量语义）：streaming=true 也不回放', async () => {
    const wrapper = mount(StreamingText, { props: { content: '已在屏上的文本', streaming: true } })
    expect(wrapper.text()).toBe('已在屏上的文本')
    // 推进远超任何节拍的时间窗：输出不变（不回放、无节拍器改动文本）
    vi.advanceTimersByTime(STREAMING_TEXT_REVEAL_TICK_MS * 100)
    await flushDom()
    expect(wrapper.text()).toBe('已在屏上的文本')
  })

  it('streaming 中 content 增量：新增字符按节拍逐步上屏，追平后节拍器自停', async () => {
    const wrapper = mount(StreamingText, { props: { content: 'ABCD', streaming: true } })
    const baselineTimers = vi.getTimerCount()
    expect(wrapper.text()).toBe('ABCD')

    await wrapper.setProps({ content: 'ABCDEFGH' })
    // watcher 已收口，但节拍未推进：新 token 尚未上屏；节拍器在跑（+1）
    expect(wrapper.text()).toBe('ABCD')
    expect(vi.getTimerCount()).toBe(baselineTimers + 1)

    vi.advanceTimersByTime(STREAMING_TEXT_REVEAL_TICK_MS)
    await flushDom()
    expect(wrapper.text()).toBe('ABCDEF')

    vi.advanceTimersByTime(STREAMING_TEXT_REVEAL_TICK_MS)
    await flushDom()
    expect(wrapper.text()).toBe('ABCDEFGH')
    expect(vi.getTimerCount()).toBe(baselineTimers)
  })

  it('大段增量按追平节奏均摊，CATCHUP_TICKS 拍内追平', async () => {
    const big = 'x'.repeat(600)
    const wrapper = mount(StreamingText, { props: { content: '', streaming: true } })
    const baselineTimers = vi.getTimerCount()

    await wrapper.setProps({ content: big })
    vi.advanceTimersByTime(STREAMING_TEXT_REVEAL_TICK_MS * STREAMING_TEXT_REVEAL_CATCHUP_TICKS)
    await flushDom()
    expect(wrapper.text()).toBe(big)
    expect(vi.getTimerCount()).toBe(baselineTimers)
  })

  it('streaming true→false：未上屏余量立即定格、光标移除、complete 恰好一次', async () => {
    const wrapper = mount(StreamingText, { props: { content: 'ABCD', streaming: true } })
    const baselineTimers = vi.getTimerCount()

    await wrapper.setProps({ content: 'ABCDEFGH' })
    // 未追平时提前结束
    await wrapper.setProps({ streaming: false })

    expect(wrapper.text()).toBe('ABCDEFGH')
    expect(wrapper.classes()).toContain('ui-streaming-text--done')
    expect(wrapper.find('.ui-streaming-text__cursor').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBe('false')
    expect(wrapper.emitted('complete')).toHaveLength(1)
    expect(vi.getTimerCount()).toBe(baselineTimers)

    // 定格后（非流式）更新 content：直接定格展示，不再派发 complete
    await wrapper.setProps({ content: '新的一轮' })
    expect(wrapper.text()).toBe('新的一轮')
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('streaming false→true 不派发 complete', async () => {
    const wrapper = mount(StreamingText, { props: { content: '文本' } })
    await wrapper.setProps({ streaming: true })
    expect(wrapper.emitted('complete')).toBeUndefined()
    await wrapper.setProps({ streaming: false })
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('流式中 content 长度回落视为新一轮重置：从零按节拍重新上屏', async () => {
    const wrapper = mount(StreamingText, { props: { content: '第一轮完整回复', streaming: true } })
    expect(wrapper.text()).toBe('第一轮完整回复')

    await wrapper.setProps({ content: '第二轮' })
    // 旧进度清零：重置瞬间无文本，随后按节拍上屏
    expect(wrapper.text()).toBe('')

    vi.advanceTimersByTime(STREAMING_TEXT_REVEAL_TICK_MS)
    await flushDom()
    expect(wrapper.text()).toBe('第二')

    vi.advanceTimersByTime(STREAMING_TEXT_REVEAL_TICK_MS)
    await flushDom()
    expect(wrapper.text()).toBe('第二轮')
  })

  it('非流式（定格态）下 content 整体替换：直接定格为新全文', async () => {
    const wrapper = mount(StreamingText, { props: { content: '旧文本' } })
    await wrapper.setProps({ content: '替换后的新文本' })
    expect(wrapper.text()).toBe('替换后的新文本')
  })

  it('卸载清理节拍器：组件自身的定时器随卸载移除', async () => {
    const wrapper = mount(StreamingText, { props: { content: 'AB', streaming: true } })
    await wrapper.setProps({ content: 'ABCD' })
    const timersWithLoop = vi.getTimerCount()
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(timersWithLoop - 1)
  })
})
