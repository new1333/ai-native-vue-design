<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@ui/components'
import type { TreeSelectModelValue, TreeSelectOption } from '@ui/components'

/** demo 侧的扩展节点：在 TreeSelectOption 基础上附加 headcount，children 同步覆盖为扩展节点，避免嵌套字面量被收窄回 TreeSelectOption。 */
type CountedOption = TreeSelectOption & {
  headcount?: number
  children?: CountedOption[]
}

const teams: CountedOption[] = [
  {
    label: '研发部',
    value: 'rd',
    headcount: 32,
    children: [
      { label: '前端组', value: 'fe', headcount: 12 },
      { label: '后端组', value: 'be', headcount: 20 },
    ],
  },
  {
    label: '设计部',
    value: 'design',
    headcount: 8,
    children: [{ label: '视觉组', value: 'visual', headcount: 8 }],
  },
  { label: '运营部', value: 'ops', headcount: 5 },
]

const team = ref<TreeSelectModelValue>(null)

/** 从 option 插槽作用域安全读取扩展字段（slot scope 的静态类型是 TreeSelectOption）。 */
function headcount(option: TreeSelectOption): number | null {
  return 'headcount' in option && typeof option.headcount === 'number' ? option.headcount : null
}
</script>

<template>
  <div class="demo-stack">
    <TreeSelect v-model="team" :options="teams" placeholder="选择团队">
      <template #trigger="{ displayLabel, open }">
        <span class="demo-trigger" :class="{ 'demo-trigger--open': open }">
          {{ displayLabel }}（{{ open ? '展开中' : '收起' }}）
        </span>
      </template>
      <template #option="{ option }">
        <span class="demo-option">
          {{ option.label }}
          <output v-if="headcount(option) !== null" class="demo-option__badge">
            {{ headcount(option) }} 人
          </output>
        </span>
      </template>
    </TreeSelect>
    <p class="demo-hint">
      当前值：<code>{{ team ?? 'null（未选）' }}</code>
      （trigger 插槽自定义触发器文案区，作用域含 displayLabel / labels / open / disabled；
      option 插槽自定义节点文案区，作用域含 option / level / expanded / selected / checked 等；
      折叠箭标、复选框与 treeitem role/aria 仍由组件渲染，键盘与读屏路径不受影响）
    </p>
  </div>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.demo-stack :deep(.ui-tree-select) {
  width: calc(var(--ui-space-8) * 3);
}

.demo-trigger {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--ui-font-weight-medium);
}

.demo-trigger--open {
  color: var(--ui-accent);
}

.demo-option {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
}

.demo-option__badge {
  border-radius: var(--ui-radius-sm);
  background-color: var(--ui-accent-soft);
  color: var(--ui-accent);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-small);
  padding: 0 var(--ui-space-2);
}

.demo-hint {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.demo-hint code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
}
</style>
