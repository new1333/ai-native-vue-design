---
title: Switch 开关
---

<script setup>
import { switchMeta } from '@ui/components'
import Basic from '@docs-demos/switch/Basic.vue'
import basicSrc from '@docs-demos/switch/Basic.vue?raw'
import Sizes from '@docs-demos/switch/Sizes.vue'
import sizesSrc from '@docs-demos/switch/Sizes.vue?raw'
import Loading from '@docs-demos/switch/Loading.vue'
import loadingSrc from '@docs-demos/switch/Loading.vue?raw'
import Disabled from '@docs-demos/switch/Disabled.vue'
import disabledSrc from '@docs-demos/switch/Disabled.vue?raw'
</script>

# Switch 开关

<ComponentDoc :meta="switchMeta" dir="switch">
  <Demo
    title="基础用法"
    anchor="basic"
    description="即时生效的开/关：role='switch' + aria-checked 常驻 true/false；label prop 与默认插槽等价（插槽优先，可带辅助说明），根为 label 元素，点击文本即切换。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="尺寸"
    anchor="sizes"
    description="sm / md 两档，轨道与圆点尺寸全部由 --ui-space-* token 推导；工具栏等紧凑场景用 sm。"
    :src="sizesSrc"
  >
    <Sizes />
  </Demo>

  <Demo
    title="异步与 loading"
    anchor="loading"
    description="异步切换推荐路径：点击 → 置 loading → 完成后回写 modelValue。loading 置 aria-busy 且保持可聚焦（不落 disabled），期间点击/键盘激活一律不切换。"
    :src="loadingSrc"
  >
    <Loading />
  </Demo>

  <Demo
    title="禁用"
    anchor="disabled"
    description="原生 disabled 移出 Tab 序，一切切换路径无效：轨道灰化、圆点去投影、label 转弱色 + not-allowed 光标。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>
</ComponentDoc>
