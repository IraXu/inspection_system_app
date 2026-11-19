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

            <LiquidTabbar v-if="showTabbar" />
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

        <LiquidTabbar v-if="showTabbar" wide />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import LiquidTabbar from './components/LiquidTabbar.vue'

const route = useRoute()

const previewEnabled = ref(true)

const showTabbar = computed(() => {
  return ['workbench', 'home', 'todo', 'profile'].includes(route.name)
})

watch(() => route.name, () => {
  nextTick(() => {
    syncPreviewViewport()
  })
})

onMounted(() => {
  const saved = window.localStorage.getItem('prototype-preview-enabled')
  if (saved !== null) {
    previewEnabled.value = saved === 'true'
  }
  syncBodyPreviewClass(previewEnabled.value)
  syncPreviewViewport()
  window.addEventListener('resize', syncPreviewViewport)
})

watch(previewEnabled, (value) => {
  window.localStorage.setItem('prototype-preview-enabled', String(value))
  syncBodyPreviewClass(value)
  nextTick(() => {
    syncPreviewViewport()
  })
})

const syncBodyPreviewClass = (enabled) => {
  document.body.classList.toggle('prototype-preview-shell', enabled)
  document.body.classList.toggle('prototype-preview-canvas', !enabled)
}

onBeforeUnmount(() => {
  document.body.classList.remove('prototype-preview-shell')
  document.body.classList.remove('prototype-preview-canvas')
  window.removeEventListener('resize', syncPreviewViewport)
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
  --app-tabbar-height: 58px;
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
.phone-screen :deep(.select-bar),
.app-canvas :deep(.select-bar),
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

.app-container :deep(.home-page),
.app-container :deep(.todo-page),
.app-container :deep(.profile-page),
.app-container :deep(.page-container) {
  min-height: 100%;
  padding-bottom: var(--app-tabbar-space);
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
body.prototype-preview-canvas .t-popup--bottom {
  top: auto !important;
  height: auto !important;
  max-height: var(--preview-overlay-height, 100dvh) !important;
  bottom: calc(100vh - var(--preview-overlay-top, 0px) - var(--preview-overlay-height, 100dvh)) !important;
  left: var(--preview-overlay-left, 0px) !important;
  width: var(--preview-overlay-width, min(402px, 100vw)) !important;
  right: auto !important;
  transform: none !important;
}

body.prototype-preview-shell .t-popup--top,
body.prototype-preview-canvas .t-popup--top {
  top: var(--preview-overlay-top, 0px) !important;
  height: auto !important;
  bottom: auto !important;
  left: var(--preview-overlay-left, 0px) !important;
  width: var(--preview-overlay-width, min(402px, 100vw)) !important;
  right: auto !important;
  transform: none !important;
}

body.prototype-preview-shell .t-popup--bottom,
body.prototype-preview-canvas .t-popup--bottom {
  overflow: hidden;
}

body.prototype-preview-shell .t-popup--bottom,
body.prototype-preview-shell .t-overlay {
  border-bottom-left-radius: 34px;
  border-bottom-right-radius: 34px;
}

body.prototype-preview-canvas .t-popup--bottom,
body.prototype-preview-canvas .t-overlay {
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
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
