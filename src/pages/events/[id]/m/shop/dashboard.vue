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
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">Product Categories</h2>
                  <p class="text-xs text-gray-500">Organize products into categories for easier management</p>
                </div>
              </div>
              
              <UButton
                size="sm"
                variant="solid"
                color="primary"
                icon="i-heroicons-plus"
                @click="openCategoryModal()"
              >
                Add Category
              </UButton>
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
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <UIcon name="i-heroicons-folder" class="w-5 h-5 text-primary" />
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                      <p v-if="category.product_count !== undefined" class="text-xs text-gray-500 mt-0.5">
                        {{ category.product_count }} product{{ category.product_count !== 1 ? 's' : '' }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-1">
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="blue"
                      icon="i-heroicons-pencil"
                      @click="openCategoryModal(category)"
                      title="Edit category"
                    />
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="red"
                      icon="i-heroicons-trash"
                      @click="handleDeleteCategory(category.id)"
                      :loading="deletingCategoryId === category.id"
                      title="Delete category"
                    />
                  </div>
                </div>
                
                <p v-if="category.description" class="text-sm text-gray-600 line-clamp-2">
                  {{ category.description }}
                </p>
                <p v-else class="text-sm text-gray-400 italic">No description</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-12 text-center">
              <UIcon name="i-heroicons-folder" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p class="text-sm text-gray-500 mb-4">Create categories to organize your products</p>
              <UButton
                color="primary"
                icon="i-heroicons-plus"
                @click="openCategoryModal()"
              >
                Create First Category
              </UButton>
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

    <!-- Category Modal -->
    <UModal v-model="showCategoryModal" :ui="{ width: 'max-w-xl' }">
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          {{ editingCategory ? 'Edit Category' : 'Add Category' }}
        </h3>

        <div class="space-y-4">
          <!-- Category Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
            <input
              v-model="categoryForm.name"
              type="text"
              placeholder="e.g., Apparel, Accessories"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              v-model="categoryForm.description"
              rows="3"
              placeholder="Optional description..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
          <UButton
            class="flex-1"
            variant="outline"
            color="gray"
            @click="closeCategoryModal"
          >
            Cancel
          </UButton>
          <UButton
            class="flex-1"
            variant="solid"
            color="primary"
            icon="i-heroicons-check"
            :loading="createCategory.isPending.value || updateCategory.isPending.value"
            @click="submitCategoryForm"
          >
            {{ editingCategory ? 'Update' : 'Create' }} Category
          </UButton>
        </div>
      </div>
    </UModal>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import type { ProductList, ProductCategory } from '~/api/types.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useProducts } from '~/composables/resources/products/products'
import { useProductCategories, useCreateProductCategory, useUpdateProductCategory, useDeleteProductCategory } from '~/composables/resources/products/productCategories'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
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

// Tab State
const currentTab = ref('products')
const tabs = computed(() => [
  { value: 'products', label: 'Products', icon: 'i-heroicons-cube', badge: totalProducts.value },
  { value: 'discounts', label: 'Discounts', icon: 'i-heroicons-tag' },
  { value: 'categories', label: 'Categories', icon: 'i-heroicons-folder' },
  { value: 'stock', label: 'Stock Alerts', icon: 'i-heroicons-bell', badge: lowStockCount.value || undefined },
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
    event: event.value?.data?.id,
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
  // TODO: Open product detail modal
  console.log('View product:', product)
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

const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useProductCategories(
  computed(() => ({
    event: event.value?.data?.id,
    page_size: 100, // Get all categories
  }))
)

const categories = computed(() => categoriesData.value?.data?.results || [])

// Category modal state
const showCategoryModal = ref(false)
const editingCategory = ref<ProductCategory | null>(null)
const deletingCategoryId = ref<number | null>(null)

// Category form data
const categoryForm = reactive({
  name: '',
  description: '',
})

// Category mutations
const createCategory = useCreateProductCategory()
const updateCategory = useUpdateProductCategory()
const deleteCategory = useDeleteProductCategory()
const toast = useToast()

function openCategoryModal(category?: ProductCategory) {
  editingCategory.value = category || null
  
  if (category) {
    categoryForm.name = category.name
    categoryForm.description = category.description || ''
  } else {
    categoryForm.name = ''
    categoryForm.description = ''
  }
  
  showCategoryModal.value = true
}

function closeCategoryModal() {
  showCategoryModal.value = false
  editingCategory.value = null
}

async function submitCategoryForm() {
  // Validation
  if (!categoryForm.name) {
    toast.add({
      title: 'Validation Error',
      description: 'Please enter a category name',
      color: 'red',
    })
    return
  }

  const categoryPayload: any = {
    name: categoryForm.name,
    description: categoryForm.description || null,
    event: event.value?.data?.id,
  }

  try {
    if (editingCategory.value) {
      // Update existing category
      await updateCategory.mutateAsync({
        categoryId: editingCategory.value.id,
        body: categoryPayload,
      })

      toast.add({
        title: 'Success',
        description: 'Category updated successfully',
        color: 'green',
      })
    } else {
      // Create new category
      await createCategory.mutateAsync(categoryPayload)

      toast.add({
        title: 'Success',
        description: 'Category created successfully',
        color: 'green',
      })
    }

    refetchCategories()
    closeCategoryModal()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to save category',
      color: 'red',
    })
  }
}

async function handleDeleteCategory(categoryId: number) {
  if (!confirm('Are you sure you want to delete this category? Products in this category will not be deleted.')) return

  deletingCategoryId.value = categoryId

  try {
    await deleteCategory.mutateAsync(categoryId)

    toast.add({
      title: 'Success',
      description: 'Category deleted successfully',
      color: 'green',
    })

    refetchCategories()
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to delete category',
      color: 'red',
    })
  } finally {
    deletingCategoryId.value = null
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
</script>
