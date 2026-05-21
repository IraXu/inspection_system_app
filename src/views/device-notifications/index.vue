<template>
  <div class="notifications-page app-page app-page--navbar">
    <t-navbar title="设备消息" left-arrow @left-click="goBack" class="page-navbar" />

    <div class="hero-card">
      <div class="hero-copy">
        <div class="hero-eyebrow">实时告警</div>
        <div class="hero-title">{{ unreadCount }} 条待处理设备消息</div>
        <div class="hero-desc">集中查看离线、录像异常与智能识别告警，快速定位影响设备。</div>
      </div>
      <div class="hero-badge">
        <t-icon name="notification-filled" size="28px" />
      </div>
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <div class="summary-value">{{ notifications.length }}</div>
        <div class="summary-label">全部消息</div>
      </div>
      <div class="summary-card warning">
        <div class="summary-value">{{ unreadCount }}</div>
        <div class="summary-label">未读告警</div>
      </div>
      <div class="summary-card danger">
        <div class="summary-value">{{ criticalCount }}</div>
        <div class="summary-label">紧急事件</div>
      </div>
    </div>

    <div class="section-title">最新告警</div>

    <div class="message-list">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="message-card"
        @click="openDetail(item)"
      >
        <div class="message-accent" :style="{ background: getLevelMeta(item.level).bg }">
          <t-icon :name="getLevelMeta(item.level).icon" size="24px" />
        </div>

        <div class="message-body">
          <div class="message-head">
            <div class="message-title-row">
              <div class="message-title">{{ item.title }}</div>
              <span v-if="item.status === 'unread'" class="unread-dot"></span>
            </div>
            <div class="message-time">{{ item.time }}</div>
          </div>

          <div class="message-summary">{{ item.summary }}</div>

          <div class="message-meta">
            <t-tag size="small" :theme="getLevelMeta(item.level).theme" variant="light">
              {{ getLevelMeta(item.level).label }}
            </t-tag>
            <t-tag size="small" theme="default" variant="outline">{{ item.category }}</t-tag>
            <span class="message-location">{{ item.storeName }}</span>
          </div>
        </div>

        <div class="message-arrow">
          <t-icon name="chevron-right" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { deviceNotifications, notificationLevelMap } from '../../data/device-notifications'

const router = useRouter()

const notifications = deviceNotifications

const unreadCount = computed(() => notifications.filter(item => item.status === 'unread').length)
const criticalCount = computed(() => notifications.filter(item => item.level === 'critical').length)

const getLevelMeta = (level) => {
  return notificationLevelMap[level] || notificationLevelMap.normal
}

const goBack = () => {
  router.back()
}

const openDetail = (item) => {
  router.push(`/device-notifications/${item.id}`)
}
</script>

<style scoped>
.notifications-page {
  background:
    radial-gradient(circle at top right, rgba(38, 111, 232, 0.18), transparent 34%),
    linear-gradient(180deg, #f2f7ff 0%, #f7f8fb 28%, #f5f7fb 100%);
}

.page-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.92) !important;
  border-bottom: 1px solid rgba(228, 235, 244, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.page-navbar :deep(.t-navbar__content),
.page-navbar :deep(.t-navbar__title),
.page-navbar :deep(.t-navbar__left),
.page-navbar :deep(.t-navbar__right) {
  color: #101828;
}

.hero-card {
  margin: 16px;
  padding: 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0b5bd3 0%, #3f8cff 100%);
  color: #fff;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  box-shadow: 0 18px 32px rgba(var(--theme-primary-rgb), 0.2);
}

.hero-copy {
  flex: 1;
  padding-right: 16px;
}

.hero-eyebrow {
  font-size: 12px;
  line-height: 18px;
  opacity: 0.8;
}

.hero-title {
  margin-top: 8px;
  font-size: 22px;
  line-height: 30px;
  font-weight: 700;
}

.hero-desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.86);
}

.hero-badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 16px;
}

.summary-card {
  padding: 16px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 24px rgba(28, 49, 88, 0.06);
}

.summary-card.warning {
  background: linear-gradient(180deg, #fffaf0 0%, #fff 100%);
}

.summary-card.danger {
  background: linear-gradient(180deg, #fff5f4 0%, #fff 100%);
}

.summary-value {
  font-size: 24px;
  line-height: 30px;
  font-weight: 700;
  color: #1f2937;
}

.summary-label {
  margin-top: 6px;
  font-size: 12px;
  line-height: 18px;
  color: #6b7280;
}

.section-title {
  padding: 20px 16px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.message-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 18px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 10px 28px rgba(20, 34, 66, 0.06);
}

.message-card:active {
  transform: scale(0.992);
}

.message-accent {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.message-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.message-title {
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
  color: #111827;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff5a5f;
  flex-shrink: 0;
}

.message-time {
  font-size: 12px;
  line-height: 18px;
  color: #94a3b8;
  white-space: nowrap;
}

.message-summary {
  margin-top: 6px;
  font-size: 13px;
  line-height: 20px;
  color: #64748b;
}

.message-meta {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.message-location {
  font-size: 12px;
  line-height: 18px;
  color: #94a3b8;
}

.message-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
}
</style>
