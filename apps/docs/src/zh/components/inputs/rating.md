---
title: Rating 评分
---

<script setup>
import { ratingMeta } from '@ui/components'
import Basic from '@docs-demos/rating/Basic.vue'
import basicSrc from '@docs-demos/rating/Basic.vue?raw'
import HalfClear from '@docs-demos/rating/HalfClear.vue'
import halfClearSrc from '@docs-demos/rating/HalfClear.vue?raw'
import Readonly from '@docs-demos/rating/Readonly.vue'
import readonlySrc from '@docs-demos/rating/Readonly.vue?raw'
import Controlled from '@docs-demos/rating/Controlled.vue'
import controlledSrc from '@docs-demos/rating/Controlled.vue?raw'
import CustomIcon from '@docs-demos/rating/CustomIcon.vue'
import customIconSrc from '@docs-demos/rating/CustomIcon.vue?raw'
</script>

# Rating 评分

<ComponentDoc :meta="ratingMeta" dir="rating">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model（number，undefined 表示未评分）：悬停任意星档即时预览填充并发出 hoverChange，点击或 Enter/Space 选中，←→↑↓ 方向键以焦点档为基准步进（roving tabindex，焦点随动）。每档为 role='radio' 的原生 button（aria-checked 表达选中），根容器为 role='radiogroup'，aria-label 经 attrs 落在根容器。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="半星与可清除"
    anchor="half-clear"
    description="allowHalf 时每颗星拆为左右两个半档 radio：点左半得 x.5、右半得整数，键盘步进同为 0.5 粒度。clearable 时再次点击当前评分档位即清除，update:modelValue 以 undefined 发出。"
    :src="halfClearSrc"
  >
    <HalfClear />
  </Demo>

  <Demo
    title="只读展示"
    anchor="readonly"
    description="readonly 仅展示评分：悬停/点击/键盘路径全部守卫，档位移出 Tab 序（tabindex=-1）并置 aria-readonly='true'，视觉保持原色。静态展示无需 v-model；Rating 无独立 disabled/loading prop，不可交互态由 readonly 承担。"
    :src="readonlySrc"
  >
    <Readonly />
  </Demo>

  <Demo
    title="受控与 hoverChange"
    anchor="controlled"
    description="视觉完全由受控值派生：改 modelValue 即编程式选中/清除，无需触碰组件实例。hoverChange 为悬停预览回调——进入某档发其值、离开组件发 undefined，可用于联动展示（如气泡提示）；只读态不触发。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>

  <Demo
    title="自定义评分符号"
    anchor="custom-icon"
    description="icon 插槽整体替换默认星形：作用域携带 index（星序号，1 起）、value（该星满值）与 state（full / half / empty），填充呈现由插槽内容自行决定。图标层为 aria-hidden，评分语义仍由组件内 role='radio' 的档位承载。"
    :src="customIconSrc"
  >
    <CustomIcon />
  </Demo>
</ComponentDoc>
