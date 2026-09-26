---
title: Radio 单选框
---

<script setup>
import { radioMeta } from '@ui/components'
import Basic from '@docs-demos/radio/Basic.vue'
import basicSrc from '@docs-demos/radio/Basic.vue?raw'
import Disabled from '@docs-demos/radio/Disabled.vue'
import disabledSrc from '@docs-demos/radio/Disabled.vue?raw'
import RichLabel from '@docs-demos/radio/RichLabel.vue'
import richLabelSrc from '@docs-demos/radio/RichLabel.vue?raw'
import Controlled from '@docs-demos/radio/Controlled.vue'
import controlledSrc from '@docs-demos/radio/Controlled.vue?raw'
</script>

# Radio 单选框

<ComponentDoc :meta="radioMeta" dir="radio">
  <Demo
    title="基础用法"
    anchor="basic"
    description="Radio 必须包在 RadioGroup 内使用：组提供必填 name（原生互斥与方向键导航的依据）与受控 v-model（string | number）。组容器纵向排布，渲染序即 Tab / 方向键导航序；键盘 100% 原生——Tab 进入组、方向键换选、Space 选中。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="单项禁用与整组禁用"
    anchor="disabled"
    description="单项 disabled 与组 disabled 取或生效：原生 disabled 移出 Tab 序、不参与方向键导航，视觉灰化并配 not-allowed 光标。整组 disabled 也常用于只读态展示。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  <Demo
    title="富文本 label"
    anchor="rich-label"
    description="默认插槽优先于 label prop，可承载富文本（辅助说明等）；根为 label 元素，点击文本即选中。"
    :src="richLabelSrc"
  >
    <RichLabel />
  </Demo>

  <Demo
    title="受控与编程式选中"
    anchor="controlled"
    description="选中态只由组受控值派生：改 v-model 即可编程式选中，无需触碰 Radio 实例；Radio 选中后不可取消（只能换选），互斥语义由原生 name 兜底。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>
</ComponentDoc>
