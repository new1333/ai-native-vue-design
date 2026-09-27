---
title: Tag 标签
---

<script setup>
import { tagMeta } from '@ui/components'
import Basic from '@docs-demos/tag/Basic.vue'
import basicSrc from '@docs-demos/tag/Basic.vue?raw'
import Icon from '@docs-demos/tag/Icon.vue'
import iconSrc from '@docs-demos/tag/Icon.vue?raw'
import Closable from '@docs-demos/tag/Closable.vue'
import closableSrc from '@docs-demos/tag/Closable.vue?raw'
import Disabled from '@docs-demos/tag/Disabled.vue'
import disabledSrc from '@docs-demos/tag/Disabled.vue?raw'
</script>

# Tag 标签

<ComponentDoc :meta="tagMeta" dir="tag">
  <Demo
    title="基础用法"
    anchor="basic"
    description="variant 五档：neutral（默认）取 surface-muted 底 + text-2 文字，success / warning / danger / info 为柔底 + 同系文字色；1px --ui-border 描边小标签，标注对象的分类或属性。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="前置图标"
    anchor="icon"
    description="通过 #icon 插槽传入内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor），颜色随同系文字色；装饰性图标请自行 aria-hidden，组件无内建图标。"
    :src="iconSrc"
  >
    <Icon />
  </Demo>

  <Demo
    title="可关闭"
    anchor="closable"
    description="closable 渲染原生关闭按钮（aria-label 为「关闭」），点击仅 emit close——组件不自行移除，数据源（v-for 数组）由使用方在 @close 中维护。"
    :src="closableSrc"
  >
    <Closable />
  </Demo>

  <Demo
    title="禁用态"
    anchor="disabled"
    description="disabled 时根元素 aria-disabled 为「true」，关闭按钮置原生 disabled 且 close 不再触发，整体视觉降为 muted；适合标注集合里不可操作的成员。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>
</ComponentDoc>
