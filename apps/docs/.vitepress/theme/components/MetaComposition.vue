<script setup lang="ts">
import type { ComponentDefinition } from '@comp-src/shared/meta'

const props = defineProps<{ composition: ComponentDefinition['composition'] }>()

interface MetaModule { meta: ComponentDefinition }

// 构建期静态扫描：全部组件 meta（identity.name/category）与已交付的文档页
const metaModules = import.meta.glob<MetaModule>('@comp-src/**/*.meta.ts', { eager: true })
const pageKeys = Object.keys(import.meta.glob('../../../src/zh/components/**/*.md'))

/** 已有文档页的目录名集合（glob key 形态不保证前缀，统一用后缀匹配） */
const documentedDirs = new Set(
  pageKeys
    .map(key => key.match(/\/components\/([a-z-]+)\/([a-z-]+)\.md$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map(m => m[2]),
)

/** 展示名 → 文档页路径；仅登记已有文档页的组件（避免死链：build 对内部死链直接失败） */
const LINKS = new Map<string, string>()
for (const [metaPath, mod] of Object.entries(metaModules)) {
  const meta = mod.meta
  if (!meta) continue
  const dir = metaPath.split('/').at(-2) ?? ''
  if (!documentedDirs.has(dir)) continue
  LINKS.set(meta.identity.name, `/components/${meta.identity.category}/${dir}`)
}

/** 相关组件文案与 meta identity.name 不一致的别名（新增此类组件时在此登记） */
const NAME_ALIASES: Record<string, string> = {
  Toast: 'ToastHost',
}

function linkFor(name: string): string | undefined {
  return LINKS.get(NAME_ALIASES[name] ?? name)
}
</script>

<template>
  <section v-if="props.composition.patterns.length || props.composition.related.length" class="ui-docs-comp">
    <h2 id="composition">组合与相关组件</h2>
    <ul v-if="props.composition.patterns.length" class="ui-docs-comp__patterns">
      <li v-for="item in props.composition.patterns" :key="item">{{ item }}</li>
    </ul>
    <div v-if="props.composition.related.length" class="ui-docs-comp__related">
      <span class="ui-docs-comp__label">相关组件</span>
      <template v-for="name in props.composition.related" :key="name">
        <a v-if="linkFor(name)" :href="linkFor(name)" class="ui-docs-comp__chip ui-docs-comp__chip--link">{{ name }}</a>
        <span v-else class="ui-docs-comp__chip">{{ name }}</span>
      </template>
    </div>
    <ul v-if="props.composition.preferred.length" class="ui-docs-comp__preferred">
      <li v-for="item in props.composition.preferred" :key="item">{{ item }}</li>
    </ul>
  </section>
</template>

<style scoped>
.ui-docs-comp__patterns {
  margin: 0 0 var(--ui-space-4);
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--ui-space-2);
}

.ui-docs-comp__patterns li {
  position: relative;
  padding-left: var(--ui-space-5);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-docs-comp__patterns li::before {
  content: '≡';
  position: absolute;
  left: 0;
  color: var(--ui-accent);
}

.ui-docs-comp__related {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-4);
}

.ui-docs-comp__label {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-2);
}

.ui-docs-comp__chip {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  padding: var(--ui-space-1) var(--ui-space-3);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
  font-variant-numeric: var(--ui-numeric);
}

.ui-docs-comp__preferred {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--ui-space-2);
}

.ui-docs-comp__preferred li {
  position: relative;
  padding-left: var(--ui-space-5);
  font-size: var(--ui-text-sm);
  line-height: var(--ui-leading-body);
  color: var(--ui-text-2);
}

.ui-docs-comp__preferred li::before {
  content: '★';
  position: absolute;
  left: 0;
  color: var(--ui-warning);
}

.ui-docs-comp__chip--link {
  text-decoration: none;
  color: var(--ui-accent);
  border-color: var(--ui-accent-soft);
  transition: border-color var(--ui-motion-fast) var(--ui-ease-out),
    background var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-comp__chip--link:hover {
  background: var(--ui-accent-soft);
}
</style>
