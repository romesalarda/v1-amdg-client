<template>
	<div>
		<section
			v-if="active"
			class="rounded-2xl border p-4"
			:class="toneClasses.box"
			role="timer"
			aria-live="off"
		>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p class="text-[10px] font-black uppercase tracking-[0.2em]" :class="toneClasses.label">Items reserved for you</p>
					<p class="mt-1 text-sm" :class="toneClasses.text">
						Complete your order before the timer ends or your cart will be released.
					</p>
				</div>
				<div class="flex items-center gap-3">
					<span class="font-mono text-3xl font-black tabular-nums" :class="toneClasses.label">{{ formattedTime }}</span>
					<button
						v-if="canExtend"
						type="button"
						class="rounded-lg border border-deep-navy/25 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy disabled:opacity-50"
						:disabled="extendMutation.isPending.value"
						@click="extendHold"
					>
						{{ extendMutation.isPending.value ? 'Extending…' : 'Need more time?' }}
					</button>
				</div>
			</div>
		</section>

		<Teleport to="body">
			<div v-if="showLeaveDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/60 p-4">
				<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="alertdialog" aria-modal="true">
					<h2 class="text-xl font-black text-deep-navy">Leave checkout?</h2>
					<p class="mt-2 text-sm text-deep-navy/70">
						Your items are only held for <strong>{{ formattedTime }}</strong> more. If you leave and don't return in time,
						your order will be cancelled and the items released to other buyers.
					</p>
					<div class="mt-5 flex flex-wrap justify-end gap-2">
						<button
							type="button"
							class="rounded-lg border border-deep-navy/20 px-4 py-2 text-xs font-black uppercase tracking-wide text-deep-navy hover:border-deep-navy"
							@click="resolveLeave(true)"
						>
							Leave anyway
						</button>
						<button
							type="button"
							class="rounded-lg bg-deep-navy px-4 py-2 text-xs font-black uppercase tracking-wide text-white"
							@click="resolveLeave(false)"
						>
							Stay
						</button>
					</div>
				</div>
			</div>

			<div v-if="showExpiredDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/60 p-4">
				<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="alertdialog" aria-modal="true">
					<h2 class="text-xl font-black text-deep-navy">Your order has expired</h2>
					<p class="mt-2 text-sm text-deep-navy/70">
						The reservation time ran out, so your order was cancelled and the items were released. You can start a new cart.
					</p>
					<div class="mt-5 flex justify-end">
						<button
							type="button"
							class="rounded-lg bg-deep-navy px-4 py-2 text-xs font-black uppercase tracking-wide text-white"
							@click="goToShop"
						>
							Start again
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useExtendProductOrderHold } from '~/composables/resources/products/productOrders'
import { extractApiErrorMessage } from '~/utils/errors'

const props = withDefaults(defineProps<{
	order: any | null
	shopPath: string
	guardLeave?: boolean
	paused?: boolean
}>(), { guardLeave: false, paused: false })

const toast = useToast()
const router = useRouter()
const queryClient = useQueryClient()
const extendMutation = useExtendProductOrderHold()

const deadline = ref<number | null>(null)
const now = ref(Date.now())
const expiredLocally = ref(false)
const showLeaveDialog = ref(false)
const showExpiredDialog = ref(false)
let timer: ReturnType<typeof setInterval> | null = null
let leaveResolver: ((ok: boolean) => void) | null = null

const status = computed(() => String(props.order?.status || '').toLowerCase())
const hasHold = computed(() => !!props.order?.expires_at && ['draft', 'pending'].includes(status.value) && !props.order?.expired_at)

// Anchor to the server-provided seconds so client clock skew doesn't matter.
watch(
	() => [props.order?.order_id, props.order?.expires_at, props.order?.seconds_remaining],
	() => {
		const seconds = props.order?.seconds_remaining
		deadline.value = hasHold.value && typeof seconds === 'number' ? Date.now() + seconds * 1000 : null
		now.value = Date.now()
	},
	{ immediate: true },
)

const secondsLeft = computed(() => (deadline.value === null ? null : Math.max(0, Math.ceil((deadline.value - now.value) / 1000))))
const active = computed(() => hasHold.value && secondsLeft.value !== null && !expiredLocally.value)
const canExtend = computed(() => !!props.order?.can_extend_hold && (secondsLeft.value ?? 0) <= 300)
const formattedTime = computed(() => {
	const total = secondsLeft.value ?? 0
	return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
})

const toneClasses = computed(() => {
	const s = secondsLeft.value ?? 0
	if (s <= 60) return { box: 'border-red-300 bg-red-50', label: 'text-red-700', text: 'text-red-700/80' }
	if (s <= 300) return { box: 'border-amber-300 bg-amber-50', label: 'text-amber-700', text: 'text-amber-700/80' }
	return { box: 'border-deep-navy/10 bg-white', label: 'text-deep-navy', text: 'text-deep-navy/65' }
})

const handleExpired = () => {
	if (expiredLocally.value) return
	expiredLocally.value = true
	showLeaveDialog.value = false
	showExpiredDialog.value = true
	queryClient.invalidateQueries({ queryKey: ['productOrders'] })
}

watch(
	() => [secondsLeft.value, props.paused] as const,
	([s, paused]) => {
		if (s === 0 && !paused && hasHold.value) handleExpired()
	},
)

const extendHold = async () => {
	if (!props.order?.order_id) return
	try {
		await extendMutation.mutateAsync({ orderId: props.order.order_id })
		toast.add({ title: 'Time extended', color: 'green' })
	} catch (error) {
		toast.add({ title: extractApiErrorMessage(error, 'Could not extend your time.'), color: 'red' })
	}
}

const goToShop = () => {
	showExpiredDialog.value = false
	router.push(props.shopPath)
}

const resolveLeave = (ok: boolean) => {
	showLeaveDialog.value = false
	leaveResolver?.(ok)
	leaveResolver = null
}

onBeforeRouteLeave((to) => {
	if (!props.guardLeave || !active.value || props.paused) return true
	if (to.path.startsWith(props.shopPath)) return true
	showLeaveDialog.value = true
	return new Promise<boolean>((resolve) => {
		leaveResolver = resolve
	})
})

const onBeforeUnload = (event: BeforeUnloadEvent) => {
	if (!props.guardLeave || !active.value || props.paused) return
	event.preventDefault()
	event.returnValue = ''
}

onMounted(() => {
	timer = setInterval(() => {
		now.value = Date.now()
		if (props.paused && deadline.value !== null) deadline.value += 1000
	}, 1000)
	window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
	if (timer) clearInterval(timer)
	window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>
