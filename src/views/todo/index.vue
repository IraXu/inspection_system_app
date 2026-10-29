<template>
  <div class="todo-page app-page">
    <header class="todo-header gradient-bg">
      <div class="todo-header-glow todo-header-glow-left"></div>
      <div class="todo-header-glow todo-header-glow-right"></div>
      <div class="todo-header-grid"></div>

      <div class="todo-header-content">
        <div class="todo-header-top">
          <div class="todo-header-copy">
            <div class="todo-header-kicker">
              <span class="todo-header-kicker-dot"></span>
              <span>任务协同</span>
            </div>
            <h1 class="todo-header-title">待办</h1>
            <p class="todo-header-subtitle">聚焦当前需要处理的巡检、整改与审核任务</p>
          </div>

          <button type="button" class="todo-refresh" @click="refreshTodos">
            <t-icon name="refresh" />
          </button>
        </div>
      </div>
    </header>

    <section class="app-section todo-filter-section">
      <div class="todo-segmented app-card">
        <button
          v-for="tab in tabList"
          :key="tab.value"
          type="button"
          class="todo-segment-item"
          :class="[tab.tone, { active: activeTab === tab.value }]"
          @click="onTabChange(tab.value)"
        >
          <span class="todo-segment-label">{{ tab.label }}</span>
          <span class="todo-segment-count-pill">{{ tab.count }}</span>
        </button>
      </div>
    </section>

    <section class="app-section todo-stream-section">
      <div class="todo-stream-head">
        <div>
          <div class="todo-stream-title">{{ currentTabMeta.label }}</div>
          <div class="todo-stream-note">{{ currentTabMeta.note }}</div>
        </div>
        <span class="todo-stream-badge">{{ currentTodos.length }} 项</span>
      </div>

      <t-pull-down-refresh
        v-model="refreshing"
        class="todo-refresh-wrap"
        :loading-texts="['下拉刷新', '松开刷新', '正在刷新', '刷新完成']"
        @refresh="onRefresh"
      >
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
              class="todo-card app-card"
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
                  <div class="todo-card-chips">
                    <span class="todo-chip">{{ item.id }}</span>
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
                <t-icon name="error-circle-filled" class="todo-reject-icon" />
                <div class="todo-reject-copy">
                  <span class="todo-reject-label">审核驳回原因</span>
                  <span class="todo-reject-text">{{ item.rejectReason }}</span>
                </div>
              </div>

              <div v-if="activeTab === 'completed' && item.reviewOpinion" class="todo-opinion">
                <t-icon name="check-circle-filled" class="todo-opinion-icon" />
                <span>审核意见：{{ item.reviewOpinion }}</span>
              </div>

              <div v-if="activeTab === 'completed' && !item.issueCount" class="todo-opinion todo-opinion--calm">
                <t-icon name="check-circle" class="todo-opinion-icon" />
                <span>本次巡检全部检查项合格，已自动归档</span>
              </div>

              <div class="todo-card-foot">
                <div class="todo-card-tags">
                  <span class="todo-status-pill" :class="getStatusTone(item)">
                    {{ getStatusText(item) }}
                  </span>
                  <span class="todo-type-pill">{{ item.method }}</span>
                </div>

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
      </t-pull-down-refresh>
    </section>
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
  { value: 'completed', label: '已完成', count: todoStore.completedTickets.length, tone: 'slate' }
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
    pending: 'task',
    rectify: 'tools',
    review: 'file-copy',
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
  return item.issueCount ? 'success' : 'calm'
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
    radial-gradient(circle at top, rgba(var(--theme-primary-rgb), 0.08), transparent 24%),
    #f5f7fb;
}

.todo-header {
  position: relative;
  overflow: hidden;
  padding: calc(var(--prototype-safe-top) + 10px) var(--prototype-page-padding-x) 22px;
  color: #173153;
  border-radius: 0 0 34px 34px;
  box-shadow: 0 24px 48px rgba(var(--theme-primary-rgb), 0.18);
}

.todo-header-glow {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  filter: blur(10px);
}

.todo-header-glow-left {
  width: 140px;
  height: 140px;
  top: -36px;
  left: -24px;
}

.todo-header-glow-right {
  width: 180px;
  height: 180px;
  right: -60px;
  top: 18px;
}

.todo-header-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.2;
}

.todo-header-content {
  position: relative;
  z-index: 1;
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

.todo-header-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.38);
  color: rgba(23, 49, 83, 0.7);
  font-size: 11px;
  font-weight: 700;
}

.todo-header-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9ef0b5;
  box-shadow: 0 0 0 5px rgba(158, 240, 181, 0.16);
}

.todo-header-title {
  margin: 12px 0 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #173153;
}

.todo-header-subtitle {
  margin: 8px 0 0;
  max-width: 300px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(23, 49, 83, 0.72);
}

.todo-refresh {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.34);
  color: #1f5a7b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.todo-filter-section {
  padding-top: 10px;
}

.todo-segmented {
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  background: linear-gradient(180deg, rgba(239, 244, 251, 0.98) 0%, rgba(234, 240, 248, 0.98) 100%);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.todo-segment-item {
  min-width: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 7px 8px;
  color: #79879b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  transition: all 0.22s ease;
}

.todo-segment-item.active {
  background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
  box-shadow: 0 10px 20px rgba(11, 31, 68, 0.08);
}

.todo-segment-item.primary.active {
  color: var(--theme-primary-strong);
}

.todo-segment-item.warning.active {
  color: #d97706;
}

.todo-segment-item.success.active {
  color: #16a34a;
}

.todo-segment-item.slate.active {
  color: #475569;
}

.todo-segment-label {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  color: #708096;
}

.todo-segment-count-pill {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
  color: #5f728d;
  background: rgba(148, 163, 184, 0.14);
}

.todo-segment-item.primary .todo-segment-count-pill {
  background: rgba(var(--theme-primary-rgb), 0.1);
  color: var(--theme-primary-strong);
}

.todo-segment-item.warning .todo-segment-count-pill {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.todo-segment-item.success .todo-segment-count-pill {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.todo-segment-item.slate .todo-segment-count-pill {
  background: rgba(71, 85, 105, 0.1);
  color: #475569;
}

.todo-segment-item.active .todo-segment-label {
  color: #173153;
}

.todo-segment-item.active .todo-segment-count-pill {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.todo-stream-section {
  padding-top: 14px;
}

.todo-stream-head {
  padding: 0 4px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.todo-stream-title {
  font-size: 19px;
  font-weight: 700;
  color: #173153;
}

.todo-stream-note {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #7a8798;
}

.todo-stream-badge {
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(var(--theme-primary-rgb), 0.08);
  color: var(--theme-primary-strong);
  font-size: 12px;
  font-weight: 700;
}

.todo-refresh-wrap {
  min-height: 420px;
}

.todo-list {
  display: grid;
  gap: 12px;
}

.todo-skeleton {
  padding: 20px;
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

.todo-card {
  position: relative;
  padding: 16px;
  border: 1px solid rgba(229, 235, 244, 0.96);
  box-shadow: 0 16px 32px rgba(11, 31, 68, 0.07);
  overflow: hidden;
}

.todo-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 16px;
  bottom: 16px;
  width: 4px;
  border-radius: 0 4px 4px 0;
}

.todo-card--pending::before {
  background: linear-gradient(180deg, var(--theme-primary) 0%, var(--theme-primary-strong) 100%);
}

.todo-card--rectify::before {
  background: linear-gradient(180deg, #fbbf24 0%, #d97706 100%);
}

.todo-card--review::before {
  background: linear-gradient(180deg, #4ade80 0%, #16a34a 100%);
}

.todo-card--completed::before {
  background: linear-gradient(180deg, #a5b4fc 0%, #6366f1 100%);
}

.todo-card--rectify {
  background:
    radial-gradient(circle at top right, rgba(217, 119, 6, 0.06), transparent 34%),
    linear-gradient(180deg, #fffcf7 0%, #ffffff 100%);
}

.todo-card--review {
  background:
    radial-gradient(circle at top right, rgba(22, 163, 74, 0.06), transparent 34%),
    linear-gradient(180deg, #f8fffb 0%, #ffffff 100%);
}

.todo-card--completed {
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.06), transparent 34%),
    linear-gradient(180deg, #f9f9ff 0%, #ffffff 100%);
}

.todo-card--pending {
  background:
    radial-gradient(circle at top right, rgba(var(--theme-primary-rgb), 0.08), transparent 34%),
    linear-gradient(180deg, #f8fcff 0%, #ffffff 100%);
}

.todo-card-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.todo-card-badge {
  width: 40px;
  height: 40px;
  border-radius: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex: 0 0 40px;
}

.todo-card-badge.pending {
  background: rgba(var(--theme-primary-rgb), 0.12);
  color: var(--theme-primary-strong);
}

.todo-card-badge.rectify {
  background: rgba(217, 119, 6, 0.12);
  color: #d97706;
}

.todo-card-badge.review {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}

.todo-card-badge.completed {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
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
  font-size: 16px;
  line-height: 1.4;
  color: #173153;
  font-weight: 700;
}

.todo-card-time {
  flex: 0 0 auto;
  font-size: 11px;
  color: #6e7f95;
  white-space: nowrap;
  background: rgba(241, 245, 251, 0.96);
  padding: 4px 8px;
  border-radius: 999px;
}

.todo-card-chips {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.todo-chip {
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(236, 241, 248, 0.92);
  color: #5b7290;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.todo-chip--issue {
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.todo-chip--ai {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
}

.todo-meta-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(247, 250, 254, 0.92);
}

.todo-meta-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-meta-label {
  font-size: 11px;
  color: #93a0b2;
}

.todo-meta-value {
  font-size: 12px;
  line-height: 1.4;
  color: #3f5877;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-reject {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(213, 73, 65, 0.08);
  border: 1px solid rgba(213, 73, 65, 0.16);
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.todo-reject-icon {
  color: #d54941;
  font-size: 15px;
  margin-top: 1px;
  flex: 0 0 15px;
}

.todo-reject-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.todo-reject-label {
  font-size: 11px;
  font-weight: 700;
  color: #b9382f;
}

.todo-reject-text {
  font-size: 12px;
  line-height: 1.55;
  color: #a34a45;
}

.todo-opinion {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.07);
  border: 1px solid rgba(99, 102, 241, 0.14);
  color: #4f46e5;
  font-size: 12px;
  line-height: 1.55;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.todo-opinion--calm {
  background: rgba(22, 163, 74, 0.07);
  border-color: rgba(22, 163, 74, 0.16);
  color: #15803d;
}

.todo-opinion-icon {
  font-size: 15px;
  flex: 0 0 15px;
  margin-top: 1px;
}

.todo-card-foot {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.todo-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.todo-status-pill,
.todo-type-pill {
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.todo-status-pill.primary {
  background: rgba(var(--theme-primary-rgb), 0.1);
  color: var(--theme-primary-strong);
}

.todo-status-pill.warning {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.todo-status-pill.success {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.todo-status-pill.calm {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.todo-type-pill {
  background: rgba(236, 241, 248, 0.92);
  color: #5b7290;
}

.todo-card-actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.todo-action {
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: var(--theme-primary-strong);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.todo-action--warning {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
}

.todo-action--success {
  background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
}

.todo-action--slate {
  background: linear-gradient(135deg, #818cf8 0%, #4f46e5 100%);
}

.todo-action:active {
  transform: scale(0.97);
}

.todo-empty {
  padding: 32px 20px;
  text-align: center;
}

.todo-empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(235, 242, 255, 0.98) 0%, rgba(244, 248, 255, 0.98) 100%);
  color: var(--theme-primary-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.todo-empty-title {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #173153;
}

.todo-empty-note {
  margin-top: 8px;
  font-size: 13px;
  color: #7d8b9f;
}

@keyframes todo-skeleton-flow {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
