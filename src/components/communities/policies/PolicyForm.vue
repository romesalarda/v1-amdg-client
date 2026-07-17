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

    <div class="h-px bg-gradient-to-r from-transparent via-deep-navy/15 to-transparent" />

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

    <div class="h-px bg-gradient-to-r from-transparent via-deep-navy/15 to-transparent" />

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

    <div class="h-px bg-gradient-to-r from-transparent via-deep-navy/15 to-transparent" />

    <!-- Attendance & Event Limits -->
    <PolicyFieldSection
      title="Attendance &amp; Event Limits"
      description="Set upper bounds on attendees per event and events per organiser. Enter 0 for unlimited."
    >
      <div>
        <label class="block text-[10px] font-black text-deep-navy/50 mb-1.5 uppercase tracking-[0.15em]">
          Max Attendees Per Event
        </label>
        <div class="relative">
          <UIcon name="i-heroicons-user-group" class="w-4 h-4 text-deep-navy/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model.number="draft.max_attendees_per_event"
            type="number"
            min="0"
            :disabled="!canEdit"
            placeholder="0"
            class="w-full pl-9 pr-20 py-2.5 border-2 border-deep-navy/15 rounded-xl text-sm font-bold text-deep-navy bg-white transition-colors focus:outline-none focus:border-deep-navy/50 focus:ring-4 focus:ring-deep-navy/5 disabled:opacity-50 disabled:bg-deep-navy/[0.02]"
          />
          <span
            v-if="!draft.max_attendees_per_event"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-wider text-deep-navy/40 bg-deep-navy/5 rounded-full px-2 py-1"
          >
            Unlimited
          </span>
        </div>
      </div>
      <div>
        <label class="block text-[10px] font-black text-deep-navy/50 mb-1.5 uppercase tracking-[0.15em]">
          Max Events Per Organiser
        </label>
        <div class="relative">
          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-deep-navy/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model.number="draft.max_events_per_organiser"
            type="number"
            min="0"
            :disabled="!canEdit"
            placeholder="0"
            class="w-full pl-9 pr-20 py-2.5 border-2 border-deep-navy/15 rounded-xl text-sm font-bold text-deep-navy bg-white transition-colors focus:outline-none focus:border-deep-navy/50 focus:ring-4 focus:ring-deep-navy/5 disabled:opacity-50 disabled:bg-deep-navy/[0.02]"
          />
          <span
            v-if="!draft.max_events_per_organiser"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-wider text-deep-navy/40 bg-deep-navy/5 rounded-full px-2 py-1"
          >
            Unlimited
          </span>
        </div>
      </div>
    </PolicyFieldSection>

    <div class="h-px bg-gradient-to-r from-transparent via-deep-navy/15 to-transparent" />

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
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-deep-navy/30">£</span>
          <input
            v-model="draft.max_package_price"
            type="text"
            :disabled="!canEdit"
            placeholder="No limit"
            class="w-full pl-7 pr-3 py-2.5 border-2 border-deep-navy/15 rounded-xl text-sm font-bold text-deep-navy bg-white transition-colors focus:outline-none focus:border-deep-navy/50 focus:ring-4 focus:ring-deep-navy/5 disabled:opacity-50 disabled:bg-deep-navy/[0.02]"
          />
        </div>
        <p class="text-[10px] text-deep-navy/40 mt-1.5">Maximum price for a booking package. Leave blank for no limit.</p>
      </div>
    </PolicyFieldSection>

    <!-- Save / status bar -->
    <div
      v-if="canEdit"
      class="sticky bottom-4 z-10"
    >
      <div
        class="flex items-center gap-4 rounded-2xl border border-deep-navy/10 bg-white/95 backdrop-blur px-5 py-4 transition-shadow"
        :class="isDirty ? 'shadow-xl shadow-deep-navy/10 ring-1 ring-deep-navy/10' : 'shadow-sm'"
      >
        <button
          :disabled="!isDirty || isSaving"
          class="px-6 py-2.5 bg-deep-navy text-white rounded-full font-black text-xs uppercase tracking-wider transition-all hover:bg-deep-navy/90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          @click="save"
        >
          <UIcon v-if="isSaving" name="i-heroicons-arrow-path" class="w-3.5 h-3.5 animate-spin" />
          {{ isSaving ? 'Saving…' : 'Save Changes' }}
        </button>
        <button
          v-if="isDirty"
          class="px-5 py-2.5 border-2 border-deep-navy/15 text-deep-navy rounded-full font-black text-[11px] uppercase tracking-wider transition-all hover:bg-deep-navy/5"
          @click="reset"
        >
          Discard
        </button>
        <div class="flex items-center gap-2 ml-auto">
          <span
            v-if="isDirty"
            class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Unsaved changes
          </span>
          <p v-else-if="lastSaved" class="text-xs text-deep-navy/40 font-semibold">
            Last updated {{ lastSaved }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="pt-2">
      <div class="flex items-center gap-2 rounded-xl bg-deep-navy/[0.03] border border-deep-navy/10 px-4 py-3">
        <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 text-deep-navy/40" />
        <p class="text-xs text-deep-navy/50 font-semibold">
          You have read-only access to this policy.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, h, defineComponent } from 'vue'
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
      h('div', { class: 'relative mt-0.5 flex-shrink-0' }, [
        h('input', {
          type: 'checkbox',
          checked: props.modelValue,
          disabled: props.disabled,
          class: 'sr-only peer',
          onChange: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).checked),
        }),
        h('div', {
          class: [
            'w-10 h-[22px] rounded-full border-2 transition-all duration-200 shadow-inner',
            'peer-checked:bg-deep-navy peer-checked:border-deep-navy',
            'bg-deep-navy/[0.04] border-deep-navy/20 group-hover:border-deep-navy/40',
            props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ].join(' '),
        }),
        h('div', {
          class: [
            'absolute top-[3px] left-[3px] w-3.5 h-3.5 bg-deep-navy/30 rounded-full transition-all duration-200 shadow',
            'peer-checked:translate-x-[19px] peer-checked:bg-white',
          ].join(' '),
        }),
      ]),
      h('div', {}, [
        h('p', { class: 'text-sm font-bold text-deep-navy' }, props.label),
        h('p', { class: 'text-xs text-deep-navy/50 font-medium mt-0.5 leading-snug' }, props.description),
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