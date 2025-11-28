<template>
  <div class="admin-registrations-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ $t('admin.registrations') }}</h3>
          <div class="filter-group">
            <el-select v-model="statusFilter" :placeholder="$t('admin.registrationForm.status')" clearable style="width: 150px">
              <el-option :label="$t('profile.status.pending')" value="pending" />
              <el-option :label="$t('profile.status.approved')" value="approved" />
              <el-option :label="$t('profile.status.rejected')" value="rejected" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="filteredRegistrations" stripe v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        
        <el-table-column :label="$t('registration.form.name')" width="120">
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('event.title')" min-width="180">
          <template #default="scope">
            {{ locale === 'zh-CN' ? scope.row.eventsName : scope.row.eventsNameEn }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('registration.form.phone')" width="130">
          <template #default="scope">
            {{ scope.row.phone }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('registration.form.email')" min-width="180">
          <template #default="scope">
            {{ scope.row.email }}
          </template>
        </el-table-column>

        <el-table-column :label="locale === 'zh-CN' ? '提交时间' : 'Submitted'" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('admin.registrationForm.status')" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ $t(`profile.status.${scope.row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.operation')" width="220" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleView(scope.row)"
            >
              {{ locale === 'zh-CN' ? '查看' : 'View' }}
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="success"
              size="small"
              link
              @click="handleApprove(scope.row)"
            >
              {{ $t('admin.registrationForm.approve') }}
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="danger"
              size="small"
              link
              @click="handleReject(scope.row)"
            >
              {{ $t('admin.registrationForm.reject') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="locale === 'zh-CN' ? '报名详情' : 'Registration Details'"
      width="600px"
    >
      <el-descriptions :column="1" border v-if="currentRegistration">
        <el-descriptions-item :label="$t('registration.form.name')">
          {{ currentRegistration.name }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('registration.form.age')">
          {{ currentRegistration.age }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('registration.form.gender')">
          {{ $t(`registration.form.${currentRegistration.gender}`) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('registration.form.phone')">
          {{ currentRegistration.phone }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('registration.form.email')">
          {{ currentRegistration.email }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('event.title')">
          {{ locale === 'zh-CN' ? currentRegistration.eventsName : currentRegistration.eventsNameEn }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('registration.form.experience')">
          {{ currentRegistration.experience }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('registration.form.remarks')" v-if="currentRegistration.remarks">
          {{ currentRegistration.remarks }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('admin.registrationForm.status')">
          <el-tag :type="getStatusType(currentRegistration.status)">
            {{ $t(`profile.status.${currentRegistration.status}`) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button
          v-if="currentRegistration?.status === 'pending'"
          type="success"
          @click="handleApprove(currentRegistration)"
        >
          {{ $t('admin.registrationForm.approve') }}
        </el-button>
        <el-button
          v-if="currentRegistration?.status === 'pending'"
          type="danger"
          @click="handleReject(currentRegistration)"
        >
          {{ $t('admin.registrationForm.reject') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { registrationsApi } from '@/api/registrations'

const { locale, t } = useI18n()

const statusFilter = ref('')
const detailDialogVisible = ref(false)
const currentRegistration = ref(null)
const registrations = ref([])
const loading = ref(false)

// 加载报名列表
onMounted(() => {
  loadRegistrations()
})

const loadRegistrations = async () => {
  loading.value = true
  try {
    const response = await registrationsApi.getAllRegistrations()
    if (response.success) {
      registrations.value = response.data || []
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

const filteredRegistrations = computed(() => {
  if (!statusFilter.value) {
    return registrations.value
  }
  return registrations.value.filter(r => r.status === statusFilter.value)
})

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
  return date.toLocaleString(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US')
}

const handleView = (row) => {
  currentRegistration.value = row
  detailDialogVisible.value = true
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(
      locale.value === 'zh-CN' ? '确认通过该报名申请？' : 'Confirm to approve this registration?',
      t('common.confirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'success'
      }
    )

    const response = await registrationsApi.updateRegistrationStatus(row.id, 'approved')
    if (response.success) {
      ElMessage.success(t('admin.saveSuccess'))
      detailDialogVisible.value = false
      loadRegistrations() // 重新加载列表
    } else {
      ElMessage.error(response.message || t('admin.saveFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Approve error:', error)
      ElMessage.error(t('admin.saveFailed'))
    }
  }
}

const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm(
      locale.value === 'zh-CN' ? '确认拒绝该报名申请？' : 'Confirm to reject this registration?',
      t('common.confirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    const response = await registrationsApi.updateRegistrationStatus(row.id, 'rejected')
    if (response.success) {
      ElMessage.success(t('admin.saveSuccess'))
      detailDialogVisible.value = false
      loadRegistrations() // 重新加载列表
    } else {
      ElMessage.error(response.message || t('admin.saveFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Reject error:', error)
      ElMessage.error(t('admin.saveFailed'))
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-registrations-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }

    .filter-group {
      display: flex;
      gap: 10px;
    }
  }
}
</style>

