import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Login
  async function login(credentials) {
    try {
      const response = await authApi.login(credentials)
      
      // Check unified response format
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
        // Failed to login, return error message
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

  //  Register
  async function register(userData) {
    try {
      const response = await authApi.register(userData)
      
      // Check unified response format
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
        // Failed to register, return error message
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

  // Logout
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Initialize user from localStorage
  function initUser() {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser)
    }
  }

  // Initialize on store creation
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

