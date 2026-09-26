---
title: DropdownMenu 下拉菜单
---

<script setup>
import { dropdownMenuMeta } from '@ui/components'
import Basic from '@docs-demos/dropdown-menu/Basic.vue'
import basicSrc from '@docs-demos/dropdown-menu/Basic.vue?raw'
import CustomTrigger from '@docs-demos/dropdown-menu/CustomTrigger.vue'
import customTriggerSrc from '@docs-demos/dropdown-menu/CustomTrigger.vue?raw'
import ItemStates from '@docs-demos/dropdown-menu/ItemStates.vue'
import itemStatesSrc from '@docs-demos/dropdown-menu/ItemStates.vue?raw'
import Align from '@docs-demos/dropdown-menu/Align.vue'
import alignSrc from '@docs-demos/dropdown-menu/Align.vue?raw'
</script>

# DropdownMenu 下拉菜单

<ComponentDoc :meta="dropdownMenuMeta" dir="dropdown-menu">
  <Demo
    title="基础用法"
    anchor="basic"
    description="items 数据驱动渲染 role='menuitem'；插槽为文本时回退为内建原生 button 触发器。select 载荷即所选项 key，选中后菜单自动关闭、焦点还原触发器。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="自定义触发元素"
    anchor="custom-trigger"
    description="默认插槽为单个元素/组件 vnode 时，该元素直接作为触发元素（合并 id 与 aria-haspopup / expanded / controls 及键盘事件，不产生嵌套 button）；触发元素须可聚焦，组件触发元素须把 attrs 透传到根元素。"
    :src="customTriggerSrc"
  >
    <CustomTrigger />
  </Demo>

  <Demo
    title="图标、禁用与危险项"
    anchor="item-states"
    description="item.icon 传内联 SVG 组件（组件统一约束为 16px）；disabled 项原生禁用、roving focus 跳过、不可选中；danger 项以 danger 色呈现，按惯例置于末位。"
    :src="itemStatesSrc"
  >
    <ItemStates />
  </Demo>

  <Demo
    title="对齐"
    anchor="align"
    description="align 控制菜单面板与触发器的水平对齐：start 左缘对齐（默认）、end 右缘对齐；纯 CSS 实现，无需测量面板宽度。"
    :src="alignSrc"
  >
    <Align />
  </Demo>
</ComponentDoc>
