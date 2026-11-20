<template>
  <div class="home-page app-page" :class="{ 'is-map-mode': viewMode === 'map' }">
    <span class="home-decor" aria-hidden="true"></span>

    <header class="home-top">
      <div class="home-head-row">
        <div class="view-switch">
          <button
            type="button"
            class="view-switch-item"
            :class="{ active: viewMode === 'video' }"
            @click="switchView('video')"
          >
            <t-icon name="video" />
            视频广场
          </button>
          <button
            type="button"
            class="view-switch-item"
            :class="{ active: viewMode === 'map' }"
            @click="switchView('map')"
          >
            <t-icon name="location" />
            点位地图
          </button>
        </div>

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

    <template v-if="viewMode === 'video'">
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
              <img :src="device.thumbnail" :alt="device.name" loading="lazy" decoding="async" />
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
    </template>

    <!-- ==================== 点位地图 ==================== -->
    <div v-else class="map-shell">
      <VideoMapCanvas
        :stores="mapStoresWithCounts"
        :devices="mapDevices"
        :mode="mapMode"
        :selected-store-id="selectedMapStoreId"
        :selected-device-id="selectedMapDeviceId"
        @store-click="openStoreSheet"
        @device-click="openDeviceMapSheet"
      />

      <div class="map-mode-tabs">
        <button
          type="button"
          class="map-mode-tab"
          :class="{ active: mapMode === 'store' }"
          @click="switchMapMode('store')"
        >
          门店定位
        </button>
        <button
          type="button"
          class="map-mode-tab"
          :class="{ active: mapMode === 'device' }"
          @click="switchMapMode('device')"
        >
          设备定位
        </button>
      </div>

      <div class="map-summary">
        <span class="map-summary-dot" />
        {{
          mapMode === 'store'
            ? `${mapStoresWithCounts.length} 个门店 · ${mapDevices.length} 台设备`
            : `${mapDevices.length} 个监控点位`
        }}
      </div>

      <!-- 门店设备列表 -->
      <transition name="map-sheet">
        <section v-if="storeSheetVisible && selectedStoreData" class="map-sheet">
          <button type="button" class="map-sheet-grabber" aria-label="关闭门店设备列表" @click="closeStoreSheet">
            <i />
          </button>
          <div class="map-sheet-head">
            <div class="map-sheet-title">
              <h3>{{ selectedStoreData.name }}</h3>
              <p>{{ selectedStoreData.area }} · 共 {{ selectedStoreData.deviceCount }} 台设备</p>
            </div>
            <button type="button" class="map-sheet-close" aria-label="关闭" @click="closeStoreSheet">
              <t-icon name="close" />
            </button>
          </div>

          <div class="map-sheet-body">
            <button
              v-for="device in selectedStoreDevices"
              :key="device.id"
              type="button"
              class="map-device-card"
              @click="openDeviceMapSheet(device)"
            >
              <div class="map-device-card-head">
                <span class="map-device-dot" :class="device.status" />
                <strong>{{ device.name }}</strong>
                <span class="map-state" :class="device.status">{{ getStatusText(device.status) }}</span>
              </div>
              <div class="map-device-rows">
                <div class="map-device-row"><span>设备License</span><em>{{ device.license }}</em></div>
                <div class="map-device-row"><span>所属区域</span><em>{{ device.area }}</em></div>
                <div class="map-device-row"><span>设备类型</span><em>{{ device.type }}</em></div>
                <div class="map-device-row">
                  <span>最近事件</span>
                  <em :class="{ 'is-event': device.lastEvent }">{{ device.lastEvent || '暂无事件' }}</em>
                </div>
              </div>
              <div class="map-device-card-foot">
                <span>{{ device.lat }}°N，{{ device.lng }}°E</span>
                <span class="map-device-link">查看详情<t-icon name="chevron-right" /></span>
              </div>
            </button>

            <div v-if="!selectedStoreDevices.length" class="map-sheet-empty">
              <t-icon name="video" />
              <p>该门店下暂无设备</p>
            </div>
          </div>
        </section>
      </transition>

      <!-- 设备详情 -->
      <transition name="map-sheet">
        <section v-if="deviceSheetVisible && selectedMapDeviceData" class="map-sheet map-sheet--device">
          <button type="button" class="map-sheet-grabber" aria-label="关闭设备详情" @click="closeDeviceSheet">
            <i />
          </button>
          <div class="map-sheet-head">
            <div class="map-sheet-title">
              <h3>{{ selectedMapDeviceData.name }}</h3>
              <p>
                <span class="map-state" :class="selectedMapDeviceData.status">
                  {{ getStatusText(selectedMapDeviceData.status) }}
                </span>
                {{ selectedMapDeviceData.storeName }}
              </p>
            </div>
            <button type="button" class="map-sheet-close" aria-label="关闭" @click="closeDeviceSheet">
              <t-icon name="close" />
            </button>
          </div>

          <div class="map-sheet-body">
            <div class="map-device-rows map-device-rows--detail">
              <div class="map-device-row"><span>设备License</span><em>{{ selectedMapDeviceData.license }}</em></div>
              <div class="map-device-row"><span>所属区域</span><em>{{ selectedMapDeviceData.area }}</em></div>
              <div class="map-device-row"><span>设备类型</span><em>{{ selectedMapDeviceData.type }}</em></div>
              <div class="map-device-row">
                <span>坐标</span>
                <em>{{ selectedMapDeviceData.lat }}°N，{{ selectedMapDeviceData.lng }}°E</em>
              </div>
              <div class="map-device-row">
                <span>最近事件</span>
                <em :class="{ 'is-event': selectedMapDeviceData.lastEvent }">
                  {{ selectedMapDeviceData.lastEvent || '暂无事件' }}
                </em>
              </div>
            </div>

            <div class="map-sheet-actions">
              <button type="button" class="map-action map-action--primary" @click="openLiveVideo(selectedMapDeviceData)">
                <t-icon name="video" />
                实时视频
              </button>
            </div>
          </div>
        </section>
      </transition>
    </div>

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
import VideoMapCanvas from '../../components/VideoMapCanvas.vue'

const router = useRouter()

const searchText = ref('')
const loading = ref(true)
const deviceRefreshing = ref(false)
const treeRefreshing = ref(false)

// 视频广场 / 点位地图
const viewMode = ref('video')
const mapMode = ref('store')
const selectedMapStoreId = ref('')
const storeSheetVisible = ref(false)
const selectedMapDeviceId = ref('')
const deviceSheetVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
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
  {
    id: 1, name: '摄像头-车间1入口', status: 'online', storeId: 'store-sh-factory', storeName: '上海工厂',
    thumbnail: thumbnailUrl, license: 'CAM-SH-A101', type: '高清枪机', area: '生产车间 · A线', regionId: 'line-sh-a',
    lat: 32.0625, lng: 118.7325, lastEvent: '2024-07-29 18:00:24',
    marker: { left: 17, top: 21 }
  },
  {
    id: 2, name: '摄像头-车间1出口', status: 'online', storeId: 'store-sh-factory', storeName: '上海工厂',
    thumbnail: thumbnailUrl, license: 'CAM-SH-A102', type: '低功耗摄像机', area: '生产车间 · A线', regionId: 'line-sh-a',
    lat: 32.0598, lng: 118.7302, lastEvent: null,
    marker: { left: 38, top: 20 }
  },
  {
    id: 3, name: '摄像头-车间2入口', status: 'offline', storeId: 'store-sh-factory', storeName: '上海工厂',
    thumbnail: thumbnailUrl, license: 'CAM-SH-B201', type: '高清球机', area: '生产车间 · B线', regionId: 'line-sh-b',
    lat: 32.0602, lng: 118.7288, lastEvent: '2024-07-23 18:00:00',
    marker: { left: 15, top: 38 }
  },
  {
    id: 4, name: '摄像头-仓库区域', status: 'offline', storeId: 'store-sh-factory', storeName: '上海工厂',
    thumbnail: thumbnailUrl, license: 'CAM-SH-W301', type: '低功耗摄像机', area: '仓库', regionId: 'dept-sh-wh',
    lat: 32.0589, lng: 118.7312, lastEvent: null,
    marker: { left: 39, top: 39 }
  },
  {
    id: 5, name: '摄像头-办公区域', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂',
    thumbnail: thumbnailUrl, license: 'CAM-BJ-O101', type: '高清球机', area: '办公区域', regionId: 'store-bj-factory',
    lat: 32.0508, lng: 118.7808, lastEvent: null,
    marker: { left: 38, top: 44 }
  },
  {
    id: 6, name: '摄像头-停车场', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂',
    thumbnail: thumbnailUrl, license: 'CAM-BJ-P201', type: '低功耗摄像机', area: '停车场', regionId: 'store-bj-factory',
    lat: 32.0492, lng: 118.7791, lastEvent: '2024-07-27 14:22:10',
    marker: { left: 50, top: 62 }
  },
  {
    id: 7, name: '摄像头-厂区大门', status: 'online', storeId: 'store-bj-factory', storeName: '北京工厂',
    thumbnail: thumbnailUrl, license: 'CAM-BJ-G301', type: '高清枪机', area: '厂区大门', regionId: 'store-bj-factory',
    lat: 32.0514, lng: 118.7812, lastEvent: null,
    marker: { left: 62, top: 45 }
  },
  {
    id: 8, name: '摄像头-生产车间', status: 'online', storeId: 'store-sz-factory', storeName: '深圳工厂',
    thumbnail: thumbnailUrl, license: 'CAM-SZ-W101', type: '高清球机', area: '生产车间', regionId: 'store-sz-factory',
    lat: 31.9506, lng: 118.8207, lastEvent: '2024-07-29 10:00:05',
    marker: { left: 61, top: 64 }
  },
  {
    id: 9, name: '摄像头-质检区域', status: 'online', storeId: 'store-sz-factory', storeName: '深圳工厂',
    thumbnail: thumbnailUrl, license: 'CAM-SZ-Q201', type: '低功耗摄像机', area: '质检区域', regionId: 'store-sz-factory',
    lat: 31.9494, lng: 118.8192, lastEvent: null,
    marker: { left: 84, top: 66 }
  }
])

// 点位地图 — 门店聚合点
const mapStores = [
  {
    id: 'store-sh-factory', name: '上海工厂', district: '桥北', area: '华东区 · 上海工厂',
    lat: 32.060, lng: 118.730, marker: { left: 27, top: 29 }
  },
  {
    id: 'store-bj-factory', name: '北京工厂', district: '鼓楼', area: '华北区 · 北京工厂',
    lat: 32.050, lng: 118.780, marker: { left: 50, top: 50 }
  },
  {
    id: 'store-sz-factory', name: '深圳工厂', district: '江宁', area: '华南区 · 深圳工厂',
    lat: 31.950, lng: 118.820, marker: { left: 72, top: 71 }
  }
]

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
      result = result.filter(d =>
        allValues.includes(d.storeId) ||
        allValues.includes(d.regionId) ||
        d.storeId === selectedStoreId.value
      )
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

// ==================== 点位地图 ====================
const mapDevices = computed(() =>
  filteredDevices.value.map(device => ({
    ...device,
    online: device.status === 'online'
  }))
)

const mapStoresWithCounts = computed(() =>
  mapStores
    .map(store => ({
      ...store,
      deviceCount: filteredDevices.value.filter(device => device.storeId === store.id).length
    }))
    .filter(store => store.deviceCount > 0)
)

const selectedStoreData = computed(
  () => mapStoresWithCounts.value.find(store => store.id === selectedMapStoreId.value) || null
)

const selectedStoreDevices = computed(() =>
  filteredDevices.value.filter(device => device.storeId === selectedMapStoreId.value)
)

const selectedMapDeviceData = computed(
  () => devices.value.find(device => device.id === selectedMapDeviceId.value) || null
)

const switchMapMode = (mode) => {
  mapMode.value = mode
  selectedMapStoreId.value = ''
  storeSheetVisible.value = false
  selectedMapDeviceId.value = ''
  deviceSheetVisible.value = false
}

const switchView = (mode) => {
  viewMode.value = mode
  if (mode === 'map') {
    // 地图视角不沿用视频列表的临时筛选，避免隐藏的搜索词导致点位为空
    searchText.value = ''
    activeFilter.value = 'all'
    return
  }
  switchMapMode('store')
}

const openStoreSheet = (store) => {
  selectedMapStoreId.value = store.id
  storeSheetVisible.value = true
  selectedMapDeviceId.value = ''
  deviceSheetVisible.value = false
}

const closeStoreSheet = () => {
  storeSheetVisible.value = false
  selectedMapStoreId.value = ''
}

const openDeviceMapSheet = (device) => {
  selectedMapDeviceId.value = device.id
  deviceSheetVisible.value = true
  storeSheetVisible.value = false
  selectedMapStoreId.value = ''
}

const closeDeviceSheet = () => {
  deviceSheetVisible.value = false
  selectedMapDeviceId.value = ''
}

const openLiveVideo = (device) => {
  if (device.status === 'offline') {
    Toast.error('设备离线，无法查看实时视频')
    return
  }
  router.push(`/video-player/${device.id}`)
}

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

.home-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

/* 视频广场 / 点位地图 切换 */
.view-switch {
  flex: 0 1 auto;
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.view-switch-item {
  height: 34px;
  padding: 0 13px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #5f6472;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  transition: background 0.22s ease, color 0.22s ease, box-shadow 0.22s ease, transform 0.16s ease;
}

.view-switch-item :deep(.t-icon) {
  font-size: 16px;
}

.view-switch-item.active {
  background: linear-gradient(135deg, #5b6cfb 0%, #4059f0 100%);
  color: #ffffff;
  box-shadow:
    0 6px 16px rgba(64, 89, 240, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.view-switch-item:active {
  transform: scale(0.97);
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

/* ==================== 点位地图 ==================== */
.home-page.is-map-mode {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
}

:global(body.prototype-preview-canvas) .home-page.is-map-mode {
  height: calc(100dvh - 88px);
  min-height: 640px;
}

.home-page.is-map-mode .home-top {
  flex: 0 0 auto;
}

.map-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  margin: 8px 12px calc(var(--app-tabbar-space, 92px) + 2px);
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 24px;
  overflow: hidden;
  background: #f2f6f5;
  box-shadow: 0 18px 38px rgba(70, 88, 140, 0.14);
}

.map-mode-tabs {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 6;
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 6px 16px rgba(24, 43, 74, 0.16);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.map-mode-tab {
  height: 29px;
  padding: 0 13px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #66748a;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.map-mode-tab.active {
  background: #4059f0;
  color: #fff;
  box-shadow: 0 4px 10px rgba(64, 89, 240, 0.28);
}

.map-summary {
  position: absolute;
  right: 52px;
  top: 15px;
  z-index: 5;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #56657b;
  font-size: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 5px 14px rgba(24, 43, 74, 0.12);
  white-space: nowrap;
}

.map-summary-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.14);
}

/* 底部面板 */
.map-sheet {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 8;
  max-height: 58%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -14px 36px rgba(19, 37, 70, 0.2);
  overflow: hidden;
}

.map-sheet--device {
  max-height: 46%;
}

.map-sheet-grabber {
  flex: 0 0 18px;
  width: 100%;
  padding: 7px 0 0;
  border: 0;
  background: transparent;
  display: flex;
  justify-content: center;
}

.map-sheet-grabber i {
  width: 38px;
  height: 4px;
  border-radius: 999px;
  background: #e2e7ef;
}

.map-sheet-head {
  flex: 0 0 auto;
  padding: 2px 16px 9px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.map-sheet-title {
  min-width: 0;
}

.map-sheet-title h3 {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
  color: #16233a;
  letter-spacing: -0.01em;
}

.map-sheet-title p {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  color: #93a0b1;
}

.map-sheet-close {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border: 0;
  border-radius: 50%;
  background: #f4f5f8;
  color: #7a7e8a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.map-sheet-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 2px 14px calc(14px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 9px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.map-device-card {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #eef1f6;
  border-radius: 14px;
  background: #fff;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.map-device-card:active {
  background: #f7f9ff;
  border-color: rgba(64, 89, 240, 0.35);
}

.map-device-card-head {
  display: flex;
  align-items: center;
  gap: 5px;
}

.map-device-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: #16a34a;
}

.map-device-dot.offline {
  background: #b0bac7;
}

.map-device-card-head strong {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-state {
  flex: 0 0 auto;
  padding: 1px 6px;
  border-radius: 6px;
  background: #eafaf2;
  color: #12946a;
  font-size: 9px;
  font-weight: 700;
}

.map-state.offline {
  background: #f1f3f6;
  color: #8a94a4;
}

.map-device-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-device-rows--detail {
  gap: 9px;
  padding: 12px;
  border-radius: 14px;
  background: #f7f8fc;
}

.map-device-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 10.5px;
  line-height: 1.5;
}

.map-device-row span {
  flex: 0 0 66px;
  color: #9aa4b4;
}

.map-device-row em {
  flex: 1;
  min-width: 0;
  font-style: normal;
  color: #334155;
  word-break: break-all;
}

.map-device-row em.is-event {
  color: #e5484d;
  font-weight: 600;
}

.map-device-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px dashed #f1f3f8;
  color: #a3aebd;
  font-size: 9.5px;
}

.map-device-link {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  color: #4059f0;
  font-weight: 600;
}

.map-device-link :deep(.t-icon) {
  font-size: 12px;
}

.map-sheet-empty {
  padding: 22px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  color: #a9b2c0;
  font-size: 11.5px;
}

.map-sheet-empty :deep(.t-icon) {
  font-size: 28px;
  color: #ccd5e2;
}

.map-sheet-actions {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.map-action {
  height: 42px;
  border: 0;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.map-action--primary {
  background: linear-gradient(135deg, #5b6cfb 0%, #4059f0 100%);
  color: #fff;
  box-shadow: 0 10px 20px rgba(64, 89, 240, 0.24);
}

.map-action--primary :deep(.t-icon) {
  font-size: 15px;
}

.map-sheet-enter-active,
.map-sheet-leave-active {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease;
}

.map-sheet-enter-from,
.map-sheet-leave-to {
  transform: translateY(26px);
  opacity: 0;
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
