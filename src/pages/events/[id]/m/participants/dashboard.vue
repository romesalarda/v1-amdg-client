<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 gap-6" :class="showFilters ? 'lg:grid-cols-12' : 'lg:grid-cols-1'">
      <!-- Main Content (9/12 or full width) -->
      <div :class="showFilters ? 'lg:col-span-9' : 'lg:col-span-12'" class="space-y-6">
        
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Attendees View Statistics -->
          <template v-if="currentView === 'attendees'">
            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-users" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalAttendees }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Attendees</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ checkedInCount }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Checked In</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ minorCount }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Minors</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ staffCount }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Staff Members</div>
                </div>
              </div>
            </div>
          </template>

          <!-- Bookings View Statistics -->
          <template v-else>
            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-ticket" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalBookings }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Bookings</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalAttendees }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Attendees</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-users" class="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalBookings ? Math.round(totalAttendees / totalBookings * 10) / 10 : 0 }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Avg Attendees/Booking</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-currency-pound" class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">-</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Main Table Section -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <!-- Table Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon :name="currentView === 'attendees' ? 'i-heroicons-user-group' : 'i-heroicons-ticket'" class="w-5 h-5 text-primary" />
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">
                    {{ currentView === 'attendees' ? 'Event Participants' : 'Event Bookings' }}
                  </h2>
                  <!-- View Toggle -->
                  <div class="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      @click="changeView('attendees')"
                      :class="[
                        'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                        currentView === 'attendees'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      ]"
                    >
                      Attendees
                    </button>
                    <button
                      @click="changeView('bookings')"
                      :class="[
                        'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                        currentView === 'bookings'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      ]"
                    >
                      Bookings
                    </button>
                  </div>
                </div>
                <p class="text-xs text-gray-500">
                  <template v-if="currentView === 'attendees'">
                    Showing {{ attendees.length }} of {{ totalAttendees }} participants
                  </template>
                  <template v-else>
                    Showing {{ bookings.length }} of {{ totalBookings }} bookings
                  </template>
                </p>
              </div>
              
              
            </div>
            
            <div class="flex items-center gap-2">
              <UButton
                v-if="currentView === 'attendees'"
                size="sm"
                variant="ghost"
                color="gray"
                :icon="showFilters ? 'i-heroicons-chevron-right' : 'i-heroicons-funnel'"
                @click="showFilters = !showFilters"
                class="hidden lg:flex"
              >
                {{ showFilters ? 'Hide' : 'Show' }} Filters
              </UButton>
              <!-- Export Button -->
              <UButton
                size="sm"
                variant="outline"
                color="gray"
                icon="i-heroicons-arrow-down-tray"
                @click="exportToCSV"
              >
                Export CSV
              </UButton>
              
              <!-- Add Attendee Button -->
              <UButton
                size="sm"
                variant="solid"
                color="primary"
                icon="i-heroicons-plus"
                :to="`/events/${id}/m/participants/editor`"
              >
                Add Attendee
              </UButton>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <div class="relative">
                  <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="currentView === 'attendees' ? 'Search by name, email, phone, or ID...' : 'Search by booking reference...'"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              <!-- Active Filters Badge -->
              <div v-if="activeFilterCount > 0" class="flex items-center gap-2">
                <UBadge color="primary" variant="soft">
                  {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active
                </UBadge>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  @click="clearAllFilters"
                >
                  Clear all
                </UButton>
              </div>
              
              <!-- Toggle Filters Button (Mobile) -->
              <UButton
                size="sm"
                variant="outline"
                color="gray"
                icon="i-heroicons-funnel"
                @click="showFilters = !showFilters"
                class="lg:hidden"
              >
                Filters
              </UButton>
            </div>
          </div>

          <!-- Table -->
          <div v-if="(currentView === 'attendees' && isLoading) || (currentView === 'bookings' && bookingsLoading)" class="p-6 space-y-3">
            <div v-for="i in 10" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <div v-else-if="(currentView === 'attendees' && attendees.length === 0) || (currentView === 'bookings' && bookings.length === 0)" class="p-12 text-center">
            <UIcon :name="currentView === 'attendees' ? 'i-heroicons-user-group' : 'i-heroicons-ticket'" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ currentView === 'attendees' ? 'No participants found' : 'No bookings found' }}
            </h3>
            <p class="text-sm text-gray-500 mb-4">
              {{ searchQuery || activeFilterCount > 0 
                ? 'Try adjusting your filters or search query' 
                : currentView === 'attendees' 
                  ? 'No attendees have been registered for this event yet' 
                  : 'No bookings have been made for this event yet' 
              }}
            </p>
            <UButton
              v-if="searchQuery || activeFilterCount > 0"
              variant="soft"
              color="gray"
              @click="clearAllFilters"
            >
              Clear filters
            </UButton>
            <UButton
              v-else-if="currentView === 'attendees'"
              color="primary"
              :to="`/events/${id}/m/participants/editor`"
            >
              Add First Attendee
            </UButton>
          </div>

          <!-- Attendees Table -->
          <div v-else-if="currentView === 'attendees'" class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th class="py-3 px-4">
                    <input
                      v-model="selectAll"
                      type="checkbox"
                      @change="toggleSelectAll"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('attendee_display_id')"
                  >
                    <div class="flex items-center gap-1">
                      ID
                      <UIcon 
                        v-if="currentSort === 'attendee_display_id'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('first_name')"
                  >
                    <div class="flex items-center gap-1">
                      Name
                      <UIcon 
                        v-if="currentSort === 'first_name'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('age')"
                  >
                    <div class="flex items-center gap-1">
                      Age
                      <UIcon 
                        v-if="currentSort === 'age'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Gender</th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Area</th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="attendee in attendees"
                  :key="attendee.attendee_id"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4">
                    <input
                      v-model="selectedAttendees"
                      type="checkbox"
                      :value="attendee.attendee_id"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td class="py-3 px-4">
                    <span class="font-mono text-xs text-gray-600">{{ attendee.attendee_display_id }}</span>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div>
                        <div class="font-semibold text-gray-900">{{ attendee.full_name }}</div>
                        <div class="text-xs text-gray-500">{{ attendee.phone_number || 'No phone' }}</div>
                      </div>
                      <div class="flex gap-1">
                        <UBadge v-if="attendee.is_minor" color="amber" variant="soft" size="xs">Minor</UBadge>
                        <UBadge v-if="(attendee as any).is_event_staff" color="purple" variant="soft" size="xs">Staff</UBadge>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-gray-600">
                    {{ attendee.email || 'No email' }}
                  </td>
                  <td class="py-3 px-4 text-gray-600">
                    {{ attendee.age }}
                  </td>
                  <td class="py-3 px-4 text-gray-600">
                    {{ attendee.gender || '-' }}
                  </td>
                  <td class="py-3 px-4 text-gray-600 text-xs">
                    {{ attendee.area_from_name || '-' }}
                  </td>
                  <td class="py-3 px-4">
                    <UBadge 
                      :color="(attendee as any).is_checked_in ? 'green' : 'gray'" 
                      variant="soft"
                      size="xs"
                    >
                      {{ (attendee as any).is_checked_in ? 'Checked In' : 'Not Checked In' }}
                    </UBadge>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-end gap-1">
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="gray"
                        icon="i-heroicons-eye"
                        @click="viewAttendeeDetails(attendee)"
                        title="Quick view"
                      />
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="gray"
                        icon="i-heroicons-pencil"
                        :to="`/events/${id}/m/participants/editor/${attendee.attendee_id}`"
                        title="Edit details"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bookings Table -->
          <div v-else-if="currentView === 'bookings'" class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('booking_reference')"
                  >
                    <div class="flex items-center gap-1">
                      Booking Reference
                      <UIcon 
                        v-if="currentSort === 'booking_reference'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Made By</th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('attendee_count')"
                  >
                    <div class="flex items-center gap-1">
                      Attendees
                      <UIcon 
                        v-if="currentSort === 'attendee_count'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th 
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('booked_at')"
                  >
                    <div class="flex items-center gap-1">
                      Booked At
                      <UIcon 
                        v-if="currentSort === 'booked_at'" 
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="booking in bookings"
                  :key="booking.id"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4">
                    <span class="font-mono text-sm font-semibold text-gray-900">{{ booking.booking_reference }}</span>
                  </td>
                  <td class="py-3 px-4 text-gray-600">
                    {{ booking.made_by_name || 'N/A' }}
                  </td>
                  <td class="py-3 px-4">
                    <UBadge color="blue" variant="soft" size="xs">
                      {{ booking.attendee_count }} {{ booking.attendee_count === 1 ? 'person' : 'people' }}
                    </UBadge>
                  </td>
                  <td class="py-3 px-4 text-gray-600 text-xs">
                    {{ new Date(booking.booked_at).toLocaleString() }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-end gap-1">
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="gray"
                        icon="i-heroicons-eye"
                        title="View details"
                        @click="viewBookingDetails(booking)"
                      >
                        View
                      </UButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="((currentView === 'attendees' && !isLoading && attendees.length > 0) || (currentView === 'bookings' && !bookingsLoading && bookings.length > 0))" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <select
                v-model="pageSize"
                class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option :value="10">10 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
                <option :value="100">100 per page</option>
              </select>
              <span class="text-xs text-gray-500">
                <template v-if="currentView === 'attendees'">
                  Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalAttendees) }} of {{ totalAttendees }}
                </template>
                <template v-else>
                  Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalBookings) }} of {{ totalBookings }}
                </template>
              </span>
            </div>

            <UPagination
              v-model="currentPage"
              :page-count="pageSize"
              :total="currentView === 'attendees' ? totalAttendees : totalBookings"
              :max="7"
            />
          </div>
        </section>
      </div>

      <!-- Right Sidebar Filters (3/12) -->
      <div v-if="showFilters" class="lg:col-span-3">
        <div class="sticky top-24 space-y-4">
          <!-- Filters Card -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="px-5 py-4 bg-primary border-b border-primary">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <UIcon name="i-heroicons-funnel" class="w-4 h-4" />
                  Filters
                </h3>
                <button
                  v-if="activeFilterCount > 0"
                  @click="clearAllFilters"
                  class="text-xs text-white/80 hover:text-white underline"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div class="p-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              
              <!-- Status Filters -->
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Status</label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="filters.isCheckedIn"
                      type="checkbox"
                      :true-value="true"
                      :false-value="undefined"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-gray-700">Checked In Only</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="filters.isRegistered"
                      type="checkbox"
                      :true-value="true"
                      :false-value="undefined"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-gray-700">Registered Only</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="filters.isCancelled"
                      type="checkbox"
                      :true-value="true"
                      :false-value="undefined"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-gray-700">Show Cancelled</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="filters.isMinor"
                      type="checkbox"
                      :true-value="true"
                      :false-value="undefined"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-gray-700">Minors Only</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="filters.isStaff"
                      type="checkbox"
                      :true-value="true"
                      :false-value="undefined"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-gray-700">Staff Only</span>
                  </label>
                </div>
              </div>

              <!-- Organisation Filter -->
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Organisation</label>
                <select
                  v-model="filters.organisation"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="undefined">All Organisations</option>
                  <option v-for="org in organisations" :key="org.id" :value="org.id">
                    {{ org.title }}
                  </option>
                </select>
              </div>

              <!-- Area Filter -->
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Area</label>
                <select
                  v-model="filters.areaFrom"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="undefined">All Areas</option>
                  <option v-for="area in areas" :key="area.id" :value="area.id">
                    {{ area.area_name }}
                  </option>
                </select>
              </div>

              <!-- Gender Filter -->
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Gender</label>
                <select
                  v-model="filters.gender"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="undefined">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <!-- Age Range -->
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Age Range</label>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      v-model.number="filters.ageMin"
                      type="number"
                      placeholder="Min"
                      min="0"
                      max="120"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <input
                      v-model.number="filters.ageMax"
                      type="number"
                      placeholder="Max"
                      min="0"
                      max="120"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <!-- Requirements Filters -->
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Requirements</label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="filters.hasDietaryRequirements"
                      type="checkbox"
                      :true-value="true"
                      :false-value="undefined"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-gray-700">Has Dietary Req.</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="filters.hasMedicalConditions"
                      type="checkbox"
                      :true-value="true"
                      :false-value="undefined"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-gray-700">Has Medical Cond.</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="filters.hasAccessibilityRequirements"
                      type="checkbox"
                      :true-value="true"
                      :false-value="undefined"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-gray-700">Has Accessibility Req.</span>
                  </label>
                </div>
              </div>

            </div>
          </section>

          <!-- Help Card -->
          <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
            <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-primary" />
              <h3 class="text-xs font-black text-primary uppercase tracking-widest">Quick Tips</h3>
            </div>
            <div class="p-5 text-xs space-y-2 text-gray-600">
              <p>• Use search to find attendees by name, email, or phone</p>
              <p>• Click column headers to sort the table</p>
              <p>• Select multiple rows for bulk actions</p>
              <p>• Export filtered results to CSV</p>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Attendee Details Modal -->
    <UModal v-model="showDetailsModal">
      <div v-if="selectedAttendeeDetails" class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ selectedAttendeeDetails.full_name }}</h3>
            <p class="text-sm text-gray-500">{{ selectedAttendeeDetails.attendee_display_id }}</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showDetailsModal = false"
          />
        </div>

        <div class="space-y-4">
          <div class="flex gap-2">
            <UBadge v-if="selectedAttendeeDetails.is_minor" color="amber" variant="soft">Minor</UBadge>
            <UBadge v-if="(selectedAttendeeDetails as any).is_event_staff" color="purple" variant="soft">Staff</UBadge>
            <UBadge :color="(selectedAttendeeDetails as any).is_checked_in ? 'green' : 'gray'" variant="soft">
              {{ (selectedAttendeeDetails as any).is_checked_in ? 'Checked In' : 'Not Checked In' }}
            </UBadge>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Email</p>
              <p class="text-sm text-gray-900">{{ selectedAttendeeDetails.email || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Phone</p>
              <p class="text-sm text-gray-900">{{ selectedAttendeeDetails.phone_number || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Age</p>
              <p class="text-sm text-gray-900">{{ selectedAttendeeDetails.age }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Gender</p>
              <p class="text-sm text-gray-900">{{ selectedAttendeeDetails.gender || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Area From</p>
              <p class="text-sm text-gray-900">{{ (selectedAttendeeDetails as any).area_from_name || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Relationship</p>
              <p class="text-sm text-gray-900">{{ selectedAttendeeDetails.relationship_display }}</p>
            </div>
          </div>

          <div class="pt-4 border-t p-2 m-2">
            <!-- <UButton
              block
              variant="solid"
              color="primary"
              :to="`/events/${id}/m/participants/editor/${selectedAttendeeDetails.attendee_id}`"
            >
              Edit Details
            </UButton> -->
            <UButton
              block
              variant="outline"
              color="gray"
              @click="showDetailsModal = false"
            >
              Close
            </UButton>
          </div>
        </div>
      </div>
    </UModal>

    <!-- Booking Details Modal -->
    <UModal v-model="showBookingDetailsModal">
      <div v-if="selectedBooking" class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900 font-mono">{{ selectedBooking.booking_reference }}</h3>
            <p class="text-sm text-gray-500">Booking Details</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showBookingDetailsModal = false"
          />
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Made By</p>
              <p class="text-sm text-gray-900">{{ selectedBooking.made_by_name || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Booked At</p>
              <p class="text-sm text-gray-900">{{ new Date(selectedBooking.booked_at).toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Attendee Count</p>
              <p class="text-sm text-gray-900">{{ selectedBooking.attendee_count }}</p>
            </div>
          </div>

          <div v-if="selectedBooking.attendees && selectedBooking.attendees.length > 0" class="pt-4 border-t">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Attendees</p>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <NuxtLink
                v-for="attendee in selectedBooking.attendees"
                :key="attendee.attendee_id"
                :to="`/events/${id}/m/participants/editor/${attendee.attendee_id}`"
                class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ attendee.full_name }}</p>
                  <p class="text-xs text-gray-500">{{ attendee.attendee_display_id }}</p>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
              </NuxtLink>
            </div>
          </div>

          <div v-if="selectedBooking.payments && selectedBooking.payments.length > 0" class="pt-4 border-t">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Payments</p>
            <div class="space-y-2">
              <div
                v-for="payment in selectedBooking.payments"
                :key="payment.payment_id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">£{{ payment.amount }}</p>
                  <p class="text-xs text-gray-500">{{ payment.payment_method }}</p>
                </div>
                <UBadge 
                  :color="payment.status === 'completed' ? 'green' : payment.status === 'pending' ? 'amber' : 'red'"
                  variant="soft"
                  size="xs"
                >
                  {{ payment.status }}
                </UBadge>
              </div>
            </div>
          </div>

          <div v-if="selectedBooking.tickets && selectedBooking.tickets.length > 0" class="pt-4 border-t">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Tickets</p>
            <div class="space-y-2">
              <div
                v-for="ticket in selectedBooking.tickets"
                :key="ticket.ticket_id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 font-mono">{{ ticket.ticket_code }}</p>
                  <p class="text-xs text-gray-500">{{ ticket.ticket_type_name }}</p>
                </div>
                <UBadge 
                  :color="ticket.is_used ? 'gray' : 'green'"
                  variant="soft"
                  size="xs"
                >
                  {{ ticket.is_used ? 'Used' : 'Available' }}
                </UBadge>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t flex gap-2">
            <UButton
              block
              variant="outline"
              color="gray"
              @click="showBookingDetailsModal = false"
            >
              Close
            </UButton>
          </div>
        </div>
      </div>
    </UModal>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useAttendees } from '~/composables/resources/attendee/attendees'
import { useBookings } from '~/composables/resources/booking/bookings'
import { useEvent } from '~/composables/resources/events/events'
import { useOrganisations } from '~/composables/resources/organisation/organisations'
import { useAreas } from '~/composables/resources/locations/locations'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import type { AttendeeList, OrganisationList, BookingList } from '~/api/types.gen'

// Extended type with additional fields returned by the API but not in the generated types
interface ExtendedAttendeeList extends AttendeeList {
  area_from_name?: string | null
  is_event_staff?: boolean
  is_checked_in?: boolean
  is_registered?: boolean
  is_cancelled?: boolean
}

// Extended organisation type
interface ExtendedOrganisationList extends OrganisationList {
  organisation_name?: string
}

// Extended booking type
interface ExtendedBookingList extends BookingList {
  attendees?: Array<{
    attendee_id: number
    attendee_display_id: string
    full_name: string
  }>
  payments?: Array<{
    payment_id: number
    amount: number
    payment_method: string
    status: string
  }>
  tickets?: Array<{
    ticket_id: number
    ticket_code: string
    ticket_type_name: string
    is_used: boolean
  }>
}

definePageMeta({
  layout: false,
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

// Fetch event details
const { data: event } = useEvent(id)

// View toggle state
const currentView = ref<'attendees' | 'bookings'>((route.query.view as string) === 'bookings' ? 'bookings' : 'attendees')

// State
const searchQuery = ref(route.query.search as string || '')
const currentPage = ref(Number(route.query.page) || 1)
const pageSize = ref(Number(route.query.page_size) || 25)
const currentSort = ref<string>(route.query.ordering as string || '')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Selection state
const selectedAttendees = ref<string[]>([])
const selectAll = ref(false)
const showFilters = ref(true)

// Modal state
const showDetailsModal = ref(false)
const selectedAttendeeDetails = ref<ExtendedAttendeeList | null>(null)
const showBookingDetailsModal = ref(false)
const selectedBooking = ref<ExtendedBookingList | null>(null)

// Filters state
const filters = ref({
  organisation: route.query.organisation ? Number(route.query.organisation) : undefined,
  areaFrom: route.query.area_from ? Number(route.query.area_from) : undefined,
  gender: route.query.gender as string | undefined,
  ageMin: route.query.age_min ? Number(route.query.age_min) : undefined,
  ageMax: route.query.age_max ? Number(route.query.age_max) : undefined,
  isCheckedIn: route.query.is_checked_in === 'true' ? true : undefined,
  isRegistered: route.query.is_registered === 'true' ? true : undefined,
  isCancelled: route.query.is_cancelled === 'true' ? true : undefined,
  isMinor: route.query.is_minor === 'true' ? true : undefined,
  isStaff: route.query.is_event_staff === 'true' ? true : undefined,
  hasDietaryRequirements: route.query.has_dietary_requirements === 'true' ? true : undefined,
  hasMedicalConditions: route.query.has_medical_conditions === 'true' ? true : undefined,
  hasAccessibilityRequirements: route.query.has_accessibility_requirements === 'true' ? true : undefined,
})

// Debounced search
const debouncedSearch = ref(searchQuery.value)
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
    currentPage.value = 1 // Reset to first page on search
  }, 300)
})

// Computed query parameters for API
const queryParams = computed(() => {
  const params: any = {
    event: id.value,
    page: currentPage.value,
    page_size: pageSize.value,
  }

  if (debouncedSearch.value) {
    params.search = debouncedSearch.value
  }

  if (currentSort.value) {
    params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
  }

  // Apply filters
  if (filters.value.organisation) params.organisation = filters.value.organisation
  if (filters.value.areaFrom) params.area_from = filters.value.areaFrom
  if (filters.value.gender) params.gender = filters.value.gender
  if (filters.value.ageMin) params.age_min = filters.value.ageMin
  if (filters.value.ageMax) params.age_max = filters.value.ageMax
  if (filters.value.isCheckedIn !== undefined) params.is_checked_in = filters.value.isCheckedIn
  if (filters.value.isRegistered !== undefined) params.is_registered = filters.value.isRegistered
  if (filters.value.isCancelled !== undefined) params.is_cancelled = filters.value.isCancelled
  if (filters.value.isMinor !== undefined) params.is_minor = filters.value.isMinor
  if (filters.value.isStaff !== undefined) params.is_event_staff = filters.value.isStaff
  if (filters.value.hasDietaryRequirements !== undefined) params.has_dietary_requirements = filters.value.hasDietaryRequirements
  if (filters.value.hasMedicalConditions !== undefined) params.has_medical_conditions = filters.value.hasMedicalConditions
  if (filters.value.hasAccessibilityRequirements !== undefined) params.has_accessibility_requirements = filters.value.hasAccessibilityRequirements

  return params
})

// Bookings query parameters
const bookingsQueryParams = computed(() => {
  const params: any = {
    event__event_id: id.value,
    page: currentPage.value,
    page_size: pageSize.value,
  }

  if (debouncedSearch.value) {
    params.search = debouncedSearch.value // Search by booking reference
  }

  if (currentSort.value) {
    params.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
  }

  return params
})

// Fetch attendees with reactive query params
const { data: attendeesData, isLoading } = useAttendees(queryParams)

// Fetch bookings
const { data: bookingsData, isLoading: bookingsLoading } = useBookings(bookingsQueryParams)

// Fetch organisations for filter dropdown
const { data: organisationsData } = useOrganisations({ page_size: 100 })

// Fetch areas for filter dropdown
const { data: areasData } = useAreas({ page_size: 100 })

// Computed values
const attendees = computed(() => (attendeesData.value?.data?.results || []) as ExtendedAttendeeList[])
const totalAttendees = computed(() => attendeesData.value?.data?.count || 0)
const bookings = computed(() => (bookingsData.value?.data?.results || []) as BookingList[])
const totalBookings = computed(() => bookingsData.value?.data?.count || 0)
const organisations = computed(() => organisationsData.value?.data?.results || [])
const areas = computed(() => areasData.value?.data?.results || [])

// Statistics - these would ideally come from separate API endpoints for performance
// For now, we'll fetch with specific filters
const { data: checkedInData } = useAttendees(computed(() => ({
  event: id.value,
  is_checked_in: true,
  page_size: 1,
})))
const checkedInCount = computed(() => checkedInData.value?.data?.count || 0)

const { data: minorData } = useAttendees(computed(() => ({
  event: id.value,
  is_minor: true,
  page_size: 1,
})))
const minorCount = computed(() => minorData.value?.data?.count || 0)

const { data: staffData } = useAttendees(computed(() => ({
  event: id.value,
  is_event_staff: true,
  page_size: 1,
})))
const staffCount = computed(() => staffData.value?.data?.count || 0)

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.organisation) count++
  if (filters.value.areaFrom) count++
  if (filters.value.gender) count++
  if (filters.value.ageMin) count++
  if (filters.value.ageMax) count++
  if (filters.value.isCheckedIn !== undefined) count++
  if (filters.value.isRegistered !== undefined) count++
  if (filters.value.isCancelled !== undefined) count++
  if (filters.value.isMinor !== undefined) count++
  if (filters.value.isStaff !== undefined) count++
  if (filters.value.hasDietaryRequirements !== undefined) count++
  if (filters.value.hasMedicalConditions !== undefined) count++
  if (filters.value.hasAccessibilityRequirements !== undefined) count++
  return count
})

// Sync state to URL query params
watch([searchQuery, currentPage, pageSize, currentSort, sortDirection, filters, currentView], () => {
  const query: any = {}
  
  if (searchQuery.value) query.search = searchQuery.value
  if (currentPage.value > 1) query.page = currentPage.value
  if (pageSize.value !== 25) query.page_size = pageSize.value
  if (currentSort.value) query.ordering = sortDirection.value === 'desc' ? `-${currentSort.value}` : currentSort.value
  if (currentView.value === 'bookings') query.view = 'bookings'
  
  if (filters.value.organisation) query.organisation = filters.value.organisation
  if (filters.value.areaFrom) query.area_from = filters.value.areaFrom
  if (filters.value.gender) query.gender = filters.value.gender
  if (filters.value.ageMin) query.age_min = filters.value.ageMin
  if (filters.value.ageMax) query.age_max = filters.value.ageMax
  if (filters.value.isCheckedIn !== undefined) query.is_checked_in = filters.value.isCheckedIn
  if (filters.value.isRegistered !== undefined) query.is_registered = filters.value.isRegistered
  if (filters.value.isCancelled !== undefined) query.is_cancelled = filters.value.isCancelled
  if (filters.value.isMinor !== undefined) query.is_minor = filters.value.isMinor
  if (filters.value.isStaff !== undefined) query.is_event_staff = filters.value.isStaff
  if (filters.value.hasDietaryRequirements !== undefined) query.has_dietary_requirements = filters.value.hasDietaryRequirements
  if (filters.value.hasMedicalConditions !== undefined) query.has_medical_conditions = filters.value.hasMedicalConditions
  if (filters.value.hasAccessibilityRequirements !== undefined) query.has_accessibility_requirements = filters.value.hasAccessibilityRequirements

  router.replace({ query })
}, { deep: true })

// Functions
function changeView(view: 'attendees' | 'bookings') {
  currentView.value = view
  currentPage.value = 1 // Reset to first page
  selectedAttendees.value = [] // Clear selection
  selectAll.value = false
}

function setSorting(field: string) {
  if (currentSort.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    currentSort.value = field
    sortDirection.value = 'asc'
  }
}

function clearAllFilters() {
  searchQuery.value = ''
  filters.value = {
    organisation: undefined,
    areaFrom: undefined,
    gender: undefined,
    ageMin: undefined,
    ageMax: undefined,
    isCheckedIn: undefined,
    isRegistered: undefined,
    isCancelled: undefined,
    isMinor: undefined,
    isStaff: undefined,
    hasDietaryRequirements: undefined,
    hasMedicalConditions: undefined,
    hasAccessibilityRequirements: undefined,
  }
  currentPage.value = 1
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedAttendees.value = attendees.value.map(a => a.attendee_id)
  } else {
    selectedAttendees.value = []
  }
}

function viewAttendeeDetails(attendee: ExtendedAttendeeList) {
  selectedAttendeeDetails.value = attendee
  showDetailsModal.value = true
}

function viewBookingDetails(booking: ExtendedBookingList) {
  selectedBooking.value = booking
  showBookingDetailsModal.value = true
}

function exportToCSV() {
  // Generate CSV from current filtered attendees
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'Area', 'Status', 'Minor', 'Staff']
  const currentAttendees = attendees.value as ExtendedAttendeeList[]
  const rows = currentAttendees.map(a => [
    a.attendee_display_id,
    a.full_name,
    a.email || '',
    a.phone_number || '',
    a.age,
    a.gender || '',
    a.area_from_name || '',
    a.is_checked_in ? 'Checked In' : 'Not Checked In',
    a.is_minor ? 'Yes' : 'No',
    a.is_event_staff ? 'Yes' : 'No',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `attendees-${event.value?.data?.title || 'export'}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Watch selected attendees for select all checkbox
watch(selectedAttendees, (newVal) => {
  selectAll.value = newVal.length === attendees.value.length && attendees.value.length > 0
})

// Reset selection when page changes
watch(currentPage, () => {
  selectedAttendees.value = []
  selectAll.value = false
})
</script>