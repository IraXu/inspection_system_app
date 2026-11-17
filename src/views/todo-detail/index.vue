<template>
  <div class="detail-page app-page app-page--navbar">
    <t-navbar title="流程详情" left-arrow class="page-navbar" @left-click="goBack" />

    <template v-if="ticket">
      <div class="detail-hero">
        <div class="detail-hero-head">
          <div class="detail-hero-badge">
            <t-icon name="task-checked" />
          </div>
          <div class="detail-hero-copy">
            <div class="detail-hero-topline">
              <h1 class="detail-hero-title">{{ ticket.storeName }}</h1>
              <span class="detail-hero-time">
                {{ ticket.reviewedAt || ticket.rectifiedAt || ticket.createdAt }}
              </span>
            </div>
            <span class="detail-hero-id">{{ ticket.id }}</span>
            <div class="detail-chips">
              <span class="chip chip--calm">
                {{ ticket.status === 'completed' ? (ticket.issueCount ? '已闭环' : '巡检合格') : statusMeta.label }}
              </span>
              <span class="chip chip--issue">问题 {{ ticket.issueCount }} 个</span>
              <span v-if="ticket.sourceType === 'ai'" class="chip chip--ai">AI</span>
            </div>
          </div>
        </div>

        <div class="detail-meta">
          <div class="detail-meta-item">
            <span class="meta-label">巡检模板</span>
            <span class="meta-value">{{ ticket.templateName }}</span>
          </div>
          <div class="detail-meta-item">
            <span class="meta-label">巡检方式</span>
            <span class="meta-value">{{ ticket.method }}</span>
          </div>
          <div class="detail-meta-item">
            <span class="meta-label">整改人</span>
            <span class="meta-value">{{ ticket.rectifier }}</span>
          </div>
          <div class="detail-meta-item">
            <span class="meta-label">完成时间</span>
            <span class="meta-value">{{ ticket.reviewedAt || ticket.rectifiedAt || '—' }}</span>
          </div>
        </div>
      </div>

      <section class="app-section detail-section">
        <div class="detail-card">
          <h2 class="detail-card-title">流程记录</h2>
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

        <div v-if="!ticket.issueCount" class="detail-card">
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
          <div class="detail-items-head">
            <h2 class="detail-items-title">整改明细</h2>
            <span class="detail-items-pill">{{ ticket.items.length }} 项</span>
          </div>

          <div class="detail-items">
            <div v-for="(item, index) in ticket.items" :key="item.id" class="detail-card detail-item">
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
                <span class="detail-label detail-label--done"><i class="dot"></i>整改结果</span>
                <p class="detail-text detail-text--done">{{ item.rectifyDesc || '未填写整改说明' }}</p>
                <div v-if="item.rectifyImages.length" class="thumb-row">
                  <div
                    v-for="image in item.rectifyImages"
                    :key="image"
                    class="thumb"
                    @click="previewImage(image, '整改截图')"
                  >
                    <img :src="image" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-if="ticket.reviewOpinion || ticket.rejectReason" class="detail-card">
          <h2 class="detail-card-title">审核意见</h2>
          <div class="opinion-box" :class="{ 'opinion-box--reject': ticket.rejectReason && ticket.status !== 'completed' }">
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

.detail-hero {
  margin: 12px var(--prototype-page-padding-x) 0;
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.detail-hero-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-hero-badge {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 12px;
  background: #f4f4f6;
  color: #565863;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.detail-hero-copy {
  flex: 1;
  min-width: 0;
}

.detail-hero-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.detail-hero-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 600;
  color: #1c1d24;
}

.detail-hero-time {
  flex: 0 0 auto;
  padding-top: 2px;
  font-size: 12px;
  color: #9497a2;
  white-space: nowrap;
}

.detail-hero-id {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: #8d909b;
}

.detail-chips {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 4px 9px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
}

.chip--calm {
  background: #f2f2f5;
  color: #5f616b;
  border: 1px solid #e4e4ea;
}

.chip--issue {
  background: #ffe9e9;
  color: #e5484d;
}

.chip--ai {
  background: #e8edff;
  color: #4f63e8;
}

.detail-meta {
  margin-top: 14px;
  padding: 15px 14px;
  border-radius: 14px;
  background: #f7f7f9;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 12px;
}

.detail-meta-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.meta-label {
  font-size: 12px;
  color: #9b9da6;
}

.meta-value {
  font-size: 14px;
  line-height: 1.35;
  font-weight: 600;
  color: #2b2c33;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-section {
  display: grid;
  gap: 12px;
  flex: 1;
  padding-top: 14px;
}

.detail-card {
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.detail-card-title {
  margin: 0 0 14px;
  font-size: 19px;
  font-weight: 700;
  color: #1b1c22;
  letter-spacing: -0.01em;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-node {
  display: flex;
  gap: 11px;
}

.timeline-axis {
  position: relative;
  width: 12px;
  flex: 0 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 50%;
  background: #4059f0;
  box-shadow: 0 0 0 4px rgba(64, 89, 240, 0.1);
}

.timeline-node--rejected .timeline-dot {
  background: #e5484d;
  box-shadow: 0 0 0 4px rgba(229, 72, 77, 0.1);
}

.timeline-node--approved .timeline-dot,
.timeline-node--done .timeline-dot {
  background: #2b2c33;
  box-shadow: 0 0 0 4px rgba(43, 44, 51, 0.08);
}

.timeline-node--rectified .timeline-dot {
  background: #ef8a17;
  box-shadow: 0 0 0 4px rgba(239, 138, 23, 0.1);
}

.timeline-line {
  flex: 1;
  width: 2px;
  margin: 5px 0;
  border-radius: 2px;
  background: #eef0f4;
}

.timeline-body {
  padding-bottom: 16px;
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
  font-size: 14px;
  font-weight: 600;
  color: #1c1d24;
}

.timeline-time {
  font-size: 11px;
  color: #9a9da7;
  white-space: nowrap;
}

.timeline-operator {
  margin-top: 4px;
  font-size: 12px;
  color: #8d909b;
}

.timeline-opinion {
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #effaf3;
  border: 1px solid #bfe8d0;
  font-size: 12.5px;
  line-height: 1.6;
  color: #1d8a57;
}

.timeline-node--rejected .timeline-opinion {
  background: #fdf0f0;
  border-color: #f6c9c9;
  color: #e5484d;
}

.detail-items-head {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px 2px;
}

.detail-items-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #1b1c22;
  letter-spacing: -0.01em;
}

.detail-items-pill {
  padding: 4px 11px;
  border-radius: 999px;
  background: #2b2c33;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.detail-items {
  display: grid;
  gap: 12px;
}

.detail-item-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}

.detail-item-index {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 8px;
  background: #eef0ff;
  color: #4756c8;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.detail-item-title {
  padding-top: 3px;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 600;
  color: #1c1d24;
}

.detail-block + .detail-block {
  margin-top: 16px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #9b9da6;
}

.detail-label--done {
  color: #12a37f;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #12a37f;
}

.detail-text {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f7f9;
  font-size: 13px;
  line-height: 1.6;
  color: #6b6f7a;
}

.detail-text--done {
  background: #effaf3;
  border: 1px solid #bfe8d0;
  color: #1d8a57;
  font-weight: 500;
}

.thumb-row {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.thumb {
  width: 78px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  background: #eef3f9;
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
  border-radius: 12px;
  background: #e9fbf5;
  color: #12a37f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex: 0 0 42px;
}

.all-pass-title {
  font-size: 15px;
  font-weight: 700;
  color: #1b1c22;
}

.all-pass-note {
  margin: 6px 0 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: #7a7e8a;
}

.opinion-box {
  padding: 10px 12px;
  border-radius: 10px;
  background: #effaf3;
  border: 1px solid #bfe8d0;
  color: #1d8a57;
  font-size: 13px;
  line-height: 1.6;
  font-weight: 500;
}

.opinion-box--reject {
  background: #fdf0f0;
  border-color: #f6c9c9;
  color: #e5484d;
}

.flow-footer {
  position: sticky;
  bottom: 0;
  margin: 12px var(--prototype-page-padding-x) 0;
  padding: 10px 10px calc(10px + var(--prototype-safe-bottom));
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(238, 240, 245, 0.9);
  border-radius: 18px;
  box-shadow: 0 -10px 30px rgba(24, 36, 72, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  z-index: 10;
}

.flow-footer :deep(.t-button) {
  height: 48px;
  border: 0;
  border-radius: 999px;
  background: #4059f0 !important;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(64, 89, 240, 0.24);
}

.flow-footer :deep(.t-button::after) {
  border: 0;
}

.empty-wrap {
  padding-top: 90px;
}
</style>
