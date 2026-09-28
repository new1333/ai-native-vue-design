/// <reference types="vite/client" />
/**
 * contract.spec.ts —— meta 契约对账（Task：types.ts ↔ meta.api ↔ 目录出口三份真相由机器对账）。
 *
 * 对账以「实现为真相」：
 *   - SFC 经 @vitejs/plugin-vue 编译后，类型式 defineProps/withDefaults 与 defineEmits 会固化为
 *     组件对象上的运行时 props 选项（含 default）与 emits 数组，本 spec 以其为基准；
 *   - 每个 Xxx.meta.ts 按 meta.identity.export 在同目录 index.ts 出口中解析组件，
 *     对 api.props / api.events 做双向集合对账，default 做宽松对账。
 *
 * 结构性规则（统一适用，非逐组件豁免）：
 *   1. 覆盖范围 = packages/components/src 下各组件目录的全部 `Xxx.meta.ts` 文件（shared/ 只有
 *      meta.ts 接口定义，文件名不以 `.meta.ts` 结尾，天然不在范围）；glob 结果必须与磁盘清单一致，
 *      防 glob 模式漂移静默漏检。
 *   2. 复合组件目录（一个 meta 描述多个同目录组件，如 menu、tabs、layout、toggle-group）的
 *      meta.api.props 以「组件名.成员」限定命名（见各 meta 头注释约定）：
 *        - `MenuItem.value` 形式的条目对账到同目录出口中名为 MenuItem 的组件；
 *        - 不带前缀的条目对账到 identity.export 组件（根组件）；
 *        - 根组件的运行时 prop 允许以裸名或 `根导出名.` 前缀收录，其余组件只认各自前缀。
 *   3. 对账范围限定为「identity.export 组件 + 被 `组件名.` 前缀实际引用到的组件」；
 *      同目录中未被引用的其他 SFC 出口（如 button/ButtonRoot 这类无样式交互根、纯透传子组件）
 *      不属于该 meta 的契约面，不参与对账——此规则对全部 meta 统一生效。
 *   4. events 以对账范围内组件的运行时 emits 并集做双向对齐（单组件目录即退化为该组件严格对齐；
 *      复合目录中归属个别子组件的事件按第 2 条以 `组件名.` 前缀书写，无前缀事件计入并集）。
 *   5. default 宽松对账：meta 列出 default 且运行时默认值为原始类型（非函数工厂、非 undefined）时，
 *      比较 String 化结果；meta 字符串允许整体包一层成对引号（`'md'` ≡ md）后比较。
 *      运行时为数组/对象工厂函数或未显式给默认值的 prop 一律跳过（宁缺勿误报）。
 */
import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { ComponentDefinition } from './meta'

const SRC = dirname(dirname(fileURLToPath(import.meta.url)))

/** 每个目录的公共出口（index.ts）。键形如 '../button/index.ts'。 */
const indexes = import.meta.glob('../*/index.ts', { eager: true }) as Record<string, Record<string, unknown>>

/** 全部组件 meta（65 目录 / 72 文件）。键形如 '../button/Button.meta.ts'。 */
const metaModules = import.meta.glob('../*/*.meta.ts', { eager: true }) as Record<
  string,
  { meta?: ComponentDefinition }
>

// ── 运行时组件形状（SFC 编译产物） ─────────────────────────────

interface RuntimeComponent {
  props?: unknown
  emits?: unknown
}

/** SFC 编译产物：对象且带 setup 或 render。 */
function isComponent(value: unknown): value is RuntimeComponent {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { setup?: unknown; render?: unknown }
  return typeof v.setup === 'function' || v.render !== undefined
}

/** 运行时 props 键（数组或对象声明均支持）。 */
function propKeys(comp: RuntimeComponent): string[] {
  if (Array.isArray(comp.props)) return [...comp.props]
  if (comp.props && typeof comp.props === 'object') return Object.keys(comp.props)
  return []
}

/** 运行时 emits 键。 */
function emitKeys(comp: RuntimeComponent): string[] {
  if (Array.isArray(comp.emits)) return [...comp.emits]
  if (comp.emits && typeof comp.emits === 'object') return Object.keys(comp.emits)
  return []
}

/** 运行时某个 prop 的 default 值（仅对象式 props 声明携带）。 */
function runtimeDefault(comp: RuntimeComponent, key: string): unknown {
  if (!comp.props || Array.isArray(comp.props)) return undefined
  const entry = (comp.props as Record<string, { default?: unknown }>)[key]
  return entry?.default
}

/** meta default 的规范化：剥掉整体包裹的一层成对引号（`'md'` → md）。 */
function normalizeDefault(raw: string): string {
  const t = raw.trim()
  if (t.length >= 2) {
    const head = t[0]
    const tail = t[t.length - 1]
    if ((head === "'" && tail === "'") || (head === '"' && tail === '"')) return t.slice(1, -1)
  }
  return t
}

// ── 集合工具 ──────────────────────────────────────────────────

function diff(a: string[], b: string[]): string[] {
  const setB = new Set(b)
  return a.filter((x) => !setB.has(x))
}

/** `MenuItem.value` → 提取前缀；裸名返回 null。 */
const QUALIFIED = /^([A-Z][A-Za-z0-9]*)\.(.+)$/

// ── 结构性前置：glob 与磁盘一致 ───────────────────────────────

describe('meta 契约对账（结构性覆盖）', () => {
  it('glob 收录的 *.meta.ts 必须与磁盘清单完全一致', () => {
    const disk: string[] = []
    for (const entry of readdirSync(SRC, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      for (const f of readdirSync(join(SRC, entry.name))) {
        // shared/meta.ts 是接口定义：文件名不以 `.meta.ts` 结尾，不会被误收。
        if (f.endsWith('.meta.ts')) disk.push(`${entry.name}/${f}`)
      }
    }
    const globbed = Object.keys(metaModules).map((k) => k.replace('../', ''))
    expect(new Set(globbed), 'glob 与磁盘 *.meta.ts 清单不一致（可能存在 glob 模式漂移）').toEqual(
      new Set(disk),
    )
    expect(globbed.length, 'glob 与磁盘 *.meta.ts 数量不一致（存在重复收录）').toBe(disk.length)
  })
})

// ── 逐 meta 对账 ──────────────────────────────────────────────

describe('meta 契约对账（api ↔ 运行时）', () => {
  for (const [path, mod] of Object.entries(metaModules)) {
    const dir = path.split('/')[1]
    const label = path.replace('../', '')

    it(`${label}：api 与运行时组件双向对齐`, () => {
      // 1. meta 导出与 identity 必须可用
      const meta = mod.meta
      expect(meta, `${label} 缺少 meta 导出`).toBeDefined()
      const exportName = meta?.identity?.export
      expect(exportName, `${label} 缺少 identity.export`).toBeTruthy()

      // 2. 在同目录出口中解析根组件
      const index = indexes[`../${dir}/index.ts`]
      expect(index, `${label} 所在目录缺少 index.ts 公共出口`).toBeDefined()
      const root = index?.[exportName as string]
      expect(isComponent(root), `${label} 的 identity.export "${exportName}" 未解析为同目录出口中的组件`).toBe(
        true,
      )
      const rootComp = root as RuntimeComponent

      // 3. 复合命名前缀 → 解析对账范围内的全部组件
      const scope = new Map<string, RuntimeComponent>([[exportName as string, rootComp]])
      const propEntries = meta?.api?.props ?? []
      const eventEntries = meta?.api?.events ?? []
      for (const entry of [...propEntries, ...eventEntries]) {
        const m = QUALIFIED.exec(entry.name)
        if (!m) continue
        const [, prefix] = m
        if (scope.has(prefix)) continue
        const resolved = index?.[prefix]
        expect(
          isComponent(resolved),
          `${label} 的复合命名前缀 "${prefix}" 未在同目录出口中解析为组件`,
        ).toBe(true)
        scope.set(prefix, resolved as RuntimeComponent)
      }

      // 4. props 双向对账
      // 4a. meta → 运行时：每条 props 必须落在其归属组件的运行时 props 上
      const documented = new Map<string, Set<string>>() // 导出名 → 已记录的成员名
      for (const entry of propEntries) {
        const m = QUALIFIED.exec(entry.name)
        const ownerName = m ? m[1] : (exportName as string)
        const member = m ? m[2] : entry.name
        const owner = scope.get(ownerName)
        const runtime = propKeys(owner ?? {})
        expect(
          runtime.includes(member),
          `${label}：meta 声明 prop "${entry.name}"，但 ${ownerName} 运行时 props 为 [${runtime.join(', ')}]（实现为真相，修正 meta）`,
        ).toBe(true)
        const bucket = documented.get(ownerName) ?? new Set<string>()
        bucket.add(member)
        documented.set(ownerName, bucket)
      }
      // 4b. 运行时 → meta：对账范围内每个组件的运行时 props 必须全部被收录
      for (const [name, comp] of scope) {
        const runtime = propKeys(comp)
        const missing = diff(runtime, [...(documented.get(name) ?? [])])
        expect(
          missing,
          `${label}：${name} 的运行时 props [${missing.join(', ')}] 未收录进 meta.api.props（实现为真相，补齐 meta）`,
        ).toEqual([])
      }
      // 4c. 同一 meta 内不得重复收录
      const allNames = propEntries.map((p) => p.name)
      expect(new Set(allNames).size, `${label}：meta.api.props 存在重复条目`).toBe(allNames.length)

      // 5. events 双向对账（对账范围内组件的运行时 emits 并集）
      const runtimeEmits = new Set<string>()
      for (const comp of scope.values()) for (const e of emitKeys(comp)) runtimeEmits.add(e)
      const metaEvents = eventEntries.map((e) => {
        const m = QUALIFIED.exec(e.name)
        return m ? m[2] : e.name
      })
      expect(
        diff(metaEvents, [...runtimeEmits]),
        `${label}：meta 声明了运行时未声明的事件（实现为真相，修正 meta）`,
      ).toEqual([])
      expect(
        diff([...runtimeEmits], metaEvents),
        `${label}：运行时事件未收录进 meta.api.events（实现为真相，补齐 meta）`,
      ).toEqual([])

      // 6. default 宽松对账（运行时为函数工厂或 undefined 时跳过）
      for (const entry of propEntries) {
        if (entry.default === undefined) continue
        const m = QUALIFIED.exec(entry.name)
        const ownerName = m ? m[1] : (exportName as string)
        const member = m ? m[2] : entry.name
        const rt = runtimeDefault(scope.get(ownerName) ?? {}, member)
        if (typeof rt === 'function' || rt === undefined) continue
        expect(
          normalizeDefault(entry.default),
          `${label}：prop "${entry.name}" 的 meta default 与运行时不一致（运行时 String 化为 "${String(rt)}"）`,
        ).toBe(String(rt))
      }
    })
  }
})
