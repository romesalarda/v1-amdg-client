<template>
  <EventManagementLayout :event-id="eventUUID" :event="event?.data">
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div v-if="isSearching" class="flex flex-col items-center justify-center py-20">
        <div role="status">
          <svg class="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="mt-4 text-gray-600">Finding product...</p>
      </div>

      <!-- Error Case -->
      <div v-else-if="!isSearching && route.query['window-id']" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-yellow-600" />
          <div>
            <h3 class="font-semibold text-yellow-900">Product Not Found</h3>
            <p class="text-sm text-yellow-700">Could not find a product with the specified window.</p>
          </div>
        </div>
      </div>

      <!-- Default: Redirect to shop dashboard -->
      <div v-else>
        <p class="text-gray-600">Redirecting to shop dashboard...</p>
      </div>
    </div>
  </EventManagementLayout>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEvent } from '~/composables/resources/events/events'
import { useProducts } from '~/composables/resources/products/products'
import { productsAvailabilityWindowsList } from '~/api/sdk.gen'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'

const route = useRoute()
const router = useRouter()

const isSearching = ref(false)
const hasSearchedForProduct = ref(false)

definePageMeta({
  layout: false,
})

// Fetch event data
const { data: event } = useEvent(computed(() => String(route.params.id)))
const eventId = computed(() => event.value?.data?.id)
const eventUUID = computed(() => event.value?.data?.event_id || String(route.params.id))
// Fetch all products for this event
const {
  data: productsData,
  isLoading: isLoadingProducts,
} = useProducts(computed(() => ({ event: event.value?.data?.url_safe_title || undefined, is_active: true, page_size: 100 })))

const products = computed(() => {
  const results = productsData.value?.data?.results || []
  return results
})

// Watch for products to load, then search for product if we have window-id
watch(
  () => ({ 
    eventId: eventId.value,
    loading: isLoadingProducts.value,
    productsLoaded: products.value.length > 0,
    windowId: route.query['window-id']
  }),
  async ({ eventId: currentEventId, loading, productsLoaded, windowId }) => {
    console.log('[Products Index] Watcher fired:', { eventId: currentEventId, loading, productsLoaded, windowId, hasSearched: hasSearchedForProduct.value })
    
    // Wait for eventId to be valid
    if (!currentEventId || isNaN(currentEventId)) {
      return
    }
    
    // Use the UUID from route for navigation (not the numeric ID)
    const eventUUID = String(route.params.id)
    
    // If no window-id, redirect to dashboard (only after loading finishes)
    if (!windowId && !hasSearchedForProduct.value && !loading) {
      hasSearchedForProduct.value = true
      router.replace(`/events/${eventUUID}/m/shop/dashboard`)
      return
    }
    
    // Only search once when products are loaded and we have a window-id
    // Wait for loading to finish before deciding
    if (loading || hasSearchedForProduct.value || !windowId) {
      return
    }
    
    // If loading is done but no products, we can't find the window
    if (!productsLoaded) {
      hasSearchedForProduct.value = true
      isSearching.value = false
      return
    }

    hasSearchedForProduct.value = true
    isSearching.value = true

    try {
      // Search through all products to find which one has this window
      for (const product of products.value) {
        
        // Fetch availability windows for this product using the API SDK
        const response = await productsAvailabilityWindowsList({ 
          path: { product_id: product.product_id } 
        })
        
        const results = (response.data as any)?.results
        
        if (results && Array.isArray(results)) {
          const foundWindow = results.find((w: any) => w.availability_id === windowId)
          
          if (foundWindow) {
            console.log('[Products Index] Found window! Redirecting to editor...')
            // Found it! Redirect to product editor with window-id (use UUID for navigation)
            router.replace(`/events/${eventUUID}/m/shop/products/${product.product_id}/editor?tab=availability&window-id=${windowId}`)
            return
          }
        }
      }

      // If we get here, window was not found
      isSearching.value = false
    } catch (error) {
      isSearching.value = false
    }
  },
  { immediate: true }
)
</script>