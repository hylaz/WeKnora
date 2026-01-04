<template>
  <div class="admin-login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/img/weknora.png" alt="WeKnora" class="logo" />
        <h1 class="title">{{ $t('admin.login.title') }}</h1>
        <p class="subtitle">{{ $t('admin.login.subtitle') }}</p>
      </div>

      <t-form
        ref="formRef"
        :data="formData"
        :rules="formRules"
        @submit="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <t-form-item :label="$t('admin.login.email')" name="email">
          <t-input
            v-model="formData.email"
            :placeholder="$t('admin.login.emailPlaceholder')"
            type="email"
            size="large"
            :disabled="loading"
          />
        </t-form-item>

        <t-form-item :label="$t('admin.login.password')" name="password">
          <t-input
            v-model="formData.password"
            :placeholder="$t('admin.login.passwordPlaceholder')"
            type="password"
            size="large"
            :disabled="loading"
            @keydown.enter="handleLogin"
          />
        </t-form-item>

        <t-button
          type="submit"
          theme="primary"
          size="large"
          block
          :loading="loading"
          class="submit-button"
        >
          {{ loading ? $t('admin.login.loggingIn') : $t('admin.login.loginButton') }}
        </t-button>
      </t-form>

      <div class="login-footer">
        <span>{{ $t('admin.login.noAccount') }}</span>
        <t-link theme="primary" @click="$router.push('/admin/register')">
          {{ $t('admin.login.registerNow') }}
        </t-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { adminLogin } from '@/api/admin/auth'
import { useAdminAuthStore } from '@/stores/admin-auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const adminAuthStore = useAdminAuthStore()
const { t } = useI18n()

const formRef = ref()
const loading = ref(false)

const formData = reactive({
  email: '',
  password: '',
})

const formRules = computed(() => ({
  email: [
    { required: true, message: t('admin.login.emailRequired'), type: 'error' },
    { email: true, message: t('admin.login.emailInvalid'), type: 'error' }
  ],
  password: [
    { required: true, message: t('admin.login.passwordRequired'), type: 'error' },
    { min: 8, message: t('admin.login.passwordMinLength'), type: 'error' }
  ]
}))

const handleLogin = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    loading.value = true
    
    const response = await adminLogin({
      email: formData.email,
      password: formData.password,
    })

    if (response.success && response.user && response.token) {
      adminAuthStore.setUser(response.user)
      adminAuthStore.setToken(response.token)
      if (response.refresh_token) {
        adminAuthStore.setRefreshToken(response.refresh_token)
      }
      
      MessagePlugin.success(t('admin.login.loginSuccess'))
      router.replace('/admin/tenants')
    } else {
      MessagePlugin.error(response.message || t('admin.login.loginError'))
    }
  } catch (error: any) {
    console.error('登录错误:', error)
    MessagePlugin.error(error.message || t('admin.login.loginErrorRetry'))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.admin-login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    width: 120px;
    height: auto;
    margin-bottom: 24px;
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
    font-family: "PingFang SC", sans-serif;
  }

  .subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    font-family: "PingFang SC", sans-serif;
  }
}

.login-form {
  :deep(.t-form-item__label) {
    font-size: 14px;
    color: #111827;
    font-weight: 500;
    margin-bottom: 8px;
    font-family: "PingFang SC", sans-serif;
  }

  :deep(.t-input) {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    
    &:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
}

.submit-button {
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  font-family: "PingFang SC", sans-serif;
  margin-top: 24px;

  :deep(.t-button) {
    background-color: #667eea;
    border-color: #667eea;

    &:hover {
      background-color: #5568d3;
      border-color: #5568d3;
    }
  }
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-top: 24px;
  font-family: "PingFang SC", sans-serif;

  span {
    margin-right: 8px;
  }
}
</style>

