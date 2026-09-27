---
title: MessageList 消息列表
---

<script setup>
import { messageListMeta } from '@ui/components'
import Basic from '@docs-demos/message-list/Basic.vue'
import basicSrc from '@docs-demos/message-list/Basic.vue?raw'
import AutoScrollFollow from '@docs-demos/message-list/AutoScrollFollow.vue'
import autoScrollFollowSrc from '@docs-demos/message-list/AutoScrollFollow.vue?raw'
import SlotDistribution from '@docs-demos/message-list/SlotDistribution.vue'
import slotDistributionSrc from '@docs-demos/message-list/SlotDistribution.vue?raw'
import LoadMore from '@docs-demos/message-list/LoadMore.vue'
import loadMoreSrc from '@docs-demos/message-list/LoadMore.vue?raw'
</script>

# MessageList 消息列表

<ComponentDoc :meta="messageListMeta" dir="message-list">
  <Demo
    title="基础用法"
    anchor="basic"
    description="messages + messageKey + 默认插槽（scope { message, index }）三要素；滚动视口高度由使用方给定，气泡视觉完全在插槽内组合。role=&quot;log&quot; 让读屏器对新消息礼貌播报。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="贴底自动滚动"
    anchor="auto-scroll"
    description="autoScroll 只在贴底时跟随：上翻阅读时新消息不打扰（@near-bottom 播报贴底状态），回到贴底后恢复跟随；autoScroll 可受控切换，expose 的 scrollToBottom() 承载「回到底部」。"
    :src="autoScrollFollowSrc"
  >
    <AutoScrollFollow />
  </Demo>

  <Demo
    title="默认插槽分发与空态"
    anchor="slot-distribution"
    description="不传 messages 时内容由默认插槽直接分发；无默认插槽内容即落入空态——缺省渲染 EmptyState（「暂无消息」），也可用 #empty 自定义。"
    :src="slotDistributionSrc"
  >
    <SlotDistribution />
  </Demo>

  <Demo
    title="滚动到顶部加载历史"
    anchor="load-more"
    description="@load-more 为边沿触发（进入顶部区域发一次，离开后再次进入才会再发）；加载中去重由使用方负责，前插历史请配 messageKey 稳定键。"
    :src="loadMoreSrc"
  >
    <LoadMore />
  </Demo>
</ComponentDoc>
