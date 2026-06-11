<template>
  <div>
    <h1>任务列表</h1>
    <div style="display: flex; align-items: center; margin-bottom: 10px">
      <el-button type="primary" @click="openAddDialog">新增任务</el-button>
       <el-select v-model="newTaskCategory" placeholder="选择分类" style="width: 120px; margin-left: 10px">
        <el-option  value="工作">工作</el-option>
        <el-option  value="个人">个人</el-option>
        <el-option  value="学习">学习</el-option>
</el-select> 
      <el-date-picker v-model="newTaskDueDate" type="date" placeholder="选择截止日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 160px; margin-left: 10px"/>
   
      <el-button type="danger" @click="taskStore.clearAllTasks" style="margin-left: 10px">清空所有任务</el-button>
    </div>

    <el-radio-group v-model="filterCategory" style="margin-bottom: 15px">
      <el-radio-button value="全部" >全部</el-radio-button>
      <el-radio-button value="工作" >工作</el-radio-button>
      <el-radio-button value="个人" >个人</el-radio-button>
      <el-radio-button value="学习" >学习</el-radio-button>
    </el-radio-group>

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

    <el-dialog v-model="dialogVisible" title="任务" @close="resetForm">
      <el-input v-model="form.name" placeholder="任务名称" />
      <el-select  v-model="form.category" placeholder="选择分类" style="width: 100%; margin-top: 10px">
        <el-option  value="工作">工作</el-option>
        <el-option  value="个人">个人</el-option>
        <el-option  value="学习">学习</el-option>
      </el-select>
      <el-date-picker
   
        v-model="form.dueDate"
        type="date"
        placeholder="选择截止日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 100%; margin-top: 10px" />
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
const form = reactive({ name: '' ,category:'', dueDate:''})
const newTaskCategory = ref('学习')
 const newTaskDueDate = ref('')
 const filterCategory = ref('全部')

const filteredTasks = computed(() => {
  if (filterCategory.value === '全部') {
    return taskStore.tasks
  }
  return taskStore.tasks.filter(t => t.category === filterCategory.value)
})

const openAddDialog = () => {
  editingId.value = null
  form.name = ''
   //newTaskCategory.value = '学习'
  // newTaskDueDate.value = ''
  //默认类别
    form.category='学习'
  form.dueDate = ''
  dialogVisible.value = true
}

const openEditDialog = (task) => {
  editingId.value = task.id
  form.name = task.name
  form.category=task.category
  form.dueDate=task.dueDate
  // 编辑时分类和日期不可修改，为简化，不处理
  dialogVisible.value = true
}

const submit = async () => {
  if (editingId.value) {
    const task = taskStore.tasks.find(et => et.id === editingId.value)
    if (task) {
      task.name = form.name
      task.category=form.category
      task.dueDate=form.dueDate
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
  
  
  //newTaskCategory.value = '学习'

  form.category = ''
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
      // 注意 filteredTasks 是计算属性，需要基于原 tasks 排序
      const newTasks = [...taskStore.tasks]
      const [movedItem] = newTasks.splice(oldIndex, 1)
      newTasks.splice(newIndex, 0, movedItem)
      newTasks.forEach((task, idx) => {
        task.order = idx + 1
      })
      await taskStore.updateOrder(newTasks)
    }
  })
}

onMounted(async () => {
  await taskStore.fetchTasks()
  await initSortable()
})
</script>