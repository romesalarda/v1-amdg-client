<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">Edit Booking Package</h3>
      </template>

      <form @submit="onSubmit" class="space-y-4">
        <UFormGroup label="Package Name" name="name" required :error="errors.name">
          <UInput v-model="name" v-bind="nameAttrs" placeholder="e.g. Early Bird, VIP, Standard" />
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
              {{ ticketTypes.find((t: any) => t.id === ticket_type)?.title || 'Select ticket type' }}
            </template>
          </USelectMenu>
        </UFormGroup>

        <UFormGroup label="Base Amount" name="base_amount" required :error="errors.base_amount">
          <UInput
            v-model="base_amount"
            v-bind="base_amountAttrs"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </UFormGroup>

        <UFormGroup name="is_default">
          <UCheckbox
            v-model="is_default"
            v-bind="is_defaultAttrs"
            label="Set as default package"
          />
        </UFormGroup>

        <div class="flex justify-end gap-2 pt-4">
          <UButton
            label="Cancel"
            variant="ghost"
            color="gray"
            @click="closeModal"
          />
          <UButton
            label="Update Package"
            type="submit"
            :loading="isLoading"
          />
        </div>
      </form>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { bookingPackageSchema } from '~/schemas/events/payments'
import type { BookingPackageList, TicketTypeList } from '~/api/types.gen'

const props = defineProps<{
  modelValue: boolean
  package: BookingPackageList | null
  ticketTypes: TicketTypeList[]
  onUpdate: (values: any) => Promise<void>
  isLoading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const { handleSubmit, errors, defineField, setValues } = useForm({
  validationSchema: toTypedSchema(bookingPackageSchema),
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [base_amount, base_amountAttrs] = defineField('base_amount')
const [ticket_type, ticket_typeAttrs] = defineField('ticket_type')
const [is_default, is_defaultAttrs] = defineField('is_default')

// Watch for package changes and populate form
watch(() => props.package, (pkg) => {
  if (pkg) {
    setValues({
      name: pkg.name,
      description: '',
      base_amount: pkg.base_amount,
      ticket_type: pkg.ticket_type,
      is_default: false,
    })
  }
}, { immediate: true })

const onSubmit = handleSubmit(async (values) => {
  await props.onUpdate(values)
})

const closeModal = () => {
  isOpen.value = false
}
</script>
