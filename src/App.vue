<template>
  <div class="app-container" :class="{ 'preview-enabled': previewEnabled, 'preview-disabled': !previewEnabled }">
    <div class="dev-toolbar">
      <span class="toolbar-label">
        <t-icon name="browse" />
        <span class="toolbar-label__text">原型预览</span>
      </span>

      <button
        type="button"
        class="preview-switch"
        :class="{ 'is-on': previewEnabled }"
        role="switch"
        :aria-checked="previewEnabled ? 'true' : 'false'"
        aria-label="切换原型预览"
        @click="previewEnabled = !previewEnabled"
      >
        <span class="switch-thumb"></span>
      </button>

      <template v-if="isAuthPage">
        <span class="toolbar-divider"></span>
        <button
          type="button"
          class="privacy-reset"
          title="清除隐私同意记录并重新显示弹窗"
          @click="resetPrivacyDialog"
        >
          <t-icon name="refresh" />
          <span>重置隐私弹窗</span>
        </button>
      </template>
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
            <div class="phone-status" aria-hidden="true">
              <span class="status-time">9:41</span>
              <span class="dynamic-island"></span>
              <span class="status-icons">
                <span class="status-signal"><i></i><i></i><i></i><i></i></span>
                <svg class="status-wifi" viewBox="0 0 16 12">
                  <path d="M1.2 4.3a10.2 10.2 0 0 1 13.6 0" />
                  <path d="M3.8 7a6.6 6.6 0 0 1 8.4 0" />
                  <path d="M6.2 9.5a3.2 3.2 0 0 1 3.6 0" />
                  <circle cx="8" cy="11.2" r="1.1" />
                </svg>
                <span class="status-battery"><span class="status-battery__level"></span></span>
              </span>
            </div>

            <div class="screen-scroll">
              <router-view v-slot="{ Component }">
                <keep-alive>
                  <component :is="Component" />
                </keep-alive>
              </router-view>
            </div>

            <LiquidTabbar v-if="showTabbar" />
            <div class="phone-home-indicator" aria-hidden="true"></div>
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

    <PrivacyConsentDialog v-if="!privacyConsentGranted" @agree="onPrivacyAgree" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import LiquidTabbar from './components/LiquidTabbar.vue'
import PrivacyConsentDialog from './components/PrivacyConsentDialog.vue'
import { grantPrivacyConsent, privacyConsentGranted, revokePrivacyConsent } from './utils/privacy-consent'
import { initThirdPartySdks } from './utils/sdk'

const route = useRoute()

const previewEnabled = ref(true)

const onPrivacyAgree = () => {
  grantPrivacyConsent()
  initThirdPartySdks()
}

// 演示用：清除同意记录，重新触发首次启动的隐私政策弹窗
const resetPrivacyDialog = () => {
  revokePrivacyConsent()
}

const showTabbar = computed(() => {
  return ['workbench', 'home', 'todo', 'profile'].includes(route.name)
})

// 重置隐私弹窗仅用于演示登录/注册时的首次启动流程
const isAuthPage = computed(() => ['login', 'register'].includes(route.name))

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
  // 画布模式下页面滚动时画布位置会变化，需要同步更新浮层定位变量
  window.addEventListener('scroll', onPreviewScroll, { capture: true, passive: true })

  // 已同意隐私政策的老用户，启动后再初始化第三方 SDK
  if (privacyConsentGranted.value) {
    initThirdPartySdks()
  }
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
  window.removeEventListener('scroll', onPreviewScroll, true)
})


const syncPreviewViewport = () => {
  const root = document.documentElement
  const shell = document.querySelector('.phone-screen')
  const canvas = document.querySelector('.app-canvas')
  const target = previewEnabled.value ? shell : canvas

  if (!target) return

  const rect = target.getBoundingClientRect()
  let left = rect.left
  let top = rect.top
  let width = rect.width
  let height = rect.height

  // 画布可能比视口更高：浮层按画布在视口内的可见区域定位，避免内容被滚出屏幕
  if (!previewEnabled.value) {
    left = Math.max(rect.left, 0)
    top = Math.max(rect.top, 0)
    width = Math.min(rect.right, window.innerWidth) - left
    height = Math.min(rect.bottom, window.innerHeight) - top
  }

  root.style.setProperty('--preview-overlay-left', `${left}px`)
  root.style.setProperty('--preview-overlay-top', `${top}px`)
  root.style.setProperty('--preview-overlay-width', `${width}px`)
  root.style.setProperty('--preview-overlay-height', `${height}px`)
}

const onPreviewScroll = () => {
  // 手机壳模式下的浮层相对手机屏定位，滚动时无需重算
  if (!previewEnabled.value) {
    syncPreviewViewport()
  }
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
  gap: 12px;
  height: 44px;
  padding: 0 8px 0 14px;
  border: 1px solid rgba(211, 221, 236, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #56657e;
  box-shadow: 0 12px 30px rgba(13, 33, 68, 0.08);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}

.toolbar-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.toolbar-label :deep(.t-icon) {
  font-size: 15px;
  color: #8494ad;
}

.preview-switch {
  position: relative;
  flex: 0 0 auto;
  width: 38px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #dfe5ef;
  transition: background 0.2s ease;
}

.preview-switch.is-on {
  background: #3d6cf5;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(23, 38, 69, 0.24);
  transition: transform 0.2s ease;
}

.preview-switch.is-on .switch-thumb {
  transform: translateX(16px);
}

.toolbar-divider {
  flex: 0 0 auto;
  width: 1px;
  height: 18px;
  background: rgba(207, 217, 232, 0.9);
}

.privacy-reset {
  height: 32px;
  padding: 0 10px 0 8px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #4f6588;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.16s ease, color 0.16s ease;
}

.privacy-reset:hover {
  background: rgba(61, 108, 245, 0.08);
  color: #2f4d86;
}

.privacy-reset :deep(.t-icon) {
  font-size: 14px;
}

.privacy-reset:active {
  background: rgba(61, 108, 245, 0.14);
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
  --phone-status-height: 44px;
  --prototype-safe-top: max(var(--phone-status-height), env(safe-area-inset-top, 0px));
  --prototype-content-top: calc(var(--prototype-safe-top) + var(--prototype-navbar-height));
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

/* 模拟状态栏：灵动岛 + 时间 + 信号/电量 */
.phone-status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  height: var(--phone-status-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 0 24px;
  background: linear-gradient(
    180deg,
    rgba(248, 251, 255, 0.86) 0%,
    rgba(248, 251, 255, 0.42) 64%,
    rgba(248, 251, 255, 0) 100%
  );
  color: #151a23;
  pointer-events: none;
}

.status-time {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

.dynamic-island {
  position: absolute;
  top: 7px;
  left: 50%;
  width: 104px;
  height: 30px;
  border-radius: 999px;
  background: #050608;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 2px 6px rgba(0, 0, 0, 0.22);
  transform: translateX(-50%);
}

.dynamic-island::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 32%, #33445e 0%, #101a28 55%, #05080d 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  transform: translateY(-50%);
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-signal {
  display: flex;
  align-items: flex-end;
  gap: 1.5px;
  height: 11px;
}

.status-signal i {
  width: 3px;
  border-radius: 1px;
  background: currentColor;
}

.status-signal i:nth-child(1) {
  height: 4px;
}

.status-signal i:nth-child(2) {
  height: 6px;
}

.status-signal i:nth-child(3) {
  height: 8px;
}

.status-signal i:nth-child(4) {
  height: 11px;
}

.status-wifi {
  width: 16px;
  height: 12px;
}

.status-wifi path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
}

.status-wifi circle {
  fill: currentColor;
  stroke: none;
}

.status-battery {
  position: relative;
  width: 24px;
  height: 12px;
  padding: 1.5px;
  border: 1.2px solid currentColor;
  border-radius: 3.5px;
}

.status-battery::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -4px;
  width: 2px;
  height: 4px;
  border-radius: 0 1px 1px 0;
  background: currentColor;
  opacity: 0.7;
  transform: translateY(-50%);
}

.status-battery__level {
  display: block;
  width: 74%;
  height: 100%;
  border-radius: 1.5px;
  background: currentColor;
}

/* 底部 Home 指示条 */
.phone-home-indicator {
  position: absolute;
  left: 50%;
  bottom: 6px;
  z-index: 61;
  width: 134px;
  height: 5px;
  border-radius: 999px;
  background: rgba(22, 27, 36, 0.72);
  transform: translateX(-50%);
  pointer-events: none;
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

  .toolbar-label__text {
    display: none;
  }

  .toolbar-label :deep(.t-icon) {
    font-size: 16px;
  }
}
</style>

<style>
/* 手机壳内固定导航栏让出模拟状态栏高度 */
.phone-screen .page-navbar {
  top: var(--phone-status-height, 44px) !important;
}

/* 首次启动的隐私政策弹窗与业务弹层一致，限制在原型预览区域内 */
body.prototype-preview-shell .privacy-gate,
body.prototype-preview-canvas .privacy-gate {
  inset: auto !important;
  left: var(--preview-overlay-left, 0px) !important;
  top: var(--preview-overlay-top, 0px) !important;
  width: var(--preview-overlay-width, min(402px, 100vw)) !important;
  height: var(--preview-overlay-height, 100dvh) !important;
}

body.prototype-preview-shell .privacy-gate {
  border-radius: 34px;
}

body.prototype-preview-canvas .privacy-gate {
  border-radius: 28px;
}

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
