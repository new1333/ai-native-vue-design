---
title: StreamingText 流式文本
---

<script setup>
import { streamingTextMeta } from '@ui/components'
import Basic from '@docs-demos/streaming-text/Basic.vue'
import basicSrc from '@docs-demos/streaming-text/Basic.vue?raw'
import MarkdownMode from '@docs-demos/streaming-text/MarkdownMode.vue'
import markdownModeSrc from '@docs-demos/streaming-text/MarkdownMode.vue?raw'
import CustomCursor from '@docs-demos/streaming-text/CustomCursor.vue'
import customCursorSrc from '@docs-demos/streaming-text/CustomCursor.vue?raw'
import CustomRender from '@docs-demos/streaming-text/CustomRender.vue'
import customRenderSrc from '@docs-demos/streaming-text/CustomRender.vue?raw'
</script>

# StreamingText 流式文本

<ComponentDoc :meta="streamingTextMeta" dir="streaming-text">
  <Demo
    title="受控流式与完成定格"
    anchor="basic"
    description="使用方只负责追加 content（累计全文）并翻转 streaming：流式期间增量按节拍上屏并渲染光标；streaming 置 false 后未上屏余量立即定格、光标收起，并在 true→false 沿派发一次 complete。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="段落结构化 markdown"
    anchor="markdown"
    description="markdown=true 按空行切分原生段落、段内换行保留（安全文本节点渲染，与 SSR 直出一致）；完整 Markdown 语法（标题/列表/代码块）不属于本组件，请用 default 插槽接外部渲染器。"
    :src="markdownModeSrc"
  >
    <MarkdownMode />
  </Demo>

  <Demo
    title="自定义光标"
    anchor="custom-cursor"
    description="cursor 插槽整体替换默认块状插入符：容器与 aria-hidden 装饰语义仍由组件收口，仅 streaming 期间渲染，流结束随定格一并移除。"
    :src="customCursorSrc"
  >
    <CustomCursor />
  </Demo>

  <Demo
    title="自定义渲染（default 插槽）"
    anchor="custom-render"
    description="default 插槽接管已上屏文本的渲染，作用域提供 text（已上屏部分）与 streaming（是否生成中）；可在此接入外部 Markdown/语法高亮渲染管线，流式光标仍由组件收口。"
    :src="customRenderSrc"
  >
    <CustomRender />
  </Demo>
</ComponentDoc>

组件语义取自设计文档 §14.2 Response：AI UI 表达真实状态而非视觉特效——流式即「增量按节拍上屏 + 光标在场」，完成即「全文定格 + 光标离场 + complete 派发一次」。挂载时已有 content 视为已上屏（与 SSR 直出一致），因此刷新或服务端首屏不会出现回放；content 长度回落视为新一轮生成，从零重新上屏。
