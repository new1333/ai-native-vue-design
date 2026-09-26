---
title: Checkbox 勾选框
---

<script setup>
import { checkboxMeta } from '@ui/components'
import Basic from '@docs-demos/checkbox/Basic.vue'
import basicSrc from '@docs-demos/checkbox/Basic.vue?raw'
import Indeterminate from '@docs-demos/checkbox/Indeterminate.vue'
import indeterminateSrc from '@docs-demos/checkbox/Indeterminate.vue?raw'
import RichLabel from '@docs-demos/checkbox/RichLabel.vue'
import richLabelSrc from '@docs-demos/checkbox/RichLabel.vue?raw'
import Disabled from '@docs-demos/checkbox/Disabled.vue'
import disabledSrc from '@docs-demos/checkbox/Disabled.vue?raw'
</script>

# Checkbox 勾选框

<ComponentDoc :meta="checkboxMeta" dir="checkbox">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model（boolean）；label prop 提供可读名称，根为 label 元素，点击文本即切换；Tab 自然进入、Space 原生切换。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="全选与半选"
    anchor="indeterminate"
    description="「全选 + 子项」级联：父项用 indeterminate 表达部分选中（accent 实底短横线），子项变化由使用方汇总计算；用户点击后浏览器自动清除 DOM 半选，父层随之复位。"
    :src="indeterminateSrc"
  >
    <Indeterminate />
  </Demo>

  <Demo
    title="富文本 label"
    anchor="rich-label"
    description="默认插槽优先于 label prop，可承载富文本（链接等内联内容同理）；根为 label 元素，点击文本任意位置即切换。"
    :src="richLabelSrc"
  >
    <RichLabel />
  </Demo>

  <Demo
    title="禁用"
    anchor="disabled"
    description="原生 disabled 移出 Tab 序并拦截一切切换路径：方块灰化、对勾/短横线与文本转弱色、not-allowed 光标。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>
</ComponentDoc>
