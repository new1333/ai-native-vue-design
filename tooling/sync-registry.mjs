#!/usr/bin/env node
/**
 * sync-registry —— 从 packages/components/src 下各组件目录的 Xxx.meta.ts 源文件再生 registry/components.json。
 *
 * 手法说明（轻量 eval 容器 import）：
 *   全部 72 个 meta 文件形状统一（生成器对此做前置断言，偏离即失败）：
 *     import type { ComponentDefinition } from '../shared/meta'   ← 唯一的 import，type-only，无运行时语义
 *     export const meta: ComponentDefinition = { … }              ← 唯一的 export，纯对象字面量
 *   生成器把这两处 TS 语法剥掉（type import 整行删除、`: ComponentDefinition` 注解去除），
 *   得到纯 JS 的 `export default { … }`，经 data:text/javascript URL 动态 import 取回对象，
 *   再做 ComponentDefinition 必填字段形状校验（与 validate-registry 的必填集一致），
 *   保证「解析失败/半解析」只会显式报错，不会静默产出残缺 registry。
 *   不引入任何第三方依赖（仓库 root 无直接依赖可解析 esbuild，node 引擎下限 20.19 也不允许
 *   依赖 type stripping），沿用 validate-registry.mjs 的「纯 Node + 源文件正则读取」精神，
 *   只是把正则升级为整对象求值。
 *
 * 收录规则（与 validate-registry.mjs 的校验语义一致）：
 *   - 每个 packages/components/src 下含 *.meta.ts 的子目录一条记录（shared/ 无 *.meta.ts，不收录）；
 *   - 主记录 = 文件名与目录名同名（忽略大小写）的 meta（如 button/Button.meta.ts），
 *     无同名文件时取排序后第一个（如 typography → Heading.meta.ts，Text.meta.ts 为子组件）；
 *   - 其余 meta 文件全部进 subComponents；source.metaFiles 记录目录全部 meta 文件（排序）。
 *
 * 用法：node tooling/sync-registry.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TOOLING = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(TOOLING, '..')
const COMPONENTS_SRC = path.join(ROOT, 'packages/components/src')
const OUT = path.join(ROOT, 'registry/components.json')

/** ComponentDefinition 必填字段（与 validate-registry.mjs / CONVENTIONS §3 一致）。 */
const REQUIRED_FIELDS = [
  'id',
  'version',
  'identity',
  'intent',
  'api',
  'constraints',
  'composition',
  'states',
  'accessibility',
  'ssr',
  'performance',
  'styling',
  'examples',
  'agent',
]
const API_KEYS = ['props', 'slots', 'events', 'exposes']

const problems = []

/** 形状校验：解析出的对象必须满足 ComponentDefinition 必填集。 */
function assertDef(def, where) {
  for (const key of REQUIRED_FIELDS) {
    if (def[key] === undefined) problems.push(`${where}: 缺少必填字段 ${key}`)
  }
  for (const key of API_KEYS) {
    if (!Array.isArray(def.api?.[key])) problems.push(`${where}: api.${key} 应为数组`)
  }
  if (typeof def.id !== 'string' || def.id.length === 0) problems.push(`${where}: id 非空字符串`)
  if (typeof def.identity?.export !== 'string' || def.identity.export.length === 0)
    problems.push(`${where}: identity.export 非空字符串`)
}

/**
 * 从 meta TS 源文件提取 meta 对象（轻量 eval 容器）。
 * 前置断言文件形状统一：唯一的 type-only import + 唯一的 `export const meta(: ComponentDefinition)? =`。
 */
async function evalMeta(file, rel) {
  const src = readFileSync(file, 'utf8')
  // 1) 剥掉全部 type-only import（对运行时无语义）。
  const stripped = src.replace(/^import type[^\n]*\r?\n?/gm, '')
  if (/^import[\s(]/m.test(stripped)) {
    throw new Error(`${rel}: 存在非 type-only import，轻量容器无法安全求值（请保持 meta 自包含对象字面量）`)
  }
  // 2) `export const meta: ComponentDefinition =` → `export default`（容许省略注解的写法）。
  const decl = /^export const meta(?::\s*ComponentDefinition)?\s*=/m
  const rest = stripped.replace(decl, 'export default')
  if (rest === stripped || !decl.test(stripped)) {
    throw new Error(`${rel}: 未找到唯一的 \`export const meta(: ComponentDefinition)? =\` 声明`)
  }
  if (/^export\s(?!default)/m.test(rest) || /^export default[\s\S]*^export\b/m.test(rest)) {
    throw new Error(`${rel}: 存在额外 export，轻量容器只支持单一 meta 导出`)
  }
  // 3) data URL 动态 import 求值（base64 规避中文与引号编码问题）。
  const url = `data:text/javascript;base64,${Buffer.from(rest, 'utf8').toString('base64')}`
  const mod = await import(url)
  if (typeof mod.default !== 'object' || mod.default === null) {
    throw new Error(`${rel}: 求值结果不是对象`)
  }
  return structuredClone(mod.default)
}

// ── 扫描目录 ───────────────────────────────────────────────────
const dirs = readdirSync(COMPONENTS_SRC, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((name) => readdirSync(path.join(COMPONENTS_SRC, name)).some((f) => f.endsWith('.meta.ts')))
  .sort()

const components = []
let subCount = 0
for (const dir of dirs) {
  const metaFiles = readdirSync(path.join(COMPONENTS_SRC, dir))
    .filter((f) => f.endsWith('.meta.ts'))
    .sort()
  // 主记录：与目录名同名（忽略大小写）的 meta；否则排序第一个（与 validate-registry 判定一致）。
  const primaryFile =
    metaFiles.find((f) => f.toLowerCase() === `${dir.toLowerCase()}.meta.ts`) ?? metaFiles[0]
  const subFiles = metaFiles.filter((f) => f !== primaryFile)

  const primaryDef = await evalMeta(path.join(COMPONENTS_SRC, dir, primaryFile), `${dir}/${primaryFile}`)
  assertDef(primaryDef, `${dir}/${primaryFile}`)
  const subDefs = []
  for (const f of subFiles) {
    const def = await evalMeta(path.join(COMPONENTS_SRC, dir, f), `${dir}/${f}`)
    assertDef(def, `${dir}/${f}`)
    subDefs.push(def)
  }
  subCount += subDefs.length
  components.push({
    ...primaryDef,
    source: { dir, metaFiles },
    ...(subDefs.length > 0 ? { subComponents: subDefs } : { subComponents: [] }),
  })
}

if (problems.length > 0) {
  for (const p of problems) console.error(`[sync-registry] ✗ ${p}`)
  process.exit(1)
}

const registry = {
  schemaVersion: 1,
  source: 'packages/components/src',
  metaContract: 'packages/components/src/shared/meta.ts',
  count: components.length,
  components,
}

const metaFileTotal = components.reduce((n, c) => n + c.source.metaFiles.length, 0)
writeFileSync(OUT, `${JSON.stringify(registry, null, 2)}\n`, 'utf8')
console.log(
  `[sync-registry] 已写入 ${path.relative(ROOT, OUT)}：组件目录 ${dirs.length} 个 → 主记录 ${components.length} 条 + 子组件 ${subCount} 条（meta 文件共 ${metaFileTotal} 个）`,
)
