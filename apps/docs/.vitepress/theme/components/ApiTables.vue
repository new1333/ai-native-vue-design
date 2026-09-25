<script setup lang="ts">
import type { ComponentDefinition } from '@comp-src/shared/meta'

const props = defineProps<{ api: ComponentDefinition['api'] }>()
</script>

<template>
  <section class="ui-docs-api">
    <h2>API</h2>

    <template v-if="props.api.props.length">
      <h3>Props</h3>
      <div class="ui-docs-api__scroll">
        <table>
          <thead>
            <tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in props.api.props" :key="item.name">
              <td>
                <code>{{ item.name }}</code>
                <span v-if="item.required" class="ui-docs-api__required">必填</span>
              </td>
              <td><code class="ui-docs-api__type">{{ item.type }}</code></td>
              <td>
                <code v-if="item.default !== undefined">{{ item.default }}</code>
                <span v-else class="ui-docs-api__dash">—</span>
              </td>
              <td>{{ item.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="props.api.slots.length">
      <h3>Slots</h3>
      <div class="ui-docs-api__scroll">
        <table>
          <thead>
            <tr><th>插槽</th><th>作用域</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in props.api.slots" :key="item.name">
              <td><code>{{ item.name }}</code></td>
              <td><code class="ui-docs-api__type">{{ item.scope ?? '—' }}</code></td>
              <td>{{ item.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="props.api.events.length">
      <h3>Events</h3>
      <div class="ui-docs-api__scroll">
        <table>
          <thead>
            <tr><th>事件</th><th>载荷</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in props.api.events" :key="item.name">
              <td><code>{{ item.name }}</code></td>
              <td><code class="ui-docs-api__type">{{ item.payload ?? '—' }}</code></td>
              <td>{{ item.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="props.api.exposes.length">
      <h3>Expose</h3>
      <div class="ui-docs-api__scroll">
        <table>
          <thead>
            <tr><th>成员</th><th>类型</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in props.api.exposes" :key="item.name">
              <td><code>{{ item.name }}</code></td>
              <td><code class="ui-docs-api__type">{{ item.type }}</code></td>
              <td>{{ item.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style scoped>
.ui-docs-api__scroll {
  overflow-x: auto;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--ui-text-sm);
}

th {
  padding: var(--ui-space-2) var(--ui-space-4);
  text-align: left;
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-2);
  background: var(--ui-surface-muted);
  white-space: nowrap;
}

td {
  padding: var(--ui-space-3) var(--ui-space-4);
  border-top: 1px solid var(--ui-border);
  color: var(--ui-text-2);
  line-height: var(--ui-leading-body);
  vertical-align: top;
}

td:first-child {
  white-space: nowrap;
}

code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--ui-text-xs);
  background: var(--ui-surface-muted);
  border-radius: var(--ui-radius-xs);
  padding: var(--ui-space-1) var(--ui-space-2);
  color: var(--ui-text-1);
}

.ui-docs-api__type {
  white-space: normal;
  word-break: break-word;
  color: var(--ui-accent);
  background: var(--ui-accent-soft);
}

.ui-docs-api__required {
  margin-left: var(--ui-space-2);
  font-size: var(--ui-text-xs);
  color: var(--ui-danger);
}

.ui-docs-api__dash {
  color: var(--ui-text-3);
}
</style>
