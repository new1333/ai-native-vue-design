---
title: Message 消息气泡
---

<script setup>
import { messageMeta } from '@ui/components'
import Basic from '@docs-demos/message/Basic.vue'
import basicSrc from '@docs-demos/message/Basic.vue?raw'
import Streaming from '@docs-demos/message/Streaming.vue'
import streamingSrc from '@docs-demos/message/Streaming.vue?raw'
import Status from '@docs-demos/message/Status.vue'
import statusSrc from '@docs-demos/message/Status.vue?raw'
import Slots from '@docs-demos/message/Slots.vue'
import slotsSrc from '@docs-demos/message/Slots.vue?raw'
</script>

# Message 消息气泡

<ComponentDoc :meta="messageMeta" dir="message">
  <Demo
    title="基础用法"
    anchor="basic"
    description="role 决定布局与配皮：user 右对齐（accent-soft 气泡）、assistant 左对齐（surface 底 + 描边）、system 居中弱化（无气泡配皮）；name/timestamp 渲染在 meta 行，头像未传 src 时按 name 回退首字母、缺省回落角色称谓。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="流式生成"
    anchor="streaming"
    description="streaming=true 时内容尾部渲染流式光标（纯 CSS opacity 闪烁，prefers-reduced-motion 降级为静态），根元素置 aria-busy=&quot;true&quot;；同一会话建议只有最后一条 assistant 消息处于 streaming。"
    :src="streamingSrc"
  >
    <Streaming />
  </Demo>

  <Demo
    title="发送状态"
    anchor="status"
    description="status 三档徽标渲染在 meta 行：sending 脉冲点「发送中」、sent 对勾「已发送」、error danger 色「发送失败」（assistant 气泡描边同步染 danger）；#actions 可据作用域 message.status 条件渲染操作（如重试）。"
    :src="statusSrc"
  >
    <Status />
  </Demo>

  <Demo
    title="插槽定制"
    anchor="slots"
    description="#avatar 覆盖内置头像（system 角色出现头像的唯一方式）；default 作用域暴露 message 上下文（role/name/avatar/timestamp/streaming/status），内容渲染（Markdown 等）由使用方决定；#actions 渲染气泡下方的操作行。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>
</ComponentDoc>

Message 是会话流内的单条消息单元（区别于全局轻通知 Toast：不弹层、不自动消失）。
组件自身不可聚焦、无 role；会话容器、自动滚动与长列表虚拟化由使用方组合
VirtualList 承载；消息内容的 Markdown / 代码高亮渲染也由使用方在 default 插槽内完成。
