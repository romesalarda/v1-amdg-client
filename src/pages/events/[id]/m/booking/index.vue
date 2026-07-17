<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <!-- View Toggle -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex bg-gray-100 rounded-lg p-0.5">
        <button
          @click="changeView('management')"
          :class="[
            'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
            currentView === 'management'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
            Management
          </span>
        </button>
        <button
          @click="changeView('statistics')"
          :class="[
            'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
            currentView === 'statistics'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          <span class="flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
            Statistics
          </span>
        </button>
      </div>
    </div>

    <!-- Management View -->
    <div v-if="currentView === 'management'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content with Stepper (2/3) -->
      <div class="lg:col-span-2">
        <!-- Step rows: stepper circle + line are inline with each section -->
        <div class="flex flex-col">

          <!-- Step 1 -->
          <div class="flex gap-6">
            <div class="hidden md:flex flex-col items-center flex-shrink-0" style="width: 48px;">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">1</div>
              <div class="flex-1 w-[1px] mt-1 stepper-line"></div>
            </div>
            <div class="flex-1 pb-12">
              <TicketTypesStep
                :event-id="id"
                :can-create="canCreateRegistration"
                :can-update="canUpdateRegistration"
                :can-delete="canDeleteRegistration"
                @open-modal="openTicketTypeModal"
                @toggle-status="toggleTicketTypeStatus"
                @remove="removeTicketType"
              />
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex gap-6">
            <div class="hidden md:flex flex-col items-center flex-shrink-0" style="width: 48px;">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">2</div>
              <div class="flex-1 w-[1px] mt-1 stepper-line"></div>
            </div>
            <div class="flex-1 pb-12">
              <BookingPackagesStep
                :event-id="id"
                :ticket-types="ticketTypes"
                :can-create="canCreateRegistration"
                :can-update="canUpdateRegistration"
                :can-delete="canDeleteRegistration"
                @open-modal="openPackageModal"
                @open-availability="openPackageAvailabilityModal"
                @toggle-status="togglePackageStatus"
                @remove="removePackage"
              />
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex gap-6">
            <div class="hidden md:flex flex-col items-center flex-shrink-0" style="width: 48px;">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">3</div>
              <div class="flex-1 w-[1px] mt-1 stepper-line"></div>
            </div>
            <div class="flex-1 pb-12">
              <DiscountsStep
                :discounts="discounts"
                :is-loading="discountsLoading"
                :can-create="canCreateRegistration"
                :packages-exist="packages.length > 0"
                @open-modal="openDiscountModal"
                @toggle-status="toggleDiscountStatus"
                @remove="removeDiscount"
              />
            </div>
          </div>

          <!-- Step 4 (no connector line after last) -->
          <div class="flex gap-6">
            <div class="hidden md:flex flex-col items-center flex-shrink-0" style="width: 48px;">
              <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">4</div>
              <div class="flex-1 w-[1px] mt-1 stepper-line"></div>
            </div>
            <div class="flex-1 pb-12">
              <AlternativeSignInsSection
                :sign-ins="signIns"
                :is-loading="signInsLoading"
                :can-create="canCreateRegistration"
                @open-modal="openSignInModal"
                @remove="removeSignIn"
              />
            </div>
          </div>

        </div>
      </div>

      <!-- Sidebar (1/3) -->
      <div>
        <BookingStatusSidebar
          :ticket-types-count="ticketTypes.length"
          :packages-count="packages.length"
          :active-discounts-count="discounts.filter((d: any) => d.active).length"
          :sign-ins-count="signIns.length"
          :max-attendees-per-booking="maxAttendeesPerBooking"
          :max-attendees-per-user="maxAttendeesPerUser"
          :is-saving="updateSettingsMutation.isPending.value"
          :can-edit-limits="canUpdateRegistration"
          @show-guide="showSetupGuide = true"
          @save-max-attendees-per-booking="saveMaxAttendeesPerBooking"
          @save-max-attendees-per-user="saveMaxAttendeesPerUser"
        />
      </div>
    </div>

    <!-- Statistics View -->
    <div v-else-if="currentView === 'statistics'">
      <NuxtPage />
    </div>

    <!-- Setup Guide Modal -->
    <BookingSetupGuideModal v-model:visible="showSetupGuide" />

    <!-- Ticket Type Modal -->
    <div v-if="showTicketTypeModal" @click.self="closeTicketTypeModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">confirmation_number</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingTicketType ? 'Edit Ticket Type' : 'Add Ticket Type' }}
          </h3>
        </div>
        <TicketTypeForm
          :model-value="editingTicketType"
          :event-start-date="event?.data?.start_datetime"
          :event-end-date="event?.data?.end_datetime"
          @submit="handleTicketTypeSubmit"
          @cancel="closeTicketTypeModal"
        />
      </div>
    </div>

    <!-- Package Modal -->
    <div v-if="showPackageModal" @click.self="closePackageModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">inventory_2</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingPackage ? 'Edit Booking Package' : 'Add Booking Package' }}
          </h3>
        </div>
        <BookingPackageForm
          :model-value="editingPackage"
          :event-id="Number(id)"
          :ticket-types="ticketTypes"
          :max-package-price="maxPackagePrice"
          @submit="handlePackageSubmit"
          @cancel="closePackageModal"
        />
      </div>
    </div>

    <!-- Sign-in Modal -->
    <div v-if="showSignInModal" @click.self="closeSignInModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">login</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingSignIn ? 'Edit Sign-in Method' : 'Add Sign-in Method' }}
          </h3>
        </div>
        <AlternativeSigninForm
          :model-value="editingSignIn"
          :is-loading="signInMutationLoading"
          @submit="onSubmitSignIn"
          @cancel="closeSignInModal"
        />
      </div>
    </div>

    <!-- Discount Modal -->
    <div v-if="showDiscountModal" @click.self="handleDiscountModalClose" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden max-w-3xl w-full">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary text-xl">percent</span>
          <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">
            {{ editingDiscount ? 'Edit Discount' : 'Add Discount' }}
          </h3>
        </div>
        <div class="relative h-[600px] px-6 py-4 w-full">
          <DiscountForm
            :model-value="editingDiscount"
            :event-id="Number(id)"
            :is-loading="discountMutationLoading"
            :packages="packages"
            :selected-package-id="selectedPackageForDiscount"
            @submit="handleDiscountSubmit"
            @cancel="handleDiscountModalClose"
          />
        </div>
      </div>
    </div>

    <!-- Package Availability Windows Modal -->
    <BookingPackageAvailabilityModal
      :visible="showPackageAvailabilityModal"
      :package-id="selectedPackageId"
      :package-name="selectedPackageName"
      :event-timezone="event?.data?.timezone || 'UTC'"
      :event-start-datetime="event?.data?.start_datetime"
      :event-end-datetime="event?.data?.end_datetime"
      @close="closePackageAvailabilityModal"
    />
  </EventManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useBookingTicketTypes } from '~/composables/resources/booking/bookingTicketTypes'
import { useBookingPackages } from '~/composables/resources/booking/bookingPackages'
import { useBookingAlternativeSignins } from '~/composables/resources/booking/bookingAlternativeSignins'
import { usePaymentDiscounts } from '~/composables/resources/payments/paymentDiscounts'
import { useCurrentUserEventPermissions } from '~/composables/permissions'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import TicketTypeForm from '~/components/events/forms/TicketTypeForm.vue'
import BookingPackageForm from '~/components/events/forms/BookingPackageForm.vue'
import DiscountForm from '~/components/events/forms/DiscountForm.vue'
import AlternativeSigninForm from '~/components/events/forms/AlternativeSigninForm.vue'
import TicketTypesStep from '~/components/events/booking/TicketTypesStep.vue'
import BookingPackagesStep from '~/components/events/booking/BookingPackagesStep.vue'
import DiscountsStep from '~/components/events/booking/DiscountsStep.vue'
import AlternativeSignInsSection from '~/components/events/booking/AlternativeSignInsSection.vue'
import BookingStatusSidebar from '~/components/events/booking/BookingStatusSidebar.vue'
import BookingSetupGuideModal from '~/components/events/booking/BookingSetupGuideModal.vue'
import BookingPackageAvailabilityModal from '~/components/events/booking/BookingPackageAvailabilityModal.vue'
import { useTicketTypeManagement } from '~/composables/booking/useTicketTypeManagement'
import { useBookingPackageManagement } from '~/composables/booking/useBookingPackageManagement'
import { useDiscountManagement } from '~/composables/booking/useDiscountManagement'
import { useAlternativeSignInManagement } from '~/composables/booking/useAlternativeSignInManagement'
import { useEventSettings, usePartialUpdateEventSettings } from '~/composables/resources/events/eventSettings'
import { useOrganisationPolicy } from '~/composables/resources/organisation/organisationPolicy'
import type { Ref } from 'vue'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'BOOKING_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  }
})
  
const route = useRoute()
const router = useRouter()
const id = computed(() => String(route.params.id))
const toast = useToast()

function getQueryString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value.find(v => typeof v === 'string')
    return typeof first === 'string' ? first : undefined
  }
  return typeof value === 'string' ? value : undefined
}

// View toggle
const currentView = ref<'management' | 'statistics'>(
  route.path.includes('/statistics') ? 'statistics' : 'management'
)

watch(() => route.path, (newPath) => {
  currentView.value = newPath.includes('/statistics') ? 'statistics' : 'management'
})

function changeView(view: 'management' | 'statistics') {
  currentView.value = view
  if (view === 'statistics') {
    router.push(`/events/${id.value}/m/booking/statistics`)
  } else {
    router.push(`/events/${id.value}/m/booking`)
  }
}

// Data fetching
const { data: event } = useEvent(id)
const { data: settingsData } = useEventSettings(id)
const updateSettingsMutation = usePartialUpdateEventSettings()
const event_pk = computed(() => event.value?.data?.id ?? null) as Ref<number | null>

// Organisation policy
const orgUrlSafeTitle = computed(() => event.value?.data?.organisation_url_safe_title || '')
const { data: policyData } = useOrganisationPolicy(orgUrlSafeTitle)
const orgPolicy = computed(() => policyData.value?.data)
const maxPackagePrice = computed(() => {
  const limit = Number(orgPolicy.value?.max_package_price ?? 0)
  return limit > 0 ? limit : null
})

const settings = computed(() => settingsData.value?.data)
const maxAttendeesPerBooking = computed(() => Number(settings.value?.max_attendees_per_booking || 5))
const maxAttendeesPerUser = computed(() => Number(settings.value?.max_attendees_per_user || 5))

const eventIdFilter = computed(() => ({ event: route.params.id as string }))
const { data: ticketTypesData, isLoading: ticketTypesLoading, refetch: refetchTicketTypes } = useBookingTicketTypes(eventIdFilter)
const { data: packagesData, isLoading: packagesLoading, refetch: refetchPackages } = useBookingPackages(eventIdFilter)
const { data: signInsData, isLoading: signInsLoading, refetch: refetchSignIns } = useBookingAlternativeSignins(eventIdFilter)
const { data: discountsData, isLoading: discountsLoading, refetch: refetchDiscounts } = usePaymentDiscounts(eventIdFilter)

const ticketTypes = computed(() => ticketTypesData.value?.data?.results || [])
const packages = computed(() => packagesData.value?.data?.results || [])
const signIns = computed(() => signInsData.value?.data?.results || [])
const discounts = computed(() => discountsData.value?.data?.results || [])



// Permissions
const { can } = useCurrentUserEventPermissions(id, {
  refetchInterval: 30000,
  refetchOnWindowFocus: true,
  staleTime: 15000,
})
const canCreateRegistration = computed(() => can('REGISTRATION', 'create').value.allowed)
const canUpdateRegistration = computed(() => can('REGISTRATION', 'update').value.allowed)
const canDeleteRegistration = computed(() => can('REGISTRATION', 'delete').value.allowed)

// Setup Guide
const showSetupGuide = ref(false)

// Composable: Ticket Types
const {
  showTicketTypeModal,
  editingTicketType,
  openTicketTypeModal,
  closeTicketTypeModal,
  handleTicketTypeSubmit,
  toggleTicketTypeStatus,
  removeTicketType,
} = useTicketTypeManagement(id, event, ticketTypes, refetchTicketTypes, refetchPackages)

// Composable: Booking Packages
const {
  showPackageModal,
  editingPackage,
  openPackageModal,
  closePackageModal,
  handlePackageSubmit,
  togglePackageStatus,
  removePackage,
  showPackageAvailabilityModal,
  selectedPackageId,
  selectedPackageName,
  openPackageAvailabilityModal,
  closePackageAvailabilityModal,
} = useBookingPackageManagement(id, event, packages, refetchPackages)

// Composable: Discounts
const {
  showDiscountModal,
  editingDiscount,
  selectedPackageForDiscount,
  discountMutationLoading,
  openDiscountModal,
  closeDiscountModal,
  handleDiscountSubmit,
  toggleDiscountStatus,
  removeDiscount,
} = useDiscountManagement(packages, refetchDiscounts)

const suppressDiscountModalHydration = ref(false)

function handleDiscountModalClose() {
  suppressDiscountModalHydration.value = true
  closeDiscountModal()
}

// Composable: Alternative Sign-ins
const {
  showSignInModal,
  editingSignIn,
  signInMutationLoading,
  openSignInModal,
  closeSignInModal,
  onSubmitSignIn,
  removeSignIn,
} = useAlternativeSignInManagement(event_pk, signIns, refetchSignIns)

watch(
  () => ({
    discountId: getQueryString(route.query['discount-id'] || route.query.discount_id),
    discountsLoaded: discounts.value.length > 0,
    isModalOpen: showDiscountModal.value,
  }),
  ({ discountId, discountsLoaded, isModalOpen }) => {
    if (!discountId) {
      suppressDiscountModalHydration.value = false
      return
    }

    if (suppressDiscountModalHydration.value || !discountsLoaded || isModalOpen) return

    const discount = discounts.value.find((entry: any) => entry.discount_id === discountId)
    if (!discount) return

    const packageId = Number(discount.target_package?.id ?? 0)
    openDiscountModal(discount, Number.isFinite(packageId) && packageId > 0 ? packageId : undefined)
  },
  { immediate: true },
)

const saveMaxAttendeesPerBooking = async (value: number) => {
  if (!settings.value?.id) return

  try {
    await updateSettingsMutation.mutateAsync({
      settingsId: settings.value.id,
      body: { max_attendees_per_booking: Number(value ?? 0) },
    })
    toast.add({
      title: 'Booking limit updated',
      color: 'green',
    })
  } catch (error) {
    toast.add({
      title: 'Failed to update booking limit',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const saveMaxAttendeesPerUser = async (value: number) => {
  if (!settings.value?.id) return

  try {
    await updateSettingsMutation.mutateAsync({
      settingsId: settings.value.id,
      body: { max_attendees_per_user: Number(value ?? 0) },
    })
    toast.add({
      title: 'User limit updated',
      color: 'green',
    })
  } catch (error) {
    toast.add({
      title: 'Failed to update user limit',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}
</script>

<style scoped>
.stepper-line {
  background-image: linear-gradient(to bottom, #0F172A 50%, transparent 50%);
  background-size: 1px 12px;
  background-repeat: repeat-y;
}
</style>
