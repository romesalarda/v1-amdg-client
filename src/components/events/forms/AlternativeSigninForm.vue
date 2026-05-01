<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 text-background-dark-600">
    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="signin-title">
        Method Name <span class="text-red-500">*</span>
      </label>
      <input
        id="signin-title"
        v-model="form.title"
        type="text"
        placeholder="e.g. Community ID, RFID Card, QR Code"
        required
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="signin-description">
        Description
      </label>
      <textarea
        id="signin-description"
        v-model="form.description"
        placeholder="Describe how this sign-in method works..."
        rows="3"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      ></textarea>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="format-pattern">
        ID Format Pattern (Optional)
      </label>
      <select
        id="format-pattern"
        v-model="form.patternType"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option v-for="option in patternOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <div v-if="form.patternType === 'custom'" class="p-3 bg-mist-blue/40 rounded-lg space-y-2">
        <input
          v-model="form.format_match"
          type="text"
          placeholder="Enter custom regex pattern"
          class="w-full rounded-lg border border-primary-500/20 bg-white px-3 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p class="text-xs text-primary-500/60">Advanced: Enter a regular expression pattern</p>
      </div>

      <div
        v-else-if="form.patternType && form.patternType !== 'none'"
        class="p-3 bg-mist-blue/40 rounded-lg"
      >
        <p class="text-sm text-background-dark-600">
          <strong>Pattern:</strong>
          <span class="font-mono text-primary">{{ patternExamples[form.patternType]?.example }}</span>
        </p>
        <p class="text-xs text-primary-500/60 mt-1">
          {{ patternExamples[form.patternType]?.description }}
        </p>
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-background-dark-600" for="max-uses">
        Max Uses Per Sign-in (Optional)
      </label>
      <input
        id="max-uses"
        v-model="form.max_uses_per_signin"
        type="number"
        min="1"
        placeholder="Leave empty for unlimited"
        class="w-full rounded-xl border border-primary-500/20 bg-white px-4 py-2 text-sm text-background-dark-600 placeholder:text-background-dark-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        class="rounded-xl border border-primary bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isLoading"
        class="rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-navy-600 disabled:opacity-70"
      >
        {{ modelValue ? 'Update Method' : 'Create Method' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { patternOptions, patternExamples, detectPatternType } from '~/composables/booking/useAlternativeSignInManagement'

const props = defineProps<{
  modelValue?: any
  isLoading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: { title: string; description?: string; format_match: string | null; max_uses_per_signin: number | null }]
  cancel: []
}>()

const form = reactive({
  title: '',
  description: '',
  patternType: 'none',
  format_match: '',
  max_uses_per_signin: '',
})

// Populate form when editing
watch(
  () => props.modelValue,
  (signIn) => {
    if (signIn) {
      const detectedType = detectPatternType(signIn.format_match)
      form.title = signIn.title || ''
      form.description = signIn.description || ''
      form.patternType = detectedType
      form.format_match = detectedType === 'custom' ? (signIn.format_match || '') : ''
      form.max_uses_per_signin = signIn.max_uses_per_signin ? String(signIn.max_uses_per_signin) : ''
    } else {
      form.title = ''
      form.description = ''
      form.patternType = 'none'
      form.format_match = ''
      form.max_uses_per_signin = ''
    }
  },
  { immediate: true },
)

function handleSubmit() {
  let formatMatch: string | null = null
  if (form.patternType === 'custom') {
    formatMatch = form.format_match || null
  } else if (form.patternType !== 'none' && patternExamples[form.patternType]) {
    formatMatch = patternExamples[form.patternType].regex
  }

  emit('submit', {
    title: form.title,
    description: form.description || undefined,
    format_match: formatMatch,
    max_uses_per_signin: form.max_uses_per_signin ? Number(form.max_uses_per_signin) : null,
  })
}
</script>
