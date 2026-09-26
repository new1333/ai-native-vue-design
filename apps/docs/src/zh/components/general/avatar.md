---
title: Avatar 头像
---

<script setup>
import { avatarMeta } from '@ui/components'
import Basic from '@docs-demos/avatar/Basic.vue'
import basicSrc from '@docs-demos/avatar/Basic.vue?raw'
import Fallback from '@docs-demos/avatar/Fallback.vue'
import fallbackSrc from '@docs-demos/avatar/Fallback.vue?raw'
import Members from '@docs-demos/avatar/Members.vue'
import membersSrc from '@docs-demos/avatar/Members.vue?raw'
</script>

# Avatar 头像

<ComponentDoc :meta="avatarMeta" dir="avatar">
  <Demo
    title="基础用法"
    anchor="basic"
    description="src 图片 + alt 必填（填可读名称而非「头像」），同时传 name 供读屏与回退受益；sm / md / lg 三档全圆尺寸（24 / 32 / 40）。"
    :src="basicSrc"
  >
    <Basic />
  </Demo>

  <Demo
    title="首字母回退与图片失败"
    anchor="fallback"
    description="无 src、空串或加载失败（404）时回退首字母：initials 优先，否则由 name 推导（英文取首末词首字符大写、中文取首字符）；回退态根元素 role=img 以 alt 为 aria-label。"
    :src="fallbackSrc"
  >
    <Fallback />
  </Demo>

  <Demo
    title="成员列表组合"
    anchor="members"
    description="成员列表 / 表格行中的常见组合：Avatar（sm）+ 名称文本 + 状态徽标；空串 src 直接进入首字母回退。"
    :src="membersSrc"
  >
    <Members />
  </Demo>
</ComponentDoc>
