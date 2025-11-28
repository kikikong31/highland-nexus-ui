import apiClient from './axios'
import { API_BASE_URL } from './config'

export const uploadApi = {
  // 上传图片
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 删除图片
  deleteImage(imageUrl) {
    return apiClient.delete(`/api/upload/image?imageUrl=${encodeURIComponent(imageUrl)}`)
  },

  // 获取上传地址（用于 el-upload 的 action 属性）
  getUploadUrl() {
    return `${API_BASE_URL}/api/upload/image`
  }
}

