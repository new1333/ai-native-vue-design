# ToastHost

> 纸面全局通知：toast 单例（默认导出）程序式推入 success/error/info/warning 提示，ToastHost 挂载一次即 Teleport 到 body 右上角堆叠渲染；自动关闭计时 hover 暂停，z-index 走 `--ui-z-toast`。

- **导出名**：`toast`（单例，默认导出 + 命名导出）、`ToastHost`（`@ui/components`）· id `ui-toast` · 产品族 Feedback
- **契约来源**：`packages/components/src/toast/ToastHost.meta.ts` / `ToastHost.types.ts` / `toast.ts` / `ToastHost.vue` / `ToastItem.vue`

## 是什么

无需用户处理、稍纵即逝的操作反馈：程序式调用推入全局堆栈，Host 集中渲染，超时自动消失（hover 暂停）。用户完成操作后获得轻量、自动消失的全局反馈。**前置条件：应用根挂载一次 `<ToastHost />`**（否则提示不渲染、也不会自动关闭；计时器位于渲染单元内）。

## 何时用

- 保存/提交等异步操作成功或失败的即时确认
- 后台任务完成、内容已复制等被动通知
- 需要比 Alert 更轻、不打断当前任务的页面级反馈

## 何时不该用

- 需要用户确认/取消才能继续的阻断性反馈用 **Dialog**：Toast 不收集输入且会自动消失
- 页面正文内常驻的状态/上下文信息用 **Alert**：Toast 是全局浮层、有时效
- 表单字段校验错误就地提示用 **FormField**：Toast 不定位到具体字段
- 需要富内容（标题+正文+动作链接）的持久通知面板用 Drawer/Notification 类容器

## Props

`ToastHost` 无 Props：位置（右上角）、层级（`--ui-z-toast`）与容器文案均为固定契约。

## Events / Slots

无组件事件、无插槽：提示内容由 toast 单例的 message 文本承载，关闭回调走 toast 单例的 `options.onClose`。

## toast 单例 API（程序式，非组件 expose）

| 方法 | 类型 | 说明 |
| --- | --- | --- |
| `toast.success` | `(message: string, options?: ToastOptions) => ToastId` | 推入成功提示（role=status），返回 id。 |
| `toast.error` | `(message: string, options?: ToastOptions) => ToastId` | 推入错误提示（role=alert，读屏立即播报），返回 id。 |
| `toast.info` | `(message: string, options?: ToastOptions) => ToastId` | 推入中性信息提示（role=status），返回 id。 |
| `toast.warning` | `(message: string, options?: ToastOptions) => ToastId` | 推入警告提示（role=status），返回 id。 |
| `toast.remove` | `(id: ToastId) => boolean` | 按 id 移除一条提示；命中返回 true 并触发其 onClose（恰好一次），未命中返回 false。 |

`ToastOptions`：`{ duration?: number, onClose?: () => void }`（duration 默认 4000ms；传 0 表示不自动关闭，必须经关闭按钮或 toast.remove(id) 移除）。

## 可访问性

- 容器 `role="region"` `aria-label="通知"`；每条提示 `role="status"`（隐式 aria-live=polite），error 变体 `role="alert"`（隐式 assertive，立即播报）——错误必须用 toast.error，不要用 info 冒充。
- 关闭按钮为原生 `<button type="button">` 且带 aria-label（图标 svg aria-hidden）；Tab 自然进入，Enter/Space 原生激活触发移除；推入提示不抢焦点。
- 悬停暂停计时兼容读屏浏览（鼠标路径），纯键盘用户由计时兜底。
- 同一事件只推一条 Toast；onClose 只做无副作用清理。

## SSR 行为

SSR-safe：toast 单例与 Host 的模块/setup 顶层不访问任何浏览器 API（node 环境可直接调用单例）；挂载前 Host 仅输出 hidden 的 ui-toast 占位，`renderToString` 无浮层/region/条目输出且稳定可水合；Teleport 与计时器全部推迟到客户端 onMounted 之后。不要在 SSR 阶段依赖 Toast 渲染（浮层只在客户端出现）。

## 最小用例

```vue
<!-- App.vue：应用根挂载一次 -->
<script setup lang="ts">
import { ToastHost } from '@ui/components'
</script>

<template>
  <RouterView />
  <ToastHost />
</template>
```

```ts
// 任意业务代码：程序式推入
import { toast } from '@ui/components'

toast.success('已保存', { duration: 3000 })
const id = toast.error('保存失败，请重试')
// …需要时手动移除
toast.remove(id)
```
