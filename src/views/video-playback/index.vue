<template>
  <div class="pb-page">
    <header class="pb-nav">
      <button type="button" class="pb-back" aria-label="返回" @click="goBack">
        <LiveIcon name="back" :size="26" />
      </button>

      <div class="pb-nav-modes">
        <button
          v-for="item in modes"
          :key="item.value"
          type="button"
          class="pb-nav-mode"
          :class="{ active: activeMode === item.value }"
          @click="switchMode(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <!-- 回放画面窗口 -->
    <section class="pb-stage">
      <img class="pb-stage-frame" :src="frameImage" alt="" />
      <div class="pb-stage-mask"></div>

      <div class="pb-stage-top">
        <span class="pb-stage-title">{{ deviceName }}</span>
      </div>

      <button
        v-if="currentSegment"
        type="button"
        class="pb-stage-toggle"
        :aria-label="isPlaying ? '暂停' : '播放'"
        @click="togglePlay"
      >
        <t-icon :name="isPlaying ? 'pause-circle-filled' : 'play-circle-filled'" size="52px" />
      </button>

      <div v-if="currentSegment" class="pb-stage-bottom">
        <div class="pb-stage-line">
          <span class="pb-stage-clock">{{ currentTimeText }}</span>
          <div class="pb-stage-progress">
            <span :style="{ width: `${playProgress}%` }"></span>
          </div>
          <span class="pb-stage-clock">{{ endTimeText }}</span>
        </div>
        <div class="pb-stage-tools">
          <button type="button" class="pb-tool pb-tool--rate" aria-label="切换倍速" @click="cycleRate">
            {{ playbackRate }}x
          </button>
          <button type="button" class="pb-tool" aria-label="全屏观看" @click="toggleFullscreen">
            <LiveIcon name="expand" :size="15" />
          </button>
        </div>
      </div>

      <div v-else class="pb-stage-empty">
        <t-icon name="video" size="30px" />
        <p>点击下方时间轴选择录像</p>
      </div>
    </section>

    <!-- 日期切换 -->
    <section class="pb-daybar">
      <button type="button" class="pb-day-arrow" aria-label="前一天" :disabled="!canShiftPrev" @click="shiftDate(1)">
        <LiveIcon name="chevron-left" :size="18" />
      </button>

      <button type="button" class="pb-day-title" @click="showCalendar = true">
        <strong>{{ dateTitle }}</strong>
        <span>{{ selectedDate }}</span>
      </button>

      <button type="button" class="pb-day-arrow" aria-label="后一天" :disabled="!canShiftNext" @click="shiftDate(-1)">
        <LiveIcon name="chevron-right" :size="18" />
      </button>
    </section>

    <!-- 时间轴 -->
    <section class="pb-band">
      <div ref="timelineScroll" class="pb-tl-scroll">
        <div class="pb-tl" :style="{ width: `${timelineWidth}px` }">
          <div class="pb-tl-hours">
            <span
              v-for="label in hourLabels"
              :key="label.minute"
              :class="{ hour: label.hour }"
              :style="{ left: `${(label.minute / 1440) * 100}%` }"
            >
              {{ label.text }}
            </span>
          </div>

          <div class="pb-tl-track" @click="seekByClick">
            <span
              v-for="segment in visibleSegments"
              :key="segment.id"
              class="pb-tl-seg"
              :style="{
                left: `${(segment.start / 1440) * 100}%`,
                width: `${((segment.end - segment.start) / 1440) * 100}%`,
                background: typeMeta[segment.type].color
              }"
            ></span>

            <span
              v-if="currentSegment"
              class="pb-playhead"
              :style="{ left: `${(playheadMinute / 1440) * 100}%` }"
            ></span>
          </div>
        </div>
      </div>

      <div class="pb-tl-nav">
        <button type="button" class="pb-tl-jump" aria-label="上一段录像" @click="jumpSegment(-1)">
          <LiveIcon name="skip-prev" :size="20" />
        </button>
        <span class="pb-tl-ticks"></span>
        <button type="button" class="pb-tl-jump" aria-label="下一段录像" @click="jumpSegment(1)">
          <LiveIcon name="skip-next" :size="20" />
        </button>
      </div>
    </section>

    <!-- 事件类型显示开关 -->
    <section class="pb-types">
      <button
        v-for="pill in typePills"
        :key="pill.value"
        type="button"
        class="pb-type"
        :class="{ off: !isTypeVisible(pill.value) }"
        :style="{ '--pill-color': pill.color }"
        :aria-pressed="isTypeVisible(pill.value)"
        @click="toggleType(pill.value)"
      >
        <LiveIcon :name="pill.icon" :size="15" />
        <span>{{ pill.label }}</span>
      </button>
    </section>

    <!-- 全部回看录像 -->
    <section class="pb-footer bottom-tabs">
      <button type="button" class="pb-all-btn" @click="openRecordings">
        全部回看录像
      </button>
    </section>

    <!-- 日历选择 -->
    <transition name="pb-sheet">
      <div v-if="showCalendar" class="pb-sheet-layer" @click.self="showCalendar = false">
        <div class="pb-calendar-panel">
          <div class="pb-sheet-head">
            <h3>选择日期</h3>
            <button type="button" class="pb-sheet-close" aria-label="关闭" @click="showCalendar = false">
              <t-icon name="close" size="18px" />
            </button>
          </div>

          <div class="pb-calendar-scroll">
            <div v-for="month in calendarMonths" :key="month.key" class="pb-calendar-month">
              <h4>{{ month.title }}</h4>
              <div class="pb-calendar-weeks">
                <span v-for="week in calendarWeeks" :key="week">{{ week }}</span>
              </div>
              <div class="pb-calendar-grid">
                <button
                  v-for="(cell, index) in month.cells"
                  :key="cell.key || `blank-${month.key}-${index}`"
                  type="button"
                  class="pb-cal-day"
                  :class="{ blank: cell.blank, active: cell.key === selectedDate, record: cell.hasRecord }"
                  :disabled="cell.blank || cell.disabled"
                  @click="pickCalendarDate(cell)"
                >
                  <span v-if="!cell.blank">{{ cell.label }}</span>
                  <i v-if="cell.hasRecord"></i>
                </button>
              </div>
            </div>
          </div>

          <p class="pb-calendar-tip">仅有录像的日期可回放</p>
        </div>
      </div>
    </transition>

    <!-- 全部回看录像 -->
    <transition name="pb-sheet">
      <div v-if="showRecordings" class="pb-sheet-layer" @click.self="showRecordings = false">
        <div class="pb-record-panel">
          <div class="pb-sheet-head">
            <h3>全部回看录像</h3>
            <button type="button" class="pb-sheet-close" aria-label="关闭" @click="showRecordings = false">
              <t-icon name="close" size="18px" />
            </button>
          </div>

          <p class="pb-record-hint">选择需要下载的录像，支持多选</p>

          <div class="pb-record-scroll">
            <div v-for="group in recordingGroups" :key="group.key" class="pb-record-group">
              <div class="pb-record-group-head">
                <strong>{{ group.title }}</strong>
                <button type="button" @click="toggleGroup(group)">
                  {{ isGroupSelected(group) ? '取消全选' : '全选' }}
                </button>
              </div>

              <div
                v-for="segment in group.segments"
                :key="segment.id"
                class="pb-record-row"
                :class="{ active: selectedIds.includes(segment.id) }"
                @click="toggleRecord(segment)"
              >
                <i class="pb-record-dot" :style="{ background: typeMeta[segment.type].color }"></i>
                <div class="pb-record-copy">
                  <strong>{{ typeLabel(segment.type) }}</strong>
                  <span>{{ formatMinute(segment.start) }} - {{ formatMinute(segment.end) }} · {{ segment.end - segment.start }} 分钟</span>
                </div>
                <span class="pb-record-check">
                  <LiveIcon v-if="selectedIds.includes(segment.id)" name="check" :size="14" />
                </span>
              </div>
            </div>
          </div>

          <div class="pb-record-foot">
            <span>已选 {{ selectedRecords.length }} 段 · {{ formatSize(selectedMinutes) }}</span>
            <button
              type="button"
              class="pb-record-submit"
              :disabled="!selectedRecords.length"
              @click="downloadSelected"
            >
              下载
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 下载录像 -->
    <transition name="pb-sheet">
      <div v-if="showDownload" class="pb-sheet-layer" @click.self="closeDownload">
        <div class="pb-dl-panel">
          <div class="pb-sheet-head">
            <h3>下载录像</h3>
            <button type="button" class="pb-sheet-close" aria-label="关闭" @click="closeDownload">
              <t-icon name="close" size="18px" />
            </button>
          </div>

          <template v-if="downloadStatus === 'idle'">
            <div class="pb-dl-preview">
              <img :src="frameImage" alt="" />
              <div class="pb-dl-preview-mask"></div>
              <span class="pb-dl-preview-name">{{ deviceName }}</span>
              <span class="pb-dl-preview-tag">{{ dateTitle }}</span>
            </div>

            <div class="pb-dl-options">
              <button
                v-for="option in downloadOptions"
                :key="option.value"
                type="button"
                class="pb-dl-option"
                :class="{ active: downloadScope === option.value }"
                :disabled="option.disabled"
                @click="downloadScope = option.value"
              >
                <div class="pb-dl-option-copy">
                  <strong>{{ option.label }}</strong>
                  <span>{{ option.desc }}</span>
                </div>
                <span class="pb-dl-option-size">{{ option.size }}</span>
                <i class="pb-dl-radio"></i>
              </button>
            </div>

            <p class="pb-dl-note">下载完成后自动保存到手机相册「鹤梦之家」</p>
            <button type="button" class="pb-dl-start" @click="startDownload">开始下载</button>
          </template>

          <template v-else-if="downloadStatus === 'downloading'">
            <div class="pb-dl-progress">
              <div class="pb-dl-progress-head">
                <strong>{{ downloadProgress }}%</strong>
                <span>{{ downloadSpeed }}</span>
              </div>
              <div class="pb-dl-progress-bar">
                <span :style="{ width: `${downloadProgress}%` }"></span>
              </div>
              <p>{{ downloadName }} · {{ downloadSize }}</p>
            </div>
            <button type="button" class="pb-dl-start pb-dl-start--ghost" @click="cancelDownload">取消下载</button>
          </template>

          <template v-else>
            <div class="pb-dl-done">
              <span class="pb-dl-done-icon">
                <LiveIcon name="check" :size="24" />
              </span>
              <strong>已保存到手机相册</strong>
              <p>{{ downloadName }}</p>
              <p>{{ downloadSize }} · 相册 / 鹤梦之家 / 录像</p>
            </div>
            <button type="button" class="pb-dl-start" @click="closeDownload">完成</button>
          </template>
        </div>
      </div>
    </transition>

    <!-- 全屏播放 -->
    <transition name="pb-sheet">
      <div v-if="isFullscreen" class="pb-fs" :style="fsSize">
        <img class="pb-fs-frame" :src="frameImage" alt="" />
        <div class="pb-fs-mask"></div>

        <div class="pb-fs-head">
          <div class="pb-fs-title">
            <span>{{ deviceName }}</span>
            <em>{{ dateTitle }} · {{ activeMode === 'cloud' ? '云录像' : '卡录像' }}</em>
          </div>
          <button type="button" class="pb-fs-exit" aria-label="退出全屏" @click="toggleFullscreen">
            <LiveIcon name="close" :size="20" />
          </button>
        </div>

        <button
          v-if="currentSegment"
          type="button"
          class="pb-fs-toggle"
          :aria-label="isPlaying ? '暂停' : '播放'"
          @click="togglePlay"
        >
          <t-icon :name="isPlaying ? 'pause-circle-filled' : 'play-circle-filled'" size="56px" />
        </button>

        <div class="pb-fs-foot">
          <div class="pb-fs-line">
            <span>{{ currentTimeText }}</span>
            <div class="pb-fs-progress">
              <span :style="{ width: `${playProgress}%` }"></span>
            </div>
            <span>{{ endTimeText }}</span>
          </div>
          <div class="pb-fs-actions">
            <button type="button" @click="cycleRate">
              <span class="pb-fs-action-label">倍速</span>{{ playbackRate }}x
            </button>
            <button type="button" @click="openDownload">
              <LiveIcon name="download" :size="17" />
              <span class="pb-fs-action-label">下载</span>
            </button>
            <button type="button" @click="toggleFullscreen">
              <LiveIcon name="expand" :size="17" />
              <span class="pb-fs-action-label">退出全屏</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'tdesign-mobile-vue'
import { buildImageUrl } from '../../utils/media'
import LiveIcon from '../../components/LiveIcon.vue'

const route = useRoute()
const router = useRouter()

const deviceId = computed(() => route.params.id)

const deviceNames = {
  1: '摄像头-车间1入口',
  2: '摄像头-车间1出口',
  3: '摄像头-车间2入口',
  4: '摄像头-厂区大门',
  5: '摄像头-办公区域',
  6: '摄像头-停车场',
  7: '摄像头-厂区大门',
  8: '摄像头-生产车间'
}

const frameScenes = {
  1: 'a bright factory workshop entrance with metal storage racks and stacked white boxes',
  2: 'a factory workshop exit corridor with industrial equipment',
  3: 'a modern factory production line with machines and overhead lights',
  4: 'a factory gate checkpoint with a security booth and barriers',
  5: 'an office reception area with a front desk and warm lighting',
  6: 'an empty underground parking garage with white pillars and bright ceiling lights',
  7: 'a factory gate checkpoint with a security booth and barriers',
  8: 'a modern production workshop with assembly lines and workers in vests'
}

const deviceName = computed(() => deviceNames[deviceId.value] || '未知设备')

const frameImage = buildImageUrl(
  `realistic CCTV surveillance still of ${frameScenes[deviceId.value] || frameScenes[1]}, wide angle, slightly grainy security camera footage`
)

const modes = [
  { label: '云录像', value: 'cloud' },
  { label: '卡录像', value: 'card' }
]

const typeMeta = {
  continuous: { label: '定时录像', color: '#8c96a5', icon: 'clock' },
  motion: { label: '移动侦测', color: '#f0b429', icon: 'walk' },
  alarm: { label: '告警事件', color: '#ef6a5f', icon: 'bell' }
}

// 定时录像常驻展示，不提供开关；胶囊只控制事件类型
const eventTypes = ['motion', 'alarm']

const typePills = eventTypes.map(key => ({
  value: key,
  label: typeMeta[key].label,
  color: typeMeta[key].color,
  icon: typeMeta[key].icon
}))

const activeMode = ref('cloud')
const visibleTypes = ref([...eventTypes])
const currentSegment = ref(null)
const isPlaying = ref(false)
const playProgress = ref(0)
const playbackRate = ref(1)
const playbackRates = [1, 2, 4]
const showCalendar = ref(false)
const isFullscreen = ref(false)
const fsSize = ref({})
let playTimer = null

const pad = (value) => String(value).padStart(2, '0')

const formatMinute = (minutes) => {
  const total = Math.max(0, Math.min(1440, Math.round(minutes)))
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`
}

const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const buildDates = (count) => {
  const list = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < count; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    list.push({
      key: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      week: i === 0 ? '今天' : i === 1 ? '昨天' : weekLabels[date.getDay()],
      day: `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
    })
  }

  return list
}

const cloudDates = buildDates(7)
const cardDates = buildDates(14)

const dates = computed(() => (activeMode.value === 'cloud' ? cloudDates : cardDates))
const selectedDate = ref(cloudDates[0].key)

const dateIndex = computed(() => dates.value.findIndex(item => item.key === selectedDate.value))
const canShiftPrev = computed(() => dateIndex.value >= 0 && dateIndex.value < dates.value.length - 1)
const canShiftNext = computed(() => dateIndex.value > 0)

const dateTitle = computed(() => {
  const date = dates.value.find(item => item.key === selectedDate.value)
  if (!date) return ''
  if (date.week === '今天' || date.week === '昨天') return date.week
  const [, month, day] = date.key.split('-')
  return `${Number(month)}月${Number(day)}日`
})

const calendarWeeks = ['日', '一', '二', '三', '四', '五', '六']

const calendarMonths = computed(() => {
  const allowed = new Set(dates.value.map(date => date.key))
  const months = []
  const seen = new Set()

  dates.value.forEach((date) => {
    const [year, month] = date.key.split('-').map(Number)
    const monthKey = `${year}-${month}`
    if (seen.has(monthKey)) return
    seen.add(monthKey)

    const firstDay = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const cells = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      cells.push({ blank: true })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${pad(month)}-${pad(day)}`
      cells.push({
        key,
        label: day,
        hasRecord: allowed.has(key),
        disabled: !allowed.has(key)
      })
    }

    months.push({
      key: monthKey,
      title: `${year}年${month}月`,
      cells
    })
  })

  return months
})

const pickCalendarDate = (cell) => {
  if (!cell.key || cell.disabled) return
  selectedDate.value = cell.key
  showCalendar.value = false
  pickFirstSegment()
}

const dateShift = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return ((year + month * 3 + day * 7) % 17) % 8
}

const baseSegments = {
  cloud: [
    { start: 360, duration: 150, type: 'continuous' },
    { start: 549, duration: 9, type: 'motion' },
    { start: 600, duration: 120, type: 'continuous' },
    { start: 860, duration: 6, type: 'alarm' },
    { start: 900, duration: 150, type: 'continuous' },
    { start: 1140, duration: 120, type: 'continuous' }
  ],
  card: [
    { start: 0, duration: 150, type: 'continuous' },
    { start: 170, duration: 140, type: 'continuous' },
    { start: 330, duration: 145, type: 'continuous' },
    { start: 490, duration: 130, type: 'continuous' },
    { start: 620, duration: 10, type: 'motion' },
    { start: 640, duration: 160, type: 'continuous' },
    { start: 820, duration: 120, type: 'continuous' },
    { start: 960, duration: 12, type: 'alarm' },
    { start: 980, duration: 170, type: 'continuous' },
    { start: 1160, duration: 140, type: 'continuous' }
  ]
}

const buildSegments = (mode, dateKey) => {
  const shift = dateShift(dateKey)

  return baseSegments[mode]
    .map((item, index) => {
      const start = Math.min(1390, item.start + shift)
      return {
        id: `${mode}-${dateKey}-${index}`,
        dateKey,
        start,
        end: Math.min(1440, start + item.duration),
        type: item.type
      }
    })
    .sort((a, b) => a.start - b.start)
}

const segments = computed(() => buildSegments(activeMode.value, selectedDate.value))

const typeLabel = (type) => typeMeta[type]?.label || ''

const isTypeVisible = (type) =>
  type === 'continuous' || visibleTypes.value.includes(type)

const visibleSegments = computed(() => segments.value.filter(segment => isTypeVisible(segment.type)))

const toggleType = (type) => {
  visibleTypes.value = isTypeVisible(type)
    ? visibleTypes.value.filter(item => item !== type)
    : [...visibleTypes.value, type]
}

const playheadMinute = computed(() => {
  if (!currentSegment.value) return 0
  const duration = currentSegment.value.end - currentSegment.value.start
  return currentSegment.value.start + (playProgress.value / 100) * duration
})

const currentTimeText = computed(() => formatMinute(playheadMinute.value))

const endTimeText = computed(() =>
  currentSegment.value ? formatMinute(currentSegment.value.end) : '00:00'
)

const hourWidth = 110
const timelineWidth = 24 * hourWidth
const timelineScroll = ref(null)

const hourLabels = computed(() => {
  const list = []
  for (let minute = 0; minute < 1440; minute += 30) {
    list.push({ minute, text: formatMinute(minute), hour: minute % 60 === 0 })
  }
  return list
})

const scrollTimelineTo = (minute) => {
  nextTick(() => {
    const host = timelineScroll.value
    if (!host) return
    const target = (minute / 1440) * timelineWidth - host.clientWidth * 0.38
    host.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  })
}

const pickFirstSegment = () => {
  const target = visibleSegments.value[0] || null
  currentSegment.value = target
  isPlaying.value = false
  playProgress.value = 0
  stopPlayback()
  if (target) scrollTimelineTo(target.start)
}

const shiftDate = (step) => {
  const list = dates.value
  const index = dateIndex.value
  if (index < 0) return
  const next = list[index + step]
  if (!next) return
  selectedDate.value = next.key
  pickFirstSegment()
}

const switchMode = (mode) => {
  if (activeMode.value === mode) return
  activeMode.value = mode
  selectedDate.value = mode === 'cloud' ? cloudDates[0].key : cardDates[0].key
  pickFirstSegment()
}

const jumpSegment = (direction) => {
  const list = visibleSegments.value
  if (!list.length) return

  let index = 0
  if (currentSegment.value) {
    const currentIndex = list.findIndex(segment => segment.id === currentSegment.value.id)
    index = currentIndex < 0 ? 0 : currentIndex + direction
  }
  index = Math.min(list.length - 1, Math.max(0, index))

  const target = list[index]
  currentSegment.value = target
  playProgress.value = 0
  isPlaying.value = true
  startPlayback()
  scrollTimelineTo(target.start)
}

const seekByClick = (event) => {
  const track = event.currentTarget
  const rect = track.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const minute = ratio * 1440
  const target = visibleSegments.value.find(segment => minute >= segment.start && minute <= segment.end)

  if (!target) {
    Toast('该时段无录像')
    return
  }

  currentSegment.value = target
  playProgress.value = ((minute - target.start) / (target.end - target.start)) * 100
  isPlaying.value = false
  stopPlayback()
  scrollTimelineTo(minute)
}

const cycleRate = () => {
  const index = playbackRates.indexOf(playbackRate.value)
  playbackRate.value = playbackRates[(index + 1) % playbackRates.length]
  Toast(`${playbackRate.value}倍速播放`)
}

const startPlayback = () => {
  stopPlayback()
  playTimer = setInterval(() => {
    playProgress.value = Math.min(100, playProgress.value + 0.6 * playbackRate.value)
    if (playProgress.value >= 100) {
      isPlaying.value = false
      stopPlayback()
    }
  }, 120)
}

const stopPlayback = () => {
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

const togglePlay = () => {
  if (!currentSegment.value) return

  if (isPlaying.value) {
    isPlaying.value = false
    stopPlayback()
    return
  }

  if (playProgress.value >= 100) {
    playProgress.value = 0
  }
  isPlaying.value = true
  startPlayback()
}

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    const host = document.querySelector('.phone-screen') || document.querySelector('.app-canvas')
    const width = host?.clientWidth || window.innerWidth
    const height = host?.clientHeight || window.innerHeight
    // 旋转 90° 展示横屏画面：宽高互换
    fsSize.value = { width: `${height}px`, height: `${width}px` }
  }
  isFullscreen.value = !isFullscreen.value
}

/* 下载录像 */
const showDownload = ref(false)
const downloadStatus = ref('idle')
const downloadProgress = ref(0)
const downloadScope = ref('segment')
const downloadSpeed = '2.4 MB/s'
let downloadTimer = null
let downloadDoneTimer = null

const formatSize = (minutes) => {
  const megaBytes = Math.round(minutes * 12)
  return megaBytes >= 1024 ? `${(megaBytes / 1024).toFixed(1)} GB` : `${Math.max(1, megaBytes)} MB`
}

const segmentMinutes = computed(() =>
  currentSegment.value ? currentSegment.value.end - currentSegment.value.start : 0
)

const dayMinutes = computed(() =>
  segments.value.reduce((total, segment) => total + (segment.end - segment.start), 0)
)

/* 全部回看录像 */
const showRecordings = ref(false)
const selectedIds = ref([])

const recordingGroups = computed(() =>
  dates.value.map(date => ({
    key: date.key,
    title: `${date.week} ${date.day}`,
    segments: buildSegments(activeMode.value, date.key)
  }))
)

const selectedRecords = computed(() => {
  const all = recordingGroups.value.flatMap(group => group.segments)
  return all.filter(segment => selectedIds.value.includes(segment.id))
})

const selectedMinutes = computed(() =>
  selectedRecords.value.reduce((total, segment) => total + (segment.end - segment.start), 0)
)

const openRecordings = () => {
  selectedIds.value = []
  showRecordings.value = true
}

const toggleRecord = (segment) => {
  selectedIds.value = selectedIds.value.includes(segment.id)
    ? selectedIds.value.filter(id => id !== segment.id)
    : [...selectedIds.value, segment.id]
}

const isGroupSelected = (group) =>
  group.segments.length > 0 && group.segments.every(segment => selectedIds.value.includes(segment.id))

const toggleGroup = (group) => {
  const ids = group.segments.map(segment => segment.id)
  if (isGroupSelected(group)) {
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
    return
  }
  selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
}

const downloadMinutes = computed(() => {
  if (downloadScope.value === 'selection') return selectedMinutes.value
  return downloadScope.value === 'day' ? dayMinutes.value : segmentMinutes.value
})

const downloadSize = computed(() => formatSize(downloadMinutes.value))

const downloadOptions = computed(() => [
  {
    value: 'segment',
    label: '当前片段',
    desc: currentSegment.value
      ? `${formatMinute(currentSegment.value.start)} - ${formatMinute(currentSegment.value.end)}`
      : '请先在时间轴上选择录像',
    size: formatSize(segmentMinutes.value),
    disabled: !currentSegment.value
  },
  {
    value: 'day',
    label: '当天全部录像',
    desc: `${dateTitle.value} · 共 ${segments.value.length} 段`,
    size: formatSize(dayMinutes.value),
    disabled: false
  }
])

const downloadName = computed(() => {
  if (downloadScope.value === 'selection') {
    const keys = [...new Set(selectedRecords.value.map(segment => segment.dateKey))].sort()
    const range = keys.length === 1 ? keys[0] : `${keys[0]}_${keys[keys.length - 1]}`
    return `鹤梦之家_${range}_${selectedRecords.value.length}段.mp4`
  }
  if (!currentSegment.value) return ''
  if (downloadScope.value === 'day') {
    return `鹤梦之家_${selectedDate.value}_全天录像.mp4`
  }
  const start = formatMinute(currentSegment.value.start).replace(':', '')
  const end = formatMinute(currentSegment.value.end).replace(':', '')
  return `鹤梦之家_${selectedDate.value}_${start}-${end}.mp4`
})

const openDownload = () => {
  downloadStatus.value = 'idle'
  downloadProgress.value = 0
  downloadScope.value = currentSegment.value ? 'segment' : 'day'
  showDownload.value = true
}

const closeDownload = () => {
  if (downloadStatus.value === 'downloading') {
    stopDownload()
  }
  showDownload.value = false
  downloadStatus.value = 'idle'
  downloadProgress.value = 0
}

const stopDownload = () => {
  if (downloadTimer) {
    clearInterval(downloadTimer)
    downloadTimer = null
  }
  if (downloadDoneTimer) {
    clearTimeout(downloadDoneTimer)
    downloadDoneTimer = null
  }
}

const runDownload = () => {
  downloadStatus.value = 'downloading'
  downloadProgress.value = 0

  downloadTimer = setInterval(() => {
    downloadProgress.value = Math.min(100, downloadProgress.value + 4)
    if (downloadProgress.value >= 100) {
      stopDownload()
      downloadDoneTimer = setTimeout(finishDownload, 800)
    }
  }, 110)
}

const startDownload = () => {
  if (!downloadMinutes.value) {
    Toast('请先选择需要下载的录像')
    return
  }
  runDownload()
}

const downloadSelected = () => {
  if (!selectedRecords.value.length) {
    Toast('请选择需要下载的录像')
    return
  }
  downloadScope.value = 'selection'
  showRecordings.value = false
  showDownload.value = true
  runDownload()
}

const finishDownload = () => {
  downloadDoneTimer = null
  downloadStatus.value = 'done'
  Toast.success('录像已保存到手机相册')
}

const cancelDownload = () => {
  closeDownload()
}

const goBack = () => {
  router.back()
}

pickFirstSegment()

onMounted(() => {
  if (currentSegment.value) {
    scrollTimelineTo(currentSegment.value.start)
  }
})

onUnmounted(() => {
  stopPlayback()
  stopDownload()
})
</script>

<style scoped>
.pb-page {
  min-height: 100%;
  background:
    radial-gradient(120% 36% at 100% 0%, rgba(214, 228, 255, 0.5) 0%, rgba(214, 228, 255, 0) 62%),
    linear-gradient(180deg, #f5f7fb 0%, #f2f5fa 100%);
  padding-bottom: calc(94px + var(--prototype-safe-bottom));
}

.pb-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
  align-items: center;
  height: calc(var(--prototype-navbar-height) + 8px);
  padding-top: var(--prototype-safe-top);
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(238, 240, 244, 0.9);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.pb-back {
  width: 48px;
  height: 100%;
  border: 0;
  background: transparent;
  color: #17181d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pb-back:active {
  opacity: 0.55;
}

.pb-nav-modes {
  justify-self: center;
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 10px;
  background: #f1f3f8;
}

.pb-nav-mode {
  height: 28px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #6f7686;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
}

.pb-nav-mode.active {
  background: #ffffff;
  color: #2a5bff;
  box-shadow: 0 4px 10px rgba(64, 89, 240, 0.14);
}

/* 回放画面 */
.pb-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #10151d;
}

.pb-stage-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pb-stage-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 11, 19, 0.52) 0%, rgba(6, 11, 19, 0.06) 38%, rgba(6, 11, 19, 0.62) 100%);
}

.pb-stage-top {
  position: absolute;
  top: 12px;
  left: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #ffffff;
  font-size: 12.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.pb-stage-title {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pb-stage-tools {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.pb-tool {
  height: 26px;
  min-width: 26px;
  padding: 0 5px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 8px;
  background: rgba(9, 17, 30, 0.34);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.pb-tool--rate {
  padding: 0 8px;
  font-variant-numeric: tabular-nums;
}

.pb-tool:active {
  opacity: 0.7;
}

.pb-stage-toggle {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 64px;
  height: 64px;
  border: 0;
  border-radius: 50%;
  background: rgba(8, 14, 24, 0.3);
  color: rgba(255, 255, 255, 0.94);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.pb-stage-toggle:active {
  transform: scale(0.95);
}

.pb-stage-bottom {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.pb-stage-line {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pb-stage-clock {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
}

.pb-stage-progress {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  overflow: hidden;
}

.pb-stage-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #ffffff;
  transition: width 0.12s linear;
}

.pb-stage-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
}

/* 日期切换 */
.pb-daybar {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 46px;
  align-items: center;
  padding: 12px 12px 8px;
  background: #ffffff;
}

.pb-day-arrow {
  width: 30px;
  height: 30px;
  justify-self: center;
  border: 0;
  border-radius: 50%;
  background: #f2f4f8;
  color: #4b5058;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pb-day-arrow:active {
  background: #e8ecf3;
}

.pb-day-arrow:disabled {
  opacity: 0.32;
}

.pb-day-title {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-family: inherit;
  color: #17181d;
}

.pb-day-title strong {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.01em;
}

.pb-day-title span {
  font-size: 11px;
  color: #9aa3b2;
  font-variant-numeric: tabular-nums;
}

.pb-day-title:active {
  opacity: 0.65;
}

/* 时间轴 */
.pb-band {
  padding: 4px 0 6px;
  background: #f6f7f9;
  border-top: 1px solid #f0f1f4;
  border-bottom: 1px solid #f0f1f4;
}

.pb-tl-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 20px;
  scrollbar-width: none;
  mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%);
}

.pb-tl-scroll::-webkit-scrollbar {
  display: none;
}

.pb-tl {
  position: relative;
  padding: 16px 0 8px;
}

.pb-tl-hours {
  position: relative;
  height: 16px;
}

.pb-tl-hours span {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 9.5px;
  color: #bcc2cc;
  font-variant-numeric: tabular-nums;
}

.pb-tl-hours span.hour {
  color: #7c8391;
  font-weight: 600;
}

.pb-tl-track {
  position: relative;
  height: 12px;
  margin-top: 8px;
  border-radius: 999px;
  background: #e2e6ec;
  cursor: crosshair;
  touch-action: pan-x;
}

.pb-tl-seg {
  position: absolute;
  top: 0;
  height: 100%;
  min-width: 3px;
  border-radius: 999px;
  pointer-events: none;
  transition: background 0.2s ease;
}

.pb-playhead {
  position: absolute;
  top: -10px;
  height: 32px;
  width: 2px;
  margin-left: -1px;
  border-radius: 2px;
  background: #1f2329;
  z-index: 3;
  pointer-events: none;
}

.pb-playhead::before {
  content: '';
  position: absolute;
  top: -3px;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1f2329;
  transform: translateX(-50%);
}

.pb-tl-nav {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 46px;
  align-items: center;
  padding: 6px 10px 0;
}

.pb-tl-jump {
  width: 36px;
  height: 30px;
  justify-self: center;
  border: 0;
  background: transparent;
  color: #a9b0bc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pb-tl-jump:active {
  color: #2a5bff;
}

.pb-tl-ticks {
  height: 8px;
  background-image: radial-gradient(circle, #d5dae2 1px, transparent 1.2px);
  background-size: 55px 8px;
  background-position: 0 center;
  background-repeat: repeat-x;
}

/* 事件类型 */
.pb-types {
  display: flex;
  gap: 8px;
  padding: 14px 16px 12px;
  background: #ffffff;
  overflow-x: auto;
  scrollbar-width: none;
}

.pb-types::-webkit-scrollbar {
  display: none;
}

.pb-type {
  flex: 1 0 auto;
  min-width: 108px;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: var(--pill-color);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 8px 16px rgba(31, 35, 41, 0.12);
  transition: opacity 0.2s ease, transform 0.16s ease, box-shadow 0.2s ease;
}

.pb-type span {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pb-type.off {
  background: #f1f3f7;
  color: #a9b0bc;
  box-shadow: none;
}

.pb-type:active {
  transform: scale(0.97);
}

/* 全部回看录像入口 */
.pb-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 25;
  padding: 8px 16px calc(14px + var(--prototype-safe-bottom));
  background: transparent;
}

.pb-all-btn {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f5ff2 0%, #3348e6 100%);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(64, 89, 240, 0.26);
  transition: transform 0.16s ease, box-shadow 0.2s ease;
}

.pb-all-btn:hover {
  box-shadow: 0 12px 26px rgba(64, 89, 240, 0.3);
}

.pb-all-btn:active {
  transform: scale(0.985);
  box-shadow: 0 8px 18px rgba(64, 89, 240, 0.22);
}

/* 全部回看录像弹层 */
.pb-record-panel {
  width: 100%;
  max-height: 82%;
  display: flex;
  flex-direction: column;
  padding-bottom: var(--prototype-safe-bottom);
  border-radius: 22px 22px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(16, 24, 40, 0.16);
}

.pb-record-hint {
  margin: 0 18px 10px;
  font-size: 11px;
  color: #9aa3b2;
}

.pb-record-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px;
  -webkit-overflow-scrolling: touch;
}

.pb-record-group + .pb-record-group {
  margin-top: 6px;
}

.pb-record-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 2px 8px;
}

.pb-record-group-head strong {
  font-size: 13px;
  font-weight: 600;
  color: #3d4453;
}

.pb-record-group-head button {
  border: 0;
  background: transparent;
  color: #4059f0;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
}

.pb-record-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 11px;
  border-radius: 12px;
  background: #f8f9fc;
  cursor: pointer;
}

.pb-record-row + .pb-record-row {
  margin-top: 6px;
}

.pb-record-row.active {
  background: #eef1ff;
  box-shadow: inset 0 0 0 1px rgba(64, 89, 240, 0.24);
}

.pb-record-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
}

.pb-record-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 3px;
}

.pb-record-copy strong {
  font-size: 12.5px;
  font-weight: 600;
  color: #1c1d22;
}

.pb-record-copy span {
  font-size: 10.5px;
  color: #9aa3b2;
  font-variant-numeric: tabular-nums;
}

.pb-record-check {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border: 1.5px solid #d3d8e1;
  border-radius: 50%;
  background: #ffffff;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pb-record-row.active .pb-record-check {
  border-color: #4059f0;
  background: #4059f0;
}

.pb-record-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px 6px;
  border-top: 1px solid #f0f1f4;
}

.pb-record-foot span {
  font-size: 11px;
  color: #6f7686;
  font-variant-numeric: tabular-nums;
}

.pb-record-submit {
  height: 40px;
  min-width: 108px;
  padding: 0 22px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #5b6cfb 0%, #3f57ee 100%);
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(64, 89, 240, 0.22);
}

.pb-record-submit:disabled {
  background: #e9ecf3;
  color: #a9b0bc;
  box-shadow: none;
}

/* 底部弹层（日历 / 下载） */
.pb-sheet-layer {
  position: absolute;
  inset: 0;
  z-index: 1900;
  display: flex;
  align-items: flex-end;
  background: rgba(10, 16, 28, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.pb-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 18px 6px;
}

.pb-sheet-head h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #17181d;
}

.pb-sheet-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #f3f5f9;
  color: #8a93a3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 日历选择 */
.pb-calendar-panel {
  width: 100%;
  max-height: 78%;
  display: flex;
  flex-direction: column;
  padding-bottom: var(--prototype-safe-bottom);
  border-radius: 22px 22px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(16, 24, 40, 0.16);
}

.pb-calendar-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 2px 16px 0;
  -webkit-overflow-scrolling: touch;
}

.pb-calendar-month h4 {
  margin: 10px 2px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #5c6474;
}

.pb-calendar-weeks {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin-bottom: 6px;
}

.pb-calendar-weeks span {
  text-align: center;
  font-size: 10.5px;
  color: #a2a9b6;
}

.pb-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 12px;
}

.pb-cal-day {
  position: relative;
  height: 38px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #3d4453;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pb-cal-day.blank {
  visibility: hidden;
}

.pb-cal-day:disabled {
  color: #c8cdd6;
  font-weight: 500;
}

.pb-cal-day.record {
  background: #f1f7f3;
  color: #188a4c;
}

.pb-cal-day.active {
  background: linear-gradient(135deg, #5b6cfb 0%, #3f57ee 100%);
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(64, 89, 240, 0.2);
}

.pb-cal-day i {
  position: absolute;
  bottom: 5px;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #22c55e;
  transform: translateX(-50%);
}

.pb-cal-day.active i {
  background: #ffffff;
}

.pb-calendar-tip {
  margin: 4px 18px 12px;
  font-size: 10.5px;
  color: #a2a9b6;
  text-align: center;
}

/* 下载弹层 */
.pb-dl-panel {
  width: 100%;
  max-height: 88%;
  overflow-y: auto;
  padding-bottom: calc(18px + var(--prototype-safe-bottom));
  border-radius: 22px 22px 0 0;
  background: #ffffff;
  box-shadow: 0 -18px 40px rgba(16, 24, 40, 0.16);
}

.pb-dl-preview {
  position: relative;
  margin: 8px 18px 0;
  height: 96px;
  border-radius: 14px;
  overflow: hidden;
  background: #10151d;
}

.pb-dl-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pb-dl-preview-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 11, 19, 0.1) 0%, rgba(6, 11, 19, 0.62) 100%);
}

.pb-dl-preview-name {
  position: absolute;
  left: 12px;
  bottom: 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.pb-dl-preview-tag {
  position: absolute;
  right: 12px;
  top: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(42, 91, 255, 0.86);
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 600;
}

.pb-dl-options {
  display: grid;
  gap: 8px;
  margin: 14px 18px 0;
}

.pb-dl-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 13px;
  border: 1px solid #eef1f6;
  border-radius: 14px;
  background: #f8f9fc;
  text-align: left;
  font-family: inherit;
}

.pb-dl-option.active {
  border-color: rgba(64, 89, 240, 0.4);
  background: #eef1ff;
}

.pb-dl-option:disabled {
  opacity: 0.5;
}

.pb-dl-option-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.pb-dl-option-copy strong {
  font-size: 13px;
  font-weight: 600;
  color: #1c1d22;
}

.pb-dl-option-copy span {
  font-size: 11px;
  color: #9aa3b2;
}

.pb-dl-option-size {
  flex: 0 0 auto;
  font-size: 11px;
  color: #6f7686;
  font-variant-numeric: tabular-nums;
}

.pb-dl-radio {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  border-radius: 50%;
  border: 1.5px solid #d3d8e1;
  background: #ffffff;
}

.pb-dl-option.active .pb-dl-radio {
  border-color: #4059f0;
  background: radial-gradient(circle, #4059f0 0 4px, #ffffff 4.5px);
}

.pb-dl-note {
  margin: 12px 18px 0;
  font-size: 10.5px;
  color: #a2a9b6;
  text-align: center;
}

.pb-dl-start {
  display: block;
  width: calc(100% - 36px);
  height: 46px;
  margin: 14px 18px 0;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #5b6cfb 0%, #3f57ee 100%);
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(64, 89, 240, 0.24);
}

.pb-dl-start:active {
  transform: scale(0.99);
}

.pb-dl-start--ghost {
  background: #f3f5f9;
  color: #6f7686;
  box-shadow: none;
}

.pb-dl-progress {
  margin: 18px 18px 0;
  padding: 16px;
  border-radius: 16px;
  background: #f8f9fc;
}

.pb-dl-progress-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.pb-dl-progress-head strong {
  font-size: 24px;
  font-weight: 700;
  color: #2a5bff;
  font-variant-numeric: tabular-nums;
}

.pb-dl-progress-head span {
  font-size: 11px;
  color: #9aa3b2;
}

.pb-dl-progress-bar {
  height: 6px;
  margin-top: 10px;
  border-radius: 999px;
  background: #e4e8f0;
  overflow: hidden;
}

.pb-dl-progress-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #5b6cfb 0%, #3f57ee 100%);
  transition: width 0.1s linear;
}

.pb-dl-progress p {
  margin: 10px 0 0;
  font-size: 10.5px;
  color: #9aa3b2;
  word-break: break-all;
}

.pb-dl-done {
  margin: 18px 18px 0;
  padding: 22px 16px;
  border-radius: 16px;
  background: #f3faf6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.pb-dl-done-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 4px;
  border-radius: 50%;
  background: #22a06b;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pb-dl-done strong {
  font-size: 15px;
  font-weight: 700;
  color: #146b45;
}

.pb-dl-done p {
  margin: 0;
  font-size: 10.5px;
  color: #7c9a8c;
  word-break: break-all;
}

/* 全屏播放 */
.pb-fs {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1800;
  transform: rotate(90deg) translateY(-100%);
  transform-origin: top left;
  overflow: hidden;
  background: #060b13;
}

.pb-fs-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pb-fs-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 10, 18, 0.6) 0%, rgba(6, 10, 18, 0.04) 34%, rgba(6, 10, 18, 0.62) 100%);
}

.pb-fs-head {
  position: absolute;
  top: 16px;
  left: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #ffffff;
}

.pb-fs-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.pb-fs-title span {
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pb-fs-title em {
  font-style: normal;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.6);
}

.pb-fs-exit {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border: 0;
  border-radius: 50%;
  background: rgba(10, 18, 30, 0.42);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.pb-fs-toggle {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 68px;
  height: 68px;
  border: 0;
  border-radius: 50%;
  background: rgba(8, 14, 24, 0.28);
  color: rgba(255, 255, 255, 0.94);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pb-fs-foot {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #ffffff;
}

.pb-fs-line {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.pb-fs-progress {
  flex: 1;
  height: 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.42);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.pb-fs-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #ffffff;
  transition: width 0.12s linear;
}

.pb-fs-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pb-fs-actions button {
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 10px;
  background: rgba(9, 17, 30, 0.36);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.pb-fs-actions button:active {
  opacity: 0.7;
}

.pb-fs-action-label {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

/* 弹层动画 */
.pb-sheet-enter-active,
.pb-sheet-leave-active {
  transition: opacity 0.24s ease;
}

.pb-sheet-enter-active .pb-calendar-panel,
.pb-sheet-leave-active .pb-calendar-panel,
.pb-sheet-enter-active .pb-record-panel,
.pb-sheet-leave-active .pb-record-panel,
.pb-sheet-enter-active .pb-dl-panel,
.pb-sheet-leave-active .pb-dl-panel {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.pb-sheet-enter-from,
.pb-sheet-leave-to {
  opacity: 0;
}

.pb-sheet-enter-from .pb-calendar-panel,
.pb-sheet-leave-to .pb-calendar-panel,
.pb-sheet-enter-from .pb-record-panel,
.pb-sheet-leave-to .pb-record-panel,
.pb-sheet-enter-from .pb-dl-panel,
.pb-sheet-leave-to .pb-dl-panel {
  transform: translateY(100%);
}
</style>
