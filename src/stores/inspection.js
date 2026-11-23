import { defineStore } from 'pinia'
import { mockPlans, mockTasks } from '../data/inspection'

const clone = (source) => JSON.parse(JSON.stringify(source))

const pad = (value) => String(value).padStart(2, '0')

const formatNow = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export const useInspectionStore = defineStore('inspection', {
  state: () => ({
    plans: clone(mockPlans),
    tasks: clone(mockTasks)
  }),

  getters: {
    inProgressPlanCount: (state) => state.plans.filter((plan) => plan.status === 'in_progress').length,
    pendingTaskCount: (state) => state.tasks.filter((task) => task.executionStatus === 'pending').length,
    getPlan: (state) => (planId) => state.plans.find((plan) => plan.id === planId)
  },

  actions: {
    createPlan(payload) {
      const time = formatNow()
      const plan = {
        id: `plan-${Date.now()}`,
        status: 'not_started',
        creator: '当前用户',
        createdAt: time,
        updatedAt: time,
        ...payload
      }
      this.plans.unshift(plan)
      return plan
    },

    updatePlan(planId, payload) {
      const plan = this.plans.find((item) => item.id === planId)
      if (!plan) {
        return null
      }
      Object.assign(plan, payload, { updatedAt: formatNow() })
      return plan
    },

    deletePlan(planId) {
      this.plans = this.plans.filter((plan) => plan.id !== planId)
    },

    deleteTasks(taskIds) {
      const removable = new Set(
        this.tasks
          .filter((task) => taskIds.includes(task.id) && task.executionStatus === 'pending')
          .map((task) => task.id)
      )
      this.tasks = this.tasks.filter((task) => !removable.has(task.id))
      return removable.size
    }
  }
})
