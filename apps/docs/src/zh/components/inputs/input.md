---
title: Input 输入框
---

<script setup>
import { inputMeta } from '@ui/components'
import Basic from '@docs-demos/input/Basic.vue'
import basicSrc from '@docs-demos/input/Basic.vue?raw'
import Password from '@docs-demos/input/Password.vue'
import passwordSrc from '@docs-demos/input/Password.vue?raw'
import Icons from '@docs-demos/input/Icons.vue'
import iconsSrc from '@docs-demos/input/Icons.vue?raw'
import Clearable from '@docs-demos/input/Clearable.vue'
import clearableSrc from '@docs-demos/input/Clearable.vue?raw'
import States from '@docs-demos/input/States.vue'
import statesSrc from '@docs-demos/input/States.vue?raw'
</script>

# Input 输入框

<ComponentDoc :meta="inputMeta" dir="input">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model（string）+ placeholder 占位；placeholder 不替代 label——label 由使用方或 FormField 提供。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="密码与后缀显隐切换"
    anchor="password"
    description="type 支持 'text' | 'password'；密码显隐切换按钮用 #suffix 插槽由使用方实现（meta 推荐组合）。"
    :src="passwordSrc"
  >
    <Password />
  </Demo>

  <Demo
    title="前缀与后缀"
    anchor="icons"
    description="图标与单位走 #prefix / #suffix 插槽：内联 SVG 遵循 viewBox 0 0 24 24、stroke-width 1.5、currentColor，尺寸由组件统一约束。"
    :src="iconsSrc"
  >
    <Icons />
  </Demo>

  <Demo
    title="可清空与限长"
    anchor="clearable"
    description="clearable 在有值且非禁用/只读时显示清空按钮：点击发出 update:modelValue('') 与 clear，焦点交还输入框；maxlength 由浏览器原生截断。"
    :src="clearableSrc"
  >
    <Clearable />
  </Demo>

  <Demo
    title="禁用、只读与错误态"
    anchor="states"
    description="disabled 用原生属性移出 Tab 序；readonly 可聚焦可选中、不可编辑；status='error' 时描边转 danger 并推导 aria-invalid，aria-describedby 经 attrs 直达原生 input。"
    :src="statesSrc"
  >
    <States />
  </Demo>
</ComponentDoc>
