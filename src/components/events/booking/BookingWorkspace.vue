<template>
  <div class="min-h-screen bg-mist-blue">
    <section class="relative min-h-[380px] w-full overflow-hidden bg-deep-navy sm:min-h-[420px] md:h-[300px] md:min-h-0">
      <img
        v-if="heroImage"
        :src="heroImage"
        alt="Event hero"
        class="h-full w-full object-cover opacity-40"
        @error="onImageError"
      >
      <div class="absolute inset-0 bg-gradient-to-b from-deep-navy/92 via-deep-navy/82 to-deep-navy/88 md:bg-gradient-to-r md:from-deep-navy/95 md:via-deep-navy/85 md:to-deep-navy/70"></div>

      <div class="absolute inset-0 flex items-start md:items-center">
        <div class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-6 sm:py-8 md:flex-row md:items-end md:justify-between md:gap-8 md:px-8 md:py-0">
          <div class="space-y-3 md:max-w-xl md:justify-self-start md:space-y-4">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">Live Event Portal</span>
            </div>
            <h1 class="font-headline text-3xl font-extrabold tracking-tighter text-white sm:text-4xl md:text-6xl">{{ eventTitle }}</h1>
            <p class="max-w-lg text-base leading-relaxed text-white/80 sm:text-lg md:text-xl md:text-white/75">Welcome back, <span class="font-medium text-white">{{ booking?.made_by_name || 'Unknown' }}</span>.</p>
          </div>

          <div class="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5 md:ml-auto md:w-auto md:max-w-xl md:border-0 md:bg-transparent md:p-0 md:pl-8 md:backdrop-blur-none">
            <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-200/75 md:text-xs md:tracking-widest md:text-blue-200/60">We will see you in...</p>
            <div v-if="hasStarted" class="mt-4">
              <p class="text-xl font-black text-white sm:text-2xl">Event started</p>
              <p class="mt-1 text-xs text-white/75 sm:text-sm">{{ formatDate(eventStart) }}</p>
            </div>
            <div v-else class="mt-4 flex items-end justify-between gap-2 font-headline text-[2rem] font-bold tracking-tighter text-white sm:gap-3 sm:text-4xl md:justify-start">
              <div class="flex min-w-0 flex-1 flex-col items-center md:flex-none">
                <span>{{ countdown.days }}</span>
                <span class="mt-1 text-[10px] font-medium tracking-normal text-on-primary-container">DAYS</span>
              </div>
              <span class="shrink-0 pb-9 opacity-30 sm:pb-12">:</span>
              <div class="flex min-w-0 flex-1 flex-col items-center md:flex-none">
                <span>{{ countdown.hours }}</span>
                <span class="mt-1 text-[10px] font-medium tracking-normal text-on-primary-container">HRS</span>
              </div>
              <span class="shrink-0 pb-9 opacity-30 sm:pb-12">:</span>
              <div class="flex min-w-0 flex-1 flex-col items-center md:flex-none">
                <span>{{ countdown.minutes }}</span>
                <span class="mt-1 text-[10px] font-medium tracking-normal text-on-primary-container">MIN</span>
              </div>
              <span class="shrink-0 pb-9 opacity-30 sm:pb-12">:</span>
              <div class="flex min-w-0 flex-1 flex-col items-center md:flex-none">
                <span>{{ countdown.seconds }}</span>
                <span class="mt-1 text-[10px] font-medium tracking-normal text-on-primary-container">SEC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="booking" class="relative z-20 bg-white border-b border-deep-navy/10 shadow-sm animate-soft-in-delay">
      <div class="max-w-6xl mx-auto px-3 py-2">
        <div class="flex flex-wrap justify-between gap-3">
          <div class="flex items-center gap-3 px-3 py-4 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 ">
              <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-700">
                <span class="material-symbols-outlined" style="font-size:20px">calendar_month</span>
              </div>
            </div>
            <div class="min-w-0">
              <p class="text-label-bold font-label-bold text-deep-navy/50 uppercase">Date</p>
              <p class="text-body-md font-body-md font-bold text-deep-navy truncate">{{ formatDate(eventStart) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 px-3 py-4 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-700">
                <span class="material-symbols-outlined" style="font-size:20px">schedule</span>
              </div>
            </div>
            <div class="min-w-0">
              <p class="text-label-bold font-label-bold text-deep-navy/50 uppercase">Timing</p>
              <p class="text-body-md font-body-md font-bold text-deep-navy truncate">{{ formatDateTime(eventStart) }}</p>
              <p class="text-body-sm font-body-sm text-deep-navy/60 truncate">{{ myBookingData?.event?.timezone }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 px-3 py-4 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-700">
                <span class="material-symbols-outlined" style="font-size:20px">location_on</span>
              </div>
            </div>
            <div class="min-w-0">
              <p class="text-label-bold font-label-bold text-deep-navy/50 uppercase">Location</p>
              <p class="text-body-md font-body-md font-bold text-deep-navy truncate">{{ eventLocation }}</p>
              <p v-if="primaryVenue?.city" class="text-body-sm font-body-sm text-deep-navy/60 truncate">{{ primaryVenue.city }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 px-3 py-4 min-w-0">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="outstandingPayments.length ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'"
            >
              <span class="material-symbols-outlined" style="font-size:20px">payments</span>
            </div>
            <div class="min-w-0">
              <p class="text-label-bold font-label-bold text-deep-navy/50 uppercase">Booking Status</p>
              <p class="text-body-md font-body-md font-bold" :class="outstandingPayments.length ? 'text-primary' : 'text-green-700'">
                {{ outstandingPayments.length ? `${outstandingPayments.length} payment(s) outstanding` : 'No outstanding payments' }}
              </p>
            </div>
          </div>
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
            <div v-if="booking && selectedAttendeeId" class="rounded-2xl border border-deep-navy/10 bg-white/95 p-3 shadow-sm">
              <div class="overflow-x-auto">
                <div class="min-w-max flex items-center gap-2">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  type="button"
                  @click="setActiveTab(tab.id)"
                  :disabled="isTabDisabled(tab)"
                  :class="[
                    'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:cursor-not-allowed disabled:opacity-55',
                    activeTab === tab.id
                      ? 'bg-deep-navy text-white border-deep-navy shadow-sm'
                      : 'bg-white text-deep-navy border-deep-navy/15 hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-700'
                  ]"
                >
                  {{ tab.label }}
                </button>
                </div>
              </div>
            </div>
            <article v-if="selectedAttendeeId && selectedAttendeeIsCancelled" class="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-rose-700">Attendee cancelled</p>
                  <p class="mt-1 text-sm font-semibold text-rose-900">
                    {{ selectedAttendee?.name || 'This attendee' }} is cancelled.
                  </p>
                  <p class="mt-1 text-xs text-rose-800/90">
                    This attendee's booking was cancelled by the event organiser.
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-xl border border-rose-300 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-rose-700 hover:bg-rose-100"
                  @click="setActiveTab('overview')"
                >
                  View booking overview
                </button>
              </div>
            </article>
            <article v-if="activeTab === 'overview'" class="">
              <BookingOverviewTab
                :booking="booking"
                :event="event.data.value?.data"
                :attendees="attendees"
                :journey-steps="journeySteps"
                :hide-all-journey-details="hideAllJourneyDetails"
                :outstanding-payments="outstandingPayments"
                :event-title="eventTitle"
                :event-start="eventStart"
                :event-end="eventEnd"
                :event-location="eventLocation"
                :event-what-to-bring="eventWhatToBring"
                :event-check-in-instructions="eventCheckInInstructions"
                :venue-map-embed-url="venueMapEmbedUrl"
                :event-venues="eventVenues"
                :primary-venue="primaryVenue"
                :timezone="myBookingData?.event?.timezone"
                :formatted-booked-at="formattedBookedAt"
                :is-single-attendee-booking="isSingleAttendeeBooking"
                :format-date-time="formatDateTime"
                :on-toggle-journey-details="toggleJourneyDetails"
                :on-journey-step-action="handleJourneyStepAction"
                :on-refresh-outstanding-payments="refreshOutstandingPayments"
              />
            </article>

            <article v-if="selectedAttendeeId && activeTab === 'tickets' && !selectedAttendeeIsCancelled" class="bg-white border border-deep-navy/10 rounded-2xl p-5">
              <TicketsTab :selected-attendee-id="selectedAttendeeId" />
            </article>

            <article v-if="selectedAttendeeId && activeTab === 'payments'">
              <PaymentsTab
                :selected-attendee="selectedAttendee"
                :selected-attendee-id="selectedAttendeeId"
                :payment-summary="paymentSummary"
                :payment-summary-data="paymentSummaryData"
                :outstanding-payments="outstandingPayments"
                :booking-level-payments="bookingLevelPayments"
                :attendee-level-payments="attendeeLevelPayments"
                :payment-context-summary="paymentContextSummary"
                :payment-current-amount="paymentCurrentAmount"
                :payment-original-amount="paymentOriginalAmount"
                :payment-refunded-amount="paymentRefundedAmount"
                :format-currency-amount="formatCurrencyAmount"
                :on-open-order-from-payment="openOrderFromPayment"
                :is-outstanding-bank-transfer="isOutstandingBankTransfer"
                :has-summary-bank-metadata="hasSummaryBankMetadata"
                :get-required-transfer-reference="getRequiredTransferReference"
                :get-provided-detail="getProvidedDetail"
                :on-copy-transfer-reference="copyTransferReference"
                :get-related-order-labels="getRelatedOrderLabels"
              />
            </article>

            <article v-if="selectedAttendeeId && activeTab === 'orders' && !selectedAttendeeIsCancelled" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
              <OrdersTab
                :selected-attendee-id="selectedAttendeeId"
                :selected-attendee="selectedAttendee"
                :booking="booking"
                :attendee-order-list="attendeeOrderList"
                :attendee-orders="attendeeOrders"
                :outstanding-payments="outstandingPayments"
                :evidence-upload-form="evidenceUploadForm"
                :evidence-upload-pending="evidenceUploadPending"
                :evidence-upload-error="evidenceUploadError"
                :evidence-upload-success="evidenceUploadSuccess"
                :payment-detail-loading="paymentDetailLoading"
                :needs-evidence-upload="needsEvidenceUpload"
                :payment-attention-card-class="paymentAttentionCardClass"
                :payment-attention-label="paymentAttentionLabel"
                :on-toggle-payment-expand="togglePaymentExpand"
                :is-payment-expanded="isPaymentExpanded"
                :is-outstanding-bank-transfer="isOutstandingBankTransfer"
                :has-uploaded-evidence="hasUploadedEvidence"
                :on-evidence-upload-file-change="onEvidenceUploadFileChange"
                :on-upload-outstanding-evidence="uploadOutstandingEvidence"
                :get-payment-method-type="getPaymentMethodType"
                :get-provided-detail="getProvidedDetail"
                :get-required-transfer-reference="getRequiredTransferReference"
                :on-copy-transfer-reference="copyTransferReference"
                :get-bank-transfer-reference="getBankTransferReference"
                :get-bank-transfer-instructions="getBankTransferInstructions"
                :get-related-order-labels="getRelatedOrderLabels"
                :get-order-status-badge-class="getOrderStatusBadgeClass"
                :can-cancel-order="canCancelOrder"
                :on-cancel-order="cancelOrder"
                :get-order-item-image-url="getOrderItemImageUrl"
                :get-order-item-title="getOrderItemTitle"
                :get-order-item-code="getOrderItemCode"
                :get-order-item-size="getOrderItemSize"
                :get-order-item-color="getOrderItemColor"
                :get-order-item-color-style="getOrderItemColorStyle"
              />
            </article>

            <article v-if="activeTab === 'resources'" class="bg-white border border-deep-navy/10 rounded-2xl p-5">
              <ResourcesTab :resources="event.data.value?.data?.resources" />
            </article>

            <article v-if="selectedAttendeeId && activeTab === 'attendee' && !selectedAttendeeIsCancelled" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
              <AttendeeInfoTab
                :selected-attendee-id="selectedAttendeeId"
                :attendee-loading="attendee.isLoading.value"
                :selected-attendee="selectedAttendee"
                :booking="booking"
                :is-personal-info-editing="isPersonalInfoEditing"
                :attendee-sections-open="attendeeSectionsOpen"
                :attendee-form="attendeeForm"
                :attendee-validation-errors="attendeeValidationErrors"
                :area-options="areaOptions"
                :area-search="areaSearch"
                :area-lookup-loading="areaLookupLoading"
                :emergency-contact-form="emergencyContactForm"
                :attendee-emergency-contact-list="attendeeEmergencyContactList"
                :emergency-relationship-options="emergencyRelationshipOptions"
                :show-medical-form="showMedicalForm"
                :show-dietary-form="showDietaryForm"
                :show-accessibility-form="showAccessibilityForm"
                :attendee-medical-conditions="attendeeMedicalConditions"
                :attendee-dietary-requirements="attendeeDietaryRequirements"
                :attendee-accessibility-requirements="attendeeAccessibilityRequirements"
                :medical-conditions="medicalConditions"
                :dietary-requirements="dietaryRequirements"
                :accessibility-requirements="accessibilityRequirements"
                :new-medical="newMedical"
                :new-dietary="newDietary"
                :new-accessibility="newAccessibility"
                :event-consents="eventConsents"
                :is-consent-linked="isConsentLinked"
                :consent-toggle-label="consentToggleLabel"
                :on-toggle-consent="toggleConsentLink"
                :on-toggle-section="toggleAttendeeSection"
                :on-toggle-personal-info-edit="togglePersonalInfoEdit"
                :on-save-attendee="saveAttendee"
                :attendee-save-pending="updateAttendee.isPending.value"
                :on-apply-area-option="applyAreaOption"
                :on-clear-area-from="clearAreaFrom"
                :on-area-search-change="setAreaSearch"
                :on-toggle-show-medical-form="toggleMedicalForm"
                :on-toggle-show-dietary-form="toggleDietaryForm"
                :on-toggle-show-accessibility-form="toggleAccessibilityForm"
                :on-add-emergency-contact="addEmergencyContact"
                :on-remove-emergency-contact="removeEmergencyContact"
                :on-add-medical-condition="addMedicalCondition"
                :on-remove-medical-condition="removeMedicalCondition"
                :on-add-dietary-requirement="addDietaryRequirement"
                :on-remove-dietary-requirement="removeDietaryRequirement"
                :on-add-accessibility-requirement="addAccessibilityRequirement"
                :on-remove-accessibility-requirement="removeAccessibilityRequirement"
              />
            </article>

          <article v-if="false && activeTab === 'overview'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
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
              <div class="mt-4 relative">
                <div class="pointer-events-none absolute left-3 top-6 bottom-6 w-px bg-blue-200"></div>
                <ol class="space-y-4 relative">
                  <li
                    v-for="step in journeySteps"
                    :key="step.id"
                    class="relative pl-10"
                  >
                  <div
                    class="absolute left-0 top-1 h-6 w-6 rounded-full border text-[11px] font-black flex items-center justify-center"
                    :class="step.done ? 'border-green-300 bg-green-50 text-green-700' : 'border-blue-300 bg-blue-50 text-blue-700'"
                  >
                    {{ step.id }}
                  </div>
                  <div class="min-w-0 rounded-lg border border-deep-navy/10 bg-white p-3">
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
                        @click="handleJourneyStepAction(step.action)"
                      >
                        {{ step.cta }}
                      </button>

                      <div v-if="!hideAllJourneyDetails" class="mt-3 rounded-lg border border-deep-navy/10 bg-mist-blue/20 p-3 text-xs text-deep-navy/80 space-y-2">
                        <template v-if="step.action === 'shop'">
                          <p class="font-semibold text-deep-navy">
                            {{ outstandingPayments.length ? `${outstandingPayments.length} payment(s) still outstanding.` : 'Registration complete. No outstanding payments.' }}
                          </p>
                          <OutstandingPaymentCarouselCard
                            v-if="outstandingPayments.length"
                            :payments="outstandingPayments"
                            @refresh="refreshOutstandingPayments"
                          />
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
                          <p v-if="primaryVenue?.address">{{ primaryVenue.address }}</p>
                          <p v-if="primaryVenue?.city">{{ primaryVenue.city }}</p>
                          <iframe
                            v-if="venueMapEmbedUrl"
                            :src="venueMapEmbedUrl"
                            class="w-full h-40 border-0 rounded-md"
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </template>

                        <template v-else-if="step.action === 'time'">
                          <p><span class="font-black text-deep-navy">Starts:</span> {{ formatDateTime(eventStart) }}</p>
                          <p><span class="font-black text-deep-navy">Ends:</span> {{ formatDateTime(eventEnd) }}</p>
                          <p><span class="font-black text-deep-navy">Timezone:</span> {{ myBookingData?.event?.timezone || 'UTC' }}</p>
                        </template>
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </article>

          <!-- Tickets tab -->
          <article v-if="false && selectedAttendeeId && activeTab === 'tickets'" class="bg-white border border-deep-navy/10 rounded-2xl p-5">
            <TicketsTab :selected-attendee-id="selectedAttendeeId" />
          </article>

          <article v-if="false && selectedAttendeeId && activeTab === 'payments'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-black uppercase tracking-wide text-deep-navy">Payments</p>
                <p class="mt-1 text-xs text-deep-navy/60">{{ selectedAttendee?.name || 'Attendee' }}</p>
              </div>
            </div>

            <div v-if="paymentSummary.isLoading.value" class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/70">
              Loading payments...
            </div>
            <div v-else-if="paymentSummary.error.value" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Unable to load payment summary right now.
            </div>
            <template v-else>
              <section class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm" v-if="paymentSummaryData?.totals?.outstanding_payments">
                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-blue-700">Outstanding now</p>
                <p class="mt-3 text-4xl font-black text-blue-900">{{ paymentSummaryData?.totals?.outstanding_payments || outstandingPayments.length }}</p>
                <p class="mt-1 text-sm text-blue-900/80">{{ paymentSummaryData?.totals?.total_outstanding_amount || '0.00' }} outstanding</p>
              </section>

              <section class="space-y-4">
                <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Attendee payments</p>
                <div v-if="attendeeLevelPayments.length" class="space-y-4">
                  <article v-for="payment in attendeeLevelPayments" :key="payment.payment_id || payment.payment_reference" class="rounded-2xl border border-deep-navy/10 bg-white p-4 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/45">Payment</p>
                        <p class="mt-1 truncate text-sm font-black text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                        <p class="mt-1 text-xs text-deep-navy/65">{{ paymentContextSummary(payment) }}</p>
                      </div>
                      <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="payment.is_outstanding ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'">
                        {{ payment.status || (payment.is_outstanding ? 'PENDING' : 'COMPLETED') }}
                      </span>
                    </div>

                    <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Current amount</p>
                      <p class="mt-2 text-2xl font-black text-deep-navy">{{ formatCurrencyAmount(paymentCurrentAmount(payment)) }}</p>

                      <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span class="font-semibold text-slate-500">Before refunds:</span>
                        <span class="font-black text-slate-500 line-through">{{ formatCurrencyAmount(paymentOriginalAmount(payment)) }}</span>
                        <span v-if="paymentRefundedAmount(payment) > 0" class="font-black text-rose-700">- {{ formatCurrencyAmount(paymentRefundedAmount(payment)) }}</span>
                      </div>
                    </div>

                    <div class="rounded-xl border border-deep-navy/10 bg-blue-50 p-3">
                      <p class="text-[10px] font-black uppercase tracking-wide text-blue-700">Method</p>
                      <p class="mt-1 text-sm font-semibold text-blue-900">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
                      <p class="mt-1 text-[11px] text-blue-800/80">{{ payment.source === 'SHOP_ORDER' ? 'Order payment' : 'Booking payment' }}</p>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700">{{ payment.source === 'SHOP_ORDER' ? 'Order' : 'Booking' }}</span>
                      <button
                        v-if="payment.order_reference"
                        type="button"
                        class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100"
                        @click="openOrderFromPayment(payment.order_reference || '')"
                      >
                        View {{ payment.order_reference }}
                      </button>
                    </div>

                    <div v-if="isOutstandingBankTransfer(payment) && hasSummaryBankMetadata(payment)" class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-3 space-y-3">
                      <div class="flex items-center justify-between gap-2">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Bank transfer details</p>
                        <button
                          v-if="getRequiredTransferReference(payment)"
                          type="button"
                          class="rounded-full border border-blue-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-white"
                          @click="copyTransferReference(getRequiredTransferReference(payment) || '')"
                        >
                          Copy ref
                        </button>
                      </div>
                      <div class="space-y-2">
                        <div class="rounded-xl border border-white bg-white/90 p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Account name</p>
                          <p class="mt-1 break-words text-sm font-black text-blue-900">{{ getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                        </div>
                        <div class="rounded-xl border border-white bg-white/90 p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Sort code</p>
                          <p class="mt-1 text-lg font-black text-blue-900">{{ getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                        </div>
                        <div class="rounded-xl border border-white bg-white/90 p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Account number</p>
                          <p class="mt-1 text-lg font-black text-blue-900">{{ getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                        </div>
                        <div v-if="getRequiredTransferReference(payment)" class="rounded-xl border border-blue-300 bg-white p-3">
                          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-800">Transfer reference</p>
                          <p class="mt-1 break-all text-sm font-black text-blue-900">{{ getRequiredTransferReference(payment) }}</p>
                        </div>
                      </div>
                    </div>

                    <div v-if="getRelatedOrderLabels(payment).length" class="mt-4 rounded-2xl border border-deep-navy/10 bg-mist-blue/25 p-3">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Related orders</p>
                      <div class="mt-2 flex flex-wrap gap-2">
                        <span v-for="label in getRelatedOrderLabels(payment)" :key="label" class="rounded-full border border-deep-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-deep-navy">{{ label }}</span>
                      </div>
                    </div>
                  </article>
                </div>
                <p v-else class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/65">No attendee-level payments yet.</p>
              </section>

              <section class="space-y-4 pt-2 border-t border-deep-navy/10">
                <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Booking-wide payments</p>
                <div v-if="bookingLevelPayments.length" class="space-y-4">
                  <article v-for="payment in bookingLevelPayments" :key="payment.payment_id || payment.payment_reference" class="rounded-2xl border border-deep-navy/10 bg-white p-4 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/45">Payment</p>
                        <p class="mt-1 truncate text-sm font-black text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                        <p class="mt-1 text-xs text-deep-navy/65">{{ paymentContextSummary(payment) }}</p>
                      </div>
                      <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="payment.is_outstanding ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'">
                        {{ payment.status || (payment.is_outstanding ? 'PENDING' : 'COMPLETED') }}
                      </span>
                    </div>

                    <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Current amount</p>
                      <p class="mt-2 text-2xl font-black text-deep-navy">{{ formatCurrencyAmount(paymentCurrentAmount(payment)) }}</p>

                      <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span class="font-semibold text-slate-500">Before refunds:</span>
                        <span class="font-black text-slate-500 line-through">{{ formatCurrencyAmount(paymentOriginalAmount(payment)) }}</span>
                        <span v-if="paymentRefundedAmount(payment) > 0" class="font-black text-rose-700">- {{ formatCurrencyAmount(paymentRefundedAmount(payment)) }}</span>
                      </div>
                    </div>

                    <div class="rounded-xl border border-deep-navy/10 bg-blue-50 p-3 mt-4">
                      <p class="text-[10px] font-black uppercase tracking-wide text-blue-700">Method</p>
                      <p class="mt-1 text-sm font-semibold text-blue-900">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
                      <p class="mt-1 text-[11px] text-blue-800/80">{{ payment.source === 'SHOP_ORDER' ? 'Order payment' : 'Booking payment' }}</p>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700">{{ payment.source === 'SHOP_ORDER' ? 'Order' : 'Booking' }}</span>
                      <button
                        v-if="payment.order_reference"
                        type="button"
                        class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100"
                        @click="openOrderFromPayment(payment.order_reference || '')"
                      >
                        View {{ payment.order_reference }}
                      </button>
                    </div>

                    <div v-if="isOutstandingBankTransfer(payment) && hasSummaryBankMetadata(payment)" class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-3 space-y-3">
                      <div class="flex items-center justify-between gap-2">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Bank transfer details</p>
                        <button
                          v-if="getRequiredTransferReference(payment)"
                          type="button"
                          class="rounded-full border border-blue-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-white"
                          @click="copyTransferReference(getRequiredTransferReference(payment) || '')"
                        >
                          Copy ref
                        </button>
                      </div>
                      <div class="space-y-2">
                        <div class="rounded-xl border border-white bg-white/90 p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Account name</p>
                          <p class="mt-1 break-words text-sm font-black text-blue-900">{{ getProvidedDetail(payment, 'account_name') || 'Unavailable' }}</p>
                        </div>
                        <div class="rounded-xl border border-white bg-white/90 p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Sort code</p>
                          <p class="mt-1 text-lg font-black text-blue-900">{{ getProvidedDetail(payment, 'sort_code') || 'Unavailable' }}</p>
                        </div>
                        <div class="rounded-xl border border-white bg-white/90 p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-blue-700/70">Account number</p>
                          <p class="mt-1 text-lg font-black text-blue-900">{{ getProvidedDetail(payment, 'account_number') || 'Unavailable' }}</p>
                        </div>
                        <div v-if="getRequiredTransferReference(payment)" class="rounded-xl border border-blue-300 bg-white p-3">
                          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-800">Transfer reference</p>
                          <p class="mt-1 break-all text-sm font-black text-blue-900">{{ getRequiredTransferReference(payment) }}</p>
                        </div>
                      </div>
                    </div>

                    <div v-if="getRelatedOrderLabels(payment).length" class="mt-4 rounded-2xl border border-deep-navy/10 bg-mist-blue/25 p-3">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Related orders</p>
                      <div class="mt-2 flex flex-wrap gap-2">
                        <span v-for="label in getRelatedOrderLabels(payment)" :key="label" class="rounded-full border border-deep-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-deep-navy">{{ label }}</span>
                      </div>
                    </div>
                  </article>
                </div>
                <p v-else class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-4 text-sm text-deep-navy/65">No booking-level payments found.</p>
              </section>
            </template>
          </article>

          <article v-if="false && selectedAttendeeId && activeTab === 'orders'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-black uppercase tracking-wide text-deep-navy">Orders</p>
              <p class="text-xs text-deep-navy/60">{{ selectedAttendee?.name || 'Attendee' }}</p>
            </div>

            <div v-if="attendeeOrders.isLoading.value" class="text-sm text-deep-navy/60">Loading orders...</div>
            <div v-else-if="attendeeOrders.error.value" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Unable to load orders right now.
            </div>
            <template v-else>
              <div v-if="attendeeOrderList.length" class="space-y-3">
                <section class="rounded-xl border border-blue-200 bg-blue-50 p-4 mt-3 space-y-2"  v-if="outstandingPayments.length">
                    <div
                      v-for="payment in outstandingPayments"
                      :key="payment.payment_id || payment.payment_reference"
                      :class="paymentAttentionCardClass(payment)"
                    >
                      <div class="flex items-center justify-between gap-3">
                        <div>
                          <p class="text-xs font-black text-deep-navy">{{ payment.payment_reference || 'Payment' }}</p>
                          <p class="text-sm font-semibold text-deep-navy">{{ payment.amount || '-' }}</p>
                          <p class="text-xs" :class="needsEvidenceUpload(payment) ? 'text-red-700' : 'text-blue-700'">
                            {{ paymentAttentionLabel(payment) }}
                          </p>
                          <p class="text-[11px] text-deep-navy/75 mt-1">{{ payment.method_title || payment.method_type || 'Method unavailable' }}</p>
                        </div>
                        <button
                          type="button"
                          class="rounded-lg border border-blue-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100"
                          @click="togglePaymentExpand(payment)"
                        >
                          {{ isPaymentExpanded(payment.payment_id || '') ? 'Hide details' : 'View method' }}
                        </button>
                      </div>

                      <p v-if="isOutstandingBankTransfer(payment) && hasUploadedEvidence(String(payment.payment_id || ''))" class="mt-2 rounded-md border border-blue-200 bg-white px-2 py-2 text-[11px] text-blue-800">
                        Evidence uploaded. Waiting for verification.
                      </p>

                      <div v-if="isOutstandingBankTransfer(payment) && needsEvidenceUpload(payment)" class="mt-2 rounded-md border border-red-200 bg-white p-3 text-[12px] text-red-900 space-y-2">
                        <p class="font-black uppercase tracking-wide text-[10px] text-red-700">Upload payment evidence</p>
                        <div>
                          <label class="mb-1 block text-[11px] font-semibold">Evidence file <span class="text-red-600">*</span></label>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="w-full rounded-lg border border-red-200 px-3 py-2 text-sm" @change="onEvidenceUploadFileChange(String(payment.payment_id || ''), $event)">
                        </div>
                        <div class="space-y-2">
                          <div>
                            <label class="mb-1 block text-[11px] font-semibold">Payer name <span class="text-red-600">*</span></label>
                            <input v-model="evidenceUploadForm[String(payment.payment_id || '')].payer_name" type="text" class="w-full rounded-lg border border-red-200 px-3 py-2 text-sm" placeholder="Full name">
                          </div>
                          <div>
                            <label class="mb-1 block text-[11px] font-semibold">Payer account last 4 <span class="text-red-600">*</span></label>
                            <input v-model="evidenceUploadForm[String(payment.payment_id || '')].payer_account_last4" type="text" maxlength="4" class="w-full rounded-lg border border-red-200 px-3 py-2 text-sm" placeholder="1234">
                          </div>
                        </div>
                        <div>
                          <label class="mb-1 block text-[11px] font-semibold">Amount on evidence <span class="text-red-600">*</span></label>
                          <input v-model="evidenceUploadForm[String(payment.payment_id || '')].amount_on_evidence" type="number" min="0" step="0.01" class="w-full rounded-lg border border-red-200 px-3 py-2 text-sm" placeholder="0.00">
                        </div>
                        <p v-if="evidenceUploadError[String(payment.payment_id || '')]" class="text-xs font-semibold text-red-700">{{ evidenceUploadError[String(payment.payment_id || '')] }}</p>
                        <p v-if="evidenceUploadSuccess[String(payment.payment_id || '')]" class="text-xs font-semibold text-blue-700">{{ evidenceUploadSuccess[String(payment.payment_id || '')] }}</p>
                        <div class="flex justify-end">
                          <button type="button" class="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white hover:bg-red-700 disabled:opacity-60" :disabled="!!evidenceUploadPending[String(payment.payment_id || '')]" @click="uploadOutstandingEvidence(payment)">
                            {{ evidenceUploadPending[String(payment.payment_id || '')] ? 'Uploading...' : 'Upload evidence' }}
                          </button>
                        </div>
                      </div>

                      <div v-if="isPaymentExpanded(payment.payment_id || '')" class="mt-3 rounded-lg border border-deep-navy/10 bg-mist-blue/40 p-3 text-xs text-deep-navy/80 space-y-2">
                        <p v-if="paymentDetailLoading[payment.payment_id || '']">Loading payment method...</p>
                        <template v-else>
                          <p><span class="font-black text-deep-navy">Method:</span> {{ getPaymentMethodType(payment.payment_id || '') }}</p>
                          <div v-if="isOutstandingBankTransfer(payment)" class="rounded-md border border-blue-200 bg-white p-3 space-y-2">
                            <p class="font-black uppercase tracking-wide text-[10px] text-blue-700">Bank transfer instructions</p>
                            <ol class="space-y-2 text-[12px] text-deep-navy/90">
                              <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                                <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">1. Pay this exact amount</p>
                                <p class="mt-1 text-xl font-black text-deep-navy">{{ payment.amount || '-' }}</p>
                              </li>
                              <li class="rounded-md border border-deep-navy/10 bg-mist-blue/20 p-2">
                                <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">2. Use these account details</p>
                                <div class="mt-1 space-y-2">
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
                              <li v-if="getRequiredTransferReference(payment)" class="rounded-md border border-blue-300 bg-blue-50 p-2">
                                <p class="text-[10px] font-black uppercase tracking-wide text-blue-800">3. Add this exact transfer reference</p>
                                <div class="mt-1 flex items-center justify-between gap-2">
                                  <p class="text-sm font-black text-blue-900 break-all">{{ getRequiredTransferReference(payment) }}</p>
                                  <button type="button" class="shrink-0 rounded-md border border-blue-300 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100" @click="copyTransferReference(getRequiredTransferReference(payment) || '')">
                                    Copy
                                  </button>
                                </div>
                              </li>
                            </ol>
                          </div>
                          <p v-if="!isOutstandingBankTransfer(payment)" class="text-[11px] text-deep-navy/70">This payment is {{ payment.method_title || payment.method_type || 'not bank transfer' }}.</p>
                          <p v-if="getBankTransferReference(payment.payment_id || '')"><span class="font-black text-deep-navy">Bank transfer reference:</span> {{ getBankTransferReference(payment.payment_id || '') }}</p>
                          <p v-if="getBankTransferInstructions(payment.payment_id || '')" class="whitespace-pre-line"><span class="font-black text-deep-navy">Instructions:</span> {{ getBankTransferInstructions(payment.payment_id || '') }}</p>
                        </template>
                      </div>

                      <div v-if="getRelatedOrderLabels(payment).length" class="mt-4 rounded-2xl border border-deep-navy/10 bg-mist-blue/25 p-3">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/60">Related orders</p>
                        <div class="mt-2 flex flex-wrap gap-2">
                          <span v-for="label in getRelatedOrderLabels(payment)" :key="label" class="rounded-full border border-deep-navy/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-deep-navy">{{ label }}</span>
                        </div>
                      </div>
                    </div>
                </section>

                <div class="rounded-2xl border border-deep-navy/10 bg-white p-5 shadow-sm">
                <article v-for="order in attendeeOrderList" :key="order.order_id || order.id" class="rounded-xl border border-deep-navy/10 overflow-hidden"> 
                  <div class="px-4 py-3 bg-gray-50 border-b border-deep-navy/10 flex flex-wrap items-center justify-between gap-3" v-if="order.status !== 'draft'">
                    <div>
                      <p class="font-black text-deep-navy text-sm">Order {{ order.order_reference_id || order.order_id }}</p>
                      <p class="text-xs text-deep-navy/60">{{ formatDateTime(order.created_at) }}</p>
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
                        @click="cancelOrder(order.order_id)"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div class="p-4 space-y-3" v-if="order.status !== 'draft'">
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
              </div>
              <div v-else class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <UIcon name="i-heroicons-inbox" class="h-7 w-7" />
                </div>
                <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No orders yet</p>
                <p class="mt-2 text-sm text-slate-500">This attendee does not have any linked orders, so there are no outstanding payment actions to show here.</p>
              </div>
            </template>
          </article>

          <article v-if="false && selectedAttendeeId && activeTab === 'attendee'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
            <div v-if="!selectedAttendeeId" class="text-sm text-deep-navy/60">Select an attendee from Booking Overview first.</div>
            <div v-else-if="attendee.isLoading.value" class="text-sm text-deep-navy/60">Loading attendee...</div>
            <div v-else class="space-y-4">
              <!-- <div class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
                <p class="text-[10px] font-black uppercase tracking-[0.24em] text-blue-700">Editing attendee</p>
                <p class="mt-1 text-sm font-semibold text-blue-900">{{ attendee.data.value?.data?.full_name || selectedAttendee?.name || 'Attendee' }}</p>
                <div v-if="attendeeForm.area_from_name || areaSearch" class="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-800">
                  <span class="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>{{ attendeeForm.area_from_name || areaSearch }}</span>
                </div>
              </div> -->

              <form class="space-y-5" @submit.prevent="saveAttendee">
                <section class="rounded-2xl border border-deep-navy/10 bg-white">
                  <div class="flex items-center justify-between gap-3 border-b border-deep-navy/10 px-4 py-3">
                    <div>
                      <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Personal info</p>
                      <p class="mt-1 text-xs text-deep-navy/60">{{ isPersonalInfoEditing ? 'Edit attendee profile details.' : 'Review attendee profile details.' }}</p>
                    </div>
                    <button
                      type="button"
                      class="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide"
                      :class="isPersonalInfoEditing ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-deep-navy/20 bg-white text-deep-navy hover:border-blue-400 hover:text-blue-700'"
                      @click="togglePersonalInfoEdit"
                    >
                      {{ isPersonalInfoEditing ? 'Stop editing' : 'Edit details' }}
                    </button>
                  </div>

                  <div class="p-4">
                    <div v-if="!isPersonalInfoEditing" class="space-y-3">
                      <div class="rounded-lg border border-deep-navy/10 bg-mist-blue/30 p-3">
                        <p class="text-sm font-black text-deep-navy">{{ attendeeForm.first_name }} {{ attendeeForm.last_name }}</p>
                        <p class="mt-1 text-xs text-deep-navy/60">{{ attendeeForm.relationship_to_user && attendeeForm.relationship_to_user !== 'self' ? attendeeForm.relationship_to_user.charAt(0).toUpperCase() + attendeeForm.relationship_to_user.slice(1) : 'Self' }}</p>
                      </div>
                      <div class="grid gap-3 md:grid-cols-2">
                        <div v-if="attendeeForm.email" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Email</p>
                          <p class="mt-1 truncate text-sm text-deep-navy">{{ attendeeForm.email }}</p>
                        </div>
                        <div v-if="attendeeForm.phone_number" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Phone</p>
                          <p class="mt-1 text-sm text-deep-navy">{{ attendeeForm.phone_number }}</p>
                        </div>
                        <div v-if="attendeeForm.date_of_birth" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Date of birth</p>
                          <p class="mt-1 text-sm text-deep-navy">{{ attendeeForm.date_of_birth }}</p>
                        </div>
                        <div v-if="attendeeForm.gender" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                          <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Gender</p>
                          <p class="mt-1 text-sm text-deep-navy">{{ attendeeForm.gender }}</p>
                        </div>
                        <div v-if="attendeeForm.area_from_name" class="rounded-lg border border-deep-navy/10 bg-white p-3 md:col-span-2">
                          <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Area from</p>
                          <p class="mt-1 text-sm text-deep-navy">{{ attendeeForm.area_from_name }}</p>
                        </div>
                      </div>
                    </div>

                    <div v-else class="space-y-4">
                <div class="grid gap-4 md:grid-cols-2">
                  <label class="space-y-1 text-sm">
                    <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">First name <span class="text-red-500">*</span></span>
                    <input v-model="attendeeForm.first_name" :disabled="!isPersonalInfoEditing" type="text" required class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                    <p v-if="attendeeValidationErrors.first_name" class="text-xs font-semibold text-red-700">{{ attendeeValidationErrors.first_name }}</p>
                  </label>
                  <label class="space-y-1 text-sm">
                    <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Last name <span class="text-red-500">*</span></span>
                    <input v-model="attendeeForm.last_name" :disabled="!isPersonalInfoEditing" type="text" required class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                    <p v-if="attendeeValidationErrors.last_name" class="text-xs font-semibold text-red-700">{{ attendeeValidationErrors.last_name }}</p>
                  </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="space-y-1 text-sm">
                    <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Email <span class="text-deep-navy/45">optional</span></span>
                    <input v-model="attendeeForm.email" :disabled="!isPersonalInfoEditing" type="email" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                    <p v-if="attendeeValidationErrors.email" class="text-xs font-semibold text-red-700">{{ attendeeValidationErrors.email }}</p>
                  </label>
                  <label class="space-y-1 text-sm">
                    <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Phone <span class="text-deep-navy/45">optional</span></span>
                    <input v-model="attendeeForm.phone_number" :disabled="!isPersonalInfoEditing" type="text" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                    <p v-if="attendeeValidationErrors.phone_number" class="text-xs font-semibold text-red-700">{{ attendeeValidationErrors.phone_number }}</p>
                  </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="space-y-1 text-sm">
                    <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Date of birth <span class="text-red-500">*</span></span>
                    <input v-model="attendeeForm.date_of_birth" :disabled="!isPersonalInfoEditing" type="date" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                    <p v-if="attendeeValidationErrors.date_of_birth" class="text-xs font-semibold text-red-700">{{ attendeeValidationErrors.date_of_birth }}</p>
                  </label>
                  <label class="space-y-1 text-sm">
                    <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Gender <span class="text-red-500">*</span></span>
                    <input v-model="attendeeForm.gender" :disabled="!isPersonalInfoEditing" type="text" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                    <p v-if="attendeeValidationErrors.gender" class="text-xs font-semibold text-red-700">{{ attendeeValidationErrors.gender }}</p>
                  </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="space-y-1 text-sm">
                    <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Relationship <span class="text-red-500">*</span></span>
                    <select 
                    :disabled="!isPersonalInfoEditing || attendeeForm.relationship_to_user == 'self'"
                    v-model="attendeeForm.relationship_to_user" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400">
                      <option value="self">Self</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other</option>
                    </select>
                    <p v-if="attendeeValidationErrors.relationship_to_user" class="text-xs font-semibold text-red-700">{{ attendeeValidationErrors.relationship_to_user }}</p>
                  </label>

                  <div class="space-y-2 rounded-2xl border border-deep-navy/10 bg-mist-blue/35 p-4">
                    <div>
                      <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy/60">Area from <span class="text-red-500">*</span></p>
                      <p class="mt-1 text-xs text-deep-navy/65">Search for an area and select the matching result.</p>
                    </div>
                    <div class="relative">
                      <input
                        v-model="areaSearch"
                        :disabled="!isPersonalInfoEditing"
                        type="text"
                        placeholder="Search area name"
                        class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65"
                      >
                      <div v-if="isPersonalInfoEditing && areaOptions.length && areaSearch.trim().length >= 2" class="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-deep-navy/10 bg-white shadow-xl">
                        <button
                          v-for="option in areaOptions"
                          :key="option.value"
                          type="button"
                          class="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-blue-50"
                          :class="option.value === attendeeForm.area_from ? 'bg-blue-50 text-blue-700' : 'text-deep-navy'"
                          @click="applyAreaOption(option)"
                        >
                          <span class="min-w-0 truncate font-medium">{{ option.label }}</span>
                          <span v-if="option.value === attendeeForm.area_from" class="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700">Selected</span>
                        </button>
                      </div>
                    </div>
                    <p v-if="areaLookupLoading" class="text-xs font-semibold text-blue-700">Searching areas...</p>
                    <div v-if="attendeeForm.area_from" class="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white px-3 py-2.5">
                      <div class="min-w-0">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Selected area</p>
                        <p class="truncate text-sm font-semibold text-blue-900">{{ attendeeForm.area_from_name || areaSearch || 'Area selected' }}</p>
                      </div>
                      <button v-if="isPersonalInfoEditing" type="button" class="rounded-full border border-blue-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-50" @click="clearAreaFrom">
                        Clear
                      </button>
                    </div>
                    <p v-if="attendeeValidationErrors.area_from" class="text-xs font-semibold text-red-700">{{ attendeeValidationErrors.area_from }}</p>
                  </div>
                </div>
                    </div>
                  </div>
                </section>

                <section class="rounded-2xl border border-deep-navy/10 bg-mist-blue/20">
                  <div class="flex items-center justify-between gap-3 border-b border-deep-navy/10 px-4 py-3">
                    <div>
                      <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Safeguarding</p>
                      <p class="mt-1 text-xs text-deep-navy/60">Medical, dietary, accessibility, and emergency records.</p>
                    </div>
                    <button
                      type="button"
                      class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700"
                      @click="toggleAttendeeSection('safeguarding')"
                    >
                      {{ attendeeSectionsOpen.safeguarding ? 'Collapse' : 'Expand' }}
                    </button>
                  </div>

                  <div class="p-4">
                    <div v-if="!attendeeSectionsOpen.safeguarding" class="space-y-3">
                      <div v-if="attendeeMedicalConditions.data.value?.data?.results?.length" class="space-y-2">
                        <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Medical conditions</p>
                        <div class="space-y-2">
                          <div v-for="item in attendeeMedicalConditions.data.value?.data?.results" :key="item.id" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                            <p class="text-sm font-semibold text-deep-navy">{{ item.condition_details.label }}</p>
                            <p v-if="item.details" class="mt-1 text-xs text-deep-navy/60">{{ item.details }}</p>
                          </div>
                        </div>
                      </div>
                      <div v-if="attendeeDietaryRequirements.data.value?.data?.results?.length" class="space-y-2">
                        <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Dietary requirements</p>
                        <div class="space-y-2">
                          <div v-for="item in attendeeDietaryRequirements.data.value?.data?.results" :key="item.id" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                            <p class="text-sm font-semibold text-deep-navy">{{ item.requirement_details.label }}</p>
                            <p v-if="item.details" class="mt-1 text-xs text-deep-navy/60">{{ item.details }}</p>
                          </div>
                        </div>
                      </div>
                      <div v-if="attendeeAccessibilityRequirements.data.value?.data?.results?.length" class="space-y-2">
                        <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Accessibility requirements</p>
                        <div class="space-y-2">
                          <div v-for="item in attendeeAccessibilityRequirements.data.value?.data?.results" :key="item.id" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                            <p class="text-sm font-semibold text-deep-navy">{{ item.requirement_details.label }}</p>
                            <p v-if="item.details" class="mt-1 text-xs text-deep-navy/60">{{ item.details }}</p>
                          </div>
                        </div>
                      </div>
                      <div v-if="attendeeEmergencyContactList.length" class="space-y-2">
                        <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Emergency contacts</p>
                        <div class="space-y-2">
                          <div v-for="contact in attendeeEmergencyContactList" :key="contact.id" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                            <p class="text-sm font-semibold text-deep-navy">{{ contact.full_name }}</p>
                            <p class="mt-1 text-xs text-deep-navy/60">{{ contact.relationship_display }} • {{ contact.phone_number }}</p>
                            <p v-if="contact.email" class="mt-1 truncate text-xs text-deep-navy/60">{{ contact.email }}</p>
                          </div>
                        </div>
                      </div>
                      <p v-if="!attendeeMedicalConditions.data.value?.data?.results?.length && !attendeeDietaryRequirements.data.value?.data?.results?.length && !attendeeAccessibilityRequirements.data.value?.data?.results?.length && !attendeeEmergencyContactList.length" class="rounded-lg border border-dashed border-deep-navy/15 bg-white p-4 text-sm text-deep-navy/60">No safeguarding information added yet.</p>
                    </div>
                      
                    <div v-else class="space-y-5">
                <section class="rounded-2xl border border-deep-navy/10 bg-mist-blue/30 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Medical conditions</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Linked conditions are shown below.</p>
                  </div>
                  <button type="button" class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700" @click="showMedicalForm = !showMedicalForm">
                    {{ showMedicalForm ? 'Hide form' : 'Add condition' }}
                  </button>
                </div>
                <div class="mt-4 space-y-3">
                  <article v-for="item in attendeeMedicalConditions.data.value?.data?.results || []" :key="item.id" class="rounded-2xl border border-deep-navy/10 bg-white p-3 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-sm font-black text-deep-navy">{{ item.condition_details.label }}</p>
                        <p class="mt-1 text-xs text-deep-navy/60">{{ item.details || 'No details provided.' }}</p>
                      </div>
                      <button type="button" class="rounded-full border border-red-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50" @click="removeMedicalCondition(item.id)">
                        Remove
                      </button>
                    </div>
                  </article>
                  <p v-if="!attendeeMedicalConditions.data.value?.data?.results?.length" class="rounded-2xl border border-dashed border-deep-navy/15 bg-white p-4 text-sm text-deep-navy/60">No medical conditions linked to this attendee yet.</p>
                </div>
                <div v-if="showMedicalForm" class="mt-4 rounded-2xl border border-deep-navy/10 bg-white p-4">
                  <div class="space-y-3">
                    <select v-model.number="newMedical.medical_condition" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                      <option :value="null">Select condition</option>
                      <option v-for="item in medicalConditions.data.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                    </select>
                    <input v-model="newMedical.details" type="text" placeholder="Details or notes" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                    <div class="flex justify-end">
                      <button type="button" class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-blue-600" @click="addMedicalCondition">
                        Add condition
                      </button>
                    </div>
                  </div>
                </div>
              
              </section>

              <section class="rounded-2xl border border-deep-navy/10 bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Dietary requirements</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Linked requirements are shown below. Add new ones only when needed.</p>
                  </div>
                  <button type="button" class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700" @click="showDietaryForm = !showDietaryForm">
                    {{ showDietaryForm ? 'Hide form' : 'Add requirement' }}
                  </button>
                </div>
                <div class="mt-4 space-y-3">
                  <article v-for="item in attendeeDietaryRequirements.data.value?.data?.results || []" :key="item.id" class="rounded-2xl border border-deep-navy/10 bg-mist-blue/20 p-3 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-sm font-black text-deep-navy">{{ item.requirement_details.label }}</p>
                        <p class="mt-1 text-xs text-deep-navy/60">{{ item.details || 'No details provided.' }}</p>
                      </div>
                      <button type="button" class="rounded-full border border-red-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50" @click="removeDietaryRequirement(item.id)">
                        Remove
                      </button>
                    </div>
                  </article>
                  <p v-if="!attendeeDietaryRequirements.data.value?.data?.results?.length" class="rounded-2xl border border-dashed border-deep-navy/15 bg-mist-blue/20 p-4 text-sm text-deep-navy/60">No dietary requirements linked to this attendee yet.</p>
                </div>
                <div v-if="showDietaryForm" class="mt-4 rounded-2xl border border-deep-navy/10 bg-mist-blue/30 p-4">
                  <div class="space-y-3">
                    <select v-model.number="newDietary.dietary_requirement" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                      <option :value="null">Select requirement</option>
                      <option v-for="item in dietaryRequirements.data.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                    </select>
                    <input v-model="newDietary.details" type="text" placeholder="Details or notes" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                    <div class="flex justify-end">
                      <button type="button" class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-blue-600" @click="addDietaryRequirement">
                        Add requirement
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-deep-navy/10 bg-mist-blue/25 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Accessibility requirements</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Linked requirements are shown below. Add new ones only when needed.</p>
                  </div>
                  <button type="button" class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700" @click="showAccessibilityForm = !showAccessibilityForm">
                    {{ showAccessibilityForm ? 'Hide form' : 'Add requirement' }}
                  </button>
                </div>
                <div class="mt-4 space-y-3">
                  <article v-for="item in attendeeAccessibilityRequirements.data.value?.data?.results || []" :key="item.id" class="rounded-2xl border border-deep-navy/10 bg-white p-3 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-sm font-black text-deep-navy">{{ item.requirement_details.label }}</p>
                        <p class="mt-1 text-xs text-deep-navy/60">{{ item.details || 'No details provided.' }}</p>
                      </div>
                      <button type="button" class="rounded-full border border-red-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50" @click="removeAccessibilityRequirement(item.id)">
                        Remove
                      </button>
                    </div>
                  </article>
                  <p v-if="!attendeeAccessibilityRequirements.data.value?.data?.results?.length" class="rounded-2xl border border-dashed border-deep-navy/15 bg-white p-4 text-sm text-deep-navy/60">No accessibility requirements linked to this attendee yet.</p>
                </div>
                <div v-if="showAccessibilityForm" class="mt-4 rounded-2xl border border-deep-navy/10 bg-white p-4">
                  <div class="space-y-3">
                    <select v-model.number="newAccessibility.accessibility_requirement" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                      <option :value="null">Select requirement</option>
                      <option v-for="item in accessibilityRequirements.data.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                    </select>
                    <input v-model="newAccessibility.details" type="text" placeholder="Details or notes" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                    <div class="flex justify-end">
                      <button type="button" class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-blue-600" @click="addAccessibilityRequirement">
                        Add requirement
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-deep-navy/10 bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Emergency contacts</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Required for minors and useful for all attendees.</p>
                  </div>
                </div>
                <div class="mt-4 space-y-4">
                  <div class="rounded-2xl border border-deep-navy/10 bg-mist-blue/30 p-4">
                    <div class="grid gap-3 md:grid-cols-2">
                      <label class="space-y-1 text-sm">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">First name</span>
                        <input v-model="emergencyContactForm.first_name" type="text" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                      </label>
                      <label class="space-y-1 text-sm">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Last name</span>
                        <input v-model="emergencyContactForm.last_name" type="text" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                      </label>
                      <label class="space-y-1 text-sm">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Phone number</span>
                        <input v-model="emergencyContactForm.phone_number" type="text" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                      </label>
                      <label class="space-y-1 text-sm">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Relationship</span>
                        <select v-model="emergencyContactForm.relationship" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                          <option v-for="option in emergencyRelationshipOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                        </select>
                      </label>
                      <label class="space-y-1 text-sm md:col-span-2">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Email</span>
                        <input v-model="emergencyContactForm.email" type="email" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                      </label>
                    </div>
                    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <label class="inline-flex items-center gap-2 text-xs font-semibold text-deep-navy/70">
                        <input v-model="emergencyContactForm.primary_contact" type="checkbox" class="h-4 w-4 rounded border-deep-navy/30 text-blue-600">
                        Primary contact
                      </label>
                      <button type="button" class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-blue-600" @click="addEmergencyContact">
                        Add contact
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <article v-for="contact in attendeeEmergencyContactList" :key="contact.id" class="rounded-2xl border border-deep-navy/10 bg-white p-3 shadow-sm">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-sm font-black text-deep-navy">{{ contact.full_name }}</p>
                          <p class="mt-1 text-xs text-deep-navy/60">{{ contact.relationship_display }} • {{ contact.phone_number }}</p>
                          <p v-if="contact.email" class="mt-1 truncate text-xs text-deep-navy/60">{{ contact.email }}</p>
                        </div>
                        <button type="button" class="rounded-full border border-red-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50" @click="removeEmergencyContact(contact.id)">
                          Remove
                        </button>
                      </div>
                    </article>
                    <p v-if="!attendeeEmergencyContactList.length" class="rounded-2xl border border-dashed border-deep-navy/15 bg-white p-4 text-sm text-deep-navy/60">No emergency contacts linked yet.</p>
                  </div>
                </div>
              </section>
                    </div>
                  </div>
                </section>
              </form>

              <section class="rounded-2xl border border-deep-navy/10 bg-white">
                <div class="flex items-center justify-between gap-3 border-b border-deep-navy/10 px-4 py-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Consents</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Link or unlink attendee consents here to keep profile setup complete.</p>
                  </div>
                  <button
                    type="button"
                    class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700"
                    @click="toggleAttendeeSection('consents')"
                  >
                    {{ attendeeSectionsOpen.consents ? 'Collapse' : 'Expand' }}
                  </button>
                </div>

                <div v-if="attendeeSectionsOpen.consents" class="space-y-4 p-4">
                  <div v-if="eventConsents.data.value?.data?.results?.length" class="space-y-3">
                    <article v-for="consent in eventConsents.data.value?.data?.results || []" :key="consent.id" class="rounded-2xl border border-deep-navy/10 bg-white p-4 shadow-sm">
                      <label class="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          class="mt-1 h-4 w-4 rounded border-deep-navy/30 text-blue-600 focus:ring-blue-500"
                          :checked="isConsentLinked(consent.id)"
                          @change="toggleConsentLink(consent.id, ($event.target as HTMLInputElement).checked)"
                        >
                        <div class="min-w-0 flex-1">
                          <div class="flex flex-wrap items-center gap-2">
                            <p class="text-sm font-black text-deep-navy">{{ consent.title }}</p>
                            <span class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="consent.required ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'">
                              {{ consent.required ? 'Required' : 'Optional' }}
                            </span>
                            <span class="rounded-full bg-mist-blue px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-deep-navy/70">
                              {{ consentToggleLabel(consent.id) }}
                            </span>
                          </div>
                          <p class="mt-2 text-xs text-deep-navy/60">{{ consent.description }}</p>
                        </div>
                      </label>
                    </article>
                  </div>
                  <p v-else class="rounded-xl border border-dashed border-deep-navy/15 bg-mist-blue/30 p-4 text-sm text-deep-navy/60">No consents are configured for this event yet.</p>
                </div>
              </section>
            </div>
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
                  class="w-full rounded-xl border px-3 py-3 text-left transition-all"
                  :class="[
                    selectedAttendeeId === item.id
                      ? (isAttendeeCancelled(item) ? 'border-rose-400 bg-rose-50 shadow-sm' : 'border-blue-500 bg-blue-50 shadow-sm')
                      : (isAttendeeCancelled(item) ? 'border-rose-200 bg-rose-50/50 hover:border-rose-300 hover:bg-rose-50' : 'border-deep-navy/10 bg-white hover:border-blue-300 hover:bg-blue-50/40'),
                    !selectedAttendeeId ? 'attendee-pulse' : ''
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-black"
                      :class="selectedAttendeeId === item.id
                        ? (isAttendeeCancelled(item) ? 'border-rose-300 bg-white text-rose-700' : 'border-blue-300 bg-white text-blue-700')
                        : (isAttendeeCancelled(item) ? 'border-rose-200 bg-white text-rose-700' : 'border-deep-navy/15 bg-mist-blue text-deep-navy')"
                    >
                      <img
                        :src="`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${item.id}`"
                        alt="Default profile"
                        class="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-semibold text-deep-navy">{{ item.name || 'Unnamed attendee' }}</p>
                      <p class="mt-0.5 truncate text-[11px] font-medium text-deep-navy/60">{{ item.display_id || item.id || 'Attendee profile' }}</p>
                    </div>
                    <span v-if="isAttendeeCancelled(item)" class="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-rose-700">Cancelled</span>
                    <span v-if="selectedAttendeeId === item.id" class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700">Selected</span>
                  </div>
                </button>
              </div>
              <p v-else class="mt-3 text-sm text-deep-navy/60">No attendees found for this booking.</p>
            </section>

            <section>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Payment summary</p>
              <div class="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Total spent</p>
                    <p class="mt-2 text-3xl font-black text-deep-navy">{{ formatCurrencyAmount(spentSoFarTotal) }}</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Current amount after refunds.</p>
                  </div>
                  <span class="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700">
                    {{ completedPaymentsCount }} completed
                  </span>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-2 text-sm" v-if="refundedTotalAmount > 0">
                  <span class="font-semibold text-slate-500">Original total:</span>
                  <span class="font-black text-slate-500 line-through">{{ formatCurrencyAmount(originalSpentSoFar) }}</span>
                  <span class="font-semibold text-slate-500">Refunded:</span>
                  <span class="font-black text-rose-700">- {{ formatCurrencyAmount(refundedTotalAmount) }}</span>
                </div>

                <dl class="mt-4 grid gap-3 text-xs sm:grid-cols-1">
                  <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <dt class="font-semibold text-deep-navy/60">Booking payments</dt>
                    <dd class="mt-1 text-base font-black text-deep-navy">{{ formatCurrencyAmount(spentSoFarBooking) }}</dd>
                  </div>
                  <div class="rounded-xl border border-slate-200 bg-slate-50 p-3" v-if="spentSoFarOrders > 0">
                    <dt class="font-semibold text-deep-navy/60">Extra products</dt>
                    <dd class="mt-1 text-base font-black text-deep-navy">{{ formatCurrencyAmount(spentSoFarOrders) }}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section>
              <p class="text-xs font-black uppercase tracking-wider text-deep-navy">Quick actions</p>
              <div class="mt-3 space-y-2">
                <NuxtLink
                  v-if="!selectedAttendeeIsCancelled"
                  :to="bookingShopHref"
                  class="flex w-full items-center justify-between rounded-xl border border-emerald-300 bg-emerald-600 px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-emerald-700"
                >
                  <span class="inline-flex items-center gap-2">
                    <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5"/>
                    Open shop
                  </span>
                </NuxtLink>
                <button
                  v-else
                  type="button"
                  disabled
                  class="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-200 px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-600"
                >
                  Shop unavailable for cancelled attendee
                </button>
                <NuxtLink :to="`/events/${eventId}`" class="flex w-full items-center justify-between rounded-xl border border-deep-navy/20 bg-white px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700">
                  Back to event
                </NuxtLink>
                <button type="button" class="flex w-full items-center justify-between rounded-xl border border-deep-navy/20 bg-white px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700" @click="setActiveTab('overview')">
                  Go to overview
                </button>
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-xl border border-deep-navy/20 bg-white px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider text-deep-navy hover:border-blue-500 hover:text-blue-700 disabled:opacity-50"
                  :disabled="!selectedAttendeeId || isSingleAttendeeBooking"
                  @click="clearSelectedAttendee"
                >
                  Clear attendee selection
                </button>
              </div>
            </section>
          </article>
        </aside>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, watchEffect, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useQueryClient } from '@tanstack/vue-query'
import { bookingAttendeeFormSchema, type BookingAttendeeFormData } from '~/schemas/events/booking'
import OutstandingPaymentCarouselCard from '~/components/events/booking/OutstandingPaymentCarouselCard.vue'
import BookingOverviewTab from '~/components/events/booking/tabs/BookingOverviewTab.vue'
import AttendeeInfoTab from '~/components/events/booking/tabs/AttendeeInfoTab.vue'
import TicketsTab from '~/components/events/booking/tabs/TicketsTab.vue'
import OrdersTab from '~/components/events/booking/tabs/OrdersTab.vue'
import PaymentsTab from '~/components/events/booking/tabs/PaymentsTab.vue'
import ResourcesTab from '~/components/events/booking/tabs/ResourcesTab.vue'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { uploadMultipart } from '~/utils/upload'
import { locationsAreasList } from '~/api/sdk.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenues } from '~/composables/resources/events/eventVenues'
import {
  useEventMyBooking,
  invalidateEventMyBookingQuery,
  useEventMyPaymentSummary,
  type ApiErrorLike,
} from '~/composables/resources/events'
import { useAttendee, useUpdateAttendee } from '~/composables/resources/attendee/attendees'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { useAttendeeEmergencyContacts, useCreateAttendeeEmergencyContact, useDeleteAttendeeEmergencyContact } from '~/composables/resources/attendee/attendeeEmergencyContacts'
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
  useDeleteAttendeeConsent,
} from '~/composables/resources/attendee/attendeeConsentsRelationship'
import { useProductOrders, useCancelProductOrder } from '~/composables/resources/products/productOrders'
import { useBookingOrderDisplay } from '~/composables/booking/useBookingOrderDisplay'
import { useBookingJourneySteps, type JourneyStepAction } from '~/composables/booking/useBookingJourneySteps'
import { formatDate, formatDateTime } from '~/utils/time'

type TabId = 'overview' | 'attendee' | 'tickets' | 'orders' | 'payments' | 'resources'
type AreaOption = { label: string; value: number }
type EmergencyContactRelationship = 'parent' | 'sibling' | 'child' | 'spouse' | 'friend' | 'other'
type BookingAttendee = { id?: string; name?: string; is_cancelled?: boolean }

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
const currencySymbol = computed(() => myBookingData.value?.bookings?.[0]?.booking?.payments?.[0]?.amount?.slice(0, 1) || '£')
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
  return primaryVenue.value?.name || 'Venue to be confirmed'
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
  return Boolean(primaryVenue.value?.name || primaryVenue.value?.address || primaryVenue.value?.city)
})

const hasTimingInfo = computed(() => {
  return Boolean(eventStart.value && eventEnd.value)
})

const venueMapEmbedUrl = computed(() => {
  const address = String(primaryVenue.value?.address || '').trim()
  const city = String(primaryVenue.value?.city || '').trim()
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

const selectedAttendeeId = ref(props.initialAttendeeId || '')
const activeTab = ref<TabId>(props.initialTab || 'overview')
const applyingRouteState = ref(false)

const paymentSummary = useEventMyPaymentSummary(eventId, computed(() => {
  if (!bookingReference.value) return undefined
  return {
    booking_reference: bookingReference.value,
    attendee_id: selectedAttendeeId.value || undefined,
  }
}))

const paymentSummaryData = computed(() => paymentSummary.data.value)

const outstandingPayments = computed(() => {
  return paymentSummaryData.value?.outstanding_payments || []
})

const bookingLevelPayments = computed(() => {
  return paymentSummaryData.value?.booking_payments || []
})

const attendeeLevelPayments = computed(() => {
  return paymentSummaryData.value?.shop_payments || []
})

const isSingleAttendeeBooking = computed(() => attendees.value.length === 1)

const allSummaryPayments = computed(() => {
  const bookingItems = bookingLevelPayments.value || []
  const orderItems = paymentSummaryData.value?.shop_payments || []
  return [...bookingItems, ...orderItems]
})

function parseAmountValue(rawAmount: unknown, rawAmountValue?: unknown): number {
  const direct = Number.parseFloat(String(rawAmountValue || '').trim())
  if (Number.isFinite(direct)) return direct

  const text = String(rawAmount || '').trim()
  if (!text) return 0
  const numericPart = text.replace(/[^\d.-]/g, '')
  const value = Number.parseFloat(numericPart)
  return Number.isFinite(value) ? value : 0
}

function paymentAmountValue(payment: unknown): unknown {
  if (!payment || typeof payment !== 'object') return undefined
  return (payment as Record<string, unknown>).amount_value
}

function isCompletedPaymentStatus(status: unknown): boolean {
  const normalized = String(status || '').toUpperCase()
  return normalized === 'COMPLETED' || normalized === 'PAID' || normalized === 'PARTIALLY_REFUNDED'
}

const completedSummaryPayments = computed(() => {
  return allSummaryPayments.value.filter(payment => isCompletedPaymentStatus(payment.status))
})

function paymentMoneyAmount(payment: unknown, field: 'amount' | 'original_amount' | 'total_refunded_amount'): number {
  if (!payment || typeof payment !== 'object') return 0
  const source = payment as Record<string, unknown>
  return parseAmountValue(source[field])
}

function paymentOriginalAmount(payment: unknown): number {
  const originalAmount = paymentMoneyAmount(payment, 'original_amount')
  if (originalAmount > 0) return originalAmount
  return paymentCurrentAmount(payment) + paymentRefundedAmount(payment)
}

function paymentRefundedAmount(payment: unknown): number {
  return paymentMoneyAmount(payment, 'total_refunded_amount')
}

function paymentCurrentAmount(payment: unknown): number {
  return paymentMoneyAmount(payment, 'amount')
}

const originalSpentSoFar = computed(() => {
  return allSummaryPayments.value
    .filter(payment => isCompletedPaymentStatus(payment.status))
    .reduce((sum, payment) => sum + paymentOriginalAmount(payment), 0)
})

const refundedTotalAmount = computed(() => {
  return allSummaryPayments.value
    .reduce((sum, payment) => sum + paymentRefundedAmount(payment), 0)
})

const spentSoFarBooking = computed(() => {
  return bookingLevelPayments.value
    .filter(payment => isCompletedPaymentStatus(payment.status))
    .reduce((sum, payment) => sum + paymentCurrentAmount(payment), 0)
})

const spentSoFarOrders = computed(() => {
  const bookingOrders = (paymentSummaryData.value?.shop_payments || [])
    .filter(payment => isCompletedPaymentStatus(payment.status))
    .reduce((sum, payment) => sum + paymentCurrentAmount(payment), 0)

  const bookingCheckoutOrders = bookingLevelPayments.value
    .filter(payment => (
      (payment as any)?.related_orders as Array<Record<string, {}>>).reduce(
        (orderSum, order) => orderSum + ((order as Record<string, {}>).total_amount_value as number), 0)
      ).reduce((sum, payment) => {
    const relatedOrders = (payment as any)?.related_orders as Array<Record<string, unknown>> | undefined
    if (!relatedOrders) return sum
    const ordersAmount = relatedOrders.reduce((orderSum, order) => {
      const amount = parseAmountValue(order.total_amount_value)
      return orderSum + amount
    }, 0)
    return sum + ordersAmount
  }, 0)

  return bookingOrders + bookingCheckoutOrders
})

const spentSoFarTotal = computed(() => spentSoFarBooking.value + spentSoFarOrders.value)
const completedPaymentsCount = computed(() => completedSummaryPayments.value.length)
const briefingInfoRef = ref<HTMLElement | null>(null)
const briefingLocationRef = ref<HTMLElement | null>(null)
const briefingTimeRef = ref<HTMLElement | null>(null)

function formatCurrencyAmount(value: number): string {
  return `${currencySymbol.value}${value.toFixed(2)}`
}

function paymentContextSummary(payment: any): string {
  const relatedLabels = getRelatedOrderLabels(payment)

  if (payment?.source === 'BOOKING') {
    const count = relatedLabels.length
    return count > 0
      ? `Covers ${count} linked order${count > 1 ? 's' : ''}`
      : 'Booking-level payment'
  }

  if (payment?.source === 'SHOP_ORDER') {
    if (payment?.order_reference) return `Order ${payment.order_reference}`
    if (relatedLabels.length) return `Order ${relatedLabels[0]}`
    return 'Order payment'
  }

  return 'Payment'
}

function getRelatedOrders(payment: unknown): Array<Record<string, any>> {
  if (!payment || typeof payment !== 'object') return []
  const source = payment as Record<string, any>
  const direct = source.related_orders
  if (Array.isArray(direct)) return direct as Array<Record<string, any>>

  const metadata = source.metadata as Record<string, unknown> | undefined
  const fromMetadata = metadata?.related_orders
  if (Array.isArray(fromMetadata)) return fromMetadata as Array<Record<string, any>>

  return []
}

function orderLabel(order: Record<string, any>): string {
  return String(order?.order_reference || order?.order_id || 'Order')
}

function getRelatedOrderLabels(payment: unknown): string[] {
  if (!payment || typeof payment !== 'object') return []

  const source = payment as Record<string, any>
  const labels = new Set<string>()

  getRelatedOrders(source).forEach((order) => {
    const label = orderLabel(order).trim()
    if (label && label !== 'Order') labels.add(label)
  })

  const summaryRefs = Array.isArray(source.summary_context?.related_order_references)
    ? source.summary_context.related_order_references
    : []
  summaryRefs.forEach((ref: unknown) => {
    const label = String(ref || '').trim()
    if (label) labels.add(label)
  })

  const topLevelRefs = Array.isArray(source.related_order_references)
    ? source.related_order_references
    : []
  topLevelRefs.forEach((ref: unknown) => {
    const label = String(ref || '').trim()
    if (label) labels.add(label)
  })

  const singleOrderRef = String(source.order_reference || '').trim()
  if (singleOrderRef && source.source === 'BOOKING') {
    labels.add(singleOrderRef)
  }

  return Array.from(labels)
}

const {
  hideAllJourneyDetails,
  journeySteps,
} = useBookingJourneySteps({
  outstandingPayments,
  hasBringInfo,
  hasLocationInfo,
  hasTimingInfo,
})

watch(attendees, () => {
  if (attendees.value.length === 1) {
    const onlyAttendeeId = attendees.value[0]?.id || ''
    if (onlyAttendeeId) {
      selectedAttendeeId.value = onlyAttendeeId
    }
    return
  }

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

const tabs: Array<{ id: TabId; label: string; needsAttendee?: boolean; blockWhenCancelled?: boolean }> = [
  { id: 'overview', label: 'Booking' },
  { id: 'attendee', label: 'Attendee Info', needsAttendee: true, blockWhenCancelled: true },
  { id: 'tickets', label: 'Tickets', needsAttendee: true, blockWhenCancelled: true },
  { id: 'payments', label: 'Payments', needsAttendee: false },
  { id: 'orders', label: 'Orders', needsAttendee: true, blockWhenCancelled: true },
  { id: 'resources', label: 'Resources', needsAttendee: false },
]

const selectedAttendee = computed(() => {
  if (!selectedAttendeeId.value) return null
  return attendees.value.find(item => item.id === selectedAttendeeId.value) || null
})

function isAttendeeCancelled(attendee: BookingAttendee | null | undefined): boolean {
  return Boolean(attendee?.is_cancelled)
}

const selectedAttendeeIsCancelled = computed(() => {
  return isAttendeeCancelled(selectedAttendee.value as BookingAttendee | null)
})

function isTabDisabled(tab: { needsAttendee?: boolean; blockWhenCancelled?: boolean }): boolean {
  if (tab.needsAttendee && !selectedAttendeeId.value) return true
  if (tab.blockWhenCancelled && selectedAttendeeIsCancelled.value) return true
  return false
}

/**
 * Map tab IDs to their corresponding component and props
 */
const tabComponentMap = computed(() => ({
  overview: {
    component: BookingOverviewTab,
    props: {
      booking,
      event: event.data.value?.data,
      attendees,
      journeySteps,
      eventTitle,
      eventStart,
      eventEnd,
      eventLocation,
      eventWhatToBring,
      eventCheckInInstructions,
      venueMapEmbedUrl,
      eventVenues,
      formattedBookedAt,
      isSingleAttendeeBooking,
    },
  },
  attendee: {
    component: AttendeeInfoTab,
    props: {
      selectedAttendeeId,
      selectedAttendee,
      booking,
      isPersonalInfoEditing,
      attendeeSectionsOpen,
      attendeeForm,
      areaOptions,
      areaSearch,
      areaLookupLoading,
      emergencyContactForm,
      attendeeEmergencyContactList,
      showMedicalForm,
      showDietaryForm,
      showAccessibilityForm,
      attendeeMedicalConditions,
      attendeeDietaryRequirements,
      attendeeAccessibilityRequirements,
      attendeeConsents,
      medicalConditions,
      dietaryRequirements,
      accessibilityRequirements,
    },
  },
  tickets: {
    component: TicketsTab,
    props: {
      selectedAttendeeId,
    },
  },
  orders: {
    component: OrdersTab,
    props: {
      selectedAttendeeId,
      booking,
      attendeeOrderList,
      attendeeOrders,
    },
  },
  payments: {
    component: PaymentsTab,
    props: {
      bookingData: selectedBookingItem.value,
      selectedAttendeeId,
      outstandingPayments,
      completedSummaryPayments,
      currencySymbol,
      spentSoFarTotal,
      refundedTotalAmount,
      allSummaryPayments,
    },
  },
  resources: {
    component: ResourcesTab,
    props: {
      resources: event.data.value?.data?.resources,
    },
  },
}))

/**
 * Get the current tab component and its props
 */
const currentTabConfig = computed(() => {
  return tabComponentMap.value[activeTab.value] || tabComponentMap.value.overview
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

function attendeeInitial(name: string | undefined): string {
  const cleaned = String(name || '').trim()
  if (!cleaned) return '?'
  return cleaned.charAt(0).toUpperCase()
}

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
  if (!entry || isTabDisabled(entry)) {
    return
  }
  activeTab.value = tab
}

function selectAttendee(attendeeId: string) {
  if (!attendeeId) return
  selectedAttendeeId.value = attendeeId
  const item = attendees.value.find(entry => entry.id === attendeeId) as BookingAttendee | undefined
  // activeTab.value = isAttendeeCancelled(item) ? 'overview' : 'attendee'
}

function clearSelectedAttendee() {
  if (isSingleAttendeeBooking.value) return
  selectedAttendeeId.value = ''
  activeTab.value = 'overview'
}

async function refreshOutstandingPayments() {
  await paymentSummary.refetch()
}

function openOrderFromPayment(orderReference: string) {
  if (!orderReference) return
  activeTab.value = 'orders'
  $notyf?.success(`Switched to Orders tab for ${orderReference}.`)
}

function scrollToBriefingSection(target: 'info' | 'location' | 'time') {
  if (typeof window === 'undefined') return
  const el = target === 'info'
    ? briefingInfoRef.value
    : target === 'location'
      ? briefingLocationRef.value
      : briefingTimeRef.value
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleJourneyStepAction(action: JourneyStepAction) {
  if (action === 'shop') {
    navigateTo(bookingShopHref.value)
    return
  }

  if (action === 'info') {
    scrollToBriefingSection('info')
    return
  }

  if (action === 'location') {
    scrollToBriefingSection('location')
    return
  }

  scrollToBriefingSection('time')
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
      if (routeTab === 'overview' || routeTab === 'payments' || routeTab === 'attendee' || routeTab === 'tickets' || routeTab === 'orders') {
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

watch(
  [selectedAttendee, activeTab],
  () => {
    const restrictedTabs: TabId[] = ['attendee', 'tickets', 'orders']
    if (!selectedAttendeeIsCancelled.value) return
    if (restrictedTabs.includes(activeTab.value)) {
      activeTab.value = 'overview'
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

const {
  canCancelOrder,
  getOrderItemTitle,
  getOrderItemCode,
  getOrderItemImageUrl,
  getOrderItemSize,
  getOrderItemColor,
  getOrderItemColorStyle,
  getOrderStatusBadgeClass,
} = useBookingOrderDisplay()

const areaSearch = ref('')
const areaOptions = ref<AreaOption[]>([])
const areaLookupLoading = ref(false)
let areaSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const attendeeEmergencyContacts = useAttendeeEmergencyContacts(computed(() => selectedAttendeeId.value || ''))
const createEmergencyContact = useCreateAttendeeEmergencyContact()
const deleteEmergencyContact = useDeleteAttendeeEmergencyContact()

const attendeeEmergencyContactList = computed(() => attendeeEmergencyContacts.data.value?.data?.results || [])

const emergencyContactForm = ref({
  first_name: '',
  last_name: '',
  phone_number: '',
  email: '',
  relationship: 'parent' as EmergencyContactRelationship,
  primary_contact: true,
})

const emergencyRelationshipOptions = [
  { label: 'Parent', value: 'parent' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Child', value: 'child' },
  { label: 'Spouse', value: 'spouse' },
  { label: 'Friend', value: 'friend' },
  { label: 'Other', value: 'other' },
]

function normalizeEmergencyContactForm() {
  emergencyContactForm.value = {
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    relationship: 'parent',
    primary_contact: true,
  }
}

function applyAreaOption(option: AreaOption) {
  attendeeForm.value.area_from = option.value
  attendeeForm.value.area_from_name = option.label
  areaSearch.value = option.label
  areaOptions.value = []
}

function clearAreaFrom() {
  attendeeForm.value.area_from = undefined
  attendeeForm.value.area_from_name = ''
  areaSearch.value = ''
  areaOptions.value = []
}

async function addEmergencyContact() {
  if (!selectedAttendeeId.value) return

  const firstName = String(emergencyContactForm.value.first_name || '').trim()
  const lastName = String(emergencyContactForm.value.last_name || '').trim()
  const phoneNumber = String(emergencyContactForm.value.phone_number || '').trim()
  const email = String(emergencyContactForm.value.email || '').trim()

  if (!firstName || !lastName || !phoneNumber) {
    $notyf?.error('Emergency contact first name, last name, and phone number are required.')
    return
  }

  try {
    await createEmergencyContact.mutateAsync({
      attendeeId: selectedAttendeeId.value,
      body: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        relationship: emergencyContactForm.value.relationship,
        email: email || undefined,
        primary_contact: emergencyContactForm.value.primary_contact,
      },
    })
    normalizeEmergencyContactForm()
    $notyf?.success('Emergency contact added.')
  } catch (error) {
    console.error('Failed to add emergency contact', error)
    $notyf?.error('Could not add emergency contact.')
  }
}

async function removeEmergencyContact(contactId: number) {
  if (!selectedAttendeeId.value) return
  try {
    await deleteEmergencyContact.mutateAsync({ attendeeId: selectedAttendeeId.value, contactId })
    $notyf?.success('Emergency contact removed.')
  } catch (error) {
    console.error('Failed to remove emergency contact', error)
    $notyf?.error('Could not remove emergency contact.')
  }
}

watch(areaSearch, (term) => {
  if (areaSearchDebounceTimer) {
    clearTimeout(areaSearchDebounceTimer)
    areaSearchDebounceTimer = null
  }

  if (!isPersonalInfoEditing.value) {
    areaOptions.value = []
    areaLookupLoading.value = false
    return
  }

  const query = term.trim()
  if (query.length < 2) {
    areaOptions.value = []
    areaLookupLoading.value = false
    return
  }

  areaLookupLoading.value = true
  areaSearchDebounceTimer = setTimeout(async () => {
    try {
      const response = await locationsAreasList({
        query: {
          search: query,
          page_size: 5,
        },
      })
      areaOptions.value = (response.data?.results || []).map((area: any) => ({
        label: area.area_name,
        value: area.id,
      }))
    } catch (error) {
      console.error('Failed to search areas', error)
      areaOptions.value = []
    } finally {
      areaLookupLoading.value = false
    }
  }, 300)
})

const expandedPaymentIds = ref<string[]>([])
const paymentDetailLoading = ref<Record<string, boolean>>({})
const paymentDetails = ref<Record<string, any>>({})
const evidenceUploadPending = ref<Record<string, boolean>>({})
const evidenceUploadError = ref<Record<string, string>>({})
const evidenceUploadSuccess = ref<Record<string, string>>({})
const evidenceUploadFormVisible = ref<Record<string, boolean>>({})
const evidenceUploadForm = ref<Record<string, {
  evidence_file: File | null
  payer_name: string
  payer_account_last4: string
  amount_on_evidence: string
}>>({})

function ensureEvidenceForm(paymentId: string) {
  if (!paymentId) return
  if (!evidenceUploadForm.value[paymentId]) {
    evidenceUploadForm.value[paymentId] = {
      evidence_file: null,
      payer_name: '',
      payer_account_last4: '',
      amount_on_evidence: '',
    }
  }
}

function hasUploadedEvidence(paymentId: string): boolean {
  return !!paymentDetails.value[paymentId]?.bank_transfer_evidence?.bank_transfer_id
}

function needsEvidenceUpload(payment: any): boolean {
  const paymentId = String(payment?.payment_id || '')
  if (!paymentId || !isOutstandingBankTransfer(payment)) return false
  return !hasUploadedEvidence(paymentId)
}

function paymentAttentionCardClass(payment: any): string {
  const paymentId = String(payment?.payment_id || '')
  if (needsEvidenceUpload(payment)) return 'rounded-lg border border-red-300 bg-red-50 p-3 outstanding-attention-pulse'
  if (isOutstandingBankTransfer(payment) && hasUploadedEvidence(paymentId)) return 'rounded-lg border border-blue-300 bg-blue-50 p-3'
  return 'rounded-lg border border-blue-300 bg-blue-50/70 p-3 outstanding-attention-pulse'
}

function paymentAttentionLabel(payment: any): string {
  const paymentId = String(payment?.payment_id || '')
  if (needsEvidenceUpload(payment)) return 'Evidence required'
  if (isOutstandingBankTransfer(payment) && hasUploadedEvidence(paymentId)) return 'Pending review'
  return String(payment?.status || 'PENDING')
}

function paymentAttentionLabelClass(payment: any): string {
  const paymentId = String(payment?.payment_id || '')
  if (needsEvidenceUpload(payment)) return 'rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-700'
  if (isOutstandingBankTransfer(payment) && hasUploadedEvidence(paymentId)) return 'rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700'
  return 'rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700'
}

function toggleEvidenceUploadForm(paymentId: string) {
  if (!paymentId) return
  ensureEvidenceForm(paymentId)
  evidenceUploadFormVisible.value[paymentId] = !evidenceUploadFormVisible.value[paymentId]
}

function onEvidenceUploadFileChange(paymentId: string, event: Event) {
  ensureEvidenceForm(paymentId)
  const input = event.target as HTMLInputElement
  evidenceUploadForm.value[paymentId].evidence_file = input.files?.[0] || null
  evidenceUploadError.value[paymentId] = ''
}

async function uploadOutstandingEvidence(payment: any) {
  const paymentId = String(payment?.payment_id || '')
  if (!paymentId) return

  ensureEvidenceForm(paymentId)
  evidenceUploadError.value[paymentId] = ''
  evidenceUploadSuccess.value[paymentId] = ''

  const form = evidenceUploadForm.value[paymentId]
  if (!form.evidence_file) {
    evidenceUploadError.value[paymentId] = 'Evidence file is required.'
    return
  }

  const payerName = String(form.payer_name || '').trim()
  const payerLast4 = String(form.payer_account_last4 || '').trim()
  const amountOnEvidence = String(form.amount_on_evidence || '').trim()

  if (!payerName) {
    evidenceUploadError.value[paymentId] = 'Payer name is required.'
    return
  }
  if (!/^\d{4}$/.test(payerLast4)) {
    evidenceUploadError.value[paymentId] = 'Payer account last 4 must be exactly 4 digits.'
    return
  }
  if (!amountOnEvidence || Number(amountOnEvidence) <= 0) {
    evidenceUploadError.value[paymentId] = 'Amount on evidence must be greater than zero.'
    return
  }

  if (!paymentDetails.value[paymentId]?.id) {
    await fetchPaymentDetails(paymentId)
  }

  const paymentDbId = paymentDetails.value[paymentId]?.id
  if (!paymentDbId) {
    evidenceUploadError.value[paymentId] = 'Unable to resolve payment details for evidence upload.'
    return
  }

  const transferRef = getRequiredTransferReference(payment) || `BT-${paymentId.slice(0, 8)}-${Date.now()}`
  const formData = new FormData()
  formData.append('transfer_id', transferRef)
  formData.append('evidence_file', form.evidence_file)
  formData.append('payment', String(paymentDbId))
  formData.append('payer_name', payerName)
  formData.append('payer_account_last4', payerLast4)
  formData.append('amount_on_evidence', amountOnEvidence)

  evidenceUploadPending.value[paymentId] = true
  try {
    await uploadMultipart('/api/payments/bank-transfer-evidence/', formData, { method: 'POST' })
    evidenceUploadSuccess.value[paymentId] = 'Evidence uploaded. Awaiting verification.'
    evidenceUploadFormVisible.value[paymentId] = false
    evidenceUploadForm.value[paymentId] = {
      evidence_file: null,
      payer_name: '',
      payer_account_last4: '',
      amount_on_evidence: '',
    }
    await fetchPaymentDetails(paymentId)
    await paymentSummary.refetch()
    $notyf?.success('Evidence uploaded. Payment is now pending review.')
  } catch (error) {
    const payload = (error as any)?.data || (error as any)?.response?._data || (error as any)?.response?.data
    if (typeof payload === 'string' && payload) {
      evidenceUploadError.value[paymentId] = payload
    } else if (payload && typeof payload === 'object') {
      const firstValue = Object.values(payload)[0] as any
      if (Array.isArray(firstValue) && firstValue[0]) {
        evidenceUploadError.value[paymentId] = String(firstValue[0])
      } else if (typeof firstValue === 'string') {
        evidenceUploadError.value[paymentId] = firstValue
      } else {
        evidenceUploadError.value[paymentId] = 'Could not upload evidence.'
      }
    } else {
      evidenceUploadError.value[paymentId] = 'Could not upload evidence.'
    }
  } finally {
    evidenceUploadPending.value[paymentId] = false
  }
}

function isPaymentExpanded(paymentId: string): boolean {
  if (!paymentId) return false
  return expandedPaymentIds.value.includes(paymentId)
}

async function fetchPaymentDetails(paymentId: string) {
  if (!paymentId || paymentDetails.value[paymentId] || paymentDetailLoading.value[paymentId]) return

  paymentDetailLoading.value[paymentId] = true
  try {
    const paymentData = await requestFetch(`/api/payments/list/${paymentId}/`)
    paymentDetails.value[paymentId] = paymentData
  } catch (error) {
    console.error('Failed to fetch payment detail', error)
    $notyf?.error('Could not load payment method details.')
  } finally {
    paymentDetailLoading.value[paymentId] = false
  }
}

watch(
  outstandingPayments,
  (payments) => {
    payments.forEach((payment: any) => {
      const paymentId = String(payment?.payment_id || '')
      if (!paymentId || !isOutstandingBankTransfer(payment)) return
      ensureEvidenceForm(paymentId)
      if (!paymentDetails.value[paymentId] && !paymentDetailLoading.value[paymentId]) {
        void fetchPaymentDetails(paymentId)
      }
    })
  },
  { immediate: true }
)

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
  const type = String(payment?.method_type || payment?.metadata?.method_type || '').toUpperCase().replace(/-/g, '_')
  const title = String(payment?.method_title || payment?.metadata?.method_title || '').toUpperCase()
  return (type === 'BANK_TRANSFER' || title.includes('BANK TRANSFER')) && String(payment?.status || '').toUpperCase() === 'PENDING'
}

function getProvidedDetail(payment: any, key: 'account_name' | 'sort_code' | 'account_number'): string | null {
  const provided = (
    payment?.provided_details ||
    payment?.metadata?.provided_details ||
    payment?.metadata ||
    {}
  ) as Record<string, any>
  const value = provided?.[key]
  if (value === undefined || value === null || value === '') return null
  return String(value)
}

function getRequiredTransferReference(payment: any): string | null {
  const provided = (
    payment?.provided_details ||
    payment?.metadata?.provided_details ||
    payment?.metadata ||
    {}
  ) as Record<string, any>
  const direct = payment?.bank_reference || payment?.metadata?.bank_reference || provided?.bank_reference
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

function hasSummaryBankMetadata(payment: any): boolean {
  return Boolean(
    getProvidedDetail(payment, 'account_name') ||
    getProvidedDetail(payment, 'sort_code') ||
    getProvidedDetail(payment, 'account_number') ||
    getRequiredTransferReference(payment)
  )
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

const attendeeForm = ref<BookingAttendeeFormData>({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  gender: '',
  relationship_to_user: 'self',
  area_from: undefined,
  area_from_name: '',
})

const attendeeSectionsOpen = ref({
  personal: false,
  safeguarding: false,
  consents: false,
})

const isPersonalInfoEditing = ref(false)

const personalInfoBaseline = ref<BookingAttendeeFormData>({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  gender: '',
  relationship_to_user: 'self',
  area_from: undefined,
  area_from_name: '',
})

function attendeeFormSnapshot(): BookingAttendeeFormData {
  return {
    first_name: attendeeForm.value.first_name || '',
    last_name: attendeeForm.value.last_name || '',
    email: attendeeForm.value.email || '',
    phone_number: attendeeForm.value.phone_number || '',
    date_of_birth: attendeeForm.value.date_of_birth || '',
    gender: attendeeForm.value.gender || '',
    relationship_to_user: attendeeForm.value.relationship_to_user || 'self',
    area_from: attendeeForm.value.area_from,
    area_from_name: attendeeForm.value.area_from_name || '',
  }
}

const hasPersonalInfoChanges = computed(() => {
  const current = attendeeFormSnapshot()
  const baseline = personalInfoBaseline.value
  return (
    current.first_name !== baseline.first_name ||
    current.last_name !== baseline.last_name ||
    current.email !== baseline.email ||
    current.phone_number !== baseline.phone_number ||
    current.date_of_birth !== baseline.date_of_birth ||
    current.gender !== baseline.gender ||
    current.relationship_to_user !== baseline.relationship_to_user ||
    current.area_from !== baseline.area_from ||
    current.area_from_name !== baseline.area_from_name
  )
})

function toggleAttendeeSection(section: 'personal' | 'safeguarding' | 'consents') {
  attendeeSectionsOpen.value[section] = !attendeeSectionsOpen.value[section]
}

function discardPersonalInfoChanges() {
  attendeeForm.value = {
    ...personalInfoBaseline.value,
  }
  areaSearch.value = personalInfoBaseline.value.area_from_name || ''
  areaOptions.value = []
  isPersonalInfoEditing.value = false
}

function togglePersonalInfoEdit() {
  if (isPersonalInfoEditing.value && hasPersonalInfoChanges.value) {
    discardPersonalInfoChanges()
    return
  }
  isPersonalInfoEditing.value = !isPersonalInfoEditing.value
}

function setAreaSearch(value: string) {
  areaSearch.value = value
}

function toggleJourneyDetails() {
  hideAllJourneyDetails.value = !hideAllJourneyDetails.value
}

function toggleMedicalForm() {
  showMedicalForm.value = !showMedicalForm.value
}

function toggleDietaryForm() {
  showDietaryForm.value = !showDietaryForm.value
}

function toggleAccessibilityForm() {
  showAccessibilityForm.value = !showAccessibilityForm.value
}

const {
  errors: attendeeValidationErrors,
  validate: validateAttendeeForm,
  validateField: validateAttendeeField,
  resetForm: resetAttendeeForm,
  setValues: setAttendeeFormValues,
} = useForm({
  validationSchema: toTypedSchema(bookingAttendeeFormSchema),
  initialValues: {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    relationship_to_user: '',
    area_from: undefined,
    area_from_name: '',
  },
})

watch(
  attendeeForm,
  (value) => {
    setAttendeeFormValues({ ...value })
  },
  { deep: true },
)

watch(
  () => attendeeForm.value.phone_number,
  () => {
    if (!isPersonalInfoEditing.value) return
    void validateAttendeeField('phone_number')
  },
)

watch(
  () => attendeeForm.value.date_of_birth,
  () => {
    if (!isPersonalInfoEditing.value) return
    void validateAttendeeField('date_of_birth')
  },
)

const showMedicalForm = ref(false)
const showDietaryForm = ref(false)
const showAccessibilityForm = ref(false)

watch(selectedAttendeeId, () => {
  isPersonalInfoEditing.value = false
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
      relationship_to_user: (value.relationship_to_user as BookingAttendeeFormData['relationship_to_user']) || '',
      area_from: value.area_from || undefined,
      area_from_name: value.area_from_name || '',
    }
    personalInfoBaseline.value = {
      ...attendeeForm.value,
    }
    isPersonalInfoEditing.value = false
    areaSearch.value = value.area_from_name || ''
    areaOptions.value = []
    normalizeEmergencyContactForm()
    resetAttendeeForm({
      values: {
        first_name: attendeeForm.value.first_name,
        last_name: attendeeForm.value.last_name,
        email: attendeeForm.value.email,
        phone_number: attendeeForm.value.phone_number,
        date_of_birth: attendeeForm.value.date_of_birth,
        gender: attendeeForm.value.gender,
        relationship_to_user: attendeeForm.value.relationship_to_user || undefined,
        area_from: attendeeForm.value.area_from || undefined,
        area_from_name: attendeeForm.value.area_from_name,
      },
    })
  },
  { immediate: true },
)

async function saveAttendee() {
  if (!selectedAttendeeId.value) return
  const validation = await validateAttendeeForm()
  if (!validation.valid) {
    $notyf?.error('Please complete the required attendee fields.')
    return
  }
  try {
    await updateAttendee.mutateAsync({
      attendeeId: selectedAttendeeId.value,
      body: {
        first_name: attendeeForm.value.first_name,
        last_name: attendeeForm.value.last_name,
        email: attendeeForm.value.email || null,
        phone_number: attendeeForm.value.phone_number || null,
        date_of_birth: attendeeForm.value.date_of_birth,
        gender: attendeeForm.value.gender,
        relationship_to_user: attendeeForm.value.relationship_to_user || undefined,
        area_from: attendeeForm.value.area_from,
      },
    })
    await invalidateEventMyBookingQuery(queryClient, eventId.value)
    personalInfoBaseline.value = {
      ...attendeeFormSnapshot(),
    }
    isPersonalInfoEditing.value = false
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
const deleteConsent = useDeleteAttendeeConsent()

const attendeeConsentRecords = computed(() => attendeeConsents.data.value?.data?.results || [])

function getAttendeeConsentRecord(consentId: number) {
  return attendeeConsentRecords.value.find((item: any) => item.consent_details?.id === consentId) || null
}

function isConsentLinked(consentId: number): boolean {
  return !!getAttendeeConsentRecord(consentId)
}

function consentToggleLabel(consentId: number): string {
  const record = getAttendeeConsentRecord(consentId)
  if (!record) return 'Not linked'
  return record.consent_given ? 'Linked' : 'Linked, not confirmed'
}

async function toggleConsentLink(consentId: number, checked: boolean) {
  if (!selectedAttendeeId.value) return

  const existing = getAttendeeConsentRecord(consentId)

  try {
    if (checked && !existing) {
      await createConsent.mutateAsync({
        attendeeId: selectedAttendeeId.value,
        body: {
          consent: consentId,
          consent_given: true,
        },
      })
      $notyf?.success('Consent linked.')
      return
    }

    if (!checked && existing) {
      await deleteConsent.mutateAsync({ attendeeId: selectedAttendeeId.value, consentId: existing.id })
      $notyf?.success('Consent removed.')
    }
  } catch (error) {
    console.error('Failed to update consent link', error)
    $notyf?.error('Could not update consent.')
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
  if (areaSearchDebounceTimer) {
    clearTimeout(areaSearchDebounceTimer)
    areaSearchDebounceTimer = null
  }
})

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
