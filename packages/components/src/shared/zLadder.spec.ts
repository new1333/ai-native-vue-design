// shared 契约 spec：解析 @ui/tokens 的 paper.css 源文件，守护 --ui-z-* 层级阶梯
// 的单调性。这是跨组件的共享契约断言（不属于单组件的四类 spec；shared/ 此前只有
// meta.ts，本文件为首个共享契约 spec，vitest include src/**/*.spec.ts 覆盖之）。
// happy-dom 环境下仅做纯文件解析：无 DOM、无渲染依赖，断言完全确定性。
//
// 契约背景：Teleport 到 body 的非模态弹层（select/autocomplete/cascader/
// tree-select/date-picker/model-selector 下拉面板，dropdown-menu/popover/
// hover-card/popconfirm）与 drawer/modal 浮层同为 body 直接子元素，z-index 直接
// 可比，必须落在 popover 档（高于 drawer/modal、低于 toast）；--ui-z-dropdown
// 保留为文档流内浮层基础档（menu 子菜单等未 Teleport 场景，不得高于模态）。
// paper.css 为三档 Profile 全量重声明结构（:root 默认档 / data-theme='paper'
// 显式档 / paper-dark 深色档），三档的层级阶梯与指示条厚度契约必须逐档成立。
import { readFileSync } from 'node:fs'
// happy-dom 环境的全局 URL 按窗口 location 解析相对路径（非 file: 基准），
// 必须显式使用 node:url 的 URL 才能与 import.meta.url 组合定位源文件。
import { URL as NodeURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const PAPER_CSS = readFileSync(new NodeURL('../../../tokens/src/paper.css', import.meta.url), 'utf8')

/** 提取 CSS 片段内全部 `--ui-z-*: <number>;` 声明（token 名 → 数值）。 */
function extractZTokens(css: string): Record<string, number> {
  const tokens: Record<string, number> = {}
  for (const match of css.matchAll(/(--ui-z-[a-z-]+)\s*:\s*(\d+)\s*;/g)) {
    tokens[match[1]] = Number(match[2])
  }
  return tokens
}

/** 取选择器声明块文本（各 token 块内无嵌套花括号，首个闭合即块尾；缺失返回 null）。 */
function extractBlock(css: string, selector: string): string | null {
  const pattern = selector.replace(/[[\]]/g, '\\$&')
  return css.match(new RegExp(`${pattern}\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? null
}

/** 三档 Profile 块（默认 / 显式 paper / 深色 paper-dark；深色块取其属性选择器入口）。 */
const BLOCKS: ReadonlyArray<{ label: string; selector: string }> = [
  { label: '默认档 :root', selector: ':root' },
  { label: "显式 Paper 档 :root[data-theme='paper']", selector: ":root[data-theme='paper']" },
  { label: "深色夜纸档 :root[data-theme='paper-dark']", selector: ":root[data-theme='paper-dark']" },
]

/** 全阶梯自底向上：sticky → dropdown → drawer → modal → popover → toast → tooltip。 */
const LADDER = [
  '--ui-z-sticky',
  '--ui-z-dropdown',
  '--ui-z-drawer',
  '--ui-z-modal',
  '--ui-z-popover',
  '--ui-z-toast',
  '--ui-z-tooltip',
] as const

describe('paper.css --ui-z-* 层级阶梯契约', () => {
  it('三档 Profile 块均存在且 z 声明完全一致（全量重声明、逐档独立成立）', () => {
    const blocks = BLOCKS.map((block) => {
      const text = extractBlock(PAPER_CSS, block.selector)
      expect(text, `paper.css 应包含 ${block.label} 块`).not.toBeNull()
      return extractZTokens(text ?? '')
    })
    expect(blocks[1]).toEqual(blocks[0])
    expect(blocks[2]).toEqual(blocks[0])
  })

  it('三档各自阶梯单调有序：sticky < dropdown < drawer < modal < popover < toast < tooltip', () => {
    for (const block of BLOCKS) {
      const tokens = extractZTokens(extractBlock(PAPER_CSS, block.selector) ?? '')
      for (const token of LADDER) {
        expect(tokens[token], `${block.label}：${token} 应有数值声明`).toBeDefined()
      }
      const values = LADDER.map((token) => tokens[token])
      for (let i = 1; i < LADDER.length; i += 1) {
        expect(values[i], `${block.label}：${LADDER[i]} 应大于 ${LADDER[i - 1]}`).toBeGreaterThan(
          values[i - 1],
        )
      }
    }
  })

  it('修复契约：body 级非模态弹层档（popover）高于 modal/drawer/dropdown 基础档，toast 为其上最高', () => {
    for (const block of BLOCKS) {
      const tokens = extractZTokens(extractBlock(PAPER_CSS, block.selector) ?? '')
      // 非模态弹层必须盖过 drawer/modal（Dialog/Drawer/CommandPalette 内可用）与 dropdown 基础档
      expect(tokens['--ui-z-popover'], `${block.label}`).toBeGreaterThan(tokens['--ui-z-modal'])
      expect(tokens['--ui-z-modal'], `${block.label}`).toBeGreaterThan(tokens['--ui-z-drawer'])
      expect(tokens['--ui-z-drawer'], `${block.label}`).toBeGreaterThan(tokens['--ui-z-dropdown'])
      // toast 保持最顶（高于非模态弹层档；tooltip 另在其上，见阶梯单调用例）
      expect(tokens['--ui-z-toast'], `${block.label}`).toBeGreaterThan(tokens['--ui-z-popover'])
    }
  })

  it('指示条厚度 token（--ui-indicator-thickness）在三档中均为 px 数值声明', () => {
    for (const block of BLOCKS) {
      const text = extractBlock(PAPER_CSS, block.selector)
      expect(text, `${block.label} 块应存在`).toMatch(/--ui-indicator-thickness\s*:\s*\d+(\.\d+)?px\s*;/)
    }
  })
})
