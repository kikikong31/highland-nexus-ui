import apiClient from './axios'

export const eventsApi = {
  // 获取比赛列表（分页、搜索、过滤）
  getEvents(params = {}) {
    return apiClient.get('/api/events', { params })
  },

  // 获取即将开始的比赛（用于首页）
  getUpcomingEvents(limit = 3) {
    return apiClient.get('/api/events/upcoming', { params: { limit } })
  },

  // 获取比赛详情
  getEventById(id) {
    return apiClient.get(`/api/events/${id}`)
  },

  // 创建比赛（管理员）
  createEvent(eventData) {
    return apiClient.post('/api/events', eventData)
  },

  // 更新比赛（管理员）
  updateEvent(id, eventData) {
    return apiClient.put(`/api/events/${id}`, eventData)
  },

  // 删除比赛（管理员）
  deleteEvent(id) {
    return apiClient.delete(`/api/events/${id}`)
  }
}

