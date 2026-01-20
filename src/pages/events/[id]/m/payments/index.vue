<template>
  <EventsManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content (3/4) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Payment Settings -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-gray-900">Payment Settings</h2>
            <p class="text-sm text-gray-600 mt-1">
              Configure payment options and features for this event
            </p>
          </template>

          <div v-if="settingsLoading">
            <USkeleton class="h-64" />
          </div>

          <form v-else @submit="onSaveSettings" class="space-y-6">
            <!-- Payment Features -->
            <div class="space-y-4">
              <h3 class="font-semibold">Payment Features</h3>
              
              <UFormGroup
                name="payment_enabled"
                help="Allow attendees to make payments for this event"
              >
                <UCheckbox
                  v-model="settingsForm.payment_enabled"
                  label="Enable Payments"
                />
              </UFormGroup>

              <UFormGroup
                name="product_selling_enabled"
                help="Allow selling of products (merchandise, materials, etc.)"
              >
                <UCheckbox
                  v-model="settingsForm.product_selling_enabled"
                  label="Enable Product Selling"
                />
              </UFormGroup>

              <UFormGroup
                name="donation_enabled"
                help="Accept donations for this event"
              >
                <UCheckbox
                  v-model="settingsForm.donation_enabled"
                  label="Enable Donations"
                />
              </UFormGroup>

              <UFormGroup
                name="accepting_sponsorships_enabled"
                help="Accept sponsorships from organizations or individuals"
              >
                <UCheckbox
                  v-model="settingsForm.accepting_sponsorships_enabled"
                  label="Accept Sponsorships"
                />
              </UFormGroup>
            </div>

            <div class="flex justify-end gap-2">
              <UButton
                label="Reset"
                variant="ghost"
                @click="resetSettings"
              />
              <UButton
                label="Save Changes"
                type="submit"
                :loading="updateSettingsMutation.isPending.value"
              />
            </div>
          </form>
        </UCard>

        <!-- Ticket Types -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Ticket Types</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Define ticket categories for your event (required for packages)
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Ticket Type"
                @click="showTicketTypeModal = true"
              />
            </div>
          </template>

          <div v-if="ticketTypesLoading" class="space-y-3">
            <USkeleton v-for="i in 2" :key="i" class="h-16" />
          </div>

          <div v-else-if="ticketTypes.length" class="space-y-3">
            <div
              v-for="ticketType in ticketTypes"
              :key="ticketType.id"
              class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-900">{{ ticketType.title }}</h3>
                    <UBadge
                      v-if="ticketType.is_active"
                      label="Active"
                      color="green"
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                </div>
                <UButton
                  icon="i-heroicons-trash"
                  color="red"
                  variant="ghost"
                  size="sm"
                  @click="removeTicketType(ticketType.id)"
                />
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-600">
            <p>No ticket types defined</p>
            <p class="text-xs mt-2">Create a ticket type before adding packages</p>
          </div>
        </UCard>

        <!-- Booking Packages -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold">Booking Packages</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create different pricing tiers for event registration
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Package"
                @click="showPackageModal = true"
                :disabled="!settingsForm.payment_enabled"
              />
            </div>
          </template>

          <div v-if="packagesLoading" class="space-y-3">
            <USkeleton v-for="i in 2" :key="i" class="h-24" />
          </div>

          <div v-else-if="packages.length" class="space-y-3">
            <div
              v-for="pkg in packagesList"
              :key="pkg.id"
              class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-gray-900">{{ pkg.name }}</h3>
                    <UBadge
                      v-if="pkg.is_active"
                      label="Active"
                      color="green"
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                  <div class="text-sm text-gray-600 mb-2">
                    Ticket Type: {{ pkg.ticket_type_title }}
                  </div>
                  <div class="flex items-center gap-4 text-sm">
                    <span class="font-semibold text-primary-600">
                      ${{ pkg.base_amount }}
                    </span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    @click="editPackage(pkg)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    variant="ghost"
                    size="sm"
                    @click="removePackage(pkg.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-600">
            <p v-if="!settingsForm.payment_enabled">
              Enable payments to create booking packages
            </p>
            <p v-else>No booking packages yet</p>
          </div>
        </UCard>

        <!-- Discount Codes -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Discount Codes</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Create promotional codes for discounted registration
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Discount"
                @click="showDiscountModal = true"
                :disabled="!settingsForm.payment_enabled"
              />
            </div>
          </template>

          <div class="text-center py-8 text-gray-600">
            <p v-if="!settingsForm.payment_enabled">
              Enable payments to create discount codes
            </p>
            <p v-else>No discount codes configured</p>
            <p class="text-xs mt-2">Feature coming soon</p>
          </div>
        </UCard>

        <!-- Alternative Sign-ins -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Alternative Sign-ins</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Configure additional check-in methods for attendees
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Method"
                @click="showSignInModal = true"
              />
            </div>
          </template>

          <div v-if="signInsLoading" class="space-y-3">
            <USkeleton v-for="i in 2" :key="i" class="h-16" />
          </div>

          <div v-else-if="signIns.length" class="space-y-3">
            <div
              v-for="signIn in signIns"
              :key="signIn.id"
              class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ signIn.title }}</h3>
                </div>
                <UButton
                  icon="i-heroicons-trash"
                  color="red"
                  variant="ghost"
                  size="sm"
                  @click="removeSignIn(signIn.id)"
                />
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-600">
            <p>No alternative sign-in methods configured</p>
            <p class="text-xs mt-2">Add methods like QR codes, RFID, etc.</p>
          </div>
        </UCard>
      </div>

      <!-- Sidebar (1/4) -->
      <div class="space-y-6">
        <!-- Payment Status -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Payment Status</h3>
          </template>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm">Payments</span>
              <UBadge
                :label="settingsForm.payment_enabled ? 'Enabled' : 'Disabled'"
                :color="settingsForm.payment_enabled ? 'green' : 'gray'"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Products</span>
              <UBadge
                :label="settingsForm.product_selling_enabled ? 'Enabled' : 'Disabled'"
                :color="settingsForm.product_selling_enabled ? 'green' : 'gray'"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Donations</span>
              <UBadge
                :label="settingsForm.donation_enabled ? 'Enabled' : 'Disabled'"
                :color="settingsForm.donation_enabled ? 'green' : 'gray'"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Sponsorships</span>
              <UBadge
                :label="settingsForm.accepting_sponsorships_enabled ? 'Enabled' : 'Disabled'"
                :color="settingsForm.accepting_sponsorships_enabled ? 'green' : 'gray'"
              />
            </div>
          </div>
        </UCard>

        <!-- Package Stats -->
        <UCard v-if="settingsForm.payment_enabled">
          <template #header>
            <h3 class="font-semibold">Package Overview</h3>
          </template>
          <div class="space-y-4">
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ packages.length || 0 }}</div>
              <div class="text-sm text-gray-600">Total Packages</div>
            </div>
            <div v-if="packages.length">
              <div class="text-2xl font-bold text-gray-900">
                ${{ Math.min(...packages.map((p: any) => Number(p.base_amount))) }} - ${{ Math.max(...packages.map((p: any) => Number(p.base_amount))) }}
              </div>
              <div class="text-sm text-gray-600">Price Range</div>
            </div>
          </div>
        </UCard>

        <!-- Help Card -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Payment Help</h3>
          </template>
          <div class="text-sm space-y-3 text-gray-600">
            <p>
              <strong>Booking Packages</strong> allow you to create different pricing tiers for your event.
            </p>
            <p>
              <strong>Discount Codes</strong> can be used to offer promotional pricing to specific attendees.
            </p>
            <p>
              Enable <strong>Product Selling</strong> to sell merchandise or materials alongside registration.
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Add Package Modal -->
    <UModal v-model="showPackageModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Booking Package</h3>
        </template>

        <form @submit="onAddPackage" class="space-y-4">
          <UFormGroup label="Package Name" name="name" required>
            <UInput
              v-model="packageForm.name"
              placeholder="e.g. Early Bird, VIP, Standard"
            />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea
              v-model="packageForm.description"
              placeholder="What's included in this package..."
              :rows="3"
            />
          </UFormGroup>

          <UFormGroup label="Ticket Type" name="ticket_type" required>
            <USelectMenu
              v-model="packageForm.ticket_type as any"
              :options="ticketTypes"
              option-attribute="title"
              value-attribute="id"
              placeholder="Select ticket type"
            >
              <template #label>
                {{ ticketTypes.find((t: any) => t.id === packageForm.ticket_type)?.title || 'Select ticket type' }}
              </template>
            </USelectMenu>
          </UFormGroup>

          <UFormGroup label="Base Amount" name="base_amount" required>
            <UInput
              v-model="packageForm.base_amount"
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </UFormGroup>

          <UFormGroup name="is_default">
            <UCheckbox
              v-model="packageForm.is_default"
              label="Set as default package"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showPackageModal = false"
            />
            <UButton
              label="Create Package"
              type="submit"
              :loading="addPackageMutation.isPending.value"
            />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Edit Package Modal -->
    <EditPackageModal
      v-model="showEditPackageModal"
      :package="editingPackage"
      :ticket-types="ticketTypes"
      :on-update="handlePackageUpdate"
      :is-loading="updatePackageMutation?.isPending?.value || false"
    />

    <!-- Add Ticket Type Modal -->
    <UModal v-model="showTicketTypeModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Ticket Type</h3>
        </template>

        <form @submit="onAddTicketType" class="space-y-4">
          <UFormGroup label="Type Name" name="title" required>
            <UInput
              v-model="ticketTypeForm.title"
              placeholder="e.g. General Admission, VIP, Student"
            />
          </UFormGroup>

          <UFormGroup name="is_active">
            <UCheckbox
              v-model="ticketTypeForm.is_active"
              label="Active ticket type"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showTicketTypeModal = false"
            />
            <UButton
              label="Create Type"
              type="submit"
              :loading="addTicketTypeMutation.isPending.value"
            />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Add Sign-in Method Modal -->
    <UModal v-model="showSignInModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Sign-in Method</h3>
        </template>

        <form @submit="onAddSignIn" class="space-y-4">
          <UFormGroup label="Method Name" name="title" required>
            <UInput
              v-model="signInForm.title"
              placeholder="e.g. QR Code, RFID Card, Email Verification"
            />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea
              v-model="signInForm.description"
              placeholder="Describe how this sign-in method works..."
              :rows="2"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="showSignInModal = false"
            />
            <UButton
              label="Create Method"
              type="submit"
              :loading="addSignInMutation.isPending.value"
            />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Add Discount Modal -->
    <UModal v-model="showDiscountModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Discount Code</h3>
        </template>

        <div class="text-center py-8 text-gray-600">
          <p>Discount code management coming soon</p>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              label="Close"
              variant="ghost"
              @click="showDiscountModal = false"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { useEventSettings, usePartialUpdateEventSettings } from '~/composables/resources/events/eventSettings'
import { useBookingPackages, useCreateBookingPackage, useDeleteBookingPackage } from '~/composables/resources/booking/bookingPackages'
import { useBookingTicketTypes, useCreateBookingTicketType, useDeleteBookingTicketType } from '~/composables/resources/booking/bookingTicketTypes'
import { useBookingAlternativeSignins, useCreateBookingAlternativeSignin, useDeleteBookingAlternativeSignin } from '~/composables/resources/booking/bookingAlternativeSignins'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'
import EditPackageModal from '~/components/events/EditPackageModal.vue'

// Try to import update mutation if it exists
let usePartialUpdateBookingPackage: any = null
try {
  const module = await import('~/composables/resources/booking/bookingPackages')
  usePartialUpdateBookingPackage = (module as any).usePartialUpdateBookingPackage
} catch {
  console.warn('usePartialUpdateBookingPackage not available')
}

definePageMeta({
  layout: false,
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

// Fetch event data
const { data: event } = useEvent(id)

// Fetch settings and packages
const { data: settingsData, isLoading: settingsLoading } = useEventSettings(id)
const eventIdFilter = { event__event_id: route.params.id as string }
const { data: packagesData, isLoading: packagesLoading, refetch: refetchPackages } = useBookingPackages(eventIdFilter)
const { data: ticketTypesData, isLoading: ticketTypesLoading, refetch: refetchTicketTypes } = useBookingTicketTypes(eventIdFilter)
const { data: signInsData, isLoading: signInsLoading, refetch: refetchSignIns } = useBookingAlternativeSignins(eventIdFilter)

const packages = computed(() => packagesData.value?.data?.results || [])
const packagesList = computed(() => packages.value)
const ticketTypes = computed(() => ticketTypesData.value?.data?.results || [])
const signIns = computed(() => signInsData.value?.data?.results || [])
const settings = computed(() => settingsData.value?.data)
// Settings form
const settingsForm = reactive({
  payment_enabled: false,
  product_selling_enabled: false,
  donation_enabled: false,
  accepting_sponsorships_enabled: false,
})

// Watch settings data and populate form
watch(settings, (newSettings) => {
  if (newSettings) {
    settingsForm.payment_enabled = newSettings?.payment_enabled || false
    settingsForm.product_selling_enabled = newSettings?.product_selling_enabled || false
    settingsForm.donation_enabled = newSettings?.donation_enabled || false
    settingsForm.accepting_sponsorships_enabled = newSettings?.accepting_sponsorships_enabled || false
  }
}, { immediate: true })

const updateSettingsMutation = usePartialUpdateEventSettings()

const onSaveSettings = async (e: Event) => {
  e.preventDefault()

  if (!settings.value?.id) return

  try {
    await updateSettingsMutation.mutateAsync({
      settingsId: settings.value.id,
      body: settingsForm,
    })

    toast.add({
      title: 'Settings updated',
      color: 'green',
    })
  } catch (error) {
    toast.add({
      title: 'Failed to update settings',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const resetSettings = () => {
  if (settings.value) {
    settingsForm.payment_enabled = settings.value.payment_enabled || false
    settingsForm.product_selling_enabled = settings.value.product_selling_enabled || false
    settingsForm.donation_enabled = settings.value.donation_enabled || false
    settingsForm.accepting_sponsorships_enabled = settings.value.accepting_sponsorships_enabled || false
  }
}

// Package modal
const showPackageModal = ref(false)
const packageForm = reactive({
  name: '',
  description: '',
  base_amount: '',
  ticket_type: null as number | null,
  capacity: '',
  is_default: false,
})

// Ticket Type modal
const showTicketTypeModal = ref(false)
const ticketTypeForm = reactive({
  title: '',
  is_active: true,
})

// Alternative Sign-in modal
const showSignInModal = ref(false)
const signInForm = reactive({
  title: '',
  description: '',
})

const addPackageMutation = useCreateBookingPackage()

const onAddPackage = async (e: Event) => {
  e.preventDefault()

  if (!packageForm.ticket_type) {
    toast.add({
      title: 'Ticket type required',
      description: 'Please select a ticket type',
      color: 'red',
    })
    return
  }

  try {
    await addPackageMutation.mutateAsync({
      name: packageForm.name,
      event: Number(route.params.id),
      description: packageForm.description || undefined,
      base_amount: packageForm.base_amount,
      ticket_type: packageForm.ticket_type,
    })

    toast.add({
      title: 'Package created',
      color: 'green',
    })

    showPackageModal.value = false
    packageForm.name = ''
    packageForm.description = ''
    packageForm.base_amount = ''
    packageForm.ticket_type = null
    packageForm.capacity = ''
    packageForm.is_default = false
    refetchPackages()
  } catch (error) {
    toast.add({
      title: 'Failed to create package',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Remove package
const removePackageMutation = useDeleteBookingPackage()

const removePackage = async (packageId: number) => {
  if (!confirm('Remove this booking package?')) return

  try {
    await removePackageMutation.mutateAsync(packageId)

    toast.add({
      title: 'Package removed',
      color: 'green',
    })

    refetchPackages()
  } catch (error) {
    toast.add({
      title: 'Failed to remove package',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Edit package
const showEditPackageModal = ref(false)
const editingPackage = ref<any>(null)

const editPackage = (pkg: any) => {
  editingPackage.value = pkg
  showEditPackageModal.value = true
}

// Check if update mutation exists in composable
const updatePackageMutationExists = () => {
  try {
    return typeof usePartialUpdateBookingPackage !== 'undefined'
  } catch {
    return false
  }
}

// Use the update mutation if it exists
const updatePackageMutation = updatePackageMutationExists() 
  ? (usePartialUpdateBookingPackage as any)() 
  : null

const handlePackageUpdate = async (data: any) => {
  if (!updatePackageMutation || !editingPackage.value) return

  try {
    await updatePackageMutation.mutateAsync({
      packageId: editingPackage.value.id,
      body: data,
    })

    toast.add({
      title: 'Package updated',
      color: 'green',
    })

    showEditPackageModal.value = false
    editingPackage.value = null
    refetchPackages()
  } catch (error) {
    toast.add({
      title: 'Failed to update package',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Discount modal
const showDiscountModal = ref(false)

// Ticket Type mutations
const addTicketTypeMutation = useCreateBookingTicketType()

const onAddTicketType = async (e: Event) => {
  e.preventDefault()

  try {
    await addTicketTypeMutation.mutateAsync({
      title: ticketTypeForm.title,
      event: Number(route.params.id),
      is_active: ticketTypeForm.is_active,
    })

    toast.add({
      title: 'Ticket type created',
      color: 'green',
    })

    showTicketTypeModal.value = false
    ticketTypeForm.title = ''
    ticketTypeForm.is_active = true
    refetchTicketTypes()
  } catch (error) {
    toast.add({
      title: 'Failed to create ticket type',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removeTicketTypeMutation = useDeleteBookingTicketType()

const removeTicketType = async (ticketTypeId: number) => {
  if (!confirm('Remove this ticket type? This may affect existing packages.')) return

  try {
    await removeTicketTypeMutation.mutateAsync(ticketTypeId)

    toast.add({
      title: 'Ticket type removed',
      color: 'green',
    })

    refetchTicketTypes()
    refetchPackages()
  } catch (error) {
    toast.add({
      title: 'Failed to remove ticket type',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

// Alternative Sign-in mutations
const addSignInMutation = useCreateBookingAlternativeSignin()

const onAddSignIn = async (e: Event) => {
  e.preventDefault()

  try {
    await addSignInMutation.mutateAsync({
      title: signInForm.title,
      event: Number(route.params.id),
      description: signInForm.description || undefined,
    })

    toast.add({
      title: 'Sign-in method created',
      color: 'green',
    })

    showSignInModal.value = false
    signInForm.title = ''
    signInForm.description = ''
    refetchSignIns()
  } catch (error) {
    toast.add({
      title: 'Failed to create sign-in method',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removeSignInMutation = useDeleteBookingAlternativeSignin()

const removeSignIn = async (signInId: string) => {
  if (!confirm('Remove this sign-in method?')) return

  try {
    await removeSignInMutation.mutateAsync(signInId)

    toast.add({
      title: 'Sign-in method removed',
      color: 'green',
    })

    refetchSignIns()
  } catch (error) {
    toast.add({
      title: 'Failed to remove sign-in method',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}
</script>
