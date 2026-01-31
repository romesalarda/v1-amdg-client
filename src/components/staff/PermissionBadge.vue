<template>
  <UTooltip :text="tooltipText" :popper="{ placement: 'top' }">
    <UBadge
      :color="badgeColor"
      :variant="isCustom ? 'outline' : 'solid'"
      size="sm"
      class="cursor-help"
    >
      <div class="flex items-center gap-1">
        <UIcon :name="iconName" class="h-3 w-3" />
        <span>{{ displayText }}</span>
      </div>
    </UBadge>
  </UTooltip>
</template>

<script setup lang="ts">
import type { PermissionCategory, CRUDAction } from '~/types/permissions'

interface Props {
  category: PermissionCategory
  actions: CRUDAction[]
  isCustom?: boolean
  permissionName?: string
}

const props = withDefaults(defineProps<Props>(), {
  isCustom: false,
})

// Category display names
const categoryLabels: Record<PermissionCategory, string> = {
  GENERAL: 'General',
  REGISTRATION: 'Registration',
  PRODUCT_MANAGEMENT: 'Products',
  CONTENT_MANAGEMENT: 'Content',
  STAFF_MANAGEMENT: 'Staff',
  REPORTING: 'Reporting',
}

// Permission level colors based on access rights
const badgeColor = computed(() => {
  const actionCount = props.actions.length
  
  if (actionCount === 4) {
    return 'red' // Full CRUD - highest level
  } else if (actionCount >= 2) {
    return 'yellow' // Moderate access
  } else {
    return 'green' // Limited access (typically read-only)
  }
})

// Icons based on permission level
const iconName = computed(() => {
  const actionCount = props.actions.length
  
  if (actionCount === 4) {
    return 'i-heroicons-shield-check'
  } else if (actionCount >= 2) {
    return 'i-heroicons-pencil-square'
  } else {
    return 'i-heroicons-eye'
  }
})

// Display text
const displayText = computed(() => {
  return categoryLabels[props.category] || props.category
})

// Tooltip text with detailed permissions
const tooltipText = computed(() => {
  const label = props.permissionName || categoryLabels[props.category]
  const actionList = props.actions
    .map(a => a.charAt(0).toUpperCase() + a.slice(1))
    .join(', ')
  
  const source = props.isCustom ? '(Custom)' : '(Role-based)'
  
  return `${label}: ${actionList} ${source}`
})
</script>
