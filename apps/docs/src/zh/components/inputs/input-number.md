---
title: InputNumber 数字输入框
---

<script setup>
import { inputNumberMeta } from '@ui/components'
import Basic from '@docs-demos/input-number/Basic.vue'
import basicSrc from '@docs-demos/input-number/Basic.vue?raw'
import Range from '@docs-demos/input-number/Range.vue'
import rangeSrc from '@docs-demos/input-number/Range.vue?raw'
import Format from '@docs-demos/input-number/Format.vue'
import formatSrc from '@docs-demos/input-number/Format.vue?raw'
import Slots from '@docs-demos/input-number/Slots.vue'
import slotsSrc from '@docs-demos/input-number/Slots.vue?raw'
import States from '@docs-demos/input-number/States.vue'
import statesSrc from '@docs-demos/input-number/States.vue?raw'
</script>

# InputNumber 数字输入框

<ComponentDoc :meta="inputNumberMeta" dir="input-number">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model（number | null）+ 增减按钮与键盘步进；step 事件在步进实际改变值时发出，边界上原地步进不发事件。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="范围与步长"
    anchor="range"
    description="min/max 渲染 aria-valuemin/max 并参与越界钳制：提交或步进的值经 [min, max] 收敛后回写；step=5 时 PageUp/PageDown 一次跨 50。"
    :src="rangeSrc"
  >
    <Range />
  </Demo>

  <Demo
    title="精度与格式化"
    anchor="format"
    description="precision 固定小数位：提交/步进后按位取整并格式化展示（1 → “1.00”）；步进加法的浮点噪声按操作数小数位归正（0.1+0.2 → 0.3）。"
    :src="formatSrc"
  >
    <Format />
  </Demo>

  <Demo
    title="前缀与后缀"
    anchor="slots"
    description="图标与单位走 #prefix / #suffix 插槽：内联 SVG 遵循 viewBox 0 0 24 24、stroke-width 1.5、currentColor，尺寸由组件统一约束。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>

  <Demo
    title="禁用、无按钮与越界受控值"
    anchor="states-demo"
    description="disabled 用原生属性拦截全部步进与提交路径；controls=false 只保留键盘步进；受控值超出 [min,max] 时展示与 aria 按钳制值呈现，下一次提交/步进时回写。"
    :src="statesSrc"
  >
    <States />
  </Demo>
</ComponentDoc>
