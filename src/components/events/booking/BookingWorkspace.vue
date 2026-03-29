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
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">Booking workspace</p>
            <h1 class="mt-3 text-4xl md:text-5xl font-black leading-tight text-white">{{ eventTitle }}</h1>
            <p class="mt-2 text-white/80 text-sm">Reference {{ booking?.booking_reference || '-' }}</p>
            <p class="mt-1 text-white/70 text-sm">Owner {{ booking?.made_by_name || 'Unknown' }}</p>
          </div>

          <div class="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 text-white">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Event countdown</p>
            <div v-if="hasStarted" class="mt-4">
              <p class="text-2xl font-black">Event started</p>
              <p class="text-xs text-white/75 mt-1">{{ formatEventDate(eventStart) }}</p>
            </div>
            <div v-else class="mt-4 grid grid-cols-4 gap-3 text-center">
              <div>
                <p class="text-2xl font-black">{{ countdown.days }}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/60">Days</p>
              </div>
              <div>
                <p class="text-2xl font-black">{{ countdown.hours }}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/60">Hours</p>
              </div>
              <div>
                <p class="text-2xl font-black">{{ countdown.minutes }}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/60">Mins</p>
              </div>
              <div>
                <p class="text-2xl font-black">{{ countdown.seconds }}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/60">Secs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-screen-xl mx-auto px-6 py-8">
      <div v-if="myBooking.isLoading.value" class="rounded-2xl bg-white border border-deep-navy/10 p-6 text-sm text-deep-navy/70">
        Loading booking details...
      </div>

      <div v-else-if="myBooking.error.value && !isNotFound" class="rounded-2xl bg-red-50 border border-red-200 p-6 text-sm text-red-700">
        Unable to load booking details right now.
      </div>

      <div v-else-if="booking" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section class="lg:col-span-8 space-y-4">
          <article class="bg-white border border-deep-navy/10 rounded-2xl p-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                :disabled="tab.needsAttendee && !selectedAttendeeId"
                @click="setActiveTab(tab.id)"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                  activeTab === tab.id ? 'bg-deep-navy text-white' : 'bg-mist-blue text-deep-navy',
                  tab.needsAttendee && !selectedAttendeeId ? 'opacity-45 cursor-not-allowed' : 'hover:bg-blue-100'
                ]"
              >
                {{ tab.label }}
              </button>
            </div>
          </article>

          <article v-if="activeTab === 'overview'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
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
                </dl>
              </div>

              <div class="rounded-xl border border-deep-navy/10 p-4">
                <p class="text-xs uppercase tracking-wider text-deep-navy/55 font-black">Access status</p>
                <p class="mt-3 text-sm" :class="canManageAllAttendees ? 'text-green-700' : 'text-amber-700'">
                  {{ canManageAllAttendees ? 'You can fully manage attendees for this booking.' : 'You have limited attendee management access.' }}
                </p>
                <p class="mt-2 text-xs text-deep-navy/65">
                  {{ attendees.length > 1 ? 'This booking contains multiple attendees.' : 'This booking contains a single attendee.' }}
                </p>
              </div>
            </div>

            <div class="rounded-xl border border-deep-navy/10 p-4">
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs uppercase tracking-wider text-deep-navy/55 font-black">Attendees</p>
                <p class="text-xs text-deep-navy/60">Select to open tabs</p>
              </div>
              <div v-if="attendees.length" class="space-y-2">
                <button
                  v-for="item in attendees"
                  :key="item.id || item.display_id"
                  type="button"
                  @click="selectAttendee(item.id || '')"
                  class="w-full text-left rounded-lg border px-3 py-3 transition-all"
                  :class="selectedAttendeeId === item.id ? 'border-blue-500 bg-blue-50' : 'border-deep-navy/10 bg-white hover:border-blue-300'"
                >
                  <p class="text-sm font-semibold text-deep-navy">{{ item.name || 'Unnamed attendee' }}</p>
                  <p class="text-xs text-deep-navy/55">{{ item.display_id || item.id || 'No identifier' }}</p>
                </button>
              </div>
              <p v-else class="text-sm text-deep-navy/60">No attendees found for this booking.</p>
            </div>
          </article>

          <article v-if="activeTab === 'attendee'" class="bg-white border border-deep-navy/10 rounded-2xl p-5">
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

          <article v-if="activeTab === 'health'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-6">
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

          <article v-if="activeTab === 'consents'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-4">
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

          <article v-if="activeTab === 'family'" class="bg-white border border-deep-navy/10 rounded-2xl p-5 space-y-6">
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
                <div v-for="item in outstandingPayments" :key="item.payment_id || item.payment_reference" class="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p class="text-xs font-black text-blue-800">{{ item.payment_reference || 'Payment' }}</p>
                  <p class="text-sm font-semibold text-deep-navy">{{ item.amount || '-' }}</p>
                  <p class="text-xs text-blue-700">{{ item.status || 'PENDING' }}</p>
                </div>
              </div>
              <p v-else class="mt-3 text-sm text-deep-navy/60">No outstanding payments.</p>
            </section>
          </article>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, watchEffect, computed } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { useEvent } from '~/composables/resources/events/events'
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
import { useGuardians, useCreateGuardian, useDeleteGuardian } from '~/composables/resources/common/guardians'
import { useFamilyAttendees, useCreateFamilyAttendee, useDeleteFamilyAttendee } from '~/composables/resources/common/familyAttendees'
import { useFamilyGroups, useCreateFamilyGroup } from '~/composables/resources/common/familyGroups'

type RelationshipType = 'self' | 'spouse' | 'child' | 'friend' | 'parent' | 'sibling' | 'other' | ''
type TabId = 'overview' | 'attendee' | 'health' | 'consents' | 'family'

const props = defineProps<{
  eventId: string
  bookingReference: string
  initialAttendeeId?: string
  initialTab?: TabId
}>()

const { $notyf } = useNuxtApp()
const queryClient = useQueryClient()
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
]

const selectedAttendee = computed(() => {
  if (!selectedAttendeeId.value) return null
  return attendees.value.find(item => item.id === selectedAttendeeId.value) || null
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
      if (routeTab === 'overview' || routeTab === 'attendee' || routeTab === 'health' || routeTab === 'consents' || routeTab === 'family') {
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
      }
    } finally {
      applyingRouteState.value = false
    }
  },
  { immediate: true, deep: true },
)

const attendee = useAttendee(computed(() => selectedAttendeeId.value || ''))
const updateAttendee = useUpdateAttendee()

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
