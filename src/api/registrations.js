import apiClient from './axios'

export const registrationsApi = {
  // 获取我的报名
  getMyRegistrations() {
    return apiClient.get('/api/registrations/my')
  },

  // 创建报名
  createRegistration(registrationData) {
    return apiClient.post('/api/registrations', registrationData)
  },

  // 获取所有报名（管理员）
  getAllRegistrations() {
    return apiClient.get('/api/registrations')
  },

  // 获取比赛的所有报名（管理员）
  getEventRegistrations(eventId) {
    return apiClient.get(`/api/registrations/event/${eventId}`)
  },

  // 更新报名状态（管理员）
  updateRegistrationStatus(id, status) {
    return apiClient.put(`/api/registrations/${id}/status`, { status })
  },

  // 删除报名（管理员）
  deleteRegistration(id) {
    return apiClient.delete(`/api/registrations/${id}`)
  }
}

