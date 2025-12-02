import apiClient from './axios'

export const registrationsApi = {
  //  Get my registrations
  getMyRegistrations() {
    return apiClient.get('/api/registrations/my')
  },

  // Create new registration
  createRegistration(registrationData) {
    return apiClient.post('/api/registrations', registrationData)
  },

  // Get all registrations (admin)
  getAllRegistrations() {
    return apiClient.get('/api/registrations')
  },

  // Get registrations by event ID (admin)
  getEventRegistrations(eventId) {
    return apiClient.get(`/api/registrations/event/${eventId}`)
  },

  //  Update registration status (admin)
  updateRegistrationStatus(id, status) {
    return apiClient.put(`/api/registrations/${id}/status`, { status })
  },

  // Delete registration
  deleteRegistration(id) {
    return apiClient.delete(`/api/registrations/${id}`)
  }
}

