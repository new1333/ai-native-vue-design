---
title: Tooltip 文字提示
---

<script setup>
import { tooltipMeta } from '@ui/components'
import Basic from '@docs-demos/tooltip/Basic.vue'
import basicSrc from '@docs-demos/tooltip/Basic.vue?raw'
import Placements from '@docs-demos/tooltip/Placements.vue'
import placementsSrc from '@docs-demos/tooltip/Placements.vue?raw'
import Keyboard from '@docs-demos/tooltip/Keyboard.vue'
import keyboardSrc from '@docs-demos/tooltip/Keyboard.vue?raw'
import TruncatedText from '@docs-demos/tooltip/TruncatedText.vue'
import truncatedTextSrc from '@docs-demos/tooltip/TruncatedText.vue?raw'
</script>

# Tooltip 文字提示

<ComponentDoc :meta="tooltipMeta" dir="tooltip">
  <Demo
    title="基础用法"
    anchor="basic"
    description="默认插槽放唯一触发元素（无包装 DOM），#content 提供浮层文字；hover / focus 进入延迟 150ms 显示、离开立即隐藏。触发元素禁用时不响应鼠标与焦点事件，浮层自然不会出现；无 #content 插槽则永不弹层。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="四个方向"
    anchor="placements"
    description="placement 提供 top / bottom / left / right 四档方向（默认 top），按触发元素 rect 定位；不做视口碰撞翻转。"
    :src="placementsSrc"
  >
    <Placements />
  </Demo>

  <Demo
    title="键盘与焦点"
    anchor="keyboard"
    description="Tab 聚焦触发元素即显示（focusin 路径）、失焦或 Esc 立即隐藏；打开期间触发元素挂 aria-describedby 指向浮层。表单项填写要求与图标按钮补充说明是两个典型场景。"
    :src="keyboardSrc"
  >
    <Keyboard />
  </Demo>

  <Demo
    title="截断文本看全文"
    anchor="truncated-text"
    description="被截断文本悬停查看完整内容（表格单元格、面包屑同款模式）；触发元素建议用原生交互元素承载以保持键盘可达。"
    :src="truncatedTextSrc"
  >
    <TruncatedText />
  </Demo>
</ComponentDoc>
