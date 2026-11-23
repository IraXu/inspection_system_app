<template>
  <transition name="region-sheet">
    <div v-if="visible" class="region-layer" @click.self="close">
      <div
        class="region-panel"
        :class="{ 'region-panel--dragging': dragOffset > 0 }"
        :style="{ '--sheet-drag-offset': `${dragOffset}px` }"
      >
        <div class="picker-header">
          <button
            type="button"
            class="picker-grabber"
            :aria-label="`关闭${title}`"
            @pointerdown.stop.prevent="onDragStart"
          ></button>
          <h3>{{ title }}</h3>
          <p v-if="description" class="picker-desc">{{ description }}</p>
        </div>

        <div class="region-panel-body">
          <div class="tree-toolbar">
            <button
              v-if="showRoot"
              type="button"
              class="tree-root-action"
              :class="{ active: !pendingValue }"
              @click="selectRoot"
            >
              <span class="tree-root-copy">
                <span class="tree-root-title">{{ rootLabel }}</span>
                <span class="tree-root-desc">{{ rootDesc }}</span>
              </span>
              <span v-if="rootCount !== null" class="tree-root-count">{{ rootCount }}{{ unit }}</span>
            </button>

            <div class="tree-summary">
              <span class="tree-summary-label">当前选择</span>
              <span class="tree-summary-value">{{ pendingPath || emptyPathLabel }}</span>
              <template v-if="pendingCount !== null">
                <span class="tree-summary-divider"></span>
                <span class="tree-summary-count">{{ pendingCount }}{{ unit }}</span>
              </template>
            </div>
          </div>

          <t-pull-down-refresh
            v-model="refreshing"
            class="tree-refresh"
            :loading-texts="['下拉刷新区域树', '松开同步区域树', '区域树同步中', '区域树已更新']"
            @refresh="onRefresh"
          >
            <div class="region-tree">
              <div
                v-for="node in visibleNodes"
                :key="node.value"
                class="tree-node"
                :class="{
                  selected: pendingValue === node.value,
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
                    :class="{ 'is-locked': !canSelect(node.raw) }"
                    @click="onSelect(node.raw)"
                  >
                    <span class="tree-indent"></span>
                    <span class="tree-node-icon" :class="{ leaf: !node.hasChildren }">
                      <t-icon :name="node.hasChildren ? 'folder' : 'location'" />
                    </span>
                    <span class="tree-node-copy">
                      <span class="tree-node-label">{{ node.label }}</span>
                      <span v-if="nodeHint(node.raw)" class="tree-node-hint">{{ nodeHint(node.raw) }}</span>
                    </span>
                    <span v-if="typeof node.deviceCount === 'number'" class="tree-node-count">
                      {{ node.deviceCount }}{{ unit }}
                    </span>
                  </button>
                </div>
              </div>

              <div v-if="visibleNodes.length === 0" class="empty-region">
                <t-icon name="folder-open" size="48px" />
                <p>暂无可选区域</p>
              </div>
            </div>
          </t-pull-down-refresh>
        </div>

        <div class="picker-footer">
          <button type="button" class="picker-confirm" :disabled="confirmDisabled" @click="confirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Toast } from 'tdesign-mobile-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '切换所属区域' },
  description: { type: String, default: '' },
  tree: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
  unit: { type: String, default: '台' },
  showRoot: { type: Boolean, default: true },
  rootLabel: { type: String, default: '全部设备' },
  rootDesc: { type: String, default: '' },
  rootCount: { type: Number, default: null },
  // 限定可选层级：传入后仅该层级节点可选中，其余节点只负责展开/收起
  selectableLevel: { type: Number, default: null },
  leafHint: { type: String, default: '' },
  emptyPathLabel: { type: String, default: '全部区域' },
  requireSelection: { type: Boolean, default: false },
  confirmLabel: { type: Function, default: null }
})

const emit = defineEmits(['update:visible', 'confirm'])

const pendingValue = ref('')
const expandedNodes = ref(new Set())
const refreshing = ref(false)
const dragOffset = ref(0)

let dragStartY = 0
let dragPointerId = null

const nodeMap = computed(() => {
  const map = new Map()

  const traverse = (nodes, parentValue = null, depth = 0) => {
    nodes.forEach((node) => {
      map.set(node.value, { node, parentValue, depth })
      if (node.children?.length) {
        traverse(node.children, node.value, depth + 1)
      }
    })
  }

  traverse(props.tree)
  return map
})

const pendingNode = computed(() => (pendingValue.value ? nodeMap.value.get(pendingValue.value)?.node ?? null : null))

const pendingPath = computed(() => {
  if (!pendingValue.value) return ''

  const labels = []
  let current = nodeMap.value.get(pendingValue.value)

  while (current) {
    labels.unshift(current.node.label)
    current = current.parentValue ? nodeMap.value.get(current.parentValue) : null
  }

  // 去掉最顶层的企业名称，保留 区域 / 厂区 / 门店 结构
  if (labels.length > 1) labels.shift()
  return labels.join(' / ')
})

const pendingCount = computed(() => {
  if (!pendingValue.value) return props.rootCount
  return pendingNode.value?.deviceCount ?? null
})

const confirmDisabled = computed(() => props.requireSelection && !pendingValue.value)

const confirmText = computed(() => {
  if (typeof props.confirmLabel === 'function') return props.confirmLabel(pendingNode.value)
  return '确定'
})

const canSelect = (node) => props.selectableLevel === null || node.level === props.selectableLevel

const nodeHint = (node) => {
  if (node.children?.length) return `包含 ${node.children.length} 个下级`
  return props.leafHint
}

const visibleNodes = computed(() => {
  const result = []

  const walk = (nodes, depth = 0) => {
    nodes.forEach((node) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0
      result.push({ ...node, raw: node, depth, hasChildren })

      if (hasChildren && expandedNodes.value.has(node.value)) {
        walk(node.children, depth + 1)
      }
    })
  }

  walk(props.tree)
  return result
})

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

const collectAncestorValues = (value) => {
  const values = []
  let current = nodeMap.value.get(value)

  while (current?.parentValue) {
    values.unshift(current.parentValue)
    current = nodeMap.value.get(current.parentValue)
  }

  return values
}

const isExpanded = (value) => expandedNodes.value.has(value)

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
  collectAncestorValues(value).forEach((item) => next.add(item))
  next.add(value)
  expandedNodes.value = next
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    dragOffset.value = 0
    pendingValue.value = props.modelValue || ''

    const next = new Set(collectExpandableValues(props.tree))
    if (props.modelValue) {
      collectAncestorValues(props.modelValue).forEach((item) => next.add(item))
    }
    expandedNodes.value = next
  }
)

const selectRoot = () => {
  pendingValue.value = ''
}

const onSelect = (node) => {
  if (!canSelect(node)) {
    if (node.children?.length) toggleExpand(node.value)
    return
  }

  pendingValue.value = node.value
  if (node.children?.length) ensureExpandedPath(node.value)
}

const close = () => {
  dragOffset.value = 0
  emit('update:visible', false)
}

const confirm = () => {
  if (confirmDisabled.value) return
  emit('confirm', { value: pendingValue.value, node: pendingNode.value })
  close()
}

const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
    Toast.success('区域树已同步')
  }, 900)
}

const removeDragListeners = () => {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragEnd)
}

onBeforeUnmount(removeDragListeners)

const onDragStart = (event) => {
  if (!props.visible) return

  dragPointerId = event.pointerId
  dragStartY = event.clientY
  dragOffset.value = 0
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
  window.addEventListener('pointercancel', onDragEnd)
}

const onDragMove = (event) => {
  if (event.pointerId !== dragPointerId) return
  dragOffset.value = Math.max(0, event.clientY - dragStartY)
}

const onDragEnd = (event) => {
  if (event.pointerId !== dragPointerId) return

  const shouldClose = dragOffset.value > 72
  dragPointerId = null
  removeDragListeners()

  if (shouldClose) {
    close()
    return
  }

  dragOffset.value = 0
}
</script>

<style scoped>
.region-layer {
  position: fixed;
  inset: 0;
  z-index: 1700;
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
}

/* 画布模式下把弹层限制在预览画布内 */
:global(body.prototype-preview-canvas) .region-layer {
  inset: auto;
  left: var(--preview-overlay-left, 0px);
  top: var(--preview-overlay-top, 0px);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100dvh);
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

.picker-desc {
  margin: -6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #92959f;
  text-align: center;
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

.tree-node-main.is-locked .tree-node-label {
  color: #6f7280;
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

.picker-confirm:disabled {
  background: #dfe3ef;
  color: #ffffff;
  box-shadow: none;
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
</style>
