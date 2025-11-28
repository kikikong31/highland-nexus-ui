<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>{{ $t('auth.login') }}</h1>
        <p class="subtitle">{{ $t('home.title') }}</p>

        <el-form :model="loginForm" :rules="rules" ref="formRef" class="auth-form">
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              :placeholder="$t('auth.emailPlaceholder')"
              size="large"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              :placeholder="$t('auth.passwordPlaceholder')"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.remember">
              {{ $t('auth.rememberMe') }}
            </el-checkbox>
          </el-form-item>

          <el-button type="primary" @click="handleLogin" :loading="loading" size="large" style="width: 100%">
            {{ $t('auth.login') }}
          </el-button>
        </el-form>

        <div class="auth-footer">
          <p>
            {{ $t('auth.noAccount') }}
            <el-link type="primary" @click="router.push('/register')">
              {{ $t('auth.registerNow') }}
            </el-link>
          </p>
        </div>

        <el-divider>{{ $t('common.or', 'Demo') }}</el-divider>
        
        <div class="demo-accounts">
          <el-alert :closable="false" type="info" style="margin-bottom: 10px">
            <p><strong>{{ locale === 'zh-CN' ? '演示账号' : 'Demo Accounts' }}:</strong></p>
            <p>{{ locale === 'zh-CN' ? '管理员' : 'Admin' }}: admin@example.com / admin123</p>
            <p>{{ locale === 'zh-CN' ? '普通用户' : 'User' }}: user@example.com / password123</p>
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const formRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

const rules = {
  email: [
    { required: true, message: t('auth.emailPlaceholder'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailPlaceholder'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.passwordPlaceholder'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordPlaceholder'), trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const result = await authStore.login({
          email: loginForm.email,
          password: loginForm.password
        })
        
        if (result.success) {
          ElMessage.success(t('auth.loginSuccess'))
          const redirect = route.query.redirect || '/'
          router.push(redirect)
        } else {
          ElMessage.error(result.message || (locale.value === 'zh-CN' ? '登录失败' : 'Login failed'))
        }
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error(locale.value === 'zh-CN' ? '登录失败，请稍后重试' : 'Login failed, please try again later')
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

  .demo-accounts {
    margin-top: 20px;
    
    p {
      margin: 5px 0;
      font-size: 14px;
    }
  }
}
</style>

