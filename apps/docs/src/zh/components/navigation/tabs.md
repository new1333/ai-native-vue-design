---
title: Tabs 标签页
---

<script setup>
import { tabsMeta } from '@ui/components'
import Basic from '@docs-demos/tabs/Basic.vue'
import basicSrc from '@docs-demos/tabs/Basic.vue?raw'
import Uncontrolled from '@docs-demos/tabs/Uncontrolled.vue'
import uncontrolledSrc from '@docs-demos/tabs/Uncontrolled.vue?raw'
import Disabled from '@docs-demos/tabs/Disabled.vue'
import disabledSrc from '@docs-demos/tabs/Disabled.vue?raw'
import Icons from '@docs-demos/tabs/Icons.vue'
import iconsSrc from '@docs-demos/tabs/Icons.vue?raw'
import Variant from '@docs-demos/tabs/Variant.vue'
import variantSrc from '@docs-demos/tabs/Variant.vue?raw'
</script>

# Tabs 标签页

<ComponentDoc :meta="tabsMeta" dir="tabs">
  <Demo
    title="基础用法（受控）"
    anchor="basic"
    description="TabsList / TabsTrigger / TabsContent 组装在 Tabs 根容器内，Trigger 与 Content 以同名 value 配对；v-model:value 受控，可编程式切换；仅激活面板渲染（v-if）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="非受控初始值"
    anchor="uncontrolled"
    description="只给 defaultValue 定初始激活值，后续切换在组件内部维护；缺省时自动激活首个非 disabled 的 trigger。"
    :src="uncontrolledSrc"
  >
    <Uncontrolled />
  </Demo>

  <Demo
    title="禁用项与键盘导航"
    anchor="disabled"
    description="disabled 的 trigger 为原生 disabled：移出 Tab 序，点击与 Enter / Space 激活被拦截，←→↑↓ 导航跳过（roving tabindex：仅激活 trigger 在 Tab 序）。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  <Demo
    title="图标与插槽"
    anchor="icons"
    description="TabsTrigger 的默认插槽承载图标 + 文本（内联 SVG：viewBox 0 0 24 24、stroke-width 1.5、currentColor，svg 自身 aria-hidden，可读名交给文本）。"
    :src="iconsSrc"
  >
    <Icons />
  </Demo>

  <Demo
    title="视觉档位 variant"
    anchor="variant"
    description="line 为默认档：底部基线 + 激活项 accent 下划线指示（inset 阴影，无布局位移）；pill 为预留档位（视觉暂未实现），优先使用默认 line。"
    :src="variantSrc"
  >
    <Variant />
  </Demo>
</ComponentDoc>
