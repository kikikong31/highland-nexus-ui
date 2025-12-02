import apiClient from './axios'

/**
 * Administrator-related APIs
 */
export const adminApi = {
  /**
   * Get administrator statistics
   */
  getStatistics() {
    return apiClient.get('/api/admin/AdminStatistics')
  }
}

