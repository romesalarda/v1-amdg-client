<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-4xl' }">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900">Filter Participants</h3>
          <p class="text-sm text-gray-500 mt-1">Refine your attendee list with advanced filters</p>
        </div>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="isOpen = false" />
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-4 py-2 text-sm font-medium transition-colors relative shrink-0"
          :class="[currentTab === tab.value ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700']"
          @click="currentTab = tab.value"
        >
          <UIcon :name="tab.icon" class="w-4 h-4 inline-block mr-2" />
          {{ tab.label }}
          <UBadge v-if="getTabFilterCount(tab.value) > 0" color="primary" size="xs" class="ml-2">
            {{ getTabFilterCount(tab.value) }}
          </UBadge>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="max-h-[60vh] overflow-y-auto">

        <!-- Basic Tab -->
        <div v-if="currentTab === 'basic'" class="space-y-6">
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Demographics</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Gender</label>
                <USelectMenu v-model="demog.gender" :options="genderOptions" placeholder="All genders" class="w-full" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Age Category</label>
                <USelectMenu v-model="demog.is_minor" :options="minorOptions" value-attribute="value" option-attribute="label" placeholder="All ages" class="w-full" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Age Range</label>
              <div class="grid grid-cols-2 gap-2">
                <UInput v-model.number="demog.age_min" type="number" placeholder="Min age" min="0" max="120" />
                <UInput v-model.number="demog.age_max" type="number" placeholder="Max age" min="0" max="120" />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Status</h4>
            <div class="grid grid-cols-2 gap-3">
              <UCheckbox v-model="stat.is_checked_in" label="Checked In" />
              <UCheckbox v-model="stat.is_registered" label="Registered" />
              <UCheckbox v-model="stat.is_cancelled" label="Cancelled" />
              <UCheckbox v-model="stat.is_staff" label="Event Staff" />
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Location & Organisation</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Organisation</label>
                <OrganisationSelect :model-value="orgValue" @update:model-value="onOrgChange" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Area From</label>
                <AreaSearchSelect
                  :model-value="areaValue"
                  :selected-label="selectedAreaLabel"
                  @select="onAreaSelect"
                />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Personal Needs</h4>
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="demog.has_dietary_requirements" />
                  <span class="text-sm font-medium text-gray-700">Has Dietary Requirements</span>
                </div>
                <div v-if="demog.has_dietary_requirements" class="pl-6">
                  <DietaryRequirementSelect v-model="demog.dietary_requirement" :multiple="true" />
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="demog.has_medical_conditions" />
                  <span class="text-sm font-medium text-gray-700">Has Medical Conditions</span>
                </div>
                <div v-if="demog.has_medical_conditions" class="pl-6">
                  <MedicalConditionSelect v-model="demog.medical_condition" :multiple="true" />
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UCheckbox v-model="demog.has_accessibility_requirements" />
                  <span class="text-sm font-medium text-gray-700">Has Accessibility Requirements</span>
                </div>
                <div v-if="demog.has_accessibility_requirements" class="pl-6">
                  <AccessibilityRequirementSelect v-model="demog.accessibility_requirement" :multiple="true" />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UCheckbox v-model="demog.has_emergency_contacts" />
                <span class="text-sm font-medium text-gray-700">Has Emergency Contacts</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Tab -->
        <div v-if="currentTab === 'questions'" class="space-y-6">
          <RegistrationQuestionsFilterPanel
            :model-value="localFilters.registration_questions ?? { operator: 'AND', conditions: [] }"
            :event-slug="eventSlug"
            @update:model-value="localFilters.registration_questions = $event"
          />
        </div>

        <!-- Forms Tab -->
        <div v-if="currentTab === 'forms'" class="space-y-6">
          <EventFormFilterPanel
            :model-value="localFilters.forms ?? { operator: 'AND', conditions: [] }"
            :event-slug="eventSlug"
            @update:model-value="localFilters.forms = $event"
          />
        </div>

        <!-- Orders Tab -->
        <div v-if="currentTab === 'orders'" class="space-y-6">
          <p class="text-sm text-gray-600 mb-4">Filter attendees by their purchase history and orders</p>

          <div class="space-y-3">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Order Status</h4>
            <div class="grid grid-cols-2 gap-3">
              <UCheckbox v-model="ord.has_orders" label="Has Any Orders" />
              <UCheckbox v-model="ord.has_completed_orders" label="Has Completed Orders" />
              <UCheckbox v-model="ord.has_pending_orders" label="Has Pending Orders" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Filter by Order Status</label>
            <div class="grid grid-cols-2 gap-4">
              <USelectMenu v-model="ord.order_status" :options="orderStatusOptions" multiple placeholder="Include status" value-attribute="value" option-attribute="label" class="w-full" />
              <USelectMenu v-model="ord.order_status_not" :options="orderStatusOptions" multiple placeholder="Exclude status" value-attribute="value" option-attribute="label" class="w-full" />
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Products</h4>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Search by Product Name</label>
              <UInput v-model="ord.purchased_product_title" placeholder="Search product name..." icon="i-heroicons-magnifying-glass" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Order Total Range</label>
            <div class="grid grid-cols-2 gap-2">
              <UInput v-model="ord.order_total_min" type="number" placeholder="Min amount" min="0" />
              <UInput v-model="ord.order_total_max" type="number" placeholder="Max amount" min="0" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Order Created Date Range</label>
            <div class="grid grid-cols-2 gap-2">
              <UInput v-model="ord.order_created_after" type="date" placeholder="From date" />
              <UInput v-model="ord.order_created_before" type="date" placeholder="To date" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-2">Order Reference ID</label>
            <UInput v-model="ord.order_reference_id" placeholder="Search by reference..." icon="i-heroicons-magnifying-glass" />
          </div>
        </div>

        <!-- Payments Tab -->
        <div v-if="currentTab === 'payments'" class="space-y-6">
          <p class="text-sm text-gray-600 mb-4">Filter attendees by payments, refunds, donations, and discounts</p>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Payments</h4>
            <div class="grid grid-cols-2 gap-3">
              <UCheckbox v-model="pay.has_payments" label="Has Any Payments" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Status</label>
                <USelectMenu v-model="pay.payment_status" :options="paymentStatusOptions" multiple placeholder="All statuses" value-attribute="value" option-attribute="label" class="w-full" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Target</label>
                <USelectMenu v-model="pay.payment_target" :options="paymentTargetOptions" placeholder="All targets" value-attribute="value" option-attribute="label" class="w-full" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Method Type</label>
                <USelectMenu v-model="pay.payment_method_type" :options="paymentMethodTypeOptions" multiple placeholder="All method types" value-attribute="value" option-attribute="label" class="w-full" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Method Title</label>
                <UInput v-model="pay.payment_method_title" placeholder="Search method title" icon="i-heroicons-magnifying-glass" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Payment Reference</label>
                <UInput v-model="pay.payment_reference" placeholder="Payment reference" icon="i-heroicons-document-text" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Bank Transfer Reference</label>
                <UInput v-model="pay.bank_transfer_reference" placeholder="Bank transfer reference" icon="i-heroicons-building-library" />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Refunds</h4>
            <div class="grid grid-cols-2 gap-3">
              <UCheckbox v-model="pay.has_refunds" label="Has Any Refunds" />
              <UCheckbox v-model="pay.refund_is_active" label="Active Refund Requests" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Refund Verification Status</label>
              <USelectMenu v-model="pay.refund_status" :options="verificationStatusOptions" multiple placeholder="All refund statuses" value-attribute="value" option-attribute="label" class="w-full" />
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Donations</h4>
            <div class="grid grid-cols-2 gap-3">
              <UCheckbox v-model="pay.has_donations" label="Has Any Donations" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Donation Verification Status</label>
              <USelectMenu v-model="pay.donation_status" :options="verificationStatusOptions" multiple placeholder="All donation statuses" value-attribute="value" option-attribute="label" class="w-full" />
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Discounts</h4>
            <div class="grid grid-cols-2 gap-3">
              <UCheckbox v-model="pay.has_discounts_used" label="Has Discounts Used" />
            </div>
            <div>
              <UInput v-model="pay.discount_name" placeholder="Search discount name..." icon="i-heroicons-magnifying-glass" />
            </div>
          </div>
        </div>

        <!-- Advanced Tab -->
        <div v-if="currentTab === 'advanced'" class="space-y-6">
          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Relationships</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-2">Relationship to User</label>
                <USelectMenu v-model="adv.relationship_to_user" :options="relationshipOptions" placeholder="All relationships" value-attribute="value" option-attribute="label" class="w-full" />
              </div>
              <div class="flex items-end">
                <UCheckbox v-model="adv.self_registered" label="Self-Registered Only" />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Bookings</h4>
            <UCheckbox v-model="adv.has_booking" label="Has Booking" />
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Date Filters</h4>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Date of Birth Range</label>
              <div class="grid grid-cols-2 gap-2">
                <UInput v-model="adv.date_of_birth_after" type="date" placeholder="From date" />
                <UInput v-model="adv.date_of_birth_before" type="date" placeholder="To date" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">Registration Date Range</label>
              <div class="grid grid-cols-2 gap-2">
                <UInput v-model="adv.created_after" type="datetime-local" placeholder="From date" />
                <UInput v-model="adv.created_before" type="datetime-local" placeholder="To date" />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-black text-primary uppercase tracking-widest">Advanced Options</h4>
            <UCheckbox v-model="demog.include_deleted" label="Include Deleted Attendees" />
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between pt-6 mt-6 border-t">
        <UButton color="gray" variant="ghost" @click="clearAllFilters">Clear All Filters</UButton>
        <div class="flex gap-2">
          <UButton color="white" @click="isOpen = false">Cancel</UButton>
          <UButton color="primary" @click="applyFilters">Apply Filters</UButton>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import type { AttendeeFiltersRequest } from '~/api/types.gen'
import OrganisationSelect from '~/components/ui/OrganisationSelect.vue'
import AreaSearchSelect from '~/components/ui/AreaSearchSelect.vue'
import DietaryRequirementSelect from '~/components/ui/DietaryRequirementSelect.vue'
import MedicalConditionSelect from '~/components/ui/MedicalConditionSelect.vue'
import AccessibilityRequirementSelect from '~/components/ui/AccessibilityRequirementSelect.vue'
import EventFormFilterPanel from '~/components/attendees/EventFormFilterPanel.vue'
import RegistrationQuestionsFilterPanel from '~/components/attendees/RegistrationQuestionsFilterPanel.vue'

interface Props {
  modelValue: boolean
  filters: AttendeeFiltersRequest
  eventSlug?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'apply', filters: AttendeeFiltersRequest): void
  (e: 'clear'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const currentTab = ref<'basic' | 'questions' | 'forms' | 'orders' | 'payments' | 'advanced'>('basic')

function makeLocalFilters(source: AttendeeFiltersRequest): AttendeeFiltersRequest {
  return {
    operator: source.operator ?? 'AND',
    demographics: { ...(source.demographics ?? {}) },
    status: { ...(source.status ?? {}) },
    forms: { operator: 'AND', conditions: [], ...(source.forms ?? {}) },
    registration_questions: { operator: 'AND', conditions: [], ...(source.registration_questions ?? {}) },
    orders: { ...(source.orders ?? {}) },
    payments: { ...(source.payments ?? {}) },
    advanced: { ...(source.advanced ?? {}) },
  }
}

const localFilters = ref<AttendeeFiltersRequest>(makeLocalFilters(props.filters))
const selectedAreaLabel = ref<string | null>(null)

// Typed section accessors — strips `| null` so component v-model bindings typecheck.
// These are always populated because makeLocalFilters initialises each sub-object.
const demog = computed(() => localFilters.value.demographics as Record<string, any>)
const stat = computed(() => localFilters.value.status as Record<string, any>)
const ord = computed(() => localFilters.value.orders as Record<string, any>)
const pay = computed(() => localFilters.value.payments as Record<string, any>)
const adv = computed(() => localFilters.value.advanced as Record<string, any>)

watch(() => props.filters, (newFilters) => {
  localFilters.value = makeLocalFilters(newFilters)
}, { deep: true })

// ── Single-value adapters for selects that still take a single ID ─────────────

const orgValue = computed(() => localFilters.value.demographics?.organisation?.[0] ?? null)
function onOrgChange(v: number | number[] | null) {
  if (v === null) localFilters.value.demographics!.organisation = []
  else if (Array.isArray(v)) localFilters.value.demographics!.organisation = v
  else localFilters.value.demographics!.organisation = [v]
}

const areaValue = computed(() => localFilters.value.demographics?.area_from?.[0] ?? null)
function onAreaSelect(id: number | null, label: string | null) {
  localFilters.value.demographics!.area_from = id ? [id] : []
  selectedAreaLabel.value = label
}



// ── Static options ──────────────────────────────────────────────────────────

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
  { value: false, label: 'Adults only (18+)' },
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

// ── Tab filter counts ────────────────────────────────────────────────────────

function countDefined(obj: Record<string, unknown> | undefined | null): number {
  if (!obj) return 0
  let count = 0
  for (const v of Object.values(obj)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v) && v.length === 0) continue
    count++
  }
  return count
}

function getTabFilterCount(tab: string): number {
  const f = localFilters.value
  switch (tab) {
    case 'basic': return countDefined(f.demographics as any) + countDefined(f.status as any)
    case 'questions': return (f.registration_questions?.conditions ?? []).length
    case 'forms': return (f.forms?.conditions ?? []).length
    case 'orders': return countDefined(f.orders as any)
    case 'payments': return countDefined(f.payments as any)
    case 'advanced': return countDefined(f.advanced as any)
    default: return 0
  }
}

// ── Actions ──────────────────────────────────────────────────────────────────

function applyFilters() {
  emit('apply', { ...localFilters.value })
  isOpen.value = false
}

function clearAllFilters() {
  emit('clear')
  isOpen.value = false
}
</script>

