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

        <!-- Payment Methods -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Payment Methods</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Configure how attendees can pay for this event
                </p>
              </div>
              <UButton
                icon="i-heroicons-plus"
                label="Add Payment Method"
                @click="openPaymentMethodModal()"
                :disabled="!settingsForm.payment_enabled"
              />
            </div>
          </template>

          <div v-if="paymentMethodsLoading" class="space-y-3">
            <USkeleton v-for="i in 2" :key="i" class="h-16" />
          </div>

          <div v-else-if="paymentMethods.length" class="space-y-3">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-gray-900">{{ method.title }}</h3>
                    <UBadge
                      :label="getMethodTypeLabel(method.method_type)"
                      color="blue"
                      variant="subtle"
                      size="xs"
                    />
                  </div>
                  <p v-if="(method as any).description" class="text-sm text-gray-600 mb-2">
                    {{ (method as any).description }}
                  </p>
                  <div v-if="method.method_type === 'BANK_TRANSFER' && (method as any).provided_details" class="text-xs text-gray-500 space-y-1">
                    <div>Account: {{ (method as any).provided_details.account_name }}</div>
                    <div>Sort Code: {{ (method as any).provided_details.sort_code }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <UToggle
                    :model-value="method.is_active"
                    @update:model-value="toggleMethodStatus(method.id, $event)"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    @click="openPaymentMethodModal(method)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    variant="ghost"
                    size="sm"
                    @click="removePaymentMethod(method.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-600">
            <p v-if="!settingsForm.payment_enabled">
              Enable payments to configure payment methods
            </p>
            <p v-else>No payment methods configured</p>
            <p class="text-xs mt-2">Add methods like Stripe, bank transfer, or cash</p>
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

        <!-- Payment Methods Stats -->
        <UCard v-if="settingsForm.payment_enabled">
          <template #header>
            <h3 class="font-semibold">Payment Methods</h3>
          </template>
          <div class="space-y-4">
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ paymentMethods.length || 0 }}</div>
              <div class="text-sm text-gray-600">Total Methods</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ activePaymentMethodsCount }}</div>
              <div class="text-sm text-gray-600">Active Methods</div>
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
              <strong>Payment Methods</strong> determine how attendees can pay for your event. Configure Stripe for online payments, bank transfers for manual verification, or cash for on-site payments.
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

    <!-- Add/Edit Payment Method Modal -->
    <UModal v-model="showPaymentMethodModal" size="lg">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method' }}
          </h3>
        </template>

        <PaymentMethodForm
          :model-value="editingPaymentMethod"
          :event-id="Number(id)"
          :is-loading="paymentMethodMutationLoading"
          @submit="handlePaymentMethodSubmit"
          @cancel="closePaymentMethodModal"
        />
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
import { 
  usePaymentMethods, 
  useCreatePaymentMethod, 
  usePartialUpdatePaymentMethod,
  useDeletePaymentMethod 
} from '~/composables/resources/payments/paymentMethods'
import { paymentMethodTypeLabels } from '~/schemas/events/paymentConfig'
import EventsManagementLayout from '~/components/events/EventManagementLayout.vue'
import PaymentMethodForm from '~/components/events/forms/PaymentMethodForm.vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const toast = useToast()

// Fetch event data
const { data: event } = useEvent(id)

// Fetch settings and payment methods
const { data: settingsData, isLoading: settingsLoading } = useEventSettings(id)
const eventIdFilter = computed(() => ({ event__event_id: route.params.id as string }))
const { data: paymentMethodsData, isLoading: paymentMethodsLoading, refetch: refetchPaymentMethods } = usePaymentMethods(eventIdFilter)

const paymentMethods = computed(() => paymentMethodsData.value?.data?.results || [])
const settings = computed(() => settingsData.value?.data)
const activePaymentMethodsCount = computed(() => paymentMethods.value.filter((m: any) => m.is_active).length)

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

// Payment Method Modal & CRUD
const showPaymentMethodModal = ref(false)
const editingPaymentMethod = ref<any>(null)

const createPaymentMethodMutation = useCreatePaymentMethod()
const updatePaymentMethodMutation = usePartialUpdatePaymentMethod()
const deletePaymentMethodMutation = useDeletePaymentMethod()

const paymentMethodMutationLoading = computed(() => 
  createPaymentMethodMutation.isPending.value || updatePaymentMethodMutation.isPending.value
)

const openPaymentMethodModal = (method?: any) => {
  editingPaymentMethod.value = method || null
  showPaymentMethodModal.value = true
}

const closePaymentMethodModal = () => {
  showPaymentMethodModal.value = false
  editingPaymentMethod.value = null
}

const handlePaymentMethodSubmit = async (data: any) => {
  try {
    if (editingPaymentMethod.value) {
      // Update existing payment method
      await updatePaymentMethodMutation.mutateAsync({
        methodId: editingPaymentMethod.value.id,
        body: data,
      })
      toast.add({
        title: 'Payment method updated',
        color: 'green',
      })
    } else {
      // Create new payment method
      await createPaymentMethodMutation.mutateAsync(data)
      toast.add({
        title: 'Payment method created',
        color: 'green',
      })
    }
    
    closePaymentMethodModal()
    refetchPaymentMethods()
  } catch (error) {
    toast.add({
      title: editingPaymentMethod.value ? 'Failed to update payment method' : 'Failed to create payment method',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const toggleMethodStatus = async (methodId: number, isActive: boolean) => {
  try {
    await updatePaymentMethodMutation.mutateAsync({
      methodId,
      body: { is_active: isActive },
    })
    toast.add({
      title: isActive ? 'Payment method activated' : 'Payment method deactivated',
      color: 'green',
    })
    refetchPaymentMethods()
  } catch (error) {
    toast.add({
      title: 'Failed to update payment method',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const removePaymentMethod = async (methodId: number) => {
  if (!confirm('Remove this payment method?')) return

  try {
    await deletePaymentMethodMutation.mutateAsync(methodId)
    toast.add({
      title: 'Payment method removed',
      color: 'green',
    })
    refetchPaymentMethods()
  } catch (error) {
    toast.add({
      title: 'Failed to remove payment method',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const getMethodTypeLabel = (methodType: string) => {
  return paymentMethodTypeLabels[methodType as keyof typeof paymentMethodTypeLabels] || methodType
}

// Discount modal
const showDiscountModal = ref(false)
</script>
