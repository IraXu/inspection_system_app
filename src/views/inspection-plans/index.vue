<template>
  <div class="plan-page app-page">
    <header class="plan-hero">
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
        </div>

        <div class="hero-top">
          <div class="hero-copy">
            <h1 class="hero-title">巡检计划</h1>
            <p class="hero-subtitle">
              共 {{ plans.length }} 个计划 · {{ store.inProgressPlanCount }} 个进行中
            </p>
          </div>
          <button type="button" class="hero-add" @click="openCreate">
            <t-icon name="add" size="18" />
            <span>新增</span>
          </button>
        </div>

        <label class="search-box">
          <t-icon name="search" size="18" class="search-icon" />
          <input v-model="keyword" type="text" placeholder="搜索计划名称" />
          <button v-if="keyword" type="button" class="search-clear" @click="keyword = ''">
            <t-icon name="close" size="14" />
          </button>
        </label>

        <div class="status-tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            class="status-tab"
            :class="{ 'is-active': activeStatus === tab.value }"
            @click="activeStatus = tab.value"
          >
            <span>{{ tab.label }}</span>
            <b>{{ tab.count }}</b>
          </button>
          <button type="button" class="legend-trigger" aria-label="查看状态说明" @click="legendVisible = true">
            <t-icon name="help" size="16" />
            <span class="legend-text">说明</span>
          </button>
        </div>
      </div>
    </header>

    <section class="app-section plan-list">
      <div v-if="filteredPlans.length" class="plan-stack">
        <article v-for="plan in filteredPlans" :key="plan.id" class="plan-card app-card">
          <div class="plan-card-head">
            <div class="plan-card-copy">
              <h2 class="plan-name">{{ plan.name }}</h2>
              <p class="plan-sub">{{ plan.creator }} 创建 · 更新于 {{ plan.updatedAt }}</p>
            </div>
            <span class="status-pill" :class="`status-pill--${planStatusMap[plan.status]?.tone}`">
              {{ planStatusMap[plan.status]?.label }}
            </span>
          </div>

          <div class="plan-chips">
            <span class="plan-chip">{{ planModeLabel[plan.inspectionMode] }}</span>
            <span class="plan-chip plan-chip--soft">{{ formatPlanCycle(plan) }}</span>
            <span v-if="formatCycleDays(plan)" class="plan-chip plan-chip--soft">
              {{ formatCycleDays(plan) }}
            </span>
          </div>

          <div class="plan-meta">
            <div class="meta-cell">
              <span class="meta-label">{{ plan.cycleMode === 'once' ? '执行时间' : '计划周期' }}</span>
              <span class="meta-value">{{ formatPlanPeriod(plan) }}</span>
            </div>
            <div class="meta-cell">
              <span class="meta-label">执行时限</span>
              <span class="meta-value">{{ plan.duration || '—' }}</span>
            </div>
            <div class="meta-cell meta-cell--wide">
              <span class="meta-label">巡检门店</span>
              <span class="meta-value">{{ formatPlanStores(plan) }}</span>
            </div>
          </div>

          <div class="plan-actions">
            <button type="button" class="card-action" @click="openDetail(plan)">详情</button>
            <button type="button" class="card-action card-action--primary" @click="openEdit(plan)">编辑</button>
            <button type="button" class="card-action card-action--danger" @click="askDelete(plan)">
              <t-icon name="delete" size="15" />
              删除
            </button>
          </div>
        </article>
      </div>

      <div v-else class="plan-empty app-card">
        <div class="empty-icon"><t-icon name="task" size="26" /></div>
        <p class="empty-title">没有匹配的巡检计划</p>
        <p class="empty-note">可调整筛选条件，或新增一个巡检计划</p>
        <button type="button" class="empty-add" @click="openCreate">新增计划</button>
      </div>
    </section>

    <transition name="sheet">
      <div v-if="detailVisible" class="sheet-layer" @click.self="detailVisible = false">
        <div class="detail-sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-head">
            <h3 class="sheet-title">巡检计划详情</h3>
            <button type="button" class="sheet-close" @click="detailVisible = false">
              <t-icon name="close" size="18" />
            </button>
          </div>

          <div v-if="detailPlan" class="detail-body">
            <div class="detail-hero">
              <div class="detail-title-row">
                <h4 class="detail-name">{{ detailPlan.name }}</h4>
                <span class="status-pill" :class="`status-pill--${planStatusMap[detailPlan.status]?.tone}`">
                  {{ planStatusMap[detailPlan.status]?.label }}
                </span>
              </div>
              <div class="plan-chips">
                <span class="plan-chip">{{ planModeLabel[detailPlan.inspectionMode] }}</span>
                <span class="plan-chip plan-chip--soft">{{ formatPlanCycle(detailPlan) }}</span>
                <span v-if="formatCycleDays(detailPlan)" class="plan-chip plan-chip--soft">
                  {{ formatCycleDays(detailPlan) }}
                </span>
              </div>
            </div>

            <div class="detail-rows">
              <div class="detail-row">
                <span>任务生成时间</span>
                <strong>{{ detailPlan.executionTime || '—' }}</strong>
              </div>
              <div class="detail-row">
                <span>计划周期</span>
                <strong>{{ formatPlanPeriod(detailPlan) }}</strong>
              </div>
              <div class="detail-row">
                <span>执行时限</span>
                <strong>{{ detailPlan.duration || '—' }}</strong>
              </div>
              <div class="detail-row">
                <span>问题指派人</span>
                <strong>{{ detailPlan.assigneeNames?.join('、') || '—' }}</strong>
              </div>
              <div class="detail-row">
                <span>问题审核人</span>
                <strong>{{ detailPlan.reviewerNames?.join('、') || '—' }}</strong>
              </div>
              <div class="detail-row">
                <span>计划说明</span>
                <strong class="detail-desc">{{ detailPlan.description || '—' }}</strong>
              </div>
            </div>

            <div class="detail-block">
              <span class="detail-label">巡检门店配置</span>
              <div
                v-for="row in detailPlan.storesPersonnelTemplates"
                :key="row.key"
                class="store-config-card"
              >
                <div class="store-config-name">{{ row.storeName }}</div>
                <div class="store-config-line">巡检人：{{ row.personnelNames.join('、') }}</div>
                <div class="store-config-line">巡检模板：{{ row.templateName }}</div>
              </div>
            </div>
          </div>

          <div class="sheet-actions">
            <button type="button" class="sheet-btn sheet-btn--ghost" @click="detailVisible = false">关闭</button>
            <button type="button" class="sheet-btn sheet-btn--primary" @click="editFromDetail">编辑计划</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="legendVisible" class="sheet-layer" @click.self="legendVisible = false">
        <div class="legend-sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-head">
            <h3 class="sheet-title">计划状态说明</h3>
            <button type="button" class="sheet-close" @click="legendVisible = false">
              <t-icon name="close" size="18" />
            </button>
          </div>
          <div class="legend-list">
            <div v-for="item in planStatusDescriptions" :key="item.key" class="legend-item">
              <span class="status-pill" :class="`status-pill--${planStatusMap[item.key]?.tone}`">
                {{ item.label }}
              </span>
              <p class="legend-desc">{{ item.desc }}</p>
            </div>
          </div>
          <div class="sheet-actions">
            <button type="button" class="sheet-btn sheet-btn--primary" @click="legendVisible = false">知道了</button>
          </div>
        </div>
      </div>
    </transition>

    <AppConfirm
      v-model:visible="deleteVisible"
      title="删除该巡检计划？"
      :content="deleteContent"
      confirm-text="继续"
      danger
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, onDeactivated, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useInspectionStore } from '../../stores/inspection'
import {
  planStatusMap,
  planStatusDescriptions,
  planModeLabel,
  formatPlanCycle,
  formatCycleDays,
  formatPlanPeriod,
  formatPlanStores
} from '../../data/inspection'
import AppConfirm from '../../components/AppConfirm.vue'

const router = useRouter()
const store = useInspectionStore()

const activeStatus = ref('all')
const keyword = ref('')

const plans = computed(() => store.plans)

const statusTabs = computed(() => [
  { value: 'all', label: '全部', count: plans.value.length },
  ...Object.entries(planStatusMap).map(([key, meta]) => ({
    value: key,
    label: meta.label,
    count: plans.value.filter((plan) => plan.status === key).length
  }))
])

const filteredPlans = computed(() => {
  const text = keyword.value.trim()
  return plans.value.filter((plan) => {
    if (activeStatus.value !== 'all' && plan.status !== activeStatus.value) return false
    if (text && !plan.name.includes(text)) return false
    return true
  })
})

const detailVisible = ref(false)
const detailPlan = ref(null)
const legendVisible = ref(false)

const deleteVisible = ref(false)
const deleteTarget = ref(null)

const deleteContent = computed(() => {
  const plan = deleteTarget.value
  if (!plan) return ''
  if (plan.status === 'not_started') return '该计划尚未开始，删除后配置将被移除。'
  if (plan.status === 'in_progress') return '该计划正在执行中，已执行的巡检任务将永久保留，仅待执行任务会被清理。'
  return '该计划已结束，删除后配置将被移除，历史任务数据永久保留。'
})

const goBack = () => {
  router.back()
}

const openCreate = () => {
  router.push('/inspection/plans/new')
}

const openEdit = (plan) => {
  router.push(`/inspection/plans/${plan.id}/edit`)
}

const openDetail = (plan) => {
  detailPlan.value = plan
  detailVisible.value = true
}

const editFromDetail = () => {
  if (!detailPlan.value) return
  detailVisible.value = false
  openEdit(detailPlan.value)
}

const askDelete = (plan) => {
  deleteTarget.value = plan
  deleteVisible.value = true
}

const confirmDelete = () => {
  if (!deleteTarget.value) return
  store.deletePlan(deleteTarget.value.id)
  if (detailPlan.value?.id === deleteTarget.value.id) {
    detailVisible.value = false
    detailPlan.value = null
  }
  deleteTarget.value = null
  Toast.success('巡检计划已删除')
}

onDeactivated(() => {
  detailVisible.value = false
  legendVisible.value = false
  deleteVisible.value = false
})
</script>

<style scoped>
.plan-page {
  background:
    radial-gradient(120% 42% at 82% 0%, rgba(208, 220, 250, 0.72) 0%, rgba(232, 238, 252, 0) 62%),
    linear-gradient(180deg, #eef1fb 0%, #f5f7fc 34%, #ffffff 72%);
}

.plan-hero {
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

.hero-add {
  flex: 0 0 auto;
  height: 38px;
  padding: 0 15px 0 12px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #5c7cf8 0%, #3f5ef0 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 10px 22px rgba(63, 94, 240, 0.24);
}

.hero-add:active {
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

.legend-trigger {
  height: 48px;
  padding: 0 4px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.66);
  color: #7a8093;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
}

.legend-text {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}

.plan-list {
  padding-top: 12px;
  padding-bottom: calc(var(--app-tabbar-space, 92px) + 8px);
}

.plan-stack {
  display: grid;
  gap: 12px;
}

.plan-card {
  padding: 16px 16px 14px;
}

.plan-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.plan-card-copy {
  min-width: 0;
}

.plan-name {
  margin: 0;
  font-size: 16.5px;
  line-height: 1.35;
  font-weight: 700;
  color: #1c1d24;
}

.plan-sub {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9a9da8;
}

.status-pill {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 7px;
  font-size: 12px;
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

.plan-chips {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.plan-chip {
  padding: 4px 9px;
  border-radius: 7px;
  background: #eaf1ff;
  color: #3d6cf5;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
}

.plan-chip--soft {
  background: #f3f4f8;
  color: #6f7280;
}

.plan-meta {
  margin-top: 13px;
  padding-top: 12px;
  border-top: 1px dashed #eef0f5;
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
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

.meta-label {
  font-size: 11.5px;
  color: #a3a6b2;
}

.meta-value {
  font-size: 13px;
  line-height: 1.45;
  color: #33343d;
  overflow-wrap: break-word;
}

.plan-actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.card-action--primary {
  border-color: rgba(61, 108, 245, 0.2);
  background: #eaf1ff;
  color: #2f5fe0;
}

.card-action--danger {
  border-color: rgba(229, 72, 77, 0.16);
  background: #fff5f5;
  color: #e5484d;
}

.card-action:active {
  transform: scale(0.97);
}

.plan-empty {
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

.empty-add {
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
.legend-sheet {
  width: 100%;
  max-height: 84%;
  display: flex;
  flex-direction: column;
  padding: 10px 18px calc(14px + var(--prototype-safe-bottom));
  border-radius: 26px 26px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
}

.legend-sheet {
  max-height: 68%;
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

.detail-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 14px;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.detail-body::-webkit-scrollbar {
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

.detail-rows {
  display: grid;
  gap: 0;
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

.detail-desc {
  line-height: 1.5;
  font-weight: 500 !important;
  color: #4a4c56 !important;
}

.detail-block {
  display: grid;
  gap: 8px;
}

.detail-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #92959f;
}

.store-config-card {
  padding: 13px 14px;
  border-radius: 14px;
  background: #f8f9fc;
  border: 1px solid #eef0f5;
}

.store-config-name {
  font-size: 14px;
  font-weight: 700;
  color: #23242b;
}

.store-config-line {
  margin-top: 5px;
  font-size: 12.5px;
  color: #7c8090;
}

.sheet-actions {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding-top: 14px;
}

.legend-sheet .sheet-actions {
  grid-template-columns: 1fr;
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

.sheet-btn--primary:active {
  background: #1f6ceb;
}

.legend-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 12px;
  padding: 2px 2px 6px;
}

.legend-item {
  padding: 13px 14px;
  border-radius: 14px;
  background: #f8f9fc;
  border: 1px solid #eef0f5;
}

.legend-desc {
  margin: 8px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: #7c8090;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.26s ease;
}

.sheet-enter-active .detail-sheet,
.sheet-leave-active .detail-sheet,
.sheet-enter-active .legend-sheet,
.sheet-leave-active .legend-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .detail-sheet,
.sheet-leave-to .detail-sheet,
.sheet-enter-from .legend-sheet,
.sheet-leave-to .legend-sheet {
  transform: translate3d(0, 100%, 0);
}
</style>
