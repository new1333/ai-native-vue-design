---
title: TreeSelect 树形下拉
---

<script setup>
import { treeSelectMeta } from '@ui/components'
import Basic from '@docs-demos/tree-select/Basic.vue'
import basicSrc from '@docs-demos/tree-select/Basic.vue?raw'
import Multiple from '@docs-demos/tree-select/Multiple.vue'
import multipleSrc from '@docs-demos/tree-select/Multiple.vue?raw'
import Checkable from '@docs-demos/tree-select/Checkable.vue'
import checkableSrc from '@docs-demos/tree-select/Checkable.vue?raw'
import Clearable from '@docs-demos/tree-select/Clearable.vue'
import clearableSrc from '@docs-demos/tree-select/Clearable.vue?raw'
import Disabled from '@docs-demos/tree-select/Disabled.vue'
import disabledSrc from '@docs-demos/tree-select/Disabled.vue?raw'
import Async from '@docs-demos/tree-select/Async.vue'
import asyncSrc from '@docs-demos/tree-select/Async.vue?raw'
import Slots from '@docs-demos/tree-select/Slots.vue'
import slotsSrc from '@docs-demos/tree-select/Slots.vue?raw'
</script>

# TreeSelect 树形下拉

<ComponentDoc :meta="treeSelectMeta" dir="tree-select">
  <Demo
    title="基础用法（单选）"
    anchor="basic"
    description="Select 触发器 + 树面板的组合（§11.6）：受控 v-model（单选值为节点 value | null），options 为嵌套 children 的树；点击可展开节点本身即选中并关闭，点展开箭标仅折叠/展开；打开面板时已选深层节点会自动展开其父链并高亮。id / aria-describedby 等 attrs 直达触发器，可被 label[for] 关联。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="多选（multiple）"
    anchor="multiple"
    description="multiple 时值为数组：点击节点切换选中/取消，面板保持打开可连续选择；触发器以「、」连接已选 label。支持受控回填——外部直接改数组，触发器与节点的 aria-selected 随之同步。"
    :src="multipleSrc"
  >
    <Multiple />
  </Demo>

  <Demo
    title="级联复选（checkable）"
    anchor="checkable"
    description="checkable 时节点渲染复选框（图形 aria-hidden，状态由 aria-checked 承载）：勾选父节点级联展开到全部可选后代，父节点仅在全勾选时记入值、部分勾选为半选（aria-checked 为 mixed）；输出为先序排列的全勾选值集，禁用节点不参与级联。"
    :src="checkableSrc"
  >
    <Checkable />
  </Demo>

  <Demo
    title="可清空"
    anchor="clearable"
    description="clearable 时有已选值且非禁用即显示清空按钮（aria-label「清空」，与折叠箭标互换显示）：点击发出 update:modelValue(null / []) 与 clear、不触发 change，并把焦点交还触发器。"
    :src="clearableSrc"
  >
    <Clearable />
  </Demo>

  <Demo
    title="禁用与禁用节点"
    anchor="disabled"
    description="整体 disabled 用原生 disabled（移出 Tab 序、拦截开合与键盘、不渲染清空按钮）；个别节点不可用时用 option.disabled（aria-disabled，自身与子树均不可选、键盘导航自动跳过、级联复选中不参与勾选），而非整体禁用。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  <Demo
    title="空态与异步加载"
    anchor="async"
    description="无内建 loading prop：options 异步加载中以空数组呈现，面板显示 emptyText（默认「暂无选项」）或 empty 插槽内容，加载完成后正常渲染树节点。"
    :src="asyncSrc"
  >
    <Async />
  </Demo>

  <Demo
    title="自定义插槽"
    anchor="slots"
    description="trigger 插槽自定义触发器文案区（作用域含 displayLabel / labels / open / disabled）；option 插槽自定义节点文案区（作用域含 option / level / expanded / selected / checked / indeterminate / disabled）；折叠箭标、复选框与 treeitem role/aria 仍由组件渲染，键盘与读屏路径不受影响。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>
</ComponentDoc>
