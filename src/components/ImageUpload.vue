<template>
  <div class="image-upload">
    <el-upload
      v-if="!imageUrl"
      class="upload-demo"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :show-file-list="false"
      accept="image/*"
      :disabled="uploading"
    >
      <el-button type="primary" :loading="uploading">
        <el-icon v-if="!uploading"><Upload /></el-icon>
        {{ uploading ? $t('common.uploading', '上传中...') : $t('common.upload', '上传图片') }}
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          {{ $t('common.uploadTip', '支持 jpg/png/gif/webp 格式，不超过 5MB') }}
        </div>
      </template>
    </el-upload>
    
    <div v-else class="preview-container">
      <el-image 
        :src="imageUrl" 
        :preview-src-list="[imageUrl]"
        fit="cover"
        class="preview-image"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>{{ $t('common.imageLoadError', '图片加载失败') }}</span>
          </div>
        </template>
      </el-image>
      <div class="preview-actions">
        <el-button type="danger" size="small" @click="handleDelete" :loading="deleting">
          {{ deleting ? $t('common.deleting', '删除中...') : $t('common.delete', '删除') }}
        </el-button>
        <el-button type="primary" size="small" @click="handleReupload">
          {{ $t('common.reupload', '重新上传') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Picture } from '@element-plus/icons-vue'
import { uploadApi } from '@/api/upload'
import { API_BASE_URL } from '@/api/config'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const imageUrl = ref(props.modelValue)
const uploading = ref(false)
const deleting = ref(false)

const uploadUrl = computed(() => {
  return `${API_BASE_URL}/api/upload/image`
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`
  }
})

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  
  uploading.value = true
  return true
}

const handleSuccess = (response) => {
  uploading.value = false
  if (response.success) {
    imageUrl.value = response.data
    emit('update:modelValue', response.data)
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

const handleError = (error) => {
  uploading.value = false
  console.error('Upload error:', error)
  ElMessage.error('图片上传失败')
}

const handleDelete = async () => {
  if (!imageUrl.value) return
  
  deleting.value = true
  try {
    const response = await uploadApi.deleteImage(imageUrl.value)
    if (response.success) {
      imageUrl.value = ''
      emit('update:modelValue', '')
      ElMessage.success('图片删除成功')
    } else {
      ElMessage.error(response.message || '图片删除失败')
    }
  } catch (error) {
    console.error('Delete error:', error)
    ElMessage.error('图片删除失败')
  } finally {
    deleting.value = false
  }
}

const handleReupload = () => {
  imageUrl.value = ''
  emit('update:modelValue', '')
}

// Watch props change
watch(() => props.modelValue, (newVal) => {
  imageUrl.value = newVal
})
</script>

<style lang="scss" scoped>
.image-upload {
  .upload-demo {
    :deep(.el-upload__tip) {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
    }
  }

  .preview-container {
    margin-top: 16px;
    
    .preview-image {
      width: 300px;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      
      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #f5f7fa;
        color: #909399;
        
        .el-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }
      }
    }
    
    .preview-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }
  }
}
</style>

