import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'events',
        name: 'EventList',
        component: () => import('@/views/EventList.vue'),
        meta: { title: '比赛列表' }
      },
      {
        path: 'events/:id',
        name: 'EventDetail',
        component: () => import('@/views/EventDetail.vue'),
        meta: { title: '比赛详情' }
      },
      {
        path: 'registration/:id',
        name: 'Registration',
        component: () => import('@/views/Registration.vue'),
        meta: { title: '报名', requiresAuth: true }
      },
      {
        path: 'winners',
        name: 'Winners',
        component: () => import('@/views/Winners.vue'),
        meta: { title: '获奖名单' }
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('@/views/Map.vue'),
        meta: { title: '比赛地点' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '管理面板' }
      },
      {
        path: 'events',
        name: 'AdminEvents',
        component: () => import('@/views/admin/Events.vue'),
        meta: { title: '比赛管理' }
      },
      {
        path: 'registrations',
        name: 'AdminRegistrations',
        component: () => import('@/views/admin/Registrations.vue'),
        meta: { title: '报名管理' }
      },
      {
        path: 'winners',
        name: 'AdminWinners',
        component: () => import('@/views/admin/Winners.vue'),
        meta: { title: '获奖管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check if route requires admin privileges
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router

