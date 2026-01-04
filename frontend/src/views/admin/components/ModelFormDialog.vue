<template>
  <t-dialog
    :visible="visible"
    :header="isEdit ? $t('admin.model.editTitle') : $t('admin.model.createTitle')"
    width="800px"
    @update:visible="handleVisibleChange"
    @confirm="handleSubmit"
  >
    <t-form
      ref="formRef"
      :data="formData"
      :rules="formRules"
      layout="vertical"
    >
      <t-row :gutter="16">
        <t-col :span="12">
          <t-form-item :label="$t('admin.model.name')" name="name">
            <t-input
              v-model="formData.name"
              :placeholder="$t('admin.model.namePlaceholder')"
            />
          </t-form-item>
        </t-col>
        <t-col :span="12">
          <t-form-item :label="$t('admin.model.type')" name="type">
            <t-select
              v-model="formData.type"
              :placeholder="$t('admin.model.typePlaceholder')"
              :options="typeOptions"
              :disabled="isEdit"
              @change="handleTypeChange"
            />
          </t-form-item>
        </t-col>
      </t-row>

      <t-row :gutter="16">
        <t-col :span="12">
          <t-form-item :label="$t('admin.model.source')" name="source">
            <t-select
              v-model="formData.source"
              :placeholder="$t('admin.model.sourcePlaceholder')"
              :options="sourceOptions"
              @change="handleSourceChange"
            />
          </t-form-item>
        </t-col>
        <t-col :span="12" v-if="formData.source === 'remote'">
          <t-form-item :label="$t('admin.model.provider')" name="provider">
            <t-select
              v-model="formData.parameters.provider"
              :placeholder="$t('admin.model.providerPlaceholder')"
              :options="providerOptions"
              :loading="loadingProviders"
              @change="handleProviderChange"
            />
          </t-form-item>
        </t-col>
      </t-row>

      <t-form-item :label="$t('admin.model.description')" name="description">
        <t-textarea
          v-model="formData.description"
          :placeholder="$t('admin.model.descriptionPlaceholder')"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </t-form-item>

      <t-row :gutter="16" v-if="formData.source === 'remote'">
        <t-col :span="12">
          <t-form-item :label="$t('admin.model.baseUrl')" name="base_url">
            <t-input
              v-model="formData.parameters.base_url"
              :placeholder="$t('admin.model.baseUrlPlaceholder')"
            />
          </t-form-item>
        </t-col>
        <t-col :span="12">
          <t-form-item :label="$t('admin.model.apiKey')" name="api_key">
            <t-input
              v-model="formData.parameters.api_key"
              :placeholder="$t('admin.model.apiKeyPlaceholder')"
              type="password"
            />
          </t-form-item>
        </t-col>
      </t-row>

      <t-row :gutter="16" v-if="formData.source === 'local'">
        <t-col :span="12">
          <t-form-item :label="$t('admin.model.parameterSize')" name="parameter_size">
            <t-input
              v-model="formData.parameters.parameter_size"
              :placeholder="$t('admin.model.parameterSizePlaceholder')"
            />
          </t-form-item>
        </t-col>
      </t-row>

      <t-form-item
        v-if="formData.type === 'Embedding'"
        :label="$t('admin.model.embeddingParameters')"
      >
        <t-row :gutter="16">
          <t-col :span="12">
            <t-form-item :label="$t('admin.model.dimension')" name="dimension">
              <t-input-number
                v-model="formData.parameters.embedding_parameters.dimension"
                :placeholder="$t('admin.model.dimensionPlaceholder')"
                :min="1"
                style="width: 100%;"
              />
            </t-form-item>
          </t-col>
          <t-col :span="12">
            <t-form-item :label="$t('admin.model.truncatePromptTokens')" name="truncate_prompt_tokens">
              <t-input-number
                v-model="formData.parameters.embedding_parameters.truncate_prompt_tokens"
                :placeholder="$t('admin.model.truncatePromptTokensPlaceholder')"
                :min="0"
                style="width: 100%;"
              />
            </t-form-item>
          </t-col>
        </t-row>
      </t-form-item>

      <t-form-item v-if="formData.type === 'VLLM' && formData.source === 'remote'" :label="$t('admin.model.interfaceType')">
        <t-select
          v-model="formData.parameters.interface_type"
          :options="interfaceTypeOptions"
          :placeholder="$t('admin.model.interfaceTypePlaceholder')"
        />
      </t-form-item>

      <t-form-item v-if="isEdit" :label="$t('admin.model.isDefault')">
        <t-switch
          v-model="formData.is_default"
          :label="formData.is_default ? $t('admin.model.default') : ''"
        />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { createModel, updateModel, getProviders, type ModelInfo, type CreateModelRequest, type UpdateModelRequest } from '@/api/admin/model'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
  model?: ModelInfo | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const formRef = ref()
const loadingProviders = ref(false)
const providers = ref<any[]>([])

const isEdit = computed(() => !!props.model)

const typeOptions = computed(() => [
  { label: t('admin.model.typeKnowledgeQA'), value: 'KnowledgeQA' },
  { label: t('admin.model.typeEmbedding'), value: 'Embedding' },
  { label: t('admin.model.typeRerank'), value: 'Rerank' },
  { label: t('admin.model.typeVLLM'), value: 'VLLM' }
])

const sourceOptions = computed(() => [
  { label: t('admin.model.sourceLocal'), value: 'local' },
  { label: t('admin.model.sourceRemote'), value: 'remote' }
])

const interfaceTypeOptions = computed(() => [
  { label: 'Ollama', value: 'ollama' },
  { label: 'OpenAI', value: 'openai' }
])

const providerOptions = computed(() => {
  return providers.value.map(p => ({
    label: p.label,
    value: p.value
  }))
})

const formData = reactive<CreateModelRequest & UpdateModelRequest & { is_default?: boolean; parameters: any }>({
  name: '',
  type: 'KnowledgeQA',
  source: 'remote',
  description: '',
  is_default: false,
  parameters: {
    base_url: '',
    api_key: '',
    provider: '',
    embedding_parameters: {
      dimension: 1024,
      truncate_prompt_tokens: 0
    }
  }
})

const formRules = computed(() => ({
  name: [
    { required: true, message: t('admin.model.nameRequired'), type: 'error' }
  ],
  type: [
    { required: true, message: t('admin.model.typeRequired'), type: 'error' }
  ],
  source: [
    { required: true, message: t('admin.model.sourceRequired'), type: 'error' }
  ],
  base_url: [
    {
      required: formData.source === 'remote',
      message: t('admin.model.baseUrlRequired'),
      type: 'error'
    }
  ],
  api_key: [
    {
      required: formData.source === 'remote',
      message: t('admin.model.apiKeyRequired'),
      type: 'error'
    }
  ],
  provider: [
    {
      required: formData.source === 'remote',
      message: t('admin.model.providerRequired'),
      type: 'error'
    }
  ]
}))

const fetchProviders = async (modelType?: string) => {
  if (formData.source !== 'remote') return
  
  loadingProviders.value = true
  try {
    const response = await getProviders(modelType || formData.type)
    if (response.success && response.data) {
      providers.value = response.data
    }
  } catch (error) {
    console.error('获取服务商列表失败:', error)
  } finally {
    loadingProviders.value = false
  }
}

const handleTypeChange = () => {
  // 切换类型时重新获取服务商列表
  if (formData.source === 'remote') {
    fetchProviders(formData.type)
  }
  // 重置embedding参数
  if (formData.type !== 'Embedding') {
    formData.parameters.embedding_parameters = {
      dimension: 1024,
      truncate_prompt_tokens: 0
    }
  }
}

const handleSourceChange = () => {
  if (formData.source === 'remote') {
    fetchProviders(formData.type)
  } else {
    formData.parameters.base_url = ''
    formData.parameters.api_key = ''
    formData.parameters.provider = ''
  }
}

const handleProviderChange = () => {
  // 选择服务商时，自动填充默认URL
  const provider = providers.value.find(p => p.value === formData.parameters.provider)
  if (provider && provider.defaultUrls) {
    const urlKey = formData.type === 'KnowledgeQA' ? 'chat' : 
                   formData.type === 'Embedding' ? 'embedding' :
                   formData.type === 'Rerank' ? 'rerank' : 'chat'
    if (provider.defaultUrls[urlKey]) {
      formData.parameters.base_url = provider.defaultUrls[urlKey]
    }
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.model) {
      // 编辑模式，填充数据
      formData.name = props.model.name
      formData.type = props.model.type
      formData.source = props.model.source
      formData.description = props.model.description || ''
      formData.is_default = props.model.is_default || false
      formData.parameters = {
        base_url: props.model.parameters.base_url || '',
        api_key: props.model.parameters.api_key || '',
        provider: props.model.parameters.provider || '',
        embedding_parameters: props.model.parameters.embedding_parameters || {
          dimension: 1024,
          truncate_prompt_tokens: 0
        },
        interface_type: props.model.parameters.interface_type,
        parameter_size: props.model.parameters.parameter_size,
        extra_config: props.model.parameters.extra_config
      }
      
      if (formData.source === 'remote') {
        fetchProviders(formData.type)
      }
    } else {
      // 创建模式，重置数据
      formData.name = ''
      formData.type = 'KnowledgeQA'
      formData.source = 'remote'
      formData.description = ''
      formData.is_default = false
      formData.parameters = {
        base_url: '',
        api_key: '',
        provider: '',
        embedding_parameters: {
          dimension: 1024,
          truncate_prompt_tokens: 0
        }
      }
      
      fetchProviders(formData.type)
    }
  }
}, { immediate: true })

const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible)
}

const handleSubmit = async () => {
  const result = await formRef.value?.validate()
  if (result === true) {
    try {
      // 构建提交数据
      const submitData: any = {
        name: formData.name,
        type: formData.type,
        source: formData.source,
        description: formData.description || undefined,
        parameters: { ...formData.parameters }
      }
      
      // 清理空字段
      if (!submitData.parameters.base_url) delete submitData.parameters.base_url
      if (!submitData.parameters.api_key) delete submitData.parameters.api_key
      if (!submitData.parameters.provider) delete submitData.parameters.provider
      if (!submitData.parameters.parameter_size) delete submitData.parameters.parameter_size
      if (!submitData.parameters.interface_type) delete submitData.parameters.interface_type
      if (formData.type !== 'Embedding') {
        delete submitData.parameters.embedding_parameters
      }
      
      if (isEdit.value && props.model) {
        const updateData: UpdateModelRequest = {
          name: submitData.name,
          description: submitData.description,
          parameters: submitData.parameters,
          is_default: formData.is_default
        }
        const response = await updateModel(props.model.id!, updateData)
        if (response.success) {
          MessagePlugin.success(t('admin.model.updateSuccess'))
          emit('success')
          handleVisibleChange(false)
        } else {
          MessagePlugin.error(response.message || t('admin.model.updateError'))
        }
      } else {
        const response = await createModel(submitData)
        if (response.success) {
          MessagePlugin.success(t('admin.model.createSuccess'))
          emit('success')
          handleVisibleChange(false)
        } else {
          MessagePlugin.error(response.message || t('admin.model.createError'))
        }
      }
    } catch (error: any) {
      MessagePlugin.error(error.message || t('admin.model.submitError'))
    }
  }
}
</script>

<style lang="less" scoped>
:deep(.t-form-item) {
  margin-bottom: 16px;
}
</style>

