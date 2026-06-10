<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Header -->
          <div class="flex items-center gap-3 px-6 py-4 border-b border-navy-50">
            <span class="material-symbols-outlined text-primary">{{ isEdit ? 'edit' : 'add_circle' }}</span>
            <h2 class="text-sm font-black text-primary uppercase tracking-widest flex-1">
              {{ isEdit ? 'Edit Workshop' : 'Create Workshop' }}
            </h2>
            <button @click="close" class="text-navy-400 hover:text-navy-700 transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            <!-- Title -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Title *</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Workshop title"
                class="field"
                :class="{ 'border-red-400': errors.title }"
              />
              <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errors.title }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Description *</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Describe the workshop…"
                class="field resize-none"
                :class="{ 'border-red-400': errors.description }"
              />
              <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Date & Time *</label>
              <input
                v-model="form.date"
                type="datetime-local"
                class="field"
                :class="{ 'border-red-400': errors.date }"
              />
              <p v-if="errors.date" class="text-xs text-red-500 mt-1">{{ errors.date }}</p>
            </div>

            <!-- Capacity + Duration row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Capacity</label>
                <input
                  v-model.number="form.capacity"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  class="field"
                  :class="{ 'border-red-400': errors.capacity }"
                />
                <p v-if="errors.capacity" class="text-xs text-red-500 mt-1">{{ errors.capacity }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Duration (min)</label>
                <input
                  v-model.number="form.duration_minutes"
                  type="number"
                  min="1"
                  placeholder="e.g. 60"
                  class="field"
                  :class="{ 'border-red-400': errors.duration_minutes }"
                />
                <p v-if="errors.duration_minutes" class="text-xs text-red-500 mt-1">{{ errors.duration_minutes }}</p>
              </div>
            </div>

            <!-- Allocation mode + Status row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Allocation Mode</label>
                <select v-model="form.allocation_mode" class="field">
                  <option value="FCFS">First Come First Served</option>
                  <option value="INTEREST_RANKING">Interest Ranking</option>
                  <option value="RANDOM">Random</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Status</label>
                <select v-model="form.status" class="field">
                  <option value="DRAFT">Draft</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-bold text-navy-700 mb-1">Notes</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="Optional internal notes…"
                class="field resize-none"
              />
            </div>

            <!-- Registration window -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Reg. Opens At</label>
                <input v-model="form.registration_opens_at" type="datetime-local" class="field" />
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-700 mb-1">Reg. Closes At</label>
                <input v-model="form.registration_closes_at" type="datetime-local" class="field" />
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-50 bg-mist-blue/30">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-xs font-bold text-navy-600 hover:text-navy-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              @click="handleSubmit"
              :disabled="isSubmitting"
              class="flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <span v-if="isSubmitting" class="material-symbols-outlined text-sm animate-spin">refresh</span>
              {{ isEdit ? 'Save Changes' : 'Create Workshop' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useWorkshopForm } from '~/composables/workshops/useWorkshopForm'
import type { WorkshopList } from '~/api/types.gen'
import type { WorkshopFormData } from '~/schemas/workshops/workshop.schema'
import { defaultWorkshopForm } from '~/schemas/workshops/workshop.schema'

const props = defineProps<{
  modelValue: boolean
  eventId: string
  editWorkshop?: WorkshopList | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  saved: []
}>()

const isEdit = computed(() => !!props.editWorkshop)

const { errors, isSubmitting, loadForEdit, submitCreate, submitUpdate, resetForm, setValues } =
  useWorkshopForm(() => {
    emit('saved')
    close()
  })

// Local reactive mirror of form values — drives vee-validate via setValues
const form = ref<WorkshopFormData>({ ...defaultWorkshopForm(), event: props.eventId })

watch(
  form,
  (val) => setValues({ ...val }),
  { deep: true },
)

// Pre-fill when editing
watch(
  () => props.editWorkshop,
  (workshop) => {
    if (workshop) {
      const patch: Partial<WorkshopFormData> = {
        title: workshop.title,
        event: workshop.event,
        date: workshop.date ? workshop.date.slice(0, 16) : '',
        status: workshop.status,
        allocation_mode: workshop.allocation_mode,
        capacity: workshop.capacity ?? null,
        duration_minutes: workshop.duration_minutes ?? null,
        registration_opens_at: workshop.registration_opens_at
          ? workshop.registration_opens_at.slice(0, 16)
          : null,
        registration_closes_at: workshop.registration_closes_at
          ? workshop.registration_closes_at.slice(0, 16)
          : null,
      }
      form.value = { ...defaultWorkshopForm(), event: props.eventId, ...patch }
      loadForEdit(form.value)
    } else {
      form.value = { ...defaultWorkshopForm(), event: props.eventId }
      resetForm()
    }
  },
  { immediate: true },
)

// Sync eventId into form when modal opens and no edit target
watch(
  () => props.modelValue,
  (open) => {
    if (open && !props.editWorkshop) {
      form.value = { ...defaultWorkshopForm(), event: props.eventId }
      resetForm()
    }
  },
)

async function handleSubmit() {
  if (isEdit.value && props.editWorkshop) {
    await submitUpdate(props.editWorkshop.id)
  } else {
    await submitCreate()
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.field {
  @apply w-full px-3 py-2 bg-mist-blue/40 border border-deep-navy/10 focus:border-primary focus:ring-0 rounded-xl text-sm font-medium text-navy-900 placeholder:text-navy-400 transition-all outline-none;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
