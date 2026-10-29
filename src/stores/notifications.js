import { defineStore } from 'pinia'
import { deviceNotifications } from '../data/device-notifications'

const clone = (source) => JSON.parse(JSON.stringify(source))

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: clone(deviceNotifications)
  }),

  getters: {
    unreadCount: (state) => state.items.filter((item) => item.status === 'unread').length,
    getById: (state) => (id) => state.items.find((item) => item.id === id)
  },

  actions: {
    markRead(id) {
      const item = this.items.find((entry) => entry.id === id)
      if (item) {
        item.status = 'read'
      }
    },

    removeAlerts(ids) {
      const target = new Set(ids)
      this.items = this.items.filter((item) => !target.has(item.id))
    }
  }
})
