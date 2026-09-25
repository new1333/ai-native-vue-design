<script setup lang="ts">
/**
 * ToastHost —— 全局通知宿主：应用挂载一次，Teleport 到 body 固定角落堆叠渲染
 * toast 单例的提示栈（z-index 走 --ui-z-toast token）。
 *
 * - 容器 role=region aria-label=通知；每条提示 role=status（error 为 role=alert）。
 * - 无 props：位置（右上角）、层级与文案均为固定契约（见 meta）。
 * - SSR：挂载前仅输出 hidden 占位（ui-toast 根类），renderToString 无浮层输出；
 *   Teleport 只在客户端激活后生效。
 */
import { onMounted, ref } from 'vue'
import ToastItem from './ToastItem.vue'
import { TOAST_REGION_LABEL } from './ToastHost.constants'
import { toasts } from './toast'
import type { ToastHostProps } from './ToastHost.types'

// 根是「占位 div / Teleport」条件分支（fragment），attrs 不自动继承
defineOptions({ inheritAttrs: false })

defineProps<ToastHostProps>()

/** 客户端已挂载：SSR 期间恒为 false，浮层分支不渲染。 */
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <!-- SSR/挂载前：仅输出隐藏占位（含 ui-toast 根类），不渲染浮层 -->
  <div v-if="!isMounted" class="ui-toast" hidden></div>
  <Teleport v-else to="body">
    <div class="ui-toast" role="region" :aria-label="TOAST_REGION_LABEL">
      <ToastItem v-for="item in toasts" :key="item.id" :item="item" />
    </div>
  </Teleport>
</template>

<style scoped>
/* ── 容器：右上角固定，堆叠列；z-index 走 toast 层级 token ─────────── */
.ui-toast {
  position: fixed;
  top: var(--ui-space-5);
  right: var(--ui-space-5);
  z-index: var(--ui-z-toast);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--ui-space-2);
  pointer-events: none; /* 角落容器不吃指针事件，交互留给具体条目 */
  font-family: var(--ui-font-sans);
}

/* hidden 占位（SSR/挂载前）：显式压制 display，避免被根分支 class 覆盖 */
.ui-toast[hidden] {
  display: none;
}
</style>
