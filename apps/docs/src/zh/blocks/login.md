---
title: 登录页 Login
description: 居中卡片式登录页：邮箱密码校验、记住我、密码显隐与第三方登录入口
---

<script setup>
import LoginBlock from '@docs-blocks/LoginBlock.vue'
import loginSrc from '@docs-blocks/LoginBlock.vue?raw'
</script>

# 登录页 Login

最常见的鉴权入口页面：居中卡片承载 [Form](/components/inputs/form) 校验表单，配「记住我」「忘记密码」与第三方登录。适用于产品登录、注册（改文案即可）与二级验证入口。

<p class="block-try"><span class="block-try__label">试试</span>空提交看校验、输入非法邮箱、点眼睛切换密码显隐、提交后 loading 与 toast 反馈。</p>

<BlockPreview :src="loginSrc">
  <LoginBlock />
</BlockPreview>

## 组成

| 区域 | 组件 |
| --- | --- |
| 卡片容器 | [Card](/components/general/card) 家族（本块直接用自定义卡片样式 + `--ui-shadow-pop`） |
| 校验表单 | [Form](/components/inputs/form) + [Input](/components/inputs/input)（`status` 由 FormField 作用域联动） |
| 密码显隐 | Input 的 `#suffix` 插槽自建切换按钮（meta 推荐组合） |
| 辅助控件 | [Checkbox](/components/inputs/checkbox)（记住我）、[Divider](/components/general/divider)（`#label`「或」） |
| 第三方登录 | [IconButton](/components/general/icon-button)（`aria-label` 提供可访问名） |
| 提交与反馈 | [Button](/components/general/button)（`block` + `loading`）、[Toast](/components/feedback/toast) |

## 复制使用

- 依赖：`@ui/tokens/paper.css`（入口引入一次）+ `@ui/components`；
- 「复制源码」保存为 `src/blocks/LoginBlock.vue`，在路由挂载；
- 把 `onSubmit` 里的假请求替换为真实登录接口，成功后自行跳转；
- 校验规则在 `rules` 中集中维护，与 `Form` 的提交门禁联动。
