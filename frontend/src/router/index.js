import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/actions'
  },
  {
    path: '/actions',
    name: 'ActionLibrary',
    component: () => import('@/views/ActionLibrary.vue')
  },
  {
    path: '/choreography',
    name: 'ChoreographyList',
    component: () => import('@/views/ChoreographyList.vue')
  },
  {
    path: '/choreography/:id',
    name: 'ChoreographyEditor',
    component: () => import('@/views/ChoreographyEditor.vue')
  },
  {
    path: '/share',
    name: 'ShareList',
    component: () => import('@/views/ShareList.vue')
  },
  {
    path: '/share/:code',
    name: 'SharedView',
    component: () => import('@/views/SharedView.vue'),
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
