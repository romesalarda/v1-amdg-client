<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink
            :to="`/events/${eventId}/m/participants/dashboard`"
            class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-black text-deep-navy">{{ attendee?.full_name || 'Participant Details' }}</h1>
            <p class="text-sm text-gray-500">View and manage participant information</p>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-6 bg-white border border-deep-navy/10 rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="changeTab(tab.id)"
            :class="[
              'flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            ]"
          >
            <svg v-html="tab.icon" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-4">
        <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="p-6 space-y-4">
            <div class="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="attendee" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'">
            <!-- Participant Header -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="p-6 m-2">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900">{{ attendee.full_name }}</h2>
                    <p class="text-sm text-gray-500 mt-1">ID: {{ attendee.attendee_display_id }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-if="attendee.is_minor"
                      class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800"
                    >
                      Minor
                    </span>
                    <span
                      v-if="(attendee as any).is_event_staff"
                      class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800"
                    >
                      Staff
                    </span>
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold',
                        (attendee as any).is_checked_in
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ (attendee as any).is_checked_in ? 'Checked In' : 'Not Checked In' }}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Contact Information -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                    <p class="text-sm text-gray-900">{{ attendee.email || 'Not provided' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</p>
                    <p class="text-sm text-gray-900">{{ attendee.phone_number || 'Not provided' }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Personal Information -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">First Name</p>
                    <p class="text-sm text-gray-900">{{ attendee.first_name }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Last Name</p>
                    <p class="text-sm text-gray-900">{{ attendee.last_name }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Date of Birth</p>
                    <p class="text-sm text-gray-900">{{ attendee.date_of_birth || 'Not provided' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Age</p>
                    <p class="text-sm text-gray-900">{{ attendee.age }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Gender</p>
                    <p class="text-sm text-gray-900">{{ attendee.gender || 'Not specified' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Relationship</p>
                    <p class="text-sm text-gray-900">{{ attendee.relationship_display }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Registration Information -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Registration Information
                </h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Area From</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).area_from_name || 'Not specified' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Registration Date</p>
                    <p class="text-sm text-gray-900">{{ formatDate((attendee as any).created_at) }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Edit Tab -->
          <div v-else-if="activeTab === 'edit'">
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Edit Participant Information</h3>
              </div>
              <form @submit.prevent="handleUpdate" class="p-6 space-y-6">
                <!-- Basic Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                    <input
                      v-model="formData.first_name"
                      type="text"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                    <input
                      v-model="formData.last_name"
                      type="text"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      v-model="formData.email"
                      type="email"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      v-model="formData.phone_number"
                      type="tel"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                    <input
                      v-model="formData.date_of_birth"
                      type="date"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select
                      v-model="formData.gender"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Relationship *</label>
                    <select
                      v-model="formData.relationship_to_user"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select relationship</option>
                      <option value="self">Self</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Area From</label>
                    <select
                      v-model="formData.area_from"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option :value="null">Select area</option>
                      <option v-for="area in areas" :key="area.id" :value="area.id">
                        {{ area.area_name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    @click="activeTab = 'overview'"
                    class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="updateMutation.isPending.value"
                    class="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ updateMutation.isPending.value ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <!-- Medical Tab -->
          <div v-else-if="activeTab === 'medical'">
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Medical Information</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Medical Conditions</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).medical_conditions || 'No medical conditions reported' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Medications</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).medications || 'No medications reported' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Allergies</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).allergies || 'No allergies reported' }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Dietary Tab -->
          <div v-else-if="activeTab === 'dietary'">
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Dietary Requirements</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Dietary Requirements</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).dietary_requirements || 'No dietary requirements reported' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Food Allergies</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).food_allergies || 'No food allergies reported' }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Accessibility Tab -->
          <div v-else-if="activeTab === 'accessibility'">
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Accessibility Requirements</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Accessibility Requirements</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).accessibility_requirements || 'No accessibility requirements reported' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Special Accommodations</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).special_accommodations || 'No special accommodations required' }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Emergency Tab -->
          <div v-else-if="activeTab === 'emergency'">
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Emergency Contact</h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Emergency Contact Name</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).emergency_contact_name || 'Not provided' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Emergency Contact Phone</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).emergency_contact_phone || 'Not provided' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Emergency Contact Relationship</p>
                    <p class="text-sm text-gray-900">{{ (attendee as any).emergency_contact_relationship || 'Not provided' }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- History Tab -->
          <div v-else-if="activeTab === 'history'">
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Event History</h3>
              </div>
              <div class="p-6">
                <div class="text-center py-8">
                  <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-gray-500">Event history coming soon</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Sidebar - Quick Actions -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-4">
            <!-- Quick Actions -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-5 py-4 bg-primary border-b border-primary">
                <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
              </div>
              <div class="p-5 space-y-3">
                <button
                  v-if="!(attendee as any).is_checked_in"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Check In
                </button>
                
                <button
                  @click="changeTab('edit')"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Details
                </button>

                <button
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Message
                </button>

                <button
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Badge
                </button>

                <button
                  @click="confirmDelete"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Participant
                </button>
              </div>
            </section>

            <!-- Info Card -->
            <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
              <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Information</h3>
              </div>
              <div class="p-5 text-xs space-y-2 text-gray-600">
                <p>• View complete participant details</p>
                <p>• Use quick actions for common tasks</p>
                <p>• Changes are saved automatically</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Participant not found</h3>
        <p class="text-sm text-gray-500 mb-4">The participant you're looking for doesn't exist or has been removed.</p>
        <NuxtLink
          :to="`/events/${eventId}/m/participants/dashboard`"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NuxtLink>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useAttendee, useUpdateAttendee, useDeleteAttendee } from '~/composables/resources/attendee/attendees'
import { useEvent } from '~/composables/resources/events/events'
import { useAreas } from '~/composables/resources/locations/locations'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import type { AttendeeList } from '~/api/types.gen'

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const eventId = computed(() => route.params.id as string)
const attendeeId = computed(() => route.params.attendee_id as string)

// Active tab management
const activeTab = ref<string>((route.query.tab as string) || 'overview')

// Tab definitions with inline SVG icons
const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />'
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />'
  },
  {
    id: 'medical',
    label: 'Medical',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />'
  },
  {
    id: 'dietary',
    label: 'Dietary',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />'
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />'
  },
  {
    id: 'history',
    label: 'History',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />'
  }
]

// Fetch event details
const { data: event } = useEvent(eventId)

// Fetch attendee details
const { data: attendeeData, isLoading } = useAttendee(attendeeId)
const attendee = computed(() => attendeeData.value?.data as AttendeeList | undefined)

// Fetch areas for dropdown
const { data: areasData } = useAreas({ page_size: 100 })
const areas = computed(() => areasData.value?.data?.results || [])

// Form data for editing
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  gender: '',
  relationship_to_user: '',
  area_from: null as number | null,
})

// Initialize form when attendee data loads
watch(attendee, (newAttendee) => {
  if (newAttendee) {
    formData.value = {
      first_name: newAttendee.first_name || '',
      last_name: newAttendee.last_name || '',
      email: newAttendee.email || '',
      phone_number: newAttendee.phone_number || '',
      date_of_birth: newAttendee.date_of_birth || '',
      gender: newAttendee.gender || '',
      relationship_to_user: (newAttendee as any).relationship_to_user || '',
      area_from: (newAttendee as any).area_from || null,
    }
  }
}, { immediate: true })

// Update mutation
const updateMutation = useUpdateAttendee()

// Delete mutation
const deleteMutation = useDeleteAttendee()

// Format date helper
function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Change tab function with URL update
function changeTab(tabId: string) {
  activeTab.value = tabId
  router.replace({
    query: { ...route.query, tab: tabId }
  })
}

// Watch URL query changes
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    activeTab.value = newTab
  }
})

// Handle update
async function handleUpdate() {
  try {
    await updateMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        ...formData.value,
        event: eventId.value,
      } as any
    })
    
    // Switch back to overview tab on success
    activeTab.value = 'overview'
    router.replace({ query: { tab: 'overview' } })
  } catch (error) {
    console.error('Failed to update attendee:', error)
  }
}

// Delete confirmation
async function confirmDelete() {
  if (confirm('Are you sure you want to delete this participant? This action cannot be undone.')) {
    try {
      await deleteMutation.mutateAsync(attendeeId.value)
      
      // Redirect to dashboard on success
      router.push(`/events/${eventId.value}/m/participants/dashboard`)
    } catch (error) {
      console.error('Failed to delete attendee:', error)
    }
  }
}
</script>
