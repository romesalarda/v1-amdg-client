<template>
  <div class="space-y-6 max-h-[800px] overflow-y-auto pr-2">
    <!-- Basic Information Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
          <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
          Basic Information
        </h3>
        <UButton
          v-if="!editingBasicInfo"
          @click="$emit('set-editing-basic-info', true)"
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
            <dd class="mt-0.5 text-sm text-gray-900">{{ attendeeData?.full_name }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Email</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ attendeeData?.email || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Phone</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ attendeeData?.phone_number || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Date of Birth</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ attendeeData?.date_of_birth || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Age</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ attendeeData?.age }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Gender</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ attendeeData?.gender || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Relationship</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ attendeeData?.relationship_display }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold text-gray-500 uppercase">Area From</dt>
            <dd class="mt-0.5 text-sm text-gray-900">{{ attendeeData?.area_from_name || 'N/A' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Edit Mode -->
      <form v-else @submit.prevent="$emit('update-basic-info')" class="space-y-3">
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
            <option v-for="area in areaOptions" :key="area.id" :value="area.id">
              {{ area.area_name }}
            </option>
          </select>
        </div>
        <div class="flex gap-2 pt-2">
          <UButton type="submit" :disabled="updateBasicInfoPending" size="sm" color="green">
            {{ updateBasicInfoPending ? 'Saving...' : 'Save' }}
          </UButton>
          <UButton type="button" @click="$emit('cancel-edit-basic-info')" size="sm" variant="ghost" color="gray">
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
          <UBadge v-if="medicalCount" color="primary" variant="soft" size="xs">{{ medicalCount }}</UBadge>
        </h3>
        <UButton @click="$emit('set-show-add-medical-form', true)" size="xs" color="primary" icon="i-heroicons-plus">Add</UButton>
      </div>

      <!-- Add Form -->
      <div v-if="showAddMedicalForm && !editingMedicalId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
        <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Medical Condition</h4>
        <form @submit.prevent="$emit('add-medical-condition')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Condition *</label>
            <select v-model="newMedicalCondition.medical_condition" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option :value="null">Select condition...</option>
              <option v-for="condition in medicalConditionOptions" :key="condition.id" :value="condition.id">{{ condition.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Severity</label>
            <select v-model="newMedicalCondition.severity" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="">Not specified</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
            <textarea v-model="newMedicalCondition.details" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
            <textarea v-model="newMedicalCondition.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
          </div>
          <div class="flex gap-2 pt-2">
            <UButton type="submit" :disabled="createMedicalPending" size="sm" color="green">{{ createMedicalPending ? 'Adding...' : 'Add' }}</UButton>
            <UButton type="button" @click="$emit('cancel-add-medical-condition')" size="sm" variant="ghost" color="gray">Cancel</UButton>
          </div>
        </form>
      </div>

      <!-- List -->
      <div v-if="medicalConditionsLoading" class="text-center py-4 text-gray-500 text-sm">Loading...</div>
      <div v-else-if="!attendeeMedicalList.length" class="text-center py-4 text-gray-500 text-sm">No medical conditions recorded</div>
      <div v-else class="space-y-2 max-h-60 overflow-y-auto">
        <div v-for="condition in attendeeMedicalList" :key="condition.id" class="p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30">
          <div v-if="editingMedicalId === condition.id">
            <form @submit.prevent="$emit('update-medical-condition')" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Condition *</label>
                <select v-model="newMedicalCondition.medical_condition" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option :value="null">Select condition...</option>
                  <option v-for="cond in medicalConditionOptions" :key="cond.id" :value="cond.id">{{ cond.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Severity</label>
                <select v-model="newMedicalCondition.severity" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Not specified</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                <textarea v-model="newMedicalCondition.details" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                <textarea v-model="newMedicalCondition.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
              </div>
              <div class="flex gap-2 pt-2">
                <UButton type="submit" :disabled="updateMedicalPending" size="sm" color="green">{{ updateMedicalPending ? 'Updating...' : 'Update' }}</UButton>
                <UButton type="button" @click="$emit('cancel-edit-medical-condition')" size="sm" variant="ghost" color="gray">Cancel</UButton>
              </div>
            </form>
          </div>
          <div v-else class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 text-sm">{{ condition.condition_details.label }}</h4>
              <div class="mt-1 space-y-1">
                <p v-if="condition.severity" class="text-xs text-gray-600">
                  <span class="font-bold uppercase tracking-wide">Severity:</span>
                  <span :class="{ 'text-yellow-600': condition.severity === 'mild', 'text-orange-600': condition.severity === 'moderate', 'text-red-600': condition.severity === 'severe' }">
                    {{ condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1) }}
                  </span>
                </p>
                <p v-if="condition.details" class="text-xs text-gray-600"><span class="font-bold uppercase tracking-wide">Details:</span> {{ condition.details }}</p>
                <p v-if="condition.notes" class="text-xs text-gray-600"><span class="font-bold uppercase tracking-wide">Notes:</span> {{ condition.notes }}</p>
              </div>
            </div>
            <div class="flex gap-1">
              <UButton @click="$emit('edit-medical-condition', condition)" size="xs" color="primary" variant="ghost" icon="i-heroicons-pencil-square" />
              <UButton @click="$emit('delete-medical-condition', condition.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
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
          <UBadge v-if="dietaryCount" color="primary" variant="soft" size="xs">{{ dietaryCount }}</UBadge>
        </h3>
        <UButton @click="$emit('set-show-add-dietary-form', true)" size="xs" color="primary" icon="i-heroicons-plus">Add</UButton>
      </div>

      <!-- Add Form -->
      <div v-if="showAddDietaryForm && !editingDietaryId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
        <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Dietary Requirement</h4>
        <form @submit.prevent="$emit('add-dietary-requirement')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Requirement *</label>
            <select v-model="newDietaryRequirement.dietary_requirement" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option :value="null">Select requirement...</option>
              <option v-for="req in dietaryRequirementOptions" :key="req.id" :value="req.id">{{ req.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
            <textarea v-model="newDietaryRequirement.details" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
            <textarea v-model="newDietaryRequirement.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
          </div>
          <div class="flex gap-2 pt-2">
            <UButton type="submit" :disabled="createDietaryPending" size="sm" color="green">{{ createDietaryPending ? 'Adding...' : 'Add' }}</UButton>
            <UButton type="button" @click="$emit('cancel-add-dietary-requirement')" size="sm" variant="ghost" color="gray">Cancel</UButton>
          </div>
        </form>
      </div>

      <!-- List -->
      <div v-if="dietaryRequirementsLoading" class="text-center py-4 text-gray-500 text-sm">Loading...</div>
      <div v-else-if="!attendeeDietaryList.length" class="text-center py-4 text-gray-500 text-sm">No dietary requirements recorded</div>
      <div v-else class="space-y-2 max-h-60 overflow-y-auto">
        <div v-for="requirement in attendeeDietaryList" :key="requirement.id" class="p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30">
          <div v-if="editingDietaryId === requirement.id">
            <form @submit.prevent="$emit('update-dietary-requirement')" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Requirement *</label>
                <select v-model="newDietaryRequirement.dietary_requirement" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option :value="null">Select requirement...</option>
                  <option v-for="req in dietaryRequirementOptions" :key="req.id" :value="req.id">{{ req.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                <textarea v-model="newDietaryRequirement.details" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                <textarea v-model="newDietaryRequirement.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
              </div>
              <div class="flex gap-2 pt-2">
                <UButton type="submit" :disabled="updateDietaryPending" size="sm" color="green">{{ updateDietaryPending ? 'Updating...' : 'Update' }}</UButton>
                <UButton type="button" @click="$emit('cancel-edit-dietary-requirement')" size="sm" variant="ghost" color="gray">Cancel</UButton>
              </div>
            </form>
          </div>
          <div v-else class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 text-sm">{{ requirement.requirement_details.label }}</h4>
              <div class="mt-1 space-y-1">
                <p v-if="requirement.details" class="text-xs text-gray-600"><span class="font-bold uppercase tracking-wide">Details:</span> {{ requirement.details }}</p>
                <p v-if="requirement.notes" class="text-xs text-gray-600"><span class="font-bold uppercase tracking-wide">Notes:</span> {{ requirement.notes }}</p>
              </div>
            </div>
            <div class="flex gap-1">
              <UButton @click="$emit('edit-dietary-requirement', requirement)" size="xs" color="primary" variant="ghost" icon="i-heroicons-pencil-square" />
              <UButton @click="$emit('delete-dietary-requirement', requirement.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
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
          <UBadge v-if="accessibilityCount" color="primary" variant="soft" size="xs">{{ accessibilityCount }}</UBadge>
        </h3>
        <UButton @click="$emit('set-show-add-accessibility-form', true)" size="xs" color="primary" icon="i-heroicons-plus">Add</UButton>
      </div>

      <!-- Add Form -->
      <div v-if="showAddAccessibilityForm && !editingAccessibilityId" class="bg-gray-50/50 rounded-xl p-4 mb-3 border border-gray-200">
        <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Accessibility Requirement</h4>
        <form @submit.prevent="$emit('add-accessibility-requirement')" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Requirement *</label>
            <select v-model="newAccessibilityRequirement.accessibility_requirement" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option :value="null">Select requirement...</option>
              <option v-for="req in accessibilityRequirementOptions" :key="req.id" :value="req.id">{{ req.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
            <textarea v-model="newAccessibilityRequirement.details" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
            <textarea v-model="newAccessibilityRequirement.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
          </div>
          <div class="flex gap-2 pt-2">
            <UButton type="submit" :disabled="createAccessibilityPending" size="sm" color="green">{{ createAccessibilityPending ? 'Adding...' : 'Add' }}</UButton>
            <UButton type="button" @click="$emit('cancel-add-accessibility-requirement')" size="sm" variant="ghost" color="gray">Cancel</UButton>
          </div>
        </form>
      </div>

      <!-- List -->
      <div v-if="accessibilityRequirementsLoading" class="text-center py-4 text-gray-500 text-sm">Loading...</div>
      <div v-else-if="!attendeeAccessibilityList.length" class="text-center py-4 text-gray-500 text-sm">No accessibility requirements recorded</div>
      <div v-else class="space-y-2 max-h-60 overflow-y-auto">
        <div v-for="requirement in attendeeAccessibilityList" :key="requirement.id" class="p-3 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/30">
          <div v-if="editingAccessibilityId === requirement.id">
            <form @submit.prevent="$emit('update-accessibility-requirement')" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Requirement *</label>
                <select v-model="newAccessibilityRequirement.accessibility_requirement" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option :value="null">Select requirement...</option>
                  <option v-for="req in accessibilityRequirementOptions" :key="req.id" :value="req.id">{{ req.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Details</label>
                <textarea v-model="newAccessibilityRequirement.details" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notes</label>
                <textarea v-model="newAccessibilityRequirement.notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
              </div>
              <div class="flex gap-2 pt-2">
                <UButton type="submit" :disabled="updateAccessibilityPending" size="sm" color="green">{{ updateAccessibilityPending ? 'Updating...' : 'Update' }}</UButton>
                <UButton type="button" @click="$emit('cancel-edit-accessibility-requirement')" size="sm" variant="ghost" color="gray">Cancel</UButton>
              </div>
            </form>
          </div>
          <div v-else class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 text-sm">{{ requirement.requirement_details.label }}</h4>
              <div class="mt-1 space-y-1">
                <p v-if="requirement.details" class="text-xs text-gray-600"><span class="font-bold uppercase tracking-wide">Details:</span> {{ requirement.details }}</p>
                <p v-if="requirement.notes" class="text-xs text-gray-600"><span class="font-bold uppercase tracking-wide">Notes:</span> {{ requirement.notes }}</p>
              </div>
            </div>
            <div class="flex gap-1">
              <UButton @click="$emit('edit-accessibility-requirement', requirement)" size="xs" color="primary" variant="ghost" icon="i-heroicons-pencil-square" />
              <UButton @click="$emit('delete-accessibility-requirement', requirement.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
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

      <div v-if="orgLoading" class="text-center py-4 text-gray-500 text-sm">Loading...</div>
      <div v-else>
        <div v-if="attendeeOrgsList.length">
          <div v-for="org in attendeeOrgsList" :key="org.id" class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-start justify-between">
              <div>
                <h4 class="text-sm font-semibold text-gray-900">{{ org.organisation_title }}</h4>
                <p class="text-xs text-gray-600 mt-1">Added: {{ new Date(org.added_at).toLocaleString() }}</p>
                <p v-if="org.added_by_name" class="text-xs text-gray-600">By: {{ org.added_by_name }}</p>
              </div>
              <div class="flex gap-1">
                <UButton @click="$emit('set-show-change-organisation', true)" size="xs" color="primary" variant="outline" icon="i-heroicons-arrow-path">Change</UButton>
                <UButton @click="$emit('remove-organisation', org.id)" size="xs" color="red" variant="ghost" icon="i-heroicons-trash" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500 text-sm">
          <p>No organisation assigned</p>
          <UButton @click="$emit('set-show-change-organisation', true)" size="sm" color="primary" class="mt-2" icon="i-heroicons-plus">Assign Organisation</UButton>
        </div>

        <div v-if="showChangeOrganisation" class="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-3">
          <h4 class="text-xs font-black text-primary uppercase tracking-widest mb-3">Change Organisation</h4>
          <form @submit.prevent="$emit('change-organisation')" class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Select Organisation *</label>
              <select
                :value="selectedOrganisation"
                @change="$emit('set-selected-organisation', (() => { const v = ($event.target as HTMLSelectElement).value; return v === 'null' || v === '' ? null : Number(v) })())"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option :value="null">Choose an organisation...</option>
                <option v-for="org in organisationOptions" :key="org.id" :value="org.id">{{ org.title }}</option>
              </select>
            </div>
            <div class="flex gap-2">
              <UButton type="submit" :disabled="createOrgPending" size="sm" color="primary">{{ createOrgPending ? 'Saving...' : 'Save' }}</UButton>
              <UButton type="button" @click="$emit('cancel-change-organisation')" size="sm" variant="ghost" color="gray">Cancel</UButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  // Basic Info
  attendeeData: any
  areaOptions: any[]
  editingBasicInfo: boolean
  formData: { first_name: string; last_name: string; email: string; phone_number: string; date_of_birth: string; gender: string; relationship_to_user: string; area_from: number | null }
  updateBasicInfoPending: boolean
  // Medical
  medicalConditionOptions: any[]
  attendeeMedicalList: any[]
  medicalCount: number
  medicalConditionsLoading: boolean
  showAddMedicalForm: boolean
  editingMedicalId: number | null
  newMedicalCondition: { medical_condition: number | null; severity: string; details: string; notes: string }
  createMedicalPending: boolean
  updateMedicalPending: boolean
  // Dietary
  dietaryRequirementOptions: any[]
  attendeeDietaryList: any[]
  dietaryCount: number
  dietaryRequirementsLoading: boolean
  showAddDietaryForm: boolean
  editingDietaryId: number | null
  newDietaryRequirement: { dietary_requirement: number | null; details: string; notes: string }
  createDietaryPending: boolean
  updateDietaryPending: boolean
  // Accessibility
  accessibilityRequirementOptions: any[]
  attendeeAccessibilityList: any[]
  accessibilityCount: number
  accessibilityRequirementsLoading: boolean
  showAddAccessibilityForm: boolean
  editingAccessibilityId: number | null
  newAccessibilityRequirement: { accessibility_requirement: number | null; details: string; notes: string }
  createAccessibilityPending: boolean
  updateAccessibilityPending: boolean
  // Organisation
  attendeeOrgsList: any[]
  orgLoading: boolean
  organisationOptions: any[]
  createOrgPending: boolean
  showChangeOrganisation: boolean
  selectedOrganisation: number | null
}>()

defineEmits<{
  // Basic Info
  (event: 'set-editing-basic-info', value: boolean): void
  (event: 'update-basic-info'): void
  (event: 'cancel-edit-basic-info'): void
  // Medical
  (event: 'set-show-add-medical-form', value: boolean): void
  (event: 'add-medical-condition'): void
  (event: 'edit-medical-condition', condition: any): void
  (event: 'update-medical-condition'): void
  (event: 'delete-medical-condition', id: number): void
  (event: 'cancel-add-medical-condition'): void
  (event: 'cancel-edit-medical-condition'): void
  // Dietary
  (event: 'set-show-add-dietary-form', value: boolean): void
  (event: 'add-dietary-requirement'): void
  (event: 'edit-dietary-requirement', requirement: any): void
  (event: 'update-dietary-requirement'): void
  (event: 'delete-dietary-requirement', id: number): void
  (event: 'cancel-add-dietary-requirement'): void
  (event: 'cancel-edit-dietary-requirement'): void
  // Accessibility
  (event: 'set-show-add-accessibility-form', value: boolean): void
  (event: 'add-accessibility-requirement'): void
  (event: 'edit-accessibility-requirement', requirement: any): void
  (event: 'update-accessibility-requirement'): void
  (event: 'delete-accessibility-requirement', id: number): void
  (event: 'cancel-add-accessibility-requirement'): void
  (event: 'cancel-edit-accessibility-requirement'): void
  // Organisation
  (event: 'set-show-change-organisation', value: boolean): void
  (event: 'set-selected-organisation', value: number | null): void
  (event: 'change-organisation'): void
  (event: 'cancel-change-organisation'): void
  (event: 'remove-organisation', id: number): void
}>()
</script>
