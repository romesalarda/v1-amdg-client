<template>
  <div v-if="activeUsers.length > 0" class="flex items-center gap-2">
    <div class="flex -space-x-2">
      <UTooltip
        v-for="user in visibleUsers"
        :key="user.id"
        :text="user.name"
        :popper="{ placement: 'bottom' }"
      >
        <UAvatar
          :alt="user.name"
          size="sm"
          :ui="{ rounded: 'rounded-full ring-2 ring-white dark:ring-gray-900' }"
        >
          <template #default>
            {{ getUserInitials(user.name) }}
          </template>
        </UAvatar>
      </UTooltip>
      
      <UTooltip
        v-if="remainingCount > 0"
        :text="remainingUsersText"
        :popper="{ placement: 'bottom' }"
      >
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 ring-2 ring-white text-xs font-medium text-gray-700 dark:bg-gray-700 dark:ring-gray-900 dark:text-gray-200"
        >
          +{{ remainingCount }}
        </div>
      </UTooltip>
    </div>
    
    <div class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
      <div class="h-2 w-2 animate-pulse rounded-full bg-green-500" />
      <span>{{ activeUsersText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  email: string
  name: string
}

interface Props {
  activeUsers: User[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 3,
})

const visibleUsers = computed(() => {
  return props.activeUsers.slice(0, props.maxVisible)
})

const remainingCount = computed(() => {
  return Math.max(0, props.activeUsers.length - props.maxVisible)
})

const remainingUsersText = computed(() => {
  const remaining = props.activeUsers.slice(props.maxVisible)
  return remaining.map(u => u.name).join(', ')
})

const activeUsersText = computed(() => {
  const count = props.activeUsers.length
  return count === 1 ? '1 other user viewing' : `${count} other users viewing`
})

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
</script>
