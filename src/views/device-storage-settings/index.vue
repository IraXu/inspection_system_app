<template>
  <div class="storage-page">
    <svg class="icon-sprite" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="set-schedule" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="1.9" />
          <path
            d="M12 7.4v4.9l3.1 1.8"
            fill="none"
            stroke="#3d43f2"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </symbol>
        <symbol id="set-quality" viewBox="0 0 24 24">
          <rect
            x="3.4"
            y="6.2"
            width="17.2"
            height="11.6"
            rx="2.6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <path
            d="M7.2 9.9v4.2M7.2 12h2.3M9.5 9.9v4.2"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
          <path
            d="M12.8 9.9h1.5a2.1 2.1 0 0 1 0 4.2h-1.5V9.9Z"
            fill="none"
            stroke="#3d43f2"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
        </symbol>
      </defs>
    </svg>

    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <LiveIcon name="back" :size="24" />
      </button>
      <h1 class="page-title">存储设置</h1>
    </header>

    <section class="app-section section">
      <div class="settings-card">
        <button type="button" class="menu-item" @click="openScheduleSheet">
          <svg class="ui-icon menu-icon" viewBox="0 0 24 24" aria-hidden="true">
            <use href="#set-schedule" />
          </svg>
          <span class="menu-title">录制时间</span>
          <span class="menu-value">{{ scheduleLabel }}</span>
          <t-icon name="chevron-right" size="20" class="menu-arrow" />
        </button>
      </div>
    </section>

    <section class="app-section section">
      <div class="settings-card storage-card">
        <div class="storage-seg">
          <button
            type="button"
            class="seg-item"
            :class="{ 'is-active': activeStorage === 'cloud' }"
            @click="activeStorage = 'cloud'"
          >
            云存储
          </button>
          <button
            type="button"
            class="seg-item"
            :class="{ 'is-active': activeStorage === 'card' }"
            @click="activeStorage = 'card'"
          >
            存储卡
          </button>
        </div>

        <div class="storage-panel">
          <div class="storage-head">
            <div class="storage-copy">
              <strong>{{ activeStorage === 'cloud' ? '云存储' : '存储卡' }}</strong>
              <span v-if="activeStorage === 'card'">设备离线后无法查看录像</span>
            </div>
            <span
              class="status-pill"
              :class="{
                'is-neutral': activeStorage === 'card',
                'is-off': activeStorage === 'cloud' && !cloudActivated
              }"
            >
              {{ storageStatusLabel }}
            </span>
          </div>

          <template v-if="activeStorage === 'cloud'">
            <div v-if="cloudPlan" class="cloud-plan-meta">
              <div class="cloud-meta-item">
                <span>当前套餐</span>
                <strong>{{ cloudPlan.name }}</strong>
              </div>
              <div class="cloud-meta-item">
                <span>剩余天数</span>
                <strong class="is-accent">{{ cloudPlan.remainingDays }} 天</strong>
              </div>
            </div>
            <button v-else type="button" class="open-plan-btn" @click="goCloudPlan">
              去开通套餐
            </button>
          </template>

          <template v-else>
            <div class="usage-row">
              <div class="usage-bar">
                <i
                  :class="{ 'is-danger': cardPercent >= 80 }"
                  :style="{ width: `${usage.percent}%` }"
                ></i>
              </div>
              <span class="usage-remain">剩余 {{ usage.remainingText }}</span>
            </div>

            <p class="usage-note">{{ usage.note }}</p>

            <button type="button" class="panel-row" @click="showQualitySheet = true">
              <svg class="ui-icon panel-icon" viewBox="0 0 24 24" aria-hidden="true">
                <use href="#set-quality" />
              </svg>
              <span class="panel-label">录像清晰度</span>
              <span class="panel-value">{{ qualityLabel }}</span>
              <t-icon name="chevron-right" size="16" class="panel-chevron" />
            </button>

            <button type="button" class="format-btn" @click="showFormatSheet = true">
              格式化存储卡
            </button>
          </template>
        </div>
      </div>
    </section>

    <transition name="sheet">
      <div v-if="showScheduleSheet" class="sheet-layer" @click.self="showScheduleSheet = false">
        <div class="sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-title">录制时间</div>

          <div class="option-list">
            <button
              v-for="option in scheduleOptions"
              :key="option.value"
              type="button"
              class="option-item"
              :class="{ 'is-active': pendingScheduleMode === option.value }"
              @click="pendingScheduleMode = option.value"
            >
              <span class="option-copy">
                <strong>{{ option.label }}</strong>
                <small>{{ option.desc }}</small>
              </span>
              <t-icon
                v-if="pendingScheduleMode === option.value"
                name="check"
                size="20"
                class="option-check"
              />
            </button>
          </div>

          <div v-if="pendingScheduleMode === 'custom'" class="time-range">
            <label class="time-field">
              <span>开始时间</span>
              <input v-model="pendingStart" type="time" step="60" />
            </label>
            <span class="time-sep">至</span>
            <label class="time-field">
              <span>结束时间</span>
              <input v-model="pendingEnd" type="time" step="60" />
            </label>
          </div>

          <button type="button" class="sheet-primary is-brand" @click="confirmSchedule">确定</button>
          <button type="button" class="sheet-cancel" @click="showScheduleSheet = false">取消</button>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="showQualitySheet" class="sheet-layer" @click.self="showQualitySheet = false">
        <div class="sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-title">录像清晰度</div>

          <div class="option-list">
            <button
              v-for="option in qualityOptions"
              :key="option.value"
              type="button"
              class="option-item"
              :class="{ 'is-active': quality === option.value }"
              @click="selectQuality(option)"
            >
              <span class="option-copy">
                <strong>{{ option.label }}</strong>
                <small>{{ option.desc }}</small>
              </span>
              <t-icon
                v-if="quality === option.value"
                name="check"
                size="20"
                class="option-check"
              />
            </button>
          </div>

          <button type="button" class="sheet-cancel" @click="showQualitySheet = false">取消</button>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="showFormatSheet" class="sheet-layer" @click.self="showFormatSheet = false">
        <div class="sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-title">格式化存储卡</div>
          <div class="sheet-desc">格式化后，存储卡内所有录像都会被清空，请谨慎考虑。</div>
          <button type="button" class="sheet-primary" @click="confirmFormat">继续格式化</button>
          <button type="button" class="sheet-cancel" @click="showFormatSheet = false">取消</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useCloudStore } from '../../stores/cloud'
import LiveIcon from '../../components/LiveIcon.vue'

const route = useRoute()
const router = useRouter()
const cloudStore = useCloudStore()

const deviceId = computed(() => route.params.id)
const cloudPlan = computed(() => cloudStore.getPlan(deviceId.value))
const cloudActivated = computed(() => Boolean(cloudPlan.value))

const activeStorage = ref('cloud')

const cardTotalGb = 64
const cardUsedGb = ref(42.8)

const cardPercent = computed(() => Math.round((cardUsedGb.value / cardTotalGb) * 100))

const usage = computed(() => {
  return {
    percent: cardPercent.value,
    remainingText: `${(cardTotalGb - cardUsedGb.value).toFixed(1)}GB`,
    note: '注：请谨慎格式化，格式化后卡内所有内容被清除。为保证录像质量，请使用读写速度为 Class10 以上的 TF 卡。'
  }
})

const storageStatusLabel = computed(() => {
  if (activeStorage.value === 'card') return '已插入'
  return cloudActivated.value ? '已开通' : '未开通'
})

const scheduleOptions = [
  { value: 'all', label: '全天录像', desc: '00:00 - 24:00 持续录制' },
  { value: 'custom', label: '自定义时段', desc: '设置每天固定的录制时间段' }
]

const scheduleMode = ref('all')
const startTime = ref('08:00')
const endTime = ref('20:00')

const pendingScheduleMode = ref('all')
const pendingStart = ref('08:00')
const pendingEnd = ref('20:00')

const showScheduleSheet = ref(false)
const showQualitySheet = ref(false)
const showFormatSheet = ref(false)

const scheduleLabel = computed(() => {
  return scheduleMode.value === 'all' ? '全天' : `${startTime.value} - ${endTime.value}`
})

const qualityOptions = [
  { value: 'ultra', label: '超清', desc: '1080P 高码率，画面细节更清晰' },
  { value: 'hd', label: '高清', desc: '720P 标准码率，更节省存储空间' }
]

const quality = ref('hd')

const qualityLabel = computed(
  () => qualityOptions.find((option) => option.value === quality.value)?.label || '高清'
)

const goBack = () => {
  router.back()
}

const goCloudPlan = () => {
  router.push(`/cloud-plan/${deviceId.value}`)
}

const openScheduleSheet = () => {
  pendingScheduleMode.value = scheduleMode.value
  pendingStart.value = startTime.value
  pendingEnd.value = endTime.value
  showScheduleSheet.value = true
}

const confirmSchedule = () => {
  if (pendingScheduleMode.value === 'custom') {
    if (!pendingStart.value || !pendingEnd.value) {
      Toast('请设置完整的录制时间段')
      return
    }
    if (pendingStart.value >= pendingEnd.value) {
      Toast('结束时间需晚于开始时间')
      return
    }
    startTime.value = pendingStart.value
    endTime.value = pendingEnd.value
  }

  scheduleMode.value = pendingScheduleMode.value
  showScheduleSheet.value = false
  Toast.success(scheduleMode.value === 'all' ? '已切换为全天录像' : '录制时间已更新')
}

const selectQuality = (option) => {
  showQualitySheet.value = false
  if (quality.value === option.value) return

  quality.value = option.value
  Toast.success(`已切换至${option.label}`)
}

const confirmFormat = () => {
  showFormatSheet.value = false
  cardUsedGb.value = 0
  Toast.success('存储卡已格式化')
}
</script>

<style scoped>
.storage-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(120% 48% at 6% 0%, rgba(224, 212, 250, 0.9) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 46% at 100% 100%, rgba(206, 240, 235, 0.95) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f2edfb 0%, #edf2fb 44%, #e9f5f3 100%);
  padding-bottom: calc(24px + var(--prototype-safe-bottom));
}

.page-top {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: calc(var(--prototype-safe-top) + 10px) 16px 0 14px;
}

.back-entry {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  margin-left: -2px;
  border: 0;
  background: transparent;
  color: #16171d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.back-entry:active {
  opacity: 0.6;
}

.page-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  color: #16171d;
  letter-spacing: 0.01em;
}

.section {
  padding-top: 16px;
}

.settings-card {
  padding: 2px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 19px 0;
  border: 0;
  background: transparent;
  text-align: left;
  font-family: inherit;
}

.menu-item:active {
  opacity: 0.6;
}

.icon-sprite {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.ui-icon {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
}

.menu-icon {
  color: #1c1d22;
}

.panel-icon {
  color: #1c1d22;
}

.menu-title {
  flex: 1;
  min-width: 0;
  font-size: 17px;
  font-weight: 500;
  color: #1c1d22;
}

.menu-value {
  flex: 0 0 auto;
  font-size: 14px;
  color: #9a9ba3;
}

.menu-arrow {
  flex: 0 0 auto;
  color: #1c1d22;
}

.storage-card {
  padding: 16px 20px 18px;
}

.storage-seg {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px;
  padding: 4px;
  border-radius: 14px;
  background: #f1f3f9;
}

.seg-item {
  height: 38px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: #6f7078;
  font-size: 14.5px;
  font-weight: 600;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.seg-item.is-active {
  background: #ffffff;
  color: #4a5cff;
  box-shadow: 0 6px 16px rgba(90, 105, 180, 0.12);
}

.storage-panel {
  margin-top: 18px;
}

.storage-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.storage-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.storage-copy strong {
  font-size: 16px;
  font-weight: 600;
  color: #1c1d22;
}

.storage-copy span {
  font-size: 12.5px;
  line-height: 1.5;
  color: #9a9ba3;
}

.status-pill {
  flex: 0 0 auto;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: rgba(18, 165, 148, 0.12);
  color: #12906f;
  font-size: 12px;
  font-weight: 600;
}

.status-pill.is-neutral {
  background: rgba(74, 92, 255, 0.1);
  color: #4a5cff;
}

.status-pill.is-off {
  background: rgba(140, 150, 165, 0.14);
  color: #8c96a5;
}

.usage-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.usage-bar {
  flex: 1;
  min-width: 0;
  height: 6px;
  border-radius: 999px;
  background: #edeef4;
  overflow: hidden;
}

.usage-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8fb4ff 0%, #4a5cff 100%);
  transition: width 0.35s ease, background 0.3s ease;
}

.usage-bar i.is-danger {
  background: linear-gradient(90deg, #ff8a80 0%, #e5372b 100%);
}

.usage-remain {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 500;
  color: #4a5cff;
}

.usage-note {
  margin: 10px 0 0;
  font-size: 11.5px;
  line-height: 1.6;
  color: #9a9ba3;
}

.cloud-plan-meta {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.cloud-meta-item {
  padding: 12px 14px;
  border: 1px solid rgba(22, 23, 29, 0.05);
  border-radius: 14px;
  background: #f7f7fa;
  display: grid;
  gap: 4px;
}

.cloud-meta-item span {
  font-size: 11.5px;
  color: #9a9ba3;
}

.cloud-meta-item strong {
  font-size: 14px;
  font-weight: 600;
  color: #1c1d22;
}

.cloud-meta-item strong.is-accent {
  color: #4a5cff;
}

.open-plan-btn {
  width: 100%;
  height: 46px;
  margin-top: 16px;
  border: 0;
  border-radius: 23px;
  background: linear-gradient(135deg, #5b5ef7 0%, #3d43f2 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  box-shadow: 0 10px 22px rgba(61, 67, 242, 0.22);
}

.open-plan-btn:active {
  filter: brightness(0.94);
}

.panel-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 14px 0 0;
  border: 0;
  border-top: 1px solid rgba(28, 29, 34, 0.05);
  background: transparent;
  text-align: left;
  font-family: inherit;
}

.panel-row:active {
  opacity: 0.6;
}

.panel-label {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 500;
  color: #1c1d22;
}

.panel-value {
  flex: 0 0 auto;
  font-size: 13.5px;
  color: #9a9ba3;
}

.panel-chevron {
  flex: 0 0 auto;
  color: #1c1d22;
}

.format-btn {
  width: 100%;
  height: 46px;
  margin-top: 14px;
  border: 1px solid rgba(229, 55, 43, 0.24);
  border-radius: 23px;
  background: #fff7f6;
  color: #e5372b;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
}

.format-btn:active {
  background: #ffefed;
}

.sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 1600;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.sheet {
  width: 100%;
  padding: 10px 20px calc(12px + var(--prototype-safe-bottom));
  border-radius: 26px 26px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
  text-align: center;
}

.sheet-handle {
  display: block;
  width: 42px;
  height: 5px;
  margin: 0 auto 26px;
  border-radius: 999px;
  background: #e5e5e8;
}

.sheet-title {
  font-size: 21px;
  font-weight: 700;
  color: #16171d;
}

.sheet-desc {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #9a9ba3;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
}

.option-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(22, 23, 29, 0.06);
  border-radius: 16px;
  background: #f7f7fa;
  text-align: left;
  font-family: inherit;
}

.option-item.is-active {
  border-color: rgba(61, 67, 242, 0.5);
  background: rgba(61, 67, 242, 0.06);
}

.option-item:active {
  opacity: 0.72;
}

.option-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-copy strong {
  font-size: 16px;
  font-weight: 600;
  color: #1c1d22;
}

.option-copy small {
  font-size: 12px;
  color: #9a9ba3;
}

.option-check {
  flex: 0 0 auto;
  color: #3d43f2;
}

.time-range {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.time-field {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 6px;
  text-align: left;
}

.time-field span {
  font-size: 11.5px;
  color: #9a9ba3;
}

.time-field input {
  width: 100%;
  height: 46px;
  padding: 0 12px;
  border: 1px solid rgba(22, 23, 29, 0.08);
  border-radius: 14px;
  background: #f7f7fa;
  color: #1c1d22;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  outline: none;
}

.time-field input:focus {
  border-color: rgba(61, 67, 242, 0.5);
  background: #ffffff;
}

.time-sep {
  padding-bottom: 14px;
  font-size: 13px;
  color: #9a9ba3;
}

.sheet-primary {
  width: 100%;
  height: 54px;
  margin-top: 20px;
  border: 0;
  border-radius: 27px;
  background: linear-gradient(135deg, #ff6a5f 0%, #e5372b 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  font-family: inherit;
  box-shadow: 0 12px 24px rgba(229, 55, 43, 0.22);
}

.sheet-primary.is-brand {
  background: linear-gradient(135deg, #5b5ef7 0%, #3d43f2 100%);
  box-shadow: 0 12px 24px rgba(61, 67, 242, 0.24);
}

.sheet-primary:active {
  filter: brightness(0.94);
}

.sheet-cancel {
  width: 100%;
  height: 48px;
  margin-top: 6px;
  border: 0;
  background: transparent;
  color: #6b6c76;
  font-size: 17px;
  font-weight: 500;
  font-family: inherit;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.22s ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translate3d(0, 100%, 0);
}
</style>
