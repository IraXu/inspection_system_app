<template>
  <div class="live-page">
    <header class="live-nav">
      <button type="button" class="live-back" aria-label="返回" @click="goBack">
        <LiveIcon name="back" :size="26" />
      </button>
      <h1 class="live-title">{{ deviceName }}</h1>
      <button type="button" class="live-back" aria-label="设备设置" @click="goDeviceSettings">
        <LiveIcon name="setting" :size="22" />
      </button>
    </header>

    <section class="live-stage">
      <img class="live-frame" :src="frameImage" alt="" />
      <div class="live-stage-mask"></div>

      <div class="live-stage-top">
        <span class="live-time">{{ currentDateText }}</span>
        <span class="live-speed">{{ networkSpeed }}</span>
      </div>

      <div class="live-stage-bottom">
        <button type="button" class="live-quality" @click="cycleQuality">{{ currentQualityLabel }}</button>
        <button type="button" class="live-landscape" aria-label="横屏查看" @click="toggleFullscreen">
          <LiveIcon name="rotate" :size="24" />
        </button>
      </div>

      <div v-if="isRecording" class="live-rec-tag">
        <i></i>
        {{ recordingTime }}
      </div>

      <div v-if="captureFlash" class="live-flash"></div>
    </section>

    <section class="live-actions">
      <button type="button" class="live-action" :class="{ active: !isMuted }" @click="toggleMute">
        <LiveIcon :name="isMuted ? 'sound-mute' : 'sound'" :size="30" />
        <span>{{ isMuted ? '静音' : '声音' }}</span>
      </button>
      <button type="button" class="live-action" :class="{ recording: isRecording }" @click="toggleRecording">
        <LiveIcon name="record" :size="30" />
        <span>{{ isRecording ? '停止' : '录制' }}</span>
      </button>
      <button type="button" class="live-action" @click="takePhoto">
        <LiveIcon name="camera" :size="30" />
        <span>拍照</span>
      </button>
      <button type="button" class="live-action" :class="{ active: isLightOn }" @click="toggleLight">
        <LiveIcon :name="isLightOn ? 'bulb-filled' : 'bulb'" :size="29" />
        <span>照明</span>
      </button>
    </section>

    <main class="live-body">
      <div v-if="activeBottomTab === 'ptz'" class="ptz-area">
        <div class="ptz-ring">
          <span class="ptz-sector" :class="activeDirection ? `is-${activeDirection}` : ''"></span>
          <button
            type="button"
            class="ptz-key ptz-up"
            :class="{ 'is-active': activeDirection === 'up' }"
            aria-label="云台向上"
            @pointerdown.prevent="startPtz('up')"
            @pointerup="endPtz"
            @pointerleave="endPtz"
            @pointercancel="endPtz"
          >
            <LiveIcon name="caret-up" :size="26" />
          </button>
          <button
            type="button"
            class="ptz-key ptz-left"
            :class="{ 'is-active': activeDirection === 'left' }"
            aria-label="云台向左"
            @pointerdown.prevent="startPtz('left')"
            @pointerup="endPtz"
            @pointerleave="endPtz"
            @pointercancel="endPtz"
          >
            <LiveIcon name="caret-left" :size="26" />
          </button>
          <button
            type="button"
            class="ptz-key ptz-right"
            :class="{ 'is-active': activeDirection === 'right' }"
            aria-label="云台向右"
            @pointerdown.prevent="startPtz('right')"
            @pointerup="endPtz"
            @pointerleave="endPtz"
            @pointercancel="endPtz"
          >
            <LiveIcon name="caret-right" :size="26" />
          </button>
          <button
            type="button"
            class="ptz-key ptz-down"
            :class="{ 'is-active': activeDirection === 'down' }"
            aria-label="云台向下"
            @pointerdown.prevent="startPtz('down')"
            @pointerup="endPtz"
            @pointerleave="endPtz"
            @pointercancel="endPtz"
          >
            <LiveIcon name="caret-down" :size="26" />
          </button>
          <button type="button" class="ptz-core" aria-label="停止云台" @click="stopPtz"></button>
        </div>
      </div>

      <div v-else-if="activeBottomTab === 'talk'" class="talk-panel">
        <button
          type="button"
          class="talk-button"
          :class="{ active: isTalking }"
          @click="toggleTalk"
        >
          <LiveIcon name="mic" :size="36" />
        </button>
        <p class="talk-title">{{ isTalking ? '正在通话中' : '按住说话' }}</p>
        <p class="talk-desc">{{ isTalking ? '点击结束与现场的通话' : '与设备端进行双向语音对讲' }}</p>
      </div>
    </main>

    <nav class="bottom-tabs live-tabs">
      <button
        v-for="tab in bottomTabs"
        :key="tab.value"
        type="button"
        class="live-tab"
        :class="{ active: activeBottomTab === tab.value }"
        @click="switchBottomTab(tab)"
      >
        <LiveIcon :name="tab.icon" :size="26" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <transition name="live-fs">
      <div v-if="isFullscreen" class="live-fs" :style="fsSize">
        <img class="live-fs-frame" :src="frameImage" alt="" />
        <div class="live-fs-mask"></div>

        <div class="live-fs-head">
          <div class="live-fs-title">
            <span>{{ deviceName }}</span>
            <em>实时画面</em>
          </div>
          <button type="button" class="live-fs-exit" aria-label="退出横屏" @click="toggleFullscreen">
            <LiveIcon name="close" :size="20" />
          </button>
        </div>

        <div class="live-fs-foot">
          <span class="live-fs-time">{{ currentDateText }}</span>
          <span class="live-fs-right">
            <span class="live-fs-speed">{{ networkSpeed }}</span>
            <button type="button" class="live-fs-landscape" aria-label="退出横屏" @click="toggleFullscreen">
              <LiveIcon name="rotate" :size="24" />
            </button>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useGalleryStore } from '../../stores/gallery'
import { buildImageUrl } from '../../utils/media'
import LiveIcon from '../../components/LiveIcon.vue'

const route = useRoute()
const router = useRouter()
const galleryStore = useGalleryStore()

const deviceId = computed(() => route.params.id)
const deviceName = ref('摄像头-车间1入口')

const isRecording = ref(false)
const recordingTime = ref('00:00')
let recordingTimer = null
let recordingSeconds = 0

const isMuted = ref(false)
const isLightOn = ref(false)
const isTalking = ref(false)
const networkSpeed = ref('90 KB/S')
const captureFlash = ref(false)
const activeBottomTab = ref('ptz')
const activeDirection = ref('')
const isFullscreen = ref(false)
const fsSize = ref({})

const qualityOptions = [
  { label: '流畅', value: 'smooth' },
  { label: '标清', value: 'standard' },
  { label: '高清', value: 'hd' }
]
const currentQuality = ref('hd')

const bottomTabs = [
  { label: '云台', value: 'ptz', icon: 'ptz' },
  { label: '通话', value: 'talk', icon: 'mic' },
  { label: '回放', value: 'playback', icon: 'playback' }
]

const deviceNames = {
  1: '摄像头-车间1入口',
  2: '摄像头-车间1出口',
  3: '摄像头-车间2入口',
  4: '摄像头-厂区大门',
  5: '摄像头-办公区域',
  6: '摄像头-停车场',
  7: '摄像头-厂区大门',
  8: '摄像头-生产车间'
}

const frameScenes = {
  1: 'a bright factory workshop entrance with metal storage racks and stacked white boxes',
  2: 'a factory workshop exit corridor with industrial equipment',
  3: 'a modern factory production line with machines and overhead lights',
  4: 'a factory gate checkpoint with a security booth and barriers',
  5: 'an office reception area with a front desk and warm lighting',
  6: 'an empty underground parking garage with white pillars and bright ceiling lights',
  7: 'a factory gate checkpoint with a security booth and barriers',
  8: 'a modern production workshop with assembly lines and workers in vests'
}

const buildSceneImage = (scene) =>
  buildImageUrl(`realistic CCTV surveillance still of ${scene}, wide angle, slightly grainy security camera footage`)

const frameImage = computed(() =>
  buildSceneImage(frameScenes[deviceId.value] || frameScenes[1])
)

const currentQualityLabel = computed(() => {
  return qualityOptions.find(item => item.value === currentQuality.value)?.label || '高清'
})

const currentDateText = computed(() => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
})

const formatDuration = (seconds) => {
  const total = Math.max(0, Math.round(seconds || 0))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

onMounted(() => {
  deviceName.value = deviceNames[deviceId.value] || '未知设备'
})

onUnmounted(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }
})

const goBack = () => {
  if (isRecording.value) {
    stopRecording()
  }
  router.back()
}

const goDeviceSettings = () => {
  router.push(`/device-settings/${deviceId.value}`)
}

const switchBottomTab = (tab) => {
  if (tab.value === 'playback') {
    router.push(`/video-playback/${deviceId.value}`)
    return
  }
  activeBottomTab.value = tab.value
}

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    const host = document.querySelector('.phone-screen') || document.querySelector('.app-canvas')
    const width = host?.clientWidth || window.innerWidth
    const height = host?.clientHeight || window.innerHeight
    // 旋转 90° 展示横屏画面：宽高互换
    fsSize.value = { width: `${height}px`, height: `${width}px` }
  }
  isFullscreen.value = !isFullscreen.value
}

const takePhoto = () => {
  captureFlash.value = true
  setTimeout(() => {
    captureFlash.value = false
  }, 220)

  galleryStore.addPhoto({
    deviceId: deviceId.value,
    deviceName: deviceName.value,
    url: frameImage.value
  })

  Toast.success('照片已保存到图库')
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
    return
  }
  startRecording()
}

const startRecording = () => {
  isRecording.value = true
  recordingSeconds = 0
  recordingTime.value = '00:00'

  recordingTimer = setInterval(() => {
    recordingSeconds++
    recordingTime.value = formatDuration(recordingSeconds)
  }, 1000)

  Toast.success('开始录制')
}

const stopRecording = () => {
  if (!isRecording.value) return

  isRecording.value = false

  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }

  galleryStore.addVideo({
    deviceId: deviceId.value,
    deviceName: deviceName.value,
    url: frameImage.value,
    duration: recordingSeconds
  })

  Toast.success('录像已保存到图库')
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  Toast(isMuted.value ? '已静音' : '已开启声音')
}

const toggleLight = () => {
  isLightOn.value = !isLightOn.value
  Toast(isLightOn.value ? '已打开照明' : '已关闭照明')
}

const toggleTalk = () => {
  isTalking.value = !isTalking.value
  Toast(isTalking.value ? '开始通话' : '已结束通话')
}

const changeQuality = (quality) => {
  currentQuality.value = quality
  const qualityNames = { smooth: '流畅', standard: '标清', hd: '高清' }
  Toast(`切换到${qualityNames[quality]}`)
}

const cycleQuality = () => {
  const currentIndex = qualityOptions.findIndex(item => item.value === currentQuality.value)
  const nextIndex = (currentIndex + 1) % qualityOptions.length
  changeQuality(qualityOptions[nextIndex].value)
}

const startPtz = (direction) => {
  activeDirection.value = direction
}

const endPtz = () => {
  activeDirection.value = ''
}

const stopPtz = () => {
  activeDirection.value = ''
  Toast('云台已停止')
}
</script>

<style scoped>
.live-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f7f7;
  padding-bottom: calc(88px + var(--prototype-safe-bottom));
}

.live-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
  align-items: center;
  height: calc(var(--prototype-safe-top) + var(--prototype-navbar-height) + 8px);
  padding-top: var(--prototype-safe-top);
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(238, 240, 244, 0.9);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.live-back {
  width: 48px;
  height: 100%;
  border: 0;
  background: transparent;
  color: #17181d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.live-nav-spacer {
  display: block;
}

.live-back:active {
  opacity: 0.55;
}

.live-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #17181d;
  text-align: center;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.live-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #1d2733;
}

.live-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.live-stage-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 14, 24, 0.46) 0%, rgba(8, 14, 24, 0.04) 34%, rgba(8, 14, 24, 0.12) 70%, rgba(8, 14, 24, 0.44) 100%);
}

.live-stage-top {
  position: absolute;
  top: 12px;
  left: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.live-speed {
  padding: 0;
  background: none;
}

.live-stage-bottom {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.live-quality {
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 6px;
  background: rgba(9, 17, 30, 0.16);
  color: #ffffff;
  font-size: 13px;
  line-height: 1;
}

.live-landscape {
  width: 34px;
  height: 34px;
  margin-right: -4px;
  border: 0;
  background: transparent;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
}

.live-rec-tag {
  position: absolute;
  top: 44px;
  right: 14px;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(229, 72, 77, 0.92);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.live-rec-tag i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  animation: rec-pulse 1s ease-in-out infinite;
}

@keyframes rec-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.28; }
}

.live-flash {
  position: absolute;
  inset: 0;
  background: #ffffff;
  animation: flash-fade 0.22s ease-out forwards;
}

@keyframes flash-fade {
  from { opacity: 0.9; }
  to { opacity: 0; }
}

.live-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 18px 8px 20px;
  background: #ffffff;
  border-bottom: 1px solid #f0f1f4;
}

.live-action {
  min-width: 0;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: #2b2d33;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
}

.live-action :deep(.live-icon) {
  color: inherit;
  transition: color 0.2s ease, transform 0.16s ease;
}

.live-action:active :deep(.live-icon) {
  transform: scale(0.94);
}

.live-action.recording {
  color: #df5548;
}

.live-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  background: #f7f7f7;
}

.ptz-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0 30px;
}

.ptz-ring {
  position: relative;
  width: min(210px, 56vw);
  height: min(210px, 56vw);
  border-radius: 50%;
  background: #f2f2f4;
}

.ptz-sector {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from -44deg at 50% 50%, rgba(126, 138, 240, 0.16) 0deg 88deg, rgba(126, 138, 240, 0) 88deg 360deg);
  opacity: 0;
  transform: rotate(0deg);
  transition: opacity 0.16s ease, transform 0.22s ease;
  pointer-events: none;
}

.ptz-sector.is-up {
  opacity: 1;
}

.ptz-sector.is-right {
  opacity: 1;
  transform: rotate(90deg);
}

.ptz-sector.is-down {
  opacity: 1;
  transform: rotate(180deg);
}

.ptz-sector.is-left {
  opacity: 1;
  transform: rotate(270deg);
}

.ptz-key {
  position: absolute;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #4b5058;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ptz-key:active,
.ptz-key.is-active {
  color: #2a5bff;
}

.ptz-key.ptz-up {
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
}

.ptz-key.ptz-left {
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.ptz-key.ptz-right {
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.ptz-key.ptz-down {
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
}

.ptz-core {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 92px;
  height: 92px;
  border: 0;
  border-radius: 50%;
  background: transparent;
}

.talk-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 30px;
  text-align: center;
}

.talk-button {
  width: 92px;
  height: 92px;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  color: #4059f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18px 36px rgba(64, 89, 240, 0.16), inset 0 0 0 1px #eceffa;
  transition: background 0.2s ease, color 0.2s ease, transform 0.16s ease;
}

.talk-button:active {
  transform: scale(0.96);
}

.talk-button.active {
  background: linear-gradient(135deg, #5b6cfb 0%, #4059f0 100%);
  color: #ffffff;
  box-shadow: 0 18px 36px rgba(64, 89, 240, 0.28);
}

.talk-title {
  margin-top: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1c1d22;
}

.talk-desc {
  margin-top: 6px;
  font-size: 12.5px;
  color: #9aa2b1;
}

.playback-panel {
  padding-top: 16px;
}

.playback-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.playback-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1c1d22;
}

.playback-more {
  border: 0;
  background: transparent;
  color: #8a93a3;
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.playback-list {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.playback-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 0;
  border-radius: 16px;
  background: #ffffff;
  text-align: left;
  box-shadow: 0 10px 24px rgba(30, 44, 90, 0.05);
}

.playback-item:active {
  background: #f7f9ff;
}

.playback-thumb {
  position: relative;
  width: 96px;
  aspect-ratio: 16 / 10;
  flex: 0 0 96px;
  border-radius: 10px;
  overflow: hidden;
  background: #e4e8f0;
}

.playback-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.playback-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(10, 18, 30, 0.24);
}

.playback-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 5px;
}

.playback-copy strong {
  font-size: 14px;
  font-weight: 600;
  color: #1c1d22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playback-copy span {
  font-size: 12px;
  color: #9aa2b1;
}

.playback-arrow {
  flex: 0 0 auto;
  color: #c0c7d2;
  font-size: 16px;
}

.playback-empty {
  margin-top: 30px;
  padding: 34px 0;
  border-radius: 18px;
  background: #ffffff;
  color: #a9b2c0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
}

.live-tabs {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #eef0f4;
  padding: 8px 12px calc(10px + var(--prototype-safe-bottom));
}

.live-tab {
  min-height: 58px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #2b2d33;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
}

.live-tab.active {
  color: #2a5bff;
}

.live-tab:active {
  background: rgba(64, 89, 240, 0.06);
}

/* 横屏查看 */
.live-fs {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1800;
  transform: rotate(90deg) translateY(-100%);
  transform-origin: top left;
  overflow: hidden;
  background: #060b13;
}

.live-fs-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-fs-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 10, 18, 0.6) 0%, rgba(6, 10, 18, 0.04) 34%, rgba(6, 10, 18, 0.48) 100%);
}

.live-fs-head {
  position: absolute;
  top: 16px;
  left: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #ffffff;
}

.live-fs-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.live-fs-title span {
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.live-fs-title em {
  font-style: normal;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.6);
}

.live-fs-exit {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border: 0;
  border-radius: 50%;
  background: rgba(10, 18, 30, 0.42);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.live-fs-foot {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  font-size: 12px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.live-fs-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.live-fs-speed {
  padding: 0;
  background: none;
}

.live-fs-landscape {
  width: 34px;
  height: 34px;
  border: 0;
  background: transparent;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
}

.live-fs-enter-active,
.live-fs-leave-active {
  transition: opacity 0.24s ease;
}

.live-fs-enter-from,
.live-fs-leave-to {
  opacity: 0;
}
</style>
