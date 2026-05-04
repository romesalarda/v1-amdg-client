<template>
  <div class="min-h-screen bg-white text-deep-navy">
    <!-- Search Section -->
    <section class="w-full bg-white/95 backdrop-blur-md border-b border-deep-navy/10 py-6 sticky top-[40px] z-40 shadow-lg transition-all duration-300">
      <div class="max-w-[1000px] mx-auto px-6">
        <!-- Search Bar -->
        <div class="flex items-center bg-mist-blue rounded-xl overflow-hidden border border-deep-navy/5 shadow-sm p-1 mb-3">
          <div class="relative flex-grow min-w-0">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-deep-navy/40 text-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              v-model="searchQuery"
              class="w-full h-10 pl-10 pr-4 bg-transparent border-none text-[11px] font-bold text-deep-navy placeholder:text-deep-navy/30 focus:ring-0 outline-none" 
              placeholder="Search events..." 
              type="text"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-deep-navy/40 hover:text-deep-navy"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="h-6 w-px bg-deep-navy/10 hidden md:block"></div>
          <div class="relative w-44 hidden md:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-deep-navy/40 text-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </span>
            <select 
              v-model="selectedLocation"
              class="w-full h-10 pl-10 pr-8 bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-deep-navy focus:ring-0 appearance-none cursor-pointer"
            >
              <option value="all">All Locations</option>
              <option
                v-for="area in locationOptions"
                :key="area.id"
                :value="area.area_name"
              >
                {{ area.area_name }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-deep-navy/40 pointer-events-none text-base">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          <div class="h-6 w-px bg-deep-navy/10 hidden md:block"></div>
          <div class="relative w-40 hidden md:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-deep-navy/40 text-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <select 
              v-model="selectedSort"
              class="w-full h-10 pl-10 pr-8 bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-deep-navy focus:ring-0 appearance-none cursor-pointer"
            >
              <option value="date">Date (Earliest)</option>
              <option value="date_desc">Date (Latest)</option>
              <option value="name">Name (A-Z)</option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-deep-navy/40 pointer-events-none text-base">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          <div class="h-6 w-px bg-deep-navy/10 hidden md:block"></div>
          <button
            type="button"
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="h-10 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors hidden md:inline-flex items-center gap-2"
            :class="showAdvancedFilters ? 'bg-deep-navy text-white' : 'text-deep-navy border border-deep-navy/20 hover:border-deep-navy/40'"
          >
            <span>More Filters</span>
            <span
              v-if="advancedActiveCount"
              class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/90 text-deep-navy text-[9px]"
            >
              {{ advancedActiveCount }}
            </span>
            <svg class="w-4 h-4 transition-transform" :class="showAdvancedFilters ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <!-- <button @click="applyFilters" class="bg-deep-navy text-white h-10 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest ml-1 shrink-0 hover:bg-deep-navy/90 transition-colors">
            Search
          </button> -->
        </div>

        <div class="md:hidden mb-3">
          <button
            type="button"
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="w-full h-10 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2"
            :class="showAdvancedFilters ? 'bg-deep-navy text-white' : 'bg-white text-deep-navy border border-deep-navy/20 hover:border-deep-navy/40'"
          >
            <span>More Filters</span>
            <span
              v-if="advancedActiveCount"
              class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/90 text-deep-navy text-[9px]"
            >
              {{ advancedActiveCount }}
            </span>
            <svg class="w-4 h-4 transition-transform" :class="showAdvancedFilters ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div
          v-if="showAdvancedFilters"
          class="mb-5 p-4 md:p-5 bg-mist-blue/60 border border-deep-navy/10 rounded-xl"
        >
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/70">Advanced Filters</h4>
            <button
              type="button"
              @click="clearAdvancedFilters"
              class="text-[10px] font-black uppercase tracking-widest text-deep-navy/60 hover:text-deep-navy"
            >
              Clear
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="bg-white/80 border border-deep-navy/10 rounded-lg p-3 space-y-3">
              <p class="text-[10px] font-black uppercase tracking-widest text-deep-navy/50">Event Details</p>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Organisation</label>
                <input v-model="advancedOrganisationName" type="text" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy placeholder:text-deep-navy/35 focus:outline-none focus:border-deep-navy/40" placeholder="e.g. AMDG London" />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Event Type</label>
                <input v-model="advancedEventTypeTitle" type="text" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy placeholder:text-deep-navy/35 focus:outline-none focus:border-deep-navy/40" placeholder="e.g. Retreat, Workshop" />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Theme</label>
                <input v-model="advancedTheme" type="text" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy placeholder:text-deep-navy/35 focus:outline-none focus:border-deep-navy/40" placeholder="Theme keyword" />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Anchor Verse</label>
                <input v-model="advancedAnchorVerse" type="text" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy placeholder:text-deep-navy/35 focus:outline-none focus:border-deep-navy/40" placeholder="e.g. John 3:16" />
              </div>
            </div>

            <div class="bg-white/80 border border-deep-navy/10 rounded-lg p-3 space-y-3">
              <p class="text-[10px] font-black uppercase tracking-widest text-deep-navy/50">Location Details</p>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Chapter</label>
                <input v-model="advancedChapterName" type="text" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy placeholder:text-deep-navy/35 focus:outline-none focus:border-deep-navy/40" placeholder="Chapter name" />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Venue Name</label>
                <input v-model="advancedVenueName" type="text" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy placeholder:text-deep-navy/35 focus:outline-none focus:border-deep-navy/40" placeholder="Venue name" />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Venue City</label>
                <input v-model="advancedVenueCity" type="text" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy placeholder:text-deep-navy/35 focus:outline-none focus:border-deep-navy/40" placeholder="City" />
              </div>
            </div>

            <div class="bg-white/80 border border-deep-navy/10 rounded-lg p-3 space-y-3">
              <p class="text-[10px] font-black uppercase tracking-widest text-deep-navy/50">Date Range</p>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Starts After</label>
                <input v-model="advancedStartAfter" type="datetime-local" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy focus:outline-none focus:border-deep-navy/40" />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Starts Before</label>
                <input v-model="advancedStartBefore" type="datetime-local" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy focus:outline-none focus:border-deep-navy/40" />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Ends After</label>
                <input v-model="advancedEndAfter" type="datetime-local" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy focus:outline-none focus:border-deep-navy/40" />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-black uppercase tracking-widest text-deep-navy/60">Ends Before</label>
                <input v-model="advancedEndBefore" type="datetime-local" class="w-full h-10 px-3 rounded-lg border border-deep-navy/15 text-xs font-semibold text-deep-navy focus:outline-none focus:border-deep-navy/40" />
              </div>
            </div>
          </div>
        </div>

        <!-- Category Filter Pills -->
        <div class="flex items-center justify-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            @click="selectedFilter = 'all'"
            :class="selectedFilter === 'all' ? 'bg-deep-navy text-white' : 'bg-white text-deep-navy border border-deep-navy/10 hover:border-deep-navy/30'"
            class="whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm transition-colors"
          >
            All
          </button>
          <button 
            @click="selectedFilter = 'open'"
            :class="selectedFilter === 'open' ? 'bg-deep-navy text-white' : 'bg-white text-deep-navy border border-deep-navy/10 hover:border-deep-navy/30'"
            class="whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors"
          >
            Open for Registration
          </button>
          <button 
            @click="selectedFilter = 'published'"
            :class="selectedFilter === 'published' ? 'bg-deep-navy text-white' : 'bg-white text-deep-navy border border-deep-navy/10 hover:border-deep-navy/30'"
            class="whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors"
          >
            Published
          </button>
          <button 
            @click="selectedFilter = 'in_progress'"
            :class="selectedFilter === 'in_progress' ? 'bg-deep-navy text-white' : 'bg-white text-deep-navy border border-deep-navy/10 hover:border-deep-navy/30'"
            class="whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors"
          >
            In Progress
          </button>
        </div>

      </div>
    </section>

    <!-- Featured Event Hero -->
    <section v-if="featuredEvent" class="relative w-full h-[60vh] min-h-[500px] overflow-hidden bg-deep-navy flex flex-col">
      <img 
        :alt="featuredEvent.title" 
        :src="featuredEvent.main_landing_image?.image ? resolveImageUrl(featuredEvent.main_landing_image.image) : ''" 
        class="absolute inset-0 w-full h-full object-cover opacity-60"
        @error="onImageError"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/30 to-transparent"></div>
      <div class="relative flex-grow flex items-end pb-16 z-10">
        <div class="max-container-fluid">
          <div class="max-w-4xl">
            <span class="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-black rounded-full mb-4 uppercase tracking-[0.3em]">
              Featured Experience
            </span>
            <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase">
              {{ featuredEvent.title }}
            </h1>
            <div class="flex flex-wrap gap-4">
              <NuxtLink
                :to="`/events/${featuredEvent.url_safe_title}`"
                class="btn-solid-navy px-12 py-5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-2xl flex items-center space-x-2 hover:scale-105 transition-all no-underline"
              >
                <span>View Details</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
              <!-- <button class="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-12 py-5 rounded-xl font-black text-[11px] uppercase tracking-widest border border-white/30 transition-all">
                Learn More
              </button> -->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Events Section -->
    <div ref="eventsSection" class="max-container-fluid pt-16 pb-24 w-full">
      <!-- Section Header -->
      <div class="mb-14 flex flex-col md:flex-row md:justify-between md:items-end space-y-6 md:space-y-0">
        <div>
          <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-deep-navy/40 mb-3">Upcoming Events</h2>
          <div class="flex items-center space-x-3">
            <div class="w-10 h-1.5 bg-deep-navy rounded-full"></div>
            <h3 class="text-4xl font-black tracking-tighter uppercase">Discover More</h3>
          </div>
        </div>

        <!-- Results Count -->
        <div class="flex items-center text-deep-navy/60">
          <span class="text-xs font-mono uppercase tracking-wider">
            {{ totalEvents }} {{ totalEvents === 1 ? 'event' : 'events' }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="showPlaceholderCards" class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <div v-for="i in 6" :key="i" class="event-card shadow-drawn">
          <div class="aspect-[16/9] w-full bg-gray-200 animate-pulse"></div>
          <div class="px-8 py-6 space-y-4">
            <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div class="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        </div>
      </div>

      <!-- Events Grid -->
      <div v-else-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <!-- Event Card -->
        <div 
          v-for="event in paginatedEvents" 
          :key="event.event_id" 
          class="event-card shadow-drawn shadow-drawn-hover flex flex-col group overflow-hidden cursor-pointer"
          @click="navigateTo(`/events/${event.url_safe_title}`)"
        >
          <!-- Event Image -->
          <div class="aspect-[16/9] w-full overflow-hidden relative border-b border-deep-navy/10">
            <img 
              v-if="event.main_landing_image?.image"
              :alt="event.title" 
              :src="resolveImageUrl(event.main_landing_image.image)"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              @error="onImageError"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-navy-accent">
              <svg class="w-20 h-20 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <!-- Badge -->
            <div v-if="event.status === 'OPEN'" class="absolute top-6 right-6">
              <span class="bg-white/95 backdrop-blur text-deep-navy px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-deep-navy/10 shadow-sm">
                Open for Registration
              </span>
            </div>
          </div>

          <!-- Event Details -->
          <div class="px-8 py-6 flex items-center justify-between bg-white border-t border-deep-navy/5 flex-grow">
            <div class="min-w-0 flex-grow pr-4">
              <div class="text-deep-navy/60 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center space-x-2">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatEventDate(event.start_datetime) }} • {{ event.organisation_name || 'AMDG' }}</span>
              </div>
              <h3 class="text-2xl font-black text-deep-navy leading-tight truncate group-hover:text-blue-900 transition-colors uppercase">
                {{ event.title }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="border border-deep-navy/20 p-12 bg-white/40 max-w-2xl mx-auto rounded-xl">
          <svg class="w-20 h-20 mx-auto text-deep-navy/40 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-2xl font-bold text-deep-navy mb-3 uppercase tracking-wide">
            No Events Found
          </h3>
          <p class="text-deep-navy/60 mb-8">
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
    </div>

    <!-- Explore by Region Section -->
    <section class="w-full bg-deep-navy py-24">
      <div class="max-container-fluid">
        <div class="mb-14">
          <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-3">Location Discovery</h2>
          <div class="flex items-center space-x-3">
            <div class="w-10 h-1.5 bg-white rounded-full"></div>
            <h3 class="text-4xl font-black tracking-tighter text-white uppercase">Explore by Region</h3>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- London -->
          <button
            type="button"
            class="region-card group shadow-drawn shadow-drawn-hover h-80 relative overflow-hidden rounded-2xl border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 0ms;"
            @click="applyRegionFilter('London')"
          >
            <img 
              alt="London" 
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-transparent to-transparent opacity-80"></div>
            <div class="absolute inset-0 p-8 flex flex-col justify-end">
              <span class="text-3xl font-black tracking-tighter text-white uppercase">London</span>
              <div class="flex items-center space-x-2 text-white/60 text-[9px] font-black uppercase tracking-widest mt-2">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{{ getEventCountByLocation('London') }} Active Events</span>
              </div>
            </div>
          </button>
          
          <!-- Birmingham -->
          <button
            type="button"
            class="region-card group shadow-drawn shadow-drawn-hover h-80 relative overflow-hidden rounded-2xl border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 150ms;"
            @click="applyRegionFilter('Birmingham')"
          >
            <img 
              alt="Birmingham" 
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=600&fit=crop"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-transparent to-transparent opacity-80"></div>
            <div class="absolute inset-0 p-8 flex flex-col justify-end">
              <span class="text-3xl font-black tracking-tighter text-white uppercase">Birmingham</span>
              <div class="flex items-center space-x-2 text-white/60 text-[9px] font-black uppercase tracking-widest mt-2">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{{ getEventCountByLocation('Birmingham') }} Active Events</span>
              </div>
            </div>
          </button>
          
          <!-- Southeast -->
          <button
            type="button"
            class="region-card group shadow-drawn shadow-drawn-hover h-80 relative overflow-hidden rounded-2xl border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 300ms;"
            @click="applyRegionFilter('Southeast')"
          >
            <img 
              alt="Southeast" 
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800&h=600&fit=crop"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-transparent to-transparent opacity-80"></div>
            <div class="absolute inset-0 p-8 flex flex-col justify-end">
              <span class="text-3xl font-black tracking-tighter text-white uppercase">Southeast</span>
              <div class="flex items-center space-x-2 text-white/60 text-[9px] font-black uppercase tracking-widest mt-2">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{{ getEventCountByLocation('Southeast') }} Active Events</span>
              </div>
            </div>
          </button>
          
          <!-- Wales -->
          <button
            type="button"
            class="region-card group shadow-drawn shadow-drawn-hover h-80 relative overflow-hidden rounded-2xl border border-white/10 opacity-0 animate-fade-in-up"
            style="animation-delay: 450ms;"
            @click="applyRegionFilter('Wales')"
          >
            <img 
              alt="Wales" 
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1589454073828-a4c0e29ba5eb?w=800&h=600&fit=crop"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-deep-navy via-transparent to-transparent opacity-80"></div>
            <div class="absolute inset-0 p-8 flex flex-col justify-end">
              <span class="text-3xl font-black tracking-tighter text-white uppercase">Wales</span>
              <div class="flex items-center space-x-2 text-white/60 text-[9px] font-black uppercase tracking-widest mt-2">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{{ getEventCountByLocation('Wales') }} Active Events</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <div v-if="!authStore.isAuthenticated" class="max-container-fluid py-24">
      <div class="border border-deep-navy/20 p-12 bg-gradient-to-br from-mist-blue to-white text-center rounded-xl">
        <div class="mb-6 inline-block border border-deep-navy/40 px-4 py-2 rounded-full">
          <span class="text-[10px] uppercase tracking-[0.3em] text-deep-navy font-black">Join The Community</span>
        </div>
        <h3 class="text-3xl font-black text-deep-navy mb-4 uppercase tracking-wide">
          Create Your Account Today
        </h3>
        <p class="text-lg text-deep-navy/60 mb-8 max-w-2xl mx-auto leading-relaxed">
          Sign up to access all events, register for gatherings, and connect with your faith community
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/register"
            class="bg-deep-navy text-white px-10 py-4 font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-lg no-underline"
          >
            Sign Up Free
          </NuxtLink>
          <NuxtLink 
            to="/login"
            class="border-2 border-deep-navy/20 text-deep-navy px-10 py-4 font-black uppercase tracking-widest text-sm hover:border-deep-navy/40 transition-colors rounded-lg no-underline"
          >
            Login
          </NuxtLink>
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

definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

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
.event-card {
  background: white;
  border: 1px solid rgba(10, 25, 47, 0.1);
  border-radius: 0;
}

.region-card {
  background: transparent;
  padding: 0;
  text-align: left;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
</style>
