<template>
  <div class="model-detail-container">
    <div v-if="loading" class="loading-container">
      <t-loading :loading="loading" />
    </div>

    <div v-else-if="model" class="detail-content">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <t-button
            theme="default"
            variant="text"
            @click="$router.back()"
          >
            <t-icon name="chevron-left" />
            {{ $t('common.back') }}
          </t-button>
          <h1 class="page-title">{{ model.name }}</h1>
        </div>
        <div class="header-actions">
          <t-button
            theme="primary"
            @click="handleEdit"
          >
            {{ $t('common.edit') }}
          </t-button>
        </div>
      </div>

      <!-- 基本信息卡片 -->
      <t-card :title="$t('admin.model.basicInfo')" class="info-card">
        <t-descriptions :column="2">
          <t-descriptions-item :label="$t('admin.model.id')">
            {{ model.id }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.model.name')">
            {{ model.name }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.model.type')">
            <t-tag :theme="getTypeTheme(model.type)">
              {{ getTypeLabel(model.type) }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.model.source')">
            <t-tag :theme="model.source === 'local' ? 'warning' : 'primary'">
              {{ model.source === 'local' ? $t('admin.model.sourceLocal') : $t('admin.model.sourceRemote') }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.model.description')" :span="2">
            {{ model.description || $t('admin.model.noDescription') }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.model.status')">
            <t-tag :theme="model.status === 'active' ? 'success' : 'default'">
              {{ model.status === 'active' ? $t('admin.model.statusActive') : $t('admin.model.statusInactive') }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.model.isDefault')">
            <t-tag v-if="model.is_default" theme="success">
              {{ $t('admin.model.default') }}
            </t-tag>
            <span v-else>-</span>
          </t-descriptions-item>
        </t-descriptions>
      </t-card>

      <!-- 参数配置卡片 -->
      <t-card :title="$t('admin.model.parametersInfo')" class="info-card">
        <t-descriptions :column="1">
          <t-descriptions-item v-if="model.parameters.base_url" :label="$t('admin.model.baseUrl')">
            {{ model.parameters.base_url }}
          </t-descriptions-item>
          <t-descriptions-item v-if="model.parameters.api_key" :label="$t('admin.model.apiKey')">
            {{ maskApiKey(model.parameters.api_key) }}
            <t-button
              theme="default"
              variant="text"
              size="small"
              @click="handleCopyApiKey(model.parameters.api_key!)"
              style="margin-left: 8px;"
            >
              <t-icon name="file-copy" />
              {{ $t('common.copy') }}
            </t-button>
          </t-descriptions-item>
          <t-descriptions-item v-if="model.parameters.provider" :label="$t('admin.model.provider')">
            {{ model.parameters.provider }}
          </t-descriptions-item>
          <t-descriptions-item v-if="model.parameters.parameter_size" :label="$t('admin.model.parameterSize')">
            {{ model.parameters.parameter_size }}
          </t-descriptions-item>
          <t-descriptions-item v-if="model.parameters.interface_type" :label="$t('admin.model.interfaceType')">
            {{ model.parameters.interface_type }}
          </t-descriptions-item>
          <t-descriptions-item v-if="model.parameters.embedding_parameters" :label="$t('admin.model.embeddingParameters')">
            <div class="embedding-params">
              <div v-if="model.parameters.embedding_parameters.dimension">
                {{ $t('admin.model.dimension') }}: {{ model.parameters.embedding_parameters.dimension }}
              </div>
              <div v-if="model.parameters.embedding_parameters.truncate_prompt_tokens !== undefined">
                {{ $t('admin.model.truncatePromptTokens') }}: {{ model.parameters.embedding_parameters.truncate_prompt_tokens }}
              </div>
            </div>
          </t-descriptions-item>
          <t-descriptions-item v-if="model.parameters.extra_config && Object.keys(model.parameters.extra_config).length > 0" :label="$t('admin.model.extraConfig')">
            <pre class="config-json">{{ JSON.stringify(model.parameters.extra_config, null, 2) }}</pre>
          </t-descriptions-item>
        </t-descriptions>
      </t-card>

      <!-- 时间信息卡片 -->
      <t-card :title="$t('admin.model.timeInfo')" class="info-card">
        <t-descriptions :column="2">
          <t-descriptions-item :label="$t('admin.model.createdAt')">
            {{ formatDate(model.created_at) }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.model.updatedAt')">
            {{ formatDate(model.updated_at) }}
          </t-descriptions-item>
        </t-descriptions>
      </t-card>
    </div>

    <!-- 编辑对话框 -->
    <ModelFormDialog
      v-model:visible="formDialogVisible"
      :model="model"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getModelById, type ModelInfo } from '@/api/admin/model'
import { useI18n } from 'vue-i18n'
import ModelFormDialog from './components/ModelFormDialog.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const model = ref<ModelInfo | null>(null)
const formDialogVisible = ref(false)

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'KnowledgeQA': t('admin.model.typeKnowledgeQA'),
    'Embedding': t('admin.model.typeEmbedding'),
    'Rerank': t('admin.model.typeRerank'),
    'VLLM': t('admin.model.typeVLLM')
  }
  return typeMap[type] || type
}

const getTypeTheme = (type: string) => {
  const themeMap: Record<string, string> = {
    'KnowledgeQA': 'primary',
    'Embedding': 'success',
    'Rerank': 'warning',
    'VLLM': 'danger'
  }
  return themeMap[type] || 'default'
}

const fetchDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    MessagePlugin.error(t('admin.model.invalidId'))
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await getModelById(id)
    if (response.success && response.data) {
      model.value = response.data
    } else {
      MessagePlugin.error(response.message || t('admin.model.fetchError'))
      router.back()
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.model.fetchError'))
    router.back()
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  formDialogVisible.value = true
}

const handleCopyApiKey = (apiKey: string) => {
  navigator.clipboard.writeText(apiKey).then(() => {
    MessagePlugin.success(t('admin.model.apiKeyCopied'))
  }).catch(() => {
    MessagePlugin.error(t('admin.model.apiKeyCopyError'))
  })
}

const maskApiKey = (apiKey?: string) => {
  if (!apiKey) return ''
  if (apiKey.length <= 10) return '****'
  return apiKey.substring(0, 6) + '****' + apiKey.substring(apiKey.length - 4)
}

const handleFormSuccess = () => {
  formDialogVisible.value = false
  fetchDetail()
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchDetail()
})
</script>

<style lang="less" scoped>
.model-detail-container {
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0;
      font-family: "PingFang SC", sans-serif;
    }
  }
}

.info-card {
  margin-bottom: 24px;

  :deep(.t-card__body) {
    padding: 24px;
  }
}

.embedding-params {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: "PingFang SC", sans-serif;
}

.config-json {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #374151;
  margin: 0;
  overflow-x: auto;
}
</style>

