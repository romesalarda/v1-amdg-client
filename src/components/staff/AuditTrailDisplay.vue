<template>
  <div class="text-xs text-navy-400 space-y-0.5">
    <div v-if="assignedBy" class="flex items-center gap-1">
      <span class="material-symbols-outlined" style="font-size: 12px;">person</span>
      <span>
        Assigned by: <span class="font-semibold text-navy-600">{{ assignedBy }}</span>
      </span>
    </div>
    <div v-if="assignedAt" class="flex items-center gap-1">
      <span class="material-symbols-outlined" style="font-size: 12px;">schedule</span>
      <span>{{ formattedDate }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  assignedBy?: string | null
  assignedAt?: string | null
}

const props = defineProps<Props>()

const formattedDate = computed(() => {
  if (!props.assignedAt) return ''
  
  const date = new Date(props.assignedAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  // Relative time for recent dates
  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }
  
  // Absolute date for older dates
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})
</script>
