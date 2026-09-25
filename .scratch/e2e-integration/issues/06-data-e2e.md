# 06: Data 家族 E2E —— Table / Pagination / Progress / Skeleton / EmptyState

**What to build:** 用例落在 `tests/e2e/specs/table.e2e.spec.ts`，覆盖计划 §5.2：

- **Table（P0）**：评分列升 / 降序后断言首行数据；**姓名列拼音排序**（依赖浏览器 ICU / Collator 环境，断言排序后首行姓名而非全量序）；loading 遮罩出现与消失；状态列 Badge 渲染
- **Pagination（P1）**：翻页后当前页文案联动；边界页（首页 / 末页）按钮态
- **Progress（P2）**：数值标签渲染
- **EmptyState（P2）**：action 触发 toast
- **Skeleton（P2）**：根类与内容冒烟

**Blocked by:** 01: E2E 基建 + 冒烟（阶段 0）

**Status:** ready-for-agent

- [ ] Table：升 / 降序首行断言 + 拼音排序首行断言
- [ ] Table：loading 遮罩出现 → 消失
- [ ] Pagination：翻页联动 + 边界页按钮态
- [ ] Progress 数值标签 / EmptyState action→toast / Skeleton 冒烟
- [ ] console / pageerror 守卫零违例；`pnpm e2e`（chromium）+ typecheck 全绿
- [ ] 变更仅限 `tests/e2e`
