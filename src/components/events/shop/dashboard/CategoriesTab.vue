<template>
  <!-- Header -->
  <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <UIcon name="i-heroicons-folder" class="w-5 h-5 text-primary" />
      <div>
        <h2 class="text-sm font-black text-primary uppercase tracking-widest">Category Assignments</h2>
        <p class="text-xs text-gray-500">Read-only category scopes available for product assignments</p>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="categoriesLoading" class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <USkeleton class="h-32 w-full" v-for="i in 6" :key="i" />
  </div>

  <!-- Categories Grid -->
  <div v-else-if="categories.length > 0" class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-for="category in categories"
      :key="category.id"
      class="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <UIcon name="i-heroicons-folder" class="w-5 h-5 text-primary" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ categoryProductCounts[category.id] || 0 }} mapped product{{ (categoryProductCounts[category.id] || 0) !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <UBadge color="gray" variant="soft" size="xs">Assignment Only</UBadge>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="p-12 text-center">
    <UIcon name="i-heroicons-folder" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 class="text-lg font-semibold text-gray-900 mb-2">No category assignments yet</h3>
    <p class="text-sm text-gray-500 mb-4">Use the Category Mapping tab to assign products to existing event categories.</p>
  </div>
</template>

<script setup lang="ts">
import type { EventDetail } from '~/api/types.gen'
import { useProductEventCategories } from '~/composables/resources/products/productEventCategories'
import { useProductCategories } from '~/composables/resources/products/productCategories'

const props = defineProps<{
  eventId: string
  event: EventDetail | undefined
}>()

const eventCategoriesQuery = computed(() => {
  const eventSlug = props.event?.url_safe_title
  if (!eventSlug) return undefined
  return { event: eventSlug, page_size: 100 }
})

const { data: eventCategoriesData, isLoading: eventCategoriesLoading } =
  useProductEventCategories(eventCategoriesQuery)
const eventCategories = computed(() => eventCategoriesData.value?.data?.results || [])

const { data: productCategoriesData, isLoading: productCategoriesLoading } = useProductCategories(
  computed(() => ({ page_size: 100 })),
)
const categories = computed(() => productCategoriesData.value?.data?.results || [])

const categoriesLoading = computed(
  () => eventCategoriesLoading.value || productCategoriesLoading.value,
)

const categoryProductCounts = computed(() => {
  const counts: Record<number, number> = {}
  eventCategories.value.forEach((association: any) => {
    const categoryId = Number(association.category)
    if (!Number.isFinite(categoryId) || categoryId <= 0) return
    if (!counts[categoryId]) counts[categoryId] = 0
    if (association.product) counts[categoryId] += 1
  })
  return counts
})
</script>
