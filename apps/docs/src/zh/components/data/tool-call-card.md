---
title: ToolCallCard 工具调用卡片
---

<script setup>
import { toolCallCardMeta } from '@ui/components'
import Basic from '@docs-demos/tool-call-card/Basic.vue'
import basicSrc from '@docs-demos/tool-call-card/Basic.vue?raw'
import States from '@docs-demos/tool-call-card/States.vue'
import statesSrc from '@docs-demos/tool-call-card/States.vue?raw'
import Approval from '@docs-demos/tool-call-card/Approval.vue'
import approvalSrc from '@docs-demos/tool-call-card/Approval.vue?raw'
import Custom from '@docs-demos/tool-call-card/Custom.vue'
import customSrc from '@docs-demos/tool-call-card/Custom.vue?raw'
</script>

# ToolCallCard 工具调用卡片

<ComponentDoc :meta="toolCallCardMeta" dir="tool-call-card">
  <Demo
    title="基础用法"
    anchor="basic"
    description="一次已完成调用的标准展示：name 为头部工具名，args / result 未传时不渲染对应区块，对象值 JSON 两空格缩进、字符串原样展示；duration 单位毫秒（<1000 显示 Nms，否则一位小数秒，等宽数字对齐）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="五种状态"
    anchor="states-demo"
    description="status 为受控枚举：queued / running / completed / failed / waitingApproval（对齐设计文档 §14 state semantics——表达真实状态而非视觉特效）。状态徽标复用 Badge 档位语义（neutral / info / success / danger / warning，soft 底 + 同系文字色 + 装饰圆点）；failed 时结果区文字转 danger 语义色表达错误输出；disabled 仅作用于 waitingApproval 的审批按钮。"
    :src="statesSrc"
  >
    <States />
  </Demo>

  <Demo
    title="人工审批（受控流转）"
    anchor="approval"
    description="status=&quot;waitingApproval&quot; 时内置批准/拒绝按钮，点击派发 approve / reject 事件——组件不自行流转状态，示例在使用方回调中切到 running，1.2s 后产出 result 并定格 completed；拒绝则切到 failed。运行中为加载态（info 徽标），结果产出即渲染。"
    :src="approvalSrc"
  >
    <Approval />
  </Demo>

  <Demo
    title="插槽接管"
    anchor="custom"
    description="#header 整体接管头部（注意：接管后内置的状态 live region 一并移除，状态播报由接管方自行承担）；#args / #result 覆盖区块内容但保留「入参 / 结果」可见标签，scope 提供原始值与内置序列化文本；#footer 承载重试、复制等附加操作。自定义视觉值同样只用 var(--ui-*) token。"
    :src="customSrc"
  >
    <Custom />
  </Demo>
</ComponentDoc>

无障碍要点：状态徽标是常驻 `aria-live="polite"` live region——status 变化时标签文本更新即被礼貌播报（圆点为装饰 `aria-hidden`）；审批操作为原生 `<button type="button">`（Tab 可达、Enter / Space 激活），外包 `role="group"` + `aria-label="人工审批"`，禁用走原生 `disabled` 语义。卡片本体为泛型 div，不可聚焦、不进 Tab 序。

SSR：无浏览器 API、无监听器与定时器；状态档位类、序列化文本、审批按钮与插槽内容全部随 `renderToString` 输出。
