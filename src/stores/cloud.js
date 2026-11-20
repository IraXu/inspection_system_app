import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'prototype-cloud-plans'
const DEFAULT_ACTIVATED_IDS = ['1', '2', '5', '6', '7', '8']

const buildDefaultPlans = () =>
  DEFAULT_ACTIVATED_IDS.reduce((acc, id) => {
    acc[id] = {
      name: '30 天循环',
      days: 30,
      remainingDays: 21,
      price: 49
    }
    return acc
  }, {})

const readPlans = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaultPlans()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return buildDefaultPlans()

    return Object.entries(parsed).reduce((acc, [deviceId, plan]) => {
      if (!plan || typeof plan !== 'object') return acc
      acc[deviceId] = {
        ...plan,
        remainingDays: Number(plan.remainingDays ?? plan.days ?? 0)
      }
      return acc
    }, {})
  } catch {
    return buildDefaultPlans()
  }
}

export const useCloudStore = defineStore('cloud', () => {
  const plansById = ref(readPlans())

  const persist = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plansById.value))
    } catch {
      // 原型演示环境忽略存储异常
    }
  }

  const getPlan = (deviceId) => plansById.value[String(deviceId)] || null

  const activate = (deviceId, plan) => {
    const key = String(deviceId)
    plansById.value = {
      ...plansById.value,
      [key]: {
        remainingDays: plan.days,
        ...plan
      }
    }
    persist()
  }

  return {
    plansById,
    getPlan,
    activate
  }
})
