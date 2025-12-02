import apiClient from './axios'

export const statisticsApi = {
  // Get overall statistics
  getStatistics() {
    return apiClient.get('/api/statistics')
  }
}

