<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data.value?.data">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <!-- Main Content (Left - 8/12 on xl, 12/12 on smaller) -->
      <div class="xl:col-span-8 space-y-6">
        
        <!-- Header Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <!-- Mobile Header -->
          <div class="xl:hidden px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0">
                <img
                  v-if="linkedUserProfile?.profile_picture_url"
                  :src="linkedUserProfile.profile_picture_url"
                  :alt="attendee.data.value?.data?.full_name"
                  class="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20"
                >
                  <UIcon name="i-heroicons-user" class="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <div class="flex-1 min-w-0">
                <h1 class="text-lg font-black text-primary uppercase tracking-wide truncate">
                  {{ attendee.data.value?.data?.full_name || 'Loading...' }}
                </h1>
                <p class="text-xs text-gray-500 mt-0.5">
                  ID: {{ attendee.data.value?.data?.attendee_display_id }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <UBadge v-if="attendee.data.value?.data?.is_minor" color="amber" variant="soft" size="xs">Minor</UBadge>
                  <UBadge v-if="(attendee.data.value?.data as any)?.is_event_staff" color="purple" variant="soft" size="xs">Staff</UBadge>
                  <UBadge v-if="(attendee.data.value?.data as any)?.is_checked_in" color="green" variant="soft" size="xs">✓ Checked In</UBadge>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Header -->
          <div class="hidden xl:block px-5 py-3 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-user" class="w-5 h-5 text-primary" />
              <div>
                <h1 class="text-sm font-black text-primary uppercase tracking-widest">
                  {{ attendee.data.value?.data?.full_name || 'Loading...' }}
                </h1>
                <p class="text-xs text-gray-500 mt-0.5">
                  ID: {{ attendee.data.value?.data?.attendee_display_id }}
                </p>
              </div>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="border-b border-gray-100 bg-gray-50">
            <!-- Mobile Dropdown -->
            <div class="xl:hidden px-5 py-3">
              <select
                v-model="currentTab"
                @change="changeTab(currentTab)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
                  {{ tab.label }}
                </option>
              </select>
            </div>

            <!-- Desktop Tabs -->
            <div class="hidden xl:block px-5 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <nav class="flex gap-6 min-w-max">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="changeTab(tab.id)"
                  :class="[
                    'py-2 px-1 border-b-2 font-semibold text-xs uppercase tracking-wide transition-colors whitespace-nowrap',
                    currentTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  {{ tab.label }}
                </button>
              </nav>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="p-5">
            <!-- Details Tab (Combined: Basic Info + Medical + Dietary + Accessibility + Organisations) -->
            <div v-if="currentTab === 'details'" class="space-y-6 max-h-[800px] overflow-y-auto pr-2">
              <!-- Basic Information Section -->
              <div class="bg-white border border-gray-200 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
                    Basic Information
                  </h3>
                  <UButton
                    v-if="!editingBasicInfo"
                    @click="editingBasicInfo = true"
                    size="xs"
                    color="primary"
                    variant="ghost"
                    icon="i-heroicons-pencil-square"
                  >
                    Edit
                  </UButton>
                </div>

                <!-- View Mode -->
                <div v-if="!editingBasicInfo">
                  <dl class="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Full Name</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ attendee.data.value?.data?.full_name }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Email</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ attendee.data.value?.data?.email || 'N/A' }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Phone</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ attendee.data.value?.data?.phone_number || 'N/A' }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Date of Birth</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ attendee.data.value?.data?.date_of_birth || 'N/A' }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Age</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ attendee.data.value?.data?.age }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Gender</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ attendee.data.value?.data?.gender || 'N/A' }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Relationship</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ attendee.data.value?.data?.relationship_display }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Area From</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ attendee.data.value?.data?.area_from_name || 'N/A' }}</dd>
                    </div>
                  </dl>
                </div>

                <!-- Edit Mode -->
                <form v-else @submit.prevent="handleUpdateBasicInfo" class="space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Name *</label>
                      <input
                        v-model="formData.first_name"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Last Name *</label>
                      <input
                        v-model="formData.last_name"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</label>
                    <input
                      v-model="formData.email"
                      type="email"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number</label>
                    <input
                      v-model="formData.phone_number"
                      type="tel"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Date of Birth</label>
                    <input
                      v-model="formData.date_of_birth"
                      type="date"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Gender</label>
                    <input
                      v-model="formData.gender"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship to User</label>
                    <select
                      v-model="formData.relationship_to_user"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="self">Self</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Area From</label>
                    <select
                      v-model="formData.area_from"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option :value="null">Select area...</option>
                      <option
                        v-for="area in areas.data.value?.data?.results"
                        :key="area.id"
                        :value="area.id"
                      >
                        {{ area.area_name }}
                      </option>
                    </select>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <UButton
                      type="submit"
                      :disabled="updateMutation.isPending.value"
                      size="sm"
                      color="green"
                    >
                      {{ updateMutation.isPending.value ? 'Saving...' : 'Save' }}
                    </UButton>
                    <UButton
                      type="button"
                      @click="cancelEditBasicInfo"
                      size="sm"
                      variant="ghost"
                      color="gray"
                    >
                      Cancel
                    </UButton>
                  </div>
                </form>
              </div>

              <!-- Medical Conditions Section -->
              <div class="bg-white border border-gray-200 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <UIcon name="i-heroicons-heart" class="w-4 h-4" />
                    Medical Conditions
                    <UBadge v-if="attendeeMedicalConditions.data.value?.data?.count" color="primary" variant="soft" size="xs">
                      {{ attendeeMedicalConditions.data.value.data.count }}
                    </UBadge>
                  </h3>
                  <UButton
                    @click="showAddMedicalForm = true"
                    size="xs"
                    color="primary"
                    icon="i-heroicons-plus"
                  >
                    Add
                  </UButton>
                </div>

                <!-- Add Form -->
                <div v-if="showAddMedicalForm && !editingMedicalId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
                  <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Medical Condition</h4>
                  <form @submit.prevent="handleAddMedicalCondition" class="space-y-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Condition *</label>
                      <select
                        v-model="newMedicalCondition.medical_condition"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option :value="null">Select condition...</option>
                        <option
                          v-for="condition in medicalConditions.data.value?.data?.results"
                          :key="condition.id"
                          :value="condition.id"
                        >
                          {{ condition.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Severity</label>
                      <select
                        v-model="newMedicalCondition.severity"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Not specified</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                      <textarea
                        v-model="newMedicalCondition.details"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      ></textarea>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                      <textarea
                        v-model="newMedicalCondition.notes"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      ></textarea>
                    </div>
                    <div class="flex gap-2 pt-2">
                      <UButton
                        type="submit"
                        :disabled="createMedicalMutation.isPending.value"
                        size="sm"
                        color="green"
                      >
                        {{ createMedicalMutation.isPending.value ? 'Adding...' : 'Add' }}
                      </UButton>
                      <UButton
                        type="button"
                        @click="cancelAddMedicalCondition"
                        size="sm"
                        variant="ghost"
                        color="gray"
                      >
                        Cancel
                      </UButton>
                    </div>
                  </form>
                </div>

                <!-- List -->
                <div v-if="medicalConditionsLoading" class="text-center py-4 text-gray-500 text-sm">
                  Loading...
                </div>
                <div v-else-if="!attendeeMedicalConditions.data.value?.data?.results?.length" class="text-center py-4 text-gray-500 text-sm">
                  No medical conditions recorded
                </div>
                <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="condition in attendeeMedicalConditions.data.value?.data?.results"
                    :key="condition.id"
                    class="p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
                  >
                    <!-- Edit Form -->
                    <div v-if="editingMedicalId === condition.id">
                      <form @submit.prevent="handleUpdateMedicalCondition" class="space-y-3">
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Condition *</label>
                          <select
                            v-model="newMedicalCondition.medical_condition"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            <option :value="null">Select condition...</option>
                            <option
                              v-for="cond in medicalConditions.data.value?.data?.results"
                              :key="cond.id"
                              :value="cond.id"
                            >
                              {{ cond.label }}
                            </option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Severity</label>
                          <select
                            v-model="newMedicalCondition.severity"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            <option value="">Not specified</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                          <textarea
                            v-model="newMedicalCondition.details"
                            rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          ></textarea>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                          <textarea
                            v-model="newMedicalCondition.notes"
                            rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          ></textarea>
                        </div>
                        <div class="flex gap-2 pt-2">
                          <UButton
                            type="submit"
                            :disabled="updateMedicalMutation.isPending.value"
                            size="sm"
                            color="green"
                          >
                            {{ updateMedicalMutation.isPending.value ? 'Updating...' : 'Update' }}
                          </UButton>
                          <UButton
                            type="button"
                            @click="cancelEditMedicalCondition"
                            size="sm"
                            variant="ghost"
                            color="gray"
                          >
                            Cancel
                          </UButton>
                        </div>
                      </form>
                    </div>

                    <!-- Display Mode -->
                    <div v-else class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 text-sm">{{ condition.condition_details.label }}</h4>
                        <div class="mt-1 space-y-1">
                          <p v-if="condition.severity" class="text-xs text-gray-600">
                            <span class="font-bold uppercase tracking-wide">Severity:</span>
                            <span :class="{
                              'text-yellow-600': condition.severity === 'mild',
                              'text-orange-600': condition.severity === 'moderate',
                              'text-red-600': condition.severity === 'severe'
                            }">
                              {{ condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1) }}
                            </span>
                          </p>
                          <p v-if="condition.details" class="text-xs text-gray-600">
                            <span class="font-bold uppercase tracking-wide">Details:</span> {{ condition.details }}
                          </p>
                          <p v-if="condition.notes" class="text-xs text-gray-600">
                            <span class="font-bold uppercase tracking-wide">Notes:</span> {{ condition.notes }}
                          </p>
                        </div>
                      </div>
                      <div class="flex gap-1">
                        <UButton
                          @click="editMedicalCondition(condition)"
                          size="xs"
                          color="primary"
                          variant="ghost"
                          icon="i-heroicons-pencil-square"
                        />
                        <UButton
                          @click="deleteMedicalCondition(condition.id)"
                          size="xs"
                          color="red"
                          variant="ghost"
                          icon="i-heroicons-trash"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dietary Requirements Section -->
              <div class="bg-white border border-gray-200 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <UIcon name="i-heroicons-cake" class="w-4 h-4" />
                    Dietary Requirements
                    <UBadge v-if="attendeeDietaryRequirements.data.value?.data?.count" color="primary" variant="soft" size="xs">
                      {{ attendeeDietaryRequirements.data.value.data.count }}
                    </UBadge>
                  </h3>
                  <UButton
                    @click="showAddDietaryForm = true"
                    size="xs"
                    color="primary"
                    icon="i-heroicons-plus"
                  >
                    Add
                  </UButton>
                </div>

                <!-- Add Form -->
                <div v-if="showAddDietaryForm && !editingDietaryId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
                  <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Dietary Requirement</h4>
                  <form @submit.prevent="handleAddDietaryRequirement" class="space-y-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Requirement *</label>
                      <select
                        v-model="newDietaryRequirement.dietary_requirement"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option :value="null">Select requirement...</option>
                        <option
                          v-for="requirement in dietaryRequirements.data.value?.data?.results"
                          :key="requirement.id"
                          :value="requirement.id"
                        >
                          {{ requirement.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                      <textarea
                        v-model="newDietaryRequirement.details"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      ></textarea>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                      <textarea
                        v-model="newDietaryRequirement.notes"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      ></textarea>
                    </div>
                    <div class="flex gap-2 pt-2">
                      <UButton
                        type="submit"
                        :disabled="createDietaryMutation.isPending.value"
                        size="sm"
                        color="green"
                      >
                        {{ createDietaryMutation.isPending.value ? 'Adding...' : 'Add' }}
                      </UButton>
                      <UButton
                        type="button"
                        @click="cancelAddDietaryRequirement"
                        size="sm"
                        variant="ghost"
                        color="gray"
                      >
                        Cancel
                      </UButton>
                    </div>
                  </form>
                </div>

                <!-- List -->
                <div v-if="dietaryRequirementsLoading" class="text-center py-4 text-gray-500 text-sm">
                  Loading...
                </div>
                <div v-else-if="!attendeeDietaryRequirements.data.value?.data?.results?.length" class="text-center py-4 text-gray-500 text-sm">
                  No dietary requirements recorded
                </div>
                <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="requirement in attendeeDietaryRequirements.data.value?.data?.results"
                    :key="requirement.id"
                    class="p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
                  >
                    <!-- Edit Form -->
                    <div v-if="editingDietaryId === requirement.id">
                      <form @submit.prevent="handleUpdateDietaryRequirement" class="space-y-3">
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Requirement *</label>
                          <select
                            v-model="newDietaryRequirement.dietary_requirement"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            <option :value="null">Select requirement...</option>
                            <option
                              v-for="req in dietaryRequirements.data.value?.data?.results"
                              :key="req.id"
                              :value="req.id"
                            >
                              {{ req.label }}
                            </option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                          <textarea
                            v-model="newDietaryRequirement.details"
                            rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          ></textarea>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                          <textarea
                            v-model="newDietaryRequirement.notes"
                            rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          ></textarea>
                        </div>
                        <div class="flex gap-2 pt-2">
                          <UButton
                            type="submit"
                            :disabled="updateDietaryMutation.isPending.value"
                            size="sm"
                            color="green"
                          >
                            {{ updateDietaryMutation.isPending.value ? 'Updating...' : 'Update' }}
                          </UButton>
                          <UButton
                            type="button"
                            @click="cancelEditDietaryRequirement"
                            size="sm"
                            variant="ghost"
                            color="gray"
                          >
                            Cancel
                          </UButton>
                        </div>
                      </form>
                    </div>

                    <!-- Display Mode -->
                    <div v-else class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 text-sm">{{ requirement.requirement_details.label }}</h4>
                        <div class="mt-1 space-y-1">
                          <p v-if="requirement.details" class="text-xs text-gray-600">
                            <span class="font-bold uppercase tracking-wide">Details:</span> {{ requirement.details }}
                          </p>
                          <p v-if="requirement.notes" class="text-xs text-gray-600">
                            <span class="font-bold uppercase tracking-wide">Notes:</span> {{ requirement.notes }}
                          </p>
                        </div>
                      </div>
                      <div class="flex gap-1">
                        <UButton
                          @click="editDietaryRequirement(requirement)"
                          size="xs"
                          color="primary"
                          variant="ghost"
                          icon="i-heroicons-pencil-square"
                        />
                        <UButton
                          @click="deleteDietaryRequirement(requirement.id)"
                          size="xs"
                          color="red"
                          variant="ghost"
                          icon="i-heroicons-trash"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Accessibility Requirements Section -->
              <div class="bg-white border border-gray-200 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <UIcon name="i-heroicons-hand-raised" class="w-4 h-4" />
                    Accessibility Requirements
                    <UBadge v-if="attendeeAccessibilityRequirements.data.value?.data?.count" color="primary" variant="soft" size="xs">
                      {{ attendeeAccessibilityRequirements.data.value.data.count }}
                    </UBadge>
                  </h3>
                  <UButton
                    @click="showAddAccessibilityForm = true"
                    size="xs"
                    color="primary"
                    icon="i-heroicons-plus"
                  >
                    Add
                  </UButton>
                </div>

                <!-- Add Form -->
                <div v-if="showAddAccessibilityForm && !editingAccessibilityId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
                  <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Accessibility Requirement</h4>
                  <form @submit.prevent="handleAddAccessibilityRequirement" class="space-y-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Requirement *</label>
                      <select
                        v-model="newAccessibilityRequirement.accessibility_requirement"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option :value="null">Select requirement...</option>
                        <option
                          v-for="requirement in accessibilityRequirements.data.value?.data?.results"
                          :key="requirement.id"
                          :value="requirement.id"
                        >
                          {{ requirement.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                      <textarea
                        v-model="newAccessibilityRequirement.details"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      ></textarea>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                      <textarea
                        v-model="newAccessibilityRequirement.notes"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      ></textarea>
                    </div>
                    <div class="flex gap-2 pt-2">
                      <UButton
                        type="submit"
                        :disabled="createAccessibilityMutation.isPending.value"
                        size="sm"
                        color="green"
                      >
                        {{ createAccessibilityMutation.isPending.value ? 'Adding...' : 'Add' }}
                      </UButton>
                      <UButton
                        type="button"
                        @click="cancelAddAccessibilityRequirement"
                        size="sm"
                        variant="ghost"
                        color="gray"
                      >
                        Cancel
                      </UButton>
                    </div>
                  </form>
                </div>

                <!-- List -->
                <div v-if="accessibilityRequirementsLoading" class="text-center py-4 text-gray-500 text-sm">
                  Loading...
                </div>
                <div v-else-if="!attendeeAccessibilityRequirements.data.value?.data?.results?.length" class="text-center py-4 text-gray-500 text-sm">
                  No accessibility requirements recorded
                </div>
                <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="requirement in attendeeAccessibilityRequirements.data.value?.data?.results"
                    :key="requirement.id"
                    class="p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
                  >
                    <!-- Edit Form -->
                    <div v-if="editingAccessibilityId === requirement.id">
                      <form @submit.prevent="handleUpdateAccessibilityRequirement" class="space-y-3">
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Requirement *</label>
                          <select
                            v-model="newAccessibilityRequirement.accessibility_requirement"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            <option :value="null">Select requirement...</option>
                            <option
                              v-for="req in accessibilityRequirements.data.value?.data?.results"
                              :key="req.id"
                              :value="req.id"
                            >
                              {{ req.label }}
                            </option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                          <textarea
                            v-model="newAccessibilityRequirement.details"
                            rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          ></textarea>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                          <textarea
                            v-model="newAccessibilityRequirement.notes"
                            rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          ></textarea>
                        </div>
                        <div class="flex gap-2 pt-2">
                          <UButton
                            type="submit"
                            :disabled="updateAccessibilityMutation.isPending.value"
                            size="sm"
                            color="green"
                          >
                            {{ updateAccessibilityMutation.isPending.value ? 'Updating...' : 'Update' }}
                          </UButton>
                          <UButton
                            type="button"
                            @click="cancelEditAccessibilityRequirement"
                            size="sm"
                            variant="ghost"
                            color="gray"
                          >
                            Cancel
                          </UButton>
                        </div>
                      </form>
                    </div>

                    <!-- Display Mode -->
                    <div v-else class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 text-sm">{{ requirement.requirement_details.label }}</h4>
                        <div class="mt-1 space-y-1">
                          <p v-if="requirement.details" class="text-xs text-gray-600">
                            <span class="font-bold uppercase tracking-wide">Details:</span> {{ requirement.details }}
                          </p>
                          <p v-if="requirement.notes" class="text-xs text-gray-600">
                            <span class="font-bold uppercase tracking-wide">Notes:</span> {{ requirement.notes }}
                          </p>
                        </div>
                      </div>
                      <div class="flex gap-1">
                        <UButton
                          @click="editAccessibilityRequirement(requirement)"
                          size="xs"
                          color="primary"
                          variant="ghost"
                          icon="i-heroicons-pencil-square"
                        />
                        <UButton
                          @click="deleteAccessibilityRequirement(requirement.id)"
                          size="xs"
                          color="red"
                          variant="ghost"
                          icon="i-heroicons-trash"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Organisation Section -->
              <div class="bg-white border border-gray-200 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <UIcon name="i-heroicons-building-office" class="w-4 h-4" />
                    Organisation
                  </h3>
                </div>

                <div v-if="attendeeOrganisations.isLoading.value" class="text-center py-4 text-gray-500 text-sm">
                  Loading...
                </div>
                <div v-else>
                  <!-- Current Organisation -->
                  <div v-if="attendeeOrganisations.data.value?.data?.results?.length">
                    <div
                      v-for="org in attendeeOrganisations.data.value.data.results"
                      :key="org.id"
                      class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div class="flex items-start justify-between">
                        <div>
                          <h4 class="text-sm font-semibold text-gray-900">{{ org.organisation_title }}</h4>
                          <p class="text-xs text-gray-600 mt-1">
                            Added: {{ new Date(org.added_at).toLocaleString() }}
                          </p>
                          <p v-if="org.added_by_name" class="text-xs text-gray-600">
                            By: {{ org.added_by_name }}
                          </p>
                        </div>
                        <div class="flex gap-1">
                          <UButton
                            @click="showChangeOrganisation = true"
                            size="xs"
                            color="primary"
                            variant="outline"
                            icon="i-heroicons-arrow-path"
                          >
                            Change
                          </UButton>
                          <UButton
                            @click="removeOrganisation(org.id)"
                            size="xs"
                            color="red"
                            variant="ghost"
                            icon="i-heroicons-trash"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-4 text-gray-500 text-sm">
                    <p>No organisation assigned</p>
                    <UButton
                      @click="showChangeOrganisation = true"
                      size="sm"
                      color="primary"
                      class="mt-2"
                      icon="i-heroicons-plus"
                    >
                      Assign Organisation
                    </UButton>
                  </div>

                  <!-- Change Organisation Form -->
                  <div v-if="showChangeOrganisation" class="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-3">
                    <h4 class="text-xs font-black text-primary uppercase tracking-widest mb-3">Change Organisation</h4>
                    <form @submit.prevent="handleChangeOrganisation" class="space-y-3">
                      <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Select Organisation *</label>
                        <select
                          v-model="selectedOrganisation"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option :value="null">Choose an organisation...</option>
                          <option
                            v-for="org in organisations.data.value?.data?.results"
                            :key="org.id"
                            :value="org.id"
                          >
                            {{ org.title }}
                          </option>
                        </select>
                      </div>
                      <div class="flex gap-2">
                        <UButton
                          type="submit"
                          :disabled="createOrganisationMutation.isPending.value"
                          size="sm"
                          color="primary"
                        >
                          {{ createOrganisationMutation.isPending.value ? 'Saving...' : 'Save' }}
                        </UButton>
                        <UButton
                          type="button"
                          @click="showChangeOrganisation = false; selectedOrganisation = null"
                          size="sm"
                          variant="ghost"
                          color="gray"
                        >
                          Cancel
                        </UButton>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <!-- Booking Tab -->
            <div v-if="currentTab === 'booking'">
              <div v-if="booking.isLoading.value" class="text-center py-8 text-gray-500 text-sm">
                Loading booking...
              </div>
              <div v-else-if="!attendee.data.value?.data?.booking || !booking.data.value?.data" class="text-center py-8 text-gray-500 text-sm">
                <UIcon name="i-heroicons-exclamation-circle" class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No booking linked to this attendee</p>
              </div>
              <div v-else class="space-y-4">
                <!-- Booking Details -->
                <div>
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Booking Details</h3>
                  <dl class="grid grid-cols-2 gap-3">
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Booking Reference</dt>
                      <dd class="mt-0.5 text-sm text-gray-900 font-mono">{{ booking.data.value.data.booking_reference }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Booked At</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ new Date(booking.data.value.data.booked_at).toLocaleString() }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Made By</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ booking.data.value.data.made_by_name || 'N/A' }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs font-semibold text-gray-500 uppercase">Attendee Count</dt>
                      <dd class="mt-0.5 text-sm text-gray-900">{{ booking.data.value.data.attendee_count }}</dd>
                    </div>
                  </dl>
                </div>

                <!-- Payment Information -->
                <div v-if="booking.data.value.data.payments?.length" class="pt-4 border-t border-gray-200">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Payment Information</h3>
                  <div class="space-y-2">
                    <div v-for="payment in booking.data.value.data.payments" :key="payment.payment_id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p class="text-xs font-semibold text-gray-900">{{ payment.payment_reference }}</p>
                        <p class="text-xs text-gray-600">{{ payment.original_amount }} -> {{ payment.final_amount }}</p>
                      </div>
                      <div class="flex">
                          <UBadge
                          :color="payment.status === 'COMPLETED' ? 'green' : payment.status === 'PENDING' ? 'amber' : 'red'"
                          variant="soft"
                          size="xs"
                        >
                          {{ payment.status }}
                        </UBadge>
                        <NuxtLink
                          :to="`/events/${eventId}/m/payments/list?search=${payment.payment_reference}`"
                          class="ml-4 text-xs text-primary hover:underline"
                        >
                          View Payment
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Ticket Information -->
                <div v-if="booking.data.value.data.tickets?.length" class="pt-4 border-t border-gray-200">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Tickets</h3>
                  <div class="space-y-2">
                    <div v-for="ticket in booking.data.value.data.tickets" :key="ticket.ticket_id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p class="text-xs font-semibold text-gray-900 font-mono">{{ ticket.ticket_code }}</p>
                        <p class="text-xs text-gray-600">{{ ticket.attendee_name }}</p>
                      </div>
                      <UBadge
                        :color="ticket.status === 'ACTIVE' ? 'green' : 'gray'"
                        variant="soft"
                        size="xs"
                      >
                        {{ ticket.status }}
                      </UBadge>
                    </div>
                  </div>
                </div>

                <!-- Other Attendees -->
                <div v-if="booking.data.value.data.attendees?.length > 1" class="pt-4 border-t border-gray-200">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Other Attendees in this Booking</h3>
                  <div class="space-y-2">
                    <NuxtLink
                      v-for="siblingAttendee in booking.data.value.data.attendees.filter((a: any) => a.id !== attendeeId)"
                      :key="siblingAttendee.id"
                      :to="`/events/${eventId}/m/participants/editor/${siblingAttendee.id}`"
                      class="block p-2 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <p class="text-xs font-semibold text-primary">{{ siblingAttendee.name }}</p>
                      <p class="text-xs text-gray-600">{{ siblingAttendee.display_id }}</p>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>

            <!-- Emergency Contacts Tab -->
            <div v-if="currentTab === 'emergency'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Emergency Contacts</h3>
                <UButton
                  @click="showAddEmergencyForm = true"
                  size="sm"
                  color="primary"
                  icon="i-heroicons-plus"
                >
                  Add Contact
                </UButton>
              </div>

              <!-- Add Form -->
              <div v-if="showAddEmergencyForm && !editingEmergencyId" class="bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-200">
                <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Emergency Contact</h4>
                <form @submit.prevent="handleAddEmergencyContact" class="space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Name *</label>
                      <input
                        v-model="newEmergencyContact.first_name"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Last Name *</label>
                      <input
                        v-model="newEmergencyContact.last_name"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship *</label>
                    <select
                      v-model="newEmergencyContact.relationship"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select relationship...</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="spouse">Spouse</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number *</label>
                    <input
                      v-model="newEmergencyContact.phone_number"
                      type="tel"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</label>
                    <input
                      v-model="newEmergencyContact.email"
                      type="email"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div class="flex items-center">
                    <input
                      v-model="newEmergencyContact.primary_contact"
                      type="checkbox"
                      id="primary-new"
                      class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                    />
                    <label for="primary-new" class="ml-2 text-xs font-medium text-gray-700">Primary Contact</label>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <UButton
                      type="submit"
                      :disabled="createEmergencyMutation.isPending.value"
                      size="sm"
                      color="green"
                    >
                      {{ createEmergencyMutation.isPending.value ? 'Adding...' : 'Add' }}
                    </UButton>
                    <UButton
                      type="button"
                      @click="cancelAddEmergencyContact"
                      size="sm"
                      variant="ghost"
                      color="gray"
                    >
                      Cancel
                    </UButton>
                  </div>
                </form>
              </div>

              <!-- List -->
              <div v-if="emergencyContactsLoading" class="text-center py-8 text-gray-500 text-sm">
                Loading emergency contacts...
              </div>
              <div v-else-if="!emergencyContacts.data.value?.data?.results?.length" class="text-center py-8 text-gray-500 text-sm">
                No emergency contacts recorded
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="contact in emergencyContacts.data.value?.data?.results"
                  :key="contact.id"
                  class="p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
                >
                  <!-- Edit Form -->
                  <div v-if="editingEmergencyId === contact.id">
                    <form @submit.prevent="handleUpdateEmergencyContact" class="space-y-3">
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Name *</label>
                          <input
                            v-model="newEmergencyContact.first_name"
                            type="text"
          required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Last Name *</label>
                          <input
                            v-model="newEmergencyContact.last_name"
                            type="text"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship *</label>
                        <select
                          v-model="newEmergencyContact.relationship"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">Select relationship...</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="child">Child</option>
                          <option value="spouse">Spouse</option>
                          <option value="friend">Friend</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Phone Number *</label>
                        <input
                          v-model="newEmergencyContact.phone_number"
                          type="tel"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email</label>
                        <input
                          v-model="newEmergencyContact.email"
                          type="email"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div class="flex items-center">
                        <input
                          v-model="newEmergencyContact.primary_contact"
                          type="checkbox"
                          id="primary-edit"
                          class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                        />
                        <label for="primary-edit" class="ml-2 text-xs font-medium text-gray-700">Primary Contact</label>
                      </div>
                      <div class="flex gap-2 pt-2">
                        <UButton
                          type="submit"
                          :disabled="updateEmergencyMutation.isPending.value"
                          size="sm"
                          color="green"
                        >
                          {{ updateEmergencyMutation.isPending.value ? 'Updating...' : 'Update' }}
                        </UButton>
                        <UButton
                          type="button"
                          @click="cancelEditEmergencyContact"
                          size="sm"
                          variant="ghost"
                          color="gray"
                        >
                          Cancel
                        </UButton>
                      </div>
                    </form>
                  </div>

                  <!-- Display Mode -->
                  <div v-else class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <h4 class="font-semibold text-gray-900 text-sm">{{ contact.full_name }}</h4>
                        <UBadge v-if="contact.primary_contact" color="primary" size="xs">
                          Primary
                        </UBadge>
                      </div>
                      <div class="mt-2 space-y-1">
                        <p class="text-xs text-gray-600">
                          <span class="font-bold uppercase tracking-wide">Relationship:</span> {{ contact.relationship_display }}
                        </p>
                        <p class="text-xs text-gray-600">
                          <span class="font-bold uppercase tracking-wide">Phone:</span> {{ contact.phone_number }}
                        </p>
                        <p v-if="contact.email" class="text-xs text-gray-600">
                          <span class="font-bold uppercase tracking-wide">Email:</span> {{ contact.email }}
                        </p>
                      </div>
                    </div>
                    <div class="flex gap-1">
                      <UButton
                        @click="editEmergencyContact(contact)"
                        size="xs"
                        color="primary"
                        variant="ghost"
                        icon="i-heroicons-pencil-square"
                      />
                      <UButton
                        @click="deleteEmergencyContact(contact.id)"
                        size="xs"
                        color="red"
                        variant="ghost"
                        icon="i-heroicons-trash"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Consents Tab -->
            <div v-if="currentTab === 'consents'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Consents</h3>
                <div class="flex gap-2">
                  <UButton
                    @click="markAllRequiredConsentsAsGiven"
                    size="xs"
                    color="green"
                    variant="outline"
                    icon="i-heroicons-check-circle"
                  >
                    Mark All Required
                  </UButton>
                  <UButton
                    @click="showAddConsentForm = true"
                    size="xs"
                    color="primary"
                    icon="i-heroicons-plus"
                  >
                    Add Consent
                  </UButton>
                </div>
              </div>

              <!-- Add Form -->
              <div v-if="showAddConsentForm" class="bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-200">
                <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Consent</h4>
                <form @submit.prevent="handleAddConsent" class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Consent *</label>
                    <select
                      v-model="newConsent.consent"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option :value="null">Select consent...</option>
                      <option
                        v-for="consent in eventConsents.data.value?.data?.results"
                        :key="consent.id"
                        :value="consent.id"
                      >
                        {{ consent.title }} {{ consent.required ? '(Required)' : '' }}
                      </option>
                    </select>
                  </div>
                  <div class="flex items-center">
                    <input
                      v-model="newConsent.consent_given"
                      type="checkbox"
                      id="consent-given-new"
                      class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                    />
                    <label for="consent-given-new" class="ml-2 text-xs font-medium text-gray-700">Consent Given</label>
                  </div>
                  <div class="flex gap-2 pt-2">
                    <UButton
                      type="submit"
                      :disabled="createConsentMutation.isPending.value"
                      size="sm"
                      color="green"
                    >
                      {{ createConsentMutation.isPending.value ? 'Adding...' : 'Add' }}
                    </UButton>
                    <UButton
                      type="button"
                      @click="cancelAddConsent"
                      size="sm"
                      variant="ghost"
                      color="gray"
                    >
                      Cancel
                    </UButton>
                  </div>
                </form>
              </div>

              <!-- List -->
              <div v-if="attendeeConsents.isLoading.value" class="text-center py-8 text-gray-500 text-sm">
                Loading consents...
              </div>
              <div v-else-if="!attendeeConsents.data.value?.data?.results?.length" class="text-center py-8 text-gray-500 text-sm">
                No consents recorded
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="consentRecord in attendeeConsents.data.value?.data?.results"
                  :key="consentRecord.id"
                  class="p-4 border border-gray-200 rounded-lg bg-gray-50/30"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h4 class="font-semibold text-gray-900 text-sm">{{ consentRecord.consent_details.title }}</h4>
                        <UBadge v-if="consentRecord.consent_details.required" color="red" variant="soft" size="xs">
                          Required
                        </UBadge>
                      </div>
                      <div class="flex items-center gap-2 mb-2">
                        <UButton
                          @click="toggleConsentGiven(consentRecord)"
                          :disabled="partialUpdateConsentMutation.isPending.value"
                          size="xs"
                          :color="consentRecord.consent_given ? 'green' : 'gray'"
                          variant="soft"
                        >
                          {{ consentRecord.consent_given ? '✓ Given' : '✗ Not Given' }}
                        </UButton>
                      </div>
                      <p v-if="consentRecord.given_at" class="text-xs text-gray-600">
                        Given: {{ new Date(consentRecord.given_at).toLocaleString() }}
                      </p>
                    </div>
                    <UButton
                      @click="deleteConsent(consentRecord.id)"
                      size="xs"
                      color="red"
                      variant="ghost"
                      icon="i-heroicons-trash"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Family & Guardians Tab -->
            <div v-if="currentTab === 'family'" class="space-y-6">
              <div class="bg-white border border-gray-200 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <UIcon name="i-heroicons-users" class="w-4 h-4" />
                    Guardians
                  </h3>
                  <UButton @click="showAddGuardianForm = true" size="xs" color="primary" icon="i-heroicons-plus">Add</UButton>
                </div>

                <div v-if="showAddGuardianForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
                  <form @submit.prevent="handleAddGuardian" class="space-y-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Search Attendee in Event *</label>
                      <input
                        v-model="guardianSearchQuery"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Search by name, email, or attendee ID"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Guardian Attendee *</label>
                      <select
                        v-model="selectedGuardianAttendeeId"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option :value="null">Select attendee...</option>
                        <option
                          v-for="candidate in filteredGuardianAttendees"
                          :key="candidate.attendee_id"
                          :value="candidate.attendee_id"
                        >
                          {{ candidate.full_name }} ({{ candidate.attendee_display_id }})
                        </option>
                      </select>
                      <p v-if="guardianAttendees.isLoading.value" class="mt-1 text-xs text-gray-500">Loading attendees...</p>
                      <p v-else-if="guardianSearchQuery && !filteredGuardianAttendees.length" class="mt-1 text-xs text-gray-500">No attendees match your search in this event.</p>
                      <p v-if="selectedGuardianCandidate && !selectedGuardianHasLinkedUser" class="mt-1 text-xs text-amber-700">
                        Selected attendee has no linked user account and cannot be added as a guardian.
                      </p>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship *</label>
                      <select
                        v-model="newGuardian.relationship"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="child">Child</option>
                        <option value="spouse">Spouse</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div class="flex gap-2">
                      <UButton type="submit" :disabled="createGuardianMutation.isPending.value" size="sm" color="green">
                        {{ createGuardianMutation.isPending.value ? 'Adding...' : 'Add Guardian' }}
                      </UButton>
                      <UButton type="button" @click="cancelAddGuardian" size="sm" variant="ghost" color="gray">Cancel</UButton>
                    </div>
                  </form>
                </div>

                <div v-if="guardians.isLoading.value" class="text-center py-4 text-gray-500 text-sm">Loading guardians...</div>
                <div v-else-if="!guardians.data.value?.data?.results?.length" class="text-center py-4 text-gray-500 text-sm">No guardians recorded</div>
                <div v-else class="space-y-2">
                  <div
                    v-for="guardian in guardians.data.value?.data?.results"
                    :key="guardian.id"
                    class="p-3 border border-gray-200 rounded-lg bg-gray-50/30 flex items-center justify-between"
                  >
                    <div>
                      <p class="text-sm font-semibold text-gray-900">{{ guardian.user_name || guardian.user_email || 'Unlinked Guardian' }}</p>
                      <p class="text-xs text-gray-600">Relationship: {{ guardian.relationship_display }}</p>
                    </div>
                    <UButton @click="deleteGuardian(guardian.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
                  </div>
                </div>
              </div>

              <div class="bg-white border border-gray-200 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <UIcon name="i-heroicons-user-group" class="w-4 h-4" />
                    Family Memberships
                  </h3>
                  <div class="flex items-center gap-2">
                    <UButton @click="showCreateFamilyGroupForm = true" size="xs" color="gray" variant="outline" icon="i-heroicons-user-group">New Group</UButton>
                    <UButton @click="showAddFamilyMembershipForm = true" size="xs" color="primary" icon="i-heroicons-plus">Add</UButton>
                  </div>
                </div>

                <div v-if="showCreateFamilyGroupForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
                  <form @submit.prevent="handleCreateFamilyGroup" class="space-y-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Family Group Name *</label>
                      <input
                        v-model="newFamilyGroupName"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="e.g. Smith Family"
                      />
                    </div>
                    <div class="flex gap-2">
                      <UButton type="submit" :disabled="createFamilyGroupMutation.isPending.value" size="sm" color="green">
                        {{ createFamilyGroupMutation.isPending.value ? 'Creating...' : 'Create Group' }}
                      </UButton>
                      <UButton type="button" @click="cancelCreateFamilyGroup" size="sm" variant="ghost" color="gray">Cancel</UButton>
                    </div>
                  </form>
                </div>

                <div v-if="showAddFamilyMembershipForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
                  <form @submit.prevent="handleAddFamilyMembership" class="space-y-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Family Group *</label>
                      <select
                        v-model="newFamilyMembership.family_group"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option :value="null">Select group...</option>
                        <option v-for="group in familyGroups.data.value?.data?.results" :key="group.id" :value="group.id">
                          {{ group.family_name }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Relationship *</label>
                      <select
                        v-model="newFamilyMembership.relationship"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="child">Child</option>
                        <option value="spouse">Spouse</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="newFamilyMembership.is_primary_guardian" type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary" />
                      <span class="text-xs text-gray-700">Primary Guardian in Family</span>
                    </label>
                    <div class="flex gap-2">
                      <UButton type="submit" :disabled="createFamilyMembershipMutation.isPending.value" size="sm" color="green">
                        {{ createFamilyMembershipMutation.isPending.value ? 'Adding...' : 'Add Membership' }}
                      </UButton>
                      <UButton type="button" @click="cancelAddFamilyMembership" size="sm" variant="ghost" color="gray">Cancel</UButton>
                    </div>
                  </form>
                </div>

                <div v-if="familyMemberships.isLoading.value" class="text-center py-4 text-gray-500 text-sm">Loading family memberships...</div>
                <div v-else-if="!familyMemberships.data.value?.data?.results?.length" class="text-center py-4 text-gray-500 text-sm">No family memberships recorded</div>
                <div v-else class="space-y-2">
                  <div
                    v-for="membership in familyMemberships.data.value?.data?.results"
                    :key="membership.id"
                    class="p-3 border border-gray-200 rounded-lg bg-gray-50/30 flex items-center justify-between"
                  >
                    <div>
                      <p class="text-sm font-semibold text-gray-900">{{ membership.family_name }}</p>
                      <p class="text-xs text-gray-600">{{ membership.relationship_display }}<span v-if="membership.is_primary_guardian"> · Primary Guardian</span></p>
                    </div>
                    <UButton @click="deleteFamilyMembership(membership.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions Tab -->
            <div v-if="currentTab === 'actions'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Action History</h3>
                <UButton
                  @click="exportActionsToCSV"
                  size="xs"
                  color="primary"
                  variant="outline"
                  icon="i-heroicons-arrow-down-tray"
                >
                  Export CSV
                </UButton>
              </div>

              <!-- Filters -->
              <div class="mb-4 flex gap-3">
                <div class="flex-1">
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Filter by Action</label>
                  <select
                    v-model="actionTypeFilter"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  >
                    <option value="">All Actions</option>
                    <option value="registered">Registered</option>
                    <option value="checked_in">Checked In</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="updated_info">Updated Info</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Start Date</label>
                  <input
                    v-model="actionDateStart"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">End Date</label>
                  <input
                    v-model="actionDateEnd"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div v-if="attendeeActions.isLoading.value" class="text-center py-8 text-gray-500 text-sm">
                Loading actions...
              </div>
              <div v-else-if="!filteredActions.length" class="text-center py-8 text-gray-500 text-sm">
                No actions recorded
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="action in filteredActions"
                  :key="action.id"
                  class="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <UBadge
                          :color="action.action === 'registered' ? 'green' : action.action === 'checked_in' ? 'blue' : action.action === 'cancelled' ? 'red' : 'gray'"
                          size="xs"
                        >
                          {{ action.action_display || action.action }}
                        </UBadge>
                        <span class="text-xs text-gray-600">{{ new Date(action.performed_at).toLocaleString() }}</span>
                      </div>
                      <p class="text-xs text-gray-700">
                        <span class="font-semibold">Performed by:</span> {{ action.performed_by_name || 'System' }}
                      </p>
                      <p v-if="action.notes" class="text-xs text-gray-600 mt-1">{{ action.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Question Answers Tab (NEW) -->
            <div v-if="currentTab === 'questions'">
              <AttendeeQuestionAnswers
                v-if="event.data.value?.data"
                :event="event.data.value?.data"
                :attendee-id="attendee.data.value?.data?.attendee_id || ''"
              />
            </div>

            <!-- Orders Tab (NEW) -->
            <div v-if="currentTab === 'orders'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest">Orders & Order Items</h3>
                <!-- <UButton
                  @click="showCreateOrderForm = true"
                  size="xs"
                  color="primary"
                  icon="i-heroicons-plus"
                >
                  Create Order
                </UButton> -->
              </div>

              <!-- Create Order Form -->
              <div v-if="showCreateOrderForm" class="bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-200">
                <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Order</h4>
                <form @submit.prevent="handleCreateOrder" class="space-y-3">
                  <p class="text-xs text-gray-600">A new draft order will be created for this attendee.</p>
                  <div class="flex gap-2 pt-2">
                    <UButton
                      type="submit"
                      :disabled="createOrderMutation.isPending.value"
                      size="sm"
                      color="green"
                    >
                      {{ createOrderMutation.isPending.value ? 'Creating...' : 'Create Draft Order' }}
                    </UButton>
                    <UButton
                      type="button"
                      @click="showCreateOrderForm = false"
                      size="sm"
                      variant="ghost"
                      color="gray"
                    >
                      Cancel
                    </UButton>
                  </div>
                </form>
              </div>

              <!-- Orders List -->
              <div v-if="attendeeOrders.isLoading.value" class="text-center py-8 text-gray-500 text-sm">
                Loading orders...
              </div>
              <div v-else-if="!attendeeOrders.data.value?.data?.results?.length" class="text-center py-8 text-gray-500 text-sm">
                No orders found for this attendee
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="order in attendeeOrders.data.value?.data?.results"
                  :key="order.id"
                  class="border border-gray-200 rounded-xl overflow-hidden bg-white"
                >
                  <!-- Order Header -->
                  <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <h4 class="font-bold text-sm text-gray-900 font-mono">{{ order.order_reference_id }}</h4>
                        <UBadge
                          :color="getOrderStatusColor(order.status || 'draft') as any"
                          variant="soft"
                          size="xs"
                        >
                          {{ (order.status || 'draft').toUpperCase() }}
                        </UBadge>
                        <span class="text-xs text-gray-600">{{ order.item_count }} items</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-primary">{{ order.total_amount }}</span>
                        <UButton
                          v-if="order.status === 'draft' || order.status === 'pending'"
                          @click="cancelOrder(order.id)"
                          size="xs"
                          color="red"
                          variant="ghost"
                          icon="i-heroicons-x-mark"
                        >
                          Cancel Order
                        </UButton>
                      </div>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                      Created: {{ new Date(order.created_at).toLocaleString() }}
                    </div>
                  </div>

                  <!-- Order Items -->
                  <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h5 class="text-xs font-bold text-gray-700 uppercase">Order Items</h5>
                      <UButton
                        v-if="order.status === 'draft'"
                        @click="toggleAddItemForm(order.id)"
                        size="xs"
                        color="primary"
                        variant="ghost"
                        icon="i-heroicons-plus"
                      >
                        Add Item
                      </UButton>
                    </div>

                    <!-- Add Item Form (for draft orders) -->
                    <div v-if="showAddItemFormForOrder === order.id" class="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
                      <form @submit.prevent="handleAddOrderItem(order.id)" class="space-y-2">
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Product Variant ID (UUID) *</label>
                          <input
                            v-model="newOrderItem.product_variant_id"
                            type="text"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono"
                            placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Quantity *</label>
                          <input
                            v-model.number="newOrderItem.quantity"
                            type="number"
                            min="1"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                          />
                        </div>
                        <div class="flex gap-2">
                          <UButton
                            type="submit"
                            :disabled="addOrderItemMutation.isPending.value"
                            size="xs"
                            color="green"
                          >
                            {{ addOrderItemMutation.isPending.value ? 'Adding...' : 'Add Item' }}
                          </UButton>
                          <UButton
                            type="button"
                            @click="showAddItemFormForOrder = null; resetOrderItemForm()"
                            size="xs"
                            variant="ghost"
                            color="gray"
                          >
                            Cancel
                          </UButton>
                        </div>
                      </form>
                    </div>
                    <!-- Items Table -->
                    <div v-if="!(order as any).order_items?.length" class="text-center py-4 text-gray-500 text-xs">
                      No items in this order
                    </div>
                    <div v-else class="space-y-2">
                      <div
                        v-for="item in (order as any).order_items"
                        :key="item.id"
                        class="p-3 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div class="flex items-start gap-3">
                          <div class="w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                            <img
                              v-if="getOrderItemImageUrl(item)"
                              :src="getOrderItemImageUrl(item) || ''"
                              :alt="getOrderItemTitle(item)"
                              class="w-full h-full object-cover"
                            />
                            <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <UIcon name="i-heroicons-photo" class="w-5 h-5" />
                            </div>
                          </div>

                          <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                              <div>
                                <p class="text-sm font-semibold text-gray-900 truncate">
                                  {{ getOrderItemTitle(item) }}
                                </p>
                                <p class="text-xs text-gray-500 mt-0.5">
                                  {{ getOrderItemCode(item) }}
                                </p>
                              </div>
                              <span class="text-sm font-bold text-primary whitespace-nowrap">{{ item.total_price }}</span>
                            </div>

                            <div class="flex flex-wrap items-center gap-2 mt-2">
                              <UBadge size="xs" color="gray" variant="soft">
                                Qty {{ item.quantity }}
                              </UBadge>
                              <UBadge size="xs" color="gray" variant="soft">
                                Unit {{ item.unit_price }}
                              </UBadge>
                              <UBadge
                                v-if="getOrderItemSize(item)"
                                size="xs"
                                color="blue"
                                variant="soft"
                              >
                                Size {{ getOrderItemSize(item) }}
                              </UBadge>
                              <span
                                v-if="getOrderItemColor(item)"
                                class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-700"
                              >
                                <span class="w-2.5 h-2.5 rounded-full border border-gray-300" :style="getOrderItemColorStyle(item)" />
                                {{ getOrderItemColor(item) }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Sidebar (4/12) - Profile Card -->
      <div class="hidden xl:block xl:col-span-4 space-y-6">
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden sticky top-6">
          <!-- Profile Picture Section -->
          <div class="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-20">
            <div class="flex justify-center">
              <div class="relative">
                <img
                  v-if="linkedUserProfile?.profile_picture_url && attendee.data.value?.data?.relationship_display.toLowerCase() == 'self'"
                  :src="linkedUserProfile.profile_picture_url"
                  :alt="attendee.data.value?.data?.full_name"
                  class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div
                  v-else
                  class="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-4 border-white shadow-lg"
                >
                  <UIcon name="i-heroicons-user" class="w-16 h-16 text-primary" />
                </div>

                <!-- Linked User Indicator -->
                <div
                  v-if="linkedUserId"
                  class="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md"
                  title="Linked to user account"
                >
                  <UIcon name="i-heroicons-link" class="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <!-- Name & Basic Info -->
          <div class="px-6 -mt-14 pb-6 relative z-10">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
              <h2 class="text-xl font-black text-gray-900 mb-1">
                {{ attendee.data.value?.data?.full_name }}
              </h2>
              <p class="text-sm text-gray-500 mb-3">
                {{ attendee.data.value?.data?.relationship_display }}
              </p>

              <div class="flex items-center justify-center gap-2 mb-3">
                <UBadge v-if="attendee.data.value?.data?.is_minor" color="amber" variant="soft" size="xs">
                  {{ attendee.data.value?.data?.age }} years • Minor
                </UBadge>
                <UBadge v-else color="gray" variant="soft" size="xs">
                  {{ attendee.data.value?.data?.age }} years
                </UBadge>
                <UBadge v-if="(attendee.data.value?.data as any)?.is_event_staff" color="purple" variant="soft" size="xs">
                  Staff
                </UBadge>
              </div>

              <div v-if="(attendee.data.value?.data as any)?.is_checked_in" class="flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
                <span class="text-xs font-bold text-green-700 uppercase">Checked In</span>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-4 space-y-2">
              <UButton
                v-if="linkedUserId"
                block
                size="sm"
                color="blue"
                variant="soft"
                icon="i-heroicons-user"
              >
                View User Profile
              </UButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Ref } from 'vue'
import * as z from 'zod'
import { useToast } from '#ui/composables/useToast'

// Composables - Attendee
import { useAttendee, useAttendees, useUpdateAttendee, useDeleteAttendee } from '~/composables/resources/attendee/attendees'
import { useEvent } from '~/composables/resources/events/events'
import { useAreas } from '~/composables/resources/locations/locations'
import { useProfile, useProfiles } from '~/composables/resources/user/profiles'
import { useBooking } from '~/composables/resources/booking/bookings'


// Composables - Medical, Dietary, Accessibility
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import {
  useAttendeeMedicalConditions,
  useCreateAttendeeMedicalCondition,
  useUpdateAttendeeMedicalCondition,
  useDeleteAttendeeMedicalCondition
} from '~/composables/resources/attendee/attendeeMedicalConditions'
import {
  useAttendeeDietaryRequirements,
  useCreateAttendeeDietaryRequirement,
  useUpdateAttendeeDietaryRequirement,
  useDeleteAttendeeDietaryRequirement
} from '~/composables/resources/attendee/attendeeDietaryRequirementsRelationship'
import {
  useAttendeeAccessibilityRequirements,
  useCreateAttendeeAccessibilityRequirement,
  useUpdateAttendeeAccessibilityRequirement,
  useDeleteAttendeeAccessibilityRequirement
} from '~/composables/resources/attendee/attendeeAccessibilityRequirements'

// Composables - Emergency Contacts
import {
  useAttendeeEmergencyContacts,
  useCreateAttendeeEmergencyContact,
  useUpdateAttendeeEmergencyContact,
  useDeleteAttendeeEmergencyContact
} from '~/composables/resources/attendee/attendeeEmergencyContacts'

// Composables - Consents
import { useConsents } from '~/composables/resources/attendee/attendeeConsents'
import {
  useAttendeeConsents,
  useCreateAttendeeConsent,
  useUpdateAttendeeConsent,
  usePartialUpdateAttendeeConsent,
  useDeleteAttendeeConsent
} from '~/composables/resources/attendee/attendeeConsentsRelationship'

// Composables - Family & Guardians
import {
  useGuardians,
  useCreateGuardian,
  useDeleteGuardian,
  useFamilyAttendees,
  useCreateFamilyAttendee,
  useDeleteFamilyAttendee,
  useFamilyGroups,
  useCreateFamilyGroup,
} from '~/composables/resources/common'

// Composables - Organisations
import {
  useAttendeeOrganisations,
  useCreateAttendeeOrganisation,
  useDeleteAttendeeOrganisation
} from '~/composables/resources/attendee/attendeeOrganisations'
import { useOrganisations } from '~/composables/resources/organisation/organisations'

// Composables - Actions
import { useAttendeeActions } from '~/composables/resources/attendee/attendeeActions'

// Composables - Orders (NEW)
import {
  useProductOrders,
  useCreateProductOrder,
  useUpdateProductOrder,
  usePartialUpdateProductOrder,
  useDeleteProductOrder,
  useAddProductOrderItem,
  useCancelProductOrder
} from '~/composables/resources/products/productOrders'

// Components
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import AttendeeQuestionAnswers from '~/components/attendee/AttendeeQuestionAnswers.vue'

definePageMeta({
  layout: false,
})

// Route & Router
const route = useRoute()
const router = useRouter()
const toast = useToast()

// Route Params
const attendeeId = computed(() => route.params.attendee_id as string)
const eventId = computed(() => route.params.id as string)
const currentTab = ref((route.query.tab as string) || 'details')

// Tab Configuration (Updated)
const tabs = [
  { id: 'details', label: 'Details' },
  { id: 'booking', label: 'Booking' },
  { id: 'emergency', label: 'Emergency Contacts' },
  { id: 'consents', label: 'Consents' },
  { id: 'family', label: 'Family & Guardians' },
  { id: 'questions', label: 'Question Answers' },
  { id: 'orders', label: 'Orders' },
  { id: 'actions', label: 'Actions' },
]

// ====================
// DATA QUERIES
// ====================

// Attendee & Event
const attendee = useAttendee(attendeeId)
const event = useEvent(eventId)
const areas = useAreas()

// Linked User Profile
const linkedUserId = computed(() => {
  if (!attendee.data.value?.data?._links?.user) return null
  const match = attendee.data.value.data._links.user.match(/\/users\/(\d+)\//)
  return match ? parseInt(match[1]) : null
})

const linkedProfilesQuery = useProfiles(computed(() =>
  linkedUserId.value ? { user: linkedUserId.value } : undefined
))
const linkedUserProfile = computed(() =>
  linkedProfilesQuery.data.value?.data?.results?.[0]
)

// Booking
const booking = useBooking(computed(() => attendee.data.value?.data?.booking || 0))

// Medical, Dietary, Accessibility
const medicalConditions = useMedicalConditions()
const dietaryRequirements = useDietaryRequirements()
const accessibilityRequirements = useAccessibilityRequirements()

const attendeeMedicalConditions = useAttendeeMedicalConditions(attendeeId)
const attendeeDietaryRequirements = useAttendeeDietaryRequirements(attendeeId)
const attendeeAccessibilityRequirements = useAttendeeAccessibilityRequirements(attendeeId)

// Emergency Contacts
const emergencyContacts = useAttendeeEmergencyContacts(attendeeId)

// Consents
const eventConsents = useConsents(computed(() => ({ event: eventId.value })))
const attendeeConsents = useAttendeeConsents(attendeeId)

// Family & Guardians
// const attendeeNumericId = computed<number | null>(() => {
//   const numericId = (attendee.data.value?.data as any)?.id
//   return typeof numericId === 'number' ? numericId : null
// })


const guardians = useGuardians(computed(() => {
  if (!attendeeId.value) return undefined
  return {
    attendee: attendee.data.value?.data?.attendee_id,
    page_size: 100,
  }
}))

const familyMemberships = useFamilyAttendees(computed(() => {
  if (!attendeeId.value) return undefined
  return {
    attendee: attendee.data.value?.data?.attendee_id,
    page_size: 100,
  }
}))

const familyGroups = useFamilyGroups(computed(() => ({ page_size: 100, event: eventId.value } as any)))

const guardianAttendees = useAttendees(computed(() => ({
  event: eventId.value,
  page_size: 200,
})))

// Actions
const attendeeActions = useAttendeeActions(computed(() => ({ attendee: attendeeId.value })))
const actionTypeFilter = ref<string>('')
const actionDateStart = ref<string>('')
const actionDateEnd = ref<string>('')

// Organisations
const attendeeOrganisations = useAttendeeOrganisations(attendeeId)
const organisations = useOrganisations(computed(() => ({ page_size: 100 })))

// Orders (NEW)
const attendeeOrders = useProductOrders(computed(() => ({
  attendee_id: attendee.data.value?.data?.attendee_id
})))

// ====================
// LOADING STATES
// ====================

const medicalConditionsLoading = computed(() => attendeeMedicalConditions.isLoading.value)
const dietaryRequirementsLoading = computed(() => attendeeDietaryRequirements.isLoading.value)
const accessibilityRequirementsLoading = computed(() => attendeeAccessibilityRequirements.isLoading.value)
const emergencyContactsLoading = computed(() => emergencyContacts.isLoading.value)

// ====================
// MUTATIONS
// ====================

// Basic Info
const updateMutation = useUpdateAttendee()
const deleteMutation = useDeleteAttendee()

// Medical
const createMedicalMutation = useCreateAttendeeMedicalCondition()
const updateMedicalMutation = useUpdateAttendeeMedicalCondition()
const deleteMedicalMutation = useDeleteAttendeeMedicalCondition()

// Dietary
const createDietaryMutation = useCreateAttendeeDietaryRequirement()
const updateDietaryMutation = useUpdateAttendeeDietaryRequirement()
const deleteDietaryMutation = useDeleteAttendeeDietaryRequirement()

// Accessibility
const createAccessibilityMutation = useCreateAttendeeAccessibilityRequirement()
const updateAccessibilityMutation = useUpdateAttendeeAccessibilityRequirement()
const deleteAccessibilityMutation = useDeleteAttendeeAccessibilityRequirement()

// Emergency Contacts
const createEmergencyMutation = useCreateAttendeeEmergencyContact()
const updateEmergencyMutation = useUpdateAttendeeEmergencyContact()
const deleteEmergencyMutation = useDeleteAttendeeEmergencyContact()

// Consents
const createConsentMutation = useCreateAttendeeConsent()
const updateConsentMutation = useUpdateAttendeeConsent()
const partialUpdateConsentMutation = usePartialUpdateAttendeeConsent()
const deleteConsentMutation = useDeleteAttendeeConsent()

// Family & Guardians
const createGuardianMutation = useCreateGuardian()
const deleteGuardianMutation = useDeleteGuardian()
const createFamilyMembershipMutation = useCreateFamilyAttendee()
const deleteFamilyMembershipMutation = useDeleteFamilyAttendee()
const createFamilyGroupMutation = useCreateFamilyGroup()

// Organisations
const createOrganisationMutation = useCreateAttendeeOrganisation()
const deleteOrganisationMutation = useDeleteAttendeeOrganisation()

// Orders (NEW)
const createOrderMutation = useCreateProductOrder()
const updateOrderMutation = useUpdateProductOrder()
const partialUpdateOrderMutation = usePartialUpdateProductOrder()
const deleteOrderMutation = useDeleteProductOrder()
const addOrderItemMutation = useAddProductOrderItem()
const cancelOrderMutation = useCancelProductOrder()

// ====================
// FORM DATA & STATE
// ====================

// Basic Info Form
type RelationshipType = 'child' | 'friend' | 'other' | 'parent' | 'sibling' | 'spouse' | 'self' | ''

const formData = ref<{
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_birth: string
  gender: string
  relationship_to_user: RelationshipType
  area_from: number | null
}>({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  gender: '',
  relationship_to_user: '',
  area_from: null,
})

const editingBasicInfo = ref(false)

// Medical Conditions
const showAddMedicalForm = ref(false)
const editingMedicalId = ref<number | null>(null)
const newMedicalCondition = ref({
  medical_condition: null as number | null,
  severity: '',
  details: '',
  notes: '',
})

// Dietary Requirements
const showAddDietaryForm = ref(false)
const editingDietaryId = ref<number | null>(null)
const newDietaryRequirement = ref({
  dietary_requirement: null as number | null,
  details: '',
  notes: '',
})

// Accessibility Requirements
const showAddAccessibilityForm = ref(false)
const editingAccessibilityId = ref<number | null>(null)
const newAccessibilityRequirement = ref({
  accessibility_requirement: null as number | null,
  details: '',
  notes: '',
})

// Emergency Contacts
const showAddEmergencyForm = ref(false)
const editingEmergencyId = ref<number | null>(null)
const newEmergencyContact = ref({
  first_name: '',
  last_name: '',
  relationship: '',
  phone_number: '',
  email: '',
  primary_contact: false,
})

// Consents
const showAddConsentForm = ref(false)
const newConsent = ref<{
  consent: number | null
  consent_given: boolean
}>({ consent: null, consent_given: false })

// Family & Guardians
const showAddGuardianForm = ref(false)
const showAddFamilyMembershipForm = ref(false)
const showCreateFamilyGroupForm = ref(false)
const newFamilyGroupName = ref('')
const newGuardian = ref<{
  relationship: 'spouse' | 'child' | 'friend' | 'parent' | 'sibling' | 'other'
}>({
  relationship: 'parent',
})

const guardianSearchQuery = ref('')
const selectedGuardianAttendeeId = ref<string | null>(null)

const filteredGuardianAttendees = computed(() => {
  const attendees = guardianAttendees.data.value?.data?.results || []
  const searchQuery = guardianSearchQuery.value.trim().toLowerCase()

  return attendees
    .filter((candidate: any) => candidate.attendee_id !== attendeeId.value)
    .filter((candidate: any) => {
      if (!searchQuery) return true

      const fullName = String(candidate.full_name || '').toLowerCase()
      const email = String(candidate.email || '').toLowerCase()
      const displayId = String(candidate.attendee_display_id || '').toLowerCase()

      return (
        fullName.includes(searchQuery) ||
        email.includes(searchQuery) ||
        displayId.includes(searchQuery)
      )
    })
})

const selectedGuardianCandidate = computed(() => {
  if (!selectedGuardianAttendeeId.value) return null
  return filteredGuardianAttendees.value.find(
    (candidate: any) => candidate.attendee_id === selectedGuardianAttendeeId.value,
  ) || null
})

const selectedGuardianHasLinkedUser = computed(() => {
  return !!(selectedGuardianCandidate.value as any)?._links?.user
})

const newFamilyMembership = ref<{
  family_group: number | null
  relationship: 'parent' | 'sibling' | 'child' | 'spouse' | 'friend' | 'other'
  is_primary_guardian: boolean
}>({
  family_group: null,
  relationship: 'sibling',
  is_primary_guardian: false,
})

// Organisations
const showChangeOrganisation = ref(false)
const selectedOrganisation = ref<number | null>(null)

// Orders (NEW)
const showCreateOrderForm = ref(false)
const showAddItemFormForOrder = ref<number | null>(null)
const newOrderItem = ref({
  product_variant_id: '',
  quantity: 1,
})

// ====================
// COMPUTED
// ====================

// Filtered Actions
const filteredActions = computed(() => {
  let actions = attendeeActions.data.value?.data?.results || []

  if (actionTypeFilter.value) {
    actions = actions.filter((a: any) => a.action === actionTypeFilter.value)
  }
  if (actionDateStart.value) {
    actions = actions.filter((a: any) => new Date(a.performed_at) >= new Date(actionDateStart.value))
  }
  if (actionDateEnd.value) {
    actions = actions.filter((a: any) => new Date(a.performed_at) <= new Date(actionDateEnd.value))
  }

  return actions
})

// ====================
// WATCHERS
// ====================

// Initialize form data when attendee loads
watch(() => attendee.data.value?.data, (newData) => {
  if (newData) {
    formData.value = {
      first_name: newData.first_name,
      last_name: newData.last_name,
      email: newData.email || '',
      phone_number: newData.phone_number || '',
      date_of_birth: newData.date_of_birth || '',
      gender: newData.gender || '',
      relationship_to_user: newData.relationship_to_user || '',
      area_from: newData.area_from || null,
    }
  }
}, { immediate: true })

// ====================
// TAB NAVIGATION
// ====================

const changeTab = (tabId: string) => {
  currentTab.value = tabId
  router.replace({ query: { tab: tabId } })
}

// ====================
// BASIC INFO HANDLERS
// ====================

const handleUpdateBasicInfo = async () => {
  try {
    await updateMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        ...formData.value,
        relationship_to_user: formData.value.relationship_to_user || undefined,
      },
    })
    editingBasicInfo.value = false
    toast.add({ title: 'Success', description: 'Basic information updated', color: 'green' })
  } catch (error) {
    console.error('Failed to update attendee:', error)
    toast.add({ title: 'Error', description: 'Failed to update information', color: 'red' })
  }
}

const cancelEditBasicInfo = () => {
  editingBasicInfo.value = false
  // Reset form data to current values
  if (attendee.data.value?.data) {
    formData.value = {
      first_name: attendee.data.value.data.first_name,
      last_name: attendee.data.value.data.last_name,
      email: attendee.data.value.data.email || '',
      phone_number: attendee.data.value.data.phone_number || '',
      date_of_birth: attendee.data.value.data.date_of_birth || '',
      gender: attendee.data.value.data.gender || '',
      relationship_to_user: attendee.data.value.data.relationship_to_user || '',
      area_from: attendee.data.value.data.area_from || null,
    }
  }
}


// CONTINUE IN NEXT PART...

// ====================
// MEDICAL CONDITIONS HANDLERS
// ====================

const handleAddMedicalCondition = async () => {
  if (!newMedicalCondition.value.medical_condition) {
    toast.add({ title: 'Error', description: 'Please select a condition', color: 'red' })
    return
  }

  // Check for duplicates
  const existing = attendeeMedicalConditions.data.value?.data?.results || []
  const duplicate = existing.find((c: any) => c.medical_condition === newMedicalCondition.value.medical_condition)
  if (duplicate) {
    toast.add({ title: 'Error', description: 'This condition already exists', color: 'red' })
    return
  }

  try {
    await createMedicalMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        medical_condition: newMedicalCondition.value.medical_condition,
        severity: newMedicalCondition.value.severity || undefined,
        details: newMedicalCondition.value.details || '',
        notes: newMedicalCondition.value.notes || '',
      } as any,
    })
    cancelAddMedicalCondition()
    toast.add({ title: 'Success', description: 'Medical condition added', color: 'green' })
  } catch (error) {
    console.error('Failed to add medical condition:', error)
    toast.add({ title: 'Error', description: 'Failed to add condition', color: 'red' })
  }
}

const editMedicalCondition = (condition: any) => {
  editingMedicalId.value = condition.id
  newMedicalCondition.value = {
    medical_condition: condition.medical_condition,
    severity: condition.severity || '',
    details: condition.details || '',
    notes: condition.notes || '',
  }
}

const handleUpdateMedicalCondition = async () => {
  if (!editingMedicalId.value) return
  if (!newMedicalCondition.value.medical_condition) {
    toast.add({ title: 'Error', description: 'Please select a condition', color: 'red' })
    return
  }

  try {
    await updateMedicalMutation.mutateAsync({
      attendeeId: attendeeId.value,
      conditionId: editingMedicalId.value,
      body: {
        medical_condition: newMedicalCondition.value.medical_condition,
        severity: newMedicalCondition.value.severity || undefined,
        details: newMedicalCondition.value.details || '',
        notes: newMedicalCondition.value.notes || '',
      } as any,
    })
    cancelEditMedicalCondition()
    toast.add({ title: 'Success', description: 'Medical condition updated', color: 'green' })
  } catch (error) {
    console.error('Failed to update medical condition:', error)
    toast.add({ title: 'Error', description: 'Failed to update condition', color: 'red' })
  }
}

const deleteMedicalCondition = async (conditionId: number) => {
  if (!confirm('Are you sure you want to delete this medical condition?')) return

  try {
    await deleteMedicalMutation.mutateAsync({
      attendeeId: attendeeId.value,
      conditionId,
    })
    toast.add({ title: 'Success', description: 'Medical condition deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete medical condition:', error)
    toast.add({ title: 'Error', description: 'Failed to delete condition', color: 'red' })
  }
}

const cancelAddMedicalCondition = () => {
  showAddMedicalForm.value = false
  newMedicalCondition.value = {
    medical_condition: null,
    severity: '',
    details: '',
    notes: '',
  }
}

const cancelEditMedicalCondition = () => {
  editingMedicalId.value = null
  newMedicalCondition.value = {
    medical_condition: null,
    severity: '',
    details: '',
    notes: '',
  }
}

// ====================
// DIETARY REQUIREMENTS HANDLERS
// ====================

const handleAddDietaryRequirement = async () => {
  if (!newDietaryRequirement.value.dietary_requirement) {
    toast.add({ title: 'Error', description: 'Please select a requirement', color: 'red' })
    return
  }

  // Check for duplicates
  const existing = attendeeDietaryRequirements.data.value?.data?.results || []
  const duplicate = existing.find((r: any) => r.dietary_requirement === newDietaryRequirement.value.dietary_requirement)
  if (duplicate) {
    toast.add({ title: 'Error', description: 'This requirement already exists', color: 'red' })
    return
  }

  try {
    await createDietaryMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        dietary_requirement: newDietaryRequirement.value.dietary_requirement,
        details: newDietaryRequirement.value.details || '',
        notes: newDietaryRequirement.value.notes || '',
      } as any,
    })
    cancelAddDietaryRequirement()
    toast.add({ title: 'Success', description: 'Dietary requirement added', color: 'green' })
  } catch (error) {
    console.error('Failed to add dietary requirement:', error)
    toast.add({ title: 'Error', description: 'Failed to add requirement', color: 'red' })
  }
}

const editDietaryRequirement = (requirement: any) => {
  editingDietaryId.value = requirement.id
  newDietaryRequirement.value = {
    dietary_requirement: requirement.dietary_requirement,
    details: requirement.details || '',
    notes: requirement.notes || '',
  }
}

const handleUpdateDietaryRequirement = async () => {
  if (!editingDietaryId.value) return
  if (!newDietaryRequirement.value.dietary_requirement) {
    toast.add({ title: 'Error', description: 'Please select a requirement', color: 'red' })
    return
  }

  try {
    await updateDietaryMutation.mutateAsync({
      attendeeId: attendeeId.value,
      requirementId: editingDietaryId.value,
      body: {
        dietary_requirement: newDietaryRequirement.value.dietary_requirement,
        details: newDietaryRequirement.value.details || '',
        notes: newDietaryRequirement.value.notes || '',
      } as any,
    })
    cancelEditDietaryRequirement()
    toast.add({ title: 'Success', description: 'Dietary requirement updated', color: 'green' })
  } catch (error) {
    console.error('Failed to update dietary requirement:', error)
    toast.add({ title: 'Error', description: 'Failed to update requirement', color: 'red' })
  }
}

const deleteDietaryRequirement = async (requirementId: number) => {
  if (!confirm('Are you sure you want to delete this dietary requirement?')) return

  try {
    await deleteDietaryMutation.mutateAsync({
      attendeeId: attendeeId.value,
      requirementId,
    })
    toast.add({ title: 'Success', description: 'Dietary requirement deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete dietary requirement:', error)
    toast.add({ title: 'Error', description: 'Failed to delete requirement', color: 'red' })
  }
}

const cancelAddDietaryRequirement = () => {
  showAddDietaryForm.value = false
  newDietaryRequirement.value = {
    dietary_requirement: null,
    details: '',
    notes: '',
  }
}

const cancelEditDietaryRequirement = () => {
  editingDietaryId.value = null
  newDietaryRequirement.value = {
    dietary_requirement: null,
    details: '',
    notes: '',
  }
}

// ====================
// ACCESSIBILITY REQUIREMENTS HANDLERS
// ====================

const handleAddAccessibilityRequirement = async () => {
  if (!newAccessibilityRequirement.value.accessibility_requirement) {
    toast.add({ title: 'Error', description: 'Please select a requirement',  color: 'red' })
    return
  }

  // Check for duplicates
  const existing = attendeeAccessibilityRequirements.data.value?.data?.results || []
  const duplicate = existing.find((r: any) => r.accessibility_requirement === newAccessibilityRequirement.value.accessibility_requirement)
  if (duplicate) {
    toast.add({ title: 'Error', description: 'This requirement already exists', color: 'red' })
    return
  }

  try {
    await createAccessibilityMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        accessibility_requirement: newAccessibilityRequirement.value.accessibility_requirement,
        details: newAccessibilityRequirement.value.details || '',
        notes: newAccessibilityRequirement.value.notes || '',
      } as any,
    })
    cancelAddAccessibilityRequirement()
    toast.add({ title: 'Success', description: 'Accessibility requirement added', color: 'green' })
  } catch (error) {
    console.error('Failed to add accessibility requirement:', error)
    toast.add({ title: 'Error', description: 'Failed to add requirement', color: 'red' })
  }
}

const editAccessibilityRequirement = (requirement: any) => {
  editingAccessibilityId.value = requirement.id
  newAccessibilityRequirement.value = {
    accessibility_requirement: requirement.accessibility_requirement,
    details: requirement.details || '',
    notes: requirement.notes || '',
  }
}

const handleUpdateAccessibilityRequirement = async () => {
  if (!editingAccessibilityId.value) return
  if (!newAccessibilityRequirement.value.accessibility_requirement) {
    toast.add({ title: 'Error', description: 'Please select a requirement', color: 'red' })
    return
  }

  try {
    await updateAccessibilityMutation.mutateAsync({
      attendeeId: attendeeId.value,
      requirementId: editingAccessibilityId.value,
      body: {
        accessibility_requirement: newAccessibilityRequirement.value.accessibility_requirement,
        details: newAccessibilityRequirement.value.details || '',
        notes: newAccessibilityRequirement.value.notes || '',
      } as any,
    })
    cancelEditAccessibilityRequirement()
    toast.add({ title: 'Success', description: 'Accessibility requirement updated', color: 'green' })
  } catch (error) {
    console.error('Failed to update accessibility requirement:', error)
    toast.add({ title: 'Error', description: 'Failed to update requirement', color: 'red' })
  }
}

const deleteAccessibilityRequirement = async (requirementId: number) => {
  if (!confirm('Are you sure you want to delete this accessibility requirement?')) return

  try {
    await deleteAccessibilityMutation.mutateAsync({
      attendeeId: attendeeId.value,
      requirementId,
    })
    toast.add({ title: 'Success', description: 'Accessibility requirement deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete accessibility requirement:', error)
    toast.add({ title: 'Error', description: 'Failed to delete requirement', color: 'red' })
  }
}

const cancelAddAccessibilityRequirement = () => {
  showAddAccessibilityForm.value = false
  newAccessibilityRequirement.value = {
    accessibility_requirement: null,
    details: '',
    notes: '',
  }
}

const cancelEditAccessibilityRequirement = () => {
  editingAccessibilityId.value = null
  newAccessibilityRequirement.value = {
    accessibility_requirement: null,
    details: '',
    notes: '',
  }
}

// ====================
// EMERGENCY CONTACTS HANDLERS
// ====================

const handleAddEmergencyContact = async () => {
  if (!newEmergencyContact.value.first_name || !newEmergencyContact.value.last_name || !newEmergencyContact.value.phone_number) {
    toast.add({ title: 'Error', description: 'Please fill all required fields', color: 'red' })
    return
  }

  try {
    await createEmergencyMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        first_name: newEmergencyContact.value.first_name,
        last_name: newEmergencyContact.value.last_name,
        relationship: newEmergencyContact.value.relationship as any,
        phone_number: newEmergencyContact.value.phone_number,
        email: newEmergencyContact.value.email || null,
        primary_contact: newEmergencyContact.value.primary_contact,
      },
    })
    cancelAddEmergencyContact()
    toast.add({ title: 'Success', description: 'Emergency contact added', color: 'green' })
  } catch (error) {
    console.error('Failed to add emergency contact:', error)
    toast.add({ title: 'Error', description: 'Failed to add contact', color: 'red' })
  }
}

const editEmergencyContact = (contact: any) => {
  editingEmergencyId.value = contact.id
  newEmergencyContact.value = {
    first_name: contact.first_name,
    last_name: contact.last_name,
    relationship: contact.relationship,
    phone_number: contact.phone_number,
    email: contact.email || '',
    primary_contact: contact.primary_contact || false,
  }
}

const handleUpdateEmergencyContact = async () => {
  if (!editingEmergencyId.value) return

  try {
    await updateEmergencyMutation.mutateAsync({
      attendeeId: attendeeId.value,
      contactId: editingEmergencyId.value,
      body: {
        first_name: newEmergencyContact.value.first_name,
        last_name: newEmergencyContact.value.last_name,
        relationship: newEmergencyContact.value.relationship as any,
        phone_number: newEmergencyContact.value.phone_number,
        email: newEmergencyContact.value.email || null,
        primary_contact: newEmergencyContact.value.primary_contact,
      },
    })
    cancelEditEmergencyContact()
    toast.add({ title: 'Success', description: 'Emergency contact updated', color: 'green' })
  } catch (error) {
    console.error('Failed to update emergency contact:', error)
    toast.add({ title: 'Error', description: 'Failed to update contact', color: 'red' })
  }
}

const deleteEmergencyContact = async (contactId: number) => {
  if (!confirm('Are you sure you want to delete this emergency contact?')) return

  try {
    await deleteEmergencyMutation.mutateAsync({
      attendeeId: attendeeId.value,
      contactId,
    })
    toast.add({ title: 'Success', description: 'Emergency contact deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete emergency contact:', error)
    toast.add({ title: 'Error', description: 'Failed to delete contact', color: 'red' })
  }
}

const cancelAddEmergencyContact = () => {
  showAddEmergencyForm.value = false
  newEmergencyContact.value = {
    first_name: '',
    last_name: '',
    relationship: '',
    phone_number: '',
    email: '',
    primary_contact: false,
  }
}

const cancelEditEmergencyContact = () => {
  editingEmergencyId.value = null
  newEmergencyContact.value = {
    first_name: '',
    last_name: '',
    relationship: '',
    phone_number: '',
    email: '',
    primary_contact: false,
  }
}

// CONTINUES IN NEXT PART...

// ====================
// CONSENTS HANDLERS
// ====================

const handleAddConsent = async () => {
  if (!newConsent.value.consent) {
    toast.add({ title: 'Error', description: 'Please select a consent', color: 'red' })
    return
  }

  // Check for duplicates
  const existing = attendeeConsents.data.value?.data?.results || []
  const duplicate = existing.find((c: any) => c.consent === newConsent.value.consent)
  if (duplicate) {
    toast.add({ title: 'Error', description: 'This consent already exists', color: 'red' })
    return
  }

  try {
    await createConsentMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        consent: newConsent.value.consent,
        consent_given: newConsent.value.consent_given,
        given_at: newConsent.value.consent_given ? new Date().toISOString() : null,
      } as any,
    })
    cancelAddConsent()
    toast.add({ title: 'Success', description: 'Consent added', color: 'green' })
  } catch (error) {
    console.error('Failed to add consent:', error)
    toast.add({ title: 'Error', description: 'Failed to add consent', color: 'red' })
  }
}

const toggleConsentGiven = async (consentRecord: any) => {
  try {
    await partialUpdateConsentMutation.mutateAsync({
      attendeeId: attendeeId.value,
      consentId: consentRecord.id,
      body: {
        consent_given: !consentRecord.consent_given,
        given_at: !consentRecord.consent_given ? new Date().toISOString() : null,
      } as any,
    })
    toast.add({ title: 'Success', description: 'Consent updated', color: 'green' })
  } catch (error) {
    console.error('Failed to toggle consent:', error)
    toast.add({ title: 'Error', description: 'Failed to update consent', color: 'red' })
  }
}

const deleteConsent = async (consentId: number) => {
  if (!confirm('Are you sure you want to delete this consent record?')) return

  try {
    await deleteConsentMutation.mutateAsync({
      attendeeId: attendeeId.value,
      consentId,
    })
    toast.add({ title: 'Success', description: 'Consent deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete consent:', error)
    toast.add({ title: 'Error', description: 'Failed to delete consent', color: 'red' })
  }
}

const markAllRequiredConsentsAsGiven = async () => {
  const requiredConsents = eventConsents.data.value?.data?.results?.filter((c: any) => c.required) || []
  const existingConsentIds = new Set(attendeeConsents.data.value?.data?.results?.map((ac: any) => ac.consent) || [])

  if (!confirm(`This will mark all ${requiredConsents.length} required consents as given. Continue?`)) return

  try {
    for (const consent of requiredConsents) {
      if (!existingConsentIds.has(consent.id)) {
        // Create new consent record
        await createConsentMutation.mutateAsync({
          attendeeId: attendeeId.value,
          body: {
            consent: consent.id,
            consent_given: true,
            given_at: new Date().toISOString(),
          } as any,
        })
      } else {
        // Update existing to mark as given
        const existingRecord = attendeeConsents.data.value?.data?.results?.find((ac: any) => ac.consent === consent.id)
        if (existingRecord && !existingRecord.consent_given) {
          await partialUpdateConsentMutation.mutateAsync({
            attendeeId: attendeeId.value,
            consentId: existingRecord.id,
            body: {
              consent_given: true,
              given_at: new Date().toISOString(),
            } as any,
          })
        }
      }
    }
    toast.add({ title: 'Success', description: 'All required consents marked as given', color: 'green' })
  } catch (error) {
    console.error('Failed to mark consents:', error)
    toast.add({ title: 'Error', description: 'Failed to mark some consents', color: 'red' })
  }
}

const cancelAddConsent = () => {
  showAddConsentForm.value = false
  newConsent.value = {
    consent: null,
    consent_given: false,
  }
}

// ====================
// FAMILY & GUARDIANS HANDLERS
// ====================

const cancelAddGuardian = () => {
  showAddGuardianForm.value = false
  newGuardian.value = {
    relationship: 'parent',
  }
  guardianSearchQuery.value = ''
  selectedGuardianAttendeeId.value = null
}

const extractErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as any
  const responseData = apiError?.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (responseData && typeof responseData === 'object') {
    const candidateKeys = ['detail', 'non_field_errors', 'message', 'error']
    for (const key of candidateKeys) {
      const value = responseData[key]
      if (typeof value === 'string' && value.trim()) {
        return value
      }
      if (Array.isArray(value) && value.length && typeof value[0] === 'string') {
        return value[0]
      }
    }

    const firstFieldValue = Object.values(responseData).find(
      (value: any) => typeof value === 'string' || (Array.isArray(value) && value.length),
    )
    if (typeof firstFieldValue === 'string' && firstFieldValue.trim()) {
      return firstFieldValue
    }
    if (Array.isArray(firstFieldValue) && firstFieldValue.length && typeof firstFieldValue[0] === 'string') {
      return firstFieldValue[0]
    }
  }

  if (apiError instanceof Error && apiError.message.trim()) {
    return apiError.message
  }

  return fallback
}

const handleAddGuardian = async () => {
  if (!attendeeId.value) {
    toast.add({ title: 'Error', description: 'Attendee is not loaded yet', color: 'red' })
    return
  }

  if (!selectedGuardianAttendeeId.value) {
    toast.add({ title: 'Error', description: 'Please choose an attendee to link as guardian', color: 'red' })
    return
  }

  const selectedCandidate = filteredGuardianAttendees.value.find(
    (candidate: any) => candidate.attendee_id === selectedGuardianAttendeeId.value,
  ) as any

  if (!selectedCandidate?._links?.user) {
    toast.add({
      title: 'Guardian Account Required',
      description: 'Selected attendee does not have a linked user account.',
      color: 'red',
    })
    return
  }

  const userLinkMatch = String(selectedCandidate._links.user).match(/\/users\/(\d+)\//)
  const selectedGuardianUserId = userLinkMatch ? parseInt(userLinkMatch[1], 10) : null

  if (!selectedGuardianUserId) {
    toast.add({ title: 'Error', description: 'Could not resolve guardian user account', color: 'red' })
    return
  }

  try {
    await createGuardianMutation.mutateAsync({
      attendee: attendeeId.value,
      user: selectedGuardianUserId,
      relationship: newGuardian.value.relationship,
    } as any)

    cancelAddGuardian()
    toast.add({ title: 'Success', description: 'Guardian added', color: 'green' })
  } catch (error) {
    console.error('Failed to add guardian:', error)
    toast.add({ title: 'Error', description: extractErrorMessage(error, 'Failed to add guardian'), color: 'red' })
  }
}

const deleteGuardian = async (guardianId: number) => {
  if (!confirm('Are you sure you want to remove this guardian relationship?')) return

  try {
    await deleteGuardianMutation.mutateAsync(guardianId)
    toast.add({ title: 'Success', description: 'Guardian removed', color: 'green' })
  } catch (error) {
    console.error('Failed to delete guardian:', error)
    toast.add({ title: 'Error', description: 'Failed to remove guardian', color: 'red' })
  }
}

const cancelAddFamilyMembership = () => {
  showAddFamilyMembershipForm.value = false
  newFamilyMembership.value = {
    family_group: null,
    relationship: 'sibling',
    is_primary_guardian: false,
  }
}

const handleAddFamilyMembership = async () => {
  if (!attendeeId.value || !newFamilyMembership.value.family_group) {
    toast.add({ title: 'Error', description: 'Select a family group first', color: 'red' })
    return
  }

  try {
    await createFamilyMembershipMutation.mutateAsync({
      family_group: newFamilyMembership.value.family_group,
      attendee: attendeeId.value,
      relationship: newFamilyMembership.value.relationship,
      is_primary_guardian: newFamilyMembership.value.is_primary_guardian,
    } as any)

    cancelAddFamilyMembership()
    toast.add({ title: 'Success', description: 'Family membership added', color: 'green' })
  } catch (error) {
    console.error('Failed to add family membership:', error)
    const errorMessage = extractErrorMessage(error, 'Failed to add family membership')
    if (errorMessage.toLowerCase().includes('already a member')) {
      cancelAddFamilyMembership()
      toast.add({
        title: 'Already Added',
        description: 'This attendee is already in the selected family group.',
        color: 'blue',
      })
      return
    }
    toast.add({ title: 'Error', description: errorMessage, color: 'red' })
  }
}

const cancelCreateFamilyGroup = () => {
  showCreateFamilyGroupForm.value = false
  newFamilyGroupName.value = ''
}

const handleCreateFamilyGroup = async () => {
  const familyName = newFamilyGroupName.value.trim()
  if (!familyName) {
    toast.add({ title: 'Error', description: 'Please enter a family group name', color: 'red' })
    return
  }

  const eventNumericId = event.data.value?.data?.id
  const organisationId = (event.data.value?.data as any)?.organisation

  if (!eventNumericId || !organisationId) {
    toast.add({ title: 'Error', description: 'Event context is not ready yet', color: 'red' })
    return
  }

  try {
    await createFamilyGroupMutation.mutateAsync({
      family_name: familyName,
      event: eventNumericId,
      organisation: organisationId,
    } as any)

    cancelCreateFamilyGroup()
    toast.add({ title: 'Success', description: 'Family group created', color: 'green' })
  } catch (error) {
    console.error('Failed to create family group:', error)
    toast.add({ title: 'Error', description: extractErrorMessage(error, 'Failed to create family group'), color: 'red' })
  }
}

const deleteFamilyMembership = async (membershipId: number) => {
  if (!confirm('Are you sure you want to remove this family membership?')) return

  try {
    await deleteFamilyMembershipMutation.mutateAsync(membershipId)
    toast.add({ title: 'Success', description: 'Family membership removed', color: 'green' })
  } catch (error) {
    console.error('Failed to remove family membership:', error)
    toast.add({ title: 'Error', description: 'Failed to remove family membership', color: 'red' })
  }
}

// ====================
// ORGANISATIONS HANDLERS
// ====================

const handleChangeOrganisation = async () => {
  if (!selectedOrganisation.value) {
    toast.add({ title: 'Error', description: 'Please select an organisation', color: 'red' })
    return
  }

  // Remove existing organisations first
  const existing = attendeeOrganisations.data.value?.data?.results || []
  try {
    for (const org of existing) {
      await deleteOrganisationMutation.mutateAsync({
        attendeeId: attendeeId.value,
        organisationId: org.id,
      })
    }

    // Add new organisation
    await createOrganisationMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        organisation: selectedOrganisation.value,
      } as any,
    })

    showChangeOrganisation.value = false
    selectedOrganisation.value = null
    toast.add({ title: 'Success', description: 'Organisation updated', color: 'green' })
  } catch (error) {
    console.error('Failed to change organisation:', error)
    toast.add({ title: 'Error', description: 'Failed to update organisation', color: 'red' })
  }
}

const removeOrganisation = async (organisationId: number) => {
  if (!confirm('Are you sure you want to remove this organisation?')) return

  try {
    await deleteOrganisationMutation.mutateAsync({
      attendeeId: attendeeId.value,
      organisationId,
    })
    toast.add({ title: 'Success', description: 'Organisation removed', color: 'green' })
  } catch (error) {
    console.error('Failed to remove organisation:', error)
    toast.add({ title: 'Error', description: 'Failed to remove organisation', color: 'red' })
  }
}

// ====================
// ACTIONS HANDLERS
// ====================

const exportActionsToCSV = () => {
  const actions = filteredActions.value
  if (!actions.length) {
    toast.add({ title: 'Error', description: 'No actions to export', color: 'red' })
    return
  }

  const headers = ['Action', 'Attendee ID', 'Attendee Name', 'Event Title', 'Performed By', 'Performed At', 'Notes']
  const rows = actions.map((action: any) => [
    action.action_display || action.action,
    attendee.data.value?.data?.attendee_display_id || '',
    attendee.data.value?.data?.full_name || '',
    event.data.value?.data?.title || '',
    action.performed_by_name || 'System',
    new Date(action.performed_at).toLocaleString(),
    action.notes || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attendee-actions-${attendeeId.value}-${Date.now()}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// ====================
// ORDERS HANDLERS (NEW)
// ====================

const handleCreateOrder = async () => {
  try {
    await createOrderMutation.mutateAsync({
      attendee: attendeeId.value,
      items: [], // Empty items array for draft order
    })
    showCreateOrderForm.value = false
    toast.add({ title: 'Success', description: 'Order created', color: 'green' })
  } catch (error) {
    console.error('Failed to create order:', error)
    toast.add({ title: 'Error', description: 'Failed to create order', color: 'red' })
  }
}

const toggleAddItemForm = (orderId: number) => {
  showAddItemFormForOrder.value = showAddItemFormForOrder.value === orderId ? null : orderId
  resetOrderItemForm()
}

const handleAddOrderItem = async (orderId: number) => {
  if (!newOrderItem.value.product_variant_id || !newOrderItem.value.quantity) {
    toast.add({ title: 'Error', description: 'Please fill all required fields', color: 'red' })
    return
  }

  try {
    await addOrderItemMutation.mutateAsync({
      orderId,
      body: {
        product_variant_id: newOrderItem.value.product_variant_id,
        quantity: newOrderItem.value.quantity,
      },
    })
    showAddItemFormForOrder.value = null
    resetOrderItemForm()
    toast.add({ title: 'Success', description: 'Item added to order', color: 'green' })
  } catch (error) {
    console.error('Failed to add order item:', error)
    toast.add({ title: 'Error', description: 'Failed to add item', color: 'red' })
  }
}

const cancelOrder = async (orderId: number) => {
  if (!confirm('Are you sure you want to cancel this order?')) return

  try {
    await cancelOrderMutation.mutateAsync(orderId)
    toast.add({ title: 'Success', description: 'Order cancelled', color: 'green' })
  } catch (error) {
    console.error('Failed to cancel order:', error)
    toast.add({ title: 'Error', description: 'Failed to cancel order', color: 'red' })
  }
}

const deleteOrder = async (orderId: number) => {
  if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return

  try {
    await deleteOrderMutation.mutateAsync(orderId)
    toast.add({ title: 'Success', description: 'Order deleted', color: 'green' })
  } catch (error) {
    console.error('Failed to delete order:', error)
    toast.add({ title: 'Error', description: 'Failed to delete order', color: 'red' })
  }
}

const resetOrderItemForm = () => {
  newOrderItem.value = {
    product_variant_id: '',
    quantity: 1,
  }
}

const getOrderItemDetails = (item: any): Record<string, any> | null => {
  const details = item?.product_variant_details
  if (!details || typeof details !== 'object') return null
  return details as Record<string, any>
}

const getOrderItemTitle = (item: any): string => {
  const details = getOrderItemDetails(item)
  return details?.product_title || `Variant ${details?.variant_id || item?.product_variant || 'N/A'}`
}

const getOrderItemCode = (item: any): string => {
  const details = getOrderItemDetails(item)
  if (details?.product_display_code) return String(details.product_display_code)
  if (details?.variant_id) return `Variant ${details.variant_id}`
  return `Variant ${item?.product_variant || 'N/A'}`
}

const getOrderItemImageUrl = (item: any): string | null => {
  const details = getOrderItemDetails(item)
  return details?.image_url || details?.variant_image_url || details?.product_image_url || null
}

const getOrderItemSize = (item: any): string | null => {
  const details = getOrderItemDetails(item)
  return details?.size || null
}

const getOrderItemColor = (item: any): string | null => {
  const details = getOrderItemDetails(item)
  return details?.color || null
}

const getOrderItemColorStyle = (item: any): Record<string, string> | undefined => {
  const color = getOrderItemColor(item)
  if (!color) return undefined
  return { backgroundColor: color }
}

// ====================
// UTILITY FUNCTIONS
// ====================

const getOrderStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: 'gray',
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    cancelled: 'red',
    pending_refund: 'orange',
    refunded: 'purple',
  }
  return colorMap[status] || 'gray'
}
</script>

