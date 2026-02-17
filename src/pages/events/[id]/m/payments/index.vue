<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Content (8/12) -->
      <div class="lg:col-span-8 space-y-8">

        <!-- Payment Settings -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">credit_card</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Payment Settings</h2>
              <p class="text-xs text-navy-400 mt-0.5">Configure payment options and features for this event</p>
            </div>
          </div>

          <div v-if="settingsLoading" class="space-y-4">
            <div v-for="i in 4" :key="i" class="h-14 bg-mist-blue/60 rounded-xl animate-pulse" />
          </div>

          <form v-else @submit="onSaveSettings" class="space-y-4">
            <!-- Payment Features -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="flex items-start gap-3 p-4 bg-mist-blue/40 rounded-xl hover:bg-mist-blue/60 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settingsForm.payment_enabled"
                  class="mt-0.5 h-4 w-4 rounded border-navy-200 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <div>
                  <p class="text-sm font-semibold text-navy-900">Enable Payments</p>
                  <p class="text-xs text-navy-400">Allow attendees to make payments for this event</p>
                </div>
              </label>

              <label class="flex items-start gap-3 p-4 bg-mist-blue/40 rounded-xl hover:bg-mist-blue/60 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settingsForm.product_selling_enabled"
                  class="mt-0.5 h-4 w-4 rounded border-navy-200 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <div>
                  <p class="text-sm font-semibold text-navy-900">Enable Product Selling</p>
                  <p class="text-xs text-navy-400">Allow selling of products (merchandise, materials, etc.)</p>
                </div>
              </label>

              <label class="flex items-start gap-3 p-4 bg-mist-blue/40 rounded-xl hover:bg-mist-blue/60 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settingsForm.donation_enabled"
                  class="mt-0.5 h-4 w-4 rounded border-navy-200 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <div>
                  <p class="text-sm font-semibold text-navy-900">Enable Donations</p>
                  <p class="text-xs text-navy-400">Accept donations for this event</p>
                </div>
              </label>

              <label class="flex items-start gap-3 p-4 bg-mist-blue/40 rounded-xl hover:bg-mist-blue/60 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settingsForm.accepting_sponsorships_enabled"
                  class="mt-0.5 h-4 w-4 rounded border-navy-200 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <div>
                  <p class="text-sm font-semibold text-navy-900">Accept Sponsorships</p>
                  <p class="text-xs text-navy-400">Accept sponsorships from organizations or individuals</p>
                </div>
              </label>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="resetSettings"
                class="px-4 py-2 text-sm font-semibold text-navy-600 hover:text-navy-900 hover:bg-mist-blue rounded-xl transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                class="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                :disabled="updateSettingsMutation.isPending.value"
              >
                <span v-if="updateSettingsMutation.isPending.value" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                Save Changes
              </button>
            </div>
          </form>
        </section>

        <!-- Payment Methods -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">account_balance</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Payment Methods</h2>
              <p class="text-xs text-navy-400 mt-0.5">Configure how attendees can pay for this event</p>
            </div>
            <button
              @click="openPaymentMethodModal()"
              :disabled="!settingsForm.payment_enabled"
              class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              Add Method
            </button>
          </div>

          <div v-if="paymentMethodsLoading" class="space-y-3">
            <div v-for="i in 2" :key="i" class="h-16 bg-mist-blue/60 rounded-xl animate-pulse" />
          </div>

          <div v-else-if="paymentMethods.length" class="space-y-3">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-sm font-semibold text-navy-900">{{ method.title }}</h3>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {{ getMethodTypeLabel(method.method_type) }}
                    </span>
                  </div>
                  <p v-if="(method as any).description" class="text-xs text-navy-500 mb-2">
                    {{ (method as any).description }}
                  </p>
                  <div v-if="method.method_type === 'BANK_TRANSFER' && (method as any).provided_details" class="text-xs text-navy-400 space-y-0.5">
                    <div>Account: {{ (method as any).provided_details.account_name }}</div>
                    <div>Sort Code: {{ (method as any).provided_details.sort_code }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
                  <!-- Toggle -->
                  <button
                    type="button"
                    @click="toggleMethodStatus(method.method_id, !method.is_active)"
                    class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="method.is_active ? 'bg-primary' : 'bg-navy-200'"
                  >
                    <span
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      :class="method.is_active ? 'translate-x-4' : 'translate-x-0'"
                    />
                  </button>
                  <button
                    @click="openPaymentMethodModal(method)"
                    class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
                    title="Edit"
                  >
                    <span class="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    @click="removePaymentMethod(method.method_id)"
                    class="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-10 text-navy-500">
            <span class="material-symbols-outlined text-4xl text-navy-200 mb-3 block">account_balance</span>
            <p v-if="!settingsForm.payment_enabled" class="text-sm">Enable payments to configure payment methods</p>
            <p v-else class="text-sm">No payment methods configured</p>
            <p class="text-xs mt-1 text-navy-400">Add methods like Stripe, bank transfer, or cash</p>
          </div>
        </section>

        <!-- Discount Codes -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-8">
          <div class="flex items-center gap-2 mb-6 pb-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">percent</span>
            <div class="flex-1">
              <h2 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Discount Codes</h2>
              <p class="text-xs text-navy-400 mt-0.5">Create promotional codes for discounted registration</p>
            </div>
            <button
              @click="showDiscountModal = true"
              :disabled="!settingsForm.payment_enabled"
              class="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              Add Discount
            </button>
          </div>

          <div class="text-center py-10 text-navy-500">
            <span class="material-symbols-outlined text-4xl text-navy-200 mb-3 block">local_offer</span>
            <p v-if="!settingsForm.payment_enabled" class="text-sm">Enable payments to create discount codes</p>
            <p v-else class="text-sm">No discount codes configured</p>
            <p class="text-xs mt-1 text-navy-400">Feature coming soon</p>
          </div>
        </section>
      </div>

      <!-- Sidebar (4/12) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Payment Status -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="bg-primary px-6 py-4">
            <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-base">fact_check</span>
              Payment Status
            </h3>
          </div>
          <div class="p-6 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600">Payments</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="settingsForm.payment_enabled ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-500'"
              >
                {{ settingsForm.payment_enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600">Products</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="settingsForm.product_selling_enabled ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-500'"
              >
                {{ settingsForm.product_selling_enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600">Donations</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="settingsForm.donation_enabled ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-500'"
              >
                {{ settingsForm.donation_enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-navy-600">Sponsorships</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="settingsForm.accepting_sponsorships_enabled ? 'bg-green-100 text-green-700' : 'bg-navy-100 text-navy-500'"
              >
                {{ settingsForm.accepting_sponsorships_enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Payment Methods Stats -->
        <section v-if="settingsForm.payment_enabled" class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">bar_chart</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Method Stats</h3>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-3xl font-black text-navy-900">{{ paymentMethods.length || 0 }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Total</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-black text-primary">{{ activePaymentMethodsCount }}</div>
              <div class="text-xs text-navy-400 mt-1 uppercase tracking-wide font-semibold">Active</div>
            </div>
          </div>
        </section>

        <!-- Help Card -->
        <section class="bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Setup Tips</h3>
          </div>
          <div class="p-6 text-sm space-y-3 text-navy-600">
            <p>
              <strong class="text-navy-800">Payment Methods</strong> determine how attendees can pay for your event. Configure Stripe for online payments, bank transfers for manual verification, or cash for on-site payments.
            </p>
            <p>
              <strong class="text-navy-800">Discount Codes</strong> can be used to offer promotional pricing to specific attendees.
            </p>
            <p>
              Enable <strong class="text-navy-800">Product Selling</strong> to sell merchandise or materials alongside registration.
            </p>
          </div>
        </section>
      </div>
    </div>

    <!-- Add/Edit Payment Method Modal -->
    <Teleport to="body">
      <div v-if="showPaymentMethodModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closePaymentMethodModal" />
        <div class="relative w-full max-w-lg bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="flex items-center gap-2 px-6 py-5 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">credit_card</span>
            <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest flex-1">
              {{ editingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method' }}
            </h3>
            <button
              @click="closePaymentMethodModal"
              class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <div class="p-6">
            <PaymentMethodForm
              :model-value="editingPaymentMethod"
              :event-id="Number(id)"
              :is-loading="paymentMethodMutationLoading"
              @submit="handlePaymentMethodSubmit"
              @cancel="closePaymentMethodModal"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Discount Modal -->
    <Teleport to="body">
      <div v-if="showDiscountModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDiscountModal = false" />
        <div class="relative w-full max-w-md bg-white dark:bg-navy-900 border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="flex items-center gap-2 px-6 py-5 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">local_offer</span>
            <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest flex-1">
              Add Discount Code
            </h3>
            <button
              @click="showDiscountModal = false"
              class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <div class="p-6">
            <div class="text-center py-8 text-navy-500">
              <span class="material-symbols-outlined text-4xl text-navy-200 mb-3 block">local_offer</span>
              <p class="text-sm">Discount code management coming soon</p>
            </div>
            <div class="flex justify-end pt-2">
              <button
                @click="showDiscountModal = false"
                class="px-4 py-2 text-sm font-semibold text-navy-600 hover:text-navy-900 hover:bg-mist-blue rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </EventManagementLayout>
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
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
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

const toggleMethodStatus = async (methodId: string, isActive: boolean) => {
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

const removePaymentMethod = async (methodId: string) => {
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
