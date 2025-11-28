<template>
  <div class="admin-winners-page">
    <el-button type="primary" @click="handleAdd" style="margin-bottom: 20px">
      <el-icon><Plus /></el-icon>
      {{ $t('admin.add') }}
    </el-button>

    <el-card>
      <el-table :data="winners" stripe v-loading="tableLoading">
        <el-table-column type="index" label="#" width="60" />
        
        <el-table-column :label="$t('winners.event')" min-width="200">
          <template #default="scope">
            {{ locale === 'zh-CN' ? scope.row.eventName : scope.row.eventNameEn }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('winners.winner')" width="150">
          <template #default="scope">
            {{ scope.row.participantName }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('winners.rank')" width="100">
          <template #default="scope">
            <el-tag :type="getRankType(scope.row.rank)">
              {{ getRankText(scope.row.rank) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('winners.score')" width="150">
          <template #default="scope">
            {{ scope.row.score }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('winners.date')" width="150">
          <template #default="scope">
            {{ scope.row.date }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.operation')" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleEdit(scope.row)">
              {{ $t('admin.edit') }}
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(scope.row)">
              {{ $t('admin.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('admin.edit') : $t('admin.add')"
      width="600px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('admin.winnerForm.event')" prop="eventId">
          <el-select v-model="formData.eventId" style="width: 100%" @change="handleEventChange">
            <el-option
              v-for="event in finishedEvents"
              :key="event.id"
              :label="locale === 'zh-CN' ? event.name : event.nameEn"
              :value="event.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('admin.winnerForm.participant')" prop="userId">
          <el-select 
            v-model="formData.userId" 
            filterable 
            :placeholder="locale === 'zh-CN' ? '请选择获奖者' : 'Select Winner'"
            style="width: 100%"
            :disabled="!formData.eventId || participants.length === 0"
          >
            <template #empty>
              <div style="padding: 10px; text-align: center; color: #909399;">
                {{ formData.eventId ? (locale === 'zh-CN' ? '该比赛暂无报名用户' : 'No participants') : (locale === 'zh-CN' ? '请先选择比赛' : 'Select event first') }}
              </div>
            </template>
            <el-option
              v-for="participant in participants"
              :key="participant.userId"
              :label="`${participant.userName} (${participant.userEmail})`"
              :value="participant.userId"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>{{ participant.userName }}</span>
                <span style="color: #8492a6; font-size: 13px; margin-left: 10px;">
                  {{ participant.userEmail }}
                </span>
              </div>
            </el-option>
          </el-select>
          <div style="margin-top: 5px; font-size: 12px; color: #909399;" v-if="!formData.eventId">
            {{ locale === 'zh-CN' ? '提示：请先选择比赛，系统将自动加载该比赛的报名用户' : 'Tip: Select an event first to load participants' }}
          </div>
        </el-form-item>

        <el-form-item :label="$t('admin.winnerForm.rank')" prop="rank">
          <el-select v-model="formData.rank" style="width: 100%">
            <el-option :label="$t('winners.first')" :value="1" />
            <el-option :label="$t('winners.second')" :value="2" />
            <el-option :label="$t('winners.third')" :value="3" />
            <el-option v-for="i in 7" :key="i + 3" :label="`#${i + 3}`" :value="i + 3" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('admin.winnerForm.score')" prop="score">
          <el-input v-model="formData.score" :placeholder="$t('admin.winnerForm.scorePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('winners.date')" prop="date">
          <el-date-picker
            v-model="formData.date"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('admin.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ $t('admin.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { winnersApi } from '@/api/winners'
import { eventsApi } from '@/api/events'
import { getFinishedEvents } from '@/utils/eventStatus'

const { locale, t } = useI18n()

const dialogVisible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const formRef = ref(null)
const editingId = ref(null)
const tableLoading = ref(false)
const winners = ref([])
const events = ref([])

// 加载数据
onMounted(async () => {
  await Promise.all([
    loadWinners(),
    loadFinishedEvents()
  ])
})

// 加载获奖记录
const loadWinners = async () => {
  tableLoading.value = true
  try {
    const response = await winnersApi.getAllWinners()
    if (response.success) {
      winners.value = response.data || []
    } else {
      ElMessage.error(response.message || (locale.value === 'zh-CN' ? '加载失败' : 'Load failed'))
    }
  } catch (error) {
    console.error('Load winners error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '加载失败' : 'Load failed')
  } finally {
    tableLoading.value = false
  }
}

// 加载已结束的比赛
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

const formData = reactive({
  eventId: null,
  userId: null,
  rank: 1,
  score: '',
  date: ''
})

const participants = ref([])

const rules = {
  eventId: [{ required: true, message: 'Required', trigger: 'change' }],
  userId: [{ required: true, message: 'Required', trigger: 'change' }],
  rank: [{ required: true, message: 'Required', trigger: 'change' }],
  score: [{ required: true, message: 'Required', trigger: 'blur' }],
  date: [{ required: true, message: 'Required', trigger: 'blur' }]
}

const finishedEvents = computed(() => events.value)

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

const handleEventChange = async (eventId) => {
  if (!eventId) {
    participants.value = []
    formData.userId = null
    return
  }
  
  const event = events.value.find(e => e.id === eventId)
  if (event) {
    formData.date = event.date
  }
  
  // 加载该比赛的参与者
  try {
    const response = await winnersApi.getEventParticipants(eventId)
    if (response.success) {
      participants.value = response.data || []
      
      if (participants.value.length === 0) {
        ElMessage.warning(locale.value === 'zh-CN' ? '该比赛暂无报名用户' : 'No participants for this event')
      }
    } else {
      ElMessage.error(response.message || (locale.value === 'zh-CN' ? '加载参与者失败' : 'Failed to load participants'))
    }
  } catch (error) {
    console.error('Load participants error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '加载参与者失败' : 'Failed to load participants')
  }
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  participants.value = []
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  editingId.value = row.id
  
  // 从 API 获取完整数据
  try {
    const response = await winnersApi.getWinnerById(row.id)
    if (response.success) {
      Object.assign(formData, {
        eventId: response.data.eventId,
        userId: response.data.userId,
        rank: response.data.rank,
        score: response.data.score,
        date: response.data.date
      })
      
      // 加载该比赛的参与者列表
      await handleEventChange(response.data.eventId)
      
      dialogVisible.value = true
    } else {
      ElMessage.error(response.message || (locale.value === 'zh-CN' ? '获取详情失败' : 'Failed to load details'))
    }
  } catch (error) {
    console.error('Load winner detail error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '获取详情失败' : 'Failed to load details')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('admin.deleteConfirm'),
      t('common.confirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    
    const response = await winnersApi.deleteWinner(row.id)
    if (response.success) {
      ElMessage.success(t('admin.deleteSuccess'))
      loadWinners() // 重新加载列表
    } else {
      ElMessage.error(response.message || t('admin.deleteFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error(t('admin.deleteFailed'))
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    const winnerData = {
      eventId: formData.eventId,
      userId: formData.userId,
      rank: formData.rank,
      score: formData.score,
      date: formData.date
    }

    const response = isEdit.value
      ? await winnersApi.updateWinner(editingId.value, winnerData)
      : await winnersApi.createWinner(winnerData)

    loading.value = false

    if (response.success) {
      ElMessage.success(t('admin.saveSuccess'))
      dialogVisible.value = false
      loadWinners() // 重新加载列表
    } else {
      ElMessage.error(response.message || t('admin.saveFailed'))
    }
  } catch (error) {
    loading.value = false
    console.error('Submit error:', error)
    ElMessage.error(t('admin.saveFailed'))
  }
}

const resetForm = () => {
  Object.assign(formData, {
    eventId: null,
    userId: null,
    rank: 1,
    score: '',
    date: ''
  })
  participants.value = []
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}
</script>

<style lang="scss" scoped>
.admin-winners-page {
  // Styles
}
</style>

