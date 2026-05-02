<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">
      <!-- Main Content (full width) -->
      <div class="space-y-6">
        
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
          <template v-else-if="currentView === 'bookings'">
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

          <!-- Families View Statistics -->
          <template v-else-if="currentView === 'families'">
            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-home-modern" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalFamilyGroups }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Families</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ visibleFamilyMembers }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Visible Members</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ familiesWithMembers }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Families With Members</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-users" class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ familyGroups.length }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Groups On This Page</div>
                </div>
              </div>
            </div>
          </template>

          <!-- Tickets View Statistics -->
          <template v-else-if="currentView === 'tickets'">
            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-ticket" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalIssuedTickets }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Tickets</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ activeIssuedTickets }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Active Tickets</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-check-badge" class="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ usedIssuedTickets }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Used Tickets</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-no-symbol" class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ cancelledIssuedTickets }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Cancelled Tickets</div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-blue-600" />
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
                  <UIcon name="i-heroicons-home-modern" class="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalFamilyGroups }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Family Groups</div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-ticket" class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div class="text-2xl font-black text-deep-navy">{{ totalBookings }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Bookings</div>
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
              <UIcon :name="currentView === 'attendees' ? 'i-heroicons-user-group' : currentView === 'bookings' ? 'i-heroicons-ticket' : currentView === 'families' ? 'i-heroicons-home-modern' : currentView === 'tickets' ? 'i-heroicons-tag' : 'i-heroicons-chart-bar'" class="w-5 h-5 text-primary" />
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <h2 class="text-sm font-black text-primary uppercase tracking-widest">
                    {{ currentView === 'attendees' ? 'Event Participants' : currentView === 'bookings' ? 'Event Bookings' : currentView === 'families' ? 'Event Families' : currentView === 'tickets' ? 'Event Tickets' : 'Event Statistics' }}
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
                    <button
                      @click="changeView('statistics')"
                      :class="[
                        'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                        currentView === 'statistics'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      ]"
                    >
                      Statistics
                    </button>
                    <button
                      @click="changeView('tickets')"
                      :class="[
                        'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                        currentView === 'tickets'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      ]"
                    >
                      Tickets
                    </button>
                    <button
                      @click="changeView('families')"
                      :class="[
                        'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                        currentView === 'families'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      ]"
                    >
                      Families
                    </button>
                  </div>
                </div>
                <p class="text-xs text-gray-500">
                  <template v-if="currentView === 'attendees'">
                    Showing {{ attendees.length }} of {{ totalAttendees }} participants
                  </template>
                  <template v-else-if="currentView === 'bookings'">
                    Showing {{ bookings.length }} of {{ totalBookings }} bookings
                  </template>
                  <template v-else-if="currentView === 'families'">
                    Showing {{ familyGroups.length }} of {{ totalFamilyGroups }} families
                  </template>
                  <template v-else-if="currentView === 'tickets'">
                    Manage ticket types and issued tickets for this event
                  </template>
                  <template v-else>
                    Statistics and analytics for event participants
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
                icon="i-heroicons-funnel"
                @click="showFiltersModal = true"
              >
                Filters
                <UBadge v-if="activeFilterCount > 0" color="primary" size="xs" class="ml-1">{{ activeFilterCount }}</UBadge>
              </UButton>
              <!-- Export Button -->
              <UButton
                v-if="currentView === 'attendees'"
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
                v-if="currentView === 'attendees'"
                size="sm"
                variant="solid"
                color="primary"
                icon="i-heroicons-plus"
                @click="showCreateModal = true"
              >
                Add Attendee
              </UButton>
            </div>
          </div>

          <!-- Search Bar -->
          <div v-if="currentView !== 'tickets'" class="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <div class="relative">
                  <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="currentView === 'attendees' ? 'Search by name, email, phone, or ID...' : currentView === 'bookings' ? 'Search by booking reference...' : currentView === 'families' ? 'Search family name...' : 'Search statistics...'"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              <!-- Active Filters Badge -->
              <div v-if="currentView === 'attendees' && activeFilterCount > 0" class="flex items-center gap-2">
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
                v-if="currentView === 'attendees'"
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

          <!-- Active Filter Chips -->
          <div v-if="currentView === 'attendees' && activeFilterChips.length > 0" class="px-6 py-3 border-b border-gray-100 bg-white">
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="chip in activeFilterChips"
                :key="chip.key"
                color="primary"
                variant="soft"
                class="flex items-center gap-1.5 px-2.5 py-1"
              >
                <span class="text-xs">{{ chip.label }}: {{ chip.value }}</span>
                <button
                  @click="removeFilter(chip.key)"
                  class="hover:bg-primary/10 rounded-full p-0.5 transition-colors"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                </button>
              </UBadge>
            </div>
          </div>

          <!-- Table -->
          <div v-if="currentView === 'tickets'">
            <TicketsTab
              :event-id="id"
              :event-pk="event?.data?.id"
              :event-start-date="event?.data?.start_datetime"
              :event-end-date="event?.data?.end_datetime"
            />
          </div>

          <div v-else-if="(currentView === 'attendees' && isLoading) || (currentView === 'bookings' && bookingsLoading) || (currentView === 'families' && familyGroupsLoading)" class="p-6 space-y-3">
            <div v-for="i in 10" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <div v-else-if="(currentView === 'attendees' && attendees.length === 0) || (currentView === 'bookings' && bookings.length === 0) || (currentView === 'families' && familyGroups.length === 0)" class="p-12 text-center">
            <UIcon :name="currentView === 'attendees' ? 'i-heroicons-user-group' : currentView === 'bookings' ? 'i-heroicons-ticket' : 'i-heroicons-home-modern'" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ currentView === 'attendees' ? 'No participants found' : currentView === 'bookings' ? 'No bookings found' : 'No families found' }}
            </h3>
            <p class="text-sm text-gray-500 mb-4">
              {{ searchQuery || (currentView === 'attendees' && activeFilterCount > 0) 
                ? 'Try adjusting your filters or search query' 
                : currentView === 'attendees' 
                  ? 'No attendees have been registered for this event yet' 
                  : currentView === 'bookings' 
                    ? 'No bookings have been made for this event yet' 
                    : 'No family groups have been created for this event yet'
              }}
            </p>
            <UButton
              v-if="searchQuery || (currentView === 'attendees' && activeFilterCount > 0)"
              variant="soft"
              color="gray"
              @click="clearAllFilters"
            >
              Clear filters
            </UButton>
            <UButton
              v-else-if="currentView === 'attendees'"
              color="primary"
              @click="showCreateModal = true"
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
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="red"
                        icon="i-heroicons-trash"
                        title="Remove attendee"
                        @click="openPreRemovalModal(attendee)"
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

          <!-- Families Table -->
          <div v-else-if="currentView === 'families'" class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                  <th
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('family_name')"
                  >
                    <div class="flex items-center gap-1">
                      Family Name
                      <UIcon
                        v-if="currentSort === 'family_name'"
                        :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                        class="w-4 h-4"
                      />
                    </div>
                  </th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Members</th>
                  <th class="py-3 px-4 font-semibold text-gray-700">Scope</th>
                  <th
                    class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click="setSorting('created_at')"
                  >
                    <div class="flex items-center gap-1">
                      Created
                      <UIcon
                        v-if="currentSort === 'created_at'"
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
                  v-for="group in familyGroups"
                  :key="group.id"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4">
                    <div class="font-semibold text-gray-900">{{ group.family_name }}</div>
                    <div class="text-xs text-gray-500">Family ID #{{ group.id }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <UBadge color="blue" variant="soft" size="xs">
                      {{ group.member_count }} {{ group.member_count === 1 ? 'member' : 'members' }}
                    </UBadge>
                  </td>
                  <td class="py-3 px-4 text-xs text-gray-600">
                    Event #{{ group.event || 'N/A' }}
                  </td>
                  <td class="py-3 px-4 text-gray-600 text-xs">
                    {{ new Date(group.created_at).toLocaleString() }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-end gap-1">
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="gray"
                        icon="i-heroicons-eye"
                        @click="openFamilyMembersModal(group)"
                      >
                        Open
                      </UButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Statistics View -->
          <div v-else-if="currentView === 'statistics'">
            <StatisticsIndex />
          </div>

          <!-- Pagination -->
          <div v-if="((currentView === 'attendees' && !isLoading && attendees.length > 0) || (currentView === 'bookings' && !bookingsLoading && bookings.length > 0) || (currentView === 'families' && !familyGroupsLoading && familyGroups.length > 0))" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
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
                <template v-else-if="currentView === 'bookings'">
                  Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalBookings) }} of {{ totalBookings }}
                </template>
                <template v-else>
                  Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalFamilyGroups) }} of {{ totalFamilyGroups }}
                </template>
              </span>
            </div>

            <UPagination
              v-model="currentPage"
              :page-count="pageSize"
              :total="currentView === 'attendees' ? totalAttendees : currentView === 'bookings' ? totalBookings : totalFamilyGroups"
              :max="7"
            />
          </div>
        </section>
      </div>
    </div>

    <!-- Attendee Filters Modal -->
    <AttendeeFiltersModal
      v-model="showFiltersModal"
      :filters="filters"
      :organisations="organisations"
      :areas="areas"
      :dietary-requirements="dietaryRequirements"
      :medical-conditions="medicalConditions"
      :accessibility-requirements="accessibilityRequirements"
      :event-questions="eventQuestions"
      @apply="applyFilters"
      @clear="clearAllFilters"
      @question-search-input="handleQuestionSearchInput"
    />

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
            <UButton
              block
              variant="solid"
              class="mb-2"
              color="primary"
              :to="`/events/${id}/m/participants/editor/${selectedAttendeeDetails.attendee_id}?tab=booking`"
            >
              View booking
            </UButton>
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
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900 font-mono">{{ selectedBooking?.booking_reference || 'Booking details' }}</h3>
            <p class="text-sm text-gray-500">Booking Details</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showBookingDetailsModal = false"
          />
        </div>

        <div v-if="selectedBookingLoading" class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <div v-else-if="selectedBooking" class="space-y-4">
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
                :key="attendee.id"
                :to="attendee.id ? `/events/${id}/m/participants/editor/${attendee.id}` : '#'"
                class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ attendee.name || 'Unknown attendee' }}</p>
                  <p class="text-xs text-gray-500">{{ attendee.display_id || 'No attendee ID' }}</p>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
              </NuxtLink>
            </div>
          </div>

          <div v-if="selectedBooking.payments && selectedBooking.payments.length > 0" class="pt-4 border-t">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Payments</p>
            <div class="space-y-2">
              <button
                v-for="payment in selectedBooking.payments"
                :key="payment.payment_id"
                type="button"
                class="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                @click="goToPaymentListFromBooking(payment.payment_reference)"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ payment.payment_reference || payment.payment_id }}</p>
                  <p class="text-xs text-gray-500">{{ payment.amount ? `${payment.amount}` : 'Amount unavailable' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="payment.status === 'COMPLETED' ? 'green' : payment.status === 'PENDING' ? 'amber' : 'red'"
                    variant="soft"
                    size="xs"
                  >
                    {{ payment.status || 'UNKNOWN' }}
                  </UBadge>
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 text-gray-400" />
                </div>
              </button>
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
                  <p class="text-xs text-gray-500">{{ ticket.attendee_name }}</p>
                </div>
                <UBadge
                  :color="ticket.status === 'USED' ? 'gray' : ticket.status === 'ACTIVE' ? 'green' : 'red'"
                  variant="soft"
                  size="xs"
                >
                  {{ ticket.status || 'UNKNOWN' }}
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

        <div v-else class="text-sm text-gray-500 pt-4 border-t">
          Unable to load booking details.
        </div>
      </div>
    </UModal>

    <!-- Family Members Modal -->
    <UModal v-model="showFamilyMembersModal" :ui="{ width: 'sm:max-w-5xl' }">
      <div v-if="selectedFamilyGroup" class="p-6">
        <div class="flex items-start justify-between mb-4 gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="text-xl font-bold text-gray-900">Family Group</h3>
            <p class="text-sm text-gray-500">Edit the family name and update each member's relationship and head status.</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showFamilyMembersModal = false"
          />
        </div>

        <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
          <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div class="flex-1">
              <label class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Family Name</label>
              <input
                v-model="editingFamilyName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <UButton
              color="primary"
              :loading="savingFamilyName || updateFamilyGroupMutation.isPending.value"
              :disabled="savingFamilyName || updateFamilyGroupMutation.isPending.value"
              @click="handleSaveFamilyName"
            >
              Save Name
            </UButton>
          </div>
        </div>

        <div v-if="familyMembersLoading" class="space-y-2">
          <div v-for="i in 5" :key="i" class="h-12 bg-gray-100 rounded animate-pulse" />
        </div>

        <div v-else-if="familyMembers.length === 0" class="py-10 text-center border border-dashed border-gray-200 rounded-xl">
          <UIcon name="i-heroicons-user-group" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-500">No family members found for this group.</p>
        </div>

        <div v-else class="border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="py-2.5 px-3 text-left font-semibold text-gray-700">Attendee</th>
                <th class="py-2.5 px-3 text-left font-semibold text-gray-700">Relationship</th>
                <th class="py-2.5 px-3 text-left font-semibold text-gray-700">Head</th>
                <th class="py-2.5 px-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in familyMembers"
                :key="member.id"
                class="border-b border-gray-100 last:border-b-0"
              >
                <td class="py-2.5 px-3">
                  <div class="font-medium text-gray-900">{{ member.attendee_name }}</div>
                  <div class="text-xs text-gray-500">Membership #{{ member.id }}</div>
                </td>
                <td class="py-2.5 px-3">
                  <select
                    :value="member.relationship"
                    class="w-full max-w-[170px] px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    :disabled="updateFamilyAttendeeMutation.isPending.value"
                    @change="handleUpdateFamilyMemberRelationship(member, ($event.target as HTMLSelectElement).value as FamilyRelationship)"
                  >
                    <option
                      v-for="option in familyRelationshipOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </td>
                <td class="py-2.5 px-3">
                  <label class="inline-flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      :checked="Boolean(member.is_primary_guardian)"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                      :disabled="updateFamilyAttendeeMutation.isPending.value"
                      @change="handleToggleFamilyHead(member, ($event.target as HTMLInputElement).checked)"
                    />
                    Primary guardian
                  </label>
                </td>
                <td class="py-2.5 px-3 text-right">
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="red"
                    icon="i-heroicons-trash"
                    :disabled="deleteFamilyAttendeeMutation.isPending.value"
                    @click="handleRemoveFamilyMember(member)"
                  >
                    Remove
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Total members: {{ totalFamilyMembers }}</span>
          <UButton
            variant="outline"
            color="gray"
            @click="showFamilyMembersModal = false"
          >
            Close
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Create Attendee Modal -->
    <UModal v-model="showCreateModal" :ui="{ width: 'sm:max-w-2xl' }">
      <div class="p-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Add New Participant</h3>
            <p class="text-sm text-gray-500 mt-1">Fill in the details to create a new attendee for this event</p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showCreateModal = false"
          />
        </div>

        <form @submit.prevent="handleCreateAttendee" class="space-y-6">
          <!-- Personal Information Section -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
              Personal Information
            </h4>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newAttendeeForm.first_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  :class="{ 'border-red-500': formErrors.first_name }"
                />
                <p v-if="formErrors.first_name" class="text-xs text-red-500 mt-1">{{ formErrors.first_name }}</p>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newAttendeeForm.last_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  :class="{ 'border-red-500': formErrors.last_name }"
                />
                <p v-if="formErrors.last_name" class="text-xs text-red-500 mt-1">{{ formErrors.last_name }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                  Email
                </label>
                <input
                  v-model="newAttendeeForm.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  :class="{ 'border-red-500': formErrors.email }"
                />
                <p v-if="formErrors.email" class="text-xs text-red-500 mt-1">{{ formErrors.email }}</p>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                  Phone Number
                </label>
                <input
                  v-model="newAttendeeForm.phone_number"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                  Date of Birth <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="newAttendeeForm.date_of_birth"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  :class="{ 'border-red-500': formErrors.date_of_birth }"
                />
                <p v-if="formErrors.date_of_birth" class="text-xs text-red-500 mt-1">{{ formErrors.date_of_birth }}</p>
                <p v-if="previewAge !== null" class="text-xs text-gray-500 mt-1">Age: {{ previewAge }} years old</p>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                  Gender
                </label>
                <select
                  v-model="newAttendeeForm.gender"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="null">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Booking Association Section -->
          <div class="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 class="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
              <UIcon name="i-heroicons-ticket" class="w-4 h-4" />
              Booking Association <span class="text-amber-600">*</span>
            </h4>
            <p class="text-xs text-amber-800">
              Attendees should be linked to a booking for proper event management and payment tracking.
            </p>

            <div>
              <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                Search & Select Booking
              </label>
              <input
                v-model="bookingSearchQuery"
                type="text"
                placeholder="Search by booking reference or attendee name..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-2"
              />
              
              <select
                v-model="newAttendeeForm.booking"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                :class="{ 'border-amber-400': formErrors.booking }"
              >
                <option :value="null">Select a booking</option>
                <option 
                  v-for="booking in filteredBookings" 
                  :key="booking.id" 
                  :value="booking.id"
                >
                  {{ booking.booking_reference }} - {{ booking.made_by_name || 'N/A' }} ({{ booking.attendee_count }} attendee{{ booking.attendee_count !== 1 ? 's' : '' }})
                  <template v-if="booking.attendees && booking.attendees.length > 0">
                    - {{ booking.attendees.map(a => a.full_name || '').filter(Boolean).join(', ') }}
                  </template>
                </option>
              </select>
              <p v-if="formErrors.booking" class="text-xs text-amber-600 mt-1">{{ formErrors.booking }}</p>
              <p v-if="filteredBookings.length === 0" class="text-xs text-gray-500 mt-2">
                No bookings found. <NuxtLink :to="`/events/${id}/m/bookings`" class="text-primary underline">Create a booking first</NuxtLink>
              </p>
            </div>
          </div>

          <!-- Event Details Section -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
              Additional Details
            </h4>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                  Relationship to User
                </label>
                <select
                  v-model="newAttendeeForm.relationship_to_user"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="self">Self</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="friend">Friend</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">
                  Area From
                </label>
                <select
                  v-model="newAttendeeForm.area_from"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="null">Select area</option>
                  <option v-for="area in areas" :key="area.id" :value="area.id">
                    {{ area.area_name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex gap-3 pt-4 border-t">
            <UButton
              type="button"
              variant="outline"
              color="gray"
              @click="showCreateModal = false"
              class="flex-1"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              variant="solid"
              color="primary"
              :loading="createAttendeeMutation.isPending.value"
              :disabled="createAttendeeMutation.isPending.value"
              class="flex-1"
            >
              Create Attendee
            </UButton>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Pre-removal Summary Modal -->
    <UModal v-model="showPreRemovalModal" :ui="{ width: 'sm:max-w-3xl' }">
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Pre-removal summary</h3>
            <p class="text-sm text-gray-500">
              {{ selectedDeleteAttendee?.full_name }} ({{ selectedDeleteAttendee?.attendee_display_id }})
            </p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showPreRemovalModal = false"
          />
        </div>

        <div v-if="preRemovalSummaryLoading" class="space-y-2">
          <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <div v-else-if="preRemovalSummaryError" class="p-4 border border-red-200 bg-red-50 rounded-lg text-sm text-red-700">
          Unable to load pre-removal summary. Please try again.
        </div>

        <div v-else-if="preRemovalSummary" class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div class="text-xs text-gray-500">Linked Payments</div>
              <div class="text-base font-bold text-gray-900">{{ preRemovalSummary.summary_counts.linked_payments }}</div>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div class="text-xs text-gray-500">Active Tickets</div>
              <div class="text-base font-bold text-gray-900">{{ preRemovalSummary.summary_counts.active_tickets }}</div>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div class="text-xs text-gray-500">Unresolved Orders</div>
              <div class="text-base font-bold text-gray-900">{{ preRemovalSummary.summary_counts.unresolved_orders }}</div>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div class="text-xs text-gray-500">Open Attendance</div>
              <div class="text-base font-bold text-gray-900">{{ preRemovalSummary.summary_counts.open_attendance }}</div>
            </div>
          </div>

          <div
            :class="[
              'p-4 rounded-lg border text-sm',
              preRemovalSummary.can_delete
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            ]"
          >
            <span v-if="preRemovalSummary.can_delete">This attendee can be safely deleted.</span>
            <span v-else>Deletion is blocked until the listed blockers are resolved.</span>
          </div>

          <div v-if="preRemovalSummary.blockers.length > 0" class="space-y-3">
            <h4 class="text-xs font-semibold uppercase text-gray-500">Blockers</h4>
            <div
              v-for="blocker in preRemovalSummary.blockers"
              :key="blocker.code"
              class="p-3 border border-gray-200 rounded-lg space-y-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-gray-900">{{ blocker.message }}</div>
                  <p class="text-xs text-gray-600 mt-1">{{ blocker.count }} item(s). {{ blocker.action_hint }}</p>
                </div>
                <UBadge
                  :color="blocker.severity === 'critical' ? 'red' : blocker.severity === 'high' ? 'orange' : 'gray'"
                  variant="soft"
                  size="xs"
                >
                  {{ blocker.severity }}
                </UBadge>
              </div>

              <div v-if="blocker.items.length > 0" class="space-y-2">
                <div
                  v-for="(item, idx) in blocker.items"
                  :key="`${blocker.code}-${item.payment_id || item.ticket_id || item.order_id || item.attendance_id || idx}`"
                  class="border border-gray-200 rounded-lg p-3 bg-gray-50/60"
                >
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div class="space-y-1 min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="text-sm font-semibold text-gray-900 truncate">{{ item.payment_reference || item.ticket_code || item.order_reference || item.event_title || 'Related item' }}</span>
                        <UBadge v-if="item.payment_descriptor" color="blue" variant="soft" size="xs">{{ item.payment_descriptor }}</UBadge>
                        <UBadge v-if="item.payment_status" color="gray" variant="soft" size="xs">{{ item.payment_status }}</UBadge>
                        <UBadge v-else-if="item.payment_status_bucket" color="gray" variant="soft" size="xs">{{ item.payment_status_bucket }}</UBadge>
                      </div>

                      <p class="text-xs text-gray-600">
                        <template v-if="item.amount">
                          {{ item.amount }}
                          <span v-if="item.currency">({{ item.currency }})</span>
                        </template>
                        <template v-else-if="item.order_amount">
                          {{ item.order_amount }}
                        </template>
                        <template v-else>
                          No amount context
                        </template>
                        <span v-if="item.method_title"> • {{ item.method_title }}</span>
                        <span v-else-if="item.method_type"> • {{ item.method_type }}</span>
                        <span v-if="item.payment_status_bucket"> • {{ item.payment_status_bucket }}</span>
                      </p>

                      <p v-if="item.order_attendee_name" class="text-xs text-gray-600">Attendee: {{ item.order_attendee_name }}</p>
                      <p v-if="item.check_in_time" class="text-xs text-gray-600">Checked in: {{ new Date(item.check_in_time).toLocaleString() }}</p>

                      <div v-if="item.active_refunds && item.active_refunds.length > 0" class="pt-1 space-y-1">
                        <p class="text-xs font-semibold text-gray-700 uppercase">Active Refund Requests</p>
                        <div
                          v-for="refund in item.active_refunds"
                          :key="refund.refund_id"
                          class="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 bg-white"
                        >
                          {{ refund.tracking_reference }} • {{ refund.verification_status }} • {{ refund.amount }}
                        </div>
                      </div>
                    </div>

                    <div v-if="item.payment_id" class="flex flex-col md:items-end gap-2 shrink-0">
                      <UButton
                        color="blue"
                        variant="solid"
                        size="sm"
                        :disabled="item.can_request_refund === false"
                        @click="openAttendeeRefundModalFromBlockerItem(item)"
                      >
                        Request refund for this payment
                      </UButton>
                      <p
                        v-if="item.can_request_refund === false && item.refund_block_reason"
                        class="text-xs text-amber-700 max-w-xs text-left md:text-right"
                      >
                        {{ item.refund_block_reason }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p v-if="blocker.pagination" class="text-xs text-gray-500">
                Showing {{ blocker.items.length }} of {{ blocker.pagination.count }} items (page {{ blocker.pagination.page }} of {{ blocker.pagination.total_pages }}).
              </p>
            </div>
          </div>

          <div class="pt-2 flex gap-2">
            <UButton
              variant="outline"
              color="gray"
              class="flex-1"
              @click="showPreRemovalModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              class="flex-1"
              :disabled="!preRemovalSummary.can_delete || deleteAttendeeMutation.isPending.value"
              :loading="deleteAttendeeMutation.isPending.value"
              @click="confirmDeleteAttendee"
            >
              Delete Attendee
            </UButton>
          </div>
        </div>
      </div>
    </UModal>

    <RefundRequestModal
      v-if="selectedDeleteAttendee && selectedRefundPaymentId"
      :open="showRefundModal"
      mode="attendee"
      :attendee="selectedDeleteAttendee"
      :payment-id="selectedRefundPaymentId"
      :is-booking-payment="isSelectedRefundBookingPayment"
      :booking-attendees="selectedRefundBookingAttendees"
      :event-detail="event?.data"
      @close="showRefundModal = false"
      @created="handleAttendeeRefundCreated"
    />
  </EventManagementLayout>
</template>

<script setup lang="ts">
import {
  useAttendees,
  useCreateAttendee,
  useDeleteAttendee,
  useAttendeePreRemovalSummary,
  type AttendeePreRemovalSummary,
  type AttendeePreRemovalBlockerItem,
} from '~/composables/resources/attendee/attendees'
import { useBooking, useBookings } from '~/composables/resources/booking/bookings'
import { useBookingTickets } from '~/composables/resources/booking/bookingTickets'
import { useEvent } from '~/composables/resources/events/events'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import { useOrganisations } from '~/composables/resources/organisation/organisations'
import { useAreas } from '~/composables/resources/locations/locations'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { useFamilyGroups, useFamilyGroupMembers, usePartialUpdateFamilyGroup } from '~/composables/resources/common/familyGroups'
import { usePartialUpdateFamilyAttendee, useDeleteFamilyAttendee } from '~/composables/resources/common/familyAttendees'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import AttendeeFiltersModal from '~/components/attendees/AttendeeFiltersModal.vue'
import RefundRequestModal from '~/components/events/modals/RefundRequestModal.vue'
import TicketsTab from '~/components/events/participants/TicketsTab.vue'
import StatisticsIndex from './statistics/index.vue'
import type { AttendeeList, OrganisationList, BookingList, BookingDetail, FamilyGroupList, FamilyAttendee, AttendeeCreateRequest, EventQuestion, EventQuestionOption, DietaryRequirement, MedicalCondition, AccessibilityRequirement } from '~/api/types.gen'

// Extended type with additional fields returned by the API but not in the generated types
interface ExtendedAttendeeList extends AttendeeList {
  // area_from_name?: string | null
  is_event_staff?: boolean
  is_checked_in?: boolean
  is_registered?: boolean
  is_cancelled?: boolean
}

interface ExtendedBookingList extends Omit<BookingList, 'attendees'> {
  attendees?: Array<{
    attendee_id?: number | string
    attendee_display_id?: string
    full_name?: string
  }>
}

// Extended organisation type
interface ExtendedOrganisationList extends OrganisationList {
  organisation_name?: string
}

type FamilyRelationship = FamilyAttendee['relationship']

const familyRelationshipOptions: Array<{ value: FamilyRelationship; label: string }> = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
]

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
const currentView = ref<'attendees' | 'bookings' | 'families' | 'statistics' | 'tickets'>(
  (route.query.view as string) === 'bookings' ? 'bookings' : 
  (route.query.view as string) === 'families' ? 'families' : 
  (route.query.view as string) === 'statistics' ? 'statistics' : 
  (route.query.view as string) === 'tickets' ? 'tickets' :
  'attendees'
)

// State
const searchQuery = ref(route.query.search as string || '')
const currentPage = ref(Number(route.query.page) || 1)
const pageSize = ref(Number(route.query.page_size) || 25)
const currentSort = ref<string>(route.query.ordering as string || '')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Selection state
const selectedAttendees = ref<string[]>([])
const selectAll = ref(false)

// Modal state
const showDetailsModal = ref(false)
const selectedAttendeeDetails = ref<ExtendedAttendeeList | null>(null)
const showBookingDetailsModal = ref(false)
const selectedBookingId = ref<number | null>(null)
const showFamilyMembersModal = ref(false)
const selectedFamilyGroup = ref<FamilyGroupList | null>(null)
const editingFamilyName = ref('')
const savingFamilyName = ref(false)
const showFilters = ref(false)
const showFiltersModal = ref(false)
const currentFilterTab = ref<'basic' | 'questions' | 'orders' | 'advanced'>('basic')
const showCreateModal = ref(false)
const showPreRemovalModal = ref(false)
const selectedDeleteAttendee = ref<ExtendedAttendeeList | null>(null)
const showRefundModal = ref(false)
const selectedRefundPaymentId = ref<string | null>(null)
const isSelectedRefundBookingPayment = ref(false)
const selectedRefundBookingAttendees = ref<Array<{ id: string; full_name: string }> | null>(null)

// Create attendee form state
const newAttendeeForm = ref<AttendeeCreateRequest>({
  first_name: '',
  last_name: '',
  email: null,
  phone_number: null,
  date_of_birth: null,
  gender: null,
  relationship_to_user: 'self',
  event: null,
  user: null,
  area_from: null,
  booking: null,
})

const bookingSearchQuery = ref('')
const formErrors = ref<Record<string, string>>({})

// Filters state - comprehensive filter support
const filters = ref({
  // Demographics
  organisation: route.query.organisation ? Number(route.query.organisation) : undefined,
  areaFrom: route.query.area_from ? Number(route.query.area_from) : undefined,
  gender: route.query.gender as string | undefined,
  ageMin: route.query.age_min ? Number(route.query.age_min) : undefined,
  ageMax: route.query.age_max ? Number(route.query.age_max) : undefined,
  
  // Status filters
  isCheckedIn: route.query.is_checked_in === 'true' ? true : undefined,
  isRegistered: route.query.is_registered === 'true' ? true : undefined,
  isCancelled: route.query.is_cancelled === 'true' ? true : undefined,
  isMinor: route.query.is_minor === 'true' ? true : undefined,
  isStaff: route.query.is_event_staff === 'true' ? true : undefined,
  
  // Personal needs
  hasDietaryRequirements: route.query.has_dietary_requirements === 'true' ? true : undefined,
  dietaryRequirement: route.query.dietary_requirement ? Number(route.query.dietary_requirement) : undefined,
  hasMedicalConditions: route.query.has_medical_conditions === 'true' ? true : undefined,
  medicalCondition: route.query.medical_condition ? Number(route.query.medical_condition) : undefined,
  hasAccessibilityRequirements: route.query.has_accessibility_requirements === 'true' ? true : undefined,
  accessibilityRequirement: route.query.accessibility_requirement ? Number(route.query.accessibility_requirement) : undefined,
  hasEmergencyContacts: route.query.has_emergency_contacts === 'true' ? true : undefined,
  
  // Question filters
  hasAnsweredQuestions: route.query.has_answered_questions === 'true' ? true : undefined,
  question: route.query.question as string | undefined, // UUID
  questionAnswerSearch: route.query.question_answer_search as string | undefined,
  answeredQuestionType: route.query.answered_question_type as string | undefined,
  hasUnansweredRequiredQuestions: route.query.has_unanswered_required_questions === 'true' ? true : undefined,
  selectedOption: route.query.selected_option ? Number(route.query.selected_option) : undefined,
  sliderAnswerMin: route.query.slider_answer_min ? Number(route.query.slider_answer_min) : undefined,
  sliderAnswerMax: route.query.slider_answer_max ? Number(route.query.slider_answer_max) : undefined,
  
  // Order filters
  hasOrders: route.query.has_orders === 'true' ? true : undefined,
  orderStatus: route.query.order_status as string | undefined,
  orderStatusNot: route.query.order_status_not as string | undefined,
  purchasedProduct: route.query.purchased_product ? Number(route.query.purchased_product) : undefined,
  purchasedProductTitle: route.query.purchased_product_title as string | undefined,
  orderTotalMin: route.query.order_total_min ? Number(route.query.order_total_min) : undefined,
  orderTotalMax: route.query.order_total_max ? Number(route.query.order_total_max) : undefined,
  orderCreatedAfter: route.query.order_created_after as string | undefined,
  orderCreatedBefore: route.query.order_created_before as string | undefined,
  orderReferenceId: route.query.order_reference_id as string | undefined,
  hasCompletedOrders: route.query.has_completed_orders === 'true' ? true : undefined,
  hasPendingOrders: route.query.has_pending_orders === 'true' ? true : undefined,

  // Payment filters
  hasPayments: route.query.has_payments === 'true' ? true : undefined,
  paymentId: route.query.payment_id as string | undefined,
  paymentReference: route.query.payment_reference as string | undefined,
  bankTransferReference: route.query.bank_transfer_reference as string | undefined,
  paymentStatus: route.query.payment_status as string | undefined,
  paymentTarget: route.query.payment_target as string | undefined,
  paymentMethodType: route.query.payment_method_type as string | undefined,
  paymentMethodTitle: route.query.payment_method_title as string | undefined,
  hasRefunds: route.query.has_refunds === 'true' ? true : undefined,
  refundStatus: route.query.refund_status as string | undefined,
  refundIsActive: route.query.refund_is_active === 'true' ? true : undefined,
  hasDonations: route.query.has_donations === 'true' ? true : undefined,
  donationStatus: route.query.donation_status as string | undefined,
  hasDiscountsUsed: route.query.has_discounts_used === 'true' ? true : undefined,
  discountId: route.query.discount_id as string | undefined,
  discountName: route.query.discount_name as string | undefined,
  
  // Advanced filters
  relationshipToUser: route.query.relationship_to_user as string | undefined,
  selfRegistered: route.query.self_registered === 'true' ? true : undefined,
  hasBooking: route.query.has_booking === 'true' ? true : undefined,
  booking: route.query.booking as string | undefined,
  dateOfBirthAfter: route.query.date_of_birth_after as string | undefined,
  dateOfBirthBefore: route.query.date_of_birth_before as string | undefined,
  createdAfter: route.query.created_after as string | undefined,
  createdBefore: route.query.created_before as string | undefined,
  includeDeleted: route.query.include_deleted === 'true' ? true : undefined,
})

// Debounced question answer search
const debouncedQuestionSearch = ref(filters.value.questionAnswerSearch || '')
let questionSearchTimeout: ReturnType<typeof setTimeout>

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

  // Basic filters - Demographics
  if (filters.value.organisation) params.organisation = filters.value.organisation
  if (filters.value.areaFrom) params.area_from = filters.value.areaFrom
  if (filters.value.gender) params.gender = filters.value.gender
  if (filters.value.ageMin) params.age_min = filters.value.ageMin
  if (filters.value.ageMax) params.age_max = filters.value.ageMax
  if (filters.value.isMinor !== undefined) params.is_minor = filters.value.isMinor
  
  // Basic filters - Status
  if (filters.value.isCheckedIn !== undefined) params.is_checked_in = filters.value.isCheckedIn
  if (filters.value.isRegistered !== undefined) params.is_registered = filters.value.isRegistered
  if (filters.value.isCancelled !== undefined) params.is_cancelled = filters.value.isCancelled
  if (filters.value.isStaff !== undefined) params.is_event_staff = filters.value.isStaff
  
  // Basic filters - Personal Needs
  if (filters.value.hasDietaryRequirements !== undefined) params.has_dietary_requirements = filters.value.hasDietaryRequirements
  if (filters.value.dietaryRequirement) params.dietary_requirement = filters.value.dietaryRequirement
  if (filters.value.hasMedicalConditions !== undefined) params.has_medical_conditions = filters.value.hasMedicalConditions
  if (filters.value.medicalCondition) params.medical_condition = filters.value.medicalCondition
  if (filters.value.hasAccessibilityRequirements !== undefined) params.has_accessibility_requirements = filters.value.hasAccessibilityRequirements
  if (filters.value.accessibilityRequirement) params.accessibility_requirement = filters.value.accessibilityRequirement
  
  // Question filters
  if (filters.value.question) params.question = filters.value.question
  if (debouncedQuestionSearch.value) params.question_answer_search = debouncedQuestionSearch.value
  if (filters.value.hasAnsweredQuestions !== undefined) params.has_answered_questions = filters.value.hasAnsweredQuestions
  if (filters.value.hasUnansweredRequiredQuestions !== undefined) params.has_unanswered_required_questions = filters.value.hasUnansweredRequiredQuestions
  if (filters.value.selectedOption) params.selected_option = filters.value.selectedOption
  if (filters.value.sliderAnswerMin) params.slider_answer_min = filters.value.sliderAnswerMin
  if (filters.value.sliderAnswerMax) params.slider_answer_max = filters.value.sliderAnswerMax
  
  // Order filters
  if (filters.value.hasOrders !== undefined) params.has_orders = filters.value.hasOrders
  if (filters.value.orderStatus) params.order_status = filters.value.orderStatus
  if (filters.value.orderStatusNot) params.order_status_not = filters.value.orderStatusNot
  if (filters.value.purchasedProduct) params.purchased_product = filters.value.purchasedProduct
  if (filters.value.purchasedProductTitle) params.purchased_product_title = filters.value.purchasedProductTitle
  if (filters.value.orderTotalMin) params.order_total_min = filters.value.orderTotalMin
  if (filters.value.orderTotalMax) params.order_total_max = filters.value.orderTotalMax
  if (filters.value.orderCreatedAfter) params.order_created_after = filters.value.orderCreatedAfter
  if (filters.value.orderCreatedBefore) params.order_created_before = filters.value.orderCreatedBefore
  if (filters.value.orderReferenceId) params.order_reference_id = filters.value.orderReferenceId
  if (filters.value.hasCompletedOrders !== undefined) params.has_completed_orders = filters.value.hasCompletedOrders
  if (filters.value.hasPendingOrders !== undefined) params.has_pending_orders = filters.value.hasPendingOrders

  // Payment filters
  if (filters.value.hasPayments !== undefined) params.has_payments = filters.value.hasPayments
  if (filters.value.paymentId) params.payment_id = filters.value.paymentId
  if (filters.value.paymentReference) params.payment_reference = filters.value.paymentReference
  if (filters.value.bankTransferReference) params.bank_transfer_reference = filters.value.bankTransferReference
  if (filters.value.paymentStatus) params.payment_status = filters.value.paymentStatus
  if (filters.value.paymentTarget) params.payment_target = filters.value.paymentTarget
  if (filters.value.paymentMethodType) params.payment_method_type = filters.value.paymentMethodType
  if (filters.value.paymentMethodTitle) params.payment_method_title = filters.value.paymentMethodTitle
  if (filters.value.hasRefunds !== undefined) params.has_refunds = filters.value.hasRefunds
  if (filters.value.refundStatus) params.refund_status = filters.value.refundStatus
  if (filters.value.refundIsActive !== undefined) params.refund_is_active = filters.value.refundIsActive
  if (filters.value.hasDonations !== undefined) params.has_donations = filters.value.hasDonations
  if (filters.value.donationStatus) params.donation_status = filters.value.donationStatus
  if (filters.value.hasDiscountsUsed !== undefined) params.has_discounts_used = filters.value.hasDiscountsUsed
  if (filters.value.discountId) params.discount_id = filters.value.discountId
  if (filters.value.discountName) params.discount_name = filters.value.discountName
  
  // Advanced filters
  if (filters.value.relationshipToUser) params.relationship_to_user = filters.value.relationshipToUser
  if (filters.value.selfRegistered !== undefined) params.self_registered = filters.value.selfRegistered
  if (filters.value.hasBooking !== undefined) params.has_booking = filters.value.hasBooking
  if (filters.value.booking) params.booking = filters.value.booking
  if (filters.value.dateOfBirthAfter) params.date_of_birth_after = filters.value.dateOfBirthAfter
  if (filters.value.dateOfBirthBefore) params.date_of_birth_before = filters.value.dateOfBirthBefore
  if (filters.value.createdAfter) params.created_after = filters.value.createdAfter
  if (filters.value.createdBefore) params.created_before = filters.value.createdBefore
  if (filters.value.includeDeleted !== undefined) params.include_deleted = filters.value.includeDeleted

  return params
})

// Bookings query parameters
const bookingsQueryParams = computed(() => {
  const params: any = {
    event: id.value,
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

// Family groups query parameters
const familyGroupsQueryParams = computed(() => {
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

  return params
})

// Event bookings query for create modal (fetch all bookings for the event with higher page size)
const eventBookingsQueryParams = computed(() => ({
  event: id.value,
  page_size: 100, // Fetch more bookings for the dropdown
}))

// Fetch attendees with reactive query params
const { data: attendeesData, isLoading } = useAttendees(queryParams)

// Fetch bookings
const { data: bookingsData, isLoading: bookingsLoading } = useBookings(bookingsQueryParams)
const { data: selectedBookingData, isLoading: selectedBookingLoading } = useBooking(computed(() => selectedBookingId.value || 0))

// Fetch family groups and selected group members
const { data: familyGroupsData, isLoading: familyGroupsLoading, refetch: refetchFamilyGroups } = useFamilyGroups(familyGroupsQueryParams)
const selectedFamilyGroupId = computed(() => selectedFamilyGroup.value?.id || 0)
const { data: familyMembersData, isLoading: familyMembersLoading, refetch: refetchFamilyMembers } = useFamilyGroupMembers(selectedFamilyGroupId)

// Fetch event bookings for create modal
const { data: eventBookingsData } = useBookings(eventBookingsQueryParams)

// Create attendee mutation
const createAttendeeMutation = useCreateAttendee()
const deleteAttendeeMutation = useDeleteAttendee()
const updateFamilyGroupMutation = usePartialUpdateFamilyGroup()
const updateFamilyAttendeeMutation = usePartialUpdateFamilyAttendee()
const deleteFamilyAttendeeMutation = useDeleteFamilyAttendee()
const toast = useToast()

const selectedDeleteAttendeeId = computed(() => selectedDeleteAttendee.value?.attendee_id || '')
const { data: preRemovalSummaryData, isLoading: preRemovalSummaryLoading, error: preRemovalSummaryError } = useAttendeePreRemovalSummary(selectedDeleteAttendeeId)

// Fetch organisations for filter dropdown
const { data: organisationsData } = useOrganisations({ page_size: 100 })

// Fetch areas for filter dropdown
const { data: areasData } = useAreas({ page_size: 100 })

// Fetch event questions for question-based filtering
const { data: eventQuestionsData } = useEventQuestions({ event: event.value?.data.event_id, page_size: 100 })

// Fetch dietary requirements for filter dropdown
const { data: dietaryRequirementsData } = useDietaryRequirements({ page_size: 100 })

// Fetch medical conditions for filter dropdown
const { data: medicalConditionsData } = useMedicalConditions({ page_size: 100 })

// Fetch accessibility requirements for filter dropdown
const { data: accessibilityRequirementsData } = useAccessibilityRequirements({ page_size: 100 })

// Computed values
const attendees = computed(() => (attendeesData.value?.data?.results || []) as ExtendedAttendeeList[])
const totalAttendees = computed(() => attendeesData.value?.data?.count || 0)
const bookings = computed(() => (bookingsData.value?.data?.results || []) as BookingList[])
const selectedBooking = computed(() => selectedBookingData.value?.data as BookingDetail | undefined)
const totalBookings = computed(() => bookingsData.value?.data?.count || 0)
const familyGroups = computed(() => (familyGroupsData.value?.data?.results || []) as FamilyGroupList[])
const totalFamilyGroups = computed(() => familyGroupsData.value?.data?.count || 0)
const familyMembers = computed(() => {
  const payload = familyMembersData.value?.data as { results?: FamilyAttendee[] } | FamilyAttendee[] | undefined
  if (!payload) {
    return [] as FamilyAttendee[]
  }
  return Array.isArray(payload) ? payload : (payload.results || [])
})
const totalFamilyMembers = computed(() => {
  const payload = familyMembersData.value?.data as { count?: number } | FamilyAttendee[] | undefined
  if (!payload) {
    return 0
  }
  if (Array.isArray(payload)) {
    return payload.length
  }
  return payload.count ?? 0
})
const familiesWithMembers = computed(() => familyGroups.value.filter(group => group.member_count > 0).length)
const visibleFamilyMembers = computed(() => familyGroups.value.reduce((sum, group) => sum + group.member_count, 0))
const organisations = computed(() => organisationsData.value?.data?.results || [])
const areas = computed(() => areasData.value?.data?.results || [])
const eventBookings = computed<ExtendedBookingList[]>(() => {
  const results = eventBookingsData.value?.data?.results || []

  return (results as BookingList[]).map((booking) => ({
    ...booking,
  }))
})
const eventQuestions = computed(() => eventQuestionsData.value?.data?.results || [])
const dietaryRequirements = computed(() => dietaryRequirementsData.value?.data?.results || [])
const medicalConditions = computed(() => medicalConditionsData.value?.data?.results || [])
const accessibilityRequirements = computed(() => accessibilityRequirementsData.value?.data?.results || [])
const preRemovalSummary = computed(() => preRemovalSummaryData.value?.data as AttendeePreRemovalSummary | undefined)

// Create chips for active filters
const activeFilterChips = computed(() => {
  const chips: Array<{ key: string; label: string; value: string }> = []
  
  // Helper to format filter values
  const formatValue = (value: any, key: string): string => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (key === 'organisation' && organisations.value.length > 0) {
      const org = organisations.value.find(o => o.id === value)
      return org?.title || String(value)
    }
    if (key === 'areaFrom' && areas.value.length > 0) {
      const area = areas.value.find(a => a.id === value)
      return area?.area_name || String(value)
    }
    if (key === 'question' && eventQuestions.value.length > 0) {
      const question = eventQuestions.value.find(q => q.id === value)
      return question?.question_body || String(value)
    }
    if (key === 'dietaryRequirement' && dietaryRequirements.value.length > 0) {
      const req = dietaryRequirements.value.find((r: any) => r.id === value)
      return req?.label || String(value)
    }
    if (key === 'medicalCondition' && medicalConditions.value.length > 0) {
      const cond = medicalConditions.value.find((c: any) => c.id === value)
      return cond?.label || String(value)
    }
    if (key === 'accessibilityRequirement' && accessibilityRequirements.value.length > 0) {
      const req = accessibilityRequirements.value.find((r: any) => r.id === value)
      return req?.label || String(value)
    }
    return String(value)
  }
  
  // Helper to get readable label
  const getLabel = (key: string): string => {
    const labels: Record<string, string> = {
      organisation: 'Organisation',
      areaFrom: 'Area',
      gender: 'Gender',
      ageMin: 'Min Age',
      ageMax: 'Max Age',
      isMinor: 'Minor',
      isCheckedIn: 'Checked In',
      isRegistered: 'Registered',
      isCancelled: 'Cancelled',
      isStaff: 'Staff',
      hasDietaryRequirements: 'Has Dietary Req',
      dietaryRequirement: 'Dietary Requirement',
      hasMedicalConditions: 'Has Medical Cond',
      medicalCondition: 'Medical Condition',
      hasAccessibilityRequirements: 'Has Accessibility',
      accessibilityRequirement: 'Accessibility Req',
      question: 'Question',
      questionAnswerSearch: 'Answer Search',
      hasAnsweredQuestions: 'Answered Questions',
      hasUnansweredRequiredQuestions: 'Unanswered Required',
      selectedOption: 'Selected Option',
      sliderAnswerMin: 'Slider Min',
      sliderAnswerMax: 'Slider Max',
      hasOrders: 'Has Orders',
      orderStatus: 'Order Status',
      orderStatusNot: 'Order Status Not',
      purchasedProduct: 'Product',
      purchasedProductTitle: 'Product Title',
      orderTotalMin: 'Order Min',
      orderTotalMax: 'Order Max',
      orderCreatedAfter: 'Order After',
      orderCreatedBefore: 'Order Before',
      orderReferenceId: 'Order Reference',
      hasCompletedOrders: 'Has Completed Orders',
      hasPendingOrders: 'Has Pending Orders',
      hasPayments: 'Has Payments',
      paymentId: 'Payment ID',
      paymentReference: 'Payment Reference',
      bankTransferReference: 'Bank Transfer Ref',
      paymentStatus: 'Payment Status',
      paymentTarget: 'Payment Target',
      paymentMethodType: 'Method Type',
      paymentMethodTitle: 'Method Title',
      hasRefunds: 'Has Refunds',
      refundStatus: 'Refund Status',
      refundIsActive: 'Refund Active',
      hasDonations: 'Has Donations',
      donationStatus: 'Donation Status',
      hasDiscountsUsed: 'Has Discounts Used',
      discountId: 'Discount ID',
      discountName: 'Discount Name',
      relationshipToUser: 'Relationship',
      selfRegistered: 'Self Registered',
      hasBooking: 'Has Booking',
      booking: 'Booking',
      dateOfBirthAfter: 'DOB After',
      dateOfBirthBefore: 'DOB Before',
      createdAfter: 'Created After',
      createdBefore: 'Created Before',
      includeDeleted: 'Include Deleted',
      hasEmergencyContacts: 'Has Emergency Contacts',
      answeredQuestionType: 'Answered Question Type',
    }
    return labels[key] || key
  }
  
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      chips.push({
        key,
        label: getLabel(key),
        value: formatValue(value, key)
      })
    }
  })
  
  return chips
})

// Filtered bookings for search
const filteredBookings = computed(() => {
  if (!bookingSearchQuery.value.trim()) {
    return eventBookings.value
  }
  
  const query = bookingSearchQuery.value.toLowerCase().trim()
  
  return eventBookings.value.filter(booking => {
    // Search by booking reference
    if (booking.booking_reference.toLowerCase().includes(query)) {
      return true
    }
    
    // Search by made_by name
    if (booking.made_by_name?.toLowerCase().includes(query)) {
      return true
    }
    
    // Search by attendee names if available
    if (booking.attendees && Array.isArray(booking.attendees)) {
      return booking.attendees.some(attendee => attendee.full_name?.toLowerCase().includes(query))
    }
    
    return false
  })
})

// Computed age from date of birth for preview
const previewAge = computed(() => {
  if (!newAttendeeForm.value.date_of_birth) return null
  
  const today = new Date()
  const birthDate = new Date(newAttendeeForm.value.date_of_birth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth ()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
})

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

const { data: issuedTicketsStatsData } = useBookingTickets(computed(() => ({
  event: id.value,
  page_size: 1,
})))
const totalIssuedTickets = computed(() => issuedTicketsStatsData.value?.data?.count || 0)

const { data: activeIssuedTicketsStatsData } = useBookingTickets(computed(() => ({
  event: id.value,
  status: ['ACTIVE'],
  page_size: 1,
})))
const activeIssuedTickets = computed(() => activeIssuedTicketsStatsData.value?.data?.count || 0)

const { data: usedIssuedTicketsStatsData } = useBookingTickets(computed(() => ({
  event: id.value,
  status: ['USED'],
  page_size: 1,
})))
const usedIssuedTickets = computed(() => usedIssuedTicketsStatsData.value?.data?.count || 0)

const { data: cancelledIssuedTicketsStatsData } = useBookingTickets(computed(() => ({
  event: id.value,
  status: ['CANCELLED'],
  page_size: 1,
})))
const cancelledIssuedTickets = computed(() => cancelledIssuedTicketsStatsData.value?.data?.count || 0)

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
  if (filters.value.hasPayments !== undefined) count++
  if (filters.value.paymentId) count++
  if (filters.value.paymentReference) count++
  if (filters.value.bankTransferReference) count++
  if (filters.value.paymentStatus) count++
  if (filters.value.paymentTarget) count++
  if (filters.value.paymentMethodType) count++
  if (filters.value.paymentMethodTitle) count++
  if (filters.value.hasRefunds !== undefined) count++
  if (filters.value.refundStatus) count++
  if (filters.value.refundIsActive !== undefined) count++
  if (filters.value.hasDonations !== undefined) count++
  if (filters.value.donationStatus) count++
  if (filters.value.hasDiscountsUsed !== undefined) count++
  if (filters.value.discountId) count++
  if (filters.value.discountName) count++
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
  if (currentView.value === 'families') query.view = 'families'
  if (currentView.value === 'statistics') query.view = 'statistics'
  if (currentView.value === 'tickets') query.view = 'tickets'
  
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
  if (filters.value.dietaryRequirement) query.dietary_requirement = filters.value.dietaryRequirement
  if (filters.value.hasMedicalConditions !== undefined) query.has_medical_conditions = filters.value.hasMedicalConditions
  if (filters.value.medicalCondition) query.medical_condition = filters.value.medicalCondition
  if (filters.value.hasAccessibilityRequirements !== undefined) query.has_accessibility_requirements = filters.value.hasAccessibilityRequirements
  if (filters.value.accessibilityRequirement) query.accessibility_requirement = filters.value.accessibilityRequirement
  if (filters.value.hasEmergencyContacts !== undefined) query.has_emergency_contacts = filters.value.hasEmergencyContacts
  if (filters.value.question) query.question = filters.value.question
  if (filters.value.questionAnswerSearch) query.question_answer_search = filters.value.questionAnswerSearch
  if (filters.value.hasAnsweredQuestions !== undefined) query.has_answered_questions = filters.value.hasAnsweredQuestions
  if (filters.value.hasUnansweredRequiredQuestions !== undefined) query.has_unanswered_required_questions = filters.value.hasUnansweredRequiredQuestions
  if (filters.value.selectedOption) query.selected_option = filters.value.selectedOption
  if (filters.value.sliderAnswerMin) query.slider_answer_min = filters.value.sliderAnswerMin
  if (filters.value.sliderAnswerMax) query.slider_answer_max = filters.value.sliderAnswerMax
  if (filters.value.hasOrders !== undefined) query.has_orders = filters.value.hasOrders
  if (filters.value.orderStatus) query.order_status = filters.value.orderStatus
  if (filters.value.orderStatusNot) query.order_status_not = filters.value.orderStatusNot
  if (filters.value.purchasedProduct) query.purchased_product = filters.value.purchasedProduct
  if (filters.value.purchasedProductTitle) query.purchased_product_title = filters.value.purchasedProductTitle
  if (filters.value.orderTotalMin) query.order_total_min = filters.value.orderTotalMin
  if (filters.value.orderTotalMax) query.order_total_max = filters.value.orderTotalMax
  if (filters.value.orderCreatedAfter) query.order_created_after = filters.value.orderCreatedAfter
  if (filters.value.orderCreatedBefore) query.order_created_before = filters.value.orderCreatedBefore
  if (filters.value.orderReferenceId) query.order_reference_id = filters.value.orderReferenceId
  if (filters.value.hasCompletedOrders !== undefined) query.has_completed_orders = filters.value.hasCompletedOrders
  if (filters.value.hasPendingOrders !== undefined) query.has_pending_orders = filters.value.hasPendingOrders
  if (filters.value.hasPayments !== undefined) query.has_payments = filters.value.hasPayments
  if (filters.value.paymentId) query.payment_id = filters.value.paymentId
  if (filters.value.paymentReference) query.payment_reference = filters.value.paymentReference
  if (filters.value.bankTransferReference) query.bank_transfer_reference = filters.value.bankTransferReference
  if (filters.value.paymentStatus) query.payment_status = filters.value.paymentStatus
  if (filters.value.paymentTarget) query.payment_target = filters.value.paymentTarget
  if (filters.value.paymentMethodType) query.payment_method_type = filters.value.paymentMethodType
  if (filters.value.paymentMethodTitle) query.payment_method_title = filters.value.paymentMethodTitle
  if (filters.value.hasRefunds !== undefined) query.has_refunds = filters.value.hasRefunds
  if (filters.value.refundStatus) query.refund_status = filters.value.refundStatus
  if (filters.value.refundIsActive !== undefined) query.refund_is_active = filters.value.refundIsActive
  if (filters.value.hasDonations !== undefined) query.has_donations = filters.value.hasDonations
  if (filters.value.donationStatus) query.donation_status = filters.value.donationStatus
  if (filters.value.hasDiscountsUsed !== undefined) query.has_discounts_used = filters.value.hasDiscountsUsed
  if (filters.value.discountId) query.discount_id = filters.value.discountId
  if (filters.value.discountName) query.discount_name = filters.value.discountName
  if (filters.value.relationshipToUser) query.relationship_to_user = filters.value.relationshipToUser
  if (filters.value.selfRegistered !== undefined) query.self_registered = filters.value.selfRegistered
  if (filters.value.hasBooking !== undefined) query.has_booking = filters.value.hasBooking
  if (filters.value.booking) query.booking = filters.value.booking
  if (filters.value.dateOfBirthAfter) query.date_of_birth_after = filters.value.dateOfBirthAfter
  if (filters.value.dateOfBirthBefore) query.date_of_birth_before = filters.value.dateOfBirthBefore
  if (filters.value.createdAfter) query.created_after = filters.value.createdAfter
  if (filters.value.createdBefore) query.created_before = filters.value.createdBefore
  if (filters.value.includeDeleted !== undefined) query.include_deleted = filters.value.includeDeleted

  router.replace({ query })
}, { deep: true })

// Functions
function changeView(view: 'attendees' | 'bookings' | 'families' | 'statistics' | 'tickets') {
  currentView.value = view
  currentPage.value = 1 // Reset to first page
  selectedAttendees.value = [] // Clear selection
  selectAll.value = false
}

async function openFamilyMembersModal(group: FamilyGroupList) {
  selectedFamilyGroup.value = group
  editingFamilyName.value = group.family_name
  showFamilyMembersModal.value = true
  await refetchFamilyMembers()
}

async function handleSaveFamilyName() {
  if (!selectedFamilyGroup.value) {
    return
  }

  const trimmedName = editingFamilyName.value.trim()
  if (!trimmedName) {
    toast.add({
      title: 'Family name required',
      description: 'Please enter a valid family name.',
      color: 'orange',
    })
    return
  }

  if (trimmedName === selectedFamilyGroup.value.family_name) {
    return
  }

  try {
    savingFamilyName.value = true
    await updateFamilyGroupMutation.mutateAsync({
      groupId: selectedFamilyGroup.value.id,
      body: { family_name: trimmedName },
    })

    selectedFamilyGroup.value = {
      ...selectedFamilyGroup.value,
      family_name: trimmedName,
    }

    toast.add({
      title: 'Family updated',
      description: 'Family name updated successfully.',
      color: 'green',
    })

    await refetchFamilyGroups()
  } catch (error) {
    toast.add({
      title: 'Failed to update family',
      description: error instanceof Error ? error.message : 'Unable to save family name.',
      color: 'red',
    })
  } finally {
    savingFamilyName.value = false
  }
}

async function handleUpdateFamilyMemberRelationship(member: FamilyAttendee, relationship: FamilyRelationship) {
  try {
    await updateFamilyAttendeeMutation.mutateAsync({
      membershipId: member.id,
      body: { relationship },
    })

    toast.add({
      title: 'Relationship updated',
      color: 'green',
    })

    await refetchFamilyMembers()
  } catch (error) {
    toast.add({
      title: 'Failed to update relationship',
      description: error instanceof Error ? error.message : 'Unable to update relationship.',
      color: 'red',
    })
  }
}

async function handleToggleFamilyHead(member: FamilyAttendee, isPrimaryGuardian: boolean) {
  try {
    await updateFamilyAttendeeMutation.mutateAsync({
      membershipId: member.id,
      body: { is_primary_guardian: isPrimaryGuardian },
    })

    toast.add({
      title: isPrimaryGuardian ? 'Head updated' : 'Head removed',
      color: 'green',
    })

    await refetchFamilyMembers()
  } catch (error) {
    toast.add({
      title: 'Failed to update head status',
      description: error instanceof Error ? error.message : 'Unable to update family head.',
      color: 'red',
    })
  }
}

async function handleRemoveFamilyMember(member: FamilyAttendee) {
  if (!confirm(`Remove ${member.attendee_name} from this family?`)) {
    return
  }

  try {
    await deleteFamilyAttendeeMutation.mutateAsync(member.id)

    toast.add({
      title: 'Member removed',
      description: `${member.attendee_name} was removed from the family.`,
      color: 'green',
    })

    await Promise.all([refetchFamilyMembers(), refetchFamilyGroups()])
  } catch (error) {
    toast.add({
      title: 'Failed to remove member',
      description: error instanceof Error ? error.message : 'Unable to remove this member.',
      color: 'red',
    })
  }
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
  debouncedQuestionSearch.value = ''
  filters.value = {
    // Basic filters - Demographics
    organisation: undefined,
    areaFrom: undefined,
    gender: undefined,
    ageMin: undefined,
    ageMax: undefined,
    isMinor: undefined,
    
    // Basic filters - Status
    isCheckedIn: undefined,
    isRegistered: undefined,
    isCancelled: undefined,
    isStaff: undefined,
    
    // Basic filters - Personal Needs
    hasDietaryRequirements: undefined,
    dietaryRequirement: undefined,
    hasMedicalConditions: undefined,
    medicalCondition: undefined,
    hasAccessibilityRequirements: undefined,
    accessibilityRequirement: undefined,
    
    // Question filters
    question: undefined,
    questionAnswerSearch: undefined,
    hasAnsweredQuestions: undefined,
    hasUnansweredRequiredQuestions: undefined,
    selectedOption: undefined,
    sliderAnswerMin: undefined,
    sliderAnswerMax: undefined,
    answeredQuestionType: undefined,
    
    // Order filters
    hasOrders: undefined,
    orderStatus: undefined,
    orderStatusNot: undefined,
    purchasedProduct: undefined,
    purchasedProductTitle: undefined,
    orderTotalMin: undefined,
    orderTotalMax: undefined,
    orderCreatedAfter: undefined,
    orderCreatedBefore: undefined,
    orderReferenceId: undefined,
    hasCompletedOrders: undefined,
    hasPendingOrders: undefined,

    // Payment filters
    hasPayments: undefined,
    paymentId: undefined,
    paymentReference: undefined,
    bankTransferReference: undefined,
    paymentStatus: undefined,
    paymentTarget: undefined,
    paymentMethodType: undefined,
    paymentMethodTitle: undefined,
    hasRefunds: undefined,
    refundStatus: undefined,
    refundIsActive: undefined,
    hasDonations: undefined,
    donationStatus: undefined,
    hasDiscountsUsed: undefined,
    discountId: undefined,
    discountName: undefined,
    
    // Advanced filters
    relationshipToUser: undefined,
    selfRegistered: undefined,
    hasBooking: undefined,
    booking: undefined,
    dateOfBirthAfter: undefined,
    dateOfBirthBefore: undefined,
    createdAfter: undefined,
    createdBefore: undefined,
    includeDeleted: undefined,
    hasEmergencyContacts: undefined,
  }
  currentPage.value = 1
}

function removeFilter(key: string) {
  // @ts-ignore - dynamic key access
  filters.value[key] = undefined
  if (key === 'questionAnswerSearch') {
    debouncedQuestionSearch.value = ''
  }
  currentPage.value = 1
}

function applyFilters(updatedFilters: typeof filters.value) {
  filters.value = { ...updatedFilters }
  currentPage.value = 1
  showFiltersModal.value = false
}

function handleQuestionSearchInput(value: string) {
  clearTimeout(questionSearchTimeout)
  questionSearchTimeout = setTimeout(() => {
    debouncedQuestionSearch.value = value
    filters.value.questionAnswerSearch = value
  }, 500)
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

function viewBookingDetails(booking: BookingList) {
  selectedBookingId.value = booking.id
  showBookingDetailsModal.value = true
}

function goToPaymentListFromBooking(paymentReference?: string) {
  if (!paymentReference) {
    return
  }

  showBookingDetailsModal.value = false
  router.push({
    path: `/events/${id.value}/m/payments/list`,
    query: { search: paymentReference },
  })
}

function openPreRemovalModal(attendee: ExtendedAttendeeList) {
  selectedDeleteAttendee.value = attendee
  selectedRefundPaymentId.value = null
  isSelectedRefundBookingPayment.value = false
  selectedRefundBookingAttendees.value = null
  showPreRemovalModal.value = true
}

async function confirmDeleteAttendee() {
  if (!selectedDeleteAttendee.value) {
    return
  }

  const summary = preRemovalSummary.value
  if (!summary?.can_delete) {
    toast.add({
      title: 'Deletion blocked',
      description: 'Resolve blockers before deleting this attendee.',
      color: 'orange',
    })
    return
  }

  try {
    await deleteAttendeeMutation.mutateAsync(selectedDeleteAttendee.value.attendee_id)
    toast.add({
      title: 'Attendee removed',
      description: 'The attendee has been removed successfully.',
      color: 'green',
    })
    showPreRemovalModal.value = false
    selectedDeleteAttendee.value = null
  } catch (error: any) {
    const message = error?.message || 'Unable to remove attendee.'
    toast.add({
      title: 'Delete failed',
      description: message,
      color: 'red',
    })
  }
}

function openAttendeeRefundModalFromBlockerItem(item: AttendeePreRemovalBlockerItem) {
  if (!selectedDeleteAttendee.value) {
    return
  }

  if (!item.payment_id) {
    toast.add({
      title: 'Payment unavailable',
      description: 'This blocker item does not include a payment reference.',
      color: 'orange',
    })
    return
  }

  if (item.can_request_refund === false) {
    toast.add({
      title: 'Refund unavailable',
      description: item.refund_block_reason || 'Refund cannot be requested for this payment.',
      color: 'orange',
    })
    return
  }

  selectedRefundPaymentId.value = item.payment_id
  isSelectedRefundBookingPayment.value = item.payment_type === 'booking'
  selectedRefundBookingAttendees.value = null
  showRefundModal.value = true
}

function handleAttendeeRefundCreated() {
  showRefundModal.value = false
  // toast.add({
  //   title: 'Refund request created',
  //   description: 'Refund request has been submitted for review.',
  //   color: 'green',
  // })
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

watch(showPreRemovalModal, (isOpen) => {
  if (!isOpen) {
    selectedRefundPaymentId.value = null
    isSelectedRefundBookingPayment.value = false
    selectedRefundBookingAttendees.value = null
    showRefundModal.value = false
  }
})

watch(showBookingDetailsModal, (isOpen) => {
  if (isOpen) {
    return
  }

  selectedBookingId.value = null
})

// Create attendee functions
function resetCreateForm() {
  newAttendeeForm.value = {
    first_name: '',
    last_name: '',
    email: null,
    phone_number: null,
    date_of_birth: null,
    gender: null,
    relationship_to_user: 'self',
    event: Number(event.value?.data?.id) || null,
    user: null,
    area_from: null,
    booking: null,
  }
  bookingSearchQuery.value = ''
  formErrors.value = {}
}

function validateCreateForm(): boolean {
  formErrors.value = {}
  
  if (!newAttendeeForm.value.first_name?.trim()) {
    formErrors.value.first_name = 'First name is required'
  }
  
  if (!newAttendeeForm.value.last_name?.trim()) {
    formErrors.value.last_name = 'Last name is required'
  }
  
  if (!newAttendeeForm.value.date_of_birth) {
    formErrors.value.date_of_birth = 'Date of birth is required'
  }
  
  if (newAttendeeForm.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAttendeeForm.value.email)) {
    formErrors.value.email = 'Invalid email format'
  }
  
  if (!newAttendeeForm.value.booking) {
    formErrors.value.booking = 'Booking selection is strongly recommended for proper attendee management'
  }
  
  return Object.keys(formErrors.value).length === 0
}

async function handleCreateAttendee() {
  if (!validateCreateForm()) {
    return
  }
  
  try {
    // Set event ID
    newAttendeeForm.value.event = Number(event.value?.data?.id) || null
    
    await createAttendeeMutation.mutateAsync(newAttendeeForm.value)
    
    toast.add({
      title: 'Success',
      description: 'Attendee created successfully',
      color: 'green',
    })
    
    showCreateModal.value = false
    resetCreateForm()
  } catch (error: any) {
    console.error('Error creating attendee:', error)
    
    toast.add({
      title: 'Error',
      description: error?.message || 'Failed to create attendee. Please try again.',
      color: 'red',
    })
    
    // Handle API validation errors
    if (error?.body) {
      Object.keys(error.body).forEach(key => {
        formErrors.value[key] = Array.isArray(error.body[key]) 
          ? error.body[key][0] 
          : error.body[key]
      })
    }
  }
}

// Watch modal close to reset form
watch(showCreateModal, (newVal) => {
  if (newVal) {
    // Pre-fill event when opening modal
    newAttendeeForm.value.event = Number(id.value)
  } else {
    // Reset form when closing
    resetCreateForm()
  }
})

watch(showFamilyMembersModal, (isOpen) => {
  if (isOpen) {
    return
  }
  selectedFamilyGroup.value = null
  editingFamilyName.value = ''
})
</script>