import { createRouter, createWebHashHistory } from 'vue-router'
// 不要从 'vue-router' 导入 createWebHistory
import LoginView from '../views/LoginView.vue'
import TasksView from '../views/TasksView.vue'

const router = createRouter({
  history: createWebHashHistory(),// 改用 hash 模式
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/tasks', component: TasksView, meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router