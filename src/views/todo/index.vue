<template>
  <div class="todo-page app-page">
    <t-pull-down-refresh
      v-model="refreshing"
      class="todo-page-refresh"
      :loading-texts="['下拉刷新', '松开刷新', '正在刷新', '刷新完成']"
      @refresh="onRefresh"
    >
      <header class="todo-header">
        <div class="todo-cubes" aria-hidden="true">
          <span class="todo-cube todo-cube--a"><i></i><i></i><i></i></span>
          <span class="todo-cube todo-cube--b"><i></i><i></i><i></i></span>
          <span class="todo-cube todo-cube--c"><i></i><i></i><i></i></span>
        </div>

        <div class="todo-header-content">
          <div class="todo-header-top">
            <div class="todo-header-copy">
              <h1 class="todo-header-title">待办</h1>
              <p class="todo-header-subtitle">聚焦当前需要处理的巡检、整改与审核任务</p>
            </div>

            <button type="button" class="todo-refresh" aria-label="刷新任务" @click="refreshTodos">
              <t-icon name="refresh" />
            </button>
          </div>

          <div class="todo-status-grid">
            <button
              v-for="tab in tabList"
              :key="tab.value"
              type="button"
              class="todo-status-card"
              :class="[tab.tone, { active: activeTab === tab.value }]"
              @click="onTabChange(tab.value)"
            >
              <t-icon class="todo-status-watermark" :name="getTabIcon(tab.value)" />
              <span class="todo-status-label">{{ tab.label }}</span>
              <span class="todo-status-count">{{ tab.count }}</span>
            </button>
          </div>
        </div>
      </header>

      <section class="app-section todo-stream-section">
        <div class="todo-stream-head">
          <div class="todo-stream-title-row">
            <h2 class="todo-stream-title">{{ currentTabMeta.label }}</h2>
            <span class="todo-stream-badge">{{ currentTodos.length }} 项</span>
          </div>
          <p class="todo-stream-note">{{ currentTabMeta.note }}</p>
        </div>

        <div class="todo-list">
          <template v-if="loading">
            <div v-for="skeleton in 3" :key="skeleton" class="todo-skeleton app-card">
              <div class="todo-skeleton-row todo-skeleton-row--title"></div>
              <div class="todo-skeleton-row todo-skeleton-row--desc"></div>
              <div class="todo-skeleton-row todo-skeleton-row--meta"></div>
            </div>
          </template>

          <template v-else-if="currentTodos.length > 0">
            <div
              v-for="item in currentTodos"
              :key="item.id"
              class="todo-card"
              :class="`todo-card--${activeTab}`"
              @click="handlePrimary(item)"
            >
              <div class="todo-card-head">
                <div class="todo-card-badge" :class="activeTab">
                  <t-icon :name="getTabIcon(activeTab)" />
                </div>
                <div class="todo-card-copy">
                  <div class="todo-card-topline">
                    <h3 class="todo-card-title">{{ item.storeName }}</h3>
                    <span class="todo-card-time">{{ getTimeLabel(item) }}</span>
                  </div>
                  <span class="todo-card-id">{{ item.id }}</span>
                  <div class="todo-card-chips">
                    <span class="todo-chip todo-chip--status" :class="getStatusTone(item)">
                      {{ getStatusText(item) }}
                    </span>
                    <span v-if="activeTab !== 'pending'" class="todo-chip todo-chip--issue">
                      问题 {{ item.issueCount }} 个
                    </span>
                    <span v-if="item.sourceType === 'ai'" class="todo-chip todo-chip--ai">AI</span>
                  </div>
                </div>
              </div>

              <div class="todo-meta-grid">
                <div class="todo-meta-item">
                  <span class="todo-meta-label">巡检模板</span>
                  <span class="todo-meta-value">{{ item.templateName }}</span>
                </div>
                <div class="todo-meta-item">
                  <span class="todo-meta-label">巡检方式</span>
                  <span class="todo-meta-value">{{ item.method }}</span>
                </div>
                <div class="todo-meta-item">
                  <span class="todo-meta-label">{{ getPersonLabel() }}</span>
                  <span class="todo-meta-value">{{ getPersonValue(item) }}</span>
                </div>
                <div class="todo-meta-item">
                  <span class="todo-meta-label">{{ getExtraLabel() }}</span>
                  <span class="todo-meta-value">{{ getExtraValue(item) }}</span>
                </div>
              </div>

              <div v-if="activeTab === 'rectify' && item.rejectReason" class="todo-reject">
                <t-icon name="error-triangle-filled" class="todo-reject-icon" />
                <span class="todo-reject-text">驳回原因：{{ item.rejectReason }}</span>
              </div>

              <div v-if="activeTab === 'completed' && item.reviewOpinion" class="todo-opinion">
                <t-icon name="check-circle-filled" class="todo-opinion-icon" />
                <span>审核意见：{{ item.reviewOpinion }}</span>
              </div>

              <div v-if="activeTab === 'completed' && !item.issueCount" class="todo-opinion">
                <t-icon name="check-circle-filled" class="todo-opinion-icon" />
                <span>本次巡检全部检查项合格，已自动归档</span>
              </div>

              <div class="todo-card-foot">
                <span class="todo-type-pill">{{ item.method }}</span>

                <div class="todo-card-actions">
                  <button
                    type="button"
                    class="todo-action"
                    :class="`todo-action--${getActionTone()}`"
                    @click.stop="handlePrimary(item)"
                  >
                    {{ getActionLabel() }}
                  </button>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="todo-empty app-card">
            <div class="todo-empty-icon">
              <t-icon name="task-checked" />
            </div>
            <div class="todo-empty-title">{{ getEmptyText() }}</div>
            <div class="todo-empty-note">当前筛选下没有待处理内容</div>
          </div>
        </div>
      </section>
    </t-pull-down-refresh>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useTodoStore } from '../../stores/todo'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()

const activeTab = ref('pending')
const loading = ref(true)
const refreshing = ref(false)

const tabMetaMap = {
  pending: { label: '待执行巡检', note: '按截止时间优先执行线下巡检任务' },
  rectify: { label: '待整改问题', note: '逐项补充整改说明与整改截图，提交后进入审核' },
  review: { label: '待审核事项', note: '核对整改结果，通过后问题单闭环归档' },
  completed: { label: '已完成记录', note: '查看巡检、整改、审核的完整流转留痕' }
}

const tabList = computed(() => [
  { value: 'pending', label: '待执行', count: todoStore.pendingTasks.length, tone: 'primary' },
  { value: 'rectify', label: '待整改', count: todoStore.rectifyTickets.length, tone: 'warning' },
  { value: 'review', label: '待审核', count: todoStore.reviewTickets.length, tone: 'success' },
  { value: 'completed', label: '已完成', count: todoStore.completedTickets.length, tone: 'rose' }
])

const currentTodos = computed(() => {
  if (activeTab.value === 'pending') return todoStore.pendingTasks
  if (activeTab.value === 'rectify') return todoStore.rectifyTickets
  if (activeTab.value === 'review') return todoStore.reviewTickets
  return todoStore.completedTickets
})

const currentTabMeta = computed(() => tabMetaMap[activeTab.value] || tabMetaMap.pending)

const applyTabFromRoute = () => {
  const tab = route.query.tab
  if (tab && tabMetaMap[tab]) {
    activeTab.value = tab
  }
}

const onTabChange = (value) => {
  if (activeTab.value === value) {
    return
  }
  activeTab.value = value
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 280)
}

const onRefresh = () => {
  window.setTimeout(() => {
    refreshing.value = false
    Toast.success('任务已同步')
  }, 800)
}

const refreshTodos = () => {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
    Toast.success('任务已同步')
  }, 600)
}

const handlePrimary = (item) => {
  if (activeTab.value === 'pending') {
    router.push(`/todo/inspection/${item.id}`)
    return
  }
  if (activeTab.value === 'rectify') {
    router.push(`/todo/rectify/${item.id}`)
    return
  }
  if (activeTab.value === 'review') {
    router.push(`/todo/review/${item.id}`)
    return
  }
  router.push(`/todo/detail/${item.id}`)
}

const getTimeLabel = (item) => {
  if (activeTab.value === 'pending') return item.deadline
  if (activeTab.value === 'review') return item.rectifiedAt || item.createdAt
  if (activeTab.value === 'completed') return item.reviewedAt || item.createdAt
  return item.createdAt
}

const getPersonLabel = () => {
  if (activeTab.value === 'pending') return '执行人'
  if (activeTab.value === 'rectify') return '整改人'
  return '审核人'
}

const getPersonValue = (item) => {
  if (activeTab.value === 'pending') return item.executors.join('、')
  if (activeTab.value === 'rectify') return item.rectifier
  return item.reviewer
}

const getExtraLabel = () => {
  if (activeTab.value === 'pending') return '生成时间'
  if (activeTab.value === 'rectify') return '提交人'
  if (activeTab.value === 'review') return '整改时间'
  return '完成时间'
}

const getExtraValue = (item) => {
  if (activeTab.value === 'pending') return item.generatedAt
  if (activeTab.value === 'rectify') return item.submitter
  if (activeTab.value === 'review') return item.rectifiedAt || '—'
  return item.reviewedAt || item.createdAt
}

const getTabIcon = (tab) => {
  const icons = {
    pending: 'task-time',
    rectify: 'tools',
    review: 'user-time',
    completed: 'task-checked'
  }
  return icons[tab] || 'task'
}

const getStatusText = (item) => {
  if (activeTab.value === 'pending') return '待执行'
  if (activeTab.value === 'rectify') return item.rejectReason ? '驳回待整改' : '待整改'
  if (activeTab.value === 'review') return '待审核'
  return item.issueCount ? '已闭环' : '巡检合格'
}

const getStatusTone = (item) => {
  if (activeTab.value === 'pending') return 'primary'
  if (activeTab.value === 'rectify') return 'warning'
  if (activeTab.value === 'review') return 'success'
  return 'calm'
}

const getActionLabel = () => {
  const labels = {
    pending: '立即执行',
    rectify: '整改处理',
    review: '整改审核',
    completed: '查看详情'
  }
  return labels[activeTab.value]
}

const getActionTone = () => {
  const tones = {
    pending: 'primary',
    rectify: 'warning',
    review: 'success',
    completed: 'slate'
  }
  return tones[activeTab.value]
}

const getEmptyText = () => {
  const texts = {
    pending: '暂无待执行任务',
    rectify: '暂无待整改问题',
    review: '暂无待审核事项',
    completed: '暂无已完成任务'
  }
  return texts[activeTab.value] || '暂无数据'
}

watch(
  () => route.query.tab,
  () => applyTabFromRoute()
)

onMounted(() => {
  applyTabFromRoute()
  window.setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.todo-page {
  background:
    radial-gradient(120% 38% at 82% -2%, rgba(198, 210, 245, 0.72) 0%, rgba(226, 232, 250, 0.32) 46%, rgba(255, 255, 255, 0) 74%),
    radial-gradient(90% 42% at 10% 100%, rgba(214, 246, 236, 0.5) 0%, rgba(255, 255, 255, 0) 68%),
    linear-gradient(180deg, #e9ecfa 0%, #f4f6fd 32%, #ffffff 60%);
}

.todo-header {
  position: relative;
  padding: calc(var(--prototype-safe-top) + 22px) var(--prototype-page-padding-x) 6px;
}

.todo-cubes {
  position: absolute;
  inset: -100px 0 0 0;
  pointer-events: none;
  filter: blur(9px);
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 66%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(180deg, #000 0%, #000 66%, rgba(0, 0, 0, 0) 100%);
}

.todo-cube {
  position: absolute;
  display: block;
}

.todo-cube i {
  position: absolute;
  inset: 0;
  display: block;
}

.todo-cube i:nth-child(1) {
  clip-path: polygon(50% 2%, 98% 26%, 50% 50%, 2% 26%);
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.92), rgba(213, 221, 244, 0.66));
}

.todo-cube i:nth-child(2) {
  clip-path: polygon(2% 26%, 50% 50%, 50% 98%, 2% 74%);
  background: linear-gradient(180deg, rgba(206, 215, 241, 0.7), rgba(186, 198, 234, 0.56));
}

.todo-cube i:nth-child(3) {
  clip-path: polygon(98% 26%, 50% 50%, 50% 98%, 98% 74%);
  background: linear-gradient(180deg, rgba(231, 236, 251, 0.78), rgba(203, 214, 243, 0.62));
}

.todo-cube--a {
  top: -84px;
  right: -86px;
  width: 300px;
  height: 268px;
}

.todo-cube--b {
  top: 148px;
  right: -110px;
  width: 224px;
  height: 200px;
  opacity: 0.9;
}

.todo-cube--c {
  top: 34px;
  left: -96px;
  width: 164px;
  height: 146px;
  opacity: 0.45;
}

.todo-header-content {
  position: relative;
  z-index: 2;
}

.todo-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.todo-header-copy {
  min-width: 0;
}

.todo-header-title {
  font-size: 35px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.15;
  color: #16181f;
}

.todo-header-subtitle {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.5;
  color: #6f7486;
}

.todo-refresh {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.56);
  color: #4a5064;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.todo-refresh:active {
  transform: scale(0.94);
}

/* 四个状态卡片 */
.todo-status-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
}

.todo-status-card {
  position: relative;
  min-width: 0;
  height: 78px;
  padding: 12px 10px 11px;
  border: 0;
  border-radius: 15px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(24, 36, 72, 0.05);
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
}

.todo-status-card:active {
  transform: scale(0.97);
}

.todo-status-label {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 600;
  color: #9a9ca8;
  white-space: nowrap;
}

.todo-status-count {
  position: relative;
  z-index: 1;
  font-size: 23px;
  font-weight: 700;
  line-height: 1;
  color: #191a20;
  font-variant-numeric: tabular-nums;
  transition: margin-left 0.25s ease;
}

.todo-status-watermark {
  position: absolute;
  left: 4px;
  bottom: 0;
  font-size: 34px;
  opacity: 0;
  z-index: 0;
  transition: opacity 0.25s ease, color 0.25s ease;
}

.todo-status-card.active .todo-status-label {
  color: #1b1c22;
}

.todo-status-card.active .todo-status-count {
  margin-left: 12px;
}

.todo-status-card.active .todo-status-watermark {
  opacity: 0.15;
}

.todo-status-card.primary.active {
  background: linear-gradient(150deg, #e6f1ff 0%, #f7fbff 100%);
  box-shadow: 0 12px 24px rgba(70, 124, 235, 0.14);
}

.todo-status-card.primary.active .todo-status-count,
.todo-status-card.primary.active .todo-status-watermark {
  color: #3f6ef5;
}

.todo-status-card.warning.active {
  background: linear-gradient(150deg, #fff0e0 0%, #fff9f2 100%);
  box-shadow: 0 12px 24px rgba(239, 138, 23, 0.14);
}

.todo-status-card.warning.active .todo-status-count,
.todo-status-card.warning.active .todo-status-watermark {
  color: #ef8a17;
}

.todo-status-card.success.active {
  background: linear-gradient(150deg, #def8ef 0%, #f5fffb 100%);
  box-shadow: 0 12px 24px rgba(18, 163, 127, 0.14);
}

.todo-status-card.success.active .todo-status-count,
.todo-status-card.success.active .todo-status-watermark {
  color: #12a37f;
}

.todo-status-card.rose.active {
  background: linear-gradient(150deg, #ffe9e6 0%, #fff8f7 100%);
  box-shadow: 0 12px 24px rgba(229, 72, 77, 0.14);
}

.todo-status-card.rose.active .todo-status-count,
.todo-status-card.rose.active .todo-status-watermark {
  color: #e5484d;
}

/* 区块标题 */
.todo-stream-section {
  padding-top: 22px;
}

.todo-stream-head {
  padding: 0 2px 14px;
}

.todo-stream-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.todo-stream-title {
  font-size: 20px;
  font-weight: 700;
  color: #1b1c22;
  letter-spacing: -0.01em;
}

.todo-stream-badge {
  flex: 0 0 auto;
  padding: 3px 11px;
  border-radius: 999px;
  background: linear-gradient(135deg, #5c6cf8 0%, #4058ef 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(74, 92, 238, 0.22);
}

.todo-stream-note {
  margin-top: 9px;
  font-size: 13px;
  line-height: 1.5;
  color: #9498a6;
}

.todo-page-refresh {
  min-height: 100%;
}

/* 下拉刷新：蓝紫色点环指示器 */
.todo-page-refresh :deep(.t-pull-down-refresh__loading) {
  position: relative;
  overflow: hidden;
}

.todo-page-refresh :deep(.t-pull-down-refresh__loading) > * {
  opacity: 0;
}

.todo-page-refresh :deep(.t-pull-down-refresh__loading)::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  box-shadow:
    0 -17px 0 3px rgba(111, 127, 245, 0.95),
    12px -12px 0 2.6px rgba(111, 127, 245, 0.84),
    17px 0 0 2.3px rgba(111, 127, 245, 0.72),
    12px 12px 0 2px rgba(111, 127, 245, 0.58),
    0 17px 0 1.8px rgba(111, 127, 245, 0.46),
    -12px 12px 0 1.6px rgba(111, 127, 245, 0.34),
    -17px 0 0 1.4px rgba(111, 127, 245, 0.24),
    -12px -12px 0 1.2px rgba(111, 127, 245, 0.15);
  animation: todo-dot-ring 1.1s linear infinite;
}

@keyframes todo-dot-ring {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.todo-list {
  display: grid;
  gap: 12px;
}

.todo-skeleton {
  padding: 20px;
  border-radius: 20px;
}

.todo-skeleton-row {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf2f9 0%, #f7f9fc 50%, #edf2f9 100%);
  background-size: 200% 100%;
  animation: todo-skeleton-flow 1.2s linear infinite;
}

.todo-skeleton-row + .todo-skeleton-row {
  margin-top: 12px;
}

.todo-skeleton-row--title {
  width: 54%;
  height: 16px;
}

.todo-skeleton-row--desc {
  width: 86%;
}

.todo-skeleton-row--meta {
  width: 38%;
}

/* 任务卡片 */
.todo-card {
  position: relative;
  padding: 18px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
  overflow: hidden;
}

.todo-card-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.todo-card-badge {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.todo-card-badge.pending {
  background: #eef0ff;
  color: #4756c8;
}

.todo-card-badge.rectify {
  background: #fff3e6;
  color: #e08a2e;
}

.todo-card-badge.review {
  background: #e9fbf5;
  color: #12a37f;
}

.todo-card-badge.completed {
  background: #f4f4f6;
  color: #565863;
}

.todo-card-copy {
  min-width: 0;
  flex: 1;
}

.todo-card-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.todo-card-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 1.4;
  color: #1c1d24;
  font-weight: 600;
}

.todo-card-time {
  flex: 0 0 auto;
  padding-top: 2px;
  font-size: 12px;
  color: #9497a2;
  white-space: nowrap;
}

.todo-card-id {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: #8d909b;
}

.todo-card-chips {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.todo-chip {
  padding: 4px 9px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
}

.todo-chip--status.primary {
  background: #e9f0ff;
  color: #3f6ef5;
}

.todo-chip--status.warning {
  background: #fff2e2;
  color: #e08c2e;
}

.todo-chip--status.success {
  background: #e6f8f1;
  color: #12a37f;
}

.todo-chip--status.calm {
  background: #f2f2f5;
  color: #5f616b;
  border: 1px solid #e4e4ea;
}

.todo-chip--issue {
  background: #ffe9e9;
  color: #e5484d;
}

.todo-chip--ai {
  background: #e8edff;
  color: #4f63e8;
}

.todo-meta-grid {
  margin-top: 14px;
  padding: 15px 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 12px;
  border-radius: 14px;
  background: #f7f7f9;
}

.todo-meta-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.todo-meta-label {
  font-size: 12px;
  color: #9b9da6;
}

.todo-meta-value {
  font-size: 14px;
  line-height: 1.35;
  color: #2b2c33;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-reject {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fdf0f0;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.todo-reject-icon {
  flex: 0 0 15px;
  margin-top: 1px;
  font-size: 15px;
  color: #f5b02e;
}

.todo-reject-text {
  min-width: 0;
  font-size: 13px;
  line-height: 1.6;
  font-weight: 500;
  color: #e5484d;
}

.todo-opinion {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #eef9f1;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.6;
  font-weight: 500;
  color: #1d8a57;
}

.todo-opinion-icon {
  flex: 0 0 15px;
  margin-top: 1px;
  font-size: 15px;
  color: #22a35f;
}

.todo-card-foot {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f0f1f4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.todo-type-pill {
  padding: 5px 10px;
  border-radius: 7px;
  background: #f3f3f6;
  color: #6b6d76;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.todo-card-actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.todo-action {
  height: 40px;
  padding: 0 24px;
  border: 0;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.todo-action:active {
  transform: scale(0.97);
}

.todo-action--primary {
  background: #4059f0;
  box-shadow: 0 8px 18px rgba(64, 89, 240, 0.24);
}

.todo-action--warning {
  background: #ef8a17;
  box-shadow: 0 8px 18px rgba(239, 138, 23, 0.24);
}

.todo-action--success {
  background: #178c78;
  box-shadow: 0 8px 18px rgba(23, 140, 120, 0.22);
}

.todo-action--slate {
  background: #ffffff;
  color: #2b2c33;
  border: 1px solid #d9dbe2;
  box-shadow: none;
}

.todo-empty {
  padding: 32px 20px;
  text-align: center;
  border-radius: 20px;
}

.todo-empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(235, 242, 255, 0.98) 0%, rgba(244, 248, 255, 0.98) 100%);
  color: #4059f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.todo-empty-title {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #1b1c22;
}

.todo-empty-note {
  margin-top: 8px;
  font-size: 13px;
  color: #8b8e9b;
}

@keyframes todo-skeleton-flow {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 360px) {
  .todo-status-card {
    height: 72px;
    padding: 10px 8px;
  }

  .todo-status-label {
    font-size: 12px;
  }

  .todo-status-count {
    font-size: 21px;
  }

  .todo-status-watermark {
    font-size: 34px;
  }

  .todo-card {
    padding: 16px 14px;
  }

  .todo-card-title {
    font-size: 15px;
  }

  .todo-meta-grid {
    padding: 13px 12px;
    gap: 16px 10px;
  }

  .todo-action {
    height: 38px;
    padding: 0 18px;
    font-size: 13px;
  }
}
</style>
