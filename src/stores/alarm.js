import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getDefaultDetectionTypes, getSupportedDetectionTypes } from '../data/detection-types'

const STORAGE_KEY = 'prototype-detection-types'

const readSelections = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed
  } catch {
    return {}
  }
}

export const useAlarmStore = defineStore('alarm', () => {
  const selectionsByDevice = ref(readSelections())

  const persist = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectionsByDevice.value))
    } catch {
      // 原型演示环境忽略存储异常
    }
  }

  const getSelectedTypes = (deviceId) => {
    const key = String(deviceId)
    const supported = getSupportedDetectionTypes(key).map((option) => option.value)
    const stored = selectionsByDevice.value[key]

    if (!Array.isArray(stored)) return supported

    const filtered = stored.filter((value) => supported.includes(value))
    return filtered.length ? filtered : supported
  }

  const setSelectedTypes = (deviceId, types) => {
    const key = String(deviceId)
    const supported = getSupportedDetectionTypes(key).map((option) => option.value)
    const filtered = types.filter((value) => supported.includes(value))

    selectionsByDevice.value = {
      ...selectionsByDevice.value,
      [key]: filtered.length ? filtered : getDefaultDetectionTypes(key)
    }
    persist()
  }

  return {
    selectionsByDevice,
    getSelectedTypes,
    setSelectedTypes
  }
})
