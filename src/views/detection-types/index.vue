<template>
  <div class="detection-page">
    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <LiveIcon name="back" :size="24" />
      </button>
      <h1 class="page-title">侦测类型</h1>
    </header>

    <section class="app-section section">
      <div class="settings-card">
        <button
          v-for="option in supportedOptions"
          :key="option.value"
          type="button"
          class="type-row"
          :aria-pressed="selectedTypes.includes(option.value)"
          @click="toggleType(option)"
        >
          <span class="type-copy">
            <span class="type-name">{{ option.label }}</span>
          </span>
          <span class="type-check" :class="{ 'is-active': selectedTypes.includes(option.value) }">
            <t-icon v-if="selectedTypes.includes(option.value)" name="check" size="14" />
          </span>
        </button>
      </div>
    </section>

    <div class="page-spacer"></div>

    <section class="app-section page-footer">
      <button type="button" class="save-btn" @click="save">保存</button>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { getSupportedDetectionTypes } from '../../data/detection-types'
import { useAlarmStore } from '../../stores/alarm'
import LiveIcon from '../../components/LiveIcon.vue'

const route = useRoute()
const router = useRouter()
const alarmStore = useAlarmStore()

const deviceId = computed(() => route.params.id)
const supportedOptions = computed(() => getSupportedDetectionTypes(deviceId.value))
const selectedTypes = ref([...alarmStore.getSelectedTypes(deviceId.value)])

const toggleType = (option) => {
  const isSelected = selectedTypes.value.includes(option.value)

  if (isSelected && selectedTypes.value.length === 1) {
    Toast('至少开启一种侦测类型')
    return
  }

  selectedTypes.value = isSelected
    ? selectedTypes.value.filter((value) => value !== option.value)
    : [...selectedTypes.value, option.value]
}

const save = () => {
  alarmStore.setSelectedTypes(deviceId.value, selectedTypes.value)
  Toast.success('侦测类型已保存')
  router.back()
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.detection-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(120% 48% at 6% 0%, rgba(224, 212, 250, 0.9) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 46% at 100% 100%, rgba(206, 240, 235, 0.95) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f2edfb 0%, #edf2fb 44%, #e9f5f3 100%);
  padding-bottom: calc(16px + var(--prototype-safe-bottom));
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

.page-tip {
  margin: 10px 16px 0;
  font-size: 13px;
  line-height: 1.5;
  color: #8b90a0;
}

.section {
  padding-top: 18px;
}

.settings-card {
  padding: 2px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 30px rgba(112, 120, 170, 0.07);
}

.type-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border: 0;
  border-top: 1px solid rgba(28, 29, 34, 0.05);
  background: transparent;
  text-align: left;
  font-family: inherit;
}

.type-row:first-child {
  border-top: 0;
}

.type-row:active {
  opacity: 0.6;
}

.type-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.type-name {
  font-size: 17px;
  font-weight: 500;
  color: #1c1d22;
}

.type-check {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(28, 29, 34, 0.16);
  border-radius: 50%;
  color: transparent;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.type-check.is-active {
  border-color: #3d43f2;
  background: #3d43f2;
  color: #ffffff;
}

.page-spacer {
  flex: 1;
  min-height: 28px;
}

.page-footer {
  padding-top: 8px;
}

.save-btn {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 27px;
  background: linear-gradient(135deg, #5b5ef7 0%, #3d43f2 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  font-family: inherit;
  box-shadow: 0 12px 24px rgba(61, 67, 242, 0.24);
}

.save-btn:active {
  filter: brightness(0.94);
}
</style>
