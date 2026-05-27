<template>
  <div
    :class="[
      'px-6 py-4 flex items-start gap-4 transition-colors',
      !notification.is_read ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'bg-white hover:bg-gray-50/60',
    ]"
  >
    <!-- Priority indicator + icon -->
    <div class="flex flex-col items-center gap-1.5 flex-shrink-0 pt-0.5">
      <div
        :class="[
          'w-9 h-9 rounded-xl flex items-center justify-center',
          priorityBg,
        ]"
      >
        <UIcon :name="typeIcon" class="w-4 h-4" :class="priorityIconColor" />
      </div>
      <span
        v-if="!notification.is_read"
        class="w-2 h-2 rounded-full bg-blue-500"
        title="Unread"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-navy-900">{{ notification.notification_type_display }}</span>
          <span
            :class="['px-2 py-0.5 rounded-full text-xs font-semibold', priorityBadge]"
          >{{ notification.priority_display }}</span>
        </div>
        <span class="text-xs text-navy-400 flex-shrink-0">{{ formattedDate }}</span>
      </div>

      <p class="text-xs text-navy-600 mb-2 leading-relaxed">
        {{ notificationMessage }}
      </p>

      <div class="flex items-center gap-3 text-xs text-navy-400 flex-wrap">
        <span v-if="notification.event_title" class="flex items-center gap-1">
          <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
          {{ notification.event_title }}
        </span>
        <span v-if="notification.created_by_email" class="flex items-center gap-1">
          <UIcon name="i-heroicons-user" class="w-3 h-3" />
          {{ notification.created_by_email }}
        </span>
        <span v-if="notification.related_booking" class="flex items-center gap-1">
          <UIcon name="i-heroicons-ticket" class="w-3 h-3" />
          Booking #{{ notification.related_booking }}
        </span>
        <span v-if="notification.related_order" class="flex items-center gap-1">
          <UIcon name="i-heroicons-shopping-bag" class="w-3 h-3" />
          Order #{{ notification.related_order }}
        </span>
        <span v-if="notification.related_payment" class="flex items-center gap-1">
          <UIcon name="i-heroicons-credit-card" class="w-3 h-3" />
          Payment #{{ notification.related_payment }}
        </span>
        <span v-if="notification.read_at" class="flex items-center gap-1 text-green-600">
          <UIcon name="i-heroicons-check-circle" class="w-3 h-3" />
          Read {{ formattedReadAt }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <UButton
        v-if="!notification.is_read"
        size="xs"
        variant="ghost"
        color="primary"
        icon="i-heroicons-check"
        title="Mark as read"
        @click="$emit('mark-read')"
      />
      <UButton
        size="xs"
        variant="ghost"
        color="red"
        icon="i-heroicons-trash"
        title="Delete"
        @click="$emit('delete')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EventNotification } from '~/api/types.gen'

const props = defineProps<{ notification: EventNotification }>()
defineEmits<{ 'mark-read': []; 'delete': [] }>()

const typeIconMap: Record<string, string> = {
  ORDER_FULFILLMENT: 'i-heroicons-shopping-bag',
  BOOKING_CONFIRMATION: 'i-heroicons-ticket',
  REFUND_REQUEST: 'i-heroicons-arrow-uturn-left',
  PAYMENT_FAILED: 'i-heroicons-exclamation-circle',
  CAPACITY_WARNING: 'i-heroicons-chart-bar',
  AUTHORIZATION_REQUEST: 'i-heroicons-shield-check',
  GENERAL: 'i-heroicons-bell',
}

const typeIcon = computed(() => typeIconMap[props.notification.notification_type] ?? 'i-heroicons-bell')

const priorityConfig = computed(() => {
  switch (props.notification.priority) {
    case 'URGENT': return { bg: 'bg-red-100', iconColor: 'text-red-600', badge: 'bg-red-100 text-red-700' }
    case 'HIGH':   return { bg: 'bg-orange-100', iconColor: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' }
    case 'NORMAL': return { bg: 'bg-blue-100', iconColor: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' }
    case 'LOW':    return { bg: 'bg-gray-100', iconColor: 'text-gray-500', badge: 'bg-gray-100 text-gray-600' }
    default:       return { bg: 'bg-gray-100', iconColor: 'text-gray-500', badge: 'bg-gray-100 text-gray-600' }
  }
})

const priorityBg = computed(() => priorityConfig.value.bg)
const priorityIconColor = computed(() => priorityConfig.value.iconColor)
const priorityBadge = computed(() => priorityConfig.value.badge)

const notificationMessage = computed(() => {
  const meta = props.notification.metadata as Record<string, unknown> | null
  return (meta?.message as string) || (meta?.description as string) || `${props.notification.notification_type_display} notification`
})

const formattedDate = computed(() => {
  const d = new Date(props.notification.created_at)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
})

const formattedReadAt = computed(() => {
  if (!props.notification.read_at) return ''
  const d = new Date(props.notification.read_at)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
})
</script>
