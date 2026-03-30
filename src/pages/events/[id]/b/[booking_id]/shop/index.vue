<template>
	<div class="min-h-screen bg-mist-blue">
		<div class="mx-auto max-w-screen-xl space-y-5 px-4 py-6 md:px-6">

			<section class="rounded-3xl border border-deep-navy/10 bg-white p-5 shadow-sm">
				<div class="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
					<div class="lg:col-span-7">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Booking</p>
						<h1 class="mt-1 text-3xl font-black text-deep-navy">Shop</h1>
						<p class="mt-1 text-sm text-deep-navy/65">
							Booking {{ booking?.booking_reference || bookingReference }} · {{ cartItemCount }} item(s) in cart
						</p>
					</div>

					<div class="lg:col-span-3">
						<label class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Attendee scope</label>
						<select
							v-model="attendeeModel"
							class="mt-1 w-full rounded-xl border border-deep-navy/20 bg-white px-3 py-2.5 text-sm"
						>
							<option v-for="attendee in attendees" :key="attendee.id" :value="attendee.id">
								{{ attendee.name || attendee.display_id || attendee.id }}
							</option>
						</select>
					</div>

					<div class="lg:col-span-2 lg:text-right">
						<NuxtLink
							:to="cartHref"
							class="inline-flex items-center rounded-xl bg-deep-navy px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
						>
							View Cart ({{ cartItemCount }})
						</NuxtLink>
					</div>
				</div>
			</section>

			<section v-if="bookingQuery.isLoading.value" class="rounded-2xl border border-deep-navy/10 bg-white p-5 text-sm text-deep-navy/70">
				Loading booking context...
			</section>

			<section v-else-if="bookingQuery.error.value" class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
				Unable to load booking data for this shop.
			</section>

			<section v-else class="grid grid-cols-1 gap-5 xl:grid-cols-12">
				<div class="space-y-5 xl:col-span-8">
					<div v-if="!selectedAttendeeId" class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
						Select an attendee to start shopping.
					</div>

					<div
						v-if="selectedAttendeeId && isOrderCreationBlocked"
						class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"
					>
						{{ orderCreationBlockedReason }}
					</div>

					<template v-if="selectedAttendeeId">
						<div v-if="productsQuery.isLoading.value" class="rounded-2xl border border-deep-navy/10 bg-white p-5 text-sm text-deep-navy/70">
							Loading products...
						</div>

						<div v-else-if="products.length === 0" class="rounded-2xl border border-deep-navy/10 bg-white p-5 text-sm text-deep-navy/70">
							No products are currently available for this event.
						</div>

						<div
							v-else
							class="grid grid-cols-1 gap-5 2xl:grid-cols-1"
							:class="{ 'opacity-60': isOrderCreationBlocked }"
						>
							<BookingShopProductCard
								v-for="product in products"
								:key="product.product_id"
								:product="product"
								:currency-code="currencyCode"
								:add-disabled="isOrderCreationBlocked"
								:add-disabled-reason="orderCreationBlockedReason"
								@add="(payload) => onAddItem(payload.variantId, payload.quantity)"
							/>
						</div>
					</template>
				</div>

				<aside class="space-y-4 xl:col-span-4">
					<div class="xl:sticky xl:top-5 space-y-4">
						<article class="rounded-2xl border border-deep-navy/10 bg-white p-4 shadow-sm">
							<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Checkout preview</p>
							<h2 class="mt-2 text-lg font-black text-deep-navy">Current cart</h2>

							<div v-if="!cartOrder" class="mt-3 rounded-xl border border-dashed border-deep-navy/20 bg-mist-blue p-3 text-xs text-deep-navy/70">
								Your cart is empty. Add products to continue.
							</div>

							<div v-else class="mt-3 space-y-3">
								<div
									v-if="!isDraftCartOrder"
									class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800"
								>
									This cart is {{ cartOrder?.status }} and can no longer be edited.
								</div>

								<div class="max-h-56 space-y-2 overflow-auto pr-1">
									<article
										v-for="item in cartPreviewItems"
										:key="item.id"
										class="rounded-xl border border-deep-navy/10 bg-mist-blue/60 p-2"
									>
										<div class="flex items-start gap-2">
											<img
												:src="item.imageUrl"
												:alt="item.title"
												class="h-12 w-12 rounded-lg border border-deep-navy/10 bg-white object-cover"
											>
											<div>
												<p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/55">Variant</p>
												<p class="mt-1 text-xs font-semibold text-deep-navy">{{ item.title }}</p>
												<p class="text-[11px] text-deep-navy/65">{{ item.subtitle }}</p>
												<p class="text-[11px] text-deep-navy/65">Qty {{ item.quantity }}</p>
											</div>
										</div>
										<div class="text-right">
											<p class="text-[11px] text-deep-navy/65">Unit {{ formatMoney(item.unitPrice, currencyCode) }}</p>
											<p class="text-xs font-black text-deep-navy">{{ formatMoney(item.totalPrice, currencyCode) }}</p>
											<div class="mt-2 flex items-center justify-end gap-1">
												<button
													type="button"
													class="rounded border border-deep-navy/20 px-2 py-0.5 text-[11px] font-bold text-deep-navy disabled:cursor-not-allowed disabled:opacity-50"
													:disabled="!isDraftCartOrder || isUpdatingItem(item.id) || Number(item.quantity || 0) <= 1"
													@click="updateCartItemQuantity(item.id, Number(item.quantity || 1) - 1)"
												>
													-
												</button>
												<button
													type="button"
													class="rounded border border-deep-navy/20 px-2 py-0.5 text-[11px] font-bold text-deep-navy disabled:cursor-not-allowed disabled:opacity-50"
													:disabled="!isDraftCartOrder || isUpdatingItem(item.id)"
													@click="updateCartItemQuantity(item.id, Number(item.quantity || 0) + 1)"
												>
													+
												</button>
												<button
													type="button"
													class="rounded border border-red-200 px-2 py-0.5 text-[11px] font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
													:disabled="!isDraftCartOrder || isRemovingItem(item.id)"
													@click="removeCartItem(item.id)"
												>
													Remove
												</button>
											</div>
										</div>
									</article>
								</div>

								<dl class="space-y-2 border-t border-deep-navy/10 pt-3 text-sm text-deep-navy/85">
									<div class="flex items-center justify-between">
										<dt>Items</dt>
										<dd class="font-semibold">{{ cartItemCount }}</dd>
									</div>
									<div class="flex items-center justify-between">
										<dt>Status</dt>
										<dd class="font-semibold capitalize">{{ cartOrder.status || 'draft' }}</dd>
									</div>
									<div class="flex items-center justify-between text-base font-black">
										<dt>Total</dt>
										
										<dd>{{ cartTotalAmount }}</dd>
									</div>
								</dl>
							</div>

							<NuxtLink
								:to="checkoutHref"
								class="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-deep-navy px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
								:class="{ 'pointer-events-none opacity-50': !canCheckout }"
							>
								{{ cartOrder?.status === 'draft' ? 'Proceed to checkout' : 'View cart' }}
							</NuxtLink>
						</article>
					</div>
				</aside>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ProductList, ProductVariantList } from '~/api/types.gen'
import { productsListVariantsList } from '~/api/sdk.gen'
import BookingShopProductCard from '~/components/events/booking/shop/BookingShopProductCard.vue'
import { useBookingShop } from '~/composables/booking/useBookingShop'
import { useRemoveProductOrderItem, useUpdateProductOrderItem } from '~/composables/resources/products/productOrders'
import { useProducts } from '~/composables/resources/products/products'
import { formatMoney } from '~/utils/money'

definePageMeta({
	layout: 'booking',
})

const toast = useToast()

const {
	store,
	eventId,
	bookingReference,
	eventNumericId,
	booking,
	bookingQuery,
	attendees,
	selectedAttendeeId,
	activeOrderId,
	activeOrderQuery,
	addVariantToCart,
	isOrderCreationBlocked,
	orderCreationBlockedReason,
} = useBookingShop()

const updateItemMutation = useUpdateProductOrderItem()
const removeItemMutation = useRemoveProductOrderItem()
const pendingUpdateItemIds = ref<number[]>([])
const pendingRemoveItemIds = ref<number[]>([])

const productsQuery = useProducts(
	computed(() => {
		if (!eventNumericId.value) return undefined
		return {
			event: eventNumericId.value,
			is_active: true,
			in_stock: true,
			ordering: 'title',
			page_size: 100,
		}
	})
)

const products = computed<ProductList[]>(() => {
	const rows = productsQuery.data.value?.data?.results
	return Array.isArray(rows) ? (rows as ProductList[]) : []
})

const variantLookupQuery = useQuery({
	queryKey: computed(() => ['shop', 'variant-lookup', ...products.value.map((product) => product.product_id)]),
	queryFn: async () => {
		const responses = await Promise.all(
			products.value.map((product) => productsListVariantsList({
				path: { product_product_id: product.product_id },
			}))
		)

		return responses.flatMap((response) => {
			const rows = response.data?.results
			return Array.isArray(rows) ? (rows as ProductVariantList[]) : []
		})
	},
	enabled: computed(() => products.value.length > 0),
})

const variantByNumericId = computed(() => {
	const map = new Map<number, ProductVariantList>()
	const rows = variantLookupQuery.data.value || []
	rows.forEach((variant) => {
		if (typeof variant.id === 'number') {
			map.set(variant.id, variant)
		}
	})
	return map
})

const cartOrder = computed(() => activeOrderQuery.data.value?.data)
const isDraftCartOrder = computed(() => String(cartOrder.value?.status || '').toLowerCase() === 'draft')
const cartItemCount = computed(() => {
	const rows = cartOrder.value?.order_items
	if (!Array.isArray(rows)) return 0
	return rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
})

const cartPreviewItems = computed(() => {
	const rows = cartOrder.value?.order_items || []
	return rows.map((item) => {
		const variantId = typeof item.product_variant === 'number' ? item.product_variant : -1
		const variant = variantByNumericId.value.get(variantId)
		const color = (variant?.color || '').trim()
		const size = (variant?.size_display || '').trim()
		const subtitle = [color, size].filter(Boolean).join(' · ') || 'Variant details unavailable'
		const imageUrl = variant?.images?.main?.url || 'https://placehold.co/160x160?text=Variant'

		return {
			id: item.id,
			title: variant?.product_title || 'Product variant',
			subtitle,
			imageUrl,
			quantity: item.quantity,
			unitPrice: item.unit_price,
			totalPrice: item.total_price,
		}
	})
})
const cartTotalAmount = computed(() => cartOrder.value?.total_amount || '0')

const currencyCode = computed(() => 'GBP')
const canCheckout = computed(() => !!cartOrder.value && cartItemCount.value > 0)

const attendeeModel = computed({
	get: () => selectedAttendeeId.value || '',
	set: (nextValue: string) => {
		store.setSelectedAttendee(nextValue || null)
	},
})

const cartHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}/shop/cart`)
const checkoutHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}/shop/checkout`)

function isUpdatingItem(orderItemId: number) {
	return pendingUpdateItemIds.value.includes(orderItemId)
}

function isRemovingItem(orderItemId: number) {
	return pendingRemoveItemIds.value.includes(orderItemId)
}

async function updateCartItemQuantity(orderItemId: number, quantity: number) {
	if (!activeOrderId.value || !isDraftCartOrder.value || quantity < 1 || isUpdatingItem(orderItemId)) return

	pendingUpdateItemIds.value = [...pendingUpdateItemIds.value, orderItemId]
	try {
		await updateItemMutation.mutateAsync({
			orderId: activeOrderId.value,
			orderItemId,
			quantity,
		})
		await activeOrderQuery.refetch()
	} catch (error: unknown) {
		const description = error instanceof Error ? error.message : 'Unable to update quantity right now.'
		toast.add({
			title: 'Quantity update failed',
			description,
			color: 'red',
			timeout: 4500,
		})
	} finally {
		pendingUpdateItemIds.value = pendingUpdateItemIds.value.filter((id) => id !== orderItemId)
	}
}

async function removeCartItem(orderItemId: number) {
	if (!activeOrderId.value || !isDraftCartOrder.value || isRemovingItem(orderItemId)) return

	pendingRemoveItemIds.value = [...pendingRemoveItemIds.value, orderItemId]
	try {
		await removeItemMutation.mutateAsync({
			orderId: activeOrderId.value,
			orderItemId,
		})
		await activeOrderQuery.refetch()
	} catch (error: unknown) {
		const description = error instanceof Error ? error.message : 'Unable to remove item right now.'
		toast.add({
			title: 'Remove failed',
			description,
			color: 'red',
			timeout: 4500,
		})
	} finally {
		pendingRemoveItemIds.value = pendingRemoveItemIds.value.filter((id) => id !== orderItemId)
	}
}

async function onAddItem(variantId: string, quantity: number) {
	try {
		await addVariantToCart(variantId, quantity)
		await activeOrderQuery.refetch()

		toast.add({
			title: 'Added to cart',
			description: `Quantity ${quantity} has been added.`,
			color: 'green',
			timeout: 2000,
		})
	} catch (error: unknown) {
		const description = error instanceof Error ? error.message : 'Unable to add item right now.'
		toast.add({
			title: 'Unable to add item',
			description,
			color: 'red',
			timeout: 4500,
		})
	}
}
</script>