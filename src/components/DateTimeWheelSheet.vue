<template>
  <transition name="dt-sheet">
    <div v-if="visible" class="dt-layer" @click.self="close">
      <div class="dt-sheet">
        <span class="dt-handle"></span>

        <div class="dt-head">
          <div class="dt-head-copy">
            <p class="dt-kicker">巡检计划</p>
            <h3 class="dt-title">{{ sheetTitle }}</h3>
          </div>
          <div class="dt-head-actions">
            <button type="button" class="dt-quick" @click="pickNow">
              {{ mode === 'date' ? '今天' : '现在' }}
            </button>
            <button type="button" class="dt-close" aria-label="关闭" @click="close">
              <t-icon name="close" size="18" />
            </button>
          </div>
        </div>

        <div class="dt-wheel">
          <div class="dt-wheel-band"></div>
          <div class="dt-wheel-cols">
            <div
              v-for="(column, colIndex) in columns"
              :key="`${mode}-${colIndex}`"
              :ref="(el) => setColEl(el, colIndex)"
              class="dt-col"
              @scroll.passive="onScroll(colIndex, $event)"
              @pointerdown="onPointerDown(colIndex, $event)"
              @pointermove="onPointerMove($event)"
              @pointerup="onPointerEnd"
              @pointercancel="onPointerEnd"
            >
              <div class="dt-col-pad"></div>
              <button
                v-for="(item, itemIndex) in column.items"
                :key="item.value"
                type="button"
                class="dt-col-item"
                :class="{ 'is-active': itemIndex === activeIndexes[colIndex] }"
                @click="onItemClick(colIndex, itemIndex)"
              >
                {{ item.label }}
              </button>
              <div class="dt-col-pad"></div>
            </div>
          </div>
          <div class="dt-wheel-mask dt-wheel-mask--top"></div>
          <div class="dt-wheel-mask dt-wheel-mask--bottom"></div>
        </div>

        <div class="dt-actions">
          <button type="button" class="dt-btn dt-btn--ghost" @click="close">取消</button>
          <button type="button" class="dt-btn dt-btn--primary" @click="confirm">确定</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'date' },
  title: { type: String, default: '' },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'update:modelValue'])

const ITEM_HEIGHT = 44
const now = new Date()
const currentYear = now.getFullYear()

const pad2 = (value) => String(value).padStart(2, '0')
const daysInMonth = (year, month) => new Date(Number(year), Number(month), 0).getDate()

const sheetTitle = computed(() => props.title || (props.mode === 'date' ? '选择日期' : '选择时间'))

const years = computed(() => {
  const list = []
  for (let year = currentYear - 1; year <= currentYear + 5; year += 1) {
    list.push({ label: `${year} 年`, value: year })
  }
  return list
})

const months = Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1} 月`, value: index + 1 }))
const hourList = Array.from({ length: 24 }, (_, index) => ({ label: `${pad2(index)} 时`, value: index }))
const minuteList = Array.from({ length: 60 }, (_, index) => ({ label: `${pad2(index)} 分`, value: index }))

const selected = ref({
  year: currentYear,
  month: now.getMonth() + 1,
  day: now.getDate(),
  hour: 9,
  minute: 0
})

const days = computed(() => {
  const total = daysInMonth(selected.value.year, selected.value.month)
  return Array.from({ length: total }, (_, index) => ({ label: `${index + 1} 日`, value: index + 1 }))
})

const columns = computed(() =>
  props.mode === 'date'
    ? [
        { key: 'year', items: years.value },
        { key: 'month', items: months },
        { key: 'day', items: days.value }
      ]
    : [
        { key: 'hour', items: hourList },
        { key: 'minute', items: minuteList }
      ]
)

const activeIndexes = computed(() =>
  columns.value.map((column) => {
    const index = column.items.findIndex((item) => item.value === selected.value[column.key])
    return index < 0 ? 0 : index
  })
)

const colEls = []
const setColEl = (el, index) => {
  colEls[index] = el
}

const syncScroll = (behavior = 'auto') => {
  nextTick(() => {
    columns.value.forEach((_, index) => {
      const el = colEls[index]
      if (!el) return
      el.scrollTo({ top: activeIndexes.value[index] * ITEM_HEIGHT, behavior })
    })
  })
}

const initFromModel = () => {
  if (props.mode === 'date') {
    const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(props.modelValue || '')
    let year = matched ? Number(matched[1]) : now.getFullYear()
    let month = matched ? Number(matched[2]) : now.getMonth() + 1
    let day = matched ? Number(matched[3]) : now.getDate()

    year = Math.min(Math.max(year, currentYear - 1), currentYear + 5)
    month = Math.min(Math.max(month, 1), 12)
    day = Math.min(Math.max(day, 1), daysInMonth(year, month))

    selected.value = { ...selected.value, year, month, day }
  } else {
    const matched = /^(\d{1,2}):(\d{2})/.exec(props.modelValue || '')
    const hour = matched ? Number(matched[1]) : 9
    const minute = matched ? Number(matched[2]) : 0
    selected.value = {
      ...selected.value,
      hour: Math.min(Math.max(hour, 0), 23),
      minute: Math.min(Math.max(minute, 0), 59)
    }
  }
  syncScroll()
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) initFromModel()
  }
)

// 年/月变化后，天数可能变少，需要把日期回收到有效范围
watch(
  () => days.value.length,
  (total) => {
    if (selected.value.day <= total) return
    selected.value = { ...selected.value, day: total }
    nextTick(() => {
      const el = colEls[2]
      if (el) el.scrollTop = (total - 1) * ITEM_HEIGHT
    })
  }
)

let scrollTimer = null
const onScroll = (colIndex, event) => {
  const el = event.target
  const column = columns.value[colIndex]
  if (!column) return

  const rawIndex = Math.round(el.scrollTop / ITEM_HEIGHT)
  const index = Math.min(Math.max(rawIndex, 0), column.items.length - 1)
  if (selected.value[column.key] !== column.items[index].value) {
    selected.value = { ...selected.value, [column.key]: column.items[index].value }
  }

  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    const target = Math.min(Math.max(Math.round(el.scrollTop / ITEM_HEIGHT), 0), column.items.length - 1)
    el.scrollTo({ top: target * ITEM_HEIGHT, behavior: 'smooth' })
  }, 110)
}

let drag = null
let suppressClick = false

const onPointerDown = (colIndex, event) => {
  if (event.pointerType === 'touch') return
  const el = colEls[colIndex]
  if (!el) return
  drag = { el, startY: event.clientY, startTop: el.scrollTop, moved: false }
  el.style.scrollSnapType = 'none'
  el.setPointerCapture?.(event.pointerId)
}

const onPointerMove = (event) => {
  if (!drag) return
  const delta = event.clientY - drag.startY
  if (Math.abs(delta) > 3) drag.moved = true
  drag.el.scrollTop = drag.startTop - delta
  event.preventDefault()
}

const onPointerEnd = () => {
  if (!drag) return
  drag.el.style.scrollSnapType = ''
  if (drag.moved) {
    suppressClick = true
    setTimeout(() => {
      suppressClick = false
    }, 150)
  }
  drag = null
}

const onItemClick = (colIndex, itemIndex) => {
  if (suppressClick) return
  const column = columns.value[colIndex]
  if (!column) return
  selected.value = { ...selected.value, [column.key]: column.items[itemIndex].value }
  const el = colEls[colIndex]
  if (el) el.scrollTo({ top: itemIndex * ITEM_HEIGHT, behavior: 'smooth' })
}

const pickNow = () => {
  const date = new Date()
  if (props.mode === 'date') {
    selected.value = {
      ...selected.value,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    }
  } else {
    selected.value = { ...selected.value, hour: date.getHours(), minute: date.getMinutes() }
  }
  syncScroll('smooth')
}

const close = () => {
  emit('update:visible', false)
}

const confirm = () => {
  if (props.mode === 'date') {
    const { year, month, day } = selected.value
    emit('update:modelValue', `${year}-${pad2(month)}-${pad2(day)}`)
  } else {
    const { hour, minute } = selected.value
    emit('update:modelValue', `${pad2(hour)}:${pad2(minute)}`)
  }
  close()
}
</script>

<style scoped>
.dt-layer {
  position: fixed;
  inset: 0;
  z-index: 1700;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(18, 22, 38, 0.26);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 画布模式下把弹层限制在预览画布内 */
:global(body.prototype-preview-canvas) .dt-layer {
  inset: auto;
  left: var(--preview-overlay-left, 0px);
  top: var(--preview-overlay-top, 0px);
  width: var(--preview-overlay-width, 100vw);
  height: var(--preview-overlay-height, 100dvh);
}

.dt-sheet {
  width: 100%;
  padding: 10px 18px calc(12px + var(--prototype-safe-bottom));
  border-radius: 26px 26px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(30, 40, 80, 0.14);
}

.dt-handle {
  display: block;
  width: 42px;
  height: 5px;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: #e5e5e8;
}

.dt-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px;
}

.dt-head-copy {
  min-width: 0;
}

.dt-kicker {
  margin: 0 0 3px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #9a9da8;
}

.dt-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #16171d;
}

.dt-head-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dt-quick {
  padding: 5px 11px;
  border: 0;
  border-radius: 999px;
  background: #eef3ff;
  color: #3d6cf5;
  font-size: 12px;
  font-weight: 600;
}

.dt-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #f4f4f6;
  color: #6b6e7a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dt-wheel {
  position: relative;
  height: 220px;
  margin-top: 10px;
  border-radius: 18px;
  background: #f8f9fc;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

.dt-wheel-band {
  position: absolute;
  left: 10px;
  right: 10px;
  top: calc(50% - 22px);
  height: 44px;
  border-radius: 12px;
  background: #e9f0ff;
  pointer-events: none;
}

.dt-wheel-cols {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  padding: 0 10px;
}

.dt-col {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  overscroll-behavior: contain;
  touch-action: pan-y;
  cursor: grab;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dt-col::-webkit-scrollbar {
  display: none;
}

.dt-col:active {
  cursor: grabbing;
}

.dt-col-pad {
  height: 88px;
}

.dt-col-item {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 15.5px;
  font-weight: 500;
  color: #b1b5c1;
  scroll-snap-align: center;
  transition: color 0.18s ease, font-size 0.18s ease;
}

.dt-col-item.is-active {
  color: #2f5fe0;
  font-size: 16.5px;
  font-weight: 700;
}

.dt-wheel-mask {
  position: absolute;
  left: 0;
  right: 0;
  height: 76px;
  z-index: 2;
  pointer-events: none;
}

.dt-wheel-mask--top {
  top: 0;
  background: linear-gradient(180deg, #f8f9fc 16%, rgba(248, 249, 252, 0.92) 58%, rgba(248, 249, 252, 0) 100%);
}

.dt-wheel-mask--bottom {
  bottom: 0;
  background: linear-gradient(0deg, #f8f9fc 16%, rgba(248, 249, 252, 0.92) 58%, rgba(248, 249, 252, 0) 100%);
}

.dt-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding-top: 14px;
}

.dt-btn {
  height: 48px;
  border: 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.dt-btn--ghost {
  background: #ececee;
  color: #16171d;
}

.dt-btn--primary {
  background: linear-gradient(135deg, #5c7cf8 0%, #3f5ef0 100%);
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(63, 94, 240, 0.24);
}

.dt-btn--primary:active {
  box-shadow: 0 6px 14px rgba(63, 94, 240, 0.22);
}

.dt-sheet-enter-active,
.dt-sheet-leave-active {
  transition: opacity 0.26s ease;
}

.dt-sheet-enter-active .dt-sheet,
.dt-sheet-leave-active .dt-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.dt-sheet-enter-from,
.dt-sheet-leave-to {
  opacity: 0;
}

.dt-sheet-enter-from .dt-sheet,
.dt-sheet-leave-to .dt-sheet {
  transform: translate3d(0, 100%, 0);
}
</style>
