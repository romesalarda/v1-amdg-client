<template>
  <form @submit="onSubmit" class="space-y-4 text-background-dark-600">
    <div class="bg-blue-50 border-2 border-blue-400 rounded-2xl p-6 shadow-lg">
        <div class="flex items-start gap-4">
          <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full flex-shrink-0">
            <span class="material-symbols-outlined text-blue-700 text-2xl">info</span>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-black text-blue-900 uppercase tracking-wider mb-2">Booking Packages</h3>
            <p class="text-sm text-blue-800 leading-relaxed">Define the different booking options available for your event. This is where prices are set.</p>
          </div>
        </div>
      </div>
    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="package-name">
        Package Name <span class="text-red-500">*</span>
      </label>
      <input
        id="package-name"
        v-model="name"
        v-bind="nameAttrs"
        type="text"
        placeholder="e.g. Early Bird, VIP, Standard"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="package-description">
        Description
      </label>
      <textarea
        id="package-description"
        v-model="description"
        v-bind="descriptionAttrs"
        placeholder="What's included in this package..."
        rows="3"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      ></textarea>
      <p v-if="errors.description" class="text-xs text-red-500">{{ errors.description }}</p>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="ticket-type">
        Ticket Type <span class="text-red-500">*</span>
      </label>
      <select
        id="ticket-type"
        v-model="ticket_type"
        v-bind="ticket_typeAttrs"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="" disabled>Select ticket type</option>
        <option v-for="ticket in ticketTypes" :key="ticket.id" :value="ticket.id">
          {{ ticket.title }}
        </option>
      </select>
      <p v-if="errors.ticket_type" class="text-xs text-red-500">{{ errors.ticket_type }}</p>
    </div>

    <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-emerald-900">Free package</p>
          <p class="mt-1 text-xs text-emerald-700">Set this package to be free of charge.</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
          :class="isFree ? 'border-emerald-400 bg-emerald-100 text-emerald-900' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'"
          @click="toggleFreePackage"
        >
          <span class="h-2.5 w-2.5 rounded-full" :class="isFree ? 'bg-emerald-600' : 'bg-slate-400'"></span>
          {{ isFree ? 'Free enabled' : 'Set as free' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="sm:col-span-2 space-y-2">
        <label class="block text-sm font-medium text-background-dark-600" for="base-amount">
          Base Amount <span class="text-red-500">*</span>
        </label>
        <input
          id="base-amount"
          v-model="base_amount"
          v-bind="base_amountAttrs"
          type="number"
          step="0.01"
          min="0"
          :disabled="isFree"
          placeholder="0.00"
          class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        <p v-if="errors.base_amount" class="text-xs text-red-500">{{ errors.base_amount }}</p>
        <p v-if="packagePriceExceeded" class="text-xs text-red-600 font-semibold flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">policy</span>
          Price exceeds the community maximum of {{ props.maxPackagePrice }}
        </p>
        <p v-if="isFree" class="text-xs font-semibold text-emerald-700">Free package enabled: amount is locked to 0.00.</p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-background-dark-600" for="currency">
          Currency <span class="text-red-500">*</span>
        </label>
        <select
          id="currency"
          v-model="base_amount_currency"
          v-bind="base_amount_currencyAttrs"
          class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="currency in currencyOptions" :key="currency" :value="currency">
            {{ currency }}
          </option>
        </select>
        <p v-if="errors.base_amount_currency" class="text-xs text-red-500">{{ errors.base_amount_currency }}</p>
      </div>
    </div>

    <label class="flex items-center justify-between rounded-xl border border-primary-500/20 bg-white px-4 py-3">
      <span class="text-sm font-medium text-background-dark-600">Active</span>
      <span class="relative inline-flex h-6 w-11 items-center">
        <input
          v-model="is_active"
          v-bind="is_activeAttrs"
          type="checkbox"
          class="peer sr-only"
        />
        <span class="h-6 w-11 rounded-full bg-primary-500/20 transition peer-checked:bg-primary"></span>
        <span class="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
      </span>
    </label>

    <div class="flex justify-end gap-2 pt-4">
      <button
        type="button"
        class="rounded-xl border border-primary bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || packagePriceExceeded"
        class="rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600 disabled:opacity-70"
      >
        {{ modelValue ? 'Update Package' : 'Create Package' }}
      </button>
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
  maxPackagePrice?: number | null
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const isSubmitting = ref(false)

const packagePriceExceeded = computed(() => {
  if (!props.maxPackagePrice || isFree.value) return false
  const amount = Number(base_amount.value)
  return Number.isFinite(amount) && amount > props.maxPackagePrice
})

// Currency options
const currencyOptions = [
  "GBP", "USD", "EUR"
]

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

const isFree = ref(false)

const normalizeAmount = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const setFreeAmount = () => {
  base_amount.value = '0.00'
}

const toggleFreePackage = () => {
  isFree.value = !isFree.value
  if (isFree.value) {
    setFreeAmount()
  }
}

// Watch for modelValue changes and populate form
watch(() => props.modelValue, (pkg) => {
  if (pkg) {
    const amount = normalizeAmount(pkg.base_amount)
    isFree.value = amount === 0
    setValues({
      name: pkg.name || '',
      description: ('description' in pkg && pkg.description) ? pkg.description : '',
      ticket_type: pkg.ticket_type,
      base_amount: pkg.base_amount ? String(pkg.base_amount) : '',
      base_amount_currency: ('base_amount_currency' in pkg && pkg.base_amount_currency) ? pkg.base_amount_currency : 'GBP',
      is_active: pkg.is_active ?? true,
    })
    if (isFree.value) {
      setFreeAmount()
    }
  }
}, { immediate: true })

watch(base_amount, (value) => {
  const amount = normalizeAmount(value)
  if (amount === 0 && !isFree.value) {
    isFree.value = true
    setFreeAmount()
    return
  }

  if (amount > 0 && isFree.value) {
    isFree.value = false
  }
})

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    emit('submit', {
      ...values,
      base_amount: isFree.value ? '0.00' : values.base_amount,
    })
  } finally {
    isSubmitting.value = false
  }
})
</script>
