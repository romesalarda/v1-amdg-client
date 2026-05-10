<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xs font-black text-primary uppercase tracking-widest">Action History</h3>
      <UButton
        @click="$emit('export-csv')"
        size="xs"
        color="primary"
        variant="outline"
        icon="i-heroicons-arrow-down-tray"
      >
        Export CSV
      </UButton>
    </div>

    <div class="mb-4 flex gap-3">
      <div class="flex-1">
        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Filter by Action</label>
        <select
          v-model="actionTypeFilterModel"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
        >
          <option value="">All Actions</option>
          <option value="registered">Registered</option>
          <option value="checked_in">Checked In</option>
          <option value="cancelled">Cancelled</option>
          <option value="updated_info">Updated Info</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Start Date</label>
        <input
          v-model="actionDateStartModel"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
        />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">End Date</label>
        <input
          v-model="actionDateEndModel"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
        />
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-8 text-gray-500 text-sm">
      Loading actions...
    </div>
    <div v-else-if="!actions.length" class="text-center py-8 text-gray-500 text-sm">
      <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <UIcon name="i-heroicons-clipboard-document-check" class="h-7 w-7" />
        </div>
        <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No Actions</p>
        <p class="mt-2 text-sm text-slate-500">Actions are shown here when they are performed by users or the system.</p>
      </div>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="action in actions"
        :key="action.id"
        class="p-3 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <UBadge
                :color="action.action === 'registered' ? 'green' : action.action === 'checked_in' ? 'blue' : action.action === 'cancelled' ? 'red' : 'gray'"
                size="xs"
              >
                {{ action.action_display || action.action }}
              </UBadge>
              <span class="text-xs text-gray-600">{{ new Date(action.performed_at).toLocaleString() }}</span>
            </div>
            <p class="text-xs text-gray-700">
              <span class="font-semibold">Performed by:</span> {{ action.performed_by_name || 'System' }}
            </p>
            <p v-if="action.notes" class="text-xs text-gray-600 mt-1">{{ action.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isLoading: boolean
  actions: any[]
  actionTypeFilter: string
  actionDateStart: string
  actionDateEnd: string
}>()

const emit = defineEmits<{
  (event: 'export-csv'): void
  (event: 'update:actionTypeFilter', value: string): void
  (event: 'update:actionDateStart', value: string): void
  (event: 'update:actionDateEnd', value: string): void
}>()

const actionTypeFilterModel = computed({
  get: () => props.actionTypeFilter,
  set: (value: string) => emit('update:actionTypeFilter', value),
})

const actionDateStartModel = computed({
  get: () => props.actionDateStart,
  set: (value: string) => emit('update:actionDateStart', value),
})

const actionDateEndModel = computed({
  get: () => props.actionDateEnd,
  set: (value: string) => emit('update:actionDateEnd', value),
})
</script>
