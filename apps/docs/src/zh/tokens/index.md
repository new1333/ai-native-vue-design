# 设计 Token 总览

以下面板由 `paper.css` 的 `:root` 块**运行时解析生成**——token 文件更新后此处自动同步，不存在第二份需要维护的清单。

<TokenBoard />

## 使用方式

```css
/* 组件内（scoped style） */
.my-panel {
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  color: var(--ui-text-1);
  transition: background var(--ui-motion-default) var(--ui-ease-out);
}
```

三层的语义与 Profile 切换说明见[主题与 Token](/guide/theming)。
