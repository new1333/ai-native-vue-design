<script setup lang="ts">
import { ref } from 'vue'
import { IconButton, Input, Tooltip } from '@ui/components'

const repo = ref('')
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <div class="demo-field">
        <span id="tooltip-repo-label" class="demo-field__label">仓库名</span>
        <Tooltip placement="bottom">
          <Input v-model="repo" aria-labelledby="tooltip-repo-label" placeholder="owner/repo" />
          <template #content>格式为 owner/repo，暂不支持子分组路径</template>
        </Tooltip>
      </div>
      <Tooltip>
        <IconButton variant="outline" aria-label="删除分支">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </IconButton>
        <template #content>删除该分支，其上未合并的提交将丢失</template>
      </Tooltip>
    </div>
    <p class="demo-hint">
      键盘 Tab 聚焦触发元素同样延迟显示（focusin 路径），失焦或 Esc 立即隐藏；
      打开期间触发元素挂 aria-describedby 指向浮层，读屏据此朗读提示——
      图标按钮的可访问名之外的补充说明正是这个模式。
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-4);
  align-items: flex-end;
}

.demo-field {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.demo-field__label {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}
</style>
