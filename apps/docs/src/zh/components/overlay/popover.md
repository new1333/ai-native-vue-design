---
title: Popover 气泡卡片
---

<script setup>
import { popoverMeta } from '@ui/components'
import Basic from '@docs-demos/popover/Basic.vue'
import basicSrc from '@docs-demos/popover/Basic.vue?raw'
import Triggers from '@docs-demos/popover/Triggers.vue'
import triggersSrc from '@docs-demos/popover/Triggers.vue?raw'
import Placements from '@docs-demos/popover/Placements.vue'
import placementsSrc from '@docs-demos/popover/Placements.vue?raw'
import Controlled from '@docs-demos/popover/Controlled.vue'
import controlledSrc from '@docs-demos/popover/Controlled.vue?raw'
import Form from '@docs-demos/popover/Form.vue'
import formSrc from '@docs-demos/popover/Form.vue?raw'
</script>

# Popover 气泡卡片

<ComponentDoc :meta="popoverMeta" dir="popover">
  <Demo
    title="基础用法"
    anchor="basic"
    description="trigger 插槽放唯一触发元素（组件或原生元素，无包装 DOM），default 插槽即气泡内容：点击开合，Esc / 点击气泡之外区域（透明命中层）关闭并把焦点还原到触发元素。气泡内可放任意内容；未提供 default 插槽时不弹层。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="触发方式"
    anchor="triggers"
    description="trigger=click（默认）点击开合；trigger=hover 进入 150ms 开启、移出 150ms 宽限关闭，指针/焦点移入气泡不关闭——hover 气泡同样可承载交互内容。hover 模式的焦点路径（focusin/focusout）与鼠标同构。"
    :src="triggersSrc"
  >
    <Triggers />
  </Demo>

  <Demo
    title="四个方向与箭头"
    anchor="placements"
    description="placement 提供 top / bottom / left / right 四档方向（默认 top），按触发元素 rect 定位；arrow 显示指向触发元素的小箭头。不做视口碰撞翻转，打开期间滚动 / resize 跟随重排。"
    :src="placementsSrc"
  >
    <Placements />
  </Demo>

  <Demo
    title="受控与非阻塞关闭"
    anchor="controlled"
    description="绑定 v-model 即为受控：一切开合路径只发出 update:modelValue，状态收口在应用侧；未绑定时组件自管开合（非受控）。closeOnScrim=false 时不渲染命中层，打开期间外部页面保持可交互，关闭仅靠 Esc / 再次点击 / 受控状态。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>

  <Demo
    title="气泡内表单"
    anchor="form"
    description="Popover 的典型场景：就地展开小型表单，输入与按钮正常交互，Esc 关闭并焦点回归触发元素；提交后由应用关闭（v-model 置 false）。"
    :src="formSrc"
  >
    <Form />
  </Demo>
</ComponentDoc>
