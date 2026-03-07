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
      <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <USkeleton class="h-96 w-full" />
          <USkeleton class="h-64 w-full" />
        </div>
        <div class="lg:col-span-1">
          <USkeleton class="h-96 w-full" />
        </div>
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

      <!-- Two Column Layout: Main Editor (2/3) + Sidebar (1/3) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Editor Area (2/3) -->
        <div class="lg:col-span-2">
          <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
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
          <div v-show="activeTab === 'variants'" class="space-y-6">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">
                Manage product variants with different sizes, colors, and pricing
              </p>
              <div class="flex items-center gap-2">
                <UButton
                  size="sm"
                  variant="outline"
                  color="blue"
                  icon="i-heroicons-squares-plus"
                  @click="showBulkAddModal = true"
                  :disabled="isNewProduct"
                >
                  Bulk Add
                </UButton>
                <UButton
                  size="sm"
                  variant="solid"
                  color="primary"
                  icon="i-heroicons-plus"
                  @click="addVariant"
                  :disabled="isNewProduct"
                >
                  Add Single
                </UButton>
              </div>
            </div>

            <!-- Variant Filters -->
            <div v-if="existingVariants.length > 0" class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-semibold text-gray-700">Filter Variants</h4>
                <div class="flex items-center gap-2">
                  <span v-if="hasActiveFilters" class="text-xs text-gray-500">
                    Showing {{ filteredExistingVariants.length }} of {{ existingVariants.length }}
                  </span>
                  <UButton
                    v-if="hasActiveFilters"
                    size="xs"
                    variant="ghost"
                    color="gray"
                    @click="clearVariantFilters"
                  >
                    Clear Filters
                  </UButton>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Size Filter -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Sizes</label>
                  <div class="flex flex-wrap gap-2">
                    <label v-for="size in SIZE_OPTIONS" :key="size" class="flex items-center gap-1.5 cursor-pointer">
                      <input
                        v-model="variantFilters.sizes"
                        type="checkbox"
                        :value="size"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span class="text-xs text-gray-700">{{ size }}</span>
                    </label>
                  </div>
                </div>

                <!-- Color Filter -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Colors</label>
                  <div class="flex flex-wrap gap-2">
                    <label
                      v-for="color in uniqueColors"
                      :key="color"
                      class="flex items-center gap-1.5 cursor-pointer group"
                    >
                      <input
                        v-model="variantFilters.colors"
                        type="checkbox"
                        :value="color"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div
                        class="w-5 h-5 rounded border-2 border-gray-300 group-hover:border-gray-400 transition-colors"
                        :style="{ backgroundColor: color }"
                        :title="color"
                      ></div>
                    </label>
                  </div>
                </div>

                <!-- Status Filter -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="variantFilters.showInactive"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-xs text-gray-700">Show inactive variants</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Save product first message -->
            <div v-if="isNewProduct" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-yellow-600" />
                <p class="text-sm text-yellow-800">Save the product first before adding variants</p>
              </div>
            </div>

            <!-- Existing Variants -->
            <div v-if="existingVariants.length > 0" class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="selectAllVariants"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <h3 class="text-sm font-semibold text-gray-700">Existing Variants</h3>
                  </label>
                  <span v-if="selectedVariants.length > 0" class="text-xs text-gray-500">
                    ({{ selectedVariants.length }} selected)
                  </span>
                </div>
                <UButton
                  v-if="selectedVariants.length > 0"
                  size="xs"
                  variant="outline"
                  color="blue"
                  icon="i-heroicons-pencil-square"
                  @click="showBulkUpdateModal = true"
                >
                  Bulk Update ({{ selectedVariants.length }})
                </UButton>
              </div>

              <!-- No results from filters -->
              <div v-if="filteredExistingVariants.length === 0" class="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <UIcon name="i-heroicons-funnel" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 class="text-sm font-semibold text-gray-700 mb-1">No variants match your filters</h4>
                <p class="text-xs text-gray-500 mb-3">Try adjusting your filter criteria</p>
                <UButton
                  size="xs"
                  variant="outline"
                  color="gray"
                  @click="clearVariantFilters"
                >
                  Clear Filters
                </UButton>
              </div>

              <!-- Variant Cards -->
              <div
                v-for="variant in filteredExistingVariants"
                :key="variant.variant_id"
                class="border border-gray-200 rounded-lg p-5"
              >
                <!-- Read-only View -->
                <div v-if="!editingVariants[variant.variant_id]">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4">
                      <input
                        :checked="selectedVariants.includes(variant.variant_id)"
                        type="checkbox"
                        @change="toggleVariantSelection(variant.variant_id)"
                        class="rounded border-gray-300 text-primary focus:ring-primary mt-1"
                      />
                      <div
                        class="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                        :style="{ backgroundColor: variant.color }"
                      ></div>
                      <div>
                        <div class="font-bold text-gray-900 text-lg">{{ variant.size_display }}</div>
                        <div class="text-sm text-gray-500 mt-1">
                          Stock: {{ variant.stock_quantity }}
                          <span v-if="variant.max_stock_quantity"> / {{ variant.max_stock_quantity }}</span>
                           • £{{ variant.final_price }}
                          <UBadge v-if="variant.percentage_modifier && parseFloat(variant.percentage_modifier) !== 0" color="blue" variant="soft" size="xs" class="ml-2">
                            {{ parseFloat(variant.percentage_modifier) > 0 ? '+' : '' }}{{ variant.percentage_modifier }}%
                          </UBadge>
                        </div>
                        <div v-if="collapsedVariants[variant.variant_id]" class="text-xs text-gray-400 mt-1">
                          {{ (variant.images?.main || variant.images?.additional?.length) ? `${1 + (variant.images?.additional?.length || 0)} image(s)` : 'No images' }}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <UBadge v-if="editVariantDuplicates[variant.variant_id]" color="yellow" size="xs">
                        Duplicate
                      </UBadge>
                      <UBadge :color="variant.is_active ? 'green' : 'gray'" size="xs">
                        {{ variant.is_active ? 'Active' : 'Inactive' }}
                      </UBadge>
                      <UBadge :color="variant.verified ? 'blue' : 'gray'" size="xs">
                        {{ variant.verified ? 'Verified' : 'Unverified' }}
                      </UBadge>
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="gray"
                        :icon="collapsedVariants[variant.variant_id] ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
                        @click="toggleVariantCollapse(variant.variant_id)"
                      />
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="blue"
                        icon="i-heroicons-pencil"
                        @click="startEditingVariant(variant)"
                      />
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="red"
                        icon="i-heroicons-trash"
                        @click="deleteExistingVariant(variant.variant_id)"
                      />
                    </div>
                  </div>

                  <!-- Variant Images -->
                  <div v-if="!collapsedVariants[variant.variant_id]" class="mt-4 pt-4 border-t border-gray-100">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-semibold text-gray-700">Variant Images</span>
                      <UButton
                        size="xs"
                        variant="ghost"
                        icon="i-heroicons-photo"
                        @click="variantFileInputs[variant.variant_id]?.click()"
                      >
                        Upload
                      </UButton>
                      <input
                        :ref="(el) => { variantFileInputs[variant.variant_id] = el as HTMLInputElement | null }"
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        @change="(e) => handleVariantImageUpload(variant.variant_id, e)"
                      />
                    </div>
                    
                    <!-- Images Grid -->
                    <div v-if="variant.images && (variant.images.main || variant.images.additional?.length)" class="grid grid-cols-4 gap-3">
                      <!-- Main Image -->
                      <div v-if="variant.images.main" class="relative group">
                        {{ variant.images.main.alt_text }}
                        <img
                          :src="variant.images.main.url || ''"
                          :alt="variant.images.main.alt_text"
                          class="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <div class="absolute top-1 left-1">
                          <UBadge color="primary" size="xs">Main</UBadge>
                        </div>
                        <button
                          @click="removeVariantImageHandler(variant.variant_id, variant?.images?.main?.id)"
                          class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                        </button>
                      </div>
                      <!-- Additional Images -->
                      <div
                        v-for="img in variant.images.additional"
                        :key="img.id"
                        class="relative group"
                      >
                        <img
                          :src="img.url || ''"
                          :alt="img.alt_text"
                          class="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          @click="removeVariantImageHandler(variant.variant_id, img.id)"
                          class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <!-- Empty State -->
                    <div v-else class="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <UIcon name="i-heroicons-photo" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p class="text-sm text-gray-600 mb-3">No images uploaded yet</p>
                      <UButton
                        size="xs"
                        variant="outline"
                        icon="i-heroicons-arrow-up-tray"
                        @click="variantFileInputs[variant.variant_id]?.click()"
                      >
                        Upload Images
                      </UButton>
                    </div>
                  </div>
                </div>

                <!-- Edit Mode -->
                <div v-else class="space-y-4">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold text-gray-900">Edit Variant</h4>
                    <div class="flex items-center gap-2">
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="gray"
                        @click="cancelEditingVariant(variant.variant_id)"
                      >
                        Cancel
                      </UButton>
                      <UButton
                        size="xs"
                        variant="solid"
                        color="primary"
                        @click="saveExistingVariant(variant)"
                        :loading="updateVariant.isPending.value"
                        :disabled="variantEditForms[variant.variant_id] && checkVariantDuplicate(
                          variantEditForms[variant.variant_id].size,
                          variantEditForms[variant.variant_id].color,
                          existingVariants.findIndex(v => v.variant_id === variant.variant_id)
                        )"
                      >
                        Save
                      </UButton>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Size -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-2">Size *</label>
                      <select
                        v-model="variantEditForms[variant.variant_id].size"
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
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-2">Color</label>
                      <div class="flex gap-2">
                        <input
                          v-model="variantEditForms[variant.variant_id].color"
                          type="color"
                          class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          v-model="variantEditForms[variant.variant_id].color"
                          type="text"
                          placeholder="#FFFFFF"
                          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Duplicate Warning for Edit Form -->
                  <div
                    v-if="editingVariants[variant.variant_id] && variantEditForms[variant.variant_id] && 
                      checkVariantDuplicate(
                        variantEditForms[variant.variant_id].size,
                        variantEditForms[variant.variant_id].color,
                        existingVariants.findIndex(v => v.variant_id === variant.variant_id)
                      )"
                    class="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-yellow-800">Duplicate variant detected</p>
                      <p class="text-xs text-yellow-700 mt-0.5">This size and color combination already exists. Please choose a different combination.</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Stock -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-2">Stock Quantity</label>
                      <input
                        v-model.number="variantEditForms[variant.variant_id].stock_quantity"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <!-- Max Stock -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-2">Max Stock (Optional)</label>
                      <input
                        v-model.number="variantEditForms[variant.variant_id].max_stock_quantity"
                        type="number"
                        min="0"
                        placeholder="Unlimited"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <!-- Max Per Order -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-2">Max Per Order</label>
                      <input
                        v-model.number="variantEditForms[variant.variant_id].max_purchase_quantity_per_order"
                        type="number"
                        min="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <!-- Price Adjustment -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 mb-2">Price Adjustment (%)</label>
                      <input
                        v-model.number="variantEditForms[variant.variant_id].percentage_modifier"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <p class="text-xs text-gray-500 mt-1">e.g., +10 for 10% more, -5 for 5% less</p>
                    </div>

                    <!-- Final Price Preview -->
                    <div v-if="form.base_amount">
                      <label class="block text-xs font-semibold text-gray-700 mb-2">Final Price</label>
                      <div class="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-900">
                        £{{ calculateFinalPrice(form.base_amount, variantEditForms[variant.variant_id].percentage_modifier).toFixed(2) }}
                      </div>  
                    </div>
                  </div>

                  <div class="flex items-center gap-6 pt-4 border-t border-gray-200">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="variantEditForms[variant.variant_id].is_active"
                        type="checkbox"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span class="text-sm text-gray-700">Active</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="variantEditForms[variant.variant_id].verified"
                        type="checkbox"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span class="text-sm text-gray-700">Verified</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- New Variants -->
            <div v-if="newVariants.length > 0" class="space-y-4">
              <h3 class="text-sm font-semibold text-gray-700">New Variants (unsaved)</h3>
              <div
                v-for="(variant, index) in newVariants"
                :key="`new-${index}`"
                class="border border-blue-200 bg-blue-50 rounded-lg p-5 space-y-4"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Size -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Size *</label>
                    <select
                      v-model="variant.size"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
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
                  <div>
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
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                      />
                    </div>
                  </div>
                </div>

                <!-- Duplicate Warning -->
                <div
                  v-if="newVariantDuplicates[index]"
                  class="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                >
                  <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-yellow-800">Duplicate variant detected</p>
                    <p class="text-xs text-yellow-700 mt-0.5">This size and color combination already exists. Please choose a different combination.</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Stock -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      v-model.number="variant.stock_quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    />
                  </div>

                  <!-- Max Stock -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Max Stock (Optional)</label>
                    <input
                      v-model.number="variant.max_stock_quantity"
                      type="number"
                      min="0"
                      placeholder="Unlimited"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    />
                  </div>

                  <!-- Max Per Order -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Max Per Order</label>
                    <input
                      v-model.number="variant.max_purchase_quantity_per_order"
                      type="number"
                      min="1"
                      placeholder="5"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    />
                  </div>

                  <!-- Price Adjustment -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Price Adjustment (%)</label>
                    <input
                      v-model.number="variant.percentage_modifier"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    />
                    <p class="text-xs text-gray-500 mt-1">e.g., +10 for 10% more, -5 for 5% less</p>
                  </div>

                  <!-- Final Price Preview -->
                  <div v-if="form.base_amount">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Final Price</label>
                    <div class="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-900">
                      £{{ calculateFinalPrice(form.base_amount, variant.percentage_modifier).toFixed(2) }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-blue-200">
                  <div class="flex items-center gap-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="variant.is_active"
                        type="checkbox"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span class="text-sm text-gray-700">Active</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="variant.verified"
                        type="checkbox"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span class="text-sm text-gray-700">Verified</span>
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
        </div>

        <!-- Sidebar (1/3) -->
        <div class="lg:col-span-1">
          <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden sticky top-6">
            <!-- Product Preview Header -->
            <div class="p-4 bg-gray-50 border-b border-gray-200">
              <h3 class="text-sm font-bold text-gray-900 uppercase">Product Preview</h3>
            </div>

            <!-- Product Image -->
            <div class="p-4">
              <div class="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-4">
                <img
                  v-if="productImages.length > 0 && productImages[0].url"
                  :src="productImages[0].url"
                  :alt="form.title || 'Product'"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <div class="text-center">
                    <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-300 mx-auto mb-2" />
                    <p class="text-xs text-gray-400">No image</p>
                  </div>
                </div>
              </div>

              <!-- Product Title -->
              <div class="mb-4">
                <h4 class="text-lg font-bold text-gray-900 mb-1">
                  {{ form.title || 'Untitled Product' }}
                </h4>
                <p v-if="form.description" class="text-sm text-gray-600 line-clamp-2">
                  {{ form.description }}
                </p>
              </div>

              <!-- Price Summary -->
              <div class="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-gray-600">Base Price</span>
                  <span class="text-sm font-semibold text-gray-900">£{{ form.base_amount?.toFixed(2) || '0.00' }}</span>
                </div>
                <div v-if="form.percentage_modifier && form.percentage_modifier !== 0" class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-gray-600">Modifier</span>
                  <span class="text-sm font-semibold" :class="form.percentage_modifier > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ form.percentage_modifier > 0 ? '+' : '' }}{{ form.percentage_modifier }}%
                  </span>
                </div>
                <div class="pt-2 border-t border-primary/20 flex items-center justify-between">
                  <span class="text-sm font-bold text-gray-900">Final Price</span>
                  <span class="text-lg font-black text-primary">
                    £{{ calculateFinalPrice(form.base_amount || 0, form.percentage_modifier || 0).toFixed(2) }}
                  </span>
                </div>
              </div>

              <!-- Status Badges -->
              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span class="text-xs font-medium text-gray-600">Status</span>
                  <UBadge :color="form.is_active ? 'green' : 'gray'" size="xs">
                    {{ form.is_active ? 'Active' : 'Inactive' }}
                  </UBadge>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span class="text-xs font-medium text-gray-600">Verification</span>
                  <UBadge :color="form.verified ? 'blue' : 'gray'" size="xs">
                    {{ form.verified ? 'Verified' : 'Unverified' }}
                  </UBadge>
                </div>
              </div>

              <!-- Stats -->
              <div class="space-y-2 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-600">Variants</span>
                  <span class="text-sm font-semibold text-gray-900">
                    {{ existingVariants.length + newVariants.length }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-600">Images</span>
                  <span class="text-sm font-semibold text-gray-900">
                    {{ productImages.length }}
                  </span>
                </div>
                <div v-if="!isNewProduct" class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-600">Total Stock</span>
                  <span class="text-sm font-semibold text-gray-900">
                    {{ existingVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) }}
                  </span>
                </div>
              </div>

              <!-- Quick Actions -->
              <div v-if="!isNewProduct" class="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <UButton
                  block
                  size="sm"
                  variant="outline"
                  color="gray"
                  icon="i-heroicons-eye"
                  @click="activeTab = 'basic'"
                >
                  View Details
                </UButton>
                <UButton
                  block
                  size="sm"
                  variant="outline"
                  color="gray"
                  icon="i-heroicons-squares-2x2"
                  @click="activeTab = 'variants'"
                >
                  Manage Variants
                </UButton>
                <UButton
                  block
                  size="sm"
                  variant="outline"
                  color="gray"
                  icon="i-heroicons-photo"
                  @click="activeTab = 'images'"
                >
                  Upload Images
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Bottom Save Bar -->
      <div v-if="!isLoading" class="fixed bottom-0 left-64 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-deep-navy/10 shadow-2xl">
        <div class="max-w-screen-xl mx-auto flex items-center justify-between px-8 py-4">
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
              :disabled="hasNewVariantDuplicates"
              v-if="!(!hasUnsavedChanges && newVariants.length === 0)"
              @click="saveAll"
            >
              {{ isNewProduct ? 'Create Product' : 'Save Changes' }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Add Variants Modal -->
    <UModal v-model="showBulkAddModal" :ui="{ width: 'sm:max-w-2xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Bulk Add Variants</h3>
            <p class="text-sm text-gray-500 mt-1">Create multiple variants at once</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showBulkAddModal = false"
          />
        </div>

        <div class="space-y-6">
          <!-- Size Selection -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="text-sm font-semibold text-gray-700">Select Sizes *</label>
              <UButton
                size="xs"
                variant="ghost"
                color="blue"
                @click="selectAllSizes"
              >
                Select All
              </UButton>
            </div>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="size in SIZE_OPTIONS"
                :key="size"
                class="cursor-pointer"
              >
                <div
                  :class="[
                    'px-4 py-2 rounded-lg border-2 transition-all',
                    bulkAddForm.sizes.includes(size)
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  ]"
                  @click="toggleSize(size)"
                >
                  {{ size }}
                </div>
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ bulkAddForm.sizes.length }} size(s) selected</p>
          </div>

          <!-- Color Selection -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">Add Colors *</label>
            <div class="flex gap-2 mb-3">
              <input
                v-model="bulkColorInput"
                type="color"
                class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                v-model="bulkColorInput"
                type="text"
                placeholder="#FFFFFF"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                @keyup.enter="addBulkColor"
              />
              <UButton
                variant="outline"
                color="primary"
                icon="i-heroicons-plus"
                @click="addBulkColor"
              >
                Add
              </UButton>
            </div>
            <div v-if="bulkAddForm.colors.length > 0" class="flex flex-wrap gap-2">
              <div
                v-for="(color, index) in bulkAddForm.colors"
                :key="index"
                class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg group"
              >
                <div
                  class="w-6 h-6 rounded border-2 border-gray-300"
                  :style="{ backgroundColor: color }"
                ></div>
                <span class="text-sm text-gray-700 font-mono">{{ color }}</span>
                <button
                  @click="removeBulkColor(color)"
                  class="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ bulkAddForm.colors.length }} color(s) added</p>
          </div>

          <!-- Common Properties -->
          <div class="border-t border-gray-200 pt-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-4">Common Properties</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Stock Quantity</label>
                <input
                  v-model.number="bulkAddForm.stock_quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Max Stock (Optional)</label>
                <input
                  v-model.number="bulkAddForm.max_stock_quantity"
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Max Per Order</label>
                <input
                  v-model.number="bulkAddForm.max_purchase_quantity_per_order"
                  type="number"
                  min="1"
                  placeholder="5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Price Adjustment (%)</label>
                <input
                  v-model.number="bulkAddForm.percentage_modifier"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div class="flex items-center gap-6 mt-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="bulkAddForm.is_active"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-sm text-gray-700">Active</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="bulkAddForm.verified"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-sm text-gray-700">Verified</span>
              </label>
            </div>
          </div>

          <!-- Preview -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600" />
              <div>
                <p class="text-sm font-semibold text-blue-900">
                  Will create {{ bulkVariantCount }} variant{{ bulkVariantCount !== 1 ? 's' : '' }}
                </p>
                <p class="text-xs text-blue-700 mt-1">
                  {{ bulkAddForm.sizes.length }} size(s) × {{ bulkAddForm.colors.length }} color(s)
                </p>
              </div>
            </div>
          </div>

          <!-- Duplicate Warning in Bulk Add -->
          <div
            v-if="bulkAddDuplicates.length > 0"
            class="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-yellow-800">{{ bulkAddDuplicates.length }} duplicate variant{{ bulkAddDuplicates.length !== 1 ? 's' : '' }} detected</p>
              <p class="text-xs text-yellow-700 mt-1">The following combinations already exist: {{ bulkAddDuplicates.slice(0, 3).join(', ') }}{{ bulkAddDuplicates.length > 3 ? ` and ${bulkAddDuplicates.length - 3} more` : '' }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
            <UButton
              class="flex-1"
              variant="outline"
              color="gray"
              @click="showBulkAddModal = false"
            >
              Cancel
            </UButton>
            <UButton
              class="flex-1"
              variant="solid"
              color="primary"
              icon="i-heroicons-squares-plus"
              :disabled="bulkVariantCount === 0 || bulkAddDuplicates.length > 0"
              @click="generateBulkVariants"
            >
              Generate Variants
            </UButton>
          </div>
        </div>
      </div>
    </UModal>

    <!-- Bulk Update Variants Modal -->
    <UModal v-model="showBulkUpdateModal" :ui="{ width: 'sm:max-w-2xl' }">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Bulk Update Variants</h3>
            <p class="text-sm text-gray-500 mt-1">Update {{ selectedVariants.length}} selected variant{{ selectedVariants.length !== 1 ? 's' : '' }}</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showBulkUpdateModal = false"
          />
        </div>

        <div class="space-y-6">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-600" />
              <p class="text-sm text-yellow-800">
                Only checked properties will be updated. Unchecked properties will remain unchanged.
              </p>
            </div>
          </div>

          <!-- Price Adjustment -->
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <input
                v-model="bulkUpdateForm.updatePrice"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm font-semibold text-gray-700">Update Price Adjustment</span>
            </label>
            <div v-if="bulkUpdateForm.updatePrice" class="pl-7">
              <input
                v-model.number="bulkUpdateForm.percentage_modifier"
                type="number"
                step="0.1"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p class="text-xs text-gray-500 mt-1">Percentage adjustment (e.g., +10 or -5)</p>
            </div>
          </div>

          <!-- Stock Quantity -->
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <input
                v-model="bulkUpdateForm.updateStock"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm font-semibold text-gray-700">Update Stock Quantity</span>
            </label>
            <div v-if="bulkUpdateForm.updateStock" class="pl-7">
              <input
                v-model.number="bulkUpdateForm.stock_quantity"
                type="number"
                min="0"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <!-- Max Stock -->
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <input
                v-model="bulkUpdateForm.updateMaxStock"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm font-semibold text-gray-700">Update Max Stock</span>
            </label>
            <div v-if="bulkUpdateForm.updateMaxStock" class="pl-7">
              <input
                v-model.number="bulkUpdateForm.max_stock_quantity"
                type="number"
                min="0"
                placeholder="Unlimited"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <!-- Max Per Order -->
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <input
                v-model="bulkUpdateForm.updateMaxPerOrder"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm font-semibold text-gray-700">Update Max Per Order</span>
            </label>
            <div v-if="bulkUpdateForm.updateMaxPerOrder" class="pl-7">
              <input
                v-model.number="bulkUpdateForm.max_purchase_quantity_per_order"
                type="number"
                min="1"
                placeholder="5"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <!-- Active Status -->
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <input
                v-model="bulkUpdateForm.updateActive"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm font-semibold text-gray-700">Set Active Status</span>
            </label>
            <div v-if="bulkUpdateForm.updateActive" class="pl-7">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="bulkUpdateForm.is_active"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <!-- Verified Status -->
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="flex items-center gap-3 cursor-pointer mb-3">
              <input
                v-model="bulkUpdateForm.updateVerified"
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm font-semibold text-gray-700">Set Verified Status</span>
            </label>
            <div v-if="bulkUpdateForm.updateVerified" class="pl-7">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="bulkUpdateForm.verified"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-sm text-gray-700">Verified</span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-4 border-t border-gray-200">
            <UButton
              class="flex-1"
              variant="outline"
              color="gray"
              @click="showBulkUpdateModal = false"
            >
              Cancel
            </UButton>
            <UButton
              class="flex-1"
              variant="solid"
              color="primary"
              icon="i-heroicons-pencil-square"
              :loading="updateVariant.isPending.value"
              @click="applyBulkUpdate"
            >
              Update Variants
            </UButton>
          </div>
        </div>
      </div>
    </UModal>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useProduct, useCreateProduct, useUpdateProduct } from '~/composables/resources/products/products'
import { useProductVariants, useCreateProductVariant, useUpdateProductVariant, useDeleteProductVariant } from '~/composables/resources/products/productVariants'
import { useAddProductImage, useRemoveProductImage } from '~/composables/resources/products/productImages'
import { useAddVariantImage, useRemoveVariantImage } from '~/composables/resources/products/productVariantImages'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import type { ProductVariantDetail } from '~/api/types.gen'
import { resolveImageUrl, onImageError } from '~/utils/image'

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

// Size Options
const SIZE_OPTIONS = ['XS', 'SM', 'MD', 'LG', 'XL', 'OS', 'NA'] as const

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
  percentage_modifier: number
  stock_quantity: number
  max_stock_quantity: number | null
  max_purchase_quantity_per_order: number
  is_active: boolean
  verified: boolean
}

const newVariants = ref<NewVariant[]>([])

// Bulk Add Modal State
const showBulkAddModal = ref(false)
const bulkAddForm = reactive({
  sizes: [] as Array<'XS' | 'SM' | 'MD' | 'LG' | 'XL' | 'OS' | 'NA'>,
  colors: [] as string[],
  stock_quantity: 0,
  max_stock_quantity: null as number | null,
  max_purchase_quantity_per_order: 5,
  percentage_modifier: 0,
  is_active: true,
  verified: false,
})
const bulkColorInput = ref('')

// Toggle size selection
function toggleSize(size: 'XS' | 'SM' | 'MD' | 'LG' | 'XL' | 'OS' | 'NA') {
  const index = bulkAddForm.sizes.indexOf(size)
  if (index > -1) {
    bulkAddForm.sizes.splice(index, 1)
  } else {
    bulkAddForm.sizes.push(size)
  }
}

// Select all sizes
function selectAllSizes() {
  bulkAddForm.sizes = [...SIZE_OPTIONS]
}

// Add color to bulk form
function addBulkColor() {
  if (bulkColorInput.value && !bulkAddForm.colors.includes(bulkColorInput.value)) {
    bulkAddForm.colors.push(bulkColorInput.value)
    bulkColorInput.value = ''
  }
}

// Remove color from bulk form
function removeBulkColor(color: string) {
  const index = bulkAddForm.colors.indexOf(color)
  if (index > -1) {
    bulkAddForm.colors.splice(index, 1)
  }
}

// Generate bulk variants
function generateBulkVariants() {
  if (bulkAddForm.sizes.length === 0) {
    toast.add({
      title: 'Validation Error',
      description: 'Please select at least one size',
      color: 'red',
    })
    return
  }

  if (bulkAddForm.colors.length === 0) {
    toast.add({
      title: 'Validation Error',
      description: 'Please add at least one color',
      color: 'red',
    })
    return
  }

  // Check for duplicates before generating
  const duplicates: string[] = []
  for (const size of bulkAddForm.sizes) {
    for (const color of bulkAddForm.colors) {
      if (checkVariantDuplicate(size, color)) {
        duplicates.push(`${size} - ${color}`)
      }
    }
  }

  if (duplicates.length > 0) {
    toast.add({
      title: 'Duplicate Variants Detected',
      description: `The following size+color combinations already exist: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? ` and ${duplicates.length - 3} more` : ''}. Each variant must have a unique size and color combination.`,
      color: 'red',
      timeout: 8000,
    })
    return
  }

  // Generate cartesian product of sizes × colors
  const generated: NewVariant[] = []
  for (const size of bulkAddForm.sizes) {
    for (const color of bulkAddForm.colors) {
      generated.push({
        size,
        color,
        percentage_modifier: bulkAddForm.percentage_modifier,
        stock_quantity: bulkAddForm.stock_quantity,
        max_stock_quantity: bulkAddForm.max_stock_quantity,
        max_purchase_quantity_per_order: bulkAddForm.max_purchase_quantity_per_order,
        is_active: bulkAddForm.is_active,
        verified: bulkAddForm.verified,
      })
    }
  }

  newVariants.value.push(...generated)

  toast.add({
    title: 'Success',
    description: `Generated ${generated.length} variants ready to save`,
    color: 'green',
  })

  // Reset form and close modal
  bulkAddForm.sizes = []
  bulkAddForm.colors = []
  bulkAddForm.stock_quantity = 0
  bulkAddForm.max_stock_quantity = null
  bulkAddForm.max_purchase_quantity_per_order = 5
  bulkAddForm.percentage_modifier = 0
  bulkAddForm.is_active = true
  bulkAddForm.verified = false
  showBulkAddModal.value = false
}

// Count of variants that will be generated
const bulkVariantCount = computed(() => {
  return bulkAddForm.sizes.length * bulkAddForm.colors.length
})

// Check for duplicates in bulk add modal
const bulkAddDuplicates = computed(() => {
  const duplicates: string[] = []
  for (const size of bulkAddForm.sizes) {
    for (const color of bulkAddForm.colors) {
      if (checkVariantDuplicate(size, color)) {
        duplicates.push(`${size} - ${color}`)
      }
    }
  }
  return duplicates
})

// Check if any new variants have duplicates
const hasNewVariantDuplicates = computed(() => {
  return newVariantDuplicates.value.some(isDuplicate => isDuplicate)
})

// Bulk Update State
const selectedVariants = ref<string[]>([])
const showBulkUpdateModal = ref(false)
const bulkUpdateForm = reactive({
  updatePrice: false,
  percentage_modifier: 0,
  updateStock: false,
  stock_quantity: 0,
  updateMaxStock: false,
  max_stock_quantity: null as number | null,
  updateMaxPerOrder: false,
  max_purchase_quantity_per_order: 5,
  updateActive: false,
  is_active: true,
  updateVerified: false,
  verified: false,
})

// Toggle variant selection
function toggleVariantSelection(variantId: string) {
  const index = selectedVariants.value.indexOf(variantId)
  if (index > -1) {
    selectedVariants.value.splice(index, 1)
  } else {
    selectedVariants.value.push(variantId)
  }
}

// Select all filtered variants
const selectAllVariants = computed({
  get: () => {
    return filteredExistingVariants.value.length > 0 && 
           filteredExistingVariants.value.every(v => selectedVariants.value.includes(v.variant_id))
  },
  set: (value: boolean) => {
    if (value) {
      // Select all filtered variants
      selectedVariants.value = filteredExistingVariants.value.map(v => v.variant_id)
    } else {
      // Deselect all
      selectedVariants.value = []
    }
  }
})

// Apply bulk update
async function applyBulkUpdate() {
  if (selectedVariants.value.length === 0) {
    toast.add({
      title: 'No Selection',
      description: 'Please select at least one variant to update',
      color: 'yellow',
    })
    return
  }

  const hasUpdates = bulkUpdateForm.updatePrice || bulkUpdateForm.updateStock || 
                     bulkUpdateForm.updateMaxStock || bulkUpdateForm.updateMaxPerOrder ||
                     bulkUpdateForm.updateActive || bulkUpdateForm.updateVerified

  if (!hasUpdates) {
    toast.add({
      title: 'No Updates',
      description: 'Please enable at least one property to update',
      color: 'yellow',
    })
    return
  }

  let successCount = 0
  let errorCount = 0

  for (const variantId of selectedVariants.value) {
    const variant = existingVariants.value.find(v => v.variant_id === variantId)
    if (!variant) continue

    try {
      // Build update body with only enabled fields
      const body: any = {
        product: variant.product,
        size: variant.size,
        color: variant.color,
      }

      if (bulkUpdateForm.updatePrice) {
        body.percentage_modifier = bulkUpdateForm.percentage_modifier.toString()
      } else {
        body.percentage_modifier = variant.percentage_modifier
      }

      if (bulkUpdateForm.updateStock) {
        body.stock_quantity = bulkUpdateForm.stock_quantity
      } else {
        body.stock_quantity = variant.stock_quantity
      }

      if (bulkUpdateForm.updateMaxStock) {
        body.max_stock_quantity = bulkUpdateForm.max_stock_quantity
      } else {
        body.max_stock_quantity = variant.max_stock_quantity
      }

      if (bulkUpdateForm.updateMaxPerOrder) {
        body.max_purchase_quantity_per_order = bulkUpdateForm.max_purchase_quantity_per_order
      } else {
        body.max_purchase_quantity_per_order = variant.max_purchase_quantity_per_order
      }

      if (bulkUpdateForm.updateActive) {
        body.is_active = bulkUpdateForm.is_active
      } else {
        body.is_active = variant.is_active
      }

      if (bulkUpdateForm.updateVerified) {
        body.verified = bulkUpdateForm.verified
      } else {
        body.verified = variant.verified
      }

      await updateVariant.mutateAsync({
        productId: productId.value,
        variantId: variantId,
        body,
      })

      successCount++
    } catch (err: any) {
      errorCount++
      console.error(`Failed to update variant ${variantId}:`, err)
    }
  }

  if (errorCount > 0) {
    toast.add({
      title: 'Partial Success',
      description: `Updated ${successCount} variant(s), ${errorCount} failed`,
      color: 'yellow',
    })
  } else {
    toast.add({
      title: 'Success',
      description: `Updated ${successCount} variant(s) successfully`,
      color: 'green',
    })
  }

  // Reset and close
  selectedVariants.value = []
  bulkUpdateForm.updatePrice = false
  bulkUpdateForm.updateStock = false
  bulkUpdateForm.updateMaxStock = false
  bulkUpdateForm.updateMaxPerOrder = false
  bulkUpdateForm.updateActive = false
  bulkUpdateForm.updateVerified = false
  showBulkUpdateModal.value = false
  refetchVariants()
}

// Existing Variants
const existingVariants = computed(() => {
  const results = (variantsData.value?.data as any)?.results
  return (results as ProductVariantDetail[]) || []
})

// Variant Filters
const variantFilters = ref({
  sizes: [] as string[],
  colors: [] as string[],
  showInactive: false,
})

// Unique colors from variants (for filter display)
const uniqueColors = computed(() => {
  const colors = new Set<string>()
  existingVariants.value.forEach(v => {
    if (v.color) colors.add(v.color)
  })
  return Array.from(colors)
})

// Filtered Variants
const filteredExistingVariants = computed(() => {
  let filtered = existingVariants.value

  // Filter by sizes
  if (variantFilters.value.sizes.length > 0) {
    filtered = filtered.filter(v => v.size && variantFilters.value.sizes.includes(v.size))
  }

  // Filter by colors
  if (variantFilters.value.colors.length > 0) {
    filtered = filtered.filter(v => v.color && variantFilters.value.colors.includes(v.color))
  }

  // Filter by active status
  if (!variantFilters.value.showInactive) {
    filtered = filtered.filter(v => v.is_active)
  }

  return filtered
})

// Clear all filters
function clearVariantFilters() {
  variantFilters.value.sizes = []
  variantFilters.value.colors = []
  variantFilters.value.showInactive = false
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return variantFilters.value.sizes.length > 0 || 
         variantFilters.value.colors.length > 0 || 
         variantFilters.value.showInactive
})

// Computed properties to check for duplicate variants
const newVariantDuplicates = computed(() => {
  return newVariants.value.map((variant, index) => {
    return checkVariantDuplicate(variant.size, variant.color, index)
  })
})

const editVariantDuplicates = computed(() => {
  const duplicates: Record<string, boolean> = {}
  existingVariants.value.forEach(variant => {
    // Check if this variant's size+color combination exists elsewhere
    const normalizedColor = variant.color?.trim().toUpperCase() || ''
    const isDuplicate = existingVariants.value.some(otherVariant => {
      if (otherVariant.variant_id === variant.variant_id) return false // Exclude self
      return otherVariant.size === variant.size && 
             otherVariant.color?.trim().toUpperCase() === normalizedColor
    })
    duplicates[variant.variant_id] = isDuplicate
  })
  return duplicates
})

// Editing state for existing variants
const editingVariants = ref<Record<string, boolean>>({})
const variantEditForms = ref<Record<string, any>>({})
const variantFileInputs = ref<Record<string, HTMLInputElement | null>>({})
const collapsedVariants = ref<Record<string, boolean>>({})

// Set all variants to collapsed by default when they load
watch(() => existingVariants.value, (variants) => {
  variants.forEach(variant => {
    if (!(variant.variant_id in collapsedVariants.value)) {
      collapsedVariants.value[variant.variant_id] = true
    }
  })
}, { immediate: true })

// Toggle variant collapse
function toggleVariantCollapse(variantId: string) {
  collapsedVariants.value[variantId] = !collapsedVariants.value[variantId]
}

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
const updateVariant = useUpdateProductVariant()
const deleteVariant = useDeleteProductVariant()
const addImage = useAddProductImage()
const removeImageMutation = useRemoveProductImage()
const addVariantImageMutation = useAddVariantImage()
const removeVariantImageMutation = useRemoveVariantImage()

const isSaving = computed(() => 
  createProduct.isPending.value || 
  updateProduct.isPending.value ||
  createVariant.isPending.value ||
  updateVariant.isPending.value
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
// Helper function to check for duplicate size+color combinations
function checkVariantDuplicate(size: string, color: string, excludeIndex?: number): boolean {
  // Normalize colors for comparison (case-insensitive, trim whitespace)
  const normalizedColor = color.trim().toUpperCase()
  
  // Check in existing variants
  const existsInExisting = existingVariants.value.some(
    v => v.size === size && v.color?.trim().toUpperCase() === normalizedColor
  )
  
  if (existsInExisting) return true
  
  // Check in new unsaved variants
  const existsInNew = newVariants.value.some((v, index) => {
    if (excludeIndex !== undefined && index === excludeIndex) return false
    return v.size === size && v.color.trim().toUpperCase() === normalizedColor
  })
  
  return existsInNew
}

function addVariant() {
  newVariants.value.push({
    size: 'MD',
    color: '#FFFFFF',
    percentage_modifier: 0,
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

// Edit existing variant
function startEditingVariant(variant: ProductVariantDetail) {
  editingVariants.value[variant.variant_id] = true
  variantEditForms.value[variant.variant_id] = {
    size: variant.size,
    color: variant.color,
    percentage_modifier: parseFloat(variant.percentage_modifier || '0'),
    stock_quantity: variant.stock_quantity,
    max_stock_quantity: variant.max_stock_quantity,
    max_purchase_quantity_per_order: variant.max_purchase_quantity_per_order,
    is_active: variant.is_active,
    verified: variant.verified,
  }
}

function cancelEditingVariant(variantId: string) {
  delete editingVariants.value[variantId]
  delete variantEditForms.value[variantId]
}

async function saveExistingVariant(variant: ProductVariantDetail) {
  const editForm = variantEditForms.value[variant.variant_id]
  if (!editForm) return

  // Check if the new size+color combination already exists (excluding current variant)
  const normalizedColor = editForm.color.trim().toUpperCase()
  const isDuplicate = existingVariants.value.some(
    v => v.variant_id !== variant.variant_id && 
         v.size === editForm.size && 
         v.color?.trim().toUpperCase() === normalizedColor
  )
  
  if (isDuplicate) {
    toast.add({
      title: 'Duplicate Variant',
      description: `A variant with size '${editForm.size}' and color '${editForm.color}' already exists. Each variant must have a unique size and color combination.`,
      color: 'red',
      timeout: 6000,
    })
    return
  }

  try {
    await updateVariant.mutateAsync({
      productId: productId.value,
      variantId: variant.variant_id,
      body: {
        product: variant.product,
        size: editForm.size,
        color: editForm.color,
        percentage_modifier: editForm.percentage_modifier.toString(),
        stock_quantity: editForm.stock_quantity,
        max_stock_quantity: editForm.max_stock_quantity,
        max_purchase_quantity_per_order: editForm.max_purchase_quantity_per_order,
        is_active: editForm.is_active,
        verified: editForm.verified,
      },
    })

    toast.add({
      title: 'Success',
      description: 'Variant updated successfully',
      color: 'green',
    })

    cancelEditingVariant(variant.variant_id)
    refetchVariants()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to update variant',
      color: 'red',
    })
  }
}

// Variant Image Upload
async function handleVariantImageUpload(variantId: string, event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  // Find the variant to check if it has a main image
  const variant = existingVariants.value.find(v => v.variant_id === variantId)
  const hasMainImage = variant?.images?.main !== null && variant?.images?.main !== undefined

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

      // First uploaded image becomes main only if variant has no main image
      await addVariantImageMutation.mutateAsync({
        productId: productId.value,
        variantId: variantId,
        image: file,
        isMain: !hasMainImage && i === 0,
      })
    }

    toast.add({
      title: 'Success',
      description: `${files.length} image${files.length !== 1 ? 's' : ''} uploaded successfully`,
      color: 'green',
    })

    // Clear the input
    if (target) target.value = ''
    refetchVariants()
  } catch (err: any) {
    toast.add({
      title: 'Upload Error',
      description: err.message || 'Failed to upload images',
      color: 'red',
    })
  }
}

async function removeVariantImageHandler(variantId: string, imageId: number | undefined) {
  if (!imageId) return

  try {
    await removeVariantImageMutation.mutateAsync({
      productId: productId.value,
      variantId: variantId,
      resourceId: imageId,
    })

    toast.add({
      title: 'Success',
      description: 'Image removed successfully',
      color: 'green',
    })

    refetchVariants()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to remove image',
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

  // Final validation check for duplicates
  const seen = new Set<string>()
  const duplicates: string[] = []
  
  for (const variant of newVariants.value) {
    const key = `${variant.size}-${variant.color.trim().toUpperCase()}`
    
    // Check against existing variants
    if (checkVariantDuplicate(variant.size, variant.color)) {
      duplicates.push(`${variant.size} - ${variant.color}`)
      continue
    }
    
    // Check for duplicates within new variants
    if (seen.has(key)) {
      duplicates.push(`${variant.size} - ${variant.color}`)
    } else {
      seen.add(key)
    }
  }
  
  if (duplicates.length > 0) {
    toast.add({
      title: 'Duplicate Variants',
      description: `Cannot save: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? ` and ${duplicates.length - 3} more duplicates` : ''} already exist. Please remove duplicates before saving.`,
      color: 'red',
      timeout: 8000,
    })
    return
  }

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
          percentage_modifier: variant.percentage_modifier.toString(),
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
