---
title: Statistic 统计数值
---

<script setup>
import { statisticMeta } from '@ui/components'
import Basic from '@docs-demos/statistic/Basic.vue'
import basicSrc from '@docs-demos/statistic/Basic.vue?raw'
import Trend from '@docs-demos/statistic/Trend.vue'
import trendSrc from '@docs-demos/statistic/Trend.vue?raw'
import Slots from '@docs-demos/statistic/Slots.vue'
import slotsSrc from '@docs-demos/statistic/Slots.vue?raw'
import Countdown from '@docs-demos/statistic/Countdown.vue'
import countdownSrc from '@docs-demos/statistic/Countdown.vue?raw'
</script>

# Statistic 统计数值

<ComponentDoc :meta="statisticMeta" dir="statistic">
  <Demo
    title="基础用法"
    anchor="basic"
    description="KPI 数值 + 标题 + 前后缀单位：value 以 toFixed(precision) 格式化（非有限数回退 0，precision 收敛为 [0,100] 整数），prefix/suffix 承载货币符号与单位；数字走 --ui-numeric（tabular-nums）等宽排版。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="涨跌趋势"
    anchor="trend"
    description="trend 渲染方向箭头：up 为 --ui-success 色、down 为 --ui-danger 色，箭头以 role=&quot;img&quot; + aria-label（上升/下降）提供方向语义双通道（svg aria-hidden）；trend 是响应式 props，可随数据切换。"
    :src="trendSrc"
  >
    <Trend />
  </Demo>

  <Demo
    title="插槽自定义"
    anchor="slots"
    description="#title / #prefix / #suffix 分别覆盖标题与前/后缀的默认渲染；#default 覆盖数值展示（如千分位分组等组件不做、使用方自行格式化的场景）。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>

  <Demo
    title="倒计时"
    anchor="countdown"
    description="countdown 模式把 value 当作初始剩余秒数，客户端每秒递减（&lt;1h 为 mm:ss、≥1h 为 HH:mm:ss），归零停表并发出一次 finish；value 变更即受控重置（点击预设/重新开始即重置倒计时）；根元素 role=&quot;timer&quot;，precision 在该模式下忽略。"
    :src="countdownSrc"
  >
    <Countdown />
  </Demo>
</ComponentDoc>

Statistic 是纯展示组件：不可聚焦、不进入 Tab 序、无 exposes；倒计时到点的业务动作监听
`finish` 事件，而非外部轮询剩余时间。千分位分组、货币本地化等复杂格式组件不做，
用 `#default` 插槽由使用方渲染（见上方「插槽自定义」）。
