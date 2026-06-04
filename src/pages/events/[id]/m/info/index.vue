<template>
  <EventManagementLayout :event-id="id" :event="event">
    <!-- Authorization Status Banner -->
    <div v-if="event" class="mb-6">
      <!-- Not Authorized Warning -->
      <div v-if="!event.is_approved && currentAuthorization?.status !== 'PENDING'" class="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 shadow-lg">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-4 flex-1">
            <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full flex-shrink-0">
              <span class="material-symbols-outlined text-yellow-700 text-2xl">warning</span>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-black text-yellow-900 uppercase tracking-wider mb-2">Authorization Required</h3>
              <p class="text-sm text-yellow-800 leading-relaxed mb-3">This event requires authorization before it can be published or opened for registration.</p>
              <NuxtLink
                :to="`/communities/${event.organisation}/m/events/${event.url_safe_title}/authorise`"
                class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-yellow-600/20"
              >
                <span class="material-symbols-outlined text-base">verified</span>
                Request Authorization
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Authorization Pending -->
      <div v-else-if="currentAuthorization?.status === 'PENDING'" class="bg-blue-50 border-2 border-blue-400 rounded-2xl p-6 shadow-lg">
        <div class="flex items-start gap-4">
          <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full flex-shrink-0">
            <span class="material-symbols-outlined text-blue-700 text-2xl">pending</span>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-black text-blue-900 uppercase tracking-wider mb-2">Authorization Pending</h3>
            <p class="text-sm text-blue-800 leading-relaxed">Your authorization request is currently under review. You'll be notified once it has been processed.</p>
          </div>
        </div>
      </div>

      <!-- Authorization Rejected -->
      <div v-else-if="currentAuthorization?.status === 'REJECTED'" class="bg-red-50 border-2 border-red-400 rounded-2xl p-6 shadow-lg">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-4 flex-1">
            <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full flex-shrink-0">
              <span class="material-symbols-outlined text-red-700 text-2xl">cancel</span>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-black text-red-900 uppercase tracking-wider mb-2">Authorization Rejected</h3>
              <p class="text-sm text-red-800 leading-relaxed mb-2">Your authorization request was rejected. Please review the feedback and make necessary changes.</p>
              <p v-if="currentAuthorization.reason" class="text-sm text-red-800 leading-relaxed mb-3 italic">"{{ currentAuthorization.reason }}"</p>
              <NuxtLink
                :to="`/communities/${event.organisation}/m/events/${event.event_id}/authorise`"
                class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/20"
              >
                <span class="material-symbols-outlined text-base">refresh</span>
                Request Again
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Authorization Approved -->
      <!-- <div v-else-if="event.is_approved" class="bg-green-50 border-2 border-green-400 rounded-2xl p-6 shadow-lg">
        <div class="flex items-start gap-4">
          <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full flex-shrink-0">
            <span class="material-symbols-outlined text-green-700 text-2xl">check_circle</span>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-black text-green-900 uppercase tracking-wider mb-2">Event Authorized</h3>
            <p class="text-sm text-green-800 leading-relaxed">This event has been authorized and can now be published or opened for registration.</p>
          </div>
        </div>
      </div> -->
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content (8/12) -->
      <div class="lg:col-span-8 space-y-8">
        <form @submit="onSubmit" class="space-y-8">
          <!-- Basic Details Section -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">edit_square</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Basic Details</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Event Title -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Event Title <span class="text-red-500">*</span></label>
                <input 
                  v-if="isEditMode"
                  v-model="title" 
                  type="text"
                  placeholder="Enter event title" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                  required
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ title || '-' }}</p>
                <span v-if="errors.title" class="text-xs text-red-500 font-medium">{{ errors.title }}</span>
              </div>

              <!-- Display Code -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Display Code <span class="text-red-500">*</span></label>
                <input 
                  v-if="isEditMode"
                  v-model="display_code" 
                  type="text"
                  placeholder="e.g., CONF2026" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                  required
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ display_code || '-' }}</p>
                <span v-if="errors.display_code" class="text-xs text-red-500 font-medium">{{ errors.display_code }}</span>
              </div>

              <!-- Current Status Display -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Current Status</label>
                <div class="w-full py-3 rounded-xl flex items-center gap-3">
                  <span class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider" :class="getStatusBadgeClass(event?.status)">
                    {{ statusOptions.find(o => o.value === event?.status)?.label || '-' }}
                  </span>
                  <!-- <span v-if="event?.is_approved" class="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-black uppercase tracking-wider border border-green-300">
                    ✓ Authorized
                  </span> -->
                </div>
                <p class="text-xs text-navy-600 font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">info</span>
                  Use action buttons below to change status
                </p>
              </div>

              <!-- Short Description -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Short Description</label>
                <input
                  v-if="isEditMode"
                  v-model="short_description"
                  type="text"
                  maxlength="255"
                  placeholder="Brief description of your event"
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ short_description || '-' }}</p>
                <span v-if="errors.short_description" class="text-xs text-red-500 font-medium">{{ errors.short_description }}</span>
              </div>

              <!-- External Link -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">External Link</label>
                <input
                  v-if="isEditMode"
                  v-model="external_link"
                  type="url"
                  placeholder="https://example.com"
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">
                  <a v-if="external_link" :href="external_link" target="_blank" class="text-primary hover:underline">{{ external_link }}</a>
                  <span v-else>-</span>
                </p>
                <span v-if="errors.external_link" class="text-xs text-red-500 font-medium">{{ errors.external_link }}</span>
              </div>

              <!-- External Event Toggle -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">External Event</label>
                <div v-if="isEditMode" class="flex items-center gap-3 px-4 py-3 bg-mist-blue rounded-xl">
                  <input
                    :id="`external_event_toggle`"
                    v-model="external_event"
                    type="checkbox"
                    :disabled="!isValidExternalLink"
                    :class="[
                      'w-5 h-5 text-primary rounded',
                      isValidExternalLink ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    ]"
                  />
                  <label :for="`external_event_toggle`" class="text-sm font-medium text-navy-900 cursor-pointer flex-1">
                    Mark this event as external (limits features)
                  </label>
                </div>
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">
                  <span v-if="external_event" class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold border border-yellow-300">
                    <span class="material-symbols-outlined text-sm">info</span>
                    External Event
                                  <span v-if="errors.external_event" class="text-xs text-red-500 font-medium">{{ errors.external_event }}</span>
                                  <span v-if="isEditMode && !isValidExternalLink" class="text-xs text-yellow-600 font-medium flex items-center gap-1">
                                    <span class="material-symbols-outlined text-sm">info</span>
                                    A valid external link is required to mark this event as external
                                  </span>
                  </span>
                  <span v-else>-</span>
                </p>
              </div>
            </div>
          </section>

          <!-- Description & Theme Section -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">description</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Description & Theme</h2>
            </div>
            
            <div class="space-y-6">
              <!-- Long Description -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Long Description</label>
                <EventMarkdownEditor
                  v-if="isEditMode"
                  v-model="long_description"
                />
                <div v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl min-h-[120px]">
                  <MarkdownPreview :content="long_description || undefined" />
                </div>
                <span v-if="errors.long_description" class="text-xs text-red-500 font-medium">{{ errors.long_description }}</span>
              </div>

              <!-- Theme -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Theme</label>
                <input 
                  v-if="isEditMode"
                  v-model="theme" 
                  type="text"
                  placeholder="Event theme or tagline" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ theme || '-' }}</p>
                <span v-if="errors.theme" class="text-xs text-red-500 font-medium">{{ errors.theme }}</span>
              </div>

              <!-- Anchor Verse -->
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">Anchor Verse</label>
                <input 
                  v-if="isEditMode"
                  v-model="anchor_verse" 
                  type="text"
                  placeholder="Scripture reference or verse" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ anchor_verse || '-' }}</p>
                <span v-if="errors.anchor_verse" class="text-xs text-red-500 font-medium">{{ errors.anchor_verse }}</span>
              </div>
            </div>
          </section>

          <!-- Event Timing Section -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">calendar_today</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Event Timing</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Start Date & Time <span class="text-red-500">*</span>
                </label>
                <input 
                  v-if="isEditMode"
                  v-model="start_datetime" 
                  type="datetime-local" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                  required
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ start_datetime ? new Date(start_datetime).toLocaleString() : '-' }}</p>
                <span v-if="errors.start_datetime" class="text-xs text-red-500 font-medium">{{ errors.start_datetime }}</span>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  End Date & Time <span class="text-red-500">*</span>
                </label>
                <input 
                  v-if="isEditMode"
                  v-model="end_datetime" 
                  type="datetime-local" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                  required
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ end_datetime ? new Date(end_datetime).toLocaleString() : '-' }}</p>
                <span v-if="errors.end_datetime" class="text-xs text-red-500 font-medium">{{ errors.end_datetime }}</span>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Timezone <span class="text-red-500">*</span>
                </label>
                <TimezoneSelect
                  v-if="isEditMode"
                  :model-value="timezone || 'UTC'"
                  :has-error="!!errors.timezone"
                  @update:model-value="timezone = $event"
                />
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm font-medium text-navy-900">{{ timezone || '-' }}</p>
                <span v-if="errors.timezone" class="text-xs text-red-500 font-medium">{{ errors.timezone }}</span>
              </div>
            </div>
          </section>

          <!-- Capacity & Attendance Section -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">group</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Capacity & Attendance</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Expected Attendance
                </label>
                <input 
                  :disabled="!isEditMode"

                  v-model="expected_attendance"
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <span v-if="errors.expected_attendance" class="text-xs text-red-500 font-medium">{{ errors.expected_attendance }}</span>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Maximum Attendance
                </label>
                <input 
                  :disabled="!isEditMode"
                  v-model="maximum_attendance"
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
                />
                <span v-if="errors.maximum_attendance" class="text-xs text-red-500 font-medium">{{ errors.maximum_attendance }}</span>
              </div>
            </div>
          </section>

          <!-- Additional Information Section -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8" :class="{ 'hover:border-blue-500/20 transition-all': !isEditMode }">
            <div class="flex items-center gap-2 mb-8 pb-4 border-b border-navy-50">
              <span class="material-symbols-outlined text-primary">info</span>
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Additional Information</h2>
            </div>
            
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  What to Bring
                </label>
                <textarea 
                  v-if="isEditMode"
                  v-model="what_to_bring" 
                  placeholder="List items participants should bring" 
                  rows="4" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm text-navy-700 leading-relaxed resize-none"
                ></textarea>
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm text-navy-700 leading-relaxed min-h-[80px] whitespace-pre-wrap">{{ what_to_bring || '-' }}</p>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black text-primary uppercase tracking-wider">
                  Important Information
                </label>
                <textarea 
                  v-if="isEditMode"
                  v-model="important_information" 
                  placeholder="Critical information for participants" 
                  rows="4" 
                  class="w-full px-4 py-3 bg-mist-blue border-transparent focus:border-primary focus:ring-0 rounded-xl text-sm text-navy-700 leading-relaxed resize-none"
                ></textarea>
                <p v-else class="w-full px-4 py-3 bg-mist-blue/50 rounded-xl text-sm text-navy-700 leading-relaxed min-h-[80px] whitespace-pre-wrap">{{ important_information || '-' }}</p>
              </div>
            </div>
          </section>

          <!-- Spacing for floating bar -->
          <div class="h-24"></div>
        </form>
      </div>

      <!-- Sidebar (4/12) -->
      <div class="lg:col-span-4 space-y-8">
        <!-- Quick Info -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h2 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">info</span>
              Quick Info
            </h2>
          </div>
          <div class="p-6 space-y-6">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event ID</p>
              <p class="text-[11px] font-bold text-primary break-all bg-mist-blue p-2 rounded-lg border border-navy-100/50">
                {{ event?.display_identifier || '-' }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</p>
                <p class="text-xs font-bold text-primary">
                  {{ event?.created_at ? formatCompactDateTime(event.created_at) : '-' }}
                </p>
              </div>
              <div class="space-y-1 text-right">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Updated</p>
                <p class="text-xs font-bold text-primary">
                  {{ event?.updated_at ? formatCompactDateTime(event.updated_at) : '-' }}
                </p>
              </div>
            </div>
            <div class="pt-4 border-t border-navy-50">
              <div class="flex justify-between items-center">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registrations</p>
                <span class="bg-navy-500 text-white px-3 py-1 rounded text-[11px] font-black">
                  {{ event?.number_of_attendees || 0 }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Editor Tips -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h2 class="text-[11px] font-black text-primary uppercase tracking-widest">Editor Tips</h2>
          </div>
          <div class="p-6">
            <ul class="space-y-4">
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <p class="text-xs text-navy-600 font-medium">Keep your title clear and descriptive for public listings.</p>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <p class="text-xs text-navy-600 font-medium">Set realistic attendance expectations in your description.</p>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <p class="text-xs text-navy-600 font-medium">Update event status as your planning progresses.</p>
              </li>
              <li class="flex gap-3">
                <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <p class="text-xs text-navy-600 font-medium">Add important registration information early in the text.</p>
              </li>
            </ul>
          </div>
        </section>

        <!-- Authorization History -->
        <section v-if="authorizationHistory.length > 0" class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">history</span>
            <h2 class="text-[11px] font-black text-primary uppercase tracking-widest">Authorization History</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div 
                v-for="auth in authorizationHistory.slice(0, 5)" 
                :key="auth.id"
                class="border-l-4 pl-4 py-2"
                :class="getAuthBorderClass(auth.status)"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-black uppercase tracking-wider" :class="getAuthTextClass(auth.status)">
                    {{ auth.status_display }}
                  </span>
                  <span class="text-[10px] text-gray-500 font-medium">
                    {{ formatCompactDateTime(auth.reviewed_at) }}
                  </span>
                </div>
                <p class="text-[10px] text-navy-600 font-medium">By: {{ auth.reviewed_by_email }}</p>
                <p v-if="auth.reason" class="text-xs text-navy-700 mt-1 italic">"{{ auth.reason }}"</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Preview Actions -->
        <div class="bg-mist-blue rounded-2xl p-6 border border-dashed border-navy-200">
          <p class="text-[10px] font-black text-navy-400 uppercase tracking-[0.2em] mb-4 text-center">
            Preview Changes
          </p>
          <div class="flex flex-col gap-3">
            <a
              :href="`/events/${id}`"
              class="w-full py-3 bg-white border border-primary text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all text-center"
            >
              View Public Page
            </a>
            <a
              :href="`/events/${id}/register?tickets=1&mode=multiple&uia=false&preview=true`"
              class="w-full py-3 bg-white border border-primary text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all text-center"
            >
              Admin Preview
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Bar -->
    <div class="fixed bottom-0 left-64 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-deep-navy/10 shadow-2xl">
      <div class="max-w-screen-xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-xl">info</span>
            <div>
              <p class="text-xs font-black text-primary uppercase tracking-widest">{{ isEditMode ? 'Edit Mode' : 'Manage Event' }}</p>
              <p class="text-[10px] text-deep-navy/60 font-medium">{{ isEditMode ? 'Make changes to event information' : 'Use action buttons to manage event status' }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Collapse/Expand Toggle -->

            <button
              v-if="!isEditMode"
              type="button"
              @click="isActionsExpanded = !isActionsExpanded"
              class="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-xs font-bold"
              :title="isActionsExpanded ? 'Hide actions' : 'Show actions'"
            >
              <span class="material-symbols-outlined text-sm">{{ isActionsExpanded ? 'chevron_right' : 'chevron_left' }}</span>
              {{ isActionsExpanded ? 'Hide' : 'Edit' }}
            </button>
            
            <!-- Actions Container with Transition -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div v-if="isActionsExpanded" class="flex items-center gap-3 justify-end origin-right">
                <!-- Edit Mode Buttons -->
                <template v-if="isEditMode">
                  <button
                    type="button"
                    @click="cancelEdit"
                    :disabled="isSubmitting"
                    class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    @click="saveChanges"
                    :disabled="isSubmitting"
                    class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-navy-600 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-base" v-if="!isSubmitting">save</span>
                    <span class="material-symbols-outlined text-base animate-spin" v-else>progress_activity</span>
                    {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                  </button>
                </template>
                
                <!-- Status Action Buttons -->
                <template v-else>
                              <button
                      type="button"
                      @click="isEditMode = true"
                      class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-navy-600 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-primary/20"
                    >
                      <span class="material-symbols-outlined text-base">edit</span>
                      Edit
                    </button>

                  <!-- Move To Drafting -->
                  <button
                    v-if="availableActions.canMoveToDraft"
                    type="button"
                    @click="handleStatusAction('DRAFTING')"
                    title="Move this event back to drafting"
                    class="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-slate-600/20"
                  >
                    <span class="material-symbols-outlined text-base">edit_note</span>
                    Draft
                  </button>

                  <!-- Publish -->
                  <button
                    v-if="availableActions.canPublish"
                    type="button"
                    @click="handleStatusAction('PUBLISHED')"
                    :disabled="!event?.is_approved"
                    :title="!event?.is_approved ? 'Requires authorization before publishing' : 'Publish this event'"
                    class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-base">publish</span>
                    Publish
                  </button>
                  
                  <!-- Open Registration -->
                  <button
                    v-if="availableActions.canOpen"
                    type="button"
                    @click="handleStatusAction('OPEN')"
                    :disabled="!event?.is_approved"
                    :title="!event?.is_approved ? 'Requires authorization before opening registration' : 'Open for registration'"
                    class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-base">door_open</span>
                    Open
                  </button>
                  
                  <!-- Close -->
                  <button
                    v-if="availableActions.canClose"
                    type="button"
                    @click="handleStatusAction('CLOSED')"
                    title="Close registration"
                    class="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-orange-500/20"
                  >
                    <span class="material-symbols-outlined text-base">close</span>
                    Close
                  </button>
                  
                  <!-- Archive -->
                  <button
                    v-if="availableActions.canArchive"
                    type="button"
                    @click="handleStatusAction('ARCHIVED')"
                    title="Archive this event"
                    class="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-gray-600/20"
                  >
                    <span class="material-symbols-outlined text-base">archive</span>
                    Archive
                  </button>
                  
                  <!-- Postpone -->
                  <button
                    v-if="availableActions.canPostpone"
                    type="button"
                    @click="handleStatusAction('POSTPONED')"
                    title="Postpone this event"
                    class="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-yellow-600/20"
                  >
                    <span class="material-symbols-outlined text-base">schedule</span>
                    Postpone
                  </button>
                  
                  <!-- Cancel -->
                  <button
                    v-if="availableActions.canCancel"
                    type="button"
                    @click="handleStatusAction('CANCELLED')"
                    title="Cancel this event"
                    class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-red-600/20"
                  >
                    <span class="material-symbols-outlined text-base">cancel</span>
                    Cancel
                  </button>
                  
                  <!-- Delete -->
                  <button
                    v-if="availableActions.canDelete"
                    type="button"
                    @click="handleDeleteAction"
                    title="Permanently delete this event"
                    class="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-red-700/20"
                  >
                    <span class="material-symbols-outlined text-base">delete_forever</span>
                    Delete
                  </button>
                </template>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modals -->
    <ConfirmActionModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :require-typing="confirmModal.requireTyping"
      :expected-text="confirmModal.expectedText"
      :confirm-button-color="confirmModal.buttonColor"
      :is-destructive="confirmModal.isDestructive"
      :icon="confirmModal.icon"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import Swal from 'sweetalert2'
import { useEvent, useUpdateEvent, useDeleteEvent, usePartialUpdateEvent } from '~/composables/resources/events/events'
import { useEventAuthorizations } from '~/composables/resources/events/eventAuthorizations'
import { formatCompactDateTime } from '~/utils/time'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import ConfirmActionModal from '~/components/events/ConfirmActionModal.vue'
import TimezoneSelect from '~/components/ui/TimezoneSelect.vue'
import EventMarkdownEditor from '~/components/events/EventMarkdownEditor.vue'
import MarkdownPreview from '~/components/events/MarkdownPreview.vue'
import { EventBaseSchema } from '~/schemas/event.schema'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'GENERAL',
    action: 'read',
    deniedRedirect: '/403',
  }
})
  
const route = useRoute()
const router = useRouter()
const toast = useToast()
const id = computed(() => route.params.id as string)

// Edit mode state
const isEditMode = ref(false)
const isActionsExpanded = ref(false)

// Fetch event data
const { data: eventData } = useEvent(id)
const event = computed(() => eventData.value?.data)

// Fetch authorization data
const { data: authData } = useEventAuthorizations(computed(() => ({ event: event.value?.url_safe_title || '' })))
const authorizationHistory = computed(() => authData.value?.data?.results || [])
const currentAuthorization = computed(() => authorizationHistory.value?.[0])

// Modal state
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  requireTyping: false,
  expectedText: '',
  buttonColor: 'primary' as 'primary' | 'danger' | 'warning' | 'success',
  isDestructive: false,
  icon: 'info',
  action: null as (() => void) | null,
})


// Extended form schema with additional required fields not in EventSchema
const eventInfoSchema = EventBaseSchema.extend({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  display_code: z.string().min(1, 'Display code is required'),
  short_description: z.string().max(255).optional(),
  long_description: z.string().optional(),
  start_datetime: z.string().min(1, 'Start date is required'),
  end_datetime: z.string().min(1, 'End date is required'),
  expected_attendance: z.number().int().positive().optional().nullable(),
  maximum_attendance: z.number().int().positive().optional().nullable(),
  timezone: z.string().min(1, 'Timezone is required'),
  theme: z.string().optional(),
  anchor_verse: z.string().optional(),
  what_to_bring: z.string().optional(),
  important_information: z.string().optional(),
})

const { handleSubmit, errors, defineField, resetForm: resetFormValues, setValues } = useForm({
  validationSchema: toTypedSchema(eventInfoSchema),
})
const [title] = defineField('title')
const [display_code] = defineField('display_code')
const [short_description] = defineField('short_description')
const [long_description] = defineField('long_description')
const [start_datetime] = defineField('start_datetime')
const [end_datetime] = defineField('end_datetime')
const [expected_attendance] = defineField('expected_attendance')
const [maximum_attendance] = defineField('maximum_attendance')
const [timezone] = defineField('timezone')
const [theme] = defineField('theme')
const [anchor_verse] = defineField('anchor_verse')
const [what_to_bring] = defineField('what_to_bring')
const [important_information] = defineField('important_information')
const [external_link] = defineField('external_link')
const [external_event] = defineField('external_event')

// Status options
const statusOptions = [
  { value: 'DRAFTING', label: 'Drafting' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'OPEN', label: 'Open for Registration' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'POSTPONED', label: 'Postponed' },
  { value: 'ARCHIVED', label: 'Archived' },
]

// Initialize form with event data
watch(event, (newEvent) => {
  if (newEvent) {
    setValues({
      title: newEvent.title,
      display_code: newEvent.display_code,
      short_description: newEvent.short_description || '',
      long_description: newEvent.long_description || '',
      start_datetime: newEvent.start_datetime ? new Date(newEvent.start_datetime).toISOString().slice(0, 16) : '',
      end_datetime: newEvent.end_datetime ? new Date(newEvent.end_datetime).toISOString().slice(0, 16) : '',
      expected_attendance: newEvent.expected_attendance,
      maximum_attendance: newEvent.maximum_attendance,
      timezone: newEvent.timezone || 'UTC',
      theme: newEvent.theme || '',
      anchor_verse: newEvent.anchor_verse || '',
      what_to_bring: newEvent.what_to_bring || '',
      important_information: newEvent.important_information || '',
      external_link: newEvent.external_link || '',
      external_event: newEvent.external_event || false,
    })
  }
}, { immediate: true })

// Watch for external_event toggle to show warning
watch(external_event, (newVal, oldVal) => {
  // Only show warning when toggling from false to true
  if (newVal && !oldVal) {
        // Validate that external_link is provided
        if (!isValidExternalLink.value) {
          external_event.value = false
          return
        }

    Swal.fire({
      title: 'Mark as External Event?',
      html: '<p class="text-left">Marking this event as external will disable the following features:</p><ul class="text-left mt-3 space-y-2"><li>✗ Booking & Tickets</li><li>✗ Payments</li><li>✗ Registration Form</li><li>✗ Staff Management</li><li>✗ Participants</li><li>✗ Shop/Products</li></ul>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, mark as external',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      customClass: {
        container: 'z-50',
      }
    }).then((result) => {
      if (!result.isConfirmed) {
        // Revert the toggle if user cancels
        external_event.value = false
      }
    })
  }
})

const updateMutation = useUpdateEvent()
const partialUpdateMutation = usePartialUpdateEvent()
const deleteMutation = useDeleteEvent()
// Computed property to check if external link is valid
const isValidExternalLink = computed(() => {
  if (!external_link.value || external_link.value === '') {
    return false
  }
  try {
    new URL(external_link.value)
    return true
  } catch {
    return false
  }
})


// Computed available actions based on current status and authorization
const availableActions = computed(() => {
  const status = event.value?.status
  const statusValue = status || ''
  
  return {
    canMoveToDraft: ['PUBLISHED', 'OPEN', 'CLOSED', 'POSTPONED', 'CANCELLED'].includes(statusValue),
    canPublish: ['DRAFTING', 'CANCELLED'].includes(statusValue),
    canOpen: ['PUBLISHED', 'POSTPONED', 'CLOSED'].includes(statusValue),
    canClose: status === 'OPEN' || status === 'IN_PROGRESS',
    canArchive: status === 'CLOSED' || status === 'COMPLETED',
    canPostpone: status !== 'ARCHIVED' && status !== 'DELETED' && status !== 'CANCELLED' && status !== 'POSTPONED',
    canCancel: status !== 'ARCHIVED' && status !== 'DELETED' && status !== 'CANCELLED' && status !== 'COMPLETED',
    canDelete: true, // Can delete from any status, but requires confirmation
  }
})

// Status change handlers
const handleStatusAction = (newStatus: string) => {
  if (!event.value) return
  
  const statusConfig: Record<string, { title: string; message: string; confirmText: string; requireTyping: boolean; buttonColor: 'primary' | 'danger' | 'warning' | 'success'; isDestructive: boolean; icon: string }> = {
    DRAFTING: {
      title: 'Move To Drafting',
      message: 'Are you sure you want to move this event back to drafting? This is useful when you need to revise details before publishing again.',
      confirmText: 'Move To Draft',
      requireTyping: false,
      buttonColor: 'primary',
      isDestructive: false,
      icon: 'edit_note',
    },
    PUBLISHED: {
      title: 'Publish Event',
      message: 'Are you sure you want to publish this event? It will become visible to the public.',
      confirmText: 'Publish',
      requireTyping: false,
      buttonColor: 'success',
      isDestructive: false,
      icon: 'publish',
    },
    OPEN: {
      title: 'Open Registration',
      message: 'Are you sure you want to open registration for this event? Participants will be able to sign up.',
      confirmText: 'Open',
      requireTyping: false,
      buttonColor: 'success',
      isDestructive: false,
      icon: 'door_open',
    },
    CLOSED: {
      title: 'Close Registration',
      message: 'Are you sure you want to close registration? No new participants will be able to sign up.',
      confirmText: 'Close',
      requireTyping: false,
      buttonColor: 'warning',
      isDestructive: false,
      icon: 'door_close',
    },
    ARCHIVED: {
      title: 'Archive Event',
      message: 'Are you sure you want to archive this event? It will be moved to archived events.',
      confirmText: 'Archive',
      requireTyping: false,
      buttonColor: 'primary',
      isDestructive: false,
      icon: 'archive',
    },
    POSTPONED: {
      title: 'Postpone Event',
      message: 'Are you sure you want to postpone this event? You can update the dates later.',
      confirmText: 'Postpone',
      requireTyping: false,
      buttonColor: 'warning',
      isDestructive: false,
      icon: 'schedule',
    },
    CANCELLED: {
      title: 'Cancel Event',
      message: `Are you sure you want to cancel this event? This action indicates the event will not take place. Type <strong>${event.value.title}</strong> to confirm.`,
      confirmText: 'Cancel Event',
      requireTyping: true,
      buttonColor: 'danger',
      isDestructive: true,
      icon: 'cancel',
    },
  }
  
  const config = statusConfig[newStatus]
  if (!config) return
  
  confirmModal.value = {
    ...config,
    isOpen: true,
    expectedText: config.requireTyping ? event.value.title.toUpperCase() : '',
    action: () => executeStatusChange(newStatus),
  }
}

const executeStatusChange = async (newStatus: string) => {
  if (!event.value) return
  
  try {
    await partialUpdateMutation.mutateAsync({
      eventId: id.value,
      body: {
        status: newStatus as any,
      },
    })
    
    toast.add({
      title: 'Success',
      description: `Event status updated to ${newStatus}`,
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update event status',
      color: 'red',
    })
  }
}

const handleDeleteAction = () => {
  if (!event.value) return
  
  confirmModal.value = {
    isOpen: true,
    title: 'Delete Event',
    message: `<strong>Warning:</strong> This will permanently delete the event "${event.value.title}". This action cannot be undone. All associated data will be lost.<br><br>Type <strong>${event.value.title}</strong> to confirm deletion.`,
    confirmText: 'Delete Forever',
    requireTyping: true,
    expectedText: event.value.title.toUpperCase(),
    buttonColor: 'danger',
    isDestructive: true,
    icon: 'delete_forever',
    action: executeDelete,
  }
}

const executeDelete = async () => {
  if (!event.value) return
  
  try {
    await deleteMutation.mutateAsync(id.value)
    
    toast.add({
      title: 'Success',
      description: 'Event deleted successfully',
      color: 'green',
    })
    
    // Navigate back to events list
    router.push('/events')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to delete event',
      color: 'red',
    })
  }
}

const handleModalConfirm = () => {
  if (confirmModal.value.action) {
    confirmModal.value.action()
  }
  confirmModal.value.isOpen = false
}

const handleModalCancel = () => {
  confirmModal.value.isOpen = false
}

// Utility functions for styling
const getStatusBadgeClass = (status?: string) => {
  const classes: Record<string, string> = {
    DRAFTING: 'bg-gray-100 text-gray-800 border border-gray-300',
    PUBLISHED: 'bg-blue-100 text-blue-800 border border-blue-300',
    OPEN: 'bg-green-100 text-green-800 border border-green-300',
    CLOSED: 'bg-orange-100 text-orange-800 border border-orange-300',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 border border-purple-300',
    COMPLETED: 'bg-gray-100 text-gray-800 border border-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 border border-red-300',
    POSTPONED: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    ARCHIVED: 'bg-gray-100 text-gray-600 border border-gray-300',
  }
  return classes[status || ''] || 'bg-gray-100 text-gray-800'
}

const getAuthBorderClass = (status?: string) => {
  const classes: Record<string, string> = {
    PENDING: 'border-blue-400',
    APPROVED: 'border-green-400',
    REJECTED: 'border-red-400',
    POSTPONED: 'border-orange-400',
    CANCELLED: 'border-red-400',
  }
  return classes[status || ''] || 'border-gray-400'
}

const getAuthTextClass = (status?: string) => {
  const classes: Record<string, string> = {
    PENDING: 'text-blue-700',
    APPROVED: 'text-green-700',
    REJECTED: 'text-red-700',
    POSTPONED: 'text-orange-700',
    CANCELLED: 'text-red-700',
  }
  return classes[status || ''] || 'text-gray-700'
}

const saveChanges = async () => {
  const values = {
    title: title.value || '',
    display_code: display_code.value || '',
    short_description: short_description.value || '',
    long_description: long_description.value || '',
    start_datetime: start_datetime.value || '',
    end_datetime: end_datetime.value || '',
    expected_attendance: expected_attendance.value ?? null,
    maximum_attendance: maximum_attendance.value ?? null,
    timezone: timezone.value || 'UTC',
    theme: theme.value || '',
    anchor_verse: anchor_verse.value || '',
    what_to_bring: what_to_bring.value || '',
    important_information: important_information.value || '',
    external_link: external_link.value || null,
    external_event: external_event.value || false,
  }

  try {
    await updateMutation.mutateAsync({
      eventId: id.value,
      body: {
        ...values,
        start_datetime: values.start_datetime ? new Date(values.start_datetime).toISOString() : new Date().toISOString(),
        end_datetime: values.end_datetime ? new Date(values.end_datetime).toISOString() : new Date().toISOString(),
      },
    })
    
    // Show success notification
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Event information updated successfully',
      color: 'green',
    })
    
    // Exit edit mode
    isEditMode.value = false
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update event information',
      color: 'red',
    })
  }
}

const onSubmit = handleSubmit(async (values) => {
  try {
    await updateMutation.mutateAsync({
      eventId: id.value,
      body: {
        ...values,
        start_datetime: new Date(values.start_datetime).toISOString(),
        end_datetime: new Date(values.end_datetime).toISOString(),
        external_link: values.external_link || null,
        external_event: values.external_event || false,
      },
    })
    
    toast.add({
      title: 'Success',
      description: 'Event information updated successfully',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update event information',
      color: 'red',
    })
  }
})

const cancelEdit = () => {
  if (event.value) {
    setValues({
      title: event.value.title,
      display_code: event.value.display_code,
      short_description: event.value.short_description || '',
      long_description: event.value.long_description || '',
      start_datetime: event.value.start_datetime ? new Date(event.value.start_datetime).toISOString().slice(0, 16) : '',
      end_datetime: event.value.end_datetime ? new Date(event.value.end_datetime).toISOString().slice(0, 16) : '',
      expected_attendance: event.value.expected_attendance,
      maximum_attendance: event.value.maximum_attendance,
      timezone: event.value.timezone || 'UTC',
      theme: event.value.theme || '',
      anchor_verse: event.value.anchor_verse || '',
      what_to_bring: event.value.what_to_bring || '',
      important_information: event.value.important_information || '',
      external_link: event.value.external_link || '',
      external_event: event.value.external_event || false,
    })
  }
  isEditMode.value = false
}

const resetForm = () => {
  if (event.value) {
    setValues({
      title: event.value.title,
      display_code: event.value.display_code,
      short_description: event.value.short_description || '',
      long_description: event.value.long_description || '',
      start_datetime: event.value.start_datetime ? new Date(event.value.start_datetime).toISOString().slice(0, 16) : '',
      end_datetime: event.value.end_datetime ? new Date(event.value.end_datetime).toISOString().slice(0, 16) : '',
      expected_attendance: event.value.expected_attendance,
      maximum_attendance: event.value.maximum_attendance,
      timezone: event.value.timezone || 'UTC',
      theme: event.value.theme || '',
      anchor_verse: event.value.anchor_verse || '',
      what_to_bring: event.value.what_to_bring || '',
      important_information: event.value.important_information || '',
      external_link: event.value.external_link || '',
      external_event: event.value.external_event || false,
    })
  }
}

const isSubmitting = computed(() => updateMutation.isPending.value)
</script>
