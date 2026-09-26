---
title: Select 选择器
---

<script setup>
import { selectMeta } from '@ui/components'
import Basic from '@docs-demos/select/Basic.vue'
import basicSrc from '@docs-demos/select/Basic.vue?raw'
import Disabled from '@docs-demos/select/Disabled.vue'
import disabledSrc from '@docs-demos/select/Disabled.vue?raw'
import Clearable from '@docs-demos/select/Clearable.vue'
import clearableSrc from '@docs-demos/select/Clearable.vue?raw'
import Empty from '@docs-demos/select/Empty.vue'
import emptySrc from '@docs-demos/select/Empty.vue?raw'
</script>

# Select 选择器

<ComponentDoc :meta="selectMeta" dir="select">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model（string | number | null），选项为 { label, value, disabled? }[]；value 支持字符串与数字（以 === 匹配），未选时显示 placeholder。id / aria-describedby 等 attrs 直达触发器，可被 label[for] 关联。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="禁用与禁用选项"
    anchor="disabled"
    description="整体 disabled 用原生 disabled（移出 Tab 序、拦截开合与键盘、不渲染清空按钮）；个别选项不可选时用 option.disabled（aria-disabled，不可被高亮/选中，键盘导航自动跳过），而非整体禁用。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  <Demo
    title="可清空"
    anchor="clearable"
    description="clearable 时有已选值且非禁用即显示清空按钮（aria-label「清空」，与折叠箭标互换显示）：点击发出 update:modelValue(null) 与 clear，并把焦点交还触发器。"
    :src="clearableSrc"
  >
    <Clearable />
  </Demo>

  <Demo
    title="空态文案"
    anchor="empty"
    description="options 为空数组时打开弹层即显示 emptyText 兜底文案（默认「暂无选项」），可用作空选项 / 加载中场景。"
    :src="emptySrc"
  >
    <Empty />
  </Demo>
</ComponentDoc>
