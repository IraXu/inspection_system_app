import { defineStore } from 'pinia'
import { inspectionTasks, issueTickets } from '../data/todos'

const pad = (value) => String(value).padStart(2, '0')

const formatNow = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const clone = (source) => JSON.parse(JSON.stringify(source))

const createTicketId = () => {
  const now = new Date()
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  return `SP-${date}-${Math.floor(100 + Math.random() * 900)}`
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    tasks: clone(inspectionTasks),
    tickets: clone(issueTickets)
  }),

  getters: {
    pendingTasks: (state) => state.tasks.filter((task) => task.status === 'pending'),
    rectifyTickets: (state) => state.tickets.filter((ticket) => ticket.status === 'pending_rectify'),
    reviewTickets: (state) => state.tickets.filter((ticket) => ticket.status === 'pending_review'),
    completedTickets: (state) => state.tickets.filter((ticket) => ticket.status === 'completed'),
    getTask: (state) => (taskId) => state.tasks.find((task) => task.id === taskId),
    getTicket: (state) => (ticketId) => state.tickets.find((ticket) => ticket.id === ticketId)
  },

  actions: {
    submitInspection(taskId, results) {
      const task = this.tasks.find((item) => item.id === taskId)
      if (!task) {
        return null
      }

      const failedItems = results.filter((item) => item.result === 'fail')
      const time = formatNow()

      task.status = 'done'
      task.executedAt = time

      const ticket = {
        id: createTicketId(),
        taskId: task.id,
        storeName: task.storeName,
        templateName: task.templateName,
        method: task.method,
        sourceType: 'inspection',
        submitter: task.executors[0] || '当前用户',
        rectifier: task.executors[0] || '待分配',
        reviewer: '阿老师',
        issueCount: failedItems.length,
        status: failedItems.length ? 'pending_rectify' : 'completed',
        priority: failedItems.length ? task.priority : 'low',
        rejectReason: '',
        reviewOpinion: '',
        createdAt: time,
        rectifiedAt: '',
        reviewedAt: failedItems.length ? '' : time,
        items: failedItems.map((item) => ({
          id: `${item.categoryKey}-${item.id}`,
          categoryName: item.categoryName,
          itemName: item.itemName,
          standard: item.standard,
          problemDesc: item.problemDesc,
          inspectImages: [...item.screenshots],
          rectifyDesc: '',
          rectifyImages: []
        })),
        timeline: failedItems.length
          ? [{ type: 'found', label: '发现问题', operator: task.executors[0] || '当前用户', time, opinion: '' }]
          : [
              { type: 'found', label: '完成巡检', operator: task.executors[0] || '当前用户', time, opinion: '' },
              {
                type: 'done',
                label: '巡检通过',
                operator: '系统',
                time,
                opinion: '本次巡检全部检查项合格，无需生成整改单。'
              }
            ]
      }

      this.tickets.unshift(ticket)
      return ticket
    },

    submitRectify(ticketId, items) {
      const ticket = this.tickets.find((item) => item.id === ticketId)
      if (!ticket) {
        return false
      }

      const time = formatNow()
      ticket.items = ticket.items.map((item) => {
        const payload = items.find((entry) => entry.id === item.id)
        return payload
          ? { ...item, rectifyDesc: payload.rectifyDesc, rectifyImages: [...payload.rectifyImages] }
          : item
      })

      ticket.status = 'pending_review'
      ticket.rectifiedAt = time
      ticket.rejectReason = ''
      ticket.timeline.push({
        type: 'rectified',
        label: '提交整改',
        operator: ticket.rectifier,
        time,
        opinion: ''
      })
      return true
    },

    approveTicket(ticketId, opinion) {
      const ticket = this.tickets.find((item) => item.id === ticketId)
      if (!ticket) {
        return false
      }

      const time = formatNow()
      ticket.status = 'completed'
      ticket.reviewedAt = time
      ticket.reviewOpinion = opinion.trim() || '整改符合要求，审核通过。'
      ticket.rejectReason = ''
      ticket.timeline.push({
        type: 'approved',
        label: '审核通过',
        operator: ticket.reviewer,
        time,
        opinion: ticket.reviewOpinion
      })
      return true
    },

    rejectTicket(ticketId, opinion) {
      const ticket = this.tickets.find((item) => item.id === ticketId)
      if (!ticket) {
        return false
      }

      const time = formatNow()
      ticket.status = 'pending_rectify'
      ticket.rejectReason = opinion.trim()
      ticket.timeline.push({
        type: 'rejected',
        label: '审核驳回',
        operator: ticket.reviewer,
        time,
        opinion: opinion.trim()
      })
      return true
    }
  }
})
