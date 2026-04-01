<template>
  <div class="min-h-screen bg-mist-blue">
    <section class="relative h-[300px] w-full overflow-hidden bg-deep-navy">
      <img
        v-if="heroImage"
        :src="heroImage"
        alt="Event hero"
        class="h-full w-full object-cover opacity-40"
        @error="onImageError"
      >
      <div class="absolute inset-0 bg-gradient-to-r from-deep-navy/95 via-deep-navy/85 to-deep-navy/70"></div>

      <div class="absolute inset-0 flex items-center">
        <div class="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div class="lg:justify-self-end lg:max-w-xl w-full">
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">Your booking for</p>
            <h1 class="mt-3 text-4xl md:text-5xl font-black leading-tight text-white">{{ eventTitle }}</h1>
            <p class="mt-2 text-white/80 text-sm">{{ booking?.booking_reference || '-' }}</p>
            <p class="mt-1 text-white/70 text-sm">Hello, {{ booking?.made_by_name || 'Unknown' }}</p>
          </div>

          <div class="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 text-white animate-soft-in lg:justify-self-start lg:max-w-md w-full">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">We will see you in ...</p>
            <div v-if="hasStarted" class="mt-4">
              <p class="text-2xl font-black">Event started</p>
              <p class="text-xs text-white/75 mt-1">{{ formatEventDate(eventStart) }}</p>
            </div>
            <div v-else class="mt-4 flex items-stretch gap-2 text-center">
              <div class="countdown-tile flex-1">
                <p class="text-2xl font-black leading-none">{{ countdown.days }}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/65 mt-1">Days</p>
              </div>
              <div class="countdown-tile flex-1">
                <p class="text-2xl font-black leading-none">{{ countdown.hours }}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/65 mt-1">Hours</p>
              </div>
              <div class="countdown-tile flex-1">
                <p class="text-2xl font-black leading-none">{{ countdown.minutes }}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/65 mt-1">Mins</p>
              </div>
              <div class="countdown-tile countdown-tile-live flex-1">
                <p class="text-2xl font-black leading-none">{{ countdown.seconds }}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/65 mt-1">Secs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="booking" class="relative z-20 bg-white border-b border-deep-navy/10 shadow-sm animate-soft-in-delay">
      <div class="max-w-screen-xl mx-auto px-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-deep-navy/10">
          <div class="flex items-center gap-3 p-4 min-w-0">
            <svg class="w-6 h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Date</p>
              <p class="text-sm font-black text-deep-navy truncate">{{ formatEventDate(eventStart) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 min-w-0">
            <svg class="w-6 h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Timing</p>
              <p class="text-sm font-black text-deep-navy truncate">{{ formatEventDate(eventStart) }}</p>
              <p class="text-[11px] text-deep-navy/70 truncate">Ends {{ formatEventDate(eventEnd) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 min-w-0">
            <svg class="w-6 h-6 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Location</p>
              <p class="text-sm font-black text-deep-navy truncate">{{ eventLocation }}</p>
              <p v-if="primaryVenue?.venue_city" class="text-[11px] text-deep-navy/70 truncate">{{ primaryVenue.venue_city }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 min-w-0">
            <svg class="w-6 h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50">Booking status</p>
              <p class="text-sm font-black" :class="outstandingPayments.length ? 'text-amber-700' : 'text-green-700'">
                {{ outstandingPayments.length ? `${outstandingPayments.length} payment(s) outstanding` : 'No outstanding payments' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="booking && selectedAttendeeId" class="border-b border-deep-navy/10 bg-white/95 backdrop-blur-sm">
      <div class="max-w-screen-xl mx-auto px-6 overflow-x-auto">
        <div class="min-w-max flex items-center gap-2 py-3">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="setActiveTab(tab.id)"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border',
              activeTab === tab.id
                ? 'bg-deep-navy text-white border-deep-navy'
                : 'bg-white text-deep-navy border-deep-navy/15 hover:border-blue-400 hover:text-blue-700'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-screen-xl mx-auto px-6 py-8 pb-28">
      <div v-if="myBooking.isLoading.value" class="rounded-2xl bg-white border border-deep-navy/10 p-6 text-sm text-deep-navy/70">
        Loading booking details...
      </div>

      <div v-else-if="myBooking.error.value && !isNotFound" class="rounded-2xl bg-red-50 border border-red-200 p-6 text-sm text-red-700">
        Unable to load booking details right now.
      </div>

      <div v-else-if="booking" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section class="lg:col-span-8 space-y-4">
          <article v-if="activeTab === 'overview'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
            <div class="rounded-xl border border-deep-navy/10 p-4 bg-mist-blue/30">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs uppercase tracking-wider text-deep-navy/55 font-black">Booking steps</p>
                <button
                  type="button"
                  class="rounded-lg border border-deep-navy/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-500 hover:text-blue-700"
                  @click="hideAllJourneyDetails = !hideAllJourneyDetails"
                >
                  {{ hideAllJourneyDetails ? 'Show all details' : 'Hide all details' }}
                </button>
              </div>
              <ol class="mt-3 space-y-3">
                <li
                  v-for="step in journeySteps"
                  :key="step.id"
                  class="rounded-lg border border-deep-navy/10 bg-white p-3"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="h-7 w-7 shrink-0 rounded-full border text-xs font-black flex items-center justify-center"
                      :class="step.done ? 'border-green-300 bg-green-50 text-green-700' : 'border-blue-300 bg-blue-50 text-blue-700'"
                    >
                      {{ step.id }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-semibold text-deep-navy">{{ step.title }}</p>
                        <span
                          class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
                          :class="step.done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                        >
                          {{ step.done ? 'Done' : 'Next' }}
                        </span>
                      </div>
                      <p class="mt-1 text-xs text-deep-navy/70">{{ step.description }}</p>
                      <button
                        type="button"
                        class="mt-2 rounded-lg border border-deep-navy/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-500 hover:text-blue-700"
                        @click="handleJourneyStepAction(step.action)"
                      >
                        {{ step.cta }}
                      </button>

                      <div v-if="!hideAllJourneyDetails" class="mt-3 rounded-lg border border-deep-navy/10 bg-mist-blue/20 p-3 text-xs text-deep-navy/80 space-y-2">
                        <template v-if="step.action === 'shop'">
                          <p class="font-semibold text-deep-navy">
                            {{ outstandingPayments.length ? `${outstandingPayments.length} payment(s) still outstanding.` : 'Registration complete. No outstanding payments.' }}
                          </p>
                          <p v-if="outstandingPayments.length" class="text-deep-navy/70">Next payment: {{ outstandingPayments[0]?.payment_reference || 'Pending payment' }}</p>

                          <div v-if="outstandingPayments.length" class="space-y-2">
                            <div
                              v-for="payment in outstandingPayments"
                              :key="payment.payment_id || payment.payment_reference"
                              class="rounded-lg border border-amber-300 bg-amber-50 p-3 outstanding-attention-pulse"
                            >
                              <div class="flex items-center justify-between gap-2">
                                <p class="text-xs font-black text-amber-900">{{ payment.payment_reference || 'Pending payment' }}</p>
                                <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700">
                                  {{ payment.status || 'PENDING' }}
                                </span>
                              </div>
                              <p class="mt-1 text-lg font-black text-deep-navy">{{ payment.amount || '-' }}</p>
                              <p class="mt-1 text-[11px] text-deep-navy/75">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>

                              <div v-if="isOutstandingBankTransfer(payment)" class="mt-2 rounded-md border border-amber-200 bg-white p-3 text-[12px] text-deep-navy/90 space-y-2">
                                <p class="font-black uppercase tracking-wide text-[10px] text-amber-700">Bank transfer instructions</p>
                                <ol class="space-y-2">
                                  <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                                    <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">1. Pay this exact amount</p>
                                    <p class="mt-1 text-xl font-black text-deep-navy">{{ payment.amount || '-' }}</p>
                                  </li>
                                  <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                                    <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">2. Use these account details</p>
                                    <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                                        <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Account name</p>
                                        <p class="mt-1 text-sm font-black text-deep-navy break-words">{{ getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                                      </div>
                                    <div class="mt-1 grid sm:grid-cols-2 gap-2">
                                      
                                      <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                                        <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Sort code</p>
                                        <p class="mt-1 text-lg font-black text-deep-navy">{{ getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                                      </div>
                                      <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                                        <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Account number</p>
                                        <p class="mt-1 text-lg font-black text-deep-navy">{{ getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                                      </div>
                                    </div>
                                  </li>
                                  <li v-if="getRequiredTransferReference(payment)" class="rounded-md border border-amber-300 bg-amber-50 p-2">
                                    <p class="text-[10px] font-black uppercase tracking-wide text-amber-800">3. Add this exact transfer reference</p>
                                    <div class="mt-1 flex items-center justify-between gap-2">
                                      <p class="text-sm font-black text-amber-900 break-all">{{ getRequiredTransferReference(payment) }}</p>
                                      <button
                                        type="button"
                                        class="shrink-0 rounded-md border border-amber-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700 hover:bg-amber-100"
                                        @click="copyTransferReference(getRequiredTransferReference(payment) || '')"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  </li>
                                </ol>
                              </div>

                              <p v-else class="mt-2 text-[11px] text-deep-navy/70">
                                Payment method is {{ payment.method_title || payment.method_type || 'different from bank transfer' }}.
                              </p>
                            </div>
                          </div>
                        </template>

                        <template v-else-if="step.action === 'info'">
                          <div>
                            <p class="font-black uppercase tracking-wide text-[10px] text-deep-navy/60">What to bring</p>
                            <p class="mt-1 whitespace-pre-line">{{ eventWhatToBring }}</p>
                          </div>
                          <div>
                            <p class="font-black uppercase tracking-wide text-[10px] text-deep-navy/60">Important info</p>
                            <p class="mt-1 whitespace-pre-line">{{ eventCheckInInstructions }}</p>
                          </div>
                        </template>

                        <template v-else-if="step.action === 'location'">
                          <p class="font-semibold text-deep-navy">{{ eventLocation }}</p>
                          <p v-if="primaryVenue?.venue_address">{{ primaryVenue.venue_address }}</p>
                          <p v-if="primaryVenue?.venue_city">{{ primaryVenue.venue_city }}</p>
                          <iframe
                            v-if="venueMapEmbedUrl"
                            :src="venueMapEmbedUrl"
                            class="w-full h-40 border-0 rounded-md"
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </template>

                        <template v-else-if="step.action === 'time'">
                          <p><span class="font-black text-deep-navy">Starts:</span> {{ formatEventDate(eventStart) }}</p>
                          <p><span class="font-black text-deep-navy">Ends:</span> {{ formatEventDate(eventEnd) }}</p>
                          <p><span class="font-black text-deep-navy">Timezone:</span> {{ myBookingData?.event?.timezone || 'UTC' }}</p>
                        </template>
                      </div>
                    </div>
                  </div>
                </li>
              </ol>
            </div>

            <div id="briefing-info" class="rounded-xl border border-deep-navy/10 p-4">
              <p class="text-xs uppercase tracking-wider text-deep-navy/55 font-black">Event briefing</p>
              <div class="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                <div id="briefing-location" class="rounded-lg border border-deep-navy/10 p-3 bg-mist-blue/40">
                  <p class="text-[10px] uppercase tracking-widest text-deep-navy/60 font-black">Location</p>
                  <p class="mt-1 font-semibold text-deep-navy">{{ eventLocation }}</p>
                  <p v-if="primaryVenue?.venue_address" class="text-xs text-deep-navy/70 mt-1">{{ primaryVenue.venue_address }}</p>
                </div>
                <div id="briefing-time" class="rounded-lg border border-deep-navy/10 p-3 bg-mist-blue/40">
                  <p class="text-[10px] uppercase tracking-widest text-deep-navy/60 font-black">Timing</p>
                  <p class="mt-1 font-semibold text-deep-navy">Starts: {{ formatEventDate(eventStart) }}</p>
                  <p class="text-xs text-deep-navy/70">Ends: {{ formatEventDate(eventEnd) }}</p>
                  <p class="text-xs text-deep-navy/70">Timezone: {{ myBookingData?.event?.timezone || 'UTC' }}</p>
                </div>
                <div class="rounded-lg border border-deep-navy/10 p-3 md:col-span-2">
                  <p class="text-[10px] uppercase tracking-widest text-deep-navy/60 font-black">What to bring</p>
                  <p class="mt-1 text-deep-navy/80 whitespace-pre-line">{{ eventWhatToBring }}</p>
                </div>
                <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 md:col-span-2">
                  <p class="text-[10px] uppercase tracking-widest text-amber-700 font-black">Check-in instructions</p>
                  <p class="mt-1 text-amber-900/85 whitespace-pre-line">{{ eventCheckInInstructions }}</p>
                </div>
                <div v-if="primaryVenue?.venue_address" class="rounded-lg border border-deep-navy/10 overflow-hidden md:col-span-2">
                  <iframe
                    :src="venueMapEmbedUrl"
                    class="w-full h-56 border-0"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="rounded-xl border border-deep-navy/10 p-4">
                <p class="text-xs uppercase tracking-wider text-deep-navy/55 font-black">Booking summary</p>
                <dl class="mt-3 space-y-2 text-sm text-deep-navy/85">
                  <div class="flex justify-between">
                    <dt>Booked at</dt>
                    <dd class="font-semibold">{{ formattedBookedAt }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt>Attendees</dt>
                    <dd class="font-semibold">{{ attendees.length }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt>Payments</dt>
                    <dd class="font-semibold">{{ booking.payments?.length || 0 }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt>Outstanding</dt>
                    <dd class="font-semibold" :class="outstandingPayments.length ? 'text-amber-700' : 'text-green-700'">
                      {{ outstandingPayments.length }}
                    </dd>
                  </div>
                </dl>
              </div>

              <div class="rounded-xl border border-deep-navy/10 p-4">
                <p class="text-xs uppercase tracking-wider text-deep-navy/55 font-black">Access status</p>
                <p class="mt-3 text-sm" :class="canManageAllAttendees ? 'text-green-700' : 'text-amber-700'">
                  {{ canManageAllAttendees ? 'You can fully manage attendees for this booking.' : 'You have limited attendee management access.' }}
                </p>
                <p class="mt-2 text-xs text-deep-navy/65">{{ selectedAttendeeId ? 'Tabs are unlocked for the selected attendee below.' : 'Select an attendee to unlock attendee tabs and orders.' }}</p>
              </div>
            </div>

            <div class="rounded-xl border border-deep-navy/10 p-4 bg-mist-blue/30">
              <p class="text-sm text-deep-navy/75">Attendee selection is pinned in the right panel for quicker switching while you edit.</p>
            </div>
          </article>

          <article v-if="selectedAttendeeId && activeTab === 'orders'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-black uppercase tracking-wide text-deep-navy">Orders</p>
              <p class="text-xs text-deep-navy/60">{{ selectedAttendee?.name || 'Attendee' }}</p>
            </div>

            <div v-if="attendeeOrders.isLoading.value" class="text-sm text-deep-navy/60">Loading orders...</div>
            <div v-else-if="attendeeOrders.error.value" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Unable to load orders right now.
            </div>
            <template v-else>
              <section class="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black uppercase tracking-wider text-amber-700">Outstanding payments</p>
                  <p class="text-xs text-amber-800">{{ outstandingPayments.length }}</p>
                </div>
                <div v-if="outstandingPayments.length" class="mt-3 space-y-2">
                  <div
                    v-for="payment in outstandingPayments"
                    :key="payment.payment_id || payment.payment_reference"
                    class="rounded-lg border border-amber-300 bg-white p-3 outstanding-attention-pulse"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="text-xs font-black text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                        <p class="text-sm font-semibold text-deep-navy">{{ payment.amount || '-' }}</p>
                        <p class="text-xs text-amber-700">{{ payment.status || 'PENDING' }}</p>
                        <p class="text-[11px] text-deep-navy/75 mt-1">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
                      </div>
                      <button
                        type="button"
                        class="rounded-lg border border-amber-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-amber-700 hover:bg-amber-100"
                        @click="togglePaymentExpand(payment)"
                      >
                        {{ isPaymentExpanded(payment.payment_id || '') ? 'Hide details' : 'View method' }}
                      </button>
                    </div>

                    <div v-if="isPaymentExpanded(payment.payment_id || '')" class="mt-3 rounded-lg border border-deep-navy/10 bg-mist-blue/40 p-3 text-xs text-deep-navy/80 space-y-2">
                      <p v-if="paymentDetailLoading[payment.payment_id || '']">Loading payment method...</p>
                      <template v-else>
                        <p><span class="font-black text-deep-navy">Method:</span> {{ getPaymentMethodType(payment.payment_id || '') }}</p>
                        <div v-if="isOutstandingBankTransfer(payment)" class="rounded-md border border-amber-200 bg-white p-3 space-y-2">
                          <p class="font-black uppercase tracking-wide text-[10px] text-amber-700">Bank transfer instructions</p>
                          <ol class="space-y-2 text-[12px] text-deep-navy/90">
                            <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                              <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">1. Pay this exact amount</p>
                              <p class="mt-1 text-xl font-black text-deep-navy">{{ payment.amount || '-' }}</p>
                            </li>
                            <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                              <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">2. Use these account details</p>
                              <div class="mt-1 grid sm:grid-cols-3 gap-2">
                                <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                                  <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Account name</p>
                                  <p class="mt-1 text-sm font-black text-deep-navy break-words">{{ getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                                </div>
                                <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                                  <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Sort code</p>
                                  <p class="mt-1 text-lg font-black text-deep-navy">{{ getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                                </div>
                                <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                                  <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Account number</p>
                                  <p class="mt-1 text-lg font-black text-deep-navy">{{ getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                                </div>
                              </div>
                            </li>
                            <li v-if="getRequiredTransferReference(payment)" class="rounded-md border border-amber-300 bg-amber-50 p-2">
                              <p class="text-[10px] font-black uppercase tracking-wide text-amber-800">3. Add this exact transfer reference</p>
                              <div class="mt-1 flex items-center justify-between gap-2">
                                <p class="text-sm font-black text-amber-900 break-all">{{ getRequiredTransferReference(payment) }}</p>
                                <button
                                  type="button"
                                  class="shrink-0 rounded-md border border-amber-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700 hover:bg-amber-100"
                                  @click="copyTransferReference(getRequiredTransferReference(payment) || '')"
                                >
                                  Copy
                                </button>
                              </div>
                            </li>
                          </ol>
                        </div>

                        <p v-if="!isOutstandingBankTransfer(payment)" class="text-[11px] text-deep-navy/70">
                          This payment is {{ payment.method_title || payment.method_type || 'not bank transfer' }}.
                        </p>
                        <p v-if="getBankTransferReference(payment.payment_id || '')"><span class="font-black text-deep-navy">Bank transfer reference:</span> {{ getBankTransferReference(payment.payment_id || '') }}</p>
                        <p v-if="getBankTransferInstructions(payment.payment_id || '')" class="whitespace-pre-line"><span class="font-black text-deep-navy">Instructions:</span> {{ getBankTransferInstructions(payment.payment_id || '') }}</p>
                      </template>
                    </div>
                  </div>
                </div>
                <p v-else class="mt-2 text-sm text-green-700">No outstanding payments linked to this booking.</p>
              </section>

              <div v-if="attendeeOrderList.length" class="space-y-3">
                <article v-for="order in attendeeOrderList" :key="order.order_id || order.id" class="rounded-xl border border-deep-navy/10 overflow-hidden">
                  <div class="px-4 py-3 bg-gray-50 border-b border-deep-navy/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p class="font-black text-deep-navy text-sm">Order {{ order.order_reference_id || order.order_id }}</p>
                      <p class="text-xs text-deep-navy/60">{{ formatEventDate(order.created_at) }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide"
                        :class="getOrderStatusBadgeClass(order.status)">
                        {{ order.status_display || order.status || 'Unknown' }}
                      </span>
                      <span class="text-xs text-deep-navy/70">{{ order.item_count }} item(s)</span>
                      <span class="text-sm font-bold text-deep-navy">{{ order.total_amount }}</span>
                      <button
                        v-if="canCancelOrder(order.status)"
                        type="button"
                        class="rounded-lg border border-red-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50"
                        @click="cancelOrder(order.id)"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div class="p-4 space-y-3">
                    <div
                      v-for="item in order.order_items || []"
                      :key="item.id"
                      class="rounded-lg border border-deep-navy/10 p-3"
                    >
                      <div class="flex items-start gap-3">
                        <img
                          v-if="getOrderItemImageUrl(item)"
                          :src="resolveImageUrl(getOrderItemImageUrl(item) || '')"
                          alt="Order item"
                          class="h-14 w-14 rounded-lg object-cover border border-deep-navy/10"
                          @error="onImageError"
                        >
                        <div class="min-w-0 flex-1">
                          <p class="text-sm font-semibold text-deep-navy truncate">{{ getOrderItemTitle(item) }}</p>
                          <p class="text-xs text-deep-navy/60">{{ getOrderItemCode(item) }}</p>
                          <div class="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            <span class="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 font-semibold">Qty {{ item.quantity }}</span>
                            <span class="rounded-full bg-mist-blue text-deep-navy px-2 py-0.5 font-semibold">Unit {{ item.unit_price }}</span>
                            <span class="rounded-full bg-deep-navy text-white px-2 py-0.5 font-semibold">Total {{ item.total_price }}</span>
                            <span v-if="getOrderItemSize(item)" class="rounded-full border border-deep-navy/20 px-2 py-0.5">{{ getOrderItemSize(item) }}</span>
                            <span v-if="getOrderItemColor(item)" class="inline-flex items-center gap-1 rounded-full border border-deep-navy/20 px-2 py-0.5">
                              <span class="h-3 w-3 rounded-full border border-deep-navy/20" :style="getOrderItemColorStyle(item)"></span>
                              {{ getOrderItemColor(item) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
              <p v-else class="text-sm text-deep-navy/60">No orders found for this attendee yet.</p>
            </template>
          </article>

          <article v-if="selectedAttendeeId && activeTab === 'attendee'" class="bg-white border border-deep-navy/10 rounded-2xl p-5">
            <div v-if="!selectedAttendeeId" class="text-sm text-deep-navy/60">Select an attendee from Booking Overview first.</div>
            <div v-else-if="attendee.isLoading.value" class="text-sm text-deep-navy/60">Loading attendee...</div>
            <div v-else class="space-y-4">
              <div class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Editing attendee</p>
                <p class="mt-1 text-sm font-semibold text-blue-900">{{ attendee.data.value?.data?.full_name || selectedAttendee?.name || 'Attendee' }}</p>
                <p class="text-xs text-blue-800/80">{{ attendee.data.value?.data?.attendee_display_id || selectedAttendee?.display_id || selectedAttendeeId }}</p>
              </div>
              <p class="text-sm font-black uppercase tracking-wide text-deep-navy">Attendee editor</p>
              <form class="space-y-4" @submit.prevent="saveAttendee">
                <div class="grid md:grid-cols-2 gap-4">
                  <label class="space-y-1 text-sm">
                    <span>First name</span>
                    <input v-model="attendeeForm.first_name" type="text" required class="w-full rounded-lg border border-deep-navy/15 px-3 py-2">
                  </label>
                  <label class="space-y-1 text-sm">
                    <span>Last name</span>
                    <input v-model="attendeeForm.last_name" type="text" required class="w-full rounded-lg border border-deep-navy/15 px-3 py-2">
                  </label>
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                  <label class="space-y-1 text-sm">
                    <span>Email</span>
                    <input v-model="attendeeForm.email" type="email" class="w-full rounded-lg border border-deep-navy/15 px-3 py-2">
                  </label>
                  <label class="space-y-1 text-sm">
                    <span>Phone</span>
                    <input v-model="attendeeForm.phone_number" type="text" class="w-full rounded-lg border border-deep-navy/15 px-3 py-2">
                  </label>
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                  <label class="space-y-1 text-sm">
                    <span>Date of birth</span>
                    <input v-model="attendeeForm.date_of_birth" type="date" class="w-full rounded-lg border border-deep-navy/15 px-3 py-2">
                  </label>
                  <label class="space-y-1 text-sm">
                    <span>Gender</span>
                    <input v-model="attendeeForm.gender" type="text" class="w-full rounded-lg border border-deep-navy/15 px-3 py-2">
                  </label>
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                  <label class="space-y-1 text-sm">
                    <span>Relationship</span>
                    <select v-model="attendeeForm.relationship_to_user" class="w-full rounded-lg border border-deep-navy/15 px-3 py-2">
                      <option value="">Not set</option>
                      <option value="self">Self</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label class="space-y-1 text-sm">
                    <span>Area id</span>
                    <input v-model.number="attendeeForm.area_from" type="number" min="1" class="w-full rounded-lg border border-deep-navy/15 px-3 py-2">
                  </label>
                </div>
                <div class="flex justify-end">
                  <button type="submit" :disabled="updateAttendee.isPending.value" class="rounded-xl bg-deep-navy px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-600 disabled:opacity-55">
                    {{ updateAttendee.isPending.value ? 'Saving...' : 'Save attendee' }}
                  </button>
                </div>
              </form>
            </div>
          </article>

          <article v-if="selectedAttendeeId && activeTab === 'health'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-6">
            <div v-if="!selectedAttendeeId" class="text-sm text-deep-navy/60">Select an attendee from Booking Overview first.</div>
            <template v-else>
              <section class="space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Medical conditions</p>
                  <button type="button" class="text-xs text-blue-700 font-semibold" @click="addMedicalCondition">Add</button>
                </div>
                <div class="grid md:grid-cols-2 gap-2">
                  <select v-model.number="newMedical.medical_condition" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm">
                    <option :value="null">Select condition</option>
                    <option v-for="item in medicalConditions.data.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                  </select>
                  <input v-model="newMedical.details" type="text" placeholder="Details" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm">
                </div>
                <div class="space-y-2">
                  <div v-for="item in attendeeMedicalConditions.data.value?.data?.results || []" :key="item.id" class="rounded-lg border border-deep-navy/10 p-3 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-deep-navy">{{ item.condition_details.label }}</p>
                      <p class="text-xs text-deep-navy/60">{{ item.details || 'No details' }}</p>
                    </div>
                    <button type="button" class="text-xs text-red-600 font-semibold" @click="removeMedicalCondition(item.id)">Remove</button>
                  </div>
                </div>
              </section>

              <section class="space-y-3 pt-4 border-t border-deep-navy/10">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Dietary requirements</p>
                  <button type="button" class="text-xs text-blue-700 font-semibold" @click="addDietaryRequirement">Add</button>
                </div>
                <div class="grid md:grid-cols-2 gap-2">
                  <select v-model.number="newDietary.dietary_requirement" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm">
                    <option :value="null">Select requirement</option>
                    <option v-for="item in dietaryRequirements.data.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                  </select>
                  <input v-model="newDietary.details" type="text" placeholder="Details" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm">
                </div>
                <div class="space-y-2">
                  <div v-for="item in attendeeDietaryRequirements.data.value?.data?.results || []" :key="item.id" class="rounded-lg border border-deep-navy/10 p-3 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-deep-navy">{{ item.requirement_details.label }}</p>
                      <p class="text-xs text-deep-navy/60">{{ item.details || 'No details' }}</p>
                    </div>
                    <button type="button" class="text-xs text-red-600 font-semibold" @click="removeDietaryRequirement(item.id)">Remove</button>
                  </div>
                </div>
              </section>

              <section class="space-y-3 pt-4 border-t border-deep-navy/10">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Accessibility requirements</p>
                  <button type="button" class="text-xs text-blue-700 font-semibold" @click="addAccessibilityRequirement">Add</button>
                </div>
                <div class="grid md:grid-cols-2 gap-2">
                  <select v-model.number="newAccessibility.accessibility_requirement" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm">
                    <option :value="null">Select requirement</option>
                    <option v-for="item in accessibilityRequirements.data.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                  </select>
                  <input v-model="newAccessibility.details" type="text" placeholder="Details" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm">
                </div>
                <div class="space-y-2">
                  <div v-for="item in attendeeAccessibilityRequirements.data.value?.data?.results || []" :key="item.id" class="rounded-lg border border-deep-navy/10 p-3 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-deep-navy">{{ item.requirement_details.label }}</p>
                      <p class="text-xs text-deep-navy/60">{{ item.details || 'No details' }}</p>
                    </div>
                    <button type="button" class="text-xs text-red-600 font-semibold" @click="removeAccessibilityRequirement(item.id)">Remove</button>
                  </div>
                </div>
              </section>
            </template>
          </article>

          <article v-if="selectedAttendeeId && activeTab === 'consents'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
            <div v-if="!selectedAttendeeId" class="text-sm text-deep-navy/60">Select an attendee from Booking Overview first.</div>
            <template v-else>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Consents</p>
              <div class="space-y-2">
                <div
                  v-for="item in attendeeConsents.data.value?.data?.results || []"
                  :key="item.id"
                  class="rounded-lg border border-deep-navy/10 p-3 flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-deep-navy">{{ item.consent_details.title }}</p>
                    <p class="text-xs text-deep-navy/60">{{ item.consent_details.required ? 'Required' : 'Optional' }}</p>
                  </div>
                  <button type="button" class="text-xs font-semibold" :class="item.consent_given ? 'text-green-700' : 'text-amber-700'" @click="toggleConsent(item)">
                    {{ item.consent_given ? 'Given' : 'Not given' }}
                  </button>
                </div>
              </div>

              <div class="pt-3 border-t border-deep-navy/10 grid md:grid-cols-2 gap-2">
                <select v-model.number="newConsent.consent" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm">
                  <option :value="null">Add consent</option>
                  <option v-for="item in eventConsents.data.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.title }}</option>
                </select>
                <button type="button" class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase" @click="addConsent">Add consent</button>
              </div>
            </template>
          </article>

          <article v-if="selectedAttendeeId && activeTab === 'family'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-6">
            <div v-if="!selectedAttendeeId" class="text-sm text-deep-navy/60">Select an attendee from Booking Overview first.</div>
            <template v-else>
              <section class="space-y-3">
                <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Guardians</p>
                <div class="grid md:grid-cols-3 gap-2">
                  <select v-model="guardianCandidateId" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm md:col-span-2">
                    <option value="">Select attendee as guardian</option>
                    <option v-for="item in guardianCandidates" :key="item.attendee_id" :value="item.attendee_id">{{ item.full_name }} ({{ item.attendee_display_id }})</option>
                  </select>
                  <button type="button" class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase" @click="addGuardian">Add</button>
                </div>
                <div class="space-y-2">
                  <div v-for="item in guardians.data.value?.data?.results || []" :key="item.id" class="rounded-lg border border-deep-navy/10 p-3 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-deep-navy">{{ item.user_name || item.user_email || 'Guardian' }}</p>
                      <p class="text-xs text-deep-navy/60">{{ item.relationship_display }}</p>
                    </div>
                    <button type="button" class="text-xs text-red-600 font-semibold" @click="removeGuardian(item.id)">Remove</button>
                  </div>
                </div>
              </section>

              <section class="space-y-3 pt-4 border-t border-deep-navy/10">
                <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Family groups</p>
                <div class="grid md:grid-cols-3 gap-2">
                  <input v-model="newFamilyGroupName" type="text" placeholder="New family group" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm md:col-span-2">
                  <button type="button" class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase" @click="createFamilyGroup">Create</button>
                </div>
                <div class="grid md:grid-cols-3 gap-2">
                  <select v-model.number="newFamilyMembership.family_group" class="rounded-lg border border-deep-navy/15 px-3 py-2 text-sm md:col-span-2">
                    <option :value="null">Select family group</option>
                    <option v-for="item in familyGroups.data.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.family_name }}</option>
                  </select>
                  <button type="button" class="rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase" @click="addFamilyMembership">Add membership</button>
                </div>
                <div class="space-y-2">
                  <div v-for="item in familyMemberships.data.value?.data?.results || []" :key="item.id" class="rounded-lg border border-deep-navy/10 p-3 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-deep-navy">{{ item.family_name }}</p>
                      <p class="text-xs text-deep-navy/60">{{ item.relationship_display }}</p>
                    </div>
                    <button type="button" class="text-xs text-red-600 font-semibold" @click="removeFamilyMembership(item.id)">Remove</button>
                  </div>
                </div>
              </section>
            </template>
          </article>
        </section>

        <aside class="lg:col-span-4">
          <article class="sticky top-24 bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-5">
            <section>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Select attendee</p>
              <p class="mt-1 text-xs text-deep-navy/60">Pick an attendee to unlock tabs, orders, and editor sections.</p>
              <div v-if="attendees.length" class="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                <button
                  v-for="item in attendees"
                  :key="item.id || item.display_id"
                  type="button"
                  @click="selectAttendee(item.id || '')"
                  class="w-full text-left rounded-lg border px-3 py-3 transition-all"
                  :class="[
                    selectedAttendeeId === item.id ? 'border-blue-500 bg-blue-50' : 'border-deep-navy/10 bg-white hover:border-blue-300',
                    !selectedAttendeeId ? 'attendee-pulse' : ''
                  ]"
                >
                  <p class="text-sm font-semibold text-deep-navy">{{ item.name || 'Unnamed attendee' }}</p>
                  <p class="text-xs text-deep-navy/55">{{ item.display_id || item.id || 'No identifier' }}</p>
                </button>
              </div>
              <p v-else class="mt-3 text-sm text-deep-navy/60">No attendees found for this booking.</p>
            </section>

            <section>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Current editing scope</p>
              <div class="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
                <p v-if="selectedAttendee" class="text-sm font-semibold text-blue-900">
                  Editing attendee {{ selectedAttendee.name || 'Unnamed attendee' }}
                </p>
                <p v-if="selectedAttendee" class="mt-1 text-xs text-blue-800/80">
                  {{ selectedAttendee.display_id || selectedAttendee.id || selectedAttendeeId }}
                </p>
                <p v-else class="text-sm text-blue-900/80">
                  Editing booking overview. Select an attendee to edit attendee-specific tabs.
                </p>
              </div>
            </section>

            <section>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Important alerts</p>
              <div class="mt-3 space-y-2 text-sm">
                <p v-if="!canManageAllAttendees" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">Limited attendee permissions for this booking.</p>
                <p v-if="attendees.length > 1" class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-800">This is a group booking with multiple attendees.</p>
                <p v-if="!outstandingPayments.length" class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-800">No outstanding payments detected.</p>
              </div>
            </section>

            <section>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Event info</p>
              <dl class="mt-3 space-y-2 text-sm text-deep-navy/85">
                <div class="flex justify-between gap-3">
                  <dt>Status</dt>
                  <dd class="font-semibold">{{ myBookingData?.event?.status || '-' }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt>Starts</dt>
                  <dd class="font-semibold text-right">{{ formatEventDate(eventStart) }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt>Timezone</dt>
                  <dd class="font-semibold">{{ myBookingData?.event?.timezone || '-' }}</dd>
                </div>
              </dl>
            </section>

            <section>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Quick actions</p>
              <div class="mt-3 space-y-2">
                <NuxtLink
                  :to="bookingShopHref"
                  class="block rounded-lg bg-deep-navy px-3 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700"
                >
                  Open booking shop
                </NuxtLink>
                <NuxtLink :to="`/events/${eventId}`" class="block rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700">
                  Back to event
                </NuxtLink>
                <button type="button" class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700" @click="setActiveTab('overview')">
                  Go to overview
                </button>
                <button
                  type="button"
                  class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700 disabled:opacity-50"
                  :disabled="!selectedAttendeeId"
                  @click="clearSelectedAttendee"
                >
                  Clear attendee selection
                </button>
              </div>
            </section>

            <section>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Outstanding payments</p>
              <div v-if="outstandingPayments.length" class="mt-3 space-y-2">
                <div v-for="item in outstandingPayments" :key="item.payment_id || item.payment_reference" class="rounded-lg border border-amber-300 bg-amber-50 p-3 outstanding-attention-pulse">
                  <p class="text-xs font-black text-amber-900">{{ item.payment_reference || 'Payment' }}</p>
                  <p class="text-lg font-black text-deep-navy">{{ item.amount || '-' }}</p>
                  <p class="text-xs text-amber-700">{{ item.status || 'PENDING' }}</p>
                  <p class="text-[11px] text-deep-navy/75 mt-1">{{ item.method_title || item.method_type || 'Method unavailable' }}</p>
                  <div v-if="isOutstandingBankTransfer(item)" class="mt-2 rounded-md border border-amber-200 bg-white p-3 text-[12px] text-deep-navy/90 space-y-2">
                    <p class="font-black uppercase tracking-wide text-[10px] text-amber-700">Bank transfer instructions</p>
                    <ol class="space-y-2">
                      <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                        <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">1. Pay this exact amount</p>
                        <p class="mt-1 text-xl font-black text-deep-navy">{{ item.amount || '-' }}</p>
                      </li>
                      <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                        <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">2. Use these account details</p>
                        <div class="mt-1 grid grid-cols-1 gap-2">
                          <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                            <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Account name</p>
                            <p class="mt-1 text-sm font-black text-deep-navy break-words">{{ getProvidedDetail(item, 'account_name') || 'Unavailable' }}</p>
                          </div>
                          <div class="grid grid-cols-2 gap-2">
                            <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                              <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Sort code</p>
                              <p class="mt-1 text-lg font-black text-deep-navy">{{ getProvidedDetail(item, 'sort_code') || 'Unavailable' }}</p>
                            </div>
                            <div class="rounded-md border border-deep-navy/10 bg-white p-2">
                              <p class="text-[10px] uppercase tracking-wide text-deep-navy/55 font-black">Account number</p>
                              <p class="mt-1 text-lg font-black text-deep-navy">{{ getProvidedDetail(item, 'account_number') || 'Unavailable' }}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li v-if="getRequiredTransferReference(item)" class="rounded-md border border-amber-300 bg-amber-50 p-2">
                        <p class="text-[10px] font-black uppercase tracking-wide text-amber-800">3. Add this exact transfer reference</p>
                        <div class="mt-1 flex items-center justify-between gap-2">
                          <p class="text-sm font-black text-amber-900 break-all">{{ getRequiredTransferReference(item) }}</p>
                          <button
                            type="button"
                            class="shrink-0 rounded-md border border-amber-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700 hover:bg-amber-100"
                            @click="copyTransferReference(getRequiredTransferReference(item) || '')"
                          >
                            Copy
                          </button>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
              <p v-else class="mt-3 text-sm text-deep-navy/60">No outstanding payments.</p>
            </section>
          </article>
        </aside>
      </div>
    </div>

    <div v-if="booking" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-4xl animate-soft-up">
      <div class="rounded-2xl border border-deep-navy/15 bg-white/95 backdrop-blur-xl shadow-2xl p-2 md:p-3">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <NuxtLink
            :to="bookingShopHref"
            class="inline-flex items-center justify-center rounded-xl bg-deep-navy px-3 py-2 text-[11px] md:text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700"
          >
            Open shop
          </NuxtLink>
          <NuxtLink
            :to="`/events/${eventId}`"
            class="inline-flex items-center justify-center rounded-xl border border-deep-navy/20 px-3 py-2 text-[11px] md:text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700"
          >
            Back to event
          </NuxtLink>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-deep-navy/20 px-3 py-2 text-[11px] md:text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700"
            @click="setActiveTab('overview')"
          >
            Overview
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-deep-navy/20 px-3 py-2 text-[11px] md:text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700 disabled:opacity-50"
            :disabled="!selectedAttendeeId"
            @click="clearSelectedAttendee"
          >
            Clear attendee
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, watchEffect, computed } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenues } from '~/composables/resources/events/eventVenues'
import {
  useEventMyBooking,
  invalidateEventMyBookingQuery,
  type ApiErrorLike,
} from '~/composables/resources/events'
import { useAttendee, useAttendees, useUpdateAttendee } from '~/composables/resources/attendee/attendees'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import {
  useAttendeeMedicalConditions,
  useCreateAttendeeMedicalCondition,
  useDeleteAttendeeMedicalCondition,
} from '~/composables/resources/attendee/attendeeMedicalConditions'
import {
  useAttendeeDietaryRequirements,
  useCreateAttendeeDietaryRequirement,
  useDeleteAttendeeDietaryRequirement,
} from '~/composables/resources/attendee/attendeeDietaryRequirementsRelationship'
import {
  useAttendeeAccessibilityRequirements,
  useCreateAttendeeAccessibilityRequirement,
  useDeleteAttendeeAccessibilityRequirement,
} from '~/composables/resources/attendee/attendeeAccessibilityRequirements'
import { useConsents } from '~/composables/resources/attendee/attendeeConsents'
import {
  useAttendeeConsents,
  useCreateAttendeeConsent,
  usePartialUpdateAttendeeConsent,
} from '~/composables/resources/attendee/attendeeConsentsRelationship'
import { useProductOrders, useCancelProductOrder } from '~/composables/resources/products/productOrders'
import { useGuardians, useCreateGuardian, useDeleteGuardian } from '~/composables/resources/common/guardians'
import { useFamilyAttendees, useCreateFamilyAttendee, useDeleteFamilyAttendee } from '~/composables/resources/common/familyAttendees'
import { useFamilyGroups, useCreateFamilyGroup } from '~/composables/resources/common/familyGroups'

type RelationshipType = 'self' | 'spouse' | 'child' | 'friend' | 'parent' | 'sibling' | 'other' | ''
type TabId = 'overview' | 'attendee' | 'health' | 'consents' | 'family' | 'orders'

const props = defineProps<{
  eventId: string
  bookingReference: string
  initialAttendeeId?: string
  initialTab?: TabId
}>()

const { $notyf } = useNuxtApp()
const queryClient = useQueryClient()
const requestFetch = useRequestFetch()
const route = useRoute()
const router = useRouter()
const eventId = computed(() => props.eventId)
const bookingReference = computed(() => props.bookingReference)

const myBooking = useEventMyBooking(eventId, computed(() => ({
  booking_reference: bookingReference.value,
})))
const event = useEvent(eventId)

const isNotFound = computed(() => {
  const error = myBooking.error.value as unknown as ApiErrorLike | undefined
  return error?.statusCode === 404
})

watchEffect(() => {
  if (isNotFound.value) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found', fatal: true })
  }
})

const myBookingData = computed(() => myBooking.data.value)
const selectedBookingItem = computed(() => {
  return myBookingData.value?.bookings?.find(item => item.booking?.booking_reference === bookingReference.value)
})

watchEffect(() => {
  if (!myBooking.isLoading.value && myBookingData.value && !selectedBookingItem.value) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found', fatal: true })
  }
})

const booking = computed(() => selectedBookingItem.value?.booking)
const attendees = computed(() => booking.value?.attendees || [])
const canManageAllAttendees = computed(() => !!selectedBookingItem.value?.can_manage_all_attendees)
const eventTitle = computed(() => myBookingData.value?.event?.title || 'Booking workspace')
const eventStart = computed(() => myBookingData.value?.event?.start_datetime || '')
const eventEnd = computed(() => myBookingData.value?.event?.end_datetime || '')

const { data: venuesData } = useEventVenues(computed(() => ({
  event: eventId.value,
})))
const eventVenues = computed(() => venuesData.value?.data?.results || [])
const primaryVenue = computed(() => eventVenues.value[0])

const eventLocation = computed(() => {
  return primaryVenue.value?.venue_name || 'Venue to be confirmed'
})

const eventWhatToBring = computed(() => {
  const details = event.data.value?.data as any
  return details?.what_to_bring || 'No specific items are required at this time.'
})

const eventCheckInInstructions = computed(() => {
  const details = event.data.value?.data as any
  return details?.check_in_instructions || details?.important_information || 'Please arrive a little early and have your booking reference ready.'
})

const hasBringInfo = computed(() => {
  const details = event.data.value?.data as any
  const whatToBring = String(details?.what_to_bring || '').trim()
  const checkInInfo = String(details?.check_in_instructions || details?.important_information || '').trim()
  return Boolean(whatToBring || checkInInfo)
})

const hasLocationInfo = computed(() => {
  return Boolean(primaryVenue.value?.venue_name || primaryVenue.value?.venue_address || primaryVenue.value?.venue_city)
})

const hasTimingInfo = computed(() => {
  return Boolean(eventStart.value && eventEnd.value)
})

const venueMapEmbedUrl = computed(() => {
  const address = String(primaryVenue.value?.venue_address || '').trim()
  const city = String(primaryVenue.value?.venue_city || '').trim()
  const query = `${address} ${city}`.trim()
  if (!query) return ''
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
})

const heroImage = computed(() => {
  const image = event.data.value?.data?.main_landing_image?.image
  return image ? resolveImageUrl(image) : ''
})

const formattedBookedAt = computed(() => {
  const bookedAt = booking.value?.booked_at
  if (!bookedAt) return '-'
  const date = new Date(bookedAt)
  if (Number.isNaN(date.getTime())) return bookedAt
  return date.toLocaleString()
})

const outstandingPayments = computed(() => {
  return (booking.value?.payments || []).filter(item => {
    const status = String(item.status || '').toUpperCase()
    return status !== 'COMPLETED' && status !== 'PAID'
  })
})

const registrationStepComplete = computed(() => outstandingPayments.value.length === 0)
const hideAllJourneyDetails = ref(false)

type JourneyStepAction = 'shop' | 'info' | 'location' | 'time'

const journeySteps = computed<Array<{
  id: number
  title: string
  description: string
  done: boolean
  action: JourneyStepAction
  cta: string
}>>(() => [
  {
    id: 1,
    title: 'Finish registration',
    description: registrationStepComplete.value
      ? 'Registration is complete and there are no outstanding payments.'
      : 'Complete checkout in the shop and clear any outstanding payments.',
    done: registrationStepComplete.value,
    action: 'shop',
    cta: 'Open shop',
  },
  {
    id: 2,
    title: 'What to bring + important info',
    description: hasBringInfo.value
      ? 'Review event briefing guidance before arrival.'
      : 'Important preparation info is limited right now; check updates closer to event day.',
    done: hasBringInfo.value,
    action: 'info',
    cta: 'View info',
  },
  {
    id: 3,
    title: 'Location',
    description: hasLocationInfo.value
      ? 'Confirm the venue details and map before travel.'
      : 'Venue details are still being finalized.',
    done: hasLocationInfo.value,
    action: 'location',
    cta: 'View location',
  },
  {
    id: 4,
    title: 'Time',
    description: hasTimingInfo.value
      ? 'Double-check start and end times in your timezone.'
      : 'Event timing has not been published yet.',
    done: hasTimingInfo.value,
    action: 'time',
    cta: 'View time',
  },
])

const selectedAttendeeId = ref(props.initialAttendeeId || '')
const activeTab = ref<TabId>(props.initialTab || 'overview')
const applyingRouteState = ref(false)

watch(attendees, () => {
  if (!selectedAttendeeId.value) return
  const exists = attendees.value.some(item => item.id === selectedAttendeeId.value)
  if (!exists) {
    selectedAttendeeId.value = ''
    activeTab.value = 'overview'
  }
}, { immediate: true })

if (props.initialAttendeeId) {
  activeTab.value = props.initialTab || 'attendee'
}

const tabs: Array<{ id: TabId; label: string; needsAttendee?: boolean }> = [
  { id: 'overview', label: 'Booking Overview' },
  { id: 'attendee', label: 'Attendee Editor', needsAttendee: true },
  { id: 'health', label: 'Medical + Dietary + Accessibility', needsAttendee: true },
  { id: 'consents', label: 'Consents', needsAttendee: true },
  { id: 'family', label: 'Family + Guardians', needsAttendee: true },
  { id: 'orders', label: 'Orders', needsAttendee: true },
]

const selectedAttendee = computed(() => {
  if (!selectedAttendeeId.value) return null
  return attendees.value.find(item => item.id === selectedAttendeeId.value) || null
})

const bookingShopHref = computed(() => {
  const base = `/events/${eventId.value}/b/${bookingReference.value}/shop`
  if (!selectedAttendeeId.value) return base
  return {
    path: base,
    query: {
      attendee: selectedAttendeeId.value,
    },
  }
})

function toAttendeeSlug(name: string | undefined, attendeeId: string | undefined) {
  const base = String(name || '').trim().toLowerCase()
  const slug = base
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (slug) return slug
  return attendeeId ? `attendee-${attendeeId.slice(0, 8)}` : 'attendee'
}

function setActiveTab(tab: TabId) {
  const entry = tabs.find(item => item.id === tab)
  if (entry?.needsAttendee && !selectedAttendeeId.value) {
    return
  }
  activeTab.value = tab
}

function selectAttendee(attendeeId: string) {
  if (!attendeeId) return
  selectedAttendeeId.value = attendeeId
  activeTab.value = 'attendee'
}

function clearSelectedAttendee() {
  selectedAttendeeId.value = ''
  activeTab.value = 'overview'
}

function scrollToBriefingSection(id: 'briefing-info' | 'briefing-location' | 'briefing-time') {
  if (typeof window === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleJourneyStepAction(action: JourneyStepAction) {
  if (action === 'shop') {
    navigateTo(bookingShopHref.value)
    return
  }

  if (action === 'info') {
    scrollToBriefingSection('briefing-info')
    return
  }

  if (action === 'location') {
    scrollToBriefingSection('briefing-location')
    return
  }

  scrollToBriefingSection('briefing-time')
}

watch(
  [selectedAttendeeId, activeTab, selectedAttendee, eventId],
  async () => {
    if (applyingRouteState.value) return

    const nextQuery: Record<string, string> = {}
    nextQuery.tab = activeTab.value

    if (selectedAttendeeId.value) {
      nextQuery.attendee = toAttendeeSlug(selectedAttendee.value?.name, selectedAttendeeId.value)
    }

    const current = route.query
    const unchanged =
      String(current.tab || '') === String(nextQuery.tab || '') &&
      String(current.attendee || '') === String(nextQuery.attendee || '')

    if (!unchanged) {
      await router.replace({ query: nextQuery })
    }
  },
  { deep: true },
)

watch(
  [() => route.query.attendee, () => route.query.tab, attendees],
  () => {
    applyingRouteState.value = true
    try {
      const routeTab = String(route.query.tab || '')
      if (routeTab === 'overview' || routeTab === 'attendee' || routeTab === 'health' || routeTab === 'consents' || routeTab === 'family' || routeTab === 'orders') {
        activeTab.value = routeTab
      }

      const fromSlug = String(route.query.attendee || '')
      if (fromSlug) {
        const matchedBySlug = attendees.value.find(item => toAttendeeSlug(item.name, item.id) === fromSlug)
        if (matchedBySlug?.id) {
          selectedAttendeeId.value = matchedBySlug.id
          return
        }

        const matchedById = attendees.value.find(item => item.id === fromSlug)
        if (matchedById?.id) {
          selectedAttendeeId.value = matchedById.id
        }
      } else {
        selectedAttendeeId.value = ''
        activeTab.value = 'overview'
      }
    } finally {
      applyingRouteState.value = false
    }
  },
  { immediate: true, deep: true },
)

const attendee = useAttendee(computed(() => selectedAttendeeId.value || ''))
const updateAttendee = useUpdateAttendee()
const attendeeOrders = useProductOrders(computed(() => {
  if (!selectedAttendeeId.value) return undefined
  return { attendee_id: selectedAttendeeId.value }
}))
const cancelOrderMutation = useCancelProductOrder()

const attendeeOrderList = computed(() => {
  const payload = attendeeOrders.data.value?.data as any
  return payload?.results || []
})

const expandedPaymentIds = ref<string[]>([])
const paymentDetailLoading = ref<Record<string, boolean>>({})
const paymentDetails = ref<Record<string, any>>({})

function isPaymentExpanded(paymentId: string): boolean {
  if (!paymentId) return false
  return expandedPaymentIds.value.includes(paymentId)
}

async function fetchPaymentDetails(paymentId: string) {
  if (!paymentId || paymentDetails.value[paymentId] || paymentDetailLoading.value[paymentId]) return

  paymentDetailLoading.value[paymentId] = true
  try {
    const paymentData = await requestFetch(`/api/payments/${paymentId}/`)
    paymentDetails.value[paymentId] = paymentData
  } catch (error) {
    console.error('Failed to fetch payment detail', error)
    $notyf?.error('Could not load payment method details.')
  } finally {
    paymentDetailLoading.value[paymentId] = false
  }
}

async function togglePaymentExpand(payment: any) {
  const paymentId = String(payment?.payment_id || '')
  if (!paymentId) return

  if (isPaymentExpanded(paymentId)) {
    expandedPaymentIds.value = expandedPaymentIds.value.filter(id => id !== paymentId)
    return
  }

  expandedPaymentIds.value.push(paymentId)
  await fetchPaymentDetails(paymentId)
}

function getPaymentMethodType(paymentId: string): string {
  const methodType = paymentDetails.value[paymentId]?.method_type
  if (methodType) return methodType

  const fallback = paymentDetails.value[paymentId]?.method_title || paymentDetails.value[paymentId]?.method
  return fallback || 'Unavailable'
}

function getBankTransferReference(paymentId: string): string | null {
  return paymentDetails.value[paymentId]?.bank_transfer_reference || null
}

function getBankTransferInstructions(paymentId: string): string | null {
  const metadata = paymentDetails.value[paymentId]?.metadata as Record<string, any> | undefined
  return metadata?.bank_transfer_instructions || null
}

function isOutstandingBankTransfer(payment: any): boolean {
  const type = String(payment?.method_type || '').toUpperCase()
  return type === 'BANK_TRANSFER'
}

function getProvidedDetail(payment: any, key: 'account_name' | 'sort_code' | 'account_number'): string | null {
  const provided = payment?.provided_details as Record<string, any> | undefined
  const value = provided?.[key]
  if (value === undefined || value === null || value === '') return null
  return String(value)
}

function getRequiredTransferReference(payment: any): string | null {
  const provided = payment?.provided_details as Record<string, any> | undefined
  const direct = payment?.bank_reference || provided?.bank_reference
  if (direct !== undefined && direct !== null && String(direct).trim() !== '') {
    return String(direct)
  }

  const paymentId = String(payment?.payment_id || '')
  const fromDetail = paymentDetails.value[paymentId]?.bank_reference || paymentDetails.value[paymentId]?.bank_transfer_reference
  if (fromDetail !== undefined && fromDetail !== null && String(fromDetail).trim() !== '') {
    return String(fromDetail)
  }

  return null
}

async function copyTransferReference(reference: string) {
  if (!reference) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(reference)
      $notyf?.success('Transfer reference copied.')
      return
    }
    $notyf?.error('Clipboard is not available in this browser.')
  } catch (error) {
    console.error('Failed to copy transfer reference', error)
    $notyf?.error('Could not copy transfer reference.')
  }
}

function canCancelOrder(status?: string): boolean {
  const normalized = String(status || '').toLowerCase()
  return normalized === 'draft' || normalized === 'pending'
}

async function cancelOrder(orderId: number | string) {
  if (!confirm('Are you sure you want to cancel this order?')) return

  try {
    await cancelOrderMutation.mutateAsync(orderId)
    $notyf?.success('Order cancelled.')
  } catch (error) {
    console.error('Failed to cancel order', error)
    $notyf?.error('Could not cancel order.')
  }
}

function getOrderItemDetails(item: any): Record<string, any> | null {
  const details = item?.product_variant_details
  if (!details || typeof details !== 'object') return null
  return details as Record<string, any>
}

function getOrderItemTitle(item: any): string {
  const details = getOrderItemDetails(item)
  return details?.product_title || `Variant ${details?.variant_id || item?.product_variant || 'N/A'}`
}

function getOrderItemCode(item: any): string {
  const details = getOrderItemDetails(item)
  if (details?.product_display_code) return String(details.product_display_code)
  if (details?.variant_id) return `Variant ${details.variant_id}`
  return `Variant ${item?.product_variant || 'N/A'}`
}

function getOrderItemImageUrl(item: any): string | null {
  const details = getOrderItemDetails(item)
  return details?.image_url || details?.variant_image_url || details?.product_image_url || null
}

function getOrderItemSize(item: any): string | null {
  const details = getOrderItemDetails(item)
  return details?.size || null
}

function getOrderItemColor(item: any): string | null {
  const details = getOrderItemDetails(item)
  return details?.color || null
}

function getOrderItemColorStyle(item: any): Record<string, string> | undefined {
  const color = getOrderItemColor(item)
  if (!color) return undefined
  return { backgroundColor: color }
}

function getOrderStatusBadgeClass(status?: string): string {
  const normalized = String(status || '').toLowerCase()
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    pending_refund: 'bg-orange-100 text-orange-700',
    refunded: 'bg-purple-100 text-purple-700',
  }
  return classes[normalized] || 'bg-gray-100 text-gray-700'
}

const attendeeForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  gender: '',
  relationship_to_user: '' as RelationshipType,
  area_from: null as number | null,
})

watch(
  () => attendee.data.value?.data,
  value => {
    if (!value) return
    attendeeForm.value = {
      first_name: value.first_name || '',
      last_name: value.last_name || '',
      email: value.email || '',
      phone_number: value.phone_number || '',
      date_of_birth: value.date_of_birth || '',
      gender: value.gender || '',
      relationship_to_user: (value.relationship_to_user as RelationshipType) || '',
      area_from: value.area_from || null,
    }
  },
  { immediate: true },
)

async function saveAttendee() {
  if (!selectedAttendeeId.value) return
  try {
    await updateAttendee.mutateAsync({
      attendeeId: selectedAttendeeId.value,
      body: {
        first_name: attendeeForm.value.first_name,
        last_name: attendeeForm.value.last_name,
        email: attendeeForm.value.email || null,
        phone_number: attendeeForm.value.phone_number || null,
        date_of_birth: attendeeForm.value.date_of_birth || null,
        gender: attendeeForm.value.gender || null,
        relationship_to_user: attendeeForm.value.relationship_to_user || undefined,
        area_from: attendeeForm.value.area_from,
      },
    })
    await invalidateEventMyBookingQuery(queryClient, eventId.value)
    $notyf?.success('Changes were saved successfully.')
  } catch (error) {
    console.error('Failed to update attendee', error)
    $notyf?.error('Could not save attendee changes.')
  }
}

const medicalConditions = useMedicalConditions()
const dietaryRequirements = useDietaryRequirements()
const accessibilityRequirements = useAccessibilityRequirements()

const attendeeMedicalConditions = useAttendeeMedicalConditions(computed(() => selectedAttendeeId.value || ''))
const createMedicalCondition = useCreateAttendeeMedicalCondition()
const deleteMedicalCondition = useDeleteAttendeeMedicalCondition()

const attendeeDietaryRequirements = useAttendeeDietaryRequirements(computed(() => selectedAttendeeId.value || ''))
const createDietaryRequirement = useCreateAttendeeDietaryRequirement()
const deleteDietaryRequirement = useDeleteAttendeeDietaryRequirement()

const attendeeAccessibilityRequirements = useAttendeeAccessibilityRequirements(computed(() => selectedAttendeeId.value || ''))
const createAccessibilityRequirement = useCreateAttendeeAccessibilityRequirement()
const deleteAccessibilityRequirement = useDeleteAttendeeAccessibilityRequirement()

const newMedical = ref({ medical_condition: null as number | null, details: '' })
const newDietary = ref({ dietary_requirement: null as number | null, details: '' })
const newAccessibility = ref({ accessibility_requirement: null as number | null, details: '' })

async function addMedicalCondition() {
  if (!selectedAttendeeId.value || !newMedical.value.medical_condition) return
  try {
    await createMedicalCondition.mutateAsync({
      attendeeId: selectedAttendeeId.value,
      body: {
        medical_condition: newMedical.value.medical_condition,
        details: newMedical.value.details || '',
      } as any,
    })
    newMedical.value = { medical_condition: null, details: '' }
    $notyf?.success('Medical condition added.')
  } catch (error) {
    console.error('Failed to add medical condition', error)
    $notyf?.error('Could not add medical condition.')
  }
}

async function removeMedicalCondition(conditionId: number) {
  if (!selectedAttendeeId.value) return
  try {
    await deleteMedicalCondition.mutateAsync({ attendeeId: selectedAttendeeId.value, conditionId })
    $notyf?.success('Medical condition removed.')
  } catch (error) {
    console.error('Failed to remove medical condition', error)
    $notyf?.error('Could not remove medical condition.')
  }
}

async function addDietaryRequirement() {
  if (!selectedAttendeeId.value || !newDietary.value.dietary_requirement) return
  try {
    await createDietaryRequirement.mutateAsync({
      attendeeId: selectedAttendeeId.value,
      body: {
        dietary_requirement: newDietary.value.dietary_requirement,
        details: newDietary.value.details || '',
      } as any,
    })
    newDietary.value = { dietary_requirement: null, details: '' }
    $notyf?.success('Dietary requirement added.')
  } catch (error) {
    console.error('Failed to add dietary requirement', error)
    $notyf?.error('Could not add dietary requirement.')
  }
}

async function removeDietaryRequirement(requirementId: number) {
  if (!selectedAttendeeId.value) return
  try {
    await deleteDietaryRequirement.mutateAsync({ attendeeId: selectedAttendeeId.value, requirementId })
    $notyf?.success('Dietary requirement removed.')
  } catch (error) {
    console.error('Failed to remove dietary requirement', error)
    $notyf?.error('Could not remove dietary requirement.')
  }
}

async function addAccessibilityRequirement() {
  if (!selectedAttendeeId.value || !newAccessibility.value.accessibility_requirement) return
  try {
    await createAccessibilityRequirement.mutateAsync({
      attendeeId: selectedAttendeeId.value,
      body: {
        accessibility_requirement: newAccessibility.value.accessibility_requirement,
        details: newAccessibility.value.details || '',
      } as any,
    })
    newAccessibility.value = { accessibility_requirement: null, details: '' }
    $notyf?.success('Accessibility requirement added.')
  } catch (error) {
    console.error('Failed to add accessibility requirement', error)
    $notyf?.error('Could not add accessibility requirement.')
  }
}

async function removeAccessibilityRequirement(requirementId: number) {
  if (!selectedAttendeeId.value) return
  try {
    await deleteAccessibilityRequirement.mutateAsync({ attendeeId: selectedAttendeeId.value, requirementId })
    $notyf?.success('Accessibility requirement removed.')
  } catch (error) {
    console.error('Failed to remove accessibility requirement', error)
    $notyf?.error('Could not remove accessibility requirement.')
  }
}

const eventConsents = useConsents(computed(() => ({ event: eventId.value })))
const attendeeConsents = useAttendeeConsents(computed(() => selectedAttendeeId.value || ''))
const createConsent = useCreateAttendeeConsent()
const partialUpdateConsent = usePartialUpdateAttendeeConsent()
const newConsent = ref({ consent: null as number | null })

async function addConsent() {
  if (!selectedAttendeeId.value || !newConsent.value.consent) return
  try {
    await createConsent.mutateAsync({
      attendeeId: selectedAttendeeId.value,
      body: {
        consent: newConsent.value.consent,
        consent_given: false,
      } as any,
    })
    newConsent.value = { consent: null }
    $notyf?.success('Consent record added.')
  } catch (error) {
    console.error('Failed to add consent', error)
    $notyf?.error('Could not add consent.')
  }
}

async function toggleConsent(item: any) {
  if (!selectedAttendeeId.value) return
  try {
    await partialUpdateConsent.mutateAsync({
      attendeeId: selectedAttendeeId.value,
      consentId: item.id,
      body: {
        consent_given: !item.consent_given,
        given_at: !item.consent_given ? new Date().toISOString() : null,
      } as any,
    })
  } catch (error) {
    console.error('Failed to toggle consent', error)
    $notyf?.error('Could not update consent.')
  }
}

const guardians = useGuardians(computed(() => {
  if (!selectedAttendeeId.value) return undefined
  return { attendee: selectedAttendeeId.value, page_size: 100 }
}))
const createGuardian = useCreateGuardian()
const deleteGuardian = useDeleteGuardian()
const guardianSourceAttendees = useAttendees(computed(() => ({ event: eventId.value, page_size: 200 })))
const guardianCandidateId = ref('')

const guardianCandidates = computed(() => {
  return (guardianSourceAttendees.data.value?.data?.results || []).filter((item: any) => {
    if (!selectedAttendeeId.value) return false
    return item.attendee_id !== selectedAttendeeId.value && !!item?._links?.user
  })
})

async function addGuardian() {
  if (!selectedAttendeeId.value || !guardianCandidateId.value) return
  const candidate = guardianCandidates.value.find((item: any) => item.attendee_id === guardianCandidateId.value) as any
  const userMatch = String(candidate?._links?.user || '').match(/\/users\/(\d+)\//)
  const userId = userMatch ? parseInt(userMatch[1], 10) : null
  if (!userId) {
    $notyf?.error('Selected attendee has no linked user.')
    return
  }

  try {
    await createGuardian.mutateAsync({
      attendee: selectedAttendeeId.value,
      user: userId,
      relationship: 'parent',
    } as any)
    guardianCandidateId.value = ''
    $notyf?.success('Guardian linked.')
  } catch (error) {
    console.error('Failed to add guardian', error)
    $notyf?.error('Could not link guardian.')
  }
}

async function removeGuardian(guardianId: number) {
  try {
    await deleteGuardian.mutateAsync(guardianId)
    $notyf?.success('Guardian removed.')
  } catch (error) {
    console.error('Failed to remove guardian', error)
    $notyf?.error('Could not remove guardian.')
  }
}

const familyMemberships = useFamilyAttendees(computed(() => {
  if (!selectedAttendeeId.value) return undefined
  return { attendee: selectedAttendeeId.value, page_size: 100 }
}))
const createFamilyMembership = useCreateFamilyAttendee()
const deleteFamilyMembership = useDeleteFamilyAttendee()
const familyGroups = useFamilyGroups(computed(() => ({ page_size: 100, event: eventId.value } as any)))
const createFamilyGroupMutation = useCreateFamilyGroup()

const newFamilyGroupName = ref('')
const newFamilyMembership = ref({
  family_group: null as number | null,
  relationship: 'sibling' as 'parent' | 'sibling' | 'child' | 'spouse' | 'friend' | 'other',
  is_primary_guardian: false,
})

async function createFamilyGroup() {
  const familyName = newFamilyGroupName.value.trim()
  if (!familyName) return

  const eventNumericId = event.data.value?.data?.id
  const organisationId = (event.data.value?.data as any)?.organisation
  if (!eventNumericId || !organisationId) {
    $notyf?.error('Event context is not ready for group creation.')
    return
  }

  try {
    await createFamilyGroupMutation.mutateAsync({
      family_name: familyName,
      event: eventNumericId,
      organisation: organisationId,
    } as any)
    newFamilyGroupName.value = ''
    $notyf?.success('Family group created.')
  } catch (error) {
    console.error('Failed to create family group', error)
    $notyf?.error('Could not create family group.')
  }
}

async function addFamilyMembership() {
  if (!selectedAttendeeId.value || !newFamilyMembership.value.family_group) return
  try {
    await createFamilyMembership.mutateAsync({
      family_group: newFamilyMembership.value.family_group,
      attendee: selectedAttendeeId.value,
      relationship: newFamilyMembership.value.relationship,
      is_primary_guardian: newFamilyMembership.value.is_primary_guardian,
    } as any)
    newFamilyMembership.value = {
      family_group: null,
      relationship: 'sibling',
      is_primary_guardian: false,
    }
    $notyf?.success('Family membership added.')
  } catch (error) {
    console.error('Failed to add family membership', error)
    $notyf?.error('Could not add family membership.')
  }
}

async function removeFamilyMembership(membershipId: number) {
  try {
    await deleteFamilyMembership.mutateAsync(membershipId)
    $notyf?.success('Family membership removed.')
  } catch (error) {
    console.error('Failed to remove family membership', error)
    $notyf?.error('Could not remove family membership.')
  }
}

const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const hasStarted = computed(() => {
  if (!eventStart.value) return false
  return new Date(eventStart.value).getTime() <= Date.now()
})

function updateCountdown() {
  if (!eventStart.value) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  const target = new Date(eventStart.value).getTime()
  const diffMs = target - Date.now()
  if (diffMs <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  countdown.value = { days, hours, minutes, seconds }
}

let countdownInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

function formatEventDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}
</script>

<style scoped>
.countdown-tile {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 0.6rem 0.4rem;
}

.countdown-tile-live {
  animation: softPulse 1.3s ease-in-out infinite;
}

.animate-soft-in {
  animation: softIn 420ms ease-out both;
}

.animate-soft-in-delay {
  animation: softIn 520ms ease-out both;
}

.animate-soft-up {
  animation: softUp 380ms ease-out both;
}

.attendee-pulse {
  animation: attendeePulse 2.1s ease-in-out infinite;
}

.outstanding-attention-pulse {
  animation: outstandingAttentionPulse 1.8s ease-in-out infinite;
}

@keyframes softIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes softUp {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes softPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(147, 197, 253, 0);
    border-color: rgba(255, 255, 255, 0.22);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(147, 197, 253, 0.08);
    border-color: rgba(191, 219, 254, 0.75);
  }
}

@keyframes attendeePulse {
  0%, 100% {
    box-shadow: inset 0 0 0 0 rgba(59, 130, 246, 0);
  }
  50% {
    box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.24);
  }
}

@keyframes outstandingAttentionPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
    border-color: rgba(252, 211, 77, 0.9);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.85);
  }
}
</style>
