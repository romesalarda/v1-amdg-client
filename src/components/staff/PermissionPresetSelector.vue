<template>
  <div class="space-y-3">
    <UFormGroup label="Permission Template" name="template">
      <USelectMenu
        :model-value="selectedTemplate ?? undefined"
        @update:model-value="handleTemplateChange"
        :options="templateOptions"
        placeholder="Select a permission template..."
        value-attribute="key"
        option-attribute="label"
        nullable
      >
        <template #option="{ option }">
          <div class="flex flex-col">
            <span class="font-medium">{{ option.label }}</span>
            <span class="text-sm text-gray-500">{{ option.description }}</span>
          </div>
        </template>
      </USelectMenu>
    </UFormGroup>

    <div v-if="selectedTemplate" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div class="text-sm font-medium text-gray-700 mb-2">
        Template includes:
      </div>
      <div class="flex flex-wrap gap-2">
        <PermissionBadge
          v-for="(actions, category) in currentTemplate?.permissions"
          :key="category"
          :category="category as PermissionCategory"
          :actions="actions"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PermissionCategory, CRUDAction } from '~/types/permissions'
import PermissionBadge from './PermissionBadge.vue'

interface PermissionTemplate {
  key: string
  label: string
  description: string
  permissions: Record<string, CRUDAction[]>
}

interface Props {
  modelValue?: string | null
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
  (e: 'template-selected', permissions: Record<string, CRUDAction[]>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Permission templates (matching backend)
const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    key: 'REGISTRATION_MANAGER',
    label: 'Registration Manager',
    description: 'Full control over event registrations and attendees',
    permissions: {
      REGISTRATION: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    key: 'CONTENT_MANAGER',
    label: 'Content Manager',
    description: 'Manage event content, schedules, and resources',
    permissions: {
      CONTENT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    key: 'PRODUCT_MANAGER',
    label: 'Product Manager',
    description: 'Manage products, pricing, and inventory',
    permissions: {
      PRODUCT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    key: 'STAFF_COORDINATOR',
    label: 'Staff Coordinator',
    description: 'Manage staff assignments and schedules',
    permissions: {
      STAFF_MANAGEMENT: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    key: 'REPORTER',
    label: 'Reporter',
    description: 'View reports and analytics',
    permissions: {
      REPORTING: ['read'],
    },
  },
  {
    key: 'EVENT_VIEWER',
    label: 'Event Viewer',
    description: 'Read-only access to all event information',
    permissions: {
      GENERAL: ['read'],
      REGISTRATION: ['read'],
      CONTENT_MANAGEMENT: ['read'],
      PRODUCT_MANAGEMENT: ['read'],
      REPORTING: ['read'],
    },
  },
  {
    key: 'FULL_ACCESS',
    label: 'Full Access',
    description: 'Complete control over all event features',
    permissions: {
      GENERAL: ['create', 'read', 'update', 'delete'],
      REGISTRATION: ['create', 'read', 'update', 'delete'],
      PRODUCT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
      CONTENT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
      STAFF_MANAGEMENT: ['create', 'read', 'update', 'delete'],
      REPORTING: ['create', 'read', 'update', 'delete'],
    },
  },
]

const selectedTemplate = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value ?? null),
})

const templateOptions = computed(() => PERMISSION_TEMPLATES)

const currentTemplate = computed(() => {
  if (!selectedTemplate.value) return null
  return PERMISSION_TEMPLATES.find(t => t.key === selectedTemplate.value)
})

const handleTemplateChange = (value: any) => {
  const stringValue = value as string | null
  selectedTemplate.value = stringValue
  handleTemplateSelect(stringValue)
}

const handleTemplateSelect = (value: string | null) => {
  if (!value) {
    emit('template-selected', {})
    return
  }
  
  const template = PERMISSION_TEMPLATES.find(t => t.key === value)
  if (template) {
    emit('template-selected', template.permissions)
  }
}
</script>
