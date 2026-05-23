<template>
  <div
    v-if="visible"
    @click.self="emit('close')"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-navy-50 flex-shrink-0">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary text-xl">schedule</span>
          <div>
            <h3 class="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Availability Windows</h3>
            <p class="text-xs text-navy-600 mt-0.5">{{ packageName }}</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-1.5 text-navy-600 hover:text-primary transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <!-- Add Window Button -->
        <div v-if="!editingAvailabilityWindow" class="mb-4">
          <button
            @click="openWindowForm()"
            class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Add Window</span>
          </button>
        </div>

        <!-- Window Form -->
        <div
          v-if="editingAvailabilityWindow !== null"
          class="mb-6 p-5 border-2 border-primary/30 rounded-xl bg-primary/5"
        >
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-bold text-navy-900 uppercase tracking-wide">
              {{ editingAvailabilityWindow.window_id ? 'Edit Window' : 'New Window' }}
            </h4>
            <button @click="closeWindowForm" class="text-navy-600 hover:text-red-600 transition-colors">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Window Name -->
            <div>
              <label class="block text-sm font-semibold text-navy-700 mb-2">Window Name *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g., Early Bird Sales"
                required
                class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-semibold text-navy-700 mb-2">Description</label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Optional description..."
                class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              ></textarea>
            </div>

            <!-- Window Type -->
            <div>
              <label class="block text-sm font-semibold text-navy-700 mb-2">Window Type *</label>
              <div class="grid grid-cols-2 gap-3">
                <label
                  v-for="option in BOOKING_AVAILABILITY_TYPE_OPTIONS"
                  :key="option.value"
                  class="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="form.availability_type === option.value ? 'border-primary bg-primary/10' : 'border-navy-200 hover:border-navy-300'"
                >
                  <input
                    v-model="form.availability_type"
                    type="radio"
                    :value="option.value"
                    class="text-primary focus:ring-primary mt-1"
                  />
                  <div class="flex-1">
                    <div class="font-semibold text-navy-900 text-sm">{{ option.label }}</div>
                    <div class="text-xs text-navy-500 mt-0.5">{{ option.description }}</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Date Range -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-navy-700 mb-2">Available From *</label>
                  <input
                    v-model="form.available_from"
                    type="datetime-local"
                    required
                    class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-navy-700 mb-2">Available To *</label>
                  <input
                    v-model="form.available_to"
                    type="datetime-local"
                    required
                    class="w-full rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <!-- Quick Date Presets -->
              <div class="border border-gray-200 rounded-lg p-4 space-y-3">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-symbols-outlined text-sm text-navy-500">bolt</span>
                  <label class="text-sm font-semibold text-navy-700">Quick Date Presets</label>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button type="button" @click="setDates('today', 7)" class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors">1 week from today</button>
                  <button type="button" @click="setDates('today', 14)" class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors">2 weeks from today</button>
                  <button type="button" @click="setDates('today', 30)" class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors">1 month from today</button>
                  <button type="button" @click="setDates('event', -7)" class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors">1 week before event</button>
                  <button type="button" @click="setDates('event', -14)" class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors">2 weeks before event</button>
                  <button type="button" @click="setDates('event', -30)" class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors">1 month before event</button>
                  <button type="button" @click="setDates('during-event')" class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors">During event</button>
                  <button type="button" @click="setDates('full-period')" class="px-3 py-2 text-xs font-medium text-navy-700 bg-white border border-navy-300 rounded-lg hover:bg-navy-50 hover:border-primary transition-colors">Now until event</button>
                </div>
                <p class="text-xs text-navy-500 mt-2">Click to quickly set common date ranges</p>
              </div>
            </div>

            <!-- Timezone -->
            <div>
              <label class="block text-sm font-semibold text-navy-700 mb-2">Timezone</label>
              <TimezoneSelect
                :model-value="form.timezone || 'UTC'"
                @update:model-value="form.timezone = $event"
              />
              <p class="text-xs text-navy-500 mt-1">Defaults to event timezone: {{ eventTimezone || 'UTC' }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 pt-4 border-t border-navy-200">
              <button
                type="button"
                @click="closeWindowForm"
                class="flex-1 px-4 py-2 border border-navy-300 text-navy-700 rounded-lg hover:bg-navy-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="addWindowMutation.isPending.value || updateWindowMutation.isPending.value"
                class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ editingAvailabilityWindow.window_id ? 'Update' : 'Create' }} Window
              </button>
            </div>
          </form>
        </div>

        <!-- Windows Loading State -->
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-32 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>

        <!-- Windows List -->
        <div v-else-if="windows.length > 0" class="space-y-3">
          <div
            v-for="window in windows"
            :key="window.availability_id"
            class="p-5 border-2 rounded-lg transition-all"
            :class="getWindowStatusClass(window)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h4 class="font-bold text-navy-900 text-base">{{ window.name }}</h4>
                  <span class="px-2 py-1 rounded text-[10px] font-bold" :class="getWindowStatusBadgeColor(window)">
                    {{ getWindowStatus(window) }}
                  </span>
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                    {{ window.availability_type === 'PRODUCT_WINDOW' ? 'Purchase' : 'Preview' }}
                  </span>
                </div>
                <p v-if="window.description" class="text-sm text-navy-600 mb-3">{{ window.description }}</p>
                <div class="flex items-center gap-4 text-xs text-navy-500">
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">calendar_today</span>
                    <span>{{ formatDateTime(window.available_from) }}</span>
                  </div>
                  <span>→</span>
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">calendar_today</span>
                    <span>{{ formatDateTime(window.available_to) }}</span>
                  </div>
                </div>
                <div v-if="window.timezone" class="flex items-center gap-1 text-xs text-navy-400 mt-1">
                  <span class="material-symbols-outlined text-sm">public</span>
                  <span>{{ window.timezone }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="openWindowForm(window)"
                  class="p-1.5 text-navy-600 hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  @click="deleteWindow(window.availability_id)"
                  :disabled="deletingWindowId === window.availability_id"
                  class="p-1.5 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!editingAvailabilityWindow" class="text-center py-16">
          <span class="material-symbols-outlined text-6xl text-navy-300 mb-4">schedule</span>
          <h4 class="text-base font-semibold text-navy-900 mb-2">No availability windows yet</h4>
          <p class="text-sm text-navy-500 mb-5">Add availability windows to control when this package can be purchased</p>
          <button
            @click="openWindowForm()"
            class="bg-primary text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-tight"
          >
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Create First Window</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AvailabilityWindow } from '~/api/types.gen'
import TimezoneSelect from '~/components/ui/TimezoneSelect.vue'
import {
  useBookingPackageAvailabilityWindows,
  useAddBookingPackageAvailabilityWindow,
  useUpdateBookingPackageAvailabilityWindow,
  useRemoveBookingPackageAvailabilityWindow,
} from '~/composables/resources/booking/bookingPackageAvailabilityWindows'

type AvailabilityWindowFormData = {
  window_id?: string
  name: string
  description?: string
  availability_type: 'PAYMENT_PACKAGE_WINDOW' | 'PAYMENT_PACKAGE_PREVIEW_WINDOW'
  available_from: string
  available_to: string
  timezone: string
}

const BOOKING_AVAILABILITY_TYPE_OPTIONS = [
  { value: 'PAYMENT_PACKAGE_WINDOW', label: 'Purchase Window', description: 'Package can be purchased during this time' },
  { value: 'PAYMENT_PACKAGE_PREVIEW_WINDOW', label: 'Preview Window', description: 'Package is visible but cannot be purchased' },
] as const

const props = defineProps<{
  visible: boolean
  packageId: number | null
  packageName: string
  eventTimezone?: string
  eventStartDatetime?: string
  eventEndDatetime?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Data fetching
const { data: windowsData, isLoading, refetch } = useBookingPackageAvailabilityWindows(
  computed(() => props.packageId || undefined),
)

const windows = computed(() => {
  if (!windowsData.value?.data) return []
  return windowsData.value.data.results || []
})

// Mutations
const addWindowMutation = useAddBookingPackageAvailabilityWindow()
const updateWindowMutation = useUpdateBookingPackageAvailabilityWindow()
const removeWindowMutation = useRemoveBookingPackageAvailabilityWindow()

// Form state
const editingAvailabilityWindow = ref<AvailabilityWindowFormData | null>(null)
const deletingWindowId = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  availability_type: 'PAYMENT_PACKAGE_WINDOW' as 'PAYMENT_PACKAGE_WINDOW' | 'PAYMENT_PACKAGE_PREVIEW_WINDOW',
  available_from: '',
  available_to: '',
  timezone: '',
})

// ── Form helpers ─────────────────────────────────────────────────────────────

function formatDateTimeForInput(dateString: string | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function openWindowForm(window?: AvailabilityWindow) {
  if (window) {
    const type = (window.availability_type === 'PAYMENT_PACKAGE_WINDOW' || window.availability_type === 'PAYMENT_PACKAGE_PREVIEW_WINDOW')
      ? window.availability_type
      : 'PAYMENT_PACKAGE_WINDOW'

    editingAvailabilityWindow.value = {
      window_id: window.availability_id,
      name: window.name,
      description: window.description || '',
      availability_type: type,
      available_from: window.available_from ? formatDateTimeForInput(window.available_from) : '',
      available_to: window.available_to ? formatDateTimeForInput(window.available_to) : '',
      timezone: window.timezone || props.eventTimezone || 'UTC',
    }
    form.name = window.name
    form.description = window.description || ''
    form.availability_type = type
    form.available_from = window.available_from ? formatDateTimeForInput(window.available_from) : ''
    form.available_to = window.available_to ? formatDateTimeForInput(window.available_to) : ''
    form.timezone = window.timezone || props.eventTimezone || 'UTC'

    if (props.packageId) {
      router.replace({ query: { ...route.query, 'package-id': props.packageId.toString(), 'window-id': window.availability_id } })
    }
  } else {
    editingAvailabilityWindow.value = {
      name: '',
      description: '',
      availability_type: 'PAYMENT_PACKAGE_WINDOW',
      available_from: '',
      available_to: '',
      timezone: props.eventTimezone || 'UTC',
    }
    form.name = ''
    form.description = ''
    form.availability_type = 'PAYMENT_PACKAGE_WINDOW'
    form.available_from = ''
    form.available_to = ''
    form.timezone = props.eventTimezone || 'UTC'
  }
}

function closeWindowForm() {
  editingAvailabilityWindow.value = null
  if (route.query['window-id'] && props.packageId) {
    router.replace({ query: { ...route.query, 'window-id': undefined, 'package-id': props.packageId.toString() } })
  }
}

function setDates(preset: 'today' | 'event' | 'during-event' | 'full-period', offsetDays?: number) {
  const now = new Date()
  const startDate = new Date()
  const endDate = new Date()

  if (preset === 'today' && offsetDays) {
    startDate.setDate(now.getDate())
    startDate.setHours(0, 0, 0, 0)
    endDate.setDate(now.getDate() + offsetDays)
    endDate.setHours(23, 59, 59, 999)
  } else if (preset === 'event' && offsetDays && props.eventStartDatetime) {
    const eventStart = new Date(props.eventStartDatetime)
    startDate.setTime(now.getTime())
    startDate.setHours(0, 0, 0, 0)
    endDate.setTime(eventStart.getTime())
    endDate.setDate(endDate.getDate() + offsetDays)
    endDate.setHours(23, 59, 59, 999)
  } else if (preset === 'during-event' && props.eventStartDatetime && props.eventEndDatetime) {
    startDate.setTime(new Date(props.eventStartDatetime).getTime())
    endDate.setTime(new Date(props.eventEndDatetime).getTime())
  } else if (preset === 'full-period' && props.eventStartDatetime) {
    startDate.setTime(now.getTime())
    startDate.setHours(0, 0, 0, 0)
    endDate.setTime(new Date(props.eventStartDatetime).getTime())
  }

  const pad = (n: number) => n.toString().padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

  form.available_from = fmt(startDate)
  form.available_to = fmt(endDate)
}

async function submitForm() {
  if (!form.name) {
    toast.add({ title: 'Validation Error', description: 'Please enter a window name', color: 'red' })
    return
  }
  if (!form.available_from || !form.available_to) {
    toast.add({ title: 'Validation Error', description: 'Please specify both start and end dates', color: 'red' })
    return
  }
  if (new Date(form.available_to) <= new Date(form.available_from)) {
    toast.add({ title: 'Validation Error', description: 'End date must be after start date', color: 'red' })
    return
  }
  if (!props.packageId) return

  const payload = {
    name: form.name,
    description: form.description || null,
    availability_type: form.availability_type,
    available_from: form.available_from,
    available_to: form.available_to,
    timezone: form.timezone || 'UTC',
  }

  try {
    if (editingAvailabilityWindow.value?.window_id) {
      await updateWindowMutation.mutateAsync({
        packageId: props.packageId,
        windowId: editingAvailabilityWindow.value.window_id,
        body: payload,
      })
      toast.add({ title: 'Success', description: 'Availability window updated successfully', color: 'green' })
    } else {
      await addWindowMutation.mutateAsync({ packageId: props.packageId, body: payload })
      toast.add({ title: 'Success', description: 'Availability window created successfully', color: 'green' })
    }
    refetch()
    closeWindowForm()
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.message || 'Failed to save availability window', color: 'red' })
  }
}

async function deleteWindow(windowId: string) {
  if (!confirm('Are you sure you want to delete this availability window?')) return
  if (!props.packageId) return

  deletingWindowId.value = windowId
  try {
    await removeWindowMutation.mutateAsync({ packageId: props.packageId, windowId })
    toast.add({ title: 'Success', description: 'Availability window deleted successfully', color: 'green' })
    refetch()
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.message || 'Failed to delete availability window', color: 'red' })
  } finally {
    deletingWindowId.value = null
  }
}

// ── Status display helpers ───────────────────────────────────────────────────

function getWindowStatus(window: AvailabilityWindow): string {
  const now = new Date()
  const from = new Date(window.available_from || '')
  const to = new Date(window.available_to || '')
  if (now < from) return 'Upcoming'
  if (now > to) return 'Expired'
  return 'Active'
}

function getWindowStatusBadgeColor(window: AvailabilityWindow): string {
  const status = getWindowStatus(window)
  if (status === 'Active') return 'text-green-700 bg-green-100'
  if (status === 'Upcoming') return 'text-blue-700 bg-blue-100'
  return 'text-gray-700 bg-gray-100'
}

function getWindowStatusClass(window: AvailabilityWindow): string {
  const status = getWindowStatus(window)
  if (status === 'Active') return 'border-green-300 bg-green-50'
  if (status === 'Upcoming') return 'border-blue-300 bg-blue-50'
  return 'border-gray-300 bg-gray-50'
}

function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

// ── URL param watcher ────────────────────────────────────────────────────────

watch(
  () => ({
    windowId: route.query['window-id'],
    windowsLoaded: windows.value.length > 0,
    visible: props.visible,
  }),
  ({ windowId, windowsLoaded, visible }) => {
    if (!visible || !windowId || !windowsLoaded) return
    const win = windows.value.find((w: AvailabilityWindow) => w.availability_id === windowId)
    if (win) {
      nextTick(() => openWindowForm(win))
    }
  },
  { immediate: true },
)

// Reset form when modal closes
watch(
  () => props.visible,
  (visible) => {
    if (!visible) editingAvailabilityWindow.value = null
  },
)
</script>
