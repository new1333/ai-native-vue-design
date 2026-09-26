---
title: Typography 排版
---

<script setup>
import { textMeta } from '@ui/components'
import HeadingLevels from '@docs-demos/typography/HeadingLevels.vue'
import headingLevelsSrc from '@docs-demos/typography/HeadingLevels.vue?raw'
import TextSizes from '@docs-demos/typography/TextSizes.vue'
import textSizesSrc from '@docs-demos/typography/TextSizes.vue?raw'
import TextWeightColor from '@docs-demos/typography/TextWeightColor.vue'
import textWeightColorSrc from '@docs-demos/typography/TextWeightColor.vue?raw'
import TextNumeric from '@docs-demos/typography/TextNumeric.vue'
import textNumericSrc from '@docs-demos/typography/TextNumeric.vue?raw'
</script>

# Typography 排版

<ComponentDoc :meta="textMeta" dir="typography">
  <Demo
    title="标题层级 Heading"
    anchor="heading-levels"
    description="Heading 渲染原生 h1–h6：as 定层级语义、size 定视觉字号，二者解耦（h1 每页至多一个，层级按文档大纲递进不跳级）；字重 / 颜色档位独立可调。"
    :src="headingLevelsSrc"
  >
    <HeadingLevels />
  </Demo>

  <Demo
    title="正文字号 Text"
    anchor="text-sizes"
    description="Text 的 size 七档映射 --ui-text-xs..3xl，行高随档位按纸面规约自动取 --ui-leading-*；默认档为 md。"
    :src="textSizesSrc"
  >
    <TextSizes />
  </Demo>

  <Demo
    title="字重与颜色"
    anchor="text-weight-color"
    description="weight 三档 400 / 500 / 600；color 语义档 text-1 / text-2 / text-3（muted 为 text-2 的简写别名）；as 共 span / p / div 三档——成段内容用 p，行内文本用默认 span，块级容器文本用 div。"
    :src="textWeightColorSrc"
  >
    <TextWeightColor />
  </Demo>

  <Demo
    title="数字对齐"
    anchor="text-numeric"
    description="numeric 开启 tabular-nums（--ui-numeric）：同宽数字让金额列小数点上下对齐；Heading 的 numeric 档同理，可用于 KPI 大数字。"
    :src="textNumericSrc"
  >
    <TextNumeric />
  </Demo>
</ComponentDoc>

Typography 目录包含 Text（正文 / 行内文本）与 Heading（标题层级）两个组件：本页主契约是 Text，Heading 的层级用法见上方首个示例，其完整 meta 契约可从 `@ui/components` 的 `headingMeta` 读取。
