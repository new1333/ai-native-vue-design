---
title: Upload 上传
---

<script setup>
import { uploadMeta } from '@ui/components'
import Basic from '@docs-demos/upload/Basic.vue'
import basicSrc from '@docs-demos/upload/Basic.vue?raw'
import UploadTask from '@docs-demos/upload/UploadTask.vue'
import uploadTaskSrc from '@docs-demos/upload/UploadTask.vue?raw'
import Drag from '@docs-demos/upload/Drag.vue'
import dragSrc from '@docs-demos/upload/Drag.vue?raw'
import States from '@docs-demos/upload/States.vue'
import statesSrc from '@docs-demos/upload/States.vue?raw'
import Slots from '@docs-demos/upload/Slots.vue'
import slotsSrc from '@docs-demos/upload/Slots.vue?raw'
</script>

# Upload 上传

<ComponentDoc :meta="uploadMeta" dir="upload">
  <Demo
    title="基础用法"
    anchor="basic"
    description="点击触发器（原生 button，Enter/Space 激活）选择文件；未提供 beforeUpload 时选择即以上传成功入列。列表完全受控：v-model 绑定全量 UploadFile[]。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="上传任务：进度与失败重试"
    anchor="task"
    description="beforeUpload 返回的 Promise 即上传任务本身：文件先以「上传中 N%」入列（进度条复用 progress 视觉，progressbar aria 契约），resolve 落定成功、reject 落定失败并出现重试按钮；任务期间可通过受控列表推进 percent。"
    :src="uploadTaskSrc"
  >
    <UploadTask />
  </Demo>

  <Demo
    title="拖拽上传"
    anchor="drag"
    description="drag 使触发器变为虚线拖放区并接管 drop；accept（.ext / type/* / type/subtype）在点击与拖拽两条路径上用同一规则过滤；multiple 允许多文件（false 时只取第一个）。"
    :src="dragSrc"
  >
    <Drag />
  </Demo>

  <Demo
    title="禁用、数量上限与受控"
    anchor="states"
    description="disabled 时触发器与条目按钮全部原生 disabled，一切变更路径拦截；maxCount 超限整批拒绝并发出 exceed；列表由外部状态驱动，外部可自由增删条目与推进状态。"
    :src="statesSrc"
  >
    <States />
  </Demo>

  <Demo
    title="自定义触发器、列表与空态"
    anchor="slots"
    description="#trigger 自定义触发器内容（仍在原生 button 内）；#list 接管整个列表（作用域暴露 files）；#empty 在列表为空时渲染占位。"
    :src="slotsSrc"
  >
    <Slots />
  </Demo>
</ComponentDoc>
