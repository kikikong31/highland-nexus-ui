import apiClient from './axios'
import { API_ENDPOINTS } from './config'

export const authApi = {
  // login
  login(credentials) {
    return apiClient.post(API_ENDPOINTS.LOGIN, credentials)
  },

  // register
  register(userData) {
    return apiClient.post(API_ENDPOINTS.REGISTER, userData)
  }
}

