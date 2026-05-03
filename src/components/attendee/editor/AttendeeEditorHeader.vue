<template>
  <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
    <div class="xl:hidden px-5 py-4 border-b border-gray-100">
      <div class="flex items-center gap-4">
        <div class="flex-shrink-0">
          <img
            v-if="linkedUserProfile?.profile_picture_url"
            :src="linkedUserProfile.profile_picture_url"
            :alt="attendee?.full_name"
            class="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
          />
          <div
            v-else
            class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20"
          >
            <UIcon name="i-heroicons-user" class="w-8 h-8 text-primary" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-black text-primary uppercase tracking-wide truncate">
            {{ attendee?.full_name || 'Loading...' }}
          </h1>
          <p class="text-xs text-gray-500 mt-0.5">
            ID: {{ attendee?.attendee_display_id }}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <UBadge v-if="attendee?.is_minor" color="amber" variant="soft" size="xs">Minor</UBadge>
            <UBadge v-if="attendee?.is_event_staff" color="purple" variant="soft" size="xs">Staff</UBadge>
            <UBadge v-if="attendee?.is_checked_in" color="green" variant="soft" size="xs">✓ Checked In</UBadge>
          </div>
        </div>
      </div>
    </div>

    <div class="hidden xl:block px-5 py-3 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-user" class="w-5 h-5 text-primary" />
        <div>
          <h1 class="text-sm font-black text-primary uppercase tracking-widest">
            {{ attendee?.full_name || 'Loading...' }}
          </h1>
          <p class="text-xs text-gray-500 mt-0.5">
            ID: {{ attendee?.attendee_display_id }}
          </p>
        </div>
      </div>
    </div>

    <div class="border-b border-gray-100 bg-gray-50">
      <div class="xl:hidden px-5 py-3">
        <select
          :value="currentTab"
          @change="onSelectTabChange"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
            {{ tab.label }}
          </option>
        </select>
      </div>

      <div class="hidden xl:block px-5 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <nav class="flex gap-6 min-w-max">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="$emit('change-tab', tab.id)"
            :class="[
              'py-2 px-1 border-b-2 font-semibold text-xs uppercase tracking-wide transition-colors whitespace-nowrap',
              currentTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <div class="p-5">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface TabItem {
  id: string
  label: string
}

defineProps<{
  attendee: any
  linkedUserProfile: any
  currentTab: string
  tabs: TabItem[]
}>()

const emit = defineEmits<{
  (event: 'change-tab', tabId: string): void
}>()

const onSelectTabChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | null
  if (!target) return
  emit('change-tab', target.value)
}
</script>
