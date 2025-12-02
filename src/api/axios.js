import axios from 'axios'
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from './config'

// Create an instance of axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // add token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data

    if (data.hasOwnProperty('success')) {
      if (!data.success && data.message) {

      }
      return data
    }

    return data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      // 401 will only redirect when not on the login/registration interface.
      if (status === 401) {
        const url = error.config?.url || ''
        if (!url.includes('/login') && !url.includes('/register')) {
          ElMessage.error('Your login has expired. Please log in again.')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      } else if (status === 403) {
        ElMessage.error('No access rights granted.')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status === 500) {
        ElMessage.error('服务器错误')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default apiClient

