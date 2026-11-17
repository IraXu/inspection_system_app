<template>
  <div class="rectify-page app-page app-page--navbar">
    <t-navbar title="整改处理" left-arrow class="page-navbar" @left-click="goBack" />

    <template v-if="ticket">
      <div class="rectify-hero">
        <div class="rectify-hero-head">
          <div class="rectify-hero-badge">
            <t-icon name="tools" />
          </div>
          <div class="rectify-hero-copy">
            <div class="rectify-hero-topline">
              <h1 class="rectify-hero-title">{{ ticket.storeName }}</h1>
              <span class="rectify-hero-time">{{ ticket.createdAt }}</span>
            </div>
            <span class="rectify-hero-id">{{ ticket.id }}</span>
            <div class="rectify-chips">
              <span class="chip chip--warning">驳回待整改</span>
              <span class="chip chip--issue">问题 {{ ticket.issueCount }} 个</span>
              <span v-if="ticket.sourceType === 'ai'" class="chip chip--ai">AI</span>
            </div>
          </div>
        </div>

        <div class="rectify-meta">
          <div class="rectify-meta-item">
            <span class="meta-label">巡检模板</span>
            <span class="meta-value">{{ ticket.templateName }}</span>
          </div>
          <div class="rectify-meta-item">
            <span class="meta-label">巡检方式</span>
            <span class="meta-value">{{ ticket.method }}</span>
          </div>
          <div class="rectify-meta-item">
            <span class="meta-label">整改人</span>
            <span class="meta-value">{{ ticket.rectifier }}</span>
          </div>
          <div class="rectify-meta-item">
            <span class="meta-label">提交人</span>
            <span class="meta-value">{{ ticket.submitter }}</span>
          </div>
        </div>
      </div>

      <div v-if="ticket.rejectReason" class="reject-banner">
        <div class="reject-label">上次审核驳回原因</div>
        <p class="reject-text">{{ ticket.rejectReason }}</p>
      </div>

      <section class="app-section rectify-section">
        <div class="rectify-head">
          <h2 class="rectify-head-title">整改明细</h2>
          <span class="rectify-head-count">{{ doneCount }}/{{ ticket.items.length }} 已完善</span>
        </div>

        <div class="rectify-list">
          <div v-for="(item, index) in ticket.items" :key="item.id" class="rectify-item">
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
                  <span>拍照</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="flow-footer">
        <div class="flow-footer-info">
          <div class="flow-footer-head">
            <span>整改进度</span>
            <strong>{{ doneCount }}/{{ ticket.items.length }}</strong>
          </div>
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

.rectify-hero {
  margin: 12px var(--prototype-page-padding-x) 0;
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.rectify-hero-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.rectify-hero-badge {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 12px;
  background: #fff3e6;
  color: #e08a2e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.rectify-hero-copy {
  flex: 1;
  min-width: 0;
}

.rectify-hero-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.rectify-hero-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 600;
  color: #1c1d24;
}

.rectify-hero-time {
  flex: 0 0 auto;
  padding-top: 2px;
  font-size: 12px;
  color: #9497a2;
  white-space: nowrap;
}

.rectify-hero-id {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: #8d909b;
}

.rectify-chips {
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

.chip--warning {
  background: #fff2e2;
  color: #e08c2e;
}

.chip--issue {
  background: #ffe9e9;
  color: #e5484d;
}

.chip--ai {
  background: #e8edff;
  color: #4f63e8;
}

.rectify-meta {
  margin-top: 14px;
  padding: 15px 14px;
  border-radius: 14px;
  background: #f7f7f9;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 12px;
}

.rectify-meta-item {
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

.reject-banner {
  margin: 12px var(--prototype-page-padding-x) 0;
  padding: 13px 14px;
  border-radius: 12px;
  background: #fdf0f0;
}

.reject-label {
  font-size: 13px;
  font-weight: 700;
  color: #e5484d;
}

.reject-text {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #e5484d;
}

.rectify-section {
  padding-top: 20px;
  flex: 1;
}

.rectify-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px 12px;
}

.rectify-head-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #1b1c22;
  letter-spacing: -0.01em;
}

.rectify-head-count {
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: #ef8a17;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(239, 138, 23, 0.24);
}

.rectify-list {
  display: grid;
  gap: 12px;
}

.rectify-item {
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
}

.rectify-item-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.rectify-item-title {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  min-width: 0;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 600;
  color: #1c1d24;
}

.rectify-item-index {
  width: 26px;
  height: 26px;
  margin-top: 0;
  border-radius: 8px;
  background: #fff3e6;
  color: #e08a2e;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 26px;
}

.rectify-item-state {
  flex: 0 0 auto;
  padding-top: 4px;
  background: transparent;
  color: #e08c2e;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.rectify-item-state.is-done {
  background: transparent;
  color: #12a37f;
}

.rectify-block {
  margin-top: 14px;
}

.block-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #9b9da6;
  margin-bottom: 7px;
}

.block-text {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f7f9;
  font-size: 13px;
  line-height: 1.6;
  color: #6b6f7a;
}

.thumb-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
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

.rectify-field {
  margin-top: 16px;
}

.rectify-field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #9b9da6;
}

.rectify-field-label em {
  font-style: normal;
  color: #e5484d;
  margin-right: 2px;
}

.rectify-textarea {
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

.rectify-textarea:focus {
  border-color: rgba(239, 138, 23, 0.55);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(239, 138, 23, 0.09);
}

.rectify-textarea::placeholder {
  color: #a9adb7;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.upload-thumb {
  position: relative;
  width: 84px;
  height: 64px;
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
  top: 3px;
  right: 3px;
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
  width: 84px;
  height: 64px;
  border: 1px dashed #f0cfa6;
  border-radius: 10px;
  background: #fff8ef;
  color: #e08a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
}

.upload-add--sample {
  border-color: #f0cfa6;
  background: #fff8ef;
  color: #e08a2e;
}

.hidden-input {
  display: none;
}

.flow-footer {
  position: sticky;
  bottom: 0;
  margin: 12px var(--prototype-page-padding-x) 0;
  padding: 12px 14px calc(10px + var(--prototype-safe-bottom));
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(238, 240, 245, 0.9);
  border-radius: 18px;
  box-shadow: 0 -10px 30px rgba(24, 36, 72, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  z-index: 10;
}

.flow-footer-info {
  flex: 1;
  min-width: 0;
}

.flow-footer-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8b8e99;
}

.flow-footer-head strong {
  font-size: 14px;
  font-weight: 700;
  color: #1b1c22;
  font-variant-numeric: tabular-nums;
}

.flow-footer-bar {
  margin-top: 7px;
  height: 5px;
  border-radius: 999px;
  background: #eef0f4;
  overflow: hidden;
}

.flow-footer-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #ef8a17;
  transition: width 0.3s ease;
}

.flow-footer :deep(.t-button) {
  min-width: 132px;
  height: 46px;
  border: 0;
  border-radius: 999px;
  background: #ef8a17 !important;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(239, 138, 23, 0.26);
}

.flow-footer :deep(.t-button::after) {
  border: 0;
}

.empty-wrap {
  padding-top: 90px;
}
</style>
