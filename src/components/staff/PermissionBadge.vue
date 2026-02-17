<template>
  <span
    :title="tooltipText"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold cursor-help"
    :class="[
      badgeColor === 'red' ? (isCustom ? 'bg-white text-red-600 ring-1 ring-red-400' : 'bg-red-100 text-red-700') : '',
      badgeColor === 'yellow' ? (isCustom ? 'bg-white text-amber-600 ring-1 ring-amber-400' : 'bg-amber-100 text-amber-700') : '',
      badgeColor === 'green' ? (isCustom ? 'bg-white text-green-600 ring-1 ring-green-400' : 'bg-green-100 text-green-700') : '',
    ]"
  >
    <span class="material-symbols-outlined" style="font-size: 12px;">{{ iconName }}</span>
    <span>{{ displayText }}</span>
  </span>
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
    return 'verified_user'
  } else if (actionCount >= 2) {
    return 'edit_square'
  } else {
    return 'visibility'
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
