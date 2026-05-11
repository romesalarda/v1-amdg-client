<template>
	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">Discount code</label>
		<div class="flex gap-2">
			<UInput
				v-model="inputValue"
				placeholder="Enter code"
				:disabled="isLoading || !!appliedCode"
				maxlength="100"
				class="flex-1 font-mono uppercase"
				@keydown.enter.prevent="handleApply"
			/>
			<UButton
				v-if="!appliedCode"
				:loading="isLoading"
				:disabled="!inputValue.trim() || isLoading"
				color="gray"
				variant="solid"
				size="sm"
				@click="handleApply"
			>
				Apply
			</UButton>
			<UButton
				v-else
				color="red"
				variant="ghost"
				size="sm"
				@click="handleRemove"
			>
				Remove
			</UButton>
		</div>

		<!-- Applied state -->
		<div v-if="appliedCode" class="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
			<UIcon name="i-heroicons-check-circle" class="h-4 w-4 text-emerald-600" />
			<p class="text-xs font-semibold text-emerald-800">
				Code <span class="font-black uppercase tracking-wider">{{ appliedCode }}</span> applied
			</p>
		</div>

		<!-- Invalid state -->
		<div v-else-if="invalidMessage" class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
			<UIcon name="i-heroicons-x-circle" class="h-4 w-4 text-red-600" />
			<p class="text-xs font-semibold text-red-700">{{ invalidMessage }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { paymentsDiscountsValidateCodeCreate } from '~/api/sdk.gen'
import { useEvent } from '~/composables/resources/events/events'


const props = defineProps<{
	modelValue: string | null
	eventId: number | string | null | undefined
}>()

const { data: eventData } = useEvent(String(props.eventId) || '')

const emit = defineEmits<{
	'update:modelValue': [value: string | null]
}>()

const inputValue = ref('')
const isLoading = ref(false)
const invalidMessage = ref('')

const appliedCode = computed(() => props.modelValue || null)

const handleApply = async () => {
	const code = inputValue.value.trim().toUpperCase()
	if (!code) return

	const eventIdNum = Number(eventData.value?.data.id)
	if (!eventIdNum) {
		invalidMessage.value = 'Event context not available.'
		return
	}

	isLoading.value = true
	invalidMessage.value = ''

	try {
		const response = await paymentsDiscountsValidateCodeCreate({
			body: { code, event_id: eventIdNum },
		})

		const result = response.data as { valid?: boolean } | null
		if (result?.valid) {
			emit('update:modelValue', code)
			invalidMessage.value = ''
		} else {
			emit('update:modelValue', null)
			invalidMessage.value = 'Code not valid for this event.'
		}
	} catch {
		emit('update:modelValue', null)
		invalidMessage.value = 'Unable to validate code. Please try again.'
	} finally {
		isLoading.value = false
	}
}

const handleRemove = () => {
	inputValue.value = ''
	invalidMessage.value = ''
	emit('update:modelValue', null)
}

// Keep input in sync when code is externally cleared
watch(
	() => props.modelValue,
	(val) => {
		if (!val) {
			inputValue.value = ''
			invalidMessage.value = ''
		}
	},
)
</script>
