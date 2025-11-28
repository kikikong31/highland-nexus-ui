import apiClient from './axios'

export const statisticsApi = {
  // 获取统计数据（比赛总数、报名总数、获奖者总数）
  getStatistics() {
    return apiClient.get('/api/statistics')
  }
}

