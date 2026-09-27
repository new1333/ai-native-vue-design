---
title: Popconfirm 气泡确认框
---

<script setup>
import { popconfirmMeta } from '@ui/components'
import Basic from '@docs-demos/popconfirm/Basic.vue'
import basicSrc from '@docs-demos/popconfirm/Basic.vue?raw'
import Danger from '@docs-demos/popconfirm/Danger.vue'
import dangerSrc from '@docs-demos/popconfirm/Danger.vue?raw'
import Placements from '@docs-demos/popconfirm/Placements.vue'
import placementsSrc from '@docs-demos/popconfirm/Placements.vue?raw'
import Keyboard from '@docs-demos/popconfirm/Keyboard.vue'
import keyboardSrc from '@docs-demos/popconfirm/Keyboard.vue?raw'
</script>

# Popconfirm 气泡确认框

<ComponentDoc :meta="popconfirmMeta" dir="popconfirm">
  <Demo
    title="基础用法"
    anchor="basic"
    description="trigger 插槽放唯一触发元素（无包装 DOM），title / description 组成气泡文案；点击确认/取消发出对应事件后气泡自动关闭并焦点回归触发元素。Esc、再次点击触发元素或点击气泡之外区域也会关闭（不发出事件）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="危险操作"
    anchor="danger"
    description="danger=true 标记不可逆动作：确认按钮走 destructive token（柔底 → hover 实底），内建警示图标转危险色；#icon 插槽可替换内建图标。危险操作建议同时给触发按钮 danger 语义。"
    :src="dangerSrc"
  >
    <Danger />
  </Demo>

  <Demo
    title="四个方向"
    anchor="placements"
    description="placement 提供 top / bottom / left / right 四档方向（默认 top），按触发元素 rect 定位；不做视口碰撞翻转，打开期间滚动 / resize 跟随重排。"
    :src="placementsSrc"
  >
    <Placements />
  </Demo>

  <Demo
    title="键盘与边界状态"
    anchor="keyboard"
    description="气泡打开后初始焦点落在「取消」（破坏性最小动作），Tab 即达「确认」，Enter/Space 原生触发；Esc 关闭并把焦点还原到触发元素。触发元素自身禁用时不响应点击；title 与 description 都未提供时不弹层。"
    :src="keyboardSrc"
  >
    <Keyboard />
  </Demo>
</ComponentDoc>
