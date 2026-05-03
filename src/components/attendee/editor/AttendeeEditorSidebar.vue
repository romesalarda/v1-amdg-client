<template>
  <div class="hidden xl:block xl:col-span-4 space-y-6">
    <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden sticky top-6">
      <div class="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-20">
        <div class="flex justify-center">
          <div class="relative">
            <img
              v-if="linkedUserProfile?.profile_picture_url && attendee?.relationship_display?.toLowerCase() === 'self'"
              :src="linkedUserProfile.profile_picture_url"
              :alt="attendee?.full_name"
              class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div
              v-else
              class="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-4 border-white shadow-lg"
            >
              <UIcon name="i-heroicons-user" class="w-16 h-16 text-primary" />
            </div>

            <div
              v-if="linkedUserId"
              class="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md"
              title="Linked to user account"
            >
              <UIcon name="i-heroicons-link" class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 -mt-14 pb-6 relative z-10">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <h2 class="text-xl font-black text-gray-900 mb-1">
            {{ attendee?.full_name }}
          </h2>
          <p class="text-sm text-gray-500 mb-3">
            {{ attendee?.relationship_display }}
          </p>

          <div class="flex items-center justify-center gap-2 mb-3">
            <UBadge v-if="attendee?.is_minor" color="amber" variant="soft" size="xs">
              {{ attendee?.age }} years • Minor
            </UBadge>
            <UBadge v-else color="gray" variant="soft" size="xs">
              {{ attendee?.age }} years
            </UBadge>
            <UBadge v-if="attendee?.is_event_staff" color="purple" variant="soft" size="xs">
              Staff
            </UBadge>
          </div>

          <div v-if="attendee?.is_checked_in" class="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            <span class="text-xs font-bold text-green-700 uppercase">Checked In</span>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <UButton
            v-if="linkedUserId"
            block
            size="sm"
            color="blue"
            variant="soft"
            icon="i-heroicons-user"
          >
            View User Profile
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  attendee: any
  linkedUserProfile: any
  linkedUserId: number | null
}>()
</script>
