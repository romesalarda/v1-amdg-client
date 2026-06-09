<template>
  <div class="space-y-4">
    <!-- Header -->
    <div>
      <h2 class="text-headline-sm font-headline text-deep-navy">Forms</h2>
      <p class="mt-1 text-body-sm font-body-sm text-deep-navy/60">
        Complete the forms required for this event
      </p>
    </div>

    <!-- Loading -->
    <div v-if="formsQuery.isLoading.value" class="flex items-center gap-2 text-sm text-deep-navy/60">
      <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
      Loading forms...
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
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-deep-navy/20 bg-mist-blue/20 py-16 text-center"
    >
      <svg class="h-12 w-12 text-deep-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="mt-3 text-sm font-semibold text-deep-navy/70">No forms available</p>
      <p class="mt-1 text-xs text-deep-navy/50">The event organiser hasn't published any forms yet.</p>
    </div>

    <!-- Forms list -->
    <div v-else class="space-y-4">
      <!-- Pagination nav -->
      <div v-if="visibleForms.length > 1" class="flex items-center justify-between rounded-xl border border-deep-navy/10 bg-white px-4 py-2.5">
        <span class="text-xs font-semibold text-deep-navy/60">
          {{ currentFormIndex + 1 }} / {{ visibleForms.length }}
        </span>
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
        v-for="form in (currentForm ? [currentForm] : [])"
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
                class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-700"
              >
                Required
              </span>
              <span :class="formStatusBadgeClass(form)">
                {{ formStatusLabel(form) }}
              </span>
            </div>
            <p v-if="form.description" class="mt-1 text-xs text-deep-navy/60">
              {{ form.description }}
            </p>
          </div>

          <!-- Completion badge -->
          <div v-if="getResponse(form.id)" class="shrink-0">
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
              v-else
              class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700"
            >
              In Progress
            </span>
          </div>
        </div>

        <!-- Timing info row -->
        <div
          v-if="form.opens_at || form.deadline"
          class="flex flex-wrap gap-3 border-b border-deep-navy/10 bg-deep-navy/2 px-5 py-2.5 text-xs text-deep-navy/60"
        >
          <span v-if="form.opens_at" class="flex items-center gap-1">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Opens {{ formatFormDate(form.opens_at) }}
          </span>
          <span v-if="form.deadline" class="flex items-center gap-1">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deadline {{ formatFormDate(form.deadline) }}
          </span>
        </div>

        <!-- State banners -->

        <!-- Form closed -->
        <div
          v-if="form.status === 'closed'"
          class="flex items-start gap-3 bg-deep-navy/5 px-5 py-4 text-sm text-deep-navy/70"
        >
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-deep-navy/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <div>
            <p class="font-semibold text-deep-navy">This form is closed</p>
            <p class="mt-0.5 text-xs text-deep-navy/60">No further responses are being accepted.</p>
          </div>
        </div>

        <!-- Not yet open -->
        <div
          v-else-if="isFormNotYetOpen(form)"
          class="flex items-start gap-3 bg-sky-50 px-5 py-4 text-sm"
        >
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-semibold text-sky-800">This form isn't open yet</p>
            <p class="mt-0.5 text-xs text-sky-700">
              {{ form.pre_opens_message || `This form opens on ${formatFormDate(form.opens_at)}.` }}
            </p>
          </div>
        </div>

        <!-- Deadline passed -->
        <div
          v-else-if="isDeadlinePassed(form)"
          class="flex items-start gap-3 bg-amber-50 px-5 py-4 text-sm"
        >
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="font-semibold text-amber-800">Submission deadline has passed</p>
            <p class="mt-0.5 text-xs text-amber-700">
              {{ form.deadline_message || `The deadline for this form was ${formatFormDate(form.deadline)}.` }}
            </p>
          </div>
        </div>

        <!-- Active form body -->
        <template v-else-if="form.status === 'published'">
          <!-- No response yet — start button -->
          <div
            v-if="!getResponse(form.id) && !activeFormId"
            class="flex flex-col items-center gap-3 px-5 py-8 text-center"
          >
            <div class="rounded-full bg-primary/10 p-3">
              <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-deep-navy">{{ form.question_count }} question{{ form.question_count !== 1 ? 's' : '' }}</p>
            <button
              type="button"
              class="rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white shadow-sm hover:bg-primary/90 active:scale-95 transition-transform"
              :disabled="startingFormId === form.id"
              @click="startForm(form)"
            >
              {{ startingFormId === form.id ? 'Starting…' : 'Start form' }}
            </button>
          </div>

          <!-- Another form is being filled -->
          <div
            v-else-if="!getResponse(form.id) && activeFormId && activeFormId !== form.id"
            class="px-5 py-6 text-center text-sm text-deep-navy/50"
          >
            Complete the open form above before starting this one.
          </div>

          <!-- Form is being actively filled -->
          <div v-else-if="activeFormId === form.id || getResponse(form.id)">
            <!-- Detail / answers loading -->
            <div
              v-if="isFormDetailLoading(form.id) || answersLoading(form.id)"
              class="flex items-center gap-2 px-5 py-6 text-sm text-deep-navy/60"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
              Loading form…
            </div>

            <!-- Questions -->
            <div v-else class="divide-y divide-deep-navy/8">
              <div
                v-for="question in formWithQuestions(form.id).questions"
                :key="question.id"
                class="px-5 py-4"
              >
                <!-- Question label -->
                <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-sm font-bold text-deep-navy">{{ question.question_title }}</span>
                      <span
                        v-if="question.required"
                        class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-600"
                      >Required</span>
                      <span class="inline-flex items-center rounded-full bg-deep-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-deep-navy/60">
                        {{ question.question_type_display }}
                      </span>
                    </div>
                    <p v-if="question.question_body" class="mt-1 text-xs text-deep-navy/60">
                      {{ question.question_body }}
                    </p>
                  </div>
                </div>

                <!-- Answer display / edit -->
                <div>
                  <!-- Read mode with answer -->
                  <template v-if="hasAnswer(form.id, question.id) && editingAnswerId !== answerForQuestion(form.id, question.id)?.id">
                    <div class="flex items-start gap-2 rounded-lg bg-deep-navy/4 p-3">
                      <div class="min-w-0 flex-1">
                        <!-- Rating answer -->
                        <div v-if="question.question_type === 'rating'" class="flex gap-0.5">
                          <span
                            v-for="star in 5"
                            :key="star"
                            class="text-xl leading-none"
                            :class="Number(answerForQuestion(form.id, question.id)?.answer_text || 0) >= star ? 'text-amber-400' : 'text-deep-navy/20'"
                          >★</span>
                        </div>
                        <!-- Text answer -->
                        <p
                          v-else-if="isTextOrSliderType(question.question_type)"
                          class="text-sm text-deep-navy whitespace-pre-wrap"
                        >
                          {{ answerForQuestion(form.id, question.id)?.answer_text }}
                        </p>
                        <!-- Choice answer -->
                        <div v-else-if="isChoiceType(question.question_type)" class="flex flex-wrap gap-2">
                          <span
                            v-for="choice in answerForQuestion(form.id, question.id)?.selected_options"
                            :key="choice.id"
                            class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                          >
                            {{ choice.option_text }}
                          </span>
                        </div>
                        <!-- Upload answer -->
                        <div v-else-if="question.question_type === 'upload'" class="text-sm">
                          <a
                            v-if="answerForQuestion(form.id, question.id)?.answer_file_url"
                            :href="answerForQuestion(form.id, question.id)?.answer_file_url ?? '#'"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            View uploaded file
                          </a>
                          <p v-else class="text-deep-navy/50 italic">No file uploaded</p>
                        </div>
                      </div>

                      <!-- Inline edit / clear -->
                      <div v-if="canEditResponse(form)" class="flex shrink-0 gap-0.5">
                        <button
                          type="button"
                          title="Edit"
                          class="rounded p-1 text-deep-navy/40 hover:bg-deep-navy/10 hover:text-deep-navy transition-colors"
                          @click="beginEditAnswer(form.id, question.id)"
                        >
                          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Clear"
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

                  <!-- Edit / add answer mode -->
                  <template v-else-if="canEditResponse(form) || !hasAnswer(form.id, question.id)">
                    <!-- Short answer -->
                    <input
                      v-if="question.question_type === 'short_answer' || question.question_type === 'email' || question.question_type === 'phone'"
                      :value="draftText(form.id, question.id)"
                      :type="question.question_type === 'email' ? 'email' : question.question_type === 'phone' ? 'tel' : 'text'"
                      placeholder="Enter your answer"
                      class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      @input="setDraftText(form.id, question.id, ($event.target as HTMLInputElement).value)"
                    />

                    <!-- Long answer -->
                    <textarea
                      v-else-if="question.question_type === 'long_answer'"
                      :value="draftText(form.id, question.id)"
                      rows="4"
                      placeholder="Enter your answer"
                      class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      @input="setDraftText(form.id, question.id, ($event.target as HTMLTextAreaElement).value)"
                    />

                    <!-- Date -->
                    <input
                      v-else-if="question.question_type === 'date'"
                      :value="draftText(form.id, question.id)"
                      type="date"
                      class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      @input="setDraftText(form.id, question.id, ($event.target as HTMLInputElement).value)"
                    />

                    <!-- Time -->
                    <input
                      v-else-if="question.question_type === 'time'"
                      :value="draftText(form.id, question.id)"
                      type="time"
                      class="w-full rounded-lg border border-deep-navy/20 px-3 py-2 text-sm text-deep-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      @input="setDraftText(form.id, question.id, ($event.target as HTMLInputElement).value)"
                    />

                    <!-- Slider -->
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

                    <!-- Rating -->
                    <div v-else-if="question.question_type === 'rating'" class="flex gap-2">
                      <button
                        v-for="star in 5"
                        :key="star"
                        type="button"
                        class="text-2xl transition-transform hover:scale-110 focus:outline-none"
                        :class="Number(draftText(form.id, question.id) || 0) >= star ? 'text-amber-400' : 'text-deep-navy/20'"
                        @click="setDraftText(form.id, question.id, String(star))"
                      >
                        ★
                      </button>
                    </div>

                    <!-- Single choice -->
                    <div v-else-if="question.question_type === 'single_choice'" class="space-y-2">
                      <label
                        v-for="option in question.options"
                        :key="option.id"
                        class="flex cursor-pointer items-center gap-2 rounded-lg border border-deep-navy/15 p-2.5 hover:bg-deep-navy/3 transition-colors"
                        :class="{ 'border-primary bg-primary/5': draftChoices(form.id, question.id).includes(option.id!) }"
                      >
                        <input
                          type="radio"
                          :name="`form-${form.id}-q-${question.id}`"
                          :value="option.id"
                          :checked="draftChoices(form.id, question.id).includes(option.id!)"
                          class="h-4 w-4 text-primary border-deep-navy/30 focus:ring-primary/20"
                          @change="setSingleChoice(form.id, question.id, option.id!)"
                        />
                        <span class="text-sm text-deep-navy">{{ option.option_text }}</span>
                      </label>
                    </div>

                    <!-- Multiple choice -->
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

                    <!-- Upload -->
                    <div v-else-if="question.question_type === 'upload'">
                      <div class="rounded-lg border-2 border-dashed border-deep-navy/20 px-4 py-6 text-center">
                        <svg class="mx-auto h-8 w-8 text-deep-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p class="mt-2 text-xs text-deep-navy/50">
                          {{ uploadFileName(form.id, question.id) || 'Choose a file to upload' }}
                        </p>
                        <input
                          :id="`upload-${form.id}-${question.id}`"
                          type="file"
                          class="hidden"
                          @change="onFileChange(form.id, question.id, $event)"
                        />
                        <label
                          :for="`upload-${form.id}-${question.id}`"
                          class="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                        >
                          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Browse
                        </label>
                      </div>
                    </div>

                    <!-- Required error hint -->
                    <p
                      v-if="question.required && questionHasError(form.id, question.id)"
                      class="mt-1.5 text-xs font-semibold text-red-600"
                    >
                      This question is required.
                    </p>

                    <!-- Save / cancel for edit mode -->
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
                      >
                        Cancel
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- Submit / action bar -->
            <div class="flex flex-col gap-2 border-t border-deep-navy/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="text-xs text-deep-navy/50">
                {{ answeredCount(form) }} of {{ form.question_count }} question{{ form.question_count !== 1 ? 's' : '' }} answered
                <span v-if="requiredUnanswered(form) > 0" class="font-semibold text-red-600">
                  · {{ requiredUnanswered(form) }} required unanswered
                </span>
              </div>

              <div class="flex gap-2">
                <button
                  v-if="!getResponse(form.id)?.is_complete"
                  type="button"
                  class="rounded-xl bg-primary px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-primary/90 disabled:opacity-60 active:scale-95 transition-transform"
                  :disabled="submittingFormId === form.id"
                  @click="submitForm(form)"
                >
                  {{ submittingFormId === form.id ? 'Submitting…' : 'Submit answers' }}
                </button>
                <button
                  v-if="activeFormId === form.id && !getResponse(form.id)?.is_complete"
                  type="button"
                  class="rounded-xl border border-deep-navy/20 px-4 py-2 text-sm font-semibold text-deep-navy/70 hover:bg-deep-navy/5 transition-colors"
                  @click="saveProgress(form)"
                >
                  Save progress
                </button>
              </div>
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
import { useAttendee } from '~/composables/resources/attendee/attendees'
import type { EventForm, EventFormQuestion, EventFormResponse, EventFormResponseAnswer } from '~/api/types.gen'

const props = defineProps<{
  eventId: string
  selectedAttendeeId: string
}>()

const { $notyf } = useNuxtApp()

// Fetch attendee to get integer PK for response creation
const attendeeQuery = useAttendee(computed(() => props.selectedAttendeeId || ''))

// ── Queries ──────────────────────────────────────────────────────────────────

const formsQuery = useEventForms(
  computed(() => ({ event: props.eventId, page_size: 50 })),
)

const allForms = computed(() =>
  (formsQuery.data.value?.data as any)?.results as EventForm[] | undefined ?? [],
)

// Only show published or closed forms (not drafts)
const visibleForms = computed(() =>
  allForms.value.filter(f => f.status === 'published' || f.status === 'closed'),
)

// Pagination — one form at a time
const currentFormIndex = ref(0)
const currentForm = computed(() => visibleForms.value[currentFormIndex.value] ?? null)
watch(visibleForms, () => { currentFormIndex.value = 0 })

// ── Full form detail cache (needed for questions) ─────────────────────────────
// The list endpoint returns EventFormList (no questions). We fetch the full
// detail for each visible form and cache it here.
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
    // leave absent so we can retry
  } finally {
    formDetailsLoadingSet.value.delete(formId)
  }
}

watch(
  visibleForms,
  (forms) => {
    forms.forEach(f => loadFormDetail(f.id))
  },
  { immediate: true },
)

// Returns the full form detail if loaded, otherwise falls back to the list item.
// Cast to EventFormFull so the template can access .questions.
function formWithQuestions(formId: string): EventFormFull {
  return (formDetailsMap.value[formId] ?? allForms.value.find(f => f.id === formId) ?? {}) as EventFormFull
}

function isFormDetailLoading(formId: string): boolean {
  return formDetailsLoadingSet.value.has(formId) && !formDetailsMap.value[formId]
}

// Fetch responses for the current attendee (scoped by attendee UUID)
const responsesQuery = useEventFormResponses(
  computed(() =>
    props.selectedAttendeeId
      ? { attendee_id: props.selectedAttendeeId, page_size: 50 }
      : undefined,
  ),
  { enabled: computed(() => !!props.selectedAttendeeId) },
)

const allResponses = computed(() =>
  (responsesQuery.data.value?.data as any)?.results as EventFormResponse[] | undefined ?? [],
)

// Map formId → response
const responseByFormId = computed(() => {
  const map: Record<string, EventFormResponse> = {}
  allResponses.value.forEach(r => {
    map[r.form] = r
  })
  return map
})

function getResponse(formId: string): EventFormResponse | undefined {
  return responseByFormId.value[formId]
}

// Fetch all answers for this attendee's responses
const responseIds = computed(() =>
  allResponses.value.map(r => r.id),
)

// We load answers per-response lazily — store them in a reactive map keyed by responseId
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

watch(
  allResponses,
  (responses) => {
    responses.forEach(r => loadAnswersForResponse(r.id))
  },
  { immediate: true },
)

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

// ── Draft state ──────────────────────────────────────────────────────────────

// draftTexts: `${formId}:${questionId}` → string
const draftTexts = ref<Record<string, string>>({})
// draftChoices: `${formId}:${questionId}` → number[]
const draftChoiceMap = ref<Record<string, number[]>>({})
// uploadFiles: `${formId}:${questionId}` → File
const uploadFiles = ref<Record<string, File>>({})
// validation error keys
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

// Seed drafts from existing answers when answers load or form starts
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

watch(
  () => allResponses.value,
  () => {
    allResponses.value.forEach(r => {
      const form = visibleForms.value.find(f => f.id === r.form)
      if (form) seedDraftsFromAnswers(form.id)
    })
  },
)

// ── Edit state ───────────────────────────────────────────────────────────────

const editingAnswerId = ref<string | null>(null)

function beginEditAnswer(formId: string, questionId: number) {
  const answer = answerForQuestion(formId, questionId)
  if (!answer) return
  editingAnswerId.value = answer.id
  // Seed draft from existing answer
  if (answer.answer_text !== undefined) {
    draftTexts.value[draftKey(formId, questionId)] = answer.answer_text
  }
  if (answer.selected_options?.length) {
    draftChoiceMap.value[draftKey(formId, questionId)] = answer.selected_options.map(c => c.option)
  }
}

function cancelEdit(formId: string, questionId: number) {
  editingAnswerId.value = null
  // Restore from persisted answer
  const answer = answerForQuestion(formId, questionId)
  if (answer) {
    draftTexts.value[draftKey(formId, questionId)] = answer.answer_text ?? ''
    draftChoiceMap.value[draftKey(formId, questionId)] = answer.selected_options?.map(c => c.option) ?? []
  }
}

// ── Mutations ────────────────────────────────────────────────────────────────

const createResponse = useCreateEventFormResponse()
const updateResponse = useUpdateEventFormResponse()
const createAnswer = useCreateEventFormResponseAnswer()
const updateAnswer = useUpdateEventFormResponseAnswer()
const deleteAnswer = useDeleteEventFormResponseAnswer()

const startingFormId = ref<string | null>(null)
const activeFormId = ref<string | null>(null)
const submittingFormId = ref<string | null>(null)
const savingAnswerKey = ref<string | null>(null)

async function startForm(form: EventForm) {
  if (!props.selectedAttendeeId) {
    $notyf?.error('No attendee selected.')
    return
  }
  startingFormId.value = form.id
  try {
    await createResponse.mutateAsync({
      form: form.id,
      attendee: props.selectedAttendeeId,
    })
    await responsesQuery.refetch()
    const response = getResponse(form.id)
    if (response) {
      await loadAnswersForResponse(response.id)
    }
    activeFormId.value = form.id
  } catch {
    $notyf?.error('Could not start form. Please try again.')
  } finally {
    startingFormId.value = null
  }
}

function validateForm(form: EventForm): boolean {
  const newErrors = new Set<string>()
  for (const question of formWithQuestions(form.id).questions ?? []) {
    if (!question.required) continue
    if (!hasAnswer(form.id, question.id) && !hasDraftValue(form.id, question)) {
      newErrors.add(draftKey(form.id, question.id))
    }
  }
  errorKeys.value = newErrors
  return newErrors.size === 0
}

function hasDraftValue(formId: string, question: EventFormQuestion): boolean {
  const k = draftKey(formId, question.id)
  if (isChoiceType(question.question_type)) {
    return (draftChoiceMap.value[k] ?? []).length > 0
  }
  if (question.question_type === 'upload') {
    return !!uploadFiles.value[k]
  }
  return (draftTexts.value[k] ?? '').trim().length > 0
}

async function persistAnswers(form: EventForm): Promise<void> {
  const response = getResponse(form.id)
  if (!response) return

  const pending: Promise<unknown>[] = []

  for (const question of formWithQuestions(form.id).questions ?? []) {
    const k = draftKey(form.id, question.id)
    const existing = answerForQuestion(form.id, question.id)
    const isChoice = isChoiceType(question.question_type)
    const isUpload = question.question_type === 'upload'

    if (isUpload) {
      const file = uploadFiles.value[k]
      if (!file) continue
      if (existing) {
        // PATCH with file — use FormData via fetch since the SDK uses JSON by default
        pending.push(patchAnswerFile(existing.id, response.id, question.id, file))
      } else {
        pending.push(createAnswerFile(response.id, question.id, file))
      }
      continue
    }

    if (isChoice) {
      const choices = draftChoiceMap.value[k] ?? []
      if (!choices.length && !existing) continue
      if (existing) {
        pending.push(
          updateAnswer.mutateAsync({
            answerId: existing.id,
            body: { response: response.id, question: question.id, selected_option_ids: choices },
          }),
        )
      } else {
        if (!choices.length) continue
        pending.push(
          createAnswer.mutateAsync({
            response: response.id,
            question: question.id,
            selected_option_ids: choices,
          }),
        )
      }
      continue
    }

    const text = (draftTexts.value[k] ?? '').trim()
    if (!text && !existing) continue
    if (existing) {
      pending.push(
        updateAnswer.mutateAsync({
          answerId: existing.id,
          body: { response: response.id, question: question.id, answer_text: text },
        }),
      )
    } else {
      if (!text) continue
      pending.push(
        createAnswer.mutateAsync({
          response: response.id,
          question: question.id,
          answer_text: text,
        }),
      )
    }
  }

  await Promise.all(pending)
  // Reload answers
  await loadAnswersForResponseForce(response.id)
  await responsesQuery.refetch()
}

async function loadAnswersForResponseForce(responseId: string) {
  answersLoadingSet.value.add(responseId)
  try {
    const { eventFormResponseAnswersList } = await import('~/api/sdk.gen')
    const result = await eventFormResponseAnswersList({ query: { response: responseId, page_size: 100 } })
    answersByResponseId.value[responseId] = (result.data as any)?.results ?? []
  } finally {
    answersLoadingSet.value.delete(responseId)
  }
}

async function patchAnswerFile(answerId: string, responseId: string, questionId: number, file: File) {
  const fd = new FormData()
  fd.append('response', responseId)
  fd.append('question', String(questionId))
  fd.append('answer_file', file)
  await $fetch(`/api/event/form-response-answers/${answerId}/`, {
    method: 'PATCH',
    body: fd,
  })
}

async function createAnswerFile(responseId: string, questionId: number, file: File) {
  const fd = new FormData()
  fd.append('response', responseId)
  fd.append('question', String(questionId))
  fd.append('answer_file', file)
  await $fetch('/api/event/form-response-answers/', {
    method: 'POST',
    body: fd,
  })
}

async function saveProgress(form: EventForm) {
  try {
    await persistAnswers(form)
    $notyf?.success('Progress saved.')
  } catch {
    $notyf?.error('Could not save progress.')
  }
}

async function submitForm(form: EventForm) {
  if (!validateForm(form)) {
    $notyf?.error('Please answer all required questions.')
    return
  }
  submittingFormId.value = form.id
  try {
    await persistAnswers(form)
    const response = getResponse(form.id)
    if (response) {
      await updateResponse.mutateAsync({ responseId: response.id, body: { is_complete: true } })
    }
    activeFormId.value = null
    $notyf?.success('Form submitted successfully.')
  } catch {
    $notyf?.error('Could not submit form. Please try again.')
  } finally {
    submittingFormId.value = null
  }
}

async function saveEditedAnswer(form: EventForm, question: EventFormQuestion) {
  const response = getResponse(form.id)
  if (!response) return
  const existing = answerForQuestion(form.id, question.id)
  const k = draftKey(form.id, question.id)
  savingAnswerKey.value = k

  try {
    if (question.question_type === 'upload') {
      const file = uploadFiles.value[k]
      if (file) {
        if (existing) {
          await patchAnswerFile(existing.id, response.id, question.id, file)
        } else {
          await createAnswerFile(response.id, question.id, file)
        }
      }
    } else if (isChoiceType(question.question_type)) {
      const choices = draftChoiceMap.value[k] ?? []
      if (existing) {
        await updateAnswer.mutateAsync({
          answerId: existing.id,
          body: { response: response.id, question: question.id, selected_option_ids: choices },
        })
      }
    } else {
      const text = (draftTexts.value[k] ?? '').trim()
      if (existing) {
        await updateAnswer.mutateAsync({
          answerId: existing.id,
          body: { response: response.id, question: question.id, answer_text: text },
        })
      }
    }
    await loadAnswersForResponseForce(response.id)
    editingAnswerId.value = null
    $notyf?.success('Answer saved.')
  } catch {
    $notyf?.error('Could not save answer.')
  } finally {
    savingAnswerKey.value = null
  }
}

async function removeAnswer(formId: string, questionId: number) {
  const answer = answerForQuestion(formId, questionId)
  if (!answer) return
  try {
    await deleteAnswer.mutateAsync(answer.id)
    const response = getResponse(formId)
    if (response) await loadAnswersForResponseForce(response.id)
    draftTexts.value[draftKey(formId, questionId)] = ''
    draftChoiceMap.value[draftKey(formId, questionId)] = []
    $notyf?.success('Answer cleared.')
  } catch {
    $notyf?.error('Could not clear answer.')
  }
}

// ── Status helpers ───────────────────────────────────────────────────────────

function now() { return new Date() }

function isFormNotYetOpen(form: EventForm): boolean {
  if (!form.opens_at) return false
  return new Date(form.opens_at) > now()
}

function isDeadlinePassed(form: EventForm): boolean {
  if (!form.deadline) return false
  return new Date(form.deadline) < now()
}

function canEditResponse(form: EventForm): boolean {
  if (form.status !== 'published') return false
  if (isFormNotYetOpen(form)) return false
  if (isDeadlinePassed(form)) return false
  return !!form.allow_response_editing || !getResponse(form.id)?.is_complete
}

function formStatusLabel(form: EventForm): string {
  if (form.status === 'closed') return 'Closed'
  if (isFormNotYetOpen(form)) return 'Not yet open'
  if (isDeadlinePassed(form)) return 'Deadline passed'
  return 'Open'
}

function formStatusBadgeClass(form: EventForm): string {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide'
  if (form.status === 'closed') return `${base} bg-deep-navy/10 text-deep-navy/60`
  if (isFormNotYetOpen(form)) return `${base} bg-sky-100 text-sky-700`
  if (isDeadlinePassed(form)) return `${base} bg-amber-100 text-amber-700`
  return `${base} bg-emerald-100 text-emerald-700`
}

function formatFormDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isTextOrSliderType(type: string | undefined): boolean {
  return ['short_answer', 'long_answer', 'slider', 'date', 'time', 'email', 'phone', 'rating'].includes(type ?? '')
}

function isChoiceType(type: string | undefined): boolean {
  return type === 'single_choice' || type === 'multiple_choice'
}

function answeredCount(form: EventForm): number {
  return (formWithQuestions(form.id).questions ?? []).filter(q => hasAnswer(form.id, q.id)).length
}

function requiredUnanswered(form: EventForm): number {
  return (formWithQuestions(form.id).questions ?? []).filter(q => q.required && !hasAnswer(form.id, q.id)).length
}
</script>
