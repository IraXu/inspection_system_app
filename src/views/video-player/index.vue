<template>
  <div class="video-page app-page app-page--navbar">
    <t-navbar
      :title="deviceName"
      left-arrow
      @left-click="goBack"
      class="video-navbar"
    >
      <template #right>
        <t-button
          theme="default"
          shape="circle"
          variant="text"
          size="small"
          class="nav-action"
          @click="showDeviceSettings"
        >
          <template #icon><t-icon name="setting" /></template>
        </t-button>
      </template>
    </t-navbar>

    <div class="video-stage">
      <div class="video-stage-mask"></div>
      <div class="video-overlay-grid"></div>
      <div class="video-top-info">
        <span class="video-timestamp">{{ currentDateText }}</span>
        <div class="video-signal">
          <span>{{ networkSpeed }}</span>
          <t-icon :name="isMuted ? 'sound-mute' : 'sound'" size="18px" />
        </div>
      </div>

      <div class="video-center">
        <t-loading v-if="videoLoading" text="视频加载中..." size="40px" />
        <div v-else class="video-placeholder">
          <div class="focus-frame"></div>
          <div class="placeholder-copy">
            <p class="placeholder-title">实时监控画面</p>
            <p class="placeholder-desc">{{ deviceLocation }}</p>
          </div>
        </div>
      </div>

      <button type="button" class="quality-badge" @click="cycleQuality">
        {{ currentQualityLabel }}
      </button>
    </div>

    <div class="action-strip app-section">
      <button type="button" class="strip-action" :class="{ active: !isMuted }" @click="toggleMute">
        <div class="strip-icon">
          <t-icon :name="isMuted ? 'sound-mute' : 'sound'" size="24px" />
        </div>
        <span>{{ isMuted ? '静音' : '声音' }}</span>
      </button>
      <button type="button" class="strip-action" :class="{ record: isRecording }" @click="toggleRecording">
        <div class="strip-icon">
          <t-icon :name="isRecording ? 'video-stop' : 'video'" size="24px" />
        </div>
        <span>{{ isRecording ? '停止' : '录像' }}</span>
      </button>
      <button type="button" class="strip-action" @click="takeScreenshot">
        <div class="strip-icon">
          <t-icon name="camera" size="24px" />
        </div>
        <span>截图</span>
      </button>
      <button type="button" class="strip-action" :class="{ active: isLightOn }" @click="toggleLight">
        <div class="strip-icon">
          <t-icon :name="isLightOn ? 'lightbulb-filled' : 'lightbulb'" size="24px" />
        </div>
        <span>照明</span>
      </button>
      <button type="button" class="strip-action" @click="toggleFullscreen">
        <div class="strip-icon">
          <t-icon name="fullscreen" size="24px" />
        </div>
        <span>全屏</span>
      </button>
    </div>

    <div class="page-content app-section">
      <div v-if="activeBottomTab === 'ptz'" class="ptz-layout">
        <div class="ptz-panel">
          <div class="ptz-head">
            <h3>云台控制</h3>
            <p>点击方向键调整镜头朝向</p>
          </div>
          <div class="ptz-ring">
            <button type="button" class="ptz-arrow up" @click="ptzControl('up')">
              <t-icon name="caret-up" />
            </button>
            <button type="button" class="ptz-arrow left" @click="ptzControl('left')">
              <t-icon name="caret-left" />
            </button>
            <button type="button" class="ptz-arrow right" @click="ptzControl('right')">
              <t-icon name="caret-right" />
            </button>
            <button type="button" class="ptz-arrow down" @click="ptzControl('down')">
              <t-icon name="caret-down" />
            </button>
            <button type="button" class="ptz-center" @click="stopPtz">
              <span></span>
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeBottomTab === 'talk'" class="sub-panel">
        <div class="sub-panel-icon">
          <t-icon name="microphone-1" size="42px" />
        </div>
        <h3>双向通话</h3>
        <p>保留简洁入口，避免在主监控页堆叠过多操作。</p>
      </div>

      <div v-else-if="activeBottomTab === 'playback'" class="sub-panel">
        <div class="sub-panel-icon">
          <t-icon name="play-circle-filled" size="42px" />
        </div>
        <h3>录像回看</h3>
        <p>回看功能入口保留在底部，符合监控场景常见路径。</p>
      </div>

      <div v-else class="sub-panel feature-grid">
        <button
          v-for="q in qualityOptions"
          :key="q.value"
          type="button"
          class="feature-card"
          :class="{ active: currentQuality === q.value }"
          @click="changeQuality(q.value)"
        >
          <t-icon name="video" size="26px" />
          <span>{{ q.label }}</span>
        </button>
        <button type="button" class="feature-card" @click="showDeviceSettings">
          <t-icon name="setting" size="26px" />
          <span>设置</span>
        </button>
      </div>
    </div>

    <div class="bottom-tabs">
      <button
        v-for="tab in bottomTabs"
        :key="tab.value"
        type="button"
        class="bottom-tab"
        :class="{ active: activeBottomTab === tab.value }"
        @click="activeBottomTab = tab.value"
      >
        <t-icon :name="tab.icon" size="26px" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <t-dialog
      v-model="showScreenshotDialog"
      title="截图预览"
      confirm-btn="保存"
      cancel-btn="取消"
      @confirm="saveScreenshot"
    >
      <div class="screenshot-preview">
        <div class="screenshot-image">
          <div class="screenshot-frame">
            <t-icon name="camera" size="44px" />
            <span>监控截图预览</span>
          </div>
        </div>
        <t-textarea
          v-model="screenshotNote"
          placeholder="添加备注说明..."
          :maxlength="200"
        />
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast, Dialog } from 'tdesign-mobile-vue'

const route = useRoute()
const router = useRouter()

const deviceId = computed(() => route.params.id)
const deviceName = ref('摄像头-车间1入口')
const videoLoading = ref(true)

const isRecording = ref(false)
const recordingTime = ref('00:00')
let recordingTimer = null
let recordingSeconds = 0

const isMuted = ref(false)
const isLightOn = ref(false)
const networkSpeed = ref('124KB/S')
const showScreenshotDialog = ref(false)
const screenshotNote = ref('')
const activeBottomTab = ref('ptz')

const qualityOptions = [
  { label: '流畅', value: 'smooth' },
  { label: '标清', value: 'standard' },
  { label: '超清', value: 'hd' }
]
const currentQuality = ref('hd')

const bottomTabs = [
  { label: '云台', value: 'ptz', icon: 'fullscreen-exit-1' },
  { label: '通话', value: 'talk', icon: 'microphone-1' },
  { label: '回看', value: 'playback', icon: 'play-circle' },
  { label: '功能', value: 'feature', icon: 'view-module' }
]

const deviceNames = {
  1: '摄像头-车间1入口',
  2: '摄像头-车间1出口',
  3: '摄像头-车间2入口',
  4: '摄像头-车间2出口',
  5: '摄像头-仓库区域',
  6: '摄像头-办公区域',
  7: '摄像头-停车场',
  8: '厂区大门'
}

const deviceLocations = {
  1: '生产一区 · 入口闸机',
  2: '生产一区 · 出口通道',
  3: '生产二区 · 入口闸机',
  4: '生产二区 · 出口通道',
  5: '仓储中心 · 货架主通道',
  6: '办公楼 · 前台接待区',
  7: '园区外围 · 停车场北侧',
  8: '厂区外侧 · 正门岗亭'
}

const currentQualityLabel = computed(() => {
  return qualityOptions.find(item => item.value === currentQuality.value)?.label || '标清'
})

const deviceLocation = computed(() => {
  return deviceLocations[deviceId.value] || '监控点位信息待同步'
})

const currentDateText = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
})

onMounted(() => {
  deviceName.value = deviceNames[deviceId.value] || '未知设备'

  setTimeout(() => {
    videoLoading.value = false
  }, 1200)
})

onUnmounted(() => {
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }
})

const goBack = () => {
  if (isRecording.value) {
    Dialog.confirm({
      title: '提示',
      content: '正在录像，确定要退出吗？',
      onConfirm: () => {
        stopRecording()
        router.back()
      }
    })
  } else {
    router.back()
  }
}

const takeScreenshot = () => {
  showScreenshotDialog.value = true
  Toast.success('截图成功')
}

const saveScreenshot = () => {
  showScreenshotDialog.value = false
  screenshotNote.value = ''
  Toast.success('截图已保存')
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = () => {
  isRecording.value = true
  recordingSeconds = 0
  recordingTime.value = '00:00'

  recordingTimer = setInterval(() => {
    recordingSeconds++
    const minutes = Math.floor(recordingSeconds / 60)
    const seconds = recordingSeconds % 60
    recordingTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, 1000)

  Toast.success('开始录像')
}

const stopRecording = () => {
  isRecording.value = false

  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }

  Toast.success('录像已保存')
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  Toast.info(isMuted.value ? '已静音' : '已开启声音')
}

const toggleLight = () => {
  isLightOn.value = !isLightOn.value
  Toast.info(isLightOn.value ? '已打开照明' : '已关闭照明')
}

const showDeviceSettings = () => {
  Toast.info('设备设置功能开发中')
}

const toggleFullscreen = () => {
  Toast.info('全屏功能开发中')
}

const changeQuality = (quality) => {
  currentQuality.value = quality
  const qualityNames = {
    smooth: '流畅',
    standard: '标清',
    hd: '超清'
  }
  Toast.info(`切换到${qualityNames[quality]}`)
}

const cycleQuality = () => {
  const currentIndex = qualityOptions.findIndex(item => item.value === currentQuality.value)
  const nextIndex = (currentIndex + 1) % qualityOptions.length
  changeQuality(qualityOptions[nextIndex].value)
}

const ptzControl = (direction) => {
  const directionNames = {
    up: '向上',
    down: '向下',
    left: '向左',
    right: '向右'
  }
  Toast.info(`云台${directionNames[direction]}转动`)
}

const stopPtz = () => {
  Toast.info('云台已停止')
}
</script>

<style scoped>
.video-page {
  background: #f7f7f7;
  color: #222;
  display: flex;
  flex-direction: column;
}

.video-navbar {
  position: fixed;
  top: var(--prototype-safe-top);
  left: 0;
  right: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.92) !important;
  color: #111;
  border-bottom: 1px solid rgba(228, 235, 244, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.video-navbar :deep(.t-navbar__content),
.video-navbar :deep(.t-navbar__title),
.video-navbar :deep(.t-navbar__right),
.video-navbar :deep(.t-navbar__left) {
  color: #111;
}

.nav-action {
  color: #111 !important;
}

.video-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: linear-gradient(135deg, #c9d2dc 0%, #9eabb8 100%);
  box-shadow: 0 18px 36px rgba(14, 30, 58, 0.12);
}

.video-stage-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 14, 24, 0.28) 0%, rgba(8, 14, 24, 0.02) 26%, rgba(8, 14, 24, 0.34) 100%);
  z-index: 0;
}

.video-overlay-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(124, 238, 131, 0.34) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124, 238, 131, 0.34) 1px, transparent 1px);
  background-size: 38px 38px;
  opacity: 0.18;
  pointer-events: none;
}

.video-top-info {
  position: absolute;
  top: 18px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
  z-index: 2;
}

.video-signal {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(7, 16, 29, 0.36);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.video-timestamp {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(7, 16, 29, 0.36);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.video-center {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  position: relative;
  z-index: 1;
}

.video-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
}

.focus-frame {
  position: absolute;
  top: 14%;
  left: 36%;
  width: 44%;
  height: 58%;
  border: 2px solid rgba(124, 238, 131, 0.8);
}

.placeholder-copy {
  position: absolute;
  left: 14px;
  bottom: 56px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.placeholder-title {
  font-size: 16px;
  font-weight: 600;
}

.placeholder-desc {
  margin-top: 4px;
  font-size: 12px;
}

.quality-badge {
  position: absolute;
  left: 14px;
  bottom: 14px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 13px;
  z-index: 2;
}

.action-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  padding-top: 16px;
  background: linear-gradient(180deg, #f7f7f7 0%, #f4f6fa 100%);
  color: #49566a;
}

.strip-action {
  border: 1px solid rgba(216, 224, 236, 0.9);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 78px;
  padding: 10px 6px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 10px 24px rgba(17, 37, 72, 0.06);
}

.strip-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f4f7fc 0%, #ecf1f8 100%);
  color: #3e5068;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.strip-action.active .strip-icon {
  background: linear-gradient(180deg, #e9f2ff 0%, #dfeaff 100%);
  color: #2268e3;
}

.strip-action.record .strip-icon {
  background: linear-gradient(180deg, #fff0ee 0%, #ffe3de 100%);
  color: #df5548;
}

.strip-action:active .strip-icon {
  transform: scale(0.95);
}

.page-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 22px;
  padding-bottom: 118px;
}

.ptz-layout {
  width: min(100%, 420px);
}

.ptz-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.ptz-head {
  text-align: center;
}

.ptz-head h3 {
  margin: 0;
  font-size: 18px;
  color: #1b2432;
}

.ptz-head p {
  margin-top: 6px;
  font-size: 13px;
  color: #7a8698;
}

.ptz-ring {
  position: relative;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background:
    radial-gradient(circle at center, #ffffff 0 27%, #f7f9fc 27% 53%, #eef2f7 53% 100%);
  box-shadow: 0 18px 42px rgba(15, 33, 68, 0.08), inset 0 0 0 1px #e9edf3;
}

.ptz-arrow,
.ptz-center,
.feature-card,
.bottom-tab {
  border: 0;
  background: transparent;
}

.ptz-arrow {
  position: absolute;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  color: #8e9aae;
  font-size: 30px;
  box-shadow: 0 10px 24px rgba(22, 39, 68, 0.06);
}

.ptz-arrow.up {
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
}

.ptz-arrow.left {
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.ptz-arrow.right {
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.ptz-arrow.down {
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
}

.ptz-center {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: linear-gradient(180deg, #d8dde5 0%, #bfc7d2 100%);
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.74) inset, 0 12px 24px rgba(0, 0, 0, 0.12);
}

.ptz-center span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.8);
}

.sub-panel {
  width: min(100%, 420px);
  min-height: 220px;
  border-radius: 24px;
  border: 1px solid rgba(224, 231, 242, 0.92);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 34px rgba(11, 31, 68, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  color: #666;
}

.sub-panel h3 {
  margin: 0;
  color: #222;
}

.sub-panel p {
  max-width: 260px;
  line-height: 1.5;
}

.sub-panel-icon {
  color: #3c7bff;
}

.feature-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.feature-card {
  padding: 18px 12px;
  border-radius: 18px;
  background: #f7f7f7;
  color: #444;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.feature-card.active {
  color: var(--theme-primary);
  background: #edf4ff;
}

.bottom-tabs {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 10px 12px calc(12px + var(--prototype-safe-bottom));
  background: rgba(245, 247, 250, 0.92);
  border-top: 1px solid rgba(225, 231, 240, 0.9);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.bottom-tab {
  min-height: 64px;
  border-radius: 18px;
  color: #7b8796;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: inset 0 0 0 1px rgba(226, 233, 241, 0.96);
}

.bottom-tab.active {
  color: var(--theme-primary);
  background: linear-gradient(180deg, #eef5ff 0%, #e5efff 100%);
  box-shadow: inset 0 0 0 1px rgba(var(--theme-primary-rgb), 0.4), 0 10px 20px rgba(var(--theme-primary-rgb), 0.1);
}

.screenshot-preview {
  padding: 16px 0;
}

.screenshot-image {
  height: 168px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(var(--theme-primary-strong-rgb), 0.92), rgba(var(--theme-primary-rgb), 0.88)),
    linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.screenshot-frame {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  background: rgba(6, 19, 41, 0.16);
}

@media (max-width: 360px) {
  .page-content {
    padding-left: 12px;
    padding-right: 12px;
  }

  .ptz-layout {
    width: 100%;
  }

  .ptz-ring {
    width: 220px;
    height: 220px;
  }

  .action-strip {
    gap: 8px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .strip-action {
    font-size: 11px;
    min-height: 74px;
  }
}
</style>
