<script setup lang="ts">
/**
 * Timeline —— 时间线/事件流：节点 + 连线的事件列表（纯展示，无 emits）。
 *
 * - 结构语义：ol（role="list"）+ li（role="listitem"）；显式 role 用于抵消
 *   list-style: none / 非 list-item display 在部分读屏器（Safari VoiceOver）下
 *   丢失的列表语义（WAI-ARIA list/listitem）。
 * - 布局：'left' 连线靠左、内容居右；'alternate' 中轴两侧按奇偶交替
 *   （偶数下标内容居右、奇数下标居左且右对齐朝向中轴）。
 * - 连线由每个 li 的 ::before 纵贯全高、相邻项首尾相接而成：项间距用
 *   padding-bottom（而非 gap/margin）保证不断线；首项线自节点圆心起、
 *   末项线隐藏（其后无节点可连）。
 * - pending（幽灵）节点：末尾追加 accent 脉冲点 + 内置文案，表达"进行中"；
 *   脉冲为 transform/opacity 白名单动效（加载语义无限循环豁免，
 *   Progress indeterminate 同策略），prefers-reduced-motion 降级为静态实心点。
 * - 节点与连线颜色按任务要求直接取 --ui-color-* 原始色板；其余文字/间距/
 *   字号消费语义 token。不访问任何浏览器 API，SSR 安全。
 */
import { computed, useSlots } from 'vue'
import { TIMELINE_MODE_DEFAULT, TIMELINE_PENDING_TEXT } from './Timeline.constants'
import type { TimelineItem, TimelineProps, TimelineSlots } from './Timeline.types'

const props = withDefaults(defineProps<TimelineProps>(), {
  mode: TIMELINE_MODE_DEFAULT,
  pending: false,
})
defineSlots<TimelineSlots>()

const slots = useSlots()

const rootClasses = computed(() => [
  'ui-timeline',
  { 'ui-timeline--alternate': props.mode === 'alternate' },
])

/** 稳定 v-for 键：item.key 优先，缺省回落渲染下标。 */
function itemKey(item: TimelineItem, index: number): string | number {
  return item.key ?? index
}

/**
 * alternate 档位下按下标奇偶交替内容侧：偶数下标（含 pending，其下标取
 * items.length）内容居右（默认），奇数下标加 --left-side 修饰类居左。
 */
function itemClasses(index: number): Record<string, boolean> {
  return {
    'ui-timeline__item--left-side': props.mode === 'alternate' && index % 2 === 1,
  }
}
</script>

<template>
  <div :class="rootClasses">
    <ol class="ui-timeline__list" role="list">
      <li
        v-for="(item, index) in items"
        :key="itemKey(item, index)"
        class="ui-timeline__item"
        :class="itemClasses(index)"
        role="listitem"
      >
        <div class="ui-timeline__dot">
          <slot name="dot" :item="item" :index="index" :pending="false">
            <span class="ui-timeline__dot-core" />
          </slot>
        </div>
        <div class="ui-timeline__content">
          <slot name="item" :item="item" :index="index">
            <div class="ui-timeline__title">{{ item.title }}</div>
            <div v-if="item.description" class="ui-timeline__description">{{ item.description }}</div>
            <div v-if="item.time" class="ui-timeline__time">{{ item.time }}</div>
          </slot>
        </div>
      </li>
      <li
        v-if="pending"
        class="ui-timeline__item ui-timeline__item--pending"
        :class="itemClasses(items.length)"
        role="listitem"
      >
        <div class="ui-timeline__dot">
          <slot name="dot" :index="items.length" :pending="true">
            <span class="ui-timeline__dot-core ui-timeline__dot-core--pending" />
          </slot>
        </div>
        <div class="ui-timeline__content ui-timeline__content--pending">{{ TIMELINE_PENDING_TEXT }}</div>
      </li>
    </ol>
    <div v-if="slots.footer" class="ui-timeline__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/* ── 根 ─────────────────────────────────────────────────── */
.ui-timeline {
  font-family: var(--ui-font-sans);
  color: var(--ui-text-1);
}

/* ── 列表：去除 ol 默认序号与缩进（结构重置，非视觉取值）── */
.ui-timeline__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* ── 项：节点列 + 内容列。项间距用 padding-bottom（而非 gap/margin）：
   连线由每项 ::before 纵贯全高拼成，外距会在项间产生断线。 ── */
.ui-timeline__item {
  position: relative;
  display: grid;
  grid-template-columns: var(--ui-space-2) minmax(0, 1fr);
  column-gap: var(--ui-space-3);
  padding-bottom: var(--ui-space-5);
}

.ui-timeline__item:last-child {
  padding-bottom: 0;
}

/* ── 连线：纵贯每项全高、相邻项首尾相接。
   1px 为结构性细线宽度（无 --ui-border-width token，先例 Table 外框；
   已在任务结果中提出 token 需求），非视觉色值。 ── */
.ui-timeline__item::before {
  content: '';
  position: absolute;
  left: calc(var(--ui-space-2) / 2);
  top: 0;
  bottom: 0;
  width: 1px;
  transform: translateX(-50%);
  background-color: var(--ui-color-line);
}

/* 首项：线自节点圆心起（圆心高 = 节点盒高度一半，节点盒与标题首行等高）。 */
.ui-timeline__item:first-child::before {
  top: calc(var(--ui-text-md) * var(--ui-leading-small) / 2);
}

/* 末项：线止于节点圆心，其后无节点可连（pending 节点若在，同为末项）。 */
.ui-timeline__item:last-child::before {
  display: none;
}

/* ── 节点盒：与标题首行等高并垂直居中，使圆点对齐首行文字；
   position 定位使其绘制于同项 ::before 连线之上。 ── */
.ui-timeline__dot {
  grid-row: 1;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--ui-text-md) * var(--ui-leading-small));
}

/* ── 圆点：直径 space-2；圆半径 = 尺寸一半（Avatar 圆形同策略）。 ── */
.ui-timeline__dot-core {
  flex: none;
  width: var(--ui-space-2);
  height: var(--ui-space-2);
  border-radius: calc(var(--ui-space-2) / 2);
  background-color: var(--ui-color-ink-400);
}

/* ── pending 圆点：accent 实心 + 外扩脉冲环（transform/opacity 白名单动效，
   加载语义无限循环豁免）；时长由 --ui-motion-default 推导（≈2s）。 ── */
.ui-timeline__dot-core--pending {
  position: relative;
  background-color: var(--ui-color-pine-600);
}

.ui-timeline__dot-core--pending::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--ui-color-pine-600);
  animation: ui-timeline-pending calc(var(--ui-motion-default) * 11) var(--ui-ease-out) infinite;
}

@keyframes ui-timeline-pending {
  from {
    transform: scale(1);
    opacity: 0.4; /* 透明度非禁令枚举项（颜色/字号/间距/圆角/阴影/时长/z-index），Table shimmer 先例 */
  }

  to {
    transform: scale(1.875); /* 外扩至 15px（space-1 + space-2 之和）的倍率；transform 白名单动效 */
    opacity: 0;
  }
}

/* reduced-motion：停用脉冲，降级为静态实心点（Progress indeterminate 同策略） */
@media (prefers-reduced-motion: reduce) {
  .ui-timeline__dot-core--pending::after {
    display: none;
  }
}

/* ── 内容：标题 text-1/medium，说明 text-2，时间 text-3 + tabular-nums ── */
.ui-timeline__content {
  grid-row: 1;
  min-width: 0;
}

.ui-timeline__title {
  color: var(--ui-text-1);
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-medium);
  line-height: var(--ui-leading-small);
}

.ui-timeline__description {
  margin-top: var(--ui-space-1);
  color: var(--ui-text-2);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
}

.ui-timeline__time {
  margin-top: var(--ui-space-1);
  color: var(--ui-text-3);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  font-variant-numeric: var(--ui-numeric);
}

/* ── pending（幽灵）节点默认文案：弱化展示 ────────────────── */
.ui-timeline__content--pending {
  color: var(--ui-text-3);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-small);
}

/* ── alternate：中轴两侧交替（中列 = 节点列，连线过中列圆心）。
   两侧 1fr 相等使中列恒居中，线位 left: 50% 即节点圆心。 ── */
.ui-timeline--alternate .ui-timeline__item {
  grid-template-columns: minmax(0, 1fr) var(--ui-space-2) minmax(0, 1fr);
}

.ui-timeline--alternate .ui-timeline__item::before {
  left: 50%;
}

.ui-timeline--alternate .ui-timeline__dot {
  grid-column: 2;
}

.ui-timeline--alternate .ui-timeline__content {
  grid-column: 3;
}

/* 奇数下标内容居左、右对齐朝向中轴（时间线交替布局惯例）。 */
.ui-timeline--alternate .ui-timeline__item--left-side .ui-timeline__content {
  grid-column: 1;
  text-align: right;
}

/* ── footer：列表之下的附加区；left 档与内容列左缘对齐 ────── */
.ui-timeline__footer {
  margin-top: var(--ui-space-4);
}

.ui-timeline:not(.ui-timeline--alternate) .ui-timeline__footer {
  margin-left: calc(var(--ui-space-2) + var(--ui-space-3));
}
</style>
