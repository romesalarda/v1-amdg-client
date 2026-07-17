<template>
    <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
        <div class="space-y-8 m-5">
            <div class="flex items-center justify-between bg-[#026CDF] rounded-lg px-6 py-4">
				<div>
					<h1 class="text-2xl font-black text-white uppercase">Community Policies</h1>
					<p class="text-sm text-white/60 font-medium mt-1">
						Policies for {{ organisation?.title || 'this community' }}
					</p>
				</div>
				<div class="flex items-center gap-3">
					<UButton
						:to="`/communities/${organisationId}/m/dashboard`"
						variant="outline"
						color="white"
						icon="i-heroicons-arrow-left"
						size="sm"
						class="text-white"
					>
						Back to Dashboard
					</UButton>
				</div>
			</div>

            <div v-if="isLoadingPolicy" class="space-y-4">
                <USkeleton class="h-48 w-full rounded-xl" />
                <USkeleton class="h-48 w-full rounded-xl" />
                <USkeleton class="h-48 w-full rounded-xl" />
            </div>

            <div v-else-if="policyError" class="bg-white border-2 border-red-400 rounded-xl shadow-drawn p-8 text-center">
                <p class="text-sm font-black text-red-600 uppercase tracking-tight">Failed to load policies</p>
                <p class="text-xs text-red-400 font-medium mt-2">{{ (policyError as any)?.message ?? 'An unexpected error occurred.' }}</p>
            </div>

            <PolicyForm
                v-else-if="policy"
                :policy="policy"
                :can-edit="canEdit"
                :org-id="organisationId"
                @saved="refetchPolicy"
            />

            <div v-else class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn p-8 text-center">
                <p class="text-sm font-bold text-deep-navy/60">No policy configuration found.</p>
            </div>
        </div>
    </CommunitiesManagementLayout>
</template>

<script lang="ts" setup>
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationPolicy } from '~/composables/resources/organisation/organisationPolicy'
import { useCurrentLeaderPermissions } from '~/composables/permissions'
import PolicyForm from '~/components/communities/policies/PolicyForm.vue'

definePageMeta({
    layout: false,
    middleware: ['auth', 'leader-permission'],
    leaderPermission: { code: 'allow_policy_management' },
})

useHead({
    title: 'Community Policies',
})

const route = useRoute()
const organisationId = computed(() => route.params.id as string)

const { data: organisationData } = useOrganisation(organisationId)
const organisation = computed(() => organisationData.value?.data)

const { data: policyData, isLoading: isLoadingPolicy, error: policyError, refetch: refetchPolicy } = useOrganisationPolicy(organisationId)
const policy = computed(() => policyData.value?.data)

const { canManagePolicy } = useCurrentLeaderPermissions(organisationId)
const canEdit = computed(() => canManagePolicy.value)
</script>
