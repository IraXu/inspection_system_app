<template>
  <div class="review-page app-page app-page--navbar">
    <t-navbar title="整改审核" left-arrow class="page-navbar" @left-click="goBack" />

    <template v-if="ticket">
      <div class="review-hero">
        <div class="review-hero-head">
          <div class="review-hero-badge">
            <t-icon name="user-time" />
          </div>
          <div class="review-hero-copy">
            <div class="review-hero-topline">
              <h1 class="review-hero-title">{{ ticket.storeName }}</h1>
              <span class="review-hero-time">{{ ticket.rectifiedAt }}</span>
            </div>
            <span class="review-hero-id">{{ ticket.id }}</span>
            <div class="review-chips">
              <span class="chip chip--success">待审核</span>
              <span class="chip chip--issue">问题 {{ ticket.issueCount }} 个</span>
              <span v-if="ticket.sourceType === 'ai'" class="chip chip--ai">AI</span>
            </div>
          </div>
        </div>

        <div class="review-meta">
          <div class="review-meta-item">
            <span class="meta-label">巡检模板</span>
            <span class="meta-value">{{ ticket.templateName }}</span>
          </div>
          <div class="review-meta-item">
            <span class="meta-label">巡检方式</span>
            <span class="meta-value">{{ ticket.method }}</span>
          </div>
          <div class="review-meta-item">
            <span class="meta-label">整改人</span>
            <span class="meta-value">{{ ticket.rectifier }}</span>
          </div>
          <div class="review-meta-item">
            <span class="meta-label">提交人</span>
            <span class="meta-value">{{ ticket.submitter }}</span>
          </div>
        </div>
      </div>

      <section class="app-section review-section">
        <div class="section-head">
          <h2 class="section-title">整改明细</h2>
          <span class="section-pill section-pill--success">
            {{ doneCount }}/{{ ticket.items.length }} 已完善
          </span>
        </div>

        <div class="review-list">
          <div v-for="(item, index) in ticket.items" :key="item.id" class="review-item">
            <div class="review-item-head">
              <span class="review-item-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="review-item-title">{{ item.categoryName }} · {{ item.itemName }}</span>
            </div>

            <div class="review-field">
              <span class="field-label">问题描述</span>
              <p class="field-box">{{ item.problemDesc }}</p>
              <div v-if="item.inspectImages.length" class="thumb-row">
                <div
                  v-for="image in item.inspectImages"
                  :key="image"
                  class="thumb"
                  @click="previewImage(image, '巡检截图')"
                >
                  <img :src="image" alt="" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>

            <div class="review-field">
              <span class="field-label field-label--done"><i class="dot"></i>整改结果</span>
              <p class="field-box field-box--done">{{ item.rectifyDesc || '未填写整改说明' }}</p>
            </div>

            <div v-if="item.rectifyImages.length" class="review-field">
              <span class="field-label">整改截图</span>
              <div class="thumb-row">
                <div
                  v-for="image in item.rectifyImages"
                  :key="image"
                  class="thumb"
                  @click="previewImage(image, '整改截图')"
                >
                  <img :src="image" alt="" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="opinion-card">
          <div class="opinion-head">
            <span class="opinion-title"><em>*</em> 审核意见</span>
            <span class="opinion-note">驳回时必填，通过时自动记录默认意见</span>
          </div>
          <div class="opinion-quick">
            <button
              v-for="text in quickOpinions"
              :key="text"
              type="button"
              class="opinion-chip"
              @click="opinion = text"
            >
              {{ text }}
            </button>
          </div>
          <textarea
            v-model="opinion"
            class="opinion-textarea"
            maxlength="300"
            placeholder="请填写整体审核意见，例如整改是否到位、需补充的材料等"
          ></textarea>
        </div>
      </section>

      <div class="flow-footer">
        <button type="button" class="footer-btn footer-btn--reject" :disabled="submitting" @click="reject">
          驳回整改
        </button>
        <button type="button" class="footer-btn footer-btn--approve" :disabled="submitting" @click="approve">
          审核通过
        </button>
      </div>
    </template>

    <t-empty v-else class="empty-wrap" description="整改单不存在或已完成审核" />

    <PhotoViewer v-model:visible="viewerVisible" :url="viewerUrl" :caption="viewerCaption" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useTodoStore } from '../../stores/todo'
import PhotoViewer from '../../components/PhotoViewer.vue'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()

const ticket = computed(() => todoStore.getTicket(route.params.ticketId))

const opinion = ref('')
const submitting = ref(false)
const viewerVisible = ref(false)
const viewerUrl = ref('')
const viewerCaption = ref('')

const quickOpinions = ['整改到位，审核通过', '照片不清晰，请重新上传', '整改说明不完整，请补充']

const doneCount = computed(
  () =>
    ticket.value?.items.filter(
      (item) => (item.rectifyDesc || '').trim() && item.rectifyImages.length > 0
    ).length || 0
)

const goBack = () => {
  router.back()
}

const previewImage = (url, caption = '') => {
  viewerUrl.value = url
  viewerCaption.value = caption
  viewerVisible.value = true
}

const approve = () => {
  if (!ticket.value || submitting.value) {
    return
  }

  submitting.value = true
  window.setTimeout(() => {
    todoStore.approveTicket(ticket.value.id, opinion.value)
    submitting.value = false
    Toast.success('审核通过，问题单已闭环')
    router.replace({ path: '/todo', query: { tab: 'completed' } })
  }, 500)
}

const reject = () => {
  if (!ticket.value || submitting.value) {
    return
  }

  if (!opinion.value.trim()) {
    Toast.warning('驳回整改须填写审核意见')
    return
  }

  submitting.value = true
  window.setTimeout(() => {
    todoStore.rejectTicket(ticket.value.id, opinion.value)
    submitting.value = false
    Toast.success('已驳回，整改人需重新处理')
    router.replace({ path: '/todo', query: { tab: 'rectify' } })
  }, 500)
}
</script>

<style scoped>
.review-page {
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

.review-hero {
  margin: 12px var(--prototype-page-padding-x) 0;
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.review-hero-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.review-hero-badge {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 12px;
  background: #e9fbf5;
  color: #12a37f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.review-hero-copy {
  flex: 1;
  min-width: 0;
}

.review-hero-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.review-hero-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 600;
  color: #1c1d24;
}

.review-hero-time {
  flex: 0 0 auto;
  padding-top: 2px;
  font-size: 12px;
  color: #9497a2;
  white-space: nowrap;
}

.review-hero-id {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: #8d909b;
}

.review-chips {
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

.chip--success {
  background: #e6f8f1;
  color: #12a37f;
}

.chip--issue {
  background: #ffe9e9;
  color: #e5484d;
}

.chip--ai {
  background: #e8edff;
  color: #4f63e8;
}

.review-meta {
  margin-top: 14px;
  padding: 15px 14px;
  border-radius: 14px;
  background: #f7f7f9;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 12px;
}

.review-meta-item {
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

.review-section {
  padding-top: 20px;
  flex: 1;
}

.section-head {
  padding: 0 2px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #1b1c22;
  letter-spacing: -0.01em;
}

.section-pill {
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
}

.section-pill--success {
  background: #12a37f;
  box-shadow: 0 4px 10px rgba(18, 163, 127, 0.22);
}

.section-pill--warning {
  background: #ef8a17;
  box-shadow: 0 4px 10px rgba(239, 138, 23, 0.24);
}

.review-list {
  display: grid;
  gap: 12px;
}

.review-item {
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.review-item-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.review-item-index {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 8px;
  background: #e9fbf5;
  color: #12a37f;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.review-item-title {
  padding-top: 3px;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 600;
  color: #1c1d24;
}

.review-field {
  margin-top: 14px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #9b9da6;
}

.field-label--done {
  color: #12a37f;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #12a37f;
}

.field-box {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f7f9;
  font-size: 13px;
  line-height: 1.6;
  color: #6b6f7a;
}

.field-box--done {
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

.opinion-card {
  margin-top: 14px;
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.opinion-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.opinion-title {
  font-size: 15px;
  font-weight: 700;
  color: #1b1c22;
}

.opinion-title em {
  font-style: normal;
  color: #e5484d;
  margin-right: 3px;
}

.opinion-note {
  font-size: 11px;
  line-height: 1.5;
  color: #9aa0ac;
  text-align: right;
}

.opinion-quick {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.opinion-chip {
  padding: 7px 11px;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  background: #f7f7f9;
  color: #4c4f58;
  font-size: 12px;
  font-weight: 500;
}

.opinion-chip:active {
  background: #eef0f5;
}

.opinion-textarea {
  margin-top: 10px;
  width: 100%;
  min-height: 86px;
  padding: 11px 12px;
  border: 1px solid #e6e8ee;
  border-radius: 12px;
  background: #fbfbfc;
  font-size: 13px;
  line-height: 1.6;
  color: #2b2c33;
  resize: none;
  outline: none;
  font-family: inherit;
}

.opinion-textarea:focus {
  border-color: rgba(18, 163, 127, 0.5);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(18, 163, 127, 0.08);
}

.opinion-textarea::placeholder {
  color: #a9adb7;
}

.flow-footer {
  position: sticky;
  bottom: 0;
  margin: 12px var(--prototype-page-padding-x) 0;
  padding: 10px 10px calc(10px + var(--prototype-safe-bottom));
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(238, 240, 245, 0.9);
  border-radius: 18px;
  box-shadow: 0 -10px 30px rgba(24, 36, 72, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  z-index: 10;
}

.footer-btn {
  height: 46px;
  border: 0;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
}

.footer-btn--reject {
  background: #fdecec;
  color: #e5484d;
}

.footer-btn--approve {
  background: #178c78;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(23, 140, 120, 0.24);
}

.footer-btn:disabled {
  opacity: 0.6;
}

.empty-wrap {
  padding-top: 90px;
}
</style>
