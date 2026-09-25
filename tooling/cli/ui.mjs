#!/usr/bin/env node
/**
 * ui —— 「纸面」组件库机器可读 Registry CLI（纯 Node，无第三方依赖）。
 *
 * 知识来源是 registry/*.json（由 registry/ 与 meta.ts 同源生成），本脚本不复制任何组件知识。
 *
 * 用法：
 *   node tooling/cli/ui.mjs list                 列出全部组件（名称 + 分类 + 一句话描述，子组件缩进列出）
 *   node tooling/cli/ui.mjs list components      同上（对齐设计文档 §17 `ui list components`）
 *   node tooling/cli/ui.mjs search <关键词...>   按 name / description / keywords 模糊匹配（多词 AND，命中任一字段即可）
 *   node tooling/cli/ui.mjs inspect <组件名|id>  输出该组件完整 JSON 摘要（intent/props/events/slots/a11y/ssr 等）
 *
 * 退出码：0 成功（search 有命中）；1 用法错误 / 未找到 / search 无命中。
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CLI_DIR = path.dirname(fileURLToPath(import.meta.url))
const REGISTRY = path.resolve(CLI_DIR, '..', '..', 'registry')

// ── Registry 读取（经 index.json 统一入口）─────────────────────
function loadRegistry() {
  const indexPath = path.join(REGISTRY, 'index.json')
  const index = JSON.parse(readFileSync(indexPath, 'utf8'))
  if (index.schemaVersion !== 1) throw new Error(`index.json schemaVersion 应为 1，实际 ${index.schemaVersion}`)
  const components = JSON.parse(readFileSync(path.resolve(REGISTRY, index.components), 'utf8'))
  JSON.parse(readFileSync(path.resolve(REGISTRY, index.tokens), 'utf8')) // tokens 当前命令不消费，但入口必须可解析
  return components
}

/** 展平：主组件 + 子组件，附来源与父子关系。 */
function flatten(components) {
  const items = []
  for (const entry of components.components) {
    items.push({ def: entry, dir: entry.source.dir, parentId: null })
    for (const sub of entry.subComponents ?? []) items.push({ def: sub, dir: entry.source.dir, parentId: entry.id })
  }
  return items
}

const itemName = (item) => item.def.identity.name
const lineFor = (item) => {
  const d = item.def
  const prefix = item.parentId ? '  └ ' : ''
  return `${prefix}${d.identity.name} [${d.id}] (${d.identity.category}) ${d.identity.description}`
}

function usage() {
  console.log(
    [
      '纸面 (Paper) 组件库 CLI —— 读取 registry/ 机器可读知识',
      '',
      '用法: node tooling/cli/ui.mjs <命令> [参数]',
      '',
      '命令:',
      '  list                 列出全部组件（名称 + 分类 + 一句话描述，子组件缩进）',
      '  list components      同 list',
      '  search <关键词...>   按 name/description/keywords 模糊匹配（多词 AND，输出匹配行）',
      '  inspect <组件名|id>  输出该组件完整 JSON 摘要（intent/props/events/slots/a11y/ssr 等）',
    ].join('\n'),
  )
}

// ── 子命令 ─────────────────────────────────────────────────────
function cmdList(components) {
  for (const entry of components.components) {
    console.log(lineFor({ def: entry, dir: entry.source.dir, parentId: null }))
    for (const sub of entry.subComponents ?? []) console.log(lineFor({ def: sub, dir: entry.source.dir, parentId: entry.id }))
  }
  console.error(`[ui] 共 ${components.components.length} 个组件（含子组件 ${flatten(components).length - components.components.length} 个）`)
  return 0
}

function cmdSearch(components, terms) {
  if (terms.length === 0) {
    console.error('[ui] 用法: node tooling/cli/ui.mjs search <关键词...>')
    return 1
  }
  const needles = terms.map((t) => t.toLowerCase())
  const matches = flatten(components).filter((item) => {
    const d = item.def
    const haystack = [
      d.identity.name,
      d.id,
      d.identity.category,
      d.identity.description,
      d.intent?.what ?? '',
      ...(d.agent?.keywords ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return needles.every((n) => haystack.includes(n))
  })
  if (matches.length === 0) {
    console.error(`[ui] 无匹配：${terms.join(' ')}`)
    return 1
  }
  for (const m of matches) console.log(lineFor(m))
  console.error(`[ui] ${matches.length} 个匹配：${terms.join(' ')}`)
  return 0
}

function cmdInspect(components, nameArg) {
  if (!nameArg) {
    console.error('[ui] 用法: node tooling/cli/ui.mjs inspect <组件名|id>')
    return 1
  }
  const key = nameArg.toLowerCase()
  const item = flatten(components).find(
    (x) => x.def.identity.name.toLowerCase() === key || x.def.id.toLowerCase() === key || x.def.identity.export.toLowerCase() === key,
  )
  if (!item) {
    console.error(`[ui] 未找到组件「${nameArg}」。可用组件：${flatten(components).map(itemName).join(', ')}`)
    return 1
  }
  const d = item.def
  const summary = {
    id: d.id,
    version: d.version,
    name: d.identity.name,
    package: d.identity.package,
    export: d.identity.export,
    category: d.identity.category,
    description: d.identity.description,
    intent: d.intent,
    props: d.api.props,
    slots: d.api.slots,
    events: d.api.events,
    exposes: d.api.exposes,
    constraints: d.constraints,
    composition: d.composition,
    states: d.states,
    accessibility: d.accessibility,
    ssr: d.ssr,
    performance: d.performance,
    styling: d.styling,
    examples: d.examples,
    agent: d.agent,
    source: { dir: item.dir, ...(item.parentId ? { partOf: item.parentId } : {}) },
    subComponents: (entry_subIds(components, item) ?? []),
  }
  console.log(JSON.stringify(summary, null, 2))
  return 0
}

/** 主组件条目的子组件 id 列表（inspect 主组件时附带）。 */
function entry_subIds(components, item) {
  if (item.parentId) return null
  const entry = components.components.find((e) => e.source.dir === item.dir && e.id === item.def.id)
  return (entry?.subComponents ?? []).map((s) => ({ id: s.id, name: s.identity.name }))
}

// ── 主入口 ─────────────────────────────────────────────────────
const [, , command, ...rest] = process.argv
if (!command || command === '--help' || command === '-h') {
  usage()
  process.exit(command ? 0 : 1)
}
let components
try {
  components = loadRegistry()
} catch (e) {
  console.error(`[ui] registry 读取失败：${e.message}`)
  process.exit(1)
}
switch (command) {
  case 'list':
    if (rest.length > 0 && rest[0] !== 'components') {
      console.error(`[ui] 未知子命令: list ${rest[0]}（仅支持 list / list components）`)
      process.exit(1)
    }
    process.exit(cmdList(components))
  case 'search':
    process.exit(cmdSearch(components, rest))
  case 'inspect':
    process.exit(cmdInspect(components, rest[0]))
  default:
    console.error(`[ui] 未知命令: ${command}`)
    usage()
    process.exit(1)
}
