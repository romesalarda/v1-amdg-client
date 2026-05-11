<template>
  <div class="space-y-4">
    <div class="rounded-xl border border-deep-navy/10 bg-white/95 p-4">
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs uppercase tracking-wider text-deep-navy/55 font-black">Booking steps</p>
        <button
          type="button"
          class="rounded-lg border border-deep-navy/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-500 hover:text-blue-700"
          @click="props.onToggleJourneyDetails()"
        >
          {{ props.hideAllJourneyDetails ? 'Show all details' : 'Hide all details' }}
        </button>
      </div>
      <div class="mt-4 relative">
        <div class="pointer-events-none absolute left-3 top-6 bottom-6 w-px bg-blue-200"></div>
        <ol class="space-y-4 relative">
          <li
            v-for="step in props.journeySteps"
            :key="step.id"
            class="relative pl-10"
          >
            <div
              class="absolute left-0 top-1 h-6 w-6 rounded-full border text-[11px] font-black flex items-center justify-center"
              :class="step.done ? 'border-green-300 bg-green-50 text-green-700' : 'border-blue-300 bg-blue-50 text-blue-700'"
            >
              {{ step.id }}
            </div>
            <div class="min-w-0  bg-white p-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-deep-navy">{{ step.title }}</p>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
                  :class="step.done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ step.done ? 'Done' : 'Next' }}
                </span>
              </div>
              <p class="mt-1 text-xs text-deep-navy/70">{{ step.description }}</p>
              <button
                type="button"
                class="mt-2 rounded-lg border border-deep-navy/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-500 hover:text-blue-700"
                @click="props.onJourneyStepAction(step.action)"
              >
                {{ step.cta }}
              </button>

              <div v-if="!props.hideAllJourneyDetails" class="mt-3 rounded-lg border border-deep-navy/10 bg-mist-blue/20 p-3 text-xs text-deep-navy/80 space-y-2">
                <template v-if="step.action === 'shop'">
                  <p class="font-semibold text-deep-navy">
                    {{ props.outstandingPayments.length ? `${props.outstandingPayments.length} payment(s) still outstanding.` : 'Registration complete. No outstanding payments.' }}
                  </p>
                  <OutstandingPaymentCarouselCard
                    v-if="props.outstandingPayments.length"
                    :payments="props.outstandingPayments"
                    @refresh="props.onRefreshOutstandingPayments()"
                  />
                </template>

                <template v-else-if="step.action === 'info'">
                  <div>
                    <p class="font-black uppercase tracking-wide text-[10px] text-deep-navy/60">What to bring</p>
                    <p class="mt-1 whitespace-pre-line">{{ props.eventWhatToBring }}</p>
                  </div>
                  <div>
                    <p class="font-black uppercase tracking-wide text-[10px] text-deep-navy/60">Important info</p>
                    <p class="mt-1 whitespace-pre-line">{{ props.eventCheckInInstructions }}</p>
                  </div>
                </template>

                <template v-else-if="step.action === 'location'">
                  <p class="font-semibold text-deep-navy">{{ props.eventLocation }}</p>
                  <p v-if="props.primaryVenue?.venue_address">{{ props.primaryVenue.venue_address }}</p>
                  <p v-if="props.primaryVenue?.venue_city">{{ props.primaryVenue.venue_city }}</p>
                  <iframe
                    v-if="props.venueMapEmbedUrl"
                    :src="props.venueMapEmbedUrl"
                    class="w-full h-40 border-0 rounded-md"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                  ></iframe>
                </template>

                <template v-else-if="step.action === 'time'">
                  <p><span class="font-black text-deep-navy">Starts:</span> {{ props.formatDateTime(props.eventStart) }}</p>
                  <p><span class="font-black text-deep-navy">Ends:</span> {{ props.formatDateTime(props.eventEnd) }}</p>
                  <p><span class="font-black text-deep-navy">Timezone:</span> {{ props.timezone || 'UTC' }}</p>
                </template>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OutstandingPaymentCarouselCard from '~/components/events/booking/OutstandingPaymentCarouselCard.vue'

type JourneyStepAction = 'shop' | 'info' | 'location' | 'time'

const props = defineProps<{
  booking: any
  event: any
  attendees: any[]
  journeySteps: Array<{
    id: number
    title: string
    description: string
    done: boolean
    action: JourneyStepAction
    cta: string
  }>
  hideAllJourneyDetails: boolean
  outstandingPayments: any[]
  primaryVenue?: any
  eventTitle?: string
  eventStart: string
  eventEnd: string
  eventLocation?: string
  eventWhatToBring?: string
  eventCheckInInstructions?: string
  venueMapEmbedUrl?: string
  eventVenues?: any[]
  timezone?: string
  formattedBookedAt?: string
  isSingleAttendeeBooking?: boolean
  formatDateTime: (value: string) => string
  onToggleJourneyDetails: () => void
  onJourneyStepAction: (action: JourneyStepAction) => void
  onRefreshOutstandingPayments: () => void
}>()
</script>
