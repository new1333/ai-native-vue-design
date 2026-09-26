---
title: Dialog 对话框
---

<script setup>
import { dialogMeta } from '@ui/components'
import Basic from '@docs-demos/dialog/Basic.vue'
import basicSrc from '@docs-demos/dialog/Basic.vue?raw'
import Sizes from '@docs-demos/dialog/Sizes.vue'
import sizesSrc from '@docs-demos/dialog/Sizes.vue?raw'
import Form from '@docs-demos/dialog/Form.vue'
import formSrc from '@docs-demos/dialog/Form.vue?raw'
import TitleSlot from '@docs-demos/dialog/TitleSlot.vue'
import titleSlotSrc from '@docs-demos/dialog/TitleSlot.vue?raw'
</script>

# Dialog 对话框

<ComponentDoc :meta="dialogMeta" dir="dialog">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model 驱动显隐：Esc、遮罩、footer 默认「关闭」按钮三条关闭路径都发出 update:modelValue false，close 事件附带来源 reason（scrim / esc / footer）；打开时焦点移入面板并圈定，关闭后还原。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="尺寸档位"
    anchor="sizes"
    description="size 提供 sm / md / lg 三档宽度，由间距标尺推导，超出视口自动收窄；宽度档位不够用时优先调整内容布局而非强改宽度。"
    :src="sizesSrc"
  >
    <Sizes />
  </Demo>

  <Demo
    title="表单模式"
    anchor="form"
    description="close-on-scrim=false 拦截遮罩误触，关闭必须走 footer 的明确动作；footer 插槽整体替换默认「关闭」按钮，常见形态是「取消 + 主动作」成对出现，且一个 footer 只放一个 primary。"
    :src="formSrc"
  >
    <Form />
  </Demo>

  <Demo
    title="标题插槽与长内容"
    anchor="title-slot"
    description="#title 插槽覆盖 title prop，内容同样渲染进 aria-labelledby 指向的标题元素；正文超出面板高度时 body 区内部滚动，头部与底部保持可见。"
    :src="titleSlotSrc"
  >
    <TitleSlot />
  </Demo>
</ComponentDoc>
