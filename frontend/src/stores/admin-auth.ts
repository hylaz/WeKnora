import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUserInfo } from '@/api/admin/auth'

export const useAdminAuthStore = defineStore('adminAuth', () => {
  // 状态
  const user = ref<AdminUserInfo | null>(null)
  const token = ref<string>('')
  const refreshToken = ref<string>('')

  // 计算属性
  const isLoggedIn = computed(() => {
    return !!token.value && !!user.value
  })

  const isAdmin = computed(() => {
    return user.value?.is_admin || false
  })

  const currentUserId = computed(() => {
    return user.value?.id || ''
  })

  // 操作方法
  const setUser = (userData: AdminUserInfo) => {
    user.value = userData
    localStorage.setItem('weknora_admin_user', JSON.stringify(userData))
  }

  const setToken = (tokenValue: string) => {
    token.value = tokenValue
    localStorage.setItem('weknora_admin_token', tokenValue)
  }

  const setRefreshToken = (refreshTokenValue: string) => {
    refreshToken.value = refreshTokenValue
    localStorage.setItem('weknora_admin_refresh_token', refreshTokenValue)
  }

  const logout = () => {
    // 清空状态
    user.value = null
    token.value = ''
    refreshToken.value = ''

    // 清空localStorage
    localStorage.removeItem('weknora_admin_user')
    localStorage.removeItem('weknora_admin_token')
    localStorage.removeItem('weknora_admin_refresh_token')
  }

  const initFromStorage = () => {
    // 从localStorage恢复状态
    const storedUser = localStorage.getItem('weknora_admin_user')
    const storedToken = localStorage.getItem('weknora_admin_token')
    const storedRefreshToken = localStorage.getItem('weknora_admin_refresh_token')

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse admin user from storage', e)
      }
    }

    if (storedToken) {
      token.value = storedToken
    }

    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
  }

  // 初始化时从localStorage恢复状态
  initFromStorage()

  return {
    // 状态
    user,
    token,
    refreshToken,
    
    // 计算属性
    isLoggedIn,
    isAdmin,
    currentUserId,
    
    // 方法
    setUser,
    setToken,
    setRefreshToken,
    logout,
    initFromStorage
  }
})

