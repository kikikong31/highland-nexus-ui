import apiClient from './axios'

/**
 * 管理员相关 API
 */
export const adminApi = {
  /**
   * 获取管理员统计数据
   */
  getStatistics() {
    return apiClient.get('/api/admin/AdminStatistics')
  }
}

