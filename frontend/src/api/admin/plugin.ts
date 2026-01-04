import { get, post, put, del } from '@/utils/admin-request'

// 插件信息接口
export interface PluginInfo {
  id: string
  name: string
  display_name: string
  description?: string
  version: string
  author?: string
  enabled: boolean
  plugin_type: 'system' | 'custom'
  category?: string
  icon?: string
  config?: Record<string, any>
  installed_at?: string
  updated_at?: string
  created_at?: string
}

// 创建插件请求
export interface CreatePluginRequest {
  name: string
  display_name: string
  description?: string
  version: string
  author?: string
  plugin_type?: 'system' | 'custom'
  category?: string
  icon?: string
  config?: Record<string, any>
}

// 更新插件请求
export interface UpdatePluginRequest {
  display_name?: string
  description?: string
  enabled?: boolean
  config?: Record<string, any>
}

// 获取插件列表
export async function listPlugins(params?: {
  page?: number
  page_size?: number
  category?: string
  enabled?: boolean
  keyword?: string
}): Promise<{ success: boolean; data?: { items: PluginInfo[]; total: number; page: number; page_size: number }; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock 插件数据
      const mockPlugins: PluginInfo[] = [
        {
          id: 'plugin-001',
          name: 'search-plugin',
          display_name: '搜索增强插件',
          description: '增强知识库搜索功能，支持高级检索和过滤',
          version: '1.0.0',
          author: 'WeKnora Team',
          enabled: true,
          plugin_type: 'system',
          category: 'search',
          icon: '🔍',
          config: {
            max_results: 10,
            enable_fuzzy_search: true
          },
          installed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'plugin-002',
          name: 'export-plugin',
          display_name: '数据导出插件',
          description: '支持将知识库数据导出为多种格式（PDF、Word、Excel等）',
          version: '1.2.0',
          author: 'WeKnora Team',
          enabled: true,
          plugin_type: 'system',
          category: 'export',
          icon: '📤',
          config: {
            default_format: 'pdf',
            include_metadata: true
          },
          installed_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'plugin-003',
          name: 'analytics-plugin',
          display_name: '数据分析插件',
          description: '提供知识库使用统计和分析功能',
          version: '0.9.5',
          author: 'WeKnora Team',
          enabled: false,
          plugin_type: 'system',
          category: 'analytics',
          icon: '📊',
          config: {
            track_usage: true,
            retention_days: 30
          },
          installed_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'plugin-004',
          name: 'custom-webhook',
          display_name: '自定义Webhook插件',
          description: '支持自定义Webhook通知，当知识库发生变化时触发',
          version: '1.1.0',
          author: 'Custom Developer',
          enabled: true,
          plugin_type: 'custom',
          category: 'integration',
          icon: '🔗',
          config: {
            webhook_url: 'https://example.com/webhook',
            events: ['create', 'update', 'delete']
          },
          installed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'plugin-005',
          name: 'backup-plugin',
          display_name: '自动备份插件',
          description: '自动备份知识库数据到云存储',
          version: '2.0.0',
          author: 'WeKnora Team',
          enabled: false,
          plugin_type: 'system',
          category: 'backup',
          icon: '💾',
          config: {
            backup_interval: 'daily',
            storage_type: 's3'
          },
          installed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      // 过滤逻辑
      let filteredPlugins = [...mockPlugins]
      
      if (params?.category) {
        filteredPlugins = filteredPlugins.filter(p => p.category === params.category)
      }
      
      if (params?.enabled !== undefined) {
        filteredPlugins = filteredPlugins.filter(p => p.enabled === params.enabled)
      }
      
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredPlugins = filteredPlugins.filter(p => 
          p.name.toLowerCase().includes(keyword) ||
          p.display_name.toLowerCase().includes(keyword) ||
          p.description?.toLowerCase().includes(keyword)
        )
      }
      
      const page = params?.page || 1
      const pageSize = params?.page_size || 20
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedPlugins = filteredPlugins.slice(start, end)
      
      return {
        success: true,
        data: {
          items: paginatedPlugins,
          total: filteredPlugins.length,
          page: page,
          page_size: pageSize
        }
      }
    }
    
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.page_size) queryParams.append('page_size', String(params.page_size))
    if (params?.category) queryParams.append('category', params.category)
    if (params?.enabled !== undefined) queryParams.append('enabled', String(params.enabled))
    if (params?.keyword) queryParams.append('keyword', params.keyword)
    
    const queryString = queryParams.toString()
    const url = `/api/v1/plugins${queryString ? '?' + queryString : ''}`
    const response = await get(url)
    return response as unknown as { success: boolean; data?: { items: PluginInfo[]; total: number; page: number; page_size: number }; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取插件列表失败'
    }
  }
}

// 获取插件详情
export async function getPluginById(id: string): Promise<{ success: boolean; data?: PluginInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 从mock列表中找到对应插件
      const mockPlugins: PluginInfo[] = [
        {
          id: 'plugin-001',
          name: 'search-plugin',
          display_name: '搜索增强插件',
          description: '增强知识库搜索功能，支持高级检索和过滤。该插件提供了强大的搜索算法优化，可以显著提升搜索结果的准确性和相关性。',
          version: '1.0.0',
          author: 'WeKnora Team',
          enabled: true,
          plugin_type: 'system',
          category: 'search',
          icon: '🔍',
          config: {
            max_results: 10,
            enable_fuzzy_search: true,
            enable_synonym_expansion: false,
            ranking_algorithm: 'bm25'
          },
          installed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'plugin-002',
          name: 'export-plugin',
          display_name: '数据导出插件',
          description: '支持将知识库数据导出为多种格式（PDF、Word、Excel等）',
          version: '1.2.0',
          author: 'WeKnora Team',
          enabled: true,
          plugin_type: 'system',
          category: 'export',
          icon: '📤',
          config: {
            default_format: 'pdf',
            include_metadata: true
          },
          installed_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      const plugin = mockPlugins.find(p => p.id === id) || mockPlugins[0]
      
      return {
        success: true,
        data: { ...plugin, id: id } // 使用传入的ID
      }
    }
    
    const response = await get(`/api/v1/plugins/${id}`)
    return response as unknown as { success: boolean; data?: PluginInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取插件详情失败'
    }
  }
}

// 创建插件
export async function createPlugin(data: CreatePluginRequest): Promise<{ success: boolean; data?: PluginInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock 创建的插件
      const mockPlugin: PluginInfo = {
        id: 'plugin-' + Date.now(),
        name: data.name,
        display_name: data.display_name,
        description: data.description || '',
        version: data.version,
        author: data.author || 'Custom Developer',
        enabled: false,
        plugin_type: data.plugin_type || 'custom',
        category: data.category || 'other',
        icon: data.icon || '🔌',
        config: data.config || {},
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: mockPlugin
      }
    }
    
    const response = await post('/api/v1/plugins', data)
    return response as unknown as { success: boolean; data?: PluginInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '创建插件失败'
    }
  }
}

// 更新插件
export async function updatePlugin(id: string, data: UpdatePluginRequest): Promise<{ success: boolean; data?: PluginInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock 更新后的插件
      const mockPlugin: PluginInfo = {
        id: id,
        name: 'updated-plugin',
        display_name: data.display_name || '更新后的插件',
        description: data.description || '',
        version: '1.0.0',
        author: 'WeKnora Team',
        enabled: data.enabled !== undefined ? data.enabled : true,
        plugin_type: 'system',
        category: 'other',
        icon: '🔌',
        config: data.config || {},
        installed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      return {
        success: true,
        data: mockPlugin
      }
    }
    
    const response = await put(`/api/v1/plugins/${id}`, data)
    return response as unknown as { success: boolean; data?: PluginInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '更新插件失败'
    }
  }
}

// 删除插件
export async function deletePlugin(id: string): Promise<{ success: boolean; message?: string }> {
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
    
    const response = await del(`/api/v1/plugins/${id}`)
    return response as unknown as { success: boolean; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '删除插件失败'
    }
  }
}

// 启用/禁用插件
export async function togglePlugin(id: string, enabled: boolean): Promise<{ success: boolean; data?: PluginInfo; message?: string }> {
  try {
    return await updatePlugin(id, { enabled })
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '操作失败'
    }
  }
}

// 获取插件分类列表
export async function getPluginCategories(): Promise<{ success: boolean; data?: string[]; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return {
        success: true,
        data: ['search', 'export', 'analytics', 'integration', 'backup', 'other']
      }
    }
    
    const response = await get('/api/v1/plugins/categories')
    return response as unknown as { success: boolean; data?: string[]; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取分类失败'
    }
  }
}

