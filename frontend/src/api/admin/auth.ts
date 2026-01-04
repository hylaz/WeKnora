import { post, get } from '@/utils/request'
import { post as adminPost, get as adminGet } from '@/utils/admin-request'

// 管理员登录请求
export interface AdminLoginRequest {
  email: string
  password: string
}

// 管理员注册请求
export interface AdminRegisterRequest {
  username: string
  email: string
  password: string
}

// 管理员登录响应
export interface AdminLoginResponse {
  success: boolean
  message?: string
  user?: {
    id: string
    username: string
    email: string
    avatar?: string
    is_admin?: boolean
    created_at: string
    updated_at: string
  }
  token?: string
  refresh_token?: string
}

// 管理员注册响应
export interface AdminRegisterResponse {
  success: boolean
  message?: string
  data?: {
    user: {
      id: string
      username: string
      email: string
    }
  }
}

// 管理员信息
export interface AdminUserInfo {
  id: string
  username: string
  email: string
  avatar?: string
  is_admin?: boolean
  created_at: string
  updated_at: string
}

/**
 * 管理员登录
 */
export async function adminLogin(data: AdminLoginRequest): Promise<AdminLoginResponse> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock 登录数据 - 任何邮箱和密码都可以登录（仅用于开发）
      return {
        success: true,
        message: '登录成功',
        user: {
          id: 'mock-admin-1',
          username: data.email.split('@')[0] || 'admin',
          email: data.email,
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        token: 'mock-admin-token-' + Date.now(),
        refresh_token: 'mock-admin-refresh-token-' + Date.now()
      }
    }
    
    // 使用统一登录接口（管理平台和普通用户使用相同的登录接口）
    const response = await post('/api/v1/auth/login', data)
    return response as unknown as AdminLoginResponse
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '登录失败'
    }
  }
}

/**
 * 管理员注册
 */
export async function adminRegister(data: AdminRegisterRequest): Promise<AdminRegisterResponse> {
  try {
    // 使用统一注册接口（管理平台和普通用户使用相同的注册接口）
    const response = await post('/api/v1/auth/register', data)
    return response as unknown as AdminRegisterResponse
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '注册失败'
    }
  }
}

/**
 * 获取当前管理员信息
 */
export async function getCurrentAdmin(): Promise<{ success: boolean; data?: { user: AdminUserInfo }; message?: string }> {
  try {
    const response = await adminGet('/api/v1/auth/me')
    return response as unknown as { success: boolean; data?: { user: AdminUserInfo }; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取管理员信息失败'
    }
  }
}

