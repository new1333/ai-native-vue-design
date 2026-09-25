<script setup lang="ts">
import { computed } from 'vue'
import paperCss from '@ui/tokens/paper.css?raw'

/**
 * 运行时解析 paper.css 的 :root 块渲染 token 总览：
 * 与 token 文件本身同源，paper.css 变更后无需同步维护本组件。
 */

interface TokenEntry {
  name: string
  value: string
  resolved: string
}

interface TokenGroup {
  title: string
  entries: TokenEntry[]
}

const HEADER_RE = /\/\*\s*─+\s*(.+?)\s*─+\s*\*\//
const VAR_RE = /^\s*(--ui-[a-z0-9-]+)\s*:\s*([^;]+);/
const COLOR_RE = /^(#|rgba?\(|hsla?\()/i

const groups = computed<TokenGroup[]>(() => {
  const rootStart = paperCss.indexOf(':root {')
  const rootEnd = paperCss.indexOf('}', rootStart)
  const block = paperCss.slice(rootStart, rootEnd)

  // 一级 var() 引用解析（semantic → primitive）
  const valueOf = new Map<string, string>()
  for (const line of block.split('\n')) {
    const match = line.match(VAR_RE)
    if (match) valueOf.set(match[1], match[2].trim())
  }
  const resolve = (value: string): string => {
    const inner = value.match(/^var\((--ui-[a-z0-9-]+)\)$/)
    return inner ? (valueOf.get(inner[1]) ?? value) : value
  }

  const result: TokenGroup[] = []
  let current: TokenGroup | null = null
  for (const line of block.split('\n')) {
    const header = line.match(HEADER_RE)
    if (header) {
      current = { title: header[1].trim(), entries: [] }
      result.push(current)
      continue
    }
    const match = line.match(VAR_RE)
    if (!match) continue
    if (!current) {
      current = { title: '其他', entries: [] }
      result.push(current)
    }
    const value = match[2].trim()
    current.entries.push({ name: match[1], value, resolved: resolve(value) })
  }
  return result
})

function isColor(entry: TokenEntry): boolean {
  return COLOR_RE.test(entry.resolved)
}
</script>

<template>
  <div class="ui-docs-tokens">
    <section v-for="group in groups" :key="group.title" class="ui-docs-tokens__group">
      <h3>{{ group.title }}</h3>
      <ul class="ui-docs-tokens__list">
        <li v-for="entry in group.entries" :key="entry.name" class="ui-docs-tokens__item">
          <span
            v-if="isColor(entry)"
            class="ui-docs-tokens__swatch"
            :style="{ backgroundColor: entry.resolved }"
            aria-hidden="true"
          />
          <span v-else class="ui-docs-tokens__plain" aria-hidden="true">{{ entry.resolved }}</span>
          <span class="ui-docs-tokens__name">{{ entry.name }}</span>
          <span class="ui-docs-tokens__value">{{ entry.value }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.ui-docs-tokens__group {
  margin-bottom: var(--ui-space-6);
}

.ui-docs-tokens__group h3 {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-2);
}

.ui-docs-tokens__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--ui-space-2);
}

.ui-docs-tokens__item {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: 'mark mark' 'name value';
  gap: var(--ui-space-1) 0;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  padding: var(--ui-space-3);
}

.ui-docs-tokens__swatch {
  grid-area: mark;
  height: var(--ui-space-6);
  border-radius: var(--ui-radius-xs);
  border: 1px solid var(--ui-border);
}

.ui-docs-tokens__plain {
  grid-area: mark;
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ui-docs-tokens__name {
  grid-area: name;
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-1);
}

.ui-docs-tokens__value {
  grid-area: value;
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
