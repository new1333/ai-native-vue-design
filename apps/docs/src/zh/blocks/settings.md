---
title: 设置页 Settings
description: 分区导航 + 分组表单的账户设置页，各分区独立保存并以 toast 反馈
---

<script setup>
import SettingsBlock from '@docs-blocks/SettingsBlock.vue'
import settingsSrc from '@docs-blocks/SettingsBlock.vue?raw'
</script>

# 设置页 Settings

账户设置类页面的通用骨架：左侧分区导航 + 右侧分组表单卡，每个分区独立保存并即时反馈。本块含个人资料、通知偏好、修改密码三个分区。

<p class="block-try"><span class="block-try__label">试试</span>左栏切换分区；在「安全」里输入不足 8 位或不一致的新密码看 toast 校验；开关通知项后保存；恢复默认。</p>

<BlockPreview :src="settingsSrc">
  <SettingsBlock />
</BlockPreview>

## 组成

| 区域 | 组件 |
| --- | --- |
| 分区导航 | [Menu](/components/navigation/menu)（vertical 模式 + `v-model:model-value`） |
| 分组卡 | [Card](/components/general/card) 家族（`CardHeader` 标题 + `CardBody` 表单） |
| 资料表单 | [Avatar](/components/general/avatar)（首字母回退）、[Input](/components/inputs/input)、[Textarea](/components/inputs/textarea)（`show-count`） |
| 开关组 | [Switch](/components/inputs/switch)（`aria-label` 补可访问名） |
| 行为与反馈 | [Button](/components/general/button)、[Toast](/components/feedback/toast)（success / error / info 分级） |

## 复制使用

- 依赖：`@ui/tokens/paper.css` + `@ui/components`；
- 「复制源码」保存为 `src/blocks/SettingsBlock.vue`；
- 新增分区 = 在 `SECTIONS` 加一项 + 复制一个 `<template>` 分支，导航自动出现；
- 简单字段用 `label + for` 关联控件；需要校验门禁时可以把字段换成 [Form](/components/inputs/form) 组合（参考[登录页](/blocks/login)）；
- 各 `save*` 函数接入真实接口，密码修改逻辑含长度与一致性校验可直接复用。
