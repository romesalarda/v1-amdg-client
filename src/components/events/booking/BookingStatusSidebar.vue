<template>
  <div class="space-y-6">
    <!-- Booking Status Card -->
    <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="bg-primary px-6 py-4">
        <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span class="material-symbols-outlined text-base">analytics</span>
          Booking Status
        </h3>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <p class="text-xs text-navy-500 mb-1">Ticket Types</p>
          <p class="text-2xl font-bold text-primary">{{ ticketTypesCount }}</p>
        </div>
        <div>
          <p class="text-xs text-navy-500 mb-1">Packages</p>
          <p class="text-2xl font-bold text-primary">{{ packagesCount }}</p>
        </div>
        <div>
          <p class="text-xs text-navy-500 mb-1">Active Discounts</p>
          <p class="text-2xl font-bold text-primary">{{ activeDiscountsCount }}</p>
        </div>
        <div>
          <p class="text-xs text-navy-500 mb-1">Sign-in Methods</p>
          <p class="text-2xl font-bold text-primary">{{ signInsCount }}</p>
        </div>
      </div>
    </section>

    <!-- Booking Limits Card -->
    <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-xl">groups</span>
        <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Booking Limits</h3>
      </div>
      <div class="p-6 space-y-4">
        <div class="space-y-1.5">
          <div class="flex items-start justify-between gap-3">
            <label class="text-xs text-navy-500 leading-5 font-bold">Max Attendees Per Booking</label>
            <div class="flex items-center gap-2 shrink-0">
              <input
                v-model.number="localMaxAttendeesPerBooking"
                type="number"
                min="0"
                max="10"
                step="1"
                :disabled="isSaving || !canEditLimits"
                class="w-20 px-2.5 py-2 text-sm text-center border border-deep-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-navy-50 disabled:text-navy-400"
              />
              <button
                type="button"
                :disabled="!canSaveBookingLimit"
                class="h-10 w-10 inline-flex items-center justify-center border-2 border-primary rounded-xl text-primary hover:bg-light-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Save max attendees per booking"
                @click="saveBookingLimit"
              >
                <span class="material-symbols-outlined text-[18px] leading-none">save</span>
              </button>
            </div>
          </div>
          <p v-if="bookingLimitError" class="text-[11px] text-rose-600">{{ bookingLimitError }}</p>
          <p v-else class="text-[11px] text-navy-500">Range: 0 to 10</p>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-start justify-between gap-3">
            <label class="text-xs text-navy-500 leading-5 font-bold">Max Attendees Per User</label>
            <div class="flex items-center gap-2 shrink-0">
              <input
                v-model.number="localMaxAttendeesPerUser"
                type="number"
                min="0"
                max="20"
                step="1"
                :disabled="isSaving || !canEditLimits"
                class="w-20 px-2.5 py-2 text-sm text-center border border-deep-navy/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-navy-50 disabled:text-navy-400"
              />
              <button
                type="button"
                :disabled="!canSaveUserLimit"
                class="h-10 w-10 inline-flex items-center justify-center border-2 border-primary rounded-xl text-primary hover:bg-light-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Save max attendees per user"
                @click="saveUserLimit"
              >
                <span class="material-symbols-outlined text-[18px] leading-none">save</span>
              </button>
            </div>
          </div>
          <p v-if="userLimitError" class="text-[11px] text-rose-600">{{ userLimitError }}</p>
          <p v-else class="text-[11px] text-navy-500">Range: 0 to 20</p>
        </div>
      </div>
    </section>

    <!-- Help Card -->
    <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
        <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Setup Tips</h3>
      </div>
      <div class="p-6 text-sm space-y-3 text-navy-600">
        <p>
          This page is for configuring your event's booking system. Follow the steps in order to set up your ticketing and registration options.
        </p>
        <p>
          <strong>Step 1:</strong> Create booking packages to define base pricing tiers (e.g., Standard, Early Bird).
        </p>
        <p>
          <strong>Step 2:</strong> Add discounts for special categories within packages (e.g., Students, Staff).
        </p>
        <p>
          <strong>Step 3:</strong> Define ticket types to control access scope (e.g., Single Day, Full Event, Workshop Pass).
        </p>
        <button
          @click="emit('show-guide')"
          class="flex items-center space-x-2 px-4 py-2 border-2 border-primary rounded-xl font-semibold text-xs hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <span class="material-symbols-outlined text-base">help</span>
          <span>Setup Guide</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { bookingLimitPerBookingSchema, bookingLimitPerUserSchema } from '~/schemas/events/bookingLimits'

const props = defineProps<{
  ticketTypesCount: number
  packagesCount: number
  activeDiscountsCount: number
  signInsCount: number
  maxAttendeesPerBooking: number
  maxAttendeesPerUser: number
  isSaving?: boolean
  canEditLimits?: boolean
}>()

const emit = defineEmits<{
  'show-guide': []
  'save-max-attendees-per-booking': [value: number]
  'save-max-attendees-per-user': [value: number]
}>()

const localMaxAttendeesPerBooking = ref(0)
const localMaxAttendeesPerUser = ref(0)
const bookingLimitError = ref('')
const userLimitError = ref('')

function getSchemaError(
  value: number,
  schema: typeof bookingLimitPerBookingSchema | typeof bookingLimitPerUserSchema,
): string {
  const parsed = schema.safeParse(value)
  return parsed.success ? '' : parsed.error.issues[0]?.message || 'Invalid value'
}

watch(
  () => props.maxAttendeesPerBooking,
  (value) => {
    localMaxAttendeesPerBooking.value = Number(value ?? 0)
    bookingLimitError.value = getSchemaError(localMaxAttendeesPerBooking.value, bookingLimitPerBookingSchema)
  },
  { immediate: true },
)

watch(
  () => props.maxAttendeesPerUser,
  (value) => {
    localMaxAttendeesPerUser.value = Number(value ?? 0)
    userLimitError.value = getSchemaError(localMaxAttendeesPerUser.value, bookingLimitPerUserSchema)
  },
  { immediate: true },
)

watch(localMaxAttendeesPerBooking, (value) => {
  bookingLimitError.value = getSchemaError(value, bookingLimitPerBookingSchema)
})

watch(localMaxAttendeesPerUser, (value) => {
  userLimitError.value = getSchemaError(value, bookingLimitPerUserSchema)
})

const isSaving = computed(() => props.isSaving ?? false)
const canEditLimits = computed(() => props.canEditLimits ?? true)
const canSaveBookingLimit = computed(() => canEditLimits.value && !isSaving.value && !bookingLimitError.value)
const canSaveUserLimit = computed(() => canEditLimits.value && !isSaving.value && !userLimitError.value)

function saveBookingLimit() {
  const parsed = bookingLimitPerBookingSchema.safeParse(localMaxAttendeesPerBooking.value)
  if (!parsed.success) {
    bookingLimitError.value = parsed.error.issues[0]?.message || 'Invalid value'
    return
  }
  emit('save-max-attendees-per-booking', parsed.data)
}

function saveUserLimit() {
  const parsed = bookingLimitPerUserSchema.safeParse(localMaxAttendeesPerUser.value)
  if (!parsed.success) {
    userLimitError.value = parsed.error.issues[0]?.message || 'Invalid value'
    return
  }
  emit('save-max-attendees-per-user', parsed.data)
}
</script>
