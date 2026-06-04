import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Cars',
    component: () => import('@/views/Cars.vue'),
    meta: { title: '车辆列表' }
  },
  {
    path: '/car/:id',
    name: 'CarDetail',
    component: () => import('@/views/CarDetail.vue'),
    meta: { title: '车辆详情' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '复古汽车修复'} - 复古汽车修复进度跟踪`
  next()
})

export default router
