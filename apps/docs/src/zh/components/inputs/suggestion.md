---
title: Suggestion 建议追问
---

<script setup>
import { suggestionMeta } from '@ui/components'
import Basic from '@docs-demos/suggestion/Basic.vue'
import basicSrc from '@docs-demos/suggestion/Basic.vue?raw'
import WithInput from '@docs-demos/suggestion/WithInput.vue'
import withInputSrc from '@docs-demos/suggestion/WithInput.vue?raw'
import States from '@docs-demos/suggestion/States.vue'
import statesSrc from '@docs-demos/suggestion/States.vue?raw'
import Slots from '@docs-demos/suggestion/Slots.vue'
import slotsSrc from '@docs-demos/suggestion/Slots.vue?raw'
</script>

# Suggestion 建议追问

<ComponentDoc :meta="suggestionMeta" dir="suggestion">
  <Demo
    title="基础用法"
    anchor="basic"
    description="items 提供建议项（label 展示、value 回填载荷），点击或键盘激活 chip 上抛 select；组件不持有选中态，回显/回填全部由使用方处理。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="回填输入框"
    anchor="with-input"
    description="AI 会话的典型接法：在 @select 回调内把 item.value 写入输入框并聚焦，继续追问。"
    :src="withInputSrc"
  >
    <WithInput />
  </Demo>

  <Demo
    title="禁用与加载"
    anchor="states-demo"
    description="disabled 整组禁用（原生属性，移出 Tab 序）；item.disabled 禁用单条；loading 为建议生成中：根级 aria-busy，拦截一切选中路径但 chips 保持可聚焦。"
    :src="statesSrc"
  >
    <States />
  </Demo>

  <Demo
    title="插槽"
    anchor="slots"
    description="#default 渲染 chips 前置内容（标题/说明）；#item 作用域插槽定制单个 chip（scope：{ item, index }），内联 SVG 图标遵循 Icon Token。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>
</ComponentDoc>

输入过程需要实时联想补全时不要用本组件，请改用 AutoComplete。
