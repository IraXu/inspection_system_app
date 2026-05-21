<template>
  <div class="home-page app-page">
    <div class="home-header gradient-bg">
      <div class="header-glow header-glow-left"></div>
      <div class="header-glow header-glow-right"></div>
      <div class="header-content">
        <div class="header-top">
          <div>
            <h1 class="header-title">视频广场</h1>
            <p class="header-subtitle">统一查看各区域实时监控画面</p>
          </div>
          <button type="button" class="header-action" @click="openMultiViewSettings" aria-label="多画面设置">
            <t-icon name="grid-view" />
          </button>
        </div>

        <div class="region-selector" @click="openRegionPicker">
          <div class="region-info">
            <div class="enterprise-name">{{ currentEnterprise.name }}</div>
            <div class="region-path">
              <t-icon name="location" />
              <span class="region-path-track">
                <template v-for="(segment, index) in selectedRegionSegments" :key="`${segment}-${index}`">
                  <span
                    class="region-path-segment"
                    :class="{ 'region-path-segment--current': index === selectedRegionSegments.length - 1 }"
                  >
                    {{ segment }}
                  </span>
                  <span
                    v-if="index < selectedRegionSegments.length - 1"
                    class="region-path-separator"
                  >
                    /
                  </span>
                </template>
              </span>
              <t-icon name="caret-down-small" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="search-bar app-section">
      <div class="search-shell">
        <t-search
          v-model="searchText"
          placeholder="搜索摄像头、区域名称"
          @change="onSearchChange"
        />
      </div>
    </div>

    <t-notice-bar
      v-if="announcement"
      :content="announcement"
      prefix-icon="sound"
      class="notice-bar"
    />

    <div class="filter-segmented app-section">
      <div class="filter-bar app-card">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          type="button"
          class="segment-item"
          :class="{ active: activeFilter === tab.value }"
          @click="activeFilter = tab.value"
        >
          <span>{{ tab.label }}</span>
          <span class="segment-count">{{ getFilterCount(tab.value) }}</span>
        </button>
      </div>
    </div>

    <t-pull-down-refresh
      v-model="deviceRefreshing"
      class="device-refresh"
      :loading-texts="['下拉刷新设备', '松开同步设备', '设备同步中', '设备已更新']"
      @refresh="onDeviceRefresh"
    >
      <div class="device-grid app-section app-stack">
        <div v-if="loading" class="skeleton-container">
          <div v-for="i in 4" :key="i" class="skeleton-card">
            <t-skeleton :row-col="[{ height: '118px' }, 1, { width: '60%' }]" />
          </div>
        </div>

        <div v-else-if="filteredDevices.length > 0" class="device-list">
          <div
            v-for="device in filteredDevices"
            :key="device.id"
            class="device-card"
            :class="device.status"
            @click="openDevice(device)"
          >
            <div class="device-thumbnail" :class="device.status">
              <div class="thumbnail-overlay"></div>
              <div class="device-camera-icon">
                <t-icon name="video" size="34px" />
              </div>
              <t-tag
                :theme="getStatusTheme(device.status)"
                size="small"
                class="status-tag"
              >
                {{ getStatusText(device.status) }}
              </t-tag>
            </div>
            <div class="device-info">
              <div class="device-name">{{ device.name }}</div>
              <div class="device-meta">
                <span class="device-store">{{ device.storeName }}</span>
              </div>
            </div>
          </div>
        </div>

        <t-empty v-else description="暂无设备" />
      </div>
    </t-pull-down-refresh>

    <transition name="region-sheet">
      <div v-if="showRegionPicker" class="region-layer" @click.self="closeRegionPicker">
        <div class="region-panel" :class="{ 'region-panel--dragging': pickerDragOffset > 0 }" :style="{ '--sheet-drag-offset': `${pickerDragOffset}px` }">
          <div class="picker-header">
            <button
              type="button"
              class="picker-grabber"
              aria-label="关闭区域选择"
              @pointerdown.stop.prevent="onPickerDragStart"
            ></button>
            <h3>选择区域</h3>
          </div>

          <div class="region-panel-body">
            <div class="tree-toolbar">
              <button type="button" class="tree-root-action" :class="{ active: !pendingStoreId }" @click="selectAllRegion">
                <span class="tree-root-copy">
                  <span class="tree-root-title">全部设备</span>
                  <span class="tree-root-desc">当前企业下所有监控点位</span>
                </span>
                <span class="tree-root-count">{{ devices.length }}台</span>
              </button>

              <div class="tree-summary">
                <span class="tree-summary-label">当前选择</span>
                <span class="tree-summary-value">{{ pendingRegionFullPath }}</span>
                <span class="tree-summary-divider"></span>
                <span class="tree-summary-count">{{ pendingRegionCount }}台</span>
              </div>
            </div>

            <t-pull-down-refresh
              v-model="treeRefreshing"
              class="tree-refresh"
              :loading-texts="['下拉刷新区域树', '松开同步区域树', '区域树同步中', '区域树已更新']"
              @refresh="onTreeRefresh"
            >
              <div class="region-tree">
                <div
                  v-for="node in visibleRegionNodes"
                  :key="node.value"
                  class="tree-node"
                  :class="{
                    selected: pendingStoreId === node.value,
                    expanded: node.hasChildren && isExpanded(node.value)
                  }"
                  :data-depth="node.depth"
                  :style="{ '--tree-depth': node.depth }"
                >
                  <div class="tree-node-row">
                    <button
                      v-if="node.hasChildren"
                      type="button"
                      class="tree-toggle"
                      @click.stop="toggleExpand(node.value)"
                    >
                      <t-icon :name="isExpanded(node.value) ? 'chevron-down' : 'chevron-right'" />
                    </button>
                    <span v-else class="tree-toggle tree-toggle--placeholder"></span>

                    <button
                      type="button"
                      class="tree-node-main"
                      @click="selectRegion(node.raw)"
                    >
                      <span class="tree-indent"></span>
                      <span class="tree-node-icon" :class="{ leaf: !node.hasChildren }">
                        <t-icon :name="node.hasChildren ? 'folder' : 'location'" />
                      </span>
                      <span class="tree-node-copy">
                        <span class="tree-node-label">{{ node.label }}</span>
                        <span class="tree-node-hint">{{ getNodeHint(node.raw) }}</span>
                      </span>
                      <span class="tree-node-count">{{ node.deviceCount }}台</span>
                    </button>
                  </div>
                </div>

                <div v-if="visibleRegionNodes.length === 0" class="empty-region">
                  <t-icon name="folder-open" size="48px" />
                  <p>暂无可选区域</p>
                </div>
              </div>
            </t-pull-down-refresh>
          </div>

          <div class="picker-footer">
            <t-button
              block
              theme="primary"
              @click="confirmRegion"
            >
              {{ confirmButtonText }}
            </t-button>
          </div>
        </div>
      </div>
    </transition>

    <t-back-top />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
const router = useRouter()

const searchText = ref('')
const announcement = ref('系统维护通知：本周六凌晨2:00-4:00进行系统升级，届时部分功能可能无法使用')
const loading = ref(true)
const deviceRefreshing = ref(false)
const treeRefreshing = ref(false)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1500)
})

onBeforeUnmount(() => {
  removePickerDragListeners()
})

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' }
]
const activeFilter = ref('all')

const showRegionPicker = ref(false)
const selectedStoreId = ref('')
const selectedRegionName = ref('全部区域')
const pendingStoreId = ref('')
const pendingRegionName = ref('全部区域')
const expandedNodes = ref(new Set())
const pickerDragOffset = ref(0)
let pickerDragStartY = 0
let pickerPointerId = null

const currentEnterprise = ref({
  id: 'ent-001',
  name: 'XX科技有限公司'
})

const regionTree = ref([
  {
    label: 'XX科技有限公司',
    value: 'ent-001',
    level: 0,
    deviceCount: 9,
    children: [
      {
        label: '华东区',
        value: 'area-huadong',
        level: 1,
        deviceCount: 4,
        children: [
          {
            label: '上海工厂',
            value: 'store-sh-factory',
            level: 2,
            deviceCount: 4,
            children: [
              {
                label: '生产车间',
                value: 'dept-sh-sc',
                level: 3,
                deviceCount: 3,
                children: [
                  { label: 'A线', value: 'line-sh-a', level: 4, deviceCount: 2 },
                  { label: 'B线', value: 'line-sh-b', level: 4, deviceCount: 1 }
                ]
              },
              { label: '仓库', value: 'dept-sh-wh', level: 3, deviceCount: 1 }
            ]
          },
          { label: '南京工厂', value: 'store-nj-factory', level: 2, deviceCount: 0 },
          { label: '杭州工厂', value: 'store-hz-factory', level: 2, deviceCount: 0 }
        ]
      },
      {
        label: '华北区',
        value: 'area-huabei',
        level: 1,
        deviceCount: 3,
        children: [
          { label: '北京工厂', value: 'store-bj-factory', level: 2, deviceCount: 3 },
          { label: '天津工厂', value: 'store-tj-factory', level: 2, deviceCount: 0 }
        ]
      },
      {
        label: '华南区',
        value: 'area-huanan',
        level: 1,
        deviceCount: 2,
        children: [
          { label: '深圳工厂', value: 'store-sz-factory', level: 2, deviceCount: 2 },
          { label: '广州工厂', value: 'store-gz-factory', level: 2, deviceCount: 0 }
        ]
      }
    ]
  }
])

const devices = ref([
  { id: 1, name: '摄像头-车间1入口', type: 'camera', status: 'online', storeId: 'store-sh-factory', storeName: '上海工厂' },
  { id: 2, name: '摄像头-车间1出口', type: 'camera', status: 'online', storeId: 'store-sh-factory', storeName: '上海工厂' },
  { id: 3, name: '摄像头-车间2入口', type: 'camera', status: 'offline', storeId: 'store-sh-factory', storeName: '上海工厂' },
  { id: 4, name: '摄像头-仓库区域', type: 'camera', status: 'offline', storeId: 'store-sh-factory', storeName: '上海工厂' },
  { id: 5, name: '摄像头-办公区域', type: 'camera', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂' },
  { id: 6, name: '摄像头-停车场', type: 'camera', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂' },
  { id: 7, name: '摄像头-厂区大门', type: 'camera', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂' },
  { id: 8, name: '摄像头-生产车间', type: 'camera', status: 'online', storeId: 'store-sz-factory', storeName: '深圳工厂' },
  { id: 9, name: '摄像头-质检区域', type: 'camera', status: 'online', storeId: 'store-sz-factory', storeName: '深圳工厂' }
])

const confirmButtonText = computed(() => {
  if (!pendingStoreId.value) {
    return `查看全部设备 (${devices.value.length}台)`
  }
  return `查看 ${pendingRegionName.value} (${pendingRegionCount.value}台)`
})

const regionNodeMap = computed(() => {
  const map = new Map()

  const traverse = (nodes, parentValue = null) => {
    nodes.forEach((node) => {
      map.set(node.value, { ...node, parentValue })
      if (node.children?.length) {
        traverse(node.children, node.value)
      }
    })
  }

  traverse(regionTree.value)
  return map
})

const pendingRegionCount = computed(() => {
  if (!pendingStoreId.value) {
    return devices.value.length
  }
  return regionNodeMap.value.get(pendingStoreId.value)?.deviceCount ?? 0
})

const buildRegionPath = (value) => {
  if (!value) {
    return '全部区域'
  }

  const path = []
  let current = regionNodeMap.value.get(value)

  while (current) {
    path.unshift(current.label)
    current = current.parentValue ? regionNodeMap.value.get(current.parentValue) : null
  }

  if (path[0] === currentEnterprise.value.name) {
    path.shift()
  }

  return path.join(' / ')
}

const selectedRegionFullPath = computed(() => buildRegionPath(selectedStoreId.value))
const pendingRegionFullPath = computed(() => buildRegionPath(pendingStoreId.value))
const selectedRegionSegments = computed(() => selectedRegionFullPath.value.split(' / '))

const visibleRegionNodes = computed(() => {
  const result = []

  const walk = (nodes, depth = 0) => {
    nodes.forEach((node) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0
      result.push({
        ...node,
        raw: node,
        depth,
        hasChildren
      })

      if (hasChildren && expandedNodes.value.has(node.value)) {
        walk(node.children, depth + 1)
      }
    })
  }

  walk(regionTree.value)
  return result
})

const filteredDevices = computed(() => {
  let result = devices.value

  if (activeFilter.value !== 'all') {
    result = result.filter(d => d.status === activeFilter.value)
  }

  if (selectedStoreId.value) {
    const getAllChildValues = (node) => {
      let values = [node.value]
      if (node.children) {
        node.children.forEach(child => {
          values = values.concat(getAllChildValues(child))
        })
      }
      return values
    }

    const findNode = (nodes, value) => {
      for (const node of nodes) {
        if (node.value === value) return node
        if (node.children) {
          const found = findNode(node.children, value)
          if (found) return found
        }
      }
      return null
    }

    const selectedNodeData = findNode(regionTree.value, selectedStoreId.value)
    if (selectedNodeData) {
      const allValues = getAllChildValues(selectedNodeData)
      result = result.filter(d => allValues.includes(d.storeId) || d.storeId === selectedStoreId.value)
    }
  }

  if (searchText.value) {
    result = result.filter(d =>
      d.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      d.storeName.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  return result
})

const collectAncestorValues = (value) => {
  const values = []
  let current = regionNodeMap.value.get(value)

  while (current?.parentValue) {
    values.unshift(current.parentValue)
    current = regionNodeMap.value.get(current.parentValue)
  }

  return values
}

const collectExpandableValues = (nodes) => {
  let values = []

  nodes.forEach((node) => {
    if (node.children?.length) {
      values.push(node.value)
      values = values.concat(collectExpandableValues(node.children))
    }
  })

  return values
}

const isExpanded = (value) => {
  return expandedNodes.value.has(value)
}

const toggleExpand = (value) => {
  const next = new Set(expandedNodes.value)
  if (next.has(value)) {
    next.delete(value)
  } else {
    next.add(value)
  }
  expandedNodes.value = next
}

const ensureExpandedPath = (value) => {
  const next = new Set(expandedNodes.value)
  collectAncestorValues(value).forEach(item => next.add(item))
  next.add(value)
  expandedNodes.value = next
}

const getNodeHint = (node) => {
  if (node.children?.length) {
    return `包含 ${node.children.length} 个下级区域`
  }
  return '查看该区域设备'
}

const openRegionPicker = () => {
  showRegionPicker.value = true
  pickerDragOffset.value = 0
  pendingStoreId.value = selectedStoreId.value
  pendingRegionName.value = selectedRegionName.value

  const next = new Set(collectExpandableValues(regionTree.value))
  if (selectedStoreId.value) {
    collectAncestorValues(selectedStoreId.value).forEach(item => next.add(item))
  }
  expandedNodes.value = next
}

const closeRegionPicker = () => {
  pickerDragOffset.value = 0
  showRegionPicker.value = false
}

const openMultiViewSettings = () => {
  router.push('/video-wall-setup')
}

const selectAllRegion = () => {
  pendingStoreId.value = ''
  pendingRegionName.value = '全部区域'
}

const selectRegion = (node) => {
  pendingStoreId.value = node.value
  pendingRegionName.value = node.label
  if (node.children?.length) {
    ensureExpandedPath(node.value)
  }
}

const confirmRegion = () => {
  selectedStoreId.value = pendingStoreId.value
  selectedRegionName.value = pendingRegionName.value
  pickerDragOffset.value = 0
  showRegionPicker.value = false
}

const onDeviceRefresh = () => {
  setTimeout(() => {
    deviceRefreshing.value = false
    Toast.success('设备数据已更新')
  }, 900)
}

const onTreeRefresh = () => {
  setTimeout(() => {
    treeRefreshing.value = false
    Toast.success('区域树已同步')
  }, 900)
}

const removePickerDragListeners = () => {
  window.removeEventListener('pointermove', onPickerDragMove)
  window.removeEventListener('pointerup', onPickerDragEnd)
  window.removeEventListener('pointercancel', onPickerDragEnd)
}

const onPickerDragStart = (event) => {
  if (!showRegionPicker.value) return

  pickerPointerId = event.pointerId
  pickerDragStartY = event.clientY
  pickerDragOffset.value = 0
  window.addEventListener('pointermove', onPickerDragMove)
  window.addEventListener('pointerup', onPickerDragEnd)
  window.addEventListener('pointercancel', onPickerDragEnd)
}

const onPickerDragMove = (event) => {
  if (event.pointerId !== pickerPointerId) return
  pickerDragOffset.value = Math.max(0, event.clientY - pickerDragStartY)
}

const onPickerDragEnd = (event) => {
  if (event.pointerId !== pickerPointerId) return

  const shouldClose = pickerDragOffset.value > 72
  pickerPointerId = null
  removePickerDragListeners()

  if (shouldClose) {
    closeRegionPicker()
    return
  }

  pickerDragOffset.value = 0
}

const getStatusTheme = (status) => {
  const themes = {
    online: 'success',
    offline: 'default'
  }
  return themes[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    online: '在线',
    offline: '离线'
  }
  return texts[status] || '未知'
}

const onSearchChange = () => {
}

const openDevice = (device) => {
  if (device.status === 'offline') {
    Toast.error('设备离线，无法查看实时视频')
    return
  }
  router.push(`/video-player/${device.id}`)
}

const getFilterCount = (value) => {
  if (value === 'all') return devices.value.length
  return devices.value.filter(device => device.status === value).length
}

</script>

<style scoped>
.home-page {
  background:
    radial-gradient(circle at top, rgba(var(--theme-primary-rgb), 0.08), transparent 24%),
    #f5f7fb;
}

.home-header {
  position: relative;
  overflow: hidden;
  padding: calc(var(--prototype-safe-top) + 8px) var(--prototype-page-padding-x) 18px;
  color: #173153;
  border-radius: 0 0 28px 28px;
  box-shadow: 0 18px 40px rgba(var(--theme-primary-rgb), 0.14);
}

.header-glow {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  filter: blur(10px);
}

.header-glow-left {
  width: 140px;
  height: 140px;
  top: -36px;
  left: -24px;
}

.header-glow-right {
  width: 180px;
  height: 180px;
  right: -60px;
  top: 18px;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.header-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #173153;
}

.header-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(23, 49, 83, 0.7);
}

.header-action {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.34);
  color: #1f5a7b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.region-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
  cursor: pointer;
  transition: transform 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.region-selector:active {
  transform: scale(0.98);
}

.region-info {
  flex: 1;
}

.enterprise-name {
  font-size: 12px;
  color: rgba(23, 49, 83, 0.62);
  margin-bottom: 4px;
}

.region-path {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
}

.region-path-track {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 4px;
  row-gap: 2px;
}

.region-path-segment {
  max-width: 100%;
  color: rgba(23, 49, 83, 0.7);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.region-path-segment--current {
  color: #173153;
  font-weight: 700;
}

.region-path-separator {
  color: rgba(23, 49, 83, 0.34);
  font-size: 12px;
  line-height: 1;
}

.search-bar {
  padding-top: 16px;
  padding-bottom: 12px;
  position: relative;
  z-index: 3;
}

.search-shell {
  padding: 10px 12px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(224, 232, 242, 0.96);
  box-shadow: 0 10px 24px rgba(11, 31, 68, 0.06);
}

.search-shell :deep(.t-search) {
  background: transparent;
}

.search-shell :deep(.t-search__form) {
  padding: 0;
}

.search-shell :deep(.t-search__box) {
  height: 40px;
  border-radius: 12px;
  background: #f4f7fb;
  border: 1px solid rgba(224, 232, 242, 0.9);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.search-shell :deep(.t-search__icon-search) {
  color: #7f90a6;
  font-size: 17px;
}

.search-shell :deep(.t-input__inner),
.search-shell :deep(.t-search__input) {
  color: #22344c;
  font-size: 14px;
}

.search-shell :deep(.t-input__inner::placeholder),
.search-shell :deep(.t-search__input::placeholder) {
  color: #94a3b8;
}

.search-shell :deep(.t-search__clear) {
  color: #8ea0b6;
}

.notice-bar {
  margin: 0 var(--prototype-page-padding-x) 14px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(11, 31, 68, 0.05);
}

.filter-segmented {
  margin-bottom: 12px;
}

.filter-bar {
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: linear-gradient(180deg, rgba(240, 245, 251, 0.98) 0%, rgba(234, 240, 248, 0.98) 100%);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.device-refresh {
  min-height: 420px;
}

.segment-item {
  min-height: 40px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #6f7d93;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.segment-item.active {
  background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
  color: #173153;
  box-shadow: 0 10px 20px rgba(11, 31, 68, 0.08);
}

.segment-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: #5f728d;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.segment-item.active .segment-count {
  background: rgba(var(--theme-primary-rgb), 0.1);
  color: var(--theme-primary-strong);
}

.device-grid {
  padding-top: 4px;
  padding-bottom: 8px;
  gap: 12px;
}

.skeleton-container,
.device-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.skeleton-card {
  background: #fff;
  border-radius: 18px;
  padding: 12px;
}

.device-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(224, 231, 242, 0.9);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 34px rgba(11, 31, 68, 0.07);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.device-card:hover {
  box-shadow: 0 18px 38px rgba(11, 31, 68, 0.1);
}

.device-card:active {
  transform: scale(0.985);
}

.device-card.online {
  box-shadow: 0 12px 30px rgba(var(--theme-primary-rgb), 0.08);
}

.device-thumbnail {
  height: 124px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.26), transparent 24%),
    linear-gradient(135deg, var(--theme-primary-strong) 0%, var(--theme-primary) 100%);
  color: #fff;
  padding: 0 18px;
}

.device-thumbnail.offline {
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.18), transparent 24%),
    linear-gradient(135deg, #99a4b5 0%, #748095 100%);
}

.thumbnail-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 18px 18px;
  opacity: 0.34;
}

.device-camera-icon {
  position: relative;
  z-index: 1;
  width: 58px;
  height: 58px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.status-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.device-info {
  padding: 13px 14px 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, #ffffff 100%);
}

.device-name {
  font-size: 14px;
  font-weight: 600;
  color: #25324a;
  line-height: 1.45;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.device-meta {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  font-size: 11px;
  color: #728096;
  margin-top: 7px;
}

.device-store {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.region-layer {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: rgba(12, 21, 34, 0.28);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
}


.region-panel {
  position: relative;
  left: 16px;
  right: 16px;
  bottom: 16px;
  width: calc(100% - 32px);
  height: min(68%, 620px);
  min-height: 420px;
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7fc 100%);
  box-shadow: 0 24px 50px rgba(16, 33, 68, 0.16);
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
  justify-content: center;
  gap: 12px;
  padding: 10px 16px 12px;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid rgba(229, 236, 244, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.picker-grabber {
  width: 42px;
  height: 5px;
  border: 0;
  border-radius: 999px;
  background: rgba(134, 149, 171, 0.36);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  touch-action: none;
}

.picker-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1c2f4e;
}

.region-panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tree-toolbar {
  padding: 10px 16px 8px;
  display: grid;
  gap: 8px;
}

.tree-refresh {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.tree-root-action {
  min-width: 0;
  padding: 0 0 10px;
  border: 0;
  border-bottom: 1px solid rgba(222, 231, 243, 0.92);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
}

.tree-root-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.tree-root-title {
  font-size: 15px;
  font-weight: 700;
  color: #16315b;
}

.tree-root-desc {
  font-size: 12px;
  line-height: 1.4;
  color: #7b89a0;
}

.tree-root-count {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(var(--theme-primary-rgb), 0.06);
  color: #607896;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.tree-root-action.active .tree-root-title {
  color: var(--theme-primary-strong);
}

.tree-root-action.active .tree-root-count {
  background: rgba(var(--theme-primary-rgb), 0.12);
  color: var(--theme-primary-strong);
}

.tree-summary {
  min-width: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7c8ca3;
  font-size: 12px;
}

.tree-summary-label {
  flex: 0 0 auto;
}

.tree-summary-value {
  min-width: 0;
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #23406b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-summary-divider {
  width: 1px;
  height: 12px;
  background: rgba(203, 214, 228, 0.92);
}

.tree-summary-count {
  flex: 0 0 auto;
  color: #5e7493;
  font-size: 12px;
  font-weight: 700;
}

.region-tree {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px 2px;
  -webkit-overflow-scrolling: touch;
}

.region-tree::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.tree-node {
  position: relative;
  margin-bottom: 0;
}

.tree-node::before {
  content: '';
  position: absolute;
  left: calc(18px + var(--tree-depth) * 18px);
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, rgba(203, 214, 228, 0.88) 0%, rgba(203, 214, 228, 0.24) 100%);
  pointer-events: none;
}

.tree-node:last-child::before {
  bottom: 20px;
}

.tree-node-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tree-toggle {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #7c8ba1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.tree-toggle--placeholder {
  background: transparent;
}

.tree-node-main {
  min-width: 0;
  width: 100%;
  padding: 8px 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  transition: opacity 0.2s ease;
  position: relative;
}

.tree-node-main:active {
  opacity: 0.72;
}

.tree-indent {
  width: calc(var(--tree-depth) * 12px);
  flex: 0 0 calc(var(--tree-depth) * 12px);
  position: relative;
}

.tree-indent::after {
  content: '';
  position: absolute;
  left: calc(100% + 2px);
  top: 50%;
  width: 10px;
  height: 1px;
  background: rgba(203, 214, 228, 0.92);
}

.tree-node-icon {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--theme-primary-rgb), 0.06);
  color: #4b79c9;
}

.tree-node-icon.leaf {
  background: rgba(var(--theme-primary-rgb), 0.05);
  color: var(--theme-primary);
}

.tree-node-copy {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tree-node-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d2c44;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node-hint {
  font-size: 10px;
  color: #8b98ac;
}

.tree-node-count {
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(var(--theme-primary-rgb), 0.06);
  color: #5d7393;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.tree-node[data-depth='0'] .tree-node-label {
  font-size: 15px;
  font-weight: 700;
  color: #15345f;
}

.tree-node[data-depth='0'] .tree-node-hint {
  color: #71829b;
}

.tree-node[data-depth='1'] .tree-node-label {
  font-weight: 650;
  color: #1c3d6c;
}

.tree-node[data-depth='2'] .tree-node-label {
  font-weight: 600;
  color: #274871;
}

.tree-node[data-depth='3'] .tree-node-label,
.tree-node[data-depth='4'] .tree-node-label,
.tree-node[data-depth='5'] .tree-node-label {
  font-weight: 500;
  color: #50627d;
}

.tree-node[data-depth='3'] .tree-node-icon,
.tree-node[data-depth='4'] .tree-node-icon,
.tree-node[data-depth='5'] .tree-node-icon {
  color: #6f89b8;
}

.tree-node.selected .tree-node-main {
  padding-left: 8px;
}

.tree-node.selected .tree-node-main::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--theme-primary-strong) 0%, var(--theme-primary) 100%);
}

.tree-node.selected .tree-node-icon {
  background: linear-gradient(135deg, var(--theme-primary-strong) 0%, var(--theme-primary) 100%);
  color: #fff;
}

.tree-node.selected .tree-node-label {
  color: #0f4ccf;
}

.tree-node.selected .tree-node-count {
  background: rgba(var(--theme-primary-rgb), 0.12);
  color: var(--theme-primary-strong);
}

.tree-node.expanded > .tree-node-row > .tree-toggle {
  color: var(--theme-primary-strong);
}

.empty-region {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-region p {
  margin-top: 12px;
  font-size: 14px;
}

.picker-footer {
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(229, 236, 244, 0.92);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

:deep(.t-pull-down-refresh__track) {
  color: #7a8aa0;
}

.tree-refresh :deep(.t-pull-down-refresh),
.tree-refresh :deep(.t-pull-down-refresh__track) {
  height: 100%;
}

.tree-refresh :deep(.t-pull-down-refresh__track) {
  display: flex;
  flex-direction: column;
}

.region-sheet-enter-active,
.region-sheet-leave-active {
  transition: opacity 0.28s ease;
}

.region-sheet-enter-active .region-panel,
.region-sheet-leave-active .region-panel {
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;
}

.region-sheet-enter-from,
.region-sheet-leave-to {
  opacity: 0;
}

.region-sheet-enter-from .region-panel,
.region-sheet-leave-to .region-panel {
  transform: translate3d(0, 32px, 0);
  opacity: 0.88;
}

@media (max-width: 360px) {
  .skeleton-container,
  .device-list {
    gap: 12px;
  }

  .device-thumbnail {
    height: 112px;
  }

  .device-name {
    font-size: 14px;
    min-height: 42px;
  }
}
</style>
