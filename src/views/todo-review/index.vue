<template>
  <div class="review-page app-page app-page--navbar">
    <t-navbar title="整改审核" left-arrow class="page-navbar" @left-click="goBack" />

    <template v-if="ticket">
      <div class="flow-hero app-card">
        <div class="flow-hero-top">
          <div class="flow-hero-copy">
            <div class="flow-hero-kicker">整改单 · {{ ticket.id }}</div>
            <h1 class="flow-hero-title">{{ ticket.storeName }}</h1>
            <p class="flow-hero-note">整改人 {{ ticket.rectifier }} · 提交于 {{ ticket.rectifiedAt }}</p>
          </div>
          <span class="flow-hero-status">待审核</span>
        </div>

        <div class="flow-hero-stats">
          <div class="flow-hero-stat">
            <span>问题数</span>
            <strong>{{ ticket.issueCount }}</strong>
          </div>
          <div class="flow-hero-stat">
            <span>巡检模板</span>
            <strong>{{ ticket.templateName }}</strong>
          </div>
          <div class="flow-hero-stat">
            <span>审核人</span>
            <strong>{{ ticket.reviewer }}</strong>
          </div>
        </div>
      </div>

      <section class="app-section review-section">
        <div class="review-head">
          <div class="review-head-title">整改结果核对</div>
          <span class="review-head-count">{{ ticket.items.length }} 项</span>
        </div>

        <div class="review-list">
          <div v-for="(item, index) in ticket.items" :key="item.id" class="review-item app-card">
            <div class="review-item-head">
              <span class="review-item-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="review-item-title">{{ item.categoryName }} · {{ item.itemName }}</span>
            </div>

            <div class="review-block">
              <span class="review-label">问题描述</span>
              <p class="review-text">{{ item.problemDesc }}</p>
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

            <div class="review-divider"></div>

            <div class="review-block">
              <span class="review-label review-label--done">
                <t-icon name="check-circle-filled" />
                整改说明
              </span>
              <p class="review-text review-text--done">{{ item.rectifyDesc || '未填写整改说明' }}</p>
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

        <div class="opinion-card app-card">
          <div class="opinion-head">
            <span class="opinion-title"><em>*</em> 审核意见</span>
            <span class="opinion-note">驳回时必填，通过时自动记录默认意见</span>
          </div>
          <textarea
            v-model="opinion"
            class="opinion-textarea"
            maxlength="300"
            placeholder="请填写整体审核意见，例如整改是否到位、需补充的材料等"
          ></textarea>
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
    radial-gradient(circle at top, rgba(22, 163, 74, 0.1), transparent 26%),
    linear-gradient(180deg, #f4fdf8 0%, #f6f8fb 26%, #f5f7fb 100%);
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

.flow-hero {
  margin: 16px;
  padding: 18px;
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.72), transparent 42%),
    linear-gradient(135deg, #e4fbee 0%, #c7f4dc 58%, #a7ebc5 100%);
  box-shadow: 0 18px 36px rgba(36, 140, 88, 0.14);
}

.flow-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.flow-hero-copy {
  min-width: 0;
}

.flow-hero-kicker {
  font-size: 11px;
  font-weight: 700;
  color: rgba(19, 101, 59, 0.66);
  letter-spacing: 0.02em;
}

.flow-hero-title {
  margin: 8px 0 0;
  font-size: 19px;
  line-height: 1.35;
  font-weight: 700;
  color: #14532d;
}

.flow-hero-note {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(20, 83, 45, 0.62);
}

.flow-hero-status {
  flex: 0 0 auto;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.flow-hero-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.flow-hero-stat {
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.48);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-hero-stat span {
  font-size: 10px;
  color: rgba(20, 83, 45, 0.56);
}

.flow-hero-stat strong {
  font-size: 12px;
  color: #14532d;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-section {
  padding-top: 12px;
  flex: 1;
}

.review-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px 10px;
}

.review-head-title {
  font-size: 17px;
  font-weight: 700;
  color: #173153;
}

.review-head-count {
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
  background: rgba(22, 163, 74, 0.1);
  padding: 5px 9px;
  border-radius: 999px;
}

.review-list {
  display: grid;
  gap: 12px;
}

.review-item {
  padding: 14px;
  border-radius: 18px;
}

.review-item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #173153;
}

.review-item-index {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 24px;
}

.review-block {
  margin-top: 12px;
}

.review-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #93a0b2;
  margin-bottom: 6px;
}

.review-label--done {
  color: #15803d;
}

.review-text {
  margin: 0;
  padding: 9px 11px;
  border-radius: 10px;
  background: rgba(247, 250, 254, 0.96);
  font-size: 12px;
  line-height: 1.6;
  color: #3f5877;
}

.review-text--done {
  background: rgba(240, 253, 246, 0.96);
  color: #1f5a3f;
}

.review-divider {
  height: 1px;
  margin: 12px 0 0;
  background: rgba(226, 234, 244, 0.9);
}

.thumb-row {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.thumb {
  width: 78px;
  height: 58px;
  border-radius: 10px;
  overflow: hidden;
  background: #eef3f9;
}

.thumb--done {
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.24);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.opinion-card {
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
}

.opinion-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.opinion-title {
  font-size: 14px;
  font-weight: 700;
  color: #173153;
}

.opinion-title em {
  font-style: normal;
  color: #d54941;
  margin-right: 2px;
}

.opinion-note {
  font-size: 10px;
  color: #9aa7b8;
}

.opinion-textarea {
  margin-top: 10px;
  width: 100%;
  min-height: 82px;
  padding: 10px 12px;
  border: 1px solid rgba(225, 233, 243, 0.96);
  border-radius: 12px;
  background: #fbfdff;
  font-size: 13px;
  line-height: 1.55;
  color: #2f4a68;
  resize: none;
  outline: none;
  font-family: inherit;
}

.opinion-textarea:focus {
  border-color: rgba(22, 163, 74, 0.5);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.09);
}

.opinion-textarea::placeholder {
  color: #a9b4c4;
}

.opinion-quick {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.opinion-chip {
  border: 1px solid rgba(22, 163, 74, 0.24);
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.07);
  color: #15803d;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 10px;
}

.flow-footer {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  padding: 12px var(--prototype-page-padding-x) calc(12px + var(--prototype-safe-bottom));
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  background: rgba(247, 250, 254, 0.94);
  border-top: 1px solid rgba(226, 234, 244, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  z-index: 10;
}

.footer-btn {
  height: 42px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.footer-btn--reject {
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.footer-btn--approve {
  background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
  color: #fff;
  box-shadow: 0 10px 20px rgba(22, 163, 74, 0.22);
}

.footer-btn:disabled {
  opacity: 0.6;
}

.empty-wrap {
  padding-top: 90px;
}
</style>
