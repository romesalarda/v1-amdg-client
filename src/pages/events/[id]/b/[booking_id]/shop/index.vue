<template>
	<div class="min-h-screen bg-mist-blue">
		<section class="relative h-[220px] w-full overflow-hidden md:h-[280px]">
			<div class="absolute inset-0 bg-deep-navy">
				<img
					v-if="heroImageSrc"
					:src="heroImageSrc"
					alt="Shop hero"
					class="h-full w-full object-cover"
					@error="onImageError"
				>
				<div v-else class="h-full w-full bg-gradient-to-br from-blue-600 to-deep-navy" />
			</div>
			<div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/45 to-deep-navy/10" />

			<div class="absolute inset-0 flex items-end">
				<div class="mx-auto flex w-full max-w-screen-xl flex-wrap items-end justify-between gap-3 px-4 pb-6 md:px-6 md:pb-8">
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">Booking shop</p>
						<h1 class="mt-2 text-3xl font-black text-white md:text-5xl">{{ eventTitle }}</h1>
						<p class="mt-2 text-sm text-white/80">
							Shopping for {{ selectedAttendeeLabel }}
						</p>
					</div>
					<NuxtLink
						:to="bookingWorkspaceHref"
						class="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white hover:bg-white/20"
					>
						Back to Booking
					</NuxtLink>
				</div>
			</div>
		</section>

		<div class="mx-auto max-w-screen-xl space-y-5 px-4 py-6 md:px-6">

			<!-- <section class="rounded-3xl border border-deep-navy/10 bg-white p-5 shadow-sm">
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12 xl:items-end">
					<div class="xl:col-span-6">
					
						<p class="mt-1 text-[11px] text-deep-navy/45">Booking ref {{ booking?.booking_reference || bookingReference }}</p>
					</div>

					<div class="flex items-center gap-2 xl:col-span-3 xl:justify-end">
						<NuxtLink
							:to="cartHref"
							class="inline-flex items-center rounded-xl bg-deep-navy px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
						>
							Cart ({{ cartItemCount }})
						</NuxtLink>
					</div>
				</div>
			</section> -->

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
							No products matched your filters. Try broadening your search.
						</div>

						<div
							v-else
						class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
							:class="{ 'opacity-60': isOrderCreationBlocked }"
						>
							<BookingShopProductCard
								v-for="product in products"
								:key="product.product_id"
								:product="product"
								:attendee-id="selectedAttendeeId || undefined"
								:currency-code="currencyCode"
								:add-disabled="isOrderCreationBlocked"
								:add-disabled-reason="orderCreationBlockedReason"
								@add="(payload) => onAddItem(payload.variantId, payload.quantity)"
							/>
						</div>

						<div v-if="products.length > 0" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-deep-navy/10 bg-white px-4 py-3 text-sm text-deep-navy/80">
							<p>
								Showing page {{ currentPage }} of {{ totalPages }} · {{ totalProducts }} product(s)
							</p>
							<div class="flex items-center gap-2">
								<label class="text-xs text-deep-navy/60">
									Page size
									<select v-model="pageSizeModel" class="ml-1 rounded-lg border border-deep-navy/20 bg-white px-2 py-1 text-xs text-deep-navy">
										<option value="6">6</option>
										<option value="12">12</option>
										<option value="24">24</option>
									</select>
								</label>
								<button
									type="button"
									class="rounded-lg border border-deep-navy/20 px-3 py-1.5 text-xs font-semibold text-deep-navy disabled:opacity-40"
									:disabled="!hasPreviousPage"
									@click="goToPage(currentPage - 1)"
								>
									Previous
								</button>
								<button
									type="button"
									class="rounded-lg border border-deep-navy/20 px-3 py-1.5 text-xs font-semibold text-deep-navy disabled:opacity-40"
									:disabled="!hasNextPage"
									@click="goToPage(currentPage + 1)"
								>
									Next
								</button>
							</div>
						</div>
					</template>
				</div>

				<aside class="space-y-4 xl:col-span-4 min-h-[200px]">
					<div class="xl:sticky xl:top-5 space-y-4">
						<article class="rounded-2xl border border-deep-navy/10 bg-white p-4 shadow-sm">
							<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Attendee</p>
							<select
								v-model="attendeeModel"
								class="mt-1 w-full rounded-xl border border-deep-navy/20 bg-white px-3 py-2.5 text-sm mb-5"
							>
								<option v-for="attendee in attendees" :key="attendee.id" :value="attendee.id">
									{{ attendee.name || attendee.display_id || 'Attendee' }}
								</option>
							</select>
							<div class="flex items-center justify-between gap-2">
								<div>
									<p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Checkout preview</p>
									<h2 class="mt-1 text-lg font-black text-deep-navy">Cart & filters</h2>
										
								</div>
								<div class="rounded-lg border border-deep-navy/10 bg-mist-blue/40 p-1">
									<button
										type="button"
										class="rounded-md px-2.5 py-1 text-[11px] font-black uppercase tracking-wide"
										:class="sidebarPanel === 'cart' ? 'bg-deep-navy text-white' : 'text-deep-navy/70'"
										@click="sidebarPanel = 'cart'"
									>
										Cart
									</button>
									<button
										type="button"
										class="rounded-md px-2.5 py-1 text-[11px] font-black uppercase tracking-wide"
										:class="sidebarPanel === 'filters' ? 'bg-deep-navy text-white' : 'text-deep-navy/70'"
										@click="sidebarPanel = 'filters'"
									>
										Filters
									</button>
								</div>
							</div>

							<Transition
								enter-active-class="transition duration-200 ease-out"
								enter-from-class="opacity-0 translate-y-1"
								enter-to-class="opacity-100 translate-y-0"
								leave-active-class="transition duration-150 ease-in"
								leave-from-class="opacity-100 translate-y-0"
								leave-to-class="opacity-0 translate-y-1"
								mode="out-in"
							>
								<div v-if="sidebarPanel === 'cart'" key="cart-panel">

									<div v-if="!cartOrder" class="mt-3 rounded-xl border border-dashed border-deep-navy/20 bg-mist-blue p-3 text-xs text-deep-navy/70 min-h-[130px] flex items-center justify-center text-center">
										<div class="flex flex-col items-center gap-2">
											<UIcon name="i-heroicons-shopping-cart" class="text-3xl text-deep-navy/30" />
											<h3 class="font-semibold text-deep-navy">Your cart is empty</h3>
											<p class="text-[11px] text-deep-navy/70">Browse products and add them to your cart to see them here. Your cart will be saved as you shop, so you can take your time.</p>
										</div>
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
								</div>

								<div v-else key="filters-panel" class="mt-3 space-y-3">
									<label class="space-y-1 block">
										<span class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Search</span>
										<input
											v-model.trim="searchTerm"
											type="text"
											placeholder="Find by title or code"
											class="w-full rounded-xl border border-deep-navy/20 bg-white px-3 py-2 text-sm text-deep-navy"
										>
									</label>

									<label class="space-y-1 block">
										<span class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Category</span>
										<select v-model="selectedCategoryIdModel" class="w-full rounded-xl border border-deep-navy/20 bg-white px-3 py-2 text-sm text-deep-navy">
											<option :value="''">All categories</option>
											<option v-for="option in categoryOptions" :key="option.id" :value="String(option.id)">
												{{ option.name }}
											</option>
										</select>
									</label>

									<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
										<label class="space-y-1 block">
											<span class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Price min</span>
											<input
												v-model.number="minPrice"
												type="number"
												min="0"
												placeholder="0"
												class="w-full rounded-xl border border-deep-navy/20 bg-white px-3 py-2 text-sm text-deep-navy"
											>
										</label>
										<label class="space-y-1 block">
											<span class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/55">Price max</span>
											<input
												v-model.number="maxPrice"
												type="number"
												min="0"
												placeholder="No limit"
												class="w-full rounded-xl border border-deep-navy/20 bg-white px-3 py-2 text-sm text-deep-navy"
											>
										</label>
									</div>

									<label class="inline-flex items-center gap-2 rounded-xl border border-deep-navy/20 px-3 py-2 text-xs font-semibold text-deep-navy">
										<input v-model="inStockOnly" type="checkbox" class="h-4 w-4">
										In stock only
									</label>

									<div class="grid grid-cols-2 gap-2">
										<button
											type="button"
											class="rounded-xl border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
											@click="resetProductFilters"
										>
											Reset
										</button>
										<button
											type="button"
											class="rounded-xl bg-deep-navy px-3 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700"
											@click="applyProductFilters"
										>
											Apply
										</button>
									</div>
								</div>
							</Transition>
						</article>
					</div>
				</aside>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ProductList, ProductVariantList } from '~/api/types.gen'
import { useQueryClient } from '@tanstack/vue-query'
import { productsListVariantsList } from '~/api/sdk.gen'
import BookingShopProductCard from '~/components/events/booking/shop/BookingShopProductCard.vue'
import { useBookingShop } from '~/composables/booking/useBookingShop'
import { useRemoveProductOrderItem, useUpdateProductOrderItem } from '~/composables/resources/products/productOrders'
import { useProductEventCategories } from '~/composables/resources/products/productEventCategories'
import { useProducts } from '~/composables/resources/products/products'
import { useEvent } from '~/composables/resources/events'
import { onImageError, resolveImageUrl } from '~/utils/image'
import { formatMoney } from '~/utils/money'

definePageMeta({
	layout: 'booking',
})

const toast = useToast()
const route = useRoute()
const router = useRouter()

const {
	store,
	eventId,
	bookingReference,
	eventUUID,
	eventUrlSafeTitle,
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

const { data: eventData } = useEvent(eventId)
const eventTitle = computed(() => eventData.value?.data?.title || bookingQuery.data.value?.event?.title || 'Event shop')
const heroImageSrc = computed(() => resolveImageUrl(eventData.value?.data?.main_landing_image?.image || null, ''))
const bookingWorkspaceHref = computed(() => `/events/${eventId.value}/b/${bookingReference.value}`)

const DEFAULT_PAGE_SIZE = 6
const currentPage = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const searchTerm = ref('')
const selectedCategoryId = ref<number | null>(null)
const inStockOnly = ref(true)
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const sidebarPanel = ref<'cart' | 'filters'>('cart')

const managedQueryKeys = new Set(['page', 'page_size', 'search', 'category', 'in_stock', 'min_price', 'max_price'])

function parsePositiveInt(value: unknown, fallback: number) {
	const parsed = Number(value)
	if (!Number.isFinite(parsed) || parsed < 1) return fallback
	return Math.floor(parsed)
}

function parseOptionalNumber(value: unknown) {
	const parsed = Number(value)
	if (!Number.isFinite(parsed) || parsed < 0) return null
	return parsed
}

function hydrateStateFromRoute() {
	currentPage.value = parsePositiveInt(route.query.page, 1)
	pageSize.value = parsePositiveInt(route.query.page_size, DEFAULT_PAGE_SIZE)
	searchTerm.value = String(route.query.search || '').trim()
	selectedCategoryId.value = route.query.category ? parsePositiveInt(route.query.category, 1) : null
	inStockOnly.value = route.query.in_stock !== 'false'
	minPrice.value = parseOptionalNumber(route.query.min_price)
	maxPrice.value = parseOptionalNumber(route.query.max_price)
}

function buildManagedQuery() {
	const nextQuery: Record<string, string> = {}
	Object.entries(route.query).forEach(([key, value]) => {
		if (managedQueryKeys.has(key)) return
		if (Array.isArray(value)) {
			if (typeof value[0] === 'string') nextQuery[key] = value[0]
			return
		}
		if (typeof value === 'string') {
			nextQuery[key] = value
		}
	})

	nextQuery.page = String(currentPage.value)
	nextQuery.page_size = String(pageSize.value)
	if (searchTerm.value) nextQuery.search = searchTerm.value
	if (selectedCategoryId.value) nextQuery.category = String(selectedCategoryId.value)
	if (!inStockOnly.value) nextQuery.in_stock = 'false'
	if (minPrice.value !== null) nextQuery.min_price = String(minPrice.value)
	if (maxPrice.value !== null) nextQuery.max_price = String(maxPrice.value)

	return nextQuery
}

async function syncManagedQuery() {
	await router.replace({ query: buildManagedQuery() })
}

hydrateStateFromRoute()

watch(
	() => route.query,
	() => {
		hydrateStateFromRoute()
	},
	{ deep: true }
)

const selectedAttendeeFromQuery = computed(() => String(route.query.attendee || '').trim())
watch(
	[selectedAttendeeFromQuery, attendees],
	([attendeeFromQuery, rows]) => {
		if (!attendeeFromQuery) return
		const match = rows.find((item) => item.id === attendeeFromQuery)
		if (match?.id) {
			store.setSelectedAttendee(match.id)
		}
	},
	{ immediate: true }
)

const selectedAttendee = computed(() => attendees.value.find((item) => item.id === selectedAttendeeId.value) || null)
const selectedAttendeeLabel = computed(() => {
	if (!selectedAttendee.value) return 'your selected attendee'
	return selectedAttendee.value.name || selectedAttendee.value.display_id || 'selected attendee'
})

const updateItemMutation = useUpdateProductOrderItem()
const removeItemMutation = useRemoveProductOrderItem()
const queryClient = useQueryClient()
const pendingUpdateItemIds = ref<number[]>([])
const pendingRemoveItemIds = ref<number[]>([])

const eventCategoryQuery = useProductEventCategories(
	computed(() => {
		if (!eventUrlSafeTitle.value) return undefined
		return {
			event: eventUrlSafeTitle.value,
			ordering: 'category__name',
			page_size: 100,
		}
	})
)

const categoryOptions = computed(() => {
	const rows = eventCategoryQuery.data.value?.data?.results || []
	const unique = new Map<number, string>()
	rows.forEach((row) => {
		if (typeof row.category === 'number' && row.category_name) {
			unique.set(row.category, row.category_name)
		}
	})
	return Array.from(unique.entries())
		.map(([id, name]) => ({ id, name }))
		.sort((a, b) => a.name.localeCompare(b.name))
})

const productsQuery = useProducts(
	computed(() => {
		if (!eventUrlSafeTitle.value) return undefined
		return {
			event: eventUrlSafeTitle.value,
			attendee_id: selectedAttendeeId.value || undefined,
			is_active: true,
			in_stock: inStockOnly.value ? true : undefined,
			ordering: 'title',
			page: currentPage.value,
			page_size: pageSize.value,
			search: searchTerm.value || undefined,
			category: selectedCategoryId.value ? [selectedCategoryId.value] : undefined,
			min_price: minPrice.value ?? undefined,
			max_price: maxPrice.value ?? undefined,
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
				query: {
					attendee_id: selectedAttendeeId.value || undefined,
				},
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

const totalProducts = computed(() => Number(productsQuery.data.value?.data?.count || 0))
const totalPages = computed(() => Math.max(1, Math.ceil(totalProducts.value / Math.max(1, pageSize.value))))
const hasNextPage = computed(() => !!productsQuery.data.value?.data?.next)
const hasPreviousPage = computed(() => !!productsQuery.data.value?.data?.previous)

watch(totalPages, (pages) => {
	if (currentPage.value > pages) {
		currentPage.value = pages
		void syncManagedQuery()
	}
})

const selectedCategoryIdModel = computed({
	get: () => (selectedCategoryId.value ? String(selectedCategoryId.value) : ''),
	set: (value: string) => {
		selectedCategoryId.value = value ? parsePositiveInt(value, 1) : null
	},
})

const pageSizeModel = computed({
	get: () => String(pageSize.value),
	set: (value: string) => {
		pageSize.value = parsePositiveInt(value, DEFAULT_PAGE_SIZE)
		currentPage.value = 1
		void syncManagedQuery()
	},
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
const checkoutHref = computed(() => ({
	path: `/events/${eventId.value}/b/${bookingReference.value}/shop/checkout`,
	query: selectedAttendeeId.value ? { attendee: selectedAttendeeId.value } : undefined,
}))

function applyProductFilters() {
	currentPage.value = 1
	sidebarPanel.value = 'cart'
	void syncManagedQuery()
}

function resetProductFilters() {
	searchTerm.value = ''
	selectedCategoryId.value = null
	inStockOnly.value = true
	minPrice.value = null
	maxPrice.value = null
	currentPage.value = 1
	pageSize.value = DEFAULT_PAGE_SIZE
	sidebarPanel.value = 'cart'
	void syncManagedQuery()
}

function goToPage(nextPage: number) {
	if (nextPage < 1 || nextPage > totalPages.value || nextPage === currentPage.value) return
	currentPage.value = nextPage
	void syncManagedQuery()
}

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
		await queryClient.invalidateQueries({ queryKey: ['product-variants'] })
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
		await queryClient.invalidateQueries({ queryKey: ['product-variants'] })
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
		await queryClient.invalidateQueries({ queryKey: ['product-variants'] })

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