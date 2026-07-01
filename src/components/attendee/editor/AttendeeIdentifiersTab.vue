<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xs font-black text-primary uppercase tracking-widest">Alternative Identifiers</h3>
      <UButton
        @click="$emit('set-show-add-form', true)"
        size="sm"
        color="primary"
        icon="i-heroicons-plus"
      >
        Add Identifier
      </UButton>
    </div>

    <p class="text-xs text-gray-500 mb-4">
      Alternative identifiers allow this attendee to check in using a code other than their ticket QR code (e.g. a membership number or community QR code).
    </p>

    <!-- Add / Edit Form -->
    <div v-if="showAddForm || editingSigninId" class="bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-200">
      <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
        {{ editingSigninId ? 'Edit Identifier' : 'New Identifier' }}
      </h4>
      <form @submit.prevent="editingSigninId ? $emit('update-signin') : $emit('add-signin')" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Identifier Type *</label>
          <select
            :value="newSignin.event_alternative_signin"
            @change="$emit('update-event-alternative-signin', ($event.target as HTMLSelectElement).value)"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">Select type...</option>
            <option
              v-for="def in eventSigninDefinitions"
              :key="def.id"
              :value="def.id"
            >
              {{ def.title }}
              <template v-if="def.format_match"> (format: {{ def.format_match }})</template>
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Identifier Value *</label>
          <input
            :value="newSignin.identifier"
            @input="$emit('update-identifier', ($event.target as HTMLInputElement).value)"
            type="text"
            required
            placeholder="e.g. YFC123456"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p v-if="selectedDefinitionFormatHint" class="mt-1 text-xs text-gray-500">
            Expected format: <code class="font-mono bg-gray-100 px-1 rounded">{{ selectedDefinitionFormatHint }}</code>
          </p>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Link to Ticket</label>
          <AttendeeTicketSelect
            :model-value="newSignin.ticket"
            :attendee-id="attendeeId"
            @update:model-value="$emit('update-ticket', $event)"
          />
          <p class="mt-1 text-xs text-gray-500">Optionally link this identifier to a specific ticket for this attendee.</p>
        </div>
        <div class="flex gap-2 pt-2">
          <UButton
            type="submit"
            :loading="editingSigninId ? updatePending : createPending"
            size="sm"
            color="green"
          >
            {{ editingSigninId ? 'Save' : 'Add' }}
          </UButton>
          <UButton
            type="button"
            @click="editingSigninId ? $emit('cancel-edit-signin') : $emit('cancel-add-signin')"
            size="sm"
            variant="ghost"
            color="gray"
          >
            Cancel
          </UButton>
        </div>
      </form>
    </div>

    <!-- Loading -->
    <div v-if="signinsLoading" class="text-center py-8 text-gray-500 text-sm">
      Loading identifiers...
    </div>

    <!-- Empty state -->
    <div v-else-if="!signins.length && !showAddForm" class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
        <UIcon name="i-heroicons-identification" class="h-7 w-7" />
      </div>
      <p class="mt-4 text-base font-black uppercase tracking-[0.22em] text-slate-500">No alternative identifiers</p>
      <p class="mt-2 text-sm text-slate-500">Press "Add Identifier" to link a membership or community code to this attendee.</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
  v-for="signin in signins"
  :key="signin.sign_id"
  class="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-sm"
>
  <div
    v-if="editingSigninId === signin.sign_id"
    class="flex items-center gap-2 text-sm text-primary"
  >
    <UIcon
      name="i-heroicons-pencil-square"
      class="h-4 w-4"
    />
    Editing above...
  </div>

  <div
    v-else
    class="flex items-start justify-between gap-4"
  >
    <div class="min-w-0 flex-1">

      <!-- Header -->
      <div class="flex flex-wrap items-center gap-2">

        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-lg font-medium text-white bg-blue-600">
          <UIcon
            name="i-heroicons-tag"
            class="mr-1 h-4 w-4"
          />
          {{ signin.event_alternative_signin_title }}
        </span>

        <span class="font-mono text-base font-semibold text-gray-900">
          {{ signin.identifier }}
        </span>

        <span
          v-if="signin.uses > 0"
          class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
        >
          <UIcon
            name="i-heroicons-arrow-path-rounded-square"
            class="mr-1 h-3 w-3"
          />
          {{ signin.uses }}
          {{ signin.uses === 1 ? 'use' : 'uses' }}
        </span>

      </div>

      <!-- Metadata -->
      <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

        <div
          v-if="signin.ticket_code"
          class="flex items-center gap-1.5"
        >
          <UIcon
            name="i-heroicons-ticket"
            class="h-4 w-4 text-primary"
          />
          <span>{{ signin.ticket_code }}</span>
        </div>

        <div
          v-else
          class="flex items-center gap-1.5 text-orange-600"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="h-4 w-4"
          />
          No ticket linked
        </div>

        <div
          v-if="signin.defined_by_name"
          class="flex items-center gap-1.5"
        >
          <UIcon
            name="i-heroicons-user"
            class="h-4 w-4"
          />
          {{ signin.defined_by_name }}
        </div>

        <div class="flex items-center gap-1.5">
          <UIcon
            name="i-heroicons-calendar-days"
            class="h-4 w-4"
          />
          {{ formatDate(signin.defined_at) }}
        </div>

      </div>

    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 opacity-70 transition group-hover:opacity-100">

      <UButton
        size="sm"
        color="gray"
        variant="ghost"
        icon="i-heroicons-pencil-square"
        @click="$emit('start-edit-signin', signin)"
      />

      <UButton
        size="sm"
        color="red"
        variant="ghost"
        icon="i-heroicons-trash"
        :loading="deletePending"
        @click="$emit('delete-signin', signin.sign_id)"
      />

    </div>
  </div>
</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AttendeeAlternativeSigninList, EventAlternativeSigninList } from '~/api/types.gen'
import AttendeeTicketSelect from '~/components/ui/AttendeeTicketSelect.vue'

const props = defineProps<{
  attendeeId: string
  signins: AttendeeAlternativeSigninList[]
  signinsLoading: boolean
  showAddForm: boolean
  editingSigninId: string | null
  newSignin: {
    event_alternative_signin: string
    identifier: string
    ticket: string | null
  }
  eventSigninDefinitions: EventAlternativeSigninList[]
  createPending: boolean
  updatePending: boolean
  deletePending: boolean
}>()

defineEmits<{
  (e: 'set-show-add-form', value: boolean): void
  (e: 'update-event-alternative-signin', value: string): void
  (e: 'update-identifier', value: string): void
  (e: 'update-ticket', value: string | null): void
  (e: 'add-signin'): void
  (e: 'update-signin'): void
  (e: 'cancel-add-signin'): void
  (e: 'cancel-edit-signin'): void
  (e: 'start-edit-signin', signin: AttendeeAlternativeSigninList): void
  (e: 'delete-signin', signId: string): void
}>()

const selectedDefinitionFormatHint = computed(() => {
  if (!props.newSignin.event_alternative_signin) return null
  const def = props.eventSigninDefinitions.find(d => d.id === props.newSignin.event_alternative_signin)
  return def?.format_match ?? null
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString()
}
</script>
