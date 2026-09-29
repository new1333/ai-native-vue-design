---
title: ToggleGroup 分段控制器
---

<script setup>
import { toggleGroupMeta } from '@ui/components'
import Basic from '@docs-demos/toggle-group/Basic.vue'
import basicSrc from '@docs-demos/toggle-group/Basic.vue?raw'
import Multiple from '@docs-demos/toggle-group/Multiple.vue'
import multipleSrc from '@docs-demos/toggle-group/Multiple.vue?raw'
import Outline from '@docs-demos/toggle-group/Outline.vue'
import outlineSrc from '@docs-demos/toggle-group/Outline.vue?raw'
import Composition from '@docs-demos/toggle-group/Composition.vue'
import compositionSrc from '@docs-demos/toggle-group/Composition.vue?raw'
import Disabled from '@docs-demos/toggle-group/Disabled.vue'
import disabledSrc from '@docs-demos/toggle-group/Disabled.vue?raw'
</script>

# ToggleGroup 分段控制器

<ComponentDoc :meta="toggleGroupMeta" dir="toggle-group">
  <Demo
    title="基础用法（单选分段）"
    anchor="basic"
    description="items prop 声明选项，v-model 受控单值；single 模式为 role=radiogroup、项 role=radio + aria-checked，选中后不反选。Tab 只落在活动项上，方向键移动 roving 焦点（禁用项跳过），Space/Enter 或点击切换。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="多选分段"
    anchor="multiple"
    description="type=multiple：容器 role=group、项 role=button + aria-pressed，v-model 绑定数组，点击即增删；change 与 update:modelValue 同步发出完整数组，适合触发一次过滤请求。"
    :src="multipleSrc"
  >
    <Multiple />
  </Demo>

  <Demo
    title="描边按钮组（outline）"
    anchor="outline"
    description="variant=outline：去掉 sand 轨道，各项为独立描边按钮，选中项转 accent 描边 + accent-soft 底 + accent 文字；适合工具栏等紧凑场景。"
    :src="outlineSrc"
  >
    <Outline />
  </Demo>

  <Demo
    title="手动组合与 item 插槽"
    anchor="composition-demo"
    description="默认插槽手动放置 ToggleItem 子组件（label prop 或默认插槽提供可读名称）；items prop 配合 #item 作用域插槽可渲染图标 + 文本的富内容（图标 svg 须 aria-hidden）。"
    :src="compositionSrc"
  >
    <Composition />
  </Demo>

  <Demo
    title="禁用"
    anchor="disabled"
    description="整组 disabled 拦截一切切换路径（全部项原生 disabled、移出 Tab 序）；items 单项 disabled 时该项禁用且被方向键跳过，roving 落点让位于首个可用项。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>
</ComponentDoc>
