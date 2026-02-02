<template>
  <EventsManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Ticket Types Section -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Ticket Types</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Define ticket categories with scopes and validity periods
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Ticket Type"
                @click="openTicketTypeModal()"
              />
            </div>
          </template>

          <div v-if="ticketTypesLoading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-24" />
          </div>

          <div v-else-if="ticketTypes.length" class="space-y-3">
            <div
              v-for="ticketType in ticketTypes"
              :key="ticketType.id"
              class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-gray-900">{{ ticketType.title }}</h3>
                    <UBadge
                      :label="ticketType.scope"
                      :color="ticketType.scope === 'FULL_EVENT' ? 'blue' : ticketType.scope === 'SINGLE_DAY' ? 'purple' : ticketType.scope === 'WORKSHOP_ONLY' ? 'orange' : 'gray'"
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div v-if="ticketType.valid_from || ticketType.valid_until" class="flex items-center gap-2">
                      <span class="font-medium">Valid:</span>
                      <span>
                        {{ formatDate(ticketType.valid_from) || 'Start' }} - {{ formatDate(ticketType.valid_until) || 'End' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UToggle
                    :model-value="ticketType.is_active"
                    @update:model-value="toggleTicketTypeStatus(ticketType.id, $event)"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    @click="openTicketTypeModal(ticketType)"
                  />
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
          </div>

          <div v-else class="text-center py-8 text-gray-600">
            <p>No ticket types yet. Create one to get started.</p>
          </div>
        </UCard>

        <!-- Booking Packages Section -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Booking Packages</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Create pricing packages linked to ticket types
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Package"
                @click="openPackageModal()"
                :disabled="!ticketTypes.length"
              />
            </div>
          </template>

          <div v-if="packagesLoading" class="space-y-3">
            <USkeleton v-for="i in 3" :key="i" class="h-28" />
          </div>

          <div v-else-if="packages.length" class="space-y-3">
            <div
              v-for="pkg in packages"
              :key="pkg.id"
              class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-gray-900">{{ pkg.name }}</h3>
                  </div>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">Ticket Type:</span>
                      <span>{{ getTicketTypeName(pkg.ticket_type) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium">Price:</span>
                      <span class="text-primary-600 font-semibold">${{ formatAmount(pkg.base_amount) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UToggle
                    :model-value="pkg.is_active"
                    @update:model-value="togglePackageStatus(pkg.id, $event)"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    @click="openPackageModal(pkg)"
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
            <p v-if="!ticketTypes.length">Create ticket types first before adding packages</p>
            <p v-else>No packages yet. Create one to get started.</p>
          </div>
        </UCard>

        <!-- Alternative Sign-ins Section -->
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
                @click="openSignInModal()"
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
                  <p v-if="(signIn as any).description" class="text-sm text-gray-600 mt-1">
                    {{ (signIn as any).description }}
                  </p>
                  <div v-if="(signIn as any).format_match" class="mt-2 flex items-center gap-2">
                    <UBadge color="blue" variant="subtle" size="xs">
                      Pattern: {{ getPatternLabel((signIn as any).format_match) }}
                    </UBadge>
                    <span v-if="signIn.max_uses_per_signin" class="text-xs text-gray-500">
                      Max uses: {{ signIn.max_uses_per_signin }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    @click="openSignInModal(signIn)"
                  />
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
          </div>

          <div v-else class="text-center py-8 text-gray-600">
            <p>No alternative sign-in methods configured</p>
            <p class="text-xs mt-2">Add methods like QR codes, RFID, etc.</p>
          </div>
        </UCard>
      </div>

      <!-- Sidebar (1/3) -->
      <div class="space-y-6">
        <!-- Booking Status Card -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Booking Status</h3>
          </template>
          <div class="space-y-4">
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ ticketTypes.length }}</div>
              <div class="text-sm text-gray-600">Total Ticket Types</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ packages.length }}</div>
              <div class="text-sm text-gray-600">Total Packages</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ activePackagesCount }}</div>
              <div class="text-sm text-gray-600">Active Packages</div>
            </div>
          </div>
        </UCard>

        <!-- Help Card -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Setup Tips</h3>
          </template>
          <div class="text-sm space-y-3 text-gray-600">
            <p>
              <strong>Ticket Types</strong> define the scope and validity of tickets (full event, single day, or custom range).
            </p>
            <p>
              <strong>Packages</strong> are pricing tiers linked to ticket types. Create multiple packages for different pricing options.
            </p>
            <p>
              <strong>Alternative Sign-ins</strong> provide additional ways for attendees to check in (QR codes, RFID cards, etc.).
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Add/Edit Ticket Type Modal -->
    <UModal v-model="showTicketTypeModal" size="lg">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingTicketType ? 'Edit Ticket Type' : 'Add Ticket Type' }}
          </h3>
        </template>

        <TicketTypeForm
          :model-value="editingTicketType"
          :event-start-date="event?.data?.start_datetime"
          :event-end-date="event?.data?.end_datetime"
          @submit="handleTicketTypeSubmit"
          @cancel="closeTicketTypeModal"
        />
      </UCard>
    </UModal>

    <!-- Add/Edit Package Modal -->
    <UModal v-model="showPackageModal" size="xl">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingPackage ? 'Edit Booking Package' : 'Add Booking Package' }}
          </h3>
        </template>

        <BookingPackageForm
          :model-value="editingPackage"
          :event-id="Number(id)"
          :ticket-types="ticketTypes"
          @submit="handlePackageSubmit"
          @cancel="closePackageModal"
        />
      </UCard>
    </UModal>

    <!-- Add/Edit Alternative Sign-in Modal -->
    <UModal v-model="showSignInModal" size="lg">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingSignIn ? 'Edit Sign-in Method' : 'Add Sign-in Method' }}
          </h3>
        </template>

        <form @submit="onSubmitSignIn" class="space-y-4">
          <UFormGroup label="Method Name" name="title" required>
            <UInput
              v-model="signInForm.title"
              placeholder="e.g. Community ID, RFID Card, QR Code"
            />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea
              v-model="signInForm.description"
              placeholder="Describe how this sign-in method works..."
              :rows="3"
            />
          </UFormGroup>

          <UFormGroup label="ID Format Pattern (Optional)" name="format_match">
            <div class="space-y-2">
              <USelectMenu
                v-model="signInForm.patternType"
                :options="patternOptions"
                value-attribute="value"
                option-attribute="label"
                placeholder="Select a pattern type"
              />
              
              <div v-if="signInForm.patternType === 'custom'" class="p-3 bg-gray-50 rounded-lg">
                <UInput
                  v-model="signInForm.format_match"
                  placeholder="Enter custom regex pattern"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Advanced: Enter a regular expression pattern
                </p>
              </div>
              
              <div v-else-if="signInForm.patternType && signInForm.patternType !== 'none'" class="p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-700">
                  <strong>Pattern:</strong> {{ patternExamples[signInForm.patternType]?.example }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ patternExamples[signInForm.patternType]?.description }}
                </p>
              </div>
            </div>
          </UFormGroup>

          <UFormGroup label="Max Uses Per Sign-in (Optional)" name="max_uses">
            <UInput
              v-model="signInForm.max_uses_per_signin"
              type="number"
              min="1"
              placeholder="Leave empty for unlimited"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              variant="ghost"
              @click="closeSignInModal"
            />
            <UButton
              :label="editingSignIn ? 'Update Method' : 'Create Method'"
              type="submit"
              :loading="signInMutationLoading"
            />
          </div>
        </form>
      </UCard>
    </UModal>
  </EventsManagementLayout>
</template>

<script setup lang="ts">
import { useEvent } from '~/composables/resources/events/events'
import { 
  useBookingTicketTypes, 
  useCreateBookingTicketType, 
  usePartialUpdateBookingTicketType,
  useDeleteBookingTicketType 
} from '~/composables/resources/booking/bookingTicketTypes'
import { 
  useBookingPackages, 
  useCreateBookingPackage, 
  usePartialUpdateBookingPackage,
  useDeleteBookingPackage 
} from '~/composables/resources/booking/bookingPackages'
import { 
  useBookingAlternativeSignins, 
  useCreateBookingAlternativeSignin,
  usePartialUpdateBookingAlternativeSignin,
  useDeleteBookingAlternativeSignin 
} from '~/composables/resources/booking/bookingAlternativeSignins'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'
import TicketTypeForm from '~/components/events/forms/TicketTypeForm.vue'
import BookingPackageForm from '~/components/events/forms/BookingPackageForm.vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

// Fetch event data
const { data: event } = useEvent(id)

// Extract event PK from the event data
const event_pk = computed(() => event.value?.data?.id || null)

// Fetch booking data
const eventIdFilter = computed(() => ({ event__event_id: route.params.id as string }))
const { data: ticketTypesData, isLoading: ticketTypesLoading, refetch: refetchTicketTypes } = useBookingTicketTypes(eventIdFilter)
const { data: packagesData, isLoading: packagesLoading, refetch: refetchPackages } = useBookingPackages(eventIdFilter)
const { data: signInsData, isLoading: signInsLoading, refetch: refetchSignIns } = useBookingAlternativeSignins(eventIdFilter)

const ticketTypes = computed(() => ticketTypesData.value?.data?.results || [])
const packages = computed(() => packagesData.value?.data?.results || [])
const signIns = computed(() => signInsData.value?.data?.results || [])

const activePackagesCount = computed(() => packages.value.filter((p: any) => p.is_active).length)

// Ticket Type Modal & CRUD
const showTicketTypeModal = ref(false)
const editingTicketType = ref<any>(null)

const createTicketTypeMutation = useCreateBookingTicketType()
const updateTicketTypeMutation = usePartialUpdateBookingTicketType()
const deleteTicketTypeMutation = useDeleteBookingTicketType()

const ticketTypeMutationLoading = computed(() => 
  createTicketTypeMutation.isPending.value || updateTicketTypeMutation.isPending.value
)

const openTicketTypeModal = (ticketType?: any) => {
  editingTicketType.value = ticketType || null
  showTicketTypeModal.value = true
}

const closeTicketTypeModal = () => {
  showTicketTypeModal.value = false
  editingTicketType.value = null
}

const handleTicketTypeSubmit = async (data: any) => {
  try {
    if (editingTicketType.value) {
      await updateTicketTypeMutation.mutateAsync({
        ticketTypeId: editingTicketType.value.id,
        body: data,
      })
      toast.add({
        title: 'Ticket type updated',
        color: 'green',
      })
    } else {
      await createTicketTypeMutation.mutateAsync({
        ...data,
        event: Number(route.params.id),
      })
      toast.add({
        title: 'Ticket type created',
        color: 'green',
      })
    }

    closeTicketTypeModal()
    refetchTicketTypes()
  } catch (error) {
    toast.add({
      title: editingTicketType.value ? 'Failed to update ticket type' : 'Failed to create ticket type',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const toggleTicketTypeStatus = async (ticketTypeId: number, isActive: boolean) => {
  try {
    await updateTicketTypeMutation.mutateAsync({
      ticketTypeId,
      body: { is_active: isActive },
    })
    toast.add({
      title: 'Status updated',
      color: 'green',
    })
    refetchTicketTypes()
  } catch (error) {
    toast.add({
      title: 'Failed to update status',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removeTicketType = async (ticketTypeId: number) => {
  if (!confirm('Remove this ticket type? This may affect existing packages.')) return

  try {
    await deleteTicketTypeMutation.mutateAsync(ticketTypeId)
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

// Package Modal & CRUD
const showPackageModal = ref(false)
const editingPackage = ref<any>(null)

const createPackageMutation = useCreateBookingPackage()
const updatePackageMutation = usePartialUpdateBookingPackage()
const deletePackageMutation = useDeleteBookingPackage()

const packageMutationLoading = computed(() => 
  createPackageMutation.isPending.value || updatePackageMutation.isPending.value
)

const openPackageModal = (pkg?: any) => {
  editingPackage.value = pkg || null
  showPackageModal.value = true
}

const closePackageModal = () => {
  showPackageModal.value = false
  editingPackage.value = null
}

const handlePackageSubmit = async (data: any) => {
  try {
    if (editingPackage.value) {
      await updatePackageMutation.mutateAsync({
        packageId: editingPackage.value.id,
        body: data,
      })
      toast.add({
        title: 'Package updated',
        color: 'green',
      })
    } else {
      await createPackageMutation.mutateAsync({
        ...data,
        event: Number(route.params.id),
      })
      toast.add({
        title: 'Package created',
        color: 'green',
      })
    }

    closePackageModal()
    refetchPackages()
  } catch (error) {
    toast.add({
      title: editingPackage.value ? 'Failed to update package' : 'Failed to create package',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const togglePackageStatus = async (packageId: number, isActive: boolean) => {
  try {
    await updatePackageMutation.mutateAsync({
      packageId,
      body: { is_active: isActive },
    })
    toast.add({
      title: 'Status updated',
      color: 'green',
    })
    refetchPackages()
  } catch (error) {
    toast.add({
      title: 'Failed to update status',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removePackage = async (packageId: number) => {
  if (!confirm('Remove this booking package?')) return

  try {
    await deletePackageMutation.mutateAsync(packageId)
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

// Alternative Sign-in Modal & CRUD
const showSignInModal = ref(false)
const signInForm = reactive({
  title: '',
  description: '',
  patternType: 'none',
  format_match: '',
  max_uses_per_signin: '',
})

// Pattern options for user-friendly selection
const patternOptions = [
  { label: 'No Pattern (Any Format)', value: 'none' },
  { label: 'Numeric Only (e.g., 12345)', value: 'numeric' },
  { label: 'Alphanumeric (e.g., ABC123)', value: 'alphanumeric' },
  { label: 'Dashed Numbers (e.g., 1234-5678-9012)', value: 'dashed-numeric' },
  { label: 'Email Format', value: 'email' },
  { label: 'Custom Regex', value: 'custom' },
]

const patternExamples: Record<string, { regex: string; example: string; description: string }> = {
  numeric: {
    regex: String.raw`^\d+$`,
    example: '12345',
    description: 'Only numbers allowed'
  },
  alphanumeric: {
    regex: String.raw`^[A-Za-z0-9]+$`,
    example: 'ABC123',
    description: 'Letters and numbers only'
  },
  'dashed-numeric': {
    regex: String.raw`^\d{4}-\d{4}-\d{4}$`,
    example: '1234-5678-9012',
    description: 'Four digits, dash, four digits, dash, four digits'
  },
  email: {
    regex: String.raw`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
    example: 'user@example.com',
    description: 'Valid email address format'
  }
}

const selectedPatternLabel = computed(() => {
  const option = patternOptions.find(o => o.value === signInForm.patternType)
  return option?.label || ''
})

const editingSignIn = ref<any>(null)
const addSignInMutation = useCreateBookingAlternativeSignin()
const updateSignInMutation = usePartialUpdateBookingAlternativeSignin()
const deleteSignInMutation = useDeleteBookingAlternativeSignin()

const signInMutationLoading = computed(() => 
  addSignInMutation.isPending.value || updateSignInMutation.isPending.value
)

// Helper to detect pattern type from regex
const detectPatternType = (formatMatch: string | null): string => {
  if (!formatMatch) return 'none'
  
  for (const [key, pattern] of Object.entries(patternExamples)) {
    if (pattern.regex === formatMatch) {
      return key
    }
  }
  return 'custom'
}

const openSignInModal = (signIn?: any) => {
  if (signIn) {
    editingSignIn.value = signIn
    const detectedType = detectPatternType(signIn.format_match)
    signInForm.title = signIn.title || ''
    signInForm.description = signIn.description || ''
    signInForm.patternType = detectedType
    signInForm.format_match = detectedType === 'custom' ? (signIn.format_match || '') : ''
    signInForm.max_uses_per_signin = signIn.max_uses_per_signin ? String(signIn.max_uses_per_signin) : ''
  } else {
    editingSignIn.value = null
    signInForm.title = ''
    signInForm.description = ''
    signInForm.patternType = 'none'
    signInForm.format_match = ''
    signInForm.max_uses_per_signin = ''
  }
  showSignInModal.value = true
}

const closeSignInModal = () => {
  showSignInModal.value = false
  editingSignIn.value = null
  signInForm.title = ''
  signInForm.description = ''
  signInForm.patternType = 'none'
  signInForm.format_match = ''
  signInForm.max_uses_per_signin = ''
}

const onSubmitSignIn = async (e: Event) => {
  e.preventDefault()

  try {
    // Get the regex pattern based on selection
    let formatMatch = null
    if (signInForm.patternType === 'custom') {
      formatMatch = signInForm.format_match || null
    } else if (signInForm.patternType !== 'none' && patternExamples[signInForm.patternType]) {
      formatMatch = patternExamples[signInForm.patternType].regex
    }

    const data = {
      title: signInForm.title,
      description: signInForm.description || undefined,
      format_match: formatMatch,
      max_uses_per_signin: signInForm.max_uses_per_signin ? Number(signInForm.max_uses_per_signin) : null,
      is_active: true,
    }

    if (editingSignIn.value) {
      // Update existing sign-in method
      await updateSignInMutation.mutateAsync({
        signinId: editingSignIn.value.id,
        body: data,
      })
      toast.add({
        title: 'Sign-in method updated',
        color: 'green',
      })
    } else {
      // Create new sign-in method
      await addSignInMutation.mutateAsync({
        ...data,
        event: Number(event_pk.value),
      })
      toast.add({
        title: 'Sign-in method created',
        color: 'green',
      })
    }

    closeSignInModal()
    refetchSignIns()
  } catch (error) {
    toast.add({
      title: editingSignIn.value ? 'Failed to update sign-in method' : 'Failed to create sign-in method',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removeSignIn = async (signInId: string) => {
  if (!confirm('Remove this sign-in method?')) return

  try {
    await deleteSignInMutation.mutateAsync(signInId)
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

// Helper functions
const formatDate = (date: string | null) => {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const formatAmount = (amount: string | number) => {
  return Number(amount).toFixed(2)
}

const getTicketTypeName = (ticketTypeId: number) => {
  const ticketType = ticketTypes.value.find((t: any) => t.id === ticketTypeId)
  return ticketType?.title || 'Unknown'
}

const getPatternLabel = (formatMatch: string | null): string => {
  if (!formatMatch) return 'None'
  
  const patternType = detectPatternType(formatMatch)
  if (patternType === 'custom') return 'Custom Regex'
  
  const pattern = patternExamples[patternType]
  return pattern ? pattern.example : 'Custom'
}
</script>