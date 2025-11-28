<template>
  <div class="winners-page page-container">
    <div class="page-header">
      <h1>{{ $t('winners.title') }}</h1>
    </div>

    <!-- Filters -->
    <el-card class="filter-card">
      <el-form :inline="true">
        <el-form-item :label="$t('winners.event')">
          <el-select
            v-model="selectedEvent"
            :placeholder="locale === 'zh-CN' ? '选择比赛' : 'Select Event'"
            clearable
            style="width: 250px"
          >
            <el-option
              v-for="event in finishedEvents"
              :key="event.id"
              :label="locale === 'zh-CN' ? event.name : event.nameEn"
              :value="event.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Winners List - 按比赛分组 -->
    <div v-if="!selectedEvent">
      <!-- 显示所有比赛的获奖者（分组显示） -->
      <el-card v-for="eventGroup in groupedWinners" :key="eventGroup.eventId" style="margin-bottom: 20px;">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">
              {{ locale === 'zh-CN' ? eventGroup.eventName : eventGroup.eventNameEn }}
            </h3>
            <el-tag>{{ eventGroup.date }}</el-tag>
          </div>
        </template>

        <!-- 该比赛的领奖台 -->
        <div v-if="eventGroup.topThree.length > 0" class="mini-podium" style="margin-bottom: 20px;">
          <div class="podium-mini">
            <div v-for="winner in eventGroup.topThree" :key="winner.id" class="podium-mini-item">
              <el-tag :type="getRankType(winner.rank)" size="large" effect="dark">
                {{ getRankText(winner.rank) }}
              </el-tag>
              <div class="mini-winner-name">{{ winner.participantName }}</div>
              <div class="mini-winner-score">{{ winner.score }}</div>
            </div>
          </div>
        </div>

        <!-- 该比赛的所有获奖者列表 -->
        <el-table :data="eventGroup.winners" stripe size="small">
          <el-table-column type="index" :label="'#'" width="60" />
          
          <el-table-column :label="$t('winners.winner')" min-width="150">
            <template #default="scope">
              {{ scope.row.participantName }}
            </template>
          </el-table-column>

          <el-table-column :label="$t('winners.rank')" width="120">
            <template #default="scope">
              <el-tag :type="getRankType(scope.row.rank)" effect="dark">
                {{ getRankText(scope.row.rank) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column :label="$t('winners.score')" width="150">
            <template #default="scope">
              <el-text type="primary" size="large">
                <strong>{{ scope.row.score }}</strong>
              </el-text>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-empty v-if="groupedWinners.length === 0" :description="$t('common.noData')" :loading="loading" />
    </div>

    <!-- 选择了特定比赛时，显示该比赛的获奖者 -->
    <el-card v-else>
      <el-table :data="filteredWinners" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" :label="'#'" width="60" />
        
        <el-table-column :label="$t('winners.winner')" min-width="150">
          <template #default="scope">
            {{ scope.row.participantName }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('winners.rank')" width="120">
          <template #default="scope">
            <el-tag :type="getRankType(scope.row.rank)" effect="dark">
              {{ getRankText(scope.row.rank) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('winners.score')" width="150">
          <template #default="scope">
            <el-text type="primary" size="large">
              <strong>{{ scope.row.score }}</strong>
            </el-text>
          </template>
        </el-table-column>

        <el-table-column :label="$t('winners.date')" width="150">
          <template #default="scope">
            {{ scope.row.date }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredWinners.length === 0" :description="$t('common.noData')" />
    </el-card>

    <!-- Winners Podium - 只在选择了特定比赛时显示 -->
    <el-card v-if="selectedEvent && topThree.length > 0" class="podium-card">
      <template #header>
        <h2>{{ locale === 'zh-CN' ? '冠亚季军' : 'Top 3' }}</h2>
      </template>
      
      <div class="podium">
        <!-- Second Place -->
        <div class="podium-item second" v-if="topThree[1]">
          <div class="podium-rank">
            <el-icon :size="40" color="#c0c0c0"><Medal /></el-icon>
          </div>
          <div class="podium-info">
            <div class="rank-number">2</div>
            <div class="participant-name">{{ topThree[1].participantName }}</div>
            <div class="score">{{ topThree[1].score }}</div>
          </div>
        </div>

        <!-- First Place -->
        <div class="podium-item first" v-if="topThree[0]">
          <div class="podium-rank">
            <el-icon :size="50" color="#ffd700"><Trophy /></el-icon>
          </div>
          <div class="podium-info">
            <div class="rank-number champion">1</div>
            <div class="participant-name">{{ topThree[0].participantName }}</div>
            <div class="score">{{ topThree[0].score }}</div>
          </div>
        </div>

        <!-- Third Place -->
        <div class="podium-item third" v-if="topThree[2]">
          <div class="podium-rank">
            <el-icon :size="35" color="#cd7f32"><Medal /></el-icon>
          </div>
          <div class="podium-info">
            <div class="rank-number">3</div>
            <div class="participant-name">{{ topThree[2].participantName }}</div>
            <div class="score">{{ topThree[2].score }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { winnersApi } from '@/api/winners'
import { eventsApi } from '@/api/events'
import { getFinishedEvents } from '@/utils/eventStatus'

const route = useRoute()
const { locale, t } = useI18n()

const selectedEvent = ref(route.query.eventId ? parseInt(route.query.eventId) : null)
const winners = ref([])
const events = ref([])
const loading = ref(false)

// 加载数据
onMounted(async () => {
  await Promise.all([
    loadWinners(),
    loadFinishedEvents()
  ])
})

// 加载获奖记录
const loadWinners = async () => {
  loading.value = true
  try {
    const response = selectedEvent.value 
      ? await winnersApi.getEventWinners(selectedEvent.value)
      : await winnersApi.getAllWinners()
    
    if (response.success) {
      winners.value = response.data || []
    } else {
      ElMessage.error(response.message || (locale.value === 'zh-CN' ? '加载失败' : 'Load failed'))
    }
  } catch (error) {
    console.error('Load winners error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '加载失败' : 'Load failed')
  } finally {
    loading.value = false
  }
}

// 加载已结束的比赛（用于筛选）
const loadFinishedEvents = async () => {
  try {
    // 获取所有比赛（使用大的pageSize确保获取所有数据）
    const response = await eventsApi.getEvents({ page: 1, pageSize: 1000 })
    if (response.success) {
      // 从分页数据中获取比赛列表
      const allEvents = response.data?.items || response.data || []
      // 过滤出已结束的比赛
      events.value = getFinishedEvents(allEvents)
    } else {
      console.error('Load events failed:', response.message)
    }
  } catch (error) {
    console.error('Load events error:', error)
  }
}

const finishedEvents = computed(() => events.value)

const filteredWinners = computed(() => {
  if (selectedEvent.value) {
    return winners.value.filter(w => w.eventId === selectedEvent.value)
      .sort((a, b) => a.rank - b.rank)
  }
  return winners.value
})

// 按比赛分组的获奖者（用于显示所有比赛时）
const groupedWinners = computed(() => {
  if (selectedEvent.value) return []
  
  const groups = new Map()
  
  winners.value.forEach(winner => {
    if (!groups.has(winner.eventId)) {
      groups.set(winner.eventId, {
        eventId: winner.eventId,
        eventName: winner.eventName,
        eventNameEn: winner.eventNameEn,
        date: winner.date,
        winners: [],
        topThree: []
      })
    }
    groups.get(winner.eventId).winners.push(winner)
  })
  
  // 对每个分组的获奖者按排名排序，并提取前三名
  groups.forEach(group => {
    group.winners.sort((a, b) => a.rank - b.rank)
    group.topThree = group.winners.filter(w => w.rank <= 3).slice(0, 3)
  })
  
  // 转换为数组并按日期倒序排序（最新的比赛在前）
  return Array.from(groups.values()).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )
})

// 选择特定比赛时的前三名
const topThree = computed(() => {
  if (!selectedEvent.value) return []
  
  return filteredWinners.value
    .filter(w => w.rank <= 3)
    .sort((a, b) => a.rank - b.rank)
})

const getRankType = (rank) => {
  if (rank === 1) return 'danger'
  if (rank === 2) return 'warning'
  if (rank === 3) return 'success'
  return 'info'
}

const getRankText = (rank) => {
  if (rank === 1) return t('winners.first')
  if (rank === 2) return t('winners.second')
  if (rank === 3) return t('winners.third')
  return `#${rank}`
}
</script>

<style lang="scss" scoped>
.winners-page {
  .filter-card {
    margin-bottom: 20px;
  }

  .podium-card {
    margin-top: 20px;

    h2 {
      margin: 0;
      text-align: center;
    }
  }

  .podium {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 20px;
    padding: 40px 20px;

    .podium-item {
      text-align: center;
      flex: 0 0 200px;

      .podium-rank {
        margin-bottom: 15px;
      }

      .podium-info {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 20px;
        border-radius: 8px 8px 0 0;

        .rank-number {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 10px;

          &.champion {
            font-size: 48px;
            color: #ffd700;
          }
        }

        .participant-name {
          font-size: 18px;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .score {
          font-size: 16px;
          opacity: 0.9;
        }
      }

      &.first .podium-info {
        min-height: 220px;
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        color: #333;
      }

      &.second .podium-info {
        min-height: 180px;
        background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
        color: #333;
      }

      &.third .podium-info {
        min-height: 150px;
        background: linear-gradient(135deg, #cd7f32 0%, #daa06d 100%);
        color: #fff;
      }
    }
  }

  // 迷你领奖台样式（用于分组显示）
  .mini-podium {
    .podium-mini {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 15px;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;

      .podium-mini-item {
        text-align: center;
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        min-width: 120px;

        .mini-winner-name {
          margin-top: 10px;
          font-weight: bold;
          font-size: 14px;
          color: #333;
        }

        .mini-winner-score {
          margin-top: 5px;
          font-size: 13px;
          color: #666;
        }

        &:nth-child(1) {
          order: 2;
          transform: translateY(-10px);
        }

        &:nth-child(2) {
          order: 1;
        }

        &:nth-child(3) {
          order: 3;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .podium {
    flex-direction: column;
    align-items: center;

    .podium-item {
      width: 100%;
      max-width: 300px;
    }
  }

  .mini-podium .podium-mini {
    flex-direction: column;
    
    .podium-mini-item {
      transform: none !important;
      order: unset !important;
      width: 100%;
      max-width: 250px;
    }
  }
}
</style>

