<template>
  <t-dialog
    :visible="visible"
    :header="isEdit ? $t('admin.tenant.editTitle') : $t('admin.tenant.createTitle')"
    width="600px"
    @update:visible="handleVisibleChange"
    @confirm="handleSubmit"
  >
    <t-form
      ref="formRef"
      :data="formData"
      :rules="formRules"
      layout="vertical"
    >
      <t-form-item :label="$t('admin.tenant.name')" name="name">
        <t-input
          v-model="formData.name"
          :placeholder="$t('admin.tenant.namePlaceholder')"
        />
      </t-form-item>

      <t-form-item :label="$t('admin.tenant.description')" name="description">
        <t-textarea
          v-model="formData.description"
          :placeholder="$t('admin.tenant.descriptionPlaceholder')"
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
      </t-form-item>

      <t-form-item :label="$t('admin.tenant.business')" name="business">
        <t-input
          v-model="formData.business"
          :placeholder="$t('admin.tenant.businessPlaceholder')"
        />
      </t-form-item>

      <t-form-item :label="$t('admin.tenant.retrieverEngines')" name="retriever_engines">
        <div class="engines-config">
          <div
            v-for="(engine, index) in formData.retriever_engines.engines"
            :key="index"
            class="engine-item"
          >
            <t-select
              v-model="engine.retriever_type"
              :options="retrieverTypeOptions"
              style="width: 150px; margin-right: 12px;"
            />
            <t-select
              v-model="engine.retriever_engine_type"
              :options="engineTypeOptions"
              style="width: 150px; margin-right: 12px;"
            />
            <t-button
              theme="danger"
              variant="text"
              size="small"
              @click="removeEngine(index)"
              :disabled="formData.retriever_engines.engines.length <= 1"
            >
              <t-icon name="close" />
            </t-button>
          </div>
          <t-button
            theme="default"
            variant="outline"
            size="small"
            @click="addEngine"
          >
            <t-icon name="add" />
            {{ $t('admin.tenant.addEngine') }}
          </t-button>
        </div>
      </t-form-item>

      <t-form-item :label="$t('admin.tenant.storageQuota')" name="storage_quota">
        <t-input-number
          v-model="formData.storage_quota"
          :placeholder="$t('admin.tenant.storageQuotaPlaceholder')"
          :min="0"
          style="width: 100%;"
        />
        <div class="form-tip">{{ $t('admin.tenant.storageQuotaTip') }}</div>
      </t-form-item>

      <t-form-item v-if="isEdit" :label="$t('admin.tenant.status')" name="status">
        <t-radio-group v-model="formData.status">
          <t-radio value="active">{{ $t('admin.tenant.statusActive') }}</t-radio>
          <t-radio value="inactive">{{ $t('admin.tenant.statusInactive') }}</t-radio>
        </t-radio-group>
      </t-form-item>

      <t-alert
        v-if="isEdit"
        theme="warning"
        :message="$t('admin.tenant.updateWarning')"
        style="margin-top: 16px;"
      />
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { createTenant, updateTenant, type TenantInfo } from '@/api/admin/tenant'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
  tenant?: TenantInfo | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const { t } = useI18n()
const formRef = ref()

const isEdit = computed(() => !!props.tenant)

const formData = reactive({
  name: '',
  description: '',
  business: '',
  retriever_engines: {
    engines: [
      {
        retriever_type: 'keywords' as 'keywords' | 'vector',
        retriever_engine_type: 'postgres'
      }
    ]
  },
  storage_quota: 10737418240, // 10GB
  status: 'active' as 'active' | 'inactive'
})

const formRules = computed(() => ({
  name: [
    { required: true, message: t('admin.tenant.nameRequired'), type: 'error' }
  ],
  business: [
    { required: true, message: t('admin.tenant.businessRequired'), type: 'error' }
  ],
  retriever_engines: [
    {
      validator: (val: any) => val.engines && val.engines.length > 0,
      message: t('admin.tenant.enginesRequired'),
      type: 'error'
    }
  ]
}))

const retrieverTypeOptions = [
  { label: t('admin.tenant.retrieverTypeKeywords'), value: 'keywords' },
  { label: t('admin.tenant.retrieverTypeVector'), value: 'vector' }
]

const engineTypeOptions = [
  { label: 'PostgreSQL', value: 'postgres' }
]

watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.tenant) {
      // 编辑模式，填充数据
      formData.name = props.tenant.name
      formData.description = props.tenant.description || ''
      formData.business = props.tenant.business || ''
      formData.storage_quota = props.tenant.storage_quota || 10737418240
      formData.status = props.tenant.status
      formData.retriever_engines = props.tenant.retriever_engines || {
        engines: [{ retriever_type: 'keywords', retriever_engine_type: 'postgres' }]
      }
    } else {
      // 创建模式，重置数据
      formData.name = ''
      formData.description = ''
      formData.business = ''
      formData.storage_quota = 10737418240
      formData.status = 'active'
      formData.retriever_engines = {
        engines: [{ retriever_type: 'keywords', retriever_engine_type: 'postgres' }]
      }
    }
  }
})

const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible)
}

const addEngine = () => {
  formData.retriever_engines.engines.push({
    retriever_type: 'keywords',
    retriever_engine_type: 'postgres'
  })
}

const removeEngine = (index: number) => {
  if (formData.retriever_engines.engines.length > 1) {
    formData.retriever_engines.engines.splice(index, 1)
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    if (isEdit.value && props.tenant) {
      const response = await updateTenant(props.tenant.id, formData)
      if (response.success) {
        MessagePlugin.success(t('admin.tenant.updateSuccess'))
        emit('success')
      } else {
        MessagePlugin.error(response.message || t('admin.tenant.updateError'))
      }
    } else {
      const response = await createTenant(formData)
      if (response.success) {
        MessagePlugin.success(t('admin.tenant.createSuccess'))
        emit('success')
      } else {
        MessagePlugin.error(response.message || t('admin.tenant.createError'))
      }
    }
  } catch (error: any) {
    MessagePlugin.error(error.message || t('admin.tenant.submitError'))
  }
}
</script>

<style lang="less" scoped>
.engines-config {
  .engine-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
}

.form-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  font-family: "PingFang SC", sans-serif;
}
</style>

