---
title: Textarea 文本域
---

<script setup>
import { textareaMeta } from '@ui/components'
import Basic from '@docs-demos/textarea/Basic.vue'
import basicSrc from '@docs-demos/textarea/Basic.vue?raw'
import Count from '@docs-demos/textarea/Count.vue'
import countSrc from '@docs-demos/textarea/Count.vue?raw'
import Resize from '@docs-demos/textarea/Resize.vue'
import resizeSrc from '@docs-demos/textarea/Resize.vue?raw'
import States from '@docs-demos/textarea/States.vue'
import statesSrc from '@docs-demos/textarea/States.vue?raw'
</script>

# Textarea 文本域

<ComponentDoc :meta="textareaMeta" dir="textarea">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model（string）+ rows 决定初始可见行数；默认 resize='vertical'，仅可垂直拉伸，不破坏容器栅格。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="字数统计"
    anchor="count"
    description="maxlength + showCount 在右下角显示 x/y 字数（弱文字，读屏可感知）；无 maxlength 时仅显示当前长度 x，超长截断由浏览器原生 maxlength 完成。"
    :src="countSrc"
  >
    <Count />
  </Demo>

  <Demo
    title="拉伸方向"
    anchor="resize"
    description="resize 支持 'vertical'（默认）与 'none' 两档；'none' 锁定固定尺寸，与 rows 搭配适合只读摘要等固定栅格场景。"
    :src="resizeSrc"
  >
    <Resize />
  </Demo>

  <Demo
    title="禁用、只读与错误态"
    anchor="states-demo"
    description="disabled 用原生属性移出 Tab 序；readonly 可聚焦可选中、不可编辑；status='error' 时描边转 danger 并推导 aria-invalid，错误文案与 aria-describedby 由使用方经 attrs 关联。"
    :src="statesSrc"
  >
    <States />
  </Demo>
</ComponentDoc>
