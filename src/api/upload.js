import apiClient from './axios'
import { API_BASE_URL } from './config'

export const uploadApi = {
  // Upload image
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Delete image
  deleteImage(imageUrl) {
    return apiClient.delete(`/api/upload/image?imageUrl=${encodeURIComponent(imageUrl)}`)
  },

  // Get upload URL
  getUploadUrl() {
    return `${API_BASE_URL}/api/upload/image`
  }
}

