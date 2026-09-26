---
title: EmptyState 空状态
---

<script setup>
import { emptyStateMeta } from '@ui/components'
import Basic from '@docs-demos/empty-state/Basic.vue'
import basicSrc from '@docs-demos/empty-state/Basic.vue?raw'
import Icon from '@docs-demos/empty-state/Icon.vue'
import iconSrc from '@docs-demos/empty-state/Icon.vue?raw'
import Minimal from '@docs-demos/empty-state/Minimal.vue'
import minimalSrc from '@docs-demos/empty-state/Minimal.vue?raw'
</script>

# EmptyState 空状态

<ComponentDoc :meta="emptyStateMeta" dir="empty-state">
  <Demo
    title="基础用法"
    anchor="basic"
    description="title + description + #action 三要素：标题写「是什么空」，描述写「为什么、能做什么」；action 只放一个主行动按钮，图标缺省为内建克制线稿（装饰性 aria-hidden，不进入读屏内容）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="自定义图标"
    anchor="icon"
    description="#icon 插槽替换内建图标，保持内联 SVG 线稿规格（viewBox 0 0 24 24、stroke-width 1.5、currentColor、24px）；本例省略 description——title / description 均可选，缺哪行就不渲染对应行。"
    :src="iconSrc"
  >
    <Icon />
  </Demo>

  <Demo
    title="极简空态"
    anchor="minimal"
    description="无标题的占位：仅图标 + description + #action。空态自身不可聚焦，键盘路径只经由 action 内的使用方控件（Tab 可达、Enter / Space 原生激活）。"
    :src="minimalSrc"
  >
    <Minimal />
  </Demo>
</ComponentDoc>
