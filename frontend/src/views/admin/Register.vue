<template>
  <div class="admin-register-container">
    <div class="register-box">
      <div class="register-header">
        <img src="@/assets/img/weknora.png" alt="WeKnora" class="logo" />
        <h1 class="title">{{ $t('admin.register.title') }}</h1>
        <p class="subtitle">{{ $t('admin.register.subtitle') }}</p>
      </div>

      <t-form
        ref="formRef"
        :data="formData"
        :rules="formRules"
        @submit="handleRegister"
        layout="vertical"
        class="register-form"
      >
        <t-form-item :label="$t('admin.register.username')" name="username">
          <t-input
            v-model="formData.username"
            :placeholder="$t('admin.register.usernamePlaceholder')"
            size="large"
            :disabled="loading"
          />
        </t-form-item>

        <t-form-item :label="$t('admin.register.email')" name="email">
          <t-input
            v-model="formData.email"
            :placeholder="$t('admin.register.emailPlaceholder')"
            type="email"
            size="large"
            :disabled="loading"
          />
        </t-form-item>

        <t-form-item :label="$t('admin.register.password')" name="password">
          <t-input
            v-model="formData.password"
            :placeholder="$t('admin.register.passwordPlaceholder')"
            type="password"
            size="large"
            :disabled="loading"
          />
        </t-form-item>

        <t-form-item :label="$t('admin.register.confirmPassword')" name="confirmPassword">
          <t-input
            v-model="formData.confirmPassword"
            :placeholder="$t('admin.register.confirmPasswordPlaceholder')"
            type="password"
            size="large"
            :disabled="loading"
            @keydown.enter="handleRegister"
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
          {{ loading ? $t('admin.register.registering') : $t('admin.register.registerButton') }}
        </t-button>
      </t-form>

      <div class="register-footer">
        <span>{{ $t('admin.register.haveAccount') }}</span>
        <t-link theme="primary" @click="$router.push('/admin/login')">
          {{ $t('admin.register.backToLogin') }}
        </t-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { adminRegister } from '@/api/admin/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const formRef = ref()
const loading = ref(false)

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const formRules = computed(() => ({
  username: [
    { required: true, message: t('admin.register.usernameRequired'), type: 'error' },
    { min: 2, message: t('admin.register.usernameMinLength'), type: 'error' },
    { max: 20, message: t('admin.register.usernameMaxLength'), type: 'error' }
  ],
  email: [
    { required: true, message: t('admin.register.emailRequired'), type: 'error' },
    { email: true, message: t('admin.register.emailInvalid'), type: 'error' }
  ],
  password: [
    { required: true, message: t('admin.register.passwordRequired'), type: 'error' },
    { min: 8, message: t('admin.register.passwordMinLength'), type: 'error' }
  ],
  confirmPassword: [
    { required: true, message: t('admin.register.confirmPasswordRequired'), type: 'error' },
    {
      validator: (val: string) => val === formData.password,
      message: t('admin.register.passwordMismatch'),
      type: 'error'
    }
  ]
}))

const handleRegister = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    loading.value = true
    
    const response = await adminRegister({
      username: formData.username,
      email: formData.email,
      password: formData.password
    })

    if (response.success) {
      MessagePlugin.success(t('admin.register.registerSuccess'))
      router.push('/admin/login')
    } else {
      MessagePlugin.error(response.message || t('admin.register.registerError'))
    }
  } catch (error: any) {
    console.error('注册错误:', error)
    MessagePlugin.error(error.message || t('admin.register.registerError'))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.admin-register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
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

.register-form {
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

.register-footer {
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

