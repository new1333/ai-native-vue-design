#!/usr/bin/env node
/**
 * validate-registry —— registry/*.json 结构校验（纯 Node，无第三方依赖）。
 *
 * 校验内容（任一失败即输出错误并退出码 1）：
 *   1. registry/index.json 可解析：schemaVersion === 1，components/tokens 指针存在且可解析；
 *   2. components.json：每条记录（含 subComponents）id 非空且全局唯一；
 *      必填字段存在：id / identity / intent / api{props,slots,events,exposes} /
 *      constraints / composition / states / accessibility / ssr / performance / styling / agent；
 *   3. 双向一致：packages/components/src 下每个组件目录（含 *.meta.ts 的子目录）
 *      都在 components.json 中，且 components.json 的每个 source.dir 都真实存在；
 *      每个目录的全部 *.meta.ts 都被收录（source.metaFiles 与实际文件一致）；
 *      每条记录（含 subComponents）的 id 能在其声明的 meta 文件中找到（同源抽查）；
 *   4. tokens.json：tokens 数组每项含 name / variable / value / layer，
 *      layer ∈ primitive|semantic|component，variable 以 --ui- 开头且唯一。
 *
 * 用法：node tooling/validate-registry.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TOOLING = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(TOOLING, '..')
const REGISTRY = path.join(ROOT, 'registry')
const COMPONENTS_SRC = path.join(ROOT, 'packages/components/src')

/** 必填字段（设计文档 §9.1 与 docs/CONVENTIONS.md §3 的公共子集，见任务要求）。 */
const REQUIRED_FIELDS = ['id', 'identity', 'intent', 'api', 'constraints', 'composition', 'states', 'accessibility', 'ssr', 'performance', 'styling', 'agent']
const API_KEYS = ['props', 'slots', 'events', 'exposes']
const LAYERS = new Set(['primitive', 'semantic', 'component'])

const errors = []
const fail = (msg) => errors.push(msg)

/** 解析 JSON 文件；失败时记错误并返回 null。 */
function readJson(file, label) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    fail(`${label} 无法解析：${e.message}`)
    return null
  }
}

// ── 1. index.json ──────────────────────────────────────────────
const index = readJson(path.join(REGISTRY, 'index.json'), 'registry/index.json')
let components = null
let tokens = null
if (index) {
  if (index.schemaVersion !== 1) fail(`index.json: schemaVersion 应为 1，实际 ${JSON.stringify(index.schemaVersion)}`)
  for (const key of ['components', 'tokens']) {
    const ptr = index[key]
    if (typeof ptr !== 'string') {
      fail(`index.json: 缺少 ${key} 指针`)
      continue
    }
    const data = readJson(path.resolve(REGISTRY, ptr), `index.json → ${ptr}`)
    if (key === 'components') components = data
    else tokens = data
  }
}

// ── 2/3. components.json 结构 + 与组件目录双向一致 ─────────────
// 实际组件目录 = packages/components/src 下含 *.meta.ts 的子目录（shared 等无 meta 不算）。
const actualDirs = readdirSync(COMPONENTS_SRC, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((name) => readdirSync(path.join(COMPONENTS_SRC, name)).some((f) => f.endsWith('.meta.ts')))
  .sort()

/** 每个 meta 文件里声明的 id（同源抽查用）：相对路径 → id。 */
const metaIdsByFile = new Map()
for (const dir of actualDirs) {
  for (const f of readdirSync(path.join(COMPONENTS_SRC, dir)).filter((x) => x.endsWith('.meta.ts')).sort()) {
    const text = readFileSync(path.join(COMPONENTS_SRC, dir, f), 'utf8')
    const m = text.match(/\bid:\s*'([^']+)'/)
    metaIdsByFile.set(`${dir}/${f}`, m ? m[1] : null)
  }
}

/** 校验一条 ComponentDefinition 的必填字段与 id 唯一性。 */
const seenIds = new Map()
function checkDef(def, where) {
  if (!def || typeof def !== 'object') {
    fail(`${where}: 不是对象`)
    return false
  }
  if (typeof def.id !== 'string' || def.id.length === 0) {
    fail(`${where}: 缺少非空 id`)
  } else if (seenIds.has(def.id)) {
    fail(`${where}: id "${def.id}" 重复（已在 ${seenIds.get(def.id)}）`)
  } else {
    seenIds.set(def.id, where)
  }
  for (const key of REQUIRED_FIELDS) {
    if (def[key] === undefined) fail(`${where}: 缺少必填字段 ${key}`)
  }
  for (const key of API_KEYS) {
    if (!Array.isArray(def.api?.[key])) fail(`${where}: api.${key} 应为数组`)
  }
  return true
}

const regDirs = []
if (components) {
  if (!Array.isArray(components.components)) {
    fail('components.json: 缺少 components 数组')
  } else {
    for (const entry of components.components) {
      const where = `components.json[source=${entry?.source?.dir ?? '?'}]`
      if (!checkDef(entry, where)) continue
      const dir = entry.source?.dir
      if (typeof dir !== 'string' || dir.length === 0) {
        fail(`${where}: 缺少 source.dir`)
        continue
      }
      regDirs.push(dir)
      const declared = Array.isArray(entry.source?.metaFiles) ? [...entry.source.metaFiles].sort() : null
      const actualFiles = actualDirs.includes(dir)
        ? readdirSync(path.join(COMPONENTS_SRC, dir)).filter((f) => f.endsWith('.meta.ts')).sort()
        : []
      if (declared === null) fail(`${where}: 缺少 source.metaFiles`)
      else if (JSON.stringify(declared) !== JSON.stringify(actualFiles))
        fail(`${where}: source.metaFiles [${declared}] 与目录实际 [${actualFiles}] 不一致`)
      // 主记录 id 应来自其主 meta 文件（<Dir>.meta.ts，否则收录文件之一）
      const primaryFile = declared?.find((f) => f.toLowerCase() === `${String(dir).toLowerCase()}.meta.ts`) ?? declared?.[0]
      if (primaryFile && metaIdsByFile.get(`${dir}/${primaryFile}`) !== entry.id)
        fail(`${where}: id "${entry.id}" 与 ${dir}/${primaryFile} 声明的 id（${metaIdsByFile.get(`${dir}/${primaryFile}`)}）不一致`)
      // 子组件
      if (!Array.isArray(entry.subComponents)) fail(`${where}: 缺少 subComponents 数组`)
      else {
        if (entry.subComponents.length !== actualFiles.length - 1)
          fail(`${where}: subComponents ${entry.subComponents.length} 个 ≠ 目录 meta 文件数 ${actualFiles.length} - 1`)
        for (const sub of entry.subComponents) {
          if (!checkDef(sub, `${where}.subComponents`)) continue
          const hit = actualFiles.some((f) => metaIdsByFile.get(`${dir}/${f}`) === sub.id)
          if (!hit) fail(`${where}: 子组件 id "${sub.id}" 在 ${dir}/ 的任何 meta 文件中都不存在`)
        }
      }
    }
  }
}

// 双向一致：目录集合 ↔ registry source.dir 集合
const regDirSet = new Set(regDirs)
if (regDirs.length !== regDirSet.size) fail(`components.json: source.dir 有重复（${regDirs.length} 条 vs ${regDirSet.size} 个唯一值）`)
const missing = actualDirs.filter((d) => !regDirSet.has(d))
const unknown = [...regDirSet].filter((d) => !actualDirs.includes(d))
if (missing.length) fail(`双向不一致：以下组件目录未收录进 components.json：${missing.join(', ')}`)
if (unknown.length) fail(`双向不一致：components.json 引用了不存在的组件目录：${unknown.join(', ')}`)

// ── 4. tokens.json ─────────────────────────────────────────────
let tokenCount = 0
if (tokens) {
  if (!Array.isArray(tokens.tokens)) fail('tokens.json: 缺少 tokens 数组')
  else {
    const seenVars = new Set()
    for (const [i, t] of tokens.tokens.entries()) {
      const where = `tokens.json[${i}]`
      for (const key of ['name', 'variable', 'value', 'layer']) {
        if (typeof t?.[key] !== 'string' || t[key].length === 0) fail(`${where}: 缺少非空 ${key}`)
      }
      if (typeof t?.variable === 'string') {
        if (!t.variable.startsWith('--ui-')) fail(`${where}: variable "${t.variable}" 不以 --ui- 开头`)
        if (seenVars.has(t.variable)) fail(`${where}: variable "${t.variable}" 重复`)
        seenVars.add(t.variable)
      }
      if (typeof t?.layer === 'string' && !LAYERS.has(t.layer)) fail(`${where}: layer "${t.layer}" 不属于 ${[...LAYERS].join('|')}`)
    }
    tokenCount = seenVars.size
  }
}

// ── 结果 ───────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`[validate-registry] ✗ ${e}`)
  console.error(`[validate-registry] 校验失败：${errors.length} 处错误`)
  process.exit(1)
}
console.log(
  `[validate-registry] 通过：index schemaVersion=1；组件目录 ${actualDirs.length} 个 ↔ registry 条目 ${regDirs.length} 条双向一致；` +
    `id 唯一 ${seenIds.size} 个（含子组件）；tokens ${tokenCount} 个（primitive/semantic/component）`,
)
process.exit(0)
