<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data.value?.data">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <!-- Main Content (Left - 8/12 on xl, 12/12 on smaller) -->
      <div class="xl:col-span-8 space-y-6">
        
        <AttendeeEditorHeader
          :attendee="attendee.data.value?.data"
          :linked-user-profile="linkedUserProfile"
          :current-tab="currentTab"
          :tabs="tabs"
          @change-tab="changeTab"
        >
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
              <AttendeeBookingTab
                :attendee="attendee.data.value?.data"
                :booking="booking"
                :attendee-id="attendeeId"
                :event-id="eventId"
              />
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
                          {{ consentRecord.consent_given ? 'G�� Given' : 'G�� Not Given' }}
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
                      <p class="text-xs text-gray-600">{{ membership.relationship_display }}<span v-if="membership.is_primary_guardian"> -+ Primary Guardian</span></p>
                    </div>
                    <UButton @click="deleteFamilyMembership(membership.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions Tab -->
            <div v-if="currentTab === 'actions'">
              <AttendeeActionsTab
                :is-loading="attendeeActions.isLoading.value"
                :actions="filteredActions"
                :action-type-filter="actionTypeFilter"
                :action-date-start="actionDateStart"
                :action-date-end="actionDateEnd"
                @export-csv="exportActionsToCSV"
                @update:action-type-filter="actionTypeFilter = $event"
                @update:action-date-start="actionDateStart = $event"
                @update:action-date-end="actionDateEnd = $event"
              />
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
                    <div v-if="!order.order_items?.length" class="text-center py-4 text-gray-500 text-xs">
                      No items in this order
                    </div>
                    <div v-else class="space-y-2">
                      <div
                        v-for="item in order.order_items"
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
                            <UBadge
                                size="xs"
                                color="blue"
                                variant="soft"
                                class="ml-2"
                              >
                                {{item.status.toUpperCase()}}
                              </UBadge>
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
        </AttendeeEditorHeader>
      </div>

      <AttendeeEditorSidebar
        :attendee="attendee.data.value?.data"
        :linked-user-profile="linkedUserProfile"
        :linked-user-id="linkedUserId"
      />
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'

// Composables - Attendee
import { useAttendee, useDeleteAttendee } from '~/composables/resources/attendee/attendees'
import { useEvent } from '~/composables/resources/events/events'
import { useAreas } from '~/composables/resources/locations/locations'
import { useProfiles } from '~/composables/resources/user/profiles'
import { useBooking } from '~/composables/resources/booking/bookings'


import { useAttendeeBasicInfoEditor } from '~/composables/attendee/editor/useAttendeeBasicInfoEditor'
import { useAttendeeHealthRequirements } from '~/composables/attendee/editor/useAttendeeHealthRequirements'
import { useAttendeeEmergencyContactsEditor } from '~/composables/attendee/editor/useAttendeeEmergencyContactsEditor'
import { useAttendeeConsentsEditor } from '~/composables/attendee/editor/useAttendeeConsentsEditor'
import { useAttendeeFamilyGuardiansEditor } from '~/composables/attendee/editor/useAttendeeFamilyGuardiansEditor'
import { useAttendeeOrganisationsEditor } from '~/composables/attendee/editor/useAttendeeOrganisationsEditor'
import { useAttendeeOrdersEditor } from '~/composables/attendee/editor/useAttendeeOrdersEditor'
import { useAttendeeActionsHistoryEditor } from '~/composables/attendee/editor/useAttendeeActionsHistoryEditor'
import { useAttendeeEditorTabs } from '~/composables/attendee/editor/useAttendeeEditorTabs'

// Composables - Consents
// Components
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import AttendeeQuestionAnswers from '~/components/attendee/AttendeeQuestionAnswers.vue'
import AttendeeEditorHeader from '~/components/attendee/editor/AttendeeEditorHeader.vue'
import AttendeeBookingTab from '~/components/attendee/editor/AttendeeBookingTab.vue'
import AttendeeActionsTab from '~/components/attendee/editor/AttendeeActionsTab.vue'
import AttendeeEditorSidebar from '~/components/attendee/editor/AttendeeEditorSidebar.vue'

definePageMeta({
  layout: false,
})

// Route & Router
const route = useRoute()
const toast = useToast()

// Route Params
const attendeeId = computed(() => route.params.attendee_id as string)
const eventId = computed(() => route.params.id as string)
const { currentTab, tabs, changeTab } = useAttendeeEditorTabs()

// ====================
// DATA QUERIES
// ====================

// Attendee & Event
const attendee = useAttendee(attendeeId)
const event = useEvent(eventId)
const attendeeResourceId = computed(() => attendee.data.value?.data?.attendee_id)
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

const {
  updateMutation,
  formData,
  editingBasicInfo,
  handleUpdateBasicInfo,
  cancelEditBasicInfo,
} = useAttendeeBasicInfoEditor(
  attendeeId,
  computed(() => attendee.data.value?.data),
)

const {
  medicalConditions,
  dietaryRequirements,
  accessibilityRequirements,
  attendeeMedicalConditions,
  attendeeDietaryRequirements,
  attendeeAccessibilityRequirements,
  medicalConditionsLoading,
  dietaryRequirementsLoading,
  accessibilityRequirementsLoading,
  createMedicalMutation,
  updateMedicalMutation,
  createDietaryMutation,
  updateDietaryMutation,
  createAccessibilityMutation,
  updateAccessibilityMutation,
  showAddMedicalForm,
  editingMedicalId,
  newMedicalCondition,
  showAddDietaryForm,
  editingDietaryId,
  newDietaryRequirement,
  showAddAccessibilityForm,
  editingAccessibilityId,
  newAccessibilityRequirement,
  handleAddMedicalCondition,
  editMedicalCondition,
  handleUpdateMedicalCondition,
  deleteMedicalCondition,
  cancelAddMedicalCondition,
  cancelEditMedicalCondition,
  handleAddDietaryRequirement,
  editDietaryRequirement,
  handleUpdateDietaryRequirement,
  deleteDietaryRequirement,
  cancelAddDietaryRequirement,
  cancelEditDietaryRequirement,
  handleAddAccessibilityRequirement,
  editAccessibilityRequirement,
  handleUpdateAccessibilityRequirement,
  deleteAccessibilityRequirement,
  cancelAddAccessibilityRequirement,
  cancelEditAccessibilityRequirement,
} = useAttendeeHealthRequirements(attendeeId)

const {
  emergencyContacts,
  emergencyContactsLoading,
  createEmergencyMutation,
  updateEmergencyMutation,
  showAddEmergencyForm,
  editingEmergencyId,
  newEmergencyContact,
  handleAddEmergencyContact,
  editEmergencyContact,
  handleUpdateEmergencyContact,
  deleteEmergencyContact,
  cancelAddEmergencyContact,
  cancelEditEmergencyContact,
} = useAttendeeEmergencyContactsEditor(attendeeId)

const {
  eventConsents,
  attendeeConsents,
  createConsentMutation,
  partialUpdateConsentMutation,
  showAddConsentForm,
  newConsent,
  handleAddConsent,
  toggleConsentGiven,
  deleteConsent,
  markAllRequiredConsentsAsGiven,
  cancelAddConsent,
} = useAttendeeConsentsEditor(attendeeId, eventId)

const {
  guardians,
  familyMemberships,
  familyGroups,
  guardianAttendees,
  createGuardianMutation,
  createFamilyMembershipMutation,
  createFamilyGroupMutation,
  showAddGuardianForm,
  showAddFamilyMembershipForm,
  showCreateFamilyGroupForm,
  newFamilyGroupName,
  newGuardian,
  guardianSearchQuery,
  selectedGuardianAttendeeId,
  filteredGuardianAttendees,
  selectedGuardianCandidate,
  selectedGuardianHasLinkedUser,
  newFamilyMembership,
  cancelAddGuardian,
  handleAddGuardian,
  deleteGuardian,
  cancelAddFamilyMembership,
  handleAddFamilyMembership,
  cancelCreateFamilyGroup,
  handleCreateFamilyGroup,
  deleteFamilyMembership,
} = useAttendeeFamilyGuardiansEditor(
  attendeeId,
  attendeeResourceId,
  eventId,
  computed(() => event.data.value?.data as any),
)

const {
  attendeeActions,
  actionTypeFilter,
  actionDateStart,
  actionDateEnd,
  filteredActions,
  exportActionsToCSV,
} = useAttendeeActionsHistoryEditor(
  attendeeId,
  computed(() => attendee.data.value?.data),
  computed(() => event.data.value?.data),
)

const {
  attendeeOrganisations,
  organisations,
  createOrganisationMutation,
  showChangeOrganisation,
  selectedOrganisation,
  handleChangeOrganisation,
  removeOrganisation,
} = useAttendeeOrganisationsEditor(attendeeId)

const {
  attendeeOrders,
  createOrderMutation,
  addOrderItemMutation,
  showCreateOrderForm,
  showAddItemFormForOrder,
  newOrderItem,
  handleCreateOrder,
  toggleAddItemForm,
  handleAddOrderItem,
  cancelOrder,
  deleteOrder,
  resetOrderItemForm,
  getOrderItemTitle,
  getOrderItemCode,
  getOrderItemImageUrl,
  getOrderItemSize,
  getOrderItemColor,
  getOrderItemColorStyle,
  getOrderStatusColor,
} = useAttendeeOrdersEditor(attendeeId, attendeeResourceId, eventId)

// ====================
// LOADING STATES
// ====================

// ====================
// MUTATIONS
// ====================
const deleteMutation = useDeleteAttendee()

// ====================
// BASIC INFO HANDLERS
// ====================
// Basic info handlers are managed in useAttendeeBasicInfoEditor.


// CONTINUE IN NEXT PART...

// Medical, dietary, and accessibility handlers are managed in useAttendeeHealthRequirements.

// ====================
// EMERGENCY CONTACTS HANDLERS
// ====================
// Emergency contacts handlers are managed in useAttendeeEmergencyContactsEditor.

// CONTINUES IN NEXT PART...

// ====================
// CONSENTS HANDLERS
// ====================
// Consent handlers are managed in useAttendeeConsentsEditor.

// ====================
// FAMILY & GUARDIANS HANDLERS
// ====================
// Family and guardians handlers are managed in useAttendeeFamilyGuardiansEditor.

// ====================
// ORGANISATIONS HANDLERS
// ====================
// Organisation handlers are managed in useAttendeeOrganisationsEditor.

// ====================
// ACTIONS HANDLERS
// ====================
// Actions handlers are managed in useAttendeeActionsHistoryEditor.

// ====================
// ORDERS HANDLERS (NEW)
// ====================
// Orders handlers are managed in useAttendeeOrdersEditor.
</script>

