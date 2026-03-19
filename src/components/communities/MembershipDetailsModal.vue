<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-3xl' }" prevent-focus>
    <div class="p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-deep-navy uppercase tracking-tight">Member Details</h3>
          <p class="text-sm text-deep-navy/60 mt-1 font-medium">Review membership information and verify access.</p>
        </div>
        <button
          type="button"
          class="p-2 rounded-lg hover:bg-deep-navy/10"
          @click="isOpen = false"
        >
          <svg class="w-5 h-5 text-deep-navy/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="isLoading" class="mt-6 space-y-3">
        <USkeleton class="h-6 w-1/2" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-3/4" />
      </div>

      <div v-else-if="membership" class="mt-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border-2 border-deep-navy/10 rounded-xl p-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Member</p>
            <p class="mt-2 text-sm font-black text-deep-navy uppercase tracking-tight">{{ membership.user_name }}</p>
            <p class="text-xs text-deep-navy/60 font-medium mt-1">{{ membership.user_email }}</p>
          </div>
          <div class="border-2 border-deep-navy/10 rounded-xl p-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Organisation</p>
            <p class="mt-2 text-sm font-black text-deep-navy uppercase tracking-tight">{{ membership.organisation_name }}</p>
            <p class="text-xs text-deep-navy/60 font-medium mt-1">ID {{ membership.organisation }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border-2 border-deep-navy/10 rounded-xl p-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Added By</p>
            <p class="mt-2 text-sm font-black text-deep-navy uppercase tracking-tight">{{ membership.added_by_name || 'System' }}</p>
          </div>
          <div class="border-2 border-deep-navy/10 rounded-xl p-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Added At</p>
            <p class="mt-2 text-sm font-black text-deep-navy uppercase tracking-tight">{{ formatDate(membership.added_at) }}</p>
          </div>
          <div class="border-2 border-deep-navy/10 rounded-xl p-4">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Verified At</p>
            <p class="mt-2 text-sm font-black text-deep-navy uppercase tracking-tight">
              {{ membership.verified_at ? formatDate(membership.verified_at) : 'Not verified' }}
            </p>
          </div>
        </div>

        <div class="border-2 border-deep-navy/10 rounded-xl p-4 bg-deep-navy/5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-deep-navy/50">Verification</p>
              <p class="mt-2 text-sm font-black text-deep-navy uppercase tracking-tight">
                {{ membership.is_verified ? 'Verified' : membership.requires_verification ? 'Needs Verification' : 'No Verification Required' }}
              </p>
              <p class="text-xs text-deep-navy/60 font-medium mt-1">
                {{ membership.requires_verification ? 'This member requires manual approval before full access.' : 'No approval required for this member.' }}
              </p>
            </div>
            <button
              v-if="membership.requires_verification && !membership.is_verified"
              type="button"
              :disabled="isVerifying"
              class="px-4 py-2 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              @click="verifyMember"
            >
              {{ isVerifying ? 'Verifying...' : 'Verify Member' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="mt-6 text-sm text-deep-navy/60 font-medium">Select a member to view details.</div>

      <div class="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 border-2 border-deep-navy/20 rounded-xl text-deep-navy font-black text-xs uppercase tracking-wider hover:bg-deep-navy/5"
          @click="isOpen = false"
        >
          Close
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOrganisationMembershipDetails, useVerifyOrganisationMembership } from '~/composables/resources/organisation/organisationMembershipDetails'
import { formatDate } from '~/utils/time'

type Props = {
  modelValue: boolean
  membershipId: number | null
}

type Emits = {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const { data, isLoading, refetch } = useOrganisationMembershipDetails(computed(() => props.membershipId))
const membership = computed(() => data.value?.data)

const { mutate: verifyMembership, isPending: isVerifying } = useVerifyOrganisationMembership()
const { $notyf } = useNuxtApp()

const verifyMember = () => {
  if (!props.membershipId) return

  verifyMembership(props.membershipId, {
    onSuccess: () => {
      $notyf.success('Member verified successfully.')
      refetch()
    },
    onError: (error: any) => {
      $notyf.error(error?.body?.error || error?.message || 'Failed to verify member')
    },
  })
}
</script>
