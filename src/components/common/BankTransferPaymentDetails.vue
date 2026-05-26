<template>
	<div class="grid gap-3 sm:grid-cols-2">
		<!-- Account name -->
		<div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
			<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Account name</p>
			<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.account_name || 'TBA' }}</p>
		</div>

		<!-- Sort code -->
		<div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
			<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Sort code</p>
			<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.sort_code || 'TBA' }}</p>
		</div>

		<!-- Account number -->
		<div class="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:col-span-2">
			<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Account number</p>
			<p class="mt-1 text-sm font-semibold text-blue-900">{{ bankDetails.account_number || 'TBA' }}</p>
		</div>

		<!-- Amount to pay (optional display) -->
		<div v-if="amountToPay" class="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:col-span-2">
			<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Amount to pay</p>
			<p class="mt-1 text-xl font-black text-blue-900">{{ amountToPay }}</p>
		</div>

		<!-- Payment reference -->
		<div class="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:col-span-2">
			<p class="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Pay to the account with this reference</p>
			<p v-if="reservedBankTransferLoading" class="mt-1 text-sm font-semibold text-blue-900">Reserving your reference...</p>
			<p v-else-if="reservedBankTransferReference" class="mt-1 flex items-center gap-2 text-lg font-black tracking-[0.16em] text-blue-900">
				<UIcon name="i-heroicons-banknotes" class="h-5 w-5" />
				{{ reservedBankTransferReference }}
			</p>
			<p v-else class="mt-1 text-sm text-blue-900">Your reference will appear here once reserved.</p>
			<div v-if="reservedBankTransferError" class="mt-2 space-y-1">
				<p class="text-xs font-semibold text-red-600">{{ reservedBankTransferError }}</p>
				<button
					type="button"
					class="text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
					@click="emit('retry')"
				>
					Retry
				</button>
			</div>
			<p v-else-if="reservedBankTransferPaymentReference" class="mt-2 flex items-center gap-1 text-[13px] text-blue-700">
				<UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5" />
				Failure to use the reserved reference or uploading evidence may result in payment delays or issues.
			</p>
			<p v-if="bankTransferInstructions" class="mt-2 text-xs font-medium text-blue-800">{{ bankTransferInstructions }}</p>
		</div>

		<!-- Evidence upload -->
		<div v-if="isBankTransferEvidenceRequiredImmediately" class="space-y-3 rounded-lg border border-amber-200 bg-white p-3 sm:col-span-2">
			<p class="text-xs font-semibold text-slate-800">Upload transfer evidence</p>
			<p class="text-[11px] text-slate-500">Upload an image of the money you have sent to our account. Ensure the photo quality is clear and the reference is visible.</p>
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="sm:col-span-2">
					<label class="mb-1 block text-[11px] font-semibold text-slate-700">Evidence file <span class="text-red-600">*</span></label>
					<div
						class="relative overflow-hidden rounded-xl border-2 border-dashed p-4 text-center transition-colors"
						:class="dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'"
						@dragenter.prevent="dragActive = true"
						@dragover.prevent="dragActive = true"
						@dragleave.prevent="dragActive = false"
						@drop.prevent="onDrop"
					>
						<input
							ref="fileInputRef"
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							class="absolute inset-0 cursor-pointer opacity-0"
							@change="onFileChange"
						>
						<div class="pointer-events-none flex flex-col items-center justify-center gap-2">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
								<UIcon name="i-heroicons-cloud-arrow-up" class="h-5 w-5" />
							</div>
							<p class="text-xs font-semibold text-slate-800">Drag and drop evidence here, or click to upload</p>
							<p class="text-[11px] text-slate-500">Accepted: PDF/JPG/JPEG/PNG up to 10MB.</p>
							<p v-if="evidenceFileName" class="text-[11px] font-semibold text-emerald-700">
								Attached: {{ evidenceFileName }}
							</p>
						</div>
					</div>
					<p v-if="bankTransferEvidenceErrors?.evidence_file" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.evidence_file }}</p>
				</div>
				<div>
					<label class="mb-1 block text-[11px] font-semibold text-slate-700">Payer name <span class="text-red-600">*</span></label>
					<UInput v-model="bankTransferEvidence.payer_name" placeholder="Full name on the transfer" />
					<p v-if="bankTransferEvidenceErrors?.payer_name" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.payer_name }}</p>
				</div>
				<div>
					<label class="mb-1 block text-[11px] font-semibold text-slate-700">Payer account last 4 <span class="text-red-600">*</span></label>
					<UInput v-model="bankTransferEvidence.payer_account_last4" placeholder="1234" maxlength="4" />
					<p v-if="bankTransferEvidenceErrors?.payer_account_last4" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.payer_account_last4 }}</p>
				</div>
				<div class="sm:col-span-2">
					<label class="mb-1 block text-[11px] font-semibold text-slate-700">Amount on evidence <span class="text-red-600">*</span></label>
					<UInput
						:model-value="bankTransferEvidence.amount_on_evidence ?? undefined"
						type="number"
						min="0"
						step="0.01"
						:readonly="isAmountLocked"
						:disabled="isAmountLocked"
						@update:model-value="(v) => { bankTransferEvidence.amount_on_evidence = v === '' || v === undefined ? null : Number(v) }"
					/>
					<p v-if="isAmountLocked" class="mt-1 text-[11px] text-slate-500">
						Locked to checkout total: {{ formattedLockedAmount }}
					</p>
					<p v-if="bankTransferEvidenceErrors?.amount_on_evidence" class="mt-1 text-xs font-semibold text-red-600">{{ bankTransferEvidenceErrors.amount_on_evidence }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { formatMoney } from '~/utils/money'

const props = defineProps<{
	bankDetails: { account_name?: string; sort_code?: string; account_number?: string }
	amountToPay?: string | null
	reservedBankTransferLoading: boolean
	reservedBankTransferReference: string | null
	reservedBankTransferError?: string
	reservedBankTransferPaymentReference?: string | null
	isBankTransferEvidenceRequiredImmediately: boolean
	bankTransferEvidence: { payer_name: string; payer_account_last4: string; amount_on_evidence: number | string | null | undefined; evidence_file?: File | null; [key: string]: any }
	bankTransferEvidenceErrors?: { evidence_file?: string; payer_name?: string; payer_account_last4?: string; amount_on_evidence?: string }
	bankTransferInstructions?: string | null
	amountLocked?: number | null
	amountCurrency?: string
}>()

const emit = defineEmits<{
	'file-change': [file: File | null]
	'retry': []
}>()

const dragActive = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const evidenceFileName = computed(() => {
	const file = props.bankTransferEvidence?.evidence_file
	if (!file) return ''
	if (typeof file === 'string') return file
	if (typeof file === 'object' && 'name' in file) return String(file.name || '')
	return ''
})

const isAmountLocked = computed(() => props.amountLocked !== undefined && props.amountLocked !== null)

const formattedLockedAmount = computed(() => {
	if (!isAmountLocked.value || props.amountLocked == null) return ''
	return formatMoney(props.amountLocked, props.amountCurrency || 'GBP')
})

const onFileChange = (event: Event) => {
	const input = event.target as HTMLInputElement
	emit('file-change', input.files?.[0] ?? null)
}

const onDrop = (event: DragEvent) => {
	dragActive.value = false
	const file = event.dataTransfer?.files?.[0] ?? null
	if (file && fileInputRef.value) {
		const dt = new DataTransfer()
		dt.items.add(file)
		fileInputRef.value.files = dt.files
	}
	emit('file-change', file)
}
</script>
