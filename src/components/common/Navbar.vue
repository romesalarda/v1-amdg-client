<template>
  <nav class="sticky top-0 z-50 bg-background-dark/90 backdrop-blur-md border-b border-primary/20">
    <div class="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
      <!-- Logo/Brand -->
      <div class="flex items-center">
        <NuxtLink to="/" class="flex items-center gap-3 no-underline">
          <!-- <div class="size-10 flex items-center justify-center border border-primary text-primary rounded-sm bg-navy-accent/50">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div> -->
          <span class="text-2xl font-bold tracking-widest gold-gradient-text">AMDG</span>
        </NuxtLink>
      </div>

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center gap-8 flex-1 justify-center">
        <!-- <NuxtLink to="/" class="text-sm font-medium uppercase tracking-[0.2em] text-white/80 hover:text-primary transition-colors py-2 relative no-underline">
          Home
        </NuxtLink> -->
        <NuxtLink to="/events" class="text-sm font-medium uppercase tracking-[0.2em] text-white/80 hover:text-primary transition-colors py-2 relative no-underline">
          Events
        </NuxtLink>
        <NuxtLink v-if="userData && profileData" to="/my-dashboard" class="bg-primary hover:bg-primary-500/90 px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(236,200,19,0.25)] no-underline">
          My Dashboard
        </NuxtLink>
        <NuxtLink to="/communities" class="text-sm font-medium uppercase tracking-[0.2em] text-white/80 hover:text-primary transition-colors py-2 relative no-underline">
          Communities
        </NuxtLink>
      
      </div>

      <!-- User Section -->
      <div class="relative flex items-center gap-4">
        <template v-if="isLoading">
          <div class="w-32 h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-full" />
        </template>
        
        <template v-else-if="userData && profileData">
          <div
            class="flex items-center gap-3 px-4 py-2 rounded-sm cursor-pointer transition-all hover:bg-navy-accent/50 hover:border-primary/40"
            @click="toggleDropdown"
          >
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                v-if="profileData.data?.profile_picture_url"
                :src="resolveImageUrl(profileData.data.profile_picture_url)"
                :alt="`${userData.data?.display_name}'s profile`"
                class="w-full h-full object-cover"
                @error="(e) => onImageError(e)"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-yellow-600 text-background-dark font-semibold text-sm">
                {{ getInitials(userData.data?.display_name) }}
              </div>
            </div>
            <span class="hidden md:block text-sm font-medium text-white max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
              {{ userData.data?.display_name }}
            </span>
            <svg
              class="w-4 h-4 text-primary transition-transform flex-shrink-0"
              :class="{ 'rotate-180': isDropdownOpen }"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
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
              <NuxtLink to="/profile" class="flex items-center gap-3 px-4 py-3 text-white text-sm font-medium hover:bg-primary/10 transition-colors no-underline" @click="closeDropdown">
                <svg class="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z"
                    fill="currentColor"
                  />
                </svg>
                Profile
              </NuxtLink>
              <NuxtLink to="/settings" class="flex items-center gap-3 px-4 py-3 text-white text-sm font-medium hover:bg-primary/10 transition-colors no-underline" @click="closeDropdown">
                <svg class="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                    fill="currentColor"
                  />
                  <path
                    d="M14.7 8.68L13.84 8L14.7 7.32C14.88 7.18 14.97 6.96 14.93 6.74L14.53 4.82C14.49 4.6 14.33 4.42 14.12 4.35L12.32 3.72L12.04 2.72C11.96 2.51 11.79 2.35 11.57 2.31L9.65 1.91C9.43 1.87 9.21 1.96 9.07 2.14L8.39 3L7.61 2.14C7.47 1.96 7.25 1.87 7.03 1.91L5.11 2.31C4.89 2.35 4.72 2.51 4.64 2.72L4.36 3.72L2.56 4.35C2.35 4.42 2.19 4.6 2.15 4.82L1.75 6.74C1.71 6.96 1.8 7.18 1.98 7.32L2.84 8L1.98 8.68C1.8 8.82 1.71 9.04 1.75 9.26L2.15 11.18C2.19 11.4 2.35 11.58 2.56 11.65L4.36 12.28L4.64 13.28C4.72 13.49 4.89 13.65 5.11 13.69L7.03 14.09C7.25 14.13 7.47 14.04 7.61 13.86L8.39 13L9.17 13.86C9.31 14.04 9.53 14.13 9.75 14.09L11.67 13.69C11.89 13.65 12.06 13.49 12.14 13.28L12.42 12.28L14.22 11.65C14.43 11.58 14.59 11.4 14.63 11.18L15.03 9.26C15.07 9.04 14.98 8.82 14.8 8.68H14.7Z"
                    fill="currentColor"
                  />
                </svg>
                Settings
              </NuxtLink>
              <button class="flex items-center gap-3 px-4 py-3 text-white text-sm font-medium hover:bg-primary/10 transition-colors w-full text-left border-0 bg-transparent cursor-pointer" @click="handleLogout">
                <svg class="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 14H3C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Logout
              </button>
            </div>
          </Transition>
        </template>

        <template v-else>
          <div class="flex items-center gap-3">
            <NuxtLink to="/login" class="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-transparent border border-primary/50 rounded-sm hover:bg-primary/10 transition-all no-underline">
              Login
            </NuxtLink>
            <NuxtLink to="/register" class="bg-primary hover:bg-primary/90 text-background-dark px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(236,200,19,0.25)] no-underline">
              Sign Up
            </NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </nav>
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

// Fetch current user and profile
const { data: userData, isLoading: isUserLoading } = useMe()
const { data: profileData, isLoading: isProfileLoading } = useMyProfile()

// Logout mutation
const { mutate: logout } = useLogout()

// Dropdown state
const isDropdownOpen = ref(false)

// Computed loading state
const isLoading = computed(() => isUserLoading.value || isProfileLoading.value)

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Close dropdown
const closeDropdown = () => {
  isDropdownOpen.value = false
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
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
