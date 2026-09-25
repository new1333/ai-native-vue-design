import { token } from './token'

/**
 * Primitive 层：原子档位（原始色板 / 间距 / 圆角 / 字体 / 阴影 / 动效 / 层级）。
 *
 * 值为 Paper Profile 的原子裸值（见设计文档 §6.2）；语义层与组件层只允许
 * 通过 `var(--ui-*)` 引用这些档位，组件包内禁止出现任何裸值。
 */

/**
 * 原始色板（Paper 暖色系）。
 * 命名：中性 = 纸 paper / 纸白 paper-raised（同色温抬升面）/ 沙 sand / 线 line / 墨 ink；
 * 彩色 = 松 pine（强调）/ 藓 moss（成功）/ 琥珀 amber（警示）/ 陶 clay（危险）/ 雾 slate（信息）。
 */
const color = {
  white: token('--ui-color-white', '#FFFFFF'),
  paper: token('--ui-color-paper', '#F7F6F2'),
  paperRaised: token('--ui-color-paper-raised', '#FCFBF8'),
  sand: token('--ui-color-sand', '#F1EFE9'),
  line: token('--ui-color-line', '#E6E3DB'),
  lineStrong: token('--ui-color-line-strong', '#D5D1C6'),
  ink950: token('--ui-color-ink-950', '#26262A'),
  ink900: token('--ui-color-ink-900', '#2C2A25'),
  ink600: token('--ui-color-ink-600', '#6E6A60'),
  ink400: token('--ui-color-ink-400', '#8B8679'),
  pine50: token('--ui-color-pine-50', '#EDF1EC'),
  pine600: token('--ui-color-pine-600', '#33594A'),
  pine700: token('--ui-color-pine-700', '#2A4A3D'),
  moss50: token('--ui-color-moss-50', '#EAF2EC'),
  moss600: token('--ui-color-moss-600', '#3E7C57'),
  amber50: token('--ui-color-amber-50', '#F5EEDF'),
  amber600: token('--ui-color-amber-600', '#B8863B'),
  clay50: token('--ui-color-clay-50', '#F6EAE6'),
  clay600: token('--ui-color-clay-600', '#A9503C'),
  slate50: token('--ui-color-slate-50', '#ECF0F2'),
  slate500: token('--ui-color-slate-500', '#8A9BA8'),
  scrim: token('--ui-color-scrim', 'rgba(28,27,23,.4)'),
}

/** 间距档位：4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px。 */
const space = {
  1: token('--ui-space-1', '4px'),
  2: token('--ui-space-2', '8px'),
  3: token('--ui-space-3', '12px'),
  4: token('--ui-space-4', '16px'),
  5: token('--ui-space-5', '24px'),
  6: token('--ui-space-6', '32px'),
  7: token('--ui-space-7', '48px'),
  8: token('--ui-space-8', '64px'),
}

/** 圆角档位：xs=2px 仅进度条端头等形状细节；sm=6 控件；md=12 卡片/Popover；lg=16 Dialog/大容器。 */
const radius = {
  xs: token('--ui-radius-xs', '2px'),
  sm: token('--ui-radius-sm', '6px'),
  md: token('--ui-radius-md', '12px'),
  lg: token('--ui-radius-lg', '16px'),
}

/** 字体档位：字族 / 字阶 12–30px / 字重 / 行高 / 数字等宽工具。 */
const font = {
  family: {
    sans: token('--ui-font-sans', "'Noto Sans SC', system-ui, sans-serif"),
    serif: token('--ui-font-serif', "'Noto Serif SC', serif"),
  },
  size: {
    xs: token('--ui-text-xs', '12px'),
    sm: token('--ui-text-sm', '13px'),
    md: token('--ui-text-md', '15px'),
    lg: token('--ui-text-lg', '17px'),
    xl: token('--ui-text-xl', '20px'),
    xxl: token('--ui-text-2xl', '24px'),
    xxxl: token('--ui-text-3xl', '30px'),
  },
  weight: {
    regular: token('--ui-font-weight-regular', '400'),
    medium: token('--ui-font-weight-medium', '500'),
    semibold: token('--ui-font-weight-semibold', '600'),
  },
  lineHeight: {
    small: token('--ui-leading-small', '1.5'),
    body: token('--ui-leading-body', '1.7'),
    heading: token('--ui-leading-heading', '1.3'),
  },
  /** 数字等宽：`font-variant-numeric: var(--ui-numeric)`。 */
  numeric: token('--ui-numeric', 'tabular-nums'),
}

/** 阴影四档：rest 静止（可选）/ hover 悬浮 / pop 弹层 / modal 模态。 */
const shadow = {
  rest: token('--ui-shadow-rest', '0 1px 2px rgba(28,27,23,.05)'),
  hover: token('--ui-shadow-hover', '0 1px 3px rgba(28,27,23,.06)'),
  pop: token('--ui-shadow-pop', '0 4px 12px rgba(28,27,23,.08)'),
  modal: token('--ui-shadow-modal', '0 8px 24px rgba(28,27,23,.12)'),
}

/** 动效：fast 150ms / default 180ms（允许范围 150–200ms）；入场 ease-out。 */
const motion = {
  fast: token('--ui-motion-fast', '150ms'),
  default: token('--ui-motion-default', '180ms'),
  easeOut: token('--ui-ease-out', 'cubic-bezier(0.16, 1, 0.3, 1)'),
}

/** 层级阶梯：sticky 10 / dropdown 100 / drawer 200 / modal 300 / toast 400 / tooltip 500。 */
const zIndex = {
  sticky: token('--ui-z-sticky', '10'),
  dropdown: token('--ui-z-dropdown', '100'),
  drawer: token('--ui-z-drawer', '200'),
  modal: token('--ui-z-modal', '300'),
  toast: token('--ui-z-toast', '400'),
  tooltip: token('--ui-z-tooltip', '500'),
}

export const primitive = { color, space, radius, font, shadow, motion, zIndex } as const

export type Primitive = typeof primitive
