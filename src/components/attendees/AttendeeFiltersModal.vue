<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-4xl' }">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900">Filter Participants</h3>
          <p class="text-sm text-gray-500 mt-1">Refine your attendee list with advanced filters</p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="isOpen = false"
        />
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-4 py-2 text-sm font-medium transition-colors relative shrink-0"
          :class="[
            currentTab === tab.value
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          ]"
          @click="currentTab = tab.value"
        >
          <UIcon :name="tab.icon" class="w-4 h-4 inline-block mr-2" />
          {{ tab.label }}
          <UBadge
            v-if="getTabFilterCount(tab.value) > 0"
            color="primary"
            size="xs"
            class="ml-2"
          >
            {{ getTabFilterCount(tab.value) }}
          </UBadge>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="max-h-[60vh] overflow-y-auto">
        <!-- Basic Filters Tab -->
        <div v-if="currentTab === 'basic'" class="space-y-6">
          <!-- Demographics Section -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Demographics</h4>
            
            <div class="grid grid-cols-2 gap-4">
              <!-- Gender -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Gender</label>
                <USelectMenu
                  v-model="localFilters.gender"
                  :options="genderOptions"
                  placeholder="All genders"
                  class="w-full"
                />
              </div>

              <!-- Minor Status -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Age Category</label>
                <USelectMenu
                  v-model="localFilters.isMinor"
                  :options="minorOptions"
                  value-attribute="value"
                  option-attribute="label"
                  placeholder="All ages"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Age Range -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Age Range</label>
              <div class="grid grid-cols-2 gap-2">
                <UInput
                  v-model.number="localFilters.ageMin"
                  type="number"
                  placeholder="Min age"
                  min="0"
                  max="120"
                />
                <UInput
                  v-model.number="localFilters.ageMax"
                  type="number"
                  placeholder="Max age"
                  min="0"
                  max="120"
                />
              </div>
            </div>
          </div>

          <!-- Status Section -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Status</h4>
            
            <div class="grid grid-cols-2 gap-3">
              <UCheckbox
                v-model="localFilters.isCheckedIn"
                label="Checked In"
              />
              <UCheckbox
                v-model="localFilters.isRegistered"
                label="Registered"
              />
              <UCheckbox
                v-model="localFilters.isCancelled"
                label="Cancelled"
              />
              <UCheckbox
                v-model="localFilters.isStaff"
                label="Event Staff"
              />
            </div>
          </div>

          <!-- Location Section -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Location & Organisation</h4>
            
            <div class="grid grid-cols-2 gap-4">
              <!-- Organisation -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Organisation</label>
                <OrganisationSelect v-model="localFilters.organisation" />
              </div>

              <!-- Area From -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Area From</label>
                <AreaSearchSelect
                  :model-value="localFilters.areaFrom ?? null"
                  :selected-label="selectedAreaLabel"
                  @select="(id, label) => { localFilters.areaFrom = id; selectedAreaLabel = label }"
                />
              </div>
            </div>
          </div>

          <!-- Personal Needs Section -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Personal Needs</h4>
            
            <div class="space-y-4">
              <!-- Dietary Requirements -->
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="localFilters.hasDietaryRequirements" />
                  <span class="text-sm font-medium text-gray-700">Has Dietary Requirements</span>
                </div>
                <div v-if="localFilters.hasDietaryRequirements" class="pl-6">
                  <DietaryRequirementSelect v-model="localFilters.dietaryRequirement" :multiple="true" />
                </div>
              </div>

              <!-- Medical Conditions -->
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="localFilters.hasMedicalConditions" />
                  <span class="text-sm font-medium text-gray-700">Has Medical Conditions</span>
                </div>
                <div v-if="localFilters.hasMedicalConditions" class="pl-6">
                  <MedicalConditionSelect v-model="localFilters.medicalCondition" :multiple="true" />
                </div>
              </div>

              <!-- Accessibility Requirements -->
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="localFilters.hasAccessibilityRequirements" />
                  <span class="text-sm font-medium text-gray-700">Has Accessibility Requirements</span>
                </div>
                <div v-if="localFilters.hasAccessibilityRequirements" class="pl-6">
                  <AccessibilityRequirementSelect v-model="localFilters.accessibilityRequirement" :multiple="true" />
                </div>
              </div>

              <!-- Emergency Contacts -->
              <div class="flex items-center gap-2">
                <UCheckbox v-model="localFilters.hasEmergencyContacts" />
                <span class="text-sm font-medium text-gray-700">Has Emergency Contacts</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Tab -->
        <div v-if="currentTab === 'questions'" class="space-y-6">
          <div>
            <p class="text-sm text-gray-600 mb-4">
              Filter attendees by their answers to registration questions
            </p>

            <!-- Has Answered Questions -->
            <div class="mb-4">
              <UCheckbox
                v-model="localFilters.hasAnsweredQuestions"
                label="Has answered any questions"
              />
            </div>

            <!-- Has Unanswered Required Questions -->
            <div class="mb-6">
              <UCheckbox
                v-model="localFilters.hasUnansweredRequiredQuestions"
                label="Has incomplete required questions"
              />
            </div>

            <!-- Question Selection -->
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Filter by Specific Question</label>
                <EventQuestionSelect
                  v-model="localFilters.question"
                  :event-slug="eventSlug"
                />
              </div>

              <!-- Question Type Specific Filters -->
              <template v-if="selectedQuestion">
                <!-- Text Question (short_answer, long_answer, upload) -->
                <div v-if="['short_answer', 'long_answer', 'upload'].includes(selectedQuestion.question_type || '')">
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Search in Answers</label>
                  <UInput
                    v-model="debouncedQuestionSearch"
                    placeholder="Search answer text..."
                    icon="i-heroicons-magnifying-glass"
                    @input="onQuestionSearchInput"
                  />
                  <p class="text-xs text-gray-500 mt-1">Find attendees whose answers contain this text</p>
                </div>

                <!-- Choice Question (single_choice, multiple_choice) -->
                <div v-else-if="['single_choice', 'multiple_choice'].includes(selectedQuestion.question_type || '')">
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Selected Option</label>
                  <USelectMenu
                    v-model="localFilters.selectedOption"
                    :options="selectedQuestion.options || []"
                    placeholder="Select an option"
                    value-attribute="id"
                    option-attribute="option_text"
                    class="w-full"
                  />
                  <p class="text-xs text-gray-500 mt-1">Find attendees who selected this option</p>
                </div>

                <!-- Slider Question -->
                <div v-else-if="selectedQuestion.question_type === 'slider'">
                  <label class="block text-xs font-semibold text-gray-700 mb-2">Answer Range</label>
                  <div class="grid grid-cols-2 gap-2">
                    <UInput
                      v-model.number="localFilters.sliderAnswerMin"
                      type="number"
                      placeholder="Min value"
                      :min="selectedQuestion.min_value"
                      :max="selectedQuestion.max_value"
                    />
                    <UInput
                      v-model.number="localFilters.sliderAnswerMax"
                      type="number"
                      placeholder="Max value"
                      :min="selectedQuestion.min_value"
                      :max="selectedQuestion.max_value"
                    />
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Range: {{ selectedQuestion.min_value }} to {{ selectedQuestion.max_value }}
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Forms Tab -->
        <div v-if="currentTab === 'forms'" class="space-y-6">
          <EventFormFilterPanel
            :model-value="formFilters"
            :event-slug="eventSlug"
            @update:model-value="onFormFiltersUpdate"
          />
        </div>

        <!-- Orders Tab -->
        <div v-if="currentTab === 'orders'" class="space-y-6">
          <p class="text-sm text-gray-600 mb-4">
            Filter attendees by their purchase history and orders
          </p>

          <!-- Order Existence -->
          <div class="space-y-3">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Order Status</h4>
            
            <div class="grid grid-cols-2 gap-3">
              <UCheckbox
                v-model="localFilters.hasOrders"
                label="Has Any Orders"
              />
              <UCheckbox
                v-model="localFilters.hasCompletedOrders"
                label="Has Completed Orders"
              />
              <UCheckbox
                v-model="localFilters.hasPendingOrders"
                label="Has Pending Orders"
              />
            </div>
          </div>

          <!-- Order Status Filter -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Filter by Order Status</label>
            <div class="grid grid-cols-2 gap-4">
              <USelectMenu
                v-model="localFilters.orderStatus"
                :options="orderStatusOptions"
                placeholder="Include status"
                value-attribute="value"
                option-attribute="label"
                class="w-full"
              />
              <USelectMenu
                v-model="localFilters.orderStatusNot"
                :options="orderStatusOptions"
                placeholder="Exclude status"
                value-attribute="value"
                option-attribute="label"
                class="w-full"
              />
            </div>
          </div>

          <!-- Product Filters -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Products</h4>
            
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Search by Product</label>
              <ProductSelect
                v-model="localFilters.purchasedProduct"
                :event-slug="eventSlug"
                placeholder="Search for a product…"
              />
            </div>
          </div>

          <!-- Order Amount -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Order Total Range</label>
            <div class="grid grid-cols-2 gap-2">
              <UInput
                v-model.number="localFilters.orderTotalMin"
                type="number"
                placeholder="Min amount"
                min="0"
              />
              <UInput
                v-model.number="localFilters.orderTotalMax"
                type="number"
                placeholder="Max amount"
                min="0"
              />
            </div>
          </div>

          <!-- Order Dates -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Order Created Date Range</label>
            <div class="grid grid-cols-2 gap-2">
              <UInput
                v-model="localFilters.orderCreatedAfter"
                type="date"
                placeholder="From date"
              />
              <UInput
                v-model="localFilters.orderCreatedBefore"
                type="date"
                placeholder="To date"
              />
            </div>
          </div>

          <!-- Order Reference -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Order Reference ID</label>
            <UInput
              v-model="localFilters.orderReferenceId"
              placeholder="Search by reference..."
              icon="i-heroicons-magnifying-glass"
            />
          </div>
        </div>

        <!-- Payments Tab -->
        <div v-if="currentTab === 'payments'" class="space-y-6">
          <p class="text-sm text-gray-600 mb-4">
            Filter attendees by payments, refunds, donations, and discounts
          </p>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Payments</h4>

            <div class="grid grid-cols-2 gap-3">
              <UCheckbox
                v-model="localFilters.hasPayments"
                label="Has Any Payments"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Status</label>
                <USelectMenu
                  v-model="localFilters.paymentStatus"
                  :options="paymentStatusOptions"
                  placeholder="All statuses"
                  value-attribute="value"
                  option-attribute="label"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Target</label>
                <USelectMenu
                  v-model="localFilters.paymentTarget"
                  :options="paymentTargetOptions"
                  placeholder="All targets"
                  value-attribute="value"
                  option-attribute="label"
                  class="w-full"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Method Type</label>
                <USelectMenu
                  v-model="localFilters.paymentMethodType"
                  :options="paymentMethodTypeOptions"
                  placeholder="All method types"
                  value-attribute="value"
                  option-attribute="label"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Method Title</label>
                <UInput
                  v-model="localFilters.paymentMethodTitle"
                  placeholder="Search method title"
                  icon="i-heroicons-magnifying-glass"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment ID</label>
                <UInput
                  v-model="localFilters.paymentId"
                  placeholder="Payment UUID"
                  icon="i-heroicons-hashtag"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Reference</label>
                <UInput
                  v-model="localFilters.paymentReference"
                  placeholder="Payment reference"
                  icon="i-heroicons-document-text"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Bank Transfer Reference</label>
              <UInput
                v-model="localFilters.bankTransferReference"
                placeholder="Bank transfer reference"
                icon="i-heroicons-building-library"
              />
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Refunds</h4>

            <div class="grid grid-cols-2 gap-3">
              <UCheckbox
                v-model="localFilters.hasRefunds"
                label="Has Any Refunds"
              />
              <UCheckbox
                v-model="localFilters.refundIsActive"
                label="Active Refund Requests"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Refund Verification Status</label>
              <USelectMenu
                v-model="localFilters.refundStatus"
                :options="verificationStatusOptions"
                placeholder="All refund statuses"
                value-attribute="value"
                option-attribute="label"
                class="w-full"
              />
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Donations</h4>

            <div class="grid grid-cols-2 gap-3">
              <UCheckbox
                v-model="localFilters.hasDonations"
                label="Has Any Donations"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Donation Verification Status</label>
              <USelectMenu
                v-model="localFilters.donationStatus"
                :options="verificationStatusOptions"
                placeholder="All donation statuses"
                value-attribute="value"
                option-attribute="label"
                class="w-full"
              />
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Discounts</h4>

            <div class="grid grid-cols-2 gap-3">
              <UCheckbox
                v-model="localFilters.hasDiscountsUsed"
                label="Has Discounts Used"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <ProductDiscountSelect
                  v-model="localFilters.discountId"
                  :event-slug="eventSlug"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Tab -->
        <div v-if="currentTab === 'advanced'" class="space-y-6">
          <!-- Relationship Filters -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Relationships</h4>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Relationship to User</label>
                <USelectMenu
                  v-model="localFilters.relationshipToUser"
                  :options="relationshipOptions"
                  placeholder="All relationships"
                  value-attribute="value"
                  option-attribute="label"
                  class="w-full"
                />
              </div>

              <div class="flex items-end">
                <UCheckbox
                  v-model="localFilters.selfRegistered"
                  label="Self-Registered Only"
                />
              </div>
            </div>
          </div>

          <!-- Booking Filters -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Bookings</h4>
            
            <div>
              <UCheckbox
                v-model="localFilters.hasBooking"
                label="Has Booking"
                class="mb-2"
              />
            </div>
          </div>

          <!-- Date Filters -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Date Filters</h4>
            
            <!-- Date of Birth -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Date of Birth Range</label>
              <div class="grid grid-cols-2 gap-2">
                <UInput
                  v-model="localFilters.dateOfBirthAfter"
                  type="date"
                  placeholder="From date"
                />
                <UInput
                  v-model="localFilters.dateOfBirthBefore"
                  type="date"
                  placeholder="To date"
                />
              </div>
            </div>

            <!-- Created Date -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Registration Date Range</label>
              <div class="grid grid-cols-2 gap-2">
                <UInput
                  v-model="localFilters.createdAfter"
                  type="datetime-local"
                  placeholder="From date"
                />
                <UInput
                  v-model="localFilters.createdBefore"
                  type="datetime-local"
                  placeholder="To date"
                />
              </div>
            </div>
          </div>

          <!-- Soft Delete -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Advanced Options</h4>
            
            <UCheckbox
              v-model="localFilters.includeDeleted"
              label="Include Deleted Attendees"
            />
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between pt-6 mt-6 border-t">
        <UButton
          color="gray"
          variant="ghost"
          @click="clearAllFilters"
        >
          Clear All Filters
        </UButton>
        <div class="flex gap-2">
          <UButton
            color="white"
            @click="isOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            @click="applyFilters"
          >
            Apply Filters
          </UButton>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import type { EventQuestion } from '~/api/types.gen'
import OrganisationSelect from '~/components/ui/OrganisationSelect.vue'
import AreaSearchSelect from '~/components/ui/AreaSearchSelect.vue'
import DietaryRequirementSelect from '~/components/ui/DietaryRequirementSelect.vue'
import MedicalConditionSelect from '~/components/ui/MedicalConditionSelect.vue'
import AccessibilityRequirementSelect from '~/components/ui/AccessibilityRequirementSelect.vue'
import EventQuestionSelect from '~/components/ui/EventQuestionSelect.vue'
import ProductSelect from '~/components/ui/ProductSelect.vue'
import ProductDiscountSelect from '~/components/ui/ProductDiscountSelect.vue'
import EventFormFilterPanel from '~/components/attendees/EventFormFilterPanel.vue'
import type { EventFormFilters } from '~/components/attendees/EventFormFilterPanel.vue'
import { useEventQuestions } from '~/composables/resources/events/eventQuestions'

interface Props {
  modelValue: boolean
  filters: any
  eventSlug?: string
  /** @deprecated data now fetched internally via composables */
  organisations?: any[]
  /** @deprecated data now fetched internally via composables */
  areas?: any[]
  /** @deprecated data now fetched internally via composables */
  dietaryRequirements?: any[]
  /** @deprecated data now fetched internally via composables */
  medicalConditions?: any[]
  /** @deprecated data now fetched internally via composables */
  accessibilityRequirements?: any[]
  /** @deprecated questions are now fetched by EventQuestionSelect using eventSlug */
  eventQuestions?: EventQuestion[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'apply', filters: any): void
  (e: 'clear'): void
  (e: 'questionSearchInput', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentTab = ref<'basic' | 'questions' | 'forms' | 'orders' | 'payments' | 'advanced'>('basic')
const localFilters = ref({ ...props.filters })
const debouncedQuestionSearch = ref(props.filters.questionAnswerSearch || '')
const selectedAreaLabel = ref<string | null>(null)

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
  debouncedQuestionSearch.value = newFilters.questionAnswerSearch || ''
}, { deep: true })

const tabs = [
  { value: 'basic' as const, label: 'Basic', icon: 'i-heroicons-user-group' },
  { value: 'questions' as const, label: 'Questions', icon: 'i-heroicons-question-mark-circle' },
  { value: 'forms' as const, label: 'Forms', icon: 'i-heroicons-document-text' },
  { value: 'orders' as const, label: 'Orders', icon: 'i-heroicons-shopping-cart' },
  { value: 'payments' as const, label: 'Payments', icon: 'i-heroicons-credit-card' },
  { value: 'advanced' as const, label: 'Advanced', icon: 'i-heroicons-adjustments-horizontal' },
]

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']
const minorOptions = [
  { value: true, label: 'Minors only (under 18)' },
  { value: false, label: 'Adults only (18+)' }
]

const relationshipOptions = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
]

const orderStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending_refund', label: 'Pending Refund' },
  { value: 'refunded', label: 'Refunded' },
]

const paymentStatusOptions = [
  { value: 'DRAFTING', label: 'Drafting' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PENDING_REFUND', label: 'Pending Refund' },
  { value: 'REFUNDED', label: 'Refunded' },
]

const paymentTargetOptions = [
  { value: 'booking', label: 'Booking' },
  { value: 'order', label: 'Order' },
  { value: 'ticket', label: 'Ticket' },
]

const paymentMethodTypeOptions = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'CASH', label: 'Cash' },
]

const verificationStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'processed', label: 'Processed' },
]

// Fetch event questions for type-specific UI in the questions tab
const eventQuestionsQuery = useEventQuestions(
  computed(() => ({
    event: props.eventSlug || undefined,
    page_size: 100,
  })),
  { enabled: computed(() => !!props.eventSlug) },
)

// Get selected question details
const selectedQuestion = computed(() => {
  if (!localFilters.value.question) return null
  const results = eventQuestionsQuery.data.value?.data?.results || []
  return results.find((q: any) => q.id === localFilters.value.question) ?? null
})

// ── Form filters bridge ────────────────────────────────────────────────────────
// The EventFormFilterPanel works with a sub-object; we mirror it in/out of localFilters

const FORM_FILTER_KEYS: (keyof EventFormFilters)[] = [
  'hasFormResponses',
  'formResponseForm',
  'formResponseComplete',
  'formAnswerSearch',
  'formAnsweredQuestion',
  'formHasUnansweredRequired',
  'formSelectedOption',
  'formAnswerSubmittedAfter',
  'formAnswerSubmittedBefore',
  'formNumericAnswerMin',
  'formNumericAnswerMax',
  'formAnswerDateAfter',
  'formAnswerDateBefore',
  'formAnswerTimeAfter',
  'formAnswerTimeBefore',
]

const formFilters = computed<EventFormFilters>(() => {
  const f = localFilters.value
  return {
    hasFormResponses: f.hasFormResponses,
    formResponseForm: f.formResponseForm,
    formResponseComplete: f.formResponseComplete,
    formAnswerSearch: f.formAnswerSearch,
    formAnsweredQuestion: f.formAnsweredQuestion,
    formHasUnansweredRequired: f.formHasUnansweredRequired,
    formSelectedOption: f.formSelectedOption,
    formAnswerSubmittedAfter: f.formAnswerSubmittedAfter,
    formAnswerSubmittedBefore: f.formAnswerSubmittedBefore,
    formNumericAnswerMin: f.formNumericAnswerMin,
    formNumericAnswerMax: f.formNumericAnswerMax,
    formAnswerDateAfter: f.formAnswerDateAfter,
    formAnswerDateBefore: f.formAnswerDateBefore,
    formAnswerTimeAfter: f.formAnswerTimeAfter,
    formAnswerTimeBefore: f.formAnswerTimeBefore,
  }
})

function onFormFiltersUpdate(updated: EventFormFilters) {
  for (const key of FORM_FILTER_KEYS) {
    (localFilters.value as any)[key] = (updated as any)[key]
  }
}

// Count active filters per tab
function getTabFilterCount(tab: string): number {
  let count = 0
  const filters = localFilters.value

  if (tab === 'basic') {
    if (filters.gender) count++
    if (filters.ageMin) count++
    if (filters.ageMax) count++
    if (filters.isMinor !== undefined) count++
    if (filters.isCheckedIn) count++
    if (filters.isRegistered) count++
    if (filters.isCancelled) count++
    if (filters.isStaff) count++
    if (filters.organisation) count++
    if (filters.areaFrom) count++
    if (filters.hasDietaryRequirements) count++
    if (filters.dietaryRequirement) count++
    if (filters.hasMedicalConditions) count++
    if (filters.medicalCondition) count++
    if (filters.hasAccessibilityRequirements) count++
    if (filters.accessibilityRequirement) count++
    if (filters.hasEmergencyContacts) count++
  } else if (tab === 'questions') {
    if (filters.hasAnsweredQuestions) count++
    if (filters.question) count++
    if (filters.questionAnswerSearch) count++
    if (filters.hasUnansweredRequiredQuestions) count++
    if (filters.selectedOption) count++
    if (filters.sliderAnswerMin) count++
    if (filters.sliderAnswerMax) count++
  } else if (tab === 'forms') {
    for (const key of FORM_FILTER_KEYS) {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') count++
    }
  } else if (tab === 'orders') {
    if (filters.hasOrders) count++
    if (filters.orderStatus) count++
    if (filters.orderStatusNot) count++
    if (filters.purchasedProduct) count++
    if (filters.purchasedProductTitle) count++
    if (filters.orderTotalMin) count++
    if (filters.orderTotalMax) count++
    if (filters.orderCreatedAfter) count++
    if (filters.orderCreatedBefore) count++
    if (filters.orderReferenceId) count++
    if (filters.hasCompletedOrders) count++
    if (filters.hasPendingOrders) count++
  } else if (tab === 'payments') {
    if (filters.hasPayments) count++
    if (filters.paymentId) count++
    if (filters.paymentReference) count++
    if (filters.bankTransferReference) count++
    if (filters.paymentStatus) count++
    if (filters.paymentTarget) count++
    if (filters.paymentMethodType) count++
    if (filters.paymentMethodTitle) count++
    if (filters.hasRefunds) count++
    if (filters.refundStatus) count++
    if (filters.refundIsActive) count++
    if (filters.hasDonations) count++
    if (filters.donationStatus) count++
    if (filters.hasDiscountsUsed) count++
    if (filters.discountId) count++
    if (filters.discountName) count++
  } else if (tab === 'advanced') {
    if (filters.relationshipToUser) count++
    if (filters.selfRegistered) count++
    if (filters.hasBooking) count++
    if (filters.booking) count++
    if (filters.dateOfBirthAfter) count++
    if (filters.dateOfBirthBefore) count++
    if (filters.createdAfter) count++
    if (filters.createdBefore) count++
    if (filters.includeDeleted) count++
  }

  return count
}

function onQuestionSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  debouncedQuestionSearch.value = target.value
  emit('questionSearchInput', target.value)
}

function applyFilters() {
  localFilters.value.questionAnswerSearch = debouncedQuestionSearch.value || undefined
  emit('apply', { ...localFilters.value })
  isOpen.value = false
}

function clearAllFilters() {
  emit('clear')
  isOpen.value = false
}
</script>
