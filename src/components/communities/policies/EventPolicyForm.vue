<template>
  <div class="space-y-6">
    <section class="bg-white border border-deep-navy/10 rounded-lg p-5">
      <div class="mb-5">
        <h2 class="text-sm font-black text-deep-navy uppercase">Effective Policy</h2>
        <p class="text-xs text-deep-navy/55 mt-1">These are the rules currently enforced after applying the organisation baseline.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-3">
        <div v-for="item in effectiveFlags" :key="item.label" class="flex items-center justify-between gap-3 border-b border-deep-navy/5 py-2">
          <span class="text-xs font-semibold text-deep-navy/75">{{ item.label }}</span>
          <span :class="item.value ? 'text-emerald-700' : 'text-rose-700'" class="text-[10px] font-black uppercase">
            {{ item.value ? 'Allowed' : 'Restricted' }}
          </span>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-deep-navy/10 pt-4 text-xs font-semibold text-deep-navy/70">
        <span>Effective attendee limit: <strong class="text-deep-navy">{{ effectivePolicy.max_attendees_per_event || 'Unlimited' }}</strong></span>
        <span>Effective package price cap: <strong class="text-deep-navy">£{{ effectivePolicy.max_package_price }}</strong></span>
      </div>
    </section>

    <section class="bg-white border border-deep-navy/10 rounded-lg p-5">
      <h2 class="text-sm font-black text-deep-navy uppercase mb-4">Event Capabilities</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PolicyToggleField v-model="draft.allow_external_events" :disabled="!canEdit" label="External events" description="Allow this event to link to an external event or registration flow." />
        <PolicyToggleField v-model="draft.allow_attendee_deletions" :disabled="!canEdit" label="Attendee deletions" description="Allow attendee records for this event to be deleted." />
        <PolicyToggleField v-model="draft.allow_workshops" :disabled="!canEdit" label="Workshops" description="Allow workshops to be created for this event." />
        <PolicyToggleField v-model="draft.allow_product_releases" :disabled="!canEdit" label="Product releases" description="Allow products or merchandise to be offered for this event." />
        <PolicyToggleField v-model="draft.allow_sponsors" :disabled="!canEdit" label="Sponsors" description="Allow sponsors and sponsorship packages for this event." />
      </div>
    </section>

    <section class="bg-white border border-deep-navy/10 rounded-lg p-5">
      <h2 class="text-sm font-black text-deep-navy uppercase mb-4">Content and Approval</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PolicyToggleField v-model="draft.require_short_description" :disabled="!canEdit" label="Require short description" description="A summary is required before publishing." />
        <PolicyToggleField v-model="draft.require_long_description" :disabled="!canEdit" label="Require long description" description="A detailed description is required before publishing." />
        <PolicyToggleField v-model="draft.require_landing_image" :disabled="!canEdit" label="Require landing image" description="A landing image is required before publishing." />
        <PolicyToggleField v-model="draft.must_be_approved_by_organisation" :disabled="!canEdit" label="Organisation event approval" description="Keep organisation approval required for this event." />
        <PolicyToggleField v-model="draft.product_release_must_be_approved_by_organisation" :disabled="!canEdit" label="Product release approval" description="Keep organisation approval required for product releases." />
      </div>
    </section>

    <section class="bg-white border border-deep-navy/10 rounded-lg p-5">
      <h2 class="text-sm font-black text-deep-navy uppercase mb-4">Limits and Payments</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label class="block">
          <span class="block text-xs font-bold text-deep-navy/70 mb-1.5">Maximum attendees <span class="font-medium text-deep-navy/45">(0 means no event-level limit)</span></span>
          <input v-model.number="draft.max_attendees_per_event" type="number" min="0" step="1" :disabled="!canEdit" class="w-full rounded-md border border-deep-navy/20 px-3 py-2 text-sm font-semibold text-deep-navy disabled:bg-gray-50 disabled:text-deep-navy/50">
        </label>
        <label class="block">
          <span class="block text-xs font-bold text-deep-navy/70 mb-1.5">Maximum package price (£)</span>
          <input v-model="draft.max_package_price" type="number" min="0" step="0.01" :disabled="!canEdit" class="w-full rounded-md border border-deep-navy/20 px-3 py-2 text-sm font-semibold text-deep-navy disabled:bg-gray-50 disabled:text-deep-navy/50">
        </label>
        <PolicyToggleField v-model="draft.card_payments_are_allowed" :disabled="!canEdit" label="Card payments" description="Allow Stripe/card payment methods for this event." />
        <PolicyToggleField v-model="draft.bank_transfers_are_allowed" :disabled="!canEdit" label="Bank transfers" description="Allow bank transfer payment methods for this event." />
      </div>
    </section>

    <div v-if="canEdit" class="sticky bottom-4 z-10 flex items-center gap-3 rounded-lg border border-deep-navy/10 bg-white/95 p-4 shadow-lg backdrop-blur">
      <UButton :disabled="!isDirty || isSaving" :loading="isSaving" icon="i-heroicons-check" @click="save">
        Save policy
      </UButton>
      <UButton v-if="isDirty" variant="ghost" color="gray" :disabled="isSaving" @click="reset">
        Discard
      </UButton>
      <span v-if="isDirty" class="ml-auto text-xs font-semibold text-amber-700">Unsaved changes</span>
      <span v-else-if="lastSaved" class="ml-auto text-xs text-deep-navy/45">Updated {{ lastSaved }}</span>
    </div>
    <UAlert v-else color="blue" variant="soft" icon="i-heroicons-lock-closed" title="Read-only policy access" description="You can view the effective event policy but cannot change it." />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, watch } from 'vue'
import type { EventPolicy, EventPolicyValues, PatchedEventPolicyRequest } from '~/api/types.gen'
import { useUpdateEventPolicy } from '~/composables/resources/events/eventPolicy'

const PolicyToggleField = defineComponent({
  name: 'PolicyToggleField',
  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String, required: true },
    description: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('label', { class: 'flex items-start gap-3 text-sm' }, [
      h('input', {
        type: 'checkbox',
        checked: props.modelValue,
        disabled: props.disabled,
        class: 'mt-0.5 h-4 w-4 rounded border-deep-navy/30 accent-deep-navy disabled:opacity-50',
        onChange: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).checked),
      }),
      h('span', { class: 'min-w-0' }, [
        h('span', { class: 'block font-bold text-deep-navy' }, props.label),
        h('span', { class: 'mt-0.5 block text-xs leading-relaxed text-deep-navy/50' }, props.description),
      ]),
    ])
  },
})

const props = defineProps<{
  eventId: string
  policy: EventPolicy
  canEdit: boolean
}>()

const editableKeys = [
  'allow_external_events',
  'allow_attendee_deletions',
  'allow_workshops',
  'allow_product_releases',
  'allow_sponsors',
  'require_long_description',
  'require_short_description',
  'require_landing_image',
  'product_release_must_be_approved_by_organisation',
  'must_be_approved_by_organisation',
  'max_attendees_per_event',
  'card_payments_are_allowed',
  'bank_transfers_are_allowed',
  'max_package_price',
] as const satisfies readonly (keyof PatchedEventPolicyRequest)[]

type EventPolicyDraft = Required<Pick<PatchedEventPolicyRequest, typeof editableKeys[number]>>

function buildDraft(policy: EventPolicy): EventPolicyDraft {
  return {
    allow_external_events: policy.allow_external_events ?? false,
    allow_attendee_deletions: policy.allow_attendee_deletions ?? false,
    allow_workshops: policy.allow_workshops ?? false,
    allow_product_releases: policy.allow_product_releases ?? false,
    allow_sponsors: policy.allow_sponsors ?? false,
    require_long_description: policy.require_long_description ?? false,
    require_short_description: policy.require_short_description ?? false,
    require_landing_image: policy.require_landing_image ?? false,
    product_release_must_be_approved_by_organisation: policy.product_release_must_be_approved_by_organisation ?? false,
    must_be_approved_by_organisation: policy.must_be_approved_by_organisation ?? false,
    max_attendees_per_event: policy.max_attendees_per_event ?? 0,
    card_payments_are_allowed: policy.card_payments_are_allowed ?? false,
    bank_transfers_are_allowed: policy.bank_transfers_are_allowed ?? false,
    max_package_price: policy.max_package_price ?? '0.00',
  }
}

const draft = reactive<EventPolicyDraft>(buildDraft(props.policy))
const effectivePolicy = computed<EventPolicyValues>(() => props.policy.effective_policy)
const effectiveFlags = computed(() => [
  { label: 'External events', value: effectivePolicy.value.allow_external_events },
  { label: 'Attendee deletions', value: effectivePolicy.value.allow_attendee_deletions },
  { label: 'Workshops', value: effectivePolicy.value.allow_workshops },
  { label: 'Product releases', value: effectivePolicy.value.allow_product_releases },
  { label: 'Sponsors', value: effectivePolicy.value.allow_sponsors },
  { label: 'Short description required', value: effectivePolicy.value.require_short_description },
  { label: 'Long description required', value: effectivePolicy.value.require_long_description },
  { label: 'Landing image required', value: effectivePolicy.value.require_landing_image },
  { label: 'Organisation approval required', value: effectivePolicy.value.must_be_approved_by_organisation },
  { label: 'Card payments', value: effectivePolicy.value.card_payments_are_allowed },
  { label: 'Bank transfers', value: effectivePolicy.value.bank_transfers_are_allowed },
])

watch(() => props.policy, policy => Object.assign(draft, buildDraft(policy)), { deep: true })

const isDirty = computed(() => editableKeys.some(key => draft[key] !== buildDraft(props.policy)[key]))
const updateMutation = useUpdateEventPolicy()
const isSaving = computed(() => updateMutation.isPending.value)
const lastSaved = computed(() => props.policy.updated_at
  ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(props.policy.updated_at))
  : null)
const { $notyf } = useNuxtApp()

function reset() {
  Object.assign(draft, buildDraft(props.policy))
}

function save() {
  if (!isDirty.value) return
  updateMutation.mutate(
    { eventId: props.eventId, body: { ...draft } },
    {
      onSuccess: () => $notyf?.success('Event policy updated.'),
      onError: (error: any) => $notyf?.error(error?.body?.detail || 'Failed to update event policy.'),
    },
  )
}
</script>
