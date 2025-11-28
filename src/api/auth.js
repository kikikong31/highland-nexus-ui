import apiClient from './axios'
import { API_ENDPOINTS } from './config'

export const authApi = {
  // 登录
  login(credentials) {
    return apiClient.post(API_ENDPOINTS.LOGIN, credentials)
  },

  // 注册
  register(userData) {
    return apiClient.post(API_ENDPOINTS.REGISTER, userData)
  }
}

