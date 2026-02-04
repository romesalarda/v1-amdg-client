<template>
  <form @submit="onSubmit" class="space-y-4">
    <UFormGroup label="Package Name" name="name" required :error="errors.name">
      <UInput
        v-model="name"
        v-bind="nameAttrs"
        placeholder="e.g. Early Bird, VIP, Standard"
      />
    </UFormGroup>

    <UFormGroup label="Description" name="description" :error="errors.description">
      <UTextarea
        v-model="description"
        v-bind="descriptionAttrs"
        placeholder="What's included in this package..."
        :rows="3"
      />
    </UFormGroup>

    <UFormGroup label="Ticket Type" name="ticket_type" required :error="errors.ticket_type">
      <USelectMenu
        v-model="ticket_type"
        v-bind="ticket_typeAttrs"
        :options="ticketTypes"
        option-attribute="title"
        value-attribute="id"
        placeholder="Select ticket type"
      >
        <template #label>
          {{ selectedTicketTypeTitle || 'Select ticket type' }}
        </template>
      </USelectMenu>
    </UFormGroup>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UFormGroup label="Base Amount" name="base_amount" required :error="errors.base_amount" class="sm:col-span-2">
        <UInput
          v-model="base_amount"
          v-bind="base_amountAttrs"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </UFormGroup>

      <UFormGroup label="Currency" name="base_amount_currency" required :error="errors.base_amount_currency">
        <USelectMenu
          v-model="base_amount_currency"
          v-bind="base_amount_currencyAttrs"
          :options="currencyOptions"
          placeholder="Currency"
        />
      </UFormGroup>
    </div>

    <UFormGroup label="Is Active" name="is_active">
      <UToggle
        v-model="is_active"
        v-bind="is_activeAttrs"
      >
        <template #label>
          <span class="text-sm font-medium text-gray-700">Active</span>
        </template>
      </UToggle>
    </UFormGroup>

    <div class="flex justify-end gap-2 pt-4">
      <UButton
        label="Cancel"
        variant="ghost"
        color="gray"
        @click="emit('cancel')"
        type="button"
      />
      <UButton
        :label="modelValue ? 'Update Package' : 'Create Package'"
        type="submit"
        :loading="isSubmitting"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { bookingPackageSchema } from '~/schemas/events/bookingConfig'
import type { BookingPackageDetail, BookingPackageList, TicketTypeList } from '~/api/types.gen'

const props = defineProps<{
  modelValue?: BookingPackageDetail | BookingPackageList | null
  ticketTypes: TicketTypeList[]
  eventId: number
  currencySymbol?: string
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const isSubmitting = ref(false)

// Currency options
const currencyOptions = [
  "GBP", "USD", "EUR"
]

// Compute the selected ticket type title for display
const selectedTicketTypeTitle = computed(() => {
  if (!ticket_type.value) return ''
  const ticketType = props.ticketTypes.find(t => t.id === ticket_type.value)
  return ticketType?.title || ''
})

const { handleSubmit, errors, defineField, setValues } = useForm({
  validationSchema: toTypedSchema(bookingPackageSchema),
  initialValues: {
    name: '',
    description: '',
    ticket_type: undefined as number | undefined,
    base_amount: '',
    base_amount_currency: 'GBP',
    is_active: true,
  },
  validateOnMount: false,
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [ticket_type, ticket_typeAttrs] = defineField('ticket_type')
const [base_amount, base_amountAttrs] = defineField('base_amount')
const [base_amount_currency, base_amount_currencyAttrs] = defineField('base_amount_currency')
const [is_active, is_activeAttrs] = defineField('is_active')

// Watch for modelValue changes and populate form
watch(() => props.modelValue, (pkg) => {
  if (pkg) {
    setValues({
      name: pkg.name || '',
      description: ('description' in pkg && pkg.description) ? pkg.description : '',
      ticket_type: pkg.ticket_type,
      base_amount: pkg.base_amount ? String(pkg.base_amount) : '',
      base_amount_currency: ('base_amount_currency' in pkg && pkg.base_amount_currency) ? pkg.base_amount_currency : 'GBP',
      is_active: pkg.is_active ?? true,
    })
  }
}, { immediate: true })

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    emit('submit', values)
  } finally {
    isSubmitting.value = false
  }
})
</script>
