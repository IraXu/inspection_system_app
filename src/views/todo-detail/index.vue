<template>
  <div class="detail-page app-page app-page--navbar">
    <t-navbar title="流程详情" left-arrow class="page-navbar" @left-click="goBack" />

    <template v-if="ticket">
      <div class="detail-hero app-card">
        <div class="detail-hero-top">
          <div class="detail-hero-copy">
            <div class="detail-hero-kicker">{{ ticket.id }}</div>
            <h1 class="detail-hero-title">{{ ticket.storeName }}</h1>
            <p class="detail-hero-note">{{ ticket.templateName }} · {{ ticket.method }}</p>
          </div>
          <span class="detail-hero-status" :class="statusMeta.tone">{{ statusMeta.label }}</span>
        </div>

        <div class="detail-hero-stats">
          <div class="detail-hero-stat">
            <span>问题数</span>
            <strong>{{ ticket.issueCount }}</strong>
          </div>
          <div class="detail-hero-stat">
            <span>整改人</span>
            <strong>{{ ticket.rectifier }}</strong>
          </div>
          <div class="detail-hero-stat">
            <span>审核人</span>
            <strong>{{ ticket.reviewer }}</strong>
          </div>
        </div>
      </div>

      <section class="app-section detail-section">
        <div class="detail-card app-card">
          <div class="detail-card-title">流转记录</div>
          <div class="timeline">
            <div
              v-for="(node, index) in ticket.timeline"
              :key="`${node.label}-${index}`"
              class="timeline-node"
              :class="`timeline-node--${node.type}`"
            >
              <div class="timeline-axis">
                <span class="timeline-dot"></span>
                <span v-if="index < ticket.timeline.length - 1" class="timeline-line"></span>
              </div>
              <div class="timeline-body">
                <div class="timeline-head">
                  <span class="timeline-label">{{ node.label }}</span>
                  <span class="timeline-time">{{ node.time }}</span>
                </div>
                <div class="timeline-operator">{{ node.operator }}</div>
                <p v-if="node.opinion" class="timeline-opinion">{{ node.opinion }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!ticket.issueCount" class="detail-card app-card">
          <div class="all-pass">
            <div class="all-pass-icon">
              <t-icon name="check-circle-filled" />
            </div>
            <div class="all-pass-copy">
              <div class="all-pass-title">本次巡检全部合格</div>
              <p class="all-pass-note">未发现不合格项，无需生成整改单，记录已自动归档。</p>
            </div>
          </div>
        </div>

        <template v-else>
          <div class="detail-card app-card">
            <div class="detail-card-title">整改明细（{{ ticket.items.length }} 项）</div>
            <div class="detail-items">
              <div v-for="(item, index) in ticket.items" :key="item.id" class="detail-item">
                <div class="detail-item-head">
                  <span class="detail-item-index">{{ String(index + 1).padStart(2, '0') }}</span>
                  <span class="detail-item-title">{{ item.categoryName }} · {{ item.itemName }}</span>
                </div>

                <div class="detail-block">
                  <span class="detail-label">问题描述</span>
                  <p class="detail-text">{{ item.problemDesc }}</p>
                  <div v-if="item.inspectImages.length" class="thumb-row">
                    <div
                      v-for="image in item.inspectImages"
                      :key="image"
                      class="thumb"
                      @click="previewImage(image, '巡检截图')"
                    >
                      <img :src="image" alt="" />
                    </div>
                  </div>
                </div>

                <div v-if="item.rectifyDesc || item.rectifyImages.length" class="detail-block">
                  <span class="detail-label detail-label--done">
                    <t-icon name="check-circle-filled" />
                    整改结果
                  </span>
                  <p class="detail-text detail-text--done">{{ item.rectifyDesc || '未填写整改说明' }}</p>
                  <div v-if="item.rectifyImages.length" class="thumb-row">
                    <div
                      v-for="image in item.rectifyImages"
                      :key="image"
                      class="thumb thumb--done"
                      @click="previewImage(image, '整改截图')"
                    >
                      <img :src="image" alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-if="ticket.reviewOpinion || ticket.rejectReason" class="detail-card app-card">
          <div class="detail-card-title">审核意见</div>
          <div class="opinion-box" :class="{ 'opinion-box--reject': ticket.rejectReason && ticket.status !== 'completed' }">
            <t-icon :name="ticket.rejectReason && ticket.status !== 'completed' ? 'error-circle-filled' : 'check-circle-filled'" />
            <span>{{ ticket.rejectReason && ticket.status !== 'completed' ? ticket.rejectReason : ticket.reviewOpinion }}</span>
          </div>
        </div>
      </section>

      <div class="flow-footer">
        <t-button theme="primary" block @click="goBack">返回待办列表</t-button>
      </div>
    </template>

    <t-empty v-else class="empty-wrap" description="流程记录不存在" />

    <PhotoViewer v-model:visible="viewerVisible" :url="viewerUrl" :caption="viewerCaption" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTodoStore } from '../../stores/todo'
import { todoStatusMap } from '../../data/todos'
import PhotoViewer from '../../components/PhotoViewer.vue'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()

const ticket = computed(() => todoStore.getTicket(route.params.ticketId))

const statusMeta = computed(() => {
  const meta = todoStatusMap[ticket.value?.status] || todoStatusMap.completed
  const toneMap = { warning: 'is-warning', primary: 'is-primary', success: 'is-success' }
  return { label: meta.label, tone: toneMap[meta.tone] || 'is-success' }
})

const viewerVisible = ref(false)
const viewerUrl = ref('')
const viewerCaption = ref('')

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/todo')
}

const previewImage = (url, caption = '') => {
  viewerUrl.value = url
  viewerCaption.value = caption
  viewerVisible.value = true
}
</script>

<style scoped>
.detail-page {
  min-height: 100%;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top, rgba(99, 102, 241, 0.1), transparent 26%),
    linear-gradient(180deg, #f7f7ff 0%, #f6f8fb 26%, #f5f7fb 100%);
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
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.72), transparent 42%),
    linear-gradient(135deg, #eeeaff 0%, #ddd6fe 58%, #c7bdfb 100%);
  box-shadow: 0 18px 36px rgba(99, 102, 241, 0.16);
}

.detail-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.detail-hero-copy {
  min-width: 0;
}

.detail-hero-kicker {
  font-size: 11px;
  font-weight: 700;
  color: rgba(67, 56, 202, 0.66);
  letter-spacing: 0.02em;
}

.detail-hero-title {
  margin: 8px 0 0;
  font-size: 19px;
  line-height: 1.35;
  font-weight: 700;
  color: #312e81;
}

.detail-hero-note {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(49, 46, 129, 0.62);
}

.detail-hero-status {
  flex: 0 0 auto;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.detail-hero-status.is-success {
  color: #15803d;
}

.detail-hero-status.is-warning {
  color: #b45309;
}

.detail-hero-status.is-primary {
  color: var(--theme-primary-strong);
}

.detail-hero-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.detail-hero-stat {
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.48);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-hero-stat span {
  font-size: 10px;
  color: rgba(49, 46, 129, 0.56);
}

.detail-hero-stat strong {
  font-size: 12px;
  color: #312e81;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-section {
  display: grid;
  gap: 12px;
  flex: 1;
  padding-top: 2px;
}

.detail-card {
  padding: 14px;
  border-radius: 18px;
}

.detail-card-title {
  font-size: 15px;
  font-weight: 700;
  color: #173153;
  margin-bottom: 12px;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-node {
  display: flex;
  gap: 10px;
}

.timeline-axis {
  position: relative;
  width: 14px;
  flex: 0 0 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  margin-top: 4px;
  border-radius: 50%;
  background: var(--theme-primary);
  box-shadow: 0 0 0 4px rgba(var(--theme-primary-rgb), 0.12);
}

.timeline-node--rejected .timeline-dot {
  background: #d54941;
  box-shadow: 0 0 0 4px rgba(213, 73, 65, 0.12);
}

.timeline-node--approved .timeline-dot,
.timeline-node--done .timeline-dot {
  background: #16a34a;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
}

.timeline-node--rectified .timeline-dot {
  background: #d97706;
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.12);
}

.timeline-line {
  flex: 1;
  width: 2px;
  margin: 4px 0;
  border-radius: 2px;
  background: rgba(216, 226, 238, 0.9);
}

.timeline-body {
  padding-bottom: 14px;
  min-width: 0;
  flex: 1;
}

.timeline-node:last-child .timeline-body {
  padding-bottom: 0;
}

.timeline-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.timeline-label {
  font-size: 13px;
  font-weight: 700;
  color: #173153;
}

.timeline-time {
  font-size: 10px;
  color: #93a0b2;
  white-space: nowrap;
}

.timeline-operator {
  margin-top: 3px;
  font-size: 11px;
  color: #7a8ba0;
}

.timeline-opinion {
  margin: 6px 0 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(247, 250, 254, 0.96);
  font-size: 11px;
  line-height: 1.55;
  color: #56708f;
}

.timeline-node--rejected .timeline-opinion {
  background: rgba(213, 73, 65, 0.07);
  color: #a34a45;
}

.detail-items {
  display: grid;
  gap: 12px;
}

.detail-item {
  padding: 12px;
  border-radius: 14px;
  background: rgba(247, 250, 254, 0.7);
  border: 1px solid rgba(229, 236, 246, 0.9);
}

.detail-item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #173153;
}

.detail-item-index {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 22px;
}

.detail-block {
  margin-top: 10px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #93a0b2;
  margin-bottom: 5px;
}

.detail-label--done {
  color: #15803d;
}

.detail-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #3f5877;
}

.detail-text--done {
  color: #1f5a3f;
}

.thumb-row {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.thumb {
  width: 74px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  background: #eef3f9;
}

.thumb--done {
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.22);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.all-pass {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.all-pass-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex: 0 0 42px;
}

.all-pass-title {
  font-size: 14px;
  font-weight: 700;
  color: #14532d;
}

.all-pass-note {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: #5b7a68;
}

.opinion-box {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(240, 253, 246, 0.9);
  border: 1px solid rgba(22, 163, 74, 0.16);
  color: #15803d;
  font-size: 12px;
  line-height: 1.6;
}

.opinion-box--reject {
  background: rgba(255, 245, 244, 0.92);
  border-color: rgba(213, 73, 65, 0.18);
  color: #b9382f;
}

.flow-footer {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  padding: 12px var(--prototype-page-padding-x) calc(12px + var(--prototype-safe-bottom));
  background: rgba(247, 250, 254, 0.94);
  border-top: 1px solid rgba(226, 234, 244, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  z-index: 10;
}

.empty-wrap {
  padding-top: 90px;
}
</style>
