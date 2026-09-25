<script setup lang="ts">
import { Table } from '@ui/components'
import type { TableColumn } from '@ui/components'

interface Member {
  id: number
  name: string
  role: string
  commits: number
}

const columns: TableColumn<Member>[] = [
  { key: 'name', label: '成员' },
  { key: 'role', label: '角色' },
  { key: 'commits', label: '提交数', align: 'right' },
]

const data: Member[] = [
  { id: 1, name: '林一', role: '核心维护', commits: 342 },
  { id: 2, name: '陈二', role: '组件开发', commits: 218 },
  { id: 3, name: '周四', role: '文档与示例', commits: 96 },
]
</script>

<template>
  <Table :columns="columns" :data="data" row-key="id" />
</template>
