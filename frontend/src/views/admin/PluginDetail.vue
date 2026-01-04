<template>
  <div class="plugin-detail-container">
    <div v-if="loading" class="loading-container">
      <t-loading :loading="loading" />
    </div>

    <div v-else-if="plugin" class="detail-content">
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
          <div class="title-section">
            <span class="plugin-icon">{{ plugin.icon || '🔌' }}</span>
            <h1 class="page-title">{{ plugin.display_name }}</h1>
          </div>
        </div>
        <div class="header-actions">
          <t-switch
            :value="plugin.enabled"
            :label="plugin.enabled ? $t('admin.plugin.enabled') : $t('admin.plugin.disabled')"
            @change="(val) => handleToggleEnabled(val)"
            :loading="toggling"
          />
          <t-button
            theme="primary"
            @click="handleEdit"
            style="margin-left: 12px;"
          >
            {{ $t('common.edit') }}
          </t-button>
        </div>
      </div>

      <!-- 基本信息卡片 -->
      <t-card :title="$t('admin.plugin.basicInfo')" class="info-card">
        <t-descriptions :column="2">
          <t-descriptions-item :label="$t('admin.plugin.id')">
            {{ plugin.id }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.name')">
            {{ plugin.display_name }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.internalName')">
            {{ plugin.name }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.version')">
            {{ plugin.version }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.author')">
            {{ plugin.author || $t('admin.plugin.noAuthor') }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.type')">
            <t-tag :theme="plugin.plugin_type === 'system' ? 'primary' : 'default'">
              {{ plugin.plugin_type === 'system' ? $t('admin.plugin.typeSystem') : $t('admin.plugin.typeCustom') }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.category')">
            {{ plugin.category ? $t(`admin.plugin.categories.${plugin.category}`) || plugin.category : $t('admin.plugin.noCategory') }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.status')">
            <t-tag :theme="plugin.enabled ? 'success' : 'default'">
              {{ plugin.enabled ? $t('admin.plugin.enabled') : $t('admin.plugin.disabled') }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.description')" :span="2">
            {{ plugin.description || $t('admin.plugin.noDescription') }}
          </t-descriptions-item>
        </t-descriptions>
      </t-card>

      <!-- 配置信息卡片 -->
      <t-card :title="$t('admin.plugin.configInfo')" class="info-card">
        <div v-if="plugin.config && Object.keys(plugin.config).length > 0" class="config-section">
          <t-descriptions :column="1">
            <t-descriptions-item
              v-for="(value, key) in plugin.config"
              :key="key"
              :label="key"
            >
              {{ typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value) }}
            </t-descriptions-item>
          </t-descriptions>
        </div>
        <div v-else class="empty-config">
          {{ $t('admin.plugin.noConfig') }}
        </div>
      </t-card>

      <!-- 时间信息卡片 -->
      <t-card :title="$t('admin.plugin.timeInfo')" class="info-card">
        <t-descriptions :column="2">
          <t-descriptions-item :label="$t('admin.plugin.installedAt')">
            {{ formatDate(plugin.installed_at) }}
          </t-descriptions-item>
          <t-descriptions-item :label="$t('admin.plugin.updatedAt')">
            {{ formatDate(plugin.updated_at) }}
          </t-descriptions-item>
          <t-descriptions-item v-if="plugin.created_at" :label="$t('admin.plugin.createdAt')">
            {{ formatDate(plugin.created_at) }}
          </t-descriptions-item>
        </t-descriptions>
      </t-card>
    </div>

    <!-- 编辑对话框 -->
    <PluginFormDialog
      v-model:visible="formDialogVisible"
      :plugin="plugin"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getPluginById, togglePlugin, type PluginInfo } from '@/api/admin/plugin'
import { useI18n } from 'vue-i18n'
import PluginFormDialog from './components/PluginFormDialog.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const plugin = ref<PluginInfo | null>(null)
const formDialogVisible = ref(false)
const toggling = ref(false)

const fetchDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    MessagePlugin.error(t('admin.plugin.invalidId'))
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await getPluginById(id)
    if (response.success && response.data) {
      plugin.value = response.data
    } else {
      MessagePlugin.error(response.message || t('admin.plugin.fetchError'))
      router.back()
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.plugin.fetchError'))
    router.back()
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  formDialogVisible.value = true
}

const handleToggleEnabled = async (enabled: boolean) => {
  if (!plugin.value) return
  
  toggling.value = true
  try {
    const response = await togglePlugin(plugin.value.id, enabled)
    if (response.success && response.data) {
      plugin.value = response.data
      MessagePlugin.success(enabled ? t('admin.plugin.enableSuccess') : t('admin.plugin.disableSuccess'))
    } else {
      MessagePlugin.error(response.message || t('admin.plugin.toggleError'))
      plugin.value.enabled = !enabled // 恢复原状态
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.plugin.toggleError'))
    if (plugin.value) {
      plugin.value.enabled = !enabled // 恢复原状态
    }
  } finally {
    toggling.value = false
  }
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
.plugin-detail-container {
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

    .title-section {
      display: flex;
      align-items: center;
      gap: 12px;

      .plugin-icon {
        font-size: 32px;
      }

      .page-title {
        font-size: 24px;
        font-weight: 600;
        color: #111827;
        margin: 0;
        font-family: "PingFang SC", sans-serif;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
  }
}

.info-card {
  margin-bottom: 24px;

  :deep(.t-card__body) {
    padding: 24px;
  }
}

.config-section {
  :deep(.t-descriptions) {
    font-family: "PingFang SC", sans-serif;
  }
}

.empty-config {
  color: #6b7280;
  text-align: center;
  padding: 40px;
  font-family: "PingFang SC", sans-serif;
}
</style>

