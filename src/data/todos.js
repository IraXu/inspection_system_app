const snapshot = (prompt, size = 'landscape_4_3') =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`

// ============ 巡检项库 ============
const ITEM_LIBRARY = {
  env: {
    name: '环境卫生',
    items: [
      {
        key: 'floor',
        name: '地面是否整洁',
        standard: '地面无污渍、无杂物、无水渍，保持光洁。每日至少清洁 2 次，高峰期需增加清洁频次；瓷砖地面需做好防滑处理。',
        standardImage: snapshot('clean bright supermarket floor, tidy and spotless, CCTV still frame')
      },
      {
        key: 'surface',
        name: '设备表面是否整洁',
        standard: '设备外壳无灰尘、无油污，线缆收纳整齐；每周完成一次深度清洁，每月完成一次设备维护检查。',
        standardImage: snapshot('clean checkout counter and payment equipment in retail store, CCTV still frame')
      }
    ]
  },
  behavior: {
    name: '行为规范',
    items: [
      {
        key: 'duty',
        name: '员工是否在岗',
        standard: '营业期间各岗位须保持有人在岗，离岗需安排替岗人员，单次离岗不得超过 10 分钟。',
        standardImage: snapshot('store staff standing on duty at checkout counter, CCTV view from ceiling')
      },
      {
        key: 'phone',
        name: '是否违规使用手机',
        standard: '工作期间禁止使用手机处理非工作事务；紧急电话须到指定区域接听，时长不超过 3 分钟。',
        standardImage: snapshot('store employee at checkout with hands free, no mobile phone, CCTV still frame')
      }
    ]
  },
  display: {
    name: '陈列展示',
    items: [
      {
        key: 'shelf',
        name: '货架商品是否整齐',
        standard: '商品按陈列标准正面朝外、先进先出，货架无空缺、无串位，端架陈列保持饱满。',
        standardImage: snapshot('grocery store shelves fully stocked and neatly arranged, CCTV still frame')
      },
      {
        key: 'price',
        name: '价签是否规范',
        standard: '价签与商品一一对应，位置统一在商品左下角，无缺价签、无错价签、无过期活动标签。',
        standardImage: snapshot('retail shelf edge price tags aligned neatly, CCTV close up still frame')
      }
    ]
  },
  fire: {
    name: '消防安全',
    items: [
      {
        key: 'aisle',
        name: '消防通道是否畅通',
        standard: '消防通道、安全出口保持畅通，严禁堆放货物与杂物，通道宽度不小于 1.2 米。',
        standardImage: snapshot('warehouse fire exit aisle completely clear and unobstructed, CCTV still frame')
      },
      {
        key: 'extinguisher',
        name: '灭火器是否有效',
        standard: '灭火器压力表指针在绿区，瓶身无锈蚀，检查卡在有效期内，摆放位置醒目易取。',
        standardImage: snapshot('fire extinguisher mounted on wall with valid inspection tag, CCTV still frame')
      }
    ]
  }
}

const buildCategories = (keys) =>
  keys.map((key) => {
    const category = ITEM_LIBRARY[key]
    return {
      key,
      name: category.name,
      items: category.items.map((item, index) => ({
        id: `${key}-${item.key}`,
        name: item.name,
        standard: item.standard,
        standardImages: [item.standardImage],
        problemDesc: '',
        result: null,
        screenshots: [],
        order: index + 1
      }))
    }
  })

// ============ 待执行巡检任务 ============
export const inspectionTasks = [
  {
    id: 'T200-P111-A',
    storeName: '上海工厂 · A线旗舰门店',
    address: '上海市浦东新区智能制造园 3 号楼',
    templateName: '门店基础巡检',
    method: '线下巡检',
    planName: '计划A-每日门店巡检',
    executors: ['吕建成', '孙锐'],
    generatedAt: '2026-10-29 08:00',
    deadline: '今天 18:00',
    priority: 'high',
    status: 'pending',
    location: { lng: 121.5447, lat: 31.2217, radius: 200, address: '上海市浦东新区智能制造园 3 号楼' },
    categories: buildCategories(['env', 'behavior', 'display'])
  },
  {
    id: 'T200-P111-B',
    storeName: '北京工厂 · 办公区域',
    address: '北京市朝阳区望京科技园 B 座',
    templateName: '消防安全巡检',
    method: '线下巡检',
    planName: '计划C-每月安全巡检',
    executors: ['孙锐'],
    generatedAt: '2026-10-29 08:30',
    deadline: '今天 20:00',
    priority: 'medium',
    status: 'pending',
    location: { lng: 116.4815, lat: 39.9905, radius: 150, address: '北京市朝阳区望京科技园 B 座' },
    categories: buildCategories(['fire', 'env'])
  },
  {
    id: 'T200-P111-C',
    storeName: '深圳园区 · 仓储中心',
    address: '深圳市南山区物流园 8 号仓',
    templateName: '仓储管理巡检',
    method: '线下巡检',
    planName: '计划B-每周综合巡检',
    executors: ['王鹏', '吕建成'],
    generatedAt: '2026-10-29 09:00',
    deadline: '明天 12:00',
    priority: 'medium',
    status: 'pending',
    location: { lng: 113.9345, lat: 22.5308, radius: 300, address: '深圳市南山区物流园 8 号仓' },
    categories: buildCategories(['display', 'fire'])
  },
  {
    id: 'T200-P111-D',
    storeName: '上海工厂 · 车间B',
    address: '上海市浦东新区智能制造园 5 号楼',
    templateName: '设备点检巡检',
    method: '线下巡检',
    planName: '计划D-单次专项检查',
    executors: ['李晨'],
    generatedAt: '2026-10-29 09:20',
    deadline: '明天 18:00',
    priority: 'low',
    status: 'pending',
    location: { lng: 121.5366, lat: 31.2304, radius: 180, address: '上海市浦东新区智能制造园 5 号楼' },
    categories: buildCategories(['env', 'fire'])
  }
]

// ============ 整改单 / 审核单 / 已完成记录 ============
const ticketItem = (categoryKey, itemKey, problemDesc, inspectPrompts, rectify) => {
  const category = ITEM_LIBRARY[categoryKey]
  const item = category.items.find((entry) => entry.key === itemKey)
  return {
    id: `${categoryKey}-${itemKey}`,
    categoryName: category.name,
    itemName: item.name,
    standard: item.standard,
    problemDesc,
    inspectImages: (inspectPrompts || []).map((prompt) => snapshot(prompt)),
    rectifyDesc: rectify?.desc || '',
    rectifyImages: (rectify?.images || []).map((prompt) => snapshot(prompt))
  }
}

const timelineNode = (type, label, operator, time, opinion = '') => ({
  type,
  label,
  operator,
  time,
  opinion
})

const baseTicket = {
  priority: 'medium',
  sourceType: 'inspection',
  rejectReason: '',
  reviewOpinion: ''
}

export const issueTickets = [
  {
    ...baseTicket,
    id: 'SP-20261028-001',
    taskId: 'T200-P111-E',
    storeName: '上海工厂 · A线旗舰门店',
    templateName: '门店基础巡检',
    method: '线下巡检',
    submitter: '孙锐',
    rectifier: '吕建成',
    reviewer: '阿老师',
    issueCount: 3,
    status: 'pending_rectify',
    priority: 'high',
    createdAt: '2026-10-28 10:12',
    rectifiedAt: '2026-10-28 15:20',
    reviewedAt: '',
    rejectReason: '仅清理了地面垃圾，货架陈列与员工在岗问题未处理，请补充整改说明与整改截图。',
    items: [
      ticketItem('env', 'floor', '检测到货架通道地面有明显垃圾与纸屑未清理。', [
        'supermarket aisle floor with scattered trash and paper scraps, CCTV still frame'
      ]),
      ticketItem('display', 'shelf', '检测到靠窗货架商品摆放杂乱，部分商品背面向外。', [
        'grocery store shelf with messy products facing backwards, CCTV still frame'
      ]),
      ticketItem('behavior', 'duty', '检测到 14:20-14:35 期间收银岗位无人值守。', [
        'empty checkout counter with no staff, CCTV still frame'
      ])
    ],
    timeline: [
      timelineNode('found', '发现问题', '孙锐', '2026-10-28 10:12'),
      timelineNode('rectified', '提交整改', '吕建成', '2026-10-28 15:20'),
      timelineNode(
        'rejected',
        '审核驳回',
        '阿老师',
        '2026-10-28 17:05',
        '仅清理了地面垃圾，货架陈列与员工在岗问题未处理，请补充整改说明与整改截图。'
      )
    ]
  },
  {
    ...baseTicket,
    id: 'RECT-20261029-001',
    taskId: 'AI20261029-003',
    storeName: '上海工厂 · 仓库区域',
    templateName: 'AI 智能巡检',
    method: 'AI巡检',
    sourceType: 'ai',
    submitter: 'AI系统',
    rectifier: '王鹏',
    reviewer: '阿老师',
    issueCount: 1,
    status: 'pending_rectify',
    priority: 'high',
    createdAt: '2026-10-29 09:35',
    rectifiedAt: '',
    reviewedAt: '',
    items: [
      ticketItem('fire', 'aisle', 'AI 识别到消防通道被货物占用，通道宽度不足 0.6 米。', [
        'warehouse fire exit passage blocked by stacked boxes, CCTV still frame'
      ])
    ],
    timeline: [
      timelineNode('found', 'AI 识别问题', 'AI 识别引擎', '2026-10-29 09:35'),
      timelineNode('pushed', '生成整改单', '系统', '2026-10-29 09:36')
    ]
  },
  {
    ...baseTicket,
    id: 'SP-20261028-002',
    taskId: 'T200-P111-F',
    storeName: '北京工厂 · 办公区域',
    templateName: '消防安全巡检',
    method: '线下巡检',
    submitter: '孙锐',
    rectifier: '王敏',
    reviewer: '阿老师',
    issueCount: 2,
    status: 'pending_review',
    priority: 'medium',
    createdAt: '2026-10-28 11:06',
    rectifiedAt: '2026-10-29 08:40',
    reviewedAt: '',
    items: [
      ticketItem(
        'fire',
        'aisle',
        '消防通道拐角处堆放了两箱打印纸，影响人员疏散。',
        ['office fire escape passage blocked by paper boxes, CCTV still frame'],
        {
          desc: '已将打印纸全部移至库房指定区域，消防通道已恢复畅通，并安排行政每日巡查。',
          images: ['office fire escape passage completely clear after cleanup, CCTV still frame']
        }
      ),
      ticketItem(
        'env',
        'surface',
        '茶水间设备表面油污明显，长时间未清洁。',
        ['office pantry equipment with visible stains on surface, CCTV still frame'],
        {
          desc: '已完成茶水间设备深度清洁，并补充每周五固定清洁排班。',
          images: ['office pantry counter clean and tidy after deep cleaning, CCTV still frame']
        }
      )
    ],
    timeline: [
      timelineNode('found', '发现问题', '孙锐', '2026-10-28 11:06'),
      timelineNode('rectified', '提交整改', '王敏', '2026-10-29 08:40')
    ]
  },
  {
    ...baseTicket,
    id: 'SP-20261027-001',
    taskId: 'T200-P111-G',
    storeName: '深圳园区 · 仓储中心',
    templateName: '仓储管理巡检',
    method: '线下巡检',
    submitter: '王鹏',
    rectifier: '吕建成',
    reviewer: '阿老师',
    issueCount: 2,
    status: 'completed',
    priority: 'medium',
    createdAt: '2026-10-27 09:18',
    rectifiedAt: '2026-10-27 14:26',
    reviewedAt: '2026-10-27 16:02',
    reviewOpinion: '整改符合要求，通道与货架陈列均已恢复标准，审核通过。',
    items: [
      ticketItem(
        'fire',
        'aisle',
        '仓储主通道被托盘占用，叉车通行受阻。',
        ['warehouse main aisle blocked by wooden pallets, CCTV still frame'],
        {
          desc: '已将托盘移至待检区，并在通道地面补充黄色警戒线标识。',
          images: ['warehouse main aisle clear with yellow warning line, CCTV still frame']
        }
      ),
      ticketItem(
        'display',
        'price',
        '出库暂存区价签缺失，无法核对商品批次。',
        ['warehouse staging area cartons without labels, CCTV still frame'],
        {
          desc: '已补齐全部批次标签，并安排出库前双人复核。',
          images: ['warehouse staging cartons with clear batch labels, CCTV still frame']
        }
      )
    ],
    timeline: [
      timelineNode('found', '发现问题', '王鹏', '2026-10-27 09:18'),
      timelineNode('rectified', '提交整改', '吕建成', '2026-10-27 14:26'),
      timelineNode('approved', '审核通过', '阿老师', '2026-10-27 16:02', '整改符合要求，通道与货架陈列均已恢复标准，审核通过。')
    ]
  },
  {
    ...baseTicket,
    id: 'SP-20261026-001',
    taskId: 'T200-P111-H',
    storeName: '上海工厂 · 车间B',
    templateName: '设备点检巡检',
    method: '线下巡检',
    submitter: '李晨',
    rectifier: '—',
    reviewer: '—',
    issueCount: 0,
    status: 'completed',
    priority: 'low',
    createdAt: '2026-10-26 09:40',
    rectifiedAt: '',
    reviewedAt: '',
    reviewOpinion: '',
    items: [],
    timeline: [
      timelineNode('found', '完成巡检', '李晨', '2026-10-26 09:40'),
      timelineNode('done', '巡检通过', '系统', '2026-10-26 09:41', '本次巡检全部检查项合格，无需生成整改单。')
    ]
  },
  {
    ...baseTicket,
    id: 'RECT-20261025-001',
    taskId: 'AI20261025-001',
    storeName: '京东电器 · 南京新街口店',
    templateName: 'AI 智能巡检',
    method: 'AI巡检',
    sourceType: 'ai',
    submitter: 'AI系统',
    rectifier: '张三',
    reviewer: '阿老师',
    issueCount: 1,
    status: 'completed',
    priority: 'low',
    createdAt: '2026-10-25 10:02',
    rectifiedAt: '2026-10-25 13:10',
    reviewedAt: '2026-10-25 15:30',
    reviewOpinion: '整改及时，现场照片清晰，审核通过。',
    items: [
      ticketItem(
        'behavior',
        'phone',
        'AI 识别到收银员在接待顾客时使用手机。',
        ['store cashier using mobile phone while customer waiting, CCTV still frame'],
        {
          desc: '已对该员工进行现场提醒与制度培训，并将该行为纳入月度考核。',
          images: ['store cashier serving customer with hands free, CCTV still frame']
        }
      )
    ],
    timeline: [
      timelineNode('found', 'AI 识别问题', 'AI 识别引擎', '2026-10-25 10:02'),
      timelineNode('rectified', '提交整改', '张三', '2026-10-25 13:10'),
      timelineNode('approved', '审核通过', '阿老师', '2026-10-25 15:30', '整改及时，现场照片清晰，审核通过。')
    ]
  }
]

export const todoStatusMap = {
  pending_rectify: { label: '待整改', tone: 'warning' },
  pending_review: { label: '待审核', tone: 'primary' },
  completed: { label: '已完成', tone: 'success' }
}
