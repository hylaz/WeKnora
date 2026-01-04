import { get, post, put, del } from '@/utils/admin-request'

// 模型信息接口
export interface ModelInfo {
  id: string
  tenant_id?: number
  name: string
  type: 'KnowledgeQA' | 'Embedding' | 'Rerank' | 'VLLM'
  source: 'local' | 'remote'
  description?: string
  parameters: {
    base_url?: string
    api_key?: string
    provider?: string
    embedding_parameters?: {
      dimension?: number
      truncate_prompt_tokens?: number
    }
    interface_type?: 'ollama' | 'openai'
    parameter_size?: string
    extra_config?: Record<string, string>
  }
  is_default?: boolean
  is_builtin?: boolean
  status?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

// 创建模型请求
export interface CreateModelRequest {
  name: string
  type: 'KnowledgeQA' | 'Embedding' | 'Rerank' | 'VLLM'
  source: 'local' | 'remote'
  description?: string
  parameters: {
    base_url?: string
    api_key?: string
    provider?: string
    embedding_parameters?: {
      dimension?: number
      truncate_prompt_tokens?: number
    }
    interface_type?: 'ollama' | 'openai'
    parameter_size?: string
    extra_config?: Record<string, string>
  }
}

// 更新模型请求
export interface UpdateModelRequest {
  name?: string
  description?: string
  parameters?: {
    base_url?: string
    api_key?: string
    provider?: string
    embedding_parameters?: {
      dimension?: number
      truncate_prompt_tokens?: number
    }
    interface_type?: 'ollama' | 'openai'
    parameter_size?: string
    extra_config?: Record<string, string>
  }
  is_default?: boolean
}

// 服务商信息
export interface ProviderInfo {
  value: string
  label: string
  description?: string
  defaultUrls?: {
    chat?: string
    embedding?: string
    rerank?: string
  }
  modelTypes?: string[]
}

// 获取模型列表
export async function listModels(params?: {
  page?: number
  page_size?: number
  type?: 'KnowledgeQA' | 'Embedding' | 'Rerank' | 'VLLM'
  source?: 'local' | 'remote'
  keyword?: string
}): Promise<{ success: boolean; data?: ModelInfo[] | { items: ModelInfo[]; total: number; page: number; page_size: number }; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock 模型数据
      const mockModels: ModelInfo[] = [
        {
          id: 'model-001',
          tenant_id: 1,
          name: 'qwen-plus',
          type: 'KnowledgeQA',
          source: 'remote',
          description: '阿里云通义千问 Plus 大模型',
          parameters: {
            base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            api_key: 'sk-***',
            provider: 'aliyun'
          },
          is_default: true,
          is_builtin: false,
          status: 'active',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'model-002',
          tenant_id: 1,
          name: 'text-embedding-v3',
          type: 'Embedding',
          source: 'remote',
          description: '阿里云通义千问 Embedding 模型',
          parameters: {
            base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            api_key: 'sk-***',
            provider: 'aliyun',
            embedding_parameters: {
              dimension: 1024,
              truncate_prompt_tokens: 0
            }
          },
          is_default: true,
          is_builtin: false,
          status: 'active',
          created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'model-003',
          tenant_id: 1,
          name: 'gte-rerank',
          type: 'Rerank',
          source: 'remote',
          description: '阿里云 GTE Rerank 模型',
          parameters: {
            base_url: 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank',
            api_key: 'sk-***',
            provider: 'aliyun'
          },
          is_default: false,
          is_builtin: false,
          status: 'active',
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'model-004',
          tenant_id: 1,
          name: 'qwen-vl-plus',
          type: 'VLLM',
          source: 'remote',
          description: '阿里云通义千问视觉模型',
          parameters: {
            base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            api_key: 'sk-***',
            provider: 'aliyun'
          },
          is_default: false,
          is_builtin: false,
          status: 'active',
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'model-005',
          tenant_id: 1,
          name: 'qwen3:8b',
          type: 'KnowledgeQA',
          source: 'local',
          description: '本地 Ollama Qwen3 8B 模型',
          parameters: {
            base_url: '',
            api_key: '',
            parameter_size: '8B'
          },
          is_default: false,
          is_builtin: false,
          status: 'active',
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'model-006',
          tenant_id: 1,
          name: 'nomic-embed-text:latest',
          type: 'Embedding',
          source: 'local',
          description: '本地 Ollama Embedding 模型',
          parameters: {
            base_url: '',
            api_key: '',
            embedding_parameters: {
              dimension: 768,
              truncate_prompt_tokens: 0
            }
          },
          is_default: false,
          is_builtin: false,
          status: 'active',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      // 过滤逻辑
      let filteredModels = [...mockModels]
      
      if (params?.type) {
        filteredModels = filteredModels.filter(m => m.type === params.type)
      }
      
      if (params?.source) {
        filteredModels = filteredModels.filter(m => m.source === params.source)
      }
      
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredModels = filteredModels.filter(m => 
          m.name.toLowerCase().includes(keyword) ||
          m.description?.toLowerCase().includes(keyword)
        )
      }
      
      // 如果指定了分页参数，返回分页格式
      if (params?.page && params?.page_size) {
        const page = params.page
        const pageSize = params.page_size
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedModels = filteredModels.slice(start, end)
        
        return {
          success: true,
          data: {
            items: paginatedModels,
            total: filteredModels.length,
            page: page,
            page_size: pageSize
          }
        }
      }
      
      return {
        success: true,
        data: filteredModels
      }
    }
    
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.page_size) queryParams.append('page_size', String(params.page_size))
    if (params?.type) queryParams.append('type', params.type)
    if (params?.source) queryParams.append('source', params.source)
    if (params?.keyword) queryParams.append('keyword', params.keyword)
    
    const queryString = queryParams.toString()
    const url = `/api/v1/models${queryString ? '?' + queryString : ''}`
    const response = await get(url)
    return response as unknown as { success: boolean; data?: ModelInfo[] | { items: ModelInfo[]; total: number; page: number; page_size: number }; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取模型列表失败'
    }
  }
}

// 获取模型详情
export async function getModelById(id: string): Promise<{ success: boolean; data?: ModelInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 从mock列表中找到对应模型
      const mockModels: ModelInfo[] = [
        {
          id: 'model-001',
          tenant_id: 1,
          name: 'qwen-plus',
          type: 'KnowledgeQA',
          source: 'remote',
          description: '阿里云通义千问 Plus 大模型，支持高质量对话生成和知识问答',
          parameters: {
            base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            api_key: 'sk-***',
            provider: 'aliyun'
          },
          is_default: true,
          is_builtin: false,
          status: 'active',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      const model = mockModels.find(m => m.id === id) || mockModels[0]
      
      return {
        success: true,
        data: { ...model, id: id } // 使用传入的ID
      }
    }
    
    const response = await get(`/api/v1/models/${id}`)
    return response as unknown as { success: boolean; data?: ModelInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取模型详情失败'
    }
  }
}

// 创建模型
export async function createModel(data: CreateModelRequest): Promise<{ success: boolean; data?: ModelInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock 创建的模型
      const mockModel: ModelInfo = {
        id: 'model-' + Date.now(),
        tenant_id: 1,
        name: data.name,
        type: data.type,
        source: data.source,
        description: data.description || '',
        parameters: data.parameters,
        is_default: false,
        is_builtin: false,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: mockModel
      }
    }
    
    const response = await post('/api/v1/models', data)
    return response as unknown as { success: boolean; data?: ModelInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '创建模型失败'
    }
  }
}

// 更新模型
export async function updateModel(id: string, data: UpdateModelRequest): Promise<{ success: boolean; data?: ModelInfo; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock 更新后的模型
      const mockModel: ModelInfo = {
        id: id,
        tenant_id: 1,
        name: data.name || 'updated-model',
        type: 'KnowledgeQA',
        source: 'remote',
        description: data.description || '',
        parameters: data.parameters || {},
        is_default: data.is_default || false,
        is_builtin: false,
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: mockModel
      }
    }
    
    const response = await put(`/api/v1/models/${id}`, data)
    return response as unknown as { success: boolean; data?: ModelInfo; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '更新模型失败'
    }
  }
}

// 删除模型
export async function deleteModel(id: string): Promise<{ success: boolean; message?: string }> {
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
    
    const response = await del(`/api/v1/models/${id}`)
    return response as unknown as { success: boolean; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '删除模型失败'
    }
  }
}

// 获取服务商列表
export async function getProviders(modelType?: string): Promise<{ success: boolean; data?: ProviderInfo[]; message?: string }> {
  try {
    // Mock 数据支持（开发环境）
    const useMock = import.meta.env.DEV || import.meta.env.MODE === 'development'
    
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockProviders: ProviderInfo[] = [
        {
          value: 'aliyun',
          label: '阿里云 DashScope',
          description: '阿里云百炼大模型服务',
          defaultUrls: {
            chat: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            embedding: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            rerank: 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank'
          },
          modelTypes: ['KnowledgeQA', 'Embedding', 'Rerank', 'VLLM']
        },
        {
          value: 'zhipu',
          label: '智谱 AI',
          description: '智谱清言大模型',
          defaultUrls: {
            chat: 'https://open.bigmodel.cn/api/paas/v4',
            embedding: 'https://open.bigmodel.cn/api/paas/v4/embeddings'
          },
          modelTypes: ['KnowledgeQA', 'Embedding', 'VLLM']
        },
        {
          value: 'openai',
          label: 'OpenAI',
          description: 'OpenAI 官方 API',
          defaultUrls: {
            chat: 'https://api.openai.com/v1',
            embedding: 'https://api.openai.com/v1'
          },
          modelTypes: ['KnowledgeQA', 'Embedding', 'VLLM']
        },
        {
          value: 'generic',
          label: '自定义 API（OpenAI 兼容）',
          description: '兼容 OpenAI API 格式的自定义服务',
          modelTypes: ['KnowledgeQA', 'Embedding', 'Rerank', 'VLLM']
        }
      ]
      
      // 如果指定了模型类型，过滤支持该类型的服务商
      if (modelType) {
        const filtered = mockProviders.filter(p => 
          p.modelTypes?.includes(modelType)
        )
        return {
          success: true,
          data: filtered
        }
      }
      
      return {
        success: true,
        data: mockProviders
      }
    }
    
    const queryParams = modelType ? `?model_type=${modelType}` : ''
    const response = await get(`/api/v1/models/providers${queryParams}`)
    return response as unknown as { success: boolean; data?: ProviderInfo[]; message?: string }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取服务商列表失败'
    }
  }
}

