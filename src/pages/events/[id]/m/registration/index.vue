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
                      'bg-yellow-500 animate-pulse': ws.isConnecting.value || ws.connectionState.value === 'authenticating',
                      'bg-red-500': ws.hasError.value,
                      'bg-gray-400': ws.isDisconnected.value
                    }"
                  />
                  <span class="text-xs text-gray-600 font-medium">
                    {{ 
                      ws.isConnected.value ? 'Live' : 
                      ws.connectionState.value === 'authenticating' ? 'Authenticating...' :
                      ws.isConnecting.value ? 'Connecting...' : 
                      ws.hasError.value ? 'Connection Error' : 
                      'Offline' 
                    }}
                  </span>
                </div>
                
                <!-- Presence Indicator -->
                <PresenceIndicator :active-users="[...activeUsers]" />
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
                  :disabled="readOnly"
                  size="sm"
                  @click="togglePreviewMode"
                />
              </UTooltip>
              
              <UTooltip text="Validate Questions">
                <UButton
                  icon="i-heroicons-check-circle"
                  variant="ghost"
                  size="sm"
                  color="green"
                  @click="validateAll"
                  :disabled="readOnly"
                />
              </UTooltip>
              
              <UTooltip text="Collapse All">
                <UButton
                  icon="i-heroicons-chevron-up-down"
                  variant="ghost"
                  size="sm"
                  @click="collapseAll"
                  :disabled="readOnly"
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

        <div v-else class="space-y-8">
          <div class="relative">
            <!-- Reordering Overlay -->
            <div 
              v-if="isReordering" 
              class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
            >
              <div class="bg-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-200">
                <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-blue-600 animate-spin" />
                <span class="text-lg font-medium text-gray-900">Reordering questions...</span>
              </div>
            </div>
            
            <draggable
            v-model="questions"
            item-key="id"
            handle=".drag-handle"
            :animation="200"
            ghost-class="opacity-50"
            :disabled="isReordering"
            @end="onDragEnd"
          >
            <template #item="{ element: question, index }">
              <UCard
                :key="question.id || question.tempId"
                :data-question-id="question.id || question.tempId"
                class="group relative transition-all hover:shadow-lg my-3"
                :class="{
                  'ring-2 ring-blue-500': selectedQuestion?.id === question.id || selectedQuestion?.tempId === question.tempId,
                  'border-l-4 border-l-blue-500': question.isExpanded,
                  'ring-2 ring-amber-500': questionSync.conflictingQuestions.value.has(question.id),
                  'ring-2 ring-red-400 bg-red-50/30': questionValidationErrors.get(question.id || question.tempId || ''),
                }"
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

                <div class="space-y-5 p-1" @click="handleQuestionCardClick(question, $event)">
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
                          v-if="questionValidationErrors.get(question.id || question.tempId || '')"
                          label="Has Errors"
                          color="red"
                          variant="solid"
                          size="xs"
                          class="animate-pulse"
                        />
                      </div>

                      <!-- Editable Title -->
                      <div v-if="question.isExpanded && !previewMode">
                        <UFormGroup :error="getFieldError(question, 'question_title')">
                          <UInput
                            v-model="question.question_title"
                            placeholder="Question title"
                            size="lg"
                            variant="outline"
                            class="font-semibold"
                            :class="{ 'border-red-500': getFieldError(question, 'question_title') }"
                            @focus="markEditing(question.id); focusedFields.add(`${question.id}-title`)"
                            @blur="unmarkEditing(question.id); focusedFields.delete(`${question.id}-title`); updateQuestion(question, { question_title: question.question_title })"
                          />
                        </UFormGroup>
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
                        <UFormGroup 
                          label="Description" 
                          required
                          :error="getFieldError(question, 'question_body')"
                        >
                          <UTextarea
                            v-model="question.question_body"
                            placeholder="Enter question description"
                            :rows="2"
                            variant="outline"
                            :class="{ 'border-red-500': getFieldError(question, 'question_body') }"
                            @focus="markEditing(question.id); focusedFields.add(`${question.id}-body`)"
                            @blur="unmarkEditing(question.id); focusedFields.delete(`${question.id}-body`); updateQuestion(question, { question_body: question.question_body })"
                          />
                        </UFormGroup>
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
                              @update:model-value="(val) => {
                                const newType = typeof val === 'string' ? val : val?.value
                                const changes: any = { question_type: newType }
                                // Set defaults for slider when changing to slider type
                                if (newType === 'slider' && (question.min_value === undefined || question.max_value === undefined)) {
                                  changes.min_value = question.min_value ?? 0
                                  changes.max_value = question.max_value ?? 10
                                }
                                updateQuestion(question, changes)
                              }"
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

                        <!-- Slider Range Settings -->
                        <div v-if="!previewMode && question.question_type === 'slider'" class="grid grid-cols-2 gap-3">
                          <UFormGroup 
                            label="Minimum Value" 
                            size="sm"
                            :error="getFieldError(question, 'min_value')"
                          >
                            <UInput
                              :model-value="question.min_value ?? 0"
                              type="number"
                              placeholder="0"
                              :class="{ 'border-red-500': getFieldError(question, 'min_value') }"
                              @update:model-value="updateQuestion(question, { min_value: Number($event) })"
                            />
                          </UFormGroup>
                          
                          <UFormGroup 
                            label="Maximum Value" 
                            size="sm"
                            :error="getFieldError(question, 'max_value')"
                          >
                            <UInput
                              :model-value="question.max_value ?? 10"
                              type="number"
                              placeholder="10"
                              :class="{ 'border-red-500': getFieldError(question, 'max_value') }"
                              @update:model-value="updateQuestion(question, { max_value: Number($event) })"
                            />
                          </UFormGroup>
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
                                <!-- Options Error Message -->
                                <div v-if="getFieldError(question, 'options')" class="text-sm text-red-600 flex items-center gap-1">
                                  <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
                                  {{ getFieldError(question, 'options') }}
                                </div>
                                
                                <div
                                  v-for="(option, optIndex) in (question.options || [])"
                                  :key="`${question.id || question.tempId}-option-${optIndex}-${typeof option === 'string' ? option : option.id || option.option_text}`"
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
                                    :class="{ 'border-red-500': getFieldError(question, 'options') }"
                                    @focus="markEditing(question.id); focusedFields.add(`${question.id}-option-${optIndex}`)"
                                    @blur="unmarkEditing(question.id); focusedFields.delete(`${question.id}-option-${optIndex}`); updateQuestionOption(question, optIndex, ($event.target as HTMLInputElement).value)"
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
                              <input
                                type="range"
                                class="w-full"
                                :min="question.min_value ?? 0"
                                :max="question.max_value ?? 10"
                                disabled
                              />
                              <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{{ question.min_value ?? 0 }}</span>
                                <span>{{ question.max_value ?? 10 }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Action Buttons -->
                    <div v-if="!previewMode" class="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UTooltip text="Expand/Collapse" v-if="canEditQuestions">
                        <UButton
                          :icon="question.isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                          variant="ghost"
                          size="sm"
                          color="gray"
                          @click.stop="toggleExpanded(question)"
                        />
                      </UTooltip>
                      
                      <UTooltip text="Duplicate (Ctrl+D)" v-if="canEditQuestions">
                        <UButton
                          icon="i-heroicons-document-duplicate"
                          variant="ghost"
                          size="sm"
                          color="gray"
                          @click.stop="duplicateQuestion(question)"
                        />
                      </UTooltip>
                      
                      <UTooltip text="Delete (Del)" v-if="canDeleteQuestions">
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
          </div>

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
                  @click="addQuestionWithLoading()"
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
          <div v-else-if="canCreatedQuestions" class="flex items-center gap-3 flex-wrap">
            <UButton
              class="flex-1 min-w-[200px]"
              icon="i-heroicons-plus"
              label="Add Question"
              variant="outline"
              size="lg"
              @click="addQuestionWithLoading()"
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

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900">Consent Definitions</h3>
              <UButton
                size="xs"
                icon="i-heroicons-plus"
                :disabled="readOnly"
                @click="startCreateConsent"
              />
            </div>
          </template>

          <div class="space-y-3">
            <div v-if="eventConsents.isLoading.value" class="text-xs text-gray-500">Loading consents...</div>
            <div v-else-if="!eventConsents.data.value?.data?.results?.length" class="text-xs text-gray-500">No consents defined yet.</div>
            <div v-else class="space-y-2 max-h-72 overflow-y-auto">
              <div
                v-for="consent in eventConsents.data.value?.data?.results"
                :key="consent.id"
                class="p-3 border border-gray-200 rounded-lg"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ consent.title }}</div>
                    <div class="text-xs text-gray-600">{{ consent.code }} · v{{ consent.version || '1.0' }}</div>
                    <div class="mt-1 flex items-center gap-1">
                      <UBadge v-if="consent.required" size="xs" color="red" variant="soft" label="Required" />
                      <UBadge :size="'xs'" :color="consent.active ? 'green' : 'gray'" variant="soft" :label="consent.active ? 'Active' : 'Inactive'" />
                    </div>
                  </div>
                  <div class="flex items-center gap-1" v-if="!readOnly">
                    <UButton size="2xs" variant="ghost" icon="i-heroicons-pencil-square" @click="startEditConsent(consent)" />
                    <UButton
                      size="2xs"
                      variant="ghost"
                      color="red"
                      icon="i-heroicons-trash"
                      :loading="deleteConsentMutation.isPending.value"
                      @click="removeConsentDefinition(consent.id)"
                    />
                  </div>
                </div>
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

    <UModal v-model="showConsentForm" :ui="{ width: 'sm:max-w-3xl' }">
      <UCard class="overflow-hidden">
        <template #header>
          <div class="-mx-6 -mt-6 mb-4 p-5 bg-gradient-to-r from-emerald-50 via-cyan-50 to-sky-100 border-b border-sky-200">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">
                  {{ editingConsentId ? 'Edit Consent Definition' : 'Create Consent Definition' }}
                </h3>
                <p class="text-xs text-gray-600 mt-1">
                  Define what attendees agree to during registration.
                </p>
              </div>
              <UButton
                icon="i-heroicons-x-mark"
                variant="ghost"
                size="xs"
                @click="resetConsentForm"
              />
            </div>
          </div>
        </template>

        <div class="space-y-5">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-cyan-600" />
              <p class="text-xs font-medium text-gray-700">Quick templates</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="template in consentDefinitionTemplates"
                :key="template.title"
                size="xs"
                variant="soft"
                color="cyan"
                :disabled="readOnly"
                @click="applyConsentTemplate(template)"
              >
                {{ template.title }}
              </UButton>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="md:col-span-2">
              <label class="text-xs font-medium text-gray-700 mb-1 block">Title</label>
              <UInput
                v-model="consentForm.title"
                placeholder="e.g. Photo and Video Consent"
                size="sm"
                :disabled="readOnly"
                @update:model-value="onConsentTitleInput"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs font-medium text-gray-700 block">Code</label>
                <UButton
                  size="2xs"
                  variant="ghost"
                  color="gray"
                  :disabled="readOnly || !consentForm.title.trim()"
                  @click="generateCodeFromTitle"
                >
                  Regenerate
                </UButton>
              </div>
              <UInput
                v-model="consentForm.code"
                placeholder="3-digit code"
                size="sm"
                :disabled="readOnly"
                maxlength="3"
                @update:model-value="onConsentCodeInput"
              />
              <p class="text-[11px] text-gray-500 mt-1">Auto-generated from title, editable.</p>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-700 mb-1 block">Description</label>
            <UTextarea
              v-model="consentForm.description"
              placeholder="Describe what the attendee is consenting to."
              :rows="5"
              size="sm"
              :disabled="readOnly"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1 block">External Link (optional)</label>
              <UInput
                v-model="consentForm.external_link"
                placeholder="https://example.com/policy"
                size="sm"
                :disabled="readOnly"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1 block">Version</label>
              <UInput v-model="consentForm.version" placeholder="1.0" size="sm" :disabled="readOnly" />
            </div>
          </div>

          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div class="flex flex-wrap items-center gap-5">
              <UCheckbox
                v-model="consentForm.required"
                label="Required"
                :disabled="readOnly"
              />
              <UCheckbox
                v-model="consentForm.active"
                label="Active"
                :disabled="readOnly"
              />
              <UBadge
                :label="consentForm.required ? 'Mandatory for registration' : 'Optional for attendees'"
                :color="consentForm.required ? 'red' : 'gray'"
                variant="soft"
                size="xs"
              />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <UButton size="sm" label="Cancel" variant="ghost" @click="resetConsentForm" />
            <UButton
              size="sm"
              :label="editingConsentId ? 'Save Changes' : 'Create Consent'"
              :disabled="readOnly"
              :loading="createConsentMutation.isPending.value || updateConsentMutation.isPending.value"
              @click="saveConsentDefinition"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import type { EventQuestion } from '~/api/types.gen'
import { eventQuestionsRetrieve } from '~/api/sdk.gen'
import { useEvent } from '~/composables/resources/events/events'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'
import {
  useConsents,
  useCreateConsent,
  useUpdateConsent,
  useDeleteConsent,
} from '~/composables/resources/attendee/attendeeConsents'
import { useRegistrationFormBuilder } from '~/composables/websockets/events/useRegistrationFormBuilder'
import { useEventWebSocket } from '~/composables/websockets/events/useEventWebSocket'
import { useQuestionSync } from '~/composables/websockets/events/useQuestionSync'
import { useCurrentUserEventPermissions } from '~/composables/permissions'

import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'


import draggable from 'vuedraggable'
import Swal from 'sweetalert2'

// Track focused fields to prevent auto-save while typing
const focusedFields = ref(new Set<string>())

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'REGISTRATION',
    action: 'read',
    deniedRedirect: '/403',
  }
})

const route = useRoute()
const toast = useToast()

const id = computed(() => String(route.params.id))
const { can } = useCurrentUserEventPermissions(id, {
  refetchInterval: 30000,
  refetchOnWindowFocus: true,
  staleTime: 15000
})

const canEditQuestions = computed(() => can('REGISTRATION', 'update').value.allowed)
const canDeleteQuestions = computed(() => can('REGISTRATION', 'delete').value.allowed)
const canCreatedQuestions = computed(() => can('REGISTRATION', 'create').value.allowed)
const readOnly = computed(() => !canEditQuestions.value && !canDeleteQuestions.value && !canCreatedQuestions.value)

// Reordering state
const isReordering = ref(false)
let reorderTimeout: ReturnType<typeof setTimeout> | null = null

// Fetch event data
const { data: event } = useEvent(id)

// Get event integer ID for API calls
const eventIntId = computed(() => event.value?.data?.id)

// Consent definitions (event-scoped)
const consentFilters = computed(() => {
  if (!eventIntId.value) return undefined
  return {
    event: event.value?.data?.url_safe_title || event?.value?.data?.event_id,
    page_size: 100,
  }
})

const eventConsents = useConsents(consentFilters)
const createConsentMutation = useCreateConsent()
const updateConsentMutation = useUpdateConsent()
const deleteConsentMutation = useDeleteConsent()

const showConsentForm = ref(false)
const editingConsentId = ref<number | null>(null)
const consentCodeManuallyEdited = ref(false)

const consentDefinitionTemplates = [
  {
    title: 'Data Protection Consent',
    description:
      'I consent to the collection and processing of my personal data for event registration, communication, safety, and compliance purposes in line with applicable data protection laws.',
    external_link: '',
    required: true,
    active: true,
    version: '1.0',
  },
  {
    title: 'Photo and Video Consent',
    description:
      'I consent to being photographed and recorded during the event and allow these materials to be used for event promotion, social media, and future communication.',
    external_link: '',
    required: false,
    active: true,
    version: '1.0',
  },
  {
    title: 'Medical Treatment Consent',
    description:
      'In case of emergency, I authorize event staff to seek appropriate medical treatment on my behalf when immediate action is required.',
    external_link: '',
    required: true,
    active: true,
    version: '1.0',
  },
  {
    title: 'Code of Conduct Acknowledgement',
    description:
      'I confirm that I have read and agree to follow the event code of conduct. I understand violations may result in removal from the event.',
    external_link: '',
    required: true,
    active: true,
    version: '1.0',
  },
]

const inferThreeDigitConsentCode = (title: string) => {
  const trimmed = title.trim()
  if (!trimmed) return ''

  // Stable 3-digit numeric code derived from title characters.
  const checksum = Array.from(trimmed).reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (index + 1)
  }, 0)

  return String((checksum % 900) + 100)
}

const onConsentTitleInput = (value: string | number) => {
  const title = typeof value === 'string' ? value : String(value ?? '')
  if (!consentCodeManuallyEdited.value) {
    consentForm.code = inferThreeDigitConsentCode(title)
  }
}

const onConsentCodeInput = (value: string | number) => {
  const parsed = typeof value === 'string' ? value : String(value ?? '')
  consentCodeManuallyEdited.value = true
  consentForm.code = parsed.replace(/\D/g, '').slice(0, 3)
}

const generateCodeFromTitle = () => {
  consentCodeManuallyEdited.value = false
  consentForm.code = inferThreeDigitConsentCode(consentForm.title)
}

const applyConsentTemplate = (template: {
  title: string
  description: string
  external_link: string
  required: boolean
  active: boolean
  version: string
}) => {
  consentForm.title = template.title
  consentForm.description = template.description
  consentForm.external_link = template.external_link
  consentForm.required = template.required
  consentForm.active = template.active
  consentForm.version = template.version
  consentCodeManuallyEdited.value = false
  consentForm.code = inferThreeDigitConsentCode(template.title)
}

const consentForm = reactive({
  code: '',
  title: '',
  description: '',
  external_link: '',
  version: '1.0',
  required: false,
  active: true,
})

const resetConsentForm = () => {
  showConsentForm.value = false
  editingConsentId.value = null
  consentCodeManuallyEdited.value = false
  consentForm.code = ''
  consentForm.title = ''
  consentForm.description = ''
  consentForm.external_link = ''
  consentForm.version = '1.0'
  consentForm.required = false
  consentForm.active = true
}

const startCreateConsent = () => {
  resetConsentForm()
  showConsentForm.value = true
}

const startEditConsent = (consent: any) => {
  editingConsentId.value = consent.id
  showConsentForm.value = true
  consentForm.code = consent.code || ''
  consentCodeManuallyEdited.value = true
  consentForm.title = consent.title || ''
  consentForm.description = consent.description || ''
  consentForm.external_link = consent.external_link || ''
  consentForm.version = consent.version || '1.0'
  consentForm.required = !!consent.required
  consentForm.active = !!consent.active
}

const saveConsentDefinition = async () => {
  if (!eventIntId.value) {
    toast.add({ title: 'Event Not Ready', description: 'Please wait for event details.', color: 'red', timeout: 3000 })
    return
  }

  if (!consentForm.code.trim() || !consentForm.title.trim() || !consentForm.description.trim()) {
    toast.add({ title: 'Missing Fields', description: 'Code, title, and description are required.', color: 'red', timeout: 3000 })
    return
  }

  const payload = {
    event: eventIntId.value,
    code: consentForm.code.trim(),
    title: consentForm.title.trim(),
    description: consentForm.description.trim(),
    external_link: consentForm.external_link.trim() || null,
    version: consentForm.version.trim() || '1.0',
    required: consentForm.required,
    active: consentForm.active,
  }

  try {
    if (editingConsentId.value) {
      await updateConsentMutation.mutateAsync({ consentId: editingConsentId.value, body: payload })
      toast.add({ title: 'Consent Updated', description: 'Consent definition saved.', color: 'green', timeout: 3000 })
    } else {
      await createConsentMutation.mutateAsync(payload)
      toast.add({ title: 'Consent Created', description: 'Consent definition created.', color: 'green', timeout: 3000 })
    }
    resetConsentForm()
  } catch (error) {
    toast.add({ title: 'Save Failed', description: 'Could not save consent definition.', color: 'red', timeout: 4000 })
  }
}

const removeConsentDefinition = async (consentId: number) => {
  const result = await Swal.fire({
    title: 'Delete Consent?',
    text: 'This consent definition will be removed.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  })

  if (!result.isConfirmed) return

  try {
    await deleteConsentMutation.mutateAsync(consentId)
    toast.add({ title: 'Consent Deleted', description: 'Consent definition removed.', color: 'green', timeout: 3000 })
  } catch (error) {
    toast.add({ title: 'Delete Failed', description: 'Could not delete consent definition.', color: 'red', timeout: 4000 })
  }
}

// Fetch questions from API
const eventIdFilter = { event: route.params.id as string, page_size: 100 }
const { data: questionsData, isLoading: questionsLoading } = useEventQuestions(eventIdFilter)

// Initialize WebSocket connection FIRST (needed by form builder)
const ws = useEventWebSocket(id)

// Initialize form builder with WebSocket instance
const {
  questions,
  selectedQuestion,
  previewMode,
  isSaving,
  hasUnsavedChanges,
  questionTemplates,
  questionLoadingStates,
  questionValidationErrors,
  isConnected,
  isConnecting,
  canUndo,
  canRedo,
  validateQuestion,
  validateAllQuestions,
  getQuestionFieldErrors,
  getFieldError,
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
  saveQuestionsOrder,
} = useRegistrationFormBuilder(eventIntId, ws, focusedFields)

// Initialize question sync for real-time updates
const questionSync = useQuestionSync(id, ws, questions as Ref<EventQuestion[]>)

// Unwrap activeUsers for template use
const activeUsers = computed(() => questionSync.activeUsers.value)

onMounted(() => {
  // set preview mode locked to true if readOnly
  if (readOnly.value) {
    previewMode.value = true
    expandAll()
  }
})

// Handle preview mode toggle with unsaved changes warning
const togglePreviewMode = async () => {
  if (!previewMode.value && hasUnsavedChanges.value) {
    const result = await Swal.fire({
      title: 'Unsaved Changes',
      text: 'You have unsaved changes. Do you want to save before previewing?',
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#3b82f6',
      denyButtonColor: '#6b7280',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Save & Preview',
      denyButtonText: 'Preview Without Saving',
      cancelButtonText: 'Cancel'
    })
    
    if (result.isConfirmed) {
      await saveAll()
      previewMode.value = true
      expandAll()
    } else if (result.isDenied) {
      previewMode.value = true
      expandAll()
    }
  } else {
    previewMode.value = !previewMode.value
    if (previewMode.value) {
      expandAll()
    }
  }
}

// Handle clicks on question cards - close expanded when clicking outside edit area
const handleQuestionCardClick = (question: any, event: MouseEvent) => {
  selectedQuestion.value = question
  // If clicking on the card background (not on inputs/buttons), toggle expansion
  const target = event.target as HTMLElement
  if (!target.closest('input, textarea, button, select')) {
    if (question.isExpanded && !previewMode.value) {
      question.isExpanded = false
    }
  }
}

// Sync API data with local state (only on initial load)
watch(questionsData, async (newData: any) => {
  if (newData?.data?.results && questions.value.length === 0) {
    const initialQuestions = newData.data.results.map((q: any) => ({
      ...q,
      isExpanded: false,
      isEditing: false,
      isNew: false,
    }))
    questions.value = initialQuestions
  }
}, { immediate: true })

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
    click: () => addQuestionWithLoading(template),
  }))
  
  if (templateItems.length > 0) {
    items.push(templateItems)
  }
  
  return items
})

// Wrapper function for adding questions with loading state
const addQuestionWithLoading = async (template?: any) => {
  if (isReordering.value) return
  
  isReordering.value = true
  const startTime = Date.now()
  
  try {
    await addQuestion(template)
  } finally {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, 1000 - elapsed)
    
    setTimeout(() => {
      isReordering.value = false
    }, remaining)
  }
}

// Wrapper function for deleting questions with loading state
const deleteQuestionWithLoading = async (question: any) => {
  if (isReordering.value) return
  
  isReordering.value = true
  const startTime = Date.now()
  
  try {
    await deleteQuestion(question)
  } finally {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, 1000 - elapsed)
    
    setTimeout(() => {
      isReordering.value = false
    }, remaining)
  }
}

// Drag end handler - auto-save new order with minimum delay
const onDragEnd = async () => {
  // Prevent spam by ignoring if already reordering
  if (isReordering.value) {
    return
  }
  
  isReordering.value = true
  
  // Clear any existing timeout
  if (reorderTimeout) {
    clearTimeout(reorderTimeout)
  }
  
  // Update orders
  questions.value.forEach((q: any, index: number) => {
    q.order = index
  })
  
  // Minimum 1 second delay to prevent spam and hide jitter
  const startTime = Date.now()
  
  try {
    // ONLY save order using two-phase approach, don't call saveAll()
    // This prevents conflicting PATCH requests
    await saveQuestionsOrder()
  } finally {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, 1000 - elapsed)
    
    reorderTimeout = setTimeout(() => {
      isReordering.value = false
    }, remaining)
  }
}

// Confirm delete with user using SweetAlert2
const confirmDelete = async (question: any) => {
  const result = await Swal.fire({
    title: 'Delete Question?',
    text: question.question_title || 'This question',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel'
  })
  
  if (result.isConfirmed) {
    await deleteQuestionWithLoading(question)
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

// Validate all questions and show results
const validateAll = () => {
  const validation = validateAllQuestions()
  
  if (validation.success) {
    toast.add({
      title: 'Validation Passed',
      description: 'All questions are valid!',
      color: 'green',
      timeout: 3000,
    })
  } else {
    Swal.fire({
      title: 'Validation Errors',
      html: `<div class="text-left space-y-2">
        ${validation.errors?.map(err => `<p class="text-sm text-red-600">• ${err}</p>`).join('') || 'Unknown errors'}
      </div>`,
      icon: 'error',
      confirmButtonText: 'Fix Issues',
      confirmButtonColor: '#ef4444',
    })
  }
}
</script>

<style scoped>
kbd {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
