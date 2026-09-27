---
title: Menu 导航菜单
---

<script setup>
import { menuMeta } from '@ui/components'
import Basic from '@docs-demos/menu/Basic.vue'
import basicSrc from '@docs-demos/menu/Basic.vue?raw'
import Items from '@docs-demos/menu/Items.vue'
import itemsSrc from '@docs-demos/menu/Items.vue?raw'
import Submenu from '@docs-demos/menu/Submenu.vue'
import submenuSrc from '@docs-demos/menu/Submenu.vue?raw'
import Horizontal from '@docs-demos/menu/Horizontal.vue'
import horizontalSrc from '@docs-demos/menu/Horizontal.vue?raw'
import Collapsed from '@docs-demos/menu/Collapsed.vue'
import collapsedSrc from '@docs-demos/menu/Collapsed.vue?raw'
</script>

# Menu 导航菜单

<ComponentDoc :meta="menuMeta" dir="menu">
  <Demo
    title="基础用法（受控）"
    anchor="basic"
    description="MenuItem / SubMenu 组合在 Menu 根容器（nav 地标）内；v-model:modelValue 受控标记当前项（aria-current=&quot;page&quot;），@select 监听用户选中；无 defaultValue 时不自动选中首项。disabled 项点击与键盘激活均被拦截。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="items 数据驱动"
    anchor="items"
    description="传入 items 数组即可渲染整棵菜单（与组合式二选一，提供 items 时忽略默认插槽）；含 children 的项渲染为可展开组（组节点不可选中）。#icon 按作用域 item 定制图标，#item 拿到 { item, active, disabled } 覆盖叶子项内容。"
    :src="itemsSrc"
  >
    <Items />
  </Demo>

  <Demo
    title="多级子菜单与键盘导航"
    anchor="submenu"
    description="SubMenu 可嵌套：点击 / Enter / Space 展开（aria-expanded），Esc 收起最近一层并回焦触发器；←→↑↓ 在「可见可用」项间循环移动 roving 焦点（收起组内项与 disabled 项被跳过），Home / End 直达首末。方向键只迁移焦点，Enter / Space / 点击才激活。"
    :src="submenuSrc"
  >
    <Submenu />
  </Demo>

  <Demo
    title="横向顶栏 mode=&quot;horizontal&quot;"
    anchor="horizontal"
    description="mode=&quot;horizontal&quot; 顶栏横向排布，子菜单点击后向下弹出（纯 CSS 定位 + --ui-z-dropdown 层级）；↑↓←→ 双轴均可用。"
    :src="horizontalSrc"
  >
    <Horizontal />
  </Demo>

  <Demo
    title="收起态 collapsed（图标栏）"
    anchor="collapsed"
    description="collapsed 仅 mode=&quot;vertical&quot; 生效：宽度收窄为图标栏，label 视觉隐藏但屏幕阅读器仍可读，子菜单向右侧飞出（无 JS 测量）。收起态应为每项提供 #icon 图标。"
    :src="collapsedSrc"
  >
    <Collapsed />
  </Demo>
</ComponentDoc>
