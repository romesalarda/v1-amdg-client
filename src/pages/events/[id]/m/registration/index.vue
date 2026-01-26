<template>
  <EventsManagementLayout :event-id="id" :event="event?.data">
    <!-- Floating Action Bar -->
    <div
      v-if="hasUnsavedChanges || isSaving"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200"
    >
      <UIcon
        v-if="isSaving"
        name="i-heroicons-arrow-path"
        class="w-5 h-5 text-blue-600 animate-spin"
      />
      <span class="text-sm font-medium text-gray-700">
        {{ isSaving ? 'Saving...' : 'Unsaved changes' }}
      </span>
      <UButton
        v-if="hasUnsavedChanges && !isSaving"
        label="Save All"
        size="xs"
        @click="saveAll"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content (3/4) -->
      <div class="lg:col-span-3 space-y-4">
        <!-- Header Card with Toolbar -->
        <UCard class="border-t-4 border-t-blue-500">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-3">
                <h1 class="text-3xl font-bold text-gray-900">Registration Form</h1>
                <UBadge
                  v-if="previewMode"
                  label="Preview Mode"
                  color="blue"
                  variant="soft"
                />
                
                <!-- WebSocket Connection Status -->
                <div class="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50">
                  <div 
                    class="w-2 h-2 rounded-full transition-colors"
                    :class="{
                      'bg-green-500': ws.isConnected.value,
                      'bg-yellow-500 animate-pulse': ws.isConnecting.value,
                      'bg-red-500': ws.hasError.value,
                      'bg-gray-400': ws.isDisconnected.value
                    }"
                  />
                  <span class="text-xs text-gray-600 font-medium">
                    {{ ws.isConnected.value ? 'Live' : ws.isConnecting.value ? 'Connecting...' : ws.hasError.value ? 'Connection Error' : 'Offline' }}
                  </span>
                </div>
              </div>
              <p class="text-gray-600">
                {{ previewMode ? 'This is how attendees will see the form' : 'Configure questions to collect information from attendees' }}
              </p>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Undo/Redo -->
              <UTooltip text="Undo (Ctrl+Z)">
                <UButton
                  icon="i-heroicons-arrow-uturn-left"
                  variant="ghost"
                  size="sm"
                  :disabled="!canUndo"
                  @click="undo"
                />
              </UTooltip>
              <UTooltip text="Redo (Ctrl+Y)">
                <UButton
                  icon="i-heroicons-arrow-uturn-right"
                  variant="ghost"
                  size="sm"
                  :disabled="!canRedo"
                  @click="redo"
                />
              </UTooltip>
              
              <div class="w-px h-6 bg-gray-300" />
              
              <!-- View Controls -->
              <UTooltip :text="previewMode ? 'Exit Preview' : 'Preview Form'">
                <UButton
                  :icon="previewMode ? 'i-heroicons-pencil-square' : 'i-heroicons-eye'"
                  :variant="previewMode ? 'solid' : 'ghost'"
                  size="sm"
                  @click="previewMode = !previewMode"
                />
              </UTooltip>
              
              <UTooltip text="Collapse All">
                <UButton
                  icon="i-heroicons-chevron-up-down"
                  variant="ghost"
                  size="sm"
                  @click="collapseAll"
                />
              </UTooltip>
              
              <div class="w-px h-6 bg-gray-300" />
              
              <!-- Save -->
              <UButton
                label="Save All"
                icon="i-heroicons-cloud-arrow-up"
                size="sm"
                :loading="isSaving"
                :disabled="!hasUnsavedChanges"
                @click="saveAll"
              />
            </div>
          </div>
        </UCard>

        <!-- Questions List - Google Forms Style with Drag & Drop -->
        <div v-if="questionsLoading" class="space-y-4">
          <USkeleton v-for="i in 3" :key="i" class="h-48" />
        </div>

        <div v-else class="space-y-6">
          <draggable
            v-model="questions"
            item-key="id"
            handle=".drag-handle"
            :animation="200"
            ghost-class="opacity-50"
            @end="onDragEnd"
          >
            <template #item="{ element: question, index }">
              <UCard
                :key="question.id || question.tempId"
                :data-question-id="question.id || question.tempId"
                class="group relative transition-all hover:shadow-lg"
                :class="{
                  'ring-2 ring-blue-500': selectedQuestion?.id === question.id || selectedQuestion?.tempId === question.tempId,
                  'border-l-4 border-l-blue-500': question.isExpanded,
                  'ring-2 ring-amber-500': questionSync.conflictingQuestions.value.has(question.id),
                }"
                @click="selectedQuestion = question"
              >
                <!-- Loading Overlay -->
                <div 
                  v-if="questionLoadingStates.get(question.id || question.tempId || '')" 
                  class="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
                >
                  <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg">
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-blue-600 animate-spin" />
                    <span class="text-sm font-medium text-gray-700">Saving...</span>
                  </div>
                </div>
                
                <!-- Conflict Warning Banner -->
                <div 
                  v-if="questionSync.conflictingQuestions.value.has(question.id)" 
                  class="absolute top-0 left-0 right-0 bg-amber-100 border-b border-amber-300 px-4 py-2 z-20 rounded-t-lg"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-700" />
                      <span class="text-sm font-medium text-amber-900">
                        Another admin modified this question
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <UButton
                        label="Keep Mine"
                        size="xs"
                        color="amber"
                        variant="solid"
                        @click.stop="questionSync.resolveConflict(question.id, 'keep')"
                      />
                      <UButton
                        label="Use Theirs"
                        size="xs"
                        color="amber"
                        variant="outline"
                        @click.stop="questionSync.resolveConflict(question.id, 'refresh')"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- Drag Handle -->
                <div
                  v-if="!previewMode"
                  class="drag-handle absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                >
                  <div class="bg-gray-200 rounded p-1.5 hover:bg-gray-300">
                    <UIcon name="i-heroicons-bars-3" class="w-4 h-4 text-gray-600" />
                  </div>
                </div>

                <div class="space-y-5 p-1">
                  <!-- Question Header -->
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 space-y-3">
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
                      </div>

                      <!-- Editable Title -->
                      <div v-if="question.isExpanded && !previewMode">
                        <UInput
                          v-model="question.question_title"
                          placeholder="Question title"
                          size="lg"
                          variant="outline"
                          class="font-semibold"
                          @focus="markEditing(question.id)"
                          @blur="unmarkEditing(question.id); updateQuestion(question, { question_title: question.question_title })"
                        />
                      </div>
                      <h3
                        v-else
                        class="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                        @click="!previewMode && toggleExpanded(question)"
                      >
                        {{ question.question_title }}
                        <span v-if="question.required" class="text-red-500">*</span>
                      </h3>

                      <!-- Editable Description -->
                      <div v-if="question.isExpanded && !previewMode">
                        <UTextarea
                          v-model="question.question_body"
                          placeholder="Description (optional)"
                          :rows="2"
                          variant="outline"
                          @focus="markEditing(question.id)"
                          @blur="unmarkEditing(question.id); updateQuestion(question, { question_body: question.question_body })"
                        />
                      </div>
                      <p
                        v-else-if="question.question_body"
                        class="text-sm text-gray-600"
                      >
                        {{ question.question_body }}
                      </p>

                      <!-- Expanded Content -->
                      <div v-if="question.isExpanded" class="space-y-4 pt-2">
                        <!-- Question Type Selector (Edit Mode) -->
                        <div v-if="!previewMode" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <UFormGroup label="Question Type" size="sm">
                            <USelectMenu
                              v-model="question.question_type"
                              :options="questionTypes"
                              value-attribute="value"
                              size="sm"
                              @update:model-value="updateQuestion(question, { question_type: typeof $event === 'string' ? $event : $event?.value })"
                            />
                          </UFormGroup>
                          
                          <div class="flex items-end">
                            <UCheckbox
                              v-model="question.required"
                              label="Required"
                              @update:model-value="updateQuestion(question, { required: $event })"
                            />
                          </div>
                        </div>

                        <!-- Question Preview/Options -->
                        <div class="border-t border-gray-200 pt-4">
                          <div class="space-y-3">
                            <!-- Short Answer Preview -->
                            <div v-if="question.question_type === 'short_answer'" class="text-sm text-gray-600">
                              <UInput placeholder="Short answer text" disabled />
                            </div>

                            <!-- Long Answer Preview -->
                            <div v-else-if="question.question_type === 'long_answer'" class="text-sm text-gray-600">
                              <UTextarea placeholder="Long answer text" :rows="3" disabled />
                            </div>

                            <!-- Multiple/Single Choice Options -->
                            <div v-else-if="['multiple_choice', 'single_choice'].includes(question.question_type || '')" class="space-y-2">
                              <div v-if="!previewMode" class="space-y-2">
                                <div
                                  v-for="(option, optIndex) in (question.options || [])"
                                  :key="optIndex"
                                  class="flex items-center gap-2"
                                >
                                  <UIcon
                                    :name="question.question_type === 'single_choice' ? 'i-heroicons-stop-circle' : 'i-heroicons-check-circle'"
                                    class="w-4 h-4 text-gray-400"
                                  />
                                  <UInput
                                    :model-value="typeof option === 'string' ? option : option.option_text"
                                    placeholder="Option text"
                                    class="flex-1"
                                    @focus="markEditing(question.id)"
                                    @blur="unmarkEditing(question.id); updateQuestionOption(question, optIndex, ($event.target as HTMLInputElement).value)"
                                  />
                                  <UButton
                                    icon="i-heroicons-x-mark"
                                    color="red"
                                    variant="ghost"
                                    size="sm"
                                    @click="removeQuestionOption(question, optIndex)"
                                  />
                                </div>
                                <UButton
                                  icon="i-heroicons-plus"
                                  label="Add Option"
                                  variant="soft"
                                  size="sm"
                                  @click="addQuestionOption(question)"
                                />
                              </div>
                              <div v-else class="space-y-2">
                                <div
                                  v-for="(option, optIndex) in (question.options || [])"
                                  :key="optIndex"
                                  class="flex items-center gap-2 text-sm"
                                >
                                  <UIcon
                                    :name="question.question_type === 'single_choice' ? 'i-heroicons-stop-circle' : 'i-heroicons-check-circle'"
                                    class="w-4 h-4 text-gray-400"
                                  />
                                  <span>{{ typeof option === 'string' ? option : option.option_text }}</span>
                                </div>
                              </div>
                            </div>

                            <!-- File Upload Preview -->
                            <div v-else-if="question.question_type === 'upload'" class="text-sm text-gray-600">
                              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <UIcon name="i-heroicons-arrow-up-tray" class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p class="text-gray-500">Click to upload or drag and drop</p>
                              </div>
                            </div>

                            <!-- Slider Preview -->
                            <div v-else-if="question.question_type === 'slider'" class="text-sm text-gray-600">
                              <input type="range" class="w-full" min="0" max="10" disabled />
                              <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0</span>
                                <span>10</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div v-if="!previewMode" class="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UTooltip text="Expand/Collapse">
                        <UButton
                          :icon="question.isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                          variant="ghost"
                          size="sm"
                          color="gray"
                          @click.stop="toggleExpanded(question)"
                        />
                      </UTooltip>
                      
                      <UTooltip text="Duplicate (Ctrl+D)">
                        <UButton
                          icon="i-heroicons-document-duplicate"
                          variant="ghost"
                          size="sm"
                          color="gray"
                          @click.stop="duplicateQuestion(question)"
                        />
                      </UTooltip>
                      
                      <UTooltip text="Delete (Del)">
                        <UButton
                          icon="i-heroicons-trash"
                          variant="ghost"
                          size="sm"
                          color="red"
                          @click.stop="confirmDelete(question)"
                        />
                      </UTooltip>
                    </div>
                  </div>
                </div>
              </UCard>
            </template>
          </draggable>

          <!-- Empty State -->
          <UCard v-if="questions.length === 0" class="text-center py-16">
            <div class="space-y-4">
              <div class="flex justify-center">
                <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-clipboard-document-list" class="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
                <p class="text-sm text-gray-600 mb-6">Start building your registration form by adding questions</p>
              </div>
              <div class="flex items-center justify-center gap-3">
                <UButton
                  label="Add Question"
                  icon="i-heroicons-plus"
                  size="lg"
                  @click="addQuestion()"
                />
                <UDropdown
                  :items="templateMenuItems"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    label="Use Template"
                    icon="i-heroicons-sparkles"
                    variant="outline"
                    size="lg"
                  />
                </UDropdown>
              </div>
            </div>
          </UCard>

          <!-- Add Question Button -->
          <div v-else class="flex items-center gap-3">
            <UButton
              block
              icon="i-heroicons-plus"
              label="Add Question"
              variant="outline"
              size="lg"
              @click="addQuestion()"
            />
            
            <UDropdown
              :items="templateMenuItems"
              :popper="{ placement: 'bottom-start' }"
            >
              <UButton
                icon="i-heroicons-sparkles"
                label="Template"
                variant="outline"
                size="lg"
              />
            </UDropdown>
          </div>
        </div>
      </div>

      <!-- Enhanced Sidebar (1/4) -->
      <div class="space-y-4">
        <!-- Quick Stats -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">Form Overview</h3>
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-5 h-5 text-gray-400"
              />
            </div>
          </template>
          <div class="space-y-4">
            <div>
              <div class="text-3xl font-bold text-gray-900">{{ questions.length }}</div>
              <div class="text-sm text-gray-600">Total Questions</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-blue-600">
                {{ questions.filter((q: any) => q.required).length }}
              </div>
              <div class="text-sm text-gray-600">Required</div>
            </div>
            <div class="pt-3 border-t border-gray-200">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Auto-save</span>
                <UBadge
                  label="Active"
                  color="green"
                  variant="soft"
                  size="xs"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Jump to Question -->
        <UCard v-if="questions.length > 3">
          <template #header>
            <h3 class="font-semibold text-gray-900">Jump to Question</h3>
          </template>
          <div class="space-y-1 max-h-64 overflow-y-auto">
            <button
              v-for="(question, index) in questions"
              :key="question.id || question.tempId"
              class="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm group"
              :class="{
                'bg-blue-50 text-blue-700': selectedQuestion?.id === question.id || selectedQuestion?.tempId === question.tempId
              }"
              @click="scrollToQuestion(question)"
            >
              <div class="flex items-start gap-2">
                <span class="text-gray-500 font-medium flex-shrink-0">{{ index + 1 }}.</span>
                <span class="flex-1 truncate">{{ question.question_title }}</span>
                <UBadge
                  v-if="question.required"
                  label="*"
                  color="red"
                  variant="soft"
                  size="xs"
                  class="flex-shrink-0"
                />
              </div>
            </button>
          </div>
        </UCard>

        <!-- Keyboard Shortcuts -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">Keyboard Shortcuts</h3>
              <UIcon
                name="i-heroicons-command-line"
                class="w-5 h-5 text-gray-400"
              />
            </div>
          </template>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Undo</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+Z</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Redo</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+Y</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Save</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+S</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Duplicate</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Ctrl+D</kbd>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Delete</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Del</kbd>
            </div>
          </div>
        </UCard>

        <!-- Question Types Guide -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900">Question Types</h3>
          </template>
          <div class="space-y-2 text-sm">
            <div v-for="type in questionTypes" :key="type.value" class="flex items-start gap-2">
              <UIcon
                :name="getQuestionTypeIcon(type.value)"
                class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ type.label }}</div>
                <div class="text-gray-600 text-xs">{{ getQuestionTypeDescription(type.value) }}</div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import type { EventQuestion } from '~/api/types.gen'
import { eventQuestionsRetrieve } from '~/api/sdk.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'
import { useRegistrationFormBuilder } from '~/composables/useRegistrationFormBuilder'
import { useEventWebSocket } from '~/composables/useEventWebSocket'
import { useQuestionSync } from '~/composables/useQuestionSync'
import draggable from 'vuedraggable'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REGISTRATION',
    action: 'write'
  }
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

// Fetch event data
const { data: event } = useEvent(id)

// Get event integer ID for API calls
const eventIntId = computed(() => event.value?.data?.id)

// Fetch questions from API
const eventIdFilter = { event__event_id: route.params.id as string }
const { data: questionsData, isLoading: questionsLoading } = useEventQuestions(eventIdFilter)

// Initialize WebSocket connection
const ws = useEventWebSocket(id)
const questionSync = useQuestionSync(id, ws)

// Initialize form builder with all Google Forms features
const {
  questions,
  selectedQuestion,
  previewMode,
  isSaving,
  hasUnsavedChanges,
  questionTemplates,
  questionLoadingStates,
  optimistic,
  canUndo,
  canRedo,
  undo,
  redo,
  addQuestion,
  duplicateQuestion,
  deleteQuestion,
  updateQuestion,
  toggleExpanded,
  collapseAll,
  expandAll,
  saveAll,
} = useRegistrationFormBuilder(eventIntId)

// Sync API data with local state (only on initial load)
watch(questionsData, (newData) => {
  if (newData?.data?.results && questions.value.length === 0) {
    const initialQuestions = newData.data.results.map((q: any) => ({
      ...q,
      isExpanded: false,
      isEditing: false,
      isNew: false,
    }))
    questions.value = initialQuestions
    // Also initialize WebSocket sync state
    questionSync.setQuestions(initialQuestions)
  }
}, { immediate: true })

// Sync WebSocket questions with form builder
watch(
  () => questionSync.questions.value,
  (wsQuestions) => {
    // Only merge if questions differ and user is not actively editing
    wsQuestions.forEach(wsQuestion => {
      const localIndex = questions.value.findIndex(q => q.id === wsQuestion.id)
      
      if (localIndex === -1) {
        // New question from WebSocket - add it
        questions.value.push({
          ...wsQuestion,
          isExpanded: false,
          isEditing: false,
          isNew: false,
        })
        
        // Sort by order
        questions.value.sort((a, b) => (a.order || 0) - (b.order || 0))
      } else {
        // Question exists - check if we should merge
        const isEditing = questionSync.editingQuestions.value.has(wsQuestion.id)
        
        if (!isEditing) {
          // Not editing - safe to merge
          const currentExpanded = questions.value[localIndex].isExpanded
          const currentEditing = questions.value[localIndex].isEditing
          
          questions.value[localIndex] = {
            ...wsQuestion,
            isExpanded: currentExpanded,
            isEditing: currentEditing,
            isNew: false,
          }
        }
      }
    })
    
    // Remove deleted questions (but keep new unsaved ones)
    questions.value = questions.value.filter(localQ => {
      return wsQuestions.some(wsQ => wsQ.id === localQ.id) || localQ.isNew
    })
  },
  { deep: true }
)

// Show conflict warning
function showConflictWarning(question: EventQuestion) {
  toast.add({
    id: `conflict-${question.id}`,
    title: 'Question Updated',
    description: `"${question.question_title}" was modified by another admin.`,
    color: 'yellow',
    icon: 'i-heroicons-exclamation-triangle',
    timeout: 10000,
    actions: [
      {
        label: 'View Changes',
        click: () => {
          // Refresh this question from server
          questionSync.resolveConflict(question.id!, 'refresh')
          fetchAndMergeQuestion(question.id!)
        }
      },
      {
        label: 'Keep Mine',
        click: () => {
          questionSync.resolveConflict(question.id!, 'keep')
        }
      }
    ]
  })
}

// Fetch specific question and merge
async function fetchAndMergeQuestion(questionId: string) {
  try {
    const response = await eventQuestionsRetrieve({
      path: { id: questionId }
    })
    
    if (response.data) {
      const index = questions.value.findIndex(q => q.id === questionId)
      if (index !== -1) {
        Object.assign(questions.value[index], response.data)
        toast.add({
          title: 'Question Refreshed',
          description: 'Loaded latest version from server',
          color: 'green',
          timeout: 3000
        })
      }
    }
  } catch (error) {
    toast.add({
      title: 'Refresh Failed',
      description: 'Could not fetch latest question',
      color: 'red',
      timeout: 5000
    })
  }
}

// Mark questions as editing when user focuses on them
const markEditing = (questionId: string | undefined) => {
  if (questionId) {
    questionSync.markAsEditing(questionId)
  }
}

const unmarkEditing = (questionId: string | undefined) => {
  if (questionId) {
    questionSync.markAsNotEditing(questionId)
  }
}

// Question types configuration
const questionTypes = [
  { label: 'Short Answer', value: 'short_answer' },
  { label: 'Long Answer', value: 'long_answer' },
  { label: 'Multiple Choice', value: 'multiple_choice' },
  { label: 'Single Choice', value: 'single_choice' },
  { label: 'File Upload', value: 'upload' },
  { label: 'Slider', value: 'slider' },
]

// Template menu items for dropdown
const templateMenuItems = computed(() => {
  const items: any[][] = [
    [
      {
        label: 'Common Questions',
        slot: 'header',
      },
    ],
  ]
  
  const templateItems = questionTemplates.map(template => ({
    label: template.name,
    icon: 'i-heroicons-sparkles',
    click: () => addQuestion(template),
  }))
  
  if (templateItems.length > 0) {
    items.push(templateItems)
  }
  
  return items
})

// Drag end handler - auto-save new order
const onDragEnd = () => {
  questions.value.forEach((q: any, index: number) => {
    q.order = index
  })
  saveAll()
}

// Confirm delete with user
const confirmDelete = (question: any) => {
  if (confirm('Delete this question? All responses will be lost.')) {
    deleteQuestion(question)
  }
}

// Scroll to specific question
const scrollToQuestion = (question: any) => {
  selectedQuestion.value = question
  question.isExpanded = true
  
  nextTick(() => {
    const element = document.querySelector(`[data-question-id="${question.id || question.tempId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

// Option management for multiple/single choice questions
const addQuestionOption = (question: any) => {
  const currentOptions = question.options || []
  const newOptions = [...currentOptions, { option_text: '', order: currentOptions.length }]
  updateQuestion(question, { options: newOptions })
}

const removeQuestionOption = (question: any, index: number | string) => {
  const idx = typeof index === 'string' ? parseInt(index) : index
  if (question.options && !isNaN(idx)) {
    // Create new array without the removed item
    const newOptions = question.options.filter((_: any, i: number) => i !== idx)
      .map((opt: any, newIdx: number) => ({
        ...opt,
        order: newIdx
      }))
    // Save with updated options
    updateQuestion(question, { options: newOptions })
  }
}

const updateQuestionOption = (question: any, index: number | string, value: string) => {
  const idx = typeof index === 'string' ? parseInt(index) : index
  if (question.options && !isNaN(idx)) {
    // Create new array with updated option
    const newOptions = question.options.map((opt: any, i: number) => {
      if (i !== idx) return opt
      if (typeof opt === 'string') {
        return value
      }
      return {
        ...opt,
        option_text: value
      }
    })
    // Trigger debounced save via updateQuestion
    updateQuestion(question, { options: newOptions })
  }
}

// Helper functions
const getQuestionTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    short_answer: 'i-heroicons-pencil',
    long_answer: 'i-heroicons-document-text',
    multiple_choice: 'i-heroicons-check-circle',
    single_choice: 'i-heroicons-stop-circle',
    upload: 'i-heroicons-arrow-up-tray',
    slider: 'i-heroicons-adjustments-horizontal',
  }
  return icons[type] || 'i-heroicons-question-mark-circle'
}

const getQuestionTypeDescription = (type: string) => {
  const descriptions: Record<string, string> = {
    short_answer: 'Single line text input',
    long_answer: 'Multi-line text area',
    multiple_choice: 'Select multiple options',
    single_choice: 'Select one option',
    upload: 'Upload documents/images',
    slider: 'Numeric scale input',
  }
  return descriptions[type] || ''
}

const formatQuestionType = (type: string) => {
  return questionTypes.find(t => t.value === type)?.label || type
}
</script>

<style scoped>
kbd {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
