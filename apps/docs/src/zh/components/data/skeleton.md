---
title: Skeleton 骨架屏
---

<script setup>
import { skeletonMeta } from '@ui/components'
import Basic from '@docs-demos/skeleton/Basic.vue'
import basicSrc from '@docs-demos/skeleton/Basic.vue?raw'
import Lines from '@docs-demos/skeleton/Lines.vue'
import linesSrc from '@docs-demos/skeleton/Lines.vue?raw'
import Sizes from '@docs-demos/skeleton/Sizes.vue'
import sizesSrc from '@docs-demos/skeleton/Sizes.vue?raw'
import Composition from '@docs-demos/skeleton/Composition.vue'
import compositionSrc from '@docs-demos/skeleton/Composition.vue?raw'
</script>

# Skeleton 骨架屏

<ComponentDoc :meta="skeletonMeta" dir="skeleton">
  <Demo
    title="基础用法"
    anchor="basic"
    description="三种形状：line 多行文本占位（默认，配 lines）、circle 正圆（头像）、rect 矩形（块面/媒体）。本体恒 aria-hidden 纯装饰，加载语义由使用方容器 role='status' 声明。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="行数与短尾"
    anchor="lines"
    description="lines 控制行数（最小 1、小数向下取整），末行自动短尾模拟段落收尾、单行不短尾；height 为每一行的行高。"
    :src="linesSrc"
  >
    <Lines />
  </Demo>

  <Demo
    title="宽高尺寸"
    anchor="sizes"
    description="width / height：数字按 px、字符串原样（如 '50%'、'96px'）；circle 以 width 优先作正圆直径，仅在缺 width 时用 height 兜底。"
    :src="sizesSrc"
  >
    <Sizes />
  </Demo>

  <Demo
    title="组合排版"
    anchor="composition"
    description="卡片占位（媒体 rect + 文本 line）与列表占位（头像 circle + 两行 line）——形状尽量贴近真实内容，减少加载完成后的布局抖动。"
    :src="compositionSrc"
  >
    <Composition />
  </Demo>
</ComponentDoc>
