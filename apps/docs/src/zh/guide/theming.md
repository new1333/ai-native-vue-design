# 主题与 Token

「纸面」的视觉只有一个来源：`@ui/tokens` 的 `paper.css`。组件自身不写任何裸视觉值，只消费 `var(--ui-*)`。

## 引入

```ts
// 应用入口一次性引入
import '@ui/tokens/paper.css'
```

## 三层结构

```text
primitive（原始值）      --ui-color-* / --ui-space-* / --ui-radius-* / --ui-shadow-* / --ui-motion-* / --ui-z-*
        ↓
semantic（语义落位）     --ui-bg / --ui-surface* / --ui-text-* / --ui-accent* / 状态色 / --ui-scrim
        ↓
component（组件别名）    --ui-button-* / --ui-input-* 最小别名集
```

- **primitive**：不携带语义的原始值，是整套系统的唯一事实来源；
- **semantic**：语义角色（背景、文字层级、强调色、成功/警告/危险等），组件优先消费这一层；
- **component**：个别组件的别名（如 `--ui-button-radius`），用于将来按组件域覆写。

完整变量清单见 [Token 总览](/tokens/)。

## Profile 切换

`paper.css` 声明了 `:root` 默认档与 `:root[data-theme='paper']` 显式档。将来新增其他 Profile 时，在 `<html data-theme="...">` 上切换即可；显式 paper 档保证能从其他 Profile 切回。

```ts
document.documentElement.setAttribute('data-theme', 'paper')
```

## 内建的全局约定

引入 `paper.css` 同时获得两条全局约定，组件不自行改写：

1. **焦点环**：`:focus-visible` 统一为 2px 实线 `--ui-accent` + 2px 偏移；
2. **减少动效**：`prefers-reduced-motion: reduce` 下所有 `--ui-motion-*` 时长立即归零——组件动效一律消费 token，因此 token 级归零即可覆盖全系统。

## 覆写示例

作为使用方，你可以在应用层覆写 semantic token 实现轻量换肤（无需动组件包）：

```css
/* 你的应用入口之后 */
:root {
  --ui-accent: #33594a; /* 换一个强调色 */
}
```
