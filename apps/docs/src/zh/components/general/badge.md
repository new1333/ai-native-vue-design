---
title: Badge 徽标
---

<script setup>
import { badgeMeta } from '@ui/components'
import Basic from '@docs-demos/badge/Basic.vue'
import basicSrc from '@docs-demos/badge/Basic.vue?raw'
import Dot from '@docs-demos/badge/Dot.vue'
import dotSrc from '@docs-demos/badge/Dot.vue?raw'
</script>

# Badge 徽标

<ComponentDoc :meta="badgeMeta" dir="badge">
  <Demo
    title="语义档位"
    anchor="basic"
    description="variant 五档：neutral（默认）取 surface-muted 底 + text-2 文字，success / warning / danger / info 为 soft 底 + 同系文字色；纯展示、不可聚焦、无交互。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="前置圆点"
    anchor="dot"
    description="dot 前置小圆点（aria-hidden 装饰，颜色随同系文字色），适合运行中 / 在线等轻量活状态；状态语义仍由文本承载，不要只靠圆点传达。"
    :src="dotSrc"
  >
    <Dot />
  </Demo>
</ComponentDoc>
