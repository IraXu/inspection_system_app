<template>
  <div class="workbench-page app-page">
    <header class="workbench-header gradient-bg">
      <div class="header-glow header-glow-left"></div>
      <div class="header-glow header-glow-right"></div>
      <div class="header-grid"></div>
      <div class="header-content">
        <div class="header-top">
          <div class="header-copy">
            <div class="header-kicker">
              <span class="kicker-dot"></span>
              <span>鹤梦云智慧巡检APP</span>
            </div>
            <h1 class="header-title">工作台</h1>
            <p class="header-subtitle">{{ currentEnterprise.name }}</p>
          </div>

          <div class="header-actions">
            <div class="notification-entry">
              <t-button theme="default" shape="circle" variant="outline" size="small" @click="openNotifications">
                <template #icon><t-icon name="notification" /></template>
              </t-button>
              <span v-if="unreadNotificationCount > 0" class="notification-badge">
                {{ unreadNotificationCount > 9 ? '9+' : unreadNotificationCount }}
              </span>
            </div>
          </div>
        </div>

        <div class="hero-metrics">
          <div class="hero-metric-card">
            <span class="hero-metric-label">设备总数</span>
            <span class="hero-metric-value">{{ deviceStats.total }}</span>
          </div>
          <div class="hero-metric-card">
            <span class="hero-metric-label">在线设备</span>
            <span class="hero-metric-value success">{{ deviceStats.online }}</span>
          </div>
          <div class="hero-metric-card">
            <span class="hero-metric-label">在线率</span>
            <span class="hero-metric-value">{{ deviceStats.onlineRate }}</span>
          </div>
        </div>
      </div>
    </header>

    <section v-if="showInspectionNotice" class="app-section dashboard-section dashboard-section--notice">
      <div
        class="inspection-notice-stack"
        @touchstart.passive="handleInspectionTouchStart"
        @touchmove.passive="handleInspectionTouchMove"
        @touchend="handleInspectionTouchEnd"
        @touchcancel="handleInspectionTouchCancel"
      >
        <div
          v-for="(notice, index) in visibleInspectionNotices"
          :key="notice.id"
          class="inspection-notice-layer app-card"
          :class="[`inspection-notice-layer--${index}`, { 'is-active': index === 0 }]"
          :style="getInspectionNoticeLayerStyle(index)"
          @click="handleInspectionNoticeClick(index)"
        >
          <div class="inspection-notice-main">
            <div class="inspection-notice-badge">
              <t-icon :name="index === 0 ? 'notification' : 'time-filled'" />
              <span>{{ index === 0 ? '任务' : `待处理 ${notice.count}` }}</span>
            </div>

            <div class="inspection-notice-content">
              <div v-if="index === 0" class="inspection-notice-marquee">
                <div class="inspection-notice-marquee-track">
                  <span class="inspection-notice-text">{{ notice.text }}</span>
                  <span class="inspection-notice-text">{{ notice.text }}</span>
                </div>
              </div>

              <div v-else class="inspection-notice-copy">
                <span class="inspection-notice-text inspection-notice-text--static">{{ notice.text }}</span>
              </div>
            </div>

            <button
              v-if="index === 0"
              type="button"
              class="inspection-notice-entry"
              @click.stop="openInspectionTask"
            >
              去执行
              <t-icon name="chevron-right" />
            </button>
          </div>

          <button
            v-if="index === 0"
            type="button"
            class="inspection-notice-close"
            @click="dismissInspectionNotice"
            aria-label="关闭任务通知"
          >
            <t-icon name="close" />
          </button>
        </div>
      </div>
    </section>

    <section class="app-section dashboard-section">
      <button type="button" class="task-card app-card" @click="goTodoPage">
        <div class="card-head">
          <div>
            <div class="section-title">待我处理</div>
          </div>
          <span class="section-link">查看待办</span>
        </div>

        <div class="task-grid">
          <div v-for="item in taskStats" :key="item.label" class="task-item" :class="item.tone">
            <span class="task-label">{{ item.label }}</span>
            <span class="task-value" :class="item.tone">{{ item.value }}</span>
          </div>
        </div>
      </button>
    </section>

    <section class="app-section dashboard-section dashboard-section--alerts">
      <button type="button" class="alerts-card app-card" @click="openNotifications">
        <div class="card-head">
          <div>
            <div class="section-title">设备告警</div>
            <div class="section-note">实时关注现场异常、设备离线与智能识别结果</div>
          </div>
          <span class="section-link">查看消息</span>
        </div>

        <div class="alerts-stream">
          <div class="alerts-stream-track">
            <div
              v-for="notification in rollingNotifications"
              :key="notification.id"
              class="alert-row"
              :class="notification.level"
            >
              <span class="alert-row-dot"></span>
              <div class="alert-row-copy">
                <span class="alert-row-title">{{ notification.title }}</span>
                <span class="alert-row-meta">{{ notification.category }} · {{ notification.time }}</span>
              </div>
              <span class="alert-row-tag">{{ notification.levelLabel }}</span>
            </div>
          </div>
        </div>

        <div class="alerts-foot">
          <span>未读告警 {{ unreadNotificationCount }} 条</span>
          <span>告警流持续更新</span>
        </div>
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { deviceNotifications } from '../../data/device-notifications'

const router = useRouter()

const currentEnterprise = {
  name: 'XX科技有限公司'
}

const inspectionTaskQueue = ref([
  {
    id: 'inspection-east',
    area: '华东区 / 上海工厂 / 生产车间',
    count: 5
  },
  {
    id: 'inspection-south',
    area: '华南区 / 深圳园区 / 仓储中心',
    count: 3
  },
  {
    id: 'inspection-north',
    area: '华北区 / 北京总部 / 能源机房',
    count: 2
  }
])

const showInspectionNotice = computed(() => inspectionTaskQueue.value.length > 0)
const inspectionGesture = ref({
  startX: 0,
  startY: 0,
  deltaY: 0,
  deltaX: 0,
  tracking: false
})

const deviceStats = {
  total: 9,
  online: 6,
  onlineRate: '66.7%'
}

const taskStats = [
  { label: '待执行', value: 10, tone: 'primary' },
  { label: '待整改', value: 8, tone: 'warning' },
  { label: '待审核', value: 2, tone: 'danger' },
  { label: '已完成', value: 99, tone: 'success' }
]

const unreadNotificationCount = computed(() => {
  return deviceNotifications.filter(item => item.status === 'unread').length
})

const rollingNotifications = computed(() => {
  const levelLabelMap = {
    critical: '紧急',
    warning: '重要',
    normal: '提示'
  }

  const base = deviceNotifications.slice(0, 4).map((item) => ({
    ...item,
    levelLabel: levelLabelMap[item.level] || '提示'
  }))

  return [...base, ...base, ...base]
})

const visibleInspectionNotices = computed(() => {
  return inspectionTaskQueue.value.slice(0, 3).map((item) => ({
    ...item,
    text: `您有 ${item.area} 的 ${item.count} 个巡检任务待执行`
  }))
})

const openNotifications = () => {
  router.push('/device-notifications')
}

const dismissInspectionNotice = () => {
  inspectionTaskQueue.value.shift()
}

const shiftInspectionNotice = () => {
  if (inspectionTaskQueue.value.length <= 1) {
    return
  }

  const nextQueue = [...inspectionTaskQueue.value]
  const current = nextQueue.shift()

  if (!current) {
    return
  }

  nextQueue.push(current)
  inspectionTaskQueue.value = nextQueue
}

const openInspectionTask = () => {
  Toast.info('巡检任务模块设计中')
}

const goTodoPage = () => {
  router.push('/todo')
}

const getInspectionNoticeLayerStyle = (index) => {
  const translateY = index * 9
  const insetX = index * 10
  const scale = 1 - index * 0.03
  const opacity = 1 - index * 0.2

  return {
    transform: `translateY(${translateY}px) scale(${scale})`,
    left: `${insetX}px`,
    right: `${insetX}px`,
    opacity,
    zIndex: `${10 - index}`
  }
}

const handleInspectionNoticeClick = (index) => {
  if (index === 0) {
    openInspectionTask()
    return
  }

  const nextQueue = [...inspectionTaskQueue.value]
  const [selected] = nextQueue.splice(index, 1)

  if (!selected) {
    return
  }

  nextQueue.unshift(selected)
  inspectionTaskQueue.value = nextQueue
}

const handleInspectionTouchStart = (event) => {
  if (!inspectionTaskQueue.value.length) {
    return
  }

  const touch = event.touches?.[0]

  if (!touch) {
    return
  }

  inspectionGesture.value = {
    startX: touch.clientX,
    startY: touch.clientY,
    deltaY: 0,
    deltaX: 0,
    tracking: true
  }
}

const handleInspectionTouchMove = (event) => {
  if (!inspectionGesture.value.tracking) {
    return
  }

  const touch = event.touches?.[0]

  if (!touch) {
    return
  }

  inspectionGesture.value.deltaY = touch.clientY - inspectionGesture.value.startY
  inspectionGesture.value.deltaX = touch.clientX - inspectionGesture.value.startX
}

const handleInspectionTouchEnd = () => {
  if (!inspectionGesture.value.tracking) {
    return
  }

  const { deltaY, deltaX } = inspectionGesture.value
  const isIntentionalVerticalSwipe = Math.abs(deltaY) > 36 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2

  if (isIntentionalVerticalSwipe && deltaY < 0) {
    shiftInspectionNotice()
  }

  handleInspectionTouchCancel()
}

const handleInspectionTouchCancel = () => {
  inspectionGesture.value = {
    startX: 0,
    startY: 0,
    deltaY: 0,
    deltaX: 0,
    tracking: false
  }
}
</script>

<style scoped>
.workbench-page {
  background:
    radial-gradient(circle at top, rgba(195, 231, 254, 0.52), transparent 26%),
    linear-gradient(180deg, #f4fbff 0%, #f6f9fc 100%);
}

.workbench-header {
  position: relative;
  overflow: hidden;
  padding: calc(var(--prototype-safe-top) + 10px) var(--prototype-page-padding-x) 22px;
  color: #163150;
  border-radius: 0 0 34px 34px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.72), transparent 34%),
    linear-gradient(180deg, #dff3ff 0%, #c3e7fe 58%, #b7def8 100%);
  box-shadow: 0 22px 44px rgba(87, 136, 171, 0.16);
}

.header-glow {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
  filter: blur(14px);
}

.header-glow-left {
  width: 140px;
  height: 140px;
  top: -36px;
  left: -24px;
}

.header-glow-right {
  width: 180px;
  height: 180px;
  right: -60px;
  top: 18px;
}

.header-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.24) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.32;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.header-copy {
  min-width: 0;
}

.header-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.46);
  color: rgba(22, 49, 80, 0.72);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5cb6e8;
  box-shadow: 0 0 0 5px rgba(92, 182, 232, 0.14);
}

.header-title {
  margin: 12px 0 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #173153;
}

.header-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(23, 49, 83, 0.72);
}

.header-actions :deep(.t-button) {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(123, 183, 223, 0.3);
  color: #1a4d72;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.notification-entry {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ff5a5f;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(255, 90, 95, 0.35);
}

.hero-metrics {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.hero-metric-card {
  padding: 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.46);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.hero-metric-label {
  display: block;
  font-size: 12px;
  color: rgba(23, 49, 83, 0.62);
}

.hero-metric-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: #173153;
}

.hero-metric-value.success {
  color: #1f8f66;
}

.dashboard-section {
  padding-top: 8px;
}

.dashboard-section--notice {
  padding-top: 6px;
  padding-bottom: 0;
}

.dashboard-section--alerts {
  padding-bottom: 4px;
}

.inspection-notice-stack {
  position: relative;
  min-height: 70px;
  padding-bottom: 0;
}

.inspection-notice-layer {
  position: absolute;
  top: 0;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(225, 232, 242, 0.96);
  box-shadow: 0 14px 30px rgba(11, 31, 68, 0.07);
  transform-origin: top center;
  transition: transform 0.32s ease, opacity 0.32s ease, box-shadow 0.32s ease;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.inspection-notice-layer::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(241, 246, 253, 0.36) 100%);
  pointer-events: none;
}

.inspection-notice-layer--1 {
  box-shadow: 0 10px 20px rgba(11, 31, 68, 0.06);
  filter: saturate(0.9);
}

.inspection-notice-layer--2 {
  box-shadow: 0 8px 16px rgba(11, 31, 68, 0.05);
  filter: saturate(0.82);
}

.inspection-notice-layer.is-active {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 250, 255, 0.98) 100%);
  animation: inspection-notice-breathe 3.8s ease-in-out infinite;
}

.inspection-notice-layer:not(.is-active):active {
  transform: translateY(2px) scale(0.98) !important;
}

.inspection-notice-main {
  position: relative;
  z-index: 1;
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.inspection-notice-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(195, 231, 254, 0.7);
  color: #2d7eb0;
  font-size: 12px;
  font-weight: 700;
}

.inspection-notice-content {
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.inspection-notice-marquee {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
}

.inspection-notice-marquee-track {
  width: max-content;
  display: inline-flex;
  align-items: center;
  gap: 28px;
  white-space: nowrap;
  animation: inspection-notice-marquee 14s linear infinite;
}

.inspection-notice-copy {
  min-width: 0;
}

.inspection-notice-text {
  color: #355071;
  font-size: 13px;
  line-height: 1.4;
}

.inspection-notice-text--static {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspection-notice-entry {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: #2d7eb0;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.inspection-notice-close {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border: 0;
  border-radius: 999px;
  background: rgba(241, 245, 251, 0.96);
  color: #90a0b6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.inspection-notice-entry:active,
.inspection-notice-close:active {
  transform: scale(0.96);
}

@keyframes inspection-notice-breathe {
  0%,
  100% {
    transform: translateY(0) scale(1);
    box-shadow: 0 14px 30px rgba(11, 31, 68, 0.07);
  }
  50% {
    transform: translateY(-2px) scale(1.006);
    box-shadow: 0 18px 36px rgba(11, 31, 68, 0.1);
  }
}

@keyframes inspection-notice-marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - 14px));
  }
}

.task-card,
.alerts-card {
  width: 100%;
  padding: 20px;
  border: 0;
  text-align: left;
  box-shadow: 0 18px 36px rgba(11, 31, 68, 0.08);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #173153;
}

.section-note {
  margin-top: 6px;
  font-size: 12px;
  color: #7b8799;
  line-height: 1.5;
}

.section-link {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(195, 231, 254, 0.6);
  color: #2d7eb0;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.task-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.task-item {
  padding: 12px 12px 13px;
  border-radius: 18px;
  background:
    radial-gradient(circle at top right, rgba(195, 231, 254, 0.7), transparent 42%),
    linear-gradient(180deg, rgba(244, 247, 253, 0.98) 0%, #ffffff 100%);
  border: 1px solid rgba(229, 235, 244, 0.96);
  text-align: center;
}

.task-value {
  display: block;
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #173153;
  line-height: 1;
}

.task-value.success {
  color: #16a34a;
}

.task-value.primary {
  color: var(--theme-primary-strong);
}

.task-value.warning {
  color: #d97706;
}

.task-value.danger {
  color: #d54941;
}

.task-label {
  display: block;
  font-size: 12px;
  color: #7d899b;
  text-align: center;
}

.alerts-stream {
  margin-top: 16px;
  height: 220px;
  overflow: hidden;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(245, 248, 253, 0.92) 0%, #ffffff 100%);
  border: 1px solid rgba(226, 234, 245, 0.96);
  position: relative;
}

.alerts-stream::before,
.alerts-stream::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 28px;
  z-index: 2;
  pointer-events: none;
}

.alerts-stream::before {
  top: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 100%);
}

.alerts-stream::after {
  bottom: 0;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 100%);
}

.alerts-stream-track {
  display: grid;
  gap: 10px;
  padding: 14px;
  animation: alert-stream 18s linear infinite;
}

.alert-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(231, 237, 245, 0.96);
  box-shadow: 0 8px 18px rgba(18, 37, 70, 0.04);
}

.alert-row.critical {
  background: linear-gradient(135deg, #fff4f2 0%, #ffffff 100%);
}

.alert-row.warning {
  background: linear-gradient(135deg, #fff9ef 0%, #ffffff 100%);
}

.alert-row-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--theme-primary);
  flex: 0 0 9px;
  margin-top: 6px;
  box-shadow: 0 0 0 6px rgba(var(--theme-primary-rgb), 0.08);
}

.alert-row.critical .alert-row-dot {
  background: #d54941;
  box-shadow: 0 0 0 6px rgba(213, 73, 65, 0.08);
}

.alert-row.warning .alert-row-dot {
  background: #d97706;
  box-shadow: 0 0 0 6px rgba(217, 119, 6, 0.08);
}

.alert-row-copy {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 4px;
}

.alert-row-title {
  font-size: 14px;
  line-height: 1.45;
  color: #23406b;
  font-weight: 600;
}

.alert-row-meta {
  font-size: 12px;
  color: #7e8ca1;
}

.alert-row-tag {
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(var(--theme-primary-rgb), 0.08);
  color: var(--theme-primary-strong);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.alert-row.critical .alert-row-tag {
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.alert-row.warning .alert-row-tag {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.alerts-foot {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #7d899b;
}

@keyframes alert-stream {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

@keyframes inspection-marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - 18px));
  }
}

@media (max-width: 360px) {
  .hero-metrics {
    grid-template-columns: 1fr;
  }

  .inspection-notice {
    padding: 12px;
  }

  .inspection-notice-main {
    gap: 10px;
  }

  .task-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .task-item {
    padding: 12px;
  }

  .task-value {
    font-size: 22px;
  }
}
</style>
