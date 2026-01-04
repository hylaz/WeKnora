<template>
  <div class="tenant-detail-container">
    <div v-if="loading" class="loading-container">
      <t-loading :loading="loading" />
    </div>

    <div v-else-if="tenant" class="detail-content">
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
          <h1 class="page-title">{{ tenant.name }}</h1>
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
      <t-card :title="$t('admin.tenant.basicInfo')" class="info-card">
        <t-descriptions :column="2">
          <t-descriptions-item :label="$t('admin.tenant.id')">
            {{ tenant.id }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.tenant.name')">
            {{ tenant.name }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.tenant.description')">
            {{ tenant.description || $t('admin.tenant.noDescription') }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.tenant.business')">
            {{ tenant.business }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.tenant.status')">
            <t-tag :theme="tenant.status === 'active' ? 'success' : 'default'">
              {{ tenant.status === 'active' ? $t('admin.tenant.statusActive') : $t('admin.tenant.statusInactive') }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.tenant.createdAt')">
            {{ formatDate(tenant.created_at) }}
          </t-descriptions-item>
        </t-descriptions>
      </t-card>

      <!-- API Key 卡片 -->
      <t-card :title="$t('admin.tenant.apiKey')" class="info-card">
        <div class="api-key-section">
          <t-input
            :model-value="tenant.api_key"
            readonly
            style="flex: 1;"
          />
          <t-button
            theme="primary"
            @click="handleCopyApiKey"
          >
            <t-icon name="file-copy" />
            {{ $t('common.copy') }}
          </t-button>
          <t-button
            theme="warning"
            variant="outline"
            @click="handleRegenerateApiKey"
          >
            {{ $t('admin.tenant.regenerateApiKey') }}
          </t-button>
        </div>
      </t-card>

      <!-- 存储信息卡片 -->
      <t-card :title="$t('admin.tenant.storageInfo')" class="info-card">
        <div class="storage-section">
          <div class="storage-stats">
            <div class="stat-item">
              <div class="stat-label">{{ $t('admin.tenant.storageQuota') }}</div>
              <div class="stat-value">{{ formatStorage(tenant.storage_quota) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">{{ $t('admin.tenant.storageUsed') }}</div>
              <div class="stat-value">{{ formatStorage(tenant.storage_used) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">{{ $t('admin.tenant.storageUsage') }}</div>
              <div class="stat-value">{{ getStoragePercentage(tenant) }}%</div>
            </div>
          </div>
          <t-progress
            :percentage="getStoragePercentage(tenant)"
            :theme="getStorageTheme(tenant)"
            :size="'medium'"
          />
        </div>
      </t-card>

      <!-- 配置信息卡片 -->
      <t-card :title="$t('admin.tenant.configInfo')" class="info-card">
        <t-descriptions :column="1">
          <t-descriptions-item :label="$t('admin.tenant.retrieverEngines')">
            <div class="engines-list">
              <t-tag
                v-for="(engine, index) in tenant.retriever_engines?.engines"
                :key="index"
                style="margin-right: 8px;"
              >
                {{ getEngineLabel(engine) }}
              </t-tag>
            </div>
          </t-descriptions-item>
        </t-descriptions>
      </t-card>
    </div>

    <!-- 编辑对话框 -->
    <TenantFormDialog
      v-model:visible="formDialogVisible"
      :tenant="tenant"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { getTenantById, updateTenant, type TenantInfo } from '@/api/admin/tenant'
import { useI18n } from 'vue-i18n'
import TenantFormDialog from './components/TenantFormDialog.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const tenant = ref<TenantInfo | null>(null)
const formDialogVisible = ref(false)

const fetchDetail = async () => {
  const id = Number(route.params.id)
  if (!id) {
    MessagePlugin.error(t('admin.tenant.invalidId'))
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await getTenantById(id)
    if (response.success && response.data) {
      tenant.value = response.data
    } else {
      MessagePlugin.error(response.message || t('admin.tenant.fetchError'))
      router.back()
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.tenant.fetchError'))
    router.back()
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  formDialogVisible.value = true
}

const handleCopyApiKey = () => {
  if (!tenant.value?.api_key) return
  navigator.clipboard.writeText(tenant.value.api_key).then(() => {
    MessagePlugin.success(t('admin.tenant.apiKeyCopied'))
  }).catch(() => {
    MessagePlugin.error(t('admin.tenant.apiKeyCopyError'))
  })
}

const handleRegenerateApiKey = () => {
  if (!tenant.value) return

  const dialog = DialogPlugin.confirm({
    header: t('admin.tenant.regenerateApiKeyConfirm'),
    body: t('admin.tenant.regenerateApiKeyWarning'),
    onConfirm: async () => {
      try {
        // 更新租户信息会重新生成API Key
        const response = await updateTenant(tenant.value!.id, {
          name: tenant.value.name,
          business: tenant.value.business || ''
        })
        if (response.success && response.data) {
          tenant.value = response.data
          MessagePlugin.success(t('admin.tenant.regenerateApiKeySuccess'))
        } else {
          MessagePlugin.error(response.message || t('admin.tenant.regenerateApiKeyError'))
        }
      } catch (error: any) {
        MessagePlugin.error(error.message || t('admin.tenant.regenerateApiKeyError'))
      }
      dialog.destroy()
    }
  })
}

const handleFormSuccess = () => {
  formDialogVisible.value = false
  fetchDetail()
}

const formatStorage = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getStoragePercentage = (tenant: TenantInfo) => {
  if (!tenant.storage_quota) return 0
  return Math.round((tenant.storage_used / tenant.storage_quota) * 100)
}

const getStorageTheme = (tenant: TenantInfo) => {
  const percentage = getStoragePercentage(tenant)
  if (percentage >= 95) return 'danger'
  if (percentage >= 80) return 'warning'
  return 'success'
}

const getEngineLabel = (engine: { retriever_type: string; retriever_engine_type: string }) => {
  const typeLabel = engine.retriever_type === 'keywords' 
    ? t('admin.tenant.retrieverTypeKeywords')
    : t('admin.tenant.retrieverTypeVector')
  return `${typeLabel} (${engine.retriever_engine_type})`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchDetail()
})
</script>

<style lang="less" scoped>
.tenant-detail-container {
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

.api-key-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.storage-section {
  .storage-stats {
    display: flex;
    gap: 32px;
    margin-bottom: 24px;

    .stat-item {
      .stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 8px;
        font-family: "PingFang SC", sans-serif;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        font-family: "PingFang SC", sans-serif;
      }
    }
  }
}

.engines-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

