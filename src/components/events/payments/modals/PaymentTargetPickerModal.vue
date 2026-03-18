<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-3xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span class="material-symbols-outlined text-primary">travel_explore</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Select {{ targetLabel }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">Search and choose a {{ targetLabel.toLowerCase() }} to link this payment</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="`Search ${targetLabel.toLowerCase()}...`"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <select
              v-model="pageSize"
              class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option :value="10">10 / page</option>
              <option :value="20">20 / page</option>
              <option :value="50">50 / page</option>
            </select>
          </div>

          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div v-if="isLoading" class="p-4 space-y-2">
              <div v-for="i in 6" :key="i" class="h-12 bg-gray-100 rounded animate-pulse" />
            </div>

            <div v-else-if="items.length === 0" class="p-10 text-center">
              <span class="material-symbols-outlined text-4xl text-gray-300">search_off</span>
              <p class="text-sm text-gray-600 mt-2">No {{ targetLabel.toLowerCase() }} results found.</p>
            </div>

            <div v-else class="max-h-[26rem] overflow-y-auto">
              <button
                v-for="item in items"
                :key="item.id"
                type="button"
                @click="selectItem(item)"
                class="w-full px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-left"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-gray-900 truncate">{{ item.primary }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ item.secondary }}</div>
                  </div>
                  <span class="material-symbols-outlined text-primary">chevron_right</span>
                </div>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">
              Showing {{ pageRangeText }} of {{ totalCount }}
            </span>
            <div class="flex items-center gap-2">
              <button
                @click="currentPage--"
                :disabled="currentPage <= 1"
                class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span class="text-xs text-gray-600">Page {{ currentPage }} / {{ totalPages }}</span>
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { bookingsListList, bookingsTicketsList, organisationsSponsorsList, productsOrdersList } from '~/api/sdk.gen'

type TargetType = 'booking' | 'order' | 'ticket' | 'sponsorship'

interface PickerItem {
  id: string
  primary: string
  secondary: string
}

interface Props {
  open: boolean
  eventId: string
  targetType: TargetType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [{ target: TargetType; targetId: string; label: string; subtitle: string }]
}>()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const targetLabel = computed(() => {
  if (props.targetType === 'booking') return 'Booking'
  if (props.targetType === 'order') return 'Order'
  if (props.targetType === 'sponsorship') return 'Sponsorship'
  return 'Ticket'
})

const queryParams = computed(() => {
  const base = {
    page: currentPage.value,
    page_size: pageSize.value,
  }

  if (props.targetType === 'booking') {
    return {
      ...base,
      event__event_id: props.eventId,
      search: searchQuery.value || undefined,
    }
  }

  if (props.targetType === 'order') {
    return {
      ...base,
      event__event_id: props.eventId,
      search: searchQuery.value || undefined,
    }
  }

  if (props.targetType === 'sponsorship') {
    return {
      ...base,
      event_id: props.eventId,
      search: searchQuery.value || undefined,
    }
  }

  return {
    ...base,
    search: searchQuery.value || undefined,
    ticket_code: searchQuery.value || undefined,
  }
})

const { data, isLoading } = useQuery({
  queryKey: ['payment-target-picker', props.targetType, props.eventId, queryParams],
  queryFn: async () => {
    if (props.targetType === 'booking') {
      return bookingsListList({ query: queryParams.value })
    }

    if (props.targetType === 'order') {
      return productsOrdersList({ query: queryParams.value })
    }

    if (props.targetType === 'sponsorship') {
      return organisationsSponsorsList({ query: queryParams.value })
    }

    return bookingsTicketsList({ query: queryParams.value })
  },
  enabled: computed(() => props.open && !!props.targetType && !!props.eventId),
})

const totalCount = computed(() => Number(data.value?.data?.count || 0))
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

const items = computed<PickerItem[]>(() => {
  const results = (data.value?.data?.results || []) as any[]

  if (props.targetType === 'booking') {
    return results.map((row) => ({
      id: String(row.id),
      primary: row.booking_reference || `Booking #${row.id}`,
      secondary: `${row.attendee_count || 0} attendee(s) • ${row.event_name || 'Unknown event'}`,
    }))
  }

  if (props.targetType === 'order') {
    return results.map((row) => ({
      id: String(row.order_id || row.id),
      primary: row.order_reference_id || row.order_id || `Order #${row.id}`,
      secondary: `${row.customer_name || row.attendee_name || 'Unknown customer'} • ${row.status_display || row.status || 'Unknown status'}`,
    }))
  }

  if (props.targetType === 'sponsorship') {
    return results.map((row) => ({
      id: String(row.sponsor_id),
      primary: row.name || `Sponsor #${row.id}`,
      secondary: `${row.organisation_name || 'Unknown organisation'} • ${row.verification_status || 'pending'}`,
    }))
  }

  return results.map((row) => ({
    id: String(row.ticket_id),
    primary: row.ticket_code || row.ticket_id,
    secondary: `${row.attendee_name || 'Unknown attendee'} • ${row.ticket_type_title || 'Unknown type'}`,
  }))
})

const pageRangeText = computed(() => {
  if (totalCount.value === 0) return '0-0'
  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(currentPage.value * pageSize.value, totalCount.value)
  return `${start}-${end}`
})

function selectItem(item: PickerItem) {
  emit('select', {
    target: props.targetType,
    targetId: item.id,
    label: item.primary,
    subtitle: item.secondary,
  })
}

watch([searchQuery, pageSize], () => {
  currentPage.value = 1
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      currentPage.value = 1
    }
  },
)
</script>
