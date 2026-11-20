<template>
  <div class="alarm-page">
    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <LiveIcon name="back" :size="24" />
      </button>
      <h1 class="page-title">报警设置</h1>
    </header>

    <section class="app-section section">
      <div class="settings-card">
        <button type="button" class="menu-item" @click="goDetectionTypes">
          <span class="menu-title">侦测类型</span>
          <span class="menu-value is-summary">{{ selectedTypesLabel }}</span>
          <t-icon name="chevron-right" size="20" class="menu-arrow" />
        </button>

        <button type="button" class="menu-item" @click="showSensitivitySheet = true">
          <span class="menu-title">灵敏度</span>
          <span class="menu-value">{{ sensitivityLabel }}</span>
          <t-icon name="chevron-right" size="20" class="menu-arrow" />
        </button>

        <button type="button" class="menu-item" @click="openDetectSheet">
          <span class="menu-copy">
            <span class="menu-title">侦测时段</span>
            <span class="menu-desc">侦测时段内，设备侦测到事件会进行通知</span>
          </span>
          <span class="menu-value">{{ detectLabel }}</span>
          <t-icon name="chevron-right" size="20" class="menu-arrow" />
        </button>
      </div>
    </section>

    <section class="app-section section">
      <div class="settings-card">
        <div class="switch-row">
          <span class="menu-copy">
            <span class="menu-title">远程推送</span>
            <span class="menu-desc">产生事件后将会推送系统通知</span>
          </span>
          <button
            type="button"
            class="switch"
            :class="{ 'is-on': remotePush }"
            :aria-pressed="remotePush"
            aria-label="远程推送"
            @click="toggleRemotePush"
          >
            <i></i>
          </button>
        </div>

        <button
          type="button"
          class="menu-item"
          :class="{ 'is-disabled': !remotePush }"
          :disabled="!remotePush"
          @click="showIntervalSheet = true"
        >
          <span class="menu-copy">
            <span class="menu-title">推送间隔</span>
            <span class="menu-desc">推送间隔内只会进行一次推送</span>
          </span>
          <span class="menu-value">{{ intervalLabel }}</span>
          <t-icon name="chevron-right" size="20" class="menu-arrow" />
        </button>
      </div>
    </section>

    <transition name="sheet">
      <div v-if="showSensitivitySheet" class="sheet-layer" @click.self="showSensitivitySheet = false">
        <div class="sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-title">灵敏度</div>

          <div class="option-list">
            <button
              v-for="option in sensitivityOptions"
              :key="option.value"
              type="button"
              class="option-item"
              :class="{ 'is-active': sensitivity === option.value }"
              @click="selectSensitivity(option)"
            >
              <span class="option-copy">
                <strong>{{ option.label }}</strong>
                <small>{{ option.desc }}</small>
              </span>
              <t-icon v-if="sensitivity === option.value" name="check" size="20" class="option-check" />
            </button>
          </div>

          <button type="button" class="sheet-cancel" @click="showSensitivitySheet = false">取消</button>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="showDetectSheet" class="sheet-layer" @click.self="showDetectSheet = false">
        <div class="sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-title">侦测时段</div>

          <div class="option-list">
            <button
              v-for="option in detectOptions"
              :key="option.value"
              type="button"
              class="option-item"
              :class="{ 'is-active': pendingDetectMode === option.value }"
              @click="pendingDetectMode = option.value"
            >
              <span class="option-copy">
                <strong>{{ option.label }}</strong>
                <small>{{ option.desc }}</small>
              </span>
              <t-icon
                v-if="pendingDetectMode === option.value"
                name="check"
                size="20"
                class="option-check"
              />
            </button>
          </div>

          <div v-if="pendingDetectMode === 'custom'" class="time-range">
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

          <button type="button" class="sheet-primary" @click="confirmDetect">确定</button>
          <button type="button" class="sheet-cancel" @click="showDetectSheet = false">取消</button>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="showIntervalSheet" class="sheet-layer" @click.self="showIntervalSheet = false">
        <div class="sheet">
          <span class="sheet-handle"></span>
          <div class="sheet-title">推送间隔</div>

          <div class="option-list">
            <button
              v-for="option in intervalOptions"
              :key="option.value"
              type="button"
              class="option-item"
              :class="{ 'is-active': pushInterval === option.value }"
              @click="selectInterval(option)"
            >
              <span class="option-copy">
                <strong>{{ option.label }}</strong>
              </span>
              <t-icon v-if="pushInterval === option.value" name="check" size="20" class="option-check" />
            </button>
          </div>

          <button type="button" class="sheet-cancel" @click="showIntervalSheet = false">取消</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { DETECTION_TYPE_OPTIONS } from '../../data/detection-types'
import { useAlarmStore } from '../../stores/alarm'
import LiveIcon from '../../components/LiveIcon.vue'

const route = useRoute()
const router = useRouter()
const alarmStore = useAlarmStore()

const deviceId = computed(() => route.params.id)
const selectedTypes = computed(() => alarmStore.getSelectedTypes(deviceId.value))

const selectedTypesLabel = computed(() =>
  DETECTION_TYPE_OPTIONS.filter((option) => selectedTypes.value.includes(option.value))
    .map((option) => option.label)
    .join('、')
)

const goDetectionTypes = () => {
  router.push(`/detection-types/${deviceId.value}`)
}

const sensitivityOptions = [
  { value: 'low', label: '低', desc: '目标停留较久时触发，减少误报' },
  { value: 'medium', label: '中', desc: '灵敏度适中，兼顾准确与及时' },
  { value: 'high', label: '高', desc: '目标出现即刻触发，响应更灵敏' }
]

const sensitivity = ref('medium')
const showSensitivitySheet = ref(false)

const sensitivityLabel = computed(
  () => sensitivityOptions.find((option) => option.value === sensitivity.value)?.label || '中'
)

const selectSensitivity = (option) => {
  showSensitivitySheet.value = false
  if (sensitivity.value === option.value) return

  sensitivity.value = option.value
  Toast.success(`灵敏度已设为${option.label}`)
}

const detectOptions = [
  { value: 'all', label: '全天', desc: '00:00 - 24:00 持续侦测' },
  { value: 'custom', label: '自定义时段', desc: '设置每天固定的侦测时间段' }
]

const detectMode = ref('all')
const startTime = ref('08:00')
const endTime = ref('20:00')

const pendingDetectMode = ref('all')
const pendingStart = ref('08:00')
const pendingEnd = ref('20:00')

const showDetectSheet = ref(false)

const detectLabel = computed(() => {
  return detectMode.value === 'all' ? '全天' : `${startTime.value} - ${endTime.value}`
})

const openDetectSheet = () => {
  pendingDetectMode.value = detectMode.value
  pendingStart.value = startTime.value
  pendingEnd.value = endTime.value
  showDetectSheet.value = true
}

const confirmDetect = () => {
  if (pendingDetectMode.value === 'custom') {
    if (!pendingStart.value || !pendingEnd.value) {
      Toast('请设置完整的侦测时间段')
      return
    }
    if (pendingStart.value >= pendingEnd.value) {
      Toast('结束时间需晚于开始时间')
      return
    }
    startTime.value = pendingStart.value
    endTime.value = pendingEnd.value
  }

  detectMode.value = pendingDetectMode.value
  showDetectSheet.value = false
  Toast.success(detectMode.value === 'all' ? '已切换为全天侦测' : '侦测时段已更新')
}

const remotePush = ref(true)

const toggleRemotePush = () => {
  remotePush.value = !remotePush.value
  Toast(remotePush.value ? '已开启远程推送' : '已关闭远程推送')
}

const intervalOptions = [
  { value: 1, label: '1 分钟' },
  { value: 5, label: '5 分钟' },
  { value: 10, label: '10 分钟' },
  { value: 30, label: '30 分钟' }
]

const pushInterval = ref(5)
const showIntervalSheet = ref(false)

const intervalLabel = computed(
  () => intervalOptions.find((option) => option.value === pushInterval.value)?.label || '5 分钟'
)

const selectInterval = (option) => {
  showIntervalSheet.value = false
  if (pushInterval.value === option.value) return

  pushInterval.value = option.value
  Toast.success(`推送间隔已设为${option.label}`)
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.alarm-page {
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
  gap: 12px;
  padding: 16px 0;
  border: 0;
  border-top: 1px solid rgba(28, 29, 34, 0.05);
  background: transparent;
  text-align: left;
  font-family: inherit;
}

.settings-card > .menu-item:first-child {
  border-top: 0;
}

.menu-item:active {
  opacity: 0.6;
}

.menu-item.is-disabled {
  opacity: 0.42;
}

.menu-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.menu-title {
  flex: 1;
  min-width: 0;
  font-size: 17px;
  font-weight: 500;
  color: #1c1d22;
}

.menu-desc {
  font-size: 12px;
  line-height: 1.45;
  color: #9a9ba3;
}

.menu-value {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 14px;
  color: #9a9ba3;
}

.menu-value.is-summary {
  max-width: 58%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-arrow {
  flex: 0 0 auto;
  color: #1c1d22;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.switch {
  position: relative;
  flex: 0 0 46px;
  width: 46px;
  height: 27px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #e2e7ee;
  transition: background 0.2s ease;
}

.switch i {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(30, 45, 70, 0.18);
  transition: transform 0.2s ease;
}

.switch.is-on {
  background: linear-gradient(135deg, #5b6cfb 0%, #4059f0 100%);
}

.switch.is-on i {
  transform: translateX(19px);
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
  display: grid;
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
  background: linear-gradient(135deg, #5b5ef7 0%, #3d43f2 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  font-family: inherit;
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
