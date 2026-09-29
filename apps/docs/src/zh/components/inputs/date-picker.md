---
title: DatePicker 日期选择器
---

<script setup>
import { datePickerMeta } from '@ui/components'
import Basic from '@docs-demos/date-picker/Basic.vue'
import basicSrc from '@docs-demos/date-picker/Basic.vue?raw'
import Range from '@docs-demos/date-picker/Range.vue'
import rangeSrc from '@docs-demos/date-picker/Range.vue?raw'
import Constraints from '@docs-demos/date-picker/Constraints.vue'
import constraintsSrc from '@docs-demos/date-picker/Constraints.vue?raw'
import States from '@docs-demos/date-picker/States.vue'
import statesSrc from '@docs-demos/date-picker/States.vue?raw'
</script>

# DatePicker 日期选择器

<ComponentDoc :meta="datePickerMeta" dir="date-picker">
  <Demo
    title="基础用法（date / datetime）"
    anchor="basic"
    description="受控 v-model 为按 format 序列化的字符串（date 默认 YYYY-MM-DD，datetime 默认 YYYY-MM-DD HH:mm），未选为 null。datetime 形态在面板内提供原生时间输入（aria-label「时间」），未设置时间按 00:00 合并；id 等 attrs 直达触发器，可被 label[for] 关联。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="日期范围（range，即 DateRangePicker）"
    anchor="range"
    description="type=&quot;range&quot; 两段式点选：第一击落起点（不关面板不发值），第二击落终点并发 [start, end] 元组（早于起点则重置起点）。panel-footer 插槽渲染在面板底部，作用域携带当前视图 { year, month }。"
    :src="rangeSrc"
  >
    <Range />
  </Demo>

  <Demo
    title="可选范围约束（min / max / disabledDate）"
    anchor="constraints"
    description="固定边界用 min/max（按 format 解析、含端点日），动态规则用 disabledDate（如禁用周末），二者取并集：命中日期渲染为 aria-disabled、点击与键盘 roving 均不可选中。clearable 时触发器右端出现清空按钮（aria-label「清空」）。"
    :src="constraintsSrc"
  >
    <Constraints />
  </Demo>

  <Demo
    title="禁用 / 加载 / 受控"
    anchor="states-demo"
    description="整体 disabled 用原生 disabled（移出 Tab 序、拦截开合与键盘、不渲染清空按钮）；loading 呈现 aria-busy=&quot;true&quot; 与 wait 光标、面板不可打开；受控模式用 :model-value + @update:model-value 显式接管值变化。"
    :src="statesSrc"
  >
    <States />
  </Demo>
</ComponentDoc>
