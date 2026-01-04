<template>
  <t-dialog
    :visible="visible"
    :header="isEdit ? $t('admin.plugin.editTitle') : $t('admin.plugin.createTitle')"
    width="700px"
    @update:visible="handleVisibleChange"
    @confirm="handleSubmit"
  >
    <t-form
      ref="formRef"
      :data="formData"
      :rules="formRules"
      layout="vertical"
    >
      <t-form-item :label="$t('admin.plugin.internalName')" name="name">
        <t-input
          v-model="formData.name"
          :placeholder="$t('admin.plugin.internalNamePlaceholder')"
          :disabled="isEdit"
        />
        <div class="form-tip">{{ $t('admin.plugin.internalNameTip') }}</div>
      </t-form-item>

      <t-form-item :label="$t('admin.plugin.name')" name="display_name">
        <t-input
          v-model="formData.display_name"
          :placeholder="$t('admin.plugin.namePlaceholder')"
        />
      </t-form-item>

      <t-form-item :label="$t('admin.plugin.description')" name="description">
        <t-textarea
          v-model="formData.description"
          :placeholder="$t('admin.plugin.descriptionPlaceholder')"
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
      </t-form-item>

      <t-row :gutter="16">
        <t-col :span="6">
          <t-form-item :label="$t('admin.plugin.version')" name="version">
            <t-input
              v-model="formData.version"
              :placeholder="$t('admin.plugin.versionPlaceholder')"
              :disabled="isEdit && plugin?.plugin_type === 'system'"
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="$t('admin.plugin.author')" name="author">
            <t-input
              v-model="formData.author"
              :placeholder="$t('admin.plugin.authorPlaceholder')"
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="$t('admin.plugin.category')" name="category">
            <t-select
              v-model="formData.category"
              :placeholder="$t('admin.plugin.categoryPlaceholder')"
              :options="categoryOptions"
            />
          </t-form-item>
        </t-col>
        <t-col :span="6">
          <t-form-item :label="$t('admin.plugin.icon')" name="icon">
            <t-input
              v-model="formData.icon"
              :placeholder="$t('admin.plugin.iconPlaceholder')"
            />
          </t-form-item>
        </t-col>
      </t-row>

      <t-form-item v-if="isEdit" :label="$t('admin.plugin.status')" name="enabled">
        <t-switch
          v-model="formData.enabled"
          :label="formData.enabled ? $t('admin.plugin.enabled') : $t('admin.plugin.disabled')"
        />
      </t-form-item>

      <t-form-item :label="$t('admin.plugin.config')" name="config">
        <t-textarea
          v-model="configJson"
          :placeholder="$t('admin.plugin.configPlaceholder')"
          :autosize="{ minRows: 5, maxRows: 10 }"
          @blur="handleConfigChange"
        />
        <div class="form-tip">{{ $t('admin.plugin.configTip') }}</div>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { createPlugin, updatePlugin, getPluginCategories, type PluginInfo } from '@/api/admin/plugin'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
  plugin?: PluginInfo | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const formRef = ref()
const configJson = ref('')
const categories = ref<string[]>([])

const isEdit = computed(() => !!props.plugin)

const formData = reactive({
  name: '',
  display_name: '',
  description: '',
  version: '1.0.0',
  author: '',
  category: '',
  icon: '🔌',
  enabled: false,
  config: {} as Record<string, any>
})

const formRules = computed(() => ({
  name: [
    { required: true, message: t('admin.plugin.internalNameRequired'), type: 'error' },
    { pattern: /^[a-z0-9-]+$/, message: t('admin.plugin.internalNamePattern'), type: 'error' }
  ],
  display_name: [
    { required: true, message: t('admin.plugin.nameRequired'), type: 'error' }
  ],
  version: [
    { required: true, message: t('admin.plugin.versionRequired'), type: 'error' }
  ]
}))

const categoryOptions = computed(() => {
  return categories.value.map(cat => ({
    label: t(`admin.plugin.categories.${cat}`) || cat,
    value: cat
  }))
})

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

watch(() => props.visible, (visible) => {
  if (visible) {
    fetchCategories()
    if (props.plugin) {
      // 编辑模式，填充数据
      formData.name = props.plugin.name
      formData.display_name = props.plugin.display_name
      formData.description = props.plugin.description || ''
      formData.version = props.plugin.version
      formData.author = props.plugin.author || ''
      formData.category = props.plugin.category || ''
      formData.icon = props.plugin.icon || '🔌'
      formData.enabled = props.plugin.enabled
      formData.config = props.plugin.config || {}
      configJson.value = JSON.stringify(formData.config, null, 2)
    } else {
      // 创建模式，重置数据
      formData.name = ''
      formData.display_name = ''
      formData.description = ''
      formData.version = '1.0.0'
      formData.author = ''
      formData.category = ''
      formData.icon = '🔌'
      formData.enabled = false
      formData.config = {}
      configJson.value = ''
    }
  }
})

const handleConfigChange = () => {
  try {
    if (configJson.value.trim()) {
      formData.config = JSON.parse(configJson.value)
    } else {
      formData.config = {}
    }
  } catch (error) {
    MessagePlugin.warning(t('admin.plugin.configInvalid'))
  }
}

const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible)
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  // 验证配置JSON
  try {
    if (configJson.value.trim()) {
      formData.config = JSON.parse(configJson.value)
    }
  } catch (error) {
    MessagePlugin.error(t('admin.plugin.configInvalid'))
    return
  }

  try {
    if (isEdit.value && props.plugin) {
      const response = await updatePlugin(props.plugin.id, formData)
      if (response.success) {
        MessagePlugin.success(t('admin.plugin.updateSuccess'))
        emit('success')
      } else {
        MessagePlugin.error(response.message || t('admin.plugin.updateError'))
      }
    } else {
      const response = await createPlugin(formData)
      if (response.success) {
        MessagePlugin.success(t('admin.plugin.createSuccess'))
        emit('success')
      } else {
        MessagePlugin.error(response.message || t('admin.plugin.createError'))
      }
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.plugin.submitError'))
  }
}
</script>

<style lang="less" scoped>
.form-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  font-family: "PingFang SC", sans-serif;
}
</style>

