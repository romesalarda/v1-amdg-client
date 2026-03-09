<template>
  <EventManagementLayout :event-id="eventId" :event="event?.data.value?.data">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <!-- Main Content (Left - 8/12 on xl, 12/12 on smaller) -->
      <div class="xl:col-span-8 space-y-6">
        
        <!-- Header Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <!-- Mobile Header - Only visible on mobile -->
          <div class="xl:hidden px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-4">
              <!-- Profile Picture -->
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

          <!-- Desktop Header - Only visible on desktop -->
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

          <!-- Tab Navigation - Responsive -->
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

            <!-- Desktop Horizontal Scrollable Tabs -->
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
            <div v-if="showAddMedicalForm && !editingMedicalId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
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
                class="border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
                :class="editingMedicalId === condition.id ? 'p-0' : 'p-4'"
              >
                <!-- Edit Form (when editing this item) -->
                <div v-if="editingMedicalId === condition.id" class="p-4">
                  <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Edit Medical Condition</div>
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
                          v-for="c in medicalConditions.data.value?.data?.results"
                          :key="c.id"
                          :value="c.id"
                        >
                          {{ c.label }}
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
                    <div class="flex gap-2">
                      <UButton type="submit" :disabled="updateMedicalMutation.isPending.value" size="sm" color="green">
                        {{ updateMedicalMutation.isPending.value ? 'Updating...' : 'Update' }}
                      </UButton>
                      <UButton type="button" @click="cancelEditMedicalCondition" size="sm" variant="ghost" color="gray">
                        Cancel
                      </UButton>
                    </div>
                  </form>
                </div>

                <!-- Display Mode (when not editing) -->
                <div v-else class="flex items-start justify-between">
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
                  <div class="flex gap-2">
                    <UButton
                      @click="editMedicalCondition(condition)"
                      size="xs"
                      color="primary"
                      variant="ghost"
                      icon="i-heroicons-pencil-square"
                    >
                      Edit
                    </UButton>
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
            <div v-if="showAddDietaryForm && !editingDietaryId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
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
                :class="editingDietaryId === requirement.id ? 'p-0' : 'p-4'"
                class="border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
              >
                <!-- Inline Edit Form -->
                <div v-if="editingDietaryId === requirement.id" class="p-4">
                  <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Editing Dietary Requirement</h3>
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
                <div v-else>
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
                    <div class="flex gap-1">
                      <UButton
                        @click="editDietaryRequirement(requirement)"
                        size="xs"
                        color="primary"
                        variant="ghost"
                        icon="i-heroicons-pencil-square"
                      >
                        Edit
                      </UButton>
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
            <div v-if="showAddAccessibilityForm && !editingAccessibilityId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
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
                :class="editingAccessibilityId === requirement.id ? 'p-0' : 'p-4'"
                class="border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
              >
                <!-- Inline Edit Form -->
                <div v-if="editingAccessibilityId === requirement.id" class="p-4">
                  <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Editing Accessibility Requirement</h3>
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
                <div v-else>
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
                    <div class="flex gap-1">
                      <UButton
                        @click="editAccessibilityRequirement(requirement)"
                        size="xs"
                        color="primary"
                        variant="ghost"
                        icon="i-heroicons-pencil-square"
                      >
                        Edit
                      </UButton>
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
            <div v-if="showAddEmergencyForm && !editingEmergencyId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
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
                :class="editingEmergencyId === contact.id ? 'p-0' : 'p-4'"
                class="border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30"
              >
                <!-- Inline Edit Form -->
                <div v-if="editingEmergencyId === contact.id" class="p-4">
                  <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Editing Emergency Contact</h3>
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
                <div v-else>
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
                    <div class="flex gap-1">
                      <UButton
                        @click="editEmergencyContact(contact)"
                        size="xs"
                        color="primary"
                        variant="ghost"
                        icon="i-heroicons-pencil-square"
                      >
                        Edit
                      </UButton>
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
            </div>
          </div>
        </section>

        <!-- Booking Tab -->
        <section v-if="currentTab === 'booking'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-ticket" class="w-4 h-4 text-primary" />
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Booking Information</h2>
            </div>
          </div>
          <div class="p-5">
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
                      <p class="text-xs text-gray-600">{{ payment.amount }}</p>
                    </div>
                    <UBadge 
                      :color="payment.status === 'completed' ? 'green' : payment.status === 'pending' ? 'amber' : 'red'" 
                      variant="soft" 
                      size="xs"
                    >
                      {{ payment.status }}
                    </UBadge>
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
        </section>

        <!-- Actions Tab -->
        <section v-if="currentTab === 'actions'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-4 h-4 text-primary" />
                <h2 class="text-xs font-black text-primary uppercase tracking-widest">Action History</h2>
              </div>
              <   <UButton
                @click="exportActionsToCSV"
                size="xs"
                color="primary"
                variant="outline"
                icon="i-heroicons-arrow-down-tray"
              >
                Export CSV
              </UButton>
            </div>
          </div>
          <div class="p-5">
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
        </section>

        <!-- Consents Tab -->
        <section v-if="currentTab === 'consents'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-document-check" class="w-4 h-4 text-primary" />
                <h2 class="text-xs font-black text-primary uppercase tracking-widest">Consents</h2>
              </div>
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
          </div>
          <div class="p-5">
            <!-- Add Form -->
            <div v-if="showAddConsentForm" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-3">Add Consent</h3>
              <form @submit.prevent="handleAddConsent" class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Select Consent *</label>
                  <select
                    v-model="newConsent.consent"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option :value="null">Choose a consent...</option>
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
                    id="consent-given"
                    class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                  />
                  <label for="consent-given" class="ml-2 text-xs font-medium text-gray-700">Consent Given</label>
                </div>
                <div class="flex gap-2">
                  <UButton
                    type="submit"
                    :disabled="createConsentMutation.isPending.value"
                    size="sm"
                    color="primary"
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

            <div v-if="attendeeConsents.isLoading.value" class="text-center py-8 text-gray-500 text-sm">
              Loading consents...
            </div>
            <div v-else-if="!attendeeConsents.data.value?.data?.results?.length" class="text-center py-8 text-gray-500 text-sm">
              No consents recorded
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="consentRecord in attendeeConsents.data.value.data.results"
                :key="consentRecord.id"
                class="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="text-sm font-semibold text-gray-900">{{ consentRecord.consent_details?.title }}</h4>
                      <UBadge v-if="consentRecord.consent_details?.required" color="amber" size="xs">Required</UBadge>
                    </div>
                    <p class="text-xs text-gray-600 mb-2">{{ consentRecord.consent_details?.description }}</p>
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2">
                        <label class="text-xs font-medium text-gray-700">Given:</label>
                        <button
                          @click="toggleConsentGiven(consentRecord)"
                          :class="[
                            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                            consentRecord.consent_given ? 'bg-green-600' : 'bg-gray-300'
                          ]"
                        >
                          <span
                            :class="[
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              consentRecord.consent_given ? 'translate-x-5' : 'translate-x-1'
                            ]"
                          />
                        </button>
                      </div>
                      <p v-if="consentRecord.given_at" class="text-xs text-gray-600">
                        Given: {{ new Date(consentRecord.given_at).toLocaleString() }}
                      </p>
                    </div>
                  </div>
                  <UButton
                    @click="deleteConsent(consentRecord.id)"
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

        <!-- Organisations Tab -->
        <section v-if="currentTab === 'organisations'" class="bg-white border border-deep-navy/10 shadow-drawn">
          <div class="px-5 py-3 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-building-office" class="w-4 h-4 text-primary" />
              <h2 class="text-xs font-black text-primary uppercase tracking-widest">Organisation</h2>
            </div>
          </div>
          <div class="p-5">
            <div v-if="attendeeOrganisations.isLoading.value" class="text-center py-8 text-gray-500 text-sm">
              Loading organisation...
            </div>
            <div v-else>
              <!-- Current Organisation -->
              <div v-if="attendeeOrganisations.data.value?.data?.results?.length">
                <div
                  v-for="org in attendeeOrganisations.data.value.data.results"
                  :key="org.id"
                  class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
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
                      >
                        Remove
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="mb-4 text-center py-8 text-gray-500 text-sm">
                <p>No organisation assigned</p>
                <UButton
                  @click="showChangeOrganisation = true"
                  size="sm"
                  color="primary"
                  class="mt-3"
                  icon="i-heroicons-plus"
                >
                  Assign Organisation
                </UButton>
              </div>

              <!-- Change Organisation Form -->
              <div v-if="showChangeOrganisation" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-3">Change Organisation</h3>
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

      <!-- Sidebar (4/12) - Hidden on mobile, visible on xl -->
      <div class="hidden xl:block xl:col-span-4 space-y-6">
        <!-- Profile Card -->
        <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden sticky top-6">
          <!-- Profile Picture Section -->
           <!-- {{ attendee }} -->
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
                  :title="'Linked to user account'"
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
                <UBadge v-if="attendee.data.value?.data?.gender" color="gray" variant="soft" size="xs">
                  {{ attendee.data.value?.data?.gender }}
                </UBadge>
              </div>

              <!-- Status Badges -->
              <div class="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-gray-100">
                <UBadge v-if="(attendee.data.value?.data as any)?.is_checked_in" color="green" variant="soft" size="xs">
                  ✓ Checked In
                </UBadge>
                <UBadge v-if="(attendee.data.value?.data as any)?.is_event_staff" color="purple" variant="soft" size="xs">
                  Staff
                </UBadge>
                <UBadge v-if="(attendee.data.value?.data as any)?.is_cancelled" color="red" variant="soft" size="xs">
                  Cancelled
                </UBadge>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="px-6 pb-6 space-y-3">
            <div v-if="attendee.data.value?.data?.email" class="flex items-start gap-3 text-sm">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-0.5">Email</p>
                <a :href="`mailto:${attendee.data.value?.data?.email}`" class="text-primary hover:underline break-all">
                  {{ attendee.data.value?.data?.email }}
                </a>
              </div>
            </div>

            <div v-if="attendee.data.value?.data?.phone_number" class="flex items-start gap-3 text-sm">
              <UIcon name="i-heroicons-phone" class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-0.5">Phone</p>
                <a :href="`tel:${attendee.data.value?.data?.phone_number}`" class="text-gray-900 hover:text-primary">
                  {{ attendee.data.value?.data?.phone_number }}
                </a>
              </div>
            </div>

            <div v-if="attendee.data.value?.data?.area_from_name" class="flex items-start gap-3 text-sm">
              <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-0.5">Area From</p>
                <p class="text-gray-900">{{ attendee.data.value?.data?.area_from_name }}</p>
              </div>
            </div>

            <div v-if="(attendee.data.value?.data as any)?.booking_id" class="flex items-start gap-3 text-sm">
              <UIcon name="i-heroicons-ticket" class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-0.5">Booking</p>
                <p class="text-gray-900 font-mono text-xs">#{{ (attendee.data.value?.data as any)?.booking_id?.slice(0, 8) }}...</p>
              </div>
            </div>
          </div>

          <!-- Requirements Summary -->
          <div class="px-6 pb-6">
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 class="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Requirements</h3>
              
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-heart" class="w-4 h-4 text-red-500" />
                  <span class="text-gray-700">Medical</span>
                </div>
                <UBadge :color="attendeeMedicalConditions.data.value?.data?.count ? 'red' : 'gray'" variant="soft" size="xs">
                  {{ attendeeMedicalConditions.data.value?.data?.count || 0 }}
                </UBadge>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-cake" class="w-4 h-4 text-amber-500" />
                  <span class="text-gray-700">Dietary</span>
                </div>
                <UBadge :color="attendeeDietaryRequirements.data.value?.data?.count ? 'amber' : 'gray'" variant="soft" size="xs">
                  {{ attendeeDietaryRequirements.data.value?.data?.count || 0 }}
                </UBadge>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-heart-circle" class="w-4 h-4 text-blue-500" />
                  <span class="text-gray-700">Accessibility</span>
                </div>
                <UBadge :color="attendeeAccessibilityRequirements.data.value?.data?.count ? 'blue' : 'gray'" variant="soft" size="xs">
                  {{ attendeeAccessibilityRequirements.data.value?.data?.count || 0 }}
                </UBadge>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-phone-arrow-up-right" class="w-4 h-4 text-purple-500" />
                  <span class="text-gray-700">Emergency Contacts</span>
                </div>
                <UBadge :color="emergencyContacts.data.value?.data?.count ? 'purple' : 'gray'" variant="soft" size="xs">
                  {{ emergencyContacts.data.value?.data?.count || 0 }}
                </UBadge>
              </div>
            </div>
          </div>

          <!-- User Link Info -->
          <div v-if="linkedUserId" class="px-6 pb-6">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <UIcon name="i-heroicons-link" class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-green-900 mb-1">Linked Account</p>
                  <p class="text-xs text-green-700">
                    This attendee is linked to a user account
                    <span v-if="linkedUserProfile">({{ linkedUserProfile.preferred_name || linkedUserProfile.full_name }})</span>
                  </p>
                  <UButton
                    v-if="attendee.data.value?.data?.relationship_to_user === 'self' && !syncingFromUser"
                    @click="syncFromUserProfile"
                    size="xs"
                    color="green"
                    variant="soft"
                    class="mt-2"
                    icon="i-heroicons-arrow-path"
                  >
                    Sync from Profile Data
                  </UButton>
                  <div v-if="syncingFromUser" class="mt-2 flex items-center gap-2 text-xs text-green-700">
                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="px-6 pb-6 space-y-2">
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
import { useProfile, useProfiles } from '~/composables/resources/user/profiles'
import { useMedicalConditions } from '~/composables/resources/attendee/bookingMedicalConditions'
import { useDietaryRequirements } from '~/composables/resources/attendee/attendeeDietaryRequirements'
import { useAccessibilityRequirements } from '~/composables/resources/attendee/accessibilityRequirements'
import { useBooking } from '~/composables/resources/booking/bookings'
import { useAttendeeActions } from '~/composables/resources/attendee/attendeeActions'
import { useConsents } from '~/composables/resources/attendee/attendeeConsents'
import { useAttendeeConsents, useCreateAttendeeConsent, useUpdateAttendeeConsent, usePartialUpdateAttendeeConsent, useDeleteAttendeeConsent } from '~/composables/resources/attendee/attendeeConsentsRelationship'
import { useAttendeeOrganisations, useCreateAttendeeOrganisation, useDeleteAttendeeOrganisation } from '~/composables/resources/attendee/attendeeOrganisations'
import { useOrganisations } from '~/composables/resources/organisation/organisations'
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
import {
  useAttendeeEmergencyContacts,
  useCreateAttendeeEmergencyContact,
  useUpdateAttendeeEmergencyContact,
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
  { id: 'booking', label: 'Booking' },
  { id: 'medical', label: 'Medical' },
  { id: 'dietary', label: 'Dietary' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'emergency', label: 'Emergency Contacts' },
  { id: 'actions', label: 'Actions' },
  { id: 'consents', label: 'Consents' },
  { id: 'organisations', label: 'Organisation' },
  { id: 'history', label: 'History' },
]

// Data queries
const attendee = useAttendee(attendeeId)
const event = useEvent(eventId)
const areas = useAreas()

// Parse user ID from attendee's _links.user URL
const linkedUserId = computed(() => {
  const userLink = attendee.data.value?.data?._links?.user
  if (!userLink) return null
  
  // Extract user ID from URL like "/api/users/123/"
  const match = userLink.match(/\/users\/(\d+)/)
  return match ? parseInt(match[1]) : null
})

// Fetch linked profile data by user ID (public information only)
const linkedProfilesQuery = useProfiles(computed(() => 
  linkedUserId.value ? { user: linkedUserId.value } : undefined
))
const linkedUserProfile = computed(() => 
  linkedProfilesQuery.data.value?.data?.results?.[0] || null
)

// State for sync functionality
const syncingFromUser = ref(false)
const toast = useToast()

// Booking data
const booking = useBooking(computed(() => attendee.data.value?.data?.booking || 0))

// Actions data
const attendeeActions = useAttendeeActions(computed(() => ({ attendee: attendeeId.value })))
const actionTypeFilter = ref<string>('')
const actionDateStart = ref<string>('')
const actionDateEnd = ref<string>('')

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

// Consents data
const eventConsents = useConsents(computed(() => ({ event: eventId.value })))
const attendeeConsents = useAttendeeConsents(attendeeId)
const showAddConsentForm = ref(false)
const editingConsentId = ref<number | null>(null)
const newConsent = ref<{
  consent: number | null
  consent_given: boolean
}>({ consent: null, consent_given: false })

// Organisations data
const attendeeOrganisations = useAttendeeOrganisations(attendeeId)
const organisations = useOrganisations(computed(() => ({ page_size: 100 })))
const showChangeOrganisation = ref(false)
const selectedOrganisation = ref<number | null>(null)

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
const updateMedicalMutation = useUpdateAttendeeMedicalCondition()
const deleteMedicalMutation = useDeleteAttendeeMedicalCondition()
const createDietaryMutation = useCreateAttendeeDietaryRequirement()
const updateDietaryMutation = useUpdateAttendeeDietaryRequirement()
const deleteDietaryMutation = useDeleteAttendeeDietaryRequirement()
const createAccessibilityMutation = useCreateAttendeeAccessibilityRequirement()
const updateAccessibilityMutation = useUpdateAttendeeAccessibilityRequirement()
const deleteAccessibilityMutation = useDeleteAttendeeAccessibilityRequirement()
const createEmergencyMutation = useCreateAttendeeEmergencyContact()
const updateEmergencyMutation = useUpdateAttendeeEmergencyContact()
const deleteEmergencyMutation = useDeleteAttendeeEmergencyContact()
const createConsentMutation = useCreateAttendeeConsent()
const updateConsentMutation = useUpdateAttendeeConsent()
const partialUpdateConsentMutation = usePartialUpdateAttendeeConsent()
const deleteConsentMutation = useDeleteAttendeeConsent()
const createOrganisationMutation = useCreateAttendeeOrganisation()
const deleteOrganisationMutation = useDeleteAttendeeOrganisation()

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

// Edit tracking
const editingMedicalId = ref<number | null>(null)
const editingDietaryId = ref<number | null>(null)
const editingAccessibilityId = ref<number | null>(null)
const editingEmergencyId = ref<number | null>(null)

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
  
  const result = medicalConditionSchema.safeParse(newMedicalCondition.value)
  if (!result.success) {
    alert(result.error.errors.map(e => e.message).join('\n'))
    return
  }
  
  try {
    await updateMedicalMutation.mutateAsync({
      attendeeId: attendeeId.value,
      conditionId: editingMedicalId.value,
      body: {
        attendee: (attendee.data.value?.data?.attendee_id) as any,
        medical_condition: newMedicalCondition.value.medical_condition!,
        severity: (newMedicalCondition.value.severity || null) as any,
        details: newMedicalCondition.value.details || null,
        notes: newMedicalCondition.value.notes || null,
      },
    })
    cancelEditMedicalCondition()
  } catch (error) {
    console.error('Failed to update medical condition:', error)
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
  
  const result = dietaryRequirementSchema.safeParse(newDietaryRequirement.value)
  if (!result.success) {
    alert(result.error.errors.map(e => e.message).join('\n'))
    return
  }
  
  try {
    await updateDietaryMutation.mutateAsync({
      attendeeId: attendeeId.value,
      requirementId: editingDietaryId.value,
      body: {
        dietary_requirement: newDietaryRequirement.value.dietary_requirement!,
        details: newDietaryRequirement.value.details || null,
        notes: newDietaryRequirement.value.notes || null,
      },
    })
    cancelEditDietaryRequirement()
  } catch (error) {
    console.error('Failed to update dietary requirement:', error)
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
  
  const result = accessibilityRequirementSchema.safeParse(newAccessibilityRequirement.value)
  if (!result.success) {
    alert(result.error.errors.map(e => e.message).join('\n'))
    return
  }
  
  try {
    await updateAccessibilityMutation.mutateAsync({
      attendeeId: attendeeId.value,
      requirementId: editingAccessibilityId.value,
      body: {
        accessibility_requirement: newAccessibilityRequirement.value.accessibility_requirement!,
        details: newAccessibilityRequirement.value.details || null,
        notes: newAccessibilityRequirement.value.notes || null,
      },
    })
    cancelEditAccessibilityRequirement()
  } catch (error) {
    console.error('Failed to update accessibility requirement:', error)
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
  
  const result = emergencyContactSchema.safeParse(newEmergencyContact.value)
  if (!result.success) {
    alert(result.error.errors.map(e => e.message).join('\n'))
    return
  }
  
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
  } catch (error) {
    console.error('Failed to update emergency contact:', error)
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

// Actions - Export to CSV
const exportActionsToCSV = () => {
  const actions = filteredActions.value
  if (!actions.length) {
    alert('No actions to export')
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

// Consents - CRUD operations
const handleAddConsent = async () => {
  if (!newConsent.value.consent) {
    alert('Please select a consent')
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
  } catch (error) {
    console.error('Failed to add consent:', error)
    alert('Failed to add consent. It may already exist.')
  }
}

const cancelAddConsent = () => {
  showAddConsentForm.value = false
  newConsent.value = {
    consent: null,
    consent_given: false,
  }
}

const toggleConsentGiven = async (consentRecord: any) => {
  try {
    await partialUpdateConsentMutation.mutateAsync({
      attendeeId: attendeeId.value,
      consentId: consentRecord.id,
      body: {
        consent_given: !consentRecord.consent_given,
        given_at: !consentRecord.consent_given ? new Date(). toISOString() : null,
      } as any,
    })
  } catch (error) {
    console.error('Failed to toggle consent:', error)
  }
}

const deleteConsent = async (consentId: number) => {
  if (!confirm('Are you sure you want to delete this consent record?')) return

  try {
    await deleteConsentMutation.mutateAsync({
      attendeeId: attendeeId.value,
      consentId,
    })
  } catch (error) {
    console.error('Failed to delete consent:', error)
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
    alert('All required consents marked as given')
  } catch (error) {
    console.error('Failed to mark consents:', error)
    alert('Failed to mark some consents. Please try again.')
  }
}

// Organisations - Management
const handleChangeOrganisation = async () => {
  if (!selectedOrganisation.value) {
    alert('Please select an organisation')
    return
  }

  try {
    // Delete existing organisation if any
    const existing = attendeeOrganisations.data.value?.data?.results?.[0]
    if (existing) {
      await deleteOrganisationMutation.mutateAsync({
        attendeeId: attendeeId.value,
        organisationId: existing.id,
      })
    }

    // Create new organisation association
    await createOrganisationMutation.mutateAsync({
      attendeeId: attendeeId.value,
      body: {
        organisation: selectedOrganisation.value,
      } as any,
    })

    showChangeOrganisation.value = false
    selectedOrganisation.value = null
  } catch (error) {
    console.error('Failed to change organisation:', error)
    alert('Failed to change organisation')
  }
}

const removeOrganisation = async (organisationId: number) => {
  if (!confirm('Are you sure you want to remove this organisation?')) return

  try {
    await deleteOrganisationMutation.mutateAsync({
      attendeeId: attendeeId.value,
      organisationId,
    })
  } catch (error) {
    console.error('Failed to remove organisation:', error)
  }
}

// Sync from User Profile
const syncFromUserProfile = async () => {
  if (!linkedUserProfile.value) {
    toast.add({
      title: 'Error',
      description: 'No profile data found to sync from',
      color: 'red',
    })
    return
  }

  syncingFromUser.value = true

  try {
    const profile = linkedUserProfile.value

    // Build update data from profile (public data only)
    const updateData: any = {}
    
    // Note: We can only sync public profile data (phone and area)
    // Name and email are private user data not accessible from profiles

    // Sync phone
    if (!formData.value.phone_number && profile.contact_phone) {
      updateData.phone_number = profile.contact_phone
      formData.value.phone_number = profile.contact_phone
    }

    // Sync area from
    if (!formData.value.area_from && profile.area_from) {
      updateData.area_from = profile.area_from
      formData.value.area_from = profile.area_from
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await updateMutation.mutateAsync({
        attendeeId: attendeeId.value,
        body: {
          ...formData.value,
          ...updateData,
        },
      })

      toast.add({
        title: 'Success',
        description: 'Attendee information synced from profile',
        color: 'green',
      })

      // Refresh attendee data
      await attendee.refetch()
    } else {
      toast.add({
        title: 'No Changes',
        description: 'Attendee information is already up to date',
        color: 'blue',
      })
    }
  } catch (error) {
    console.error('Failed to sync from user profile:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to sync from profile',
      color: 'red',
    })
  } finally {
    syncingFromUser.value = false
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
