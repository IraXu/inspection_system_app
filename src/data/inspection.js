// 巡检计划与任务维护的演示数据（由 Web 后台原型迁移为移动端结构）
export const planStatusMap = {
  not_started: { label: '未开始', tone: 'processing' },
  in_progress: { label: '进行中', tone: 'success' },
  ended: { label: '已结束', tone: 'danger' }
}

export const planStatusDescriptions = [
  { key: 'not_started', label: '未开始', desc: '当前时间早于首次任务生成时间' },
  { key: 'in_progress', label: '进行中', desc: '当前时间在计划周期内，循环任务正常生成中或单次任务待执行' },
  { key: 'ended', label: '已结束', desc: '超过计划周期结束时间且所有任务终态，不再生成新任务' }
]

export const planCycleLabel = { daily: '每日', weekly: '每周', monthly: '每月' }
export const planModeLabel = { online: '在线巡检', offline: '线下巡检' }

export const execStatusMap = {
  pending: { label: '待执行', tone: 'processing' },
  executing: { label: '进行中', tone: 'primary' },
  executed: { label: '已执行', tone: 'success' },
  overdue: { label: '已超时', tone: 'danger' }
}

export const issueStatusMap = {
  无: { label: '无', tone: 'default' },
  待整改: { label: '待整改', tone: 'warning' },
  待审核: { label: '待审核', tone: 'processing' },
  已完成: { label: '已完成', tone: 'success' }
}

export const planStoreOptions = [
  '上海工厂 · A线旗舰门店',
  '北京工厂 · 办公区域',
  '深圳园区 · 仓储中心',
  '上海工厂 · 车间B',
  '上海工厂 · 仓库区域',
  '京东电器 · 南京新街口店'
]

export const planPersonnelOptions = ['吕建成', '孙锐', '王鹏', '李晨', '王敏', '张三']

export const planTemplateOptions = [
  '门店基础巡检',
  '消防安全巡检',
  '仓储管理巡检',
  '设备点检巡检',
  'AI 智能巡检'
]

export const mockPlans = [
  {
    id: 'plan-1',
    name: '计划A-每日门店巡检',
    status: 'in_progress',
    inspectionMode: 'online',
    description: '每日线上巡检计划，覆盖旗舰门店的营业环境与在岗情况。',
    cycleMode: 'cycle',
    cycleType: 'daily',
    executionTime: '08:00',
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    duration: '8小时',
    storesPersonnelTemplates: [
      {
        key: 'spt-1',
        storeName: '上海工厂 · A线旗舰门店',
        personnelNames: ['吕建成', '孙锐'],
        templateName: '门店基础巡检'
      }
    ],
    assigneeNames: ['吕建成'],
    reviewerNames: ['王敏'],
    creator: '管理员',
    createdAt: '2026-01-15 09:00:00',
    updatedAt: '2026-05-20 10:00:00'
  },
  {
    id: 'plan-2',
    name: '计划B-每周综合巡检',
    status: 'in_progress',
    inspectionMode: 'offline',
    description: '每周对仓储中心开展线下综合巡检。',
    cycleMode: 'cycle',
    cycleType: 'weekly',
    cycleDays: [1, 3, 5],
    executionTime: '09:00',
    validFrom: '2026-02-01',
    validUntil: '2026-12-31',
    duration: '4小时',
    storesPersonnelTemplates: [
      {
        key: 'spt-2',
        storeName: '深圳园区 · 仓储中心',
        personnelNames: ['王鹏', '李晨'],
        templateName: '仓储管理巡检'
      }
    ],
    assigneeNames: ['王鹏'],
    reviewerNames: ['王敏'],
    creator: '管理员',
    createdAt: '2026-02-01 14:00:00',
    updatedAt: '2026-05-18 16:00:00'
  },
  {
    id: 'plan-3',
    name: '计划C-每月安全巡检',
    status: 'not_started',
    inspectionMode: 'online',
    description: '',
    cycleMode: 'cycle',
    cycleType: 'monthly',
    cycleDays: [1, 15],
    executionTime: '07:00',
    validFrom: '2026-03-01',
    validUntil: '2026-12-31',
    duration: '6小时',
    storesPersonnelTemplates: [
      {
        key: 'spt-3',
        storeName: '北京工厂 · 办公区域',
        personnelNames: ['孙锐'],
        templateName: '消防安全巡检'
      }
    ],
    assigneeNames: ['孙锐'],
    reviewerNames: ['王敏'],
    creator: '管理员',
    createdAt: '2026-03-10 11:00:00',
    updatedAt: '2026-05-10 09:00:00'
  },
  {
    id: 'plan-4',
    name: '计划D-单次专项检查',
    status: 'ended',
    inspectionMode: 'offline',
    description: '已结束的单次专项检查。',
    cycleMode: 'once',
    executionTime: '2026-01-15 10:00',
    duration: '4小时',
    storesPersonnelTemplates: [
      {
        key: 'spt-4',
        storeName: '上海工厂 · 车间B',
        personnelNames: ['李晨', '吕建成'],
        templateName: '设备点检巡检'
      }
    ],
    assigneeNames: ['李晨'],
    reviewerNames: ['王敏'],
    creator: '管理员',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-02-01 08:00:00'
  },
  {
    id: 'plan-5',
    name: '计划E-每周陈列巡检',
    status: 'in_progress',
    inspectionMode: 'online',
    description: '',
    cycleMode: 'cycle',
    cycleType: 'weekly',
    cycleDays: [2, 4],
    executionTime: '08:30',
    validFrom: '2026-04-01',
    validUntil: '2026-12-31',
    duration: '3小时',
    storesPersonnelTemplates: [
      {
        key: 'spt-5',
        storeName: '京东电器 · 南京新街口店',
        personnelNames: ['张三'],
        templateName: '门店基础巡检'
      }
    ],
    assigneeNames: ['张三'],
    reviewerNames: ['王敏'],
    creator: '管理员',
    createdAt: '2026-04-01 10:00:00',
    updatedAt: '2026-05-22 14:00:00'
  },
  {
    id: 'plan-6',
    name: '计划F-月末全面巡检',
    status: 'not_started',
    inspectionMode: 'offline',
    description: '',
    cycleMode: 'cycle',
    cycleType: 'monthly',
    cycleDays: [28],
    executionTime: '09:00',
    validFrom: '2026-05-01',
    validUntil: '2026-12-31',
    duration: '8小时',
    storesPersonnelTemplates: [
      {
        key: 'spt-6',
        storeName: '上海工厂 · 仓库区域',
        personnelNames: ['王鹏'],
        templateName: '消防安全巡检'
      }
    ],
    assigneeNames: ['王鹏'],
    reviewerNames: ['王敏'],
    creator: '管理员',
    createdAt: '2026-05-01 09:00:00',
    updatedAt: '2026-05-25 09:00:00'
  }
]

export const mockTasks = [
  {
    id: 'task-1',
    taskNo: 'RW-20260526-001',
    executionTime: '2026-05-26 08:00',
    storeName: '上海工厂 · A线旗舰门店',
    plannedPersonnel: '吕建成',
    planCreator: '管理员',
    templateName: '门店基础巡检',
    inspectionMode: '在线巡检',
    relatedPlan: '计划A-每日门店巡检',
    planStatus: 'in_progress',
    executionStatus: 'executed',
    validUntil: '2026-05-26 16:00',
    actualPersonnel: '吕建成',
    inspectionNo: 'XJ-20260526-001',
    inspectionTime: '2026-05-26 08:30',
    issueStatus: '已完成',
    issueCount: 0,
    resolvedIssueCount: 0
  },
  {
    id: 'task-2',
    taskNo: 'RW-20260526-002',
    executionTime: '2026-05-26 08:00',
    storeName: '北京工厂 · 办公区域',
    plannedPersonnel: '孙锐',
    planCreator: '管理员',
    templateName: '消防安全巡检',
    inspectionMode: '在线巡检',
    relatedPlan: '计划C-每月安全巡检',
    planStatus: 'in_progress',
    executionStatus: 'executing',
    validUntil: '2026-05-26 16:00',
    actualPersonnel: '孙锐',
    inspectionNo: '',
    inspectionTime: '',
    issueStatus: '待整改',
    issueCount: 2,
    resolvedIssueCount: 0
  },
  {
    id: 'task-3',
    taskNo: 'RW-20260526-003',
    executionTime: '2026-05-26 09:00',
    storeName: '深圳园区 · 仓储中心',
    plannedPersonnel: '王鹏',
    planCreator: '管理员',
    templateName: '仓储管理巡检',
    inspectionMode: '线下巡检',
    relatedPlan: '计划B-每周综合巡检',
    planStatus: 'in_progress',
    executionStatus: 'pending',
    validUntil: '2026-05-26 13:00',
    actualPersonnel: '',
    inspectionNo: '',
    inspectionTime: '',
    issueStatus: '无',
    issueCount: 0,
    resolvedIssueCount: 0
  },
  {
    id: 'task-4',
    taskNo: 'RW-20260526-004',
    executionTime: '2026-05-26 10:00',
    storeName: '京东电器 · 南京新街口店',
    plannedPersonnel: '张三',
    planCreator: '管理员',
    templateName: '门店基础巡检',
    inspectionMode: '在线巡检',
    relatedPlan: '计划E-每周陈列巡检',
    planStatus: 'in_progress',
    executionStatus: 'pending',
    validUntil: '2026-05-26 13:00',
    actualPersonnel: '',
    inspectionNo: '',
    inspectionTime: '',
    issueStatus: '无',
    issueCount: 0,
    resolvedIssueCount: 0
  },
  {
    id: 'task-5',
    taskNo: 'RW-20260525-001',
    executionTime: '2026-05-25 08:00',
    storeName: '上海工厂 · A线旗舰门店',
    plannedPersonnel: '吕建成',
    planCreator: '管理员',
    templateName: '门店基础巡检',
    inspectionMode: '在线巡检',
    relatedPlan: '计划A-每日门店巡检',
    planStatus: 'ended',
    executionStatus: 'executed',
    validUntil: '2026-05-25 16:00',
    actualPersonnel: '吕建成',
    inspectionNo: 'XJ-20260525-001',
    inspectionTime: '2026-05-25 08:10',
    issueStatus: '已完成',
    issueCount: 1,
    resolvedIssueCount: 1
  },
  {
    id: 'task-6',
    taskNo: 'RW-20260525-002',
    executionTime: '2026-05-25 09:00',
    storeName: '深圳园区 · 仓储中心',
    plannedPersonnel: '王鹏',
    planCreator: '管理员',
    templateName: '仓储管理巡检',
    inspectionMode: '线下巡检',
    relatedPlan: '计划B-每周综合巡检',
    planStatus: 'ended',
    executionStatus: 'executed',
    validUntil: '2026-05-25 13:00',
    actualPersonnel: '李晨',
    inspectionNo: 'XJ-20260525-002',
    inspectionTime: '2026-05-25 09:20',
    issueStatus: '待审核',
    issueCount: 3,
    resolvedIssueCount: 2
  },
  {
    id: 'task-7',
    taskNo: 'RW-20260527-001',
    executionTime: '2026-05-27 08:00',
    storeName: '上海工厂 · 仓库区域',
    plannedPersonnel: '王鹏',
    planCreator: '管理员',
    templateName: '消防安全巡检',
    inspectionMode: '在线巡检',
    relatedPlan: '计划C-每月安全巡检',
    planStatus: 'not_started',
    executionStatus: 'pending',
    validUntil: '2026-05-27 14:00',
    actualPersonnel: '',
    inspectionNo: '',
    inspectionTime: '',
    issueStatus: '无',
    issueCount: 0,
    resolvedIssueCount: 0
  },
  {
    id: 'task-8',
    taskNo: 'RW-20260520-001',
    executionTime: '2026-05-20 08:00',
    storeName: '北京工厂 · 办公区域',
    plannedPersonnel: '孙锐',
    planCreator: '管理员',
    templateName: '门店基础巡检',
    inspectionMode: '在线巡检',
    relatedPlan: '计划D-单次专项检查',
    planStatus: 'ended',
    executionStatus: 'overdue',
    validUntil: '2026-05-20 16:00',
    actualPersonnel: '',
    inspectionNo: '',
    inspectionTime: '',
    issueStatus: '无',
    issueCount: 0,
    resolvedIssueCount: 0
  }
]

export const taskStoreOptions = Array.from(new Set(mockTasks.map((task) => task.storeName)))

const weekDayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

export const formatPlanCycle = (plan) => {
  if (plan.cycleMode === 'once') return '单次任务'
  return `循环 · ${planCycleLabel[plan.cycleType] || '每日'}`
}

export const formatCycleDays = (plan) => {
  if (plan.cycleMode !== 'cycle' || !plan.cycleDays?.length) return ''
  if (plan.cycleType === 'weekly') return plan.cycleDays.map((day) => weekDayNames[day]).join('、')
  if (plan.cycleType === 'monthly') return plan.cycleDays.map((day) => `${day}号`).join('、')
  return ''
}

export const formatPlanPeriod = (plan) => {
  if (plan.cycleMode === 'once') return plan.executionTime || '—'
  return `${plan.validFrom || '—'} 至 ${plan.validUntil || '—'}`
}

export const formatPlanStores = (plan) =>
  (plan.storesPersonnelTemplates || []).map((row) => row.storeName).join('、') || '—'
