// API base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5218'

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  
  // Events DEtails
  EVENTS: '/api/events',
  EVENT_DETAIL: (id) => `/api/events/${id}`,
  
  // Event Registrations
  REGISTRATIONS: '/api/registrations',
  MY_REGISTRATIONS: '/api/registrations/my',
  EVENT_REGISTRATIONS: (eventId) => `/api/registrations/event/${eventId}`,
  
  // Event Winners
  WINNERS: '/api/winners',
  EVENT_WINNERS: (eventId) => `/api/winners/event/${eventId}`,
  
  // Upload Image
  UPLOAD_IMAGE: '/api/upload/image'
}

