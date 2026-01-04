import { get, post, put, del } from '@/utils/admin-request'

// 租户信息接口
export interface TenantInfo {
  id: number
  name: string
  description?: string
  api_key?: string
  status: 'active' | 'inactive'
  business?: string
  storage_quota: number
  storage_used: number
  retriever_engines?: {
    engines: Array<{
      retriever_type: 'keywords' | 'vector'
      retriever_engine_type: string
    }>
  }
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// 创建租户请求
export interface CreateTenantRequest {
  name: string
  description?: string
  business: string
  retriever_engines: {
    engines: Array<{
      retriever_type: 'keywords' | 'vector'
      retriever_engine_type: string
    }>
  }
  storage_quota?: number
}

// 更新租户请求
export interface UpdateTenantRequest {
  name?: string
  description?: string
  business?: string
  status?: 'active' | 'inactive'
  retriever_engines?: {
    engines: Array<{
      retriever_type: 'keywords' | 'vector'
      retriever_engine_type: string
    }>
  }
  storage_quota?: number
}

// 获取租户列表
export async function listTenants(): Promise<{ success: boolean; data?: { items: TenantInfo[] }; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock 租户数据
      const mockTenants: TenantInfo[] = [
        {
          id: 10001,
          name: '示例租户1',
          description: '这是一个示例租户',
          api_key: 'sk-mock-key-1234567890abcdef',
          status: 'active',
          business: 'wechat',
          storage_quota: 10737418240, // 10GB
          storage_used: 2147483648, // 2GB
          retriever_engines: {
            engines: [
              { retriever_type: 'keywords', retriever_engine_type: 'postgres' },
              { retriever_type: 'vector', retriever_engine_type: 'postgres' }
            ]
          },
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 10002,
          name: '示例租户2',
          description: '另一个示例租户',
          api_key: 'sk-mock-key-abcdef1234567890',
          status: 'active',
          business: 'demo',
          storage_quota: 21474836480, // 20GB
          storage_used: 5368709120, // 5GB
          retriever_engines: {
            engines: [
              { retriever_type: 'vector', retriever_engine_type: 'postgres' }
            ]
          },
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 10003,
          name: '测试租户',
          description: '用于测试的租户',
          api_key: 'sk-mock-key-test123456789',
          status: 'inactive',
          business: 'test',
          storage_quota: 5368709120, // 5GB
          storage_used: 0,
          retriever_engines: {
            engines: [
              { retriever_type: 'keywords', retriever_engine_type: 'postgres' }
            ]
          },
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      return {
        success: true,
        data: {
          items: mockTenants
        }
      }
    }
    
    const response = await get('/api/v1/tenants')
    return response as unknown as { success: boolean; data?: { items: TenantInfo[] }; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取租户列表失败'
    }
  }
}

// 获取租户详情
export async function getTenantById(id: number): Promise<{ success: boolean; data?: TenantInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock 租户详情
      const mockTenant: TenantInfo = {
        id: id,
        name: `示例租户${id}`,
        description: `这是租户${id}的详细描述信息`,
        api_key: `sk-mock-key-${id}-${Date.now()}`,
        status: id % 2 === 0 ? 'active' : 'inactive',
        business: 'wechat',
        storage_quota: 10737418240, // 10GB
        storage_used: id * 1073741824, // 根据ID计算使用量
        retriever_engines: {
          engines: [
            { retriever_type: 'keywords', retriever_engine_type: 'postgres' },
            { retriever_type: 'vector', retriever_engine_type: 'postgres' }
          ]
        },
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: mockTenant
      }
    }
    
    const response = await get(`/api/v1/tenants/${id}`)
    return response as unknown as { success: boolean; data?: TenantInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取租户详情失败'
    }
  }
}

// 创建租户
export async function createTenant(data: CreateTenantRequest): Promise<{ success: boolean; data?: TenantInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock 创建的租户
      const mockTenant: TenantInfo = {
        id: Math.floor(Math.random() * 100000) + 10000,
        name: data.name,
        description: data.description || '',
        api_key: 'sk-mock-new-' + Date.now(),
        status: 'active',
        business: data.business,
        storage_quota: data.storage_quota || 10737418240,
        storage_used: 0,
        retriever_engines: data.retriever_engines,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: mockTenant
      }
    }
    
    const response = await post('/api/v1/tenants', data)
    return response as unknown as { success: boolean; data?: TenantInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '创建租户失败'
    }
  }
}

// 更新租户
export async function updateTenant(id: number, data: UpdateTenantRequest): Promise<{ success: boolean; data?: TenantInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock 更新后的租户
      const mockTenant: TenantInfo = {
        id: id,
        name: data.name || `更新后的租户${id}`,
        description: data.description || '',
        api_key: 'sk-mock-updated-' + Date.now(), // 更新时API Key会改变
        status: data.status || 'active',
        business: data.business || 'wechat',
        storage_quota: data.storage_quota || 10737418240,
        storage_used: 0,
        retriever_engines: data.retriever_engines || {
          engines: [{ retriever_type: 'keywords', retriever_engine_type: 'postgres' }]
        },
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: mockTenant
      }
    }
    
    const response = await put(`/api/v1/tenants/${id}`, data)
    return response as unknown as { success: boolean; data?: TenantInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '更新租户失败'
    }
  }
}

// 删除租户
export async function deleteTenant(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return {
        success: true,
        message: '删除成功'
      }
    }
    
    const response = await del(`/api/v1/tenants/${id}`)
    return response as unknown as { success: boolean; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '删除租户失败'
    }
  }
}

