<template>
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
            <div class="text-2xl font-black text-deep-navy">{{ familyGroupsPageCount }}</div>
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

    <!-- Statistics / fallback -->
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
</template>

<script setup lang="ts">
import type { ParticipantsView } from '~/composables/participants/useParticipantsUrlState'

defineProps<{
  currentView: ParticipantsView
  totalAttendees: number
  checkedInCount: number
  minorCount: number
  staffCount: number
  totalBookings: number
  totalFamilyGroups: number
  familyGroupsPageCount: number
  familiesWithMembers: number
  visibleFamilyMembers: number
  totalIssuedTickets: number
  activeIssuedTickets: number
  usedIssuedTickets: number
  cancelledIssuedTickets: number
}>()
</script>
