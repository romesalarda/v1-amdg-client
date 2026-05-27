<template>
  <header
    class="text-white py-2 sticky top-0 z-50 transition-all duration-300"
    :class="headerClass"
  >
    <div class="max-container-fluid flex justify-between items-center">
      <!-- Logo Section -->
      <div class="flex items-center space-x-3">
        <NuxtLink to="/" class="no-underline">
          <span class="text-lg font-black tracking-[0.1em] uppercase text-white hover:text-primary transition-colors">AMDG</span>
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
        <div class="relative flex items-center">
          <template v-if="isLoading">
            <div class="w-32 h-8 bg-white/10 animate-pulse rounded-full"></div>
          </template>
          
          <template v-else-if="userData && profileData">
            <!-- Profile Picture -->
            <div
              class="h-8 w-8 rounded-full overflow-hidden border border-white/30 cursor-pointer hover:border-white transition-all"
              @click="toggleDropdown"
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
            </div>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div v-if="isDropdownOpen" class="absolute top-full right-0 mt-2 min-w-[200px] bg-navy-accent border border-primary/30 rounded-sm shadow-xl overflow-hidden z-50">
                <div class="px-4 py-3 border-b border-white/10">
                  <p class="text-sm font-medium text-white">{{ userData.data?.display_name }}</p>
                  <p class="text-xs text-white/60 truncate">{{ userData.data?.email }}</p>
                </div>
                <NuxtLink to="/profile" class="flex items-center gap-3 px-4 py-3 text-white text-sm font-medium hover:bg-primary/10 transition-colors no-underline" @click="closeDropdown">
                  <svg class="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
                    <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="currentColor"/>
                  </svg>
                  Profile
                </NuxtLink>
                <button class="flex items-center gap-3 px-4 py-3 text-white text-sm font-medium hover:bg-primary/10 transition-colors w-full text-left border-0 bg-transparent cursor-pointer" @click="handleLogout">
                  <svg class="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
                    <path d="M6 14H3C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            </Transition>
          </template>

          <template v-else>
            <!-- Login/Register Buttons -->
            <div class="flex items-center gap-3">
              <NuxtLink to="/login" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:text-blue-300 transition-colors no-underline">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="bg-white text-deep-navy px-5 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-primary no-underline shadow-md">
                Sign Up
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </div>
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
const isScrolled = ref(false)

const isLandingPage = computed(() => route.path === '/')

const headerClass = computed(() => {
  if (!isLandingPage.value) {
    return 'bg-deep-navy border-b border-white/10'
  }

  return isScrolled.value
    ? 'bg-[#0B132B]/82 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
    : 'bg-transparent border-b border-transparent'
})

// Fetch current user and profile
const { data: userData, isLoading: isUserLoading } = useMe()
const { data: profileData, isLoading: isProfileLoading } = useMyProfile()

// Logout mutation
const { mutate: logout } = useLogout()

// Dropdown state
const isDropdownOpen = ref(false)
const isLocationDropdownOpen = ref(false)
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
      // Navigate to home page after logout
      navigateTo('/')
    },
  })
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.cursor-pointer') && !target.closest('[class*="dropdown"]')) {
    closeDropdown()
    closeLocationDropdown()
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 18
}

onMounted(() => {
  handleScroll()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>
