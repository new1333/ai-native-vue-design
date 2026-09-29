---
title: Slider 滑块
---

<script setup>
import { sliderMeta } from '@ui/components'
import Basic from '@docs-demos/slider/Basic.vue'
import basicSrc from '@docs-demos/slider/Basic.vue?raw'
import Range from '@docs-demos/slider/Range.vue'
import rangeSrc from '@docs-demos/slider/Range.vue?raw'
import Slots from '@docs-demos/slider/Slots.vue'
import slotsSrc from '@docs-demos/slider/Slots.vue?raw'
import Vertical from '@docs-demos/slider/Vertical.vue'
import verticalSrc from '@docs-demos/slider/Vertical.vue?raw'
import States from '@docs-demos/slider/States.vue'
import statesSrc from '@docs-demos/slider/States.vue?raw'
</script>

# Slider 滑块

<ComponentDoc :meta="sliderMeta" dir="slider">
  <Demo
    title="基础用法"
    anchor="basic"
    description="单柄受控 v-model（number）：方向键 ±step、PageUp/PageDown 大步长（step×10）、Home/End 直达边界；hover / 键盘聚焦 / 拖拽时柄上方显示值气泡；marks 为装饰性刻度（aria-hidden），读屏取值以 aria-valuenow 为准。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="双柄范围（range）"
    anchor="range"
    description="range 模式绑定升序二元组 [最小值, 最大值]：两柄各自为 Tab 停靠点、互为值域边界（aria-valuemin/valuemax 随之钳制），轨道点击跳值到指针位置并取最近柄开始拖拽。"
    :src="rangeSrc"
  >
    <Range />
  </Demo>

  <Demo
    title="值气泡与刻度插槽"
    anchor="slots"
    description="#tooltip 自定义柄值气泡内容（作用域 { value }）；#marks 自定义刻度标签（作用域 { mark, reached }）。两者均为装饰层（aria-hidden），读屏用户以 aria-valuenow 感知取值。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>

  <Demo
    title="垂直方向"
    anchor="vertical"
    description="vertical 时值自下而上增大（aria-orientation='vertical'，键盘 ↑ 加 ↓ 减）；滑块自身不产生高度，需要使用方提供固定高度容器。"
    :src="verticalSrc"
  >
    <Vertical />
  </Demo>

  <Demo
    title="禁用、加载与受控"
    anchor="states-demo"
    description="disabled：柄移出 Tab 序（tabindex='-1'）+ aria-disabled='true'，一切取值路径拦截；loading：aria-busy='true' 且拦截取值但保持可聚焦（同 Switch 先例，不落 disabled）；受控值可由外部状态直接驱动。"
    :src="statesSrc"
  >
    <States />
  </Demo>
</ComponentDoc>
