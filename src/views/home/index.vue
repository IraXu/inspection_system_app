<template>
  <div class="home-page app-page">
    <span class="home-decor" aria-hidden="true"></span>

    <header class="home-top">
      <div class="home-title-row">
        <h1 class="home-title">视频广场</h1>
        <button type="button" class="grid-entry" @click="openMultiViewSettings" aria-label="多画面设置">
          <t-icon name="grid-view" />
        </button>
      </div>

      <div class="enterprise-row">
        <button type="button" class="enterprise-trigger" @click="openRegionPicker">
          <t-icon name="location" class="enterprise-pin" />
          <span class="enterprise-owner">当前所属</span>
          <span class="enterprise-name">{{ currentRegionLabel }}</span>
        </button>
        <button type="button" class="switch-chip" @click="openRegionPicker">
          <t-icon name="swap" />
          切换
        </button>
      </div>
    </header>

    <div class="search-wrap">
      <div class="search-shell">
        <t-icon name="search" class="search-icon" />
        <input
          v-model="searchText"
          class="search-input"
          type="text"
          placeholder="搜索摄像头、区域名称"
        />
        <button
          v-if="searchText"
          type="button"
          class="search-clear"
          aria-label="清空搜索"
          @click="searchText = ''"
        >
          <t-icon name="close-circle-filled" />
        </button>
      </div>
    </div>

    <div class="filter-wrap">
      <div class="filter-bar">
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
      <div class="device-grid">
        <div v-if="loading" class="skeleton-container">
          <div v-for="i in 4" :key="i" class="skeleton-card">
            <t-skeleton :row-col="[{ height: '118px' }, 1, { width: '60%' }]" />
          </div>
        </div>

        <template v-else>
          <div
            v-for="device in filteredDevices"
            :key="device.id"
            class="device-card"
            :class="device.status"
            @click="openDevice(device)"
          >
            <div class="device-thumbnail">
              <img :src="device.thumbnail" :alt="device.name" />
              <span class="status-tag" :class="device.status">{{ getStatusText(device.status) }}</span>
            </div>
            <div class="device-info">
              <div class="device-name">{{ device.name }}</div>
              <div class="device-store">{{ device.storeName }}</div>
            </div>
          </div>

          <div v-if="filteredDevices.length === 0" class="device-empty">
            <t-empty description="暂无设备" />
          </div>
        </template>
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
            <h3>切换所属区域</h3>
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
            <button type="button" class="picker-confirm" @click="confirmRegion">
              {{ confirmButtonText }}
            </button>
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
import { buildImageUrl } from '../../utils/media'

const router = useRouter()

const searchText = ref('')
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
  name: '南京鹤梦科技有限公司'
})

const regionTree = ref([
  {
    label: '南京鹤梦科技有限公司',
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

const thumbnailUrl = buildImageUrl(
  'wide angle surveillance camera still of a large modern factory warehouse interior, tall steel storage racks, overhead industrial lights, workers in yellow safety vests walking on a glossy reflective floor, bright daylight, realistic CCTV footage',
  'landscape_4_3'
)

const devices = ref([
  { id: 1, name: '摄像头-车间1入口', status: 'online', storeId: 'store-sh-factory', storeName: '上海工厂', thumbnail: thumbnailUrl },
  { id: 2, name: '摄像头-车间1出口', status: 'online', storeId: 'store-sh-factory', storeName: '上海工厂', thumbnail: thumbnailUrl },
  { id: 3, name: '摄像头-车间2入口', status: 'offline', storeId: 'store-sh-factory', storeName: '上海工厂', thumbnail: thumbnailUrl },
  { id: 4, name: '摄像头-仓库区域', status: 'offline', storeId: 'store-sh-factory', storeName: '上海工厂', thumbnail: thumbnailUrl },
  { id: 5, name: '摄像头-办公区域', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂', thumbnail: thumbnailUrl },
  { id: 6, name: '摄像头-停车场', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂', thumbnail: thumbnailUrl },
  { id: 7, name: '摄像头-厂区大门', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂', thumbnail: thumbnailUrl },
  { id: 8, name: '摄像头-生产车间', status: 'online', storeId: 'store-sz-factory', storeName: '深圳工厂', thumbnail: thumbnailUrl },
  { id: 9, name: '摄像头-质检区域', status: 'online', storeId: 'store-sz-factory', storeName: '深圳工厂', thumbnail: thumbnailUrl }
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

const currentRegionLabel = computed(() => {
  if (!selectedStoreId.value) {
    return currentEnterprise.value.name
  }
  return selectedRegionFullPath.value
})

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
    const keyword = searchText.value.toLowerCase()
    result = result.filter(d =>
      d.name.toLowerCase().includes(keyword) ||
      d.storeName.toLowerCase().includes(keyword)
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

const getStatusText = (status) => {
  const texts = {
    online: '在线',
    offline: '离线'
  }
  return texts[status] || '未知'
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
  position: relative;
  background:
    radial-gradient(120% 44% at 4% 0%, rgba(224, 212, 250, 0.85) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 40% at 100% 100%, rgba(206, 240, 235, 0.9) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f4f0fc 0%, #eef3fc 45%, #eaf6f4 100%);
  padding-bottom: calc(var(--app-tabbar-space, 92px) + 8px);
}

.home-decor {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 210px;
  height: 210px;
  border-radius: 36px;
  transform: rotate(16deg);
  background:
    linear-gradient(122deg, rgba(150, 184, 255, 0.16) 0 22%, rgba(150, 184, 255, 0) 22% 40%, rgba(172, 202, 255, 0.14) 40% 64%, rgba(172, 202, 255, 0) 64% 78%, rgba(190, 214, 255, 0.14) 78% 94%, rgba(190, 214, 255, 0) 94%);
  pointer-events: none;
}

.home-top {
  position: relative;
  padding: calc(var(--prototype-safe-top) + 10px) 16px 0 20px;
}

.home-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.home-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  color: #16171d;
  letter-spacing: 0.01em;
}

.grid-entry {
  width: 44px;
  height: 44px;
  margin-right: -2px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  color: #16171d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 8px 18px rgba(112, 120, 170, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.grid-entry:active {
  transform: scale(0.94);
}

.enterprise-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  min-width: 0;
}

.enterprise-trigger {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.enterprise-trigger:active {
  opacity: 0.7;
}

.enterprise-pin {
  flex: 0 0 auto;
  font-size: 17px;
  color: #16171d;
}

.enterprise-owner {
  flex: 0 0 auto;
  font-size: 14px;
  color: #5f6068;
}

.enterprise-name {
  min-width: 0;
  font-size: 16px;
  font-weight: 600;
  color: #16171d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.switch-chip {
  flex: 0 0 auto;
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 15px;
  background: linear-gradient(135deg, #5b6cfb 0%, #4454ef 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 8px 16px rgba(74, 92, 255, 0.22);
}

.switch-chip:active {
  background: linear-gradient(135deg, #4d5ef0 0%, #3848e6 100%);
}

.search-wrap {
  padding: 16px 16px 0;
}

.search-shell {
  height: 52px;
  padding: 0 16px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(250, 251, 255, 0.82) 100%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 24px rgba(112, 120, 170, 0.07);
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-icon {
  flex: 0 0 auto;
  font-size: 24px;
  color: #1c1d22;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
  color: #1c1d22;
  font-family: inherit;
}

.search-input::placeholder {
  color: #8f9098;
}

.search-clear {
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: #b6b7bf;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
}

.filter-wrap {
  padding: 20px 16px 14px;
}

.filter-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
  padding: 5px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.66);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.segment-item {
  height: 42px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #6f7078;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.segment-item.active {
  background: #ffffff;
  color: #4a5cff;
  box-shadow: 0 6px 16px rgba(90, 105, 180, 0.12);
}

.segment-count {
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 6px;
  background: #a9aab2;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.segment-item.active .segment-count {
  background: #4a5cff;
}

.device-refresh {
  min-height: 420px;
}

.device-grid {
  padding: 0 16px;
}

.skeleton-container,
.device-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}

.skeleton-container {
  grid-column: 1 / -1;
}

.skeleton-card {
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
}

.device-card {
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 28px rgba(112, 120, 170, 0.09);
  transition: transform 0.2s ease;
}

.device-card:active {
  transform: scale(0.985);
}

.device-thumbnail {
  position: relative;
  aspect-ratio: 1.12;
  overflow: hidden;
  border-radius: 16px;
  background: #dfe4ee;
}

.device-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.device-card.offline .device-thumbnail img {
  filter: grayscale(1) brightness(0.86) contrast(1.04);
}

.status-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 8px;
  background: #12a594;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}

.status-tag.offline {
  background: #8b8e97;
}

.device-info {
  padding: 12px 14px 14px;
}

.device-name {
  font-size: 16px;
  font-weight: 700;
  color: #17181d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-store {
  margin-top: 7px;
  font-size: 13px;
  color: #a2a3ac;
}

.device-empty {
  grid-column: 1 / -1;
  padding: 32px 0;
}

.region-layer {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
}

.region-panel {
  position: relative;
  width: 100%;
  height: min(72%, 640px);
  min-height: 420px;
  display: flex;
  flex-direction: column;
  border-radius: 26px 26px 0 0;
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
  gap: 14px;
  padding: 10px 22px 6px;
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
  font-size: 21px;
  font-weight: 700;
  color: #16171d;
}

.region-panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tree-toolbar {
  padding: 12px 22px 8px;
  display: grid;
  gap: 10px;
}

.tree-refresh {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.tree-root-action {
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid rgba(74, 92, 255, 0.12);
  border-radius: 14px;
  background: rgba(74, 92, 255, 0.05);
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
  color: #17181d;
}

.tree-root-desc {
  font-size: 12px;
  line-height: 1.4;
  color: #a2a3ac;
}

.tree-root-count {
  padding: 4px 9px;
  border-radius: 999px;
  background: #ffffff;
  color: #4a5cff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.tree-root-action.active {
  background: #eef1ff;
  border-color: transparent;
}

.tree-root-action.active .tree-root-title {
  color: #3f55f0;
}

.tree-root-action.active .tree-root-count {
  background: #4a5cff;
  color: #ffffff;
}

.tree-summary {
  min-width: 0;
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a2a3ac;
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
  color: #3f55f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-summary-divider {
  width: 1px;
  height: 12px;
  background: #e6e7ee;
}

.tree-summary-count {
  flex: 0 0 auto;
  color: #6f7078;
  font-size: 12px;
  font-weight: 600;
}

.region-tree {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px 6px;
  -webkit-overflow-scrolling: touch;
}

.region-tree::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.tree-node {
  position: relative;
  margin-bottom: 2px;
}

.tree-node-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.tree-toggle {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #b0b1b9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.tree-toggle--placeholder {
  background: transparent;
}

.tree-node-main {
  min-width: 0;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  transition: background 0.2s ease;
}

.tree-node-main:active {
  background: rgba(74, 92, 255, 0.06);
}

.tree-indent {
  width: calc(var(--tree-depth) * 12px);
  flex: 0 0 calc(var(--tree-depth) * 12px);
}

.tree-node-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: #eef1ff;
  color: #5b6cfb;
}

.tree-node-icon.leaf {
  background: #f2f3f7;
  color: #8a8b94;
}

.tree-node-copy {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tree-node-label {
  font-size: 15px;
  font-weight: 500;
  color: #1c1d22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node-hint {
  font-size: 11px;
  color: #b0b1b9;
}

.tree-node-count {
  padding: 3px 8px;
  border-radius: 8px;
  background: #f4f5f9;
  color: #8a8b94;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.tree-node[data-depth='0'] .tree-node-label {
  font-size: 16px;
  font-weight: 700;
  color: #16171d;
}

.tree-node[data-depth='1'] .tree-node-label {
  font-weight: 600;
}

.tree-node[data-depth='3'] .tree-node-label,
.tree-node[data-depth='4'] .tree-node-label,
.tree-node[data-depth='5'] .tree-node-label {
  color: #4a4b55;
}

.tree-node.selected .tree-node-main {
  background: #eef1ff;
}

.tree-node.selected .tree-node-icon {
  background: linear-gradient(135deg, #5b6cfb 0%, #4454ef 100%);
  color: #ffffff;
}

.tree-node.selected .tree-node-label {
  color: #3f55f0;
  font-weight: 600;
}

.tree-node.selected .tree-node-hint {
  color: #8d96d8;
}

.tree-node.selected .tree-node-count {
  background: #ffffff;
  color: #4a5cff;
}

.tree-node.expanded > .tree-node-row > .tree-toggle {
  color: #4a5cff;
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
  padding: 12px 22px calc(14px + var(--prototype-safe-bottom));
  background: #ffffff;
}

.picker-confirm {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 27px;
  background: linear-gradient(135deg, #5b6cfb 0%, #4454ef 100%);
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(74, 92, 255, 0.22);
}

.picker-confirm:active {
  background: linear-gradient(135deg, #4d5ef0 0%, #3848e6 100%);
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
  transform: translate3d(0, 100%, 0);
}

@media (max-width: 360px) {
  .skeleton-container,
  .device-grid {
    gap: 12px 10px;
  }

  .device-name {
    font-size: 15px;
  }
}
</style>
