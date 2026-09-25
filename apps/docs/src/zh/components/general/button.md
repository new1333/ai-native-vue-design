---
title: Button 按钮
---

<script setup>
import { buttonMeta } from '@ui/components'
import Basic from '@docs-demos/button/Basic.vue'
import basicSrc from '@docs-demos/button/Basic.vue?raw'
import Sizes from '@docs-demos/button/Sizes.vue'
import sizesSrc from '@docs-demos/button/Sizes.vue?raw'
import States from '@docs-demos/button/States.vue'
import statesSrc from '@docs-demos/button/States.vue?raw'
import Icons from '@docs-demos/button/Icons.vue'
import iconsSrc from '@docs-demos/button/Icons.vue?raw'
import Group from '@docs-demos/button/Group.vue'
import groupSrc from '@docs-demos/button/Group.vue?raw'
</script>

# Button 按钮

<ComponentDoc :meta="buttonMeta" dir="button">
  <Demo
    title="基础用法"
    description="四档视觉：primary 实底强调、secondary 描边常规（默认）、ghost 无底安静、danger 危险操作（柔底，hover 转实底）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="尺寸与块级"
    description="sm / md / lg 三档；block 铺满容器宽度。"
    :src="sizesSrc"
  >
    <Sizes />
  </Demo>

  <Demo
    title="加载与禁用"
    description="loading 显示旋转指示并置 aria-busy，拦截一切激活路径但保持可聚焦；disabled 用原生属性，移出 Tab 序。不要用 disabled 表达 loading。"
    :src="statesSrc"
  >
    <States />
  </Demo>

  <Demo
    title="图标"
    description="图标走 #icon / #iconRight 插槽，传内联 SVG（viewBox 0 0 24 24、stroke-width 1.5、currentColor），尺寸由组件按 size 统一约束；loading 时左图标让位于加载指示。"
    :src="iconsSrc"
  >
    <Icons />
  </Demo>

  <Demo
    title="按钮组"
    description="ButtonGroup 内共享 size（未显式声明时），首尾圆角由组统一裁切。"
    :src="groupSrc"
  >
    <Group />
  </Demo>
</ComponentDoc>
