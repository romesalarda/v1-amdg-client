<template>
  <div class="min-h-screen">
    <!-- Floating Invitations Button -->
    <NuxtLink 
      to="/communities/inbox" 
      class="fixed top-6 right-6 z-50 px-4 py-2 bg-navy-accent/90 backdrop-blur-sm border border-primary/40 text-white hover:border-primary/80 hover:bg-navy-accent transition-all flex items-center gap-2 shadow-lg shadow-primary/10 w-auto"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      Invitations
      <span 
        v-if="pendingInvitesCount > 0" 
        class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[#0a192f] text-[10px] font-bold animate-pulse"
      >
        {{ pendingInvitesCount > 9 ? '9+' : pendingInvitesCount }}
      </span>
    </NuxtLink>

    <!-- Header -->
    <section class="max-w-8xl mx-auto px-6 lg:px-10 py-8">
      <div class="text-center mb-8">
        <div class="mb-3 flex justify-center items-center gap-4 opacity-40">
          <div class="h-[1px] w-12 bg-primary"></div>
          <span class="text-[10px] uppercase tracking-[0.5em] text-primary">Community Registry</span>
          <div class="h-[1px] w-12 bg-primary"></div>
        </div>

        <h1 class="text-white font-light text-3xl md:text-5xl leading-tight mb-4">
          Discover <span class="gold-gradient-text italic font-black glow-gold">Communities</span>
        </h1>
        <p class="text-white/70 max-w-2xl mx-auto">
          Join communities to connect with others and see exclusive events
        </p>
      </div>
      
      <!-- Search and Filters -->
      <div class="flex flex-col lg:flex-row gap-3 w-11/12 mx-auto">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search communities..."
            class="w-full h-10 px-4 pl-10 bg-navy-accent/60 border border-primary/30 text-white placeholder-white/60 focus:outline-none focus:border-primary/60 transition-colors"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex gap-2">
          <button
            @click="activeTab = 'all'"
            :class="activeTab === 'all' ? 'bg-primary text-[#0a192f] border-primary' : 'bg-navy-accent/60 text-white border-primary/30 hover:border-primary/60'"
            class="px-4 h-10 border transition-colors whitespace-nowrap"
          >
            All Communities
          </button>
          <button
            v-if="authStore.isAuthenticated"
            @click="activeTab = 'my'"
            :class="activeTab === 'my' ? 'bg-primary text-[#0a192f] border-primary' : 'bg-navy-accent/60 text-white border-primary/30 hover:border-primary/60'"
            class="px-4 h-10 border transition-colors whitespace-nowrap"
          >
            My Communities
          </button>
          <button
            v-if="authStore.isAuthenticated"
            @click="activeTab = 'discover'"
            :class="activeTab === 'discover' ? 'bg-primary text-[#0a192f] border-primary' : 'bg-navy-accent/60 text-white border-primary/30 hover:border-primary/60'"
            class="px-4 h-10 border transition-colors whitespace-nowrap"
          >
            Discover
          </button>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-8xl mx-auto px-6 lg:px-10 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="i in 6" :key="i" class="bg-navy-accent/60 border border-primary/30 overflow-hidden">
          <USkeleton class="h-48 w-full" />
          <div class="p-3 space-y-2">
            <USkeleton class="h-6 w-3/4" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Organizations Grid -->
    <div v-else-if="displayedOrganisations && displayedOrganisations.length > 0" class="max-w-8xl mx-auto px-6 lg:px-10 py-2">
      <!-- Results Info -->
      <div class="mb-4 flex items-center justify-between">
        <p class="text-xs text-primary/60 font-mono uppercase tracking-wider">
          Showing {{ displayedOrganisations.length }} of {{ totalCount }} 
          {{ activeTab === 'my' ? 'communities you\'re a member of' : activeTab === 'discover' ? 'new communities to discover' : 'communities' }}
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
        <NuxtLink
          v-for="org in displayedOrganisations"
          :key="org.id"
          :to="`/communities/${org.id}`"
          class="group bg-navy-accent/40 border border-primary/30 hover:border-primary/60 transition-all duration-200 overflow-hidden architectural-border"
        >
          <!-- Image -->
          <div class="relative h-60 bg-navy-accent overflow-hidden">
            <img
              v-if="org.landing_image"
              :src="resolveImageUrl(org.landing_image)"
              :alt="org.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              @error="(e) => onImageError(e)"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-navy-accent">
              <svg class="w-16 h-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <!-- Logo Overlay (if available) -->
            <div v-if="org.logo" class="absolute bottom-3 left-3 w-16 h-16 bg-navy-accent/90 border border-primary/30 p-2">
              <img
                :src="resolveImageUrl(org.logo)"
                :alt="`${org.title} logo`"
                class="w-full h-full object-contain"
                @error="(e) => onImageError(e)"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="p-3">
            <h3 class="text-lg font-semibold text-white group-hover:text-primary transition-colors uppercase tracking-wider">
              {{ org.title }}
            </h3>
            
            <p v-if="org.description" class="mt-2 text-white/70 text-sm line-clamp-2">
              {{ org.description }}
            </p>
            
            <div class="mt-3 flex items-center justify-between text-xs">
              <div class="flex items-center gap-3 text-white/60">
                <span v-if="org.requires_manual_verification" class="flex items-center gap-1 font-mono">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified
                </span>
                <span v-if="org.required_acceptance_code" class="flex items-center gap-1 font-mono">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Invite
                </span>
                <span v-if="isMemberOf(org.id)" class="px-2 py-0.5 bg-primary/20 text-primary border border-primary/40 font-mono uppercase">
                  Member
                </span>
              </div>
              
              <svg class="w-4 h-4 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </NuxtLink>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <div class="flex items-center gap-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 bg-navy-accent/60 border border-primary/30 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/60 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="px-4 py-2 bg-primary text-[#0a192f] font-mono text-sm">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 bg-navy-accent/60 border border-primary/30 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/60 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="max-w-8xl mx-auto px-6 lg:px-10 py-20">
      <div class="text-center">
        <svg class="mx-auto w-16 h-16 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-white">
          {{ searchQuery ? 'No communities found' : activeTab === 'my' ? 'You haven\'t joined any communities yet' : 'No communities found' }}
        </h3>
        <p class="mt-2 text-white/60">
          {{ searchQuery ? 'Try adjusting your search terms' : activeTab === 'my' ? 'Discover and join communities to see them here' : 'Check back later for new communities to join.' }}
        </p>
        <div v-if="searchQuery || activeTab === 'my'" class="mt-6 flex gap-3 justify-center">
          <button v-if="searchQuery" @click="searchQuery = ''" class="px-6 py-2 bg-primary text-[#0a192f] border border-primary hover:bg-primary/90 transition-colors font-mono uppercase tracking-wider text-sm">
            Clear Search
          </button>
          <button v-else-if="activeTab === 'my'" @click="activeTab = 'discover'" class="px-6 py-2 bg-primary text-[#0a192f] border border-primary hover:bg-primary/90 transition-colors font-mono uppercase tracking-wider text-sm">
            Discover Communities
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="max-w-8xl mx-auto px-6 lg:px-10 py-12">
      <div class="bg-red-900/20 border border-red-500/50 p-6 text-center">
        <svg class="mx-auto w-12 h-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-red-400">Failed to load communities. Please try again later.</p>
      </div>
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