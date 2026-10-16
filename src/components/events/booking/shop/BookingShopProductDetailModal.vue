<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-3xl' }">
    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-lg font-black leading-snug text-deep-navy">{{ product.title }}</h3>
          <button
            type="button"
            aria-label="Close"
            class="shrink-0 rounded-lg p-1.5 text-deep-navy/40 transition-colors hover:bg-deep-navy/[0.06] hover:text-deep-navy"
            @click="isOpen = false"
          >
            <span class="material-symbols-outlined text-base leading-none">close</span>
          </button>
        </div>
      </template>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <div class="overflow-hidden rounded-2xl border border-deep-navy/10 bg-mist-blue">
            <img :src="activeImageSrc" :alt="product.title" class="h-64 w-full object-cover md:h-80">
          </div>
          <div v-if="galleryImages.length > 1" class="mt-3 grid grid-cols-5 gap-2">
            <button
              v-for="(image, index) in galleryImages"
              :key="image"
              type="button"
              :aria-label="`Show image ${index + 1}`"
              class="overflow-hidden rounded-lg border transition-colors"
              :class="index === activeImageIndex ? 'border-deep-navy' : 'border-deep-navy/15 hover:border-deep-navy/40'"
              @click="activeImageIndex = index"
            >
              <img :src="image" alt="" class="h-14 w-full object-cover">
            </button>
          </div>
        </div>

        <div class="min-w-0">
          <p class="text-xl font-black text-deep-navy">{{ priceLabel }}</p>

          <div v-if="product.categories.length" class="mt-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-deep-navy/55">Categories</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <UBadge v-for="category in product.categories" :key="category" color="blue" variant="soft" size="sm">
                {{ category }}
              </UBadge>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-deep-navy/55">Description</p>
            <div v-if="isDetailLoading" class="mt-2 animate-pulse space-y-2">
              <div class="h-3 w-full rounded bg-deep-navy/[0.06]" />
              <div class="h-3 w-4/5 rounded bg-deep-navy/[0.06]" />
            </div>
            <p v-else-if="description" class="mt-2 whitespace-pre-line text-sm leading-relaxed text-deep-navy/80">
              {{ description }}
            </p>
            <p v-else-if="detailQuery.isError.value" class="mt-2 text-sm text-deep-navy/55">
              Description is unavailable right now.
            </p>
            <p v-else class="mt-2 text-sm italic text-deep-navy/50">No description provided.</p>
          </div>

          <div v-if="sizes.length" class="mt-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-deep-navy/55">Sizes</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="size in sizes"
                :key="size"
                class="rounded-full bg-deep-navy/[0.07] px-2.5 py-1 text-[11px] font-semibold text-deep-navy"
              >
                {{ size }}
              </span>
            </div>
          </div>

          <div v-if="colours.length" class="mt-4">
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-deep-navy/55">Colours</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="colour in colours"
                :key="colour"
                class="rounded-full bg-deep-navy/[0.07] px-2.5 py-1 text-[11px] font-semibold capitalize text-deep-navy"
              >
                {{ colour }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { ProductList, ProductVariantList } from '~/api/types.gen'
import { useProduct } from '~/composables/resources/products/products'

const props = defineProps<{
  modelValue: boolean
  product: ProductList
  imageUrl: string
  priceLabel: string
  variants: ProductVariantList[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const detailQuery = useProduct(computed(() => (props.modelValue ? props.product.product_id : undefined)))
const isDetailLoading = computed(() => detailQuery.isLoading.value)
const detail = computed(() => detailQuery.data.value?.data)
const description = computed(() => (detail.value?.description ?? '').trim())

const activeImageIndex = ref(0)

const galleryImages = computed(() => {
  const productImages = [detail.value?.images?.main?.url, ...(detail.value?.images?.additional ?? []).map((image) => image.url)]
  const urls = [props.imageUrl, ...productImages].filter((url): url is string => !!url)
  return [...new Set(urls)]
})

const activeImageSrc = computed(() => galleryImages.value[activeImageIndex.value] ?? props.imageUrl)

watch(
  () => props.modelValue,
  (open) => {
    if (open) activeImageIndex.value = 0
  }
)

const sizes = computed(() => [...new Set(props.variants.map((variant) => variant.size_display).filter(Boolean))])

const colours = computed(() => [
  ...new Set(props.variants.map((variant) => (variant.color || '').trim()).filter(Boolean)),
])
</script>
