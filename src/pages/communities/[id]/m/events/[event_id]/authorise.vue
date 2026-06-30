<template>
  <ManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Back Button -->
    <!-- <UButton
      :to="`/communities/${organisationId}/m/events`"
      icon="i-heroicons-arrow-left"
      variant="ghost"
      color="gray"
      class="mb-6"
    >
      Back to Events
    </UButton> -->

    <!-- Loading State -->
    <div v-if="isLoadingEvent" class="space-y-6">
      <USkeleton class="h-12 w-3/4" />
      <USkeleton class="h-64 w-full" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="eventError"
      color="red"
      icon="i-heroicons-exclamation-triangle"
      title="Error loading event"
      :description="eventError.message"
    />

    <!-- Main Content -->
    <div v-else-if="event" class="space-y-6 pb-28 m-6">

      <!-- Page Header -->
      <div class="bg-[#026CDF] rounded-xl border-2 border-deep-navy/10 p-6 shadow-sm">
        <div class="flex items-start justify-between gap-6">
          <div class="flex-1">
            <h1 class="text-3xl text-white text-deep-navy mb-2">Authorise <span class="text-white/90 font-medium">{{ event.title }}</span></h1>
            <p class="text-white/60 font-medium mb-4">Review this event's details and flag any issues before authorisation.</p>
            <div class="flex flex-wrap gap-3">
              <UBadge :color="getStatusColor(event.status)" :label="event.status_display" size="lg" />
              <UBadge v-if="event.is_approved" color="green" label="Authorized" size="lg" />
              <UBadge v-else color="yellow" label="Pending Authorization" size="lg" />
            </div>
          </div>
          <div v-if="sectionIssues.length" class="flex-shrink-0">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              {{ sectionIssues.length }} issue{{ sectionIssues.length !== 1 ? 's' : '' }} flagged
            </span>
          </div>
        </div>
      </div>



      <!-- ─── STEP 1: EVENT DETAILS ─────────────────────────── -->
      <template v-if="currentStep === 0">

      <!-- Basic Information -->
      <div class="bg-white border-2 border-deep-navy/10 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-deep-navy/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-sm font-black text-deep-navy/70 uppercase tracking-[0.15em]">Basic Information</h2>
            <span v-if="issuesForSection('basic-info').length" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase">
              {{ issuesForSection('basic-info').length }} issue{{ issuesForSection('basic-info').length !== 1 ? 's' : '' }}
            </span>
          </div>
          <button type="button" @click="toggleFlag('basic-info')"
            :class="activeFlagSection === 'basic-info'
              ? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-500 text-white'
              : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-deep-navy/20 text-deep-navy/60 hover:border-amber-400 hover:text-amber-600 transition-colors'"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
            {{ activeFlagSection === 'basic-info' ? 'Cancel' : 'Flag Issue' }}
          </button>
        </div>
        <div class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Event Type</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.event_type_details?.title || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Organisation</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.organisation_name || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Start Date &amp; Time</label>
            <p class="mt-1 text-deep-navy font-medium">{{ formatEventDateTime(event.start_datetime) }}</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">End Date &amp; Time</label>
            <p class="mt-1 text-deep-navy font-medium">{{ formatEventDateTime(event.end_datetime) }}</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Duration</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.duration_days }} day(s)</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Timezone</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.timezone }}</p>
          </div>
        </div>
        <!-- Flag form -->
        <div v-if="activeFlagSection === 'basic-info'" class="px-6 pb-5 pt-3 border-t border-amber-200 bg-amber-50">
          <p class="text-[10px] font-black text-amber-700 uppercase tracking-[0.15em] mb-2">Add issue for: Basic Information</p>
          <textarea v-model="flagDraft" placeholder="Describe the issue…" rows="3"
            class="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:border-amber-500 resize-none bg-white"
          />
          <div class="flex gap-2 mt-2">
            <button type="button" @click="addIssue('basic-info', 'Basic Information')" :disabled="!flagDraft.trim()"
              class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-colors">
              Add Issue
            </button>
            <button type="button" @click="activeFlagSection = null"
              class="px-4 py-1.5 border-2 border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-black uppercase tracking-wider transition-colors">
              Cancel
            </button>
          </div>
        </div>
        <!-- Issues list -->
        <div v-if="issuesForSection('basic-info').length" class="px-6 pb-5 space-y-2">
          <p class="text-[10px] font-black text-deep-navy/40 uppercase tracking-[0.15em] mb-2">Flagged Issues</p>
          <div v-for="issue in issuesForSection('basic-info')" :key="issue.id"
            class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <svg class="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <p class="flex-1 text-xs text-deep-navy/80 font-medium">{{ issue.comment }}</p>
            <button type="button" @click="removeIssue(issue.id)" title="Remove issue"
              class="flex-shrink-0 text-deep-navy/30 hover:text-red-500 transition-colors">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Capacity & Attendance -->
      <div class="bg-white border-2 border-deep-navy/10 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-deep-navy/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-sm font-black text-deep-navy/70 uppercase tracking-[0.15em]">Capacity &amp; Attendance</h2>
            <span v-if="issuesForSection('capacity').length" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase">
              {{ issuesForSection('capacity').length }} issue{{ issuesForSection('capacity').length !== 1 ? 's' : '' }}
            </span>
          </div>
          <button type="button" @click="toggleFlag('capacity')"
            :class="activeFlagSection === 'capacity'
              ? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-500 text-white'
              : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-deep-navy/20 text-deep-navy/60 hover:border-amber-400 hover:text-amber-600 transition-colors'"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
            {{ activeFlagSection === 'capacity' ? 'Cancel' : 'Flag Issue' }}
          </button>
        </div>
        <div class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Expected Attendance</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.expected_attendance || 'Not specified' }}</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Maximum Attendance</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.maximum_attendance || 'Unlimited' }}</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Current Attendees</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.number_of_attendees }}</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Registration Status</label>
            <p class="mt-1 text-deep-navy font-medium">
              {{ event.can_participants_register ? 'Open for registration' : 'Registration closed' }}
            </p>
          </div>
        </div>
        <div v-if="activeFlagSection === 'capacity'" class="px-6 pb-5 pt-3 border-t border-amber-200 bg-amber-50">
          <p class="text-[10px] font-black text-amber-700 uppercase tracking-[0.15em] mb-2">Add issue for: Capacity &amp; Attendance</p>
          <textarea v-model="flagDraft" placeholder="Describe the issue…" rows="3"
            class="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:border-amber-500 resize-none bg-white"
          />
          <div class="flex gap-2 mt-2">
            <button type="button" @click="addIssue('capacity', 'Capacity & Attendance')" :disabled="!flagDraft.trim()"
              class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-colors">
              Add Issue
            </button>
            <button type="button" @click="activeFlagSection = null"
              class="px-4 py-1.5 border-2 border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-black uppercase tracking-wider transition-colors">
              Cancel
            </button>
          </div>
        </div>
        <div v-if="issuesForSection('capacity').length" class="px-6 pb-5 space-y-2">
          <p class="text-[10px] font-black text-deep-navy/40 uppercase tracking-[0.15em] mb-2">Flagged Issues</p>
          <div v-for="issue in issuesForSection('capacity')" :key="issue.id"
            class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <svg class="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <p class="flex-1 text-xs text-deep-navy/80 font-medium">{{ issue.comment }}</p>
            <button type="button" @click="removeIssue(issue.id)" title="Remove issue"
              class="flex-shrink-0 text-deep-navy/30 hover:text-red-500 transition-colors">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="event.short_description || event.long_description || event.important_information || event.what_to_bring"
        class="bg-white border-2 border-deep-navy/10 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-deep-navy/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-sm font-black text-deep-navy/70 uppercase tracking-[0.15em]">Description</h2>
            <span v-if="issuesForSection('description').length" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase">
              {{ issuesForSection('description').length }} issue{{ issuesForSection('description').length !== 1 ? 's' : '' }}
            </span>
          </div>
          <button type="button" @click="toggleFlag('description')"
            :class="activeFlagSection === 'description'
              ? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-500 text-white'
              : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-deep-navy/20 text-deep-navy/60 hover:border-amber-400 hover:text-amber-600 transition-colors'"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
            {{ activeFlagSection === 'description' ? 'Cancel' : 'Flag Issue' }}
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div v-if="event.short_description">
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Short Description</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.short_description }}</p>
          </div>
          <div v-if="event.long_description">
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Full Description</label>
            <p class="mt-1 text-deep-navy font-medium whitespace-pre-wrap">{{ event.long_description }}</p>
          </div>
          <div v-if="event.important_information">
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Important Information</label>
            <p class="mt-1 text-deep-navy font-medium whitespace-pre-wrap">{{ event.important_information }}</p>
          </div>
          <div v-if="event.what_to_bring">
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">What to Bring</label>
            <p class="mt-1 text-deep-navy font-medium whitespace-pre-wrap">{{ event.what_to_bring }}</p>
          </div>
        </div>
        <div v-if="activeFlagSection === 'description'" class="px-6 pb-5 pt-3 border-t border-amber-200 bg-amber-50">
          <p class="text-[10px] font-black text-amber-700 uppercase tracking-[0.15em] mb-2">Add issue for: Description</p>
          <textarea v-model="flagDraft" placeholder="Describe the issue…" rows="3"
            class="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:border-amber-500 resize-none bg-white"
          />
          <div class="flex gap-2 mt-2">
            <button type="button" @click="addIssue('description', 'Description')" :disabled="!flagDraft.trim()"
              class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-colors">
              Add Issue
            </button>
            <button type="button" @click="activeFlagSection = null"
              class="px-4 py-1.5 border-2 border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-black uppercase tracking-wider transition-colors">
              Cancel
            </button>
          </div>
        </div>
        <div v-if="issuesForSection('description').length" class="px-6 pb-5 space-y-2">
          <p class="text-[10px] font-black text-deep-navy/40 uppercase tracking-[0.15em] mb-2">Flagged Issues</p>
          <div v-for="issue in issuesForSection('description')" :key="issue.id"
            class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <svg class="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <p class="flex-1 text-xs text-deep-navy/80 font-medium">{{ issue.comment }}</p>
            <button type="button" @click="removeIssue(issue.id)" title="Remove issue"
              class="flex-shrink-0 text-deep-navy/30 hover:text-red-500 transition-colors">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Theme & Spiritual Focus -->
      <div v-if="event.theme || event.anchor_verse"
        class="bg-white border-2 border-deep-navy/10 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-deep-navy/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-sm font-black text-deep-navy/70 uppercase tracking-[0.15em]">Theme &amp; Spiritual Focus</h2>
            <span v-if="issuesForSection('theme').length" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase">
              {{ issuesForSection('theme').length }} issue{{ issuesForSection('theme').length !== 1 ? 's' : '' }}
            </span>
          </div>
          <button type="button" @click="toggleFlag('theme')"
            :class="activeFlagSection === 'theme'
              ? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-500 text-white'
              : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border-2 border-deep-navy/20 text-deep-navy/60 hover:border-amber-400 hover:text-amber-600 transition-colors'"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
            {{ activeFlagSection === 'theme' ? 'Cancel' : 'Flag Issue' }}
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div v-if="event.theme">
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Theme</label>
            <p class="mt-1 text-deep-navy font-medium">{{ event.theme }}</p>
          </div>
          <div v-if="event.anchor_verse">
            <label class="text-[10px] font-black text-deep-navy/50 uppercase tracking-[0.15em]">Anchor Verse</label>
            <p class="mt-1 text-deep-navy font-medium italic">"{{ event.anchor_verse }}"</p>
          </div>
        </div>
        <div v-if="activeFlagSection === 'theme'" class="px-6 pb-5 pt-3 border-t border-amber-200 bg-amber-50">
          <p class="text-[10px] font-black text-amber-700 uppercase tracking-[0.15em] mb-2">Add issue for: Theme &amp; Spiritual Focus</p>
          <textarea v-model="flagDraft" placeholder="Describe the issue…" rows="3"
            class="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:border-amber-500 resize-none bg-white"
          />
          <div class="flex gap-2 mt-2">
            <button type="button" @click="addIssue('theme', 'Theme & Spiritual Focus')" :disabled="!flagDraft.trim()"
              class="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wider disabled:opacity-40 transition-colors">
              Add Issue
            </button>
            <button type="button" @click="activeFlagSection = null"
              class="px-4 py-1.5 border-2 border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-black uppercase tracking-wider transition-colors">
              Cancel
            </button>
          </div>
        </div>
        <div v-if="issuesForSection('theme').length" class="px-6 pb-5 space-y-2">
          <p class="text-[10px] font-black text-deep-navy/40 uppercase tracking-[0.15em] mb-2">Flagged Issues</p>
          <div v-for="issue in issuesForSection('theme')" :key="issue.id"
            class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <svg class="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <p class="flex-1 text-xs text-deep-navy/80 font-medium">{{ issue.comment }}</p>
            <button type="button" @click="removeIssue(issue.id)" title="Remove issue"
              class="flex-shrink-0 text-deep-navy/30 hover:text-red-500 transition-colors">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      </template>
      <!-- ─── END STEP 1 ────────────────────────────────────── -->

      <!-- ─── STEP 2: BUDGET PROPOSAL ──────────────────────── -->
      <template v-if="currentStep === 1">

        <BudgetReviewPanel
          :event-id="eventId"
          :section-issues="sectionIssues"
          :active-flag-section="activeFlagSection"
          :flag-draft="flagDraft"
          @toggle-flag="toggleFlag"
          @update-draft="(v) => { flagDraft = v }"
          @add-issue="addIssue"
          @remove-issue="removeIssue"
        />

      </template>
      <!-- ─── END STEP 2 ────────────────────────────────────── -->

      <!-- ─── STEP 3: AUTHORIZATION ────────────────────────── -->
      <template v-if="currentStep === 2">

        <!-- ─── ISSUES SUMMARY ─────────────────────────────── -->
        <div v-if="sectionIssues.length" class="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <h3 class="text-sm font-black text-amber-800 uppercase tracking-wider">
              Review Summary — {{ sectionIssues.length }} issue{{ sectionIssues.length !== 1 ? 's' : '' }}
            </h3>
          </div>
          <p class="text-xs text-amber-700 font-medium mb-3">These will be appended to the Notes field as checklist items:</p>
          <ul class="space-y-1.5">
            <li v-for="issue in sectionIssues" :key="issue.id" class="flex items-start gap-2 text-sm text-amber-900 font-medium">
              <span class="mt-0.5 flex-shrink-0 w-4 h-4 border-2 border-amber-500 rounded-sm bg-white inline-block" />
              <span><strong>{{ issue.sectionLabel }}:</strong> {{ issue.comment }}</span>
            </li>
          </ul>
          <p class="mt-3 text-xs text-amber-600 font-medium">Notes character count: {{ compiledNotes.length }}/1000</p>
        </div>

        <!-- ─── AUTHORIZATION HISTORY ────────────────────── -->
        <div v-if="existingAuthorizations?.length > 1" class="bg-white border-2 border-deep-navy/10 rounded-xl p-6">
          <h2 class="text-sm font-black text-deep-navy/50 uppercase tracking-[0.15em] mb-4">Authorization History</h2>
          <div class="space-y-4">
            <div v-for="auth in existingAuthorizations.slice(1)" :key="auth.id"
              class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div class="flex items-start justify-between mb-2">
                <UBadge :color="getAuthStatusColor(auth.status)" :label="auth.status_display" />
                <span class="text-xs font-medium text-deep-navy/60">{{ formatEventDateTime(auth.reviewed_at) }}</span>
              </div>
              <p class="text-sm text-deep-navy/80 mb-1"><span class="font-semibold">Reviewed by:</span> {{ auth.reviewed_by_email }}</p>
              <p v-if="auth.reason" class="text-sm text-deep-navy/80 mb-1"><span class="font-semibold">Reason:</span> {{ auth.reason }}</p>
              <p v-if="auth.notes" class="text-sm text-deep-navy/70"><span class="font-semibold">Notes:</span> {{ auth.notes }}</p>
            </div>
          </div>
        </div>

        <!-- ─── AUTHORIZATION FORM ────────────────────────── -->
        <EventAuthorizationForm
          :event-id="Number(event.event_id)"
          :existing-authorization="currentAuthorization"
          :is-submitting="isSubmitting"
          :prefilled-notes="compiledNotes || undefined"
          @submit="handleAuthorizationSubmit"
          @cancel="handleCancel"
        />

      </template>
      <!-- ─── END STEP 3 ────────────────────────────────────── -->

    </div>

    <!-- ─── STICKY BOTTOM NAV ──────────────────────────────────── -->
    <div v-if="event" class="fixed bottom-0 left-0 right-0 lg:left-64 z-40 bg-white border-t-2 border-deep-navy/10 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
      <div class="px-8 py-4 flex items-center gap-6">
        <!-- Back button -->
        <!-- <UButton
          v-if="currentStep > 0"
          icon="i-heroicons-arrow-left"
          variant="ghost"
          color="gray"
          class="flex-shrink-0"
          @click="currentStep--"
        >
          {{ steps[currentStep - 1].label }}
        </UButton>
        <div v-else class="flex-shrink-0 w-32" /> -->

        <!-- Stepper -->
        <div class="flex-1">
          <UStepper v-model="currentStep" :items="steps" :connector-width="400" :linear="false" />
        </div>

        <!-- Next button -->
        <!-- <UButton
          v-if="currentStep < steps.length - 1"
          icon="i-heroicons-arrow-right"
          trailing
          class="flex-shrink-0"
          @click="currentStep++"
        >
          {{ steps[currentStep + 1].label }}
        </UButton>
        <div v-else class="flex-shrink-0 w-32" /> -->
      </div>
    </div>
  </ManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import {
  useEventAuthorizations,
  useCreateEventAuthorization,
  usePartialUpdateEventAuthorization,
} from '~/composables/resources/events/eventAuthorizations'
import type { EventAuthorizationRequest } from '~/api/types.gen'
import { formatDateTime } from '~/utils/time'
import ManagementLayout from '~/components/communities/ManagementLayout.vue'
import EventAuthorizationForm from '~/components/events/forms/EventAuthorizationForm.vue'
import BudgetReviewPanel from '~/components/events/authorise/BudgetReviewPanel.vue'
import { useReviewIssues } from '~/composables/useReviewIssues'

// ── Page Meta ────────────────────────────────────────────────────────────────
definePageMeta({
  middleware: ['auth', 'organisation-controller', 'leader-permission'],
  layout: false,
  leaderPermission: { 
    code: 'allow_event_approval' 
  },
})

useHead({
  title: 'Authorise Event',
  meta: [
    { name: 'description', content: 'Authorise event details and manage approvals for the community.' },
  ],
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const organisationId = computed(() => route.params.id as string)
const eventId = computed(() => route.params.event_id as string)

// Fetch organisation
const { data: orgData } = useOrganisation(organisationId)
const organisation = computed(() => orgData.value?.data)

// Fetch event
const { data: eventData, isLoading: isLoadingEvent, error: eventError } = useEvent(eventId)
const event = computed(() => eventData.value?.data)

// Fetch existing authorizations
const { data: authData } = useEventAuthorizations(computed(() => ({ event: event.value?.url_safe_title || '' })))
const existingAuthorizations = computed(() => authData.value?.data?.results || [])
const currentAuthorization = computed(() => existingAuthorizations.value?.[0])

const createMutation = useCreateEventAuthorization()
const updateMutation = usePartialUpdateEventAuthorization()
const isSubmitting = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

// ── Section Issue State (shared across all steps) ────────────────────────────
const {
  sectionIssues,
  activeFlagSection,
  flagDraft,
  issuesForSection,
  toggleFlag,
  addIssue,
  removeIssue,
  compiledNotes,
} = useReviewIssues()

// ── Stepper State ────────────────────────────────────────────────────────────
const currentStep = ref(0)
const steps = [
  { key: 'event-details', label: 'Event Details', description: 'Review event information' },
  { key: 'budget-proposal', label: 'Budget Proposal', description: 'Review financial information' },
  { key: 'authorise', label: 'Authorise', description: 'Submit authorization decision' },
]

// ── Authorization Handlers ───────────────────────────────────────────────────
const handleAuthorizationSubmit = async (values: { status: string; reason?: string; notes?: string }) => {
  if (!event.value) return

  try {
    if (currentAuthorization.value) {
      await updateMutation.mutateAsync({
        authorizationId: currentAuthorization.value.id,
        body: {
          status: values.status as any,
          reason: values.reason || undefined,
          notes: values.notes || undefined,
        },
      })
      toast.add({ title: 'Authorization Updated', description: 'Event authorization has been updated successfully.', color: 'green' })
    } else {
      const authPayload: EventAuthorizationRequest = {
        event: event.value.event_id,
        status: values.status as any,
        reason: values.reason || undefined,
        notes: values.notes || undefined,
      }
      await createMutation.mutateAsync(authPayload)
      toast.add({ title: 'Authorization Submitted', description: 'Event authorization has been recorded successfully.', color: 'green' })
    }

    router.push(`/communities/${organisationId.value}/m/events`)
  } catch (error: any) {
    toast.add({ title: 'Authorization Failed', description: error.message || 'Failed to submit authorization. Please try again.', color: 'red' })
  }
}

const handleCancel = () => {
  router.push(`/communities/${organisationId.value}/m/events/${eventId.value}`)
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatEventDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return formatDateTime(dateString, event.value?.timezone || 'UTC', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const getStatusColor = (status?: string): 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' => {
  const colors: Record<string, 'gray' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'> = {
    DRAFTING: 'gray', PUBLISHED: 'blue', OPEN: 'green', CLOSED: 'orange',
    IN_PROGRESS: 'purple', COMPLETED: 'gray', DELETED: 'red', CANCELLED: 'red',
    POSTPONED: 'yellow', ARCHIVED: 'gray',
  }
  return colors[status || ''] || 'gray'
}

const getAuthStatusColor = (status?: string): 'yellow' | 'green' | 'red' | 'orange' | 'gray' => {
  const colors: Record<string, 'yellow' | 'green' | 'red' | 'orange' | 'gray'> = {
    PENDING: 'yellow', APPROVED: 'green', REJECTED: 'red', POSTPONED: 'orange', CANCELLED: 'red',
  }
  return colors[status || ''] || 'gray'
}
</script>
