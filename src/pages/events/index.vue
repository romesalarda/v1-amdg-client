<template>
  <div class="min-h-screen bg-gray-50 text-on-surface">

    <!-- Dark Navy Search Strip -->
    <section class="w-full bg-blue-600 sticky top-12 z-40">
      <!-- Collapse Toggle Bar -->
      <div
        class="flex items-center justify-between px-6 py-2 cursor-pointer select-none md:hidden"
        @click="isSearchExpanded = !isSearchExpanded"
      >
        <span class="text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ searchQuery ? `"${searchQuery}"` : 'Search &amp; Filter' }}
          <span v-if="selectedFilter !== 'all' || selectedLocation !== 'all' || advancedStartAfter || advancedStartBefore" class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/30 text-white text-[9px]">•</span>
        </span>
        <svg class="w-4 h-4 text-white transition-transform duration-200" :class="isSearchExpanded ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <!-- Collapsible content -->
      <div :class="[isSearchExpanded ? 'block' : 'hidden', 'md:block']" class="pb-6 pt-3 md:pt-5">
      <div class="max-w-[1100px] mx-auto px-6">

        <!-- Search Pill -->
        <div class="bg-white rounded-lg p-1 flex flex-col md:flex-row items-stretch md:items-center search-pill overflow-hidden mb-4 shadow-lg">
          <!-- Location -->
          <div class="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 group">
            <svg class="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Location</span>
              <select
                v-model="selectedLocation"
                class="w-full border-none p-0 focus:ring-0 text-deep-navy font-semibold text-sm bg-transparent appearance-none cursor-pointer"
              >
                <option value="all">All of United Kingdom</option>
                <option
                  v-for="area in locationOptions"
                  :key="area.id"
                  :value="area.area_name"
                >
                  {{ area.area_name }}
                </option>
              </select>
            </div>
            <svg class="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <!-- Date Range Picker -->
          <DateRangePicker
            v-model:model-value-start="advancedStartAfter"
            v-model:model-value-end="advancedStartBefore"
            class="flex-1"
          >
            <template #default="{ label, active }">
              <div class="flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 group h-full">
                <svg class="w-5 h-5 mr-3 shrink-0 transition-colors" :class="active ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div class="flex flex-col flex-1 min-w-0">
                  <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dates</span>
                  <span class="text-deep-navy font-semibold text-sm truncate" :class="active ? 'text-blue-600' : ''">{{ label }}</span>
                </div>
                <svg class="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </template>
          </DateRangePicker>
          <!-- Search Input -->
          <div class="flex-[2] flex items-center px-4 py-3">
            <svg class="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Search</span>
              <div class="flex items-center">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="w-full border-none p-0 focus:ring-0 text-deep-navy font-semibold text-sm bg-transparent placeholder:text-gray-300"
                  placeholder="Search events, organisations..."
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="ml-2 text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <!-- More Filters + Search Button -->
          <div class="flex items-center gap-2 px-2 py-1 md:py-0">
            <!-- <button
              type="button"
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="hidden md:inline-flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors border rounded-lg"
              :class="showAdvancedFilters ? 'bg-deep-navy text-white border-deep-navy' : 'text-deep-navy border-gray-300 hover:border-deep-navy'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
              <span
                v-if="advancedActiveCount"
                class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[9px]"
              >
                {{ advancedActiveCount }}
              </span>
            </button> -->
            <button
              type="button"
              @click="applyFilters"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors active:scale-95 whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>

        <!-- Status Filter Pills -->
        <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 pt-1">
          <button
            @click="selectedFilter = 'all'"
            :class="selectedFilter === 'all' ? 'bg-white text-deep-navy' : 'bg-white/10 text-white/80 border border-white/20 hover:border-white/50 hover:text-white'"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            All Events
          </button>
          <button
            @click="selectedFilter = 'open'"
            :class="selectedFilter === 'open' ? 'bg-white text-deep-navy' : 'bg-white/10 text-white/80 border border-white/20 hover:border-white/50 hover:text-white'"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            Open for Registration
          </button>
          <button
            @click="selectedFilter = 'published'"
            :class="selectedFilter === 'published' ? 'bg-white text-deep-navy' : 'bg-white/10 text-white/80 border border-white/20 hover:border-white/50 hover:text-white'"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            Published
          </button>
          <button
            @click="selectedFilter = 'in_progress'"
            :class="selectedFilter === 'in_progress' ? 'bg-white text-deep-navy' : 'bg-white/10 text-white/80 border border-white/20 hover:border-white/50 hover:text-white'"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            In Progress
          </button>
        </div>

      </div>
      </div>
    </section>

    <!-- Featured Event Hero -->
    <section v-if="featuredEvent" class="relative h-[500px] overflow-hidden bg-deep-navy">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="featuredEvent.main_landing_image?.image ? `background-image: url('${resolveImageUrl(featuredEvent.main_landing_image.image)}')` : ''"
      ></div>
      <div class="hero-gradient absolute inset-0"></div>
      <div class="relative max-w-[1300px] mx-auto h-full px-2 flex flex-col justify-center items-start text-white">
        <!-- <span class="bg-gold text-deep-navy px-3 py-1 rounded-sm text-[12px] font-bold uppercase tracking-widest mb-4">
          Featured Experience
        </span> -->
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-barbara mb-4 max-w-3xl leading-tight tracking-tight" style="letter-spacing: 0.5px;">
          {{ featuredEvent.title.toUpperCase() }}
        </h1>
        <p v-if="featuredEvent.start_datetime" class="text-white/80 font-bold text-sm mb-8 uppercase tracking-wider">
          {{ formatEventDate(featuredEvent.start_datetime) }}
          <span v-if="featuredEvent.organisation_name"> · {{ featuredEvent.organisation_name }}</span>
        </p>
        <div class="flex gap-4">
          <NuxtLink
            :to="`/events/${featuredEvent.url_safe_title}`"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-md transition-all transform hover:scale-105 active:scale-95 no-underline"
          >
            View Details
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Upcoming Events Section -->
    <main ref="eventsSection" class="max-w-[1300px] mx-auto px-6 py-12 pb-24">

      <!-- Section Header -->
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-2xl font-bold text-deep-navy mb-1">Upcoming Events</h2>
          <p class="text-gray-500 text-sm">Discover experiences that move the soul and unite the community.</p>
        </div>
        <div class="text-gray-500 text-sm font-mono">
          {{ totalEvents }} {{ totalEvents === 1 ? 'event' : 'events' }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="showPlaceholderCards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="group cursor-pointer">
          <div class="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg bg-gray-200 animate-pulse shadow-sm"></div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div class="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </div>
      </div>

      <!-- Events Grid -->
      <div v-else-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <!-- Event Card -->
        <NuxtLink
            v-for="event in paginatedEvents"
            :key="event.event_id"
            :to="`/events/${event.url_safe_title}`"
            target="_blank"
            rel="noopener noreferrer"
            class="group cursor-pointer"
          >
          <div class="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg shadow-sm">
            <img
              v-if="event.main_landing_image?.image"
              :alt="event.title"
              :src="resolveImageUrl(event.main_landing_image.image_urls?.original)"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              @error="onImageError"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-200 to-primary-400">
              <svg class="w-16 h-16 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <!-- Status badge -->
            <div class="absolute top-3 left-3">
              <span v-if="event.status === 'OPEN'" class="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-sm text-[10px] font-bold text-deep-navy uppercase tracking-tighter shadow-sm">
                Open
              </span>
              <span v-else-if="event.status === 'PUBLISHED'" class="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-sm text-[10px] font-bold text-deep-navy uppercase tracking-tighter shadow-sm">
                Published
              </span>
              <span v-else-if="event.status === 'IN_PROGRESS'" class="bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded-sm text-[10px] font-bold text-white uppercase tracking-tighter shadow-sm">
                In Progress
              </span>
            </div>
          </div>
          <h3 class="font-bold text-lg text-deep-navy mb-1 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
            {{ event.title }}
          </h3>
          <p class="text-gold-600 font-bold text-xs mb-1 uppercase tracking-wider">
            {{ formatEventDate(event.start_datetime) }}
            <span v-if="event.organisation_name"> · {{ event.organisation_name }}</span>
          </p>
          <!-- <p v-if="event.description" class="text-gray-500 text-sm line-clamp-2">
            {{ event.description }}
          </p> -->
        </NuxtLink>

        <!-- CTA Promo Bento Card -->
        <div v-if="!authStore.isAuthenticated" class="bg-deep-navy rounded-lg p-8 flex flex-col justify-center items-center text-center text-white relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-gold/40 transition-all pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/20 rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-blue-600/40 transition-all pointer-events-none"></div>
          <h3 class="text-xl font-bold mb-3">Ad Majorem Dei Gloriam</h3>
          <p class="text-white/70 text-sm mb-6 max-w-xs mx-auto">Register to access all events and connect with your faith community.</p>
          <NuxtLink
            to="/register"
            class="bg-white text-deep-navy px-6 py-3 rounded-lg font-bold text-sm hover:shadow-lg transition-all active:scale-95 no-underline"
          >
            Get Started
          </NuxtLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="border border-gray-200 p-12 bg-white max-w-2xl mx-auto rounded-xl shadow-sm">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-xl font-bold text-deep-navy mb-2">No Events Found</h3>
          <p class="text-gray-500 text-sm">
            {{ searchQuery ? 'Try adjusting your search criteria' : 'Check back soon for upcoming events' }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center mt-12">
        <UPagination
          v-model="currentPage"
          :page-count="itemsPerPage"
          :total="Math.max(totalEvents, 1)"
        />
      </div>
    </main>

    <!-- Explore by Region Section -->
    <section class="w-full bg-deep-navy py-20">
      <div class="max-w-[1500px] mx-auto px-6">
        <div class="mb-10">
          <h2 class="text-2xl font-bold text-white mb-1">Explore by Region</h2>
          <p class="text-white/60 text-sm">Find events happening near you.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <!-- London -->
          <button
            type="button"
            class="region-card group h-72 relative overflow-hidden rounded-lg border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 0ms;"
            @click="applyRegionFilter('London')"
          >
            <img
              alt="London"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="/assets/images/locations/london.jpg"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 p-6 flex flex-col justify-end text-left">
              <span class="text-xl font-bold text-white uppercase tracking-tight">London</span>
              <span class="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                {{ getEventCountByLocation('London') }} Active Events
              </span>
            </div>
          </button>
          <button
            type="button"
            class="region-card group h-72 relative overflow-hidden rounded-lg border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 100ms;"
            @click="applyRegionFilter('Manchester')"
          >
            <img
              alt="Manchester"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="/assets/images/locations/manchester.jpg"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 p-6 flex flex-col justify-end text-left">
              <span class="text-xl font-bold text-white uppercase tracking-tight">Manchester</span>
              <span class="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                {{ getEventCountByLocation('Birmingham') }} Active Events
              </span>
            </div>
          </button>
          <!-- Southeast -->
          <button
            type="button"
            class="region-card group h-72 relative overflow-hidden rounded-lg border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 200ms;"
            @click="applyRegionFilter('Southeast')"
          >
            <img
              alt="Birmingham"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="/assets/images/locations/birmingham.jpg"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 p-6 flex flex-col justify-end text-left">
              <span class="text-xl font-bold text-white uppercase tracking-tight">Birmingham</span>
              <span class="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                {{ getEventCountByLocation('Birmingham') }} Active Events
              </span>
            </div>
          </button>
          <!-- Wales -->
          <button
            type="button"
            class="region-card group h-72 relative overflow-hidden rounded-lg border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 300ms;"
            @click="applyRegionFilter('Cardiff')"
          >
            <img
              alt="Cardiff"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="/assets/images/locations/cardiff.jpg"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 p-6 flex flex-col justify-end text-left">
              <span class="text-xl font-bold text-white uppercase tracking-tight">Cardiff</span>
              <span class="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                {{ getEventCountByLocation('Cardiff') }} Active Events
              </span>
            </div>
          </button>

          <button
            type="button"
            class="region-card group h-72 relative overflow-hidden rounded-lg border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 300ms;"
            @click="applyRegionFilter('Edinburgh')"
          >
            <img
              alt="Edinburgh"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="/assets/images/locations/edinburgh.jpg"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute inset-0 p-6 flex flex-col justify-end text-left">
              <span class="text-xl font-bold text-white uppercase tracking-tight">Edinburgh</span>
              <span class="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                {{ getEventCountByLocation('Edinburgh') }} Active Events
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- Call to Action (standalone, for non-grid authenticated users) -->
    <div v-if="!authStore.isAuthenticated" class="max-w-[1100px] mx-auto px-6 py-16">
      <div class="bg-deep-navy text-white rounded-xl p-12 text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>
        <div class="relative">
          <span class="inline-block bg-gold text-deep-navy px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6">
            Join The Community
          </span>
          <h3 class="text-3xl font-bold mb-3">Create Your Account Today</h3>
          <p class="text-white/70 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
            Sign up to access all events, register for gatherings, and connect with your faith community.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/register"
              class="bg-white text-deep-navy px-8 py-4 font-bold text-sm rounded-lg hover:shadow-lg transition-all active:scale-95 no-underline"
            >
              Sign Up Free
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="border border-white/30 text-white px-8 py-4 font-bold text-sm rounded-lg hover:border-white/60 transition-colors no-underline"
            >
              Login
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useEvents } from '~/composables/resources/events/events'
import { useLocationAreas } from '~/composables/resources/locations/locationAreas'
import type { EventListListData } from '~/api/types.gen'
import { useAuthStore } from '~/stores/auth'
import { resolveImageUrl, onImageError } from '~/utils/image'
import DateRangePicker from '~/components/ui/DateRangePicker.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const isSearchExpanded = ref(false)
// Search and filter state
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedFilter = ref('all')
const selectedSort = ref('date')
const selectedLocation = ref<string>('all')
const selectedRegion = ref('')
const showAdvancedFilters = ref(false)
const advancedOrganisationName = ref('')
const advancedEventTypeTitle = ref('')
const advancedChapterName = ref('')
const advancedVenueName = ref('')
const advancedVenueCity = ref('')
const advancedTheme = ref('')
const advancedAnchorVerse = ref('')
const advancedStartAfter = ref('')
const advancedStartBefore = ref('')
const advancedEndAfter = ref('')
const advancedEndBefore = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const isSyncingFromRoute = ref(false)
const isSearchDebouncing = ref(false)
const searchDebounceMs = 450
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// Refs for scrolling
const eventsSection = ref<HTMLElement | null>(null)
const hasScrolledToEvents = ref(false)

// Location options for filters
const { data: areaData } = useLocationAreas(computed(() => ({
  page_size: 200,
  active: true,
  ordering: 'area_name',
})))

const locationOptions = computed(() => areaData.value?.data?.results || [])

const statusMap: Record<string, string> = {
  open: 'OPEN',
  published: 'PUBLISHED',
  in_progress: 'IN_PROGRESS',
}

const reverseStatusMap: Record<string, string> = {
  OPEN: 'open',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
}

const orderingMap: Record<string, string> = {
  date: 'start_datetime',
  date_desc: '-start_datetime',
  name: 'title',
  name_desc: '-title',
}

const reverseOrderingMap: Record<string, string> = {
  start_datetime: 'date',
  '-start_datetime': 'date_desc',
  title: 'name',
  '-title': 'name_desc',
}

const backendQuery = computed<EventListListData['query']>(() => {
  const query: EventListListData['query'] = {
    page: currentPage.value,
    page_size: itemsPerPage,
    ordering: orderingMap[selectedSort.value] || 'start_datetime',
  }

  if (debouncedSearchQuery.value.trim()) {
    query.search = debouncedSearchQuery.value.trim()
  }

  if (selectedFilter.value !== 'all') {
    query.status = statusMap[selectedFilter.value]
  }

  if (selectedLocation.value !== 'all') {
    query.area_name = selectedLocation.value.trim()
  }

  if (selectedRegion.value.trim()) {
    query.area_name = selectedRegion.value.trim()
  }

  if (advancedOrganisationName.value.trim()) query.organisation_name = advancedOrganisationName.value.trim()
  if (advancedEventTypeTitle.value.trim()) query.event_type_title = advancedEventTypeTitle.value.trim()
  if (advancedChapterName.value.trim()) query.chapter_name = advancedChapterName.value.trim()
  if (advancedVenueName.value.trim()) query.venue_name = advancedVenueName.value.trim()
  if (advancedVenueCity.value.trim()) query.venue_city = advancedVenueCity.value.trim()
  if (advancedTheme.value.trim()) query.theme = advancedTheme.value.trim()
  if (advancedAnchorVerse.value.trim()) query.anchor_verse = advancedAnchorVerse.value.trim()
  if (advancedStartAfter.value) query.start_after = advancedStartAfter.value
  if (advancedStartBefore.value) query.start_before = advancedStartBefore.value
  if (advancedEndAfter.value) query.end_after = advancedEndAfter.value
  if (advancedEndBefore.value) query.end_before = advancedEndBefore.value

  return query
})

// Fetch events from list endpoint with backend filtering
const { data: eventsData, isLoading: isLoadingEvents } = useEvents(backendQuery)
const allEvents = computed(() => eventsData.value?.data?.results || [])
const totalEvents = computed(() => eventsData.value?.data?.count || 0)
const showPlaceholderCards = computed(() => isLoadingEvents.value || isSearchDebouncing.value)

// Featured event (first OPEN event with image)
const featuredEvent = computed(() => {
  return allEvents.value.find(event => 
    event.status === 'OPEN' && event.main_landing_image?.image
  ) || allEvents.value[0]
})

// Format date helper
const formatEventDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

// Region quick filter count (based on currently loaded response)
const getEventCountByLocation = (location: string) => {
  return allEvents.value.filter(event =>
    event.location?.toLowerCase().includes(location.toLowerCase())
  ).length
}

const filteredEvents = computed(() => allEvents.value)
const advancedActiveCount = computed(() => {
  return [
    advancedOrganisationName.value,
    advancedEventTypeTitle.value,
    advancedChapterName.value,
    advancedVenueName.value,
    advancedVenueCity.value,
    advancedTheme.value,
    advancedAnchorVerse.value,
    advancedStartAfter.value,
    advancedStartBefore.value,
    advancedEndAfter.value,
    advancedEndBefore.value,
  ].filter(value => value && value.toString().trim()).length
})

// Pagination
const totalPages = computed(() => Math.max(1, Math.ceil((totalEvents.value || 0) / itemsPerPage)))
const paginatedEvents = computed(() => filteredEvents.value)

const applyRegionFilter = (region: string) => {
  selectedRegion.value = region
  selectedLocation.value = 'all'
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearAdvancedFilters = () => {
  advancedOrganisationName.value = ''
  advancedEventTypeTitle.value = ''
  advancedChapterName.value = ''
  advancedVenueName.value = ''
  advancedVenueCity.value = ''
  advancedTheme.value = ''
  advancedAnchorVerse.value = ''
  advancedStartAfter.value = ''
  advancedStartBefore.value = ''
  advancedEndAfter.value = ''
  advancedEndBefore.value = ''
}

// Reset to page 1 when filters change
watch([
  searchQuery,
  selectedFilter,
  selectedSort,
  selectedLocation,
  selectedRegion,
  advancedOrganisationName,
  advancedEventTypeTitle,
  advancedChapterName,
  advancedVenueName,
  advancedVenueCity,
  advancedTheme,
  advancedAnchorVerse,
  advancedStartAfter,
  advancedStartBefore,
  advancedEndAfter,
  advancedEndBefore,
], () => {
  if (isSyncingFromRoute.value) {
    return
  }
  currentPage.value = 1
})

watch(searchQuery, (value) => {
  if (isSyncingFromRoute.value) {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = null
    }
    debouncedSearchQuery.value = value
    isSearchDebouncing.value = false
    return
  }

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  isSearchDebouncing.value = debouncedSearchQuery.value !== value

  searchDebounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = value
    isSearchDebouncing.value = false
    searchDebounceTimer = null
  }, searchDebounceMs)
})

watch(selectedLocation, (value) => {
  if (isSyncingFromRoute.value) {
    return
  }

  if (value !== 'all' && selectedRegion.value) {
    selectedRegion.value = ''
  }
})

const buildQueryParams = () => {
  const query: Record<string, string> = {}

  if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
  if (selectedFilter.value !== 'all') query.status = statusMap[selectedFilter.value]
  if (selectedSort.value !== 'date') query.ordering = orderingMap[selectedSort.value]
  if (selectedLocation.value !== 'all') query.area_name = selectedLocation.value.trim()
  if (selectedRegion.value.trim()) query.area_name = selectedRegion.value.trim()
  if (advancedOrganisationName.value.trim()) query.organisation_name = advancedOrganisationName.value.trim()
  if (advancedEventTypeTitle.value.trim()) query.event_type_title = advancedEventTypeTitle.value.trim()
  if (advancedChapterName.value.trim()) query.chapter_name = advancedChapterName.value.trim()
  if (advancedVenueName.value.trim()) query.venue_name = advancedVenueName.value.trim()
  if (advancedVenueCity.value.trim()) query.venue_city = advancedVenueCity.value.trim()
  if (advancedTheme.value.trim()) query.theme = advancedTheme.value.trim()
  if (advancedAnchorVerse.value.trim()) query.anchor_verse = advancedAnchorVerse.value.trim()
  if (advancedStartAfter.value) query.start_after = advancedStartAfter.value
  if (advancedStartBefore.value) query.start_before = advancedStartBefore.value
  if (advancedEndAfter.value) query.end_after = advancedEndAfter.value
  if (advancedEndBefore.value) query.end_before = advancedEndBefore.value
  if (currentPage.value > 1) query.page = String(currentPage.value)

  return query
}

watch(
  () => route.query,
  (query) => {
    isSyncingFromRoute.value = true

    searchQuery.value = typeof query.search === 'string' ? query.search : ''
    debouncedSearchQuery.value = searchQuery.value

    const status = typeof query.status === 'string' ? query.status : ''
    selectedFilter.value = reverseStatusMap[status] || 'all'

    const ordering = typeof query.ordering === 'string' ? query.ordering : 'start_datetime'
    selectedSort.value = reverseOrderingMap[ordering] || 'date'

    const areaName = typeof query.area_name === 'string' ? query.area_name : ''
    selectedLocation.value = areaName || 'all'
    selectedRegion.value = ''

    advancedOrganisationName.value = typeof query.organisation_name === 'string' ? query.organisation_name : ''
    advancedEventTypeTitle.value = typeof query.event_type_title === 'string' ? query.event_type_title : ''
    advancedChapterName.value = typeof query.chapter_name === 'string' ? query.chapter_name : ''
    advancedVenueName.value = typeof query.venue_name === 'string' ? query.venue_name : ''
    advancedVenueCity.value = typeof query.venue_city === 'string' ? query.venue_city : ''
    advancedTheme.value = typeof query.theme === 'string' ? query.theme : ''
    advancedAnchorVerse.value = typeof query.anchor_verse === 'string' ? query.anchor_verse : ''
    advancedStartAfter.value = typeof query.start_after === 'string' ? query.start_after : ''
    advancedStartBefore.value = typeof query.start_before === 'string' ? query.start_before : ''
    advancedEndAfter.value = typeof query.end_after === 'string' ? query.end_after : ''
    advancedEndBefore.value = typeof query.end_before === 'string' ? query.end_before : ''

    showAdvancedFilters.value = Boolean(
      advancedOrganisationName.value ||
      advancedEventTypeTitle.value ||
      advancedChapterName.value ||
      advancedVenueName.value ||
      advancedVenueCity.value ||
      advancedTheme.value ||
      advancedAnchorVerse.value ||
      advancedStartAfter.value ||
      advancedStartBefore.value ||
      advancedEndAfter.value ||
      advancedEndBefore.value
    )

    const page = typeof query.page === 'string' ? Number(query.page) : 1
    currentPage.value = Number.isFinite(page) && page > 0 ? page : 1

    hasScrolledToEvents.value = !!searchQuery.value
    isSyncingFromRoute.value = false
  },
  { immediate: true }
)

watch([
  searchQuery,
  selectedFilter,
  selectedSort,
  selectedLocation,
  selectedRegion,
  advancedOrganisationName,
  advancedEventTypeTitle,
  advancedChapterName,
  advancedVenueName,
  advancedVenueCity,
  advancedTheme,
  advancedAnchorVerse,
  advancedStartAfter,
  advancedStartBefore,
  advancedEndAfter,
  advancedEndBefore,
  currentPage,
], async () => {
  if (isSyncingFromRoute.value) {
    return
  }
  await router.replace({ query: buildQueryParams() })
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
})

// Auto-scroll to events section when user starts typing
watch(searchQuery, (newQuery) => {
  if (newQuery && !hasScrolledToEvents.value && eventsSection.value) {
    // User started typing, scroll to events section
    hasScrolledToEvents.value = true
    
    nextTick(() => {
      eventsSection.value?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    })
  } else if (!newQuery) {
    // Reset scroll flag when search is cleared
    hasScrolledToEvents.value = false
  }
})

// Set page metadata
useHead({
  title: 'Events - Discover Faith Gatherings',
  meta: [
    { name: 'description', content: 'Browse and join upcoming faith events, conferences, and spiritual gatherings from communities around the world.' }
  ]
})
</script>

<style scoped>
.search-pill {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.hero-gradient {
  background: linear-gradient(to right, rgba(10, 25, 47, 0.9) 0%, rgba(10, 25, 47, 0.5) 50%, rgba(10, 25, 47, 0.15) 100%);
}

.region-card {
  background: transparent;
  padding: 0;
  text-align: left;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
</style>
