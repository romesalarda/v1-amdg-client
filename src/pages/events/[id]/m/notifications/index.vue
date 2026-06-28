<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">

      <!-- Header -->
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="px-6 py-5 border-b border-navy-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-bell" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 class="text-sm font-black text-primary uppercase tracking-widest">Notifications</h2>
              <p class="text-xs text-navy-400 mt-0.5">
                {{ unreadCount > 0 ? `${unreadCount} unread` : 'All caught up' }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <!-- Filter: read status -->
            <div class="flex bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
              <button
                v-for="opt in readFilterOptions"
                :key="opt.label?? 'all'"
                @click="readFilter = opt.value"
                :class="[
                  'px-3 py-1.5 rounded-md transition-colors',
                  readFilter === opt.value ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                ]"
              >{{ opt.label }}</button>
            </div>

            <!-- Mark all read -->
            <UButton
              v-if="unreadCount > 0"
              size="xs"
              variant="ghost"
              color="primary"
              icon="i-heroicons-check-circle"
              :loading="markingAllRead"
              @click="onMarkAllRead"
            >Mark all read</UButton>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="px-6 py-3 bg-gray-50/50 border-b border-navy-50 flex flex-wrap gap-3 items-center">
          <div class="flex items-center gap-2 flex-1 min-w-48">
            <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-navy-400 flex-shrink-0" />
            <select
              v-model="typeFilter"
              class="flex-1 text-xs bg-transparent border-none outline-none text-navy-700 cursor-pointer"
            >
              <option value="">All types</option>
              <option v-for="t in notificationTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-navy-400">Priority:</span>
            <div class="flex gap-1">
              <button
                v-for="p in priorityOptions"
                :key="p.value ?? 'all'"
                @click="priorityFilter = p.value"
                :class="[
                  'px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors',
                  priorityFilter === p.value
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-navy-600 hover:border-primary/50',
                ]"
              >{{ p.label }}</button>
            </div>
          </div>
        </div>

        <!-- List -->
        <div class="divide-y divide-navy-50">
          <!-- Loading -->
          <div v-if="isPending" class="p-6 space-y-3">
            <div v-for="i in 5" :key="i" class="h-20 bg-mist-blue/60 rounded-xl animate-pulse" />
          </div>

          <!-- Empty -->
          <div v-else-if="!notifications.length" class="py-16 flex flex-col items-center gap-3 text-center">
            <div class="w-16 h-16 bg-mist-blue rounded-2xl flex items-center justify-center">
              <UIcon name="i-heroicons-bell-slash" class="w-8 h-8 text-navy-300" />
            </div>
            <p class="text-sm font-semibold text-navy-500">No notifications</p>
            <p class="text-xs text-navy-400">Nothing to show for the current filters.</p>
          </div>

          <!-- Notification rows -->
          <NotificationRow
            v-else
            v-for="n in notifications"
            :key="n.id"
            :notification="n"
            @mark-read="onMarkRead(n.id)"
            @delete="onDelete(n.id)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-navy-50 flex items-center justify-between">
          <span class="text-xs text-navy-400">
            Page {{ currentPage }} of {{ totalPages }} &mdash; {{ totalCount }} total
          </span>
          <div class="flex items-center gap-1">
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-chevron-left"
              :disabled="currentPage === 1"
              @click="currentPage--"
            />
            <template v-for="p in visiblePages" :key="p">
              <span v-if="p === '...'" class="px-2 text-xs text-navy-400">…</span>
              <UButton
                v-else
                size="xs"
                :variant="currentPage === p ? 'solid' : 'ghost'"
                :color="currentPage === p ? 'primary' : 'gray'"
                @click="currentPage = p as number"
              >{{ p }}</UButton>
            </template>
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              icon="i-heroicons-chevron-right"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            />
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import NotificationRow from '~/components/events/notifications/NotificationRow.vue'
import { useEvent } from '~/composables/resources/events/events'
import {
  useEventNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteEventNotification,
} from '~/composables/resources/events/eventNotifications'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'GENERAL',
    action: 'read',
    deniedRedirect: '/403',
  }
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const { data: event } = useEvent(id)

// Filters
const currentPage = ref(1)
const readFilter = ref<boolean | undefined>(undefined)
const typeFilter = ref('')
const priorityFilter = ref<string | undefined>(undefined)

// Reset page when filters change
watch([readFilter, typeFilter, priorityFilter], () => { currentPage.value = 1 })

const queryParams = computed(() => ({
  event: id.value,
  page: currentPage.value,
  page_size: 20,
  ...(readFilter.value !== undefined && { is_read: readFilter.value }),
  ...(typeFilter.value && { notification_type: typeFilter.value }),
  ...(priorityFilter.value && { priority: priorityFilter.value }),
}))

const { data: notificationsData, isPending } = useEventNotifications(queryParams)

const notifications = computed(() => notificationsData.value?.data?.results ?? [])
const totalCount = computed(() => notificationsData.value?.data?.count ?? 0)
const totalPages = computed(() => Math.ceil(totalCount.value / 20))
const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

// Pagination helper: show max 7 page buttons with ellipsis
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

// Filter options
const readFilterOptions = [
  { label: 'All', value: undefined },
  { label: 'Unread', value: false },
  { label: 'Read', value: true },
]

const notificationTypes = [
  { value: 'ORDER_FULFILLMENT', label: 'Order Fulfillment' },
  { value: 'BOOKING_CONFIRMATION', label: 'Booking Confirmed' },
  { value: 'REFUND_REQUEST', label: 'Refund Requested' },
  { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
  { value: 'CAPACITY_WARNING', label: 'Capacity Warning' },
  { value: 'AUTHORIZATION_REQUEST', label: 'Authorization Request' },
  { value: 'GENERAL', label: 'General' },
]

const priorityOptions = [
  { label: 'All', value: undefined },
  { label: 'Urgent', value: 'URGENT' },
  { label: 'High', value: 'HIGH' },
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Low', value: 'LOW' },
]

// Actions
const { mutate: markRead } = useMarkNotificationRead()
const { mutate: deleteNotification } = useDeleteEventNotification()
const { mutate: markAllRead, isPending: markingAllRead } = useMarkAllNotificationsRead()

const onMarkRead = (notifId: number) => markRead(notifId)
const onDelete = (notifId: number) => deleteNotification(notifId)
const onMarkAllRead = () => markAllRead()
</script>
