---
title: IconButton 图标按钮
---

<script setup>
import { iconButtonMeta } from '@ui/components'
import Basic from '@docs-demos/icon-button/Basic.vue'
import basicSrc from '@docs-demos/icon-button/Basic.vue?raw'
import Sizes from '@docs-demos/icon-button/Sizes.vue'
import sizesSrc from '@docs-demos/icon-button/Sizes.vue?raw'
import States from '@docs-demos/icon-button/States.vue'
import statesSrc from '@docs-demos/icon-button/States.vue?raw'
</script>

# IconButton 图标按钮

<ComponentDoc :meta="iconButtonMeta" dir="icon-button">
  <Demo
    title="三档视觉"
    anchor="basic"
    description="ghost 无底安静（工具栏默认）、outline 描边常规、primary accent 实底强调；必须提供 aria-label 或 aria-labelledby，写动作（「关闭」）而非图标形状（「叉号」）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="尺寸"
    anchor="sizes"
    description="sm / md / lg 三档，映射图标渲染尺寸 16 / 20 / 24，与 Button 三档对齐；与文本按钮混排时保持同 size 档。"
    :src="sizesSrc"
  >
    <Sizes />
  </Demo>

  <Demo
    title="加载与禁用"
    anchor="states-demo"
    description="loading 图标让位于旋转指示、置 aria-busy，点击与 Enter/Space 均不触发 click 且保持可聚焦；disabled 用原生属性移出 Tab 序。不要用 disabled 表达 loading。"
    :src="statesSrc"
  >
    <States />
  </Demo>
</ComponentDoc>
