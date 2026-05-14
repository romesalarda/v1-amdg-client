<template>
  <section>
    <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 1 - Required</span>
    <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
        <span class="material-symbols-outlined text-primary">confirmation_number</span>
        <div class="flex-1">
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Ticket Types</h3>
          <p class="text-xs text-navy-600 mt-1">Define ticket categories with scopes and validity periods</p>
        </div>
        <button
          v-if="canCreate"
          @click="emit('open-modal')"
          class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          <span>Add Ticket Type</span>
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="ticketTypes.length" class="space-y-3">
          <div
            v-for="ticketType in ticketTypes"
            :key="ticketType.id"
            class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-semibold text-navy-900">{{ ticketType.title }}</h3>
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                    {{ ticketType.scope?.replace(/_/g, ' ') }}
                  </span>
                </div>
                <div class="text-sm text-navy-600 space-y-1">
                  <div v-if="ticketType.valid_from || ticketType.valid_until" class="flex items-center gap-2">
                    <span class="font-medium">Valid:</span>
                    <span>
                      {{ formatDate(ticketType.valid_from) || 'Start' }} - {{ formatDate(ticketType.valid_until) || 'End' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  @click="emit('toggle-status', ticketType.id, !ticketType.is_active)"
                  :disabled="!canUpdate"
                  type="button"
                  class="w-10 h-5 rounded-full relative transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30"
                  :class="ticketType.is_active ? 'bg-primary hover:bg-primary/90' : 'bg-navy-200 hover:bg-navy-300'"
                >
                  <div
                    class="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out"
                    :class="ticketType.is_active ? 'right-1' : 'left-1'"
                  ></div>
                </button>
                <button
                  @click="emit('open-modal', ticketType)"
                  :disabled="!canUpdate"
                  class="p-1.5 text-navy-600 hover:text-primary transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  @click="emit('remove', ticketType.id)"
                  :disabled="!canDelete || ticketType.can_delete === false"
                  class="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-navy-600">
          <p>No ticket types yet. Create one to get started.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  ticketTypes: any[]
  isLoading: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  'open-modal': [ticketType?: any]
  'toggle-status': [id: number, isActive: boolean]
  remove: [id: number]
}>()

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
