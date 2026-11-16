<template>
  <div class="video-wall-page">
    <header class="page-top">
      <button type="button" class="back-entry" aria-label="返回" @click="goBack">
        <t-icon name="chevron-left" />
      </button>
      <h1 class="page-title">多画面编组</h1>
      <button
        v-if="pageMode === 'preview'"
        type="button"
        class="more-entry"
        aria-label="更多操作"
        @click.stop="openMoreMenu"
      >
        <t-icon name="ellipsis" />
      </button>
      <span v-else class="top-spacer"></span>
    </header>

    <main class="page-body">
      <template v-if="pageMode === 'list'">
        <section v-if="groups.length > 0" class="intro-card">
          <div class="intro-copy">
            <h2 class="intro-title">多画面编组</h2>
            <p class="intro-desc">保存常用预览组合，最多 4 画面同时查看</p>
          </div>
          <button type="button" class="intro-add" aria-label="添加分组" @click="startCreateGroup">
            <FolderAddIcon :size="40" />
          </button>
        </section>

        <div v-if="groups.length > 0" class="group-list">
          <button
            v-for="group in groups"
            :key="group.id"
            type="button"
            class="group-card"
            @click="openPreview(group.id)"
          >
            <div class="group-head">
              <div class="group-name-row">
                <span class="group-name">{{ group.name }}</span>
                <span class="count-pill">{{ group.devices.length }}/4</span>
              </div>
              <span class="group-time">{{ group.lastPreviewAt || '未预览' }}</span>
            </div>

            <div class="tile-grid">
              <div
                v-for="slot in 4"
                :key="slot"
                class="tile"
                :class="{ 'tile--empty': !group.devices[slot - 1] }"
              >
                <template v-if="group.devices[slot - 1]">
                  <img class="tile-img" :src="cameraImage" alt="" loading="lazy" />
                  <span class="tile-name">{{ slot }} {{ group.devices[slot - 1].name }}</span>
                  <span class="tile-region">{{ group.devices[slot - 1].region }}</span>
                </template>
                <template v-else>
                  <t-icon name="video-off" class="tile-empty-icon" />
                  <span>空画面</span>
                </template>
              </div>
            </div>
          </button>
        </div>

        <template v-else>
          <section class="empty-card">
            <p class="empty-desc">保存常用预览组合，最多 4 画面同时查看</p>
            <div class="empty-main">
              <FolderAddIcon :size="84" class="empty-icon" />
              <div class="empty-title">暂无多画面编组</div>
            </div>
          </section>

          <button type="button" class="pill pill-primary add-group-btn" @click="startCreateGroup">
            添加分组
          </button>
        </template>
      </template>

      <template v-else-if="pageMode === 'edit' && currentGroup">
        <section class="editor-card">
          <label class="field-label" for="group-name">编组名称</label>
          <div class="name-row">
            <input
              id="group-name"
              v-model="draftGroupName"
              class="name-input"
              type="text"
              maxlength="20"
              placeholder="请输入编组名称"
            />
            <button
              v-if="draftGroupName"
              type="button"
              class="name-clear"
              aria-label="清空名称"
              @click="draftGroupName = ''"
            >
              <t-icon name="close" />
            </button>
          </div>

          <div class="card-divider"></div>

          <div class="editor-head">
            <div class="editor-head-left">
              <span class="editor-title">已选设备</span>
              <span class="count-pill">{{ selectedDeviceIds.length }} 项</span>
            </div>
            <span class="editor-progress">{{ selectedDeviceIds.length }}/4</span>
          </div>

          <div class="tile-grid">
            <template v-for="slot in 4" :key="slot">
              <div
                v-if="orderedSelectedDevices[slot - 1]"
                class="tile tile--draggable"
                :class="{ 'is-dragging': draggingSlot === slot - 1 }"
                :data-slot="slot - 1"
                @pointerdown="onTilePress($event, slot - 1)"
              >
                <img class="tile-img" :src="cameraImage" alt="" loading="lazy" />
                <span class="tile-name">{{ slot }} {{ orderedSelectedDevices[slot - 1].name }}</span>
                <span class="tile-region">{{ orderedSelectedDevices[slot - 1].region }}</span>
              </div>
              <button
                v-else
                type="button"
                class="tile-empty"
                :data-slot="slot - 1"
                @click="openDevicePicker"
              >
                <t-icon name="add" class="tile-empty-plus" />
                <span>待选择</span>
              </button>
            </template>
          </div>

          <p class="reorder-hint">长按画面可拖动调整顺序</p>
        </section>

        <div class="action-row">
          <button type="button" class="pill pill-light" @click="openDevicePicker">
            {{ selectedDeviceIds.length > 0 ? '更改设备' : '添加设备' }}
          </button>
          <button type="button" class="pill pill-primary" @click="saveGroup">保存编组</button>
        </div>
      </template>

      <template v-else-if="pageMode === 'preview' && currentGroup">
        <section class="preview-card">
          <div class="group-head">
            <div class="group-name-row">
              <span class="group-name group-name--lg">{{ currentGroup.name }}</span>
              <span class="count-pill">{{ currentGroup.devices.length }}/4</span>
            </div>
            <span class="group-time">
              {{ currentGroup.lastPreviewAt ? `最近预览 ${currentGroup.lastPreviewAt}` : '暂无预览记录' }}
            </span>
          </div>

          <div class="tile-grid">
            <button
              v-for="slot in 4"
              :key="slot"
              type="button"
              class="tile tile--select"
              :class="{
                'tile--empty': !currentGroup.devices[slot - 1],
                'is-active': activeSlot === slot - 1
              }"
              @click="selectSlot(slot - 1)"
            >
              <template v-if="currentGroup.devices[slot - 1]">
                <img class="tile-img" :src="cameraImage" alt="" loading="lazy" />
                <span class="tile-name">{{ slot }} {{ currentGroup.devices[slot - 1].name }}</span>
                <span class="tile-region">{{ currentGroup.devices[slot - 1].region }}</span>
                <span class="tile-time">{{ previewClock }}</span>
                <span class="tile-badges">
                  <span class="chip">
                    <i class="chip-dot"></i>
                    LIVE
                  </span>
                  <span class="chip">HD</span>
                </span>
              </template>
              <template v-else>
                <t-icon name="video-off" class="tile-empty-icon" />
                <span>空画面</span>
              </template>
            </button>
          </div>

        </section>

        <section class="control-block">
          <div class="control-head">
            <div class="control-head-main">
              <span class="control-label">控制画面</span>
              <span v-if="activeDevice" class="control-device">{{ activeSlot + 1 }} {{ activeDevice.name }}</span>
              <span v-else class="control-device control-device--empty">点选上方画面后可控制</span>
            </div>
            <button type="button" class="control-fullscreen" aria-label="全屏查看" @click="openFullscreen">
              <t-icon name="fullscreen" />
            </button>
          </div>

          <div v-if="activeDevice" class="action-strip action-strip--wall">
            <button
              v-if="supportsCapability('ptz')"
              type="button"
              class="strip-action"
              :class="{ active: showPtz }"
              @click="togglePtz"
            >
              <span class="strip-icon">
                <t-icon name="control-platform" size="24px" />
              </span>
              <span>云台</span>
            </button>
            <button
              v-if="supportsCapability('talk')"
              type="button"
              class="strip-action"
              :class="{ active: isTalking }"
              @click="toggleTalk"
            >
              <span class="strip-icon">
                <t-icon name="microphone-1" size="24px" />
              </span>
              <span>对讲</span>
            </button>
            <button
              v-if="supportsCapability('light')"
              type="button"
              class="strip-action"
              :class="{ active: isLightOn }"
              @click="toggleLight"
            >
              <span class="strip-icon">
                <t-icon :name="isLightOn ? 'lightbulb-filled' : 'lightbulb'" size="24px" />
              </span>
              <span>补光</span>
            </button>
            <button type="button" class="strip-action" @click="takeSnapshot">
              <span class="strip-icon">
                <t-icon name="camera" size="24px" />
              </span>
              <span>截图</span>
            </button>
            <button
              type="button"
              class="strip-action"
              :class="{ record: isRecording }"
              @click="toggleRecord"
            >
              <span class="strip-icon">
                <t-icon :name="isRecording ? 'video-stop' : 'video'" size="24px" />
              </span>
              <span>录像</span>
            </button>
          </div>

          <div v-if="showPtz && activeDevice" class="ptz-inline">
            <div class="ptz-inline-head">
              <span>云台控制</span>
              <button type="button" class="ptz-inline-close" aria-label="关闭云台控制" @click="showPtz = false">
                <t-icon name="close" />
              </button>
            </div>
            <div class="ptz-ring">
              <button type="button" class="ptz-arrow up" aria-label="向上" @click="ptzControl('up')">
                <t-icon name="caret-up" />
              </button>
              <button type="button" class="ptz-arrow left" aria-label="向左" @click="ptzControl('left')">
                <t-icon name="caret-left" />
              </button>
              <button type="button" class="ptz-arrow right" aria-label="向右" @click="ptzControl('right')">
                <t-icon name="caret-right" />
              </button>
              <button type="button" class="ptz-arrow down" aria-label="向下" @click="ptzControl('down')">
                <t-icon name="caret-down" />
              </button>
              <button type="button" class="ptz-center" aria-label="停止" @click="stopPtz">
                <span></span>
              </button>
            </div>
            <p class="ptz-hint">点击方向键调整镜头，中间键停止</p>
          </div>
        </section>
      </template>
    </main>

    <transition name="fade">
      <div v-if="isFullscreen && currentGroup" class="wall-fs" :style="fsSize">
        <header class="wall-fs-head">
          <div class="wall-fs-title">
            <span class="wall-fs-name">{{ currentGroup.name }}</span>
            <span class="wall-fs-count">{{ currentGroup.devices.length }}/4</span>
          </div>
          <span class="wall-fs-caption">
            <template v-if="activeDevice">{{ activeSlot + 1 }} {{ activeDevice.name }}</template>
            <template v-else>点选画面后可控制</template>
          </span>
          <button type="button" class="wall-fs-close" aria-label="退出全屏" @click="closeFullscreen">
            <t-icon name="close" />
          </button>
        </header>

        <div class="wall-fs-grid">
          <button
            v-for="slot in 4"
            :key="slot"
            type="button"
            class="wall-fs-tile"
            :class="{
              'wall-fs-tile--empty': !currentGroup.devices[slot - 1],
              'is-active': activeSlot === slot - 1
            }"
            @click="selectSlot(slot - 1)"
          >
            <template v-if="currentGroup.devices[slot - 1]">
              <img class="tile-img" :src="cameraImage" alt="" loading="lazy" />
              <span class="tile-name">{{ slot }} {{ currentGroup.devices[slot - 1].name }}</span>
              <span class="tile-region">{{ currentGroup.devices[slot - 1].region }}</span>
              <span class="tile-badges">
                <span class="chip">
                  <i class="chip-dot"></i>
                  LIVE
                </span>
                <span class="chip">HD</span>
              </span>
            </template>
            <template v-else>
              <t-icon name="video-off" class="tile-empty-icon" />
              <span>空画面</span>
            </template>
          </button>
        </div>

        <div class="wall-fs-actions">
          <div v-if="activeDevice" class="action-strip action-strip--fs">
            <button
              v-if="supportsCapability('ptz')"
              type="button"
              class="strip-action"
              :class="{ active: showPtz }"
              @click="togglePtz"
            >
              <span class="strip-icon">
                <t-icon name="control-platform" size="24px" />
              </span>
              <span>云台</span>
            </button>
            <button
              v-if="supportsCapability('talk')"
              type="button"
              class="strip-action"
              :class="{ active: isTalking }"
              @click="toggleTalk"
            >
              <span class="strip-icon">
                <t-icon name="microphone-1" size="24px" />
              </span>
              <span>对讲</span>
            </button>
            <button
              v-if="supportsCapability('light')"
              type="button"
              class="strip-action"
              :class="{ active: isLightOn }"
              @click="toggleLight"
            >
              <span class="strip-icon">
                <t-icon :name="isLightOn ? 'lightbulb-filled' : 'lightbulb'" size="24px" />
              </span>
              <span>补光</span>
            </button>
            <button type="button" class="strip-action" @click="takeSnapshot">
              <span class="strip-icon">
                <t-icon name="camera" size="24px" />
              </span>
              <span>截图</span>
            </button>
            <button
              type="button"
              class="strip-action"
              :class="{ record: isRecording }"
              @click="toggleRecord"
            >
              <span class="strip-icon">
                <t-icon :name="isRecording ? 'video-stop' : 'video'" size="24px" />
              </span>
              <span>录像</span>
            </button>
          </div>

          <div v-if="showPtz && activeDevice" class="ptz-inline ptz-inline--fs">
            <div class="ptz-inline-head">
              <span>云台控制</span>
              <button type="button" class="ptz-inline-close" aria-label="关闭云台控制" @click="showPtz = false">
                <t-icon name="close" />
              </button>
            </div>
            <div class="ptz-ring">
              <button type="button" class="ptz-arrow up" aria-label="向上" @click="ptzControl('up')">
                <t-icon name="caret-up" />
              </button>
              <button type="button" class="ptz-arrow left" aria-label="向左" @click="ptzControl('left')">
                <t-icon name="caret-left" />
              </button>
              <button type="button" class="ptz-arrow right" aria-label="向右" @click="ptzControl('right')">
                <t-icon name="caret-right" />
              </button>
              <button type="button" class="ptz-arrow down" aria-label="向下" @click="ptzControl('down')">
                <t-icon name="caret-down" />
              </button>
              <button type="button" class="ptz-center" aria-label="停止" @click="stopPtz">
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="pop">
      <div v-if="showMoreMenu && pageMode === 'preview'" class="more-layer" @click="closeMoreMenu">
        <div class="more-menu" @click.stop>
          <button type="button" class="more-item" @click="editFromMenu">
            <t-icon name="edit" size="18px" />
            <span>编辑编组</span>
          </button>
          <button type="button" class="more-item more-item--danger" @click="deleteFromMenu">
            <t-icon name="delete" size="18px" />
            <span>删除编组</span>
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showDeleteDialog" class="confirm-layer" @click.self="closeDeleteDialog">
        <div class="confirm-card">
          <h3 class="confirm-title">删除编组</h3>
          <p class="confirm-desc">删除后该编组的画面组合将无法恢复，确认删除？</p>
          <div class="confirm-actions">
            <button type="button" class="confirm-cancel" @click="closeDeleteDialog">取消</button>
            <button type="button" class="confirm-delete" @click="confirmRemoveGroup">删除</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="sheet">
      <div v-if="showDevicePicker" class="picker-layer" @click.self="closeDevicePicker">
        <div class="picker-panel">
          <div class="picker-header">
            <button type="button" class="picker-grabber" aria-label="关闭设备选择" @click="closeDevicePicker"></button>
            <div class="picker-title-row">
              <h3>选择设备</h3>
              <button type="button" class="picker-close" aria-label="关闭" @click="closeDevicePicker">
                <t-icon name="close" />
              </button>
            </div>
          </div>

          <div class="picker-body">
            <div v-if="orderedSelectedDevices.length > 0" class="picked-list">
              <button
                v-for="(device, index) in orderedSelectedDevices"
                :key="device.id"
                type="button"
                class="picked-chip"
                :aria-label="`移除 ${device.name}`"
                @click="toggleDevice(device)"
              >
                <span class="picked-index">{{ index + 1 }}</span>
                <span class="picked-name">{{ device.name }}</span>
                <t-icon name="close" class="picked-remove" />
              </button>
            </div>

            <div class="tree-toolbar">
              <t-search
                v-model="searchText"
                class="device-search"
                placeholder="搜索摄像头名称"
              />

              <button type="button" class="tree-root-action" :class="{ active: !selectedRegionId }" @click="selectAllRegion">
                <span class="tree-root-title">全部区域</span>
                <span class="tree-root-count">{{ onlineDevices.length }} 台在线设备</span>
              </button>
            </div>

            <div class="region-tree">
              <div
                v-for="node in visibleTreeNodes"
                :key="node.value"
                class="tree-node"
                :class="{ selected: selectedRegionId === node.value }"
                :style="{ '--tree-depth': node.depth }"
              >
                <div v-if="node.raw.type !== 'device'" class="tree-node-row">
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
          </div>

          <div class="picker-footer">
            <button type="button" class="picker-confirm" @click="closeDevicePicker">
              完成选择（{{ selectedDeviceIds.length }}/4）
            </button>
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
import FolderAddIcon from '../../components/FolderAddIcon.vue'

const router = useRouter()

const pageMode = ref('list')
const searchText = ref('')
const selectedRegionId = ref('')
const expandedNodes = ref(new Set([
  'area-huadong',
  'area-huabei',
  'area-huanan',
  'store-sh-factory',
  'store-bj-factory',
  'store-sz-factory'
]))
const showDevicePicker = ref(false)
const showDeleteDialog = ref(false)
const showMoreMenu = ref(false)
const activeSlot = ref(0)
const isFullscreen = ref(false)
const showPtz = ref(false)
const isTalking = ref(false)
const isLightOn = ref(false)
const isRecording = ref(false)
const draggingSlot = ref(-1)
const groupSeed = ref(1)
const activeGroupId = ref(null)
const draftGroup = ref(null)
const draftGroupName = ref('')

const cameraImage = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=realistic%20CCTV%20surveillance%20view%20of%20an%20empty%20underground%20parking%20garage%2C%20white%20concrete%20pillars%2C%20bright%20ceiling%20lights%2C%20clean%20floor%20line%20markings%2C%20wide%20angle%2C%20slightly%20grainy%20security%20camera%20footage&image_size=landscape_4_3'

const baseDevices = [
  { id: 1, name: '摄像头-车间1入口', status: 'online', storeId: 'store-sh-factory', region: '华东区 / 上海工厂', capabilities: ['ptz', 'talk', 'light'] },
  { id: 2, name: '摄像头-车间1出口', status: 'online', storeId: 'store-sh-factory', region: '华东区 / 上海工厂', capabilities: ['ptz', 'light'] },
  { id: 3, name: '摄像头-车间2入口', status: 'offline', storeId: 'store-sh-factory', region: '华东区 / 上海工厂', capabilities: ['ptz'] },
  { id: 4, name: '摄像头-仓库区域', status: 'offline', storeId: 'store-sh-factory', region: '华东区 / 上海工厂', capabilities: ['light'] },
  { id: 5, name: '摄像头-办公区域', status: 'online', storeId: 'store-bj-factory', region: '华北区 / 北京工厂', capabilities: ['talk', 'light'] },
  { id: 6, name: '摄像头-停车场', status: 'online', storeId: 'store-bj-factory', region: '华北区 / 北京工厂', capabilities: ['ptz', 'light'] },
  { id: 7, name: '摄像头-厂区大门', status: 'online', storeId: 'store-bj-factory', region: '华北区 / 北京工厂', capabilities: ['ptz', 'talk'] },
  { id: 8, name: '摄像头-生产车间', status: 'online', storeId: 'store-sz-factory', region: '华南区 / 深圳工厂', capabilities: ['ptz'] },
  { id: 9, name: '摄像头-质检区域', status: 'online', storeId: 'store-sz-factory', region: '华南区 / 深圳工厂', capabilities: [] }
]

const regionDefs = [
  { label: '华东区', value: 'area-huadong', storeId: 'store-sh-factory', storeLabel: '上海工厂' },
  { label: '华北区', value: 'area-huabei', storeId: 'store-bj-factory', storeLabel: '北京工厂' },
  { label: '华南区', value: 'area-huanan', storeId: 'store-sz-factory', storeLabel: '深圳工厂' }
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

const activeDevice = computed(() => currentGroup.value?.devices[activeSlot.value] || null)

const supportsCapability = (capability) => !!activeDevice.value?.capabilities?.includes(capability)

const previewClock = computed(() => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
})

const visibleTreeNodes = computed(() => {
  const keyword = searchText.value.trim()
  const activeRegion = selectedRegionId.value

  let tree = regionDefs.map((region) => {
    const devices = onlineDevices.value
      .filter(device => device.storeId === region.storeId)
      .filter(device => !keyword || device.name.includes(keyword))
      .map(device => ({
        ...device,
        value: `device-${device.id}`,
        label: device.name,
        type: 'device',
        count: ''
      }))

    return {
      label: region.label,
      value: region.value,
      type: 'region',
      storeId: region.storeId,
      count: devices.length,
      children: [
        {
          label: region.storeLabel,
          value: region.storeId,
          type: 'store',
          count: devices.length,
          children: devices
        }
      ]
    }
  })

  if (keyword) {
    tree = tree.filter(node => node.count > 0)
  }

  if (activeRegion) {
    tree = tree
      .filter(node => node.value === activeRegion || node.storeId === activeRegion)
      .map((node) => {
        if (node.storeId !== activeRegion) return node
        const store = node.children.find(child => child.value === activeRegion)
        return {
          ...node,
          count: store ? store.count : node.count,
          children: store ? [store] : []
        }
      })
  }

  const result = []
  const walk = (nodes, depth = 0) => {
    nodes.forEach((node) => {
      const hasChildren = !!node.children?.length
      result.push({ ...node, raw: node, depth, hasChildren })
      const shouldExpand = keyword ? hasChildren : expandedNodes.value.has(node.value)
      if (hasChildren && shouldExpand) {
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
  activeSlot.value = 0
  showMoreMenu.value = false
  resetControls()
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
  isFullscreen.value = false
  showMoreMenu.value = false
  resetControls()
}

const backToList = () => {
  pageMode.value = 'list'
  activeGroupId.value = null
  draftGroup.value = null
  draftGroupName.value = ''
  searchText.value = ''
  selectedRegionId.value = ''
  showDevicePicker.value = false
  showDeleteDialog.value = false
  showMoreMenu.value = false
  isFullscreen.value = false
  showPtz.value = false
  onPressEnd()
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

const openMoreMenu = () => {
  showMoreMenu.value = true
}

const closeMoreMenu = () => {
  showMoreMenu.value = false
}

const editFromMenu = () => {
  showMoreMenu.value = false
  if (currentGroup.value) openEditor(currentGroup.value.id)
}

const deleteFromMenu = () => {
  showMoreMenu.value = false
  requestRemoveGroup()
}

const requestRemoveGroup = () => {
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
}

const confirmRemoveGroup = () => {
  showDeleteDialog.value = false
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
  if (selectedRegionId.value === node.value) {
    selectedRegionId.value = ''
    return
  }
  selectedRegionId.value = node.value

  const next = new Set(expandedNodes.value)
  next.add(node.value)
  const region = regionDefs.find(item => item.value === node.value || item.storeId === node.value)
  if (region) {
    next.add(region.value)
    next.add(region.storeId)
  }
  expandedNodes.value = next
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

const resetControls = () => {
  isFullscreen.value = false
  isTalking.value = false
  isLightOn.value = false
  isRecording.value = false
  showPtz.value = false
}

const selectSlot = (index) => {
  activeSlot.value = index
  isTalking.value = false
  isLightOn.value = false
  isRecording.value = false
  showPtz.value = false
}

// 全屏按横屏展示：宽高互换，取容器实际尺寸
const fsSize = ref({})

const measureFullscreen = () => {
  const host = document.querySelector('.phone-screen') || document.querySelector('.app-canvas')
  const width = host?.clientHeight || window.innerHeight
  const height = host?.clientWidth || window.innerWidth
  fsSize.value = { width: `${width}px`, height: `${height}px` }
}

const openFullscreen = () => {
  measureFullscreen()
  isFullscreen.value = true
}

const closeFullscreen = () => {
  isFullscreen.value = false
  showPtz.value = false
}

const togglePtz = () => {
  showPtz.value = !showPtz.value
}

const ptzControl = (direction) => {
  const labels = { up: '上', down: '下', left: '左', right: '右' }
  Toast.success(`云台向${labels[direction]}调整`)
}

const stopPtz = () => {
  Toast.success('云台已停止')
}

const toggleTalk = () => {
  if (!activeDevice.value) return
  isTalking.value = !isTalking.value
  Toast.success(isTalking.value ? '已开启对讲' : '已结束对讲')
}

const toggleLight = () => {
  if (!activeDevice.value) return
  isLightOn.value = !isLightOn.value
  Toast.success(isLightOn.value ? '补光已开启' : '补光已关闭')
}

const takeSnapshot = () => {
  if (!activeDevice.value) return
  Toast.success('截图已保存到图库')
}

const toggleRecord = () => {
  if (!activeDevice.value) return
  isRecording.value = !isRecording.value
  Toast.success(isRecording.value ? '开始录像' : '已停止录像')
}

/* 长按拖动排序 */
let pressTimer = null
let pressOrigin = { x: 0, y: 0 }

const clearPressTimer = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

const onTilePress = (event, slot) => {
  if (pageMode.value !== 'edit' || !orderedSelectedDevices.value[slot]) return
  pressOrigin = { x: event.clientX, y: event.clientY }
  clearPressTimer()
  window.addEventListener('pointermove', onPressMove)
  window.addEventListener('pointerup', onPressEnd)
  pressTimer = setTimeout(() => {
    draggingSlot.value = slot
    window.addEventListener('pointermove', onDragMove, { passive: false })
  }, 380)
}

const onPressMove = (event) => {
  if (draggingSlot.value >= 0) return
  if (Math.hypot(event.clientX - pressOrigin.x, event.clientY - pressOrigin.y) > 10) {
    onPressEnd()
  }
}

const onDragMove = (event) => {
  if (draggingSlot.value < 0) return
  event.preventDefault()
  const element = document.elementFromPoint(event.clientX, event.clientY)
  const tile = element?.closest?.('[data-slot]')
  if (!tile) return
  const index = Number(tile.dataset.slot)
  if (Number.isNaN(index) || index === draggingSlot.value) return
  if (!orderedSelectedDevices.value[index]) return
  swapSlots(draggingSlot.value, index)
  draggingSlot.value = index
}

const onPressEnd = () => {
  clearPressTimer()
  draggingSlot.value = -1
  window.removeEventListener('pointermove', onPressMove)
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onPressEnd)
}

const swapSlots = (from, to) => {
  const group = currentGroup.value
  if (!group) return
  const ids = [...group.deviceIds]
  if (from < 0 || to < 0 || from >= ids.length || to >= ids.length) return
  const [moved] = ids.splice(from, 1)
  ids.splice(to, 0, moved)
  group.deviceIds = ids
  syncGroupDevices(group)
}
</script>

<style scoped>
.video-wall-page {
  --vw-blue: #4b5cf5;
  --vw-blue-strong: #4454ef;
  --vw-ink: #16171d;
  --vw-muted: #8a93a3;
  --vw-card: rgba(255, 255, 255, 0.94);
  position: relative;
  min-height: 100%;
  background:
    radial-gradient(120% 48% at 6% 0%, rgba(224, 212, 250, 0.9) 0%, rgba(224, 212, 250, 0) 62%),
    radial-gradient(120% 46% at 100% 100%, rgba(206, 240, 235, 0.95) 0%, rgba(206, 240, 235, 0) 60%),
    linear-gradient(170deg, #f2edfb 0%, #edf2fb 44%, #e9f5f3 100%);
  padding-bottom: calc(28px + var(--prototype-safe-bottom));
}

.page-top {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  padding: calc(var(--prototype-safe-top) + 8px) 12px 0;
}

.back-entry {
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  color: var(--vw-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  justify-self: start;
}

.back-entry:active {
  opacity: 0.55;
}

.page-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--vw-ink);
  text-align: center;
  letter-spacing: 0.01em;
}

.top-spacer {
  display: block;
}

.more-entry {
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  color: var(--vw-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  justify-self: end;
}

.more-entry:active {
  opacity: 0.55;
}

.page-body {
  padding: 18px 20px 0;
}

/* 编组说明卡 */
.intro-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 18px 18px 20px;
  margin-bottom: 14px;
  border-radius: 22px;
  background: var(--vw-card);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 14px 34px rgba(112, 120, 170, 0.08);
}

.intro-copy {
  min-width: 0;
}

.intro-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--vw-ink);
}

.intro-desc {
  margin: 6px 0 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--vw-muted);
}

.intro-add {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.intro-add:active {
  transform: scale(0.94);
}

/* 编组列表 */
.group-list {
  display: grid;
  gap: 14px;
}

.group-card {
  width: 100%;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 22px;
  background: var(--vw-card);
  box-shadow: 0 14px 34px rgba(112, 120, 170, 0.08);
  text-align: left;
  transition: transform 0.18s ease;
}

.group-card:active {
  transform: scale(0.995);
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.group-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.group-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--vw-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-name--lg {
  font-size: 20px;
}

.count-pill {
  height: 26px;
  padding: 0 10px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--vw-blue);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.group-time {
  flex: 0 0 auto;
  font-size: 13px;
  color: var(--vw-muted);
}

/* 画面网格 */
.tile-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.tile {
  position: relative;
  aspect-ratio: 1.16 / 1;
  padding: 0;
  border: 0;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(160deg, #243449 0%, #14202f 100%);
  color: #ffffff;
  font-family: inherit;
  text-align: left;
}

.tile-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 14, 28, 0.66) 0%, rgba(8, 14, 28, 0.3) 44%, rgba(8, 14, 28, 0.4) 100%);
  pointer-events: none;
}

.tile-name {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 10px;
  z-index: 2;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(6, 12, 24, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile-region {
  position: absolute;
  top: 32px;
  left: 12px;
  right: 10px;
  z-index: 2;
  font-size: 11.5px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile-time {
  position: absolute;
  left: 12px;
  bottom: 11px;
  z-index: 2;
  font-size: 9.5px;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.72);
}

.tile-badges {
  position: absolute;
  right: 9px;
  bottom: 9px;
  z-index: 2;
  display: flex;
  gap: 6px;
}

.chip {
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(10, 18, 32, 0.42);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #ffffff;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #34d399;
}

.tile--empty {
  background: linear-gradient(180deg, #f6f8fc 0%, #f3f6fb 100%);
  border: 1px dashed #d5dce7;
  color: #a6b1c3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11.5px;
}

.tile--empty::after {
  display: none;
}

.tile-empty-icon {
  font-size: 22px;
}

/* 空状态 */
.empty-card {
  padding: 24px 24px 34px;
  border-radius: 22px;
  background: var(--vw-card);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 14px 34px rgba(112, 120, 170, 0.08);
}

.empty-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vw-muted);
}

.empty-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 34px;
}

.empty-icon {
  display: block;
}

.empty-title {
  margin-top: 14px;
  font-size: 17px;
  font-weight: 700;
  color: var(--vw-ink);
}

.add-group-btn {
  width: 100%;
  margin-top: 16px;
}

/* 编辑 */
.editor-card,
.preview-card {
  padding: 22px 22px 20px;
  border-radius: 24px;
  background: var(--vw-card);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 14px 34px rgba(112, 120, 170, 0.08);
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #9aa2b1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.name-input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 19px;
  font-weight: 700;
  color: var(--vw-ink);
  outline: none;
}

.name-input::placeholder {
  color: #c5cbd6;
  font-weight: 600;
}

.name-clear {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border: 0;
  border-radius: 50%;
  background: #c7ccd6;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.name-clear:active {
  opacity: 0.7;
}

.card-divider {
  height: 1px;
  margin: 18px 0 16px;
  background: #eef1f5;
}

.editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.editor-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.editor-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--vw-ink);
}

.editor-progress {
  flex: 0 0 auto;
  font-size: 15px;
  font-weight: 500;
  color: #3c4250;
}

.tile-empty {
  aspect-ratio: 1.16 / 1;
  border: 1.5px dashed rgba(75, 92, 245, 0.34);
  border-radius: 14px;
  background: linear-gradient(180deg, #f4f5ff 0%, #f7f8ff 100%);
  color: var(--vw-blue);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.tile-empty:active {
  background: #eef1ff;
}

.tile-empty-plus {
  font-size: 28px;
}

/* 底部操作按钮 */
.action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.pill {
  height: 52px;
  border: 0;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.16s ease;
}

.pill:active {
  transform: scale(0.985);
}

.pill-light {
  background: rgba(255, 255, 255, 0.92);
  color: #7a8498;
  box-shadow: 0 10px 24px rgba(112, 120, 170, 0.08);
}

.pill-primary {
  background: linear-gradient(135deg, #5b6cfb 0%, #4454ef 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(74, 92, 255, 0.22);
}

.pill-danger {
  background: #fdeaea;
  color: #e5484d;
  box-shadow: 0 10px 24px rgba(229, 72, 77, 0.08);
}

/* 设备选择弹层 */
.picker-layer {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: flex-end;
  background: rgba(12, 21, 34, 0.32);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.picker-panel {
  width: 100%;
  max-height: 84%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 26px 26px 0 0;
  box-shadow: 0 -18px 48px rgba(16, 24, 40, 0.16);
  padding-bottom: var(--prototype-safe-bottom);
  overflow: hidden;
}

.picker-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px 20px 8px;
}

.picker-grabber {
  width: 40px;
  height: 5px;
  border: 0;
  border-radius: 999px;
  background: #e1e5ec;
}

.picker-title-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.picker-title-row h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--vw-ink);
}

.picker-close {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border: 0;
  border-radius: 50%;
  background: #f2f4f8;
  color: #8a93a3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.picker-close:active {
  background: #e8ecf3;
}

.picked-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0 12px;
  scrollbar-width: none;
}

.picked-list::-webkit-scrollbar {
  display: none;
}

.picked-chip {
  flex: 0 0 auto;
  max-width: 210px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(75, 92, 245, 0.22);
  border-radius: 17px;
  background: #eef1ff;
  color: #4152c9;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
}

.picked-chip:active {
  background: #e4e9ff;
}

.picked-index {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 50%;
  background: var(--vw-blue);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.picked-name {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picked-remove {
  flex: 0 0 auto;
  font-size: 14px;
  color: #7d8af0;
}

.picker-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 20px 12px;
}

.tree-toolbar {
  display: grid;
  gap: 10px;
}

.tree-root-action {
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-radius: 16px;
  background: #f5f7fb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
}

.tree-root-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vw-ink);
}

.tree-root-count {
  font-size: 12.5px;
  color: var(--vw-muted);
}

.tree-root-action.active {
  background: #eef1ff;
}

.tree-root-action.active .tree-root-title {
  color: var(--vw-blue);
}

.tree-root-action.active .tree-root-count {
  color: #6b7bf5;
}

.region-tree {
  margin-top: 12px;
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
  flex: 0 0 28px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #9aa2b1;
}

.tree-toggle--placeholder {
  opacity: 0;
}

.tree-branch {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: 14px;
  background: #f5f7fb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #2b303b;
}

.tree-branch.active {
  background: #eef1ff;
  color: var(--vw-blue);
}

.tree-node-label {
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
}

.tree-node-count {
  flex: 0 0 auto;
  font-size: 12px;
  color: #98a1b1;
}

.tree-branch.active .tree-node-count {
  color: #6b7bf5;
}

.tree-device-row {
  margin-top: 6px;
}

.tree-device-item {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #eef1f5;
  border-radius: 16px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
}

.tree-device-item.active {
  border-color: rgba(75, 92, 245, 0.4);
  box-shadow: 0 10px 22px rgba(75, 92, 245, 0.1);
}

.tree-device-item.disabled {
  opacity: 0.55;
}

.tree-device-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.tree-device-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--vw-ink);
}

.tree-device-region {
  font-size: 12px;
  color: var(--vw-muted);
}

.tree-device-check {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 50%;
  background: #f0f3f8;
  color: #9aa5b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.tree-device-check.active {
  background: var(--vw-blue);
  color: #ffffff;
}

.picker-footer {
  padding: 10px 20px 14px;
  background: #ffffff;
}

.picker-confirm {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 26px;
  background: linear-gradient(135deg, #5b6cfb 0%, #4454ef 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(74, 92, 255, 0.2);
}

.picker-confirm:active {
  transform: scale(0.985);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-enter-active .picker-panel,
.sheet-leave-active .picker-panel {
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.25, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .picker-panel,
.sheet-leave-to .picker-panel {
  transform: translateY(100%);
}

/* 删除二次确认 */
.confirm-layer {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  background: rgba(12, 21, 34, 0.32);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.confirm-card {
  width: 100%;
  max-width: 320px;
  padding: 26px 22px 22px;
  border-radius: 26px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(16, 24, 40, 0.2);
  text-align: center;
}

.confirm-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--vw-ink);
}

.confirm-desc {
  margin: 10px 0 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: #7a8494;
}

.confirm-actions {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.confirm-cancel,
.confirm-delete {
  height: 48px;
  border: 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.confirm-cancel {
  background: #f2f4f8;
  color: #5b6472;
}

.confirm-delete {
  background: linear-gradient(135deg, #ff6a5f 0%, #e5372b 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(229, 55, 43, 0.22);
}

.confirm-cancel:active,
.confirm-delete:active {
  transform: scale(0.985);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-active .confirm-card {
  transition: transform 0.22s cubic-bezier(0.2, 0.9, 0.25, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .confirm-card {
  transform: scale(0.94);
}

/* 右上角更多菜单 */
.more-layer {
  position: fixed;
  inset: 0;
  z-index: 1500;
}

.more-menu {
  position: absolute;
  top: calc(var(--prototype-safe-top) + 54px);
  right: 12px;
  min-width: 156px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 18px 40px rgba(16, 24, 40, 0.16), 0 2px 6px rgba(16, 24, 40, 0.06);
  transform-origin: top right;
}

.more-item {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #2b303b;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.more-item:active {
  background: rgba(17, 37, 72, 0.06);
}

.more-item--danger {
  color: #e5484d;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.18s ease;
}

.pop-enter-active .more-menu,
.pop-leave-active .more-menu {
  transition: transform 0.18s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}

.pop-enter-from .more-menu,
.pop-leave-to .more-menu {
  transform: translateY(-6px) scale(0.96);
}

/* 预览：画面选中与设备控制 */
.tile--select {
  cursor: pointer;
}

.tile--select.is-active::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: inherit;
  border: 2px solid #5b6cfb;
  box-shadow: 0 0 0 3px rgba(91, 108, 251, 0.2);
  pointer-events: none;
}

.control-block {
  margin-top: 18px;
  padding: 0 4px;
}

/* 设备操作条：与设备播放页共用 strip-action / strip-icon 样式 */
.action-strip--wall {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 0;
  background: none;
  color: #49566a;
}

.action-strip--wall .strip-action {
  flex: 1 1 0;
  min-width: 0;
}

.control-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.control-fullscreen {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border: 1px solid #e2e9f3;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #3e5068;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.control-fullscreen:active {
  background: #eef3fb;
}

.control-head-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.control-label {
  flex: 0 0 auto;
  font-size: 12.5px;
  color: #9aa2b1;
}

.control-device {
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--vw-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.control-device--empty {
  font-weight: 500;
  color: #a6b1c3;
}

/* 全屏：右侧竖排操作条 */
.action-strip--fs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 0;
  padding-top: 0;
  background: none;
  color: rgba(255, 255, 255, 0.92);
}

.action-strip--fs .strip-action {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  gap: 5px;
  padding: 6px 2px;
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  font-size: 11.5px;
  box-shadow: none;
}

.action-strip--fs .strip-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.action-strip--fs .strip-action.active .strip-icon {
  background: rgba(91, 108, 251, 0.4);
  color: #ffffff;
}

.action-strip--fs .strip-action.record .strip-icon {
  background: rgba(223, 85, 72, 0.36);
  color: #ffd9d4;
}

/* 编辑：长按拖动排序 */
.reorder-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #a6b1c3;
  text-align: center;
}

.tile--draggable {
  touch-action: none;
  -webkit-touch-callout: none;
  user-select: none;
  cursor: grab;
}

.tile.is-dragging {
  z-index: 4;
  transform: scale(1.03);
  opacity: 0.94;
  box-shadow: 0 16px 36px rgba(30, 40, 90, 0.28);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

/* 多画面全屏 */
.wall-fs {
  position: fixed;
  top: 0;
  left: 0;
  width: min(var(--phone-height, 100vh), 100vh);
  height: min(var(--phone-width, 100vw), 100vw);
  z-index: 1600;
  /* 竖屏手机上整体旋转 90°，按横屏展示 */
  transform: rotate(90deg) translateY(-100%);
  transform-origin: top left;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(58, 78, 140, 0.35) 0%, rgba(58, 78, 140, 0) 60%),
    #080d16;
}

.wall-fs-head {
  grid-column: 1 / -1;
  grid-row: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px 8px;
  color: #ffffff;
}

.wall-fs-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 0 1 auto;
}

.wall-fs-caption {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wall-fs-name {
  font-size: 17px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wall-fs-count {
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(91, 108, 251, 0.9);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.wall-fs-close {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.wall-fs-close:active {
  background: rgba(255, 255, 255, 0.2);
}

.wall-fs-grid {
  grid-column: 1;
  grid-row: 2;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 0 8px 12px 14px;
}

.wall-fs-tile {
  position: relative;
  padding: 0;
  border: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #101a2c;
  color: #ffffff;
  font-family: inherit;
  text-align: left;
}

.wall-fs-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 12, 24, 0.62) 0%, rgba(6, 12, 24, 0.12) 46%, rgba(6, 12, 24, 0.34) 100%);
  pointer-events: none;
}

.wall-fs-tile--empty {
  border: 1px dashed rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.45);
  font-size: 12.5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.wall-fs-tile--empty::after {
  display: none;
}

.wall-fs-tile.is-active::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: inherit;
  border: 2px solid #7c8bff;
  box-shadow: 0 0 0 3px rgba(124, 139, 255, 0.24);
  pointer-events: none;
}

.wall-fs-actions {
  grid-column: 2;
  grid-row: 2;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 14px 12px 0;
}

/* 云台面板（内嵌，与设备播放页一致） */
.ptz-inline {
  margin-top: 12px;
  padding: 12px 16px 16px;
  border: 1px solid #e8eef7;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafd 0%, #f1f5fa 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ptz-inline-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ptz-inline-head span {
  font-size: 14px;
  font-weight: 600;
  color: #2b303b;
}

.ptz-inline-close {
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #8a93a3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: inset 0 0 0 1px #e8eef7;
}

.ptz-ring {
  position: relative;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 38%, #ffffff 0%, #eef3fa 100%);
  box-shadow: inset 0 2px 12px rgba(60, 80, 140, 0.08);
}

.ptz-arrow {
  position: absolute;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  color: #4b5cf5;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(60, 80, 140, 0.12);
}

.ptz-arrow:active {
  background: #eef1ff;
}

.ptz-arrow.up {
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.ptz-arrow.down {
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.ptz-arrow.left {
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.ptz-arrow.right {
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.ptz-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 0 0 1px #eef1f5,
    0 6px 16px rgba(60, 80, 140, 0.1);
}

.ptz-center span {
  width: 16px;
  height: 16px;
  border-radius: 6px;
  background: #dfe5f0;
}

.ptz-hint {
  margin: 12px 0 0;
  font-size: 11.5px;
  color: #9aa2b1;
}

.ptz-inline--fs {
  position: absolute;
  left: 16px;
  bottom: 14px;
  z-index: 6;
  margin-top: 0;
  background: rgba(12, 19, 32, 0.94);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45);
}

.ptz-inline--fs .ptz-inline-head span {
  color: #ffffff;
}

.ptz-inline--fs .ptz-inline-close {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  box-shadow: none;
}

.ptz-inline--fs .ptz-ring {
  background: radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
  box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.24);
}

.ptz-inline--fs .ptz-arrow {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  box-shadow: none;
}

.ptz-inline--fs .ptz-center {
  background: rgba(255, 255, 255, 0.14);
  box-shadow: none;
}

.ptz-inline--fs .ptz-center span {
  background: rgba(255, 255, 255, 0.5);
}

</style>
