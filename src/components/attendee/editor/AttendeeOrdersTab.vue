<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xs font-black text-primary uppercase tracking-widest">Orders & Order Items</h3>
      <!-- Intentionally keeping create button disabled to preserve current behavior -->
    </div>

    <div v-if="showCreateOrderForm" class="bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-200">
      <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Order</h4>
      <form @submit.prevent="$emit('create-order')" class="space-y-3">
        <p class="text-xs text-gray-600">A new draft order will be created for this attendee.</p>
        <div class="flex gap-2 pt-2">
          <UButton
            type="submit"
            :disabled="createOrderPending"
            size="sm"
            color="green"
          >
            {{ createOrderPending ? 'Creating...' : 'Create Draft Order' }}
          </UButton>
          <UButton
            type="button"
            @click="$emit('set-show-create-order-form', false)"
            size="sm"
            variant="ghost"
            color="gray"
          >
            Cancel
          </UButton>
        </div>
      </form>
    </div>

    <div v-if="ordersLoading" class="text-center py-8 text-gray-500 text-sm">
      Loading orders...
    </div>
    <div v-else-if="!orders.length" class="text-center py-8 text-gray-500 text-sm">
      <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <UIcon name="i-heroicons-shopping-bag" class="h-7 w-7" />
        </div>
        <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No Orders</p>
        <p class="mt-2 text-sm text-slate-500">Orders are shown here when they are created by users or the system.</p>
      </div>
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="border border-gray-200 rounded-xl overflow-hidden bg-white"
      >
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200" v-if="order.status != 'draft'">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h4 class="font-bold text-sm text-gray-900 font-mono">{{ order.order_reference_id }}</h4>
              <UBadge
                :color="(getOrderStatusColor(order.status || 'draft') as any)"
                variant="soft"
                size="xs"
              >
                {{ (order.status || 'draft').toUpperCase().replaceAll('_', ' ') }}
              </UBadge>
              <span class="text-xs text-gray-600">{{ order.item_count }} items</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-primary">{{ order.total_amount }}</span>
              <UButton
                v-if="order.status === 'draft' || order.status === 'pending'"
                @click="$emit('cancel-order', order.id)"
                size="xs"
                color="red"
                variant="ghost"
                icon="i-heroicons-x-mark"
              >
                Cancel Order
              </UButton>
            </div>
          </div>
          <div class="mt-1 text-xs text-gray-500">
            Created: {{ new Date(order.created_at).toLocaleString() }}
          </div>
        </div>

        <div class="p-4" v-if="order.status != 'draft'">
          <div class="flex items-center justify-between mb-3">
            <h5 class="text-xs font-bold text-gray-700 uppercase">Order Items</h5>
            <UButton
              v-if="order.status === 'draft'"
              @click="$emit('toggle-add-item-form', order.id)"
              size="xs"
              color="primary"
              variant="ghost"
              icon="i-heroicons-plus"
            >
              Add Item
            </UButton>
          </div>

          <div v-if="showAddItemFormForOrder === order.id" class="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
            <form @submit.prevent="$emit('add-order-item', order.id)" class="space-y-2">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Product Variant ID (UUID) *</label>
                <input
                  :value="newOrderItem.product_variant_id"
                  @input="$emit('update-order-item-product-variant-id', (($event.target as HTMLInputElement).value || ''))"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono"
                  placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Quantity *</label>
                <input
                  :value="newOrderItem.quantity"
                  @input="$emit('update-order-item-quantity', Number(($event.target as HTMLInputElement).value || 1))"
                  type="number"
                  min="1"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
              <div class="flex gap-2">
                <UButton
                  type="submit"
                  :disabled="addOrderItemPending"
                  size="xs"
                  color="green"
                >
                  {{ addOrderItemPending ? 'Adding...' : 'Add Item' }}
                </UButton>
                <UButton
                  type="button"
                  @click="$emit('cancel-add-item-form')"
                  size="xs"
                  variant="ghost"
                  color="gray"
                >
                  Cancel
                </UButton>
              </div>
            </form>
          </div>

          <div v-if="!order.order_items?.length" class="text-center py-4 text-gray-500 text-xs">
            No items in this order
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="item in order.order_items"
              :key="item.id"
              class="p-3 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div class="flex items-start gap-3" @click="navigateTo(`/events/${eventId}/m/shop/orders/${order.order_id}/detail`)" style="cursor: pointer">
                <div class="w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                  <img
                    v-if="getOrderItemImageUrl(item)"
                    :src="getOrderItemImageUrl(item) || ''"
                    :alt="getOrderItemTitle(item)"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <UIcon name="i-heroicons-photo" class="w-5 h-5" />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <p class="text-sm font-semibold text-gray-900 truncate">
                        {{ getOrderItemTitle(item) }}
                      </p>
                      <p class="text-xs text-gray-500 mt-0.5">
                        {{ getOrderItemCode(item) }}
                      </p>
                    </div>
                    <span class="text-sm font-bold text-primary whitespace-nowrap">{{ item.total_price }}</span>
                  </div>

                  <div class="flex flex-wrap items-center gap-2 mt-2">
                    <UBadge
                      size="xs"
                      color="blue"
                      variant="soft"
                      class="ml-2"
                    >
                      {{ item.status.toUpperCase().replaceAll('_', ' ') }}
                    </UBadge>
                    <UBadge size="xs" color="gray" variant="soft">
                      Qty {{ item.quantity }}
                    </UBadge>
                    <UBadge size="xs" color="gray" variant="soft">
                      Unit {{ item.unit_price }}
                    </UBadge>
                    <UBadge
                      v-if="getOrderItemSize(item)"
                      size="xs"
                      color="blue"
                      variant="soft"
                    >
                      Size {{ getOrderItemSize(item) }}
                    </UBadge>
                    <span
                      v-if="getOrderItemColor(item)"
                      class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-700"
                    >
                      <span class="w-2.5 h-2.5 rounded-full border border-gray-300" :style="getOrderItemColorStyle(item)" />
                      {{ getOrderItemColor(item) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const route = useRoute()
const eventId = route.params.id as string

defineProps<{
  showCreateOrderForm: boolean
  createOrderPending: boolean
  ordersLoading: boolean
  orders: any[]
  showAddItemFormForOrder: number | null
  newOrderItem: { product_variant_id: string; quantity: number }
  addOrderItemPending: boolean
  getOrderStatusColor: (status: string) => string
  getOrderItemTitle: (item: any) => string
  getOrderItemCode: (item: any) => string
  getOrderItemImageUrl: (item: any) => string | null
  getOrderItemSize: (item: any) => string | null
  getOrderItemColor: (item: any) => string | null
  getOrderItemColorStyle: (item: any) => Record<string, string> | undefined
}>()

defineEmits<{
  (event: 'create-order'): void
  (event: 'set-show-create-order-form', value: boolean): void
  (event: 'cancel-order', orderId: number): void
  (event: 'toggle-add-item-form', orderId: number): void
  (event: 'add-order-item', orderId: number): void
  (event: 'cancel-add-item-form'): void
  (event: 'update-order-item-product-variant-id', value: string): void
  (event: 'update-order-item-quantity', value: number): void
}>()
</script>
