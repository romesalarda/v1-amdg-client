<template>
  <div class="min-h-screen bg-white text-deep-navy">
    <!-- Floating Invitations Button -->
    <NuxtLink 
      to="/communities/inbox" 
      class="fixed top-20 right-6 z-50 px-4 py-2 bg-deep-navy/90 backdrop-blur-sm border border-deep-navy/40 text-white hover:border-deep-navy/80 hover:bg-deep-navy transition-all flex items-center gap-2 shadow-lg w-auto rounded-xl"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <span class="font-black uppercase tracking-wider text-[11px]">Invitations</span>
      <span 
        v-if="pendingInvitesCount > 0" 
        class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-black animate-pulse"
      >
        {{ pendingInvitesCount > 9 ? '9+' : pendingInvitesCount }}
      </span>
    </NuxtLink>

    <!-- Search Section -->
    <section class="w-full bg-white/95 backdrop-blur-md border-b border-deep-navy/10 py-6 sticky top-[40px] z-40 shadow-lg transition-all duration-300">
      <div class="max-w-[1000px] mx-auto px-6">
        <!-- Search Bar -->
        <div class="flex items-center bg-mist-blue rounded-xl overflow-hidden border border-deep-navy/5 shadow-sm p-1 mb-5">
          <div class="relative flex-grow min-w-0">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-deep-navy/40 text-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              v-model="searchQuery"
              class="w-full h-10 pl-10 pr-4 bg-transparent border-none text-[11px] font-bold text-deep-navy placeholder:text-deep-navy/30 focus:ring-0 outline-none" 
              placeholder="Search communities..." 
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
          <button class="bg-deep-navy text-white h-10 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest ml-1 shrink-0 hover:bg-deep-navy/90 transition-colors">
            Search
          </button>
        </div>

        <!-- Category Filter Pills -->
        <div class="flex items-center justify-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            @click="activeTab = 'all'"
            :class="activeTab === 'all' ? 'bg-deep-navy text-white' : 'bg-white text-deep-navy border border-deep-navy/10 hover:border-deep-navy/30'"
            class="whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm transition-colors"
          >
            All Communities
          </button>
          <button 
            v-if="authStore.isAuthenticated"
            @click="activeTab = 'my'"
            :class="activeTab === 'my' ? 'bg-deep-navy text-white' : 'bg-white text-deep-navy border border-deep-navy/10 hover:border-deep-navy/30'"
            class="whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors"
          >
            My Communities
          </button>
          <button 
            v-if="authStore.isAuthenticated"
            @click="activeTab = 'discover'"
            :class="activeTab === 'discover' ? 'bg-deep-navy text-white' : 'bg-white text-deep-navy border border-deep-navy/10 hover:border-deep-navy/30'"
            class="whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors"
          >
            Discover
          </button>
        </div>
      </div>
    </section>

    <!-- Communities Section -->
    <div class="max-w-8xl mx-auto px-6 pt-16 pb-24 w-full">
      <!-- Error State -->
      <div v-if="isError" class="text-center py-20">
        <div class="border-2 border-red-500/20 bg-red-50 p-12 max-w-2xl mx-auto rounded-xl">
          <svg class="w-20 h-20 mx-auto text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-2xl font-bold text-deep-navy mb-3 uppercase tracking-wide">Error Loading Communities</h3>
          <p class="text-deep-navy/60">Failed to load communities. Please try again later.</p>
        </div>
      </div>

      <template v-else>
        <!-- Section Header -->
        <div class="mb-14 flex flex-col md:flex-row md:justify-between md:items-end space-y-6 md:space-y-0">
          <div>
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-deep-navy/40 mb-3">Community Discovery</h2>
            <div class="flex items-center space-x-3">
              <div class="w-10 h-1.5 bg-deep-navy rounded-full"></div>
              <h3 class="text-4xl font-black tracking-tighter uppercase">Browse Communities</h3>
            </div>
          </div>

          <!-- Results Count -->
          <div v-if="!isLoading" class="flex items-center text-deep-navy/60">
            <span class="text-xs font-mono uppercase tracking-wider">
              {{ displayedOrganisations.length }} {{ displayedOrganisations.length === 1 ? 'community' : 'communities' }}
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          <div v-for="i in 6" :key="i" class="shadow-drawn">
            <div class="aspect-[16/9] w-full bg-gray-200 animate-pulse"></div>
            <div class="px-8 py-6 space-y-4">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Communities Grid -->
        <div v-else-if="displayedOrganisations && displayedOrganisations.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          <!-- Community Card -->
          <div 
            v-for="org in displayedOrganisations" 
            :key="org.id" 
            class="shadow-drawn shadow-drawn-hover flex flex-col group overflow-hidden cursor-pointer"
            @click="navigateTo(`/communities/${org.url_safe_title || org.id}`)"
          >
            <!-- Community Image -->
            <div class="aspect-[16/9] w-full overflow-hidden relative border-b border-deep-navy/10">
              <img 
                v-if="org.landing_image"
                :alt="org.title" 
                :src="resolveImageUrl(org.landing_image)"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                @error="onImageError"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-mist-blue to-white">
                <svg class="w-20 h-20 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              <!-- Logo Overlay -->
              <div v-if="org.logo" class="absolute bottom-6 left-6 w-16 h-16 bg-white/95 backdrop-blur border border-deep-navy/10 p-2 rounded-lg shadow-sm">
                <img
                  :src="resolveImageUrl(org.logo)"
                  :alt="`${org.title} logo`"
                  class="w-full h-full object-contain"
                  @error="(e) => onImageError(e)"
                />
              </div>
              
              <!-- Badge -->
              <div v-if="isMemberOf(org.id)" class="absolute top-6 right-6">
                <span class="bg-green-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                  Member
                </span>
              </div>
            </div>

            <!-- Community Details -->
            <div class="px-8 py-6 flex flex-col justify-between bg-white border-t border-deep-navy/5 flex-grow">
              <div>
                <h3 class="text-2xl font-black text-deep-navy leading-tight group-hover:text-blue-900 transition-colors uppercase mb-2">
                  {{ org.title }}
                </h3>
                <p v-if="org.description" class="text-deep-navy/60 text-sm leading-relaxed line-clamp-2">
                  {{ org.description }}
                </p>
              </div>
              
              <div class="mt-4 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-deep-navy/50">
                <span v-if="org.requires_manual_verification" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified
                </span>
                <span v-if="org.required_acceptance_code" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Invite Required
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!displayedOrganisations || displayedOrganisations.length === 0" class="text-center py-20">
          <div class="border border-deep-navy/20 p-12 bg-white/40 max-w-2xl mx-auto rounded-xl">
            <svg class="w-20 h-20 mx-auto text-deep-navy/40 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 class="text-2xl font-bold text-deep-navy mb-3 uppercase tracking-wide">
              {{ searchQuery ? 'No Communities Found' : activeTab === 'my' ? 'No Communities Yet' : 'No Communities Found' }}
            </h3>
            <p class="text-deep-navy/60 mb-8">
              {{ searchQuery ? 'Try adjusting your search criteria' : activeTab === 'my' ? 'Discover and join communities to see them here' : 'Check back soon for new communities' }}
            </p>
            <div v-if="searchQuery || activeTab === 'my'" class="flex gap-4 justify-center">
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''" 
                class="bg-deep-navy text-white px-10 py-4 font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-lg"
              >
                Clear Search
              </button>
              <button 
                v-else-if="activeTab === 'my'" 
                @click="activeTab = 'discover'" 
                class="bg-deep-navy text-white px-10 py-4 font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-lg"
              >
                Discover Communities
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!isLoading && displayedOrganisations.length > 0 && totalPages > 1" class="flex justify-center mt-12">
          <UPagination
            v-model="currentPage"
            :page-count="pageSize"
            :total="totalCount"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganisations } from '~/composables/resources/organisation/organisations'
import { useOrganisationMemberships } from '~/composables/resources/organisation/organisationMemberships'
import { useOrganisationInvites } from '~/composables/resources/organisation/organisationInvites'
import { useAuthStore } from '~/stores/auth'
import { resolveImageUrl, onImageError } from '~/utils/image'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Communities',
  meta: [
    { name: 'description', content: 'Browse and join communities to connect with others and discover exclusive events.' }
  ]
})

const authStore = useAuthStore()

// State
const searchQuery = ref('')
const activeTab = ref<'all' | 'my' | 'discover'>('all')
const currentPage = ref(1)
const pageSize = 12

// Fetch user's organization memberships
const { data: membershipsData } = useOrganisationMemberships(
  computed(() => authStore.isAuthenticated ? {
    user: authStore.user?.id,
  } : undefined),
)

const userOrganizationIds = computed(() => {
  const memberships = membershipsData.value?.data?.results || []
  return memberships.map(m => m.organisation)
})

const isMemberOf = (orgId: number) => userOrganizationIds.value.includes(orgId)

// Fetch organizations with pagination and search
const { data, isLoading, isError } = useOrganisations(
  computed(() => {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize,
    }
    
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    return params
  })
)

const organisations = computed(() => data.value?.data?.results || [])
const totalCount = computed(() => data.value?.data?.count || 0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

// Filter organizations based on active tab
const displayedOrganisations = computed(() => {
  if (activeTab.value === 'my') {
    return organisations.value.filter(org => isMemberOf(org.id))
  } else if (activeTab.value === 'discover') {
    return organisations.value.filter(org => !isMemberOf(org.id))
  }
  return organisations.value
})

// Reset to page 1 when search or tab changes
watch([searchQuery, activeTab], () => {
  currentPage.value = 1
})

// Fetch pending invites count for notification badge
const { data: invitesData } = useOrganisationInvites(computed(() => ({
  target_user: authStore.user?.id,
})))

const pendingInvitesCount = computed(() => {
  const invites = invitesData.value?.data?.results || []
  return invites.filter(inv => !inv.accepted && inv.is_valid && inv.is_active).length
})
</script>

<style scoped>
.shadow-drawn {
  background: white;
  border: 1px solid rgba(10, 25, 47, 0.1);
  border-radius: 0;
}

.shadow-drawn-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.shadow-drawn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(10, 25, 47, 0.1);
}
</style>