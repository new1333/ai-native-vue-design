---
title: AutoComplete 自动完成
---

<script setup>
import { autoCompleteMeta } from '@ui/components'
import Basic from '@docs-demos/autocomplete/Basic.vue'
import basicSrc from '@docs-demos/autocomplete/Basic.vue?raw'
import Disabled from '@docs-demos/autocomplete/Disabled.vue'
import disabledSrc from '@docs-demos/autocomplete/Disabled.vue?raw'
import Clearable from '@docs-demos/autocomplete/Clearable.vue'
import clearableSrc from '@docs-demos/autocomplete/Clearable.vue?raw'
import Remote from '@docs-demos/autocomplete/Remote.vue'
import remoteSrc from '@docs-demos/autocomplete/Remote.vue?raw'
import Slots from '@docs-demos/autocomplete/Slots.vue'
import slotsSrc from '@docs-demos/autocomplete/Slots.vue?raw'
</script>

# AutoComplete 自动完成

<ComponentDoc :meta="autoCompleteMeta" dir="autocomplete">
  <Demo
    title="基础用法（本地过滤）"
    anchor="basic"
    description="v-model 即输入框文本（值+文本合一，受控）：选中建议后文本同步为该建议 label，机器值经 select 事件负载的 option.value 获取。filter 缺省为本地包含匹配（不区分大小写）；disabled 建议不可被高亮/选中，键盘导航自动跳过。id / aria-describedby 等 attrs 直达原生 input，可被 label[for] 关联。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="禁用与禁用建议"
    anchor="disabled"
    description="整体 disabled 用原生 disabled（移出 Tab 序、拦截键盘/点击路径、不渲染清空按钮）；个别建议不可选时用 option.disabled（aria-disabled，不可被高亮/选中，↓/↑ 导航自动跳过），而非整体禁用。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  <Demo
    title="可清空"
    anchor="clearable"
    description="clearable 时文本非空且非禁用即显示清空按钮（aria-label「清空」）：点击发出 update:modelValue('') 与 clear，随后走空关键词路径（面板打开 + search('')，远程模式借此重拉全量），焦点交还输入框。"
    :src="clearableSrc"
  >
    <Clearable />
  </Demo>

  <Demo
    title="远程搜索（search + debounce + loading）"
    anchor="remote"
    description="远程模式三件套：filter=false 关闭本地过滤、@search（自带 debounce 防抖，连续击键合并为最后一次）里置 loading 并请求、结果到达后更新 :options。loading 时面板空结果显示「加载中…」行（role=status），listbox 置 aria-busy。"
    :src="remoteSrc"
  >
    <Remote />
  </Demo>

  <Demo
    title="自定义插槽"
    anchor="slots"
    description="option 作用域插槽自定义建议渲染（作用域 { option, index, active }，option 为归一化建议）；prefix/suffix 挂输入框两端（suffix 渲染于清空按钮之后）；empty 自定义空态内容。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>
</ComponentDoc>
