<template>
  <div class="dashboard-page">
    <!-- Statistics Cards -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in statistics" :key="stat.key">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="30">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- Event Status Chart -->
      <el-col :xs="24" :md="12">
        <el-card v-loading="loading">
          <template #header>
            <h3>{{ locale === 'zh-CN' ? '比赛状态分布' : 'Event Status Distribution' }}</h3>
          </template>
          <div class="chart-container">
            <div class="pie-chart">
              <div
                v-for="status in eventStatusData"
                :key="status.name"
                class="pie-item"
                :style="{ background: status.color }"
              >
                <div class="pie-label">{{ status.name }}</div>
                <div class="pie-value">{{ status.value }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Registration Status Chart -->
      <el-col :xs="24" :md="12">
        <el-card v-loading="loading">
          <template #header>
            <h3>{{ locale === 'zh-CN' ? '报名审核状态' : 'Registration Status' }}</h3>
          </template>
          <div class="chart-container">
            <div class="bar-chart">
              <div
                v-for="status in registrationStatusData"
                :key="status.name"
                class="bar-item"
              >
                <div class="bar-label">{{ status.name }}</div>
                <div class="bar-wrapper">
                  <div
                    class="bar-fill"
                    :style="{
                      width: `${(status.value / maxRegistrationValue) * 100}%`,
                      background: status.color
                    }"
                  >
                    {{ status.value }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent Activities -->
    <el-card style="margin-top: 20px" v-loading="loading">
      <template #header>
        <h3>{{ locale === 'zh-CN' ? '最近活动' : 'Recent Activities' }}</h3>
      </template>
      
      <el-timeline v-if="recentActivities.length > 0">
        <el-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :timestamp="activity.timestamp"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else :description="locale === 'zh-CN' ? '暂无活动记录' : 'No recent activities'" />
    </el-card>

    <!-- Quick Actions -->
    <el-card style="margin-top: 20px">
      <template #header>
        <h3>{{ locale === 'zh-CN' ? '快捷操作' : 'Quick Actions' }}</h3>
      </template>
      
      <div class="quick-actions">
        <el-button type="primary" @click="router.push('/admin/events')">
          <el-icon><Plus /></el-icon>
          {{ locale === 'zh-CN' ? '添加比赛' : 'Add Event' }}
        </el-button>
        <el-button type="success" @click="router.push('/admin/registrations')">
          <el-icon><Document /></el-icon>
          {{ locale === 'zh-CN' ? '审核报名' : 'Review Registrations' }}
        </el-button>
        <el-button type="warning" @click="router.push('/admin/winners')">
          <el-icon><Medal /></el-icon>
          {{ locale === 'zh-CN' ? '录入获奖' : 'Add Winners' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api/admin'

const router = useRouter()
const { locale, t } = useI18n()

// 统计数据
const statisticsData = ref(null)
const loading = ref(false)

// 加载统计数据
onMounted(async () => {
  await loadStatistics()
})

const loadStatistics = async () => {
  loading.value = true
  try {
    const response = await adminApi.getStatistics()
    if (response.success) {
      statisticsData.value = response.data
    } else {
      ElMessage.error(response.message || (locale.value === 'zh-CN' ? '加载失败' : 'Load failed'))
    }
  } catch (error) {
    console.error('Load statistics error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '加载统计数据失败' : 'Failed to load statistics')
  } finally {
    loading.value = false
  }
}

const statistics = computed(() => {
  if (!statisticsData.value) {
    return [
      { key: 'totalEvents', label: t('admin.statistics.totalEvents'), value: 0, icon: 'Trophy', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { key: 'totalRegistrations', label: t('admin.statistics.totalRegistrations'), value: 0, icon: 'Document', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { key: 'totalWinners', label: t('admin.statistics.totalWinners'), value: 0, icon: 'Medal', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { key: 'activeEvents', label: t('admin.statistics.activeEvents'), value: 0, icon: 'Connection', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
    ]
  }
  
  return [
    {
      key: 'totalEvents',
      label: t('admin.statistics.totalEvents'),
      value: statisticsData.value.totalEvents || 0,
      icon: 'Trophy',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      key: 'totalRegistrations',
      label: t('admin.statistics.totalRegistrations'),
      value: statisticsData.value.totalRegistrations || 0,
      icon: 'Document',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      key: 'totalWinners',
      label: t('admin.statistics.totalWinners'),
      value: statisticsData.value.totalWinners || 0,
      icon: 'Medal',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      key: 'activeEvents',
      label: t('admin.statistics.activeEvents'),
      value: statisticsData.value.activeEvents || 0,
      icon: 'Connection',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ]
})

const eventStatusData = computed(() => {
  if (!statisticsData.value?.eventStatus) {
    return [
      { name: t('event.status.upcoming'), value: 0, color: '#e6a23c' },
      { name: t('event.status.ongoing'), value: 0, color: '#67c23a' },
      { name: t('event.status.finished'), value: 0, color: '#909399' }
    ]
  }
  
  return [
    {
      name: t('event.status.upcoming'),
      value: statisticsData.value.eventStatus.upcoming || 0,
      color: '#e6a23c'
    },
    {
      name: t('event.status.ongoing'),
      value: statisticsData.value.eventStatus.ongoing || 0,
      color: '#67c23a'
    },
    {
      name: t('event.status.finished'),
      value: statisticsData.value.eventStatus.finished || 0,
      color: '#909399'
    }
  ]
})

const registrationStatusData = computed(() => {
  if (!statisticsData.value?.registrationStatus) {
    return [
      { name: t('profile.status.pending'), value: 0, color: '#e6a23c' },
      { name: t('profile.status.approved'), value: 0, color: '#67c23a' },
      { name: t('profile.status.rejected'), value: 0, color: '#f56c6c' }
    ]
  }
  
  return [
    { 
      name: t('profile.status.pending'), 
      value: statisticsData.value.registrationStatus.pending || 0, 
      color: '#e6a23c' 
    },
    { 
      name: t('profile.status.approved'), 
      value: statisticsData.value.registrationStatus.approved || 0, 
      color: '#67c23a' 
    },
    { 
      name: t('profile.status.rejected'), 
      value: statisticsData.value.registrationStatus.rejected || 0, 
      color: '#f56c6c' 
    }
  ]
})

const maxRegistrationValue = computed(() => {
  return Math.max(...registrationStatusData.value.map(s => s.value), 1)
})

const recentActivities = computed(() => {
  if (!statisticsData.value?.recentActivities) {
    return []
  }
  
  return statisticsData.value.recentActivities.map(activity => ({
    id: `activity-${activity.id}`,
    content: locale.value === 'zh-CN' ? activity.content : activity.contentEn,
    timestamp: new Date(activity.timestamp).toLocaleString(locale.value),
    type: 'primary'
  }))
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #333;
        }

        .stat-label {
          color: #666;
          margin-top: 5px;
        }
      }
    }
  }

  .chart-container {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;

    .pie-chart {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: center;

      .pie-item {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;

        .pie-label {
          font-size: 14px;
        }

        .pie-value {
          font-size: 32px;
          margin-top: 5px;
        }
      }
    }

    .bar-chart {
      width: 100%;
      padding: 20px;

      .bar-item {
        margin-bottom: 20px;

        .bar-label {
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
        }

        .bar-wrapper {
          background: #f0f2f5;
          height: 40px;
          border-radius: 4px;
          overflow: hidden;

          .bar-fill {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.3s;
            min-width: 60px;
          }
        }
      }
    }
  }

  .quick-actions {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }
}

h3 {
  margin: 0;
  font-size: 18px;
}
</style>

