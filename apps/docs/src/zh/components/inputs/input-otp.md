---
title: InputOtp 验证码输入
---

<script setup>
import { inputOtpMeta } from '@ui/components'
import Basic from '@docs-demos/input-otp/Basic.vue'
import basicSrc from '@docs-demos/input-otp/Basic.vue?raw'
import Masked from '@docs-demos/input-otp/Masked.vue'
import maskedSrc from '@docs-demos/input-otp/Masked.vue?raw'
import Modes from '@docs-demos/input-otp/Modes.vue'
import modesSrc from '@docs-demos/input-otp/Modes.vue?raw'
import Separator from '@docs-demos/input-otp/Separator.vue'
import separatorSrc from '@docs-demos/input-otp/Separator.vue?raw'
import States from '@docs-demos/input-otp/States.vue'
import statesSrc from '@docs-demos/input-otp/States.vue?raw'
</script>

# InputOtp 验证码输入

<ComponentDoc :meta="inputOtpMeta" dir="input-otp">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model（string）+ 默认 6 格；逐格键入自动前进，Backspace 在空格子上回退删除前一格，粘贴整段验证码自动分发到后续格位，填满触发 complete（外部初值满格不触发）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="掩码口令"
    anchor="masked"
    description="masked 使全部格子渲染为 type=&quot;password&quot;（逐格掩码）；填满后 complete 触发，提交校验由业务侧接管。"
    :src="maskedSrc"
  >
    <Masked />
  </Demo>

  <Demo
    title="软键盘类型与字符过滤"
    anchor="modes"
    description="inputMode 同时决定软键盘类型与过滤口径：numeric（默认）只接受 0-9 并触发数字软键盘；alphanumeric 接受 0-9 与英文字母；被过滤的字符不产生值变化。"
    :src="modesSrc"
  >
    <Modes />
  </Demo>

  <Demo
    title="分组分隔符"
    anchor="separator"
    description="#separator 渲染于每个间隙（length - 1 处），按装饰处理（aria-hidden=&quot;true&quot;），适合 3+3 等分组形态。"
    :src="separatorSrc"
  >
    <Separator />
  </Demo>

  <Demo
    title="受控回写与校验期间禁用"
    anchor="states-demo"
    description="受控 v-model 下外部改值立即回落各格；填满触发 complete 后模拟提交，校验期间以 disabled 锁定（原生 disabled 移出 Tab 序、拦截输入 / 粘贴 / 键盘路径）。组件不内置 loading / 自动提交（见 meta 何时不用）。"
    :src="statesSrc"
  >
    <States />
  </Demo>
</ComponentDoc>
