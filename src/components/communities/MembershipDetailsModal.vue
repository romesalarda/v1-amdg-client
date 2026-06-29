<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-4xl' }" prevent-focus>
    <div class="p-6">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-2xl font-black uppercase tracking-tight text-deep-navy">
            Member Profile
          </h3>
          <p class="mt-1 text-sm text-deep-navy/60 font-medium">
            Complete membership information and access permissions.
          </p>
        </div>

        <button
          type="button"
          class="rounded-xl p-2 hover:bg-deep-navy/10 transition"
          @click="isOpen = false"
        >
          <svg class="w-5 h-5 text-deep-navy/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="isLoading" class="mt-8 space-y-4">
        <USkeleton class="h-32 rounded-2xl" />
        <USkeleton class="h-48 rounded-2xl" />
      </div>

      <div v-else-if="membership" class="mt-8 space-y-6">

        <!-- Header -->
        <div class="rounded-3xl border-2 border-deep-navy/10 overflow-hidden">
          <div class="bg-blue-600 p-8 text-white">

            <div class="flex flex-col md:flex-row md:items-center gap-6">

              <div
                class="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center shrink-0"
              >
                <img
                  v-if="membership.profile_image"
                  :src="membership.profile_image"
                  class="w-full h-full object-cover"
                />

                <div
                  v-else
                  class="text-3xl font-black uppercase"
                >
                  {{ membership.user_name.charAt(0) }}
                </div>
              </div>

              <div class="flex-1">

                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-2xl font-black uppercase tracking-tight">
                    {{ membership.user_name }}
                  </h2>

                  <span
                    v-if="membership.is_verified"
                    class="px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-widest"
                  >
                    Verified
                  </span>

                  <span
                    v-else-if="membership.requires_verification"
                    class="px-3 py-1 rounded-full bg-yellow-400 text-deep-navy text-[10px] font-black uppercase tracking-widest"
                  >
                    Pending Verification
                  </span>

                  <span
                    v-else
                    class="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest"
                  >
                    Active
                  </span>

                  <span
                    v-if="membership.is_organisation_controller"
                    class="px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest"
                  >
                    Controller
                  </span>

                </div>

                <p class="mt-2 text-white/80 font-medium">
                  {{ membership.user_email }}
                </p>

                <div class="mt-5 flex flex-wrap gap-6 text-sm">

                  <div>
                    <p class="text-white/60 uppercase text-[10px] tracking-widest font-black">
                      Organisation
                    </p>
                    <p class="font-black font-mono">
                      {{ membership.organisation_name }}
                    </p>
                  </div>

                  <div>
                    <p class="text-white/60 uppercase text-[10px] tracking-widest font-black">
                      Member ID
                    </p>
                    <p class="font-mono font-black">
                      #{{ membership.id }}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

        <!-- Information -->
        <div class="grid md:grid-cols-2 gap-5">

          <div class="rounded-2xl border-2 border-deep-navy/10 p-5 space-y-5">

            <h4 class="font-black uppercase tracking-wide text-deep-navy">
              Account
            </h4>

            <div class="grid gap-4">

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-deep-navy/50 font-black">
                  Full Name
                </p>

                <p class="mt-1 font-black font-mono text-deep-navy">
                  {{ membership.user_name }}
                </p>
              </div>

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-deep-navy/50 font-black">
                  Email Address
                </p>

                <p class="mt-1 font-medium break-all">
                  {{ membership.user_email }}
                </p>
              </div>

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-deep-navy/50 font-black">
                  Area
                </p>

                <p class="mt-1 font-medium">
                  {{ membership.area_from || 'Not specified' }}
                </p>
              </div>

            </div>

          </div>

          <div class="rounded-2xl border-2 border-deep-navy/10 p-5 space-y-5">

            <h4 class="font-black uppercase tracking-wide text-deep-navy">
              Membership
            </h4>

            <div class="grid gap-4">

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-deep-navy/50 font-black">
                  Organisation
                </p>

                <p class="mt-1 font-black font-mono">
                  {{ membership.organisation_name }}
                </p>

                <p class="text-xs text-deep-navy/60 mt-1">
                  Organisation ID #{{ membership.organisation }}
                </p>
              </div>

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-deep-navy/50 font-black">
                  Added By
                </p>

                <p class="mt-1 font-black font-mono">
                  {{ membership.added_by_name || 'System' }}
                </p>
              </div>

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-deep-navy/50 font-black">
                  Added On
                </p>

                <p class="mt-1 font-black font-mono">
                  {{ formatDate(membership.added_at) }}
                </p>
              </div>

            </div>

          </div>

        </div>

        <!-- Status -->
        <div class="rounded-2xl border-2 border-deep-navy/10 overflow-hidden">

          <div class="bg-deep-navy/5 px-5 py-4 border-b border-deep-navy/10">
            <h4 class="font-black uppercase tracking-wide text-deep-navy">
              Verification & Permissions
            </h4>
          </div>

          <div class="p-5 grid md:grid-cols-2 gap-6">

            <div class="space-y-4">

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-deep-navy/50 font-black">
                  Verification Status
                </p>

                <p
                  :class="[
                    'mt-1 font-black font-mono',
                    membership.is_verified
                      ? 'text-green-600'
                      : membership.requires_verification
                      ? 'text-yellow-600'
                      : 'text-deep-navy'
                  ]"
                >
                  {{
                    membership.is_verified
                      ? 'Verified'
                      : membership.requires_verification
                      ? 'Awaiting Verification'
                      : 'Not Required'
                  }}
                </p>
              </div>

              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-deep-navy/50 font-black">
                  Verified At
                </p>

                <p class="mt-1 font-black font-mono">
                  {{ membership.verified_at ? formatDate(membership.verified_at) : '—' }}
                </p>
              </div>

            </div>

            <div class="space-y-4">

              <div class="flex justify-between items-center">
                <span class="font-medium">Requires Verification</span>

                <UBadge
                  :color="membership.requires_verification ? 'amber' : 'green'"
                  variant="soft"
                >
                  {{ membership.requires_verification ? 'Yes' : 'No' }}
                </UBadge>
              </div>

              <div class="flex justify-between items-center">
                <span class="font-medium">Organisation Controller</span>

                <UBadge
                  :color="membership.is_organisation_controller ? 'blue' : 'gray'"
                  variant="soft"
                >
                  {{ membership.is_organisation_controller ? 'Yes' : 'No' }}
                </UBadge>
              </div>

            </div>

          </div>

        </div>

        <div
          v-if="membership.requires_verification && !membership.is_verified"
          class="flex justify-end"
        >
          <button
            type="button"
            :disabled="isVerifying"
            class="px-6 py-3 rounded-xl bg-deep-navy hover:bg-deep-navy/90 text-white font-black uppercase tracking-wider disabled:opacity-50"
            @click="verifyMember"
          >
            {{ isVerifying ? 'Verifying...' : 'Verify Member' }}
          </button>
        </div>

      </div>

      <div
        v-else
        class="py-16 text-center text-deep-navy/50 font-medium"
      >
        No member selected.
      </div>

      <div class="mt-8 flex justify-end">
        <button
          type="button"
          class="px-5 py-2 rounded-xl border-2 border-deep-navy/20 font-black uppercase tracking-wide hover:bg-deep-navy/5"
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
