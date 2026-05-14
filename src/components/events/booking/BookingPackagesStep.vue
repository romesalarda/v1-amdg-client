<template>
  <section>
    <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 2 - Required</span>
    <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
        <span class="material-symbols-outlined text-primary">inventory_2</span>
        <div class="flex-1">
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Booking Packages</h3>
          <p class="text-xs text-navy-600 mt-1">Create pricing packages linked to ticket types</p>
        </div>
        <button
          v-if="canCreate"
          @click="emit('open-modal')"
          :disabled="!ticketTypes.length"
          class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          <span>Add Package</span>
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="packages.length" class="space-y-3">
          <div
            v-for="pkg in packages"
            :key="pkg.id"
            class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-semibold text-navy-900">{{ pkg.name }}</h4>
                <p v-if="pkg.description" class="text-sm text-navy-600 mt-1">{{ pkg.description }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">
                    {{ formatAmount(pkg.base_amount, pkg.base_amount_currency) }}
                  </span>
                  <span class="text-xs text-navy-500">
                    Ticket: {{ getTicketTypeName(pkg.ticket_type, ticketTypes) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  @click="emit('open-availability', pkg.id)"
                  title="Manage Availability Windows"
                  class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">schedule</span>
                </button>
                <button
                  @click="emit('toggle-status', pkg.id, !pkg.is_active)"
                  :disabled="!canUpdate"
                  type="button"
                  class="w-10 h-5 rounded-full relative transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30"
                  :class="pkg.is_active ? 'bg-primary hover:bg-primary/90' : 'bg-navy-200 hover:bg-navy-300'"
                >
                  <div
                    class="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out"
                    :class="pkg.is_active ? 'right-1' : 'left-1'"
                  ></div>
                </button>
                <button
                  @click="emit('open-modal', pkg)"
                  :disabled="!canUpdate"
                  class="p-1.5 text-navy-600 hover:text-primary transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  @click="emit('remove', pkg.id)"
                  :disabled="!canDelete || pkg.can_delete === false"
                  class="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-navy-600">
          <p v-if="!ticketTypes.length">Create ticket types first before adding packages</p>
          <p v-else>No packages yet. Create one to get started.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  packages: any[]
  isLoading: boolean
  ticketTypes: any[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  'open-modal': [pkg?: any]
  'open-availability': [pkgId: number]
  'toggle-status': [id: number, isActive: boolean]
  remove: [id: number]
}>()

function formatAmount(amount: string | number, currency?: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(amount))
}

function getTicketTypeName(ticketTypeId: number, ticketTypes: any[]) {
  const ticketType = ticketTypes.find((t: any) => t.id === ticketTypeId)
  return ticketType?.title.replace(/_/g, ' ') || 'Unknown'
}
</script>
