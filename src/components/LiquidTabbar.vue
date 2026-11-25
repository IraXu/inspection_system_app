<template>
  <nav
    ref="barRef"
    class="lg-tabbar"
    :class="{ 'lg-tabbar--wide': wide, 'is-pressed': pressed, 'is-dragging': dragging }"
    role="tablist"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
  >
    <!-- 0 层：轨道玻璃 -->
    <span class="lg-track" aria-hidden="true" :style="trackStyle"></span>

    <!-- 1 层：静止态磨砂胶囊（按住时淡出，让位给真实折射） -->
    <span class="lg-pill lg-pill--frost" :style="pillStyle" aria-hidden="true">
      <i class="lg-pill__core"></i>
    </span>

    <!-- 2 层：图标文字（按住时下沉到透镜下方，被折射弯折） -->
    <div class="lg-labels">
      <button
        v-for="(item, index) in items"
        :key="item.value"
        type="button"
        role="tab"
        class="lg-seg"
        :class="{ 'is-on': index === slotIndex }"
        :aria-selected="index === activeIndex ? 'true' : 'false'"
        :tabindex="index === activeIndex ? 0 : -1"
        @keydown.enter.prevent="onSelect(item.value)"
        @keydown.space.prevent="onSelect(item.value)"
      >
        <TabbarIcon :name="item.icon" :size="24" />
        <span class="lg-seg__label">{{ item.label }}</span>
      </button>
    </div>

    <!-- 3 层：玻璃透镜（按住时升到文字上方，真实折射下方内容） -->
    <span class="lg-pill lg-pill--lens" :style="pillStyle" aria-hidden="true">
      <i class="lg-pill__core" :style="lensStyle"></i>
    </span>

    <!-- 4 层：胶囊描边与镜面高光 -->
    <span class="lg-rim" aria-hidden="true"></span>
  </nav>

  <svg class="lg-defs" aria-hidden="true" focusable="false">
    <defs>
      <!-- 轨道玻璃：轻微边缘折射 -->
      <filter
        :id="trackFilterId"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        color-interpolation-filters="sRGB"
      >
        <feImage
          :href="lensMap"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          result="map"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="frosted" />
        <feDisplacementMap
          in="frosted"
          in2="map"
          scale="8"
          xChannelSelector="R"
          yChannelSelector="G"
          result="bent"
        />
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.014 0.02"
          numOctaves="2"
          seed="7"
          result="noise"
        />
        <feDisplacementMap
          in="bent"
          in2="noise"
          scale="1.2"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <!-- 透镜玻璃：边缘折射，中部保持零位移 -->
      <filter
        :id="lensFilterId"
        x="-25%"
        y="-40%"
        width="150%"
        height="180%"
        color-interpolation-filters="sRGB"
      >
        <feImage
          :href="lensMap"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          result="map"
        />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="clean" />
        <feDisplacementMap
          in="clean"
          in2="map"
          scale="12"
          xChannelSelector="R"
          yChannelSelector="G"
          result="bent"
        />
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.012 0.018"
          numOctaves="2"
          seed="11"
          result="noise"
        />
        <feDisplacementMap
          in="bent"
          in2="noise"
          scale="1"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabbarIcon from './TabbarIcon.vue'

defineProps({
  wide: { type: Boolean, default: false }
})

const items = [
  { value: 'workbench', label: '工作台', icon: 'dashboard' },
  { value: 'home', label: '视频', icon: 'video' },
  { value: 'todo', label: '待办', icon: 'todo' },
  { value: 'profile', label: '我的', icon: 'profile' }
]

/* ---------- 常量：对齐 iOS 26 Tab Bar 手感 ---------- */
const PAD = 6 // 胶囊/文字层相对轨道的内边距
const GROW_W = 1.12 // 按压时胶囊横向撑开倍数
const GROW_H = 1.15 // 按压时胶囊纵向长高倍数
const PILL_LIFT = 10 // 按压时至少高出轨道的像素
const PRESS_SCALE_X = 1.035 // 按压时整条导航横向拉伸
const PRESS_SCALE_Y = 0.94 // 按压时整条导航纵向压矮
const DRAG_THRESHOLD = 3 // 超过该位移才算拖动

// 每个实例使用独立 id（页面内可能同时存在两个 Tabbar）
const uid = Math.random().toString(36).slice(2, 8)
const trackFilterId = `lg-track-glass-${uid}`
const lensFilterId = `lg-lens-glass-${uid}`

// 折射位移贴图：R 通道控制水平位移、G 通道控制垂直位移。
// 中部大范围保持 128（完全不位移，保证压在透镜下的文字不被复制），
// 只有贴近边缘的一圈才弯折，形成透镜弧面。
const lensMap = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
  <defs>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000000"/>
      <stop offset="0.16" stop-color="#800000"/>
      <stop offset="0.84" stop-color="#800000"/>
      <stop offset="1" stop-color="#ff0000"/>
    </linearGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000000"/>
      <stop offset="0.18" stop-color="#008000"/>
      <stop offset="0.82" stop-color="#008000"/>
      <stop offset="1" stop-color="#00ff00"/>
    </linearGradient>
  </defs>
  <rect width="200" height="100" fill="url(#h)"/>
  <rect width="200" height="100" fill="url(#v)" style="mix-blend-mode:screen"/>
</svg>`)}`

const route = useRoute()
const router = useRouter()

const barRef = ref(null)
const navW = ref(334)
const navH = ref(58)
const segW = computed(() => (navW.value - PAD * 2) / items.length)

const pressed = ref(false)
const dragging = ref(false)
const slotIndex = ref(0)
const slotX = ref(PAD)

const activeIndex = computed(() => {
  const index = items.findIndex(item => item.value === route.name)
  return index > -1 ? index : 0
})

watch(activeIndex, (index) => {
  if (pressed.value || dragging.value) return
  slotIndex.value = index
  slotX.value = PAD + index * segW.value
}, { immediate: true })

/* ---------- 胶囊几何 ---------- */
const pillGeom = computed(() => {
  const seg = segW.value
  const growing = pressed.value || dragging.value
  const w = growing ? seg * GROW_W : seg
  const h = growing
    ? Math.max(navH.value * GROW_H, navH.value + PILL_LIFT)
    : Math.max(0, navH.value - PAD * 2)
  const maxX = Math.max(PAD, navW.value - PAD - w)
  // 以格子中心为轴撑开，并夹在轨道内，避免贴边时溢出
  const x = Math.min(Math.max(slotX.value + (seg - w) / 2, PAD), maxX)
  return { x, y: (navH.value - h) / 2, w, h }
})

const pillStyle = computed(() => ({
  width: `${pillGeom.value.w}px`,
  height: `${pillGeom.value.h}px`,
  top: `${pillGeom.value.y}px`,
  transform: `translate3d(${pillGeom.value.x}px, 0, 0)`
}))

/* ---------- 玻璃材质 ---------- */
const trackStyle = computed(() => ({
  backdropFilter: `url(#${trackFilterId}) saturate(185%) brightness(1.07)`
}))

// 透镜：Chrome 走 SVG 位移折射；Safari 不支持 url() 时会回落到 CSS 里的模糊兜底
const lensStyle = computed(() => ({
  backdropFilter: `url(#${lensFilterId}) saturate(165%) brightness(1.05)`
}))

/* ---------- 尺寸测量（用布局尺寸，不受按压缩放影响） ---------- */
const measure = () => {
  const bar = barRef.value
  if (!bar) return
  const w = bar.offsetWidth
  const h = bar.offsetHeight
  if (!w || !h) return
  navW.value = w
  navH.value = h
  if (!pressed.value && !dragging.value) {
    slotX.value = PAD + slotIndex.value * segW.value
  }
}

// 屏幕坐标换算回布局坐标（按压时整条导航被 scale 过）
const indexAt = (clientX) => {
  const bar = barRef.value
  if (!bar) return 0
  const rect = bar.getBoundingClientRect()
  const scaleX = rect.width ? navW.value / rect.width : 1
  const x = (clientX - rect.left) * scaleX
  const index = Math.floor((x - PAD) / Math.max(1, segW.value))
  return Math.min(Math.max(index, 0), items.length - 1)
}

/* ---------- 指针交互：按下即选中、拖动跟手、松手弹簧吸附 ---------- */
let pointerState = null
let startX = 0
let startSlot = PAD

const onPointerDown = (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  event.preventDefault()
  measure()
  pressed.value = true
  dragging.value = false

  const index = indexAt(event.clientX)
  slotIndex.value = index
  slotX.value = PAD + index * segW.value
  startX = event.clientX
  startSlot = slotX.value

  pointerState = { pointerId: event.pointerId }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)
}

const onPointerMove = (event) => {
  if (!pointerState) return
  const dx = (event.clientX - startX) / PRESS_SCALE_X
  if (!dragging.value) {
    if (Math.abs(dx) <= DRAG_THRESHOLD) return
    dragging.value = true
  }
  const maxX = PAD + segW.value * (items.length - 1)
  slotX.value = Math.min(Math.max(startSlot + dx, PAD), maxX)
  // 拖动过程中胶囊滑到哪一格，哪一格就是选中色
  const hovered = Math.round((slotX.value - PAD) / Math.max(1, segW.value))
  slotIndex.value = Math.min(Math.max(hovered, 0), items.length - 1)
}

const finishPress = () => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
  pointerState = null
}

const onPointerUp = () => {
  if (!pointerState) return
  const index = slotIndex.value
  const moved = dragging.value
  finishPress()
  pressed.value = false
  dragging.value = false
  // 松手吸附到最近一格（胶囊几何回缩时弹簧回弹）
  slotX.value = PAD + index * segW.value
  if (moved || index !== activeIndex.value) {
    select(index)
  }
}

const onPointerCancel = () => {
  if (!pointerState) return
  finishPress()
  pressed.value = false
  dragging.value = false
  slotIndex.value = activeIndex.value
  slotX.value = PAD + activeIndex.value * segW.value
}

const select = (index) => {
  const item = items[index]
  if (!item || item.value === route.name) return
  router.push({ name: item.value })
}

const onSelect = (value) => {
  if (value === route.name) return
  router.push({ name: value })
}

/* ---------- 生命周期 ---------- */
let observer = null

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && barRef.value) {
    observer = new ResizeObserver(measure)
    observer.observe(barRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  finishPress()
})
</script>

<style scoped>
.lg-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: var(--app-tabbar-bottom, calc(12px + env(safe-area-inset-bottom, 0px)));
  z-index: 60;
  width: min(calc(var(--shell-live-width, 402px) - 64px), 334px);
  height: 58px;
  border-radius: 999px;
  background: transparent;
  box-shadow:
    0 22px 44px rgba(18, 31, 70, 0.2),
    0 8px 18px rgba(18, 31, 70, 0.1);
  touch-action: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transform-origin: center center;
  /* 按压时整条导航“横向拉长、纵向压矮”，松手弹回 */
  transition: transform 0.46s cubic-bezier(0.34, 1.6, 0.64, 1);
}

.lg-tabbar.is-pressed {
  transform: scale(1.035, 0.94);
}

.lg-tabbar.is-dragging {
  cursor: grabbing;
}

.lg-tabbar--wide {
  width: min(calc(var(--shell-live-width, 402px) - 28px), 420px);
}

/* ---------- 0 层：轨道玻璃 ---------- */
.lg-track {
  position: absolute;
  inset: 0;
  /* 注意：z-index 不能为 0，否则 Chrome 不会为该层合成 backdrop-filter */
  z-index: 1;
  border-radius: inherit;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 46%, rgba(238, 245, 255, 0.52) 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -14px 22px rgba(146, 178, 255, 0.16);
  pointer-events: none;
}

/* ---------- 胶囊（磨砂层 / 透镜层共用几何） ---------- */
.lg-pill {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 999px;
  pointer-events: none;
  will-change: transform, top, width, height;
  transition:
    transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    top 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 拖动时横向必须跟手，宽高保留弹簧 */
.lg-tabbar.is-dragging .lg-pill {
  transition:
    top 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lg-pill__core {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: inherit;
  overflow: hidden;
}

/* 静止态：磨砂白胶囊 */
.lg-pill--frost {
  z-index: 3;
}

.lg-pill--frost .lg-pill__core {
  background:
    linear-gradient(168deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.2) 52%, rgba(255, 255, 255, 0.3) 100%);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 1px rgba(0, 0, 0, 0.05),
    0 1px 5px rgba(23, 36, 77, 0.1);
  transition: opacity 0.22s ease;
}

/* 按住：磨砂层淡出（连同模糊一起关掉），交给透镜做真实折射 */
.lg-tabbar.is-pressed .lg-pill--frost .lg-pill__core {
  opacity: 0;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* ---------- 3 层：玻璃透镜 ---------- */
.lg-pill--lens {
  z-index: 2;
}

.lg-pill--lens .lg-pill__core {
  /* Safari 等不支持 url() 滤镜时的兜底 */
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 52%, rgba(255, 255, 255, 0.2) 100%);
}

/* 镜片曲面光：上亮下暗的一圈轮廓光，撑起凸起感（玻璃本体保持透明） */
.lg-pill--lens::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    inset 0 1.5px 2px rgba(255, 255, 255, 0.6),
    inset 0 -1.5px 3px rgba(255, 255, 255, 0.18),
    inset 0 -6px 10px -6px rgba(0, 0, 0, 0.07);
}

/* ---------- 2 层：图标文字 ---------- */
.lg-labels {
  position: absolute;
  inset: 4px 6px;
  z-index: 4;
  display: flex;
  align-items: center;
}

/* 按住时文字位于透镜（z-index 5）下方，被玻璃折射 */
.lg-tabbar.is-pressed .lg-labels {
  z-index: 4;
}

.lg-seg {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: #5a6478;
  font-family: inherit;
  cursor: pointer;
  opacity: 0.82;
  transform: scale(1);
  transition: color 0.24s ease, opacity 0.24s ease, transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-tap-highlight-color: transparent;
}

/* 按压时选中项被玻璃“顶起”，轻微膨胀 */
.lg-tabbar.is-pressed .lg-seg.is-on {
  transform: scale(1.06);
}

.lg-seg.is-on {
  color: var(--auth-primary, #3d4ef5);
  opacity: 1;
}

.lg-seg__label {
  max-width: 100%;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- 4 层：轨道描边与镜面高光 ---------- */
.lg-rim {
  position: absolute;
  inset: 0;
  z-index: 6;
  border-radius: inherit;
  background:
    radial-gradient(120% 92% at 12% -14%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 46%),
    radial-gradient(96% 80% at 86% 118%, rgba(168, 204, 255, 0.36) 0%, rgba(168, 204, 255, 0) 62%);
  mix-blend-mode: screen;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(255, 255, 255, 0.45),
    inset 1px 0 0 rgba(160, 205, 255, 0.28),
    inset -1px 0 0 rgba(255, 180, 235, 0.16);
  pointer-events: none;
}

/* 滤镜定义容器：不占位、不拦截事件 */
.lg-defs {
  position: fixed;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
