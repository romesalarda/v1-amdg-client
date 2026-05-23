<template>
  <div class="min-h-screen bg-gray-50 text-on-surface">

    <!-- Blue Search Strip -->
    <section class="w-full bg-blue-600 sticky top-[40px] z-40 pb-6 pt-5">
      <div class="max-w-[1100px] mx-auto px-6">

        <!-- Search Pill -->
        <div class="bg-white rounded-lg p-1 flex items-center search-pill overflow-hidden mb-4 shadow-lg">
          <!-- Search Input -->
          <div class="flex-1 flex items-center px-4 py-3">
            <svg class="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              class="w-full bg-transparent border-none outline-none text-sm text-deep-navy placeholder:text-gray-400 focus:ring-0"
              placeholder="Search communities..."
              type="text"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Invitations + Search Button -->
          <div class="flex items-center gap-2 px-2 py-1">
            <NuxtLink
              to="/communities/inbox"
              class="relative h-10 px-4 rounded-lg font-bold text-sm transition-colors inline-flex items-center gap-2 border border-gray-300 text-deep-navy hover:border-deep-navy"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span class="hidden sm:inline">Invitations</span>
              <span
                v-if="pendingInvitesCount > 0"
                class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-black animate-pulse"
              >
                {{ pendingInvitesCount > 9 ? '9+' : pendingInvitesCount }}
              </span>
            </NuxtLink>
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors active:scale-95 whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>

        <!-- Tab Filter Pills -->
        <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <button
            @click="activeTab = 'all'"
            :class="activeTab === 'all' ? 'bg-white text-deep-navy' : 'bg-white/10 text-white/80 border border-white/20 hover:border-white/50 hover:text-white'"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            All Communities
          </button>
          <button
            v-if="authStore.isAuthenticated"
            @click="activeTab = 'my'"
            :class="activeTab === 'my' ? 'bg-white text-deep-navy' : 'bg-white/10 text-white/80 border border-white/20 hover:border-white/50 hover:text-white'"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            My Communities
          </button>
          <button
            v-if="authStore.isAuthenticated"
            @click="activeTab = 'discover'"
            :class="activeTab === 'discover' ? 'bg-white text-deep-navy' : 'bg-white/10 text-white/80 border border-white/20 hover:border-white/50 hover:text-white'"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            Discover
          </button>
        </div>

      </div>
    </section>

    <!-- Featured Community Hero -->
    <section v-if="featuredCommunity" class="relative h-[460px] overflow-hidden bg-deep-navy">
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="featuredCommunity.landing_image ? `background-image: url('${resolveImageUrl(featuredCommunity.landing_image)}')` : ''"
      ></div>
      <div class="hero-gradient absolute inset-0"></div>
      <div class="relative max-w-[1300px] mx-auto h-full px-6 flex flex-col justify-center items-start text-white">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-black mb-4 max-w-3xl leading-tight tracking-tight">
          {{ featuredCommunity.title }}
        </h1>
        <p v-if="featuredCommunity.description" class="text-white/80 font-bold text-sm mb-8 max-w-xl line-clamp-2">
          {{ featuredCommunity.description }}
        </p>
        <div class="flex gap-4">
          <NuxtLink
            :to="`/communities/${featuredCommunity.url_safe_title || featuredCommunity.id}`"
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-sm transition-all transform hover:scale-105 active:scale-95 no-underline"
          >
            View Community
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Communities Section -->
    <main class="max-w-[1300px] mx-auto px-6 py-12 pb-24">

      <!-- Section Header -->
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-2xl font-bold text-deep-navy mb-1">Browse Communities</h2>
          <p class="text-gray-500 text-sm">Connect with communities and discover exclusive events.</p>
        </div>
        <div v-if="!isLoading" class="text-gray-500 text-sm font-mono">
          {{ displayedOrganisations.length }} {{ displayedOrganisations.length === 1 ? 'community' : 'communities' }}
        </div>
      </div>

      <!-- Error State -->
      <div v-if="isError" class="text-center py-20">
        <div class="border border-red-200 p-12 bg-white max-w-2xl mx-auto rounded-xl shadow-sm">
          <svg class="w-16 h-16 mx-auto text-red-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-xl font-bold text-deep-navy mb-2">Error Loading Communities</h3>
          <p class="text-gray-500 text-sm">Failed to load communities. Please try again later.</p>
        </div>
      </div>

      <template v-else>
        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div v-for="i in 6" :key="i" class="group cursor-pointer">
            <div class="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg bg-gray-200 animate-pulse shadow-sm"></div>
            <div class="space-y-2">
              <div class="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div class="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
          </div>
        </div>

        <!-- Communities Grid -->
        <div v-else-if="displayedOrganisations && displayedOrganisations.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <!-- Community Card -->
          <div
            v-for="org in displayedOrganisations"
            :key="org.id"
            class="group cursor-pointer"
            @click="navigateTo(`/communities/${org.url_safe_title || org.id}`)"
          >
            <div class="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg shadow-sm">
              <img
                v-if="org.landing_image"
                :src="resolveImageUrl(org.landing_image)"
                :alt="org.title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                @error="onImageError"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <svg class="w-16 h-16 text-blue-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <!-- Logo Overlay -->
              <div v-if="org.logo" class="absolute bottom-3 left-3 w-12 h-12 bg-white/95 backdrop-blur border border-gray-200 p-1.5 rounded-lg shadow-sm">
                <img
                  :src="resolveImageUrl(org.logo)"
                  :alt="`${org.title} logo`"
                  class="w-full h-full object-contain"
                  @error="onImageError"
                />
              </div>
              <!-- Member Badge -->
              <div v-if="isMemberOf(org.id)" class="absolute top-3 left-3">
                <span class="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Member
                </span>
              </div>
              <!-- Access badges -->
              <div class="absolute top-3 right-3 flex gap-1.5">
                <span v-if="org.requires_manual_verification" class="bg-black/60 backdrop-blur text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified
                </span>
                <span v-if="org.required_acceptance_code" class="bg-black/60 backdrop-blur text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Invite Only
                </span>
              </div>
            </div>
            <h3 class="font-bold text-lg text-deep-navy mb-1 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
              {{ org.title }}
            </h3>
            <p v-if="org.description" class="text-gray-500 text-sm line-clamp-2">
              {{ org.description }}
            </p>
          </div>

          <!-- CTA Promo Card -->
          <div v-if="!authStore.isAuthenticated" class="bg-deep-navy rounded-lg p-8 flex flex-col justify-center items-center text-center text-white relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-gold/40 transition-all pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/20 rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-blue-600/40 transition-all pointer-events-none"></div>
            <h3 class="text-xl font-bold mb-3">Join a Community</h3>
            <p class="text-white/70 text-sm mb-6 max-w-xs mx-auto">Register to join communities and access exclusive events.</p>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 class="text-xl font-bold text-deep-navy mb-2">
              {{ searchQuery ? 'No Communities Found' : activeTab === 'my' ? 'No Communities Yet' : 'No Communities Found' }}
            </h3>
            <p class="text-gray-500 text-sm">
              {{ searchQuery ? 'Try adjusting your search criteria' : activeTab === 'my' ? 'Discover and join communities to see them here' : 'Check back soon for new communities' }}
            </p>
            <div v-if="searchQuery || activeTab === 'my'" class="flex gap-4 justify-center mt-6">
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="bg-deep-navy text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-deep-navy/90 transition-colors"
              >
                Clear Search
              </button>
              <button
                v-else-if="activeTab === 'my'"
                @click="activeTab = 'discover'"
                class="bg-deep-navy text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-deep-navy/90 transition-colors"
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
    </main>

    <!-- Call to Action (non-authenticated) -->
    <div v-if="!authStore.isAuthenticated" class="max-w-[1100px] mx-auto px-6 py-16">
      <div class="bg-deep-navy text-white rounded-xl p-12 text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>
        <div class="relative">
          <h3 class="text-3xl font-bold mb-3">Create Your Account Today</h3>
          <p class="text-white/70 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
            Join communities, connect with your faith network, and access exclusive events.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/register"
              class="bg-white text-deep-navy px-8 py-4 rounded-lg font-bold text-sm hover:shadow-lg transition-all active:scale-95 no-underline"
            >
              Get Started
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="border border-white/30 text-white px-8 py-4 rounded-lg font-bold text-sm hover:border-white/60 transition-colors no-underline"
            >
              Sign In
            </NuxtLink>
          </div>
        </div>
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

// Featured community (first with a landing image)
const featuredCommunity = computed(() => {
  return organisations.value.find(org => org.landing_image) || null
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
.search-pill {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.hero-gradient {
  background: linear-gradient(to right, rgba(10, 25, 47, 0.9) 0%, rgba(10, 25, 47, 0.5) 50%, rgba(10, 25, 47, 0.15) 100%);
}
</style>
