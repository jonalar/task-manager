import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,  // 30秒
  retry: 2,        // 重试次数（需要额外配置）
  retryDelay: 1000 // 重试间隔
})

export default request