<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="isLoading" class="w-full">
      <USkeleton class="h-screen w-full" />
    </div>

    <!-- Event Content -->
    <div v-else-if="event">
      <!-- Full-Width Hero Section with Landing Image -->
      <div class="relative h-[450px] md:h-[550px] w-full overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img
            v-if="event.main_landing_image?.image"
            :src="resolveImageUrl(event.main_landing_image.image)"
            :alt="event.title"
            class="w-full h-full object-cover"
            @error="(e) => onImageError(e)"
          />
          <!-- Placeholder gradient when no image -->
          <div v-else class="w-full h-full bg-gradient-to-br from-blue-400/20 to-deep-navy"></div>
        </div>
        
        <!-- Navy overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/30 to-transparent"></div>
        
        <!-- Content Overlay -->
        <div class="absolute inset-0 flex items-end">
          <div class="w-full max-container-fluid pb-16">
            <!-- Event Badge -->
            <span class="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-black rounded-full mb-4 uppercase tracking-[0.3em]">
              {{ event.event_type_details?.title || 'Event' }}
            </span>

            <!-- Main Title -->
            <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-2xl leading-[0.9] tracking-tighter mb-6 uppercase">
              {{ event.title }}
            </h1>

            <!-- Description -->
            <p v-if="event.short_description" class="text-xl md:text-2xl text-white/90 font-medium max-w-3xl leading-relaxed">
              {{ event.short_description }}
            </p>
          </div>
        </div>

        <!-- Back button overlay -->
        <!-- <div class="absolute top-6 left-6">
          <button
            @click="navigateTo('/events')"
            class="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:inline">Back to Events</span>
          </button>
        </div> -->
      </div>

      <!-- Sticky Floating Info Bar -->
      <div class="relative z-20 bg-white border-b border-deep-navy/10 shadow-lg">
        <div class="max-container-fluid">
          <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-deep-navy/10">
            <!-- Date -->
            <div class="flex items-center gap-4 p-6">
              <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50 mb-1">Date</p>
                <p class="font-black text-deep-navy truncate">{{ formatDate(event.start_datetime, 'MMM d, yyyy') }} - {{ formatDate(event.end_datetime, 'MMM d, yyyy') }}</p>
              </div>
            </div>

            <!-- Time -->
            <div class="flex items-center gap-4 p-6">
              <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50 mb-1">Event Start Time</p>
                <p class="font-black text-deep-navy truncate">
                  {{ formatTime(event.start_datetime, event.timezone) }}
                </p>
              </div>
            </div>

            <!-- Location -->
            <div class="flex items-center gap-4 p-6">
              <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50 mb-1">Location</p>
                <p class="font-black text-deep-navy truncate">
                  {{ primaryVenue?.venue_name || event.organisation_name || 'TBA' }}
                </p>
              </div>
            </div>

            <!-- Cost -->
            <div class="flex items-center gap-4 p-6">
              <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-wider text-deep-navy/50 mb-1">Cost</p>
                <p class="font-black text-deep-navy truncate">
                  {{ event.general_price }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Container -->
      <div class="max-container-fluid py-12 mb-20">

        <!-- Content Grid: 2/3 Main + 1/3 Sidebar -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content (2/3) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Theme & Verse -->
            <div v-if="event.theme || event.anchor_verse" class="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8 shadow-drawn">
              <h3 v-if="event.theme" class="text-2xl font-black text-blue-600 mb-4 uppercase tracking-tight">
                Theme: {{ event.theme }}
              </h3>
              <blockquote v-if="event.anchor_verse" class="border-l-4 border-blue-500 pl-6 italic text-deep-navy/90 text-lg leading-relaxed">
                "{{ event.anchor_verse }}"
              </blockquote>
            </div>
            <!-- About Section -->
            <div class="bg-white border border-deep-navy/10 rounded-2xl p-8 shadow-drawn">
              <h2 class="text-2xl font-black text-deep-navy mb-6 flex items-center gap-3 uppercase tracking-tight">
                <div class="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                About the Event
              </h2>
              <div class="text-deep-navy/80 text-base leading-relaxed whitespace-pre-line">
                {{ event.long_description || event.short_description || 'No description available.' }}
              </div>
            </div>

            

            <!-- What to Bring & Important Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- What to Bring -->
              <div v-if="event.what_to_bring" class="bg-white border border-deep-navy/10 rounded-2xl p-8 shadow-drawn">
                <h2 class="text-xl font-black text-deep-navy mb-6 flex items-center gap-3 uppercase tracking-tight">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  What to Bring
                </h2>
                <p class="text-deep-navy/70 whitespace-pre-line leading-relaxed">{{ event.what_to_bring }}</p>
              </div>

              <!-- Important Information -->
              <div v-if="event.important_information" class="bg-amber-50 border border-amber-200 rounded-2xl p-8 shadow-drawn">
                <h2 class="text-xl font-black text-amber-600 mb-6 flex items-center gap-3 uppercase tracking-tight">
                  <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Important Info
                </h2>
                <p class="text-amber-900/80 whitespace-pre-line leading-relaxed">{{ event.important_information }}</p>
              </div>
            </div>

            <!-- Venue Location -->
            <div v-if="primaryVenue" class="bg-white border border-deep-navy/10 rounded-2xl overflow-hidden shadow-drawn">
              <div class="p-8">
                <h2 class="text-xl font-black text-deep-navy mb-6 flex items-center gap-3 uppercase tracking-tight">
                  <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Venue Location
                </h2>
                <div class="space-y-2">
                  <h3 class="text-xl font-black text-deep-navy">{{ primaryVenue.venue_name }}</h3>
                  <p v-if="primaryVenue.venue_address" class="text-deep-navy/60 text-sm">{{ primaryVenue.venue_address }}</p>
                  <p v-if="primaryVenue.venue_city" class="text-deep-navy/60 text-sm">{{ primaryVenue.venue_city }}</p>
                </div>
              </div>
              
              <!-- Map Section -->
              <div v-if="primaryVenue.venue_address" class="h-64 bg-mist-blue relative border-t border-deep-navy/10">
                <iframe
                  :src="`https://maps.google.com/maps?q=${encodeURIComponent(primaryVenue.venue_address + ' ' + (primaryVenue.venue_city || ''))}&output=embed`"
                  class="w-full h-full border-0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>

          <!-- Sidebar (1/3) -->
          <div class="space-y-6">
            <!-- Countdown Timer Card -->
            <div class="space-y-6">
              <div class="rounded-2xl bg-deep-navy p-8 text-white shadow-drawn-dark border-2 border-deep-navy">
                <p class="text-sm font-bold text-center text-white/80 mb-4">
                  <span v-if="!countdown.isExpired">{{ countdownDisplay.statusText }}</span>
                  <span v-else>{{ countdownDisplay.expiredLabel }}</span>
                </p>
                
                <!-- Countdown Display -->
                <div v-if="!countdown.isExpired" class="flex items-center justify-center gap-6">
                  <div class="text-center">
                    <p class="text-4xl font-black">{{ String(countdown.days).padStart(2, '0') }}</p>
                    <p class="text-[9px] font-black uppercase tracking-widest text-white/40">Days</p>
                  </div>
                  <div class="w-px h-8 bg-white/10"></div>
                  <div class="text-center">
                    <p class="text-4xl font-black">{{ String(countdown.hours).padStart(2, '0') }}</p>
                    <p class="text-[9px] font-black uppercase tracking-widest text-white/40">Hrs</p>
                  </div>
                  <div class="w-px h-8 bg-white/10"></div>
                  <div class="text-center">
                    <p class="text-4xl font-black">{{ String(countdown.minutes).padStart(2, '0') }}</p>
                    <p class="text-[9px] font-black uppercase tracking-widest text-white/40">Mins</p>
                  </div>
                  <div class="w-px h-8 bg-white/10"></div>
                  <div class="text-center">
                    <p class="text-4xl font-black animate-pulse">{{ String(countdown.seconds).padStart(2, '0') }}</p>
                    <p class="text-[9px] font-black uppercase tracking-widest text-white/40">Secs</p>
                  </div>
                </div>
                
                <h2 v-if="countdown.isExpired" class="text-3xl font-black text-center">
                  {{ countdownDisplay.expiredHeadline }}
                </h2>
              </div>

              <!-- Registration Card -->
              <div class="bg-white border border-deep-navy/10 rounded-2xl p-8 shadow-drawn">
                <!-- Registration Button -->
                <button
                  :disabled="countdown.isExpired || !countdownDisplay.isOpen || !event.can_participants_register || isPreview"
                  class="w-full bg-deep-navy hover:bg-deep-navy/90 text-white py-5 rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-xl hover:translate-y-[-2px] flex items-center justify-center gap-3 border-2 border-deep-navy disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  @click="openRegistrationModal"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  {{ countdown.isExpired ? 'Registration Closed' : 'Register Now' }}
                </button>

                <NuxtLink
                  v-if="bookingData?.bookings && bookingData.bookings.length > 0 && !isPreview"
                  :href="`/events/${event.url_safe_title}/b`"
                  class="w-full mt-4 bg-navy-600 hover:bg-deep-navy/90 text-white py-5 rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-xl hover:translate-y-[-2px] flex items-center justify-center gap-3 border-2 border-deep-navy disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  View my bookings
                </NuxtLink>

                <!-- Capacity Status -->
                <div v-if="event.maximum_attendance && !countdown.isExpired" class="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div class="flex justify-between items-center text-xs font-black mb-3">
                    <span class="text-deep-navy uppercase tracking-wider">Capacity Status</span>
                    <span class="text-blue-600">{{ event.maximum_attendance - event.number_of_attendees }} Spots Left</span>
                  </div>
                  <div class="w-full bg-deep-navy/5 h-3 rounded-full overflow-hidden border border-deep-navy/10">
                    <div 
                      class="bg-blue-500 h-full rounded-full transition-all"
                      :style="{ width: `${(event.number_of_attendees / event.maximum_attendance) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="bg-white border border-deep-navy/10 rounded-2xl p-6 shadow-drawn space-y-3">
                <p class="text-xs font-black uppercase tracking-widest mb-4 text-deep-navy/40">Quick Actions</p>
                <button class="w-full flex items-center justify-center gap-2 py-3 border-2 border-deep-navy text-deep-navy rounded-xl hover:bg-deep-navy hover:text-white transition-all font-black text-sm uppercase tracking-wider">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Add to Calendar
                </button>
                <button class="w-full flex items-center justify-center gap-2 py-3 border-2 border-deep-navy text-deep-navy rounded-xl hover:bg-deep-navy hover:text-white transition-all font-black text-sm uppercase tracking-wider">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Event
                </button>
              </div>

              <!-- Status Badge -->
              <div class="bg-white border border-deep-navy/10 rounded-2xl p-5 shadow-drawn">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-black text-deep-navy/60 uppercase text-[10px] tracking-wider">Event Status</span>
                  <span 
                    :class="getStatusClass(event.status)" 
                    class="text-[10px] px-3 py-1.5 font-black uppercase rounded-full"
                  >
                    {{ event.status_display }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="min-h-screen flex items-center justify-center bg-white px-4">
      <div class="text-center max-w-md">
        <svg class="mx-auto w-20 h-20 text-red-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-2xl font-black text-deep-navy mb-3 uppercase tracking-tight">Failed to load event</h3>
        <p class="text-deep-navy/60 mb-8">Please try again later.</p>
        <button
          @click="navigateTo('/events')"
          class="bg-deep-navy text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-deep-navy/90 transition-all"
        >
          Browse Events
        </button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="min-h-screen flex items-center justify-center bg-white px-4">
      <div class="text-center max-w-md">
        <svg class="mx-auto w-20 h-20 text-deep-navy/40 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-2xl font-black text-deep-navy mb-3 uppercase tracking-tight">Event not found</h3>
        <p class="text-deep-navy/60 mb-8">The event you're looking for doesn't exist or has been removed.</p>
        <button
          @click="navigateTo('/events')"
          class="bg-deep-navy text-white px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-deep-navy/90 transition-all"
        >
          Browse Events
        </button>
      </div>
    </div>
  </div>
  <!-- Booking Intent Wait Screen Modal -->
  <UModal v-model="showWaitScreen" :prevent-close="isCreatingIntent" :ui="{ width: 'sm:max-w-lg' }">
    <div class="p-8 space-y-6">
      <div v-if="isCreatingIntent" class="text-center space-y-4">
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-navy"></div>
        </div>
        <div>
          <h3 class="text-lg font-black text-deep-navy uppercase tracking-widest">Reserving Your Space</h3>
          <p class="text-sm text-deep-navy/60 mt-2">
            We're creating your booking intent and reserving {{ calculatedTicketCount }} {{ calculatedTicketCount === 1 ? 'spot' : 'spots' }}...
          </p>
        </div>
      </div>

      <div v-else-if="intentCreationError" class="text-center space-y-4">
        <div class="flex justify-center">
          <div class="rounded-full bg-red-100 p-3">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-black text-red-600 uppercase tracking-widest">Reservation Failed</h3>
          <p class="text-sm text-red-600/70 mt-2">{{ intentCreationError }}</p>
        </div>
        <div class="flex items-center justify-end gap-3 pt-4">
          <UButton color="primary" @click="closeWaitScreen">Try Again</UButton>
        </div>
      </div>

      <div v-else class="text-center space-y-4">
        <div class="flex justify-center">
          <div class="rounded-full bg-emerald-100 p-3">
            <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-black text-emerald-600 uppercase tracking-widest">Space Reserved!</h3>
          <p class="text-sm text-emerald-600/70 mt-2">{{ calculatedTicketCount }} {{ calculatedTicketCount === 1 ? 'spot has' : 'spots have' }} been reserved for 20 minutes.</p>
        </div>
      </div>
    </div>
  </UModal>

  <!-- Registration Options Modal -->  <UModal v-model="showRegistrationModal" :ui="{ width: 'sm:max-w-lg' }">
    <div class="p-6 space-y-6">
      <div>
        <h3 class="text-lg font-black text-deep-navy uppercase tracking-widest">Start Registration</h3>
        <p class="text-sm text-deep-navy/60 mt-2">
      Tell us who is being registered so we can start with the right flow.
        </p>
      </div>

      <div class="space-y-4">
    <div class="rounded-xl border border-deep-navy/10 p-4">
      <p class="text-sm font-black text-deep-navy uppercase tracking-widest">Will you as registrar be attending?</p>
      <p class="text-xs text-deep-navy/60 mt-1">If yes, your registration is included automatically.</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="selectRegistrarAttendance(true)"
          class="rounded-lg border px-3 py-2 text-sm font-bold transition-colors"
          :class="registrarAttending ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-deep-navy/15 bg-white text-deep-navy/70 hover:bg-deep-navy/5'"
        >
          Yes
        </button>
        <button
          type="button"
          @click="selectRegistrarAttendance(false)"
          class="rounded-lg border px-3 py-2 text-sm font-bold transition-colors"
          :class="!registrarAttending ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-deep-navy/15 bg-white text-deep-navy/70 hover:bg-deep-navy/5'"
        >
          No
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-deep-navy/10 p-4">
      <p class="text-sm font-black text-deep-navy uppercase tracking-widest">Are you registering other people?</p>
      <p class="text-xs text-deep-navy/60 mt-1">Enable this to include family or friends in this booking.</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="selectRegisteringOthers(true)"
          :disabled="!registrarAttending"
          class="rounded-lg border px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :class="registeringOthers ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-deep-navy/15 bg-white text-deep-navy/70 hover:bg-deep-navy/5'"
        >
          Yes
        </button>
        <button
          type="button"
          @click="selectRegisteringOthers(false)"
          :disabled="!registrarAttending"
          class="rounded-lg border px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :class="!registeringOthers ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-deep-navy/15 bg-white text-deep-navy/70 hover:bg-deep-navy/5'"
        >
          No
        </button>
      </div>
    </div>

    <div v-if="registeringOthers || !registrarAttending">
      <label class="block text-xs font-black uppercase tracking-widest text-deep-navy/60 mb-2">
      {{ registrarAttending ? 'How many additional attendees?' : 'How many attendees are you registering?' }}
      </label>
      <input
      v-model.number="otherAttendeeCount"
      type="number"
      :max="getMaxRegistrationBooking()"
      :min="registrarAttending ? 1 : 1"
      class="w-full rounded-xl border border-deep-navy/20 bg-white px-4 py-3 text-sm text-deep-navy focus:border-deep-navy focus:outline-none focus:ring-2 focus:ring-deep-navy/20"
      />
    </div>

    <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Registration summary</p>
      <p class="mt-2 text-sm font-bold text-deep-navy">Total attendee slots: {{ calculatedTicketCount }}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3">
        <UButton color="gray" variant="ghost" @click="showRegistrationModal = false">Cancel</UButton>
        <UButton color="primary" @click="startRegistration">Continue</UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '#ui/composables/useToast'
import { useEvent } from '~/composables/resources/events/events'
import { useEventVenues } from '~/composables/resources/events/eventVenues'
import { useCreateBookingIntent } from '~/composables/resources/booking/bookingIntents'
import { useEventMyBooking } from '~/composables/resources/events'
import { useRegistrationStore } from '~/stores/registration'
import { formatDate, useCountdown, formatTime } from '~/utils/time'
import { resolveImageUrl, onImageError } from '~/utils/image'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const eventId = computed(() => String(route.params.id))



// Fetch event details
const { data, isLoading, isError } = useEvent(eventId)
const event = computed(() => data.value?.data)

// Fetch event venues
const { data: venuesData } = useEventVenues(computed(() => ({
  event: eventId.value,
})))
const eventVenues = computed(() => venuesData.value?.data?.results || [])
const primaryVenue = computed(() => eventVenues.value[0])

const countdownTicker = ref(Date.now())
let countdownTickerId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  countdownTickerId = setInterval(() => {
    countdownTicker.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (countdownTickerId) {
    clearInterval(countdownTickerId)
    countdownTickerId = null
  }
})

const { data: bookingData } = useEventMyBooking(eventId)
const userBookings = computed(() => bookingData.value?.bookings)

// Registration modal state
const showRegistrationModal = ref(false)
const registrarAttending = ref(true)
const registeringOthers = ref(false)
const otherAttendeeCount = ref(1)

const getMaxRegistrationBooking = () => {
    if (registrarAttending.value && registeringOthers.value) {
      return (event.value?.settings.max_attendees_per_booking || 1) - 1
    }
    return event.value?.settings.max_attendees_per_booking || 1
}

const isPreview = ref(false)

onMounted(() => {
  if (route.query.view === 'preview') {
    isPreview.value = true
  }
})

// Booking intent creation state
const showWaitScreen = ref(false)
const isCreatingIntent = ref(false)
const intentCreationError = ref<string | null>(null)
const createBookingIntentMutation = useCreateBookingIntent()
const registrationStore = useRegistrationStore()
const toast = useToast()
const router = useRouter()

const calculatedTicketCount = computed(() => {
  if (!registrarAttending.value) {
    return Math.max(1, Number(otherAttendeeCount.value || 1))
  }
  if (!registeringOthers.value) {
    return 1
  }
  return 1 + Math.max(1, Number(otherAttendeeCount.value || 1))
})

const registrationMode = computed(() => {
  return calculatedTicketCount.value === 1 && registrarAttending.value ? 'self' : 'multiple'
})

watchEffect(() => {
  if (!registrarAttending.value) {
    registeringOthers.value = true
  }
  if (registeringOthers.value || !registrarAttending.value) {
    otherAttendeeCount.value = Math.max(1, Number(otherAttendeeCount.value || 1))
  }
})

const selectRegistrarAttendance = (attending: boolean) => {
  registrarAttending.value = attending
  if (!attending) {
    registeringOthers.value = true
  }
}

const selectRegisteringOthers = (value: boolean) => {
  if (!registrarAttending.value) {
    registeringOthers.value = true
    return
  }
  registeringOthers.value = value
}

const getCountdownDisplay = (eventData?: any) => {
  const fallback = {
    date: eventData?.start_datetime,
    timezone: eventData?.timezone,
    windowName: null,
    statusText: 'Event Starts In',
    expiredLabel: 'Event Started',
    expiredHeadline: 'Happening Now!',
    isOpen: false,
  }

  const windows = Array.isArray(eventData?.availability_windows)
    ? eventData.availability_windows
    : []

  const registrationWindows = windows.filter((window: any) => {
    return window?.availability_type === 'REGISTRATION_WINDOW' && !!window?.available_from && !!window?.available_to
  })

  if (!registrationWindows.length) {
    return fallback
  }

  const now = Date.now()
  const toMillis = (value?: string) => {
    const parsed = value ? Date.parse(value) : NaN
    return Number.isNaN(parsed) ? null : parsed
  }

  const sortedWindows = [...registrationWindows].sort((a: any, b: any) => {
    const aTime = toMillis(a?.available_from) ?? Number.POSITIVE_INFINITY
    const bTime = toMillis(b?.available_from) ?? Number.POSITIVE_INFINITY
    return aTime - bTime
  })

  const activeWindow = sortedWindows.find((window: any) => {
    const startAt = toMillis(window?.available_from)
    const endAt = toMillis(window?.available_to)
    return startAt !== null && endAt !== null && startAt <= now && endAt > now
  })

  const nextWindow = sortedWindows.find((window: any) => {
    const startAt = toMillis(window?.available_from)
    return startAt !== null && startAt > now
  })

  const selectedWindow = activeWindow || nextWindow

  if (!selectedWindow) {
    return fallback
  }

  const isOpen = !!activeWindow

  return {
    date: isOpen ? selectedWindow.available_to : selectedWindow.available_from,
    timezone: selectedWindow.timezone || eventData?.timezone,
    windowName: selectedWindow.name || null,
    statusText: `${selectedWindow.name || 'Registration'} ${isOpen ? 'ends in' : 'opens in'}`,
    expiredLabel: isOpen ? 'Registration Closed' : 'Registration Opens Soon',
    expiredHeadline: isOpen ? 'Registration Closed' : 'Registration Opens Soon',
    isOpen,
  }
}

const countdownDisplay = computed(() => {
  countdownTicker.value
  return getCountdownDisplay(event.value)
})

// Setup countdown timer
const { countdown } = useCountdown(
  computed(() => countdownDisplay.value.date),
  computed(() => countdownDisplay.value.timezone)
)

// Helper function for status class
const getStatusClass = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
    case 'PUBLISHED':
      return 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40'
    case 'DRAFTING':
      return 'bg-amber-500/20 text-amber-600 border border-amber-500/40'
    case 'CANCELLED':
    case 'DELETED':
      return 'bg-red-500/20 text-red-600 border border-red-500/40'
    case 'CLOSED':
      return 'bg-orange-500/20 text-orange-600 border border-orange-500/40'
    case 'IN_PROGRESS':
      return 'bg-purple-500/20 text-purple-600 border border-purple-500/40'
    case 'POSTPONED':
      return 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/40'
    default:
      return 'bg-gray-500/20 text-gray-600 border border-gray-500/40'
  }
}

const openRegistrationModal = () => {
  if (countdown.value.isExpired || !countdownDisplay.value.isOpen || event.value?.status !== 'OPEN') {
    return
  }

  registrarAttending.value = true
  registeringOthers.value = false
  otherAttendeeCount.value = 1
  showRegistrationModal.value = true
}

const closeWaitScreen = () => {
  showWaitScreen.value = false
}

const startRegistration = async () => {
  if (!registrarAttending.value) {
    registeringOthers.value = true
  }

  const count = calculatedTicketCount.value
  showRegistrationModal.value = false
  showWaitScreen.value = true
  isCreatingIntent.value = true
  intentCreationError.value = null

  try {

    if (!event.value?.event_id) {
      throw new Error('Event ID is missing')
    }
    // Create the booking intent
    const response = await createBookingIntentMutation.mutateAsync({
      event: event.value.event_id,
      intended_ticket_count: count,
    })

    const intentId = response.data?.booking_intent_id

    if (!intentId) {
      throw new Error('No booking intent ID returned')
    }

    // Initialize the registration store with the intent
    registrationStore.init(
      eventId.value,
      count,
      registrarAttending.value
    )
    registrationStore.setBookingIntentId(intentId)

    // Delayed navigation to allow user to see the success state briefly
    setTimeout(() => {
      router.push({
        path: `/events/${eventId.value}/register`,
        query: {
          tickets: String(count),
          mode: registrationMode.value,
          uia: registrarAttending.value ? 'true' : 'false',
        },
      })
    }, 1000)
  } catch (error: any) {
    isCreatingIntent.value = false
    const errorMessage = error?.data?.non_field_errors?.[0] ||
                        error?.message ||
                        'Failed to create booking intent. Please try again.'
    intentCreationError.value = errorMessage
    toast.add({
      title: 'Registration Failed',
      description: errorMessage,
      color: 'red',
    })
  }
}

// Set page metadata
useHead({
  title: computed(() => event.value?.title || 'Event'),
  meta: [
    { 
      name: 'description', 
      content: computed(() => event.value?.short_description || event.value?.long_description || 'Event details') 
    }
  ]
})
</script>

<style scoped>
.shadow-drawn {
  box-shadow: 6px 6px 0px 0px rgba(10, 25, 47, 0.25);
}

.shadow-drawn-dark {
  box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 1);
}
</style>