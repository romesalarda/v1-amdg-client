<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data.value?.data">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Main Content (9/12) -->
      <div class="lg:col-span-9 space-y-6">
        
        <!-- Header Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
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
            <div class="flex items-center gap-2">
              <UBadge v-if="attendee.data.value?.data?.is_minor" color="amber" variant="soft">Minor</UBadge>
              <UBadge v-if="(attendee.data.value?.data as any)?.is_event_staff" color="purple" variant="soft">Staff</UBadge>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <nav class="flex gap-6">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="changeTab(tab.id)"
                :class="[
                  'py-2 px-1 border-b-2 font-semibold text-xs uppercase tracking-wide transition-colors',
                  currentTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-5">
            <!-- Overview Tab -->
            <div v-if="currentTab === 'overview'">
              <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-3">Personal Information</h3>
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

            <!-- Edit Tab -->
            <div v-if="currentTab === 'edit'">
              <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-3">Edit Basic Information</h3>
              <form @submit.prevent="handleUpdate" class="space-y-3">
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
                  <option value="friend">Friend</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
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
              <div class="flex gap-3 pt-4">
                <UButton
                  type="submit"
                  :disabled="updateMutation.isPending.value"
                  size="sm"
                  color="primary"
                >
                  {{ updateMutation.isPending.value ? 'Saving...' : 'Save Changes' }}
                </UButton>
                <UButton
                  type="button"
                  @click="changeTab('overview')"
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

        <!-- Medical Tab -->
        <section v-if="currentTab === 'medical'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-primary" />
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Medical Conditions</h2>
            </div>
            <UButton
              @click="showAddMedicalForm = true"
              size="sm"
              color="primary"
              icon="i-heroicons-plus"
            >
              Add Condition
            </UButton>
          </div>
          <div class="p-5">

            <!-- Add Medical Condition Form -->
            <div v-if="showAddMedicalForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
              <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Medical Condition</h3>
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

            <!-- Medical Conditions List -->
            <div v-if="medicalConditionsLoading" class="text-center py-8 text-gray-500 text-sm">
              Loading medical conditions...
            </div>
            <div v-else-if="!attendeeMedicalConditions.data.value?.data?.results?.length" class="text-center py-8 text-gray-500 text-sm">
              No medical conditions recorded
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="condition in attendeeMedicalConditions.data.value?.data?.results"
                :key="condition.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors bg-gray-50/30"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 text-sm">{{ condition.condition_details.label }}</h4>
                    <div class="mt-2 space-y-1">
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
                  <UButton
                    @click="deleteMedicalCondition(condition.id)"
                    size="xs"
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-trash"
                  >
                    Delete
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Dietary Tab -->
        <section v-if="currentTab === 'dietary'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-cake" class="w-4 h-4 text-primary" />
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Dietary Requirements</h2>
            </div>
            <UButton
              @click="showAddDietaryForm = true"
              size="sm"
              color="primary"
              icon="i-heroicons-plus"
            >
              Add Requirement
            </UButton>
          </div>
          <div class="p-5">

            <!-- Add Dietary Requirement Form -->
            <div v-if="showAddDietaryForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
              <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Dietary Requirement</h3>
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

            <!-- Dietary Requirements List -->
            <div v-if="dietaryRequirementsLoading" class="text-center py-8 text-gray-500 text-sm">
              Loading dietary requirements...
            </div>
            <div v-else-if="!attendeeDietaryRequirements.data.value?.data?.results?.length" class="text-center py-8 text-gray-500 text-sm">
              No dietary requirements recorded
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="requirement in attendeeDietaryRequirements.data.value?.data?.results"
                :key="requirement.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors bg-gray-50/30"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 text-sm">{{ requirement.requirement_details.label }}</h4>
                    <div class="mt-2 space-y-1">
                      <p v-if="requirement.details" class="text-xs text-gray-600">
                        <span class="font-bold uppercase tracking-wide">Details:</span> {{ requirement.details }}
                      </p>
                      <p v-if="requirement.notes" class="text-xs text-gray-600">
                        <span class="font-bold uppercase tracking-wide">Notes:</span> {{ requirement.notes }}
                      </p>
                    </div>
                  </div>
                  <UButton
                    @click="deleteDietaryRequirement(requirement.id)"
                    size="xs"
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-trash"
                  >
                    Delete
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Accessibility Tab -->
        <section v-if="currentTab === 'accessibility'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-hand-raised" class="w-4 h-4 text-primary" />
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Accessibility Requirements</h2>
            </div>
            <UButton
              @click="showAddAccessibilityForm = true"
              size="sm"
              color="primary"
              icon="i-heroicons-plus"
            >
              Add Requirement
            </UButton>
          </div>
          <div class="p-5">

            <!-- Add Accessibility Requirement Form -->
            <div v-if="showAddAccessibilityForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
              <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Accessibility Requirement</h3>
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

            <!-- Accessibility Requirements List -->
            <div v-if="accessibilityRequirementsLoading" class="text-center py-8 text-gray-500 text-sm">
              Loading accessibility requirements...
            </div>
            <div v-else-if="!attendeeAccessibilityRequirements.data.value?.data?.results?.length" class="text-center py-8 text-gray-500 text-sm">
              No accessibility requirements recorded
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="requirement in attendeeAccessibilityRequirements.data.value?.data?.results"
                :key="requirement.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors bg-gray-50/30"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 text-sm">{{ requirement.requirement_details.label }}</h4>
                    <div class="mt-2 space-y-1">
                      <p v-if="requirement.details" class="text-xs text-gray-600">
                        <span class="font-bold uppercase tracking-wide">Details:</span> {{ requirement.details }}
                      </p>
                      <p v-if="requirement.notes" class="text-xs text-gray-600">
                        <span class="font-bold uppercase tracking-wide">Notes:</span> {{ requirement.notes }}
                      </p>
                    </div>
                  </div>
                  <UButton
                    @click="deleteAccessibilityRequirement(requirement.id)"
                    size="xs"
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-trash"
                  >
                    Delete
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Emergency Contacts Tab -->
        <section v-if="currentTab === 'emergency'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-primary" />
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Emergency Contacts</h2>
            </div>
            <UButton
              @click="showAddEmergencyForm = true"
              size="sm"
              color="primary"
              icon="i-heroicons-plus"
            >
              Add Contact
            </UButton>
          </div>
          <div class="p-5">

            <!-- Add Emergency Contact Form -->
            <div v-if="showAddEmergencyForm" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
              <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Emergency Contact</h3>
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
                    id="primary"
                    class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                  />
                  <label for="primary" class="ml-2 text-xs font-medium text-gray-700">Primary Contact</label>
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

            <!-- Emergency Contacts List -->
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
                class="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-colors bg-gray-50/30"
              >
                <div class="flex items-start justify-between">
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
                  <UButton
                    @click="deleteEmergencyContact(contact.id)"
                    size="xs"
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-trash"
                  >
                    Delete
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- History Tab -->
        <section v-if="currentTab === 'history'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-primary" />
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Attendance History</h2>
            </div>
          </div>
          <div class="p-5">
            <div class="text-center py-8 text-gray-500 text-sm">
              History tracking coming soon
            </div>
          </div>
        </section>
      </section>
      </div>

      <!-- Sidebar (3/12) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Quick Actions -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-3 bg-gradient-to-r from-primary to-deep-navy">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-black text-white uppercase tracking-widest">
                Quick Actions
              </h3>
            </div>
          </div>

          <div class="p-5 space-y-3">
            <UButton
              @click="changeTab('edit')"
              block
              size="sm"
              color="primary"
              icon="i-heroicons-pencil-square"
            >
              Edit Details
            </UButton>
            
            <UButton
              :to="`/events/${eventId}/m/participants/dashboard`"
              block
              size="sm"
              variant="outline"
              color="gray"
              icon="i-heroicons-arrow-left"
            >
              Back to List
            </UButton>
            
            <div class="pt-3 border-t border-gray-200">
              <UButton
                @click="confirmDelete"
                block
                size="sm"
                color="red"
                variant="soft"
                icon="i-heroicons-trash"
              >
                Delete Participant
              </UButton>
            </div>
          </div>
        </section>

        <!-- Info Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-primary" />
            <h3 class="text-xs font-black text-primary uppercase tracking-widest">Participant Info</h3>
          </div>
          <div class="p-5 space-y-3">
            <div v-if="attendee.data.value?.data">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500 font-semibold uppercase">Status</span>
                <UBadge :color="(attendee.data.value?.data as any)?.is_checked_in ? 'green' : 'gray'" variant="soft" size="xs">
                  {{ (attendee.data.value?.data as any)?.is_checked_in ? 'Checked In' : 'Not Checked In' }}
                </UBadge>
              </div>
              
              <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                <span class="text-gray-500 font-semibold uppercase">Medical</span>
                <UBadge :color="attendeeMedicalConditions.data.value?.data?.count ? 'red' : 'gray'" variant="soft" size="xs">
                  {{ attendeeMedicalConditions.data.value?.data?.count || 0 }}
                </UBadge>
              </div>
              
              <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                <span class="text-gray-500 font-semibold uppercase">Dietary</span>
                <UBadge :color="attendeeDietaryRequirements.data.value?.data?.count ? 'amber' : 'gray'" variant="soft" size="xs">
                  {{ attendeeDietaryRequirements.data.value?.data?.count || 0 }}
                </UBadge>
              </div>
              
              <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                <span class="text-gray-500 font-semibold uppercase">Accessibility</span>
                <UBadge :color="attendeeAccessibilityRequirements.data.value?.data?.count ? 'blue' : 'gray'" variant="soft" size="xs">
                  {{ attendeeAccessibilityRequirements.data.value?.data?.count || 0 }}
                </UBadge>
              </div>
              
              <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                <span class="text-gray-500 font-semibold uppercase">Emergency Contacts</span>
                <UBadge :color="emergencyContacts.data.value?.data?.count ? 'purple' : 'gray'" variant="soft" size="xs">
                  {{ emergencyContacts.data.value?.data?.count || 0 }}
                </UBadge>
              </div>
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
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useAttendee, useUpdateAttendee, useDeleteAttendee } from '~/composables/resources/attendee/attendees'
import { useEvent } from '~/composables/resources/events/events'
import { useAreas } from '~/composables/resources/locations/locations'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { 
  useAttendeeMedicalConditions, 
  useCreateAttendeeMedicalCondition, 
  useDeleteAttendeeMedicalCondition 
} from '~/composables/resources/attendee/attendeeMedicalConditions'
import {
  useAttendeeDietaryRequirements,
  useCreateAttendeeDietaryRequirement,
  useDeleteAttendeeDietaryRequirement
} from '~/composables/resources/attendee/attendeeDietaryRequirementsRelationship'
import {
  useAttendeeAccessibilityRequirements,
  useCreateAttendeeAccessibilityRequirement,
  useDeleteAttendeeAccessibilityRequirement
} from '~/composables/resources/attendee/attendeeAccessibilityRequirements'
import {
  useAttendeeEmergencyContacts,
  useCreateAttendeeEmergencyContact,
  useDeleteAttendeeEmergencyContact
} from '~/composables/resources/attendee/attendeeEmergencyContacts'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'

const route = useRoute()
const router = useRouter()

const attendeeId = computed(() => route.params.attendee_id as string)
const eventId = computed(() => route.params.id as string)
const currentTab = ref((route.query.tab as string) || 'overview')

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'edit', label: 'Edit' },
  { id: 'medical', label: 'Medical' },
  { id: 'dietary', label: 'Dietary' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'emergency', label: 'Emergency Contacts' },
  { id: 'history', label: 'History' },
]

// Data queries
const attendee = useAttendee(attendeeId)
const event = useEvent(eventId)
const areas = useAreas()

// Options for dropdowns
const medicalConditions = useMedicalConditions()
const dietaryRequirements = useDietaryRequirements()
const accessibilityRequirements = useAccessibilityRequirements()

// Relationship data
const attendeeMedicalConditions = useAttendeeMedicalConditions(attendeeId)
const attendeeDietaryRequirements = useAttendeeDietaryRequirements(attendeeId)
const attendeeAccessibilityRequirements = useAttendeeAccessibilityRequirements(attendeeId)
const emergencyContacts = useAttendeeEmergencyContacts(attendeeId)

// Loading states
const medicalConditionsLoading = computed(() => attendeeMedicalConditions.isLoading.value)
const dietaryRequirementsLoading = computed(() => attendeeDietaryRequirements.isLoading.value)
const accessibilityRequirementsLoading = computed(() => attendeeAccessibilityRequirements.isLoading.value)
const emergencyContactsLoading = computed(() => emergencyContacts.isLoading.value)

// Mutations
const updateMutation = useUpdateAttendee()
const deleteMutation = useDeleteAttendee()
const createMedicalMutation = useCreateAttendeeMedicalCondition()
const deleteMedicalMutation = useDeleteAttendeeMedicalCondition()
const createDietaryMutation = useCreateAttendeeDietaryRequirement()
const deleteDietaryMutation = useDeleteAttendeeDietaryRequirement()
const createAccessibilityMutation = useCreateAttendeeAccessibilityRequirement()
const deleteAccessibilityMutation = useDeleteAttendeeAccessibilityRequirement()
const createEmergencyMutation = useCreateAttendeeEmergencyContact()
const deleteEmergencyMutation = useDeleteAttendeeEmergencyContact()

// Form data
const formData = ref<{
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_birth: string
  gender: string
  relationship_to_user: 'child' | 'friend' | 'other' | 'parent' | 'sibling' | 'spouse' | 'self' | ''
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

// Forms visibility
const showAddMedicalForm = ref(false)
const showAddDietaryForm = ref(false)
const showAddAccessibilityForm = ref(false)
const showAddEmergencyForm = ref(false)

// New item forms
const newMedicalCondition = ref({
  medical_condition: null as number | null,
  severity: '',
  details: '',
  notes: '',
})

const newDietaryRequirement = ref({
  dietary_requirement: null as number | null,
  details: '',
  notes: '',
})

const newAccessibilityRequirement = ref({
  accessibility_requirement: null as number | null,
  details: '',
  notes: '',
})

const newEmergencyContact = ref({
  first_name: '',
  last_name: '',
  relationship: '',
  phone_number: '',
  email: '',
  primary_contact: false,
})

// Zod schemas
const medicalConditionSchema = z.object({
  medical_condition: z.number({ required_error: 'Please select a condition' }),
  severity: z.enum(['mild', 'moderate', 'severe', '']).optional(),
  details: z.string().optional(),
  notes: z.string().optional(),
})

const dietaryRequirementSchema = z.object({
  dietary_requirement: z.number({ required_error: 'Please select a requirement' }),
  details: z.string().optional(),
  notes: z.string().optional(),
})

const accessibilityRequirementSchema = z.object({
  accessibility_requirement: z.number({ required_error: 'Please select a requirement' }),
  details: z.string().optional(),
  notes: z.string().optional(),
})

const emergencyContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  relationship: z.enum(['parent', 'sibling', 'child', 'spouse', 'friend', 'other'], {
    required_error: 'Please select a relationship',
  }),
  phone_number: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  primary_contact: z.boolean().optional(),
})

// Initialize form data
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

// Tab navigation
const changeTab = (tabId: string) => {
  currentTab.value = tabId
  router.replace({ query: { tab: tabId } })
}

// Update basic info
const handleUpdate = async () => {
  try {
    await updateMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        ...formData.value,
        relationship_to_user: formData.value.relationship_to_user || undefined,
      },
    })
    changeTab('overview')
  } catch (error) {
    console.error('Failed to update attendee:', error)
  }
}

// Medical conditions
const handleAddMedicalCondition = async () => {
  const result = medicalConditionSchema.safeParse(newMedicalCondition.value)
  if (!result.success) {
    alert(result.error.errors.map(e => e.message).join('\n'))
    return
  }
  
  try {

    if (!attendee.data.value?.data?.attendee_id) {
      alert('Attendee must be saved before adding medical conditions.')
      return
    }
    
    await createMedicalMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        attendee: (attendee.data.value?.data?.attendee_id) as any,
        medical_condition: newMedicalCondition.value.medical_condition!,
        severity: (newMedicalCondition.value.severity || null) as any,
        details: newMedicalCondition.value.details || null,
        notes: newMedicalCondition.value.notes || null,
      },
    })
    cancelAddMedicalCondition()
  } catch (error) {
    console.error('Failed to add medical condition:', error)
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

const deleteMedicalCondition = async (conditionId: number) => {
  if (!confirm('Are you sure you want to delete this medical condition?')) return
  
  try {
    await deleteMedicalMutation.mutateAsync({
      attendeeId: attendeeId.value,
      conditionId,
    })
  } catch (error) {
    console.error('Failed to delete medical condition:', error)
  }
}

// Dietary requirements
const handleAddDietaryRequirement = async () => {
  const result = dietaryRequirementSchema.safeParse(newDietaryRequirement.value)
  if (!result.success) {
    alert(result.error.errors.map(e => e.message).join('\n'))
    return
  }
  
  try {
    await createDietaryMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        dietary_requirement: newDietaryRequirement.value.dietary_requirement!,
        details: newDietaryRequirement.value.details || null,
        notes: newDietaryRequirement.value.notes || null,
      },
    })
    cancelAddDietaryRequirement()
  } catch (error) {
    console.error('Failed to add dietary requirement:', error)
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

const deleteDietaryRequirement = async (requirementId: number) => {
  if (!confirm('Are you sure you want to delete this dietary requirement?')) return
  
  try {
    await deleteDietaryMutation.mutateAsync({
      attendeeId: attendeeId.value,
      requirementId,
    })
  } catch (error) {
    console.error('Failed to delete dietary requirement:', error)
  }
}

// Accessibility requirements
const handleAddAccessibilityRequirement = async () => {
  const result = accessibilityRequirementSchema.safeParse(newAccessibilityRequirement.value)
  if (!result.success) {
    alert(result.error.errors.map(e => e.message).join('\n'))
    return
  }
  
  try {
    await createAccessibilityMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        accessibility_requirement: newAccessibilityRequirement.value.accessibility_requirement!,
        details: newAccessibilityRequirement.value.details || null,
        notes: newAccessibilityRequirement.value.notes || null,
      },
    })
    cancelAddAccessibilityRequirement()
  } catch (error) {
    console.error('Failed to add accessibility requirement:', error)
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

const deleteAccessibilityRequirement = async (requirementId: number) => {
  if (!confirm('Are you sure you want to delete this accessibility requirement?')) return
  
  try {
    await deleteAccessibilityMutation.mutateAsync({
      attendeeId: attendeeId.value,
      requirementId,
    })
  } catch (error) {
    console.error('Failed to delete accessibility requirement:', error)
  }
}

// Emergency contacts
const handleAddEmergencyContact = async () => {
  const result = emergencyContactSchema.safeParse(newEmergencyContact.value)
  if (!result.success) {
    alert(result.error.errors.map(e => e.message).join('\n'))
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
  } catch (error) {
    console.error('Failed to add emergency contact:', error)
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

const deleteEmergencyContact = async (contactId: number) => {
  if (!confirm('Are you sure you want to delete this emergency contact?')) return
  
  try {
    await deleteEmergencyMutation.mutateAsync({
      attendeeId: attendeeId.value,
      contactId,
    })
  } catch (error) {
    console.error('Failed to delete emergency contact:', error)
  }
}

// Delete attendee
const confirmDelete = async () => {
  if (!confirm(`Are you sure you want to delete ${attendee.data.value?.data?.full_name}? This action cannot be undone.`)) return
  
  try {
    await deleteMutation.mutateAsync(attendeeId.value)
    router.push(`/events/${eventId.value}/m/participants/dashboard`)
  } catch (error) {
    console.error('Failed to delete attendee:', error)
  }
}

definePageMeta({
  layout: false
})
</script>
