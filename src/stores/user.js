import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    username: ''
  }),
  actions: {
    async login(username, password) {
      try {
        const res = await request.get('/users', { params: { username, password } })
        if (res.data.length > 0) {
          this.token = 'fake-token'
          this.username = username
          localStorage.setItem('token', this.token)
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败', error)
        return false
      }
    },
    logout() {
      this.token = ''
      this.username = ''
      localStorage.removeItem('token')
    }
  }
})