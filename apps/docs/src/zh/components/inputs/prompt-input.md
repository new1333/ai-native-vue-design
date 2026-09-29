---
title: PromptInput 提示词输入框
---

<script setup>
import { promptInputMeta } from '@ui/components'
import Basic from '@docs-demos/prompt-input/Basic.vue'
import basicSrc from '@docs-demos/prompt-input/Basic.vue?raw'
import Autosize from '@docs-demos/prompt-input/Autosize.vue'
import autosizeSrc from '@docs-demos/prompt-input/Autosize.vue?raw'
import Slots from '@docs-demos/prompt-input/Slots.vue'
import slotsSrc from '@docs-demos/prompt-input/Slots.vue?raw'
import States from '@docs-demos/prompt-input/States.vue'
import statesSrc from '@docs-demos/prompt-input/States.vue?raw'
</script>

# PromptInput 提示词输入框

<ComponentDoc :meta="promptInputMeta" dir="prompt-input">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model（string）+ Enter 发送 / Shift+Enter 换行；submit 载荷为提交时的输入值，清空由使用方经 v-model 置空完成（组件保持纯受控）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="自适应高度"
    anchor="autosize"
    description="输入区随内容长高，maxRows 封顶后内部滚动；行数上限以 max-height（token 推导 calc）表达，测量推迟到 mounted 之后，SSR 输出不受影响。"
    :src="autosizeSrc"
  >
    <Autosize />
  </Demo>

  <Demo
    title="插槽"
    anchor="slots"
    description="prefix 放输入区上方内容（上下文标签、附件入口），suffix 放底部弱信息（快捷键提示），actions 渲染于内建发送/停止按钮之前（增量扩展，不替换内建按钮）。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>

  <Demo
    title="加载与禁用"
    anchor="states-demo"
    description="loading 期间发送按钮切换为停止（aria-label 同步切换、保持键盘可达，点击发出 cancel），Enter 不再发送；disabled 用原生属性移出 Tab 序，发送按钮同步禁用。"
    :src="statesSrc"
  >
    <States />
  </Demo>
</ComponentDoc>
