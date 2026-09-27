---
title: HoverCard 悬停预览卡
---

<script setup>
import { hoverCardMeta } from '@ui/components'
import Basic from '@docs-demos/hover-card/Basic.vue'
import basicSrc from '@docs-demos/hover-card/Basic.vue?raw'
import Placements from '@docs-demos/hover-card/Placements.vue'
import placementsSrc from '@docs-demos/hover-card/Placements.vue?raw'
import Delay from '@docs-demos/hover-card/Delay.vue'
import delaySrc from '@docs-demos/hover-card/Delay.vue?raw'
import Interactive from '@docs-demos/hover-card/Interactive.vue'
import interactiveSrc from '@docs-demos/hover-card/Interactive.vue?raw'
import Controlled from '@docs-demos/hover-card/Controlled.vue'
import controlledSrc from '@docs-demos/hover-card/Controlled.vue?raw'
</script>

# HoverCard 悬停预览卡

<ComponentDoc :meta="hoverCardMeta" dir="hover-card">
  <Demo
    title="基础用法"
    anchor="basic"
    description="trigger 插槽放唯一触发元素（无包装 DOM），default 插槽即预览卡内容：hover / focus 进入 150ms 后开启、移出 150ms 后收起。触发元素禁用或不提供 default 插槽时不会弹卡。典型场景是用户头像 / @提及 的资料摘要。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="四个方向"
    anchor="placements"
    description="placement 提供 top / bottom / left / right 四档方向（默认 top），复用 Tooltip 的按触发元素 rect 定位；不做视口碰撞翻转，打开期间滚动 / resize 跟随重排。"
    :src="placementsSrc"
  >
    <Placements />
  </Demo>

  <Demo
    title="开合节奏"
    anchor="delay"
    description="openDelay 控制进入后延迟开启（防掠过即弹），closeDelay 是移出后的收起宽限——宽限期内移回触发元素或移入卡片即取消关闭。两者均为毫秒数 prop，可按页面密度调节。"
    :src="delaySrc"
  >
    <Delay />
  </Demo>

  <Demo
    title="卡片可停留交互"
    anchor="interactive"
    description="与 Tooltip 的本质差异：预览卡可停留、可交互（链接 / 按钮正常工作）。键盘 Tab 进入卡片内容保持打开，Tab 离开或 Esc 收起并把焦点还原到触发元素。"
    :src="interactiveSrc"
  >
    <Interactive />
  </Demo>

  <Demo
    title="受控显隐"
    anchor="controlled"
    description="绑定 v-model 即为受控：hover / focus / Esc 等一切开合路径只发出 update:modelValue，状态收口在应用侧；未绑定时组件自管开合（非受控）。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>
</ComponentDoc>
