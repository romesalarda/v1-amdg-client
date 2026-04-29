<template>
  <form @submit="onSubmit" class="space-y-4 text-background-dark-600">
    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="payment-title">
        Title <span class="text-red-500">*</span>
      </label>
      <input
        id="payment-title"
        v-model="title"
        v-bind="titleAttrs"
        type="text"
        placeholder="e.g. Credit Card, Bank Transfer, Cash on Site"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <p v-if="errors.title" class="text-xs text-red-500">{{ errors.title }}</p>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="payment-description">
        Description
      </label>
      <textarea
        id="payment-description"
        v-model="description"
        v-bind="descriptionAttrs"
        placeholder="Additional details about this payment method..."
        rows="2"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      ></textarea>
      <p v-if="errors.description" class="text-xs text-red-500">{{ errors.description }}</p>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600">
        Payment Method Type <span class="text-red-500">*</span>
      </label>
      <div class="space-y-3">
        <label
          v-for="methodType in methodTypes"
          :key="methodType.value"
          class="flex items-start gap-3 p-3 border border-primary-500/20 rounded-lg hover:bg-mist-blue/50 transition-colors cursor-pointer"
          :class="{ 'border-primary bg-mist-blue/60': method_type === methodType.value }"
        >
          <input
            v-model="method_type"
            v-bind="method_typeAttrs"
            type="radio"
            :value="methodType.value"
            class="mt-1 h-4 w-4 border border-navy-300 bg-white accent-[rgb(0,33,71)]"
          />
          <div class="flex-1">
            <span class="block font-medium text-primary">{{ methodType.label }}</span>
            <p class="text-sm text-primary-500/60">{{ methodType.description }}</p>
          </div>
        </label>
      </div>
      <p v-if="errors.method_type" class="text-xs text-red-500">{{ errors.method_type }}</p>
    </div>

    <!-- Bank Transfer Fields -->
    <template v-if="method_type === 'BANK_TRANSFER'">
      <div class="space-y-4 p-4 bg-mist-blue/40 rounded-lg">
        <h4 class="font-semibold text-sm text-background-dark-600">Bank Account Details</h4>

        <label class="flex items-start gap-3 p-3 rounded-lg border border-primary-500/20 bg-white">
          <input
            v-model="bankTransferRequiredImmediately"
            v-bind="bankTransferRequiredImmediatelyAttrs"
            type="checkbox"
            class="mt-0.5 h-4 w-4 rounded border-navy-300 text-primary focus:ring-primary focus:ring-offset-0"
          />
          <div>
            <p class="text-sm font-semibold text-background-dark-600">Require evidence immediately</p>
            <p class="text-xs text-background-dark-500">Attendees must upload transfer proof during checkout for this method.</p>
          </div>
        </label>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-background-dark-600" for="account-name">
            Account Name <span class="text-red-500">*</span>
          </label>
          <input
            id="account-name"
            v-model="accountName"
            v-bind="accountNameAttrs"
            type="text"
            placeholder="Account holder name"
            class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p v-if="errors['provided_details.account_name']" class="text-xs text-red-500">
            {{ errors['provided_details.account_name'] }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-background-dark-600" for="sort-code">
            Sort Code <span class="text-red-500">*</span>
          </label>
          <input
            id="sort-code"
            v-model="sortCode"
            v-bind="sortCodeAttrs"
            type="text"
            placeholder="12-34-56"
            class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p v-if="errors['provided_details.sort_code']" class="text-xs text-red-500">
            {{ errors['provided_details.sort_code'] }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-background-dark-600" for="account-number">
            Account Number <span class="text-red-500">*</span>
          </label>
          <input
            id="account-number"
            v-model="accountNumber"
            v-bind="accountNumberAttrs"
            type="text"
            placeholder="12345678"
            class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p v-if="errors['provided_details.account_number']" class="text-xs text-red-500">
            {{ errors['provided_details.account_number'] }}
          </p>
        </div>
      </div>
    </template>

    <!-- Stripe Fields -->
    <template v-if="method_type === 'STRIPE'">
      <div class="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">account_balance_wallet</span>
          <div class="flex-1 space-y-2">
            <h4 class="font-semibold text-sm text-primary">Select a Stripe account</h4>
            <p class="text-xs text-navy-600 leading-relaxed">
              Choose which of your connected Stripe accounts to use for this payment method. Only active accounts that are ready for payments are shown.
            </p>
            <div class="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                @click="openStripeConnectPage"
                class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600"
              >
                Manage Accounts
                <span class="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>

            <!-- Account selector -->
            <div class="w-full pt-3">
              <label class="block text-sm font-medium text-background-dark-600 mb-2" for="stripe-account-selector">
                Connected account <span class="text-red-500">*</span>
              </label>

              <div v-if="eligibleAccountsLoading" class="animate-pulse">
                <div class="h-10 rounded-lg bg-mist-blue/70" />
              </div>

              <select
                v-else-if="eligibleAccounts.length > 0"
                id="stripe-account-selector"
                v-model="stripeAccountId"
                v-bind="stripeAccountIdAttrs"
                class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Select an account --</option>
                <option v-for="account in eligibleAccounts" :key="account.stripe_account_id" :value="account.stripe_account_id">
                  {{ account.display_name }} ({{ account.stripe_account_id }})
                  <span v-if="account.is_primary"> • Primary</span>
                </option>
              </select>

              <div v-else class="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                <div class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-amber-600 text-base flex-shrink-0 mt-0.5">warning</span>
                  <div class="text-sm text-amber-700">
                    <p class="font-semibold mb-1">No active Stripe accounts available</p>
                    <p class="text-xs">Click "Manage Accounts" above to create or activate a connected Stripe account.</p>
                  </div>
                </div>
              </div>

              <p v-if="errors['provided_details.stripe_account_id']" class="text-xs text-red-500 pt-1">
                {{ errors['provided_details.stripe_account_id'] }}
              </p>

              <!-- Warning if editing with invalid current account -->
              <div v-if="showAccountWarning" class="rounded-lg border border-amber-200 bg-amber-50/70 p-3 mt-3">
                <div class="flex items-start gap-2">
                  <span class="material-symbols-outlined text-amber-600 text-base flex-shrink-0 mt-0.5">info</span>
                  <p class="text-xs text-amber-700">
                    The currently selected account is no longer active. Please select an eligible account to update this payment method.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Cash Fields (no extra fields needed) -->
    <template v-if="method_type === 'CASH'">
      <div class="p-4 bg-mist-blue/40 rounded-lg">
        <p class="text-sm text-primary-500/60">No additional configuration required for cash payments.</p>
      </div>
    </template>

    <label class="flex items-center justify-between rounded-xl border border-primary-500/20 bg-white px-4 py-3">
      <span class="text-sm font-medium text-background-dark-600">Active payment method</span>
      <span class="relative inline-flex h-6 w-11 items-center">
        <input
          v-model="isActive"
          v-bind="isActiveAttrs"
          type="checkbox"
          class="peer sr-only"
        />
        <span class="h-6 w-11 rounded-full bg-primary-500/20 transition peer-checked:bg-primary"></span>
        <span class="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
      </span>
    </label>

    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        class="rounded-xl border border-primary bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isLoading || (method_type === 'STRIPE' && !stripeConnectAccountReady)"
        class="rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600 disabled:opacity-70"
      >
        Save Payment Method
      </button>
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
import { useStripeConnectStatus } from '~/composables/resources/payments/stripeConnect'
import { useStripeConnectedAccounts } from '~/composables/resources/payments/stripeConnectedAccounts'

interface Props {
  modelValue?: any
  eventId: number | undefined
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  isLoading: false,
})

const route = useRoute()
const stripeConnectStatus = useStripeConnectStatus()
const { data: accountsData, isLoading: accountsIsLoading } = useStripeConnectedAccounts()

const stripeConnectAccount = computed(() => stripeConnectStatus.data.value?.data)
const stripeConnectAccountReady = computed(() => stripeConnectAccount.value?.status === 'ACTIVE')
const stripeConnectPagePath = computed(() => `/events/${String(route.params.id)}/m/payments/connect-your-account`)

// Filter accounts: only show active + ACTIVE status
const allAccounts = computed(() => accountsData.value?.data?.results || [])
const eligibleAccounts = computed(() => 
  allAccounts.value.filter(acc => acc.is_active && acc.status === 'ACTIVE')
)
const eligibleAccountsLoading = computed(() => accountsIsLoading.value)

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
    bank_transfer_required_immediately: props.modelValue?.bank_transfer_required_immediately ?? ((props.modelValue?.method_type || 'STRIPE') === 'BANK_TRANSFER'),
    provided_details: props.modelValue?.provided_details || {
      account_name: '',
      sort_code: '',
      account_number: '',
      stripe_account_id: '',
    },
  },
})

// Define form fields
const [title, titleAttrs] = defineField('title')
const [description, descriptionAttrs] = defineField('description')
const [method_type, method_typeAttrs] = defineField('method_type')
const [isActive, isActiveAttrs] = defineField('is_active')
const [bankTransferRequiredImmediately, bankTransferRequiredImmediatelyAttrs] = defineField('bank_transfer_required_immediately')

// Bank transfer fields
const [accountName, accountNameAttrs] = defineField('provided_details.account_name')
const [sortCode, sortCodeAttrs] = defineField('provided_details.sort_code')
const [accountNumber, accountNumberAttrs] = defineField('provided_details.account_number')
// Stripe account id field (allows explicit override or using connected account)
const [stripeAccountId, stripeAccountIdAttrs] = defineField('provided_details.stripe_account_id')

// Handle form submission
const onSubmit = handleSubmit((values) => {
  // Clean up the data based on method type
  const cleanedData: any = {
    title: values.title,
    description: values.description || undefined,
    method_type: values.method_type,
    is_active: values.is_active,
    bank_transfer_required_immediately: values.method_type === 'BANK_TRANSFER'
      ? !!values.bank_transfer_required_immediately
      : false,
    event: props.eventId,
  }

  if (values.method_type === 'BANK_TRANSFER' && values.provided_details) {
    cleanedData.provided_details = {
      account_name: values.provided_details.account_name,
      sort_code: values.provided_details.sort_code,
      account_number: values.provided_details.account_number,
    }
  } else if (values.method_type === 'STRIPE') {
    const stripeAccountId = stripeConnectAccount.value?.stripe_account_id || values.provided_details?.stripe_account_id || props.modelValue?.provided_details?.stripe_account_id
    cleanedData.provided_details = {
      stripe_account_id: stripeAccountId,
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
        bank_transfer_required_immediately: newValue.bank_transfer_required_immediately ?? (newValue.method_type === 'BANK_TRANSFER'),
        provided_details: newValue.provided_details || {
          account_name: '',
          sort_code: '',
          account_number: '',
          stripe_account_id: '',
        },
      },
    })
  }
}, { immediate: true })

watch(
  () => method_type.value,
  (next) => {
    if (props.modelValue) return
    if (next !== 'BANK_TRANSFER') return
    if (!bankTransferRequiredImmediately.value) {
      bankTransferRequiredImmediately.value = true
    }
  }
)

// Check if the current stripe account is still eligible (used for warning on edit)
const showAccountWarning = computed(() => {
  if (method_type.value !== 'STRIPE') return false
  if (!stripeAccountId.value) return false
  
  // Check if the current account is not in the eligible list
  const currentAccountStillEligible = eligibleAccounts.value.some(
    acc => acc.stripe_account_id === stripeAccountId.value
  )
  return !currentAccountStillEligible
})

const openStripeConnectPage = () => {
  if (typeof window === 'undefined') return
  window.open(stripeConnectPagePath.value, '_blank', 'noopener,noreferrer')
}
</script>
