<template>
  <header
    class="text-white py-2 sticky top-0 z-50 transition-all duration-300"
    :class="headerClass"
  >
    <div class="max-container-fluid flex justify-between items-center">
      <!-- Logo Section -->
      <div class="flex items-center space-x-3">
        <NuxtLink to="/" class="no-underline">
          <span class="text-lg font-barbara tracking-[0.1em] uppercase text-white hover:text-primary transition-colors">AMDG</span>
        </NuxtLink>
        <div class="relative">
          <div 
            @click="toggleLocationDropdown"
            class="flex items-center space-x-1.5 px-2 py-1 border border-white/20 rounded cursor-pointer hover:border-white/40 transition-colors"
          >
            <img src="/assets/images/uk.png" alt="UK" class="w-4 h-4 rounded-full object-cover" />
            <svg class="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <!-- Location Dropdown -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="isLocationDropdownOpen" class="absolute top-full left-0 mt-2 min-w-[140px] bg-navy-accent border border-primary/30 rounded-sm shadow-xl overflow-hidden z-50">
              <button 
                @click="selectLocation('uk')"
                class="flex items-center gap-3 px-4 py-3 text-white text-sm font-medium hover:bg-primary/10 transition-colors w-full text-left border-0 bg-transparent cursor-pointer"
              >
                <img src="/assets/images/uk.png" alt="UK" class="w-5 h-5 rounded-full object-cover" />
                <span class="text-[10px] font-black uppercase tracking-widest">United Kingdom</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Navigation & Profile -->
      <div class="flex items-center space-x-8">
        <!-- Navigation Links (Hidden on mobile) -->
        <nav class="hidden lg:flex items-center space-x-8 text-[10px] font-bold uppercase tracking-widest">
          <NuxtLink 
            to="/events" 
            class="text-white hover:text-blue-300 transition-colors border-b-2 pb-0.5 no-underline"
            :class="route.path.startsWith('/events') ? 'border-blue-300 text-blue-300' : 'border-transparent'"
          >
            Events
          </NuxtLink>
          <NuxtLink 
            v-if="userData && profileData" 
            to="/my-dashboard" 
            class="text-white hover:text-blue-300 transition-colors border-b-2 pb-0.5 no-underline"
            :class="route.path.startsWith('/my-dashboard') ? 'border-blue-300 text-blue-300' : 'border-transparent'"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/communities" 
            class="text-white hover:text-blue-300 transition-colors border-b-2 pb-0.5 no-underline"
            :class="route.path.startsWith('/communities') ? 'border-blue-300 text-blue-300' : 'border-transparent'"
          >
            Communities
          </NuxtLink>
        </nav>

        <!-- User Section -->
        <div class="relative flex items-center gap-3">
          <template v-if="isLoading">
            <div class="w-32 h-8 bg-white/10 animate-pulse rounded-full"></div>
          </template>

          <template v-else-if="userData && profileData">
            <!-- Profile Picture Trigger -->
            <button
              type="button"
              class="relative h-9 w-9 rounded-full overflow-hidden border-2 transition-all duration-200 cursor-pointer p-0 bg-transparent"
              :class="isDropdownOpen ? 'border-primary ring-2 ring-primary/30' : 'border-white/30 hover:border-white/60'"
              @click="toggleDropdown"
              aria-haspopup="true"
              :aria-expanded="isDropdownOpen"
            >
              <img
                v-if="profileData.data?.profile_picture_url"
                :src="resolveImageUrl(profileData.data.profile_picture_url)"
                :alt="`${userData.data?.display_name}'s profile`"
                class="w-full h-full object-cover"
                @error="(e) => onImageError(e)"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-yellow-600 text-deep-navy font-semibold text-xs">
                {{ getInitials(userData.data?.display_name) }}
              </div>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 scale-95 -translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="isDropdownOpen"
                class="absolute top-full right-0 mt-2 min-w-[240px] origin-top-right bg-navy-accent border border-primary/30 rounded-md shadow-xl overflow-hidden z-50"
              >
                <!-- Profile summary -->
                <div class="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/[0.03]">
                  <div class="h-11 w-11 rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
                    <img
                      v-if="profileData.data?.profile_picture_url"
                      :src="resolveImageUrl(profileData.data.profile_picture_url)"
                      :alt="`${userData.data?.display_name}'s profile`"
                      class="w-full h-full object-cover"
                      @error="(e) => onImageError(e)"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-yellow-600 text-deep-navy font-semibold text-sm">
                      {{ getInitials(userData.data?.display_name) }}
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ userData.data?.display_name }}</p>
                    <p class="text-xs text-white/60 truncate">{{ userData.data?.email }}</p>
                  </div>
                </div>

                <nav class="py-1">
                  <NuxtLink
                    v-for="item in dropdownItems"
                    :key="item.to"
                    :to="item.to"
                    class="group flex items-center gap-3 px-4 py-2.5 text-white text-sm font-medium transition-colors no-underline hover:bg-white/50"
                    @click="closeDropdown"
                  >
                    <span class="flex items-center justify-center w-7 h-7 rounded-md bg-white text-primary transition-colors group-hover:bg-primary/15" v-html="item.icon" />
                    {{ item.label }}
                  </NuxtLink>
                </nav>

                <div class="border-t border-white/10 py-1">
                  <button
                    class="flex items-center gap-3 px-4 py-2.5 text-white text-sm font-medium hover:bg-white/50 transition-colors w-full text-left border-0 bg-transparent cursor-pointer"
                    @click="handleLogout"
                  >
                    <span class="flex items-center justify-center w-7 h-7 rounded-md bg-white text-primary">
                      <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H3C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                    Logout
                  </button>
                </div>
              </div>
            </Transition>
          </template>

          <template v-else>
            <!-- Login/Register Buttons -->
            <div class="hidden lg:flex items-center gap-3">
              <NuxtLink to="/login" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:text-blue-300 transition-colors no-underline">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="bg-white text-deep-navy px-5 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-primary no-underline shadow-md">
                Sign Up
              </NuxtLink>
            </div>
          </template>

          <!-- Mobile hamburger -->
          <button
            class="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer bg-transparent border-0"
            @click="toggleMobileMenu"
            aria-label="Toggle menu"
          >
            <span class="block w-5 h-0.5 bg-white transition-all duration-200" :class="isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''"></span>
            <span class="block w-5 h-0.5 bg-white transition-all duration-200" :class="isMobileMenuOpen ? 'opacity-0' : ''"></span>
            <span class="block w-5 h-0.5 bg-white transition-all duration-200" :class="isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden border-t border-white/10 bg-deep-navy px-4 py-3 mt-2"
      >
        <nav class="flex flex-col gap-0.5 text-[11px] font-bold uppercase tracking-widest">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center justify-between rounded-lg px-3 py-3.5 text-white/70 transition-colors no-underline hover:bg-white/5 hover:text-white"
            :class="route.path.startsWith(item.to) ? 'text-mist-blue bg-white/5' : ''"
            @click="closeMobileMenu"
          >
            <span class="flex items-center gap-3">
              <UIcon :name="item.icon" class="w-4 h-4" />
              {{ item.label }}
            </span>
            <span
              v-if="route.path.startsWith(item.to)"
              class="w-1.5 h-1.5 rounded-full bg-mist-blue"
            />
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.gold-gradient-text {
  background: linear-gradient(to bottom, #fceabb 0%, #ecc813 50%, #c49300 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMe } from '~/composables/resources/user/users'
import { useMyProfile } from '~/composables/resources/user/profiles'
import { useLogout } from '~/composables/resources/user/auth'
import { resolveImageUrl, onImageError } from '~/utils/image'

const route = useRoute()

const headerClass = computed(() => {
  return 'bg-deep-navy border-b border-white/10'
})

// Fetch current user and profile
const { data: userData, isLoading: isUserLoading } = useMe()
const { data: profileData, isLoading: isProfileLoading } = useMyProfile()

// Mobile nav items
const navItems = [
  { to: '/events', label: 'Events', icon: 'i-heroicons-outline-calendar' },
  ...(userData.value && profileData.value
    ? [{ to: '/my-dashboard', label: 'Dashboard', icon: 'i-heroicons-outline-squares-2x2' }]
    : []),
  { to: '/communities', label: 'Communities', icon: 'i-heroicons-outline-users' },
]

// Desktop profile-dropdown items, each with its own distinct icon
const dropdownItems = [
  {
    to: '/events',
    label: 'Events',
    icon: `<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2 6.5H14" stroke="currentColor" stroke-width="1.5"/>
      <path d="M5 1.5V4M11 1.5V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    to: '/my-dashboard',
    label: 'Dashboard',
    icon: `<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,
  },
  {
    to: '/communities',
    label: 'Communities',
    icon: `<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <circle cx="5.5" cy="5" r="2" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="11" cy="6" r="1.6" stroke="currentColor" stroke-width="1.5"/>
      <path d="M1.5 13.5C1.5 11 3.29 9.5 5.5 9.5C7.71 9.5 9.5 11 9.5 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M9.8 10C11.6 10.15 13 11.4 13 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: `<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.75" stroke="currentColor" stroke-width="1.5"/>
      <path d="M2.5 14C2.5 11 5 9 8 9C11 9 13.5 11 13.5 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
]

// Logout mutation
const { mutate: logout } = useLogout()

// Dropdown state
const isDropdownOpen = ref(false)
const isLocationDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const selectedLocation = ref('uk')

// Computed loading state
const isLoading = computed(() => isUserLoading.value || isProfileLoading.value)

// Get initials helper
const getInitials = (name?: string) => {
  if (!name) return '??'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    isLocationDropdownOpen.value = false
  }
}

// Close dropdown
const closeDropdown = () => {
  isDropdownOpen.value = false
}

// Toggle location dropdown
const toggleLocationDropdown = () => {
  isLocationDropdownOpen.value = !isLocationDropdownOpen.value
  if (isLocationDropdownOpen.value) {
    isDropdownOpen.value = false
  }
}

// Close location dropdown
const closeLocationDropdown = () => {
  isLocationDropdownOpen.value = false
}

// Mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isDropdownOpen.value = false
    isLocationDropdownOpen.value = false
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Select location
const selectLocation = (location: string) => {
  selectedLocation.value = location
  closeLocationDropdown()
}

// Handle logout
const handleLogout = async () => {
  closeDropdown()
  logout(undefined, {
    onSuccess: () => {
      navigateTo('/login')
    },
  })
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.cursor-pointer') && !target.closest('[class*="dropdown"]')) {
    closeDropdown()
    closeLocationDropdown()
    closeMobileMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>