---
title: Tree 树形控件
---

<script setup>
import { treeMeta } from '@ui/components'
import Basic from '@docs-demos/tree/Basic.vue'
import basicSrc from '@docs-demos/tree/Basic.vue?raw'
import Multiple from '@docs-demos/tree/Multiple.vue'
import multipleSrc from '@docs-demos/tree/Multiple.vue?raw'
import Checkable from '@docs-demos/tree/Checkable.vue'
import checkableSrc from '@docs-demos/tree/Checkable.vue?raw'
import Controlled from '@docs-demos/tree/Controlled.vue'
import controlledSrc from '@docs-demos/tree/Controlled.vue?raw'
import States from '@docs-demos/tree/States.vue'
import statesSrc from '@docs-demos/tree/States.vue?raw'
import NodeSlot from '@docs-demos/tree/NodeSlot.vue'
import nodeSlotSrc from '@docs-demos/tree/NodeSlot.vue?raw'
</script>

# Tree 树形控件

<ComponentDoc :meta="treeMeta" dir="tree">
  <Demo
    title="基础用法"
    anchor="basic"
    description="嵌套 data 渲染层级；非受控模式下默认展开全部父节点。点击标题选中，点击箭头展开/折叠，键盘 ↑↓ 移动、←→ 折叠/展开、Enter 选中。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="多选与受控选中"
    anchor="multiple"
    description="multiple 时点击节点切换选中（无需修饰键），modelValue 为 string[]，可用 v-model 双向绑定；单选时 modelValue 为 string。"
    :src="multipleSrc"
  >
    <Multiple />
  </Demo>

  <Demo
    title="级联勾选"
    anchor="checkable"
    description="checkable 渲染原生 checkbox：勾选/取消沿可用后代级联传播，祖先按「可用子节点是否全勾」回算，部分勾选呈半选（indeterminate）；禁用节点不参与级联。勾选为组件内状态，全量 checkedKeys 快照经 @check 同步。"
    :src="checkableSrc"
  >
    <Checkable />
  </Demo>

  <Demo
    title="受控展开"
    anchor="controlled"
    description="传入 expandedKeys 即为受控：组件不改动内部状态，每次展开/折叠经 @expand 发出 expandedKeys 快照，由使用方回写（可实现「全部展开/折叠」工具条）。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>

  <Demo
    title="加载、禁用与空态"
    anchor="states"
    description="loading 渲染 3 行骨架行并置 aria-busy；节点声明 disabled 后不可选/不可勾（仍可展开折叠）；data 为空时渲染 empty 插槽（缺省「暂无数据」）。"
    :src="statesSrc"
  >
    <States />
  </Demo>

  <Demo
    title="自定义节点渲染"
    anchor="node-slot"
    description="#node 插槽接管整行标题区：作用域含 node/title/icon/level/expanded/selected/checked/indeterminate/disabled；icon 为 data 透出的字符串标识，图标由使用方以内联 SVG 自绘。"
    :src="nodeSlotSrc"
  >
    <NodeSlot />
  </Demo>
</ComponentDoc>
