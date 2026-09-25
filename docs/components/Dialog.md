# Dialog

> 纸面模态对话框：Teleport 至 body 的遮罩浮层，受控 v-model，含焦点圈定/还原、body 滚动锁定与 Esc/遮罩关闭，footer 插槽缺省渲染本库 Button 的「关闭」按钮。

- **导出名**：`Dialog`（`@ui/components`）· id `ui-dialog` · 产品族 Overlays
- **契约来源**：`packages/components/src/dialog/Dialog.meta.ts` / `Dialog.types.ts` / `Dialog.vue`

## 是什么

在页面内容之上呈现一段需要用户处理才能继续的任务流（确认、表单、详情聚焦），遮罩阻断底层交互。用户需要处理一个必须完成的模态任务后返回原上下文。

## 何时用

- 需要用户明确确认/取消的破坏性或不可逆操作
- 短暂表单或子任务（重命名、过滤配置）在当前上下文内完成
- 聚焦阅读的详情/预览内容，不必离开当前页

## 何时不该用

- 纯被动通知（保存成功、网络异常）用 **Toast**/**Alert**：Dialog 要求用户交互后才会消失
- 侧滑的导航或大面积工作区用 Drawer：Dialog 居中且宽度受 sm/md/lg 约束
- 轻量悬浮说明（目标元素附近的提示）用 Popover/**Tooltip**：Dialog 有遮罩、阻断底层交互

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 受控可见性（v-model）：true 时 Teleport 浮层渲染至 body。 |
| `title` | `string` | — | 标题文本；被 title 插槽覆盖，两者皆空则不渲染头部与 aria-labelledby。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸档位：面板宽度 sm≈384 / md≈576 / lg≈704（由间距标尺推导），永不超出视口。 |
| `closeOnScrim` | `boolean` | `true` | 点击遮罩是否请求关闭；表单类对话框可置 false 强制走明确动作。 |

## Events

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `boolean` | v-model 更新：一切关闭路径（遮罩/Esc/默认按钮）发出 false。 |
| `close` | `'scrim' \| 'esc' \| 'footer'` | 请求关闭并附带来源；与 update:modelValue false 同步发出。 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 对话框正文（可滚动区域）。 |
| `title` | 标题；覆盖 title prop，渲染进 aria-labelledby 指向的标题元素。 |
| `footer` | 底部动作区；缺省渲染默认「关闭」按钮（本库 Button），点击即请求关闭（reason="footer"）。 |

## Exposes

| 名 | 类型 | 说明 |
| --- | --- | --- |
| `focus` | `() => void` | 将焦点移入对话框（首个可聚焦元素，否则面板自身）；仅客户端有意义。 |

## 可访问性

- `role="dialog"` + `aria-modal="true"`，标题元素 id 由 useId 生成并以 aria-labelledby 关联（title prop/插槽皆适用）。
- 键盘契约：打开时焦点移入（首个可聚焦元素，否则面板），Tab/Shift+Tab 在面板内循环圈定（焦点逃逸即拉回），Esc 请求关闭；关闭后焦点还原到打开前的元素。
- 面板自身 `tabindex="-1"` 仅作程序化聚焦锚点；焦点环由全局 `:focus-visible` 约定提供。
- 遮罩为纯 div（无 role、不聚焦、无 tabindex）；默认关闭按钮为原生 button；disabled 元素自动移出焦点圈定候选集。
- body 在打开期间挂 `ui-dialog-scroll-lock` class 并行内锁定 overflow。

## SSR 行为

SSR-safe：setup 与模块顶层不访问浏览器 API；挂载前不渲染浮层，`renderToString` 仅输出 hidden 的 ui-dialog 占位（输出稳定、含根类），Teleport 与焦点/滚动锁副作用全部推迟到客户端 onMounted 之后；卸载时清理滚动锁并还原焦点。

## 最小用例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, Button } from '@ui/components'

const open = ref(false)
</script>

<template>
  <Button variant="danger" @click="open = true">删除…</Button>

  <Dialog v-model="open" title="删除确认">
    确定要删除这条记录吗？此操作不可撤销。
    <template #footer>
      <Button @click="open = false">取消</Button>
      <Button variant="danger" @click="open = false">确认删除</Button>
    </template>
  </Dialog>
</template>
```
