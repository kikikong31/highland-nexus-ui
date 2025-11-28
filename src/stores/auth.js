import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // 登录
  async function login(credentials) {
    try {
      const response = await authApi.login(credentials)
      
      // 检查统一响应格式
      if (response.success && response.data) {
        user.value = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }
        token.value = response.data.token
        
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(user.value))
        
        return { success: true }
      } else {
        // 登录失败，返回错误消息
        return { 
          success: false, 
          message: response.message || '登录失败'
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败'
      }
    }
  }

  // 注册
  async function register(userData) {
    try {
      const response = await authApi.register(userData)
      
      // 检查统一响应格式
      if (response.success && response.data) {
        user.value = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }
        token.value = response.data.token
        
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(user.value))
        
        return { success: true }
      } else {
        // 注册失败，返回错误消息
        return { 
          success: false, 
          message: response.message || '注册失败'
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '注册失败'
      }
    }
  }

  // 登出
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化用户信息
  function initUser() {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser)
    }
  }

  // 初始化
  initUser()

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout
  }
})

