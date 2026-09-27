---
title: Cascader 级联选择
---

<script setup>
import { cascaderMeta } from '@ui/components'
import Basic from '@docs-demos/cascader/Basic.vue'
import basicSrc from '@docs-demos/cascader/Basic.vue?raw'
import Multiple from '@docs-demos/cascader/Multiple.vue'
import multipleSrc from '@docs-demos/cascader/Multiple.vue?raw'
import TriggerModes from '@docs-demos/cascader/TriggerModes.vue'
import triggerModesSrc from '@docs-demos/cascader/TriggerModes.vue?raw'
import Disabled from '@docs-demos/cascader/Disabled.vue'
import disabledSrc from '@docs-demos/cascader/Disabled.vue?raw'
import Empty from '@docs-demos/cascader/Empty.vue'
import emptySrc from '@docs-demos/cascader/Empty.vue?raw'
import Slots from '@docs-demos/cascader/Slots.vue'
import slotsSrc from '@docs-demos/cascader/Slots.vue?raw'
</script>

# Cascader 级联选择

<ComponentDoc :meta="cascaderMeta" dir="cascader">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model 的值是「从根到目标」的路径数组（如 ['cn-zj', 'cn-zj-hz']），不是单个 value；触发器显示路径 label 拼接。options 为 { label, value, disabled?, children? } 嵌套树，children 缺省或空数组视为叶子。id / aria-describedby 等 attrs 直达触发器，可被 label[for] 关联。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="多选"
    anchor="multiple"
    description="multiple 时叶子节点渲染原生 checkbox，modelValue 为路径数组；勾选后弹层保持打开以便连续勾选，取消勾选以移除路径。父节点仅用于逐级展开，不支持勾选聚合（勾父全选子）；禁用叶子不可勾选。"
    :src="multipleSrc"
  >
    <Multiple />
  </Demo>

  <Demo
    title="展开触发与任意层级提交"
    anchor="trigger-modes"
    description="expandTrigger 控制次级面板展开方式：'click'（默认，点击展开）或 'hover'（悬停父级即展开，键盘路径不受影响）。changeOnSelect 开启后允许停在中间层级：点击/Enter 父节点会提交其路径并继续展开下级；默认仅叶子提交，父节点只展开。"
    :src="triggerModesSrc"
  >
    <TriggerModes />
  </Demo>

  <Demo
    title="禁用与禁用节点"
    anchor="disabled"
    description="整体 disabled 用原生 disabled（移出 Tab 序、拦截开合/键盘/悬停）；个别节点不可用时用 option.disabled（aria-disabled=&quot;true&quot;，不可被高亮/悬停展开/选中，键盘导航自动跳过），而非整体禁用。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  <Demo
    title="空态与加载中"
    anchor="empty"
    description="options 为空数组时打开弹层显示 emptyText 兜底文案（默认「暂无选项」），可用作选项异步加载中场景。"
    :src="emptySrc"
  >
    <Empty />
  </Demo>

  <Demo
    title="自定义选项与触发器"
    anchor="slots"
    description="option 插槽（scope：{ option, level, path }）自定义选项内容，行容器的 role / 键盘 / 选中样式仍由组件承担；trigger 插槽（scope：{ paths, labels, multiple }）自定义触发器已选内容。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>
</ComponentDoc>
