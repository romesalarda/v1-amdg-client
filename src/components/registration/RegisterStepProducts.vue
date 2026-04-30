<template>
	<div class="space-y-6">
		<div>
			<h2 class="text-lg font-semibold text-gray-900">Products</h2>
			<p class="text-sm text-gray-600">Optional add-ons linked to the selected package.</p>
		</div>

		<p v-if="!currentAttendee?.packageId" class="text-sm text-gray-500">
			Select a package first to see available products.
		</p>
		<p v-else-if="packageProductsLoading" class="text-sm text-gray-500">
			Loading package products...
		</p>
		<p v-else-if="packageProductsError" class="text-sm font-semibold text-red-600">
			{{ packageProductsError }}
		</p>

		<div v-else-if="currentPackageProducts.length" class="space-y-4">
			<div
				v-for="packageProduct in currentPackageProducts"
				:key="packageProduct.id"
				class="rounded-xl border border-gray-200 overflow-hidden"
			>
				<!-- Product Header -->
				<div class="border-b border-gray-200 bg-white p-4">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div>
							<p class="text-sm font-semibold text-gray-900">{{ packageProduct.productTitle }}</p>
							<p class="mt-1 text-xs text-gray-600">Pick a size, then choose your color.</p>
						</div>
						<UBadge color="gray" variant="soft" size="xs">
							Max {{ packageProduct.quantityPerAttendee }}
						</UBadge>
					</div>
				</div>

				<!-- Product Content: Image + Selection -->
				<div class="grid gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
					<!-- Left: Product Image -->
					<div class="sm:col-span-1">
						<div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
							<img
								:src="getPackageProductImageSrc(packageProduct)"
								:alt="`${packageProduct.productTitle} image`"
								class="aspect-[3/4] w-full object-cover"
							/>
						</div>
					</div>

					<!-- Right: Selection Options -->
					<div class="sm:col-span-2 lg:col-span-3 flex flex-col gap-4">
						<!-- Step 1: Size Selection -->
						<div>
							<label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">Step 1: Size</label>
							<div v-if="getUniqueSizesForPackageProduct(packageProduct.id).length" class="flex flex-wrap gap-2">
								<button
									v-for="sizeOption in getUniqueSizesForPackageProduct(packageProduct.id)"
									:key="sizeOption.size"
									type="button"
									class="rounded-lg border px-4 py-2 text-sm font-medium transition"
									:class="[
										getSelectedSizeForProduct(packageProduct.id) === sizeOption.size
											? 'border-blue-500 bg-blue-50 text-blue-700'
											: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
										!sizeOption.Available ? 'cursor-not-allowed opacity-50' : ''
									]"
									:disabled="!sizeOption.Available"
									@click="setSelectedSizeForProduct(packageProduct.id, sizeOption.size)"
								>
									{{ sizeOption.size }}
								</button>
							</div>
							<p v-else class="text-xs text-amber-700 font-semibold">No sizes available.</p>
						</div>

						<!-- Step 2: Color Selection -->
						<div v-if="getSelectedSizeForProduct(packageProduct.id)">
							<label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">Step 2: Color</label>
							<div class="flex flex-wrap gap-3">
								<button
									v-for="colorOption in getColorsForPackageProductAndSize(packageProduct.id, getSelectedSizeForProduct(packageProduct.id)!)"
									:key="colorOption.colorHex"
									type="button"
									class="flex flex-col items-center gap-1 transition"
									:disabled="!colorOption.isActive || colorOption.stockQuantity <= 0"
									@click="() => {
										const variantId = getVariantIdForPackageProductSizeColor(packageProduct.id, getSelectedSizeForProduct(packageProduct.id)!, colorOption.colorHex)
										if (variantId) {
											setPackageProductVariantSelection(packageProduct.id, variantId)
										}
									}"
								>
									<div
										class="h-10 w-10 rounded-lg border-2 transition"
										:style="{ backgroundColor: colorOption.colorHex }"
										:class="[
											getSelectionForPackageProduct(packageProduct.id)?.variantId === getVariantIdForPackageProductSizeColor(packageProduct.id, getSelectedSizeForProduct(packageProduct.id)!, colorOption.colorHex)
												? 'border-blue-500 ring-2 ring-blue-300'
												: 'border-slate-300',
											!colorOption.isActive || colorOption.stockQuantity <= 0 ? 'opacity-50' : ''
										]"
									/>
								</button>
							</div>
						</div>

						<!-- Quantity and Pricing -->
						<div v-if="getSelectedSizeForProduct(packageProduct.id)" class="border-t border-slate-200 pt-4 space-y-4">
							<div>
								<label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</label>
								<UInput
									type="number"
									:min="1"
									:max="packageProduct.quantityPerAttendee"
									:disabled="!getSelectionForPackageProduct(packageProduct.id)"
									:model-value="getSelectionForPackageProduct(packageProduct.id)?.quantity || 1"
									@update:model-value="setPackageProductQuantity(packageProduct.id, Number($event || 1))"
								/>
								<p class="mt-1 text-xs text-slate-500">Up to {{ packageProduct.quantityPerAttendee }} per attendee</p>
							</div>

							<!-- Price Breakdown -->
							<div v-if="getSelectionForPackageProduct(packageProduct.id) && getSelectedVariantPriceInfo(packageProduct)" class="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 space-y-3">
								<p class="text-xs font-bold uppercase tracking-wide text-blue-900">Price breakdown</p>
								<div class="space-y-2">
									<div class="flex items-center justify-between">
										<span class="text-xs text-slate-700">Standard price per unit</span>
										<span class="text-sm font-semibold text-slate-900">{{ formatMoney(getSelectedVariantPriceInfo(packageProduct)!.standardPrice, packageProduct.currency) }}</span>
									</div>
									<div v-if="getSelectedVariantPriceInfo(packageProduct)!.bundledPrice !== getSelectedVariantPriceInfo(packageProduct)!.standardPrice" class="flex items-center justify-between">
										<span class="text-xs text-emerald-700 font-semibold">Bundle price per unit</span>
										<span class="text-sm font-bold text-emerald-700">{{ formatMoney(getSelectedVariantPriceInfo(packageProduct)!.bundledPrice, packageProduct.currency) }}</span>
									</div>
									<div v-if="getSelectedVariantPriceInfo(packageProduct)!.bundledPrice === getSelectedVariantPriceInfo(packageProduct)!.standardPrice" class="flex items-center justify-between">
										<span class="text-xs text-slate-700">Bundle price per unit</span>
										<span class="text-sm font-semibold text-slate-900">{{ formatMoney(getSelectedVariantPriceInfo(packageProduct)!.bundledPrice, packageProduct.currency) }}</span>
									</div>
								</div>
								<div class="border-t border-blue-300 pt-3 flex items-center justify-between">
									<div>
										<p class="text-xs text-slate-600">Total for {{ getSelectedVariantPriceInfo(packageProduct)!.quantity }} {{ getSelectedVariantPriceInfo(packageProduct)!.quantity === 1 ? 'item' : 'items' }}</p>
										<p class="text-xs text-slate-500 mt-0.5">At checkout</p>
									</div>
									<div class="text-right">
										<p class="text-2xl font-black text-blue-900">{{ formatMoney(getSelectedVariantPriceInfo(packageProduct)!.totalPrice, packageProduct.currency) }}</p>
									</div>
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="flex justify-end gap-2">
								<UButton
									size="xs"
									color="gray"
									variant="ghost"
									:disabled="!getSelectionForPackageProduct(packageProduct.id)"
									@click="removePackageProductSelection(packageProduct.id)"
								>
									Remove
								</UButton>
							</div>
						</div>
						<!-- Empty State Helper -->
						<div v-else class="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
							<UIcon name="i-heroicons-information-circle" class="h-4 w-4" />
							<span>Select a size to see available colors.</span>
						</div>
					</div>
				</div>
			</div>

			<div v-if="selectedAddOnsSummary.length" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
				<p class="text-sm font-semibold text-slate-900">Selected add-ons</p>
				<ul class="mt-2 space-y-2">
					<li
						v-for="row in selectedAddOnsSummary"
						:key="`${row.packageProductId}-${row.variantLabel}`"
						class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
					>
						<div class="text-slate-700">
							<p class="font-semibold text-slate-900">{{ row.productTitle }}</p>
							<p>{{ row.variantLabel }}</p>
						</div>
						<p class="font-semibold text-slate-800">x{{ row.quantity }}</p>
					</li>
				</ul>
			</div>
		</div>

		<p v-else class="text-sm text-gray-500">No package products available for this package.</p>
	</div>
</template>

<script setup lang="ts">
import { formatMoney } from '~/utils/money'
import type { AttendeeDraft } from '~/stores/registration'

defineProps<{
	currentAttendee: AttendeeDraft
	packageProductsLoading: boolean
	packageProductsError: string
	currentPackageProducts: any[]
	selectedAddOnsSummary: any[]
	getPackageProductImageSrc: (product: { imageUrl: string | null }) => string
	getUniqueSizesForPackageProduct: (id: number) => any[]
	getColorsForPackageProductAndSize: (id: number, size: string) => any[]
	getVariantIdForPackageProductSizeColor: (id: number, size: string, colorHex: string) => string | null
	getSelectedSizeForProduct: (id: number) => string | null
	setSelectedSizeForProduct: (id: number, size: string) => void
	getSelectionForPackageProduct: (id: number) => any
	setPackageProductVariantSelection: (id: number, variantId: string) => void
	setPackageProductQuantity: (id: number, quantity: number) => void
	removePackageProductSelection: (id: number) => void
	getSelectedVariantPriceInfo: (product: any) => any
}>()
</script>
