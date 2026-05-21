import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/workbench'
  },
  {
    path: '/workbench',
    name: 'workbench',
    component: () => import('../views/workbench/index.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/home/index.vue'),
    meta: { title: '视频广场' }
  },
  {
    path: '/todo',
    name: 'todo',
    component: () => import('../views/todo/index.vue'),
    meta: { title: '待办' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/profile/index.vue'),
    meta: { title: '我的' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/settings/index.vue'),
    meta: { title: '设置' }
  },
  {
    path: '/device-notifications',
    name: 'device-notifications',
    component: () => import('../views/device-notifications/index.vue'),
    meta: { title: '设备消息' }
  },
  {
    path: '/device-notifications/:id',
    name: 'device-notification-detail',
    component: () => import('../views/device-notification-detail/index.vue'),
    meta: { title: '告警详情' }
  },
  {
    path: '/video-player/:id',
    name: 'video-player',
    component: () => import('../views/video-player/index.vue'),
    meta: { title: '视频播放' }
  },
  {
    path: '/video-wall-setup',
    name: 'video-wall-setup',
    component: () => import('../views/video-wall-setup/index.vue'),
    meta: { title: '多画面配置' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/register/index.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/forgot-password/index.vue'),
    meta: { title: '忘记密码' }
  },
  {
    path: '/select-enterprise',
    name: 'select-enterprise',
    component: () => import('../views/select-enterprise/index.vue'),
    meta: { title: '选择企业' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '智慧巡检APP'
  next()
})

export default router
