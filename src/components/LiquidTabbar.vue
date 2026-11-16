<template>
  <nav
    ref="barRef"
    class="lg-tabbar"
    :class="{ 'lg-tabbar--wide': wide, 'is-dragging': isDragging }"
    :style="lensStyle"
    @pointerdown="onPointerDown"
  >
    <span class="lg-tabbar__lens" aria-hidden="true"></span>

    <button
      v-for="(item, index) in items"
      :key="item.value"
      type="button"
      class="lg-tabbar__item"
      :class="{ 'is-active': activeIndex === index }"
      @click="onSelect(item.value)"
    >
      <span class="lg-tabbar__icon">
        <t-icon :name="item.icon" />
      </span>
      <span class="lg-tabbar__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps({
  wide: { type: Boolean, default: false }
})

const items = [
  { value: 'workbench', label: '工作台', icon: 'dashboard' },
  { value: 'home', label: '视频', icon: 'video' },
  { value: 'todo', label: '待办', icon: 'task' },
  { value: 'profile', label: '我的', icon: 'user' }
]

const route = useRoute()
const router = useRouter()

const barRef = ref(null)
const itemWidth = ref(0)
const lensLeft = ref(0)
const trackX = ref(0)
const isDragging = ref(false)
const lensScale = ref({ x: 1, y: 1 })

const activeIndex = computed(() => {
  const index = items.findIndex(item => item.value === route.name)
  return index > -1 ? index : 0
})

// 透镜位置：静止时对齐当前 tab，拖动时跟随手指（带阻尼回弹）
const lensStyle = computed(() => ({
  '--lg-lens-offset': `${lensLeft.value + activeIndex.value * itemWidth.value + trackX.value}px`,
  '--lg-lens-w': `${itemWidth.value}px`,
  '--lg-lens-sx': lensScale.value.x.toFixed(3),
  '--lg-lens-sy': lensScale.value.y.toFixed(3)
}))

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

let pointerState = null
let ignoreNextClick = false

const measure = () => {
  const firstItem = barRef.value?.querySelector('.lg-tabbar__item')
  if (!firstItem) return
  // 直接取第一个 tab 的实际布局宽度与起点，避免内边距造成的错位
  itemWidth.value = firstItem.offsetWidth
  lensLeft.value = firstItem.offsetLeft
}

const rubber = (offset) => {
  const min = -activeIndex.value * itemWidth.value
  const max = (items.length - 1 - activeIndex.value) * itemWidth.value
  if (offset < min) return min + (offset - min) * 0.22
  if (offset > max) return max + (offset - max) * 0.22
  return offset
}

const onPointerDown = (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  measure()
  pointerState = {
    startX: event.clientX,
    startTime: performance.now(),
    lastX: event.clientX,
    lastTime: performance.now(),
    moved: false
  }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

const onPointerMove = (event) => {
  if (!pointerState) return

  const now = performance.now()
  const deltaX = event.clientX - pointerState.startX
  const moveDistance = Math.abs(event.clientX - pointerState.lastX)
  const moveTime = Math.max(now - pointerState.lastTime, 1)
  const speed = moveDistance / moveTime

  if (!pointerState.moved && Math.abs(deltaX) > 5) {
    pointerState.moved = true
    isDragging.value = true
  }

  if (pointerState.moved) {
    trackX.value = rubber(deltaX)
    // 速度越快，透镜越"拉长"，形成液体形变
    const stretch = clamp(speed * 0.11, 0, 0.16)
    lensScale.value = { x: 1 + stretch, y: 1 - stretch * 0.55 }
  }

  pointerState.lastX = event.clientX
  pointerState.lastTime = now
}

const onPointerUp = () => {
  if (!pointerState) return

  const deltaX = trackX.value
  const moved = pointerState.moved
  const elapsed = performance.now() - pointerState.startTime

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)

  pointerState = null
  isDragging.value = false
  trackX.value = 0
  lensScale.value = { x: 1, y: 1 }

  if (!moved) return

  ignoreNextClick = true
  setTimeout(() => { ignoreNextClick = false }, 60)

  const threshold = itemWidth.value * (elapsed < 220 ? 0.16 : 0.3)
  if (Math.abs(deltaX) < threshold) return

  const nextIndex = clamp(activeIndex.value + Math.round(deltaX / itemWidth.value), 0, items.length - 1)
  const nextItem = items[nextIndex]
  if (nextItem && nextItem.value !== route.name) {
    router.push({ name: nextItem.value })
  }
}

const onSelect = (value) => {
  if (ignoreNextClick) return
  if (value === route.name) return
  router.push({ name: value })
}

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
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
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
  padding: 0 6px;
  border-radius: 29px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  /* 液态玻璃：折射模糊 + 高饱和 + 亮度提升 */
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.34) 46%, rgba(236, 244, 255, 0.44) 100%);
  backdrop-filter: blur(26px) saturate(200%) brightness(1.14);
  -webkit-backdrop-filter: blur(26px) saturate(200%) brightness(1.14);
  box-shadow:
    0 22px 44px rgba(26, 40, 84, 0.22),
    0 6px 14px rgba(26, 40, 84, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.58),
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    inset 0 -12px 20px rgba(150, 180, 255, 0.22);
  touch-action: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.lg-tabbar--wide {
  width: min(calc(var(--shell-live-width, 402px) - 28px), 420px);
}

/* 镜面高光：顶部反光 + 斜向流光 + 底部环境光 */
.lg-tabbar::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  background:
    radial-gradient(120% 92% at 12% -14%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 48%),
    radial-gradient(96% 80% at 86% 118%, rgba(168, 204, 255, 0.42) 0%, rgba(168, 204, 255, 0) 62%),
    linear-gradient(112deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, 0) 74%, rgba(255, 255, 255, 0.22) 100%);
  mix-blend-mode: screen;
  pointer-events: none;
}

/* 液态透镜 */
.lg-tabbar__lens {
  position: absolute;
  top: 5px;
  bottom: 5px;
  left: 0;
  width: var(--lg-lens-w, calc((100% - 12px) / 4));
  z-index: 2;
  border-radius: 999px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 241, 255, 0.72) 48%, rgba(255, 255, 255, 0.9) 100%);
  box-shadow:
    0 10px 22px rgba(46, 72, 158, 0.22),
    0 1px 2px rgba(30, 48, 110, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 -8px 16px rgba(140, 176, 255, 0.42),
    inset 0 0 0 1px rgba(255, 255, 255, 0.85);
  transform:
    translate3d(var(--lg-lens-offset, 0px), 0, 0)
    scaleX(var(--lg-lens-sx, 1))
    scaleY(var(--lg-lens-sy, 1));
  transform-origin: center center;
  transition: transform 0.46s cubic-bezier(0.22, 1.3, 0.34, 1);
  will-change: transform;
  overflow: hidden;
  pointer-events: none;
}

.lg-tabbar__lens::after {
  content: '';
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(58% 60% at 24% 14%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0) 62%),
    radial-gradient(54% 54% at 78% 96%, rgba(150, 190, 255, 0.66) 0%, rgba(150, 190, 255, 0) 66%),
    linear-gradient(100deg, rgba(255, 255, 255, 0.32) 8%, rgba(255, 255, 255, 0) 34%, rgba(255, 255, 255, 0) 70%, rgba(255, 255, 255, 0.4) 96%);
  pointer-events: none;
}

.lg-tabbar.is-dragging .lg-tabbar__lens {
  transition: none;
}

.lg-tabbar__item {
  position: relative;
  z-index: 3;
  min-width: 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: #46536b;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.24s ease;
}

.lg-tabbar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
  transform: translateY(0) scale(1);
  transition: transform 0.38s cubic-bezier(0.22, 1.4, 0.36, 1);
}

.lg-tabbar__icon :deep(.t-icon) {
  font-size: 20px;
}

.lg-tabbar__label {
  font-size: 10px;
  font-weight: 600;
  line-height: 12px;
  letter-spacing: 0.01em;
  white-space: nowrap;
  opacity: 0.9;
  transition: opacity 0.24s ease;
}

.lg-tabbar__item.is-active {
  color: #16204f;
}

.lg-tabbar__item.is-active .lg-tabbar__icon {
  transform: translateY(-1px) scale(1.07);
}

.lg-tabbar__item.is-active .lg-tabbar__label {
  opacity: 1;
}

.lg-tabbar__item:active .lg-tabbar__icon {
  transform: scale(0.9);
}
</style>
