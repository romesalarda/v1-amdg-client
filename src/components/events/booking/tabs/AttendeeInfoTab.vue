<template>
  <div class="space-y-4">
    <div v-if="!props.selectedAttendeeId" class="text-sm text-deep-navy/60">Select an attendee from Booking Overview first.</div>
    <div v-else-if="props.attendeeLoading" class="text-sm text-deep-navy/60">Loading attendee...</div>
    <div v-else class="space-y-4">
      <form class="space-y-5" @submit.prevent="props.onSaveAttendee()">
        <section class="rounded-2xl border border-deep-navy/10 bg-white">
          <div class="flex items-center justify-between gap-3 border-b border-deep-navy/10 px-4 py-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Personal info</p>
              <p class="mt-1 text-xs text-deep-navy/60">{{ props.isPersonalInfoEditing ? 'Edit attendee profile details.' : 'Review attendee profile details.' }}</p>
            </div>
            <button
              type="button"
              class="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide"
              :class="props.isPersonalInfoEditing ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-deep-navy/20 bg-white text-deep-navy hover:border-blue-400 hover:text-blue-700'"
              @click="props.onTogglePersonalInfoEdit()"
            >
              {{ props.isPersonalInfoEditing ? 'Stop editing' : 'Edit details' }}
            </button>
          </div>

          <div class="p-4">
            <div v-if="!props.isPersonalInfoEditing" class="space-y-3">
              <div class="rounded-lg border border-deep-navy/10 bg-mist-blue/30 p-3">
                <p class="text-xl font-black text-deep-navy">{{ props.attendeeForm.first_name }} {{ props.attendeeForm.last_name }}</p>
                <p class="mt-1 text-xs text-deep-navy/60">{{ props.attendeeForm.relationship_to_user && props.attendeeForm.relationship_to_user !== 'self' ? props.attendeeForm.relationship_to_user.charAt(0).toUpperCase() + props.attendeeForm.relationship_to_user.slice(1) : 'Self' }}</p>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <div v-if="props.attendeeForm.email" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Email</p>
                  <p class="mt-1 truncate text-sm text-deep-navy">{{ props.attendeeForm.email }}</p>
                </div>
                <div v-if="props.attendeeForm.phone_number" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Phone</p>
                  <p class="mt-1 text-sm text-deep-navy">{{ props.attendeeForm.phone_number }}</p>
                </div>
                <div v-if="props.attendeeForm.date_of_birth" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Date of birth</p>
                  <div class="mt-1 flex items-center justify-between gap-2">
                    <p class="text-sm text-deep-navy">{{ props.attendeeForm.date_of_birth }}</p>
                    <span v-if="attendeeAge !== null" class="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700">
                      {{ attendeeAge }} years old
                    </span>
                  </div>
                </div>
                <div v-if="props.attendeeForm.gender" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Gender</p>
                  <p class="mt-1 text-sm text-deep-navy">{{ props.attendeeForm.gender }}</p>
                </div>
                <div v-if="props.attendeeForm.area_from_name" class="rounded-lg border border-deep-navy/10 bg-white p-3 md:col-span-2">
                  <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Location</p>
                  <p class="mt-1 text-sm text-deep-navy">{{ props.attendeeForm.area_from_name }}</p>
                </div>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-1 text-sm">
                  <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">First name <span class="text-red-500">*</span></span>
                  <input v-model="props.attendeeForm.first_name" :disabled="!props.isPersonalInfoEditing" type="text" required class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                  <p v-if="props.attendeeValidationErrors.first_name" class="text-xs font-semibold text-red-700">{{ props.attendeeValidationErrors.first_name }}</p>
                </label>
                <label class="space-y-1 text-sm">
                  <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Last name <span class="text-red-500">*</span></span>
                  <input v-model="props.attendeeForm.last_name" :disabled="!props.isPersonalInfoEditing" type="text" required class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                  <p v-if="props.attendeeValidationErrors.last_name" class="text-xs font-semibold text-red-700">{{ props.attendeeValidationErrors.last_name }}</p>
                </label>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-1 text-sm">
                  <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Email <span class="text-deep-navy/45">optional</span></span>
                  <input v-model="props.attendeeForm.email" :disabled="!props.isPersonalInfoEditing" type="email" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                  <p v-if="props.attendeeValidationErrors.email" class="text-xs font-semibold text-red-700">{{ props.attendeeValidationErrors.email }}</p>
                </label>
                <label class="space-y-1 text-sm">
                  <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Phone <span class="text-deep-navy/45">optional</span></span>
                  <input v-model="props.attendeeForm.phone_number" :disabled="!props.isPersonalInfoEditing" type="text" placeholder="+44 078328388" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                  <p v-if="props.attendeeValidationErrors.phone_number" class="text-xs font-semibold text-red-700">{{ props.attendeeValidationErrors.phone_number }}</p>
                </label>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-1 text-sm">
                  <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Date of birth <span class="text-red-500">*</span></span>
                  <input v-model="props.attendeeForm.date_of_birth" :disabled="!props.isPersonalInfoEditing" :max="todayDate" type="date" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65">
                  <p v-if="props.attendeeValidationErrors.date_of_birth" class="text-xs font-semibold text-red-700">{{ props.attendeeValidationErrors.date_of_birth }}</p>
                </label>
                <label class="space-y-1 text-sm">
                  <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Gender <span class="text-red-500">*</span></span>
                  <select 
                    v-model="props.attendeeForm.gender"
                    :disabled="!props.isPersonalInfoEditing"
                    class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400 disabled:bg-slate-50 disabled:text-deep-navy/65"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <p v-if="props.attendeeValidationErrors.gender" class="text-xs font-semibold text-red-700">{{ props.attendeeValidationErrors.gender }}</p>
                </label>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-1 text-sm">
                  <span class="text-xs font-black uppercase tracking-wide text-deep-navy/60">Relationship <span class="text-red-500">*</span></span>
                  <select
                    :disabled="!props.isPersonalInfoEditing || props.attendeeForm.relationship_to_user == 'self'"
                    v-model="props.attendeeForm.relationship_to_user"
                    class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm outline-none ring-0 focus:border-blue-400"
                  >
                    <option value="self">Self</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="friend">Friend</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                  <p v-if="props.attendeeValidationErrors.relationship_to_user" class="text-xs font-semibold text-red-700">{{ props.attendeeValidationErrors.relationship_to_user }}</p>
                </label>

                <div class="space-y-2 rounded-2xl border border-deep-navy/10 bg-mist-blue/35 p-4">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy/60">Location <span class="text-red-500">*</span></p>
                    <p class="mt-1 text-xs text-deep-navy/65">Search and select a location for this attendee.</p>
                  </div>
                  <AreaSearchSelect
                    :model-value="props.attendeeForm.area_from || null"
                    :selected-label="props.attendeeForm.area_from_name || null"
                    :has-error="Boolean(props.attendeeValidationErrors.area_from)"
                    placeholder="Search location name (min 2 chars)"
                    @select="onLocationSelected"
                  />
                  <div v-if="props.attendeeForm.area_from" class="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white px-3 py-2.5">
                    <div class="min-w-0">
                      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Selected location</p>
                      <p class="truncate text-sm font-semibold text-blue-900">{{ props.attendeeForm.area_from_name || 'Location selected' }}</p>
                    </div>
                    <button v-if="props.isPersonalInfoEditing" type="button" class="rounded-full border border-blue-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-50" @click="props.onClearAreaFrom()">
                      Clear
                    </button>
                  </div>
                  <p v-if="props.attendeeValidationErrors.area_from" class="text-xs font-semibold text-red-700">{{ props.attendeeValidationErrors.area_from }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-deep-navy/10 bg-mist-blue/20">
          <div class="flex items-center justify-between gap-3 border-b border-deep-navy/10 px-4 py-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Safeguarding</p>
              <p class="mt-1 text-xs text-deep-navy/60">Medical, dietary, accessibility, and emergency records.</p>
            </div>
            <button
              type="button"
              class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700"
              @click="props.onToggleSection('safeguarding')"
            >
              {{ props.attendeeSectionsOpen.safeguarding ? 'Collapse' : 'Expand' }}
            </button>
          </div>

          <div class="p-4">
            <div v-if="!props.attendeeSectionsOpen.safeguarding" class="space-y-3">
              <div v-if="props.attendeeMedicalConditions?.data?.value?.data?.results?.length" class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Medical conditions</p>
                <div class="space-y-2">
                  <div v-for="item in props.attendeeMedicalConditions?.data?.value?.data?.results" :key="item.id" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                    <p class="text-sm font-semibold text-deep-navy">{{ item.condition_details.label }}</p>
                    <p v-if="item.details" class="mt-1 text-xs text-deep-navy/60">{{ item.details }}</p>
                  </div>
                </div>
              </div>
              <div v-if="props.attendeeDietaryRequirements?.data?.value?.data?.results?.length" class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Dietary requirements</p>
                <div class="space-y-2">
                  <div v-for="item in props.attendeeDietaryRequirements?.data?.value?.data?.results" :key="item.id" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                    <p class="text-sm font-semibold text-deep-navy">{{ item.requirement_details.label }}</p>
                    <p v-if="item.details" class="mt-1 text-xs text-deep-navy/60">{{ item.details }}</p>
                  </div>
                </div>
              </div>
              <div v-if="props.attendeeAccessibilityRequirements?.data?.value?.data?.results?.length" class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Accessibility requirements</p>
                <div class="space-y-2">
                  <div v-for="item in props.attendeeAccessibilityRequirements?.data?.value?.data?.results" :key="item.id" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                    <p class="text-sm font-semibold text-deep-navy">{{ item.requirement_details.label }}</p>
                    <p v-if="item.details" class="mt-1 text-xs text-deep-navy/60">{{ item.details }}</p>
                  </div>
                </div>
              </div>
              <div v-if="props.attendeeEmergencyContactList.length" class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Emergency contacts</p>
                <div class="space-y-2">
                  <div v-for="contact in props.attendeeEmergencyContactList" :key="contact.id" class="rounded-lg border border-deep-navy/10 bg-white p-3">
                    <p class="text-sm font-semibold text-deep-navy">{{ contact.full_name }}</p>
                    <p class="mt-1 text-xs text-deep-navy/60">{{ contact.relationship_display }} • {{ contact.phone_number }}</p>
                    <p v-if="contact.email" class="mt-1 truncate text-xs text-deep-navy/60">{{ contact.email }}</p>
                  </div>
                </div>
              </div>
              <p v-if="!props.attendeeMedicalConditions?.data?.value?.data?.results?.length && !props.attendeeDietaryRequirements?.data?.value?.data?.results?.length && !props.attendeeAccessibilityRequirements?.data?.value?.data?.results?.length && !props.attendeeEmergencyContactList.length" class="rounded-lg border border-dashed border-deep-navy/15 bg-white p-4 text-sm text-deep-navy/60">No safeguarding information added yet.</p>
            </div>

            <div v-else class="space-y-5">
              <section class="rounded-2xl border border-deep-navy/10 bg-mist-blue/30 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Medical conditions</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Linked conditions are shown below.</p>
                  </div>
                  <button type="button" class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700" @click="props.onToggleShowMedicalForm()">
                    {{ props.showMedicalForm ? 'Hide form' : 'Add condition' }}
                  </button>
                </div>
                <div class="mt-4 space-y-3">
                  <article v-for="item in props.attendeeMedicalConditions?.data?.value?.data?.results || []" :key="item.id" class="rounded-2xl border border-deep-navy/10 bg-white p-3 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-sm font-black text-deep-navy">{{ item.condition_details.label }}</p>
                        <p class="mt-1 text-xs text-deep-navy/60">{{ item.details || 'No details provided.' }}</p>
                      </div>
                      <button type="button" class="rounded-full border border-red-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50" @click="props.onRemoveMedicalCondition(item.id)">
                        Remove
                      </button>
                    </div>
                  </article>
                  <p v-if="!props.attendeeMedicalConditions?.data?.value?.data?.results?.length" class="rounded-2xl border border-dashed border-deep-navy/15 bg-white p-4 text-sm text-deep-navy/60">No medical conditions linked to this attendee yet.</p>
                </div>
                <div v-if="props.showMedicalForm" class="mt-4 rounded-2xl border border-deep-navy/10 bg-white p-4">
                  <div class="space-y-3">
                    <select v-model.number="props.newMedical.medical_condition" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                      <option :value="null">Select condition</option>
                      <option v-for="item in props.medicalConditions?.data?.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                    </select>
                    <input v-model="props.newMedical.details" type="text" placeholder="Details or notes" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                    <div class="flex justify-end">
                      <button type="button" class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-blue-600" @click="props.onAddMedicalCondition()">
                        Add condition
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-deep-navy/10 bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Dietary requirements</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Linked requirements are shown below. Add new ones only when needed.</p>
                  </div>
                  <button type="button" class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700" @click="props.onToggleShowDietaryForm()">
                    {{ props.showDietaryForm ? 'Hide form' : 'Add requirement' }}
                  </button>
                </div>
                <div class="mt-4 space-y-3">
                  <article v-for="item in props.attendeeDietaryRequirements?.data?.value?.data?.results || []" :key="item.id" class="rounded-2xl border border-deep-navy/10 bg-mist-blue/20 p-3 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-sm font-black text-deep-navy">{{ item.requirement_details.label }}</p>
                        <p class="mt-1 text-xs text-deep-navy/60">{{ item.details || 'No details provided.' }}</p>
                      </div>
                      <button type="button" class="rounded-full border border-red-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50" @click="props.onRemoveDietaryRequirement(item.id)">
                        Remove
                      </button>
                    </div>
                  </article>
                  <p v-if="!props.attendeeDietaryRequirements?.data?.value?.data?.results?.length" class="rounded-2xl border border-dashed border-deep-navy/15 bg-mist-blue/20 p-4 text-sm text-deep-navy/60">No dietary requirements linked to this attendee yet.</p>
                </div>
                <div v-if="props.showDietaryForm" class="mt-4 rounded-2xl border border-deep-navy/10 bg-mist-blue/30 p-4">
                  <div class="space-y-3">
                    <select v-model.number="props.newDietary.dietary_requirement" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                      <option :value="null">Select requirement</option>
                      <option v-for="item in props.dietaryRequirements?.data?.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                    </select>
                    <input v-model="props.newDietary.details" type="text" placeholder="Details or notes" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                    <div class="flex justify-end">
                      <button type="button" class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-blue-600" @click="props.onAddDietaryRequirement()">
                        Add requirement
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-deep-navy/10 bg-mist-blue/25 p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Accessibility requirements</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Linked requirements are shown below. Add new ones only when needed.</p>
                  </div>
                  <button type="button" class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700" @click="props.onToggleShowAccessibilityForm()">
                    {{ props.showAccessibilityForm ? 'Hide form' : 'Add requirement' }}
                  </button>
                </div>
                <div class="mt-4 space-y-3">
                  <article v-for="item in props.attendeeAccessibilityRequirements?.data?.value?.data?.results || []" :key="item.id" class="rounded-2xl border border-deep-navy/10 bg-white p-3 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-sm font-black text-deep-navy">{{ item.requirement_details.label }}</p>
                        <p class="mt-1 text-xs text-deep-navy/60">{{ item.details || 'No details provided.' }}</p>
                      </div>
                      <button type="button" class="rounded-full border border-red-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50" @click="props.onRemoveAccessibilityRequirement(item.id)">
                        Remove
                      </button>
                    </div>
                  </article>
                  <p v-if="!props.attendeeAccessibilityRequirements?.data?.value?.data?.results?.length" class="rounded-2xl border border-dashed border-deep-navy/15 bg-white p-4 text-sm text-deep-navy/60">No accessibility requirements linked to this attendee yet.</p>
                </div>
                <div v-if="props.showAccessibilityForm" class="mt-4 rounded-2xl border border-deep-navy/10 bg-white p-4">
                  <div class="space-y-3">
                    <select v-model.number="props.newAccessibility.accessibility_requirement" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                      <option :value="null">Select requirement</option>
                      <option v-for="item in props.accessibilityRequirements?.data?.value?.data?.results || []" :key="item.id" :value="item.id">{{ item.label }}</option>
                    </select>
                    <input v-model="props.newAccessibility.details" type="text" placeholder="Details or notes" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-sm text-deep-navy shadow-sm">
                    <div class="flex justify-end">
                      <button type="button" class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-blue-600" @click="props.onAddAccessibilityRequirement()">
                        Add requirement
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-deep-navy/10 bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Emergency contacts</p>
                    <p class="mt-1 text-xs text-deep-navy/60">Required for minors and useful for all attendees.</p>
                  </div>
                </div>
                <div class="mt-4 space-y-4">
                  <div class="rounded-2xl border border-deep-navy/10 bg-mist-blue/30 p-4">
                    <div class="grid gap-3 md:grid-cols-2">
                      <label class="space-y-1 text-sm">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">First name</span>
                        <input v-model="props.emergencyContactForm.first_name" type="text" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                      </label>
                      <label class="space-y-1 text-sm">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Last name</span>
                        <input v-model="props.emergencyContactForm.last_name" type="text" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                      </label>
                      <label class="space-y-1 text-sm">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Phone number</span>
                        <input v-model="props.emergencyContactForm.phone_number" type="text" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                      </label>
                      <label class="space-y-1 text-sm">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Relationship</span>
                        <select v-model="props.emergencyContactForm.relationship" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                          <option v-for="option in props.emergencyRelationshipOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                        </select>
                      </label>
                      <label class="space-y-1 text-sm md:col-span-2">
                        <span class="text-[10px] font-black uppercase tracking-wide text-deep-navy/60">Email</span>
                        <input v-model="props.emergencyContactForm.email" type="email" class="w-full rounded-xl border border-deep-navy/15 bg-white px-3 py-2.5 text-deep-navy shadow-sm">
                      </label>
                    </div>
                    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <label class="inline-flex items-center gap-2 text-xs font-semibold text-deep-navy/70">
                        <input v-model="props.emergencyContactForm.primary_contact" type="checkbox" class="h-4 w-4 rounded border-deep-navy/30 text-blue-600">
                        Primary contact
                      </label>
                      <button type="button" class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-blue-600" @click="props.onAddEmergencyContact()">
                        Add contact
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <article v-for="contact in props.attendeeEmergencyContactList" :key="contact.id" class="rounded-2xl border border-deep-navy/10 bg-white p-3 shadow-sm">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-sm font-black text-deep-navy">{{ contact.full_name }}</p>
                          <p class="mt-1 text-xs text-deep-navy/60">{{ contact.relationship_display }} • {{ contact.phone_number }}</p>
                          <p v-if="contact.email" class="mt-1 truncate text-xs text-deep-navy/60">{{ contact.email }}</p>
                        </div>
                        <button type="button" class="rounded-full border border-red-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50" @click="props.onRemoveEmergencyContact(contact.id)">
                          Remove
                        </button>
                      </div>
                    </article>
                    <p v-if="!props.attendeeEmergencyContactList.length" class="rounded-2xl border border-dashed border-deep-navy/15 bg-white p-4 text-sm text-deep-navy/60">No emergency contacts linked yet.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </form>

      <section class="rounded-2xl border border-deep-navy/10 bg-white">
        <div class="flex items-center justify-between gap-3 border-b border-deep-navy/10 px-4 py-3">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Consents</p>
            <p class="mt-1 text-xs text-deep-navy/60">
              <template v-if="props.attendeeSectionsOpen.consents">
                Link or unlink attendee consents here to keep profile setup complete.
              </template>
              <template v-else>
                {{ linkedConsents.length }} linked{{ totalConsentsCount ? ` of ${totalConsentsCount}` : '' }}.
              </template>
            </p>
          </div>
          <button
            type="button"
            class="rounded-full border border-deep-navy/15 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-400 hover:text-blue-700"
            @click="props.onToggleSection('consents')"
          >
            {{ props.attendeeSectionsOpen.consents ? 'Collapse' : 'Expand' }}
          </button>
        </div>

        <div v-if="!props.attendeeSectionsOpen.consents" class="space-y-3 p-4">
          <div v-if="linkedConsents.length" class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                {{ linkedConsents.length }} answered
              </span>
              <span v-if="requiredLinkedCount" class="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                {{ requiredLinkedCount }} required
              </span>
            </div>
            <div class="space-y-2">
              <article
                v-for="consent in linkedConsents"
                :key="consent.id"
                class="rounded-xl border border-deep-navy/10 bg-mist-blue/30 p-3"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-black text-deep-navy">{{ consent.title }}</p>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
                    :class="consent.required ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'"
                  >
                    {{ consent.required ? 'Required' : 'Optional' }}
                  </span>
                </div>
                <p v-if="consent.description" class="mt-1 text-xs text-deep-navy/60">{{ consent.description }}</p>
              </article>
            </div>
          </div>
          <p
            v-else
            class="rounded-xl border border-dashed border-deep-navy/15 bg-mist-blue/30 p-4 text-sm text-deep-navy/60"
          >
            No consents linked yet.
          </p>
        </div>

        <div v-if="props.attendeeSectionsOpen.consents" class="space-y-4 p-4">
          <div v-if="props.eventConsents?.data?.value?.data?.results?.length" class="space-y-3">
            <article v-for="consent in props.eventConsents?.data?.value?.data?.results || []" :key="consent.id" class="rounded-2xl border border-deep-navy/10 bg-white p-4 shadow-sm">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-deep-navy/30 text-blue-600 focus:ring-blue-500"
                  :checked="props.isConsentLinked(consent.id)"
                  @change="props.onToggleConsent(consent.id, ($event.target as HTMLInputElement).checked)"
                >
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-black text-deep-navy">{{ consent.title }}</p>
                    <span class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="consent.required ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'">
                      {{ consent.required ? 'Required' : 'Optional' }}
                    </span>
                    <span class="rounded-full bg-mist-blue px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-deep-navy/70">
                      {{ props.consentToggleLabel(consent.id) }}
                    </span>
                  </div>
                  <p class="mt-2 text-xs text-deep-navy/60">{{ consent.description }}</p>
                </div>
              </label>
            </article>
          </div>
          <p v-else class="rounded-xl border border-dashed border-deep-navy/15 bg-mist-blue/30 p-4 text-sm text-deep-navy/60">No consents are configured for this event yet.</p>
        </div>
      </section>

      <div v-if="props.isPersonalInfoEditing && hasPersonalInfoChanges" class="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 animate-soft-up">
        <div class="rounded-2xl border border-deep-navy/15 bg-white/95 p-3 shadow-2xl backdrop-blur-xl">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs font-black uppercase tracking-[0.22em] text-deep-navy">Unsaved personal info changes</p>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-xl border border-deep-navy/20 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-deep-navy hover:border-blue-500 hover:text-blue-700"
                :disabled="props.attendeeSavePending"
                @click="discardPersonalInfoChanges"
              >
                Discard
              </button>
              <button
                type="button"
                class="rounded-xl bg-deep-navy px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-blue-700 disabled:opacity-55"
                :disabled="props.attendeeSavePending"
                @click="props.onSaveAttendee()"
              >
                {{ props.attendeeSavePending ? 'Saving...' : 'Save changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AreaSearchSelect from '~/components/ui/AreaSearchSelect.vue'

type AreaOption = { label: string; value: number }

const props = defineProps<{
  selectedAttendeeId: string
  attendeeLoading: boolean
  selectedAttendee?: any
  booking?: any
  isPersonalInfoEditing: boolean
  attendeeSectionsOpen: Record<string, boolean>
  attendeeForm: any
  attendeeValidationErrors: Record<string, string>
  areaOptions: AreaOption[]
  areaSearch: string
  areaLookupLoading: boolean
  emergencyContactForm: any
  attendeeEmergencyContactList: any[]
  emergencyRelationshipOptions: Array<{ label: string; value: string }>
  showMedicalForm: boolean
  showDietaryForm: boolean
  showAccessibilityForm: boolean
  attendeeMedicalConditions: any
  attendeeDietaryRequirements: any
  attendeeAccessibilityRequirements: any
  medicalConditions: any
  dietaryRequirements: any
  accessibilityRequirements: any
  newMedical: { medical_condition: number | null; details: string }
  newDietary: { dietary_requirement: number | null; details: string }
  newAccessibility: { accessibility_requirement: number | null; details: string }
  eventConsents: any
  isConsentLinked: (consentId: number) => boolean
  consentToggleLabel: (consentId: number) => string
  onToggleConsent: (consentId: number, checked: boolean) => void | Promise<void>
  onToggleSection: (section: 'personal' | 'safeguarding' | 'consents') => void
  onTogglePersonalInfoEdit: () => void
  onSaveAttendee: () => void | Promise<void>
  onApplyAreaOption: (option: AreaOption) => void
  onClearAreaFrom: () => void
  onAreaSearchChange: (value: string) => void
  attendeeSavePending?: boolean
  onToggleShowMedicalForm: () => void
  onToggleShowDietaryForm: () => void
  onToggleShowAccessibilityForm: () => void
  onAddEmergencyContact: () => void | Promise<void>
  onRemoveEmergencyContact: (contactId: number) => void | Promise<void>
  onAddMedicalCondition: () => void | Promise<void>
  onRemoveMedicalCondition: (conditionId: number) => void | Promise<void>
  onAddDietaryRequirement: () => void | Promise<void>
  onRemoveDietaryRequirement: (requirementId: number) => void | Promise<void>
  onAddAccessibilityRequirement: () => void | Promise<void>
  onRemoveAccessibilityRequirement: (requirementId: number) => void | Promise<void>
}>()

type PersonalInfoSnapshot = {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_birth: string
  gender: string
  relationship_to_user: string
  area_from?: number
  area_from_name: string
}

function toPersonalInfoSnapshot(): PersonalInfoSnapshot {
  return {
    first_name: props.attendeeForm.first_name || '',
    last_name: props.attendeeForm.last_name || '',
    email: props.attendeeForm.email || '',
    phone_number: props.attendeeForm.phone_number || '',
    date_of_birth: props.attendeeForm.date_of_birth || '',
    gender: props.attendeeForm.gender || '',
    relationship_to_user: props.attendeeForm.relationship_to_user || 'self',
    area_from: props.attendeeForm.area_from,
    area_from_name: props.attendeeForm.area_from_name || '',
  }
}

const personalInfoBaseline = ref<PersonalInfoSnapshot>(toPersonalInfoSnapshot())

watch(
  () => [props.selectedAttendeeId, props.isPersonalInfoEditing, props.attendeeLoading] as const,
  ([, isEditing, isLoading], [, wasEditing]) => {
    if (isLoading) return
    if (!isEditing || !wasEditing) {
      personalInfoBaseline.value = toPersonalInfoSnapshot()
    }
  },
)

const hasPersonalInfoChanges = computed(() => {
  const current = toPersonalInfoSnapshot()
  const baseline = personalInfoBaseline.value
  return (
    current.first_name !== baseline.first_name ||
    current.last_name !== baseline.last_name ||
    current.email !== baseline.email ||
    current.phone_number !== baseline.phone_number ||
    current.date_of_birth !== baseline.date_of_birth ||
    current.gender !== baseline.gender ||
    current.relationship_to_user !== baseline.relationship_to_user ||
    current.area_from !== baseline.area_from ||
    current.area_from_name !== baseline.area_from_name
  )
})

function discardPersonalInfoChanges() {
  const baseline = personalInfoBaseline.value
  props.attendeeForm.first_name = baseline.first_name
  props.attendeeForm.last_name = baseline.last_name
  props.attendeeForm.email = baseline.email
  props.attendeeForm.phone_number = baseline.phone_number
  props.attendeeForm.date_of_birth = baseline.date_of_birth
  props.attendeeForm.gender = baseline.gender
  props.attendeeForm.relationship_to_user = baseline.relationship_to_user
  props.attendeeForm.area_from = baseline.area_from
  props.attendeeForm.area_from_name = baseline.area_from_name
  props.onAreaSearchChange(baseline.area_from_name)
  props.onTogglePersonalInfoEdit()
}

function onLocationSelected(value: number, label: string) {
  props.onApplyAreaOption({ value, label })
}

const attendeeAge = computed(() => {
  const rawDob = String(props.attendeeForm.date_of_birth || '').trim()
  if (!rawDob) return null

  const dob = new Date(`${rawDob}T00:00:00`)
  if (Number.isNaN(dob.getTime())) return null

  const now = new Date()
  let years = now.getFullYear() - dob.getFullYear()
  const monthDelta = now.getMonth() - dob.getMonth()
  const dayDelta = now.getDate() - dob.getDate()

  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) {
    years -= 1
  }

  return years >= 0 ? years : null
})

const consentResults = computed(() => {
  return props.eventConsents?.data?.value?.data?.results || []
})

const linkedConsents = computed(() => {
  return consentResults.value.filter((consent: any) => props.isConsentLinked(consent.id))
})

const totalConsentsCount = computed(() => consentResults.value.length)

const requiredLinkedCount = computed(() => {
  return linkedConsents.value.filter((consent: any) => Boolean(consent.required)).length
})

const todayDate = (() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})()
</script>
