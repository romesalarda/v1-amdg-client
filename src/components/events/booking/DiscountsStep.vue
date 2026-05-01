<template>
  <section>
    <span class="text-[10px] font-bold text-navy-400 uppercase tracking-widest block mb-2">Step 3 - Recommended</span>
    <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
        <div class="flex-1">
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Discounts</h3>
          <p class="text-xs text-navy-600 mt-1">Configure discount rules with eligibility criteria</p>
        </div>
        <button
          v-if="canCreate"
          @click="emit('open-modal')"
          :disabled="!packagesExist"
          class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          <span>Add Discount</span>
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="discounts.length" class="space-y-3">
          <div
            v-for="discount in discounts"
            :key="discount.discount_id"
            class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-semibold text-navy-900">{{ discount.name }}</h3>
                </div>
                <div class="text-sm text-navy-600 space-y-1">
                  <div v-if="discount.description" class="mb-1">{{ discount.description }}</div>
                  <div v-if="discount.rules">
                    <ul class="list-disc list-inside text-xs text-navy-500">
                      <li v-for="(rule, index) in discount.rules" :key="index">{{ rule.name }}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  @click="emit('toggle-status', discount.discount_id, !discount.active)"
                  type="button"
                  class="w-10 h-5 rounded-full relative transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/30"
                  :class="discount.active ? 'bg-primary hover:bg-primary/90' : 'bg-navy-200 hover:bg-navy-300'"
                >
                  <div
                    class="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out"
                    :class="discount.active ? 'right-1' : 'left-1'"
                  ></div>
                </button>
                <button
                  @click="emit('open-modal', discount)"
                  class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  @click="emit('remove', discount.discount_id)"
                  class="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-navy-600">
          <p>No discounts configured yet</p>
          <p class="text-xs mt-2 text-navy-400">Create discounts with eligibility rules for your event</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  discounts: any[]
  isLoading: boolean
  canCreate: boolean
  packagesExist: boolean
}>()

const emit = defineEmits<{
  'open-modal': [discount?: any]
  'toggle-status': [id: string, isActive: boolean]
  remove: [id: string]
}>()
</script>
