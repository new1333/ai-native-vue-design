#!/usr/bin/env node
/**
 * 纸面 Paper —— 视觉裸值静态审计（纯 Node，无第三方依赖）。
 *
 * 用法：
 *   node tooling/audit.mjs                                  # 扫描 packages 与 apps 下所有包的 src 目录
 *   node tooling/audit.mjs packages/components/src apps/playground/src
 *                                                           # 位置参数限定扫描目录（相对仓库根，也可传单个文件）
 *
 * 扫描对象：
 *   - .css 文件：全文逐行；
 *   - .vue 文件：<style> 块内容（模板不扫描）；
 *   - .ts 文件：包含 CSS 属性写法（kebab/camel + 冒号）的行——覆盖 CSS-in-TS
 *     字符串与内联样式对象；纯文字/注释中的视觉值不判违规。
 *
 * 违规规则（组件包内视觉值只能走 var(--ui-*) token，见 docs/CONVENTIONS.md §2）：
 *   R1 裸颜色    ：十六进制（#fff / #F7F6F2 / 8 位）或 rgb()/rgba()
 *   R2 圆角裸 px  ：border-radius 值含未包 var() 的 px；值恰为 2px（进度条端头）放行
 *   R3 动效裸时长：transition / animation 系属性值含未包 var() 的 150ms / 0.2s 等
 *   R4 裸 z-index：z-index 值为纯数字且未用 var()
 *   R5 字号裸 px  ：font-size 值含未包 var() 的 px
 *
 * 白名单（不判违规）：
 *   - 1px 边框宽度（border / border-width: 1px …——宽度不在上述任何规则内）
 *   - :focus-visible outline 的 2px（outline 宽度不在上述任何规则内）
 *   - packages/tokens/**（token 定义本身就是裸值的家）
 *   - tooling/**、node_modules、点开头目录
 *
 * 输出：每个违规一行 `文件:行:内容  # 原因`；有违规退出码 1，否则 0。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const EXTS = new Set(['.vue', '.css', '.ts'])
const DEFAULT_SCAN = ['packages/*/src', 'apps/*/src']

// ── 规则正则 ────────────────────────────────────────────────────
// var() 引用（含 fallback）在残余值检查前先剥除。
const VAR_REF = /var\(--[\w-]+(?:\s*,[^()]*)?\)/g
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\s*\(/
const PROP = {
  radius: /(?:^|[^-\w])(?:border-radius|borderRadius)\s*:\s*([^;}]+)/,
  duration:
    /(?:^|[^-\w])(?:transition|transition-duration|transitionDuration|animation|animation-duration|animationDuration)\s*:\s*([^;}]+)/,
  zIndex: /(?:^|[^-\w])(?:z-index|zIndex)\s*:\s*([^;}]+)/,
  fontSize: /(?:^|[^-\w])(?:font-size|fontSize)\s*:\s*([^;}]+)/,
}
// .ts 行的颜色门槛：仅当行内出现色彩类属性写法时才检查裸颜色（避免 meta 描述误报）。
const TS_COLOR_PROP =
  /(?:^|[^-\w])(?:backgroundColor|background-color|background|borderColor|border-color|outlineColor|outline-color|boxShadow|box-shadow|textShadow|text-shadow|fill|stroke|color)\s*:/
const PX_RE = /\b\d+(?:\.\d+)?px\b/
const DURATION_RE = /\b\d+(?:\.\d+)?m?s\b/
const PURE_NUMBER_RE = /^[+-]?\d+(?:\.\d+)?$/

/** 取属性值并剥除 var() 引用与引号/尾逗号。 */
function residualValue(raw) {
  return raw
    .replace(VAR_REF, ' ')
    .replace(/['"`]/g, '')
    .replace(/[,;]+$/, '')
    .trim()
}

/** 对一行类 CSS 内容执行全部规则，返回违规原因数组。 */
function auditCssLine(line) {
  const reasons = []
  if (COLOR_RE.test(line)) reasons.push('R1 裸颜色（hex/rgb）—— 请使用 var(--ui-*) 颜色 token')
  const radius = line.match(PROP.radius)
  if (radius) {
    const v = residualValue(radius[1])
    if (PX_RE.test(v) && v !== '2px') reasons.push('R2 圆角裸 px —— 请使用 var(--ui-radius-*)（仅 2px 端头放行）')
  }
  const duration = line.match(PROP.duration)
  if (duration && DURATION_RE.test(residualValue(duration[1]))) {
    reasons.push('R3 动效裸时长 —— 请使用 var(--ui-motion-*)')
  }
  const z = line.match(PROP.zIndex)
  if (z && PURE_NUMBER_RE.test(residualValue(z[1]))) {
    reasons.push('R4 裸 z-index —— 请使用 var(--ui-z-*)')
  }
  const fontSize = line.match(PROP.fontSize)
  if (fontSize && PX_RE.test(residualValue(fontSize[1]))) {
    reasons.push('R5 字号裸 px —— 请使用 var(--ui-text-*)')
  }
  return reasons
}

/** .ts 行：仅对含 CSS 属性写法的行执行规则。 */
function auditTsLine(line) {
  const gated =
    TS_COLOR_PROP.test(line) ||
    Object.values(PROP).some((re) => re.test(line))
  return gated ? auditCssLine(line) : []
}

// ── 注释剥除（保持行号一一对应）────────────────────────────────
function stripComments(lines, { lineComments = false } = {}) {
  let inBlock = false
  return lines.map((line) => {
    if (inBlock) {
      const end = line.indexOf('*/')
      if (end === -1) return ''
      inBlock = false
      line = line.slice(end + 2)
    }
    let out = ''
    let rest = line
    for (;;) {
      const start = rest.indexOf('/*')
      if (start === -1) break
      const end = rest.indexOf('*/', start + 2)
      if (end === -1) {
        inBlock = true
        out += rest.slice(0, start)
        rest = ''
        break
      }
      out += `${rest.slice(0, start)} `
      rest = rest.slice(end + 2)
    }
    if (lineComments && !inBlock) rest = rest.replace(/(^|\s)\/\/.*$/, '$1') // 不吃 https:// 里的 //
    return (out + rest).trimEnd()
  })
}

// ── .vue <style> 块提取（换算回原文件绝对行号）─────────────────
function vueStyleBlocks(text) {
  const blocks = []
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
  let m
  while ((m = re.exec(text))) {
    const startLine = text.slice(0, m.index).split(/\r?\n/).length - 1
    blocks.push({ startLine, lines: m[1].split(/\r?\n/) })
  }
  return blocks
}

// ── 目录收集 ────────────────────────────────────────────────────
/** 展开「目录通配」形式的模式（段内单个 '*'，如 packages 下任意包）；返回绝对路径。 */
function expandPattern(pattern) {
  const segments = pattern.split('/')
  let dirs = ['']
  for (const seg of segments) {
    if (seg.includes('*')) {
      const re = new RegExp(`^${seg.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/\\\\]*')}$`)
      const next = []
      for (const base of dirs) {
        let entries = []
        try {
          entries = readdirSync(path.join(ROOT, base), { withFileTypes: true })
        } catch {
          continue
        }
        for (const e of entries) if (e.isDirectory() && re.test(e.name)) next.push(base ? `${base}/${e.name}` : e.name)
      }
      dirs = next
    } else {
      dirs = dirs.map((d) => (d ? `${d}/${seg}` : seg))
    }
  }
  return dirs.map((d) => path.join(ROOT, d))
}

function walk(dir, out) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue
      walk(p, out)
    } else if (e.isFile() && EXTS.has(path.extname(e.name))) {
      out.push(p)
    }
  }
  return out
}

const isWhitelisted = (file) => {
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  return (
    rel.startsWith('packages/tokens/') ||
    rel.startsWith('tooling/') ||
    rel.split('/').includes('node_modules')
  )
}

// ── 主流程 ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const scanPatterns = args.length > 0 ? args : DEFAULT_SCAN
const explicit = args.length > 0

const files = []
for (const pattern of scanPatterns) {
  for (const target of expandPattern(pattern)) {
    let st
    try {
      st = statSync(target)
    } catch {
      if (explicit) console.error(`[audit] 路径不存在，跳过：${path.relative(ROOT, target) || pattern}`)
      continue
    }
    if (st.isDirectory()) walk(target, files)
    else if (st.isFile() && EXTS.has(path.extname(target))) files.push(target)
  }
}

const violations = []
let scanned = 0
for (const file of [...new Set(files)]) {
  if (isWhitelisted(file)) continue
  scanned++
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  const text = readFileSync(file, 'utf8')
  const report = (line, lineNo, reason) =>
    violations.push({ key: `${rel}:${String(lineNo).padStart(4, '0')}`, text: `${rel}:${lineNo}: ${line.trim()}  # ${reason}` })

  if (file.endsWith('.vue')) {
    for (const block of vueStyleBlocks(text)) {
      stripComments(block.lines).forEach((line, i) => {
        for (const reason of auditCssLine(line)) report(line, block.startLine + 1 + i, reason)
      })
    }
  } else if (file.endsWith('.css')) {
    stripComments(text.split(/\r?\n/)).forEach((line, i) => {
      for (const reason of auditCssLine(line)) report(line, i + 1, reason)
    })
  } else {
    stripComments(text.split(/\r?\n/), { lineComments: true }).forEach((line, i) => {
      for (const reason of auditTsLine(line)) report(line, i + 1, reason)
    })
  }
}

violations.sort((a, b) => a.key.localeCompare(b.key))
for (const v of violations) console.log(v.text)

if (violations.length > 0) {
  console.error(`[audit] 扫描 ${scanned} 个文件，发现 ${violations.length} 处违规（${scanPatterns.join(', ')}）`)
  process.exit(1)
}
console.log(`[audit] 扫描 ${scanned} 个文件，未发现视觉裸值违规（${scanPatterns.join(', ')}）`)
process.exit(0)
