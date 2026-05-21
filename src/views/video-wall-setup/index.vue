<template>
  <div class="video-wall-page app-page app-page--navbar">
    <t-navbar title="多画面编组" left-arrow @left-click="goBack" class="page-navbar" />

    <template v-if="pageMode === 'list'">
      <section class="hero-section app-section">
        <div class="hero-banner">
          <div class="hero-copy">
            <div class="hero-title">多画面编组</div>
            <div class="hero-desc">保存常用预览组合，最多 4 画面同时查看</div>
          </div>
          <button type="button" class="hero-action" @click="startCreateGroup">
            <t-icon name="add" />
          </button>
        </div>
      </section>

      <section class="content-section app-section">
        <div v-if="groups.length > 0" class="group-list">
          <button
            v-for="group in groups"
            :key="group.id"
            type="button"
            class="group-card app-card"
            @click="openPreview(group.id)"
          >
            <div class="group-card-head">
              <div class="group-head-copy">
                <div class="group-name-row">
                  <div class="group-name">{{ group.name }}</div>
                  <span class="group-count-pill">{{ group.devices.length }}/4</span>
                </div>
              </div>
              <div class="group-time">{{ group.lastPreviewAt || '未预览' }}</div>
            </div>

            <div class="group-preview-grid">
              <div
                v-for="slot in 4"
                :key="slot"
                class="group-preview-tile"
                :class="{ filled: !!group.devices[slot - 1] }"
              >
                <template v-if="group.devices[slot - 1]">
                  <span class="preview-tile-status"></span>
                  <span class="preview-tile-name">{{ simplifyDeviceName(group.devices[slot - 1].name) }}</span>
                </template>
                <template v-else>
                  <t-icon name="video-off" />
                </template>
              </div>
            </div>

          </button>
        </div>

        <div v-else class="empty-group app-card">
          <div class="empty-illustration">
            <t-icon name="dashboard" size="42px" />
          </div>
          <div class="empty-group-title">暂无多画面编组</div>
        </div>
      </section>
    </template>

    <template v-else-if="pageMode === 'edit' && currentGroup">
      <section class="content-section app-section">
        <div class="editor-card app-card">
          <div class="editor-head">
            <button type="button" class="back-to-groups" @click="backToList">
              <t-icon name="chevron-left" />
              <span>返回编组</span>
            </button>
          </div>

          <div class="form-block">
            <div class="field-label">编组名称</div>
            <t-input
              v-model="draftGroupName"
              class="name-input"
              placeholder="请输入编组名称"
              :maxlength="20"
              clearable
            />
          </div>

          <div class="editor-summary">
            <span>已选设备</span>
            <strong>{{ selectedDeviceIds.length }}/4</strong>
          </div>

          <div class="slot-grid">
            <div
              v-for="slot in 4"
              :key="slot"
              class="slot-tile"
              :class="{ filled: !!orderedSelectedDevices[slot - 1] }"
            >
              <template v-if="orderedSelectedDevices[slot - 1]">
                <div class="slot-order">{{ slot }}</div>
                <div class="slot-name">{{ orderedSelectedDevices[slot - 1].name }}</div>
                <div class="slot-region">{{ orderedSelectedDevices[slot - 1].region }}</div>
              </template>
              <template v-else>
                <t-icon name="add" />
                <span>待选择</span>
              </template>
            </div>
          </div>

          <div class="editor-actions">
            <button type="button" class="ghost-btn" @click="openDevicePicker">
              {{ selectedDeviceIds.length > 0 ? '更改设备' : '添加设备' }}
            </button>
            <button type="button" class="primary-btn" @click="saveGroup">
              保存编组
            </button>
          </div>
        </div>
      </section>
    </template>

    <template v-else-if="pageMode === 'preview' && currentGroup">
      <section class="content-section app-section">
        <div class="preview-card app-card">
          <div class="preview-head">
            <button type="button" class="back-to-groups" @click="backToList">
              <t-icon name="chevron-left" />
              <span>返回编组</span>
            </button>

            <div class="preview-head-actions">
              <button type="button" class="ghost-btn" @click="openEditor(currentGroup.id)">编辑编组</button>
              <button type="button" class="danger-btn" @click="removeGroup">删除分组</button>
            </div>
          </div>

          <div class="group-name group-name--preview">{{ currentGroup.name }}</div>
          <div class="group-time group-time--preview">
            {{ currentGroup.lastPreviewAt ? `最近预览 ${currentGroup.lastPreviewAt}` : '暂无预览记录' }}
          </div>

          <div class="preview-video-grid">
            <div
              v-for="slot in 4"
              :key="slot"
              class="preview-video-tile"
              :class="{ filled: !!currentGroup.devices[slot - 1] }"
            >
              <template v-if="currentGroup.devices[slot - 1]">
                <div class="preview-live-badge">
                  <span class="preview-live-dot"></span>
                  <span>LIVE</span>
                </div>
                <div class="preview-signal-badge">HD</div>
                <div class="preview-grid-overlay"></div>
                <div class="preview-scanline"></div>
                <div class="preview-timestamp">{{ previewTimestamp }}</div>
                <div class="preview-camera-mark">
                  <t-icon name="video" size="28px" />
                </div>
                <div class="preview-device-copy">
                  <div class="preview-device-name">{{ currentGroup.devices[slot - 1].name }}</div>
                  <div class="preview-device-region">{{ currentGroup.devices[slot - 1].region }}</div>
                </div>
              </template>
              <template v-else>
                <t-icon name="video-off" />
                <span>空画面</span>
              </template>
            </div>
          </div>
        </div>
      </section>
    </template>

    <transition name="region-sheet">
      <div v-if="showDevicePicker" class="picker-layer" @click.self="closeDevicePicker">
        <div class="picker-panel app-card">
          <div class="picker-header">
            <button type="button" class="picker-grabber" aria-label="关闭设备选择" @click="closeDevicePicker"></button>
            <h3>选择设备</h3>
          </div>

          <div class="tree-card">
            <div class="tree-toolbar">
              <button type="button" class="tree-root-action" :class="{ active: !selectedRegionId }" @click="selectAllRegion">
                <span class="tree-root-title">全部区域</span>
                <span class="tree-root-count">{{ onlineDevices.length }} 台在线设备</span>
              </button>

              <t-search
                v-model="searchText"
                class="device-search"
                placeholder="搜索设备名称"
              />
            </div>

            <div class="region-tree">
              <div
                v-for="node in visibleTreeNodes"
                :key="node.value"
                class="tree-node"
                :class="{ selected: selectedRegionId === node.value }"
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
                    class="tree-branch"
                    :class="{ active: node.raw.type !== 'device' && selectedRegionId === node.value }"
                    @click="handleNodeClick(node.raw)"
                  >
                    <span class="tree-node-label">{{ node.label }}</span>
                    <span class="tree-node-count">{{ node.count }}{{ node.raw.type === 'device' ? '' : '台' }}</span>
                  </button>
                </div>

                <div v-if="node.raw.type === 'device'" class="tree-device-row">
                  <button
                    type="button"
                    class="tree-device-item"
                    :class="{ active: isSelected(node.raw.id), disabled: !canSelect(node.raw.id) }"
                    @click="toggleDevice(node.raw)"
                  >
                    <div class="tree-device-copy">
                      <span class="tree-device-name">{{ node.raw.name }}</span>
                      <span class="tree-device-region">{{ node.raw.region }}</span>
                    </div>
                    <div class="tree-device-check" :class="{ active: isSelected(node.raw.id) }">
                      <span v-if="isSelected(node.raw.id)">{{ getSelectedOrder(node.raw.id) }}</span>
                      <t-icon v-else name="add" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div class="picker-footer">
              <t-button block theme="primary" @click="closeDevicePicker">完成选择（{{ selectedDeviceIds.length }}/4）</t-button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'

const router = useRouter()

const pageMode = ref('list')
const searchText = ref('')
const selectedRegionId = ref('')
const expandedNodes = ref(new Set(['area-huadong', 'area-huabei', 'area-huanan']))
const showDevicePicker = ref(false)
const groupSeed = ref(1)
const activeGroupId = ref(null)
const draftGroup = ref(null)
const draftGroupName = ref('')

const baseDevices = [
  { id: 1, name: '摄像头-车间1入口', status: 'online', storeId: 'store-sh-factory', region: '华东区 / 上海工厂' },
  { id: 2, name: '摄像头-车间1出口', status: 'online', storeId: 'store-sh-factory', region: '华东区 / 上海工厂' },
  { id: 3, name: '摄像头-车间2入口', status: 'offline', storeId: 'store-sh-factory', region: '华东区 / 上海工厂' },
  { id: 4, name: '摄像头-仓库区域', status: 'offline', storeId: 'store-sh-factory', region: '华东区 / 上海工厂' },
  { id: 5, name: '摄像头-办公区域', status: 'online', storeId: 'store-bj-factory', region: '华北区 / 北京工厂' },
  { id: 6, name: '摄像头-停车场', status: 'online', storeId: 'store-bj-factory', region: '华北区 / 北京工厂' },
  { id: 7, name: '摄像头-厂区大门', status: 'online', storeId: 'store-bj-factory', region: '华北区 / 北京工厂' },
  { id: 8, name: '摄像头-生产车间', status: 'online', storeId: 'store-sz-factory', region: '华南区 / 深圳工厂' },
  { id: 9, name: '摄像头-质检区域', status: 'online', storeId: 'store-sz-factory', region: '华南区 / 深圳工厂' }
]

const groups = ref([])

const onlineDevices = computed(() => baseDevices.filter(device => device.status === 'online'))

const currentGroup = computed(() => {
  if (draftGroup.value) return draftGroup.value
  return groups.value.find(group => group.id === activeGroupId.value) || null
})

const selectedDeviceIds = computed(() => currentGroup.value?.deviceIds || [])

const orderedSelectedDevices = computed(() => {
  return selectedDeviceIds.value
    .map(id => onlineDevices.value.find(device => device.id === id))
    .filter(Boolean)
})

const previewTimestamp = computed(() => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
})

const visibleTreeNodes = computed(() => {
  const onlineByStore = {
    'store-sh-factory': onlineDevices.value.filter(device => device.storeId === 'store-sh-factory'),
    'store-bj-factory': onlineDevices.value.filter(device => device.storeId === 'store-bj-factory'),
    'store-sz-factory': onlineDevices.value.filter(device => device.storeId === 'store-sz-factory')
  }

  const tree = [
    {
      label: '华东区',
      value: 'area-huadong',
      type: 'region',
      count: onlineByStore['store-sh-factory'].length,
      children: [
        {
          label: '上海工厂',
          value: 'store-sh-factory',
          type: 'store',
          count: onlineByStore['store-sh-factory'].length,
          children: onlineByStore['store-sh-factory']
            .filter(device => !searchText.value || device.name.includes(searchText.value))
            .map(device => ({
              ...device,
              value: `device-${device.id}`,
              label: device.name,
              type: 'device',
              count: ''
            }))
        }
      ]
    },
    {
      label: '华北区',
      value: 'area-huabei',
      type: 'region',
      count: onlineByStore['store-bj-factory'].length,
      children: [
        {
          label: '北京工厂',
          value: 'store-bj-factory',
          type: 'store',
          count: onlineByStore['store-bj-factory'].length,
          children: onlineByStore['store-bj-factory']
            .filter(device => !searchText.value || device.name.includes(searchText.value))
            .map(device => ({
              ...device,
              value: `device-${device.id}`,
              label: device.name,
              type: 'device',
              count: ''
            }))
        }
      ]
    },
    {
      label: '华南区',
      value: 'area-huanan',
      type: 'region',
      count: onlineByStore['store-sz-factory'].length,
      children: [
        {
          label: '深圳工厂',
          value: 'store-sz-factory',
          type: 'store',
          count: onlineByStore['store-sz-factory'].length,
          children: onlineByStore['store-sz-factory']
            .filter(device => !searchText.value || device.name.includes(searchText.value))
            .map(device => ({
              ...device,
              value: `device-${device.id}`,
              label: device.name,
              type: 'device',
              count: ''
            }))
        }
      ]
    }
  ]

  const result = []
  const walk = (nodes, depth = 0) => {
    nodes.forEach((node) => {
      const hasChildren = !!node.children?.length
      result.push({ ...node, raw: node, depth, hasChildren })
      if (hasChildren && expandedNodes.value.has(node.value)) {
        walk(node.children, depth + 1)
      }
    })
  }

  walk(tree)
  return result
})

const syncGroupDevices = (group) => {
  group.devices = group.deviceIds
    .map(id => onlineDevices.value.find(item => item.id === id))
    .filter(Boolean)
}

const simplifyDeviceName = (name) => {
  return name.replace(/^摄像头-/, '')
}

const goBack = () => {
  if (pageMode.value !== 'list') {
    backToList()
    return
  }
  router.back()
}

const startCreateGroup = () => {
  draftGroup.value = {
    id: `draft-${Date.now()}`,
    name: '',
    deviceIds: [],
    devices: [],
    lastPreviewAt: ''
  }
  draftGroupName.value = `多画面编组 ${groupSeed.value}`
  pageMode.value = 'edit'
  activeGroupId.value = null
  searchText.value = ''
  selectedRegionId.value = ''
}

const openPreview = (id) => {
  activeGroupId.value = id
  draftGroup.value = null
  draftGroupName.value = ''
  showDevicePicker.value = false
  pageMode.value = 'preview'
}

const openEditor = (id) => {
  const group = groups.value.find(item => item.id === id)
  if (!group) return
  activeGroupId.value = id
  draftGroup.value = {
    id: group.id,
    name: group.name,
    deviceIds: [...group.deviceIds],
    devices: [...group.devices],
    lastPreviewAt: group.lastPreviewAt
  }
  draftGroupName.value = group.name
  pageMode.value = 'edit'
  searchText.value = ''
  selectedRegionId.value = ''
}

const backToList = () => {
  pageMode.value = 'list'
  activeGroupId.value = null
  draftGroup.value = null
  draftGroupName.value = ''
  searchText.value = ''
  selectedRegionId.value = ''
  showDevicePicker.value = false
}

const saveGroup = () => {
  const nextName = draftGroupName.value.trim()
  if (!nextName) {
    Toast.warning('请输入编组名称')
    return
  }
  if (selectedDeviceIds.value.length === 0) {
    Toast.warning('请至少选择 1 个设备')
    return
  }

  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  const previewTime = `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

  if (draftGroup.value) {
    draftGroup.value.name = nextName
    draftGroup.value.lastPreviewAt = previewTime
    syncGroupDevices(draftGroup.value)

    const existedIndex = groups.value.findIndex(item => item.id === draftGroup.value.id)
    if (existedIndex > -1) {
      const nextGroups = [...groups.value]
      nextGroups.splice(existedIndex, 1, { ...draftGroup.value })
      groups.value = nextGroups
    } else {
      groups.value = [
        ...groups.value,
        {
          ...draftGroup.value,
          id: Date.now()
        }
      ]
      groupSeed.value += 1
    }
  }

  Toast.success('编组已保存')
  backToList()
}

const removeGroup = () => {
  if (activeGroupId.value === null) return
  groups.value = groups.value.filter(group => group.id !== activeGroupId.value)
  Toast.success('分组已删除')
  backToList()
}

const selectAllRegion = () => {
  selectedRegionId.value = ''
}

const handleNodeClick = (node) => {
  if (node.type === 'device') return
  selectedRegionId.value = node.value
  if (node.children?.length) toggleExpand(node.value)
}

const isExpanded = (value) => expandedNodes.value.has(value)

const toggleExpand = (value) => {
  const next = new Set(expandedNodes.value)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  expandedNodes.value = next
}

const isSelected = (id) => selectedDeviceIds.value.includes(id)

const canSelect = (id) => isSelected(id) || selectedDeviceIds.value.length < 4

const getSelectedOrder = (id) => selectedDeviceIds.value.indexOf(id) + 1

const toggleDevice = (device) => {
  const group = currentGroup.value
  if (!group) return

  if (isSelected(device.id)) {
    group.deviceIds = group.deviceIds.filter(id => id !== device.id)
  } else {
    if (group.deviceIds.length >= 4) {
      Toast.warning('最多选择 4 个设备')
      return
    }
    group.deviceIds = [...group.deviceIds, device.id]
  }

  syncGroupDevices(group)
}

const openDevicePicker = () => {
  showDevicePicker.value = true
}

const closeDevicePicker = () => {
  showDevicePicker.value = false
}
</script>

<style scoped>
.video-wall-page {
  position: relative;
  background:
    radial-gradient(circle at top right, rgba(var(--theme-primary-rgb), 0.12), transparent 28%),
    linear-gradient(180deg, #edf4ff 0%, #f6f8fc 24%, #f5f7fb 100%);
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

.hero-section,
.content-section {
  padding-top: 14px;
}

.hero-banner {
  min-height: 74px;
  padding: 14px 14px 14px 16px;
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(135deg, var(--theme-glass-4) 0%, var(--theme-primary) 58%, var(--theme-primary-strong) 100%);
  box-shadow: 0 18px 36px rgba(var(--theme-primary-rgb), 0.16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hero-copy {
  min-width: 0;
}

.hero-title {
  font-size: 16px;
  font-weight: 700;
  color: #173153;
}

.hero-desc {
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.45;
  color: rgba(23, 49, 83, 0.72);
}

.hero-action {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.34);
  color: #1f5a7b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.group-list {
  display: grid;
  gap: 12px;
}

.app-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 22px;
  box-shadow: 0 16px 34px rgba(11, 31, 68, 0.07);
}

.group-card,
.empty-group,
.editor-card,
.preview-card,
.tree-card {
  padding: 18px;
}

.group-card {
  border: 1px solid rgba(227, 234, 244, 0.96);
  text-align: left;
}

.group-card:active {
  transform: scale(0.992);
}

.group-card-head,
.preview-head,
.preview-head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-card-head,
.preview-head {
  justify-content: space-between;
}

.group-head-copy {
  min-width: 0;
}

.group-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.group-name {
  font-size: 17px;
  font-weight: 700;
  color: #173153;
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-time {
  margin-top: 4px;
  font-size: 12px;
  color: #7b8799;
}

.group-count-pill {
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(var(--theme-primary-rgb), 0.08);
  color: var(--theme-primary-strong);
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.group-preview-grid,
.slot-grid,
.preview-video-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.group-preview-tile,
.slot-tile,
.preview-video-tile {
  min-height: 78px;
  border-radius: 16px;
  border: 1px dashed rgba(196, 207, 222, 0.94);
  background: linear-gradient(180deg, rgba(247, 250, 255, 0.98) 0%, rgba(242, 247, 252, 0.98) 100%);
  color: #93a4bc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  text-align: center;
}

.group-preview-tile.filled,
.slot-tile.filled {
  border-style: solid;
  color: #173153;
}

.preview-tile-status,
.preview-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
}

.preview-tile-name {
  width: 100%;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.empty-group {
  padding-top: 28px;
  padding-bottom: 28px;
  text-align: center;
  color: #8ea1bb;
}

.empty-illustration {
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(239, 245, 255, 0.96) 0%, rgba(229, 237, 249, 0.96) 100%);
  color: #8ea2c2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-group-title {
  margin-top: 16px;
  font-size: 17px;
  font-weight: 700;
  color: #173153;
}

.empty-group-btn {
  margin-top: 18px;
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: var(--theme-primary-strong);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.editor-head {
  display: flex;
  align-items: center;
}

.back-to-groups {
  border: 0;
  background: transparent;
  color: #6f7d93;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
}

.form-block {
  margin-top: 16px;
}

.field-label {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7a90;
}

.name-input :deep(.t-input) {
  border-radius: 16px;
  background: rgba(246, 249, 253, 0.98);
}

.editor-summary {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #738299;
}

.editor-summary strong {
  font-size: 14px;
  color: #173153;
}

.slot-tile {
  min-height: 110px;
}

.slot-order {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(var(--theme-primary-rgb), 0.1);
  color: var(--theme-primary-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.slot-name {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 700;
  color: #173153;
}

.slot-region {
  font-size: 12px;
  line-height: 1.45;
  color: #7b8799;
}

.editor-actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ghost-btn,
.primary-btn,
.danger-btn {
  height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.ghost-btn {
  background: rgba(236, 241, 248, 0.96);
  color: #56708f;
}

.primary-btn {
  background: var(--theme-primary-strong);
  color: #fff;
}

.danger-btn {
  background: rgba(213, 73, 65, 0.1);
  color: #d54941;
}

.group-name--preview {
  margin-top: 16px;
}

.group-time--preview {
  margin-top: 6px;
}

.preview-video-tile {
  min-height: 152px;
  position: relative;
  overflow: hidden;
  border-style: solid;
  border-color: rgba(207, 219, 236, 0.96);
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.14), transparent 28%),
    linear-gradient(160deg, #0d1b31 0%, #173156 42%, #1d4f92 100%);
  color: rgba(255, 255, 255, 0.72);
}

.preview-video-tile.filled {
  color: #fff;
}

.preview-live-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(7, 14, 26, 0.42);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
}

.preview-signal-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.preview-grid-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 18px 18px;
  opacity: 0.28;
  pointer-events: none;
}

.preview-scanline {
  position: absolute;
  left: 0;
  right: 0;
  top: 26%;
  height: 44px;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.08) 48%, transparent 100%);
  filter: blur(10px);
  opacity: 0.75;
  pointer-events: none;
}

.preview-timestamp {
  position: absolute;
  left: 10px;
  bottom: 48px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.78);
}

.preview-camera-mark {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.preview-device-copy {
  margin-top: auto;
  width: 100%;
  padding: 10px 2px 2px;
  text-align: left;
  position: relative;
  z-index: 1;
}

.preview-device-name {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.preview-device-region {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
}

.tree-toolbar {
  display: grid;
  gap: 12px;
}

.tree-root-action {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #607896;
  text-align: left;
}

.tree-root-title {
  font-size: 15px;
  font-weight: 700;
  color: #16315b;
}

.tree-root-count {
  font-size: 12px;
  font-weight: 700;
}

.tree-root-action.active .tree-root-title,
.tree-root-action.active .tree-root-count {
  color: var(--theme-primary-strong);
}

.device-search {
  margin-top: 0;
}

.region-tree {
  margin-top: 14px;
  display: grid;
  gap: 6px;
}

.tree-node {
  padding-left: calc(var(--tree-depth) * 14px);
}

.tree-node-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tree-toggle {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #7c8ca3;
  flex: 0 0 28px;
}

.tree-toggle--placeholder {
  opacity: 0;
}

.tree-branch {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border: 0;
  border-radius: 14px;
  background: rgba(247, 250, 255, 0.96);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #173153;
}

.tree-branch.active {
  background: rgba(var(--theme-primary-rgb), 0.08);
}

.tree-node-label {
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
}

.tree-node-count {
  flex: 0 0 auto;
  font-size: 12px;
  color: #708197;
}

.tree-device-row {
  margin-top: 6px;
}

.tree-device-item {
  width: 100%;
  border: 1px solid rgba(227, 234, 244, 0.96);
  border-radius: 16px;
  background: #fff;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
}

.tree-device-item.active {
  border-color: rgba(var(--theme-primary-rgb), 0.3);
  box-shadow: 0 12px 24px rgba(var(--theme-primary-rgb), 0.08);
}

.tree-device-item.disabled {
  opacity: 0.6;
}

.tree-device-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.tree-device-name {
  font-size: 14px;
  font-weight: 700;
  color: #173153;
}

.tree-device-region {
  font-size: 12px;
  color: #7b8799;
}

.tree-device-check {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(236, 241, 248, 0.96);
  color: #90a0b6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  font-size: 12px;
  font-weight: 700;
}

.tree-device-check.active {
  background: var(--theme-primary-strong);
  color: #fff;
}

.picker-layer {
  position: absolute;
  inset: 0;
  background: rgba(12, 21, 34, 0.28);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  z-index: 1400;
  overflow: hidden;
}

.picker-panel {
  width: 100%;
  margin: 16px;
  max-height: calc(100% - 32px);
  overflow: hidden;
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
}

.picker-grabber {
  width: 42px;
  height: 5px;
  border: 0;
  border-radius: 999px;
  background: rgba(134, 149, 171, 0.36);
}

.picker-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1c2f4e;
}

.picker-footer {
  margin-top: 14px;
}
</style>
