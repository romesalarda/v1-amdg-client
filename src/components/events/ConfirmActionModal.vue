<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="handleCancel"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border-2 border-deep-navy/10">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-navy-100" :class="headerColorClass">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-2xl" :class="iconColorClass">{{ icon }}</span>
          <h2 class="text-lg font-black uppercase tracking-wider" :class="titleColorClass">{{ title }}</h2>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-6">
        <p class="text-sm text-navy-700 leading-relaxed mb-4" v-html="message"></p>
        
        <!-- Type-to-confirm input -->
        <div v-if="requireTyping" class="space-y-2">
          <label class="block text-xs font-black text-primary uppercase tracking-wider">
            Type <span class="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">{{ expectedText }}</span> to confirm
          </label>
          <input
            v-model="typedConfirmation"
            type="text"
            :placeholder="`Type ${expectedText} here...`"
            class="w-full px-4 py-3 bg-mist-blue border-2 border-navy-100 focus:border-red-500 focus:ring-0 rounded-xl text-sm font-medium text-navy-900 transition-all"
            @keyup.enter="handleConfirm"
          />
          <p v-if="showMismatchError" class="text-xs text-red-600 font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">error</span>
            Text doesn't match. Please type exactly: {{ expectedText }}
          </p>
        </div>

        <!-- Additional warning for destructive actions -->
        <div v-if="isDestructive" class="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-red-600 text-xl">warning</span>
            <div>
              <p class="text-xs font-black text-red-900 uppercase tracking-wider mb-1">Warning</p>
              <p class="text-xs text-red-800 leading-relaxed">This action cannot be undone. Please proceed with caution.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t border-navy-100 flex items-center justify-end gap-3">
        <button
          type="button"
          @click="handleCancel"
          class="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold uppercase tracking-wider"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleConfirm"
          :disabled="isConfirmDisabled"
          class="px-5 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :class="confirmButtonClass"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  requireTyping?: boolean
  expectedText?: string
  confirmButtonColor?: 'primary' | 'danger' | 'warning' | 'success'
  isDestructive?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  requireTyping: false,
  expectedText: '',
  confirmButtonColor: 'primary',
  isDestructive: false,
  icon: 'info',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const typedConfirmation = ref('')
const showMismatchError = ref(false)

// Reset state when modal opens/closes
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    typedConfirmation.value = ''
    showMismatchError.value = false
  }
})

const isConfirmDisabled = computed(() => {
  if (props.requireTyping) {
    return typedConfirmation.value !== props.expectedText
  }
  return false
})

const confirmButtonClass = computed(() => {
  const baseClass = 'disabled:opacity-50 disabled:cursor-not-allowed '
  switch (props.confirmButtonColor) {
    case 'danger':
      return baseClass + 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
    case 'warning':
      return baseClass + 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
    case 'success':
      return baseClass + 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
    default:
      return baseClass + 'bg-primary hover:bg-navy-600 text-white shadow-primary/20'
  }
})

const headerColorClass = computed(() => {
  switch (props.confirmButtonColor) {
    case 'danger':
      return 'bg-red-50'
    case 'warning':
      return 'bg-orange-50'
    case 'success':
      return 'bg-green-50'
    default:
      return 'bg-blue-50'
  }
})

const titleColorClass = computed(() => {
  switch (props.confirmButtonColor) {
    case 'danger':
      return 'text-red-900'
    case 'warning':
      return 'text-orange-900'
    case 'success':
      return 'text-green-900'
    default:
      return 'text-primary'
  }
})

const iconColorClass = computed(() => {
  switch (props.confirmButtonColor) {
    case 'danger':
      return 'text-red-600'
    case 'warning':
      return 'text-orange-600'
    case 'success':
      return 'text-green-600'
    default:
      return 'text-primary'
  }
})

const handleConfirm = () => {
  if (props.requireTyping && typedConfirmation.value !== props.expectedText) {
    showMismatchError.value = true
    return
  }
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
