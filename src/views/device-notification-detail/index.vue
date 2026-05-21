<template>
  <div class="notification-detail-page app-page app-page--navbar">
    <t-navbar title="告警详情" left-arrow @left-click="goBack" class="page-navbar" />

    <template v-if="notification">
      <div class="detail-hero">
        <div class="detail-badge" :style="{ background: levelMeta.bg, color: levelMeta.accent }">
          <t-icon :name="levelMeta.icon" size="26px" />
        </div>
        <div class="detail-info">
          <div class="detail-title">{{ notification.title }}</div>
          <div class="detail-subtitle">{{ notification.time }} · {{ notification.storeName }}</div>
        </div>
      </div>

      <div class="detail-card">
        <div class="detail-tags">
          <t-tag :theme="levelMeta.theme" variant="light">{{ levelMeta.label }}</t-tag>
          <t-tag theme="default" variant="outline">{{ notification.category }}</t-tag>
          <t-tag theme="default" variant="outline">{{ statusText }}</t-tag>
        </div>
        <div class="detail-summary">{{ notification.summary }}</div>
      </div>

      <div class="detail-card">
        <div class="card-title">设备信息</div>
        <div class="info-row">
          <span class="info-label">设备名称</span>
          <span class="info-value">{{ notification.deviceName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">安装位置</span>
          <span class="info-value">{{ notification.location }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">消息来源</span>
          <span class="info-value">{{ notification.reportedBy }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">当前处理人</span>
          <span class="info-value">{{ notification.handler }}</span>
        </div>
      </div>

      <div class="detail-card">
        <div class="card-title">影响说明</div>
        <div class="impact-text">{{ notification.impact }}</div>
      </div>

      <div class="detail-card">
        <div class="card-title">处理建议</div>
        <div class="suggestion-list">
          <div v-for="(item, index) in notification.suggestions" :key="item" class="suggestion-item">
            <div class="suggestion-index">{{ index + 1 }}</div>
            <div class="suggestion-text">{{ item }}</div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <t-button block variant="outline" @click="goBack">返回消息列表</t-button>
        <t-button block theme="primary" @click="viewDevice">查看设备详情</t-button>
      </div>
    </template>

    <div v-else class="empty-wrap">
      <t-empty description="未找到该告警消息" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import {
  deviceNotifications,
  notificationLevelMap,
  notificationStatusMap
} from '../../data/device-notifications'

const route = useRoute()
const router = useRouter()

const notification = computed(() => {
  return deviceNotifications.find(item => item.id === route.params.id)
})

const levelMeta = computed(() => {
  return notificationLevelMap[notification.value?.level] || notificationLevelMap.normal
})

const statusText = computed(() => {
  return notificationStatusMap[notification.value?.status] || '未知'
})

const goBack = () => {
  router.back()
}

const viewDevice = () => {
  if (!notification.value) {
    Toast.error('未找到设备信息')
    return
  }
  router.push(`/video-player/${notification.value.deviceId}`)
}
</script>

<style scoped>
.notification-detail-page {
  background:
    radial-gradient(circle at top left, rgba(var(--theme-primary-rgb), 0.12), transparent 34%),
    linear-gradient(180deg, #f7faff 0%, #f5f7fb 32%, #f5f7fb 100%);
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

.detail-hero {
  margin: 16px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f4f8ff 100%);
  box-shadow: 0 12px 30px rgba(18, 42, 76, 0.07);
  display: flex;
  gap: 14px;
  align-items: center;
}

.detail-badge {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-info {
  min-width: 0;
}

.detail-title {
  font-size: 19px;
  line-height: 28px;
  font-weight: 700;
  color: #0f172a;
}

.detail-subtitle {
  margin-top: 6px;
  font-size: 13px;
  line-height: 20px;
  color: #64748b;
}

.detail-card {
  margin: 0 16px 12px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(20, 34, 66, 0.05);
}

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-summary {
  margin-top: 12px;
  font-size: 14px;
  line-height: 22px;
  color: #334155;
}

.card-title {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #edf2f7;
}

.info-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.info-label {
  font-size: 13px;
  line-height: 20px;
  color: #64748b;
  white-space: nowrap;
}

.info-value {
  font-size: 14px;
  line-height: 20px;
  color: #1e293b;
  text-align: right;
}

.impact-text {
  font-size: 14px;
  line-height: 22px;
  color: #334155;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.suggestion-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eaf2ff;
  color: var(--theme-primary-strong);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggestion-text {
  font-size: 14px;
  line-height: 21px;
  color: #334155;
}

.action-bar {
  margin: 20px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-wrap {
  padding: 80px 16px 0;
}
</style>
