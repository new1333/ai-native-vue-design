<script setup lang="ts">
/**
 * Avatar —— 头像组件：src 图片 + 加载失败/缺省时回退首字母
 * （initials prop 优先，否则由 name 推导）。
 *
 * - 图片错误经模板 @error 监听处理：监听器仅随渲染树在客户端挂载，
 *   setup 与模块顶层不访问任何浏览器 API，SSR（renderToString）安全。
 * - 回退态：根元素 role="img" + aria-label（alt），首字母文本 aria-hidden，
 *   底色 --ui-surface-muted、文字 --ui-text-2。
 * - 一切颜色、字号、尺寸、圆角均消费 var(--ui-*) token（paper.css）。
 */
import { computed, ref, watch } from 'vue'
import { AVATAR_SIZE_DEFAULT, deriveInitials } from './Avatar.constants'
import type { AvatarProps } from './Avatar.types'

const props = withDefaults(defineProps<AvatarProps>(), {
  size: AVATAR_SIZE_DEFAULT,
})

/** 图片加载失败标记：进入回退态；src 变化时复位重试新图。 */
const failed = ref(false)

watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

/** 展示图片：src 有效且未失败；否则回退首字母。 */
const showImage = computed(() => typeof props.src === 'string' && props.src !== '' && !failed.value)

const fallbackInitials = computed(() => props.initials ?? deriveInitials(props.name ?? ''))

const classes = computed(() => ['ui-avatar', `ui-avatar--${props.size}`])

/** <img> 加载失败（模板 @error，仅客户端触发）：转入首字母回退态。 */
function onImgError(): void {
  failed.value = true
}
</script>

<template>
  <span
    :class="classes"
    :role="showImage ? undefined : 'img'"
    :aria-label="showImage ? undefined : alt"
  >
    <img
      v-if="showImage"
      class="ui-avatar__img"
      :src="src"
      :alt="alt"
      @error="onImgError"
    >
    <span v-else class="ui-avatar__fallback" aria-hidden="true">{{ fallbackInitials }}</span>
  </span>
</template>

<style scoped>
/* ── 基底：全圆头像，尺寸/字号由尺寸档位的局部变量统一驱动 ── */
.ui-avatar {
  /* 尺寸档位局部变量（默认 md 档）：盒子 32px、字号 13px，全部由 token 组成 */
  --ui-avatar-box: var(--ui-space-6);
  --ui-avatar-font: var(--ui-text-sm);
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--ui-avatar-box);
  height: var(--ui-avatar-box);
  /* 全圆：取盒子一半的圆角即为正圆（由 token 组成，无圆角 token 可直接表达全圆） */
  border-radius: calc(var(--ui-avatar-box) / 2);
  overflow: hidden;
  /* 回退底色/文字：surface-muted 底 + text-2 文字 */
  background-color: var(--ui-surface-muted);
  color: var(--ui-text-2);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-avatar-font);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
}

/* ── 尺寸档位：sm 24px / md 32px / lg 40px（40 = 32 + 8，由 token 计算组成）── */
.ui-avatar--sm {
  --ui-avatar-box: var(--ui-space-5);
  --ui-avatar-font: var(--ui-text-xs);
}

.ui-avatar--md {
  --ui-avatar-box: var(--ui-space-6);
  --ui-avatar-font: var(--ui-text-sm);
}

.ui-avatar--lg {
  --ui-avatar-box: calc(var(--ui-space-6) + var(--ui-space-2));
  --ui-avatar-font: var(--ui-text-md);
}

/* ── 图片：铺满圆形裁剪容器 ─────────────────────────────── */
.ui-avatar__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 结构性裁剪方式：非颜色/间距/字号取值 */
}

/* ── 首字母回退：装饰性文本，可读名称由根元素 aria-label 承担 ── */
.ui-avatar__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
