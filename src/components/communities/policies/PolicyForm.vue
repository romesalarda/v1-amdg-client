<template>
  <div class="space-y-8">
    <!-- Event Rules -->
    <PolicyFieldSection
      title="Event Rules"
      description="Control what types of events and features organisers can use."
    >
      <PolicyToggleField
        v-model="draft.allow_external_events"
        :disabled="!canEdit"
        label="Allow External Events"
        description="Organisers can host events that are external to the platform."
      />
      <PolicyToggleField
        v-model="draft.allow_workshops"
        :disabled="!canEdit"
        label="Allow Workshops"
        description="Workshop-type events are permitted."
      />
      <PolicyToggleField
        v-model="draft.allow_attendee_deletions"
        :disabled="!canEdit"
        label="Allow Attendee Deletions"
        description="Organisers can delete attendee records."
      />
      <PolicyToggleField
        v-model="draft.allow_sponsors"
        :disabled="!canEdit"
        label="Allow Sponsors"
        description="Events can have sponsors associated."
      />
      <PolicyToggleField
        v-model="draft.allow_product_releases"
        :disabled="!canEdit"
        label="Allow Product Releases"
        description="Events can sell products / merchandise."
      />
    </PolicyFieldSection>

    <div class="border-t border-deep-navy/10" />

    <!-- Content Requirements -->
    <PolicyFieldSection
      title="Content Requirements"
      description="Minimum content that must be provided before an event can be published."
    >
      <PolicyToggleField
        v-model="draft.require_long_description"
        :disabled="!canEdit"
        label="Require Long Description"
        description="Events must include a detailed description."
      />
      <PolicyToggleField
        v-model="draft.require_short_description"
        :disabled="!canEdit"
        label="Require Short Description"
        description="Events must include a brief summary."
      />
      <PolicyToggleField
        v-model="draft.require_landing_image"
        :disabled="!canEdit"
        label="Require Landing Image"
        description="Events must have a banner or landing image."
      />
    </PolicyFieldSection>

    <div class="border-t border-deep-navy/10" />

    <!-- Approval Workflow -->
    <PolicyFieldSection
      title="Approval Workflow"
      description="Define when organisation approval is required before events or products go live."
    >
      <PolicyToggleField
        v-model="draft.must_be_approved_by_organisation"
        :disabled="!canEdit"
        label="Events Require Approval"
        description="Events must be reviewed and approved by the organisation before publishing."
      />
      <PolicyToggleField
        v-model="draft.product_release_must_be_approved_by_organisation"
        :disabled="!canEdit"
        label="Product Releases Require Approval"
        description="Product releases must be approved before going live."
      />
    </PolicyFieldSection>

    <div class="border-t border-deep-navy/10" />

    <!-- Attendance & Event Limits -->
    <PolicyFieldSection
      title="Attendance &amp; Event Limits"
      description="Set upper bounds on attendees per event and events per organiser. Enter 0 for unlimited."
    >
      <div>
        <label class="block text-[10px] font-black text-deep-navy/50 mb-1.5 uppercase tracking-[0.15em]">
          Max Attendees Per Event
        </label>
        <input
          v-model.number="draft.max_attendees_per_event"
          type="number"
          min="0"
          :disabled="!canEdit"
          placeholder="0 = unlimited"
          class="w-full px-3 py-2.5 border-2 border-deep-navy/20 rounded-xl text-sm font-medium text-deep-navy bg-white disabled:opacity-50"
        />
        <p class="text-[10px] text-deep-navy/40 mt-1">0 means no limit</p>
      </div>
      <div>
        <label class="block text-[10px] font-black text-deep-navy/50 mb-1.5 uppercase tracking-[0.15em]">
          Max Events Per Organiser
        </label>
        <input
          v-model.number="draft.max_events_per_organiser"
          type="number"
          min="0"
          :disabled="!canEdit"
          placeholder="0 = unlimited"
          class="w-full px-3 py-2.5 border-2 border-deep-navy/20 rounded-xl text-sm font-medium text-deep-navy bg-white disabled:opacity-50"
        />
        <p class="text-[10px] text-deep-navy/40 mt-1">0 means no limit</p>
      </div>
    </PolicyFieldSection>

    <div class="border-t border-deep-navy/10" />

    <!-- Payments -->
    <PolicyFieldSection
      title="Payment Methods"
      description="Control which payment methods are available for events in this organisation."
    >
      <PolicyToggleField
        v-model="draft.card_payments_are_allowed"
        :disabled="!canEdit"
        label="Card Payments Allowed"
        description="Attendees can pay by card (Stripe)."
      />
      <PolicyToggleField
        v-model="draft.bank_transfers_are_allowed"
        :disabled="!canEdit"
        label="Bank Transfers Allowed"
        description="Attendees can pay by bank transfer."
      />
      <div class="sm:col-span-2">
        <label class="block text-[10px] font-black text-deep-navy/50 mb-1.5 uppercase tracking-[0.15em]">
          Max Package Price
        </label>
        <input
          v-model="draft.max_package_price"
          type="text"
          :disabled="!canEdit"
          placeholder="e.g. 150.00 (leave blank for no limit)"
          class="w-full px-3 py-2.5 border-2 border-deep-navy/20 rounded-xl text-sm font-medium text-deep-navy bg-white disabled:opacity-50"
        />
        <p class="text-[10px] text-deep-navy/40 mt-1">Maximum price for a booking package. Leave blank for no limit.</p>
      </div>
    </PolicyFieldSection>

    <!-- Save / status -->
    <div v-if="canEdit" class="pt-2">
      <div class="flex items-center gap-4">
        <button
          :disabled="!isDirty || isSaving"
          class="px-6 py-3 bg-deep-navy text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:bg-deep-navy/90 disabled:opacity-40"
          @click="save"
        >
          {{ isSaving ? 'Saving…' : 'Save Changes' }}
        </button>
        <button
          v-if="isDirty"
          class="px-5 py-2.5 border-2 border-deep-navy/20 text-deep-navy rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:bg-deep-navy/5"
          @click="reset"
        >
          Discard
        </button>
        <p v-if="!isDirty && lastSaved" class="text-xs text-deep-navy/50 font-medium">
          Last updated {{ lastSaved }}
        </p>
      </div>
    </div>

    <div v-else class="pt-2">
      <p class="text-xs text-deep-navy/50 font-medium italic">
        You have read-only access to this policy.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { OrganisationEventPolicy } from '~/api/types.gen'
import { useUpdateOrganisationPolicy } from '~/composables/resources/organisation/organisationPolicy'
import PolicyFieldSection from './PolicyFieldSection.vue'

// Inline toggle component to keep the template clean
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
    return () => h('label', { class: 'flex items-start gap-3 cursor-pointer group' }, [
      h('div', { class: 'relative mt-0.5' }, [
        h('input', {
          type: 'checkbox',
          checked: props.modelValue,
          disabled: props.disabled,
          class: 'sr-only peer',
          onChange: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).checked),
        }),
        h('div', {
          class: [
            'w-10 h-5 rounded-full border-2 transition-all',
            'peer-checked:bg-deep-navy peer-checked:border-deep-navy',
            'bg-white border-deep-navy/30',
            props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ].join(' '),
        }),
        h('div', {
          class: [
            'absolute top-0.5 left-0.5 w-4 h-4 bg-deep-navy/30 rounded-full transition-all',
            'peer-checked:translate-x-5 peer-checked:bg-white',
          ].join(' '),
        }),
      ]),
      h('div', {}, [
        h('p', { class: 'text-sm font-bold text-deep-navy' }, props.label),
        h('p', { class: 'text-xs text-deep-navy/50 font-medium mt-0.5' }, props.description),
      ]),
    ])
  },
})

interface Props {
  policy: OrganisationEventPolicy
  canEdit: boolean
  /** The url_safe_title of the organisation (from route params) */
  orgId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ saved: [] }>()

type DraftPolicy = Omit<
  OrganisationEventPolicy,
  'id' | 'organisation' | 'organisation_title' | 'created_at' | 'updated_at'
>

function buildDraft(p: OrganisationEventPolicy): DraftPolicy {
  return {
    organisation_url_safe_title: p.organisation_url_safe_title,
    allow_external_events: p.allow_external_events ?? false,
    allow_attendee_deletions: p.allow_attendee_deletions ?? false,
    allow_workshops: p.allow_workshops ?? false,
    allow_product_releases: p.allow_product_releases ?? false,
    allow_sponsors: p.allow_sponsors ?? false,
    require_long_description: p.require_long_description ?? false,
    require_short_description: p.require_short_description ?? false,
    require_landing_image: p.require_landing_image ?? false,
    product_release_must_be_approved_by_organisation: p.product_release_must_be_approved_by_organisation ?? false,
    must_be_approved_by_organisation: p.must_be_approved_by_organisation ?? false,
    max_attendees_per_event: p.max_attendees_per_event ?? 0,
    max_events_per_organiser: p.max_events_per_organiser ?? 0,
    card_payments_are_allowed: p.card_payments_are_allowed ?? false,
    bank_transfers_are_allowed: p.bank_transfers_are_allowed ?? false,
    max_package_price: p.max_package_price ?? '',
  }
}

const draft = reactive<DraftPolicy>(buildDraft(props.policy))

// Sync draft when policy prop changes (e.g., after save)
watch(() => props.policy, (p) => {
  Object.assign(draft, buildDraft(p))
}, { deep: true })

const isDirty = computed(() => {
  const original = buildDraft(props.policy)
  return (Object.keys(draft) as (keyof DraftPolicy)[]).some(
    (k) => draft[k] !== original[k],
  )
})

const lastSaved = computed(() => {
  if (!props.policy.updated_at) return null
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(props.policy.updated_at),
  )
})

function reset() {
  Object.assign(draft, buildDraft(props.policy))
}

const { mutate: doUpdate, isPending: isSaving } = useUpdateOrganisationPolicy()
const { $notyf } = useNuxtApp()

function save() {
  if (!isDirty.value) return

  // Build patch body — omit empty max_package_price to avoid backend issues
  const body: Record<string, unknown> = { ...draft }
  if (body.max_package_price === '') {
    delete body.max_package_price
  }

  doUpdate(
    {
      orgId: props.orgId,
      body: body as any,
    },
    {
      onSuccess: () => {
        $notyf?.success('Policy updated successfully.')
        emit('saved')
      },
      onError: (err: any) => {
        $notyf?.error(err?.body?.error || 'Failed to save policy.')
      },
    },
  )
}
</script>
