<template>
  <section class="mt-8">
    <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="flex items-center gap-2 p-6 pb-4 border-b border-navy-50">
        <span class="material-symbols-outlined text-primary">login</span>
        <div class="flex-1">
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Alternative Sign-ins</h3>
          <p class="text-xs text-navy-600 dark:text-slate-400 mt-1">Optional: Configure alternative check-in methods</p>
        </div>
        <button
          v-if="canCreate"
          @click="emit('open-modal')"
          class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          <span>Add Method</span>
        </button>
      </div>

      <div class="p-6">
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 2" :key="i" class="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>

        <div v-else-if="signIns.length" class="space-y-3">
          <div
            v-for="signIn in signIns"
            :key="signIn.id"
            class="p-3 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="font-semibold text-navy-900 text-sm">{{ signIn.title }}</h4>
                <p v-if="signIn.description" class="text-xs text-navy-600 mt-1">{{ signIn.description }}</p>
                <div class="flex items-center gap-2 mt-2 text-xs text-navy-500">
                  <span v-if="signIn.format_match">Pattern: {{ getPatternLabel(signIn.format_match) }}</span>
                  <span v-if="signIn.max_uses_per_signin">• Max uses: {{ signIn.max_uses_per_signin }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="emit('open-modal', signIn)"
                  class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  @click="emit('remove', signIn.id)"
                  class="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-navy-600">
          <p>No alternative sign-in methods configured</p>
          <p class="text-xs mt-2 text-navy-400">Add methods like QR codes, RFID, etc.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { patternExamples, detectPatternType } from '~/composables/booking/useAlternativeSignInManagement'

defineProps<{
  signIns: any[]
  isLoading: boolean
  canCreate: boolean
}>()

const emit = defineEmits<{
  'open-modal': [signIn?: any]
  remove: [id: string]
}>()

function getPatternLabel(formatMatch: string | null): string {
  if (!formatMatch) return 'None'
  const patternType = detectPatternType(formatMatch)
  if (patternType === 'custom') return 'Custom Regex'
  const pattern = patternExamples[patternType]
  return pattern ? pattern.example : 'Custom'
}
</script>
