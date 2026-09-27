---
title: Layout 布局
---

<script setup>
import { layoutMeta } from '@ui/components'
import Basic from '@docs-demos/layout/Basic.vue'
import basicSrc from '@docs-demos/layout/Basic.vue?raw'
import WithSider from '@docs-demos/layout/WithSider.vue'
import withSiderSrc from '@docs-demos/layout/WithSider.vue?raw'
import Collapsible from '@docs-demos/layout/Collapsible.vue'
import collapsibleSrc from '@docs-demos/layout/Collapsible.vue?raw'
import Controlled from '@docs-demos/layout/Controlled.vue'
import controlledSrc from '@docs-demos/layout/Controlled.vue?raw'
import Breakpoint from '@docs-demos/layout/Breakpoint.vue'
import breakpointSrc from '@docs-demos/layout/Breakpoint.vue?raw'
</script>

# Layout 布局

<ComponentDoc :meta="layoutMeta" dir="layout">
  <Demo
    title="基础用法"
    anchor="basic"
    description="纵向骨架：LayoutHeader（语义 header）+ LayoutContent（语义 main）+ LayoutFooter（语义 footer）按文档流堆叠；主内容区 flex 填充剩余空间，顶栏与页脚为 surface 面加 1px 分隔线。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="带侧栏的经典 SaaS 壳"
    anchor="with-sider"
    description="Layout 的直接子节点出现 LayoutSider（语义 aside）时，根容器自动切横向（has-sider 在渲染期由直接子节点静态推导，SSR 单遍即输出）；右侧再嵌套一层 Layout 承载纵向的顶栏 / 内容 / 页脚。注意：LayoutSider 被真实元素（如 div）包裹时不会触发横向布局。"
    :src="withSiderSrc"
  >
    <WithSider />
  </Demo>

  <Demo
    title="可折叠侧栏（非受控）"
    anchor="collapsible"
    description="collapsible 打开后，侧栏底部出现原生 button 折叠触发器（aria-expanded / aria-controls / aria-label 齐备，Enter/Space 平台级激活）；折叠态由组件内部维护，变化以 sider-collapse（boolean）发出，同值不重复发出。"
    :src="collapsibleSrc"
  >
    <Collapsible />
  </Demo>

  <Demo
    title="受控折叠"
    anchor="controlled"
    description="传入 :collapsed 后组件不写内部状态，折叠变化仅发出 sider-collapse，由使用方回写；外部按钮与内置触发器操作同一份状态。仅初始化态可用 default-collapsed。"
    :src="controlledSrc"
  >
    <Controlled />
  </Demo>

  <Demo
    title="响应式断点"
    anchor="breakpoint"
    description="breakpoint='md' 时在客户端挂载后接线 matchMedia（仅 onMounted，onBeforeUnmount 清理）：视口低于 992px 自动折叠、回到以上自动展开；挂载时已在断点以下则立即折叠。断点值（xs 576 / sm 768 / md 992 / lg 1200 / xl 1600）为行为常量。"
    :src="breakpointSrc"
  >
    <Breakpoint />
  </Demo>
</ComponentDoc>
