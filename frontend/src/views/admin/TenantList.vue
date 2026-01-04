<template>
  <div class="tenant-list-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ $t('admin.tenant.title') }}</h1>
        <p class="page-subtitle">{{ $t('admin.tenant.subtitle') }}</p>
      </div>
      <t-button theme="primary" @click="handleCreate">
        <t-icon name="add" />
        {{ $t('admin.tenant.create') }}
      </t-button>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="filter-bar">
      <t-input
        v-model="searchKeyword"
        :placeholder="$t('admin.tenant.searchPlaceholder')"
        clearable
        @clear="handleSearch"
        @enter="handleSearch"
        style="width: 300px;"
      >
        <template #suffix-icon>
          <t-icon name="search" />
        </template>
      </t-input>
      <t-select
        v-model="statusFilter"
        :placeholder="$t('admin.tenant.statusFilter')"
        clearable
        style="width: 150px; margin-left: 12px;"
        @change="handleSearch"
      >
        <t-option value="active" :label="$t('admin.tenant.statusActive')" />
        <t-option value="inactive" :label="$t('admin.tenant.statusInactive')" />
      </t-select>
    </div>

    <!-- 租户表格 -->
    <div class="table-container">
      <t-table
        :data="tenantList"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 'active' ? 'success' : 'default'">
            {{ row.status === 'active' ? $t('admin.tenant.statusActive') : $t('admin.tenant.statusInactive') }}
          </t-tag>
        </template>

        <template #storageUsage="{ row }">
          <div class="storage-usage">
            <span class="usage-text">{{ formatStorage(row.storage_used) }} / {{ formatStorage(row.storage_quota) }}</span>
            <t-progress
              :percentage="getStoragePercentage(row)"
              :theme="getStorageTheme(row)"
              :size="'small'"
              style="width: 100px; margin-left: 12px;"
            />
          </div>
        </template>

        <template #apiKey="{ row }">
          <div class="api-key-cell">
            <span class="api-key-text">{{ maskApiKey(row.api_key) }}</span>
            <t-button
              theme="default"
              variant="text"
              size="small"
              @click="handleCopyApiKey(row.api_key)"
            >
              <t-icon name="file-copy" />
            </t-button>
          </div>
        </template>

        <template #operation="{ row }">
          <t-space>
            <t-button
              theme="primary"
              variant="text"
              size="small"
              @click="handleView(row)"
            >
              {{ $t('common.view') }}
            </t-button>
            <t-button
              theme="primary"
              variant="text"
              size="small"
              @click="handleEdit(row)"
            >
              {{ $t('common.edit') }}
            </t-button>
            <t-button
              theme="danger"
              variant="text"
              size="small"
              @click="handleDelete(row)"
            >
              {{ $t('common.delete') }}
            </t-button>
          </t-space>
        </template>
      </t-table>
    </div>

    <!-- 创建/编辑对话框 -->
    <TenantFormDialog
      v-model:visible="formDialogVisible"
      :tenant="editingTenant"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { listTenants, deleteTenant, type TenantInfo } from '@/api/admin/tenant'
import { useI18n } from 'vue-i18n'
import TenantFormDialog from './components/TenantFormDialog.vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const tenantList = ref<TenantInfo[]>([])
const searchKeyword = ref('')
const statusFilter = ref<string>('')
const formDialogVisible = ref(false)
const editingTenant = ref<TenantInfo | null>(null)

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showJumper: true,
  showSizeChanger: true
})

const columns = computed(() => [
  { colKey: 'id', title: 'ID', width: 100 },
  { colKey: 'name', title: t('admin.tenant.name'), width: 200 },
  { colKey: 'business', title: t('admin.tenant.business'), width: 150 },
  { colKey: 'status', title: t('admin.tenant.status'), width: 100 },
  { colKey: 'storageUsage', title: t('admin.tenant.storageUsage'), width: 250 },
  { colKey: 'apiKey', title: t('admin.tenant.apiKey'), width: 200 },
  { colKey: 'created_at', title: t('admin.tenant.createdAt'), width: 180 },
  { colKey: 'operation', title: t('common.operation'), width: 200, fixed: 'right' }
])

const fetchList = async () => {
  loading.value = true
  try {
    const response = await listTenants()
    if (response.success && response.data) {
      tenantList.value = response.data.items || []
      pagination.total = tenantList.value.length
    } else {
      MessagePlugin.error(response.message || t('admin.tenant.fetchError'))
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.tenant.fetchError'))
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  editingTenant.value = null
  formDialogVisible.value = true
}

const handleView = (tenant: TenantInfo) => {
  router.push(`/admin/tenants/${tenant.id}`)
}

const handleEdit = (tenant: TenantInfo) => {
  editingTenant.value = tenant
  formDialogVisible.value = true
}

const handleDelete = async (tenant: TenantInfo) => {
  const dialog = DialogPlugin.confirm({
    header: t('admin.tenant.deleteConfirm'),
    body: t('admin.tenant.deleteConfirmMessage', { name: tenant.name }),
    onConfirm: async () => {
      try {
        const response = await deleteTenant(tenant.id)
        if (response.success) {
          MessagePlugin.success(t('admin.tenant.deleteSuccess'))
          fetchList()
        } else {
          MessagePlugin.error(response.message || t('admin.tenant.deleteError'))
        }
      } catch (error: any) {
        MessagePlugin.error(error.message || t('admin.tenant.deleteError'))
      }
      dialog.destroy()
    }
  })
}

const handleSearch = () => {
  pagination.current = 1
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.current = page
  fetchList()
}

const handlePageSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchList()
}

const handleFormSuccess = () => {
  formDialogVisible.value = false
  editingTenant.value = null
  fetchList()
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

const maskApiKey = (apiKey?: string) => {
  if (!apiKey) return ''
  if (apiKey.length <= 10) return '****'
  return apiKey.substring(0, 6) + '****' + apiKey.substring(apiKey.length - 4)
}

const handleCopyApiKey = (apiKey?: string) => {
  if (!apiKey) return
  navigator.clipboard.writeText(apiKey).then(() => {
    MessagePlugin.success(t('admin.tenant.apiKeyCopied'))
  }).catch(() => {
    MessagePlugin.error(t('admin.tenant.apiKeyCopyError'))
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="less" scoped>
.tenant-list-container {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-content {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
      font-family: "PingFang SC", sans-serif;
    }

    .page-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      font-family: "PingFang SC", sans-serif;
    }
  }
}

.filter-bar {
  display: flex;
  margin-bottom: 24px;
}

.table-container {
  :deep(.t-table) {
    font-family: "PingFang SC", sans-serif;
  }
}

.storage-usage {
  display: flex;
  align-items: center;

  .usage-text {
    font-size: 13px;
    color: #374151;
  }
}

.api-key-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .api-key-text {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #6b7280;
  }
}
</style>

