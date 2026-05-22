<template>
  <!-- Backdrop -->
  <Transition name="inventory-fade">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/40 z-40"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Panel -->
  <Transition name="inventory-slide">
    <div
      v-if="open"
      class="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="min-w-0 flex-1 pr-4">
          <h3 class="text-xs font-black text-primary uppercase tracking-widest">
            Order Attendees
          </h3>
          <p class="text-sm font-medium text-gray-700 mt-0.5 truncate">{{ variantLabel }}</p>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          variant="ghost"
          color="gray"
          size="sm"
          @click="$emit('close')"
        />
      </div>

      <!-- Filters -->
      <div
        class="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-2 items-center flex-shrink-0"
      >
        <select
          v-model="orderStatusFilter"
          class="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All order statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending_refund">Pending Refund</option>
          <option value="partially_refunded">Partially Refunded</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          v-model="itemStatusFilter"
          class="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All item statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending_refund">Pending Refund</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          v-model="attendeeStatusFilter"
          class="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All attendee statuses</option>
          <option value="registered">Registered</option>
          <option value="checked_in">Checked In</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div class="ml-auto text-xs text-gray-400" v-if="totalCount !== null">
          {{ totalCount }} result{{ totalCount !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isPending" class="p-6 space-y-3 flex-1">
        <div v-for="i in 8" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      <!-- Error -->
      <div v-else-if="isError" class="flex-1 p-6 flex flex-col items-center justify-center">
        <UIcon name="i-heroicons-exclamation-circle" class="w-10 h-10 text-red-400 mb-2" />
        <p class="text-sm text-gray-600">Failed to load attendees</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!isPending && attendees.length === 0"
        class="flex-1 p-6 flex flex-col items-center justify-center"
      >
        <UIcon name="i-heroicons-users" class="w-12 h-12 text-gray-200 mb-3" />
        <p class="text-sm text-gray-500">No attendees found for this variant</p>
      </div>

      <!-- Attendees table -->
      <div v-else class="flex-1 overflow-y-auto">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 bg-white border-b border-gray-200">
            <tr>
              <th class="py-2 px-4 font-semibold text-gray-700">Attendee</th>
              <th class="py-2 px-4 font-semibold text-gray-700">Order</th>
              <th class="py-2 px-4 font-semibold text-gray-700 text-right">Qty</th>
              <th class="py-2 px-4 font-semibold text-gray-700 text-right">Total</th>
              <th class="py-2 px-4 font-semibold text-gray-700">Statuses</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="line in attendees"
              :key="`${line.attendee_id}-${line.order_id}`"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="py-2 px-4" @click="redirectToAttendee(line.attendee_id)">
                <div class="font-medium text-gray-900">
                  {{ line.first_name }} {{ line.last_name }}
                </div>
                <div class="text-xs text-gray-400 font-mono">{{ line.attendee_display_id }}</div>
                <div v-if="line.email" class="text-xs text-gray-400">{{ line.email }}</div>
              </td>
              <td class="py-2 px-4" @click="redirectToOrder(line.order_id)">
                <span class="font-mono text-xs text-gray-700">{{ line.order_reference }}</span>
              </td>
              <td class="py-2 px-4 text-right font-mono text-gray-900">{{ line.quantity }}</td>
              <td class="py-2 px-4 text-right font-mono text-xs text-gray-700">
                {{ formatMoneyStr(line.total_price) }}
              </td>
              <td class="py-2 px-4">
                <div class="flex flex-col gap-0.5">
                  <UBadge :color="orderStatusColor(line.order_status)" size="xs">
                    {{ line.order_status }}
                  </UBadge>
                  <span class="text-xs text-gray-500">{{ line.item_status }}</span>
                  <span class="text-xs text-gray-400">{{ line.attendee_status }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="px-6 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0"
      >
        <span class="text-xs text-gray-500">Page {{ currentPage }} of {{ totalPages }}</span>
        <div class="flex gap-2">
          <UButton
            size="xs"
            variant="outline"
            color="gray"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            Previous
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="gray"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            Next
          </UButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { InventoryAttendeeOrderLine } from '~/api/types.gen'
import { useInventoryAttendees } from '~/composables/resources/products/productInventory'
import { formatMoney } from '~/utils/money'
import { useRouter } from 'vue-router'


const router = useRouter()

const PAGE_SIZE = 20

const props = defineProps<{
  open: boolean
  variantId: string | null
  variantLabel: string
  eventSlug: string
}>()

defineEmits<{
  close: []
}>()

const redirectToAttendee = (attendeeId: string) => {
  router.push(`/events/${props.eventSlug}/m/participants/editor/${attendeeId}`)
}

const redirectToOrder = (orderId: string) => {
  router.push(`/events/${props.eventSlug}/m/shop/orders/${orderId}/detail`)
}

const currentPage = ref(1)
const orderStatusFilter = ref('')
const itemStatusFilter = ref('')
const attendeeStatusFilter = ref('')

// Reset page/filters when the variant changes
watch(
  () => props.variantId,
  () => {
    currentPage.value = 1
    orderStatusFilter.value = ''
    itemStatusFilter.value = ''
    attendeeStatusFilter.value = ''
  },
)

const queryParams = computed(() => {
  if (!props.variantId || !props.open) return null
  return {
    event: props.eventSlug,
    product_variant: props.variantId,
    page: currentPage.value,
    page_size: PAGE_SIZE,
    ...(orderStatusFilter.value ? { order_status: orderStatusFilter.value } : {}),
    ...(itemStatusFilter.value ? { item_status: itemStatusFilter.value } : {}),
    ...(attendeeStatusFilter.value ? { attendee_status: attendeeStatusFilter.value } : {}),
  }
})

const { data, isPending, isError } = useInventoryAttendees(queryParams)

const attendees = computed<InventoryAttendeeOrderLine[]>(() => data.value?.data?.results ?? [])
const totalCount = computed<number | null>(() => data.value?.data?.count ?? null)
const totalPages = computed(() =>
  totalCount.value !== null ? Math.ceil(totalCount.value / PAGE_SIZE) : 1,
)

function formatMoneyStr(moneyStr: string): string {
  const parts = moneyStr.trim().split(' ')
  if (parts.length >= 2) {
    const currency = parts[parts.length - 1]!
    const amount = parts.slice(0, parts.length - 1).join(' ')
    return formatMoney(amount, currency)
  }
  return moneyStr
}

function orderStatusColor(
  status: string,
): 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'orange' {
  switch (status) {
    case 'completed':
      return 'green'
    case 'pending':
    case 'processing':
      return 'yellow'
    case 'cancelled':
    case 'refunded':
      return 'red'
    case 'pending_refund':
    case 'partially_refunded':
      return 'orange'
    default:
      return 'gray'
  }
}
</script>

<style scoped>
.inventory-fade-enter-active,
.inventory-fade-leave-active {
  transition: opacity 0.2s ease;
}
.inventory-fade-enter-from,
.inventory-fade-leave-to {
  opacity: 0;
}

.inventory-slide-enter-active,
.inventory-slide-leave-active {
  transition: transform 0.25s ease;
}
.inventory-slide-enter-from,
.inventory-slide-leave-to {
  transform: translateX(100%);
}
</style>
