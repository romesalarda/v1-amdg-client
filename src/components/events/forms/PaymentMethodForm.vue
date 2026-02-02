<template>
  <form @submit="onSubmit" class="space-y-4">
    <UFormGroup label="Title" name="title" required :error="errors.title">
      <UInput 
        v-model="title" 
        v-bind="titleAttrs" 
        placeholder="e.g. Credit Card, Bank Transfer, Cash on Site" 
      />
    </UFormGroup>

    <UFormGroup label="Description" name="description" :error="errors.description">
      <UTextarea
        v-model="description"
        v-bind="descriptionAttrs"
        placeholder="Additional details about this payment method..."
        :rows="2"
      />
    </UFormGroup>

    <UFormGroup label="Payment Method Type" name="method_type" required :error="errors.method_type">
      <div class="space-y-3">
        <div
          v-for="methodType in methodTypes"
          :key="methodType.value"
          class="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          :class="{ 'border-primary-500 bg-primary-50': method_type === methodType.value }"
        >
          <URadio
            v-model="method_type"
            v-bind="method_typeAttrs"
            :value="methodType.value"
            :label="methodType.label"
          />
          <div class="flex-1 pt-0.5">
            <p class="text-sm text-gray-600">{{ methodType.description }}</p>
          </div>
        </div>
      </div>
    </UFormGroup>

    <!-- Bank Transfer Fields -->
    <template v-if="method_type === 'BANK_TRANSFER'">
      <div class="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-semibold text-sm">Bank Account Details</h4>
        
        <UFormGroup label="Account Name" name="provided_details.account_name" required :error="errors['provided_details.account_name']">
          <UInput
            v-model="accountName"
            v-bind="accountNameAttrs"
            placeholder="Account holder name"
          />
        </UFormGroup>

        <UFormGroup label="Sort Code" name="provided_details.sort_code" required :error="errors['provided_details.sort_code']">
          <UInput
            v-model="sortCode"
            v-bind="sortCodeAttrs"
            placeholder="12-34-56"
          />
        </UFormGroup>

        <UFormGroup label="Account Number" name="provided_details.account_number" required :error="errors['provided_details.account_number']">
          <UInput
            v-model="accountNumber"
            v-bind="accountNumberAttrs"
            placeholder="12345678"
          />
        </UFormGroup>
      </div>
    </template>

    <!-- Stripe Fields -->
    <template v-if="method_type === 'STRIPE'">
      <div class="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-semibold text-sm">Stripe Configuration</h4>
        
        <UFormGroup name="use_platform_account">
          <UCheckbox
            v-model="usePlatformAccount"
            v-bind="usePlatformAccountAttrs"
            label="Use platform Stripe account"
          />
        </UFormGroup>

        <UFormGroup 
          v-if="!usePlatformAccount" 
          label="Stripe Account ID" 
          name="stripe_account_id" 
          :error="errors.stripe_account_id"
        >
          <UInput
            v-model="stripeAccountId"
            v-bind="stripeAccountIdAttrs"
            placeholder="acct_xxxxxxxxxxxxx"
          />
        </UFormGroup>
      </div>
    </template>

    <!-- Cash Fields (no extra fields needed) -->
    <template v-if="method_type === 'CASH'">
      <div class="p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600">No additional configuration required for cash payments.</p>
      </div>
    </template>

    <UFormGroup name="is_active">
      <UCheckbox
        v-model="isActive"
        v-bind="isActiveAttrs"
        label="Active payment method"
      />
    </UFormGroup>

    <div class="flex justify-end gap-2 pt-2">
      <UButton
        label="Cancel"
        variant="ghost"
        @click="$emit('cancel')"
      />
      <UButton
        label="Save Payment Method"
        type="submit"
        :loading="isLoading"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { 
  paymentMethodSchema, 
  paymentMethodTypeLabels, 
  paymentMethodTypeDescriptions,
  type PaymentMethodFormData 
} from '~/schemas/events/paymentConfig'

interface Props {
  modelValue?: any
  eventId: number
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  isLoading: false,
})

const emit = defineEmits<{
  submit: [data: PaymentMethodFormData]
  cancel: []
}>()

// Define method types for radio buttons
const methodTypes = [
  { 
    value: 'STRIPE', 
    label: paymentMethodTypeLabels.STRIPE, 
    description: paymentMethodTypeDescriptions.STRIPE 
  },
  { 
    value: 'BANK_TRANSFER', 
    label: paymentMethodTypeLabels.BANK_TRANSFER, 
    description: paymentMethodTypeDescriptions.BANK_TRANSFER 
  },
  { 
    value: 'CASH', 
    label: paymentMethodTypeLabels.CASH, 
    description: paymentMethodTypeDescriptions.CASH 
  },
]

// Setup form with vee-validate
const { errors, handleSubmit, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(paymentMethodSchema),
  initialValues: {
    title: props.modelValue?.title || '',
    description: props.modelValue?.description || '',
    method_type: props.modelValue?.method_type || 'STRIPE',
    is_active: props.modelValue?.is_active ?? true,
    provided_details: props.modelValue?.provided_details || {
      account_name: '',
      sort_code: '',
      account_number: '',
    },
    stripe_account_id: props.modelValue?.stripe_account_id || '',
    use_platform_account: props.modelValue?.use_platform_account || false,
  },
})

// Define form fields
const [title, titleAttrs] = defineField('title')
const [description, descriptionAttrs] = defineField('description')
const [method_type, method_typeAttrs] = defineField('method_type')
const [isActive, isActiveAttrs] = defineField('is_active')

// Bank transfer fields
const [accountName, accountNameAttrs] = defineField('provided_details.account_name')
const [sortCode, sortCodeAttrs] = defineField('provided_details.sort_code')
const [accountNumber, accountNumberAttrs] = defineField('provided_details.account_number')

// Stripe fields
const [stripeAccountId, stripeAccountIdAttrs] = defineField('stripe_account_id')
const [usePlatformAccount, usePlatformAccountAttrs] = defineField('use_platform_account')

// Handle form submission
const onSubmit = handleSubmit((values) => {
  // Clean up the data based on method type
  const cleanedData: any = {
    title: values.title,
    description: values.description || undefined,
    method_type: values.method_type,
    is_active: values.is_active,
    event: props.eventId,
  }

  if (values.method_type === 'BANK_TRANSFER' && values.provided_details) {
    cleanedData.provided_details = {
      account_name: values.provided_details.account_name,
      sort_code: values.provided_details.sort_code,
      account_number: values.provided_details.account_number,
    }
  } else if (values.method_type === 'STRIPE') {
    cleanedData.provided_details = {}
    if (values.use_platform_account) {
      cleanedData.provided_details.use_platform_account = true
    } else if (values.stripe_account_id) {
      cleanedData.provided_details.stripe_account_id = values.stripe_account_id
    }
  } else if (values.method_type === 'CASH') {
    // No provided_details needed for cash
    cleanedData.provided_details = {}
  }

  emit('submit', cleanedData)
})

// Watch for changes in modelValue and reset form
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm({
      values: {
        title: newValue.title || '',
        description: newValue.description || '',
        method_type: newValue.method_type || 'STRIPE',
        is_active: newValue.is_active ?? true,
        provided_details: newValue.provided_details || {
          account_name: '',
          sort_code: '',
          account_number: '',
        },
        stripe_account_id: newValue.stripe_account_id || '',
        use_platform_account: newValue.use_platform_account || false,
      },
    })
  }
}, { immediate: true })
</script>
