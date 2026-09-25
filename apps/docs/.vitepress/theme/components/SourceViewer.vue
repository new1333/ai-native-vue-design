<script setup lang="ts">
import { reactive, ref } from 'vue'
import { highlight } from '../highlight'

/**
 * 组件源码查看器：按目录懒加载 packages/components/src/<dir>/ 下的源文件
 * （?raw 文本），排除测试与 meta（meta 已由页面 API 部分呈现）。
 * glob 基于构建期静态扫描：新增源文件无需改本组件即可出现。
 */
const props = defineProps<{ dir: string }>()

const GITHUB_BASE = 'https://github.com/new1333/ai-native-vue-design/blob/main/packages/components/src/'

// glob pattern 走 '@comp-src' alias；vite 会把 key 归一化为「相对本文件」或 alias 形态，
// 因此过滤用与形态无关的路径子串，不做前缀匹配。
const modules = import.meta.glob<string>('@comp-src/**/*.{vue,ts}', {
  query: '?raw',
  import: 'default',
})

function pascalize(dir: string): string {
  return dir.replace(/(^|-)([a-z])/g, (_, __, char: string) => char.toUpperCase())
}

interface SourceFile {
  key: string
  name: string
  order: number
  github: string
}

const files: SourceFile[] = Object.keys(modules)
  .filter(key => key.includes(`/components/src/${props.dir}/`))
  .filter(key => !/\.spec\.ts$/.test(key) && !/\.meta\.ts$/.test(key))
  .map((key) => {
    const name = key.slice(key.lastIndexOf('/') + 1)
    const main = `${pascalize(props.dir)}.vue`
    return {
      key,
      name,
      order: name === main ? 0 : name.endsWith('.vue') ? 1 : 2,
      github: `${GITHUB_BASE}${props.dir}/${name}`,
    }
  })
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

const open = reactive<Record<string, boolean>>({})
const sources = reactive<Record<string, string>>({})
const rendered = reactive<Record<string, string>>({})
const loading = ref(false)

function langOf(name: string): string {
  return name.endsWith('.vue') ? 'vue' : 'ts'
}

async function toggle(key: string): Promise<void> {
  if (open[key]) {
    open[key] = false
    return
  }
  if (!(key in rendered)) {
    loading.value = true
    try {
      const raw = await modules[key]()
      sources[key] = raw
      rendered[key] = await highlight(raw, langOf(key))
    } finally {
      loading.value = false
    }
  }
  open[key] = true
}
</script>

<template>
  <section class="ui-docs-source">
    <h2 id="source">组件源码</h2>
    <p class="ui-docs-source__hint">
      目录内源文件按需展开（测试与 meta 省略；meta 契约已由上方 API 部分呈现）。
    </p>
    <div v-for="file in files" :key="file.key" class="ui-docs-source__file">
      <div class="ui-docs-source__row">
        <button type="button" class="ui-docs-source__toggle" @click="toggle(file.key)">
          <span class="ui-docs-source__arrow" :data-open="open[file.key] ? 'true' : undefined">▸</span>
          <span class="ui-docs-source__name">{{ file.name }}</span>
        </button>
        <a
          class="ui-docs-source__gh"
          :href="file.github"
          target="_blank"
          rel="noopener noreferrer"
        >在 GitHub 查看</a>
      </div>
      <!-- v-html 为 shiki 输出（本仓库组件源码，可信内容） -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="open[file.key] && rendered[file.key]" class="ui-docs-source__code" v-html="rendered[file.key]" />
      <p v-else-if="open[file.key] && loading" class="ui-docs-source__hint">源码加载中…</p>
    </div>
  </section>
</template>

<style scoped>
.ui-docs-source__hint {
  font-size: var(--ui-text-sm);
  color: var(--ui-text-3);
}

.ui-docs-source__file {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  margin-bottom: var(--ui-space-2);
  overflow: hidden;
}

.ui-docs-source__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  padding: var(--ui-space-2) var(--ui-space-3);
  background: var(--ui-surface-muted);
}

.ui-docs-source__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  border: none;
  background: transparent;
  padding: var(--ui-space-1) var(--ui-space-2);
  font-size: var(--ui-text-sm);
  color: var(--ui-text-1);
  cursor: pointer;
  border-radius: var(--ui-radius-sm);
}

.ui-docs-source__toggle:hover {
  color: var(--ui-accent);
}

.ui-docs-source__arrow {
  color: var(--ui-text-3);
  transition: transform var(--ui-motion-fast) var(--ui-ease-out);
}

.ui-docs-source__arrow[data-open='true'] {
  transform: rotate(90deg);
}

.ui-docs-source__name {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-sm);
}

.ui-docs-source__gh {
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
  text-decoration: none;
  white-space: nowrap;
}

.ui-docs-source__gh:hover {
  color: var(--ui-accent);
}

.ui-docs-source__code {
  padding: var(--ui-space-4);
  background: var(--ui-color-ink-950);
  color: var(--ui-color-paper);
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  line-height: var(--ui-leading-body);
  overflow-x: auto;
  max-height: 480px;
  overflow-y: auto;
}

/* shiki pre 自带 inline 背景（github-dark 默认底）：统一压回 ink-950 token */
.ui-docs-source__code :deep(pre.shiki) {
  margin: 0;
  padding: 0;
  background-color: var(--ui-color-ink-950) !important;
}
</style>
