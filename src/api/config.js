// API 配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5218'

export const API_ENDPOINTS = {
  // 认证相关
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  
  // 比赛相关
  EVENTS: '/api/events',
  EVENT_DETAIL: (id) => `/api/events/${id}`,
  
  // 报名相关
  REGISTRATIONS: '/api/registrations',
  MY_REGISTRATIONS: '/api/registrations/my',
  EVENT_REGISTRATIONS: (eventId) => `/api/registrations/event/${eventId}`,
  
  // 获奖相关
  WINNERS: '/api/winners',
  EVENT_WINNERS: (eventId) => `/api/winners/event/${eventId}`,
  
  // 图片上传
  UPLOAD_IMAGE: '/api/upload/image'
}

