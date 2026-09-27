---
title: Drawer 抽屉
---

<script setup>
import { drawerMeta } from '@ui/components'
import Basic from '@docs-demos/drawer/Basic.vue'
import basicSrc from '@docs-demos/drawer/Basic.vue?raw'
import Sides from '@docs-demos/drawer/Sides.vue'
import sidesSrc from '@docs-demos/drawer/Sides.vue?raw'
import Sizes from '@docs-demos/drawer/Sizes.vue'
import sizesSrc from '@docs-demos/drawer/Sizes.vue?raw'
import NonModal from '@docs-demos/drawer/NonModal.vue'
import nonModalSrc from '@docs-demos/drawer/NonModal.vue?raw'
import Form from '@docs-demos/drawer/Form.vue'
import formSrc from '@docs-demos/drawer/Form.vue?raw'
</script>

# Drawer 抽屉

<ComponentDoc :meta="drawerMeta" dir="drawer">
  <Demo
    title="基础用法"
    anchor="basic"
    description="受控 v-model 驱动显隐：Esc、遮罩、头部内置关闭按钮三条关闭路径都发出 update:modelValue false，close 事件附带来源 reason（esc / scrim / close-button）；模态打开时焦点移入面板并圈定，关闭后还原，#header 插槽提供 aria-labelledby 的可访问名称。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="四向滑出"
    anchor="sides"
    description="side 提供 left / right / top / bottom 四向滑出：left/right 为纵向抽屉（size 作用于宽度），top/bottom 为横向抽屉（size 作用于高度）；面板贴对应边缘滑出，内侧两角带圆角，外侧贴边保持直角。"
    :src="sidesSrc"
  >
    <Sides />
  </Demo>

  <Demo
    title="尺寸档位"
    anchor="sizes"
    description="size 提供 sm / md / lg 三档（≈320 / 448 / 640，由间距标尺推导），只控制滑出轴向的宽/高且永不超出视口；另一轴向始终占满。档位不够用时优先调整内容布局而非强改宽度。"
    :src="sizesSrc"
  >
    <Sizes />
  </Demo>

  <Demo
    title="非模态：与页面并存"
    anchor="non-modal"
    description=":modal=&quot;false&quot; 时无遮罩、不锁定页面滚动、不移入/圈定焦点（无 aria-modal），根层点击穿透，页面照常可交互；Esc 在焦点位于抽屉内时仍可关闭。适合设置面板、大纲目录等并排工作场景。"
    :src="nonModalSrc"
  >
    <NonModal />
  </Demo>

  <Demo
    title="表单模式"
    anchor="form"
    description="close-on-scrim=false 拦截遮罩误触，关闭必须走 footer 的明确动作；#footer 插槽整体接管底部动作区（footer 缺省时抽屉没有底部区域），常见形态是「重置 + 应用」成对出现，且一个 footer 只放一个 primary。"
    :src="formSrc"
  >
    <Form />
  </Demo>
</ComponentDoc>
