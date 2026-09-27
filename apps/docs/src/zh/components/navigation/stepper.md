---
title: Stepper 步骤条
---

<script setup>
import { stepperMeta } from '@ui/components'
import Basic from '@docs-demos/stepper/Basic.vue'
import basicSrc from '@docs-demos/stepper/Basic.vue?raw'
import Clickable from '@docs-demos/stepper/Clickable.vue'
import clickableSrc from '@docs-demos/stepper/Clickable.vue?raw'
import Error from '@docs-demos/stepper/Error.vue'
import errorSrc from '@docs-demos/stepper/Error.vue?raw'
import Vertical from '@docs-demos/stepper/Vertical.vue'
import verticalSrc from '@docs-demos/stepper/Vertical.vue?raw'
</script>

# Stepper 步骤条

<ComponentDoc :meta="stepperMeta" dir="stepper">
  <Demo
    title="基础用法（受控）"
    anchor="basic"
    description="steps 数组配置步骤（顺序即流程顺序），v-model 受控当前步（0 起始）；已完成步派生 finish、当前步 process、未到步 waiting；当前步以 aria-current=&quot;step&quot; 暴露给读屏。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="clickable 回退与禁用步"
    anchor="clickable"
    description="clickable 开启后「已完成」步骤渲染为原生 button：点击 / Enter / Space 回退到该步，并发出 update:modelValue 与 change；当前步与未到步不可交互（不跳步）。disabled 的步骤为原生 disabled，回退被拦截。"
    :src="clickableSrc"
  >
    <Clickable />
  </Demo>

  <Demo
    title="出错态 status"
    anchor="error"
    description="status=&quot;error&quot; 只覆盖当前步的呈现：节点转 danger、标题转 danger；前序已完成步仍为 finish，未到步仍为 waiting；修正后恢复默认 process。"
    :src="errorSrc"
  >
    <Error />
  </Demo>

  <Demo
    title="纵向排布与作用域插槽"
    anchor="vertical-slots"
    description="direction=&quot;vertical&quot; 纵向排布（连接线沿左轨向下，已完成段转 success）；icon / description 为作用域插槽（{ step, index, status }），分别替换图标节点内容与描述文本。"
    :src="verticalSrc"
  >
    <Vertical />
  </Demo>
</ComponentDoc>
