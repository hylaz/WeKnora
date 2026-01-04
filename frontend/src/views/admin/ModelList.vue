<template>
  <div class="model-list-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ $t('admin.model.title') }}</h1>
        <p class="page-subtitle">{{ $t('admin.model.subtitle') }}</p>
      </div>
      <t-button theme="primary" @click="handleCreate">
        <t-icon name="add" />
        {{ $t('admin.model.create') }}
      </t-button>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="filter-bar">
      <t-input
        v-model="searchKeyword"
        :placeholder="$t('admin.model.searchPlaceholder')"
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
        v-model="typeFilter"
        :placeholder="$t('admin.model.typeFilter')"
        clearable
        style="width: 150px; margin-left: 12px;"
        @change="handleSearch"
      >
        <t-option value="KnowledgeQA" :label="$t('admin.model.typeKnowledgeQA')" />
        <t-option value="Embedding" :label="$t('admin.model.typeEmbedding')" />
        <t-option value="Rerank" :label="$t('admin.model.typeRerank')" />
        <t-option value="VLLM" :label="$t('admin.model.typeVLLM')" />
      </t-select>
      <t-select
        v-model="sourceFilter"
        :placeholder="$t('admin.model.sourceFilter')"
        clearable
        style="width: 150px; margin-left: 12px;"
        @change="handleSearch"
      >
        <t-option value="local" :label="$t('admin.model.sourceLocal')" />
        <t-option value="remote" :label="$t('admin.model.sourceRemote')" />
      </t-select>
    </div>

    <!-- 模型表格 -->
    <div class="table-container">
      <t-table
        :data="modelList"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #type="{ row }">
          <t-tag :theme="getTypeTheme(row.type)">
            {{ getTypeLabel(row.type) }}
          </t-tag>
        </template>

        <template #source="{ row }">
          <t-tag :theme="row.source === 'local' ? 'warning' : 'primary'">
            {{ row.source === 'local' ? $t('admin.model.sourceLocal') : $t('admin.model.sourceRemote') }}
          </t-tag>
        </template>

        <template #status="{ row }">
          <t-tag :theme="row.status === 'active' ? 'success' : 'default'">
            {{ row.status === 'active' ? $t('admin.model.statusActive') : $t('admin.model.statusInactive') }}
          </t-tag>
        </template>

        <template #isDefault="{ row }">
          <t-tag v-if="row.is_default" theme="success">
            {{ $t('admin.model.default') }}
          </t-tag>
          <span v-else class="text-muted">-</span>
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
    <ModelFormDialog
      v-model:visible="formDialogVisible"
      :model="editingModel"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { listModels, deleteModel, type ModelInfo } from '@/api/admin/model'
import { useI18n } from 'vue-i18n'
import ModelFormDialog from './components/ModelFormDialog.vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const modelList = ref<ModelInfo[]>([])
const searchKeyword = ref('')
const typeFilter = ref<string>('')
const sourceFilter = ref<string>('')
const formDialogVisible = ref(false)
const editingModel = ref<ModelInfo | null>(null)

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showJumper: true,
  showSizeChanger: true
})

const columns = computed(() => [
  { colKey: 'name', title: t('admin.model.name'), width: 200 },
  { colKey: 'type', title: t('admin.model.type'), width: 120 },
  { colKey: 'source', title: t('admin.model.source'), width: 100 },
  { colKey: 'description', title: t('admin.model.description'), width: 250 },
  { colKey: 'isDefault', title: t('admin.model.isDefault'), width: 100 },
  { colKey: 'status', title: t('admin.model.status'), width: 100 },
  { colKey: 'updated_at', title: t('admin.model.updatedAt'), width: 180 },
  { colKey: 'operation', title: t('common.operation'), width: 200, fixed: 'right' }
])

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

const fetchList = async () => {
  loading.value = true
  try {
    const response = await listModels({
      page: pagination.current,
      page_size: pagination.pageSize,
      type: typeFilter.value as any || undefined,
      source: sourceFilter.value as any || undefined,
      keyword: searchKeyword.value || undefined
    })
    if (response.success && response.data) {
      // 处理不同的返回格式
      if (Array.isArray(response.data)) {
        modelList.value = response.data
        pagination.total = response.data.length
      } else if (response.data.items) {
        modelList.value = response.data.items
        pagination.total = response.data.total || 0
      } else {
        modelList.value = []
        pagination.total = 0
      }
    } else {
      MessagePlugin.error(response.message || t('admin.model.fetchError'))
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.model.fetchError'))
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  editingModel.value = null
  formDialogVisible.value = true
}

const handleView = (model: ModelInfo) => {
  router.push(`/admin/models/${model.id}`)
}

const handleEdit = (model: ModelInfo) => {
  editingModel.value = model
  formDialogVisible.value = true
}

const handleDelete = async (model: ModelInfo) => {
  const dialog = DialogPlugin.confirm({
    header: t('admin.model.deleteConfirm'),
    body: t('admin.model.deleteConfirmMessage', { name: model.name }),
    onConfirm: async () => {
      try {
        const response = await deleteModel(model.id!)
        if (response.success) {
          MessagePlugin.success(t('admin.model.deleteSuccess'))
          fetchList()
        } else {
          MessagePlugin.error(response.message || t('admin.model.deleteError'))
        }
      } catch (error: any) {
        MessagePlugin.error(error.message || t('admin.model.deleteError'))
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
  editingModel.value = null
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="less" scoped>
.model-list-container {
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

.text-muted {
  color: #9ca3af;
}
</style>

