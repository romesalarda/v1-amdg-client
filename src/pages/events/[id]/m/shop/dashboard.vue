<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 gap-6" :class="showFilters ? 'lg:grid-cols-12' : 'lg:grid-cols-1'">
      <!-- Main Content -->
      <div :class="showFilters ? 'lg:col-span-9' : 'lg:col-span-12'" class="space-y-6">
        
        <!-- Tab Navigation -->
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                @click="currentTab = tab.value"
                :class="[
                  'flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors',
                  currentTab === tab.value
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                ]"
              >
                <UIcon :name="tab.icon" class="w-5 h-5" />
                {{ tab.label }}
                <UBadge v-if="tab.badge" color="gray" variant="soft" size="xs">{{ tab.badge }}</UBadge>
              </button>
            </nav>
          </div>

          <!-- Products Tab -->
          <template v-if="currentTab === 'products'">
            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50">
              <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-cube" class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div class="text-2xl font-black text-deep-navy">{{ totalProducts }}</div>
                    <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Products</div>
                  </div>
                </div>
              </div>

              <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div class="text-2xl font-black text-deep-navy">{{ activeProductsCount }}</div>
                    <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Active Products</div>
                  </div>
                </div>
              </div>

              <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div class="text-2xl font-black text-deep-navy">{{ lowStockCount }}</div>
                    <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Low Stock</div>
                  </div>
                </div>
              </div>

              <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-currency-pound" class="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div class="text-2xl font-black text-deep-navy">{{ formatCurrency(totalRevenue) }}</div>
                    <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-cube" class="w-5 h-5 text-primary" />
                <div>
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">Products</h2>
                  <p class="text-xs text-gray-500">Showing {{ products.length }} of {{ totalProducts }} products</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <UButton
                  size="sm"
                  variant="ghost"
                  color="gray"
                  :icon="showFilters ? 'i-heroicons-chevron-right' : 'i-heroicons-funnel'"
                  @click="showFilters = !showFilters"
                  class="hidden lg:flex"
                >
                  {{ showFilters ? 'Hide' : 'Show' }} Filters
                </UButton>
                <UButton
                  size="sm"
                  variant="outline"
                  color="gray"
                  icon="i-heroicons-arrow-down-tray"
                  @click="exportProductsToCSV"
                >
                  Export CSV
                </UButton>
                <UButton
                  size="sm"
                  variant="outline"
                  color="gray"
                  icon="i-heroicons-shopping-cart"
                  @click="navigateTo(`/events/${id}/m/shop/orders`)"
                  title="View orders"
                >
                  Orders
                </UButton>
                <UButton
                  size="sm"
                  variant="solid"
                  color="primary"
                  icon="i-heroicons-plus"
                  @click="navigateTo(`/events/${id}/m/shop/products/new/editor`)"
                >
                  Add Product
                </UButton>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <div class="relative">
                    <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search by product name, ID, or category..."
                      class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                
                <div v-if="activeFilterCount > 0" class="flex items-center gap-2">
                  <UBadge color="primary" variant="soft">
                    {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active
                  </UBadge>
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="gray"
                    @click="clearAllFilters"
                  >
                    Clear all
                  </UButton>
                </div>
                
                <UButton
                  size="sm"
                  variant="outline"
                  color="gray"
                  icon="i-heroicons-funnel"
                  @click="showFilters = !showFilters"
                  class="lg:hidden"
                >
                  Filters
                </UButton>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="p-6 space-y-3">
              <div v-for="i in 10" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            
            <!-- Empty State -->
            <div v-else-if="products.length === 0" class="p-12 text-center">
              <UIcon name="i-heroicons-cube" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p class="text-sm text-gray-500 mb-4">
                {{ searchQuery || activeFilterCount > 0 
                  ? 'Try adjusting your filters or search query' 
                  : 'No products have been created for this event yet' 
                }}
              </p>
              <UButton
                v-if="searchQuery || activeFilterCount > 0"
                variant="soft"
                color="gray"
                @click="clearAllFilters"
              >
                Clear filters
              </UButton>
              <UButton
                v-else
                color="primary"
                @click="navigateTo(`/events/${id}/m/shop/products/new/editor`)"
              >
                Create First Product
              </UButton>
            </div>

            <!-- Products Table -->
            <div v-else class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="py-3 px-4">
                      <input
                        v-model="selectAll"
                        type="checkbox"
                        @change="toggleSelectAll"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Image</th>
                    <th 
                      class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      @click="setSorting('title')"
                    >
                      <div class="flex items-center gap-1">
                        Product
                        <UIcon 
                          v-if="currentSort === 'title'" 
                          :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                          class="w-4 h-4"
                        />
                      </div>
                    </th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Categories</th>
                    <th 
                      class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      @click="setSorting('final_price')"
                    >
                      <div class="flex items-center gap-1">
                        Price
                        <UIcon 
                          v-if="currentSort === 'final_price'" 
                          :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                          class="w-4 h-4"
                        />
                      </div>
                    </th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Variants</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="product in products"
                    :key="product.product_id"
                    class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td class="py-3 px-4">
                      <input
                        v-model="selectedProducts"
                        type="checkbox"
                        :value="product.product_id"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td class="py-3 px-4">
                      <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          v-if="product.main_image?.url"
                          :src="product.main_image.url"
                          :alt="product.title"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center">
                          <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <div>
                        <div class="font-semibold text-gray-900">{{ product.title }}</div>
                        <div class="text-xs text-gray-500 font-mono">{{ product.display_code }}</div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex flex-wrap gap-1">
                        <UBadge 
                          v-for="(category, idx) in product.categories.slice(0, 2)" 
                          :key="idx"
                          color="blue" 
                          variant="soft" 
                          size="xs"
                        >
                          {{ category }}
                        </UBadge>
                        <UBadge 
                          v-if="product.categories.length > 2"
                          color="gray" 
                          variant="soft" 
                          size="xs"
                        >
                          +{{ product.categories.length - 2 }}
                        </UBadge>
                      </div>
                    </td>
                    <td class="py-3 px-4 font-semibold text-gray-900">
                      {{ product.final_price }}
                      <span v-if="product.percentage_modifier && parseFloat(product.percentage_modifier) !== 0" class="text-xs text-gray-500">
                        ({{ parseFloat(product.percentage_modifier) > 0 ? '+' : '' }}{{ product.percentage_modifier }}%)
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <UBadge color="gray" variant="soft" size="xs">
                        {{ product.variant_count }} variant{{ product.variant_count !== 1 ? 's' : '' }}
                      </UBadge>
                    </td>
                    <td class="py-3 px-4">
                      <UBadge 
                        :color="getStockStatusColor(getProductStockStatus(product)) as any"
                        variant="soft"
                        size="xs"
                      >
                        {{ getStockStatusLabel(getProductStockStatus(product)) }}
                      </UBadge>
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex gap-1">
                        <UBadge 
                          :color="getPublicationStatusColor(getPublicationStatus(product.verified ?? false, product.is_active ?? false)) as any"
                          variant="soft"
                          size="xs"
                        >
                          {{ getPublicationStatusLabel(getPublicationStatus(product.verified ?? false, product.is_active ?? false)) }}
                        </UBadge>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex items-center justify-end gap-1">
                        <UButton
                          size="xs"
                          variant="ghost"
                          color="gray"
                          icon="i-heroicons-eye"
                          @click="viewProductDetails(product)"
                          title="Quick view"
                        />
                        <UButton
                          size="xs"
                          variant="ghost"
                          color="gray"
                          icon="i-heroicons-pencil"
                          @click="navigateTo(`/events/${id}/m/shop/products/${product.product_id}/editor`)"
                          title="Edit product"
                        />
                        <UButton
                          size="xs"
                          variant="ghost"
                          color="red"
                          icon="i-heroicons-trash"
                          @click="deleteProduct(product)"
                          title="Delete product"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="!isLoading && products.length > 0" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <select
                  v-model="pageSize"
                  class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="10">10 per page</option>
                  <option :value="25">25 per page</option>
                  <option :value="50">50 per page</option>
                  <option :value="100">100 per page</option>
                </select>
                <span class="text-xs text-gray-500">
                  Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalProducts) }} of {{ totalProducts }}
                </span>
              </div>

              <UPagination
                v-model="currentPage"
                :page-count="pageSize"
                :total="totalProducts"
                :max="7"
              />
            </div>
          </template>

          <!-- Discounts Tab -->
          <template v-else-if="currentTab === 'discounts'">
            <div class="p-6">
              <p class="text-gray-500 text-center py-12">Discounts management will be implemented here</p>
            </div>
          </template>

          <!-- Categories Tab -->
          <template v-else-if="currentTab === 'categories'">
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

            <!-- Categories Loading State -->
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

          <!-- Category Mapping Tab -->
          <template v-else-if="currentTab === 'category-mapping'">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-primary" />
                <div>
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">Category Mapping</h2>
                  <p class="text-xs text-gray-500">Assign one category to multiple products in one action</p>
                </div>
              </div>

              <div class="w-full md:w-auto min-w-[260px]">
                <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Target Category</label>
                <select
                  v-model.number="categoryMappingSelectedCategoryId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="null">Select a category...</option>
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Controls -->
            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3 flex-wrap">
              <div class="relative flex-1 min-w-[260px]">
                <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  v-model="categoryMappingSearchQuery"
                  type="text"
                  placeholder="Search products by title, display code, or category..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <UBadge color="gray" variant="soft">
                {{ categoryMappingSelectedProductIds.length }} selected
              </UBadge>

              <UButton
                size="sm"
                variant="ghost"
                color="gray"
                @click="clearCategoryMappingSelection"
                :disabled="categoryMappingSelectedProductIds.length === 0"
              >
                Clear Selection
              </UButton>

              <UButton
                size="sm"
                variant="solid"
                color="primary"
                icon="i-heroicons-link"
                :loading="bulkAssignCategoryMutation.isPending.value"
                :disabled="!categoryMappingSelectedCategoryId || categoryMappingSelectedProductIds.length === 0"
                @click="assignCategoryToSelectedProducts"
              >
                Assign Category
              </UButton>

              <UButton
                size="sm"
                variant="outline"
                color="red"
                icon="i-heroicons-link-slash"
                :loading="bulkRemoveCategoryMutation.isPending.value"
                :disabled="!categoryMappingSelectedCategoryId || categoryMappingSelectedProductIds.length === 0"
                @click="removeCategoryFromSelectedProducts"
              >
                Remove Category
              </UButton>
            </div>

            <!-- Loading -->
            <div v-if="categoryMappingProductsLoading" class="p-6 space-y-3">
              <div v-for="i in 8" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            <!-- Empty -->
            <div v-else-if="categoryMappingProducts.length === 0" class="p-12 text-center">
              <UIcon name="i-heroicons-cube" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p class="text-sm text-gray-500">Try a different search query or add products first.</p>
            </div>

            <!-- Product Mapping Table -->
            <div v-else class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="py-3 px-4">
                      <input
                        v-model="allCategoryMappingProductsSelected"
                        type="checkbox"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Current Categories</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Mapping Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="product in categoryMappingProducts"
                    :key="product.product_id"
                    class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td class="py-3 px-4">
                      <input
                        v-model="categoryMappingSelectedProductIds"
                        type="checkbox"
                        :value="product.product_id"
                        class="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td class="py-3 px-4">
                      <div>
                        <div class="font-semibold text-gray-900">{{ product.title }}</div>
                        <div class="text-xs text-gray-500 font-mono">{{ product.display_code }}</div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <div v-if="product.categories.length" class="flex flex-wrap gap-1">
                        <UBadge
                          v-for="(categoryName, index) in product.categories"
                          :key="`${product.product_id}-${index}`"
                          color="gray"
                          variant="soft"
                          size="xs"
                        >
                          {{ categoryName }}
                        </UBadge>
                      </div>
                      <p v-else class="text-xs text-gray-400 italic">No categories</p>
                    </td>
                    <td class="py-3 px-4">
                      <UBadge
                        v-if="isCategoryAssignedToProduct(product)"
                        color="green"
                        variant="soft"
                        size="xs"
                      >
                        Already Assigned
                      </UBadge>
                      <span v-else class="text-xs text-gray-500">Not assigned</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- Package Products Tab -->
          <template v-else-if="currentTab === 'package-products'">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-link" class="w-5 h-5 text-primary" />
                <div>
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">Package Products</h2>
                  <p class="text-xs text-gray-500">Link products to registration packages with quantity and pricing modifier</p>
                </div>
              </div>

              <div class="w-full md:w-auto min-w-[260px]">
                <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Booking Package</label>
                <select
                  v-model.number="selectedPackageId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="null">Select a booking package...</option>
                  <option v-for="pkg in bookingPackages" :key="pkg.id" :value="pkg.id">
                    {{ pkg.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 space-y-3">
              <p class="text-xs text-gray-600">
                Use a negative percentage modifier to discount bundled products. A modifier of -100 makes the linked product free within the package.
              </p>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Event Product</label>
                  <select
                    v-model.number="packageProductForm.productId"
                    :disabled="!selectedPackageId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
                  >
                    <option :value="null">Select product...</option>
                    <option v-for="product in availableProductsForLinking" :key="product.id" :value="product.id">
                      {{ product.title }} ({{ product.display_code }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Quantity / Attendee</label>
                  <input
                    v-model.number="packageProductForm.quantityPerAttendee"
                    type="number"
                    min="1"
                    :disabled="!selectedPackageId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Modifier (%)</label>
                  <input
                    v-model="packageProductForm.percentageModifier"
                    type="number"
                    step="0.01"
                    min="-100"
                    max="100"
                    :disabled="!selectedPackageId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div class="flex items-center justify-end gap-2">
                <UButton
                  size="sm"
                  variant="ghost"
                  color="gray"
                  @click="resetPackageProductForm"
                  :disabled="!selectedPackageId"
                >
                  Reset
                </UButton>
                <UButton
                  size="sm"
                  color="primary"
                  icon="i-heroicons-plus"
                  :loading="createPackageProductMutation.isPending.value"
                  :disabled="!selectedPackageId"
                  @click="createPackageProductLink"
                >
                  Link Product
                </UButton>
              </div>
            </div>

            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div class="relative flex-1 max-w-md">
                <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  v-model="packageProductsSearchQuery"
                  type="text"
                  placeholder="Search linked products..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <UBadge color="gray" variant="soft">
                {{ filteredPackageProducts.length }} linked
              </UBadge>
            </div>

            <div v-if="bookingPackagesLoading || packageProductsLoading" class="p-6 space-y-3">
              <div v-for="i in 6" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            <div v-else-if="!selectedPackageId" class="p-12 text-center">
              <UIcon name="i-heroicons-link" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Select a package first</h3>
              <p class="text-sm text-gray-500">Choose a booking package to view and manage linked products.</p>
            </div>

            <div v-else-if="filteredPackageProducts.length === 0" class="p-12 text-center">
              <UIcon name="i-heroicons-cube-transparent" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No linked products</h3>
              <p class="text-sm text-gray-500">Use the form above to link products to this package.</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Quantity / Attendee</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Base</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Modifier</th>
                    <th class="py-3 px-4 font-semibold text-gray-700">Modified</th>
                    <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in filteredPackageProducts"
                    :key="row.id"
                    class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td class="py-3 px-4">
                      <div>
                        <div class="font-semibold text-gray-900">{{ row.product_title }}</div>
                        <div class="text-xs text-gray-500 font-mono">{{ row.product_display_code }}</div>
                      </div>
                    </td>

                    <td class="py-3 px-4">
                      <template v-if="editingPackageProductId === row.id">
                        <input
                          v-model.number="editingPackageProduct.quantityPerAttendee"
                          type="number"
                          min="1"
                          class="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </template>
                      <template v-else>
                        {{ row.quantity_per_attendee }}
                      </template>
                    </td>

                    <td class="py-3 px-4 font-semibold text-gray-900">{{ row.base_amount }}</td>

                    <td class="py-3 px-4">
                      <template v-if="editingPackageProductId === row.id">
                        <input
                          v-model="editingPackageProduct.percentageModifier"
                          type="number"
                          step="0.01"
                          min="-100"
                          max="100"
                          class="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </template>
                      <template v-else>
                        <UBadge :color="Number(row.percentage_modifier) < 0 ? 'green' : 'gray'" variant="soft" size="xs">
                          {{ formatModifier(row.percentage_modifier ?? '0') }}
                        </UBadge>
                      </template>
                    </td>

                    <td class="py-3 px-4 font-semibold text-gray-900">{{ row.modified_amount }}</td>

                    <td class="py-3 px-4">
                      <div class="flex items-center justify-end gap-1">
                        <template v-if="editingPackageProductId === row.id">
                          <UButton
                            size="xs"
                            color="primary"
                            icon="i-heroicons-check"
                            :loading="updatePackageProductMutation.isPending.value"
                            @click="savePackageProductEdit(row.id)"
                          />
                          <UButton
                            size="xs"
                            variant="ghost"
                            color="gray"
                            icon="i-heroicons-x-mark"
                            @click="cancelPackageProductEdit"
                          />
                        </template>
                        <template v-else>
                          <UButton
                            size="xs"
                            variant="ghost"
                            color="gray"
                            icon="i-heroicons-pencil"
                            @click="startPackageProductEdit(row)"
                          />
                          <UButton
                            size="xs"
                            variant="ghost"
                            color="red"
                            icon="i-heroicons-trash"
                            :loading="deletePackageProductMutation.isPending.value"
                            @click="deletePackageProductLink(row.id)"
                          />
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- Stock Alerts Tab -->
          <template v-else-if="currentTab === 'stock'">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-bell" class="w-5 h-5 text-primary" />
                <div>
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">Stock Alerts</h2>
                  <p class="text-xs text-gray-500">Products with low stock levels requiring attention</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <select
                  v-model="stockAlertThreshold"
                  class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="10">10% or less</option>
                  <option :value="20">20% or less</option>
                  <option :value="30">30% or less</option>
                  <option :value="50">50% or less</option>
                </select>
              </div>
            </div>

            <!-- Stock Alerts Loading State -->
            <div v-if="isLoading" class="p-6 space-y-3">
              <USkeleton class="h-20 w-full" v-for="i in 5" :key="i" />
            </div>

            <!-- Stock Alerts List -->
            <div v-else-if="lowStockProducts.length > 0" class="divide-y divide-gray-100">
              <div
                v-for="product in lowStockProducts"
                :key="product.product_id"
                class="p-6 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start justify-between gap-4">
                  <!-- Product Info -->
                  <div class="flex items-start gap-4 flex-1">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <div class="w-full h-full flex items-center justify-center">
                        <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-semibold text-gray-900">{{ product.title }}</h4>
                        <UBadge
                          :color="getStockAlertColor(product)"
                          size="xs"
                        >
                          {{ getStockAlertLabel(product) }}
                        </UBadge>
                      </div>
                      
                      <div class="text-sm text-gray-600 space-y-1">
                        <p>
                          <span class="font-medium">Variants:</span>
                          {{ product.variant_count }} variant{{ product.variant_count !== 1 ? 's' : '' }}
                        </p>
                        <p class="text-xs text-gray-500">
                          Click "Restock" to manage variant inventories
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2">
                    <UButton
                      size="sm"
                      variant="outline"
                      color="primary"
                      icon="i-heroicons-arrow-path"
                      @click="navigateTo(`/events/${id}/m/shop/products/${product.product_id}/editor?tab=variants`)"
                    >
                      Restock
                    </UButton>
                    <UButton
                      size="sm"
                      variant="ghost"
                      color="gray"  
                      icon="i-heroicons-eye"
                      @click="navigateTo(`/events/${id}/m/shop/products/${product.product_id}/editor`)"
                      title="View product"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-12 text-center">
              <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">All stocked up!</h3>
              <p class="text-sm text-gray-500">No products are below the {{ stockAlertThreshold }}% stock threshold</p>
            </div>
          </template>

          <!-- Statistics Tab -->
          <template v-else-if="currentTab === 'statistics'">
            <StatisticsIndex />
          </template>
        </div>
      </div>

      <!-- Filters Sidebar -->
      <div v-if="showFilters && currentTab === 'products'" class="lg:col-span-3 space-y-4">
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn p-6 sticky top-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm font-black text-deep-navy uppercase tracking-widest">Filters</h3>
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              @click="clearAllFilters"
            >
              Clear all
            </UButton>
          </div>

          <div class="space-y-6">
            <!-- Status Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Status</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    v-model="filters.verified"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Verified only</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    v-model="filters.active"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Active only</span>
                </label>
              </div>
            </div>

            <!-- Stock Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Stock Status</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2">
                  <input
                    v-model="filters.inStock"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">In Stock</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    v-model="filters.lowStock"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Low Stock</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    v-model="filters.outOfStock"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">Out of Stock</span>
                </label>
              </div>
            </div>

            <!-- Price Range Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Price Range</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="filters.minPrice"
                  type="number"
                  placeholder="Min"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  placeholder="Max"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <!-- Category Filter -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Categories</label>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <!-- Categories will be populated dynamically -->
                <p class="text-xs text-gray-500">No categories available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Preview Modal -->
    <ProductPreviewModal 
      v-model="isPreviewOpen"
      :product="selectedProduct"
    />

    <!-- Floating Action Bar -->
    <div class="fixed bottom-0 left-64 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-deep-navy/10 shadow-2xl">
      <div class="max-w-screen-xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5 text-primary" />
            <div>
              <p class="text-xs font-black text-primary uppercase tracking-widest">Shop Dashboard</p>
              <p class="text-[10px] text-deep-navy/60 font-medium">Manage products, orders, and categories</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <UButton
              size="sm"
              variant="outline"
              color="gray"
              icon="i-heroicons-shopping-cart"
              @click="navigateTo(`/events/${id}/m/shop/orders`)"
            >
              View Orders
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import type { BookingPackageList, ProductList } from '~/api/types.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useBookingPackages } from '~/composables/resources/booking/bookingPackages'
import {
  useBookingPackageProducts,
  useCreateBookingPackageProduct,
  useUpdateBookingPackageProduct,
  useDeleteBookingPackageProduct,
  type BookingPackageProduct,
} from '~/composables/resources/booking/bookingProductPackages'
import { useProducts } from '~/composables/resources/products/products'
import { useProductCategories } from '~/composables/resources/products/productCategories'
import { useProductEventCategories } from '~/composables/resources/products/productEventCategories'
import { useBulkAssignCategoryToProducts, useBulkRemoveCategoryFromProducts } from '~/composables/resources/products/productCategoryAssignments'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import ProductPreviewModal from '~/components/events/shop/ProductPreviewModal.vue'
import StatisticsIndex from './statistics/index.vue'
import { 
  getStockStatus, 
  getStockStatusLabel, 
  getStockStatusColor,
  getPublicationStatus,
  getPublicationStatusLabel,
  getPublicationStatusColor
} from '~/schemas/events/productConstants'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const id = computed(() => route.params.id as string)

// Event Data
const { data: event } = useEvent(id)

// Product Preview Modal State
const isPreviewOpen = ref(false)
const selectedProduct = ref<ProductList | null>(null)

// Tab State
const currentTab = ref('products')
const tabs = computed(() => [
  { value: 'products', label: 'Products', icon: 'i-heroicons-cube', badge: totalProducts.value },
  // { value: 'discounts', label: 'Discounts', icon: 'i-heroicons-tag' },
  { value: 'package-products', label: 'Package Products', icon: 'i-heroicons-link' },
  { value: 'categories', label: 'Categories', icon: 'i-heroicons-folder' },
  { value: 'category-mapping', label: 'Category Mapping', icon: 'i-heroicons-squares-2x2' },
  { value: 'stock', label: 'Stock Alerts', icon: 'i-heroicons-bell', badge: lowStockCount.value || undefined },
  { value: 'statistics', label: 'Statistics', icon: 'i-heroicons-chart-bar' },
])

// Pagination
const currentPage = ref(1)
const pageSize = ref(25)
const searchQuery = ref('')

// Debounced search
const debouncedSearch = ref(searchQuery.value)
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
    currentPage.value = 1 // Reset to first page on search
  }, 300)
})

// Search & Filters
const showFilters = ref(false)
const filters = reactive({
  verified: false,
  active: false,
  inStock: false,
  lowStock: false,
  outOfStock: false,
  minPrice: null as number | null,
  maxPrice: null as number | null,
})

// Sorting
const currentSort = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

function setSorting(field: string) {
  if (currentSort.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    currentSort.value = field
    sortDirection.value = 'asc'
  }
}

// Computed query parameters for API
const queryParams = computed(() => {
  const params: any = {
    event: event.value?.data?.url_safe_title,
    page: currentPage.value,
    page_size: pageSize.value,
  }

  // Search
  if (debouncedSearch.value) {
    params.search = debouncedSearch.value
  }

  // Sorting
  if (currentSort.value) {
    params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
  }

  // Status filters
  if (filters.verified) params.verified = true
  if (filters.active) params.is_active = true

  // Stock filters - in_stock is boolean, we need to handle multiple checkboxes differently
  if (filters.inStock && !filters.outOfStock) {
    params.in_stock = true
  } else if (filters.outOfStock && !filters.inStock) {
    params.in_stock = false
  }
  // If both or neither are checked, don't filter by stock

  // Price range filters
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    params.min_price = filters.minPrice
  }
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    params.max_price = filters.maxPrice
  }

  return params
})

// Products Data
const { data: productsData, isLoading } = useProducts(queryParams)
const products = computed(() => productsData.value?.data?.results || [])
const totalProducts = computed(() => productsData.value?.data?.count || 0)

// Statistics
const activeProductsCount = computed(() => 
  products.value.filter((p: ProductList) => p.is_active && p.verified).length
)
const lowStockCount = computed(() => 
  products.value.filter((p: ProductList) => {
    // Since ProductList doesn't include variants, we'll use variant_count as a proxy
    // Products with 0 variants are likely low stock
    return p.variant_count === 0
  }).length
)
const totalRevenue = computed(() => 0) // TODO: Calculate from orders


const activeFilterCount = computed(() => {
  let count = 0
  if (filters.verified) count++
  if (filters.active) count++
  if (filters.inStock) count++
  if (filters.lowStock) count++
  if (filters.outOfStock) count++
  if (filters.minPrice !== null) count++
  if (filters.maxPrice !== null) count++
  return count
})

function clearAllFilters() {
  searchQuery.value = ''
  filters.verified = false
  filters.active = false
  filters.inStock = false
  filters.lowStock = false
  filters.outOfStock = false
  filters.minPrice = null
  filters.maxPrice = null
  currentPage.value = 1
}

// Watch filters and reset page when they change
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Table Selection
const selectAll = ref(false)
const selectedProducts = ref<string[]>([])

function toggleSelectAll() {
  if (selectAll.value) {
    selectedProducts.value = products.value.map((p: ProductList) => p.product_id!)
  } else {
    selectedProducts.value = []
  }
}



// Actions
function viewProductDetails(product: ProductList) {
  selectedProduct.value = product
  isPreviewOpen.value = true
}

function deleteProduct(product: ProductList) {
  // TODO: Implement delete confirmation
  console.log('Delete product:', product)
}

function exportProductsToCSV() {
  // TODO: Implement CSV export
  console.log('Export to CSV')
}

// Helpers
function formatCurrency(amount?: number | string | null) {
  if (!amount) return '£0.00'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `£${num.toFixed(2)}`
}

function getProductStockStatus(product: ProductList) {
  // ProductList doesn't include variants, so we use variant_count as indicator
  // A product with 0 variants is likely out of stock
  const hasVariants = product.variant_count > 0
  if (!hasVariants) return 'out-of-stock' as const
  // Default to 'in-stock' for products with variants (would need full detail to check actual stock)
  return 'in-stock' as const
}

// ============================================
// Categories Management
// ============================================

// Fetch EventCategories for this event (associations between event and categories)
const { data: eventCategoriesData, isLoading: categoriesLoadingEventCategories } = useProductEventCategories(
  computed(() => {
    const eventId = event.value?.data?.url_safe_title 
    if (!eventId) return undefined

    return {
      event: eventId,
      page_size: 100,
    }
  })
)

const eventCategories = computed(() => eventCategoriesData.value?.data?.results || [])

// Fetch global categories for selection.
const { data: productCategoriesData, isLoading: productCategoriesLoading } = useProductCategories(
  computed(() => ({
    page_size: 100,
  }))
)

const categories = computed(() => productCategoriesData.value?.data?.results || [])
const categoriesLoading = computed(() => categoriesLoadingEventCategories.value || productCategoriesLoading.value)

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

const bulkAssignCategoryMutation = useBulkAssignCategoryToProducts()
const bulkRemoveCategoryMutation = useBulkRemoveCategoryFromProducts()
const toast = useToast()

// ============================================
// Category Mapping (Category -> Products)
// ============================================

const categoryMappingSearchQuery = ref('')
const categoryMappingSelectedCategoryId = ref<number | null>(null)
const categoryMappingSelectedProductIds = ref<string[]>([])

const categoryMappingProductsQuery = computed(() => {
  const eventId = event.value?.data?.url_safe_title
  if (!eventId) return undefined

  return {
    event: eventId,
    page_size: 100,
    ...(categoryMappingSearchQuery.value
      ? { search: categoryMappingSearchQuery.value }
      : {}),
  }
})

const { data: categoryMappingProductsData, isLoading: categoryMappingProductsLoading, refetch: refetchCategoryMappingProducts } = useProducts(categoryMappingProductsQuery)

const categoryMappingProducts = computed(() => categoryMappingProductsData.value?.data?.results || [])

const allCategoryMappingProductsSelected = computed({
  get: () =>
    categoryMappingProducts.value.length > 0 &&
    categoryMappingProducts.value.every(product =>
      categoryMappingSelectedProductIds.value.includes(product.product_id as string)
    ),
  set: (checked: boolean) => {
    categoryMappingSelectedProductIds.value = checked
      ? categoryMappingProducts.value.map(product => product.product_id as string)
      : []
  },
})

function clearCategoryMappingSelection() {
  categoryMappingSelectedProductIds.value = []
}

function isCategoryAssignedToProduct(product: ProductList) {
  const selectedCategoryId = Number(categoryMappingSelectedCategoryId.value)
  if (!Number.isFinite(selectedCategoryId) || selectedCategoryId <= 0) return false

  return eventCategories.value.some((association: any) =>
    Number(association.category) === selectedCategoryId &&
    Number(association.product) === Number(product.id)
  )
}

async function assignCategoryToSelectedProducts() {
  const selectedCategoryId = Number(categoryMappingSelectedCategoryId.value)

  if (!Number.isFinite(selectedCategoryId) || selectedCategoryId <= 0) {
    toast.add({
      title: 'Validation Error',
      description: 'Select a category first',
      color: 'red',
    })
    return
  }

  if (categoryMappingSelectedProductIds.value.length === 0) {
    toast.add({
      title: 'Validation Error',
      description: 'Select at least one product',
      color: 'red',
    })
    return
  }

  const eventId = Number(event.value?.data?.id)
  if (!Number.isFinite(eventId) || eventId <= 0) {
    toast.add({
      title: 'Validation Error',
      description: 'Event context is missing',
      color: 'red',
    })
    return
  }

  const updates = categoryMappingSelectedProductIds.value
    .map((productId) => {
      const product = categoryMappingProducts.value.find(p => p.product_id === productId)
      if (!product) return null

      return {
        productId,
        productPk: Number(product.id),
      }
    })
    .filter((update): update is { productId: string; productPk: number } => update !== null)

  const existingAssociationKeys = new Set(
    eventCategories.value
      .filter((association: any) => Number(association.category) === selectedCategoryId && association.product)
      .map((association: any) => `${Number(association.product)}-${Number(association.category)}`)
  )

  const productsNeedingUpdate = updates.filter(
    (update) => !existingAssociationKeys.has(`${update.productPk}-${selectedCategoryId}`)
  )

  if (updates.length === 0) {
    toast.add({
      title: 'No valid products',
      description: 'Could not prepare category updates for selected products',
      color: 'red',
    })
    return
  }

  if (productsNeedingUpdate.length === 0) {
    toast.add({
      title: 'No changes needed',
      description: 'All selected products already have this category',
      color: 'blue',
    })
    return
  }

  try {
    const result = await bulkAssignCategoryMutation.mutateAsync({
      eventId,
      categoryId: selectedCategoryId,
      products: productsNeedingUpdate.map(update => ({ productPk: update.productPk })),
    })

    const skippedCount = result?.skippedCount || 0
    const updatedCount = result?.updatedCount || productsNeedingUpdate.length

    toast.add({
      title: 'Success',
      description: skippedCount > 0
        ? `Category assigned to ${updatedCount} product${updatedCount === 1 ? '' : 's'} (${skippedCount} already mapped)`
        : `Category assigned to ${updatedCount} product${updatedCount === 1 ? '' : 's'}`,
      color: 'green',
    })

    clearCategoryMappingSelection()
    refetchCategoryMappingProducts()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.message || 'Failed to assign category to selected products',
      color: 'red',
    })
  }
}

async function removeCategoryFromSelectedProducts() {
  const selectedCategoryId = Number(categoryMappingSelectedCategoryId.value)

  if (!Number.isFinite(selectedCategoryId) || selectedCategoryId <= 0) {
    toast.add({
      title: 'Validation Error',
      description: 'Select a category first',
      color: 'red',
    })
    return
  }

  if (categoryMappingSelectedProductIds.value.length === 0) {
    toast.add({
      title: 'Validation Error',
      description: 'Select at least one product',
      color: 'red',
    })
    return
  }

  const selectedProductDbIds = new Set(
    categoryMappingProducts.value
      .filter(product => categoryMappingSelectedProductIds.value.includes(product.product_id as string))
      .map(product => Number(product.id))
      .filter(productId => Number.isFinite(productId) && productId > 0)
  )

  const associationIds = eventCategories.value
    .filter((association: any) =>
      Number(association.category) === selectedCategoryId &&
      selectedProductDbIds.has(Number(association.product))
    )
    .map((association: any) => String(association.id))

  if (associationIds.length === 0) {
    toast.add({
      title: 'No changes needed',
      description: 'No matching category assignments found for selected products',
      color: 'blue',
    })
    return
  }

  try {
    const result = await bulkRemoveCategoryMutation.mutateAsync({ associationIds })

    toast.add({
      title: 'Success',
      description: `Category removed from ${result.removedCount} product${result.removedCount === 1 ? '' : 's'}`,
      color: 'green',
    })

    clearCategoryMappingSelection()
    refetchCategoryMappingProducts()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.message || 'Failed to remove category from selected products',
      color: 'red',
    })
  }
}

// ============================================
// Stock Alerts
// ============================================

const stockAlertThreshold = ref(20) // Default to 20%

const lowStockProducts = computed(() => {
  // Note: ProductList doesn't include stock details
  // Stock information is only available at variant level
  // This is a placeholder implementation showing products with few or no variants
  return products.value.filter(product => {
    // Show products with 0 variants or very few variants as potentially needing attention
    return product.variant_count <= 3
  }).slice(0, 20) // Limit to 20 items
})

function getStockAlertColor(product: ProductList) {
  // Placeholder implementation based on variant count
  if (product.variant_count === 0) return 'red'
  if (product.variant_count <= 2) return 'amber'
  return 'yellow'
}

function getStockAlertLabel(product: ProductList) {
  // Placeholder implementation based on variant count
  if (product.variant_count === 0) return 'No Variants'
  if (product.variant_count <= 2) return 'Low Variants'
  return 'Check Variants'
}

// ============================================
// Package Products Management
// ============================================

const bookingPackagesQuery = computed(() => {
  const eventId = event.value?.data?.url_safe_title
  if (!eventId) return undefined

  return {
    event: eventId,
    page_size: 100,
  }
})

const { data: bookingPackagesData, isLoading: bookingPackagesLoading } = useBookingPackages(bookingPackagesQuery)
const bookingPackages = computed<BookingPackageList[]>(() => bookingPackagesData.value?.data?.results || [])

const selectedPackageId = ref<number | null>(null)

watch(bookingPackages, (items) => {
  if (!selectedPackageId.value && items.length > 0) {
    selectedPackageId.value = Number(items[0].id)
  }
})

const packageProductsSearchQuery = ref('')
const packageProductForm = reactive({
  productId: null as number | null,
  quantityPerAttendee: 1,
  percentageModifier: '-10.00',
})

const editingPackageProductId = ref<number | null>(null)
const editingPackageProduct = reactive({
  quantityPerAttendee: 1,
  percentageModifier: '0.00',
})

const packageProductsQuery = computed(() => {
  if (!selectedPackageId.value) return undefined
  return selectedPackageId.value
})

const {
  data: packageProductsData,
  isLoading: packageProductsLoading,
  refetch: refetchPackageProducts,
} = useBookingPackageProducts(packageProductsQuery)

const packageProducts = computed<BookingPackageProduct[]>(() => packageProductsData.value?.data?.results || [])

const packageProductsEventProductQuery = computed(() => {
  const eventId = event.value?.data?.url_safe_title
  if (!eventId) return undefined

  return {
    event: eventId,
    page_size: 200,
  }
})

const { data: packageProductsEventProductsData } = useProducts(packageProductsEventProductQuery)
const packageProductsEventProducts = computed<ProductList[]>(() => packageProductsEventProductsData.value?.data?.results || [])

const linkedProductIds = computed(() => new Set(packageProducts.value.map(item => Number(item.product))))

const availableProductsForLinking = computed(() =>
  packageProductsEventProducts.value.filter(product => !linkedProductIds.value.has(Number(product.id)))
)

const filteredPackageProducts = computed(() => {
  const query = packageProductsSearchQuery.value.trim().toLowerCase()
  if (!query) return packageProducts.value

  return packageProducts.value.filter((item) =>
    item.product_title.toLowerCase().includes(query) ||
    item.product_display_code.toLowerCase().includes(query)
  )
})

const createPackageProductMutation = useCreateBookingPackageProduct()
const updatePackageProductMutation = useUpdateBookingPackageProduct()
const deletePackageProductMutation = useDeleteBookingPackageProduct()

function formatModifier(value: string | number) {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '0.00%'
  return `${numeric > 0 ? '+' : ''}${numeric.toFixed(2)}%`
}

function resetPackageProductForm() {
  packageProductForm.productId = null
  packageProductForm.quantityPerAttendee = 1
  packageProductForm.percentageModifier = '-10.00'
}

async function createPackageProductLink() {
  if (!selectedPackageId.value) {
    toast.add({
      title: 'Validation Error',
      description: 'Select a booking package first',
      color: 'red',
    })
    return
  }

  if (!packageProductForm.productId) {
    toast.add({
      title: 'Validation Error',
      description: 'Select a product to link',
      color: 'red',
    })
    return
  }

  if (!Number.isFinite(packageProductForm.quantityPerAttendee) || packageProductForm.quantityPerAttendee < 1) {
    toast.add({
      title: 'Validation Error',
      description: 'Quantity per attendee must be at least 1',
      color: 'red',
    })
    return
  }

  if (linkedProductIds.value.has(Number(packageProductForm.productId))) {
    toast.add({
      title: 'No changes needed',
      description: 'This product is already linked to the selected package',
      color: 'blue',
    })
    return
  }

  try {
    await createPackageProductMutation.mutateAsync({
      packageId: selectedPackageId.value,
      body: {
        product: Number(packageProductForm.productId),
        quantity_per_attendee: Number(packageProductForm.quantityPerAttendee),
        percentage_modifier: Number(packageProductForm.percentageModifier).toFixed(2),
        booking_package: Number(selectedPackageId.value),
      },
    })

    toast.add({
      title: 'Success',
      description: 'Product linked to package',
      color: 'green',
    })

    resetPackageProductForm()
    refetchPackageProducts()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.message || 'Failed to link product to package',
      color: 'red',
    })
  }
}

function startPackageProductEdit(row: BookingPackageProduct) {
  editingPackageProductId.value = row.id
  editingPackageProduct.quantityPerAttendee = Number(row.quantity_per_attendee)
  editingPackageProduct.percentageModifier = Number(row.percentage_modifier).toFixed(2)
}

function cancelPackageProductEdit() {
  editingPackageProductId.value = null
  editingPackageProduct.quantityPerAttendee = 1
  editingPackageProduct.percentageModifier = '0.00'
}

async function savePackageProductEdit(packageProductId: number) {
  if (!selectedPackageId.value) return

  if (!Number.isFinite(editingPackageProduct.quantityPerAttendee) || editingPackageProduct.quantityPerAttendee < 1) {
    toast.add({
      title: 'Validation Error',
      description: 'Quantity per attendee must be at least 1',
      color: 'red',
    })
    return
  }

  try {
    await updatePackageProductMutation.mutateAsync({
      packageId: selectedPackageId.value,
      packageProductId,
      body: {
        quantity_per_attendee: Number(editingPackageProduct.quantityPerAttendee),
        percentage_modifier: Number(editingPackageProduct.percentageModifier).toFixed(2),
      },
    })

    toast.add({
      title: 'Success',
      description: 'Linked product updated',
      color: 'green',
    })

    cancelPackageProductEdit()
    refetchPackageProducts()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.message || 'Failed to update linked product',
      color: 'red',
    })
  }
}

async function deletePackageProductLink(packageProductId: number) {
  if (!selectedPackageId.value) return

  try {
    await deletePackageProductMutation.mutateAsync({
      packageId: selectedPackageId.value,
      packageProductId,
    })

    toast.add({
      title: 'Success',
      description: 'Linked product removed from package',
      color: 'green',
    })

    if (editingPackageProductId.value === packageProductId) {
      cancelPackageProductEdit()
    }

    refetchPackageProducts()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.message || 'Failed to remove linked product',
      color: 'red',
    })
  }
}
</script>
