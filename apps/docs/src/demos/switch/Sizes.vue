<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@ui/components'

const standard = ref(true)
const compact = ref(false)
</script>

<template>
  <div class="demo-row">
    <Switch v-model="standard" label="md（默认）" />
    <Switch v-model="compact" size="sm" label="sm" />
  </div>
</template>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-4);
  align-items: center;
}
</style>
