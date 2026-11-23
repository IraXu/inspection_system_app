<template>
  <div class="task-page app-page" :class="{ 'has-batch': batchMode }">
    <header class="task-hero">
      <div class="hero-facets" aria-hidden="true">
        <span class="hero-facet hero-facet--a"></span>
        <span class="hero-facet hero-facet--b"></span>
      </div>

      <div class="hero-inner">
        <div class="hero-nav">
          <button type="button" class="hero-back" aria-label="返回" @click="goBack">
            <t-icon name="chevron-left" size="20" />
          </button>
          <span class="hero-nav-label">巡检管理</span>
          <button type="button" class="hero-batch" @click="toggleBatchMode">
            {{ batchMode ? '完成' : '批量' }}
          </button>
        </div>

        <div class="hero-top">
          <div class="hero-copy">
            <h1 class="hero-title">巡检任务</h1>
            <p class="hero-subtitle">
              共 {{ tasks.length }} 条任务 · {{ store.pendingTaskCount }} 条待执行
            </p>
          </div>
          <button type="button" class="hero-filter" :class="{ 'is-active': activeFilterCount > 0 }" @click="openFilter">
            <t-icon name="search" size="16" />
            <span>筛选</span>
            <b v-if="activeFilterCount">{{ activeFilterCount }}</b>
          </button>
        </div>

        <label class="search-box">
          <t-icon name="search" size="18" class="search-icon" />
          <input
            v-model="filters.taskNo"
            type="text"
            placeholder="搜索任务编号 / 巡检编号"
            @input="clearSelection"
          />
          <button v-if="filters.taskNo" type="button" class="search-clear" @click="clearKeyword">
            <t-icon name="close" size="14" />
          </button>
        </label>

        <div class="status-tabs">
          <button
            v-for="tab in quickStatuses"
            :key="tab.value"
            type="button"
            class="status-tab"
            :class="{ 'is-active': currentQuickStatus === tab.value }"
            @click="setQuickStatus(tab.value)"
          >
            <span>{{ tab.label }}</span>
            <b>{{ tab.count }}</b>
          </button>
        </div>
      </div>
    </header>

    <section class="app-section task-list">
      <div v-if="filteredTasks.length" class="task-stack">
        <article
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card app-card"
          @click="batchMode ? toggleSelect(task.id) : openDetail(task)"
        >
          <div class="task-card-head">
            <span v-if="batchMode" class="batch-check" :class="{ 'is-checked': selectedIds.includes(task.id) }">
              <t-icon v-if="selectedIds.includes(task.id)" name="check" size="12" />
            </span>

            <div class="task-card-copy">
              <div class="task-no-row">
                <span class="task-no">{{ task.taskNo }}</span>
                <span class="status-pill" :class="`status-pill--${execStatusMap[task.executionStatus]?.tone}`">
                  {{ execStatusMap[task.executionStatus]?.label }}
                </span>
              </div>
              <h2 class="task-store">{{ task.storeName }}</h2>
            </div>
          </div>

          <div class="task-time-row">
            <div class="time-cell">
              <span class="meta-label">执行时间</span>
              <strong class="meta-value">{{ task.executionTime }}</strong>
            </div>
            <div class="time-cell time-cell--right">
              <span class="meta-label">截止时间</span>
              <strong class="meta-value">{{ task.validUntil }}</strong>
            </div>
          </div>

          <div class="task-meta">
            <div class="meta-cell">
              <span class="meta-label">计划巡检人</span>
              <span class="meta-value">{{ task.plannedPersonnel || '—' }}</span>
            </div>
            <div class="meta-cell">
              <span class="meta-label">巡检模板</span>
              <span class="meta-value">{{ task.templateName }}</span>
            </div>
            <div class="meta-cell meta-cell--wide">
              <span class="meta-label">关联计划</span>
              <span class="meta-value">{{ task.relatedPlan }}</span>
            </div>
          </div>

          <div class="task-tags">
            <span class="task-tag">{{ task.inspectionMode }}</span>
            <span class="task-tag" :class="`task-tag--${issueStatusMap[task.issueStatus]?.tone}`">
              问题单：{{ task.issueStatus }}
            </span>
            <span v-if="task.issueCount" class="task-tag task-tag--warning">
              问题 {{ task.issueCount }} · 已整改 {{ task.resolvedIssueCount }}
            </span>
          </div>

          <div v-if="!batchMode" class="task-actions">
            <button type="button" class="card-action" @click.stop="openDetail(task)">查看详情</button>
            <button
              type="button"
              class="card-action card-action--danger"
              :class="{ 'is-disabled': task.executionStatus !== 'pending' }"
              @click.stop="askDeleteTask(task)"
            >
              删除任务
            </button>
          </div>
        </article>
      </div>

      <div v-else class="task-empty app-card">
        <div class="empty-icon"><t-icon name="task-time" size="26" /></div>
        <p class="empty-title">没有匹配的巡检任务</p>
        <p class="empty-note">可调整筛选条件后再试</p>
        <button type="button" class="empty-reset" @click="resetAllFilters">重置筛选</button>
      </div>
    </section>

    <transition name="sheet">
      <div v-if="detailVisible" class="sheet-layer" @click.self="detailVisible = false">
        <div class="detail-sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-head">
            <h3 class="sheet-title">巡检任务详情</h3>
            <button type="button" class="sheet-close" @click="detailVisible = false">
              <t-icon name="close" size="18" />
            </button>
          </div>

          <div v-if="detailTask" class="detail-body">
            <div class="detail-hero">
              <div class="detail-title-row">
                <h4 class="detail-name">{{ detailTask.storeName }}</h4>
                <span class="status-pill" :class="`status-pill--${execStatusMap[detailTask.executionStatus]?.tone}`">
                  {{ execStatusMap[detailTask.executionStatus]?.label }}
                </span>
              </div>
              <p class="detail-no">{{ detailTask.taskNo }}</p>
              <div class="task-tags">
                <span class="task-tag">{{ detailTask.inspectionMode }}</span>
                <span class="task-tag" :class="`task-tag--${issueStatusMap[detailTask.issueStatus]?.tone}`">
                  问题单：{{ detailTask.issueStatus }}
                </span>
              </div>
            </div>

            <div class="detail-rows">
              <div v-for="row in detailRows" :key="row.label" class="detail-row">
                <span>{{ row.label }}</span>
                <strong>{{ row.value || '—' }}</strong>
              </div>
            </div>
          </div>

          <div class="sheet-actions">
            <button type="button" class="sheet-btn sheet-btn--ghost" @click="detailVisible = false">关闭</button>
            <button
              type="button"
              class="sheet-btn sheet-btn--danger"
              :class="{ 'is-disabled': detailTask?.executionStatus !== 'pending' }"
              @click="askDeleteDetail"
            >
              删除任务
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="filterVisible" class="sheet-layer" @click.self="filterVisible = false">
        <div class="filter-sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-head">
            <h3 class="sheet-title">筛选任务</h3>
            <button type="button" class="sheet-close" @click="filterVisible = false">
              <t-icon name="close" size="18" />
            </button>
          </div>

          <div class="filter-body">
            <label class="field">
              <span class="field-label">任务编号 / 巡检编号</span>
              <input v-model="filterDraft.taskNo" class="field-input" placeholder="输入编号搜索" />
            </label>

            <p class="filter-group-title">执行状态</p>
            <div class="filter-chip-grid">
              <button
                v-for="option in execStatusOptions"
                :key="option.value"
                type="button"
                class="filter-chip"
                :class="{ 'is-active': filterDraft.execStatus === option.value }"
                @click="filterDraft.execStatus = filterDraft.execStatus === option.value ? '' : option.value"
              >
                {{ option.label }}
              </button>
            </div>

            <p class="filter-group-title">更多条件</p>

            <button type="button" class="select-field" @click="openFilterPicker('store')">
              <span class="select-label">巡检门店</span>
              <span class="select-value" :class="{ 'is-placeholder': !filterDraft.store }">
                {{ filterDraft.store || '全部门店' }}
              </span>
              <t-icon name="chevron-right" size="16" class="select-arrow" />
            </button>
            <button type="button" class="select-field" @click="openFilterPicker('mode')">
              <span class="select-label">巡检方式</span>
              <span class="select-value" :class="{ 'is-placeholder': !filterDraft.mode }">
                {{ filterDraft.mode || '全部方式' }}
              </span>
              <t-icon name="chevron-right" size="16" class="select-arrow" />
            </button>
            <button type="button" class="select-field" @click="openFilterPicker('personnel')">
              <span class="select-label">计划巡检人</span>
              <span class="select-value" :class="{ 'is-placeholder': !filterDraft.personnel }">
                {{ filterDraft.personnel || '全部巡检人' }}
              </span>
              <t-icon name="chevron-right" size="16" class="select-arrow" />
            </button>
            <button type="button" class="select-field" @click="openFilterPicker('template')">
              <span class="select-label">巡检模板</span>
              <span class="select-value" :class="{ 'is-placeholder': !filterDraft.template }">
                {{ filterDraft.template || '全部模板' }}
              </span>
              <t-icon name="chevron-right" size="16" class="select-arrow" />
            </button>
            <button type="button" class="select-field" @click="openFilterPicker('plan')">
              <span class="select-label">关联计划</span>
              <span class="select-value" :class="{ 'is-placeholder': !filterDraft.plan }">
                {{ filterDraft.plan || '全部计划' }}
              </span>
              <t-icon name="chevron-right" size="16" class="select-arrow" />
            </button>
          </div>

          <div class="sheet-actions">
            <button type="button" class="sheet-btn sheet-btn--ghost" @click="resetFilters">重置</button>
            <button type="button" class="sheet-btn sheet-btn--primary" @click="applyFilters">查询</button>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="batchMode" class="batch-bar">
      <button type="button" class="batch-select-all" @click="toggleSelectAll">
        {{ allSelected ? '取消全选' : '全选' }}
      </button>
      <span class="batch-count">已选 {{ selectedIds.length }} 条</span>
      <button
        type="button"
        class="batch-delete"
        :disabled="!selectedIds.length"
        @click="askBatchDelete"
      >
        批量删除
      </button>
    </div>

    <AppConfirm
      v-model:visible="deleteVisible"
      title="删除该巡检任务？"
      content="该任务尚未开始执行，删除后将不再出现在巡检人的任务列表中。"
      confirm-text="删除"
      danger
      @confirm="confirmDeleteTask"
    />

    <AppConfirm
      v-model:visible="batchDeleteVisible"
      title="批量删除巡检任务？"
      :content="`已选择 ${selectedIds.length} 条待执行任务，删除后不可恢复。`"
      confirm-text="删除"
      danger
      @confirm="confirmBatchDelete"
    />

    <OptionSheet
      v-model:visible="pickerVisible"
      :title="pickerConfig.title"
      :options="pickerConfig.options"
      :model-value="pickerModel"
      @update:model-value="onFilterPickerUpdate"
    />
  </div>
</template>

<script setup>
import { computed, onDeactivated, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useInspectionStore } from '../../stores/inspection'
import {
  planStatusMap,
  execStatusMap,
  issueStatusMap,
  taskStoreOptions,
  planPersonnelOptions,
  planTemplateOptions
} from '../../data/inspection'
import OptionSheet from '../../components/OptionSheet.vue'
import AppConfirm from '../../components/AppConfirm.vue'

const router = useRouter()
const store = useInspectionStore()

const tasks = computed(() => store.tasks)

const filters = reactive({
  store: '',
  mode: '',
  personnel: '',
  template: '',
  plan: '',
  execStatus: '',
  taskNo: ''
})

const filterDraft = reactive({ ...filters })

const execStatusOptions = Object.entries(execStatusMap).map(([value, meta]) => ({
  value,
  label: meta.label
}))

const planNameOptions = computed(() => store.plans.map((plan) => plan.name))

const quickStatuses = computed(() => [
  { value: 'all', label: '全部', count: tasks.value.length },
  ...execStatusOptions.map((option) => ({
    ...option,
    count: tasks.value.filter((task) => task.executionStatus === option.value).length
  }))
])

const currentQuickStatus = computed(() => filters.execStatus || 'all')

const activeFilterCount = computed(
  () => Object.values(filters).filter((value) => Boolean(String(value).trim())).length
)

const filteredTasks = computed(() => {
  const keyword = filters.taskNo.trim()
  return tasks.value.filter((task) => {
    if (filters.store && task.storeName !== filters.store) return false
    if (filters.mode && task.inspectionMode !== filters.mode) return false
    if (filters.personnel && !task.plannedPersonnel.includes(filters.personnel)) return false
    if (filters.template && task.templateName !== filters.template) return false
    if (filters.plan && task.relatedPlan !== filters.plan) return false
    if (filters.execStatus && task.executionStatus !== filters.execStatus) return false
    if (keyword && !task.taskNo.includes(keyword) && !task.inspectionNo.includes(keyword)) return false
    return true
  })
})

const detailVisible = ref(false)
const detailTask = ref(null)

const detailRows = computed(() => {
  const task = detailTask.value
  if (!task) return []
  return [
    { label: '任务执行时间', value: task.executionTime },
    { label: '巡检门店', value: task.storeName },
    { label: '计划巡检人', value: task.plannedPersonnel },
    { label: '计划创建人', value: task.planCreator },
    { label: '巡检模板', value: task.templateName },
    { label: '巡检方式', value: task.inspectionMode },
    { label: '关联计划', value: task.relatedPlan },
    { label: '计划状态', value: planStatusMap[task.planStatus]?.label },
    { label: '任务执行状态', value: execStatusMap[task.executionStatus]?.label },
    { label: '截止时间', value: task.validUntil },
    { label: '实际巡检人', value: task.actualPersonnel },
    { label: '巡检编号', value: task.inspectionNo },
    { label: '巡检时间', value: task.inspectionTime },
    { label: '问题单状态', value: task.issueStatus },
    { label: '需整改问题数', value: task.issueCount },
    { label: '整改完成问题数', value: task.resolvedIssueCount }
  ]
})

const filterVisible = ref(false)

const batchMode = ref(false)
const selectedIds = ref([])

const allSelected = computed(
  () =>
    filteredTasks.value.length > 0 &&
    filteredTasks.value.every((task) => selectedIds.value.includes(task.id))
)

const goBack = () => {
  router.back()
}

const openDetail = (task) => {
  detailTask.value = task
  detailVisible.value = true
}

const clearSelection = () => {
  selectedIds.value = []
}

const clearKeyword = () => {
  filters.taskNo = ''
  clearSelection()
}

const setQuickStatus = (value) => {
  filters.execStatus = value === 'all' ? '' : value
  clearSelection()
}

const openFilter = () => {
  Object.assign(filterDraft, filters)
  filterVisible.value = true
}

const applyFilters = () => {
  Object.assign(filters, filterDraft)
  filterVisible.value = false
  clearSelection()
}

const resetFilters = () => {
  Object.keys(filterDraft).forEach((key) => {
    filterDraft[key] = ''
  })
  Object.assign(filters, filterDraft)
  clearSelection()
}

const resetAllFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = ''
  })
  Object.keys(filterDraft).forEach((key) => {
    filterDraft[key] = ''
  })
  clearSelection()
}

const pickerVisible = ref(false)
const pickerModel = ref('')
const pickerConfig = ref({ title: '', options: [], kind: '' })

const toOptions = (list) => list.map((item) => ({ value: item, label: item }))

const openFilterPicker = (kind) => {
  const configMap = {
    store: { title: '选择巡检门店', options: toOptions(taskStoreOptions) },
    mode: { title: '选择巡检方式', options: toOptions(['在线巡检', '线下巡检']) },
    personnel: { title: '选择计划巡检人', options: toOptions(planPersonnelOptions) },
    template: { title: '选择巡检模板', options: toOptions(planTemplateOptions) },
    plan: { title: '选择关联计划', options: toOptions(planNameOptions.value) }
  }

  const config = configMap[kind]
  if (!config) return

  pickerConfig.value = { ...config, kind }
  pickerModel.value = filterDraft[kind]
  pickerVisible.value = true
}

const onFilterPickerUpdate = (value) => {
  pickerModel.value = value
  filterDraft[pickerConfig.value.kind] = value
}

const toggleBatchMode = () => {
  batchMode.value = !batchMode.value
  selectedIds.value = []
  detailVisible.value = false
}

const toggleSelect = (taskId) => {
  selectedIds.value = selectedIds.value.includes(taskId)
    ? selectedIds.value.filter((id) => id !== taskId)
    : [...selectedIds.value, taskId]
}

const toggleSelectAll = () => {
  selectedIds.value = allSelected.value ? [] : filteredTasks.value.map((task) => task.id)
}

const deleteVisible = ref(false)
const deleteTarget = ref(null)

const askDeleteTask = (task) => {
  if (task.executionStatus !== 'pending') {
    Toast.error('该任务已执行/进行中/已超时，无法删除')
    return
  }
  deleteTarget.value = task
  deleteVisible.value = true
}

const askDeleteDetail = () => {
  if (!detailTask.value) return
  if (detailTask.value.executionStatus !== 'pending') {
    Toast.error('该任务已执行/进行中/已超时，无法删除')
    return
  }
  deleteTarget.value = detailTask.value
  deleteVisible.value = true
}

const confirmDeleteTask = () => {
  if (!deleteTarget.value) return
  store.deleteTasks([deleteTarget.value.id])
  if (detailTask.value?.id === deleteTarget.value.id) {
    detailVisible.value = false
    detailTask.value = null
  }
  selectedIds.value = selectedIds.value.filter((id) => id !== deleteTarget.value.id)
  deleteTarget.value = null
  Toast.success('任务已删除')
}

const batchDeleteVisible = ref(false)

const askBatchDelete = () => {
  if (!selectedIds.value.length) {
    Toast.warning('请先选择任务')
    return
  }
  const selected = tasks.value.filter((task) => selectedIds.value.includes(task.id))
  if (selected.some((task) => task.executionStatus !== 'pending')) {
    Toast.error('所选任务中包含已执行/进行中/已超时的任务，无法批量删除')
    return
  }
  batchDeleteVisible.value = true
}

const confirmBatchDelete = () => {
  store.deleteTasks(selectedIds.value)
  Toast.success('批量删除成功')
  selectedIds.value = []
  batchMode.value = false
}

onDeactivated(() => {
  detailVisible.value = false
  filterVisible.value = false
  pickerVisible.value = false
  deleteVisible.value = false
  batchDeleteVisible.value = false
  batchMode.value = false
  selectedIds.value = []
})
</script>

<style scoped>
.task-page {
  background:
    radial-gradient(120% 42% at 82% 0%, rgba(208, 220, 250, 0.72) 0%, rgba(232, 238, 252, 0) 62%),
    linear-gradient(180deg, #eef1fb 0%, #f5f7fc 34%, #ffffff 72%);
}

.task-page.has-batch {
  padding-bottom: calc(80px + var(--prototype-safe-bottom));
}

.task-hero {
  position: relative;
  overflow: hidden;
  padding: calc(var(--prototype-safe-top) + 8px) var(--prototype-page-padding-x) 6px;
}

.hero-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
}

.hero-back {
  width: 38px;
  height: 38px;
  margin-left: -9px;
  border: 0;
  background: transparent;
  color: #1b1d24;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hero-back:active {
  opacity: 0.55;
}

.hero-nav-label {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6c7ba8;
}

.hero-batch {
  margin-left: auto;
  border: 0;
  padding: 4px 2px;
  background: transparent;
  color: #3d6cf5;
  font-size: 14px;
  font-weight: 600;
}

.hero-batch:active {
  opacity: 0.6;
}

.hero-facets {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-facet {
  position: absolute;
  border-radius: 26px;
  background: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(196, 217, 255, 0.54) 48%,
    rgba(152, 188, 247, 0.28) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.66);
}

.hero-facet--a {
  top: -46px;
  right: -32px;
  width: 150px;
  height: 168px;
  transform: rotate(14deg);
  opacity: 0.8;
}

.hero-facet--b {
  top: 12px;
  right: 96px;
  width: 84px;
  height: 104px;
  transform: rotate(-12deg);
  opacity: 0.44;
}

.hero-inner {
  position: relative;
  z-index: 1;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.hero-copy {
  min-width: 0;
}

.hero-title {
  margin: 4px 0 0;
  font-size: 30px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #16181f;
}

.hero-subtitle {
  margin: 8px 0 0;
  font-size: 13.5px;
  color: #6b7186;
}

.hero-filter {
  flex: 0 0 auto;
  height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #4a5568;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(93, 110, 160, 0.1);
}

.hero-filter.is-active {
  color: #2f5fe0;
  border-color: rgba(61, 108, 245, 0.3);
}

.hero-filter b {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #3d6cf5;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
}

.hero-filter:active {
  transform: scale(0.96);
}

.search-box {
  margin-top: 16px;
  height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 24px rgba(93, 110, 160, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.search-icon {
  flex: 0 0 auto;
  color: #9aa1b2;
}

.search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  font-size: 14.5px;
  color: #23242b;
  outline: none;
}

.search-box input::placeholder {
  color: #a9aebb;
}

.search-clear {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  background: #eceef4;
  color: #8a8f9c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.status-tabs {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.status-tab {
  min-width: 0;
  height: 48px;
  padding: 0 4px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.66);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  font-size: 12px;
  font-weight: 600;
  color: #5f6474;
}

.status-tab span {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tab b {
  min-width: 0;
  height: auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #8b92a4;
  font-size: 12px;
  line-height: 1.2;
  text-align: center;
}

.status-tab.is-active {
  background: #ffffff;
  border-color: rgba(61, 108, 245, 0.32);
  color: #2f5fe0;
  box-shadow: 0 8px 18px rgba(61, 108, 245, 0.14);
}

.status-tab.is-active b {
  background: transparent;
  color: #2f5fe0;
}

.task-list {
  padding-top: 12px;
  padding-bottom: calc(var(--app-tabbar-space, 92px) + 8px);
}

.task-page.has-batch .task-list {
  padding-bottom: 96px;
}

.task-stack {
  display: grid;
  gap: 12px;
}

.task-card {
  padding: 15px 16px 14px;
}

.task-card:active {
  transform: scale(0.995);
}

.task-card-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.batch-check {
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  margin-top: 3px;
  border: 1.5px solid #cfd3de;
  border-radius: 7px;
  background: #ffffff;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.batch-check.is-checked {
  border-color: #3d6cf5;
  background: #3d6cf5;
}

.task-card-copy {
  flex: 1;
  min-width: 0;
}

.task-no-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-no {
  min-width: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: #7b8091;
  letter-spacing: 0.01em;
}

.status-pill {
  flex: 0 0 auto;
  padding: 3px 8px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
}

.status-pill--processing {
  background: #e9efff;
  color: #3f63e0;
}

.status-pill--success {
  background: #e2f8ee;
  color: #12946a;
}

.status-pill--danger {
  background: #ffe9e9;
  color: #e5484d;
}

.status-pill--warning {
  background: #fff2e1;
  color: #d9822b;
}

.status-pill--primary {
  background: #eaf1ff;
  color: #3d6cf5;
}

.status-pill--default {
  background: #f2f3f6;
  color: #7b7e8a;
}

.task-store {
  margin: 7px 0 0;
  font-size: 16px;
  line-height: 1.35;
  font-weight: 700;
  color: #1c1d24;
}

.task-time-row {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7f9ff;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.time-cell {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.time-cell--right {
  text-align: right;
}

.meta-label {
  font-size: 11.5px;
  color: #a3a6b2;
}

.meta-value {
  font-size: 13px;
  line-height: 1.45;
  color: #33343d;
}

.task-meta {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.meta-cell {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.meta-cell--wide {
  grid-column: span 2;
}

.task-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.task-tag {
  padding: 4px 8px;
  border-radius: 7px;
  background: #f3f4f8;
  color: #6f7280;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.3;
}

.task-tag--success {
  background: #e2f8ee;
  color: #12946a;
}

.task-tag--warning {
  background: #fff2e1;
  color: #d9822b;
}

.task-tag--processing {
  background: #e9efff;
  color: #3f63e0;
}

.task-tag--primary {
  background: #eaf1ff;
  color: #3d6cf5;
}

.task-tag--danger {
  background: #ffe9e9;
  color: #e5484d;
}

.task-tag--default {
  background: #f3f4f8;
  color: #7b7e8a;
}

.task-actions {
  margin-top: 13px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.card-action {
  height: 38px;
  border: 1px solid #eceef4;
  border-radius: 11px;
  background: #f8f9fc;
  color: #4a4c56;
  font-size: 13.5px;
  font-weight: 600;
}

.card-action--danger {
  border-color: rgba(229, 72, 77, 0.16);
  background: #fff5f5;
  color: #e5484d;
}

.card-action.is-disabled {
  opacity: 0.45;
}

.card-action:active {
  transform: scale(0.97);
}

.task-empty {
  padding: 40px 24px 32px;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 18px;
  background: #eef1ff;
  color: #5d74e8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  margin: 14px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: #23242b;
}

.empty-note {
  margin: 7px 0 0;
  font-size: 13px;
  color: #9a9da8;
}

.empty-reset {
  margin-top: 18px;
  height: 40px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: #3d6cf5;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 1600;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:global(body.prototype-preview-canvas) .sheet-layer {
  inset: auto;
  left: var(--preview-overlay-left, 0px);
  top: var(--preview-overlay-top, 0px);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100dvh);
}

.detail-sheet,
.filter-sheet {
  width: 100%;
  max-height: 86%;
  display: flex;
  flex-direction: column;
  padding: 10px 18px calc(14px + var(--prototype-safe-bottom));
  border-radius: 26px 26px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
}

.filter-sheet {
  max-height: 88%;
}

.sheet-handle {
  width: 42px;
  height: 5px;
  flex: 0 0 auto;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: #e5e5e8;
}

.sheet-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
}

.sheet-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #16171d;
}

.sheet-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #f3f4f8;
  color: #7d818d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.detail-body,
.filter-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 14px;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.detail-body::-webkit-scrollbar,
.filter-body::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.detail-hero {
  padding: 14px;
  border-radius: 18px;
  background: #f7f9ff;
  border: 1px solid #eef1fa;
}

.detail-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.detail-name {
  margin: 0;
  min-width: 0;
  font-size: 16px;
  line-height: 1.4;
  font-weight: 700;
  color: #1c1d24;
}

.detail-no {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: #8d909b;
}

.detail-rows {
  display: grid;
  border-radius: 18px;
  border: 1px solid #f0f1f6;
  overflow: hidden;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  font-size: 13.5px;
  background: #ffffff;
}

.detail-row + .detail-row {
  border-top: 1px solid #f4f5f9;
}

.detail-row span {
  flex: 0 0 auto;
  color: #92959f;
}

.detail-row strong {
  min-width: 0;
  text-align: right;
  font-weight: 600;
  color: #2a2b33;
}

.sheet-actions {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding-top: 14px;
}

.sheet-btn {
  height: 48px;
  border: 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.sheet-btn--ghost {
  background: #ececee;
  color: #16171d;
}

.sheet-btn--primary {
  background: #2f7dfa;
  color: #fff;
}

.sheet-btn--danger {
  background: #fff0f0;
  color: #e5484d;
}

.sheet-btn--danger.is-disabled {
  opacity: 0.45;
}

.field {
  display: block;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #4a4c56;
}

.field-input {
  width: 100%;
  padding: 12px 13px;
  border: 1px solid #eef0f5;
  border-radius: 12px;
  background: #f8f9fc;
  font-family: inherit;
  font-size: 14.5px;
  line-height: 1.4;
  color: #23242b;
  outline: none;
}

.field-input:focus {
  border-color: rgba(61, 108, 245, 0.4);
  background: #ffffff;
}

.field-input::placeholder {
  color: #adb1bd;
}

.filter-group-title {
  margin: 2px 0 -2px;
  font-size: 12.5px;
  font-weight: 600;
  color: #92959f;
}

.filter-chip-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.filter-chip {
  height: 36px;
  border: 1px solid #eef0f5;
  border-radius: 10px;
  background: #f8f9fc;
  color: #5c5f6b;
  font-size: 12.5px;
  font-weight: 600;
}

.filter-chip.is-active {
  border-color: rgba(61, 108, 245, 0.3);
  background: #eaf1ff;
  color: #2f5fe0;
}

.select-field {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 13px;
  border: 1px solid #eef0f5;
  border-radius: 12px;
  background: #f8f9fc;
  text-align: left;
}

.select-label {
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 600;
  color: #4a4c56;
}

.select-value {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  line-height: 1.4;
  color: #23242b;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-value.is-placeholder {
  color: #adb1bd;
}

.select-arrow {
  flex: 0 0 auto;
  color: #b3b6c1;
}

.batch-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px var(--prototype-page-padding-x) calc(10px + var(--prototype-safe-bottom));
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid rgba(238, 240, 245, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

:global(body.prototype-preview-canvas) .batch-bar {
  left: var(--preview-overlay-left, 0px);
  right: auto;
  width: var(--preview-overlay-width, 100vw);
}

.batch-select-all {
  flex: 0 0 auto;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #eceef4;
  border-radius: 20px;
  background: #f8f9fc;
  color: #4a4c56;
  font-size: 13.5px;
  font-weight: 600;
}

.batch-count {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #8f93a0;
}

.batch-delete {
  flex: 0 0 auto;
  height: 40px;
  padding: 0 20px;
  border: 0;
  border-radius: 20px;
  background: #f0443f;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(240, 68, 63, 0.24);
}

.batch-delete:disabled {
  opacity: 0.45;
  box-shadow: none;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.26s ease;
}

.sheet-enter-active .detail-sheet,
.sheet-leave-active .detail-sheet,
.sheet-enter-active .filter-sheet,
.sheet-leave-active .filter-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .detail-sheet,
.sheet-leave-to .detail-sheet,
.sheet-enter-from .filter-sheet,
.sheet-leave-to .filter-sheet {
  transform: translate3d(0, 100%, 0);
}
</style>
