---
title: ModelSelector 模型切换器
---

<script setup>
import { modelSelectorMeta } from '@ui/components'
import Basic from '@docs-demos/model-selector/Basic.vue'
import basicSrc from '@docs-demos/model-selector/Basic.vue?raw'
import Disabled from '@docs-demos/model-selector/Disabled.vue'
import disabledSrc from '@docs-demos/model-selector/Disabled.vue?raw'
import Loading from '@docs-demos/model-selector/Loading.vue'
import loadingSrc from '@docs-demos/model-selector/Loading.vue?raw'
import Slots from '@docs-demos/model-selector/Slots.vue'
import slotsSrc from '@docs-demos/model-selector/Slots.vue?raw'
</script>

# ModelSelector 模型切换器

<ComponentDoc :meta="modelSelectorMeta" dir="model-selector">
  <Demo
    title="基础用法"
    anchor="basic"
    description="AI 会话/输入区切换当前模型：受控 v-model（string | number | null），模型项为 { label, value, provider?, disabled? }[]；provider 渲染为 badge 形态徽标，change 载荷为完整模型对象（含 provider/disabled），可据模型能力同步会话状态。id / aria-describedby 等 attrs 直达触发器，可被 label[for] 关联。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="禁用与禁用模型"
    anchor="disabled"
    description="整体 disabled 用原生 disabled（移出 Tab 序、拦截开合与键盘）；个别模型不可选（无权限/配额售罄）时用 model.disabled（aria-disabled，不可被高亮/选中，键盘导航自动跳过），而非整体禁用。"
    :src="disabledSrc"
  >
    <Disabled />
  </Demo>

  <Demo
    title="加载态与空态"
    anchor="loading"
    description="模型列表异步拉取期间置 :loading：打开弹层显示 loadingText（默认「模型列表加载中…」）、不渲染选项、拦截一切选中路径，根级 aria-busy 为 true，触发器保持可开合；models 为空且非加载中时以 emptyText 兜底。"
    :src="loadingSrc"
  >
    <Loading />
  </Demo>

  <Demo
    title="插槽定制"
    anchor="slots"
    description="#option 按条目作用域定制选项内容（scope: model/index/selected/active），缺省渲染 provider 徽标（badge 形态）+ 模型名；#trigger 定制触发器内容（scope: model/open），渲染在触发器 button 内部，role/键盘/aria 仍由组件承载，勿放入可聚焦元素。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>
</ComponentDoc>
