<template>
  <div class="registration-page page-container" v-if="event">
    <el-button @click="router.back()" style="margin-bottom: 20px">
      <el-icon><ArrowLeft /></el-icon>
      {{ $t('common.back') }}
    </el-button>

    <el-card>
      <template #header>
        <div class="card-header">
          <h2>{{ $t('registration.title') }}</h2>
          <el-tag type="warning">{{ locale === 'zh-CN' ? event.name : event.nameEn }}</el-tag>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="top"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :md="12">
            <el-form-item :label="$t('registration.form.name')" prop="name">
              <el-input
                v-model="formData.name"
                :placeholder="$t('registration.form.namePlaceholder')"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="12">
            <el-form-item :label="$t('registration.form.age')" prop="age">
              <el-input-number
                v-model="formData.age"
                :min="1"
                :max="120"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="12">
            <el-form-item :label="$t('registration.form.gender')" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio label="male">{{ $t('registration.form.male') }}</el-radio>
                <el-radio label="female">{{ $t('registration.form.female') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="12">
            <el-form-item :label="$t('registration.form.phone')" prop="phone">
              <el-input
                v-model="formData.phone"
                :placeholder="$t('registration.form.phonePlaceholder')"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24">
            <el-form-item :label="$t('registration.form.email')" prop="email">
              <el-input
                v-model="formData.email"
                :placeholder="$t('registration.form.emailPlaceholder')"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24">
            <el-form-item :label="$t('registration.form.experience')" prop="experience">
              <el-input
                v-model="formData.experience"
                type="textarea"
                :rows="4"
                :placeholder="$t('registration.form.experiencePlaceholder')"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24">
            <el-form-item :label="$t('registration.form.remarks')">
              <el-input
                v-model="formData.remarks"
                type="textarea"
                :rows="3"
                :placeholder="$t('registration.form.remarksPlaceholder')"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
            {{ $t('registration.submit') }}
          </el-button>
          <el-button @click="router.back()" size="large">
            {{ $t('registration.cancel') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
  
  <el-empty v-else :description="$t('common.noData')" />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { eventsApi } from '@/api/events'
import { registrationsApi } from '@/api/registrations'
import { enrichEventWithStatus } from '@/utils/eventStatus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const formRef = ref(null)
const loading = ref(false)
const event = ref(null)

// 加载比赛详情
onMounted(async () => {
  try {
    const response = await eventsApi.getEventById(route.params.id)
    if (response.success) {
      event.value = enrichEventWithStatus(response.data)
      
      // 检查比赛状态
      if (event.value.computedStatus !== 'upcoming') {
        ElMessage.warning(locale.value === 'zh-CN' ? '该比赛已无法报名' : 'Registration is closed')
        router.back()
      }
    } else {
      ElMessage.error(response.message || '加载失败')
      router.back()
    }
  } catch (error) {
    console.error('Load event error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '加载失败' : 'Load failed')
    router.back()
  }
})

const formData = reactive({
  name: authStore.user?.name || '',
  age: null,
  gender: 'male',
  phone: '',
  email: authStore.user?.email || '',
  experience: '',
  remarks: ''
})

const rules = {
  name: [
    { required: true, message: t('registration.form.namePlaceholder'), trigger: 'blur' }
  ],
  age: [
    { required: true, message: t('registration.form.agePlaceholder'), trigger: 'blur' }
  ],
  gender: [
    { required: true, message: t('registration.form.gender'), trigger: 'change' }
  ],
  phone: [
    { required: true, message: t('registration.form.phonePlaceholder'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('registration.form.emailPlaceholder'), trigger: 'blur' },
    { type: 'email', message: t('registration.form.emailPlaceholder'), trigger: 'blur' }
  ],
  experience: [
    { required: true, message: t('registration.form.experiencePlaceholder'), trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value || !event.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    // 准备提交数据
    const registrationData = {
      eventId: event.value.id,
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      experience: formData.experience,
      remarks: formData.remarks || ''
    }

    // 调用 API 提交报名
    const response = await registrationsApi.createRegistration(registrationData)
    
    loading.value = false

    if (response.success) {
      ElMessageBox.alert(
        t('registration.successMessage'),
        t('registration.success'),
        {
          confirmButtonText: t('common.confirm'),
          type: 'success',
          callback: () => {
            router.push('/profile')
          }
        }
      )
    } else {
      ElMessage.error(response.message || (locale.value === 'zh-CN' ? '提交失败' : 'Submit failed'))
    }
  } catch (error) {
    loading.value = false
    console.error('Submit registration error:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '提交失败，请稍后重试' : 'Submit failed, please try again later')
  }
}
</script>

<style lang="scss" scoped>
.registration-page {
  max-width: 900px;
  margin: 0 auto;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
    }
  }
}
</style>

