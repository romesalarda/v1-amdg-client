<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data">
    <div class="max-w-7xl mx-auto pb-32">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-deep-navy uppercase">
            {{ isNewProduct ? 'Create Product' : 'Edit Product' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ isNewProduct ? 'Add a new product to your event shop' : 'Update product details and variants' }}
          </p>
        </div>
        <UButton
          variant="ghost"
          color="gray"
          icon="i-heroicons-arrow-left"
          @click="navigateTo(`/events/${eventId}/m/shop/dashboard`)"
        >
          Back to Shop
        </UButton>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-4">
        <USkeleton class="h-96 w-full" />
        <USkeleton class="h-64 w-full" />
      </div>

      <!-- Error State -->
      <div v-else-if="error && !isNewProduct" class="bg-red-50 border border-red-200 rounded-xl p-6">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-exclamation-circle" class="w-6 h-6 text-red-600" />
          <div>
            <h3 class="font-semibold text-red-900">Error loading product</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Tabs and Content -->
      <div v-else class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex gap-2 px-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-6 py-4 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center gap-2">
                <UIcon :name="tab.icon" class="w-5 h-5" />
                <span>{{ tab.label }}</span>
              </div>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6 min-h-[500px]">
          <!-- Basic Information Tab -->
          <div v-show="activeTab === 'basic'" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Product Title *</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. AMDG T-Shirt"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                v-model="form.description"
                rows="6"
                placeholder="Describe the product..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Base Price (£) *</label>
                <input
                  v-model.number="form.base_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Price Modifier (%)</label>
                <input
                  v-model.number="form.percentage_modifier"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p class="text-xs text-gray-500 mt-1">Enter positive or negative percentage (e.g., 10 or -5)</p>
              </div>
            </div>

            <div v-if="form.base_amount" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-blue-900">Final Price:</span>
                <span class="text-lg font-black text-blue-900">
                  £{{ calculateFinalPrice(form.base_amount, form.percentage_modifier || 0).toFixed(2) }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5"
                />
                <div>
                  <div class="text-sm font-semibold text-gray-700">Active</div>
                  <div class="text-xs text-gray-500">Product is available for purchase</div>
                </div>
              </label>

              <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  v-model="form.verified"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5"
                />
                <div>
                  <div class="text-sm font-semibold text-gray-700">Verified</div>
                  <div class="text-xs text-gray-500">Product has been reviewed and approved</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Variants Tab -->
          <div v-show="activeTab === 'variants'" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">
                Add size and color variations for this product
              </p>
              <UButton
                size="sm"
                variant="solid"
                color="primary"
                icon="i-heroicons-plus"
                @click="addVariant"
                :disabled="isNewProduct"
              >
                Add Variant
              </UButton>
            </div>

            <!-- Save product first message -->
            <div v-if="isNewProduct" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-yellow-600" />
                <p class="text-sm text-yellow-800">Save the product first before adding variants</p>
              </div>
            </div>

            <!-- Existing Variants -->
            <div v-if="existingVariants.length > 0" class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-700">Existing Variants</h3>
              <div
                v-for="variant in existingVariants"
                :key="variant.variant_id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-10 h-10 rounded border border-gray-300"
                      :style="{ backgroundColor: variant.color }"
                    ></div>
                    <div>
                      <div class="font-semibold text-gray-900">{{ variant.size_display }}</div>
                      <div class="text-sm text-gray-500">
                        Stock: {{ variant.stock_quantity }} | £{{ variant.final_price }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <UBadge :color="variant.is_active ? 'green' : 'gray'" size="xs">
                      {{ variant.is_active ? 'Active' : 'Inactive' }}
                    </UBadge>
                    <UBadge :color="variant.verified ? 'blue' : 'gray'" size="xs">
                      {{ variant.verified ? 'Verified' : 'Unverified' }}
                    </UBadge>
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="red"
                      icon="i-heroicons-trash"
                      @click="deleteExistingVariant(variant.variant_id)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- New Variants -->
            <div v-if="newVariants.length > 0" class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-700">New Variants (unsaved)</h3>
              <div
                v-for="(variant, index) in newVariants"
                :key="`new-${index}`"
                class="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4"
              >
                <div class="grid grid-cols-12 gap-4">
                  <!-- Size -->
                  <div class="col-span-6 md:col-span-3">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Size *</label>
                    <select
                      v-model="variant.size"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="XS">Extra Small (XS)</option>
                      <option value="SM">Small (SM)</option>
                      <option value="MD">Medium (MD)</option>
                      <option value="LG">Large (LG)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="OS">One Size (OS)</option>
                      <option value="NA">Not Applicable (NA)</option>
                    </select>
                  </div>

                  <!-- Color -->
                  <div class="col-span-6 md:col-span-3">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Color</label>
                    <div class="flex gap-2">
                      <input
                        v-model="variant.color"
                        type="color"
                        class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        v-model="variant.color"
                        type="text"
                        placeholder="#FFFFFF"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <!-- Stock -->
                  <div class="col-span-4 md:col-span-2">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Stock</label>
                    <input
                      v-model.number="variant.stock_quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <!-- Max Stock -->
                  <div class="col-span-4 md:col-span-2">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Max Stock</label>
                    <input
                      v-model.number="variant.max_stock_quantity"
                      type="number"
                      min="0"
                      placeholder="∞"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <!-- Max Per Order -->
                  <div class="col-span-4 md:col-span-2">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Max/Order</label>
                    <input
                      v-model.number="variant.max_purchase_quantity_per_order"
                      type="number"
                      min="1"
                      placeholder="5"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-blue-200">
                  <div class="flex items-center gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="variant.is_active"
                        type="checkbox"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span class="text-xs text-gray-700">Active</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="variant.verified"
                        type="checkbox"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span class="text-xs text-gray-700">Verified</span>
                    </label>
                  </div>
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="red"
                    icon="i-heroicons-trash"
                    @click="removeNewVariant(index)"
                  >
                    Remove
                  </UButton>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="existingVariants.length === 0 && newVariants.length === 0 && !isNewProduct" class="text-center py-12">
              <UIcon name="i-heroicons-squares-2x2" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No variants yet</h3>
              <p class="text-sm text-gray-500 mb-4">Add variants with different sizes and colors</p>
              <UButton
                size="sm"
                variant="solid"
                color="primary"
                icon="i-heroicons-plus"
                @click="addVariant"
              >
                Add First Variant
              </UButton>
            </div>
          </div>

          <!-- Images Tab -->
          <div v-show="activeTab === 'images'" class="space-y-6">
            <div v-if="isNewProduct" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-yellow-600" />
                <p class="text-sm text-yellow-800">Save the product first before adding images</p>
              </div>
            </div>

            <div v-else>
              <!-- Upload Area -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div class="text-center">
                  <UIcon name="i-heroicons-photo" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p class="text-sm text-gray-600 mb-4">Click to upload or drag and drop</p>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    class="hidden"
                    @change="handleFileUpload"
                  />
                  <UButton
                    size="sm"
                    variant="solid"
                    color="primary"
                    :loading="isUploadingImage"
                    @click="fileInput?.click()"
                  >
                    Upload Images
                  </UButton>
                  <p class="text-xs text-gray-500 mt-2">JPEG, PNG, GIF, or WebP, max 10MB each</p>
                </div>
              </div>

              <!-- Product Images -->
              <div v-if="productImages.length > 0" class="space-y-4">
                <h3 class="text-sm font-semibold text-gray-700">Product Images</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    v-for="image in productImages"
                    :key="image.id"
                    class="relative group aspect-square border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <img
                      :src="image.url || ''"
                      :alt="image.alt_text || 'Product image'"
                      class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <UButton
                        size="xs"
                        variant="solid"
                        color="red"
                        icon="i-heroicons-trash"
                        :loading="isDeletingImage === image.id"
                        @click="removeImageHandler(image.id)"
                      >
                        Delete
                      </UButton>
                    </div>
                    <div v-if="isMainImage(image.id)" class="absolute top-2 left-2">
                      <UBadge color="blue" size="xs">Main</UBadge>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-12">
                <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No images yet</h3>
                <p class="text-sm text-gray-500">Upload product images to showcase your item</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Bottom Save Bar -->
      <div v-if="!isLoading" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-6 py-4 z-50">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon 
              :name="hasUnsavedChanges ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-check-circle'" 
              :class="hasUnsavedChanges ? 'w-5 h-5 text-yellow-600' : 'w-5 h-5 text-green-600'"
            />
            <span class="text-sm font-medium text-gray-700">
              {{ hasUnsavedChanges ? 'You have unsaved changes' : 'All changes saved' }}
            </span>
            <span v-if="newVariants.length > 0" class="text-xs text-yellow-600">
              ({{ newVariants.length }} unsaved variant{{ newVariants.length !== 1 ? 's' : '' }})
            </span>
          </div>
          <div class="flex items-center gap-3">
            <UButton
              variant="ghost"
              color="gray"
              @click="navigateTo(`/events/${eventId}/m/shop/dashboard`)"
            >
              Cancel
            </UButton>
            <UButton
              variant="solid"
              color="primary"
              icon="i-heroicons-check"
              :loading="isSaving"
              :disabled="!hasUnsavedChanges && newVariants.length === 0"
              @click="saveAll"
            >
              {{ isNewProduct ? 'Create Product' : 'Save Changes' }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useProduct, useCreateProduct, useUpdateProduct } from '~/composables/resources/products/products'
import { useProductVariants, useCreateProductVariant, useDeleteProductVariant } from '~/composables/resources/products/productVariants'
import { useAddProductImage, useRemoveProductImage } from '~/composables/resources/products/productImages'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import type { ProductVariantDetail } from '~/api/types.gen'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const eventId = computed(() => route.params.id as string)
const productId = computed(() => route.params.product_id as string)
const isNewProduct = computed(() => productId.value === 'new')

// Tabs
const activeTab = ref('basic')
const tabs = [
  { id: 'basic', label: 'Basic Information', icon: 'i-heroicons-information-circle' },
  { id: 'variants', label: 'Variants', icon: 'i-heroicons-squares-2x2' },
  { id: 'images', label: 'Images', icon: 'i-heroicons-photo' },
]

// Event Data
const { data: event } = useEvent(eventId)

// Product Data (only load if editing existing product)
const { data: productData, isLoading, error } = useProduct(
  computed(() => {
    return productId.value
  })
)

// Variants Data (only load if editing existing product)
const { data: variantsData, refetch: refetchVariants } = useProductVariants(
  computed(() => isNewProduct.value ? undefined : productId.value)
)

// Form State
const form = reactive({
  title: '',
  description: '',
  base_amount: 0,
  percentage_modifier: 0,
  is_active: false,
  verified: false,
})

// Track initial values for change detection
const initialForm = ref<typeof form | null>(null)

// New Variants (unsaved)
interface NewVariant {
  size: 'XS' | 'SM' | 'MD' | 'LG' | 'XL' | 'OS' | 'NA'
  color: string
  stock_quantity: number
  max_stock_quantity: number | null
  max_purchase_quantity_per_order: number
  is_active: boolean
  verified: boolean
}

const newVariants = ref<NewVariant[]>([])

// Existing Variants
const existingVariants = computed(() => {
  const results = (variantsData.value?.data as any)?.results
  return (results as ProductVariantDetail[]) || []
})

// Product Images
const productImages = computed(() => {
  if (!productData.value?.data?.images) return []
  const images = []
  if (productData.value.data.images.main) {
    images.push(productData.value.data.images.main)
  }
  if (productData.value.data.images.additional) {
    images.push(...productData.value.data.images.additional)
  }
  return images
})

// Check if unsaved changes exist
const hasUnsavedChanges = computed(() => {
  if (!initialForm.value) return false
  return JSON.stringify(form) !== JSON.stringify(initialForm.value)
})

// Watch for product data and populate form
watch(() => productData.value?.data, (product) => {
  if (product) {
    form.title = product.title || ''
    form.description = product.description || ''
    form.base_amount = parseFloat(product.base_amount as string) || 0
    form.percentage_modifier = parseFloat(product.percentage_modifier as string) || 0
    form.is_active = product.is_active ?? false
    form.verified = product.verified ?? false
    
    // Store initial values
    initialForm.value = { ...form }
  }
}, { immediate: true })

// Mutations
const createProduct = useCreateProduct()
const updateProduct = useUpdateProduct()
const createVariant = useCreateProductVariant()
const deleteVariant = useDeleteProductVariant()
const addImage = useAddProductImage()
const removeImageMutation = useRemoveProductImage()

const isSaving = computed(() => 
  createProduct.isPending.value || 
  updateProduct.isPending.value ||
  createVariant.isPending.value
)

// Image upload
const fileInput = ref<HTMLInputElement>()
const isUploadingImage = ref(false)
const isDeletingImage = ref<number | null>(null)

function isMainImage(imageId?: number) {
  return productData.value?.data?.images?.main?.id === imageId
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  isUploadingImage.value = true

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.add({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit`,
          color: 'red',
        })
        continue
      }

      await addImage.mutateAsync({
        productId: productId.value,
        image: file,
        isMain: productImages.value.length === 0, // First image is main
      })
    }

    toast.add({
      title: 'Success',
      description: `${files.length} image${files.length !== 1 ? 's' : ''} uploaded successfully`,
      color: 'green',
    })

    // Clear the input
    if (target) target.value = ''
  } catch (err: any) {
    toast.add({
      title: 'Upload Error',
      description: err.message || 'Failed to upload images',
      color: 'red',
    })
  } finally {
    isUploadingImage.value = false
  }
}

async function removeImageHandler(imageId?: number) {
  if (!imageId) return

  isDeletingImage.value = imageId

  try {
    await removeImageMutation.mutateAsync({
      productId: productId.value,
      resourceId: imageId,
    })

    toast.add({
      title: 'Success',
      description: 'Image removed successfully',
      color: 'green',
    })
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to remove image',
      color: 'red',
    })
  } finally {
    isDeletingImage.value = null
  }
}

// Variant Management
function addVariant() {
  newVariants.value.push({
    size: 'MD',
    color: '#FFFFFF',
    stock_quantity: 0,
    max_stock_quantity: null,
    max_purchase_quantity_per_order: 5,
    is_active: true,
    verified: false,
  })
}

function removeNewVariant(index: number) {
  newVariants.value.splice(index, 1)
}

async function deleteExistingVariant(variantId: string) {
  if (!confirm('Are you sure you want to delete this variant?')) return

  try {
    await deleteVariant.mutateAsync({
      productId: productId.value,
      variantId,
    })

    toast.add({
      title: 'Success',
      description: 'Variant deleted successfully',
      color: 'green',
    })

    refetchVariants()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to delete variant',
      color: 'red',
    })
  }
}

// Price Calculation
function calculateFinalPrice(baseAmount: number, percentageModifier: number): number {
  if (!baseAmount) return 0
  if (!percentageModifier) return baseAmount
  return baseAmount * (1 + percentageModifier / 100)
}

// Save Product
async function saveProduct() {
  // Validation
  if (!form.title || !form.base_amount) {
    toast.add({
      title: 'Validation Error',
      description: 'Please fill in all required fields (title and base price)',
      color: 'red',
    })
    return null
  }

  try {
    if (isNewProduct.value) {
      // Create new product
      const result = await createProduct.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        base_amount: form.base_amount.toString(),
        percentage_modifier: form.percentage_modifier?.toString() || '0',
        is_active: form.is_active,
        verified: form.verified,
        event: Number(event.value?.data?.id),
      } as any)

      toast.add({
        title: 'Success',
        description: 'Product created successfully',
        color: 'green',
      })

      // Update initial form values
      initialForm.value = { ...form }

      return result.data
    } else {
      // Update existing product
      await updateProduct.mutateAsync({
        productId: productId.value,
        body: {
          title: form.title,
          description: form.description || undefined,
          base_amount: form.base_amount.toString(),
          percentage_modifier: form.percentage_modifier?.toString() || '0',
          is_active: form.is_active,
          verified: form.verified,
          event: Number(eventId.value),
        } as any,
      })

      toast.add({
        title: 'Success',
        description: 'Product updated successfully',
        color: 'green',
      })

      // Update initial form values
      initialForm.value = { ...form }

      return null
    }
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to save product',
      color: 'red',
    })
    return null
  }
}

// Save new variants
async function saveNewVariants(currentProductId: string) {
  if (newVariants.value.length === 0) return

  const errors: string[] = []

  for (const variant of newVariants.value) {
    try {
      if (!productData.value?.data?.id) {
        errors.push(`Product must be saved before adding variants`)
        continue
      }

      await createVariant.mutateAsync({
        productId: currentProductId,
        body: {
          product: productData.value?.data?.id,
          size: variant.size,
          color: variant.color,
          stock_quantity: variant.stock_quantity,
          max_stock_quantity: variant.max_stock_quantity,
          max_purchase_quantity_per_order: variant.max_purchase_quantity_per_order,
          is_active: variant.is_active,
          verified: variant.verified,
        },
      })
    } catch (err: any) {
      errors.push(`Failed to save variant (${variant.size}, ${variant.color}): ${err.message}`)
    }
  }

  if (errors.length > 0) {
    toast.add({
      title: 'Partial Success',
      description: `Some variants failed to save: ${errors.join(', ')}`,
      color: 'yellow',
    })
  } else if (newVariants.value.length > 0) {
    toast.add({
      title: 'Success',
      description: `${newVariants.value.length} variant${newVariants.value.length !== 1 ? 's' : ''} saved successfully`,
      color: 'green',
    })
  }

  // Clear new variants
  newVariants.value = []
  refetchVariants()
}

// Save All
async function saveAll() {
  // First save the product
  const createdProduct = await saveProduct()
  
  if (createdProduct && isNewProduct.value) {
    // If we just created a product, navigate to its edit page
    const newProductId = (createdProduct as any).product_id
    await router.push(`/events/${eventId.value}/m/shop/products/${newProductId}/editor`)
    return
  }

  // Then save new variants if any
  if (newVariants.value.length > 0) {
    await saveNewVariants(productId.value)
  }
}
</script>
