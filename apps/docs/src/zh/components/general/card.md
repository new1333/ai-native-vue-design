---
title: Card 卡片
---

<script setup>
import { cardMeta } from '@ui/components'
import Basic from '@docs-demos/card/Basic.vue'
import basicSrc from '@docs-demos/card/Basic.vue?raw'
import Shadow from '@docs-demos/card/Shadow.vue'
import shadowSrc from '@docs-demos/card/Shadow.vue?raw'
import BodyOnly from '@docs-demos/card/BodyOnly.vue'
import bodyOnlySrc from '@docs-demos/card/BodyOnly.vue?raw'
import Composed from '@docs-demos/card/Composed.vue'
import composedSrc from '@docs-demos/card/Composed.vue?raw'
</script>

# Card 卡片

<ComponentDoc :meta="cardMeta" dir="card">
  <Demo
    title="基础用法"
    anchor="basic"
    description="标准三段式：CardHeader 放原生标题（语义层级由使用方的 h1-h6 决定）、CardBody 放正文、CardFooter 放动作区；区块间距由 Card 的 gap 提供，卡片本体为静态容器，不承载 hover/交互态。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="阴影档位"
    anchor="shadow"
    description="静止面默认 shadow='none' 无阴影；仅在同一视图需要层次对比时，对个别卡片用 shadow='rest' 打开 --ui-shadow-rest 一档静止阴影。"
    :src="shadowSrc"
  >
    <Shadow />
  </Demo>

  <Demo
    title="仅正文与任意内容"
    anchor="body-only"
    description="只有正文时可以只用 Card + CardBody；默认插槽也接受任意内容，不必经区块组件包裹。"
    :src="bodyOnlySrc"
  >
    <BodyOnly />
  </Demo>

  <Demo
    title="组合排版"
    anchor="composed"
    description="头部放标题 + 元信息（Badge 状态），主体承载任意内容（本例为步骤列表），底部组合说明文字与动作按钮——三段内容全部通过插槽自由编排。"
    :src="composedSrc"
  >
    <Composed />
  </Demo>
</ComponentDoc>
