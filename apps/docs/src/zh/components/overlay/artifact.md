---
title: Artifact 产物画布
---

<script setup>
import { artifactMeta } from '@ui/components'
import Basic from '@docs-demos/artifact/Basic.vue'
import basicSrc from '@docs-demos/artifact/Basic.vue?raw'
import Markdown from '@docs-demos/artifact/Markdown.vue'
import markdownSrc from '@docs-demos/artifact/Markdown.vue?raw'
import HeaderSlot from '@docs-demos/artifact/HeaderSlot.vue'
import headerSlotSrc from '@docs-demos/artifact/HeaderSlot.vue?raw'
</script>

# Artifact 产物画布

<ComponentDoc :meta="artifactMeta" dir="artifact">
  <Demo
    title="基础用法（代码产物）"
    anchor="basic"
    description="受控 v-model 驱动显隐；type/language 驱动头部徽标；「复制」发出 copy 事件并尽力写入剪贴板，按钮短暂进入已复制态；Esc、遮罩、头部「关闭」按钮三条关闭路径都发出 update:modelValue false，close 事件附带来源。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="文档产物与 footer 动作区"
    anchor="markdown"
    description="type='markdown' 切换文档语义（徽标回落到类型名「文档」、复制按钮可访问名变为「复制文档」）；内容由使用方渲染后放入 default 插槽，本组件不做 Markdown 解析与代码高亮；footer 插槽只在提供时渲染，常放「取消 + 主动作」对。"
    :src="markdownSrc"
  >
    <Markdown />
  </Demo>

  <Demo
    title="自定义头部（header 插槽）"
    anchor="header-slot"
    description="#header 整体替换默认头部：用 IconButton 自由组合「重新生成」等动作；此时内置复制/关闭与 aria-labelledby 不再出具，示例经 aria-label attrs 补齐面板可访问名称，并置 :close-on-scrim='false' 拦截遮罩误触（关闭走自定义按钮或 Esc）。"
    :src="headerSlotSrc"
  >
    <HeaderSlot />
  </Demo>
</ComponentDoc>
