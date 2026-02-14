<template>
  <div class="min-h-screen bg-mist-blue">
    <!-- Hero Section with Featured Event -->
    <section v-if="featuredEvent" class="relative w-full h-[360px] overflow-hidden bg-deep-navy cursor-pointer group" @click="router.push(`/events/${featuredEvent.event_id}/`)">
      <img 
        v-if="featuredEvent.main_landing_image" 
        :src="resolveImageUrl(featuredEvent.main_landing_image.image)" 
        alt="Featured Event" 
        class="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
        @error="(e) => onImageError(e)"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-deep-navy/98 via-deep-navy/85 to-deep-navy/60"></div>
      
      <div class="absolute inset-0 flex items-center">
        <div class="max-w-screen-xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <div>
            <div class="flex items-center gap-3 mb-6">
              <span class="bg-blue-500/20 text-blue-400 border border-blue-400/30 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.1em] uppercase">Active Engagement</span>
            </div>
            <h1 class="text-4xl md:text-5xl font-black leading-tight text-white mb-4">{{ featuredEvent.title }}</h1>
            <div class="flex items-center gap-4">
              <p v-if="featuredEvent.organisation_name" class="text-white/60 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {{ featuredEvent.organisation_name }}
              </p>
            </div>
          </div>
          
          <!-- Countdown Timer -->
          <div class="flex justify-center lg:justify-end">
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white w-full max-w-sm flex flex-col items-center">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] mb-8 opacity-50 flex items-center gap-2">
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Commencing In
              </p>
              <div class="flex items-center justify-center gap-4 w-full">
                <div class="text-center flex-1">
                  <p class="text-3xl lg:text-4xl font-black">{{ countdown.days }}</p>
                  <p class="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1">Days</p>
                </div>
                <div class="w-px h-12 bg-white/10"></div>
                <div class="text-center flex-1">
                  <p class="text-3xl lg:text-4xl font-black">{{ countdown.hours }}</p>
                  <p class="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1">Hours</p>
                </div>
                <div class="w-px h-12 bg-white/10"></div>
                <div class="text-center flex-1">
                  <p class="text-3xl lg:text-4xl font-black">{{ countdown.minutes }}</p>
                  <p class="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1">Mins</p>
                </div>
                <div class="w-px h-12 bg-white/10"></div>
                <div class="text-center flex-1">
                  <p class="text-3xl lg:text-4xl font-black animate-pulse">{{ countdown.seconds }}</p>
                  <p class="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1">Secs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sticky Sub-Navigation
    <div class="bg-white border-b border-deep-navy/10 sticky top-16 z-40">
      <div class="max-w-screen-xl mx-auto px-6">
        <div class="flex items-center gap-8">
          <button class="py-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-blue-500 text-deep-navy">Timeline</button>
          <button class="py-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-transparent text-deep-navy/40 hover:text-deep-navy transition-colors">Discover</button>
          <button class="py-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-transparent text-deep-navy/40 hover:text-deep-navy transition-colors">Calendar</button>
        </div>
      </div>
    </div> -->

    <!-- Main Content -->
    <div class="max-w-screen-xl mx-auto px-6 pt-10">
      <!-- Search and Filters -->
      <div class="mb-10 space-y-6">
        <div class="relative w-full">
          <svg class="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="searchQuery"
            class="w-full pl-14 pr-6 py-4 bg-white border border-deep-navy/10 rounded-2xl text-base text-deep-navy shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-deep-navy/30 font-semibold" 
            placeholder="Search your upcoming events, tasks, or briefings..." 
            type="text"
          />
        </div>

        <div class="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button 
            @click="activeFilter = 'all'"
            :class="[
              'px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeFilter === 'all' ? 'bg-deep-navy text-white shadow-lg shadow-deep-navy/20' : 'bg-white border border-deep-navy/10 text-deep-navy/60 hover:border-blue-500 hover:text-blue-500'
            ]"
          >
            All Schedule
          </button>
          <button 
            @click="activeFilter = 'staff'"
            :class="[
              'px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeFilter === 'staff' ? 'bg-deep-navy text-white shadow-lg shadow-deep-navy/20' : 'bg-white border border-deep-navy/10 text-deep-navy/60 hover:border-blue-500 hover:text-blue-500'
            ]"
          >
            Staffing
          </button>
          <button 
            @click="activeFilter = 'participating'"
            :class="[
              'px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeFilter === 'participating' ? 'bg-deep-navy text-white shadow-lg shadow-deep-navy/20' : 'bg-white border border-deep-navy/10 text-deep-navy/60 hover:border-blue-500 hover:text-blue-500'
            ]"
          >
            Participating
          </button>
          <button 
            @click="showFilters = !showFilters"
            :class="[
              'ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors',
              showFilters ? 'text-blue-600' : 'text-deep-navy/40 hover:text-deep-navy'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
          </button>
        </div>

        <!-- Filters Panel -->
        <div v-if="showFilters" class="bg-white border border-deep-navy/10 rounded-2xl p-6 shadow-drawn">
          <h4 class="text-sm font-black text-deep-navy mb-4 uppercase tracking-wider">Additional Filters</h4>
          <div class="flex items-center gap-3">
            <button 
              @click="selectedDate = null"
              :class="[
                'px-4 py-2 rounded-lg text-xs font-bold transition-all',
                !selectedDate ? 'bg-blue-500 text-white' : 'bg-mist-blue text-deep-navy/60 hover:bg-blue-100'
              ]"
            >
              All Dates
            </button>
            <button 
              v-if="selectedDate"
              class="px-4 py-2 rounded-lg text-xs font-bold bg-blue-100 text-blue-600 border border-blue-500/20"
            >
              {{ formatSelectedDate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Two Column Layout: Events + Calendar Sidebar -->
      <div class="flex flex-col lg:flex-row gap-10 pb-20">
        <!-- Events List -->
        <div class="flex-grow space-y-8">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-black tracking-tight text-deep-navy">Upcoming Schedule</h2>
          </div>

          <div v-if="isLoadingEvents" class="space-y-6">
            <USkeleton v-for="i in 3" :key="i" class="h-48 w-full" />
          </div>

          <div v-else class="space-y-6">
            <!-- Upcoming Events -->
            <div 
              v-for="event in filteredEvents" 
              :key="event.event_id"
              class="bg-white border border-deep-navy/10 shadow-drawn rounded-2xl overflow-hidden group hover:border-blue-500/20 transition-all cursor-pointer"
              @click="router.push(`/events/${event.event_id}/`)"
            >
              <div class="flex flex-col md:flex-row h-auto md:h-48">
                <div class="w-full md:w-64 h-48 md:h-full overflow-hidden relative">
                  <img 
                    v-if="event.main_landing_image"
                    :src="resolveImageUrl(event.main_landing_image.image)" 
                    alt="Event" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    @error="(e) => onImageError(e)"
                  />
                  <div v-else class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                  <div class="absolute top-4 left-4 bg-deep-navy/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">
                    {{ staffEventIds.has(event.id) ? 'Staff' : 'Attending' }}
                  </div>
                </div>
                
                <div class="flex-grow p-6 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">{{ formatEventDateShort(event.start_datetime) }}</span>
                      <span class="w-1 h-1 bg-deep-navy/10 rounded-full"></span>
                      <span class="text-[10px] font-bold text-deep-navy/40 uppercase tracking-widest">{{ getRelativeTime(event.start_datetime) }}</span>
                    </div>
                    <h3 class="text-xl font-black text-deep-navy group-hover:text-blue-600 transition-colors">{{ event.title }}</h3>
                    <div v-if="event.organisation_name" class="flex items-center gap-4 mt-3">
                      <span class="flex items-center gap-1.5 text-[11px] font-bold text-deep-navy/60">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {{ event.organisation_name }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between mt-4">
                    <div class="flex -space-x-2">
                      <div class="w-7 h-7 rounded-full bg-slate-200 border-2 border-white text-[9px] flex items-center justify-center font-bold">JD</div>
                      <div class="w-7 h-7 rounded-full bg-slate-300 border-2 border-white text-[9px] flex items-center justify-center font-bold">MK</div>
                      <div class="w-7 h-7 rounded-full bg-slate-400 border-2 border-white text-[9px] flex items-center justify-center font-bold">TL</div>
                      <div class="text-[9px] font-bold text-deep-navy/40 pl-4">+12 others</div>
                    </div>
                    <button class="bg-blue-500/10 text-blue-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">View Details</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Staff Events -->
            <div 
              v-for="event in filteredStaffEvents" 
              :key="'staff-' + event.event_id"
              class="bg-white border border-deep-navy/10 shadow-drawn rounded-2xl overflow-hidden group hover:border-blue-500/20 transition-all cursor-pointer"
              @click="router.push(`/events/${event.event_id}/m/dashboard`)"
            >
              <div class="flex flex-col md:flex-row h-auto md:h-48">
                <div class="w-full md:w-64 h-48 md:h-full overflow-hidden relative">
                  <img 
                    v-if="event.main_landing_image"
                    :src="resolveImageUrl(event.main_landing_image.image)" 
                    alt="Event" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    @error="(e) => onImageError(e)"
                  />
                  <div v-else class="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600"></div>
                  <div class="absolute top-4 left-4 bg-deep-navy/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Lead Staff</div>
                </div>
                
                <div class="flex-grow p-6 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">{{ formatEventDateShort(event.start_datetime) }}</span>
                      <span class="w-1 h-1 bg-deep-navy/10 rounded-full"></span>
                      <span class="text-[10px] font-bold text-deep-navy/40 uppercase tracking-widest">{{ getRelativeTime(event.start_datetime) }}</span>
                    </div>
                    <h3 class="text-xl font-black text-deep-navy group-hover:text-blue-600 transition-colors">{{ event.title }}</h3>
                    <div v-if="event.organisation_name" class="flex items-center gap-4 mt-3">
                      <span class="flex items-center gap-1.5 text-[11px] font-bold text-deep-navy/60">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {{ event.organisation_name }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-1 rounded-md bg-mist-blue text-deep-navy/60 text-[8px] font-black uppercase tracking-wider border border-deep-navy/5">Staff Role</span>
                      <span class="px-2.5 py-1 rounded-md bg-mist-blue text-deep-navy/60 text-[8px] font-black uppercase tracking-wider border border-deep-navy/5">Leadership</span>
                    </div>
                    <button class="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline underline-offset-4">Manage Event</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar Sidebar -->
        <aside class="w-full lg:w-80 shrink-0">
          <div class="bg-white border border-deep-navy/10 shadow-drawn p-6 sticky top-40 rounded-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-deep-navy">Schedule View</h3>
              <div class="flex gap-1">
                <button @click="previousMonth" class="p-1 hover:text-blue-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button @click="nextMonth" class="p-1 hover:text-blue-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="mb-4">
              <p class="text-sm font-bold text-deep-navy mb-4">{{ currentMonthYear }}</p>
              <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-deep-navy/30 uppercase mb-2">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>
              <div class="grid grid-cols-7 gap-1 text-center">
                <div 
                  v-for="day in calendarDays" 
                  :key="day.key"
                  @click="selectDate(day)"
                  :class="[
                    'py-2 text-[11px] rounded-lg cursor-pointer transition-colors',
                    day.isCurrentMonth ? (
                      day.isToday ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20' : 
                      day.hasEvent ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold' : 
                      'font-bold text-deep-navy hover:bg-mist-blue'
                    ) : 'text-deep-navy/20',
                    day.isSelected && 'ring-2 ring-blue-500 ring-offset-2'
                  ]"
                >
                  {{ day.day }}
                </div>
              </div>
            </div>
            
            <div class="pt-6 border-t border-deep-navy/5 space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-deep-navy/60">Today</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-blue-500/30"></div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-deep-navy/60">Scheduled Events</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- My Communities Section -->
    <section class="bg-white border-y border-deep-navy/5 py-16">
      <div class="max-w-screen-xl mx-auto px-6">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-deep-navy">My Communities</h2>
            <p class="text-deep-navy/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Your active memberships and roles</p>
          </div>
          <a class="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline" href="#">View All</a>
        </div>
        
        <div v-if="isLoadingOrganisations" class="flex gap-6 overflow-x-auto no-scrollbar pb-8">
          <USkeleton v-for="i in 3" :key="i" class="w-72 h-40 shrink-0" />
        </div>
        
        <div v-else-if="userOrganisations.length > 0" class="flex gap-6 overflow-x-auto no-scrollbar pb-8">
          <!-- User's organisation cards -->
          <div 
            v-for="org in userOrganisations" 
            :key="org.id"
            class="w-72 shrink-0 group cursor-pointer"
            @click="router.push(`/communities/${org.id}`)"
          >
            <div class="aspect-[16/9] rounded-xl overflow-hidden bg-mist-blue mb-3 relative border border-deep-navy/5 shadow-drawn transition-transform hover:-translate-y-1">
              <img 
                v-if="org.landing_image" 
                :src="resolveImageUrl(org.landing_image)" 
                :alt="org.title"
                class="w-full h-full object-cover" 
                @error="(e) => onImageError(e)" 
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span class="text-white text-4xl font-black opacity-20">{{ org.title.charAt(0) }}</span>
              </div>
              <div class="absolute inset-0 bg-deep-navy/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-black text-deep-navy uppercase tracking-wider group-hover:text-blue-600 transition-colors">{{ org.title }}</span>
              <span class="text-[10px] font-bold text-deep-navy/40 uppercase tracking-widest">
                {{ org.membership?.is_verified ? 'Active Member' : 'Pending Verification' }}
              </span>
            </div>
          </div>
          
          <!-- Find New Community card -->
          <div class="w-72 shrink-0 group" @click="router.push('/communities')">
            <div class="aspect-[16/9] rounded-xl border-2 border-dashed border-deep-navy/10 flex flex-col items-center justify-center text-deep-navy/30 group-hover:border-blue-500 group-hover:text-blue-500 transition-all cursor-pointer bg-mist-blue/20">
              <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-[10px] font-black uppercase tracking-widest">Find New Community</span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12 bg-mist-blue border border-deep-navy/10 rounded-2xl">
          <svg class="w-12 h-12 mx-auto text-deep-navy/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="text-lg font-black text-deep-navy mb-2">No Communities Yet</h3>
          <p class="text-deep-navy/60 font-medium text-sm mb-4">Join a community to get started</p>
          <button 
            @click="router.push('/organisations')"
            class="bg-deep-navy text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg shadow-deep-navy/20"
          >
            Explore Communities
          </button>
        </div>
      </div>
    </section>

    <!-- Discover Opportunities Section -->
    <div class="max-w-screen-xl mx-auto px-6 py-20">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 class="text-3xl font-black tracking-tight text-deep-navy">Discover Opportunities</h2>
          <p class="text-deep-navy/40 text-sm font-medium mt-1 uppercase tracking-widest">Find your next mission or formation event</p>
        </div>
      </div>
      
      <div v-if="isLoadingRecommended" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <USkeleton v-for="i in 6" :key="i" class="h-80 w-full" />
      </div>
      
      <div v-else-if="recommendedEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="event in recommendedEvents" 
          :key="event.event_id"
          class="bg-white border border-deep-navy/10 shadow-drawn rounded-2xl overflow-hidden group cursor-pointer border-transparent hover:border-blue-500/20 transition-all hover:-translate-y-1"
          @click="router.push(`/events/${event.event_id}`)"
        >
          <div class="aspect-video relative overflow-hidden">
            <img 
              v-if="event.main_landing_image"
              :src="resolveImageUrl(event.main_landing_image.resource_url)" 
              alt="Event" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              @error="(e) => onImageError(e)"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-deep-navy/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
              <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">{{ formatEventDateShort(event.start_datetime) }}</span>
              <h4 class="text-white font-black text-lg">{{ event.title }}</h4>
            </div>
          </div>
          
          <!-- <div class="p-5">
            <p v-if="event." class="text-deep-navy/60 text-[11px] font-medium leading-relaxed mb-4 line-clamp-2">
              {{ event.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-blue-600 uppercase tracking-wider">View Details</span>
              <svg class="w-5 h-5 text-deep-navy/20 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div> -->
        </div>
      </div>
      
      <div v-else class="text-center py-20 bg-mist-blue border border-deep-navy/10 rounded-2xl">
        <svg class="w-16 h-16 mx-auto text-deep-navy/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-xl font-black text-deep-navy mb-2">No events available</h3>
        <p class="text-deep-navy/60 font-medium">Check back later for new opportunities</p>
      </div>
      
      <div class="mt-12 text-center">
        <button 
          @click="router.push('/events')"
          class="bg-deep-navy text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-deep-navy/20"
        >
          Explore All Events
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUpcomingEvents } from '~/composables/resources/events/events'
import { useOrganisationMemberships } from '~/composables/resources/organisation/organisationMemberships'
import { useOrganisations } from '~/composables/resources/organisation/organisations'
import { useOrganisationControls } from '~/composables/resources/organisation/organisationControls'
import { useEventStaff } from '~/composables/resources/events/eventStaff'
import { useAuthStore } from '~/stores/auth'
import { DateTime } from 'luxon'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { onMounted, onUnmounted } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const authStore = useAuthStore()

// State for filters and search
const searchQuery = ref('')
const activeFilter = ref<'all' | 'staff' | 'participating'>('all')
const showFilters = ref(false)
const selectedDate = ref<DateTime | null>(null)

// Fetch upcoming events
const { data: eventsData, isLoading: isLoadingEvents } = useUpcomingEvents()
const allEvents = computed(() => eventsData.value?.data?.results || [])

// Fetch staff assignments for current user
const { data: staffData, isLoading: isLoadingStaff } = useEventStaff(computed(() => ({
  user: authStore.user?.id,
})))
const staffAssignments = computed(() => staffData.value?.data?.results || [])

// Get event IDs where user is staff
const staffEventIds = computed(() => {
  return new Set(staffAssignments.value.map(s => s.event))
})

// Fetch user's organization memberships
const { data: membershipsData } = useOrganisationMemberships(computed(() => ({
  user: authStore.user?.id,
})))
const userMemberships = computed(() => membershipsData.value?.data?.results || [])
const userOrganizationIds = computed(() => {
  return userMemberships.value.map(m => m.organisation)
})

// Fetch all organisations to get full details (images, etc.)
const { data: organisationsData, isLoading: isLoadingOrganisations } = useOrganisations()
const allOrganisations = computed(() => organisationsData.value?.data?.results || [])

// Filter to only user's organisations with full details
const userOrganisations = computed(() => {
  return allOrganisations.value
    .filter(org => userOrganizationIds.value.includes(org.id))
    .map(org => {
      const membership = userMemberships.value.find(m => m.organisation === org.id)
      return {
        ...org,
        membership
      }
    })
})

// Filter user's upcoming events (from their organizations, excluding staff events)
const myUpcomingEvents = computed(() => {
  return allEvents.value
    .filter(event => 
      event.organisation && 
      userOrganizationIds.value.includes(event.organisation) &&
      !staffEventIds.value.has(event.id)
    )
    .slice(0, 6)
})

// Events where user is staff
const staffEvents = computed(() => {
  return allEvents.value
    .filter(event => staffEventIds.value.has(event.id))
    .slice(0, 6)
})

// Recommended events (events from other organizations, excluding staff events)
const recommendedEvents = computed(() => {
  return allEvents.value
    .filter(event => 
      (!event.organisation || !userOrganizationIds.value.includes(event.organisation)) &&
      !staffEventIds.value.has(event.id)
    )
    .slice(0, 6)
})

const isLoadingRecommended = isLoadingEvents

// Filtered events based on search, date, and filter type
const filteredEvents = computed(() => {
  let events = myUpcomingEvents.value

  // Apply filter type
  if (activeFilter.value === 'staff') {
    return []
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    events = events.filter(event => 
      event.title?.toLowerCase().includes(query) ||
      event.organisation_name?.toLowerCase().includes(query)
    )
  }

  // Apply date filter
  if (selectedDate.value) {
    const targetDate = selectedDate.value.toISODate()
    events = events.filter(event => {
      const eventDate = DateTime.fromISO(event.start_datetime).toISODate()
      return eventDate === targetDate
    })
  }

  return events
})

const filteredStaffEvents = computed(() => {
  let events = staffEvents.value

  // Apply filter type
  if (activeFilter.value === 'participating') {
    return []
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    events = events.filter(event => 
      event.title?.toLowerCase().includes(query) ||
      event.organisation_name?.toLowerCase().includes(query)
    )
  }

  // Apply date filter
  if (selectedDate.value) {
    const targetDate = selectedDate.value.toISODate()
    events = events.filter(event => {
      const eventDate = DateTime.fromISO(event.start_datetime).toISODate()
      return eventDate === targetDate
    })
  }

  return events
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toFormat('MMM dd, yyyy')
})

// Featured event (next upcoming event)
const featuredEvent = computed(() => {
  const combinedEvents = [...myUpcomingEvents.value, ...staffEvents.value]
  if (combinedEvents.length === 0) return null
  
  // Sort by start date
  const sorted = combinedEvents.sort((a, b) => {
    return DateTime.fromISO(a.start_datetime).toMillis() - DateTime.fromISO(b.start_datetime).toMillis()
  })
  
  return sorted[0]
})

// Countdown for featured event with live updates
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })

const updateCountdown = () => {
  if (!featuredEvent.value) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  
  const now = DateTime.now()
  const eventDate = DateTime.fromISO(featuredEvent.value.start_datetime)
  const diff = eventDate.diff(now, ['days', 'hours', 'minutes', 'seconds'])
  
  countdown.value = {
    days: Math.floor(diff.days),
    hours: Math.floor(diff.hours),
    minutes: Math.floor(diff.minutes),
    seconds: Math.floor(diff.seconds)
  }
}

// Update countdown every second
onMounted(() => {
  updateCountdown()
  const interval = setInterval(updateCountdown, 1000)
  onUnmounted(() => clearInterval(interval))
})

// Format functions
const formatEventDateShort = (dateString: string) => {
  return DateTime.fromISO(dateString).toFormat('MMM dd • HH:mm').toUpperCase()
}

const getRelativeTime = (dateString: string) => {
  const eventDate = DateTime.fromISO(dateString)
  const now = DateTime.now()
  const diff = eventDate.diff(now, ['days'])
  
  const days = Math.floor(diff.days)
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `In ${days} days`
  return `In ${Math.floor(days / 7)} weeks`
}

// Calendar state
const currentMonth = ref(DateTime.now())

const currentMonthYear = computed(() => {
  return currentMonth.value.toFormat('MMMM yyyy')
})

const calendarDays = computed(() => {
  const start = currentMonth.value.startOf('month').startOf('week')
  const end = currentMonth.value.endOf('month').endOf('week')
  const days = []
  let current = start

  while (current <= end) {
    const eventDates = new Set([
      ...myUpcomingEvents.value.map(e => DateTime.fromISO(e.start_datetime).toISODate()),
      ...staffEvents.value.map(e => DateTime.fromISO(e.start_datetime).toISODate())
    ])
    
    days.push({
      day: current.day,
      key: current.toISO(),
      date: current,
      isCurrentMonth: current.month === currentMonth.value.month,
      isToday: current.hasSame(DateTime.now(), 'day'),
      hasEvent: eventDates.has(current.toISODate()),
      isSelected: selectedDate.value ? current.hasSame(selectedDate.value, 'day') : false
    })
    current = current.plus({ days: 1 })
  }
  
  return days
})

const selectDate = (day: any) => {
  if (!day.isCurrentMonth) return
  
  if (selectedDate.value && selectedDate.value.hasSame(day.date, 'day')) {
    selectedDate.value = null
  } else {
    selectedDate.value = day.date
    showFilters.value = true
  }
}

const previousMonth = () => {
  currentMonth.value = currentMonth.value.minus({ months: 1 })
}

const nextMonth = () => {
  currentMonth.value = currentMonth.value.plus({ months: 1 })
}

// Set page metadata
useHead({
  title: 'My Dashboard - AMDG',
  meta: [
    { name: 'description', content: 'Your personal event dashboard' }
  ]
})
</script>
