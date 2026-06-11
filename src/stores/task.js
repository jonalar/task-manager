import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
     //categories: []
  }),
  actions: {
    async fetchTasks() {
      const res = await request.get('/tasks')
      // 按 order 字段排序
      this.tasks = res.data.sort((a, b) => a.order - b.order)
    },
    async addTask(name, category, dueDate) {
      const newOrder = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.order)) + 1 : 1
      const newTask = {name,completed: false,category,dueDate,order: newOrder}
      const res = await request.post('/tasks', newTask)
      this.tasks.push(res.data)
      this.sortTasks()
    },
    async updateTask(updatedTask) {
      await request.put(`/tasks/${updatedTask.id}`, updatedTask)
      const index = this.tasks.findIndex(t => t.id === updatedTask.id)
      if (index !== -1) {
        this.tasks[index] = updatedTask
      }
    },
    async deleteTask(id) {
      try {
        await request.delete(`/tasks/${id}`)
        
        const deletedIndex = this.tasks.findIndex(t => t.id === id)
        if (deletedIndex === -1) return
        
        this.tasks.splice(deletedIndex, 1)
        
        // 并行更新后续任务的 order（比串行快）
        const updatePromises = this.tasks.slice(deletedIndex).map((task, idx) => {
          task.order = deletedIndex + idx + 1
          return request.put(`/tasks/${task.id}`, task)
        })
        await Promise.all(updatePromises)
      } catch (error) {
        console.error('删除任务失败', error)
      }
    },
    async clearAllTasks() {
      // 先重新获取任务列表，确保 ids 是最新的
      await this.fetchTasks()
      const ids = [...this.tasks.map(t => t.id)]
      const deletePromises = ids.map(id =>
        request.delete(`/tasks/${id}`).catch(err => {
          if (err.response?.status === 404) {
            console.warn(`任务 ${id} 已不存在，跳过删除`)
            return
          }
          throw err
        })
      )
      
      try {
        await Promise.all(deletePromises)
        this.tasks = []
      } catch (error) {
        console.error('清空任务失败', error)
        // 重新获取最新任务列表，保证数据一致性
        await this.fetchTasks()
      }
    },
    // 拖拽排序后更新 order 字段
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