<template>
  <div class="inspection-page app-page app-page--navbar">
    <t-navbar title="线下巡检" left-arrow class="page-navbar" @left-click="handleBack">
      <template #right>
        <span class="navbar-code">{{ task?.id || '—' }}</span>
      </template>
    </t-navbar>

    <template v-if="task">
      <div class="inspection-hero app-card">
        <div class="inspection-hero-top">
          <div class="inspection-hero-copy">
            <div class="inspection-hero-kicker">线下巡检任务</div>
            <h1 class="inspection-hero-title">{{ task.storeName }}</h1>
            <p class="inspection-hero-address">{{ task.address }}</p>
          </div>
          <span class="inspection-hero-deadline">{{ task.deadline }}</span>
        </div>

        <div class="inspection-hero-meta">
          <div class="inspection-hero-meta-item">
            <span>巡检模板</span>
            <strong>{{ task.templateName }}</strong>
          </div>
          <div class="inspection-hero-meta-item">
            <span>巡检方式</span>
            <strong>{{ task.method }}</strong>
          </div>
          <div class="inspection-hero-meta-item">
            <span>执行人</span>
            <strong>{{ task.executors.join('、') }}</strong>
          </div>
          <div class="inspection-hero-meta-item">
            <span>关联计划</span>
            <strong>{{ task.planName }}</strong>
          </div>
        </div>
      </div>

      <section class="app-section inspection-section">
        <div class="location-card app-card" :class="`is-${locateStatus}`">
          <div class="location-icon">
            <t-icon :name="locationIcon" />
          </div>
          <div class="location-copy">
            <div class="location-title">{{ locationTitle }}</div>
            <div class="location-desc">{{ locationDesc }}</div>
            <div v-if="distanceText" class="location-distance">{{ distanceText }}</div>
          </div>
          <button
            v-if="locateStatus !== 'locating'"
            type="button"
            class="location-action"
            @click="requestLocation"
          >
            {{ locateStatus === 'inside' ? '重新定位' : '获取定位' }}
          </button>
        </div>

        <button
          v-if="locateStatus === 'denied' || locateStatus === 'outside' || locateStatus === 'unsupported'"
          type="button"
          class="location-demo"
          @click="simulateLocation"
        >
          使用演示定位（模拟进入任务区域）
        </button>
      </section>

      <div class="category-tabs">
        <button
          v-for="category in task.categories"
          :key="category.key"
          type="button"
          class="category-tab"
          :class="{ 'is-active': category.key === activeCategory }"
          @click="activeCategory = category.key"
        >
          {{ category.name }}
          <span>{{ getCategoryDone(category) }}/{{ category.items.length }}</span>
        </button>
      </div>

      <section class="app-section inspection-items">
        <div v-for="(item, index) in activeItems" :key="item.id" class="inspection-item app-card">
          <div class="item-head">
            <div class="item-title">
              <span class="item-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span>{{ item.name }}</span>
            </div>
            <button type="button" class="item-standard" @click="openStandard(item)">
              查看标准
            </button>
          </div>

          <p class="item-standard-text">{{ item.standard }}</p>

          <textarea
            v-model="item.problemDesc"
            class="item-textarea"
            maxlength="200"
            placeholder="发现问题请在此描述，填写后将自动判定为不合格"
            @input="onProblemInput(item)"
          ></textarea>

          <div class="item-shots">
            <div
              v-for="(image, imageIndex) in item.screenshots"
              :key="image"
              class="item-shot"
              @click="previewImage(image, item.name)"
            >
              <img :src="image" alt="" />
              <button type="button" class="item-shot-del" @click.stop="removeShot(item, imageIndex)">
                ×
              </button>
            </div>
            <button type="button" class="item-shot-add" @click="capture(item)">
              <t-icon name="camera" />
              <span>拍照上报</span>
              <em v-if="item.screenshots.length">{{ item.screenshots.length }}/3</em>
            </button>
          </div>

          <div class="item-result">
            <span class="item-result-label">检查结果</span>
            <div class="item-result-toggle">
              <button
                type="button"
                class="result-btn result-btn--pass"
                :class="{ 'is-active': item.result === 'pass' }"
                @click="setResult(item, 'pass')"
              >
                <t-icon name="check-circle" />
                合格
              </button>
              <button
                type="button"
                class="result-btn result-btn--fail"
                :class="{ 'is-active': item.result === 'fail' }"
                @click="setResult(item, 'fail')"
              >
                <t-icon name="error-circle" />
                不合格
              </button>
            </div>
          </div>

          <div v-if="item.result === 'fail' && !item.screenshots.length" class="item-hint">
            不合格项需至少拍照 1 张，作为问题佐证
          </div>
        </div>
      </section>

      <div class="inspection-footer">
        <div class="inspection-progress">
          <div class="inspection-progress-head">
            <span>检查进度</span>
            <strong>{{ judgedCount }}/{{ allItems.length }}</strong>
          </div>
          <div class="inspection-progress-bar">
            <span :style="{ width: `${progressPercent}%` }"></span>
          </div>
        </div>
        <t-button theme="primary" size="medium" :loading="submitting" @click="submitInspection">
          提交巡检
        </t-button>
      </div>

      <input
        ref="photoInput"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden-input"
        @change="onPhotoChange"
      />
    </template>

    <t-empty v-else class="empty-wrap" description="巡检任务不存在或已被删除" />

    <t-popup v-model:visible="standardVisible" placement="bottom">
      <div class="standard-sheet">
        <div class="sheet-head">
          <div>
            <div class="sheet-title">{{ standardItem?.name }}</div>
            <div class="sheet-subtitle">{{ activeCategoryName }} · 巡检标准</div>
          </div>
          <button type="button" class="sheet-close" @click="standardVisible = false">
            <t-icon name="close" />
          </button>
        </div>
        <div class="standard-body">
          <div class="standard-label">标准描述</div>
          <p class="standard-desc">{{ standardItem?.standard }}</p>
          <template v-if="standardItem?.standardImages?.length">
            <div class="standard-label">标准图</div>
            <div class="standard-images">
              <img
                v-for="image in standardItem.standardImages"
                :key="image"
                :src="image"
                alt=""
                @click="previewImage(image, '标准图')"
              />
            </div>
          </template>
        </div>
      </div>
    </t-popup>

    <PhotoViewer v-model:visible="viewerVisible" :url="viewerUrl" :caption="viewerCaption" />

    <div v-if="leaveDialogVisible" class="leave-overlay" @click="leaveDialogVisible = false">
      <div class="leave-dialog app-card" @click.stop>
        <div class="leave-dialog-icon">
          <t-icon name="error-circle-filled" />
        </div>
        <div class="leave-dialog-title">检查结果尚未提交</div>
        <div class="leave-dialog-content">确定要离开吗？已填写的检查内容将不会保存。</div>
        <div class="leave-dialog-actions">
          <button type="button" class="leave-btn leave-btn--ghost" @click="leaveDialogVisible = false">
            继续检查
          </button>
          <button type="button" class="leave-btn leave-btn--danger" @click="confirmLeave">
            确定离开
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useTodoStore } from '../../stores/todo'
import PhotoViewer from '../../components/PhotoViewer.vue'

const route = useRoute()
const router = useRouter()
const todoStore = useTodoStore()

const task = computed(() => todoStore.getTask(route.params.taskId))

const activeCategory = ref(task.value?.categories?.[0]?.key || '')
const submitting = ref(false)
const standardVisible = ref(false)
const standardItem = ref(null)
const viewerVisible = ref(false)
const viewerUrl = ref('')
const viewerCaption = ref('')
const leaveDialogVisible = ref(false)
const photoInput = ref(null)
const activePhotoItem = ref(null)

const locateStatus = ref('idle')
const locatedDistance = ref(null)
const locatedCoords = ref(null)

const currentLocation = computed(() => task.value?.location)

const allItems = computed(() => task.value?.categories?.flatMap((category) => category.items) || [])

const activeItems = computed(
  () => task.value?.categories?.find((category) => category.key === activeCategory.value)?.items || []
)

const activeCategoryName = computed(
  () => task.value?.categories?.find((category) => category.key === activeCategory.value)?.name || ''
)

const judgedCount = computed(() => allItems.value.filter((item) => item.result).length)

const progressPercent = computed(() =>
  allItems.value.length ? Math.round((judgedCount.value / allItems.value.length) * 100) : 0
)

const hasInput = computed(() =>
  allItems.value.some(
    (item) => (item.problemDesc || '').trim() || item.screenshots.length > 0 || item.result === 'fail'
  )
)

const locationIcon = computed(() => (locateStatus.value === 'locating' ? 'time' : 'location'))

const locationTitle = computed(() => {
  const map = {
    idle: '等待获取定位',
    locating: '正在获取定位…',
    inside: '已进入任务区域',
    outside: '当前位置不在任务区域',
    denied: '未获得定位权限',
    unsupported: '当前环境不支持定位'
  }
  return map[locateStatus.value] || '等待获取定位'
})

const locationDesc = computed(() => {
  const radius = currentLocation.value?.radius || 0
  if (locateStatus.value === 'inside') {
    return `已通过定位校验，可在任务区域内开始巡检（允许范围 ${radius} 米）`
  }
  if (locateStatus.value === 'outside') {
    return `请到达任务区域后再执行巡检（允许范围 ${radius} 米）`
  }
  if (locateStatus.value === 'denied') {
    return '请在系统设置中允许访问位置信息，或使用下方演示定位继续体验'
  }
  if (locateStatus.value === 'unsupported') {
    return '当前浏览器不支持定位，可使用下方演示定位继续体验'
  }
  if (locateStatus.value === 'locating') {
    return '正在校验是否处于任务区域范围内'
  }
  return '开始巡检前需获取定位权限，用于判断是否在任务区域内'
})

const distanceText = computed(() => {
  if (locateStatus.value !== 'inside' && locateStatus.value !== 'outside') {
    return ''
  }
  if (locatedDistance.value === null) {
    return ''
  }
  const coords = locatedCoords.value
  const coordText = coords ? ` · 当前坐标 ${coords.lng.toFixed(4)}, ${coords.lat.toFixed(4)}` : ''
  return `距离任务中心 ${locatedDistance.value} 米${coordText}`
})

const getCategoryDone = (category) => category.items.filter((item) => item.result).length

const toRadians = (value) => (value * Math.PI) / 180

const calcDistance = (lat1, lng1, lat2, lng2) => {
  const earthRadius = 6371000
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const requestLocation = () => {
  if (!currentLocation.value) {
    locateStatus.value = 'unsupported'
    return
  }

  if (!navigator.geolocation) {
    locateStatus.value = 'unsupported'
    return
  }

  locateStatus.value = 'locating'
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = {
        lng: position.coords.longitude,
        lat: position.coords.latitude
      }
      locatedCoords.value = coords
      const distance = Math.round(
        calcDistance(coords.lat, coords.lng, currentLocation.value.lat, currentLocation.value.lng)
      )
      locatedDistance.value = distance
      locateStatus.value = distance <= currentLocation.value.radius ? 'inside' : 'outside'
      if (locateStatus.value === 'inside') {
        Toast.success('定位校验通过，已进入任务区域')
      }
    },
    () => {
      locateStatus.value = 'denied'
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  )
}

const simulateLocation = () => {
  if (!currentLocation.value) {
    return
  }
  locatedCoords.value = { lng: currentLocation.value.lng, lat: currentLocation.value.lat }
  locatedDistance.value = 8
  locateStatus.value = 'inside'
  Toast.success('已模拟进入任务区域')
}

const ensureLocated = () => {
  if (locateStatus.value === 'inside') {
    return true
  }
  if (locateStatus.value === 'locating') {
    Toast.warning('正在获取定位，请稍候')
    return false
  }
  Toast.warning('请先完成定位校验，确认处于任务区域内')
  return false
}

const onProblemInput = (item) => {
  if ((item.problemDesc || '').trim()) {
    item.result = 'fail'
  }
}

const setResult = (item, result) => {
  item.result = result
  if (result === 'pass') {
    if (item.screenshots.length) {
      Toast.info('合格项无需拍照，已自动清除')
    }
    item.screenshots = []
    item.problemDesc = ''
  }
}

const capture = (item) => {
  if (!ensureLocated()) {
    return
  }
  if (item.screenshots.length >= 3) {
    Toast.warning('每个检查项最多上传 3 张照片')
    return
  }
  activePhotoItem.value = item
  photoInput.value?.click()
}

const onPhotoChange = (event) => {
  const file = event.target.files?.[0]
  const item = activePhotoItem.value

  if (file && item) {
    item.screenshots.push(URL.createObjectURL(file))
    item.result = 'fail'
    Toast.success(`已拍照 ${item.screenshots.length}/3`)
  }

  event.target.value = ''
  activePhotoItem.value = null
}

const removeShot = (item, index) => {
  item.screenshots.splice(index, 1)
}

const previewImage = (url, caption = '') => {
  viewerUrl.value = url
  viewerCaption.value = caption
  viewerVisible.value = true
}

const openStandard = (item) => {
  standardItem.value = item
  standardVisible.value = true
}

const handleBack = () => {
  if (hasInput.value) {
    leaveDialogVisible.value = true
    return
  }
  router.back()
}

const confirmLeave = () => {
  leaveDialogVisible.value = false
  router.back()
}

const submitInspection = () => {
  if (!task.value || submitting.value) {
    return
  }

  if (!ensureLocated()) {
    return
  }

  if (judgedCount.value < allItems.value.length) {
    Toast.warning('请完成所有检查项的判定后再提交')
    return
  }

  const failedItems = allItems.value.filter((item) => item.result === 'fail')
  if (failedItems.some((item) => item.screenshots.length === 0)) {
    Toast.warning('不合格项请至少拍照 1 张')
    return
  }

  submitting.value = true
  const results = allItems.value.map((item) => ({
    id: item.id,
    categoryKey: task.value.categories.find((category) => category.items.includes(item))?.key,
    categoryName: task.value.categories.find((category) => category.items.includes(item))?.name,
    itemName: item.name,
    standard: item.standard,
    problemDesc: item.problemDesc.trim() || '现场检查发现异常',
    result: item.result,
    screenshots: [...item.screenshots]
  }))

  window.setTimeout(() => {
    todoStore.submitInspection(task.value.id, results)
    submitting.value = false
    if (failedItems.length) {
      Toast.success(`巡检已提交，生成 ${failedItems.length} 条整改问题`)
      router.replace({ path: '/todo', query: { tab: 'rectify' } })
    } else {
      Toast.success('巡检提交成功，本次全部合格')
      router.replace({ path: '/todo', query: { tab: 'completed' } })
    }
  }, 700)
}

onMounted(() => {
  requestLocation()
})
</script>

<style scoped>
.inspection-page {
  min-height: 100%;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top, rgba(var(--theme-primary-rgb), 0.1), transparent 28%),
    linear-gradient(180deg, #eff8ff 0%, #f5f7fb 28%, #f5f7fb 100%);
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

.navbar-code {
  font-size: 11px;
  font-weight: 600;
  color: #56708f;
  background: rgba(236, 241, 248, 0.96);
  padding: 4px 8px;
  border-radius: 8px;
}

.inspection-hero {
  margin: 16px;
  padding: 18px;
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.7), transparent 42%),
    linear-gradient(135deg, #dff3ff 0%, #bfe6ff 58%, #a7d8f2 100%);
  box-shadow: 0 18px 36px rgba(87, 136, 171, 0.16);
}

.inspection-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.inspection-hero-copy {
  min-width: 0;
}

.inspection-hero-kicker {
  font-size: 11px;
  font-weight: 700;
  color: rgba(23, 49, 83, 0.62);
  letter-spacing: 0.04em;
}

.inspection-hero-title {
  margin: 8px 0 0;
  font-size: 19px;
  line-height: 1.35;
  font-weight: 700;
  color: #173153;
}

.inspection-hero-address {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(23, 49, 83, 0.62);
}

.inspection-hero-deadline {
  flex: 0 0 auto;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  color: #1f5a7b;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.inspection-hero-meta {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.inspection-hero-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.46);
}

.inspection-hero-meta-item span {
  font-size: 10px;
  color: rgba(23, 49, 83, 0.56);
}

.inspection-hero-meta-item strong {
  font-size: 12px;
  color: #173153;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspection-section {
  padding-top: 2px;
}

.location-card {
  padding: 14px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(228, 235, 244, 0.96);
}

.location-card.is-inside {
  border-color: rgba(22, 163, 74, 0.26);
  background: rgba(240, 253, 246, 0.96);
}

.location-card.is-outside,
.location-card.is-denied {
  border-color: rgba(213, 73, 65, 0.24);
  background: rgba(255, 246, 245, 0.96);
}

.location-icon {
  width: 40px;
  height: 40px;
  border-radius: 13px;
  background: rgba(var(--theme-primary-rgb), 0.12);
  color: var(--theme-primary-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex: 0 0 40px;
}

.location-card.is-inside .location-icon {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}

.location-card.is-outside .location-icon,
.location-card.is-denied .location-icon {
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.location-copy {
  flex: 1;
  min-width: 0;
}

.location-title {
  font-size: 14px;
  font-weight: 700;
  color: #173153;
}

.location-card.is-inside .location-title {
  color: #14532d;
}

.location-card.is-outside .location-title,
.location-card.is-denied .location-title {
  color: #b9382f;
}

.location-desc {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.5;
  color: #7a8ba0;
}

.location-distance {
  margin-top: 4px;
  font-size: 10px;
  color: #93a0b2;
  word-break: break-all;
}

.location-action {
  flex: 0 0 auto;
  height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: rgba(var(--theme-primary-rgb), 0.12);
  color: var(--theme-primary-strong);
  font-size: 11px;
  font-weight: 700;
}

.location-demo {
  margin-top: 10px;
  width: 100%;
  height: 34px;
  border: 1px dashed rgba(var(--theme-primary-rgb), 0.5);
  border-radius: 12px;
  background: rgba(var(--theme-primary-rgb), 0.05);
  color: var(--theme-primary-strong);
  font-size: 12px;
  font-weight: 600;
}

.category-tabs {
  margin-top: 14px;
  padding: 0 var(--prototype-page-padding-x);
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  flex: 0 0 auto;
  height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(224, 232, 242, 0.96);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.86);
  color: #6b7c92;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.category-tab span {
  font-size: 10px;
  color: #9aa7b8;
}

.category-tab.is-active {
  border-color: transparent;
  background: linear-gradient(135deg, #bfe6ff 0%, #97d2f2 100%);
  color: #173153;
  box-shadow: 0 8px 18px rgba(var(--theme-primary-rgb), 0.18);
}

.category-tab.is-active span {
  color: #2d6383;
}

.inspection-items {
  margin-top: 12px;
  display: grid;
  gap: 12px;
  flex: 1;
}

.inspection-item {
  padding: 14px;
  border-radius: 18px;
}

.item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 15px;
  font-weight: 700;
  color: #173153;
}

.item-index {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(var(--theme-primary-rgb), 0.12);
  color: var(--theme-primary-strong);
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 24px;
}

.item-standard {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: var(--theme-primary-strong);
  font-size: 12px;
  font-weight: 600;
  padding: 4px;
}

.item-standard-text {
  margin: 10px 0 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(246, 250, 254, 0.96);
  font-size: 11px;
  line-height: 1.6;
  color: #7a8ba0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-textarea {
  margin-top: 10px;
  width: 100%;
  min-height: 62px;
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

.item-textarea:focus {
  border-color: rgba(var(--theme-primary-rgb), 0.6);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(var(--theme-primary-rgb), 0.1);
}

.item-textarea::placeholder {
  color: #a9b4c4;
}

.item-shots {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.item-shot {
  position: relative;
  width: 78px;
  height: 62px;
  border-radius: 10px;
  overflow: hidden;
  background: #eef3f9;
}

.item-shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-shot-del {
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

.item-shot-add {
  width: 78px;
  height: 62px;
  border: 1px dashed rgba(var(--theme-primary-rgb), 0.5);
  border-radius: 10px;
  background: rgba(var(--theme-primary-rgb), 0.06);
  color: var(--theme-primary-strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
}

.item-shot-add em {
  font-style: normal;
  font-size: 9px;
  color: #7a8ba0;
}

.item-result {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(226, 234, 244, 0.96);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.item-result-label {
  font-size: 12px;
  color: #7a8ba0;
  font-weight: 600;
}

.item-result-toggle {
  display: flex;
  gap: 8px;
}

.result-btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(224, 232, 242, 0.96);
  border-radius: 999px;
  background: #fff;
  color: #7a8ba0;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.result-btn--pass.is-active {
  border-color: rgba(22, 163, 74, 0.4);
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}

.result-btn--fail.is-active {
  border-color: rgba(213, 73, 65, 0.4);
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.item-hint {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(213, 73, 65, 0.07);
  color: #b9382f;
  font-size: 11px;
  line-height: 1.5;
}

.inspection-footer {
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

.inspection-progress {
  flex: 1;
  min-width: 0;
}

.inspection-progress-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #7a8ba0;
}

.inspection-progress-head strong {
  color: #173153;
  font-size: 12px;
}

.inspection-progress-bar {
  margin-top: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(203, 215, 230, 0.5);
  overflow: hidden;
}

.inspection-progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--theme-primary) 0%, var(--theme-primary-strong) 100%);
  transition: width 0.3s ease;
}

.inspection-footer :deep(.t-button) {
  min-width: 118px;
}

.hidden-input {
  display: none;
}

.standard-sheet {
  padding: 18px 16px calc(20px + var(--prototype-safe-bottom));
  background: #fff;
  border-radius: 22px 22px 0 0;
}

.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.sheet-title {
  font-size: 17px;
  font-weight: 700;
  color: #173153;
}

.sheet-subtitle {
  margin-top: 4px;
  font-size: 11px;
  color: #93a0b2;
}

.sheet-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: rgba(240, 244, 250, 0.96);
  color: #7a8ba0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.standard-body {
  margin-top: 14px;
}

.standard-label {
  font-size: 12px;
  font-weight: 700;
  color: #56708f;
  margin-bottom: 6px;
}

.standard-desc {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.7;
  color: #3f5877;
}

.standard-images {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.standard-images img {
  width: 120px;
  height: 90px;
  border-radius: 12px;
  object-fit: cover;
  background: #eef3f9;
}

.empty-wrap {
  padding-top: 90px;
}

.leave-overlay {
  position: fixed;
  left: var(--preview-overlay-left, 0);
  top: var(--preview-overlay-top, 0);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100vh);
  z-index: 1600;
  background: rgba(13, 23, 43, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.leave-dialog {
  width: 100%;
  max-width: 320px;
  padding: 22px 20px 18px;
  text-align: center;
}

.leave-dialog-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 18px;
  background: rgba(217, 119, 6, 0.12);
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.leave-dialog-title {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 700;
  color: #173153;
}

.leave-dialog-content {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #6f8199;
}

.leave-dialog-actions {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.leave-btn {
  height: 42px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.leave-btn--ghost {
  background: rgba(239, 244, 251, 0.96);
  color: #59718f;
}

.leave-btn--danger {
  background: #d54941;
  color: #fff;
}
</style>
