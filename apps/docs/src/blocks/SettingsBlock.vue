<script setup lang="ts">
/**
 * 设置页构建块：左侧分区导航（Menu）+ 右侧分组表单，
 * 各分区独立保存并以 toast 反馈。仅依赖 @ui/components 与 --ui-* token。
 */
import { reactive, ref } from 'vue'
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Menu,
  MenuItem,
  Switch,
  Textarea,
  toast,
  ToastHost,
} from '@ui/components'

type SectionKey = 'profile' | 'notifications' | 'security'

const active = ref<SectionKey>('profile')

const SECTIONS: ReadonlyArray<{ key: SectionKey; label: string }> = [
  { key: 'profile', label: '个人资料' },
  { key: 'notifications', label: '通知' },
  { key: 'security', label: '安全' },
]

const sectionLabel = (key: SectionKey): string => SECTIONS.find((s) => s.key === key)?.label ?? key

const profile = reactive({ nickname: '林小满', email: 'lin@example.com', bio: '在做纸面 Paper：为 AI 协作而设计的组件库。' })

const notifications = reactive({
  reply: true,
  weekly: true,
  product: false,
  security: true,
})

const security = reactive({ current: '', next: '', confirm: '' })

function saveProfile(): void {
  toast.success(`个人资料已保存：${profile.nickname}`)
}

function saveNotifications(): void {
  const enabled = Object.values(notifications).filter(Boolean).length
  toast.success(`通知偏好已保存（启用 ${enabled} 项）`)
}

function saveSecurity(): void {
  if (security.next.length < 8) {
    toast.error('新密码至少 8 位')
    return
  }
  if (security.next !== security.confirm) {
    toast.error('两次输入的新密码不一致')
    return
  }
  security.current = ''
  security.next = ''
  security.confirm = ''
  toast.success('密码已更新，其他会话保持登录')
}

function resetNotifications(): void {
  notifications.reply = true
  notifications.weekly = true
  notifications.product = false
  notifications.security = true
  toast.info('已恢复默认通知设置（未保存）')
}
</script>

<template>
  <div class="ui-block-settings">
    <header class="ui-block-settings__head">
      <h2 class="ui-block-settings__title">账户设置</h2>
      <p class="ui-block-settings__subtitle">管理你在纸面 Paper 的个人资料、通知与安全选项</p>
    </header>

    <div class="ui-block-settings__body">
      <nav class="ui-block-settings__nav" aria-label="设置分区">
        <Menu v-model:model-value="active">
          <MenuItem v-for="section in SECTIONS" :key="section.key" :value="section.key">
            {{ section.label }}
          </MenuItem>
        </Menu>
      </nav>

      <section class="ui-block-settings__content" :aria-label="`${sectionLabel(active)}设置`">
        <template v-if="active === 'profile'">
          <Card>
            <CardHeader><h3 class="ui-block-settings__card-title">个人资料</h3></CardHeader>
            <CardBody class="ui-block-settings__card-body">
              <div class="ui-block-settings__avatar-row">
                <Avatar name="林小满" alt="林小满" size="lg" />
                <div class="ui-block-settings__avatar-ops">
                  <Button size="sm" variant="secondary" @click="toast.info('更换头像演示：接入 Upload 组件即可')">
                    更换头像
                  </Button>
                  <p class="ui-block-settings__hint">支持 PNG / JPG，不超过 2 MB</p>
                </div>
              </div>

              <div class="ui-block-settings__field">
                <label class="ui-block-settings__label" for="settings-nickname">昵称</label>
                <Input id="settings-nickname" v-model="profile.nickname" placeholder="对外展示的名称" />
              </div>

              <div class="ui-block-settings__field">
                <label class="ui-block-settings__label" for="settings-email">邮箱</label>
                <Input id="settings-email" v-model="profile.email" type="text" placeholder="name@example.com" />
              </div>

              <div class="ui-block-settings__field">
                <label class="ui-block-settings__label" for="settings-bio">个人简介</label>
                <Textarea id="settings-bio" v-model="profile.bio" :rows="3" placeholder="一句话介绍自己" show-count :maxlength="120" />
              </div>

              <div class="ui-block-settings__actions">
                <Button variant="primary" @click="saveProfile">保存资料</Button>
                <Button variant="ghost">重置</Button>
              </div>
            </CardBody>
          </Card>
        </template>

        <template v-else-if="active === 'notifications'">
          <Card>
            <CardHeader><h3 class="ui-block-settings__card-title">通知偏好</h3></CardHeader>
            <CardBody class="ui-block-settings__card-body">
              <div class="ui-block-settings__switch-row">
                <div>
                  <p class="ui-block-settings__switch-label">回复与提及</p>
                  <p class="ui-block-settings__hint">有人回复你的讨论或 @ 你时立即通知</p>
                </div>
                <Switch v-model="notifications.reply" aria-label="回复与提及通知" />
              </div>
              <div class="ui-block-settings__switch-row">
                <div>
                  <p class="ui-block-settings__switch-label">每周摘要</p>
                  <p class="ui-block-settings__hint">每周一上午汇总上周的工作区动态</p>
                </div>
                <Switch v-model="notifications.weekly" aria-label="每周摘要通知" />
              </div>
              <div class="ui-block-settings__switch-row">
                <div>
                  <p class="ui-block-settings__switch-label">产品动态</p>
                  <p class="ui-block-settings__hint">新版本与功能公告（约每月一封）</p>
                </div>
                <Switch v-model="notifications.product" aria-label="产品动态通知" />
              </div>
              <div class="ui-block-settings__switch-row">
                <div>
                  <p class="ui-block-settings__switch-label">安全提醒</p>
                  <p class="ui-block-settings__hint">异地登录、密码修改等敏感操作提醒（建议保持开启）</p>
                </div>
                <Switch v-model="notifications.security" aria-label="安全提醒通知" />
              </div>

              <div class="ui-block-settings__actions">
                <Button variant="primary" @click="saveNotifications">保存偏好</Button>
                <Button variant="ghost" @click="resetNotifications">恢复默认</Button>
              </div>
            </CardBody>
          </Card>
        </template>

        <template v-else>
          <Card>
            <CardHeader><h3 class="ui-block-settings__card-title">修改密码</h3></CardHeader>
            <CardBody class="ui-block-settings__card-body">
              <div class="ui-block-settings__field">
                <label class="ui-block-settings__label" for="settings-current">当前密码</label>
                <Input id="settings-current" v-model="security.current" type="password" placeholder="输入当前密码" autocomplete="current-password" />
              </div>
              <div class="ui-block-settings__field">
                <label class="ui-block-settings__label" for="settings-next">新密码</label>
                <Input id="settings-next" v-model="security.next" type="password" placeholder="至少 8 位" autocomplete="new-password" />
              </div>
              <div class="ui-block-settings__field">
                <label class="ui-block-settings__label" for="settings-confirm">确认新密码</label>
                <Input id="settings-confirm" v-model="security.confirm" type="password" placeholder="再输入一次" autocomplete="new-password" />
              </div>

              <div class="ui-block-settings__actions">
                <Button variant="primary" @click="saveSecurity">更新密码</Button>
                <Button variant="ghost" @click="toast.info('已向全部设备发送登出指令（演示）')">登出所有会话</Button>
              </div>
            </CardBody>
          </Card>
        </template>
      </section>
    </div>

    <ToastHost />
  </div>
</template>

<style scoped>
.ui-block-settings {
  padding: var(--ui-space-6) var(--ui-space-4);
  background: var(--ui-bg);
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.ui-block-settings__head {
  max-width: calc(var(--ui-space-8) * 13);
  width: 100%;
  margin-inline: auto;
}

.ui-block-settings__title {
  margin: 0;
  font-size: var(--ui-text-2xl);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-leading-heading);
  color: var(--ui-text-1);
}

.ui-block-settings__subtitle {
  margin: var(--ui-space-1) 0 0;
  font-size: var(--ui-text-md);
  color: var(--ui-text-2);
}

.ui-block-settings__body {
  max-width: calc(var(--ui-space-8) * 13);
  width: 100%;
  margin-inline: auto;
  display: grid;
  grid-template-columns: calc(var(--ui-space-8) * 3) 1fr;
  gap: var(--ui-space-5);
  align-items: start;
}

/* 窄屏（预览「手机」档）：分区导航折到内容上方 */
@media (max-width: 719px) {
  .ui-block-settings__body {
    grid-template-columns: 1fr;
  }
}

.ui-block-settings__nav {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  padding: var(--ui-space-2);
}

.ui-block-settings__card-title {
  margin: 0;
  font-size: var(--ui-text-md);
  font-weight: var(--ui-font-weight-semibold);
  color: var(--ui-text-1);
}

.ui-block-settings__card-body {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
}

.ui-block-settings__avatar-row {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
}

.ui-block-settings__avatar-ops {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}

.ui-block-settings__field {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-1);
}

.ui-block-settings__label {
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-1);
}

.ui-block-settings__switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-4);
  padding: var(--ui-space-1) 0;
}

.ui-block-settings__switch-label {
  margin: 0;
  font-size: var(--ui-text-sm);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-text-1);
}

.ui-block-settings__hint {
  margin: 0;
  font-size: var(--ui-text-xs);
  color: var(--ui-text-3);
}

.ui-block-settings__actions {
  display: flex;
  gap: var(--ui-space-2);
  padding-top: var(--ui-space-2);
  border-top: 1px solid var(--ui-border);
}
</style>
