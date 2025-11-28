<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('home.welcome') }}</h1>
        <p class="hero-subtitle">{{ $t('home.subtitle') }}</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="router.push('/events')">
            {{ $t('nav.events') }}
          </el-button>
          <el-button size="large" @click="router.push('/register')" v-if="!authStore.isLoggedIn">
            {{ $t('nav.register') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <div class="section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.title') }}</h2>
        <p class="description">{{ $t('home.description') }}</p>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.features.title') }}</h2>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" v-for="(feature, index) in features" :key="index">
            <div class="feature-card">
              <el-icon :size="50" :color="feature.color">
                <component :is="feature.icon" />
              </el-icon>
              <h3>{{ $t(`home.features.feature${index + 1}`) }}</h3>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Upcoming Events Section -->
    <div class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('event.status.upcoming') }}</h2>
          <el-button @click="router.push('/events')">
            {{ locale === 'zh-CN' ? '查看全部' : 'View All' }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="event in upcomingEvents" :key="event.id">
            <el-card class="event-card" :body-style="{ padding: '0' }" shadow="hover">
              <img :src="event.image" class="event-image" />
              <div class="event-content">
                <h3>{{ locale === 'zh-CN' ? event.name : event.nameEn }}</h3>
                <div class="event-info">
                  <div class="info-item">
                    <el-icon><Calendar /></el-icon>
                    <span>{{ event.date }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Location /></el-icon>
                    <span>{{ locale === 'zh-CN' ? event.location : event.locationEn }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span>{{ event.currentParticipants }}/{{ event.maxParticipants }}</span>
                  </div>
                </div>
                <el-button type="primary" style="width: 100%; margin-top: 10px" @click="router.push(`/events/${event.id}`)">
                  {{ $t('event.detail') }}
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Statistics Section -->
    <div class="stats-section">
      <div class="container">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8" v-for="stat in stats" :key="stat.label">
            <div class="stat-card">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { eventsApi } from '@/api/events'
import { statisticsApi } from '@/api/statistics'

const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

// 统计数据
const totalEvents = ref(0)
const totalRegistrations = ref(0)
const totalWinners = ref(0)

// 即将开始的比赛
const upcomingEvents = ref([])

// 加载比赛数据和统计数据
onMounted(async () => {
  // 并行加载所有数据
  await Promise.all([
    loadUpcomingEvents(),
    loadStatistics()
  ])
})

// 加载即将开始的比赛（从专用接口）
const loadUpcomingEvents = async () => {
  try {
    const response = await eventsApi.getUpcomingEvents(3)
    if (response.success) {
      upcomingEvents.value = response.data || []
    }
  } catch (error) {
    console.error('Load upcoming events error:', error)
  }
}

// 加载统计数据（一个接口返回所有统计数据）
const loadStatistics = async () => {
  try {
    const response = await statisticsApi.getStatistics()
    if (response.success) {
      totalEvents.value = response.data?.totalEvents || 0
      totalRegistrations.value = response.data?.totalRegistrations || 0
      totalWinners.value = response.data?.totalWinners || 0
    }
  } catch (error) {
    console.error('Load statistics error:', error)
    // 静默失败，不影响页面其他功能
  }
}

const features = [
  { icon: 'Basketball', color: '#409eff' },
  { icon: 'Trophy', color: '#67c23a' },
  { icon: 'Medal', color: '#e6a23c' },
  { icon: 'Promotion', color: '#f56c6c' }
]

const stats = computed(() => [
  {
    value: totalEvents.value,
    label: locale.value === 'zh-CN' ? '比赛项目' : 'Events'
  },
  {
    value: totalRegistrations.value,
    label: locale.value === 'zh-CN' ? '报名人数' : 'Registrations'
  },
  {
    value: totalWinners.value,
    label: locale.value === 'zh-CN' ? '获奖者' : 'Winners'
  }
])
</script>

<style lang="scss" scoped>
.home-page {
  margin: 0;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 48px;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .hero-subtitle {
    font-size: 24px;
    margin-bottom: 40px;
    opacity: 0.9;
  }

  .hero-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
}

.section {
  padding: 60px 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }

  .description {
    font-size: 18px;
    line-height: 1.8;
    color: #666;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }
}

.features-section {
  background: #f5f5f5;
  padding: 60px 20px;

  .feature-card {
    text-align: center;
    padding: 30px;
    background: white;
    border-radius: 8px;
    margin-bottom: 20px;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    h3 {
      margin-top: 20px;
      font-size: 20px;
    }
  }
}

.event-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;

  .event-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .event-content {
    padding: 20px;

    h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
    }

    .event-info {
      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: #666;
        font-size: 14px;
      }
    }
  }
}

.stats-section {
  background: #001529;
  color: white;
  padding: 60px 20px;

  .stat-card {
    text-align: center;

    .stat-value {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .stat-label {
      font-size: 18px;
      opacity: 0.8;
    }
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 20px;

    .hero-title {
      font-size: 32px;
    }

    .hero-subtitle {
      font-size: 18px;
    }

    .hero-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .section-title {
    font-size: 24px;
  }
}
</style>

