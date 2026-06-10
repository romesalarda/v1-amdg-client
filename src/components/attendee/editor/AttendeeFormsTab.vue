<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xs font-black text-primary uppercase tracking-widest">Form Responses</h3>
        <p class="mt-1 text-xs text-deep-navy/60">View and edit this attendee's answers to event forms.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="formsQuery.isLoading.value" class="flex items-center gap-2 py-6 text-sm text-deep-navy/60">
      <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
      Loading forms…
    </div>

    <!-- Error -->
    <div
      v-else-if="formsQuery.error.value"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      Unable to load forms right now.
    </div>

    <!-- No forms -->
    <div
      v-else-if="!visibleForms.length"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-deep-navy/20 bg-mist-blue/20 py-14 text-center"
    >
      <svg class="h-10 w-10 text-deep-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="mt-3 text-sm font-semibold text-deep-navy/70">No published forms</p>
      <p class="mt-1 text-xs text-deep-navy/50">No forms have been published for this event yet.</p>
    </div>

    <!-- Forms list -->
    <div v-else class="space-y-4">
      <!-- Pagination nav -->
      <div v-if="visibleForms.length > 1" class="flex items-center justify-between rounded-xl border border-deep-navy/10 bg-white px-4 py-2.5">
        <span class="text-xs font-semibold text-deep-navy/60">{{ currentFormIndex + 1 }} / {{ visibleForms.length }}</span>
        <div class="flex items-center gap-3">
          <div class="flex gap-1.5">
            <button
              v-for="(_, i) in visibleForms"
              :key="i"
              type="button"
              class="h-1.5 rounded-full transition-all duration-200"
              :class="i === currentFormIndex ? 'w-5 bg-primary' : 'w-1.5 bg-deep-navy/20'"
              @click="currentFormIndex = i"
            />
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              :disabled="currentFormIndex === 0"
              class="rounded-lg border border-deep-navy/15 p-1 text-deep-navy/60 hover:bg-deep-navy/5 disabled:opacity-30 transition-colors"
              @click="currentFormIndex--"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              :disabled="currentFormIndex === visibleForms.length - 1"
              class="rounded-lg border border-deep-navy/15 p-1 text-deep-navy/60 hover:bg-deep-navy/5 disabled:opacity-30 transition-colors"
              @click="currentFormIndex++"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        v-for="form in currentForm ? [currentForm] : []"
        :key="form.id"
        class="overflow-hidden rounded-2xl border border-deep-navy/10 bg-white shadow-sm"
      >
        <!-- Form header -->
        <div class="flex items-start justify-between gap-4 border-b border-deep-navy/10 px-5 py-4">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-sm font-black text-deep-navy">{{ form.title }}</h3>
              <span
                v-if="form.required"
                class="inline-flex items-center rounded-full text-[10px] font-black uppercase tracking-wide text-red-700"
              >*</span>
              <span :class="formStatusBadgeClass(form)">{{ formStatusLabel(form) }}</span>
            </div>
            <p v-if="form.description" class="mt-1 text-xs text-deep-navy/60">{{ form.description }}</p>
          </div>

          <!-- Completion / response badge -->
          <div class="shrink-0">
            <span
              v-if="getResponse(form.id)?.is_complete"
              class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700"
            >
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Submitted
            </span>
            <span
              v-else-if="getResponse(form.id)"
              class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700"
            >
              In Progress
            </span>
            <span
              v-else
              class="inline-flex items-center rounded-full bg-deep-navy/8 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-deep-navy/50"
            >
              No Response
            </span>
          </div>
        </div>

        <!-- Timing row -->
        <div
          v-if="form.opens_at || form.deadline"
          class="flex flex-wrap gap-3 border-b border-deep-navy/10 bg-deep-navy/2 px-5 py-2.5 text-xs text-deep-navy/60"
        >
          <span v-if="form.opens_at" class="flex items-center gap-1">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Opens {{ formatDate(form.opens_at) }}
          </span>
          <span v-if="form.deadline" class="flex items-center gap-1">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deadline {{ formatDate(form.deadline) }}
          </span>
        </div>

        <!-- No response yet — staff can create one -->
        <div v-if="!getResponse(form.id)" class="flex flex-col items-center gap-3 px-5 py-8 text-center">
          <div class="rounded-full bg-deep-navy/5 p-3">
            <svg class="h-6 w-6 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-sm text-deep-navy/60">This attendee has not started this form.</p>
          <button
            type="button"
            class="rounded-xl bg-primary px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-60"
            :disabled="startingFormId === form.id"
            @click="startFormForAttendee(form)"
          >
            {{ startingFormId === form.id ? 'Creating…' : 'Create response' }}
          </button>
        </div>

        <!-- Response exists — show questions -->
        <template v-else>
          <!-- Loading questions / answers -->
          <div
            v-if="isFormDetailLoading(form.id) || answersLoading(form.id)"
            class="flex items-center gap-2 px-5 py-6 text-sm text-deep-navy/60"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            Loading questions…
          </div>

          <!-- Questions -->
          <div v-else class="divide-y divide-deep-navy/8">
            <div
              v-for="question in formWithQuestions(form.id).questions ?? []"
              :key="question.id"
              class="px-5 py-4"
            >
              <!-- Question label row -->
              <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-sm font-bold text-deep-navy">{{ question.question_title }}</span>
                    <span
                      v-if="question.required"
                      class="inline-flex items-center rounded-full text-[10px] font-black uppercase tracking-wide text-red-600"
                    >*</span>
                    <span class="inline-flex items-center rounded-full bg-deep-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-deep-navy/60">
                      {{ question.question_type_display ?? question.question_type }}
                    </span>
                  </div>
                  <p v-if="question.question_body" class="mt-1 text-xs text-deep-navy/60">{{ question.question_body }}</p>
                </div>
              </div>

              <!-- Answer area -->
              <div>
                <!-- Read mode -->
                <template v-if="hasAnswer(form.id, question.id) && editingAnswerId !== answerForQuestion(form.id, question.id)?.id">
                  <div class="flex items-start gap-2 rounded-lg bg-deep-navy/4 p-3">
                    <div class="min-w-0 flex-1">
                      <!-- Rating -->
                      <div v-if="question.question_type === 'rating'" class="flex gap-0.5">
                        <span
                          v-for="star in 5"
                          :key="star"
                          class="text-xl leading-none"
                          :class="Number(answerForQuestion(form.id, question.id)?.answer_text || 0) >= star ? 'text-amber-400' : 'text-deep-navy/20'"
                        >★</span>
                      </div>
                      <!-- Slider -->
                      <div v-else-if="question.question_type === 'slider'" class="space-y-1">
                        <div class="flex items-center gap-3">
                          <span class="text-sm font-black text-primary">{{ answerForQuestion(form.id, question.id)?.answer_text }}</span>
                          <span class="text-xs text-deep-navy/50">/ {{ question.max_value ?? 100 }}</span>
                        </div>
                        <div class="h-1.5 w-full rounded-full bg-deep-navy/10">
                          <div
                            class="h-1.5 rounded-full bg-primary transition-all"
                            :style="{ width: `${(Number(answerForQuestion(form.id, question.id)?.answer_text || 0) / (question.max_value ?? 100)) * 100}%` }"
                          />
                        </div>
                      </div>
                      <!-- Text types -->
                      <p
                        v-else-if="isTextType(question.question_type)"
                        class="text-sm text-deep-navy whitespace-pre-wrap"
                      >{{ answerForQuestion(form.id, question.id)?.answer_text }}</p>
                      <!-- Choices -->
                      <div v-else-if="isChoiceType(question.question_type)" class="flex flex-wrap gap-2">
                        <span
                          v-for="choice in answerForQuestion(form.id, question.id)?.selected_options"
                          :key="choice.id"
                          class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                        >{{ choice.option_text }}</span>
                      </div>
                      <!-- Upload -->
                      <div v-else-if="question.question_type === 'upload'">
                        <a
                          v-if="answerForQuestion(form.id, question.id)?.answer_file_url"
                          :href="answerForQuestion(form.id, question.id)?.answer_file_url ?? '#'"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          View file
                        </a>
                        <span v-else class="text-xs text-deep-navy/50 italic">No file uploaded</span>
                      </div>
                    </div>

                    <!-- Edit / clear actions -->
                    <div class="flex shrink-0 gap-0.5">
                      <button
                        type="button"
                        title="Edit answer"
                        class="rounded p-1 text-deep-navy/40 hover:bg-deep-navy/10 hover:text-deep-navy transition-colors"
                        @click="beginEditAnswer(form.id, question.id)"
                      >
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Clear answer"
                        class="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        @click="removeAnswer(form.id, question.id)"
                      >
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </template>

                <!-- Edit / new answer mode -->
                <template v-else>
                  <!-- short / email / phone -->
                  <input
                    v-if="question.question_type === 'short_answer' || question.question_type === 'email' || question.question_type === 'phone'"
                    :value="draftText(form.id, question.id)"
                    :type="question.question_type === 'email' ? 'email' : question.question_type === 'phone' ? 'tel' : 'text'"
                    placeholder="Enter answer…"
                    class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    @input="setDraftText(form.id, question.id, ($event.target as HTMLInputElement).value)"
                  />

                  <!-- long answer -->
                  <textarea
                    v-else-if="question.question_type === 'long_answer'"
                    :value="draftText(form.id, question.id)"
                    rows="4"
                    placeholder="Enter answer…"
                    class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    @input="setDraftText(form.id, question.id, ($event.target as HTMLTextAreaElement).value)"
                  />

                  <!-- date -->
                  <input
                    v-else-if="question.question_type === 'date'"
                    :value="draftText(form.id, question.id)"
                    type="date"
                    class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    @input="setDraftText(form.id, question.id, ($event.target as HTMLInputElement).value)"
                  />

                  <!-- time -->
                  <input
                    v-else-if="question.question_type === 'time'"
                    :value="draftText(form.id, question.id)"
                    type="time"
                    class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    @input="setDraftText(form.id, question.id, ($event.target as HTMLInputElement).value)"
                  />

                  <!-- slider -->
                  <div v-else-if="question.question_type === 'slider'" class="space-y-2">
                    <input
                      :value="draftText(form.id, question.id) || String(question.min_value ?? 0)"
                      type="range"
                      :min="question.min_value ?? 0"
                      :max="question.max_value ?? 100"
                      class="w-full accent-primary"
                      @input="setDraftText(form.id, question.id, String(Number(($event.target as HTMLInputElement).value)))"
                    />
                    <div class="flex justify-between text-xs text-deep-navy/60">
                      <span>{{ question.min_value ?? 0 }}</span>
                      <span class="font-black text-primary">{{ draftText(form.id, question.id) || (question.min_value ?? 0) }}</span>
                      <span>{{ question.max_value ?? 100 }}</span>
                    </div>
                  </div>

                  <!-- rating -->
                  <div v-else-if="question.question_type === 'rating'" class="flex gap-2">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="text-2xl transition-transform hover:scale-110 focus:outline-none"
                      :class="Number(draftText(form.id, question.id) || 0) >= star ? 'text-amber-400' : 'text-deep-navy/20'"
                      @click="setDraftText(form.id, question.id, String(star))"
                    >★</button>
                  </div>

                  <!-- single choice -->
                  <div v-else-if="question.question_type === 'single_choice'" class="space-y-2">
                    <label
                      v-for="option in question.options"
                      :key="option.id"
                      class="flex cursor-pointer items-center gap-2 rounded-lg border border-deep-navy/15 p-2.5 hover:bg-deep-navy/3 transition-colors"
                      :class="{ 'border-primary bg-primary/5': draftChoices(form.id, question.id).includes(option.id!) }"
                    >
                      <input
                        type="radio"
                        :name="`staff-form-${form.id}-q-${question.id}`"
                        :value="option.id"
                        :checked="draftChoices(form.id, question.id).includes(option.id!)"
                        class="h-4 w-4 text-primary border-deep-navy/30 focus:ring-primary/20"
                        @change="setSingleChoice(form.id, question.id, option.id!)"
                      />
                      <span class="text-sm text-deep-navy">{{ option.option_text }}</span>
                    </label>
                  </div>

                  <!-- multiple choice -->
                  <div v-else-if="question.question_type === 'multiple_choice'" class="space-y-2">
                    <label
                      v-for="option in question.options"
                      :key="option.id"
                      class="flex cursor-pointer items-center gap-2 rounded-lg border border-deep-navy/15 p-2.5 hover:bg-deep-navy/3 transition-colors"
                      :class="{ 'border-primary bg-primary/5': draftChoices(form.id, question.id).includes(option.id!) }"
                    >
                      <input
                        type="checkbox"
                        :value="option.id"
                        :checked="draftChoices(form.id, question.id).includes(option.id!)"
                        class="h-4 w-4 rounded text-primary border-deep-navy/30 focus:ring-primary/20"
                        @change="toggleMultiChoice(form.id, question.id, option.id!, ($event.target as HTMLInputElement).checked)"
                      />
                      <span class="text-sm text-deep-navy">{{ option.option_text }}</span>
                    </label>
                  </div>

                  <!-- upload -->
                  <div v-else-if="question.question_type === 'upload'">
                    <div class="rounded-lg border-2 border-dashed border-deep-navy/20 px-4 py-6 text-center">
                      <svg class="mx-auto h-8 w-8 text-deep-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p class="mt-2 text-xs text-deep-navy/50">{{ uploadFileName(form.id, question.id) || 'Choose a file to upload' }}</p>
                      <input
                        :id="`staff-upload-${form.id}-${question.id}`"
                        type="file"
                        class="hidden"
                        @change="onFileChange(form.id, question.id, $event)"
                      />
                      <label
                        :for="`staff-upload-${form.id}-${question.id}`"
                        class="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                      >
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Browse
                      </label>
                    </div>
                  </div>

                  <!-- Required error -->
                  <p
                    v-if="question.required && questionHasError(form.id, question.id)"
                    class="mt-1.5 text-xs font-semibold text-red-600"
                  >This question is required.</p>

                  <!-- Save / Cancel (edit mode) -->
                  <div v-if="editingAnswerId === answerForQuestion(form.id, question.id)?.id" class="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      class="rounded-lg bg-primary px-4 py-1.5 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
                      :disabled="savingAnswerKey === `${form.id}-${question.id}`"
                      @click="saveEditedAnswer(form, question)"
                    >
                      {{ savingAnswerKey === `${form.id}-${question.id}` ? 'Saving…' : 'Save' }}
                    </button>
                    <button
                      type="button"
                      class="rounded-lg px-4 py-1.5 text-xs font-semibold text-deep-navy/70 hover:bg-deep-navy/5 transition-colors"
                      @click="cancelEdit(form.id, question.id)"
                    >Cancel</button>
                  </div>
                  <!-- Save (new answer) -->
                  <div v-else-if="!hasAnswer(form.id, question.id)" class="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      class="rounded-lg bg-primary px-4 py-1.5 text-xs font-black text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
                      :disabled="savingAnswerKey === `${form.id}-${question.id}`"
                      @click="saveNewAnswer(form, question)"
                    >
                      {{ savingAnswerKey === `${form.id}-${question.id}` ? 'Saving…' : 'Save answer' }}
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Footer bar -->
          <div
            v-if="!isFormDetailLoading(form.id) && !answersLoading(form.id)"
            class="flex flex-col gap-2 border-t border-deep-navy/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="text-xs text-deep-navy/50">
              {{ answeredCount(form) }} of {{ formWithQuestions(form.id).question_count ?? (formWithQuestions(form.id).questions?.length ?? 0) }} questions answered
            </div>
            <div class="flex gap-2">
              <button
                v-if="!getResponse(form.id)?.is_complete"
                type="button"
                class="rounded-xl bg-primary px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-primary/90 disabled:opacity-60 active:scale-95 transition-transform"
                :disabled="submittingFormId === form.id"
                @click="markFormComplete(form)"
              >
                {{ submittingFormId === form.id ? 'Saving…' : 'Mark as complete' }}
              </button>
              <button
                v-else
                type="button"
                class="rounded-xl border border-deep-navy/20 px-5 py-2 text-sm font-semibold text-deep-navy/70 hover:bg-deep-navy/5 disabled:opacity-60 transition-colors"
                :disabled="submittingFormId === form.id"
                @click="markFormIncomplete(form)"
              >
                {{ submittingFormId === form.id ? 'Saving…' : 'Mark as incomplete' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEventForms } from '~/composables/resources/events/eventForms'
import { eventFormsRetrieve } from '~/api/sdk.gen'
import type { EventForm as EventFormFull } from '~/api/types.gen'
import {
  useEventFormResponses,
  useCreateEventFormResponse,
  useUpdateEventFormResponse,
  useCreateEventFormResponseAnswer,
  useUpdateEventFormResponseAnswer,
  useDeleteEventFormResponseAnswer,
} from '~/composables/resources/events/eventFormResponses'
import type { EventForm, EventFormQuestion, EventFormResponse, EventFormResponseAnswer } from '~/api/types.gen'

const props = defineProps<{
  eventId: string
  attendeeId: string
}>()

const { $notyf } = useNuxtApp()

// ── Queries ───────────────────────────────────────────────────────────────────

const formsQuery = useEventForms(
  computed(() => ({ event: props.eventId, page_size: 50 })),
)

const allForms = computed(() =>
  (formsQuery.data.value?.data as any)?.results as EventForm[] | undefined ?? [],
)

// Staff view: show published and closed forms (not drafts)
const visibleForms = computed(() =>
  allForms.value.filter(f => f.status === 'published' || f.status === 'closed'),
)

// Pagination — one form at a time
const currentFormIndex = ref(0)
const currentForm = computed(() => visibleForms.value[currentFormIndex.value] ?? null)
watch(visibleForms, () => { currentFormIndex.value = 0 })

// ── Full form detail cache ────────────────────────────────────────────────────

const formDetailsMap = ref<Record<string, EventFormFull>>({})
const formDetailsLoadingSet = ref<Set<string>>(new Set())

async function loadFormDetail(formId: string) {
  if (formDetailsMap.value[formId] || formDetailsLoadingSet.value.has(formId)) return
  formDetailsLoadingSet.value.add(formId)
  try {
    const result = await eventFormsRetrieve({ path: { id: formId } })
    if (result.data) {
      formDetailsMap.value[formId] = result.data
    }
  } catch {
    // Will retry on next render
  } finally {
    formDetailsLoadingSet.value.delete(formId)
  }
}

watch(visibleForms, (forms) => { forms.forEach(f => loadFormDetail(f.id)) }, { immediate: true })

function formWithQuestions(formId: string): EventFormFull {
  return (formDetailsMap.value[formId] ?? allForms.value.find(f => f.id === formId) ?? {}) as EventFormFull
}

function isFormDetailLoading(formId: string): boolean {
  return formDetailsLoadingSet.value.has(formId) && !formDetailsMap.value[formId]
}

// ── Responses ─────────────────────────────────────────────────────────────────

const responsesQuery = useEventFormResponses(
  computed(() =>
    props.attendeeId ? { attendee_id: props.attendeeId, page_size: 50 } : undefined,
  ),
  { enabled: computed(() => !!props.attendeeId) },
)

const allResponses = computed(() =>
  (responsesQuery.data.value?.data as any)?.results as EventFormResponse[] | undefined ?? [],
)

const responseByFormId = computed(() => {
  const map: Record<string, EventFormResponse> = {}
  allResponses.value.forEach(r => { map[r.form] = r })
  return map
})

function getResponse(formId: string): EventFormResponse | undefined {
  return responseByFormId.value[formId]
}

// ── Answers cache ─────────────────────────────────────────────────────────────

const answersByResponseId = ref<Record<string, EventFormResponseAnswer[]>>({})
const answersLoadingSet = ref<Set<string>>(new Set())

async function loadAnswersForResponse(responseId: string) {
  if (answersByResponseId.value[responseId] !== undefined) return
  if (answersLoadingSet.value.has(responseId)) return
  answersLoadingSet.value.add(responseId)
  try {
    const { eventFormResponseAnswersList } = await import('~/api/sdk.gen')
    const result = await eventFormResponseAnswersList({ query: { response: responseId, page_size: 100 } })
    answersByResponseId.value[responseId] = (result.data as any)?.results ?? []
  } catch {
    answersByResponseId.value[responseId] = []
  } finally {
    answersLoadingSet.value.delete(responseId)
  }
}

watch(allResponses, (responses) => { responses.forEach(r => loadAnswersForResponse(r.id)) }, { immediate: true })

function answersForForm(formId: string): EventFormResponseAnswer[] {
  const response = getResponse(formId)
  if (!response) return []
  return answersByResponseId.value[response.id] ?? []
}

function answersLoading(formId: string): boolean {
  const response = getResponse(formId)
  if (!response) return false
  return answersLoadingSet.value.has(response.id)
}

function answerForQuestion(formId: string, questionId: number): EventFormResponseAnswer | undefined {
  return answersForForm(formId).find(a => a.question === questionId)
}

function hasAnswer(formId: string, questionId: number): boolean {
  const a = answerForQuestion(formId, questionId)
  if (!a) return false
  if (a.answer_text?.trim()) return true
  if (a.answer_file_url) return true
  if (a.selected_options?.length) return true
  return false
}

function answeredCount(form: EventForm): number {
  return (formWithQuestions(form.id).questions ?? []).filter(q => hasAnswer(form.id, q.id)).length
}

// ── Draft state ───────────────────────────────────────────────────────────────

const draftTexts = ref<Record<string, string>>({})
const draftChoiceMap = ref<Record<string, number[]>>({})
const uploadFiles = ref<Record<string, File>>({})
const errorKeys = ref<Set<string>>(new Set())

function draftKey(formId: string, questionId: number) {
  return `${formId}:${questionId}`
}

function draftText(formId: string, questionId: number): string {
  return draftTexts.value[draftKey(formId, questionId)] ?? ''
}

function setDraftText(formId: string, questionId: number, value: string) {
  draftTexts.value[draftKey(formId, questionId)] = value
  errorKeys.value.delete(draftKey(formId, questionId))
}

function draftChoices(formId: string, questionId: number): number[] {
  return draftChoiceMap.value[draftKey(formId, questionId)] ?? []
}

function setSingleChoice(formId: string, questionId: number, optionId: number) {
  draftChoiceMap.value[draftKey(formId, questionId)] = [optionId]
  errorKeys.value.delete(draftKey(formId, questionId))
}

function toggleMultiChoice(formId: string, questionId: number, optionId: number, checked: boolean) {
  const current = draftChoices(formId, questionId)
  draftChoiceMap.value[draftKey(formId, questionId)] = checked
    ? [...current, optionId]
    : current.filter(id => id !== optionId)
  errorKeys.value.delete(draftKey(formId, questionId))
}

function uploadFileName(formId: string, questionId: number): string {
  return uploadFiles.value[draftKey(formId, questionId)]?.name ?? ''
}

function onFileChange(formId: string, questionId: number, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    uploadFiles.value[draftKey(formId, questionId)] = file
    errorKeys.value.delete(draftKey(formId, questionId))
  }
}

function questionHasError(formId: string, questionId: number): boolean {
  return errorKeys.value.has(draftKey(formId, questionId))
}

function seedDraftsFromAnswers(formId: string) {
  answersForForm(formId).forEach((answer) => {
    const k = draftKey(formId, answer.question)
    if (answer.answer_text !== undefined) {
      draftTexts.value[k] = answer.answer_text
    }
    if (answer.selected_options?.length) {
      draftChoiceMap.value[k] = answer.selected_options.map(c => c.option)
    }
  })
}

watch(() => allResponses.value, () => {
  allResponses.value.forEach(r => {
    const form = visibleForms.value.find(f => f.id === r.form)
    if (form) seedDraftsFromAnswers(form.id)
  })
})

// ── Edit state ────────────────────────────────────────────────────────────────

const editingAnswerId = ref<string | null>(null)

function beginEditAnswer(formId: string, questionId: number) {
  const answer = answerForQuestion(formId, questionId)
  if (!answer) return
  editingAnswerId.value = answer.id
  if (answer.answer_text !== undefined) {
    draftTexts.value[draftKey(formId, questionId)] = answer.answer_text
  }
  if (answer.selected_options?.length) {
    draftChoiceMap.value[draftKey(formId, questionId)] = answer.selected_options.map(c => c.option)
  }
}

function cancelEdit(formId: string, questionId: number) {
  editingAnswerId.value = null
  const answer = answerForQuestion(formId, questionId)
  if (answer) {
    draftTexts.value[draftKey(formId, questionId)] = answer.answer_text ?? ''
    draftChoiceMap.value[draftKey(formId, questionId)] = answer.selected_options?.map(c => c.option) ?? []
  }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

const createResponse = useCreateEventFormResponse()
const updateResponse = useUpdateEventFormResponse()
const createAnswer = useCreateEventFormResponseAnswer()
const updateAnswer = useUpdateEventFormResponseAnswer()
const deleteAnswer = useDeleteEventFormResponseAnswer()

const startingFormId = ref<string | null>(null)
const submittingFormId = ref<string | null>(null)
const savingAnswerKey = ref<string | null>(null)

async function startFormForAttendee(form: EventForm) {
  if (!props.attendeeId) return
  startingFormId.value = form.id
  try {
    await createResponse.mutateAsync({
      form: form.id,
      attendee: props.attendeeId,
    })
    await responsesQuery.refetch()
    const response = getResponse(form.id)
    if (response) await loadAnswersForResponse(response.id)
  } catch {
    $notyf?.error('Could not create response.')
  } finally {
    startingFormId.value = null
  }
}

function buildAnswerPayload(
  responseId: string,
  question: EventFormQuestion,
): Record<string, unknown> {
  const k = draftKey(question.form as string, question.id)
  if (isChoiceType(question.question_type)) {
    return {
      response: responseId,
      question: question.id,
      selected_options: draftChoiceMap.value[k] ?? [],
    }
  }
  return {
    response: responseId,
    question: question.id,
    answer_text: draftTexts.value[k] ?? '',
  }
}

async function saveNewAnswer(form: EventForm, question: EventFormQuestion) {
  const response = getResponse(form.id)
  if (!response) return
  const k = `${form.id}-${question.id}`
  savingAnswerKey.value = k

  // Validate required
  if (question.required) {
    const choiceVal = draftChoices(form.id, question.id)
    const textVal = draftText(form.id, question.id).trim()
    if (isChoiceType(question.question_type) ? choiceVal.length === 0 : !textVal) {
      errorKeys.value.add(draftKey(form.id, question.id))
      savingAnswerKey.value = null
      return
    }
  }

  try {
    const payload = buildAnswerPayload(response.id, question)
    const result = await createAnswer.mutateAsync(payload as any)
    // Update local cache immediately
    const cached = answersByResponseId.value[response.id] ?? []
    answersByResponseId.value[response.id] = [...cached, result.data as EventFormResponseAnswer]
  } catch {
    $notyf?.error('Failed to save answer.')
  } finally {
    savingAnswerKey.value = null
  }
}

async function saveEditedAnswer(form: EventForm, question: EventFormQuestion) {
  const answer = answerForQuestion(form.id, question.id)
  if (!answer) return
  const k = `${form.id}-${question.id}`
  savingAnswerKey.value = k
  try {
    const dk = draftKey(form.id, question.id)
    const body: Record<string, unknown> = isChoiceType(question.question_type)
      ? { selected_options: draftChoiceMap.value[dk] ?? [] }
      : { answer_text: draftTexts.value[dk] ?? '' }

    const result = await updateAnswer.mutateAsync({ answerId: answer.id, body: body as any })
    // Update local cache
    const responseId = getResponse(form.id)!.id
    answersByResponseId.value[responseId] = (answersByResponseId.value[responseId] ?? []).map(a =>
      a.id === answer.id ? (result.data as EventFormResponseAnswer) : a,
    )
    editingAnswerId.value = null
  } catch {
    $notyf?.error('Failed to update answer.')
  } finally {
    savingAnswerKey.value = null
  }
}

async function removeAnswer(formId: string, questionId: number) {
  const answer = answerForQuestion(formId, questionId)
  if (!answer) return
  try {
    await deleteAnswer.mutateAsync(answer.id)
    const responseId = getResponse(formId)!.id
    answersByResponseId.value[responseId] = (answersByResponseId.value[responseId] ?? []).filter(a => a.id !== answer.id)
    // Clear draft
    delete draftTexts.value[draftKey(formId, questionId)]
    delete draftChoiceMap.value[draftKey(formId, questionId)]
  } catch {
    $notyf?.error('Failed to remove answer.')
  }
}

async function markFormComplete(form: EventForm) {
  const response = getResponse(form.id)
  if (!response) return
  submittingFormId.value = form.id
  try {
    await updateResponse.mutateAsync({ responseId: response.id, body: { is_complete: true } as any })
    await responsesQuery.refetch()
  } catch {
    $notyf?.error('Failed to mark form as complete.')
  } finally {
    submittingFormId.value = null
  }
}

async function markFormIncomplete(form: EventForm) {
  const response = getResponse(form.id)
  if (!response) return
  submittingFormId.value = form.id
  try {
    await updateResponse.mutateAsync({ responseId: response.id, body: { is_complete: false } as any })
    await responsesQuery.refetch()
  } catch {
    $notyf?.error('Failed to mark form as incomplete.')
  } finally {
    submittingFormId.value = null
  }
}

// ── Type helpers ──────────────────────────────────────────────────────────────

function isTextType(type: string | undefined): boolean {
  return ['short_answer', 'long_answer', 'email', 'phone', 'date', 'time'].includes(type ?? '')
}

function isChoiceType(type: string | undefined): boolean {
  return type === 'single_choice' || type === 'multiple_choice'
}

// ── Display helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function formStatusLabel(form: EventForm): string {
  if (form.status === 'published') return 'Published'
  if (form.status === 'closed') return 'Closed'
  return 'Draft'
}

function formStatusBadgeClass(form: EventForm): string {
  if (form.status === 'published')
    return 'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700'
  if (form.status === 'closed')
    return 'inline-flex items-center rounded-full bg-deep-navy/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-deep-navy/60'
  return 'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700'
}
</script>
