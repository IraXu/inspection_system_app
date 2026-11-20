<template>
  <div class="gallery-page" :class="{ 'is-managing': selectMode }">
    <header class="gallery-nav">
      <button type="button" class="nav-back" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" />
      </button>
      <h1 class="nav-title">图库管理</h1>
      <button type="button" class="nav-action" @click="toggleSelectMode">
        {{ selectMode ? '取消' : '管理' }}
      </button>
    </header>

    <div class="gallery-tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        type="button"
        class="gallery-tab"
        :class="{ active: activeFilter === tab.value }"
        @click="activeFilter = tab.value"
      >
        {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <p class="gallery-meta">
      共 {{ totalCount }} 项内容 · 按拍摄时间自动归档
    </p>

    <div class="gallery-body">
      <div v-if="!groups.length" class="gallery-empty">
        <t-icon name="image" size="46px" />
        <p>{{ activeFilter === 'video' ? '暂无可回放的视频' : activeFilter === 'photo' ? '暂无拍摄的照片' : '图库还没有内容' }}</p>
        <span>在设备实时画面中录制或拍照后，会出现在这里</span>
      </div>

      <section v-for="group in groups" :key="group.key" class="gallery-group">
        <div class="group-head">
          <h3>{{ group.label }}</h3>
          <span>{{ group.items.length }} 项</span>
        </div>

        <div class="media-grid">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="media-card"
            :class="{ selected: isSelected(item.id) }"
            @click="onCardClick(item)"
          >
            <div class="media-thumb">
              <img :src="item.url" alt="" loading="lazy" decoding="async" />

              <span v-if="item.type === 'video'" class="media-duration">{{ formatDuration(item.duration) }}</span>

              <span v-if="item.type === 'video'" class="media-play">
                <t-icon name="play-circle-filled" size="22px" />
              </span>

              <span v-if="selectMode" class="media-check" :class="{ checked: isSelected(item.id) }">
                <t-icon v-if="isSelected(item.id)" name="check" />
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>

    <transition name="select-bar">
      <div v-if="selectMode" class="select-bar">
        <button type="button" class="select-all" @click="toggleSelectAll">
          <span class="select-all-check" :class="{ checked: allSelected }">
            <t-icon v-if="allSelected" name="check" />
          </span>
          全选
        </button>
        <button
          type="button"
          class="select-delete"
          :disabled="!selectedIds.length"
          @click="removeSelected"
        >
          删除{{ selectedIds.length ? ` (${selectedIds.length})` : '' }}
        </button>
      </div>
    </transition>

    <transition name="viewer">
      <div v-if="activeItem" class="media-viewer" @click.self="closeViewer">
        <div class="viewer-topbar">
          <button type="button" class="viewer-icon-btn" aria-label="关闭" @click="closeViewer">
            <t-icon name="close" size="20px" />
          </button>
          <span class="viewer-chip">{{ activeItem.type === 'video' ? '视频' : '照片' }}</span>
        </div>

        <div class="viewer-stage">
          <img :src="activeItem.url" alt="" />

          <template v-if="activeItem.type === 'video'">
            <button
              v-if="!isPlaying"
              type="button"
              class="viewer-play"
              aria-label="播放"
              @click.stop="togglePlay"
            >
              <t-icon name="play-circle-filled" size="56px" />
            </button>

            <div class="viewer-controls">
              <button type="button" class="control-toggle" aria-label="播放或暂停" @click.stop="togglePlay">
                <t-icon :name="isPlaying ? 'pause-circle-filled' : 'play-circle-filled'" size="20px" />
              </button>
              <span class="control-time">{{ formatDuration(elapsedSeconds) }}</span>
              <div class="viewer-progress">
                <span :style="{ width: `${playProgress}%` }"></span>
              </div>
              <span class="control-time">{{ formatDuration(activeItem.duration) }}</span>
            </div>
          </template>
        </div>

        <div class="viewer-panel">
          <div class="viewer-meta">
            <h3>{{ activeItem.deviceName }}</h3>
            <p>
              {{ formatFullTime(activeItem.createdAt) }}
              <template v-if="activeItem.type === 'video'"> · 时长 {{ formatDuration(activeItem.duration) }}</template>
            </p>
          </div>

          <div class="viewer-actions">
            <button type="button" class="viewer-action is-primary" @click="saveToPhone">
              <t-icon name="download" size="18px" />
              保存到手机
            </button>
            <button type="button" class="viewer-action is-danger" @click="removeActive">
              <t-icon name="delete" size="18px" />
              删除
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="confirm">
      <div v-if="confirmState.visible" class="confirm-layer" @click.self="closeConfirm">
        <div class="confirm-card">
          <h3>{{ confirmState.title }}</h3>
          <p>{{ confirmState.content }}</p>
          <div class="confirm-actions">
            <button type="button" class="confirm-cancel" @click="closeConfirm">取消</button>
            <button type="button" class="confirm-delete" @click="confirmDelete">删除</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useGalleryStore } from '../../stores/gallery'

const router = useRouter()
const galleryStore = useGalleryStore()

const activeFilter = ref('all')
const selectMode = ref(false)
const selectedIds = ref([])
const activeItem = ref(null)
const isPlaying = ref(false)
const playProgress = ref(0)
const confirmState = ref({
  visible: false,
  title: '',
  content: '',
  ids: [],
  mode: 'selected'
})
let playTimer = null

const totalCount = computed(() => galleryStore.items.length)
const photoCount = computed(() => galleryStore.photos.length)
const videoCount = computed(() => galleryStore.videos.length)

const filterTabs = computed(() => [
  { label: '全部', value: 'all', count: totalCount.value },
  { label: '照片', value: 'photo', count: photoCount.value },
  { label: '视频', value: 'video', count: videoCount.value }
])

const filteredItems = computed(() => {
  if (activeFilter.value === 'photo') return galleryStore.photos
  if (activeFilter.value === 'video') return galleryStore.videos
  return galleryStore.sortedItems
})

const startOfDay = (timestamp) => {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const dayLabel = (timestamp) => {
  const today = startOfDay(Date.now())
  const target = startOfDay(timestamp)
  const diff = Math.round((today - target) / (24 * 60 * 60 * 1000))

  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'

  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const groups = computed(() => {
  const map = new Map()

  filteredItems.value.forEach((item) => {
    const key = String(startOfDay(item.createdAt))
    if (!map.has(key)) {
      map.set(key, { key, label: dayLabel(item.createdAt), items: [] })
    }
    map.get(key).items.push(item)
  })

  return [...map.values()]
})

const formatDuration = (seconds) => {
  const total = Math.max(0, Math.round(seconds || 0))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

const formatFullTime = (timestamp) => {
  const date = new Date(timestamp)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const elapsedSeconds = computed(() => {
  const duration = activeItem.value?.duration || 0
  return Math.round((duration * playProgress.value) / 100)
})

const isSelected = (id) => selectedIds.value.includes(id)

const allSelected = computed(() =>
  filteredItems.value.length > 0 && filteredItems.value.every(item => isSelected(item.id))
)

const goBack = () => {
  router.back()
}

const toggleSelectMode = () => {
  selectMode.value = !selectMode.value
  selectedIds.value = []
}

const onCardClick = (item) => {
  if (selectMode.value) {
    if (isSelected(item.id)) {
      selectedIds.value = selectedIds.value.filter(id => id !== item.id)
    } else {
      selectedIds.value = [...selectedIds.value, item.id]
    }
    return
  }
  openViewer(item)
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
    return
  }
  selectedIds.value = filteredItems.value.map(item => item.id)
}

const removeSelected = () => {
  if (!selectedIds.value.length) return

  confirmState.value = {
    visible: true,
    title: '删除内容',
    content: `确认删除选中的 ${selectedIds.value.length} 项内容？删除后无法恢复。`,
    ids: [...selectedIds.value],
    mode: 'selected'
  }
}

const openViewer = (item) => {
  activeItem.value = item
  isPlaying.value = false
  playProgress.value = 0
}

const closeViewer = () => {
  stopPlayback()
  activeItem.value = null
}

const removeActive = () => {
  if (!activeItem.value) return

  confirmState.value = {
    visible: true,
    title: '删除内容',
    content: '确认删除该项内容？删除后无法恢复。',
    ids: [activeItem.value.id],
    mode: 'active'
  }
}

const closeConfirm = () => {
  confirmState.value.visible = false
}

const confirmDelete = () => {
  if (!confirmState.value.ids.length) return

  const { ids, mode } = confirmState.value
  galleryStore.removeItems(ids)

  if (mode === 'active') {
    closeViewer()
  } else {
    selectedIds.value = []
    selectMode.value = false
  }

  confirmState.value.visible = false
  Toast.success('已删除')
}

const stopPlayback = () => {
  isPlaying.value = false
  playProgress.value = 0
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

const togglePlay = () => {
  if (!activeItem.value) return

  if (isPlaying.value) {
    stopPlayback()
    return
  }

  isPlaying.value = true
  playProgress.value = 0

  const duration = Math.max(3, activeItem.value.duration || 10)
  const startedAt = Date.now()

  playTimer = setInterval(() => {
    const elapsed = (Date.now() - startedAt) / 1000
    playProgress.value = Math.min(100, (elapsed / duration) * 100)
    if (playProgress.value >= 100) {
      stopPlayback()
    }
  }, 120)
}

const saveToPhone = () => {
  if (!activeItem.value) return
  Toast.success('已保存到手机相册')
}

onUnmounted(() => {
  stopPlayback()
})
</script>

<style scoped>
.gallery-page {
  min-height: 100%;
  background:
    radial-gradient(120% 40% at 100% 0%, rgba(214, 228, 255, 0.62) 0%, rgba(214, 228, 255, 0) 58%),
    linear-gradient(180deg, #f5f7fb 0%, #f2f5fa 100%);
  padding-bottom: calc(28px + var(--prototype-safe-bottom));
}

.gallery-page.is-managing {
  padding-bottom: calc(104px + var(--prototype-safe-bottom));
}

.gallery-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 64px;
  align-items: center;
  height: calc(var(--prototype-navbar-height) + 8px);
  padding-top: var(--prototype-safe-top);
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(238, 240, 244, 0.9);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.nav-back {
  width: 48px;
  height: 100%;
  border: 0;
  background: transparent;
  color: #17181d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
}

.nav-back:active {
  opacity: 0.55;
}

.nav-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #17181d;
  text-align: center;
}

.nav-action {
  height: 100%;
  padding-right: 8px;
  border: 0;
  background: transparent;
  color: #4059f0;
  font-size: 14px;
  font-weight: 600;
  justify-self: end;
}

.nav-action:active {
  opacity: 0.6;
}

.gallery-tabs {
  display: flex;
  gap: 8px;
  padding: 14px 16px 0;
}

.gallery-tab {
  flex: 0 0 auto;
  height: 32px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  color: #6f7686;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.gallery-tab.active {
  background: #ffffff;
  color: #4059f0;
  box-shadow: 0 6px 14px rgba(64, 89, 240, 0.14);
}

.tab-count {
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  border-radius: 6px;
  background: #eceef4;
  color: #8a93a3;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.gallery-tab.active .tab-count {
  background: #eef1ff;
  color: #4059f0;
}

.gallery-meta {
  padding: 10px 18px 0;
  font-size: 11.5px;
  color: #9aa3b2;
}

.gallery-body {
  padding: 0 10px;
}

.gallery-empty {
  margin: 20px 6px 0;
  padding: 46px 24px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  color: #a9b2c0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.gallery-empty p {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #5c6474;
}

.gallery-empty span {
  font-size: 12px;
  line-height: 1.5;
}

.gallery-group {
  margin-top: 16px;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 7px;
  padding: 0 5px;
}

.group-head h3 {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: #1c1d22;
}

.group-head span {
  font-size: 11px;
  color: #a2a3ac;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.media-card {
  position: relative;
  padding: 0;
  border: 0;
  border-radius: 9px;
  background: #e4e8f0;
  overflow: hidden;
  text-align: left;
  transition: transform 0.16s ease;
}

.media-card:active {
  transform: scale(0.97);
}

.media-card.selected {
  box-shadow: 0 0 0 2px #5b6cfb inset;
}

.media-thumb {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #e4e8f0;
}

.media-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-duration {
  position: absolute;
  right: 5px;
  bottom: 5px;
  height: 17px;
  padding: 0 5px;
  border-radius: 5px;
  background: rgba(9, 17, 30, 0.6);
  color: #ffffff;
  font-size: 9.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.media-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.94);
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.media-check {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.92);
  background: rgba(9, 17, 30, 0.3);
  color: #ffffff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-check.checked {
  border-color: #4059f0;
  background: #4059f0;
}

.select-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px calc(14px + var(--prototype-safe-bottom));
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid #eef0f4;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.select-all {
  border: 0;
  background: transparent;
  color: #4a5162;
  font-size: 13.5px;
  font-weight: 500;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.select-all-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #d2d7e0;
  color: #ffffff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.select-all-check.checked {
  border-color: #4059f0;
  background: #4059f0;
}

.select-delete {
  height: 42px;
  padding: 0 22px;
  border: 0;
  border-radius: 21px;
  background: linear-gradient(135deg, #ff6a5f 0%, #e5372b 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  box-shadow: 0 10px 22px rgba(229, 55, 43, 0.2);
}

.select-delete:disabled {
  background: #f1f3f7;
  color: #b3bac6;
  box-shadow: none;
}

.select-bar-enter-active,
.select-bar-leave-active {
  transition: transform 0.24s ease, opacity 0.24s ease;
}

.select-bar-enter-from,
.select-bar-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.media-viewer {
  position: absolute;
  inset: 0;
  z-index: 1900;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: calc(var(--prototype-safe-top) + 10px) 16px calc(16px + var(--prototype-safe-bottom));
  background:
    radial-gradient(90% 45% at 50% 0%, rgba(72, 92, 190, 0.42) 0%, rgba(72, 92, 190, 0) 62%),
    linear-gradient(180deg, #10141f 0%, #070a11 100%);
}

.viewer-topbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.viewer-icon-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.viewer-icon-btn:active {
  opacity: 0.6;
}

.viewer-chip {
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.82);
  font-size: 11.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.viewer-stage {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-stage img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  border-radius: 18px;
  object-fit: contain;
  background: rgba(6, 10, 18, 0.7);
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.5);
}

.viewer-play {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 66px;
  height: 66px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(10, 14, 24, 0.42);
  color: rgba(255, 255, 255, 0.95);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.36);
  transition: transform 0.16s ease, background 0.16s ease;
}

.viewer-play:active {
  transform: scale(0.92);
  background: rgba(10, 14, 24, 0.55);
}

.viewer-controls {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(8, 12, 20, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.control-toggle {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.control-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.82);
  font-variant-numeric: tabular-nums;
}

.viewer-progress {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.24);
  overflow: hidden;
}

.viewer-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7c8bff 0%, #a4b0ff 100%);
  transition: width 0.12s linear;
}

.viewer-panel {
  flex: 0 0 auto;
  padding: 16px 16px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.viewer-meta h3 {
  margin: 0;
  font-size: 15.5px;
  font-weight: 600;
  color: #ffffff;
}

.viewer-meta p {
  margin-top: 5px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.55);
}

.viewer-actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.viewer-action {
  height: 44px;
  border: 0;
  border-radius: 22px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transition: transform 0.16s ease, opacity 0.16s ease;
}

.viewer-action:active {
  transform: scale(0.97);
  opacity: 0.82;
}

.viewer-action.is-primary {
  background: linear-gradient(135deg, #5b6cfb 0%, #4059f0 100%);
  box-shadow: 0 10px 24px rgba(64, 89, 240, 0.28);
}

.viewer-action.is-danger {
  background: rgba(255, 107, 95, 0.14);
  color: #ff9a92;
}

.viewer-enter-active,
.viewer-leave-active {
  transition: opacity 0.22s ease;
}

.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}

.confirm-layer {
  position: absolute;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  background: rgba(10, 16, 28, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.confirm-card {
  width: 100%;
  max-width: 300px;
  padding: 26px 22px 22px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(16, 24, 40, 0.24);
  text-align: center;
}

.confirm-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #17181d;
}

.confirm-card p {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.55;
  color: #7a8494;
}

.confirm-actions {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.confirm-cancel,
.confirm-delete {
  height: 46px;
  border: 0;
  border-radius: 23px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
}

.confirm-cancel {
  background: #f2f4f8;
  color: #5b6472;
}

.confirm-delete {
  background: linear-gradient(135deg, #ff6a5f 0%, #e5372b 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(229, 55, 43, 0.2);
}

.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}

@media (max-width: 360px) {
  .media-grid {
    gap: 3px;
  }
}
</style>
