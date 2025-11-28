<template>
  <div class="event-detail-page page-container" v-if="event" v-loading="loading">
    <el-button @click="router.back()" style="margin-bottom: 20px">
      <el-icon><ArrowLeft /></el-icon>
      {{ $t('common.back') }}
    </el-button>

    <el-card>
      <el-row :gutter="40">
        <el-col :xs="24" :md="12">
          <img :src="event.image" class="event-image" />
        </el-col>
        
        <el-col :xs="24" :md="12">
          <div class="event-header">
            <h1>{{ locale === 'zh-CN' ? event.name : event.nameEn }}</h1>
            <el-tag :type="getStatusType(event.computedStatus)" size="large">
              {{ $t(`event.status.${event.computedStatus}`) }}
            </el-tag>
          </div>

          <el-descriptions :column="1" border class="event-info">
            <el-descriptions-item :label="$t('event.date')">
              <el-icon><Calendar /></el-icon>
              {{ event.date }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('event.location')">
              <el-icon><Location /></el-icon>
              {{ locale === 'zh-CN' ? event.location : event.locationEn }}
              <el-button link type="primary" @click="viewMap">
                {{ locale === 'zh-CN' ? '查看地图' : 'View Map' }}
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('event.participants')">
              <el-icon><User /></el-icon>
              {{ event.currentParticipants }} / {{ event.maxParticipants }}
              <el-progress
                :percentage="(event.currentParticipants / event.maxParticipants * 100).toFixed(0)"
                :color="getProgressColor()"
                style="margin-top: 5px"
              />
            </el-descriptions-item>
            <el-descriptions-item :label="$t('event.prize')">
              <el-icon><Medal /></el-icon>
              {{ locale === 'zh-CN' ? event.prize : event.prizeEn }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="action-buttons">
            <el-button
              v-if="event.computedStatus === 'upcoming'"
              type="primary"
              size="large"
              @click="handleRegister"
              :disabled="event.currentParticipants >= event.maxParticipants"
              style="width: 100%"
            >
              <el-icon><Edit /></el-icon>
              {{ event.currentParticipants >= event.maxParticipants ? (locale === 'zh-CN' ? '报名已满' : 'Registration Full') : $t('event.register') }}
            </el-button>
            <el-button
              v-else-if="event.computedStatus === 'finished'"
              type="success"
              size="large"
              @click="viewWinners"
              style="width: 100%"
            >
              <el-icon><Trophy /></el-icon>
              {{ locale === 'zh-CN' ? '查看获奖名单' : 'View Winners' }}
            </el-button>
          </div>
        </el-col>
      </el-row>

      <el-divider />

      <div class="event-details">
        <h2>{{ $t('event.description') }}</h2>
        <p>{{ locale === 'zh-CN' ? event.description : event.descriptionEn }}</p>

        <h2>{{ $t('event.requirements') }}</h2>
        <p>{{ locale === 'zh-CN' ? event.requirements : event.requirementsEn }}</p>
      </div>
    </el-card>
  </div>
  
  <el-empty v-else :description="$t('common.noData')" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { eventsApi } from '@/api/events'
import { enrichEventWithStatus } from '@/utils/eventStatus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const event = ref(null)
const loading = ref(false)

// 从 API 加载完整的比赛详情
onMounted(() => {
  loadEventDetail()
})

const loadEventDetail = async () => {
  loading.value = true
  try {
    const response = await eventsApi.getEventById(route.params.id)
    if (response.success) {
      // 为事件添加计算后的状态
      event.value = enrichEventWithStatus(response.data)
    } else {
      ElMessage.error(response.message || '加载失败')
      router.back()
    }
  } catch (error) {
    console.error('Load event detail error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '加载失败' : 'Load failed')
    router.back()
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const types = {
    upcoming: 'warning',
    ongoing: 'success',
    finished: 'info'
  }
  return types[status] || 'info'
}

const getProgressColor = () => {
  if (!event.value) return '#67c23a'
  const percentage = (event.value.currentParticipants / event.value.maxParticipants) * 100
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
}

const handleRegister = () => {
  if (!event.value) return
  if (!authStore.isLoggedIn) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请先登录' : 'Please login first')
    router.push({ name: 'Login', query: { redirect: `/registration/${event.value.id}` } })
    return
  }
  router.push(`/registration/${event.value.id}`)
}

const viewMap = () => {
  router.push({ name: 'Map', query: { location: event.value.location } })
}

const viewWinners = () => {
  router.push({ name: 'Winners', query: { eventId: event.value.id } })
}
</script>

<style lang="scss" scoped>
.event-detail-page {
  .event-image {
    width: 100%;
    border-radius: 8px;
    object-fit: cover;
    max-height: 400px;
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;

    h1 {
      margin: 0;
      font-size: 32px;
    }
  }

  .event-info {
    margin-bottom: 20px;
  }

  .action-buttons {
    margin-top: 30px;
  }

  .event-details {
    margin-top: 20px;

    h2 {
      font-size: 24px;
      margin: 30px 0 15px 0;
      color: #333;
    }

    p {
      font-size: 16px;
      line-height: 1.8;
      color: #666;
    }
  }
}

@media (max-width: 768px) {
  .event-header {
    flex-direction: column;
    gap: 10px;

    h1 {
      font-size: 24px;
    }
  }
}
</style>

