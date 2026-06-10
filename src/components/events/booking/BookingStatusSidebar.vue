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
      <div class="p-6 space-y-3">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <label class="block text-xs font-semibold text-navy-600">
            Per Booking
          </label>
          <p v-if="bookingLimitError" class="text-[11px] text-rose-600">
            {{ bookingLimitError }}
          </p>
          <p v-else class="text-[11px] text-navy-400">
            0–10 attendees
          </p>
        </div>

        <div
          class="flex items-center shrink-0 overflow-hidden border border-deep-navy/15 rounded-lg bg-white"
        >
          <input
            v-model.number="localMaxAttendeesPerBooking"
            type="number"
            min="0"
            max="10"
            step="1"
            :disabled="isSaving || !canEditLimits"
            class="w-14 px-2 py-2 text-sm text-center border-0 focus:outline-none focus:ring-0 disabled:bg-navy-50 disabled:text-navy-400"
          />

          <div class="w-px h-6 bg-deep-navy/10"></div>

          <button
            type="button"
            :disabled="!canSaveBookingLimit"
            @click="saveBookingLimit"
            class="px-2.5 py-2 text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">
              check
            </span>
          </button>
        </div>
      </div>

      <!-- User Limit -->
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <label class="block text-xs font-semibold text-navy-600">
            Per User
          </label>
          <p v-if="userLimitError" class="text-[11px] text-rose-600">
            {{ userLimitError }}
          </p>
          <p v-else class="text-[11px] text-navy-400">
            0–20 attendees
          </p>
        </div>

        <div
          class="flex items-center shrink-0 overflow-hidden border border-deep-navy/15 rounded-lg bg-white"
        >
          <input
            v-model.number="localMaxAttendeesPerUser"
            type="number"
            min="0"
            max="20"
            step="1"
            :disabled="isSaving || !canEditLimits"
            class="w-14 px-2 py-2 text-sm text-center border-0 focus:outline-none focus:ring-0 disabled:bg-navy-50 disabled:text-navy-400"
          />

          <div class="w-px h-6 bg-deep-navy/10"></div>

          <button
            type="button"
            :disabled="!canSaveUserLimit"
            @click="saveUserLimit"
            class="px-2.5 py-2 text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">
              check
            </span>
          </button>
        </div>
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
