<template>
  <div class="notifications-page app-page app-page--navbar">
    <t-navbar title="设备消息" left-arrow class="page-navbar" @left-click="goBack">
      <template #right>
        <button type="button" class="navbar-action" @click="toggleManage">
          {{ manageMode ? '完成' : '管理' }}
        </button>
      </template>
    </t-navbar>

    <div class="list-head">
      <div class="list-head-copy">
        <div class="list-head-date">{{ selectedDateLabel }}</div>
        <div class="list-head-note">
          共 {{ filteredNotifications.length }} 条告警 · 全部 {{ notifications.length }} 条
        </div>
      </div>
      <button type="button" class="filter-entry" @click="filterVisible = true">
        筛选
        <span v-if="activeFilterCount" class="filter-entry-badge">{{ activeFilterCount }}</span>
      </button>
    </div>

    <div class="date-bar">
      <button type="button" class="date-arrow" @click="changeDate(-1)">‹</button>
      <button type="button" class="date-current" @click="dateVisible = true">
        <t-icon name="calendar" />
        {{ selectedDateLabel }}
      </button>
      <button type="button" class="date-arrow" :disabled="isToday" @click="changeDate(1)">›</button>
    </div>

    <div v-if="activeFilterCount" class="active-filters">
      <span v-if="filters.region" class="active-filter" @click="filters.region = ''">
        {{ filters.region }} ×
      </span>
      <span v-if="filters.eventType" class="active-filter" @click="filters.eventType = ''">
        {{ eventLabel(filters.eventType) }} ×
      </span>
      <span v-if="filters.deviceName" class="active-filter" @click="filters.deviceName = ''">
        设备：{{ filters.deviceName }} ×
      </span>
      <span v-if="filters.license" class="active-filter" @click="filters.license = ''">
        License：{{ filters.license }} ×
      </span>
      <button type="button" class="active-filter-clear" @click="resetFilters">清除筛选</button>
    </div>

    <div class="message-list">
      <div
        v-for="item in filteredNotifications"
        :key="item.id"
        class="message-card"
        :class="{ 'is-selected': selectedIds.includes(item.id) }"
        @click="onCardClick(item)"
      >
        <span v-if="manageMode" class="check-dot" :class="{ 'is-on': selectedIds.includes(item.id) }">✓</span>

        <div class="message-thumb">
          <img :src="item.eventImage" alt="" @error="hideBrokenImage" />
        </div>

        <div class="message-body">
          <div class="message-type">{{ eventLabel(item.eventType) }}</div>
          <div class="message-device">{{ item.deviceName }}</div>
          <div class="message-time">
            <t-icon name="time" />
            {{ item.time }}
          </div>
          <div class="message-org">
            <t-icon name="location" />
            {{ item.orgPath }}
          </div>
        </div>

        <span class="message-arrow">
          <t-icon name="chevron-right" />
        </span>
      </div>

      <div v-if="!filteredNotifications.length" class="message-empty app-card">
        <div class="message-empty-icon">
          <t-icon name="notification" />
        </div>
        <div class="message-empty-title">{{ selectedDateLabel }}暂无告警消息</div>
        <div class="message-empty-note">可切换其他日期或调整筛选条件</div>
      </div>
    </div>

    <div v-if="manageMode" class="manage-bar">
      <button type="button" class="manage-select" @click="toggleSelectAll">
        {{ allSelected ? '取消全选' : '全选' }}
      </button>
      <span class="manage-count">已选 {{ selectedIds.length }} 条</span>
      <button
        type="button"
        class="manage-delete"
        :disabled="!selectedIds.length"
        @click="deleteDialogVisible = true"
      >
        删除
      </button>
    </div>

    <t-popup v-model:visible="filterVisible" placement="bottom">
      <div class="filter-sheet">
        <div class="sheet-head">
          <div>
            <div class="sheet-title">筛选告警</div>
            <div class="sheet-subtitle">按所属区域、事件类型、设备与 License 组合筛选</div>
          </div>
          <button type="button" class="sheet-close" @click="filterVisible = false">
            <t-icon name="close" />
          </button>
        </div>

        <div class="filter-group">
          <div class="filter-group-title">所属区域</div>
          <div class="filter-chips">
            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': !filters.region }"
              @click="filters.region = ''"
            >
              全部
            </button>
            <button
              v-for="region in regionOptions"
              :key="region"
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.region === region }"
              @click="filters.region = region"
            >
              {{ region }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title">事件类型</div>
          <div class="filter-chips">
            <button
              type="button"
              class="filter-chip"
              :class="{ 'is-active': !filters.eventType }"
              @click="filters.eventType = ''"
            >
              全部
            </button>
            <button
              v-for="type in eventTypes"
              :key="type.value"
              type="button"
              class="filter-chip"
              :class="{ 'is-active': filters.eventType === type.value }"
              @click="filters.eventType = type.value"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-group-title">设备名称</div>
          <input
            v-model="filters.deviceName"
            class="filter-input"
            placeholder="请输入设备名称，如：摄像头-收银台"
          />
        </div>

        <div class="filter-group">
          <div class="filter-group-title">License</div>
          <input
            v-model="filters.license"
            class="filter-input"
            placeholder="请输入设备 License"
          />
        </div>

        <div class="filter-footer">
          <button type="button" class="filter-btn filter-btn--ghost" @click="resetFilters">重置</button>
          <button type="button" class="filter-btn filter-btn--primary" @click="filterVisible = false">
            查看 {{ filteredNotifications.length }} 条结果
          </button>
        </div>
      </div>
    </t-popup>

    <t-popup v-model:visible="dateVisible" placement="bottom">
      <div class="date-sheet">
        <div class="sheet-head">
          <div>
            <div class="sheet-title">切换告警日期</div>
            <div class="sheet-subtitle">默认展示当日告警，可查看近 6 天记录</div>
          </div>
          <button type="button" class="sheet-close" @click="dateVisible = false">
            <t-icon name="close" />
          </button>
        </div>
        <div class="date-options">
          <button
            v-for="option in dateOptions"
            :key="option.key"
            type="button"
            class="date-option"
            :class="{ 'is-active': option.key === selectedDate }"
            @click="selectDate(option.key)"
          >
            <span class="date-option-week">{{ option.week }}</span>
            <span class="date-option-date">{{ option.label }}</span>
            <span class="date-option-count">{{ option.count }} 条</span>
          </button>
        </div>
      </div>
    </t-popup>

    <div v-if="deleteDialogVisible" class="dialog-overlay" @click="deleteDialogVisible = false">
      <div class="dialog app-card" @click.stop>
        <div class="dialog-icon">
          <t-icon name="error-circle-filled" />
        </div>
        <div class="dialog-title">删除告警消息</div>
        <div class="dialog-content">
          确认删除所选 {{ selectedIds.length }} 条告警记录吗？删除后将无法恢复。
        </div>
        <div class="dialog-actions">
          <button type="button" class="dialog-btn dialog-btn--ghost" @click="deleteDialogVisible = false">
            取消
          </button>
          <button type="button" class="dialog-btn dialog-btn--danger" @click="confirmDelete">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { useNotificationStore } from '../../stores/notifications'
import { alertEventTypes, eventTypeMap } from '../../data/device-notifications'

const router = useRouter()
const notificationStore = useNotificationStore()

const pad = (value) => String(value).padStart(2, '0')

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const selectedDate = ref(toDateKey(new Date()))
const manageMode = ref(false)
const selectedIds = ref([])
const filterVisible = ref(false)
const dateVisible = ref(false)
const deleteDialogVisible = ref(false)

const filters = reactive({
  region: '',
  eventType: '',
  deviceName: '',
  license: ''
})

const regionOptions = ['华东区', '华北区', '华南区']
const eventTypes = alertEventTypes

const notifications = computed(() => notificationStore.items)

const todayKey = toDateKey(new Date())

const isToday = computed(() => selectedDate.value === todayKey)

const selectedDateLabel = computed(() => {
  const date = new Date(selectedDate.value.replace(/-/g, '/'))
  const prefix = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  if (selectedDate.value === todayKey) return `${prefix} 今天`
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (selectedDate.value === toDateKey(yesterday)) return `${prefix} 昨天`
  const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${prefix} ${weekMap[date.getDay()]}`
})

const dateOptions = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index)
    const key = toDateKey(date)
    const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const count = notifications.value.filter((item) => item.timestamp.startsWith(key)).length
    return {
      key,
      label: `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      week: index === 0 ? '今天' : index === 1 ? '昨天' : weekMap[date.getDay()],
      count
    }
  })
)

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.region) count += 1
  if (filters.eventType) count += 1
  if (filters.deviceName.trim()) count += 1
  if (filters.license.trim()) count += 1
  return count
})

const eventLabel = (value) => eventTypeMap[value]?.label || '其他事件'

const filteredNotifications = computed(() => {
  const deviceText = filters.deviceName.trim().toLowerCase()
  const licenseText = filters.license.trim().toLowerCase()

  return notifications.value
    .filter((item) => {
      if (!item.timestamp.startsWith(selectedDate.value)) return false
      if (filters.region && !item.orgPath.startsWith(filters.region)) return false
      if (filters.eventType && item.eventType !== filters.eventType) return false
      if (deviceText && !item.deviceName.toLowerCase().includes(deviceText)) return false
      if (licenseText && !item.license.toLowerCase().includes(licenseText)) return false
      return true
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
})

const allSelected = computed(
  () =>
    filteredNotifications.value.length > 0 &&
    filteredNotifications.value.every((item) => selectedIds.value.includes(item.id))
)

const changeDate = (offset) => {
  const date = new Date(selectedDate.value.replace(/-/g, '/'))
  date.setDate(date.getDate() + offset)
  const nextKey = toDateKey(date)
  if (nextKey > todayKey) return
  selectedDate.value = nextKey
  selectedIds.value = []
}

const selectDate = (key) => {
  selectedDate.value = key
  selectedIds.value = []
  dateVisible.value = false
}

const goBack = () => {
  router.back()
}

const toggleManage = () => {
  manageMode.value = !manageMode.value
  selectedIds.value = []
}

const toggleSelect = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
    return
  }
  selectedIds.value = filteredNotifications.value.map((item) => item.id)
}

const onCardClick = (item) => {
  if (manageMode.value) {
    toggleSelect(item.id)
    return
  }
  router.push(`/device-notifications/${item.id}`)
}

const resetFilters = () => {
  filters.region = ''
  filters.eventType = ''
  filters.deviceName = ''
  filters.license = ''
}

const confirmDelete = () => {
  notificationStore.removeAlerts(selectedIds.value)
  Toast.success(`已删除 ${selectedIds.value.length} 条告警`)
  selectedIds.value = []
  deleteDialogVisible.value = false
  manageMode.value = false
}

const hideBrokenImage = (event) => {
  event.target.style.opacity = '0'
}
</script>

<style scoped>
.notifications-page {
  background:
    radial-gradient(circle at top right, rgba(38, 111, 232, 0.14), transparent 34%),
    linear-gradient(180deg, #f2f7ff 0%, #f7f8fb 28%, #f5f7fb 100%);
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

.navbar-action {
  border: 0;
  background: transparent;
  color: var(--theme-primary-strong);
  font-size: 13px;
  font-weight: 600;
  padding: 4px;
}

.list-head {
  margin: 16px 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.list-head-date {
  font-size: 21px;
  font-weight: 700;
  color: #173153;
}

.list-head-note {
  margin-top: 6px;
  font-size: 12px;
  color: #7a8ba0;
}

.filter-entry {
  position: relative;
  flex: 0 0 auto;
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(var(--theme-primary-rgb), 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--theme-primary-strong);
  font-size: 12px;
  font-weight: 700;
}

.filter-entry-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  margin-left: 4px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--theme-primary-strong);
  color: #fff;
  font-size: 10px;
}

.date-bar {
  margin: 12px 16px 0;
  padding: 6px;
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  gap: 6px;
  align-items: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(228, 235, 244, 0.96);
  box-shadow: 0 8px 20px rgba(20, 34, 66, 0.05);
}

.date-arrow {
  height: 36px;
  border: 0;
  border-radius: 12px;
  background: rgba(240, 245, 251, 0.96);
  color: #4f7a9c;
  font-size: 20px;
  line-height: 1;
}

.date-arrow:disabled {
  opacity: 0.35;
}

.date-current {
  height: 36px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--theme-glass-4-rgb), 0.5) 0%, rgba(var(--theme-primary-rgb), 0.24) 100%);
  color: #1f5a7b;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.active-filters {
  margin: 10px 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.active-filter {
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(var(--theme-primary-rgb), 0.1);
  color: var(--theme-primary-strong);
  font-size: 11px;
  font-weight: 600;
}

.active-filter-clear {
  border: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  text-decoration: underline;
}

.message-list {
  padding: 14px 16px 90px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  position: relative;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 18px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 10px 28px rgba(20, 34, 66, 0.06);
  border: 1px solid transparent;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.message-card.is-selected {
  border-color: rgba(var(--theme-primary-rgb), 0.5);
  background: rgba(240, 248, 255, 0.96);
}

.message-card:active {
  transform: scale(0.992);
}

.check-dot {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 4;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(148, 163, 184, 0.7);
  background: rgba(255, 255, 255, 0.94);
  color: transparent;
  font-size: 11px;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
}

.check-dot.is-on {
  border-color: var(--theme-primary-strong);
  background: var(--theme-primary-strong);
  color: #fff;
}

.message-thumb {
  position: relative;
  width: 96px;
  height: 76px;
  flex: 0 0 96px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.message-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.2s ease;
}

.message-body {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.message-type {
  font-size: 15px;
  line-height: 21px;
  font-weight: 700;
  color: #111827;
}

.message-device {
  margin-top: 4px;
  font-size: 12px;
  line-height: 18px;
  color: #475569;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time,
.message-org {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  line-height: 17px;
  color: #94a3b8;
}

.message-org {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time :deep(.t-icon),
.message-org :deep(.t-icon) {
  font-size: 12px;
  flex: 0 0 12px;
}

.message-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
  align-self: center;
}

.message-empty {
  padding: 34px 20px;
  text-align: center;
}

.message-empty-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto;
  border-radius: 20px;
  background: linear-gradient(180deg, #e8f2ff 0%, #f4f8ff 100%);
  color: var(--theme-primary-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.message-empty-title {
  margin-top: 14px;
  font-size: 15px;
  font-weight: 700;
  color: #173153;
}

.message-empty-note {
  margin-top: 6px;
  font-size: 12px;
  color: #7d8b9f;
}

.manage-bar {
  position: fixed;
  left: 50%;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: min(calc(var(--prototype-page-width) - 32px), calc(100vw - 32px));
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(226, 234, 244, 0.96);
  box-shadow: 0 14px 30px rgba(11, 31, 68, 0.14);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.manage-select {
  border: 0;
  background: rgba(236, 241, 248, 0.96);
  color: #56708f;
  height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.manage-count {
  flex: 1;
  font-size: 11px;
  color: #7a8ba0;
}

.manage-delete {
  height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: #d54941;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.manage-delete:disabled {
  opacity: 0.45;
}

.filter-sheet,
.date-sheet {
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

.filter-group {
  margin-top: 16px;
}

.filter-group-title {
  font-size: 12px;
  font-weight: 700;
  color: #56708f;
  margin-bottom: 8px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  height: 30px;
  padding: 0 12px;
  border: 1px solid rgba(224, 232, 242, 0.96);
  border-radius: 999px;
  background: #fbfdff;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.filter-chip.is-active {
  border-color: transparent;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
}

.filter-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(225, 233, 243, 0.96);
  border-radius: 12px;
  background: #fbfdff;
  font-size: 13px;
  color: #2f4a68;
  outline: none;
  font-family: inherit;
}

.filter-input:focus {
  border-color: rgba(var(--theme-primary-rgb), 0.55);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(var(--theme-primary-rgb), 0.08);
}

.filter-input::placeholder {
  color: #a9b4c4;
}

.filter-footer {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 10px;
}

.filter-btn {
  height: 42px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.filter-btn--ghost {
  background: rgba(239, 244, 251, 0.96);
  color: #59718f;
}

.filter-btn--primary {
  background: linear-gradient(135deg, var(--theme-glass-4) 0%, var(--theme-primary) 58%, var(--theme-primary-strong) 100%);
  color: #fff;
}

.date-options {
  margin-top: 14px;
  display: grid;
  gap: 8px;
}

.date-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(226, 234, 244, 0.96);
  border-radius: 12px;
  background: #fbfdff;
  text-align: left;
}

.date-option.is-active {
  border-color: rgba(var(--theme-primary-rgb), 0.55);
  background: rgba(var(--theme-primary-rgb), 0.08);
}

.date-option-week {
  width: 42px;
  font-size: 12px;
  font-weight: 700;
  color: #56708f;
}

.date-option-date {
  flex: 1;
  font-size: 12px;
  color: #173153;
  font-weight: 600;
}

.date-option-count {
  font-size: 11px;
  color: #93a0b2;
}

.dialog-overlay {
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

.dialog {
  width: 100%;
  max-width: 320px;
  padding: 22px 20px 18px;
  text-align: center;
}

.dialog-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 18px;
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.dialog-title {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 700;
  color: #173153;
}

.dialog-content {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #6f8199;
}

.dialog-actions {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.dialog-btn {
  height: 42px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.dialog-btn--ghost {
  background: rgba(239, 244, 251, 0.96);
  color: #59718f;
}

.dialog-btn--danger {
  background: #d54941;
  color: #fff;
}
</style>
