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
        <div class="list-head-date">告警消息</div>
        <div class="list-head-note">
          共 {{ filteredNotifications.length }} 条告警 · 全部 {{ notifications.length }} 条
        </div>
      </div>
      <button type="button" class="filter-entry" @click="filterVisible = true">
        筛选
        <span v-if="activeFilterCount" class="filter-entry-badge">{{ activeFilterCount }}</span>
      </button>
    </div>

    <button type="button" class="date-trigger" @click="calendarVisible = true">
      <span class="date-trigger-icon">
        <t-icon name="calendar" />
      </span>
      <span class="date-trigger-copy">
        <span class="date-trigger-label">告警日期</span>
        <strong class="date-trigger-value">{{ selectedDateLabel }}</strong>
      </span>
      <span class="date-trigger-action">
        选择日期
        <t-icon name="chevron-right" />
      </span>
    </button>

    <div v-if="activeFilterCount" class="active-filters">
      <span v-if="filters.region" class="active-filter" @click="clearRegion">
        {{ regionFilterLabel }} ×
      </span>
      <span v-if="filters.eventType" class="active-filter" @click="filters.eventType = ''">
        {{ eventLabel(filters.eventType) }} ×
      </span>
      <span v-if="filters.keyword" class="active-filter" @click="filters.keyword = ''">
        设备/License：{{ filters.keyword }} ×
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
          <div class="thumb-placeholder" :class="{ 'is-hidden': loadedImageIds.has(item.id) }">
            <AppLogoMark :size="30" />
          </div>
          <img
            v-if="item.eventImage && !failedImageIds.has(item.id)"
            :src="item.eventImage"
            alt=""
            loading="lazy"
            decoding="async"
            :class="{ 'is-loaded': loadedImageIds.has(item.id) }"
            @load="markImageLoaded(item.id)"
            @error="markImageFailed(item.id)"
          />
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

        <div class="filter-body">
          <div class="filter-group">
            <div class="filter-group-head">
              <span>所属区域</span>
            </div>

            <button type="button" class="filter-select" @click="openRegionPicker">
              <span class="filter-select-icon">
                <t-icon name="location" />
              </span>
              <span class="filter-select-copy">
                <strong class="filter-select-value" :class="{ 'is-placeholder': !filters.region }">
                  {{ filters.region ? regionFilterLabel : '全部区域' }}
                </strong>
                <span class="filter-select-hint">
                  {{
                    filters.region
                      ? `${regionFilterCount} 条告警`
                      : `共 ${dateAlertCount} 条告警 · 可按区域 / 门店选择`
                  }}
                </span>
              </span>
              <t-icon name="chevron-right" class="filter-select-arrow" />
            </button>
          </div>

          <div class="filter-group">
            <div class="filter-group-head">
              <span>事件类型</span>
            </div>
            <div class="filter-chips">
              <button
                type="button"
                class="filter-chip"
                :class="{ 'is-active': !filters.eventType }"
                @click="filters.eventType = ''"
              >
                <span>全部</span>
                <em>{{ dateAlertCount }}</em>
              </button>
              <button
                v-for="type in eventTypeOptions"
                :key="type.value"
                type="button"
                class="filter-chip"
                :class="{ 'is-active': filters.eventType === type.value }"
                @click="filters.eventType = type.value"
              >
                <span>{{ type.label }}</span>
                <em>{{ type.count }}</em>
              </button>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-group-head">
              <span>设备名称 / License</span>
            </div>
            <div class="filter-field">
              <t-icon name="search" class="filter-field-icon" />
              <input
                v-model="filters.keyword"
                class="filter-input"
                placeholder="搜索设备名称或 License"
              />
              <button
                v-if="filters.keyword"
                type="button"
                class="filter-field-clear"
                aria-label="清空搜索"
                @click="filters.keyword = ''"
              >
                <t-icon name="close-circle-filled" />
              </button>
            </div>
          </div>
        </div>

        <div class="filter-footer">
          <button type="button" class="filter-btn filter-btn--ghost" @click="resetFilters">重置</button>
          <button type="button" class="filter-btn filter-btn--primary" @click="filterVisible = false">
            查看 {{ filteredNotifications.length }} 条结果
          </button>
        </div>
      </div>
    </t-popup>

    <t-popup
      v-model:visible="regionPickerVisible"
      placement="bottom"
      :z-index="12000"
      @close="closeRegionPicker"
    >
      <div
        class="region-panel"
        :class="{ 'region-panel--dragging': regionDragOffset > 0 }"
        :style="{ '--sheet-drag-offset': `${regionDragOffset}px` }"
      >
        <div class="picker-header">
          <button
            type="button"
            class="picker-grabber"
            aria-label="关闭区域选择"
            @pointerdown.stop.prevent="onRegionDragStart"
          ></button>
          <h3>选择所属区域</h3>
        </div>

        <div class="region-summary">
          <span class="region-summary-label">当前选择</span>
          <strong class="region-summary-value">{{ pendingRegionLabel }}</strong>
          <span class="region-summary-count">{{ pendingRegionCount }} 条</span>
        </div>

        <div class="region-body">
          <button
            type="button"
            class="region-all"
            :class="{ 'is-active': !pendingRegion }"
            @click="pickAllRegions"
          >
            <span class="region-all-icon">
              <t-icon name="app" />
            </span>
            <span class="region-all-copy">
              <span class="region-all-title">全部区域</span>
              <span class="region-all-hint">不限区域与门店</span>
            </span>
            <span class="region-all-count">{{ dateAlertCount }} 条</span>
          </button>

          <div v-for="region in regionTree" :key="region.value" class="region-group">
            <button
              type="button"
              class="region-row"
              :class="{ 'is-active': pendingRegion === region.value }"
              @click="pickRegion(region)"
            >
              <span class="region-row-icon">
                <t-icon name="folder" />
              </span>
              <span class="region-row-copy">
                <span class="region-row-title">{{ region.label }}</span>
                <span class="region-row-hint">{{ region.stores.length }} 个门店</span>
              </span>
              <span class="region-row-count">{{ region.count }} 条</span>
              <t-icon
                v-if="region.stores.length"
                :name="pendingRegion === region.value ? 'chevron-down' : 'chevron-right'"
                class="region-row-arrow"
              />
            </button>

            <div v-if="pendingRegion === region.value && region.stores.length" class="store-list">
              <button
                type="button"
                class="store-row"
                :class="{ 'is-active': !pendingStore }"
                @click="pickStore('')"
              >
                <span class="store-name">全部门店</span>
                <span class="store-count">{{ region.count }} 条</span>
              </button>
              <button
                v-for="store in region.stores"
                :key="store.value"
                type="button"
                class="store-row"
                :class="{ 'is-active': pendingStore === store.value }"
                @click="pickStore(store.value)"
              >
                <span class="store-name">{{ store.label }}</span>
                <span class="store-count">{{ store.count }} 条</span>
              </button>
            </div>
          </div>

          <div v-if="!regionTree.length" class="region-empty">
            <t-icon name="folder-open" size="40px" />
            <p>当日暂无可选区域</p>
          </div>
        </div>

        <div class="picker-footer">
          <button type="button" class="picker-confirm" @click="confirmRegion">
            查看 {{ pendingRegionCount }} 条告警
          </button>
        </div>
      </div>
    </t-popup>

    <t-calendar
      v-model:visible="calendarVisible"
      :value="calendarValue"
      :min-date="calendarMinDate"
      :max-date="calendarMaxDate"
      title="选择告警日期"
      confirm-btn="确定"
      @confirm="onCalendarConfirm"
    />

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
import AppLogoMark from '../../components/AppLogoMark.vue'

const router = useRouter()
const notificationStore = useNotificationStore()

const pad = (value) => String(value).padStart(2, '0')

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const selectedDate = ref(toDateKey(new Date()))
const manageMode = ref(false)
const selectedIds = ref([])
const filterVisible = ref(false)
const calendarVisible = ref(false)
const deleteDialogVisible = ref(false)
const regionPickerVisible = ref(false)
const pendingRegion = ref('')
const pendingStore = ref('')
const regionDragOffset = ref(0)
const loadedImageIds = ref(new Set())
const failedImageIds = ref(new Set())

const markImageLoaded = (id) => {
  loadedImageIds.value.add(id)
}

const markImageFailed = (id) => {
  loadedImageIds.value.delete(id)
  failedImageIds.value.add(id)
}
let regionDragStartY = 0
let regionPointerId = null

const filters = reactive({
  region: '',
  store: '',
  eventType: '',
  keyword: ''
})

const eventTypes = alertEventTypes

const calendarMaxDate = new Date()
const calendarMinDate = new Date()
calendarMinDate.setDate(calendarMinDate.getDate() - 6)
const calendarValue = ref(new Date())

const notifications = computed(() => notificationStore.items)

const todayKey = toDateKey(new Date())

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

const dateScopedNotifications = computed(() =>
  notifications.value.filter((item) => item.timestamp.startsWith(selectedDate.value))
)

const dateAlertCount = computed(() => dateScopedNotifications.value.length)

const eventTypeOptions = computed(() =>
  eventTypes
    .map((type) => ({
      ...type,
      count: dateScopedNotifications.value.filter((item) => item.eventType === type.value).length
    }))
    .filter((type) => type.count > 0)
)

const regionTree = computed(() => {
  const regionMap = new Map()
  dateScopedNotifications.value.forEach((item) => {
    const [regionName, storeName] = item.orgPath.split(' / ')
    if (!regionName) return
    if (!regionMap.has(regionName)) {
      regionMap.set(regionName, { value: regionName, label: regionName, count: 0, stores: new Map() })
    }
    const region = regionMap.get(regionName)
    region.count += 1
    if (!storeName) return
    if (!region.stores.has(storeName)) {
      region.stores.set(storeName, { value: storeName, label: storeName, count: 0 })
    }
    region.stores.get(storeName).count += 1
  })
  return [...regionMap.values()].map((region) => ({
    ...region,
    stores: [...region.stores.values()]
  }))
})

const regionFilterLabel = computed(() => {
  if (!filters.region) return ''
  return filters.store ? `${filters.region} · ${filters.store}` : filters.region
})

const regionFilterCount = computed(() => {
  if (!filters.region) return dateAlertCount.value
  const region = regionTree.value.find((item) => item.value === filters.region)
  if (!region) return 0
  if (!filters.store) return region.count
  return region.stores.find((store) => store.value === filters.store)?.count ?? 0
})

const pendingRegionLabel = computed(() => {
  if (!pendingRegion.value) return '全部区域'
  return pendingStore.value ? `${pendingRegion.value} · ${pendingStore.value}` : pendingRegion.value
})

const pendingRegionCount = computed(() => {
  if (!pendingRegion.value) return dateAlertCount.value
  const region = regionTree.value.find((item) => item.value === pendingRegion.value)
  if (!region) return 0
  if (!pendingStore.value) return region.count
  return region.stores.find((store) => store.value === pendingStore.value)?.count ?? 0
})

const openRegionPicker = () => {
  pendingRegion.value = filters.region
  pendingStore.value = filters.store
  regionDragOffset.value = 0
  regionPickerVisible.value = true
}

const closeRegionPicker = () => {
  regionPickerVisible.value = false
  regionDragOffset.value = 0
}

const pickAllRegions = () => {
  pendingRegion.value = ''
  pendingStore.value = ''
}

const pickRegion = (region) => {
  if (pendingRegion.value === region.value) return
  pendingRegion.value = region.value
  pendingStore.value = ''
}

const pickStore = (store) => {
  pendingStore.value = store
}

const confirmRegion = () => {
  filters.region = pendingRegion.value
  filters.store = pendingStore.value
  closeRegionPicker()
}

const clearRegion = () => {
  filters.region = ''
  filters.store = ''
}

const onRegionDragStart = (event) => {
  if (!regionPickerVisible.value) return

  regionPointerId = event.pointerId
  regionDragStartY = event.clientY
  regionDragOffset.value = 0
  window.addEventListener('pointermove', onRegionDragMove)
  window.addEventListener('pointerup', onRegionDragEnd)
  window.addEventListener('pointercancel', onRegionDragEnd)
}

const onRegionDragMove = (event) => {
  if (event.pointerId !== regionPointerId) return
  regionDragOffset.value = Math.max(0, event.clientY - regionDragStartY)
}

const onRegionDragEnd = (event) => {
  if (event.pointerId !== regionPointerId) return

  const shouldClose = regionDragOffset.value > 72
  regionPointerId = null
  window.removeEventListener('pointermove', onRegionDragMove)
  window.removeEventListener('pointerup', onRegionDragEnd)
  window.removeEventListener('pointercancel', onRegionDragEnd)

  if (shouldClose) {
    closeRegionPicker()
    return
  }

  regionDragOffset.value = 0
}

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.region) count += 1
  if (filters.eventType) count += 1
  if (filters.keyword.trim()) count += 1
  return count
})

const eventLabel = (value) => eventTypeMap[value]?.label || '其他事件'

const filteredNotifications = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  return notifications.value
    .filter((item) => {
      if (!item.timestamp.startsWith(selectedDate.value)) return false
      if (filters.region && !item.orgPath.startsWith(filters.region)) return false
      if (filters.store && item.orgPath.split(' / ')[1] !== filters.store) return false
      if (filters.eventType && item.eventType !== filters.eventType) return false
      if (
        keyword &&
        !item.deviceName.toLowerCase().includes(keyword) &&
        !item.license.toLowerCase().includes(keyword)
      ) {
        return false
      }
      return true
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
})

const allSelected = computed(
  () =>
    filteredNotifications.value.length > 0 &&
    filteredNotifications.value.every((item) => selectedIds.value.includes(item.id))
)

const onCalendarConfirm = (value) => {
  const date = Array.isArray(value) ? value[0] : value
  if (date) {
    const nextDate = new Date(date)
    selectedDate.value = toDateKey(nextDate)
    calendarValue.value = nextDate
    selectedIds.value = []
  }
  calendarVisible.value = false
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
  filters.store = ''
  filters.eventType = ''
  filters.keyword = ''
}

const confirmDelete = () => {
  notificationStore.removeAlerts(selectedIds.value)
  Toast.success(`已删除 ${selectedIds.value.length} 条告警`)
  selectedIds.value = []
  deleteDialogVisible.value = false
  manageMode.value = false
}
</script>

<style scoped>
.notifications-page {
  background:
    radial-gradient(120% 36% at 84% -2%, rgba(198, 210, 245, 0.66) 0%, rgba(255, 255, 255, 0) 72%),
    radial-gradient(80% 34% at 8% 100%, rgba(214, 246, 236, 0.42) 0%, rgba(255, 255, 255, 0) 70%),
    linear-gradient(180deg, #eef0fa 0%, #f7f9fe 30%, #ffffff 64%);
}

.page-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: linear-gradient(180deg, rgba(237, 240, 250, 0.94) 0%, rgba(240, 243, 250, 0.72) 100%) !important;
  border-bottom: 0;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.page-navbar :deep(.t-navbar__content),
.page-navbar :deep(.t-navbar__title),
.page-navbar :deep(.t-navbar__left),
.page-navbar :deep(.t-navbar__right) {
  color: #1b1d24;
}

.page-navbar :deep(.t-navbar__content) {
  background-color: transparent;
}

.page-navbar :deep(.t-navbar__title) {
  font-size: 17px;
  font-weight: 700;
}

.navbar-action {
  border: 0;
  background: transparent;
  color: #4059f0;
  font-size: 13px;
  font-weight: 600;
  padding: 4px;
}

.list-head {
  margin: 12px var(--prototype-page-padding-x) 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.list-head-date {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  color: #1b1c22;
  letter-spacing: -0.01em;
}

.list-head-note {
  margin-top: 6px;
  font-size: 12px;
  color: #9498a6;
}

.filter-entry {
  position: relative;
  flex: 0 0 auto;
  height: 34px;
  padding: 0 13px;
  border: 1px solid #e6e8ee;
  border-radius: 999px;
  background: #ffffff;
  color: #4059f0;
  font-size: 13px;
  font-weight: 600;
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
  background: #4059f0;
  color: #fff;
  font-size: 10px;
}

.date-trigger {
  margin: 12px var(--prototype-page-padding-x) 0;
  width: calc(100% - var(--prototype-page-padding-x) * 2);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(238, 240, 245, 0.9);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
  text-align: left;
}

.date-trigger-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 12px;
  background: #eef1ff;
  color: #4059f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.date-trigger-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.date-trigger-label {
  font-size: 11px;
  color: #9a9da7;
}

.date-trigger-value {
  font-size: 15px;
  font-weight: 600;
  color: #1c1d24;
}

.date-trigger-action {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #4059f0;
}

.date-trigger-action :deep(.t-icon) {
  font-size: 14px;
}

.active-filters {
  margin: 10px var(--prototype-page-padding-x) 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.active-filter {
  padding: 4px 9px;
  border-radius: 7px;
  background: #eef1ff;
  color: #4059f0;
  font-size: 12px;
  font-weight: 600;
}

.active-filter-clear {
  border: 0;
  background: transparent;
  color: #9a9da7;
  font-size: 12px;
  font-weight: 500;
  text-decoration: underline;
}

.message-list {
  padding: 14px var(--prototype-page-padding-x) 96px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  position: relative;
  padding: 14px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 14px 30px rgba(24, 36, 72, 0.06);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.message-card.is-selected {
  border-color: rgba(64, 89, 240, 0.5);
  background: #f7f9ff;
}

.message-card:active {
  transform: scale(0.992);
}

.check-dot {
  position: absolute;
  top: 11px;
  left: 11px;
  z-index: 4;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(160, 165, 178, 0.7);
  background: rgba(255, 255, 255, 0.94);
  color: transparent;
  font-size: 11px;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
}

.check-dot.is-on {
  border-color: #4059f0;
  background: #4059f0;
  color: #fff;
}

.message-thumb {
  position: relative;
  width: 94px;
  height: 74px;
  flex: 0 0 94px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(150deg, #eef1f8 0%, #e2e7f2 100%);
}

.thumb-placeholder {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c3cbd9;
  transition: opacity 0.24s ease;
}

.thumb-placeholder.is-hidden {
  opacity: 0;
}

.message-thumb img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.24s ease;
}

.message-thumb img.is-loaded {
  opacity: 1;
}

.message-body {
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}

.message-type {
  font-size: 15px;
  line-height: 21px;
  font-weight: 600;
  color: #1c1d24;
}

.message-device {
  margin-top: 5px;
  font-size: 12.5px;
  line-height: 18px;
  color: #6b6f7a;
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
  color: #9a9da7;
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
  color: #c4c7d0;
  flex-shrink: 0;
  align-self: center;
}

.message-empty {
  padding: 34px 20px;
  text-align: center;
  border-radius: 20px;
}

.message-empty-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto;
  border-radius: 20px;
  background: linear-gradient(180deg, #eef1ff 0%, #f7f9ff 100%);
  color: #4059f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.message-empty-title {
  margin-top: 14px;
  font-size: 15px;
  font-weight: 700;
  color: #1b1c22;
}

.message-empty-note {
  margin-top: 6px;
  font-size: 12px;
  color: #9a9da7;
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
  padding: 10px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(238, 240, 245, 0.9);
  box-shadow: 0 -10px 30px rgba(24, 36, 72, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.manage-select {
  border: 0;
  background: #f2f3f7;
  color: #4059f0;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.manage-count {
  flex: 1;
  font-size: 12px;
  color: #8b8e99;
}

.manage-delete {
  height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: #e5484d;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.manage-delete:disabled {
  opacity: 0.45;
}

.filter-sheet {
  max-height: 84vh;
  display: flex;
  flex-direction: column;
  padding: 18px 16px calc(16px + var(--prototype-safe-bottom));
  background: #fff;
  border-radius: 22px 22px 0 0;
}

.sheet-head {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.sheet-title {
  font-size: 18px;
  font-weight: 700;
  color: #1b1c22;
}

.sheet-subtitle {
  margin-top: 5px;
  font-size: 12px;
  color: #9498a6;
}

.sheet-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #f4f5f8;
  color: #7a7e8a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.filter-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-top: 4px;
  padding-right: 2px;
}

.filter-group {
  margin-top: 18px;
}

.filter-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
  font-size: 12px;
  font-weight: 600;
  color: #6b6f7a;
}

.filter-group-note {
  font-size: 11px;
  font-weight: 400;
  color: #a3a6b0;
}

.filter-select {
  width: 100%;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  background: #fbfbfc;
  text-align: left;
}

.filter-select:active {
  background: #f4f5f9;
}

.filter-select-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 12px;
  background: #eef1ff;
  color: #4059f0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.filter-select-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.filter-select-value {
  font-size: 14px;
  font-weight: 600;
  color: #1c1d24;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-select-value.is-placeholder {
  color: #4c4f58;
  font-weight: 500;
}

.filter-select-hint {
  font-size: 11px;
  color: #9a9da7;
}

.filter-select-arrow {
  flex: 0 0 auto;
  color: #b6b9c2;
  font-size: 16px;
}

.region-panel {
  position: relative;
  width: 100%;
  height: 620px;
  max-height: 80dvh;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
  overflow: hidden;
  transform: translate3d(0, var(--sheet-drag-offset, 0px), 0);
  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}

.region-panel--dragging {
  transition: none;
}

.picker-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 10px 20px 6px;
}

.picker-grabber {
  width: 42px;
  height: 5px;
  border: 0;
  border-radius: 999px;
  background: #e5e5e8;
  touch-action: none;
}

.picker-header h3 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #16171d;
}

.region-summary {
  margin: 8px 18px 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7f8fc;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.region-summary-label {
  flex: 0 0 auto;
  color: #9a9da7;
}

.region-summary-value {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1c1d24;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.region-summary-count {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef1ff;
  color: #4059f0;
  font-size: 11px;
  font-weight: 600;
}

.region-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  -webkit-overflow-scrolling: touch;
}

.region-all,
.region-row {
  width: 100%;
  border: 1px solid #eef0f5;
  border-radius: 14px;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  text-align: left;
}

.region-all.is-active,
.region-row.is-active {
  border-color: rgba(64, 89, 240, 0.35);
  background: #f3f5ff;
}

.region-all-icon,
.region-row-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 10px;
  background: #f2f4fb;
  color: #6f7891;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}

.region-all.is-active .region-all-icon,
.region-row.is-active .region-row-icon {
  background: linear-gradient(135deg, #5b6cfb 0%, #4059f0 100%);
  color: #ffffff;
}

.region-all-copy,
.region-row-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.region-all-title,
.region-row-title {
  font-size: 14px;
  font-weight: 600;
  color: #1c1d24;
}

.region-row-hint {
  font-size: 11px;
  color: #9a9da7;
}

.region-all-hint {
  font-size: 11px;
  color: #9a9da7;
}

.region-all-count,
.region-row-count {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 600;
  color: #8a8b94;
}

.region-all.is-active .region-all-count,
.region-row.is-active .region-row-count {
  color: #4059f0;
}

.region-row-arrow {
  flex: 0 0 auto;
  color: #b6b9c2;
  font-size: 15px;
}

.region-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.store-list {
  margin-left: 44px;
  padding: 4px 0 4px 10px;
  border-left: 2px solid #eef1ff;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.store-row {
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}

.store-row.is-active {
  background: #eef1ff;
}

.store-name {
  font-size: 13px;
  color: #4c4f58;
}

.store-row.is-active .store-name {
  color: #4059f0;
  font-weight: 600;
}

.store-count {
  font-size: 11px;
  color: #9a9da7;
}

.store-row.is-active .store-count {
  color: #4059f0;
}

.region-empty {
  padding: 32px 0;
  text-align: center;
  color: #b9bcc6;
  font-size: 12px;
}

.region-empty p {
  margin: 8px 0 0;
}

.picker-footer {
  padding: 10px 18px calc(14px + var(--prototype-safe-bottom));
  background: #ffffff;
}

.picker-confirm {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 24px;
  background: linear-gradient(135deg, #5b6cfb 0%, #4059f0 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(74, 92, 255, 0.22);
}

.picker-confirm:active {
  background: linear-gradient(135deg, #4d5ef0 0%, #3848e6 100%);
}

.filter-chip:focus,
.date-trigger:focus {
  outline: none;
}

.filter-chip,
.date-trigger {
  -webkit-tap-highlight-color: transparent;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  height: 34px;
  padding: 0 12px;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  background: #f7f7f9;
  color: #4c4f58;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filter-chip em {
  font-style: normal;
  font-size: 11px;
  color: #9a9da7;
}

.filter-chip.is-active {
  border-color: transparent;
  background: #4059f0;
  color: #ffffff;
}

.filter-chip.is-active em {
  color: rgba(255, 255, 255, 0.78);
}

.filter-field {
  height: 44px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e6e8ee;
  border-radius: 12px;
  background: #fbfbfc;
}

.filter-field:focus-within {
  border-color: rgba(64, 89, 240, 0.5);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(64, 89, 240, 0.08);
}

.filter-field-icon {
  flex: 0 0 16px;
  font-size: 16px;
  color: #a0a3ad;
}

.filter-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 13px;
  color: #2b2c33;
  outline: none;
  font-family: inherit;
}

.filter-input::placeholder {
  color: #a9adb7;
}

.filter-field-clear {
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: #b6b9c2;
  font-size: 16px;
  display: inline-flex;
}

.filter-footer {
  flex: 0 0 auto;
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 10px;
}

.filter-btn {
  height: 46px;
  border: 0;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}

.filter-btn--ghost {
  background: #f2f3f7;
  color: #5a5e69;
}

.filter-btn--primary {
  background: #4059f0;
  color: #fff;
  box-shadow: 0 8px 18px rgba(64, 89, 240, 0.24);
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
  border-radius: 20px;
}

.dialog-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 16px;
  background: #fdeeee;
  color: #e5484d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.dialog-title {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 700;
  color: #1b1c22;
}

.dialog-content {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #7a7e8a;
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
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}

.dialog-btn--ghost {
  background: #f2f3f7;
  color: #5a5e69;
}

.dialog-btn--danger {
  background: #e5484d;
  color: #fff;
}
</style>
