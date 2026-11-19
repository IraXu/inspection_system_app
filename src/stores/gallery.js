import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { buildImageUrl } from '../utils/media'

const STORAGE_KEY = 'prototype-gallery-media'

const buildCctvImage = (scene) =>
  buildImageUrl(`realistic CCTV surveillance still of ${scene}, wide angle, slightly grainy security camera footage`)

const seedItems = () => {
  const now = Date.now()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  return [
    {
      id: 'seed-photo-1',
      type: 'photo',
      url: buildCctvImage('a bright factory warehouse interior with tall steel racks and a forklift'),
      deviceId: 1,
      deviceName: '摄像头-车间1入口',
      createdAt: now - 26 * minute,
      duration: 0
    },
    {
      id: 'seed-photo-2',
      type: 'photo',
      url: buildCctvImage('an empty underground parking garage with white pillars and bright ceiling lights'),
      deviceId: 6,
      deviceName: '摄像头-停车场',
      createdAt: now - 3 * hour,
      duration: 0
    },
    {
      id: 'seed-video-1',
      type: 'video',
      url: buildCctvImage('factory assembly line operating with workers in yellow vests'),
      deviceId: 1,
      deviceName: '摄像头-车间1入口',
      createdAt: now - 5 * hour,
      duration: 48
    },
    {
      id: 'seed-photo-3',
      type: 'photo',
      url: buildCctvImage('an office reception area with a front desk and warm lighting'),
      deviceId: 5,
      deviceName: '摄像头-办公区域',
      createdAt: now - day - 2 * hour,
      duration: 0
    },
    {
      id: 'seed-video-2',
      type: 'video',
      url: buildCctvImage('a factory gate checkpoint with barriers and a security booth at night'),
      deviceId: 7,
      deviceName: '摄像头-厂区大门',
      createdAt: now - day - 6 * hour,
      duration: 126
    }
  ]
}

const readStorage = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const useGalleryStore = defineStore('gallery', () => {
  const items = ref(readStorage() ?? seedItems())

  const persist = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // 原型演示环境忽略存储异常
    }
  }

  persist()

  const sortedItems = computed(() =>
    [...items.value].sort((a, b) => b.createdAt - a.createdAt)
  )

  const photos = computed(() => sortedItems.value.filter(item => item.type === 'photo'))
  const videos = computed(() => sortedItems.value.filter(item => item.type === 'video'))

  const addItem = (item) => {
    items.value = [{ ...item }, ...items.value]
    persist()
  }

  const addPhoto = ({ deviceId, deviceName, url }) => {
    addItem({
      id: `photo-${Date.now()}`,
      type: 'photo',
      url: url || buildCctvImage('factory workshop interior with storage racks'),
      deviceId,
      deviceName,
      createdAt: Date.now(),
      duration: 0
    })
  }

  const addVideo = ({ deviceId, deviceName, url, duration }) => {
    addItem({
      id: `video-${Date.now()}`,
      type: 'video',
      url: url || buildCctvImage('factory workshop interior with storage racks'),
      deviceId,
      deviceName,
      createdAt: Date.now(),
      duration: Math.max(1, Math.round(duration || 0))
    })
  }

  const removeItems = (ids) => {
    const idSet = new Set(ids)
    items.value = items.value.filter(item => !idSet.has(item.id))
    persist()
  }

  return {
    items,
    sortedItems,
    photos,
    videos,
    addPhoto,
    addVideo,
    removeItems
  }
})
