<template>
	<div class="min-h-screen bg-mist-blue">
		<div class="mx-auto max-w-screen-xl space-y-4 px-4 py-6 md:px-6">
			<section class="rounded-3xl border border-deep-navy/10 bg-white p-5 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Booking {{ bookingReference }}</p>
						<h1 class="mt-1 text-2xl font-black text-deep-navy">Cart</h1>
						<p class="mt-1 text-sm text-deep-navy/65">Review selected products and continue to payment.</p>
					</div>
					<div class="flex items-center gap-2">
						<NuxtLink
							:to="shopHref"
							class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
						>
							Back to Shop
						</NuxtLink>
						<NuxtLink
							:to="checkoutHref"
							class="rounded-lg bg-deep-navy px-3 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
							:class="{ 'pointer-events-none opacity-50': !canCheckout }"
						>
							Continue to Checkout
						</NuxtLink>
					</div>
				</div>
			</section>

			<section v-if="activeOrderQuery.isLoading.value" class="rounded-2xl border border-deep-navy/10 bg-white p-5 text-sm text-deep-navy/70">
				Loading cart...
			</section>

			<section v-else-if="!order" class="rounded-2xl border border-deep-navy/10 bg-white p-5 text-sm text-deep-navy/70">
				Your cart is currently empty. Add items from the shop.
			</section>

			<section v-else class="grid grid-cols-1 gap-4 lg:grid-cols-12">
				<div class="space-y-3 lg:col-span-8">
					<div
						v-if="!isDraftOrder"
						class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800"
					>
						This order is {{ order.status }} and can no longer be edited. Quantity changes and item removal are only available for draft orders.
					</div>

					<article
						v-for="item in order.order_items"
						:key="item.id"
						class="rounded-2xl border border-deep-navy/10 bg-white p-4"
					>
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div>
								<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Line item</p>
								<p class="mt-1 text-sm font-semibold text-deep-navy">Variant #{{ item.product_variant || '-' }}</p>
								<p class="mt-1 text-xs text-deep-navy/60">Quantity {{ item.quantity }}</p>
								<div class="mt-3 flex flex-wrap items-center gap-2">
									<button
										type="button"
										class="rounded-lg border border-deep-navy/20 px-2 py-1 text-xs font-bold text-deep-navy disabled:cursor-not-allowed disabled:opacity-50"
										:disabled="!isDraftOrder || isUpdatingItem(item.id) || Number(item.quantity || 0) <= 1"
										@click="updateItemQuantity(item.id, Number(item.quantity || 1) - 1)"
									>
										-
									</button>
									<button
										type="button"
										class="rounded-lg border border-deep-navy/20 px-2 py-1 text-xs font-bold text-deep-navy disabled:cursor-not-allowed disabled:opacity-50"
										:disabled="!isDraftOrder || isUpdatingItem(item.id)"
										@click="updateItemQuantity(item.id, Number(item.quantity || 0) + 1)"
									>
										+
									</button>
									<button
										type="button"
										class="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
										:disabled="!isDraftOrder || isRemovingItem(item.id)"
										@click="removeItem(item.id)"
									>
										Remove
									</button>
								</div>
							</div>
							<div class="text-right">
								<p class="text-xs text-deep-navy/60">Unit {{ item.unit_price }}</p>
								<p class="mt-1 text-sm font-black text-deep-navy">{{ item.total_price }}</p>
							</div>
						</div>
					</article>
				</div>

				<aside class="space-y-3 lg:col-span-4">
					<article class="rounded-2xl border border-deep-navy/10 bg-white p-4">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Summary</p>
						<dl class="mt-3 space-y-2 text-sm text-deep-navy/85">
							<div class="flex items-center justify-between">
								<dt>Items</dt>
								<dd class="font-semibold">{{ itemCount }}</dd>
							</div>
							<div class="flex items-center justify-between">
								<dt>Status</dt>
								<dd class="font-semibold capitalize">{{ order.status }}</dd>
							</div>
							<div class="flex items-center justify-between border-t border-deep-navy/10 pt-2">
								<dt class="font-black">Total</dt>
								<dd class="font-black">{{ order.total_amount }}</dd>
							</div>
						</dl>
					</article>

					<article class="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
						Variant discounts, stock checks, and final eligibility are validated by backend order pricing.
					</article>
				</aside>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useBookingShop } from '~/composables/booking/useBookingShop'
import { useRemoveProductOrderItem, useUpdateProductOrderItem } from '~/composables/resources/products/productOrders'
import { formatMoney } from '~/utils/money'

definePageMeta({
	layout: 'booking',
})

const {
	eventId,
	bookingReference,
	activeOrderId,
	activeOrderQuery,
} = useBookingShop()

const toast = useToast()
const updateItemMutation = useUpdateProductOrderItem()
const removeItemMutation = useRemoveProductOrderItem()
const pendingUpdateItemIds = ref<number[]>([])
const pendingRemoveItemIds = ref<number[]>([])

const order = computed(() => activeOrderQuery.data.value?.data || null)
const isDraftOrder = computed(() => String(order.value?.status || '').toLowerCase() === 'draft')
const itemCount = computed(() => {
	const rows = order.value?.order_items || []
	return rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
})

const currencyCode = computed(() => 'GBP')
const canCheckout = computed(() => !!order.value && itemCount.value > 0)

const shopHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}/shop`)
const checkoutHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}/shop/checkout`)

function isUpdatingItem(orderItemId: number) {
	return pendingUpdateItemIds.value.includes(orderItemId)
}

function isRemovingItem(orderItemId: number) {
	return pendingRemoveItemIds.value.includes(orderItemId)
}

async function updateItemQuantity(orderItemId: number, quantity: number) {
	if (!activeOrderId.value || !isDraftOrder.value) return
	if (quantity < 1) return
	if (isUpdatingItem(orderItemId)) return

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

async function removeItem(orderItemId: number) {
	if (!activeOrderId.value || !isDraftOrder.value) return
	if (isRemovingItem(orderItemId)) return

	pendingRemoveItemIds.value = [...pendingRemoveItemIds.value, orderItemId]
	try {
		await removeItemMutation.mutateAsync({
			orderId: activeOrderId.value,
			orderItemId,
		})
		await activeOrderQuery.refetch()

		toast.add({
			title: 'Item removed',
			description: 'The selected line item was removed from your cart.',
			color: 'green',
			timeout: 2200,
		})
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
</script>