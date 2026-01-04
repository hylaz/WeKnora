<template>
  <div class="plugin-list-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ $t('admin.plugin.title') }}</h1>
        <p class="page-subtitle">{{ $t('admin.plugin.subtitle') }}</p>
      </div>
      <t-button theme="primary" @click="handleCreate">
        <t-icon name="add" />
        {{ $t('admin.plugin.create') }}
      </t-button>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="filter-bar">
      <t-input
        v-model="searchKeyword"
        :placeholder="$t('admin.plugin.searchPlaceholder')"
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
        v-model="categoryFilter"
        :placeholder="$t('admin.plugin.categoryFilter')"
        clearable
        style="width: 150px; margin-left: 12px;"
        @change="handleSearch"
      >
        <t-option
          v-for="category in categories"
          :key="category"
          :value="category"
          :label="$t(`admin.plugin.categories.${category}`) || category"
        />
      </t-select>
      <t-select
        v-model="statusFilter"
        :placeholder="$t('admin.plugin.statusFilter')"
        clearable
        style="width: 150px; margin-left: 12px;"
        @change="handleSearch"
      >
        <t-option value="true" :label="$t('admin.plugin.enabled')" />
        <t-option value="false" :label="$t('admin.plugin.disabled')" />
      </t-select>
    </div>

    <!-- 插件表格 -->
    <div class="table-container">
      <t-table
        :data="pluginList"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #icon="{ row }">
          <span class="plugin-icon">{{ row.icon || '🔌' }}</span>
        </template>

        <template #type="{ row }">
          <t-tag :theme="row.plugin_type === 'system' ? 'primary' : 'default'">
            {{ row.plugin_type === 'system' ? $t('admin.plugin.typeSystem') : $t('admin.plugin.typeCustom') }}
          </t-tag>
        </template>

        <template #enabled="{ row }">
          <t-switch
            :value="row.enabled"
            @change="(val) => handleToggleEnabled(row, val)"
            :loading="togglingIds.includes(row.id)"
          />
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
              :disabled="row.plugin_type === 'system'"
            >
              {{ $t('common.delete') }}
            </t-button>
          </t-space>
        </template>
      </t-table>
    </div>

    <!-- 创建/编辑对话框 -->
    <PluginFormDialog
      v-model:visible="formDialogVisible"
      :plugin="editingPlugin"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { listPlugins, deletePlugin, togglePlugin, getPluginCategories, type PluginInfo } from '@/api/admin/plugin'
import { useI18n } from 'vue-i18n'
import PluginFormDialog from './components/PluginFormDialog.vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const pluginList = ref<PluginInfo[]>([])
const searchKeyword = ref('')
const categoryFilter = ref<string>('')
const statusFilter = ref<string>('')
const categories = ref<string[]>([])
const formDialogVisible = ref(false)
const editingPlugin = ref<PluginInfo | null>(null)
const togglingIds = ref<string[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showJumper: true,
  showSizeChanger: true
})

const columns = computed(() => [
  { colKey: 'icon', title: '', width: 60 },
  { colKey: 'display_name', title: t('admin.plugin.name'), width: 200 },
  { colKey: 'description', title: t('admin.plugin.description'), width: 300 },
  { colKey: 'version', title: t('admin.plugin.version'), width: 100 },
  { colKey: 'type', title: t('admin.plugin.type'), width: 100 },
  { colKey: 'category', title: t('admin.plugin.category'), width: 120 },
  { colKey: 'enabled', title: t('admin.plugin.status'), width: 100 },
  { colKey: 'updated_at', title: t('admin.plugin.updatedAt'), width: 180 },
  { colKey: 'operation', title: t('common.operation'), width: 200, fixed: 'right' }
])

const fetchList = async () => {
  loading.value = true
  try {
    const response = await listPlugins({
      page: pagination.current,
      page_size: pagination.pageSize,
      category: categoryFilter.value || undefined,
      enabled: statusFilter.value ? statusFilter.value === 'true' : undefined,
      keyword: searchKeyword.value || undefined
    })
    if (response.success && response.data) {
      pluginList.value = response.data.items || []
      pagination.total = response.data.total || 0
    } else {
      MessagePlugin.error(response.message || t('admin.plugin.fetchError'))
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.plugin.fetchError'))
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await getPluginCategories()
    if (response.success && response.data) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const handleCreate = () => {
  editingPlugin.value = null
  formDialogVisible.value = true
}

const handleView = (plugin: PluginInfo) => {
  router.push(`/admin/plugins/${plugin.id}`)
}

const handleEdit = (plugin: PluginInfo) => {
  editingPlugin.value = plugin
  formDialogVisible.value = true
}

const handleDelete = async (plugin: PluginInfo) => {
  if (plugin.plugin_type === 'system') {
    MessagePlugin.warning(t('admin.plugin.cannotDeleteSystem'))
    return
  }

  const dialog = DialogPlugin.confirm({
    header: t('admin.plugin.deleteConfirm'),
    body: t('admin.plugin.deleteConfirmMessage', { name: plugin.display_name }),
    onConfirm: async () => {
      try {
        const response = await deletePlugin(plugin.id)
        if (response.success) {
          MessagePlugin.success(t('admin.plugin.deleteSuccess'))
          fetchList()
        } else {
          MessagePlugin.error(response.message || t('admin.plugin.deleteError'))
        }
      } catch (error: any) {
        MessagePlugin.error(error.message || t('admin.plugin.deleteError'))
      }
      dialog.destroy()
    }
  })
}

const handleToggleEnabled = async (plugin: PluginInfo, enabled: boolean) => {
  togglingIds.value.push(plugin.id)
  try {
    const response = await togglePlugin(plugin.id, enabled)
    if (response.success) {
      plugin.enabled = enabled
      MessagePlugin.success(enabled ? t('admin.plugin.enableSuccess') : t('admin.plugin.disableSuccess'))
    } else {
      MessagePlugin.error(response.message || t('admin.plugin.toggleError'))
      plugin.enabled = !enabled // 恢复原状态
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.plugin.toggleError'))
    plugin.enabled = !enabled // 恢复原状态
  } finally {
    togglingIds.value = togglingIds.value.filter(id => id !== plugin.id)
  }
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
  editingPlugin.value = null
  fetchList()
}

onMounted(() => {
  fetchCategories()
  fetchList()
})
</script>

<style lang="less" scoped>
.plugin-list-container {
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

.plugin-icon {
  font-size: 24px;
  display: inline-block;
}
</style>

