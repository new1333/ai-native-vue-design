---
title: Accordion 手风琴
---

<script setup>
import { accordionMeta } from '@ui/components'
import Basic from '@docs-demos/accordion/Basic.vue'
import basicSrc from '@docs-demos/accordion/Basic.vue?raw'
import Multiple from '@docs-demos/accordion/Multiple.vue'
import multipleSrc from '@docs-demos/accordion/Multiple.vue?raw'
import Controlled from '@docs-demos/accordion/Controlled.vue'
import controlledSrc from '@docs-demos/accordion/Controlled.vue?raw'
import Slots from '@docs-demos/accordion/Slots.vue'
import slotsSrc from '@docs-demos/accordion/Slots.vue?raw'
import Disabled from '@docs-demos/accordion/Disabled.vue'
import disabledSrc from '@docs-demos/accordion/Disabled.vue?raw'
</script>

# Accordion 手风琴

<ComponentDoc :meta="accordionMeta" dir="accordion">
  <Demo
    title="基础用法"
    anchor="basic"
    description="items 驱动的单开手风琴（默认 multiple=false）：同一时刻至多一个面板展开，展开新条目时自动收起其余；面板缺省渲染 item.content，头部缺省渲染 item.title 与随状态翻转的 chevron。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="多开模式"
    anchor="multiple"
    description="multiple=true 时允许多个面板同时保持展开；modelValue 变为 keys 数组，v-model 双向绑定，切换后的展开值按 items 顺序规范化。"
    :src="multipleSrc"
  >
    <Multiple />
  </Demo>

  <Demo
    title="受控与 change 事件"
    anchor="controlled"
    description="受控模式：组件只 emit 不自行改状态，由 v-model 驱动界面；change 事件携带被切换条目的 key、切换后的 expanded 与完整展开值，可用于埋点或与页面其他状态联动。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>

  <Demo
    title="作用域插槽定制"
    anchor="slots"
    description="#title / #icon / #default 三个插槽均以 { item, index, expanded } 为作用域：标题可加序号、图标可换成加减号、面板正文可放任意组件（本例为步骤列表），缺省渲染则全部来自 items 数据。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>

  <Demo
    title="禁用条目"
    anchor="disabled"
    description="item.disabled 置为 true 的条目：头部原生 disabled，移出 roving tabindex 焦点环与 Tab 序，点击与键盘激活一律无效，↑/↓/Home/End 导航自动跳过。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  键盘操作与 WAI-ARIA Accordion 模式一致：Tab 停靠当前头部（同一时刻仅一个头部在 Tab 序内，roving tabindex）；<kbd>Enter</kbd> / <kbd>Space</kbd> 切换展开；<kbd>↑</kbd> / <kbd>↓</kbd> 在头部间循环移动焦点并跳过禁用项；<kbd>Home</kbd> / <kbd>End</kbd> 直达首/尾可用头部。
</ComponentDoc>
