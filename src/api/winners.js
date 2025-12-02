import apiClient from './axios'

export const winnersApi = {
  // All winners list
  getAllWinners() {
    return apiClient.get('/api/winners')
  },

  // Get winners by event ID
  getEventWinners(eventId) {
    return apiClient.get(`/api/winners/event/${eventId}`)
  },

  // Get event participants for winner selection
  getEventParticipants(eventId) {
    return apiClient.get(`/api/winners/event/${eventId}/participants`)
  },

  // Get winner by ID
  getWinnerById(id) {
    return apiClient.get(`/api/winners/${id}`)
  },

  // Create new winner record (admin)
  createWinner(winnerData) {
    return apiClient.post('/api/winners', winnerData)
  },

  // Update winner record (admin)
  updateWinner(id, winnerData) {
    return apiClient.put(`/api/winners/${id}`, winnerData)
  },

  // Delete winner record (admin)
  deleteWinner(id) {
    return apiClient.delete(`/api/winners/${id}`)
  }
}

