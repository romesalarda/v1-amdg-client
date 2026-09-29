<template>
  <ManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <main class="m-5 space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#026CDF] px-6 py-4">
        <div class="min-w-0">
          <h1 class="text-2xl font-black uppercase text-white">Event Policy</h1>
          <p class="mt-1 text-sm font-medium text-white/75">{{ event?.title || 'Event restrictions and requirements' }}</p>
        </div>
        <UButton
          :to="`/communities/${organisationId}/m/events/${eventId}`"
          variant="outline"
          color="white"
          icon="i-heroicons-arrow-left"
          size="sm"
          class="text-white"
        >
          Back to event
        </UButton>
      </header>

      <div v-if="isLoadingEvent || isLoadingPolicy" class="space-y-4">
        <USkeleton class="h-28 w-full rounded-lg" />
        <USkeleton class="h-72 w-full rounded-lg" />
      </div>
      <UAlert
        v-else-if="eventError || policyError"
        color="red"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        title="Unable to load event policy"
        :description="eventError?.message || policyError?.message || 'An unexpected error occurred.'"
      />
      <EventPolicyForm
        v-else-if="policy"
        :event-id="eventId"
        :policy="policy"
        :can-edit="canEdit"
      />
      <UAlert
        v-else
        color="blue"
        variant="soft"
        icon="i-heroicons-information-circle"
        title="Policy unavailable"
        description="No event policy was returned for this event."
      />
    </main>
  </ManagementLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EventPolicyForm from '~/components/communities/policies/EventPolicyForm.vue'
import ManagementLayout from '~/components/communities/ManagementLayout.vue'
import { useCurrentLeaderPermissions } from '~/composables/permissions'
import { useEventPolicy } from '~/composables/resources/events/eventPolicy'
import { useEvent } from '~/composables/resources/events/events'
import { useOrganisation } from '~/composables/resources/organisation/organisations'

const route = useRoute()
const organisationId = computed(() => route.params.id as string)
const eventId = computed(() => route.params.event_id as string)

const { data: organisationData } = useOrganisation(organisationId)
const organisation = computed(() => organisationData.value?.data)
const {
  data: eventData,
  isLoading: isLoadingEvent,
  error: eventError,
} = useEvent(eventId)
const event = computed(() => eventData.value?.data)
const {
  data: policyData,
  isLoading: isLoadingPolicy,
  error: policyError,
} = useEventPolicy(eventId)
const policy = computed(() => policyData.value?.data)

const { hasLeaderPermission } = useCurrentLeaderPermissions(organisationId)
const canEdit = computed(() => hasLeaderPermission('allow_policy_management', 'update').value)

definePageMeta({
  layout: false,
  middleware: ['auth', 'leader-permission'],
  leaderPermission: { code: 'allow_policy_management' },
})

useHead({ title: 'Event Policy' })
</script>
