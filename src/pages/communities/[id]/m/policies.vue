<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">

    <div class="flex items-center justify-center min-h-[70vh] px-6">
      <div
        class="max-w-lg w-full text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-10"
      >
        <div
          class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50"
        >
          <UIcon
            name="i-heroicons-wrench-screwdriver"
            class="h-10 w-10 text-amber-500"
          />
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-3">
          Community Policies - Coming Soon
        </h1>

        <p class="text-gray-600 mb-6 leading-relaxed">
          We're currently building this feature to help you manage community
          policies, guidelines, and regulations more efficiently.
        </p>

        <div
          class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
        >
          <UIcon
            name="i-heroicons-clock"
            class="h-4 w-4"
          />
          Coming Soon
        </div>

        <div class="mt-8 border-t pt-6">
          <p class="text-sm text-gray-500">
            Stay tuned for future updates.
          </p>
        </div>
      </div>
    </div>
</CommunitiesManagementLayout>
</template>
<script lang="ts" setup>

import { useOrganisation } from '~/composables/resources/organisation/organisations'


const route = useRoute()
const organisationId = computed(() => route.params.id as string)

// Fetch organisation details
const { data: organisation, isLoading: isLoadingOrganisation } = useOrganisation(organisationId)

definePageMeta({
  layout: false,
  middleware: ['auth'],
})


</script>