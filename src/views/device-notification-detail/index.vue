<template>
  <div class="notification-detail-page app-page app-page--navbar">
    <t-navbar title="告警详情" left-arrow class="page-navbar" @left-click="goBack">
      <template #right>
        <button type="button" class="navbar-delete" @click="deleteDialogVisible = true">
          <t-icon name="delete" size="18px" />
        </button>
      </template>
    </t-navbar>

    <template v-if="notification">
      <div class="detail-banner app-card">
        <div class="detail-image" @click="viewerVisible = true">
          <img :src="notification.eventImage" alt="" @error="hideBrokenImage" />
          <div class="detail-image-shade"></div>
          <span class="detail-image-tip">点击查看告警截图</span>
        </div>

        <div class="detail-head">
          <h1 class="detail-title">{{ eventLabel }}</h1>
          <p class="detail-subtitle">{{ notification.time }} · {{ notification.storeName }}</p>
        </div>
      </div>

      <div class="detail-card app-card">
        <div class="card-title">告警信息</div>
        <div class="info-row">
          <span class="info-label">事件类型</span>
          <span class="info-value">{{ eventLabel }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">设备名称</span>
          <span class="info-value">{{ notification.deviceName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">告警时间</span>
          <span class="info-value">{{ notification.timestamp }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">所属组织</span>
          <span class="info-value">{{ notification.orgPath }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">设备 License</span>
          <span class="info-value">{{ notification.license }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">安装位置</span>
          <span class="info-value">{{ notification.location }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">消息来源</span>
          <span class="info-value">{{ notification.reportedBy }}</span>
        </div>
      </div>

      <div class="detail-card app-card">
        <div class="card-title">事件说明</div>
        <p class="impact-text">{{ notification.summary }}</p>
        <p class="impact-text impact-text--sub">{{ notification.impact }}</p>
      </div>

      <div class="detail-card app-card">
        <div class="card-title">处理建议</div>
        <div class="suggestion-list">
          <div v-for="(item, index) in notification.suggestions" :key="item" class="suggestion-item">
            <div class="suggestion-index">{{ index + 1 }}</div>
            <div class="suggestion-text">{{ item }}</div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button type="button" class="action-btn action-btn--ghost" @click="goBack">
          返回列表
        </button>
        <button type="button" class="action-btn action-btn--primary" @click="viewDevice">
          查看设备详情
        </button>
      </div>
    </template>

    <t-empty v-else class="empty-wrap" description="未找到该告警消息" />

    <div v-if="deleteDialogVisible" class="dialog-overlay" @click="deleteDialogVisible = false">
      <div class="dialog app-card" @click.stop>
        <div class="dialog-icon">
          <t-icon name="error-circle-filled" />
        </div>
        <div class="dialog-title">删除告警消息</div>
        <div class="dialog-content">确认删除该条告警记录吗？删除后将无法恢复。</div>
        <div class="dialog-actions">
          <button type="button" class="dialog-btn dialog-btn--ghost" @click="deleteDialogVisible = false">
            取消
          </button>
          <button type="button" class="dialog-btn dialog-btn--danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>

    <PhotoViewer
      v-model:visible="viewerVisible"
      :url="notification?.eventImage || ''"
      :caption="notification ? `${eventLabel} · ${notification.deviceName}` : ''"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useNotificationStore } from '../../stores/notifications'
import { eventTypeMap } from '../../data/device-notifications'
import PhotoViewer from '../../components/PhotoViewer.vue'

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

const notification = computed(() => notificationStore.getById(route.params.id))

const eventLabel = computed(
  () => eventTypeMap[notification.value?.eventType]?.label || notification.value?.category || '其他事件'
)

const deleteDialogVisible = ref(false)
const viewerVisible = ref(false)

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

const confirmDelete = () => {
  if (notification.value) {
    notificationStore.removeAlerts([notification.value.id])
    Toast.success('告警已删除')
  }
  deleteDialogVisible.value = false
  router.back()
}

const hideBrokenImage = (event) => {
  event.target.style.opacity = '0'
}

onMounted(() => {
  if (notification.value?.status === 'unread') {
    notificationStore.markRead(notification.value.id)
  }
})
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

.navbar-delete {
  border: 0;
  background: transparent;
  color: #d54941;
  padding: 4px;
  display: inline-flex;
  align-items: center;
}

.detail-banner {
  margin: 16px;
  border-radius: 22px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 16px 34px rgba(18, 42, 76, 0.09);
}

.detail-image {
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  overflow: hidden;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.2s ease;
}

.detail-image-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(9, 16, 28, 0.5) 0%, rgba(9, 16, 28, 0.02) 46%);
}

.detail-image-tip {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.86);
}

.detail-head {
  padding: 14px 16px 16px;
}

.detail-title {
  margin: 0;
  font-size: 19px;
  line-height: 1.4;
  font-weight: 700;
  color: #0f172a;
}

.detail-subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: #64748b;
}

.detail-card {
  margin: 0 16px 12px;
  padding: 16px;
  border-radius: 18px;
}

.card-title {
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid #edf2f7;
}

.info-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.info-label {
  font-size: 12px;
  line-height: 20px;
  color: #64748b;
  white-space: nowrap;
}

.info-value {
  font-size: 13px;
  line-height: 20px;
  color: #1e293b;
  text-align: right;
  word-break: break-all;
}

.impact-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #334155;
}

.impact-text--sub {
  margin-top: 8px;
  color: #64748b;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.suggestion-index {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #eaf2ff;
  color: var(--theme-primary-strong);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggestion-text {
  font-size: 13px;
  line-height: 1.55;
  color: #334155;
}

.action-bar {
  margin: 18px 16px calc(16px + var(--prototype-safe-bottom));
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 10px;
}

.action-btn {
  height: 44px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.action-btn--ghost {
  background: rgba(236, 243, 251, 0.96);
  color: #3f6f94;
}

.action-btn--primary {
  background: linear-gradient(135deg, var(--theme-glass-4) 0%, var(--theme-primary) 58%, var(--theme-primary-strong) 100%);
  color: #fff;
  box-shadow: 0 10px 22px rgba(var(--theme-primary-rgb), 0.22);
}

.empty-wrap {
  padding-top: 90px;
}

.dialog-overlay {
  position: fixed;
  left: var(--preview-overlay-left, 0);
  top: var(--preview-overlay-top, 0);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100vh);
  z-index: 1600;
  background: rgba(13, 23, 43, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dialog {
  width: 100%;
  max-width: 320px;
  padding: 22px 20px 18px;
  text-align: center;
}

.dialog-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 18px;
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.dialog-title {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 700;
  color: #173153;
}

.dialog-content {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #6f8199;
}

.dialog-actions {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.dialog-btn {
  height: 42px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.dialog-btn--ghost {
  background: rgba(239, 244, 251, 0.96);
  color: #59718f;
}

.dialog-btn--danger {
  background: #d54941;
  color: #fff;
}
</style>
