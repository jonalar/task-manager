<template>
  <div>
    <h1>任务列表</h1>
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px">
      <el-button type="primary" @click="openAddDialog">新增任务</el-button>
      <el-select v-model="filterCategory" placeholder="分类筛选" clearable style="width: 120px">
        <el-option
          v-for="cat in taskStore.categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.name"
        />
      </el-select>
      <el-button type="danger" @click="taskStore.clearAllTasks">清空所有</el-button>
    </div>

    <el-table :data="filteredTasks" row-key="id" style="width: 100%">
      <el-table-column prop="order" label="顺序" width="60" />
      <el-table-column prop="name" label="任务名称" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="dueDate" label="截止日期" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.completed" @change="() => taskStore.updateTask(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" @click="taskStore.deleteTask(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="任务" @close="resetForm">
      <el-input v-model="form.name" placeholder="任务名称" />
      <el-select v-model="form.category" placeholder="选择分类" style="width: 100%; margin-top: 10px">
        <el-option
          v-for="cat in taskStore.categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.name"
        />
      </el-select>
      <el-date-picker
        v-model="form.dueDate"
        type="date"
        placeholder="截止日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 100%; margin-top: 10px"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useTaskStore } from '@/stores/task'
import Sortable from 'sortablejs'

const taskStore = useTaskStore()
const dialogVisible = ref(false)
const editingId = ref(null)
const filterCategory = ref('')
const form = reactive({ name: '', category: '', dueDate: '' })

const filteredTasks = computed(() => {
  if (!filterCategory.value) return taskStore.tasks
  return taskStore.tasks.filter(t => t.category === filterCategory.value)
})

const openAddDialog = () => {
  editingId.value = null
  form.name = ''
  form.category = taskStore.categories[0]?.name || ''
  form.dueDate = ''
  dialogVisible.value = true
}

const openEditDialog = (task) => {
  editingId.value = task.id
  form.name = task.name
  form.category = task.category
  form.dueDate = task.dueDate
  dialogVisible.value = true
}

const submit = async () => {
  if (editingId.value) {
    const task = taskStore.tasks.find(t => t.id === editingId.value)
    if (task) {
      task.name = form.name
      task.category = form.category
      task.dueDate = form.dueDate
      await taskStore.updateTask(task)
    }
  } else {
    if (form.name.trim()) {
      await taskStore.addTask(form.name, form.category, form.dueDate)
    }
  }
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.name = ''
  form.category = taskStore.categories[0]?.name || ''
  form.dueDate = ''
  editingId.value = null
}

// 拖拽排序
const initSortable = async () => {
  await nextTick()
  const tbody = document.querySelector('.el-table__body-wrapper tbody')
  if (!tbody) return
  Sortable.create(tbody, {
    animation: 150,
    onEnd: async (evt) => {
      const { oldIndex, newIndex } = evt
      if (oldIndex === newIndex) return
      const newTasks = [...taskStore.tasks]
      const [moved] = newTasks.splice(oldIndex, 1)
      newTasks.splice(newIndex, 0, moved)
      newTasks.forEach((task, idx) => (task.order = idx + 1))
      await taskStore.updateOrder(newTasks)
    }
  })
}

onMounted(async () => {
  await taskStore.fetchCategories()
  await taskStore.fetchTasks()
  await initSortable()
})
</script>

<style scoped>
h1 { margin-bottom: 20px; }
</style>