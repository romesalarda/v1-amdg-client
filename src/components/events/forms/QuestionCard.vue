<template>
  <UCard
    class="group relative transition-all hover:shadow-lg my-3"
    :class="{
      'ring-2 ring-blue-500': selected,
      'border-l-4 border-l-blue-500': question.isExpanded,
      'ring-2 ring-red-400 bg-red-50/30': hasErrors,
    }"
  >
    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
    >
      <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-blue-600 animate-spin" />
        <span class="text-sm font-medium text-gray-700">Saving...</span>
      </div>
    </div>

    <!-- Drag Handle -->
    <div
      v-if="!previewMode && !readOnly"
      class="drag-handle absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
    >
      <div class="bg-gray-200 rounded p-1.5 hover:bg-gray-300">
        <UIcon name="i-heroicons-bars-3" class="w-4 h-4 text-gray-600" />
      </div>
    </div>

    <div class="space-y-5 p-1" @click="$emit('select', question)">
      <!-- Question Header -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 space-y-3" @click.stop>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-medium text-gray-500">Question {{ index + 1 }}</span>
            <UBadge
              v-if="question.required"
              label="Required"
              color="red"
              variant="soft"
              size="xs"
            />
            <UBadge
              :label="formatQuestionType(question.question_type || 'short_answer')"
              color="blue"
              variant="soft"
              size="xs"
            />
            <UBadge
              v-if="question.isNew"
              label="Draft"
              color="yellow"
              variant="soft"
              size="xs"
            />
            <UBadge
              v-if="hasErrors"
              label="Has Errors"
              color="red"
              variant="solid"
              size="xs"
              class="animate-pulse"
            />
          </div>

          <!-- Title Field -->
          <div v-if="question.isExpanded && !previewMode">
            <UFormGroup :error="getFieldError('question_title')">
              <UInput
                v-model="localTitle"
                placeholder="Question title"
                size="lg"
                variant="outline"
                class="font-semibold"
                @focus="onFocus('title')"
                @blur="onBlur('title')"
              />
            </UFormGroup>
          </div>
          <h3
            v-else
            class="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
            @click="!previewMode && $emit('toggle-expand', question)"
          >
            {{ question.question_title }}
            <span v-if="question.required" class="text-red-500">*</span>
          </h3>

          <!-- Description Field -->
          <div v-if="question.isExpanded && !previewMode">
            <UFormGroup
              label="Description"
              :error="getFieldError('question_body')"
            >
              <UTextarea
                v-model="localBody"
                placeholder="Enter question description"
                :rows="2"
                variant="outline"
                @focus="onFocus('body')"
                @blur="onBlur('body')"
              />
            </UFormGroup>
          </div>
          <p
            v-else-if="question.question_body"
            class="text-sm text-gray-600"
          >
            {{ question.question_body }}
          </p>

          <!-- Type and Settings Editor (Expanded & Edit Mode) -->
          <div v-if="question.isExpanded" class="space-y-4 pt-2">
            <div v-if="!previewMode && !readOnly" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UFormGroup label="Question Type" size="sm">
                <USelectMenu
                  v-model="localType"
                  :options="questionTypes"
                  value-attribute="value"
                  size="sm"
                />
              </UFormGroup>
              
              <div class="flex items-end">
                <UCheckbox
                  v-model="localRequired"
                  label="Required"
                />
              </div>
            </div>

            <!-- Range configurations (slider & rating) -->
            <div v-if="!previewMode && ['slider', 'rating'].includes(question.question_type || '')" class="grid grid-cols-2 gap-3">
              <UFormGroup
                label="Minimum Value"
                size="sm"
                :error="getFieldError('min_value')"
              >
                <UInput
                  v-model.number="localMin"
                  type="number"
                  placeholder="1"
                />
              </UFormGroup>
              <UFormGroup
                label="Maximum Value"
                size="sm"
                :error="getFieldError('max_value')"
              >
                <UInput
                  v-model.number="localMax"
                  type="number"
                  placeholder="5"
                />
              </UFormGroup>
            </div>

            <!-- Question Previews / Input Fields -->
            <div class="border-t border-gray-200 pt-4">
              <div class="space-y-3">
                <!-- Short Answer -->
                <div v-if="question.question_type === 'short_answer'" class="text-sm text-gray-600">
                  <UInput placeholder="Short answer text" disabled />
                </div>

                <!-- Long Answer -->
                <div v-else-if="question.question_type === 'long_answer'" class="text-sm text-gray-600">
                  <UTextarea placeholder="Long answer text" :rows="3" disabled />
                </div>

                <!-- Email -->
                <div v-else-if="question.question_type === 'email'" class="text-sm text-gray-600">
                  <UInput type="email" placeholder="email@example.com" disabled icon="i-heroicons-envelope" />
                </div>

                <!-- Phone -->
                <div v-else-if="question.question_type === 'phone'" class="text-sm text-gray-600">
                  <UInput type="tel" placeholder="Phone number" disabled icon="i-heroicons-phone" />
                </div>

                <!-- Date -->
                <div v-else-if="question.question_type === 'date'" class="text-sm text-gray-600">
                  <UInput type="date" disabled icon="i-heroicons-calendar" />
                </div>

                <!-- Time -->
                <div v-else-if="question.question_type === 'time'" class="text-sm text-gray-600">
                  <UInput type="time" disabled icon="i-heroicons-clock" />
                </div>

                <!-- Rating -->
                <div v-else-if="question.question_type === 'rating'" class="flex items-center gap-1">
                  <div
                    v-for="star in (question.max_value || 5)"
                    :key="star"
                    class="p-1 cursor-not-allowed text-gray-300"
                  >
                    <UIcon name="i-heroicons-star" class="w-6 h-6" />
                  </div>
                  <span class="text-xs text-gray-400 ml-2">({{ question.min_value || 1 }} - {{ question.max_value || 5 }})</span>
                </div>

                <!-- Slider -->
                <div v-else-if="question.question_type === 'slider'" class="text-sm text-gray-600">
                  <input
                    type="range"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed"
                    :min="question.min_value ?? 1"
                    :max="question.max_value ?? 5"
                    disabled
                  />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{{ question.min_value ?? 1 }}</span>
                    <span>{{ question.max_value ?? 5 }}</span>
                  </div>
                </div>

                <!-- Choice Options (Multiple / Single Choice) -->
                <div v-else-if="['multiple_choice', 'single_choice'].includes(question.question_type || '')" class="space-y-2">
                  <div v-if="!previewMode && !readOnly" class="space-y-2">
                    <div v-if="getFieldError('options')" class="text-sm text-red-600 flex items-center gap-1">
                      <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
                      {{ getFieldError('options') }}
                    </div>

                    <div
                      v-for="(option, optIndex) in localOptions"
                      :key="optIndex"
                      class="flex items-center gap-2"
                    >
                      <UIcon
                        :name="question.question_type === 'single_choice' ? 'i-heroicons-stop-circle' : 'i-heroicons-check-circle'"
                        class="w-4 h-4 text-gray-400"
                      />
                      <UInput
                        v-model="localOptions[optIndex].option_text"
                        placeholder="Option text"
                        class="flex-1"
                        @focus="onFocus(`option-${optIndex}`)"
                        @blur="onBlur(`option-${optIndex}`)"
                      />
                      <UButton
                        icon="i-heroicons-x-mark"
                        color="red"
                        variant="ghost"
                        size="sm"
                        @click="removeOption(optIndex)"
                      />
                    </div>
                    <UButton
                      icon="i-heroicons-plus"
                      label="Add Option"
                      variant="soft"
                      size="sm"
                      @click="addOption"
                    />
                  </div>
                  <div v-else class="space-y-2">
                    <div
                      v-for="(option, optIndex) in question.options"
                      :key="optIndex"
                      class="flex items-center gap-2 text-sm text-gray-800"
                    >
                      <UIcon
                        :name="question.question_type === 'single_choice' ? 'i-heroicons-stop-circle' : 'i-heroicons-check-circle'"
                        class="w-4 h-4 text-gray-400"
                      />
                      <span>{{ typeof option === 'string' ? option : option.option_text }}</span>
                    </div>
                  </div>
                </div>

                <!-- File Upload -->
                <div v-else-if="question.question_type === 'upload'" class="text-sm text-gray-600">
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <UIcon name="i-heroicons-arrow-up-tray" class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p class="text-gray-500">Click to upload or drag and drop files</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons (Right Aligned, visible on hover) -->
        <div v-if="!previewMode && !readOnly" class="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <UTooltip text="Expand/Collapse">
            <UButton
              :icon="question.isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              variant="ghost"
              size="sm"
              color="gray"
              @click.stop="$emit('toggle-expand', question)"
            />
          </UTooltip>
          <UTooltip text="Duplicate">
            <UButton
              icon="i-heroicons-document-duplicate"
              variant="ghost"
              size="sm"
              color="gray"
              @click.stop="$emit('duplicate', question)"
            />
          </UTooltip>
          <UTooltip text="Delete">
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              size="sm"
              color="red"
              @click.stop="$emit('delete', question)"
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  question: any
  index: number
  selected: boolean
  readOnly: boolean
  previewMode: boolean
  isLoading: boolean
  validationErrors?: any
}>()

const emit = defineEmits<{
  (e: 'select', q: any): void
  (e: 'update', q: any, changes: any): void
  (e: 'duplicate', q: any): void
  (e: 'delete', q: any): void
  (e: 'toggle-expand', q: any): void
  (e: 'focus', qId: string, field: string): void
  (e: 'blur', qId: string, field: string): void
}>()

const questionId = props.question.id || props.question.tempId || 'temp'

// Form options list config
const questionTypes = [
  { label: 'Short Answer', value: 'short_answer' },
  { label: 'Long Answer', value: 'long_answer' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Multiple Choice', value: 'multiple_choice' },
  { label: 'Single Choice', value: 'single_choice' },
  { label: 'Rating', value: 'rating' },
  { label: 'Slider', value: 'slider' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'File Upload', value: 'upload' },
]

// Local editing states to avoid mutating during keydown
const localTitle = ref(props.question.question_title || '')
const localBody = ref(props.question.question_body || '')
const localType = ref(props.question.question_type || 'short_answer')
const localRequired = ref(!!props.question.required)
const localMin = ref(props.question.min_value ?? 1)
const localMax = ref(props.question.max_value ?? 5)
const localOptions = ref<any[]>(
  (props.question.options || []).map((o: any) =>
    typeof o === 'string' ? { option_text: o } : { ...o }
  )
)

const hasErrors = computed(() => {
  if (!props.validationErrors) return false
  return !!props.validationErrors.get(questionId)
})

const getFieldError = (field: string) => {
  if (!props.validationErrors) return undefined
  const errors = props.validationErrors.get(questionId)
  return errors ? errors[field] : undefined
}

// Watch question changes from outside
watch(() => props.question.question_title, (val) => { localTitle.value = val || '' })
watch(() => props.question.question_body, (val) => { localBody.value = val || '' })
watch(() => props.question.question_type, (val) => { localType.value = val || 'short_answer' })
watch(() => props.question.required, (val) => { localRequired.value = !!val })
watch(() => props.question.min_value, (val) => { localMin.value = val ?? 1 })
watch(() => props.question.max_value, (val) => { localMax.value = val ?? 5 })
watch(() => props.question.options, (val) => {
  localOptions.value = (val || []).map((o: any) =>
    typeof o === 'string' ? { option_text: o } : { ...o }
  )
}, { deep: true })

// Emit changes
watch(localType, (newVal) => {
  const changes: any = { question_type: newVal }
  if (['slider', 'rating'].includes(newVal) && localMin.value === undefined) {
    changes.min_value = 1
    changes.max_value = 5
  }
  emit('update', props.question, changes)
})

watch(localRequired, (newVal) => {
  emit('update', props.question, { required: newVal })
})

watch(localMin, (newVal) => {
  emit('update', props.question, { min_value: newVal })
})

watch(localMax, (newVal) => {
  emit('update', props.question, { max_value: newVal })
})

const onFocus = (field: string) => {
  emit('focus', questionId, field)
}

const onBlur = (field: string) => {
  emit('blur', questionId, field)
  if (field === 'title') {
    emit('update', props.question, { question_title: localTitle.value })
  } else if (field === 'body') {
    emit('update', props.question, { question_body: localBody.value })
  } else if (field.startsWith('option-')) {
    const idx = parseInt(field.replace('option-', ''))
    updateOptionValue(idx, localOptions.value[idx].option_text)
  }
}

// Option handlers
const addOption = () => {
  localOptions.value.push({ option_text: '', order: localOptions.value.length })
  emit('update', props.question, { options: [...localOptions.value] })
}

const removeOption = (idx: number) => {
  localOptions.value.splice(idx, 1)
  localOptions.value.forEach((o, i) => { o.order = i })
  emit('update', props.question, { options: [...localOptions.value] })
}

const updateOptionValue = (idx: number, value: string) => {
  if (localOptions.value[idx]) {
    localOptions.value[idx].option_text = value
    emit('update', props.question, { options: [...localOptions.value] })
  }
}

const formatQuestionType = (type: string) => {
  return questionTypes.find(t => t.value === type)?.label || type
}
</script>
