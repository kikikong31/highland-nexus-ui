import apiClient from './axios'

export const winnersApi = {
  // 获取所有获奖记录
  getAllWinners() {
    return apiClient.get('/api/winners')
  },

  // 获取比赛的获奖记录
  getEventWinners(eventId) {
    return apiClient.get(`/api/winners/event/${eventId}`)
  },

  // 获取比赛的参与者列表（用于添加获奖者时选择）
  getEventParticipants(eventId) {
    return apiClient.get(`/api/winners/event/${eventId}/participants`)
  },

  // 获取获奖记录详情
  getWinnerById(id) {
    return apiClient.get(`/api/winners/${id}`)
  },

  // 创建获奖记录（管理员）
  createWinner(winnerData) {
    return apiClient.post('/api/winners', winnerData)
  },

  // 更新获奖记录（管理员）
  updateWinner(id, winnerData) {
    return apiClient.put(`/api/winners/${id}`, winnerData)
  },

  // 删除获奖记录（管理员）
  deleteWinner(id) {
    return apiClient.delete(`/api/winners/${id}`)
  }
}

