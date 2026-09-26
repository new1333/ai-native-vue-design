<script setup lang="ts">
import { Avatar, Badge } from '@ui/components'

/** 自包含剪影头像（data URI SVG），demo 不依赖外部图片资源。 */
const PORTRAIT_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5v1H4z"/></svg>'

const portraitSrc = `data:image/svg+xml,${encodeURIComponent(PORTRAIT_SVG)}`

interface Member {
  name: string
  avatar: string
  statusVariant: 'success' | 'info'
  statusText: string
}

const members: Member[] = [
  { name: '林小满', avatar: portraitSrc, statusVariant: 'success', statusText: '在线' },
  { name: '沈之衡', avatar: portraitSrc, statusVariant: 'info', statusText: '会议中' },
  { name: '赵砚秋', avatar: '', statusVariant: 'success', statusText: '在线' },
]
</script>

<template>
  <div class="demo-stack">
    <div v-for="member in members" :key="member.name" class="demo-member">
      <Avatar :src="member.avatar" :alt="member.name" :name="member.name" size="sm" />
      <span class="demo-member__name">{{ member.name }}</span>
      <Badge :variant="member.statusVariant" dot>{{ member.statusText }}</Badge>
    </div>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-member {
  display: flex;
  gap: var(--ui-space-2);
  align-items: center;
}

.demo-member__name {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
}
</style>
