<template>
  <div class="space-y-3">
    <!-- Step 1: Select a product -->
    <div>
      <label class="block text-xs font-semibold text-gray-500 mb-1.5">Product</label>
      <ProductSelect
        v-model="internalProductId"
        :event-slug="eventSlug"
        placeholder="Select a product first…"
        @update:model-value="onProductChange"
      />
    </div>

    <!-- Step 2: Select a discount for that product -->
    <div v-if="internalProductId">
      <label class="block text-xs font-semibold text-gray-500 mb-1.5">Discount</label>

      <div v-if="discountsLoading" class="flex items-center gap-2 py-3 text-sm text-navy-400">
        <span class="material-symbols-outlined text-base animate-spin">progress_activity</span>
        Loading discounts…
      </div>

      <div
        v-else-if="discountOptions.length === 0"
        class="py-3 text-sm text-navy-400 text-center"
      >
        No discounts found for this product
      </div>

      <div v-else ref="discountContainerRef" class="relative">
        <div
          class="w-full px-4 py-3 bg-mist-blue border border-transparent focus-within:border-primary rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          @click="openDiscountDropdown"
        >
          <span class="material-symbols-outlined text-primary text-base shrink-0">local_offer</span>
          <span class="flex-1 text-sm font-medium truncate" :class="selectedDiscountLabel ? 'text-navy-900' : 'text-navy-400'">
            {{ selectedDiscountLabel || 'Select a discount…' }}
          </span>
          <button
            v-if="modelValue"
            class="material-symbols-outlined text-navy-400 text-base shrink-0 hover:text-red-500 transition-colors"
            type="button"
            @click.stop="clearDiscount"
          >close</button>
          <span
            v-else
            class="material-symbols-outlined text-navy-400 text-base shrink-0 transition-transform"
            :class="{ 'rotate-180': discountOpen }"
          >expand_more</span>
        </div>

        <Teleport to="body">
          <Transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="discountOpen"
              ref="discountDropdownRef"
              class="fixed bg-white border border-navy-100 rounded-xl shadow-lg overflow-hidden"
              :style="discountDropdownStyle"
            >
              <ul class="max-h-48 overflow-y-auto py-1">
                <li
                  v-for="option in discountOptions"
                  :key="option.id"
                  class="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors"
                  :class="option.id === modelValue ? 'bg-primary text-white' : 'text-navy-800 hover:bg-mist-blue'"
                  @click="selectDiscount(option.id, option.name)"
                >
                  <span
                    class="material-symbols-outlined text-base shrink-0"
                    :class="option.id === modelValue ? 'text-white' : 'text-primary'"
                  >check_circle</span>
                  <div class="flex flex-col min-w-0">
                    <span class="truncate">{{ option.name }}</span>
                    <span
                      class="text-xs truncate"
                      :class="option.id === modelValue ? 'text-white/70' : 'text-navy-400'"
                    >{{ option.value }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, type CSSProperties } from 'vue'
import { useProductDiscounts } from '~/composables/resources/products/productDiscounts'
import ProductSelect from './ProductSelect.vue'

const props = defineProps<{
  modelValue?: string | null
  eventSlug?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const internalProductId = ref<string | null>(null)
const selectedDiscountLabel = ref('')
const discountOpen = ref(false)
const discountContainerRef = ref<HTMLElement | null>(null)
const discountDropdownRef = ref<HTMLElement | null>(null)
const discountDropdownStyle = ref<CSSProperties>({})

const discountsQuery = useProductDiscounts(
  computed(() => internalProductId.value || ''),
  undefined,
  { enabled: computed(() => !!internalProductId.value) },
)

const discountsLoading = discountsQuery.isLoading

const discountOptions = computed(() => {
  const data = discountsQuery.data.value as any
  const list: any[] = Array.isArray(data) ? data : (data?.results || [])
  return list
    .filter((d) => d && d.discount_id)
    .map((d) => ({
      id: String(d.discount_id),
      name: String(d.name || ''),
      value: String(d.discount_value || ''),
    }))
})

function onProductChange(productId: string | null) {
  // Clear discount when product changes
  if (modelValue.value !== null) emit('update:modelValue', null)
  selectedDiscountLabel.value = ''
}

// computed getter for modelValue (prop is not writable directly)
const modelValue = computed(() => props.modelValue)

function openDiscountDropdown() {
  discountOpen.value = true
  nextTick(() => updateDiscountPosition())
}

function closeDiscountDropdown() {
  discountOpen.value = false
  discountDropdownStyle.value = {}
}

function selectDiscount(id: string, name: string) {
  selectedDiscountLabel.value = name
  emit('update:modelValue', id)
  closeDiscountDropdown()
}

function clearDiscount() {
  selectedDiscountLabel.value = ''
  emit('update:modelValue', null)
}

function updateDiscountPosition() {
  const trigger = discountContainerRef.value?.firstElementChild as HTMLElement | null
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  const top = Math.round(rect.bottom + 8)
  const maxHeight = Math.max(160, window.innerHeight - top - 16)
  discountDropdownStyle.value = {
    top: `${top}px`,
    left: `${Math.round(rect.left)}px`,
    width: `${Math.round(rect.width)}px`,
    maxHeight: `${maxHeight}px`,
    zIndex: '9999',
  }
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  if (discountContainerRef.value?.contains(target) || discountDropdownRef.value?.contains(target)) return
  if (discountOpen.value) closeDiscountDropdown()
}

function handleViewportChange() {
  if (discountOpen.value) updateDiscountPosition()
}

watch(discountOpen, (value) => {
  if (value) {
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
  } else {
    window.removeEventListener('resize', handleViewportChange)
    window.removeEventListener('scroll', handleViewportChange, true)
  }
})

onMounted(() => { document.addEventListener('mousedown', handleOutsideClick) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', handleOutsideClick) })
</script>
