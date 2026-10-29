<template>
  <div class="rectify-page app-page app-page--navbar">
    <t-navbar title="整改处理" left-arrow class="page-navbar" @left-click="goBack" />

    <template v-if="ticket">
      <div class="flow-hero app-card">
        <div class="flow-hero-top">
          <div class="flow-hero-copy">
            <div class="flow-hero-kicker">整改单 · {{ ticket.id }}</div>
            <h1 class="flow-hero-title">{{ ticket.storeName }}</h1>
            <p class="flow-hero-note">
              提交人 {{ ticket.submitter }} · 生成于 {{ ticket.createdAt }}
            </p>
          </div>
          <span class="flow-hero-status">待整改</span>
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
            <span>整改人</span>
            <strong>{{ ticket.rectifier }}</strong>
          </div>
        </div>
      </div>

      <div v-if="ticket.rejectReason" class="reject-banner app-card">
        <t-icon name="error-circle-filled" class="reject-icon" />
        <div class="reject-copy">
          <span class="reject-label">上次审核驳回原因</span>
          <span class="reject-text">{{ ticket.rejectReason }}</span>
        </div>
      </div>

      <section class="app-section rectify-section">
        <div class="rectify-head">
          <div class="rectify-head-title">整改明细</div>
          <span class="rectify-head-count">{{ doneCount }}/{{ ticket.items.length }} 已完善</span>
        </div>

        <div class="rectify-list">
          <div v-for="(item, index) in ticket.items" :key="item.id" class="rectify-item app-card">
            <div class="rectify-item-head">
              <div class="rectify-item-title">
                <span class="rectify-item-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <span>{{ item.categoryName }} · {{ item.itemName }}</span>
              </div>
              <span class="rectify-item-state" :class="{ 'is-done': isItemDone(item) }">
                {{ isItemDone(item) ? '已整改' : '待整改' }}
              </span>
            </div>

            <div class="rectify-block">
              <span class="block-label">问题描述</span>
              <p class="block-text">{{ item.problemDesc }}</p>
            </div>

            <div v-if="item.inspectImages.length" class="rectify-block">
              <span class="block-label">巡检截图</span>
              <div class="thumb-row">
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

            <div class="rectify-field">
              <span class="rectify-field-label"><em>*</em> 整改说明</span>
              <textarea
                v-model="item.rectifyDesc"
                class="rectify-textarea"
                maxlength="500"
                placeholder="请填写该问题的整改措施与完成情况"
              ></textarea>
            </div>

            <div class="rectify-field">
              <span class="rectify-field-label"><em>*</em> 整改截图</span>
              <div class="upload-grid">
                <div
                  v-for="(image, imageIndex) in item.rectifyImages"
                  :key="image"
                  class="upload-thumb"
                  @click="previewImage(image, '整改截图')"
                >
                  <img :src="image" alt="" />
                  <button type="button" class="upload-del" @click.stop="removeImage(item, imageIndex)">
                    ×
                  </button>
                </div>
                <button type="button" class="upload-add" @click="triggerUpload(item)">
                  <t-icon name="add" />
                  <span>本地上传</span>
                </button>
                <button type="button" class="upload-add upload-add--sample" @click="addSample(item)">
                  <t-icon name="camera" />
                  <span>模拟拍照</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="flow-footer">
        <div class="flow-footer-info">
          <span>整改进度</span>
          <div class="flow-footer-bar">
            <span :style="{ width: `${progressPercent}%` }"></span>
          </div>
        </div>
        <t-button theme="primary" size="medium" :loading="submitting" @click="submit">
          提交整改
        </t-button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden-input"
        @change="onFilesChange"
      />
    </template>

    <t-empty v-else class="empty-wrap" description="整改单不存在或已处理完成" />

    <PhotoViewer v-model:visible="viewerVisible" :url="viewerUrl" :caption="viewerCaption" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useTodoStore } from '../../stores/todo'
import { buildRectifySampleUrl } from '../../utils/media'
import PhotoViewer from '../../components/PhotoViewer.vue'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()

const ticket = computed(() => todoStore.getTicket(route.params.ticketId))

const submitting = ref(false)
const viewerVisible = ref(false)
const viewerUrl = ref('')
const viewerCaption = ref('')
const fileInput = ref(null)
const activeItem = ref(null)

const isItemDone = (item) => Boolean((item.rectifyDesc || '').trim() && item.rectifyImages.length)

const doneCount = computed(() => ticket.value?.items.filter(isItemDone).length || 0)

const progressPercent = computed(() => {
  if (!ticket.value?.items.length) return 0
  return Math.round((doneCount.value / ticket.value.items.length) * 100)
})

const goBack = () => {
  router.back()
}

const previewImage = (url, caption = '') => {
  viewerUrl.value = url
  viewerCaption.value = caption
  viewerVisible.value = true
}

const triggerUpload = (item) => {
  if (item.rectifyImages.length >= 6) {
    Toast.warning('每项最多上传 6 张整改截图')
    return
  }
  activeItem.value = item
  fileInput.value?.click()
}

const onFilesChange = (event) => {
  const files = Array.from(event.target.files || [])
  const item = activeItem.value

  if (item && files.length) {
    files.slice(0, 6 - item.rectifyImages.length).forEach((file) => {
      item.rectifyImages.push(URL.createObjectURL(file))
    })
    Toast.success('整改截图已添加')
  }

  event.target.value = ''
  activeItem.value = null
}

const addSample = (item) => {
  if (item.rectifyImages.length >= 6) {
    Toast.warning('每项最多上传 6 张整改截图')
    return
  }
  item.rectifyImages.push(buildRectifySampleUrl(item.itemName))
  Toast.success('已添加现场整改照片')
}

const removeImage = (item, index) => {
  item.rectifyImages.splice(index, 1)
}

const submit = () => {
  if (!ticket.value || submitting.value) {
    return
  }

  const missingDesc = ticket.value.items.some((item) => !(item.rectifyDesc || '').trim())
  if (missingDesc) {
    Toast.warning('请完成所有检查项的整改说明')
    return
  }

  const missingImage = ticket.value.items.some((item) => item.rectifyImages.length === 0)
  if (missingImage) {
    Toast.warning('请为每个检查项上传整改截图')
    return
  }

  submitting.value = true
  const payload = ticket.value.items.map((item) => ({
    id: item.id,
    rectifyDesc: item.rectifyDesc.trim(),
    rectifyImages: [...item.rectifyImages]
  }))

  window.setTimeout(() => {
    todoStore.submitRectify(ticket.value.id, payload)
    submitting.value = false
    Toast.success('整改已提交，等待审核')
    router.replace({ path: '/todo', query: { tab: 'review' } })
  }, 600)
}
</script>

<style scoped>
.rectify-page {
  min-height: 100%;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top, rgba(217, 119, 6, 0.1), transparent 26%),
    linear-gradient(180deg, #fffaf2 0%, #f6f8fb 26%, #f5f7fb 100%);
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
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.7), transparent 42%),
    linear-gradient(135deg, #fff3dd 0%, #ffe4bb 58%, #fcd9a4 100%);
  box-shadow: 0 18px 36px rgba(185, 130, 42, 0.14);
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
  color: rgba(120, 78, 20, 0.66);
  letter-spacing: 0.02em;
}

.flow-hero-title {
  margin: 8px 0 0;
  font-size: 19px;
  line-height: 1.35;
  font-weight: 700;
  color: #7a4a12;
}

.flow-hero-note {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(122, 74, 18, 0.62);
}

.flow-hero-status {
  flex: 0 0 auto;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: #b45309;
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
  background: rgba(255, 255, 255, 0.46);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-hero-stat span {
  font-size: 10px;
  color: rgba(122, 74, 18, 0.56);
}

.flow-hero-stat strong {
  font-size: 12px;
  color: #7a4a12;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reject-banner {
  margin: 0 16px 4px;
  padding: 12px;
  border-radius: 16px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: rgba(255, 245, 244, 0.96);
  border: 1px solid rgba(213, 73, 65, 0.2);
  box-shadow: 0 10px 22px rgba(185, 56, 47, 0.07);
}

.reject-icon {
  color: #d54941;
  font-size: 16px;
  margin-top: 1px;
  flex: 0 0 16px;
}

.reject-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.reject-label {
  font-size: 11px;
  font-weight: 700;
  color: #b9382f;
}

.reject-text {
  font-size: 12px;
  line-height: 1.6;
  color: #a34a45;
}

.rectify-section {
  padding-top: 14px;
  flex: 1;
}

.rectify-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px 10px;
}

.rectify-head-title {
  font-size: 17px;
  font-weight: 700;
  color: #173153;
}

.rectify-head-count {
  font-size: 11px;
  font-weight: 600;
  color: #b45309;
  background: rgba(217, 119, 6, 0.1);
  padding: 5px 9px;
  border-radius: 999px;
}

.rectify-list {
  display: grid;
  gap: 12px;
}

.rectify-item {
  padding: 14px;
  border-radius: 18px;
}

.rectify-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.rectify-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: #173153;
}

.rectify-item-index {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(217, 119, 6, 0.12);
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 24px;
}

.rectify-item-state {
  flex: 0 0 auto;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(217, 119, 6, 0.1);
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
}

.rectify-item-state.is-done {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.rectify-block {
  margin-top: 12px;
}

.block-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #93a0b2;
  margin-bottom: 6px;
}

.block-text {
  margin: 0;
  padding: 9px 11px;
  border-radius: 10px;
  background: rgba(247, 250, 254, 0.96);
  font-size: 12px;
  line-height: 1.6;
  color: #3f5877;
}

.thumb-row {
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

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rectify-field {
  margin-top: 14px;
}

.rectify-field-label {
  display: block;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 700;
  color: #43607f;
}

.rectify-field-label em {
  font-style: normal;
  color: #d54941;
  margin-right: 2px;
}

.rectify-textarea {
  width: 100%;
  min-height: 70px;
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

.rectify-textarea:focus {
  border-color: rgba(217, 119, 6, 0.55);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.09);
}

.rectify-textarea::placeholder {
  color: #a9b4c4;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-thumb {
  position: relative;
  width: 72px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  background: #eef3f9;
}

.upload-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.62);
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

.upload-add {
  width: 72px;
  height: 56px;
  border: 1px dashed rgba(148, 163, 184, 0.6);
  border-radius: 10px;
  background: rgba(247, 250, 254, 0.96);
  color: #7a8ba0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
}

.upload-add--sample {
  border-color: rgba(217, 119, 6, 0.45);
  background: rgba(217, 119, 6, 0.06);
  color: #b45309;
}

.hidden-input {
  display: none;
}

.flow-footer {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  padding: 12px var(--prototype-page-padding-x) calc(12px + var(--prototype-safe-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(247, 250, 254, 0.94);
  border-top: 1px solid rgba(226, 234, 244, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  z-index: 10;
}

.flow-footer-info {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: #7a8ba0;
}

.flow-footer-bar {
  margin-top: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(203, 215, 230, 0.5);
  overflow: hidden;
}

.flow-footer-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #fbbf24 0%, #d97706 100%);
  transition: width 0.3s ease;
}

.flow-footer :deep(.t-button) {
  min-width: 118px;
}

.empty-wrap {
  padding-top: 90px;
}
</style>
