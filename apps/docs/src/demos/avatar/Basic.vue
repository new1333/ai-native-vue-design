<script setup lang="ts">
import { Avatar } from '@ui/components'

/** 自包含剪影头像（data URI SVG），demo 不依赖外部图片资源。 */
const PORTRAIT_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5v1H4z"/></svg>'

const portraitSrc = `data:image/svg+xml,${encodeURIComponent(PORTRAIT_SVG)}`
</script>

<template>
  <div class="demo-row">
    <Avatar :src="portraitSrc" alt="林小满" name="林小满" size="sm" />
    <Avatar :src="portraitSrc" alt="沈之衡" name="沈之衡" size="md" />
    <Avatar :src="portraitSrc" alt="赵砚秋" name="赵砚秋" size="lg" />
  </div>
</template>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
  align-items: center;
}
</style>
