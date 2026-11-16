<template>
  <div class="workbench-page app-page">
    <header class="workbench-hero">
      <div class="hero-cubes" aria-hidden="true">
        <span class="hero-cube hero-cube--a"><i></i><i></i><i></i></span>
        <span class="hero-cube hero-cube--b"><i></i><i></i><i></i></span>
        <span class="hero-cube hero-cube--c"><i></i><i></i><i></i></span>
      </div>

      <div class="hero-content">
        <div class="hero-top">
          <div class="hero-copy">
            <h1 class="hero-title">工作台</h1>
            <p class="hero-subtitle">{{ currentEnterprise.name }}</p>
          </div>

          <div class="notification-entry">
            <button type="button" class="hero-bell" aria-label="消息通知" @click="openNotifications">
              <t-icon name="notification" />
            </button>
            <span v-if="unreadNotificationCount > 0" class="notification-badge">
              {{ unreadNotificationCount > 9 ? '9+' : unreadNotificationCount }}
            </span>
          </div>
        </div>

        <div class="hero-metrics">
          <div class="hero-metric-card">
            <span class="hero-metric-label">设备总数</span>
            <span class="hero-metric-value">{{ deviceStats.total }}</span>
          </div>
          <div class="hero-metric-card">
            <span class="hero-metric-label">在线设备</span>
            <span class="hero-metric-value">{{ deviceStats.online }}</span>
          </div>
          <div class="hero-metric-card">
            <span class="hero-metric-label">在线率</span>
            <span class="hero-metric-value" :class="onlineRateTone">{{ onlineRateText }}</span>
          </div>
        </div>
      </div>
    </header>

    <section v-if="showInspectionNotice" class="app-section workbench-section workbench-section--notice">
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
          class="inspection-notice-layer"
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
            @click.stop="dismissInspectionNotice"
            aria-label="关闭任务通知"
          >
            <t-icon name="close" />
          </button>
        </div>
      </div>
    </section>

    <section class="app-section workbench-section">
      <div class="section-head">
        <div class="section-head-main">
          <h2 class="section-title">待我处理</h2>
          <span class="section-count-pill">{{ pendingTotal }} 项</span>
        </div>
        <button type="button" class="section-link" @click="goTodoPage">查看待办</button>
      </div>
      <p class="section-note">当前工作企业统计</p>

      <div class="task-grid">
        <button
          v-for="item in taskStats"
          :key="item.label"
          type="button"
          class="task-item"
          :class="item.tone"
          @click="goTodoPage"
        >
          <span class="task-icon" aria-hidden="true">
            <svg class="task-icon-doc" viewBox="0 0 44 54" fill="none">
              <rect
                x="1"
                y="1"
                width="39"
                height="49"
                rx="7"
                fill="#ffffff"
                fill-opacity="0.94"
                stroke="currentColor"
                stroke-opacity="0.22"
                stroke-width="2"
              />
              <rect x="9" y="12" width="23" height="4" rx="2" fill="currentColor" fill-opacity="0.72" />
              <rect x="9" y="21" width="15" height="4" rx="2" fill="currentColor" fill-opacity="0.34" />
              <rect x="9" y="30" width="19" height="4" rx="2" fill="currentColor" fill-opacity="0.34" />
            </svg>
            <span class="task-icon-badge"><t-icon :name="item.icon" /></span>
          </span>
          <span class="task-label">{{ item.label }}</span>
          <span class="task-value">{{ item.value }}</span>
        </button>
      </div>
    </section>

    <section class="app-section workbench-section workbench-section--alerts">
      <div class="section-head">
        <h2 class="section-title">设备告警</h2>
        <button type="button" class="section-link" @click="openNotifications">查看消息</button>
      </div>
      <p class="section-note">实时关注现场异常、设备离线与智能识别结果</p>

      <div class="alerts-card" @click="openNotifications">
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
          <span>未读告警 {{ unreadNotificationCount }} 条 · 告警流持续更新</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '../../stores/todo'
import { useNotificationStore } from '../../stores/notifications'

const router = useRouter()
const todoStore = useTodoStore()
const notificationStore = useNotificationStore()

const currentEnterprise = {
  name: 'XX科技有限公司'
}

const dismissedNoticeIds = ref([])
const noticeOrder = ref([])

const noticeGroups = computed(() => {
  const groups = new Map()
  todoStore.pendingTasks.forEach((task) => {
    const current = groups.get(task.storeName) || {
      id: task.storeName,
      area: task.storeName,
      count: 0,
      taskIds: []
    }
    current.count += 1
    current.taskIds.push(task.id)
    groups.set(task.storeName, current)
  })
  return Array.from(groups.values())
})

const inspectionTaskQueue = computed(() => {
  const list = noticeGroups.value.filter((group) => !dismissedNoticeIds.value.includes(group.id))
  const order = noticeOrder.value
  return [...list].sort((a, b) => {
    const indexA = order.indexOf(a.id)
    const indexB = order.indexOf(b.id)
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
  })
})

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
  online: 6
}

const onlineRateValue = computed(() =>
  deviceStats.total ? (deviceStats.online / deviceStats.total) * 100 : 0
)

const onlineRateText = computed(() => `${onlineRateValue.value.toFixed(1)}%`)

const onlineRateTone = computed(() => {
  if (onlineRateValue.value >= 90) return 'tone-good'
  if (onlineRateValue.value >= 70) return 'tone-normal'
  if (onlineRateValue.value >= 50) return 'tone-warning'
  return 'tone-danger'
})

const taskStats = computed(() => [
  { label: '待执行', value: todoStore.pendingTasks.length, tone: 'primary', icon: 'task-time' },
  { label: '待整改', value: todoStore.rectifyTickets.length, tone: 'warning', icon: 'tools' },
  { label: '待审核', value: todoStore.reviewTickets.length, tone: 'mint', icon: 'user' },
  { label: '已完成', value: todoStore.completedTickets.length, tone: 'rose', icon: 'check' }
])

const pendingTotal = computed(
  () =>
    todoStore.pendingTasks.length + todoStore.rectifyTickets.length + todoStore.reviewTickets.length
)

const unreadNotificationCount = computed(() => notificationStore.unreadCount)

const rollingNotifications = computed(() => {
  const levelLabelMap = {
    critical: '紧急',
    warning: '重要',
    normal: '提示'
  }

  const base = notificationStore.items.slice(0, 4).map((item) => ({
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
  const first = inspectionTaskQueue.value[0]
  if (first) {
    dismissedNoticeIds.value = [...dismissedNoticeIds.value, first.id]
  }
}

const shiftInspectionNotice = () => {
  if (inspectionTaskQueue.value.length <= 1) {
    return
  }

  const ids = inspectionTaskQueue.value.map((item) => item.id)
  noticeOrder.value = [...ids.slice(1), ids[0]]
}

const openInspectionTask = () => {
  const task = inspectionTaskQueue.value[0]
  const targetId = task?.taskIds?.[0] || todoStore.pendingTasks[0]?.id
  if (targetId) {
    router.push(`/todo/inspection/${targetId}`)
    return
  }
  router.push('/todo')
}

const goTodoPage = () => {
  router.push('/todo')
}

const getInspectionNoticeLayerStyle = (index) => {
  const translateY = index * -8
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

  const ids = inspectionTaskQueue.value.map((item) => item.id)
  const [selected] = ids.splice(index, 1)

  if (!selected) {
    return
  }

  noticeOrder.value = [selected, ...ids]
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
    radial-gradient(130% 46% at 82% -6%, rgba(201, 212, 245, 0.7) 0%, rgba(226, 232, 250, 0.42) 44%, rgba(255, 255, 255, 0) 78%),
    linear-gradient(180deg, #e9ecfa 0%, #f4f6fd 30%, #ffffff 58%);
}

.workbench-hero {
  position: relative;
  overflow: hidden;
  padding: calc(var(--prototype-safe-top) + 24px) var(--prototype-page-padding-x) 10px;
  background:
    radial-gradient(120% 78% at 78% -18%, rgba(255, 255, 255, 0.5), transparent 56%),
    linear-gradient(180deg, #e6e9f9 0%, #ebeefb 48%, rgba(247, 248, 253, 0) 100%);
}

.hero-cubes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-cube {
  position: absolute;
  display: block;
}

.hero-cube i {
  position: absolute;
  inset: 0;
  display: block;
}

.hero-cube i:nth-child(1) {
  clip-path: polygon(50% 2%, 98% 26%, 50% 50%, 2% 26%);
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.92), rgba(213, 221, 244, 0.66));
}

.hero-cube i:nth-child(2) {
  clip-path: polygon(2% 26%, 50% 50%, 50% 98%, 2% 74%);
  background: linear-gradient(180deg, rgba(206, 215, 241, 0.7), rgba(186, 198, 234, 0.56));
}

.hero-cube i:nth-child(3) {
  clip-path: polygon(98% 26%, 50% 50%, 50% 98%, 98% 74%);
  background: linear-gradient(180deg, rgba(231, 236, 251, 0.78), rgba(203, 214, 243, 0.62));
}

.hero-cube--a {
  top: -74px;
  right: -78px;
  width: 296px;
  height: 264px;
}

.hero-cube--b {
  top: 156px;
  right: -104px;
  width: 224px;
  height: 200px;
  opacity: 0.9;
}

.hero-cube--c {
  top: 14px;
  left: -88px;
  width: 156px;
  height: 140px;
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.hero-copy {
  min-width: 0;
}

.hero-title {
  font-size: 35px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.15;
  color: #16181f;
}

.hero-subtitle {
  margin-top: 12px;
  font-size: 15px;
  color: #666b7c;
}

.notification-entry {
  position: relative;
  flex: 0 0 auto;
}

.hero-bell {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.62);
  color: #3d4762;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  box-shadow: 0 6px 16px rgba(93, 110, 160, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.hero-bell:active {
  transform: scale(0.94);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
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
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.hero-metric-card {
  position: relative;
  min-width: 0;
  min-height: 112px;
  padding: 16px 13px 17px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  background:
    radial-gradient(90% 72% at 16% 0%, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0) 62%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.74) 0%, rgba(236, 241, 253, 0.6) 56%, rgba(220, 228, 249, 0.54) 100%);
  border: 1px solid rgba(255, 255, 255, 0.68);
  box-shadow:
    0 0 0 5px rgba(255, 255, 255, 0.16),
    0 16px 34px rgba(120, 134, 180, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
  overflow: hidden;
}

.hero-metric-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 46%);
  pointer-events: none;
}

.hero-metric-label,
.hero-metric-value {
  position: relative;
  z-index: 1;
}

.hero-metric-label {
  font-size: 15px;
  line-height: 1.2;
  color: #5f6474;
  white-space: nowrap;
}

.hero-metric-value {
  display: block;
  font-size: 27px;
  font-weight: 800;
  line-height: 1;
  color: #16181f;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: color 0.25s ease;
}

.hero-metric-value.tone-good {
  color: #12946a;
}

.hero-metric-value.tone-normal {
  color: #3d6cf5;
}

.hero-metric-value.tone-warning {
  color: #e08c2e;
}

.hero-metric-value.tone-danger {
  color: #e5484d;
}

.workbench-section {
  padding-top: 18px;
}

.workbench-section--notice {
  padding-top: 14px;
}

.workbench-section--alerts {
  padding-top: 22px;
  padding-bottom: 10px;
}

/* 任务堆叠 */
.inspection-notice-stack {
  position: relative;
  min-height: 88px;
}

.inspection-notice-layer {
  position: absolute;
  top: 20px;
  padding: 13px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(235, 239, 248, 0.94);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.08);
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(243, 247, 253, 0.28) 100%);
  pointer-events: none;
}

.inspection-notice-layer--1 {
  box-shadow: 0 10px 20px rgba(24, 36, 72, 0.06);
  filter: saturate(0.9);
}

.inspection-notice-layer--2 {
  box-shadow: 0 8px 16px rgba(24, 36, 72, 0.05);
  filter: saturate(0.82);
}

.inspection-notice-layer.is-active {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
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
  gap: 10px;
}

.inspection-notice-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #fff4e3;
  color: #3d4459;
  font-size: 13px;
  font-weight: 700;
}

.inspection-notice-badge :deep(.t-icon) {
  font-size: 16px;
  color: #f6a821;
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
  color: #5b6479;
  font-size: 14px;
  font-weight: 600;
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
  color: #3d6cf5;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.inspection-notice-close {
  position: relative;
  z-index: 1;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border: 0;
  border-radius: 999px;
  background: #f4f6fb;
  color: #b9c0cf;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.inspection-notice-entry:active,
.inspection-notice-close:active {
  transform: scale(0.96);
}

/* 区块标题 */
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-head-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1c2333;
  letter-spacing: -0.01em;
}

.section-count-pill {
  padding: 3px 11px;
  border-radius: 999px;
  background: linear-gradient(135deg, #5c6cf8 0%, #4058ef 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(74, 92, 238, 0.22);
}

.section-link {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  padding: 0;
  color: #3d6cf5;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.section-link:active {
  opacity: 0.72;
}

.section-note {
  margin-top: 9px;
  font-size: 13px;
  color: #949bac;
  line-height: 1.5;
}

/* 待办统计 */
.task-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.task-item {
  position: relative;
  min-height: 96px;
  padding: 14px 16px;
  border: 0;
  border-radius: 16px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.task-item:active {
  transform: scale(0.98);
}

.task-label {
  font-size: 16px;
  font-weight: 600;
  color: #232c3d;
  line-height: 1.2;
}

.task-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: #1c2333;
  letter-spacing: -0.01em;
}

.task-icon {
  position: absolute;
  right: 13px;
  bottom: 13px;
  width: 52px;
  height: 50px;
  pointer-events: none;
}

.task-icon-doc {
  position: absolute;
  left: 0;
  top: 0;
  width: 39px;
  height: 48px;
}

.task-icon-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  border: 2px solid rgba(255, 255, 255, 0.92);
}

.task-item.primary {
  background: linear-gradient(150deg, #e3efff 0%, #f4f9ff 100%);
  box-shadow: 0 12px 26px rgba(88, 137, 214, 0.1);
}

.task-item.primary .task-icon {
  color: #5b9df6;
}

.task-item.primary .task-icon-badge {
  background: linear-gradient(140deg, #74c4ff 0%, #3f83ee 100%);
  box-shadow: 0 5px 12px rgba(63, 131, 238, 0.32);
}

.task-item.warning {
  background: linear-gradient(150deg, #ffeede 0%, #fff9f3 100%);
  box-shadow: 0 12px 26px rgba(224, 148, 73, 0.1);
}

.task-item.warning .task-icon {
  color: #f3aa64;
}

.task-item.warning .task-icon-badge {
  background: linear-gradient(140deg, #ffbe6d 0%, #f08a3c 100%);
  box-shadow: 0 5px 12px rgba(240, 138, 60, 0.3);
}

.task-item.mint {
  background: linear-gradient(150deg, #ddf8ef 0%, #f4fffb 100%);
  box-shadow: 0 12px 26px rgba(64, 178, 147, 0.1);
}

.task-item.mint .task-icon {
  color: #5fcdb1;
}

.task-item.mint .task-icon-badge {
  background: linear-gradient(140deg, #6adcbd 0%, #2fb695 100%);
  box-shadow: 0 5px 12px rgba(47, 182, 149, 0.3);
}

.task-item.rose {
  background: linear-gradient(150deg, #ffe7e3 0%, #fff8f7 100%);
  box-shadow: 0 12px 26px rgba(224, 112, 100, 0.1);
}

.task-item.rose .task-icon {
  color: #ffa29a;
}

.task-item.rose .task-icon-badge {
  background: linear-gradient(140deg, #ffa499 0%, #f56b60 100%);
  box-shadow: 0 5px 12px rgba(245, 107, 96, 0.3);
}

/* 设备告警 */
.alerts-card {
  margin-top: 14px;
  padding: 12px;
  border-radius: 22px;
  background: linear-gradient(168deg, #fbfcff 0%, #f5fbfa 100%);
  border: 1px solid rgba(235, 240, 248, 0.92);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
  cursor: pointer;
}

.alerts-stream {
  height: 236px;
  overflow: hidden;
  border-radius: 16px;
  position: relative;
}

.alerts-stream::before,
.alerts-stream::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 26px;
  z-index: 2;
  pointer-events: none;
}

.alerts-stream::before {
  top: 0;
  background: linear-gradient(180deg, rgba(251, 252, 255, 0.96) 0%, rgba(251, 252, 255, 0) 100%);
}

.alerts-stream::after {
  bottom: 0;
  background: linear-gradient(0deg, rgba(248, 252, 253, 0.96) 0%, rgba(248, 252, 253, 0) 100%);
}

.alerts-stream-track {
  display: grid;
  gap: 10px;
  padding: 3px 2px;
  animation: alert-stream 24s linear infinite;
}

.alert-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(24, 36, 72, 0.05);
}

.alert-row-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #6172f3;
  flex: 0 0 9px;
  margin-top: 7px;
  box-shadow: 0 0 0 5px rgba(97, 114, 243, 0.1);
}

.alert-row.critical .alert-row-dot {
  background: #f04438;
  box-shadow: 0 0 0 5px rgba(240, 68, 56, 0.1);
}

.alert-row.warning .alert-row-dot {
  background: #f79009;
  box-shadow: 0 0 0 5px rgba(247, 144, 9, 0.1);
}

.alert-row-copy {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 5px;
}

.alert-row-title {
  font-size: 15px;
  line-height: 1.4;
  color: #232c3d;
  font-weight: 600;
}

.alert-row-meta {
  font-size: 12px;
  color: #9aa1b2;
}

.alert-row-tag {
  flex: 0 0 auto;
  padding: 3px 8px;
  border-radius: 6px;
  background: #eceffe;
  color: #5468dd;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.alert-row.critical .alert-row-tag {
  background: #feecea;
  color: #e5484d;
}

.alert-row.warning .alert-row-tag {
  background: #fff2e2;
  color: #e08c2e;
}

.alerts-foot {
  padding: 12px 0 4px;
  text-align: center;
  font-size: 12px;
  color: #9aa1b2;
}

@keyframes inspection-notice-breathe {
  0%,
  100% {
    box-shadow: 0 14px 30px rgba(24, 36, 72, 0.08);
  }
  50% {
    box-shadow: 0 18px 38px rgba(24, 36, 72, 0.12);
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

@keyframes alert-stream {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-33.3333%);
  }
}

@media (max-width: 360px) {
  .hero-title {
    font-size: 30px;
  }

  .hero-metric-card {
    min-height: 102px;
    padding: 14px 11px 15px;
  }

  .hero-metric-label {
    font-size: 13px;
  }

  .hero-metric-value {
    font-size: 24px;
  }

  .task-item {
    min-height: 88px;
    padding: 12px 14px;
  }

  .task-label {
    font-size: 15px;
  }

  .task-value {
    font-size: 25px;
  }

  .task-icon {
    right: 10px;
    bottom: 11px;
    transform: scale(0.86);
    transform-origin: bottom right;
  }
}
</style>
