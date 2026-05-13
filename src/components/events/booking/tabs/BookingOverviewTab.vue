<template>
  <div class="space-y-4">
    <div class="rounded-xl border border-deep-navy/10 bg-white/95 p-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-headline-sm font-headline text-deep-navy">Booking Steps</h2>
        <button
          type="button"
          class="rounded-lg border border-deep-navy/20 px-3 py-1 text-label-bold font-label-bold uppercase text-deep-navy hover:border-primary hover:text-primary transition-colors"
          @click="props.onToggleJourneyDetails()"
        >
          {{ props.hideAllJourneyDetails ? 'Show all details' : 'Hide all details' }}
        </button>
      </div>
      <div class="mt-4">
        <ol class="space-y-5 relative">
          <li
            v-for="(step, index) in props.journeySteps"
            :key="step.id"
            class="relative pl-12"
          >
            <!-- vertical connector line drawn from circle bottom to next item -->
            <div
              v-if="index < props.journeySteps.length - 1"
              class="absolute left-[15px] top-8 bottom-[-20px] w-0.5 bg-deep-navy/15 pointer-events-none"
            ></div>
            <div
              class="absolute left-0 top-0.5 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10"
              :class="step.done
                ? 'border-green-500 bg-green-500 text-white shadow-sm'
                : 'border-primary bg-primary/10 text-primary shadow-[0_0_0_4px_rgba(0,33,71,0.07)]'"
            >
              <span v-if="step.done" class="material-symbols-outlined" style="font-size:16px;line-height:1;font-variation-settings:'FILL' 1,'wght' 700">check</span>
              <span v-else class="text-sm font-black leading-none">{{ step.id }}</span>
            </div>
            <div class="min-w-0 bg-white p-3">
              <div class="flex items-center justify-between gap-2">
                <p class="text-headline-sm font-headline text-deep-navy">{{ step.title }}</p>
                <span
                  class="rounded px-2 py-0.5 text-label-bold font-label-bold uppercase tracking-widest"
                  :class="step.done ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'"
                >
                  {{ step.done ? 'Done' : 'Next' }}
                </span>
              </div>
              <p class="mt-1 text-body-sm font-body-sm text-deep-navy/70">{{ step.description }}</p>
              <button
                type="button"
                class="mt-3 rounded-lg px-3 py-1.5 text-label-bold font-label-bold uppercase tracking-wide transition-all"
                :class="step.done
                  ? 'border border-deep-navy/20 text-deep-navy hover:border-primary hover:text-primary'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-sm'"
                @click="props.onJourneyStepAction(step.action)"
              >
                {{ step.cta }}
              </button>

              <div v-if="!props.hideAllJourneyDetails" class="mt-3 rounded-lg border border-deep-navy/10 bg-mist-blue/20 p-3 text-body-sm font-body-sm text-deep-navy/80 space-y-2">
                <template v-if="step.action === 'shop'">
                  <p class="font-bold text-deep-navy">
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
                    <p class="text-label-bold font-label-bold uppercase tracking-wide text-deep-navy/60">What to bring</p>
                    <p class="mt-1 whitespace-pre-line">{{ props.eventWhatToBring }}</p>
                  </div>
                  <div>
                    <p class="text-label-bold font-label-bold uppercase tracking-wide text-deep-navy/60">Important info</p>
                    <p class="mt-1 whitespace-pre-line">{{ props.eventCheckInInstructions }}</p>
                  </div>
                </template>

                <template v-else-if="step.action === 'location'">
                  <p class="font-bold text-deep-navy">{{ props.eventLocation }}</p>
                  <p v-if="props.primaryVenue?.address">{{ props.primaryVenue.address }}</p>
                  <p v-if="props.primaryVenue?.city">{{ props.primaryVenue.city }}</p>
                  <iframe
                    v-if="props.venueMapEmbedUrl"
                    :src="props.venueMapEmbedUrl"
                    class="w-full h-40 border-0 rounded-md"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                  ></iframe>
                </template>

                <template v-else-if="step.action === 'time'">
                  <p><span class="font-bold text-deep-navy">Starts:</span> {{ props.formatDateTime(props.eventStart) }}</p>
                  <p><span class="font-bold text-deep-navy">Ends:</span> {{ props.formatDateTime(props.eventEnd) }}</p>
                  <p><span class="font-bold text-deep-navy">Timezone:</span> {{ props.timezone || 'UTC' }}</p>
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
