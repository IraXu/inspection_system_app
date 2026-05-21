<template>
  <div class="app-container" :class="{ 'preview-enabled': previewEnabled, 'preview-disabled': !previewEnabled }">
    <div class="dev-toolbar">
      <span class="toolbar-label">原型预览</span>
      <button type="button" class="preview-toggle" @click="previewEnabled = !previewEnabled">
        <span class="toggle-dot"></span>
        <span>{{ previewEnabled ? '开' : '关' }}</span>
      </button>
    </div>

    <div class="preview-stage">
      <div v-if="previewEnabled" class="phone-shell">
        <div class="phone-frame">
          <div class="phone-details">
            <span class="frame-button frame-button-top"></span>
            <span class="frame-button frame-button-middle"></span>
            <span class="frame-button frame-button-bottom"></span>
            <span class="frame-button frame-button-right"></span>
          </div>

          <div class="phone-screen">
            <div class="screen-scroll">
              <router-view v-slot="{ Component }">
                <keep-alive>
                  <component :is="Component" />
                </keep-alive>
              </router-view>
            </div>

            <div
              v-if="showTabbar"
              ref="shellTabbarRef"
              class="app-tabbar"
              :class="{ 'is-dragging': isDraggingTabbar }"
              :style="tabbarIndicatorStyle"
              @touchstart.passive="handleTabbarDragStart"
              @touchmove.passive="handleTabbarDragMove"
              @touchend="handleTabbarDragEnd"
              @touchcancel="resetTabbarDrag"
            >
              <div class="app-tabbar-glow"></div>
              <div class="app-tabbar-indicator"></div>
              <button
                v-for="item in tabbarItems"
                :key="item.value"
                type="button"
                class="app-tabbar-item"
                :class="{ 'is-active': activeTab === item.value }"
                :style="getTabItemStyle(tabbarItems.findIndex(tab => tab.value === item.value))"
                @click="onTabChange(item.value)"
              >
                <span class="app-tabbar-item-icon">
                  <t-icon :name="item.icon" />
                </span>
                <span class="app-tabbar-item-text">{{ item.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="app-canvas"
      >
        <div class="screen-scroll screen-scroll--canvas">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>

        <div
          v-if="showTabbar"
          ref="canvasTabbarRef"
          class="app-tabbar app-tabbar--canvas"
          :class="{ 'is-dragging': isDraggingTabbar }"
          :style="tabbarIndicatorStyle"
          @touchstart.passive="handleTabbarDragStart"
          @touchmove.passive="handleTabbarDragMove"
          @touchend="handleTabbarDragEnd"
          @touchcancel="resetTabbarDrag"
        >
          <div class="app-tabbar-glow"></div>
          <div class="app-tabbar-indicator"></div>
          <button
            v-for="item in tabbarItems"
            :key="item.value"
            type="button"
            class="app-tabbar-item"
            :class="{ 'is-active': activeTab === item.value }"
            :style="getTabItemStyle(tabbarItems.findIndex(tab => tab.value === item.value))"
            @click="onTabChange(item.value)"
          >
            <span class="app-tabbar-item-icon">
              <t-icon :name="item.icon" />
            </span>
            <span class="app-tabbar-item-text">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeTab = ref('workbench')
const previewEnabled = ref(true)
const shellTabbarRef = ref(null)
const canvasTabbarRef = ref(null)
const tabbarMetrics = ref({
  width: 0,
  itemWidth: 0
})
const tabbarDragState = ref({
  startX: 0,
  currentX: 0,
  tracking: false
})

const tabbarItems = [
  { value: 'workbench', label: '工作台', icon: 'dashboard' },
  { value: 'home', label: '视频广场', icon: 'video' },
  { value: 'todo', label: '待办', icon: 'task' },
  { value: 'profile', label: '我的', icon: 'user' }
]
const TABBAR_SWITCH_THRESHOLD = 0.18
const TABBAR_SWITCH_BIAS = 0.16

const showTabbar = computed(() => {
  return ['workbench', 'home', 'todo', 'profile'].includes(route.name)
})

const activeTabIndex = computed(() => {
  const index = tabbarItems.findIndex(item => item.value === activeTab.value)
  return index > -1 ? index : 0
})

const isDraggingTabbar = computed(() => tabbarDragState.value.tracking)

const tabbarDragOffset = computed(() => {
  if (!tabbarDragState.value.tracking || !tabbarMetrics.value.itemWidth) {
    return activeTabIndex.value
  }

  const deltaX = tabbarDragState.value.currentX - tabbarDragState.value.startX
  const normalizedDelta = deltaX / tabbarMetrics.value.itemWidth
  const dampedDelta = normalizedDelta * 0.88
  const rawOffset = activeTabIndex.value + dampedDelta
  const minOffset = 0
  const maxOffset = tabbarItems.length - 1

  if (rawOffset < minOffset) {
    return minOffset + ((rawOffset - minOffset) * 0.22)
  }

  if (rawOffset > maxOffset) {
    return maxOffset + ((rawOffset - maxOffset) * 0.22)
  }

  return rawOffset
})

const tabbarIndicatorStyle = computed(() => ({
  '--tab-count': String(tabbarItems.length),
  '--active-index': String(tabbarDragOffset.value)
}))

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const mixChannel = (from, to, progress) => Math.round(from + ((to - from) * progress))

const getTabItemStyle = (index) => {
  const progress = clamp(1 - Math.abs(index - tabbarDragOffset.value), 0, 1)
  const isCurrentRoute = index === activeTabIndex.value
  const visualProgress = isDraggingTabbar.value && isCurrentRoute
    ? Math.max(progress, 0.24)
    : progress
  const color = [
    mixChannel(126, 228, visualProgress),
    mixChannel(142, 236, visualProgress),
    mixChannel(163, 244, visualProgress)
  ]
  const inkColor = [
    mixChannel(126, 48, visualProgress),
    mixChannel(142, 104, visualProgress),
    mixChannel(160, 144, visualProgress)
  ]

  return {
    '--item-active-progress': progress.toFixed(3),
    '--item-visual-progress': visualProgress.toFixed(3),
    '--item-color': `rgb(${color.join(', ')})`,
    '--item-ink-color': `rgb(${inkColor.join(', ')})`
  }
}

watch(() => route.name, (name, previousName) => {
  if (['workbench', 'home', 'todo', 'profile'].includes(name)) {
    activeTab.value = name
  }
  nextTick(() => {
    updateTabbarMetrics()
    syncPreviewViewport()
  })
}, { immediate: true })

onMounted(() => {
  const saved = window.localStorage.getItem('prototype-preview-enabled')
  if (saved !== null) {
    previewEnabled.value = saved === 'true'
  }
  syncBodyPreviewClass(previewEnabled.value)
  syncPreviewViewport()
  updateTabbarMetrics()
  window.addEventListener('resize', syncPreviewViewport)
  window.addEventListener('resize', updateTabbarMetrics)
})

watch(previewEnabled, (value) => {
  window.localStorage.setItem('prototype-preview-enabled', String(value))
  syncBodyPreviewClass(value)
  nextTick(() => {
    updateTabbarMetrics()
    syncPreviewViewport()
  })
})

const onTabChange = (value) => {
  if (value === activeTab.value) return
  router.push({ name: value })
}

const updateTabbarMetrics = () => {
  const element = previewEnabled.value ? shellTabbarRef.value : canvasTabbarRef.value
  if (!element) return

  const rect = element.getBoundingClientRect()
  tabbarMetrics.value = {
    width: rect.width,
    itemWidth: rect.width / tabbarItems.length
  }
}

const handleTabbarDragStart = (event) => {
  if (!showTabbar.value) return
  const touch = event.touches?.[0]
  if (!touch) return

  updateTabbarMetrics()

  tabbarDragState.value = {
    startX: touch.clientX,
    currentX: touch.clientX,
    tracking: true
  }
}

const handleTabbarDragMove = (event) => {
  if (!tabbarDragState.value.tracking) return
  const touch = event.touches?.[0]
  if (!touch) return

  tabbarDragState.value.currentX = touch.clientX
}

const handleTabbarDragEnd = () => {
  if (!tabbarDragState.value.tracking || !showTabbar.value) {
    resetTabbarDrag()
    return
  }

  const deltaOffset = tabbarDragOffset.value - activeTabIndex.value
  let nextIndex = activeTabIndex.value

  if (Math.abs(deltaOffset) >= TABBAR_SWITCH_THRESHOLD) {
    const projectedOffset = activeTabIndex.value + deltaOffset + (Math.sign(deltaOffset) * TABBAR_SWITCH_BIAS)
    nextIndex = clamp(Math.round(projectedOffset), 0, tabbarItems.length - 1)
  }

  const nextItem = tabbarItems[nextIndex]
  if (nextItem && nextItem.value !== activeTab.value) {
    onTabChange(nextItem.value)
  }

  resetTabbarDrag()
}

const resetTabbarDrag = () => {
  tabbarDragState.value = {
    startX: 0,
    currentX: 0,
    tracking: false
  }
}

const syncBodyPreviewClass = (enabled) => {
  document.body.classList.toggle('prototype-preview-shell', enabled)
  document.body.classList.toggle('prototype-preview-canvas', !enabled)
}

onBeforeUnmount(() => {
  document.body.classList.remove('prototype-preview-shell')
  document.body.classList.remove('prototype-preview-canvas')
  window.removeEventListener('resize', syncPreviewViewport)
  window.removeEventListener('resize', updateTabbarMetrics)
})

const syncPreviewViewport = () => {
  const root = document.documentElement
  const shell = document.querySelector('.phone-screen')
  const canvas = document.querySelector('.app-canvas')
  const target = previewEnabled.value ? shell : canvas

  if (!target) return

  const rect = target.getBoundingClientRect()
  root.style.setProperty('--preview-overlay-left', `${rect.left}px`)
  root.style.setProperty('--preview-overlay-top', `${rect.top}px`)
  root.style.setProperty('--preview-overlay-width', `${rect.width}px`)
  root.style.setProperty('--preview-overlay-height', `${rect.height}px`)
}
</script>

<style scoped>
.app-container {
  --phone-width: 402px;
  --phone-height: 874px;
  --phone-frame-padding: 14px;
  --shell-live-width: min(var(--phone-width), calc(100vw - 24px));
  --phone-scale: min(
    1,
    calc((100vw - 32px) / calc(var(--phone-width) + var(--phone-frame-padding) * 2)),
    calc((100vh - 32px) / calc(var(--phone-height) + var(--phone-frame-padding) * 2))
  );
  --app-tabbar-height: 56px;
  --app-tabbar-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  --app-tabbar-space: calc(var(--app-tabbar-height) + var(--app-tabbar-bottom) + 16px);
  min-height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(var(--theme-primary-rgb), 0.18), transparent 30%),
    linear-gradient(180deg, var(--theme-glass-1) 0%, #eaf4fb 100%);
  position: relative;
}

.dev-toolbar {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 10px 0 14px;
  border: 1px solid rgba(214, 223, 236, 0.92);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #607089;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 10px 24px rgba(13, 33, 68, 0.06);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.toolbar-label {
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.preview-toggle {
  height: 30px;
  padding: 0 12px 0 10px;
  border: 0;
  border-radius: 999px;
  background: rgba(232, 246, 255, 0.96);
  color: var(--theme-primary-ink);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
}

.toggle-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--theme-primary);
  box-shadow: 0 0 0 4px rgba(var(--theme-primary-rgb), 0.16);
}

.preview-disabled .toggle-dot {
  background: #9aa7ba;
  box-shadow: 0 0 0 4px rgba(154, 167, 186, 0.12);
}

.preview-stage {
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 64px 16px 16px;
  overflow: auto;
}

.phone-shell {
  width: calc(var(--phone-width) + var(--phone-frame-padding) * 2);
  height: calc(var(--phone-height) + var(--phone-frame-padding) * 2);
  flex: 0 0 auto;
  transform: scale(var(--phone-scale));
  transform-origin: center center;
}

.phone-frame {
  position: relative;
  width: 100%;
  height: 100%;
  padding: var(--phone-frame-padding);
  border-radius: 46px;
  background:
    linear-gradient(145deg, #0f1725 0%, #253044 30%, #151c29 60%, #05070c 100%);
  box-shadow:
    0 40px 80px rgba(7, 18, 38, 0.28),
    0 10px 20px rgba(8, 20, 40, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08);
}

.phone-details {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.frame-button {
  position: absolute;
  display: block;
  border-radius: 999px;
  background: linear-gradient(180deg, #566274 0%, #1b2331 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.frame-button-top,
.frame-button-middle,
.frame-button-bottom {
  left: -3px;
  width: 4px;
}

.frame-button-top {
  top: 140px;
  height: 44px;
}

.frame-button-middle {
  top: 206px;
  height: 78px;
}

.frame-button-bottom {
  top: 302px;
  height: 78px;
}

.frame-button-right {
  right: -3px;
  top: 220px;
  width: 4px;
  height: 102px;
}

.phone-screen {
  position: relative;
  width: var(--phone-width);
  height: var(--phone-height);
  overflow: hidden;
  border-radius: 34px;
  background: #f5f7fb;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 0 0 2px rgba(10, 14, 22, 0.28);
  transform: translateZ(0);
}

.app-canvas {
  width: var(--shell-live-width);
  min-height: calc(100dvh - 88px);
  position: relative;
  background: #f5f7fb;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(11, 31, 68, 0.08);
}

.screen-scroll {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.screen-scroll--canvas {
  min-height: calc(100dvh - 88px);
}

.app-tabbar--canvas {
  left: 50%;
  right: auto;
  width: min(calc(var(--shell-live-width) - 28px), 420px);
  transform: translateX(-50%);
}

.phone-screen::-webkit-scrollbar,
.preview-stage::-webkit-scrollbar,
.app-canvas::-webkit-scrollbar,
.screen-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.phone-screen :deep(.video-page),
.phone-screen :deep(.home-page),
.phone-screen :deep(.todo-page),
.phone-screen :deep(.profile-page),
.phone-screen :deep(.page-container),
.app-canvas :deep(.video-page),
.app-canvas :deep(.home-page),
.app-canvas :deep(.todo-page),
.app-canvas :deep(.profile-page),
.app-canvas :deep(.page-container) {
  min-height: 100%;
}

.phone-screen :deep(.t-tab-bar),
.app-canvas :deep(.t-tab-bar) {
  position: fixed;
}

.phone-screen :deep(.t-tab-bar) {
  max-width: calc(var(--phone-width) - 28px);
}

.phone-screen :deep(.t-navbar) {
  max-width: var(--phone-width);
}

.phone-screen :deep(.video-navbar),
.app-canvas :deep(.video-navbar),
.phone-screen :deep(.bottom-tabs),
.app-canvas :deep(.bottom-tabs),
.phone-screen :deep(.region-layer),
.app-canvas :deep(.region-layer) {
  left: 50% !important;
  right: auto !important;
  width: min(var(--prototype-page-width), 100vw) !important;
  transform: translateX(-50%) !important;
}

.phone-screen :deep(.t-popup),
.app-canvas :deep(.t-popup) {
  z-index: 1500;
}

.phone-screen :deep(.t-dialog),
.app-canvas :deep(.t-dialog) {
  z-index: 1600;
}

.phone-details,
.frame-button,
.phone-frame,
.phone-shell {
  pointer-events: auto;
}

.phone-details {
  pointer-events: none;
}

.app-tabbar {
  left: 50%;
  right: auto;
  bottom: var(--app-tabbar-bottom);
  width: min(calc(var(--shell-live-width) - 64px), 334px);
  min-height: 54px;
  margin: 0;
  padding: 7px 10px 8px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(243, 249, 255, 0.68) 100%);
  border-radius: 30px;
  box-shadow:
    0 10px 18px rgba(65, 102, 132, 0.07),
    0 2px 6px rgba(var(--theme-primary-rgb), 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(24px) saturate(138%);
  -webkit-backdrop-filter: blur(24px) saturate(138%);
  display: grid;
  grid-template-columns: repeat(var(--tab-count), minmax(0, 1fr));
  align-items: stretch;
  position: fixed;
  overflow: hidden;
  isolation: isolate;
  transform: translateX(-50%);
}

.app-container :deep(.home-page),
.app-container :deep(.todo-page),
.app-container :deep(.profile-page),
.app-container :deep(.page-container) {
  min-height: 100%;
  padding-bottom: var(--app-tabbar-space);
}

.app-tabbar::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 28%),
    radial-gradient(circle at top center, rgba(255, 255, 255, 0.1), transparent 36%);
  pointer-events: none;
}

.app-tabbar-glow {
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: -10px;
  height: 14px;
  border-radius: 999px;
  background:
    radial-gradient(circle at center, rgba(var(--theme-primary-rgb), 0.08) 0%, rgba(var(--theme-primary-rgb), 0.035) 48%, rgba(var(--theme-primary-rgb), 0) 82%);
  filter: blur(12px);
  pointer-events: none;
  z-index: 0;
}

.app-tabbar-indicator {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 12px;
  width: calc((100% - 24px) / var(--tab-count));
  border-radius: 15px;
  background:
    linear-gradient(180deg, rgba(var(--theme-glass-3-rgb), 0.28) 0%, rgba(var(--theme-primary-rgb), 0.18) 24%, rgba(var(--theme-primary-rgb), 0.24) 56%, rgba(var(--theme-primary-strong-rgb), 0.3) 100%);
  border: 0;
  box-shadow:
    0 4px 8px rgba(var(--theme-primary-rgb), 0.1),
    0 1px 2px rgba(var(--theme-primary-strong-rgb), 0.035),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  transform: translate3d(calc(var(--active-index) * 100%), 0, 0);
  transition: transform 0.32s cubic-bezier(0.2, 0.86, 0.24, 1.04), width 0.28s ease, box-shadow 0.28s ease;
  z-index: 1;
  will-change: transform;
  backdrop-filter: blur(14px) saturate(144%);
  -webkit-backdrop-filter: blur(14px) saturate(144%);
  overflow: hidden;
}

.app-tabbar:active .app-tabbar-indicator {
  box-shadow:
    0 5px 10px rgba(var(--theme-primary-rgb), 0.11),
    0 1px 3px rgba(var(--theme-primary-strong-rgb), 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.34);
}

.app-tabbar.is-dragging .app-tabbar-indicator {
  transition-duration: 0.05s;
  transition-timing-function: linear;
}

.app-tabbar-indicator::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.035) 22%, rgba(255, 255, 255, 0) 48%),
    linear-gradient(180deg, rgba(var(--theme-glass-4-rgb), 0.06) 0%, rgba(var(--theme-primary-rgb), 0.04) 52%, rgba(var(--theme-primary-strong-rgb), 0.07) 100%);
  pointer-events: none;
}

.app-tabbar-item {
  position: relative;
  z-index: 2;
  min-width: 0;
  min-height: 38px;
  border: 0;
  background: transparent;
  border-radius: 20px;
  color: var(--item-color, #6f8197);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: color 0.2s ease, transform 0.26s ease;
}

.app-tabbar-item:active {
  transform: scale(0.95);
}

.app-tabbar-item-icon {
  height: 17px;
  line-height: 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(calc(var(--item-active-progress, 0) * -1px));
  color: var(--item-ink-color, currentColor);
  opacity: calc(0.84 + var(--item-active-progress, 0) * 0.16);
  text-shadow: 0 1px 1px rgba(255, 255, 255, calc(var(--item-visual-progress, 0) * 0.04));
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease, text-shadow 0.24s ease;
}

.app-tabbar-item-icon .t-icon {
  font-size: 17px;
}

.app-tabbar-item-text {
  max-width: 100%;
  font-size: 10px;
  font-weight: 700;
  line-height: 12px;
  letter-spacing: 0;
  white-space: nowrap;
  transform: translateY(calc(var(--item-active-progress, 0) * -1px));
  color: var(--item-ink-color, currentColor);
  opacity: calc(0.94 + var(--item-active-progress, 0) * 0.06);
  text-shadow: 0 1px 1px rgba(255, 255, 255, calc(var(--item-visual-progress, 0) * 0.03));
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease, text-shadow 0.24s ease;
}

.app-tabbar-item.is-active .app-tabbar-item-icon,
.app-tabbar-item.is-active .app-tabbar-item-text {
  transform: translateY(-1px);
}

.app-tabbar-item:active .app-tabbar-item-icon,
.app-tabbar-item:active .app-tabbar-item-text {
  transform: translateY(0.5px);
}

@media (min-width: 480px) {
  .app-tabbar {
    width: min(350px, calc(100vw - 52px));
  }
}

@media (max-width: 480px) {
  .preview-stage {
    padding: 10px;
  }

  .dev-toolbar {
    top: 10px;
    padding-left: 12px;
    padding-right: 8px;
  }

  .toolbar-label {
    display: none;
  }
}
</style>

<style>
body.prototype-preview-shell .t-popup,
body.prototype-preview-canvas .t-popup {
  left: var(--preview-overlay-left, 0px) !important;
  top: var(--preview-overlay-top, 0px) !important;
  width: var(--preview-overlay-width, min(402px, 100vw)) !important;
  height: var(--preview-overlay-height, 100dvh) !important;
}

body.prototype-preview-shell .t-overlay,
body.prototype-preview-canvas .t-overlay {
  left: var(--preview-overlay-left, 0px) !important;
  top: var(--preview-overlay-top, 0px) !important;
  width: var(--preview-overlay-width, min(402px, 100vw)) !important;
  height: var(--preview-overlay-height, 100dvh) !important;
  transform: none !important;
}

body.prototype-preview-shell .t-popup__content,
body.prototype-preview-canvas .t-popup__content {
  width: var(--preview-overlay-width, min(402px, 100vw)) !important;
  max-width: var(--preview-overlay-width, min(402px, 100vw)) !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
}

body.prototype-preview-shell .t-popup--bottom,
body.prototype-preview-canvas .t-popup--bottom,
body.prototype-preview-shell .t-popup--top,
body.prototype-preview-canvas .t-popup--top {
  width: var(--preview-overlay-width, min(402px, 100vw)) !important;
  left: 0 !important;
  right: auto !important;
  transform: none !important;
}

body.prototype-preview-shell .t-popup__content--center,
body.prototype-preview-canvas .t-popup__content--center,
body.prototype-preview-shell .t-dialog__ctx,
body.prototype-preview-canvas .t-dialog__ctx {
  width: calc(var(--preview-overlay-width, min(402px, 100vw)) - 24px) !important;
  max-width: calc(var(--preview-overlay-width, min(402px, 100vw)) - 24px) !important;
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
}

body.prototype-preview-shell .t-dialog,
body.prototype-preview-canvas .t-dialog,
body.prototype-preview-shell .t-dialog__body,
body.prototype-preview-canvas .t-dialog__body {
  max-width: calc(var(--preview-overlay-width, min(402px, 100vw)) - 24px) !important;
}
</style>
