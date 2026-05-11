<template>
  <article class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <!-- Loading state -->
    <template v-if="isPending">
      <div class="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-slate-200 animate-pulse" />
      <div class="min-w-0 flex-1 space-y-2">
        <div class="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
        <div class="h-2.5 w-1/2 rounded bg-slate-200 animate-pulse" />
        <div class="h-2.5 w-1/3 rounded bg-slate-200 animate-pulse" />
      </div>
    </template>

    <template v-else>
      <!-- Thumbnail -->
      <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <img
          v-if="imageUrl"
          :src="resolveImageUrl(imageUrl)"
          :alt="title"
          class="h-full w-full object-cover"
          @error="onImageError"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-slate-300">
          <UIcon name="i-heroicons-photo" class="h-5 w-5" />
        </div>
      </div>

      <!-- Details -->
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-semibold text-slate-900">{{ title }}</div>
        <div class="mt-0.5 text-xs text-slate-500">{{ code }}</div>
        <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span v-if="size" class="rounded-full bg-slate-100 px-2 py-0.5">{{ size }}</span>
          <span v-if="color" class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
            <span class="inline-block h-2.5 w-2.5 rounded-full border border-slate-300" :style="{ backgroundColor: color }" />
            {{ color }}
          </span>
        </div>
        <div class="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <span>{{ quantity }}x</span>
          <span>{{ formattedAmount }}</span>
        </div>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { useProductOrderItem } from '~/composables/resources/products/productOrderItems'
import { resolveImageUrl, onImageError } from '~/utils/image'

interface Props {
  orderItemId: number
  quantity?: number
  amount?: string | number | null
}

const props = defineProps<Props>()

const { data, isPending } = useProductOrderItem(computed(() => props.orderItemId))
const item = computed(() => data.value?.data ?? null)
const details = computed(() => item.value?.product_variant_details)

const imageUrl = computed<string | null>(() =>
  details.value?.variant_image_url
  || details.value?.image_url
  || details.value?.product_image_url
  || null,
)

const title = computed(() =>
  details.value?.product_title
)

const code = computed(() =>
  details.value?.product_display_code
  || (details.value?.variant_id ? `Variant ${details.value.variant_id}` : '')
  || '',
)

const size = computed(() => details.value?.size || null)
const color = computed(() => details.value?.color || null)

const quantity = computed(() => props.quantity ?? item.value?.quantity ?? 1)

const formattedAmount = computed(() => {
  const raw = props.amount ?? item.value?.total_price ?? '0'
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''))
  return isNaN(num) ? String(raw) : `£${num.toFixed(2)}`
})
</script>
