<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')" />
      <div class="relative w-full max-w-2xl bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-5 border-b border-navy-50">
          <span class="material-symbols-outlined text-primary">payments</span>
          <div class="flex-1">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Create Payment</h3>
            <p class="text-xs text-gray-500 mt-0.5">Create an admin payment and optionally link it to a target object</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-mist-blue rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (GBP)
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.base_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <select
                  v-model="form.method"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option :value="null">No method</option>
                  <option
                    v-for="method in paymentMethods"
                    :key="method.id"
                    :value="method.id"
                  >
                    {{ method.title }} ({{ method.method_type }})
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                User
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  v-model="userSearchQuery"
                  type="text"
                  placeholder="Search users by email, username, first name..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              <div
                v-if="showUserResults"
                class="mt-2 max-h-44 overflow-y-auto border border-gray-300 rounded-lg"
              >
                <button
                  v-for="user in userResults"
                  :key="user.id"
                  type="button"
                  @click="selectUser(user)"
                  class="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div class="text-sm font-semibold text-gray-900">{{ user.display_name || user.username || user.email }}</div>
                  <div class="text-xs text-gray-500">{{ user.email }}</div>
                </button>
              </div>

              <div v-if="selectedUser" class="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start justify-between">
                <div>
                  <div class="text-sm font-semibold text-blue-900">{{ selectedUser.display_name || selectedUser.username || selectedUser.email }}</div>
                  <div class="text-xs text-blue-700">{{ selectedUser.email }}</div>
                </div>
                <button
                  type="button"
                  @click="clearUserSelection"
                  class="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                >
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Target Type</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="choice in targetChoices"
                  :key="choice.value"
                  type="button"
                  @click="setTarget(choice.value)"
                  :class="[
                    'px-3 py-2 text-sm rounded-lg border transition-colors text-left',
                    form.target === choice.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  {{ choice.label }}
                </button>
              </div>
            </div>

            <div v-if="form.target !== 'none'" class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">Target Object</label>
              <button
                type="button"
                @click="showTargetPicker = true"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span>{{ selectedTarget ? selectedTarget.label : `Select ${form.target}` }}</span>
                <span class="material-symbols-outlined">search</span>
              </button>

              <div v-if="selectedTarget" class="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-amber-900">{{ selectedTarget.label }}</div>
                  <div class="text-xs text-amber-700">{{ selectedTarget.subtitle }}</div>
                  <div class="text-[11px] text-amber-700 mt-1">Identifier: {{ selectedTarget.targetId }}</div>
                </div>
                <button
                  type="button"
                  @click="clearTargetSelection"
                  class="px-2 py-1 text-xs bg-white border border-amber-300 rounded hover:bg-amber-100"
                >
                  Clear
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Optional payment description"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!isFormValid || isSubmitting"
                class="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                <span v-else>Create Payment</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <PaymentTargetPickerModal
        v-if="showTargetPicker && form.target !== 'none'"
        :open="showTargetPicker"
        :event-id="eventId"
        :target-type="form.target"
        @close="showTargetPicker = false"
        @select="handleTargetSelected"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCreatePayment } from '~/composables/resources/payments/payments'
import { usePaymentMethods } from '~/composables/resources/payments/paymentMethods'
import { useUsers } from '~/composables/resources/user/users'
import PaymentTargetPickerModal from './PaymentTargetPickerModal.vue'

type TargetType = 'booking' | 'order' | 'ticket' | 'none'

interface Props {
  open: boolean
  eventId: string
  eventPk: number | null
}

interface SelectedTarget {
  target: 'booking' | 'order' | 'ticket'
  targetId: string
  label: string
  subtitle: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const toast = useToast()

const form = reactive({
  base_amount: null as number | null,
  method: null as number | null,
  target: 'none' as TargetType,
  description: '',
})

const isSubmitting = ref(false)
const showTargetPicker = ref(false)
const selectedTarget = ref<SelectedTarget | null>(null)

const userSearchQuery = ref('')
const selectedUser = ref<any | null>(null)

const targetChoices: Array<{ value: TargetType; label: string }> = [
  { value: 'none', label: 'No target' },
  { value: 'booking', label: 'Booking' },
  { value: 'order', label: 'Order' },
  { value: 'ticket', label: 'Ticket' },
]

const paymentMethodParams = computed(() => ({
  event__event_id: props.eventId,
  is_active: true,
  page_size: 100,
}))

const { data: paymentMethodsData } = usePaymentMethods(paymentMethodParams)

const paymentMethods = computed(() => paymentMethodsData.value?.data?.results || [])

const usersParams = computed(() => ({
  search: userSearchQuery.value || undefined,
  page_size: 10,
}))

const { data: usersData } = useUsers(usersParams)

const userResults = computed(() => usersData.value?.data?.results || [])
const showUserResults = computed(() => userSearchQuery.value.length >= 2 && !selectedUser.value)

const createPaymentMutation = useCreatePayment()

const isFormValid = computed(() => {
  if (!props.eventPk || !selectedUser.value || !form.base_amount || form.base_amount <= 0) {
    return false
  }

  if (form.target !== 'none' && !selectedTarget.value) {
    return false
  }

  return true
})

function selectUser(user: any) {
  selectedUser.value = user
  userSearchQuery.value = user.email || user.username || user.display_name || ''
}

function clearUserSelection() {
  selectedUser.value = null
  userSearchQuery.value = ''
}

function setTarget(target: TargetType) {
  form.target = target
  selectedTarget.value = null
}

function clearTargetSelection() {
  selectedTarget.value = null
}

function handleTargetSelected(payload: SelectedTarget) {
  selectedTarget.value = payload
  showTargetPicker.value = false
}

async function handleSubmit() {
  if (!isFormValid.value || !props.eventPk || !selectedUser.value || !form.base_amount) {
    toast.add({
      title: 'Invalid form',
      description: 'Please complete required fields before creating the payment.',
      color: 'red',
    })
    return
  }

  isSubmitting.value = true

  try {
    await createPaymentMutation.mutateAsync({
      user: Number(selectedUser.value.id),
      event: Number(props.eventPk),
      method: form.method,
      base_amount: form.base_amount.toFixed(2),
      description: form.description || null,
      target: form.target,
      target_id: form.target === 'none' ? null : selectedTarget.value?.targetId || null,
    })

    emit('created')
  } catch (error: any) {
    toast.add({
      title: 'Failed to create payment',
      description: error?.message || 'An unexpected error occurred.',
      color: 'red',
    })
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.base_amount = null
      form.method = null
      form.target = 'none'
      form.description = ''
      selectedUser.value = null
      userSearchQuery.value = ''
      selectedTarget.value = null
      showTargetPicker.value = false
    }
  },
)
</script>
