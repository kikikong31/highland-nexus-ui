import apiClient from './axios'

export const eventsApi = {
  // Get list of events with optional filters
  getEvents(params = {}) {
    return apiClient.get('/api/events', { params })
  },

  // Get upcoming events (limit to 3 by default)
  getUpcomingEvents(limit = 3) {
    return apiClient.get('/api/events/upcoming', { params: { limit } })
  },

  // Get event by ID
  getEventById(id) {
    return apiClient.get(`/api/events/${id}`)
  },

  // Create new event (admin)
  createEvent(eventData) {
    return apiClient.post('/api/events', eventData)
  },

  // Update event (admin)
  updateEvent(id, eventData) {
    return apiClient.put(`/api/events/${id}`, eventData)
  },

  // Delete event (admin)
  deleteEvent(id) {
    return apiClient.delete(`/api/events/${id}`)
  }
}

