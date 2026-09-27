---
title: Reasoning 思考过程
---

<script setup>
import { reasoningMeta } from '@ui/components'
import Basic from '@docs-demos/reasoning/Basic.vue'
import basicSrc from '@docs-demos/reasoning/Basic.vue?raw'
import Streaming from '@docs-demos/reasoning/Streaming.vue'
import streamingSrc from '@docs-demos/reasoning/Streaming.vue?raw'
import Controlled from '@docs-demos/reasoning/Controlled.vue'
import controlledSrc from '@docs-demos/reasoning/Controlled.vue?raw'
import Slots from '@docs-demos/reasoning/Slots.vue'
import slotsSrc from '@docs-demos/reasoning/Slots.vue?raw'
</script>

# Reasoning 思考过程

<ComponentDoc :meta="reasoningMeta" dir="reasoning">
  <Demo
    title="基础用法"
    anchor="basic"
    description="完成态思考块：默认收起为一行「已思考 3.2s」（duration 单位为秒、展示固定一位小数），点击展开查看思考全文，多行换行按 pre-wrap 保留。头部为原生 disclosure 按钮（aria-expanded + aria-controls），键盘 Enter/Space 可切换。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="流式自动展开、结束收起"
    anchor="streaming"
    description="streaming=true 时面板自动展开跟随生成、头部显示「思考中…」；true→false 且 autoCollapse（默认 true）时自动收起、以 duration 展示耗时。autoCollapse=false 用于「结束后保持展开供用户阅读」。"
    :src="streamingSrc"
  >
    <Streaming />
  </Demo>

  <Demo
    title="受控展开"
    anchor="controlled"
    description="传入 expanded 即进入受控模式：组件不再自行改状态，一切展开意向（含流式自动展开/结束收起）都经 toggle 事件上报，由使用方回写——适合「仅最新一条消息自动展开思考」的会话编排。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>

  <Demo
    title="自定义头部与正文"
    anchor="slots"
    description="#header 覆盖按钮内默认文案（成为按钮可访问名，chevron 与展开语义仍由组件收口）；#content 接管思考正文渲染（可接外部 Markdown 渲染器），作用域提供 content 与 streaming。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>
</ComponentDoc>
