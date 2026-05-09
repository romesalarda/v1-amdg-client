<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shopping-bag" class="h-4 w-4 text-amber-600" />
          <p class="text-sm font-semibold text-gray-900">
            {{ item.order_reference || order?.order_reference_id || item.order_id || 'Order' }}
          </p>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          {{ item.status || order?.status_display || 'Unresolved order' }}
        </p>
      </div>

      <UBadge color="amber" variant="soft" size="xs">
        {{ item.order_amount || order?.total_amount || 'Amount unavailable' }}
      </UBadge>
    </div>

    <div v-if="isLoading" class="mt-3 space-y-2">
      <div class="h-8 rounded bg-gray-100 animate-pulse" />
      <div class="h-8 rounded bg-gray-100 animate-pulse" />
    </div>

    <div v-else-if="variantRows.length" class="mt-3 space-y-2">
      <div
        v-for="row in variantRows"
        :key="row.key"
        class="rounded-lg border border-gray-200 bg-gray-50 p-2"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-start gap-2">
            <img
              :src="row.image"
              alt="Order variant image"
              class="h-10 w-10 rounded-md border border-gray-200 bg-white object-cover"
            >
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-cube" class="h-3.5 w-3.5 text-gray-500" />
                <p class="truncate text-xs font-semibold text-gray-800">{{ row.title }}</p>
              </div>
              <p class="mt-0.5 text-[11px] text-gray-600">{{ row.subtitle }}</p>
            </div>
          </div>
          <span class="text-[11px] text-gray-600">x{{ row.quantity }}</span>
        </div>
      </div>
    </div>

    <div v-else class="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
      Order details are unavailable for this blocker item.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductOrder } from '~/composables/resources/products/productOrders'
import type { AttendeePreRemovalBlockerItem } from '~/composables/resources/attendee/attendees'
import { onImageError, resolveImageUrl } from '~/utils/image'

const props = defineProps<{
  item: AttendeePreRemovalBlockerItem
  eventQueryValue?: string
}>()

const orderId = computed(() => props.item.order_id || '')

const orderQuery = useProductOrder(
  computed(() => ({ event: props.eventQueryValue || undefined })),
  orderId,
)

const order = computed(() => orderQuery.data.value?.data as any)
const isLoading = computed(() => orderQuery.isLoading.value)

const variantRows = computed(() => {
  const items = Array.isArray(order.value?.order_items) ? order.value.order_items : []

  return items.map((rawItem: any, index: number) => {
    const details = rawItem?.product_variant_details && typeof rawItem.product_variant_details === 'object'
      ? rawItem.product_variant_details
      : {}

    const title = details.product_title || rawItem.product_title || `Variant ${rawItem.product_variant || index + 1}`
    const subtitleBits = [
      details.size ? `Size: ${details.size}` : null,
      details.color ? `Color: ${details.color}` : null,
      rawItem.unit_price ? `Unit: ${rawItem.unit_price}` : null,
      rawItem.total_price ? `Total: ${rawItem.total_price}` : null,
    ].filter(Boolean)

    const imageUrl = details.variant_image_url || details.image_url || details.product_image_url || null

    return {
      key: String(rawItem.id || rawItem.product_variant || index),
      title,
      subtitle: subtitleBits.length ? subtitleBits.join(' • ') : 'Variant details unavailable',
      quantity: Number(rawItem.quantity || 0),
      image: resolveImageUrl(imageUrl),
    }
  })
})
</script>
