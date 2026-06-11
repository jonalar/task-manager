import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    categories: []
  }),
  actions: {
    async fetchTasks() {
      const res = await request.get('/tasks')
      this.tasks = res.data.sort((a, b) => a.order - b.order)
    },
    async fetchCategories() {
      const res = await request.get('/categories')
      this.categories = res.data
    },
    async addTask(name, category, dueDate) {
      const newOrder = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.order)) + 1 : 1
      const newTask = { name, completed: false, category, dueDate, order: newOrder }
      const res = await request.post('/tasks', newTask)
      this.tasks.push(res.data)
      this.sortTasks()
    },
    async updateTask(updatedTask) {
      await request.put(`/tasks/${updatedTask.id}`, updatedTask)
      const index = this.tasks.findIndex(t => t.id === updatedTask.id)
      if (index !== -1) this.tasks[index] = updatedTask
    },
    async deleteTask(id) {
      await request.delete(`/tasks/${id}`)
      this.tasks = this.tasks.filter(t => t.id !== id)
    },
    async clearAllTasks() {
      await Promise.all(this.tasks.map(t => request.delete(`/tasks/${t.id}`)))
      this.tasks = []
    },
    async updateOrder(updatedTasks) {
      for (let i = 0; i < updatedTasks.length; i++) {
        const task = updatedTasks[i]
        if (task.order !== i + 1) {
          task.order = i + 1
          await request.put(`/tasks/${task.id}`, task)
        }
      }
      this.tasks = updatedTasks
    },
    sortTasks() {
      this.tasks.sort((a, b) => a.order - b.order)
    }
  }
  })