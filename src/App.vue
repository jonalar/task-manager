<template>
  <div>
    <div v-if="userStore.token" style="position: fixed; top: 20px; right: 20px; z-index: 100">
      <el-button type="danger" @click="logout">退出登录</el-button>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'

const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>