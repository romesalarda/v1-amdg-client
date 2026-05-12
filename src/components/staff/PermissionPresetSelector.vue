<template>
  <div class="space-y-3">
    <div class="space-y-1.5">
      <label class="block text-xs font-black text-primary uppercase tracking-wider">Permission Template</label>
      <select
        :value="selectedTemplate ?? ''"
        @change="handleTemplateChange(($event.target as HTMLSelectElement).value || null)"
        class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all appearance-none"
      >
        <option value="">Select a permission template...</option>
        <option v-for="opt in templateOptions" :key="opt.key" :value="opt.key">
          {{ opt.label }} — {{ opt.description }}
        </option>
      </select>
    </div>

    <div v-if="selectedTemplate" class="p-3 bg-mist-blue/60 rounded-xl border border-deep-navy/10">
      <div class="text-xs font-black text-primary uppercase tracking-wider mb-2">
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
    description: 'Full control over attendee registrations, check-ins, and booking management',
    permissions: {
      REGISTRATION: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    key: 'CONTENT_MANAGER',
    label: 'Content Manager',
    description: 'Create, edit, and publish event pages, schedules, and announcements',
    permissions: {
      CONTENT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    key: 'PRODUCT_MANAGER',
    label: 'Product Manager',
    description: 'Manage products, pricing tiers, inventory levels, and purchase configurations',
    permissions: {
      PRODUCT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    key: 'STAFF_COORDINATOR',
    label: 'Staff Coordinator',
    description: 'Invite staff, assign roles, manage availability, and coordinate the event team',
    permissions: {
      STAFF_MANAGEMENT: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    key: 'REPORTING_ANALYST',
    label: 'Reporting Analyst',
    description: 'View dashboards, attendance stats, financial summaries, and event analytics',
    permissions: {
      REPORTING: ['read'],
    },
  },
  {
    key: 'EVENT_VIEWER',
    label: 'Event Viewer',
    description: 'Read-only access across all event sections — no creation or editing capabilities',
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
    description: 'Unrestricted access to every feature — equivalent to event administrator',
    permissions: {
      GENERAL: ['create', 'read', 'update', 'delete'],
      REGISTRATION: ['create', 'read', 'update', 'delete'],
      PRODUCT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
      CONTENT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
      STAFF_MANAGEMENT: ['create', 'read', 'update', 'delete'],
      REPORTING: ['create', 'read', 'update', 'delete'],
      RESOURCE_MANAGEMENT: ['create', 'read', 'update', 'delete'],
      BOOKING_MANAGEMENT: ['create', 'read', 'update', 'delete'],
      PAYMENT_MANAGEMENT: ['create', 'read', 'update', 'delete'],
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
