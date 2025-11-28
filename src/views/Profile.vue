<template>
  <div class="profile-page page-container">
    <div class="page-header">
      <h1>{{ $t('profile.title') }}</h1>
    </div>

    <el-row :gutter="20">
      <!-- User Info Card -->
      <el-col :xs="24" :md="8">
        <el-card class="user-card">
          <div class="user-avatar">
            <el-avatar :size="100" :icon="UserFilled" />
          </div>
          <h2>{{ authStore.user?.name }}</h2>
          <p class="user-email">{{ authStore.user?.email }}</p>
          <el-tag v-if="authStore.isAdmin" type="danger">{{ locale === 'zh-CN' ? '管理员' : 'Administrator' }}</el-tag>
          <el-tag v-else type="primary">{{ locale === 'zh-CN' ? '普通用户' : 'User' }}</el-tag>
          
          <el-divider />
          
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ myRegistrations.length }}</div>
              <div class="stat-label">{{ locale === 'zh-CN' ? '我的报名' : 'My Registrations' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Registrations List -->
      <el-col :xs="24" :md="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>{{ $t('profile.myRegistrations') }}</h3>
            </div>
          </template>

          <div v-loading="loading">
            <el-empty v-if="myRegistrations.length === 0 && !loading" :description="$t('profile.noRegistrations')" />

            <div v-if="myRegistrations.length > 0" class="registrations-list">
            <el-card
              v-for="registration in myRegistrations"
              :key="registration.id"
              class="registration-card"
              shadow="hover"
            >
              <el-row :gutter="20">
                <el-col :xs="24" :md="16">
                  <h3>{{ locale === 'zh-CN' ? registration.eventsName : registration.eventsNameEn }}</h3>
                  <div class="registration-info">
                    <div class="info-item">
                      <el-icon><Calendar /></el-icon>
                      <span>{{ locale === 'zh-CN' ? '提交时间' : 'Submitted' }}: {{ formatDate(registration.createdAt) }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Phone /></el-icon>
                      <span>{{ registration.phone }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Message /></el-icon>
                      <span>{{ registration.email }}</span>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :md="8" class="registration-status">
                  <el-tag :type="getStatusType(registration.status)" size="large">
                    {{ $t(`profile.status.${registration.status}`) }}
                  </el-tag>
                  <el-button
                    type="primary"
                    link
                    @click="viewEventDetail(registration.eventId)"
                  >
                    {{ $t('profile.viewDetail') }}
                  </el-button>
                </el-col>
              </el-row>
            </el-card>
          </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { UserFilled } from '@element-plus/icons-vue'
import { registrationsApi } from '@/api/registrations'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const myRegistrations = ref([])
const loading = ref(false)

// 加载我的报名
onMounted(() => {
  loadMyRegistrations()
})

const loadMyRegistrations = async () => {
  loading.value = true
  try {
    const response = await registrationsApi.getMyRegistrations()
    if (response.success) {
      myRegistrations.value = response.data || []
    } else {
      ElMessage.error(response.message || (locale.value === 'zh-CN' ? '加载失败' : 'Load failed'))
    }
  } catch (error) {
    console.error('Load registrations error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '加载失败' : 'Load failed')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US')
}

const viewEventDetail = (eventId) => {
  router.push(`/events/${eventId}`)
}
</script>

<style lang="scss" scoped>
.profile-page {
  .user-card {
    text-align: center;

    .user-avatar {
      margin-bottom: 20px;
    }

    h2 {
      margin: 10px 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-email {
      color: #666;
      margin-bottom: 10px;
      font-size: 14px;
      word-break: break-word;
    }

    .user-stats {
      margin-top: 20px;

      .stat-item {
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #409eff;
        }

        .stat-label {
          color: #666;
          margin-top: 5px;
          font-size: 14px;
        }
      }
    }
  }

  .card-header {
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .registrations-list {
    .registration-card {
      margin-bottom: 15px;

      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .registration-info {
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #666;
          font-size: 14px;
        }
      }

      .registration-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
    }
  }
}

@media (max-width: 768px) {
  .registration-status {
    margin-top: 15px;
    align-items: flex-start !important;
  }
}
</style>

