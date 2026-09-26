---
title: Form 表单
---

<script setup>
import { formMeta } from '@ui/components'
import Basic from '@docs-demos/form/Basic.vue'
import basicSrc from '@docs-demos/form/Basic.vue?raw'
import AsyncValidation from '@docs-demos/form/AsyncValidation.vue'
import asyncValidationSrc from '@docs-demos/form/AsyncValidation.vue?raw'
import PendingSubmit from '@docs-demos/form/PendingSubmit.vue'
import pendingSubmitSrc from '@docs-demos/form/PendingSubmit.vue?raw'
import Programmatic from '@docs-demos/form/Programmatic.vue'
import programmaticSrc from '@docs-demos/form/Programmatic.vue?raw'
import StandaloneField from '@docs-demos/form/StandaloneField.vue'
import standaloneFieldSrc from '@docs-demos/form/StandaloneField.vue?raw'
</script>

# Form 表单

<ComponentDoc :meta="formMeta" dir="form">
  <Demo
    title="基础校验提交"
    anchor="basic"
    description="Form 按 rules 全量校验（字段内按序取首个失败文案，字段间并行），全部通过才 emit submit（原生 submit 已 preventDefault，不会引发浏览器原生提交）；FormField 控件务必 v-bind 插槽作用域 controlAttrs，label 关联与 aria-invalid / aria-describedby 才能落位；提交按钮用 type=&quot;submit&quot; 获得原生 Enter 隐式提交路径。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="异步校验"
    anchor="async-validation"
    description="校验函数返回 Promise 即异步校验：进行中作用域 pending=true（提交被拦截、按钮可接 loading），resolve 错误文案则流入对应 FormField。"
    :src="asyncValidationSrc"
  >
    <AsyncValidation />
  </Demo>

  <Demo
    title="pending 拦截重复提交"
    anchor="pending"
    description="异步提交进行中传受控 :pending：此间提交一律拦截（不校验、不 emit submit），插槽作用域 pending 供提交按钮置 loading，天然防重复提交。"
    :src="pendingSubmitSrc"
  >
    <PendingSubmit />
  </Demo>

  <Demo
    title="主动校验与重置"
    anchor="programmatic"
    description="经模板 ref 调用 expose：validate() 触发全量校验并返回错误集合（空对象即全部通过），resetValidation() 清空错误（不改 model 值）。"
    :src="programmaticSrc"
  >
    <Programmatic />
  </Demo>

  <Demo
    title="FormField 独立使用"
    anchor="standalone-field"
    description="无 Form 时 FormField 可独立使用：error prop 自行控制错误展示（空串视为无错误），出现错误时 help 让位、控件经 aria-invalid 联动；也可只用 { id, invalid } 作用域自行绑定；#error 插槽自定义错误文案渲染。"
    :src="standaloneFieldSrc"
  >
    <StandaloneField />
  </Demo>
</ComponentDoc>
