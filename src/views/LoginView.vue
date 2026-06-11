<template>
  <el-form :model="form" label-width="80px" style="width: 300px; margin: 100px auto">
    <el-form-item label="用户名">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码">
      <el-input type="password" v-model="form.password" />
    </el-form-item>
    <el-button type="primary" @click="handleLogin">登录</el-button>
  </el-form>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const form = reactive({ username: '', password: '' })

const handleLogin = async () => {
  const ok = await userStore.login(form.username, form.password)
  if (ok) router.push('/tasks')
  else alert('登录失败')
}
</script>