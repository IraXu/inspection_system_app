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
          <div class="detail-head-row">
            <h1 class="detail-title">{{ eventLabel }}</h1>
          </div>
          <p class="detail-subtitle">{{ notification.time }} · {{ notification.storeName }}</p>
        </div>
      </div>

      <div class="detail-card">
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
      </div>

      <div class="action-spacer"></div>

      <div class="action-bar">
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
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(120% 36% at 84% -2%, rgba(198, 210, 245, 0.66) 0%, rgba(255, 255, 255, 0) 72%),
    radial-gradient(80% 34% at 8% 100%, rgba(214, 246, 236, 0.42) 0%, rgba(255, 255, 255, 0) 70%),
    linear-gradient(180deg, #eef0fa 0%, #f7f9fe 30%, #ffffff 64%);
}

.page-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: linear-gradient(180deg, rgba(237, 240, 250, 0.94) 0%, rgba(240, 243, 250, 0.72) 100%) !important;
  border-bottom: 0;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.page-navbar :deep(.t-navbar__content),
.page-navbar :deep(.t-navbar__title),
.page-navbar :deep(.t-navbar__left),
.page-navbar :deep(.t-navbar__right) {
  color: #1b1d24;
}

.page-navbar :deep(.t-navbar__title) {
  font-size: 17px;
  font-weight: 700;
}

.navbar-delete {
  border: 0;
  background: transparent;
  color: #e5484d;
  padding: 4px;
  display: inline-flex;
  align-items: center;
}

.detail-banner {
  margin: 12px var(--prototype-page-padding-x) 0;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.detail-image {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #eef1f8;
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

.detail-head-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 600;
  color: #1c1d24;
}

.detail-subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #9498a6;
}

.detail-card {
  margin: 12px var(--prototype-page-padding-x) 0;
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.card-title {
  margin: 0 0 12px;
  font-size: 19px;
  line-height: 1.3;
  font-weight: 700;
  color: #1b1c22;
  letter-spacing: -0.01em;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f1f4;
}

.info-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.info-label {
  font-size: 12px;
  line-height: 20px;
  color: #9b9da6;
  white-space: nowrap;
}

.info-value {
  font-size: 13px;
  line-height: 20px;
  color: #2b2c33;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.action-spacer {
  flex: 1;
  min-height: 12px;
}

.action-bar {
  position: sticky;
  bottom: 0;
  margin: 0 var(--prototype-page-padding-x);
  padding: 10px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(238, 240, 245, 0.9);
  border-radius: 18px;
  box-shadow: 0 -10px 30px rgba(24, 36, 72, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  z-index: 10;
}

.action-btn {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
}

.action-btn--primary {
  background: #4059f0;
  color: #fff;
  box-shadow: 0 8px 18px rgba(64, 89, 240, 0.24);
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
  border-radius: 20px;
}

.dialog-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 16px;
  background: #fdeeee;
  color: #e5484d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.dialog-title {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 700;
  color: #1b1c22;
}

.dialog-content {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #7a7e8a;
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
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}

.dialog-btn--ghost {
  background: #f2f3f7;
  color: #5a5e69;
}

.dialog-btn--danger {
  background: #e5484d;
  color: #fff;
}
</style>
