<template>
  <div
    ref="rootEl"
    class="vmc"
    :class="{ 'is-panning': isPanning }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel.prevent="onWheel"
  >
    <div class="vmc-world" :style="worldStyle">
      <svg class="vmc-bg" viewBox="0 0 1000 1200" preserveAspectRatio="none">
        <defs>
          <pattern id="vmc-grid" width="46" height="46" patternUnits="userSpaceOnUse">
            <path d="M46 0 L0 0 0 46" fill="none" stroke="#e6ecf3" stroke-width="1.1" />
          </pattern>
          <linearGradient id="vmc-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#cfe4f7" />
            <stop offset="100%" stop-color="#bcd9f2" />
          </linearGradient>
        </defs>

        <rect width="1000" height="1200" fill="#f2f6f5" />
        <rect width="1000" height="1200" fill="url(#vmc-grid)" />

        <!-- 绿地 -->
        <g fill="#dcefd6">
          <rect x="50" y="60" width="270" height="180" rx="22" />
          <rect x="660" y="420" width="290" height="200" rx="22" />
          <rect x="90" y="760" width="270" height="190" rx="22" />
          <rect x="500" y="910" width="250" height="160" rx="20" />
        </g>

        <!-- 水系 -->
        <path d="M600 1200 Q680 1040 830 1058 T1000 960 L1000 1200 Z" fill="url(#vmc-water)" />

        <!-- 建筑 -->
        <g fill="#e7edf5" stroke="#d5dfeb" stroke-width="1.6">
          <rect x="360" y="90" width="200" height="150" rx="14" />
          <rect x="650" y="100" width="180" height="130" rx="14" />
          <rect x="110" y="360" width="210" height="160" rx="14" />
          <rect x="390" y="350" width="180" height="140" rx="14" />
          <rect x="650" y="680" width="200" height="150" rx="14" />
          <rect x="400" y="640" width="160" height="130" rx="14" />
          <rect x="110" y="560" width="180" height="130" rx="14" />
          <rect x="700" y="880" width="180" height="120" rx="14" />
          <rect x="130" y="1000" width="200" height="140" rx="14" />
          <rect x="420" y="1010" width="140" height="120" rx="14" />
        </g>

        <!-- 道路 -->
        <g stroke="#ffffff" stroke-linecap="round">
          <line x1="0" y1="320" x2="1000" y2="320" stroke-width="26" />
          <line x1="0" y1="620" x2="1000" y2="620" stroke-width="22" />
          <line x1="0" y1="880" x2="1000" y2="880" stroke-width="22" />
          <line x1="190" y1="0" x2="190" y2="1200" stroke-width="20" />
          <line x1="500" y1="0" x2="500" y2="1200" stroke-width="26" />
          <line x1="790" y1="0" x2="790" y2="1200" stroke-width="22" />
        </g>
        <g stroke="#e8eff8" stroke-width="2.6" stroke-dasharray="14 12">
          <line x1="0" y1="320" x2="1000" y2="320" />
          <line x1="0" y1="620" x2="1000" y2="620" />
          <line x1="500" y1="0" x2="500" y2="1200" />
        </g>

        <!-- 区域名 -->
        <g fill="#8fa0b1" font-size="30" font-weight="600" letter-spacing="2">
          <text x="200" y="300">桥北</text>
          <text x="445" y="600">鼓楼</text>
          <text x="720" y="850">江宁</text>
        </g>
        <g fill="#7fbfa8" font-size="22" font-weight="600">
          <text x="110" y="860">城市公园</text>
          <text x="640" y="520">滨河绿带</text>
        </g>
      </svg>

      <!-- 门店定位 -->
      <template v-if="mode === 'store'">
        <button
          v-for="store in stores"
          :key="store.id"
          type="button"
          class="vmc-store"
          :class="{ 'is-active': selectedStoreId === store.id }"
          :style="markerStyle(store.marker)"
          @pointerdown.stop
          @click.stop="emit('storeClick', store)"
        >
          <span class="vmc-store-circle">
            {{ store.deviceCount }}
            <i class="vmc-store-pulse" />
          </span>
          <span class="vmc-store-label">{{ store.name }}</span>
        </button>
      </template>

      <!-- 设备定位 -->
      <template v-else>
        <button
          v-for="device in devices"
          :key="device.id"
          type="button"
          class="vmc-device"
          :class="{ 'is-active': selectedDeviceId === device.id, 'is-offline': !device.online }"
          :style="markerStyle(device.marker)"
          @pointerdown.stop
          @click.stop="emit('deviceClick', device)"
        >
          <span class="vmc-device-pin">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="6.4" width="12.4" height="10" rx="2.4" stroke="currentColor" stroke-width="1.8" />
              <path d="M15.4 10.2 21 7.4v9.2l-5.6-2.8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
            </svg>
            <i class="vmc-device-status" />
          </span>
          <span class="vmc-device-label">{{ device.name }}</span>
        </button>
      </template>
    </div>

    <!-- 指北针 + 缩放 -->
    <div class="vmc-compass">N</div>
    <div class="vmc-zoom">
      <button type="button" class="vmc-zbtn" aria-label="放大" @pointerdown.stop @click.stop="zoomIn">+</button>
      <span class="vmc-zval">{{ Math.round(zoom * 100) }}%</span>
      <button type="button" class="vmc-zbtn" aria-label="缩小" @pointerdown.stop @click.stop="zoomOut">−</button>
      <button type="button" class="vmc-zbtn vmc-zbtn--reset" aria-label="重置视野" @pointerdown.stop @click.stop="resetView">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="6.6" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 2.8v4M12 17.2v4M2.8 12h4M17.2 12h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  stores: { type: Array, default: () => [] },
  devices: { type: Array, default: () => [] },
  mode: { type: String, default: 'store' },
  selectedStoreId: { type: String, default: '' },
  selectedDeviceId: { type: [String, Number], default: '' }
})

const emit = defineEmits(['storeClick', 'deviceClick'])

const rootEl = ref(null)
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const pointers = new Map()
let panStart = null
let pinchStart = null

const MIN_ZOOM = 1
const MAX_ZOOM = 2.6

const worldStyle = computed(() => ({
  transform: `translate3d(${pan.value.x}px, ${pan.value.y}px, 0) scale(${zoom.value})`
}))

const clampPan = () => {
  const rect = rootEl.value?.getBoundingClientRect()
  if (!rect) return
  const maxX = ((zoom.value - 1) * rect.width) / 2
  const maxY = ((zoom.value - 1) * rect.height) / 2
  pan.value.x = Math.min(maxX, Math.max(-maxX, pan.value.x))
  pan.value.y = Math.min(maxY, Math.max(-maxY, pan.value.y))
}

const setZoom = (next) => {
  zoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next))
  clampPan()
}

const zoomIn = () => setZoom(zoom.value * 1.35)
const zoomOut = () => setZoom(zoom.value / 1.35)
const resetView = () => {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}

const markerStyle = (marker) => ({
  left: `${marker.left}%`,
  top: `${marker.top}%`,
  transform: `translate(-50%, -50%) scale(${(1 / zoom.value).toFixed(3)})`
})

const onPointerDown = (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size === 1) {
    panStart = { x: event.clientX, y: event.clientY, panX: pan.value.x, panY: pan.value.y }
    isPanning.value = true
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    pinchStart = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: zoom.value }
    panStart = null
  }
  rootEl.value?.setPointerCapture?.(event.pointerId)
}

const onPointerMove = (event) => {
  if (!pointers.has(event.pointerId)) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 2 && pinchStart) {
    const [a, b] = [...pointers.values()]
    const distance = Math.hypot(a.x - b.x, a.y - b.y)
    if (pinchStart.distance > 0) {
      setZoom(pinchStart.zoom * (distance / pinchStart.distance))
    }
    return
  }

  if (!panStart) return
  pan.value = {
    x: panStart.panX + (event.clientX - panStart.x),
    y: panStart.panY + (event.clientY - panStart.y)
  }
  clampPan()
}

const onPointerUp = (event) => {
  pointers.delete(event.pointerId)
  if (pointers.size < 2) pinchStart = null
  if (pointers.size === 1) {
    const [p] = [...pointers.values()]
    panStart = { x: p.x, y: p.y, panX: pan.value.x, panY: pan.value.y }
  } else if (pointers.size === 0) {
    panStart = null
    isPanning.value = false
  }
}

const onWheel = (event) => {
  setZoom(zoom.value * (event.deltaY < 0 ? 1.16 : 1 / 1.16))
}

onMounted(() => {
  window.addEventListener('resize', clampPan)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', clampPan)
})

defineExpose({ zoomIn, zoomOut, resetView })
</script>

<style scoped>
.vmc {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f2f6f5;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}

.vmc.is-panning {
  cursor: grabbing;
}

.vmc-world {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  will-change: transform;
}

.vmc-bg {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

/* 门店标记 */
.vmc-store {
  position: absolute;
  z-index: 4;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.vmc-store-circle {
  position: relative;
  min-width: 38px;
  height: 38px;
  padding: 0 7px;
  border: 2.5px solid #ffffff;
  border-radius: 19px;
  background: linear-gradient(140deg, #5b6cfb 0%, #4059f0 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(64, 89, 240, 0.38);
}

.vmc-store.is-active .vmc-store-circle {
  box-shadow: 0 0 0 7px rgba(64, 89, 240, 0.18), 0 8px 20px rgba(64, 89, 240, 0.42);
}

.vmc-store-pulse {
  position: absolute;
  inset: -2px;
  border: 2px solid rgba(64, 89, 240, 0.28);
  border-radius: 20px;
  animation: vmc-pulse 2.4s ease-out infinite;
}

@keyframes vmc-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}

.vmc-store-label {
  margin-top: 4px;
  padding: 2px 7px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.94);
  color: #26303f;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.35;
  white-space: nowrap;
  box-shadow: 0 3px 8px rgba(24, 43, 74, 0.14);
}

.vmc-store.is-active .vmc-store-label {
  background: #4059f0;
  color: #fff;
}

/* 设备标记 */
.vmc-device {
  position: absolute;
  z-index: 4;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.vmc-device-pin {
  position: relative;
  width: 32px;
  height: 32px;
  border: 2px solid #4059f0;
  border-radius: 50%;
  background: #ffffff;
  color: #4059f0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 89, 240, 0.28);
}

.vmc-device-pin svg {
  width: 17px;
  height: 17px;
}

.vmc-device-status {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 9px;
  height: 9px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #16a34a;
}

.vmc-device.is-offline .vmc-device-pin {
  border-color: #9aa4b4;
  color: #9aa4b4;
  box-shadow: 0 4px 12px rgba(70, 86, 110, 0.2);
}

.vmc-device.is-offline .vmc-device-status {
  background: #b0bac7;
}

.vmc-device.is-active .vmc-device-pin {
  background: #4059f0;
  color: #fff;
  box-shadow: 0 0 0 6px rgba(64, 89, 240, 0.16), 0 5px 16px rgba(64, 89, 240, 0.4);
}

.vmc-device-label {
  margin-top: 3px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.94);
  color: #33404f;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 1.35;
  white-space: nowrap;
  box-shadow: 0 3px 8px rgba(24, 43, 74, 0.12);
}

.vmc-device.is-active .vmc-device-label {
  background: #4059f0;
  color: #fff;
}

/* 指北针 / 缩放 */
.vmc-compass {
  position: absolute;
  right: 12px;
  top: 14px;
  z-index: 6;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #40506a;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 14px rgba(24, 43, 74, 0.16);
}

.vmc-zoom {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.vmc-zbtn {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 17px;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vmc-zbtn:active {
  background: #eef1ff;
  color: #4059f0;
}

.vmc-zbtn--reset svg {
  width: 14px;
  height: 14px;
}

.vmc-zval {
  padding: 1px 0;
  color: #7a8798;
  font-size: 8.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
