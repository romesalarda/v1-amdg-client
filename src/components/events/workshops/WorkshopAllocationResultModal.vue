<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="emit('update:modelValue', false)"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="flex items-center gap-3 px-6 py-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">auto_awesome</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary uppercase tracking-widest">Allocation Complete</h2>
              <p v-if="run" class="text-xs text-navy-400 mt-0.5 truncate">{{ run.workshopTitle }}</p>
            </div>
            <button @click="emit('update:modelValue', false)" class="text-navy-400 hover:text-navy-700">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Result -->
          <div v-if="run" class="p-6 space-y-4">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p class="text-3xl font-black text-emerald-700">{{ run.result.placed }}</p>
                <p class="text-[10px] font-black uppercase tracking-wide text-emerald-500 mt-1">Placed</p>
              </div>
              <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p class="text-3xl font-black text-amber-700">{{ run.result.waitlisted }}</p>
                <p class="text-[10px] font-black uppercase tracking-wide text-amber-500 mt-1">Waitlisted</p>
              </div>
              <div class="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p class="text-3xl font-black text-red-600">{{ run.result.unplaced }}</p>
                <p class="text-[10px] font-black uppercase tracking-wide text-red-400 mt-1">Unplaced</p>
              </div>
            </div>

            <p class="text-xs text-navy-400 text-center">
              Registrations have been updated. Expand the workshop to review individual allocations.
            </p>
          </div>

          <div class="flex justify-end px-6 pb-5">
            <button
              @click="emit('update:modelValue', false)"
              class="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { AllocationRun } from '~/composables/workshops/useWorkshopAllocation'

defineProps<{
  modelValue: boolean
  run: AllocationRun | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
}>()
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
