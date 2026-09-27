---
title: CommandPalette 命令面板
---

<script setup>
import { commandPaletteMeta } from '@ui/components'
import Basic from '@docs-demos/command-palette/Basic.vue'
import basicSrc from '@docs-demos/command-palette/Basic.vue?raw'
import Controlled from '@docs-demos/command-palette/Controlled.vue'
import controlledSrc from '@docs-demos/command-palette/Controlled.vue?raw'
import FilterEmpty from '@docs-demos/command-palette/FilterEmpty.vue'
import filterEmptySrc from '@docs-demos/command-palette/FilterEmpty.vue?raw'
import ItemStates from '@docs-demos/command-palette/ItemStates.vue'
import itemStatesSrc from '@docs-demos/command-palette/ItemStates.vue?raw'
</script>

# CommandPalette 命令面板

<ComponentDoc :meta="commandPaletteMeta" dir="command-palette">
  <Demo
    title="基础用法"
    anchor="basic"
    description="groups 数据驱动分组命令；hotkey 默认注册全局 Cmd/Ctrl+K（仅客户端监听、preventDefault），任意位置按下开合面板。面板内焦点恒驻搜索框，↓ / ↑ 环绕漫游（跳过禁用）、Home / End 首尾、Enter 执行；Esc / 遮罩点击 / 选中命令后组件发出 update:modelValue=false，v-model 自动落账关闭。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="受控开合"
    anchor="controlled"
    description="不用全局热键（:hotkey=false），外部持有 open 状态并以 :model-value + @update:model-value 显式落账（等价 v-model）；placeholder 自定义搜索占位。所有关闭路径（Esc / 遮罩 / 选中）都会发出 update:modelValue，由使用方决定实际状态。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>

  <Demo
    title="搜索过滤与无结果"
    anchor="filter-empty"
    description="对命令 label 做不区分大小写的子串匹配；组内命令全部未命中时整组隐藏；过滤后激活项自动回到首个启用命令。全部未命中时渲染 #empty 插槽（缺省「无匹配命令」）。"
    :src="filterEmptySrc"
  >
    <FilterEmpty />
  </Demo>

  <Demo
    title="命令状态与自定义渲染"
    anchor="item-states"
    description="disabled 命令弱化、键盘漫游跳过、不可执行；danger 命令以 danger 色呈现、激活时 danger 柔底。#header 插槽为面板提供标题（同时充当 dialog 的可访问名称）；#item 插槽接管命令项渲染（scope：command / active）。"
    :src="itemStatesSrc"
  >
    <ItemStates />
  </Demo>
</ComponentDoc>
