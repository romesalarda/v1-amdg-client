<template>
  <div class="border-2 border-dashed rounded-lg transition-colors"
    :class="{
      'border-gray-300 hover:border-gray-400': !uploading && !error,
      'border-blue-500 bg-blue-50': uploading,
      'border-red-500 bg-red-50': error,
      'border-green-500 bg-green-50': uploadedFile && !error
    }"
  >
    <div class="p-6 text-center">
      <!-- File Input (Hidden) -->
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="acceptedFileTypes"
        @change="handleFileSelect"
      />
      
      <!-- Upload Button (Initial State) -->
      <button
        v-if="!uploadedFile && !uploading"
        type="button"
        class="w-full flex flex-col items-center justify-center gap-3 py-4 hover:bg-gray-50 rounded-lg transition-colors"
        @click="fileInput?.click()"
      >
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-up-tray" class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
          <p class="text-xs text-gray-500 mt-1">{{ acceptedFileTypesLabel }}</p>
          <p v-if="maxSizeMB" class="text-xs text-gray-500">Max size: {{ maxSizeMB }}MB</p>
        </div>
      </button>
      
      <!-- Uploading State -->
      <div v-if="uploading" class="space-y-3">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Uploading...</p>
          <UProgress :value="uploadProgress" class="mt-2" color="blue" />
          <p class="text-xs text-gray-500 mt-1">{{ Math.round(uploadProgress) }}%</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="space-y-3">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-red-900">Upload Failed</p>
          <p class="text-xs text-red-600 mt-1">{{ error }}</p>
        </div>
        <UButton
          label="Try Again"
          size="sm"
          color="red"
          variant="soft"
          @click="resetUpload"
        />
      </div>
      
      <!-- Success State -->
      <div v-if="uploadedFile && !error" class="space-y-3">
        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-check" class="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">{{ uploadedFile.name }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(uploadedFile.size) }}</p>
        </div>
        <div class="flex items-center justify-center gap-2">
          <UButton
            label="Replace"
            size="sm"
            variant="soft"
            icon="i-heroicons-arrow-path"
            @click="fileInput?.click()"
          />
          <UButton
            label="Remove"
            size="sm"
            color="red"
            variant="ghost"
            icon="i-heroicons-trash"
            @click="removeFile"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { eventQuestionAnswersPartialUpdate } from '~/api/sdk.gen'

interface Props {
  questionId: string
  answerId?: string
  acceptedFileTypes?: string
  maxSizeMB?: number
  modelValue?: any
}

interface Emits {
  (e: 'uploaded', file: any): void
  (e: 'removed'): void
  (e: 'update:modelValue', file: any): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  acceptedFileTypes: '*',
  maxSizeMB: 10,
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadedFile = ref<any>(props.modelValue || null)
const error = ref<string | null>(null)

// Computed label for accepted file types
const acceptedFileTypesLabel = computed(() => {
  if (props.acceptedFileTypes === '*') return 'Any file type'
  return props.acceptedFileTypes.split(',').map(t => t.trim()).join(', ')
})

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file before upload
 */
function validateFile(file: File): string | null {
  // Check file size
  if (props.maxSizeMB && file.size > props.maxSizeMB * 1024 * 1024) {
    return `File size exceeds ${props.maxSizeMB}MB limit`
  }
  
  // Check file type
  if (props.acceptedFileTypes !== '*') {
    const acceptedTypes = props.acceptedFileTypes.split(',').map(t => t.trim())
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const fileMimeType = file.type
    
    const isAccepted = acceptedTypes.some(type => {
      if (type === fileExtension || type === fileMimeType) return true
      if (type.endsWith('/*') && fileMimeType.startsWith(type.replace('/*', ''))) return true
      return false
    })
    
    if (!isAccepted) {
      return `File type not accepted. Allowed: ${acceptedFileTypesLabel.value}`
    }
  }
  
  return null
}

/**
 * Handle file selection from input
 */
async function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  // Reset error
  error.value = null
  
  // Validate file
  const validationError = validateFile(file)
  if (validationError) {
    error.value = validationError
    emit('error', validationError)
    return
  }
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('file', file)
    
    if (!props.answerId) {
      throw new Error('Answer ID is required for file upload')
    }
    
    // Use $fetch for file upload with progress tracking
    // Authentication is handled automatically via httpOnly cookies
    const config = useRuntimeConfig()
    
    const response = await $fetch(`${config.public.apiBaseUrl}/api/event/question-answers/${props.answerId}/upload_file/`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies for authentication
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      },
    })
    
    // Success
    uploadedFile.value = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: (response as any).file_url || '#',
      ...(response as any),
    }
    
    emit('uploaded', uploadedFile.value)
    emit('update:modelValue', uploadedFile.value)
    
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Upload failed'
    error.value = errorMsg
    emit('error', errorMsg)
    console.error('File upload error:', err)
  } finally {
    uploading.value = false
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

/**
 * Reset upload state
 */
function resetUpload() {
  error.value = null
  uploadedFile.value = null
  uploadProgress.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Remove uploaded file
 */
function removeFile() {
  uploadedFile.value = null
  emit('removed')
  emit('update:modelValue', null)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  uploadedFile.value = newValue
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
