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

        <div class="todo-overview">
          <div class="todo-overview-card todo-overview-card--focus">
            <span class="todo-overview-label">当前待处理</span>
            <span class="todo-overview-value">{{ pendingTotal }}</span>
          </div>
          <div class="todo-overview-card">
            <span class="todo-overview-label">今日优先</span>
            <span class="todo-overview-value warning">{{ highPriorityCount }}</span>
          </div>
          <div class="todo-overview-card">
            <span class="todo-overview-label">已完成</span>
            <span class="todo-overview-value success">{{ completedCount }}</span>
          </div>
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
              v-for="todo in currentTodos"
              :key="todo.id"
              class="todo-card app-card"
              :class="[`priority-${todo.priority}`, { 'todo-card--completed': activeTab === 'completed' }]"
              @click="openTask(todo)"
            >
              <div class="todo-card-head">
                <div class="todo-card-badge" :class="todo.priority">
                  <t-icon :name="getTodoIcon(todo.type)" />
                </div>

                <div class="todo-card-copy">
                  <div class="todo-card-topline">
                    <h3 class="todo-card-title">{{ todo.title }}</h3>
                    <span class="todo-card-deadline">{{ todo.deadline }}</span>
                  </div>
                  <p class="todo-card-desc">{{ todo.description }}</p>
                </div>
              </div>

              <div class="todo-card-foot">
                <div class="todo-card-tags">
                  <span class="todo-type-pill">{{ getTypeText(todo.type) }}</span>
                  <span v-if="activeTab !== 'completed'" class="todo-priority-pill" :class="todo.priority">
                    {{ getPriorityText(todo.priority) }}
                  </span>
                </div>

                <div class="todo-card-actions">
                  <button
                    v-if="activeTab !== 'completed'"
                    type="button"
                    class="todo-action todo-action--ghost"
                    @click.stop="editTask(todo)"
                  >
                    编辑
                  </button>
                  <button
                    v-if="activeTab !== 'completed'"
                    type="button"
                    class="todo-action todo-action--light-danger"
                    @click.stop="openDeleteDialog(todo)"
                  >
                    删除
                  </button>
                  <button
                    type="button"
                    class="todo-action"
                    :class="{ 'todo-action--danger': activeTab !== 'completed' }"
                    @click.stop="handlePrimaryAction(todo)"
                  >
                    {{ activeTab === 'completed' ? '查看' : '处理' }}
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

    <div v-if="deleteDialog.visible" class="todo-dialog-overlay" @click="closeDeleteDialog">
      <div class="todo-dialog app-card" @click.stop>
        <div class="todo-dialog-icon">
          <t-icon name="error-circle-filled" />
        </div>
        <div class="todo-dialog-title">删除任务</div>
        <div class="todo-dialog-content">确认删除“{{ deleteDialog.task?.title }}”吗？</div>
        <div class="todo-dialog-actions">
          <button type="button" class="todo-dialog-btn todo-dialog-btn--ghost" @click="closeDeleteDialog">
            取消
          </button>
          <button type="button" class="todo-dialog-btn todo-dialog-btn--danger" @click="confirmDeleteTask">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Toast } from 'tdesign-mobile-vue'

const activeTab = ref('pending')
const loading = ref(true)
const refreshing = ref(false)

const deleteDialog = ref({
  visible: false,
  task: null
})

const allTodos = ref({
  pending: [
    { id: 1, title: '日常巡检-车间A', type: 'inspection', priority: 'high', deadline: '今天 14:00', description: '负责区域：车间A生产线' },
    { id: 2, title: '设备点检-压缩机房', type: 'check', priority: 'medium', deadline: '今天 16:00', description: '检查设备运行状态' },
    { id: 3, title: '安全隐患排查', type: 'safety', priority: 'high', deadline: '明天 10:00', description: '厂区安全隐患排查' },
    { id: 4, title: '消防设施检查', type: 'inspection', priority: 'low', deadline: '本周五', description: '消防器材有效期检查' },
    { id: 5, title: '环境监测记录', type: 'check', priority: 'medium', deadline: '本周内', description: '温湿度记录与上报' }
  ],
  rectify: [
    { id: 6, title: '设备故障整改-车间B', type: 'rectify', priority: 'high', deadline: '今天 18:00', description: '设备编号：EQ-B-001' },
    { id: 7, title: '安全隐患整改', type: 'rectify', priority: 'high', deadline: '明天', description: '安全通道堆放杂物' },
    { id: 8, title: '质量问题整改', type: 'rectify', priority: 'medium', deadline: '3天内', description: '产品外观质量问题' }
  ],
  review: [
    { id: 9, title: '问题单审核-设备异常', type: 'review', priority: 'medium', deadline: '今天 17:00', description: '提交人：张三' },
    { id: 10, title: '整改验收审核', type: 'review', priority: 'low', deadline: '明天', description: '整改项目：安全隐患' }
  ],
  completed: [
    { id: 11, title: '日常巡检-车间B', type: 'inspection', priority: 'low', deadline: '已完成', description: '完成时间：2024-01-15 10:30' },
    { id: 12, title: '设备维护记录', type: 'check', priority: 'medium', deadline: '已完成', description: '完成时间：2024-01-15 09:00' },
    { id: 13, title: '安全培训签到', type: 'training', priority: 'low', deadline: '已完成', description: '完成时间：2024-01-14 15:00' }
  ]
})

const tabList = computed(() => [
  { value: 'pending', label: '待执行', count: allTodos.value.pending.length, tone: 'primary' },
  { value: 'rectify', label: '待整改', count: allTodos.value.rectify.length, tone: 'warning' },
  { value: 'review', label: '待审核', count: allTodos.value.review.length, tone: 'danger' },
  { value: 'completed', label: '已完成', count: allTodos.value.completed.length, tone: 'success' }
])

const tabMetaMap = {
  pending: { label: '待执行任务', note: '优先处理时间临近的巡检计划' },
  rectify: { label: '待整改问题', note: '尽快闭环已识别的问题事项' },
  review: { label: '待审核事项', note: '核对整改结果与提交内容' },
  completed: { label: '已完成记录', note: '查看近期已处理的任务留痕' }
}

const currentTabMeta = computed(() => {
  return tabMetaMap[activeTab.value] || tabMetaMap.pending
})

const currentTodos = computed(() => {
  return allTodos.value[activeTab.value] || []
})

const pendingTotal = computed(() => {
  return allTodos.value.pending.length + allTodos.value.rectify.length + allTodos.value.review.length
})

const highPriorityCount = computed(() => {
  return [...allTodos.value.pending, ...allTodos.value.rectify, ...allTodos.value.review].filter(
    item => item.priority === 'high'
  ).length
})

const completedCount = computed(() => {
  return allTodos.value.completed.length
})

const onTabChange = (value) => {
  if (activeTab.value === value) {
    return
  }

  activeTab.value = value
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 320)
}

const onRefresh = () => {
  window.setTimeout(() => {
    refreshing.value = false
    Toast.success('刷新成功')
  }, 900)
}

const refreshTodos = () => {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
    Toast.success('任务已同步')
  }, 700)
}

const openTask = (todo) => {
  Toast.info(`打开任务：${todo.title}`)
}

const editTask = (todo) => {
  Toast.info(`编辑任务：${todo.title}`)
}

const handlePrimaryAction = (todo) => {
  if (activeTab.value === 'completed') {
    openTask(todo)
    return
  }

  Toast.info(`处理任务：${todo.title}`)
}

const openDeleteDialog = (todo) => {
  deleteDialog.value = {
    visible: true,
    task: todo
  }
}

const closeDeleteDialog = () => {
  deleteDialog.value = {
    visible: false,
    task: null
  }
}

const confirmDeleteTask = () => {
  const task = deleteDialog.value.task

  if (!task) {
    closeDeleteDialog()
    return
  }

  const list = allTodos.value[activeTab.value] || []
  const index = list.findIndex(item => item.id === task.id)

  if (index > -1) {
    list.splice(index, 1)
    Toast.success('删除成功')
  }

  closeDeleteDialog()
}

const getTodoIcon = (type) => {
  const icons = {
    inspection: 'search',
    check: 'check-circle',
    safety: 'error-circle',
    rectify: 'tools',
    review: 'file-copy',
    training: 'book'
  }
  return icons[type] || 'task'
}

const getTypeText = (type) => {
  const texts = {
    inspection: '巡检',
    check: '点检',
    safety: '安全',
    rectify: '整改',
    review: '审核',
    training: '培训'
  }
  return texts[type] || '任务'
}

const getPriorityText = (priority) => {
  const texts = {
    high: '高优先',
    medium: '中优先',
    low: '低优先'
  }
  return texts[priority] || '普通'
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

onMounted(() => {
  window.setTimeout(() => {
    loading.value = false
  }, 600)
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
  background: rgba(255, 255, 255, 0.14);
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
  max-width: 280px;
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

.todo-overview {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.todo-overview-card {
  padding: 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.todo-overview-card--focus {
  background: rgba(255, 255, 255, 0.42);
}

.todo-overview-label {
  display: block;
  font-size: 12px;
  color: rgba(23, 49, 83, 0.64);
}

.todo-overview-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: #173153;
}

.todo-overview-value.warning {
  color: #ffe1ad;
}

.todo-overview-value.success {
  color: #b4ffd1;
}

.todo-filter-section {
  padding-top: 10px;
}

.todo-segmented {
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  background:
    linear-gradient(180deg, rgba(239, 244, 251, 0.98) 0%, rgba(234, 240, 248, 0.98) 100%);
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

.todo-segment-item.danger.active {
  color: #d54941;
}

.todo-segment-item.success.active {
  color: #16a34a;
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

.todo-segment-item.danger .todo-segment-count-pill {
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.todo-segment-item.success .todo-segment-count-pill {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.todo-segment-item.active .todo-segment-label {
  color: #173153;
}

.todo-segment-item.active .todo-segment-count-pill {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.todo-stream-section {
  padding-top: 10px;
}

.todo-stream-head {
  padding: 0 4px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.todo-stream-title {
  font-size: 20px;
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
  padding: 18px;
  border: 1px solid rgba(229, 235, 244, 0.96);
  box-shadow: 0 18px 36px rgba(11, 31, 68, 0.08);
}

.todo-card.priority-high {
  background:
    radial-gradient(circle at top right, rgba(213, 73, 65, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(255, 251, 250, 0.98) 0%, #ffffff 100%);
}

.todo-card.priority-medium {
  background:
    radial-gradient(circle at top right, rgba(217, 119, 6, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(255, 252, 248, 0.98) 0%, #ffffff 100%);
}

.todo-card.priority-low,
.todo-card--completed {
  background:
    radial-gradient(circle at top right, rgba(var(--theme-primary-rgb), 0.06), transparent 34%),
    linear-gradient(180deg, rgba(248, 250, 255, 0.98) 0%, #ffffff 100%);
}

.todo-card-head {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.todo-card-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex: 0 0 44px;
}

.todo-card-badge.high {
  background: rgba(227, 77, 89, 0.12);
  color: #d54941;
}

.todo-card-badge.medium {
  background: rgba(227, 115, 24, 0.12);
  color: #d97706;
}

.todo-card-badge.low {
  background: rgba(43, 164, 113, 0.12);
  color: #16a34a;
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

.todo-card-deadline {
  flex: 0 0 auto;
  font-size: 12px;
  color: #6e7f95;
  white-space: nowrap;
}

.todo-card-desc {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: #708197;
}

.todo-card-foot {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.todo-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.todo-type-pill,
.todo-priority-pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.todo-type-pill {
  background: rgba(var(--theme-primary-rgb), 0.08);
  color: var(--theme-primary-strong);
}

.todo-priority-pill.high {
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.todo-priority-pill.medium {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.todo-priority-pill.low {
  background: rgba(43, 164, 113, 0.1);
  color: #16a34a;
}

.todo-card-actions {
  display: flex;
  gap: 8px;
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

.todo-action--ghost {
  background: rgba(236, 241, 248, 0.96);
  color: #56708f;
}

.todo-action--light-danger {
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.todo-action--danger {
  background: var(--theme-primary-strong);
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

.todo-dialog-overlay {
  position: fixed;
  left: var(--preview-overlay-left, 0);
  top: var(--preview-overlay-top, 0);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100vh);
  background: rgba(13, 23, 43, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1600;
}

.todo-dialog {
  width: 100%;
  max-width: 320px;
  padding: 22px 20px 18px;
  text-align: center;
}

.todo-dialog-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 18px;
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.todo-dialog-title {
  margin-top: 14px;
  font-size: 18px;
  font-weight: 700;
  color: #173153;
}

.todo-dialog-content {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #6f8199;
}

.todo-dialog-actions {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.todo-dialog-btn {
  height: 42px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.todo-dialog-btn--ghost {
  background: rgba(239, 244, 251, 0.96);
  color: #59718f;
}

.todo-dialog-btn--danger {
  background: #d54941;
  color: #fff;
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
