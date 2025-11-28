<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>{{ $t('auth.register') }}</h1>
        <p class="subtitle">{{ $t('home.title') }}</p>

        <el-form :model="registerForm" :rules="rules" ref="formRef" class="auth-form">
          <el-form-item prop="name">
            <el-input
              v-model="registerForm.name"
              :placeholder="$t('auth.namePlaceholder')"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              :placeholder="$t('auth.emailPlaceholder')"
              size="large"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              :placeholder="$t('auth.passwordPlaceholder')"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-button type="primary" @click="handleRegister" :loading="loading" size="large" style="width: 100%">
            {{ $t('auth.register') }}
          </el-button>
        </el-form>

        <div class="auth-footer">
          <p>
            {{ $t('auth.hasAccount') }}
            <el-link type="primary" @click="router.push('/login')">
              {{ $t('auth.loginNow') }}
            </el-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const formRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error(t('auth.confirmPasswordPlaceholder')))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: t('auth.namePlaceholder'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('auth.emailPlaceholder'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailPlaceholder'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.passwordPlaceholder'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordPlaceholder'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('auth.confirmPasswordPlaceholder'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const result = await authStore.register({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          confirmPassword: registerForm.confirmPassword
        })
        
        if (result.success) {
          ElMessage.success(t('auth.registerSuccess'))
          router.push('/')
        } else {
          ElMessage.error(result.message || t('auth.registerFailed', 'Registration failed'))
        }
      } catch (error) {
        console.error('Register error:', error)
        ElMessage.error(t('auth.registerFailed', 'Registration failed, please try again later'))
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 450px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

  h1 {
    text-align: center;
    margin-bottom: 10px;
    color: #333;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
  }

  .auth-form {
    margin-top: 30px;
  }

  .auth-footer {
    text-align: center;
    margin-top: 20px;

    p {
      color: #666;
    }
  }
}
</style>

