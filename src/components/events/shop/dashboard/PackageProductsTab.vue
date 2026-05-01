<template>
  <!-- Package Selector Header -->
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
        v-model.number="tab.selectedPackageId.value"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option :value="null">Select a booking package...</option>
        <option v-for="pkg in tab.bookingPackages.value" :key="pkg.id" :value="pkg.id">
          {{ pkg.name }}
        </option>
      </select>
    </div>
  </div>

  <!-- Link Form -->
  <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 space-y-3">
    <p class="text-xs text-gray-600">
      Use a negative percentage modifier to discount bundled products. A modifier of -100 makes the linked product free within the package.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div class="md:col-span-2">
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Event Product</label>
        <select
          v-model.number="tab.packageProductForm.productId"
          :disabled="!tab.selectedPackageId.value"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
        >
          <option :value="null">Select product...</option>
          <option
            v-for="product in tab.availableProductsForLinking.value"
            :key="product.id"
            :value="product.id"
          >
            {{ product.title }} ({{ product.display_code }})
          </option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Quantity / Attendee</label>
        <input
          v-model.number="tab.packageProductForm.quantityPerAttendee"
          type="number"
          min="1"
          :disabled="!tab.selectedPackageId.value"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Modifier (%)</label>
        <input
          v-model="tab.packageProductForm.percentageModifier"
          type="number"
          step="0.01"
          min="-100"
          max="100"
          :disabled="!tab.selectedPackageId.value"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
        />
      </div>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        size="sm"
        variant="ghost"
        color="gray"
        @click="tab.resetPackageProductForm()"
        :disabled="!tab.selectedPackageId.value"
      >
        Reset
      </UButton>
      <UButton
        size="sm"
        color="primary"
        icon="i-heroicons-plus"
        :loading="tab.createPackageProductMutation.isPending.value"
        :disabled="!tab.selectedPackageId.value"
        @click="tab.createPackageProductLink()"
      >
        Link Product
      </UButton>
    </div>
  </div>

  <!-- Search -->
  <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
    <div class="relative flex-1 max-w-md">
      <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        v-model="tab.searchQuery.value"
        type="text"
        placeholder="Search linked products..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
    <UBadge color="gray" variant="soft">
      {{ tab.filteredPackageProducts.value.length }} linked
    </UBadge>
  </div>

  <!-- Loading -->
  <div v-if="tab.bookingPackagesLoading.value || tab.packageProductsLoading.value" class="p-6 space-y-3">
    <div v-for="i in 6" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
  </div>

  <!-- No Package Selected -->
  <div v-else-if="!tab.selectedPackageId.value" class="p-12 text-center">
    <UIcon name="i-heroicons-link" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 class="text-lg font-semibold text-gray-900 mb-2">Select a package first</h3>
    <p class="text-sm text-gray-500">Choose a booking package to view and manage linked products.</p>
  </div>

  <!-- Empty Linked Products -->
  <div v-else-if="tab.filteredPackageProducts.value.length === 0" class="p-12 text-center">
    <UIcon name="i-heroicons-cube-transparent" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 class="text-lg font-semibold text-gray-900 mb-2">No linked products</h3>
    <p class="text-sm text-gray-500">Use the form above to link products to this package.</p>
  </div>

  <!-- Linked Products Table -->
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
          v-for="row in tab.filteredPackageProducts.value"
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
            <template v-if="tab.editingPackageProductId.value === row.id">
              <input
                v-model.number="tab.editingPackageProduct.quantityPerAttendee"
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
            <template v-if="tab.editingPackageProductId.value === row.id">
              <input
                v-model="tab.editingPackageProduct.percentageModifier"
                type="number"
                step="0.01"
                min="-100"
                max="100"
                class="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </template>
            <template v-else>
              <UBadge
                :color="Number(row.percentage_modifier) < 0 ? 'green' : 'gray'"
                variant="soft"
                size="xs"
              >
                {{ tab.formatModifier(row.percentage_modifier ?? '0') }}
              </UBadge>
            </template>
          </td>

          <td class="py-3 px-4 font-semibold text-gray-900">{{ row.modified_amount }}</td>

          <td class="py-3 px-4">
            <div class="flex items-center justify-end gap-1">
              <template v-if="tab.editingPackageProductId.value === row.id">
                <UButton
                  size="xs"
                  color="primary"
                  icon="i-heroicons-check"
                  :loading="tab.updatePackageProductMutation.isPending.value"
                  @click="tab.savePackageProductEdit(row.id)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-x-mark"
                  @click="tab.cancelPackageProductEdit()"
                />
              </template>
              <template v-else>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-pencil"
                  @click="tab.startPackageProductEdit(row)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="red"
                  icon="i-heroicons-trash"
                  :loading="tab.deletePackageProductMutation.isPending.value"
                  @click="tab.deletePackageProductLink(row.id)"
                />
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { EventDetail } from '~/api/types.gen'
import { usePackageProductsTab } from '~/composables/shop/dashboard/usePackageProductsTab'

const props = defineProps<{
  eventId: string
  event: EventDetail | undefined
}>()

const tab = usePackageProductsTab(computed(() => props.event))
</script>
