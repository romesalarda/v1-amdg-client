<template>
    <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <h1 class="text-3xl font-black text-deep-navy uppercase tracking-tight">Manage Leaders</h1>
                <button @click="isInviteModalOpen = true" class="px-6 py-3 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all">
                    Invite Leader
                </button>
            </div>

            <UTabs :items="tabItems" class="w-full">
                <template #item="{ item }">
                    <div v-if="item.key === 'pending-invites'" class="mt-8">
                        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
                            <div class="px-8 py-6 border-b-2 border-deep-navy/10 flex items-center justify-between gap-3">
                                <div>
                                    <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Pending Leader Invites</h2>
                                    <p class="text-sm text-deep-navy/60 mt-2 font-medium">Outstanding invitations for location leadership</p>
                                </div>
                                <label class="text-xs font-bold text-deep-navy/60 flex items-center gap-2">
                                    <input v-model="showInviteHistory" type="checkbox" class="rounded border-deep-navy/40" />
                                    Show full invite history
                                </label>
                            </div>

                            <div v-if="isLoadingInvites" class="p-8 space-y-3">
                                <USkeleton class="h-16 w-full" />
                                <USkeleton class="h-16 w-full" />
                            </div>

                            <div v-else-if="displayInvites.length > 0" class="divide-y-2 divide-deep-navy/5">
                                <div v-for="invite in displayInvites" :key="invite.id" class="px-8 py-6 flex items-center justify-between gap-6">
                                    <div>
                                        <p class="text-sm font-black text-deep-navy uppercase tracking-tight">
                                            {{ invite.target_user_name || 'Unknown User' }}
                                        </p>
                                        <p class="text-xs text-deep-navy/60 font-medium mt-0.5">{{ invite.target_user_email || 'No email provided' }}</p>
                                        <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-2">
                                            {{ invite.location_type }} #{{ invite.location_id }} · {{ invite.location_name }}
                                        </p>
                                        <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-1">
                                            Sent {{ formatDate(invite.added_at) }}
                                        </p>
                                    </div>

                                    <div class="flex items-center gap-3">
                                        <span :class="inviteStatusClass(invite)" class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            {{ inviteStatusLabel(invite) }}
                                        </span>
                                        <button
                                            v-if="!invite.accepted && invite.is_active"
                                            :disabled="removingInviteId === invite.id"
                                            @click="cancelInvite(invite.id)"
                                            class="px-5 py-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                                        >
                                            {{ removingInviteId === invite.id ? 'Cancelling...' : 'Cancel' }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="px-8 py-12 text-center">
                                <p class="text-sm font-bold text-deep-navy/60">No leader invites found</p>
                            </div>
                        </div>
                    </div>

                    <div v-if="item.key === 'current-leaders'" class="mt-8">
                        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
                            <div class="px-8 py-6 border-b-2 border-deep-navy/10 space-y-6">
                                <div>
                                    <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Current Leaders</h2>
                                    <p class="text-sm text-deep-navy/60 mt-2 font-medium">Active leader assignments in this organisation</p>
                                </div>

                                <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">
                                            Location Type
                                        </label>
                                        <select
                                            v-model="selectedLocationType"
                                            class="w-full px-4 py-3 border-2 border-deep-navy/20 rounded-xl text-xs font-black uppercase tracking-wider text-deep-navy bg-white"
                                        >
                                            <option v-for="option in locationTypeOptions" :key="option.value" :value="option.value">
                                                {{ option.label }}
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">
                                            Location
                                        </label>
                                        <select
                                            v-model="selectedLocationId"
                                            class="w-full px-4 py-3 border-2 border-deep-navy/20 rounded-xl text-xs font-black uppercase tracking-wider text-deep-navy bg-white"
                                            :disabled="selectedLocations.length === 0"
                                        >
                                            <option :value="null">All Locations</option>
                                            <option v-for="location in selectedLocations" :key="location.id" :value="location.id">
                                                {{ location.label }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="lg:col-span-2">
                                        <label class="block text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.2em]">
                                            Search Leaders
                                        </label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg class="h-4 w-4 text-deep-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                v-model="leaderSearchInput"
                                                type="text"
                                                placeholder="Search by name or email..."
                                                class="w-full pl-10 pr-4 py-3 border-2 bg-white border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div v-if="isLeaderFilteringActive" class="flex items-center justify-between">
                                    <p class="text-xs text-deep-navy/50 font-medium">
                                        Filters are active. Showing {{ leadersTotalCount }} matching leaders.
                                    </p>
                                    <button
                                        class="px-4 py-2 border-2 border-deep-navy/30 text-deep-navy rounded-xl font-black text-xs uppercase tracking-wider hover:bg-deep-navy/5 transition-all"
                                        @click="resetLeaderFilters"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <div v-if="isLoadingLeaders" class="p-8 space-y-3">
                                <USkeleton class="h-16 w-full" />
                                <USkeleton class="h-16 w-full" />
                            </div>

                            <div v-else-if="leaders.length > 0" class="divide-y-2 divide-deep-navy/5">
                                <div v-for="leader in leaders" :key="leader.id" class="px-8 py-6 flex items-center justify-between gap-6">
                                    <div>
                                        <p class="text-sm font-black text-deep-navy uppercase tracking-tight">{{ leader.user_name }}</p>
                                        <p class="text-xs text-deep-navy/60 font-medium mt-0.5">{{ leader.user_email }}</p>
                                        <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-2">
                                            {{ leader.location_type }} #{{ leader.location_id }} · {{ leader.location_name }}
                                        </p>
                                        <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-1">
                                            Added {{ formatDate(leader.added_at) }}
                                        </p>
                                    </div>

                                    <button
                                        :disabled="removingLeaderId === leader.id"
                                        @click="removeLeader(leader.id)"
                                        class="px-5 py-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                                    >
                                        {{ removingLeaderId === leader.id ? 'Removing...' : 'Remove' }}
                                    </button>
                                </div>
                            </div>

                            <div v-else class="px-8 py-12 text-center">
                                <p class="text-sm font-bold text-deep-navy/60">No leaders assigned yet</p>
                            </div>

                            <div v-if="!isLoadingLeaders && leadersTotalCount > 0" class="px-6 py-4 border-t border-deep-navy/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div class="flex items-center gap-3">
                                    <select
                                        v-model="leadersPageSize"
                                        class="px-3 py-1.5 border-2 border-deep-navy/20 rounded-lg text-xs font-black uppercase tracking-wider text-deep-navy"
                                    >
                                        <option :value="10">10 per page</option>
                                        <option :value="25">25 per page</option>
                                        <option :value="50">50 per page</option>
                                        <option :value="100">100 per page</option>
                                    </select>
                                    <span class="text-xs text-deep-navy/60 font-medium">
                                        Showing {{ leadersFrom }} to {{ leadersTo }} of {{ leadersTotalCount }}
                                    </span>
                                </div>
                                <UPagination v-model="leadersPage" :page-count="leadersPageSize" :total="leadersTotalCount" :max="7" />
                            </div>
                        </div>
                    </div>

                    <div v-if="item.key === 'history'" class="mt-8">
                        <div class="bg-white border-2 border-deep-navy rounded-xl shadow-drawn">
                            <div class="px-8 py-6 border-b-2 border-deep-navy/10">
                                <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Operational History</h2>
                                <p class="text-sm text-deep-navy/60 mt-2 font-medium">
                                    Combined invite lifecycle and active leader assignment snapshot.
                                </p>
                            </div>

                            <div v-if="historyItems.length > 0" class="divide-y-2 divide-deep-navy/5">
                                <div v-for="item in historyItems" :key="item.key" class="px-8 py-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p class="text-xs font-black uppercase tracking-wider text-deep-navy/70">{{ item.title }}</p>
                                        <p class="text-sm font-bold text-deep-navy mt-1">{{ item.subtitle }}</p>
                                        <p class="text-[10px] text-deep-navy/50 font-bold uppercase tracking-wider mt-2">
                                            {{ item.meta }}
                                        </p>
                                    </div>
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                                        :class="item.badgeClass"
                                    >
                                        {{ item.badgeLabel }}
                                    </span>
                                </div>
                            </div>

                            <div v-else class="px-8 py-12 text-center">
                                <p class="text-sm font-bold text-deep-navy/60">No history entries yet</p>
                            </div>
                        </div>
                    </div>
                </template>
            </UTabs>
        </div>

        <UModal v-model="isInviteModalOpen" prevent-focus>
            <InviteLeaderModal :organisation-id="organisationNumericId" :leaders="leadersSnapshot" :pending-invites="pendingInvites" />
        </UModal>
    </CommunitiesManagementLayout>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { formatDate } from '~/utils/time'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationLeaders, useDeleteOrganisationLeader } from '~/composables/resources/organisation/organisationLeaders'
import {
    useOrganisationLeaderInvites,
    useDeleteOrganisationLeaderInvite,
} from '~/composables/resources/organisation/organisationLeaderInvites'
import { useLocationCountries } from '~/composables/resources/locations/locationCountries'
import { useLocationClusters } from '~/composables/resources/locations/locationClusters'
import { useLocationChapters } from '~/composables/resources/locations/locationChapters'
import { useLocationAreas } from '~/composables/resources/locations/locationAreas'
import InviteLeaderModal from '~/components/communities/InviteLeaderModal.vue'

definePageMeta({
    middleware: ['auth', 'organisation-controller'],
    layout: 'default',
})

useHead({
    title: 'Manage Leaders',
})

const route = useRoute()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => route.params.id as string)

const { data: organisationData } = useOrganisation(organisationId)
const organisation = computed(() => organisationData.value?.data)
const organisationNumericId = computed(() => organisation.value?.id || 0)

const isInviteModalOpen = ref(false)
const showInviteHistory = ref(false)

type LocationType = 'all' | 'country' | 'cluster' | 'chapter' | 'area'

const locationTypeOptions: Array<{ value: LocationType; label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: 'area', label: 'Area' },
    { value: 'chapter', label: 'Chapter' },
    { value: 'cluster', label: 'Cluster' },
    { value: 'country', label: 'Country' },
]

const selectedLocationType = ref<LocationType>('all')
const selectedLocationId = ref<number | null>(null)

const leaderSearchInput = ref('')
const debouncedLeaderSearch = ref('')
const updateLeaderSearch = useDebounceFn((value: string) => {
    debouncedLeaderSearch.value = value.trim()
}, 350)

watch(leaderSearchInput, (value) => {
    updateLeaderSearch(value)
})

const { data: countriesData } = useLocationCountries(computed(() => ({ page_size: 300 })))
const { data: clustersData } = useLocationClusters(computed(() => ({ page_size: 300 })))
const { data: chaptersData } = useLocationChapters(computed(() => ({ page_size: 300 })))
const { data: areasData } = useLocationAreas(computed(() => ({ page_size: 300 })))

const selectedLocations = computed(() => {
    if (selectedLocationType.value === 'country') {
        const countries = countriesData.value?.data?.results || []
        return countries.map((country: any) => ({
            id: country.id,
            label: country.country_name || country.country || `Country ${country.id}`,
        }))
    }

    if (selectedLocationType.value === 'cluster') {
        const clusters = clustersData.value?.data?.results || []
        return clusters.map((cluster: any) => ({
            id: cluster.id,
            label: cluster.cluster_name || `Cluster ${cluster.id}`,
        }))
    }

    if (selectedLocationType.value === 'chapter') {
        const chapters = chaptersData.value?.data?.results || []
        return chapters.map((chapter: any) => ({
            id: chapter.id,
            label: chapter.chapter_name || `Chapter ${chapter.id}`,
        }))
    }

    if (selectedLocationType.value === 'area') {
        const areas = areasData.value?.data?.results || []
        return areas.map((area: any) => ({
            id: area.id,
            label: area.area_name || `Area ${area.id}`,
        }))
    }

    return []
})

const leadersPage = ref(1)
const leadersPageSize = ref(10)

watch(selectedLocationType, () => {
    selectedLocationId.value = null
    leadersPage.value = 1
})

watch([selectedLocationId, debouncedLeaderSearch], () => {
    leadersPage.value = 1
})

watch(leadersPageSize, () => {
    leadersPage.value = 1
})

const leadersQuery = computed(() => {
    const query: Record<string, any> = {
        organisation: organisationId.value,
        page: leadersPage.value,
        page_size: leadersPageSize.value,
    }

    if (selectedLocationType.value !== 'all') {
        query.location_type = selectedLocationType.value
    }

    if (selectedLocationId.value) {
        query.location_id = selectedLocationId.value
    }

    if (debouncedLeaderSearch.value.length >= 2) {
        query.search = debouncedLeaderSearch.value
    }

    return query
})

const { data: leadersData, isLoading: isLoadingLeaders } = useOrganisationLeaders(leadersQuery)

const leaders = computed(() => leadersData.value?.data?.results || [])
const leadersTotalCount = computed(() => leadersData.value?.data?.count || 0)
const leadersFrom = computed(() => leadersTotalCount.value === 0 ? 0 : (leadersPage.value - 1) * leadersPageSize.value + 1)
const leadersTo = computed(() => Math.min(leadersPage.value * leadersPageSize.value, leadersTotalCount.value))

const { data: leadersSnapshotData } = useOrganisationLeaders(computed(() => ({
    organisation: organisationId.value,
    page_size: 200,
})))

const leadersSnapshot = computed(() => leadersSnapshotData.value?.data?.results || [])

const isLeaderFilteringActive = computed(() => {
    return selectedLocationType.value !== 'all'
        || !!selectedLocationId.value
        || debouncedLeaderSearch.value.length >= 2
})

const resetLeaderFilters = () => {
    selectedLocationType.value = 'all'
    selectedLocationId.value = null
    leaderSearchInput.value = ''
    debouncedLeaderSearch.value = ''
    leadersPage.value = 1
}

const { data: invitesData, isLoading: isLoadingInvites } = useOrganisationLeaderInvites(computed(() => ({
    organisation: organisationId.value,
    page_size: 200,
})))

const allInvites = computed(() => invitesData.value?.data?.results || [])
const pendingInvites = computed(() => allInvites.value.filter((invite: any) => !invite.accepted && invite.is_valid && invite.is_active))
const displayInvites = computed(() => showInviteHistory.value ? allInvites.value : pendingInvites.value)

const { mutate: deleteInvite } = useDeleteOrganisationLeaderInvite()
const { mutate: deleteLeader } = useDeleteOrganisationLeader()

const removingInviteId = ref<string | null>(null)
const removingLeaderId = ref<number | null>(null)

const cancelInvite = (inviteId: string) => {
    if (!confirm('Cancel this leader invite?')) {
        return
    }

    removingInviteId.value = inviteId

    deleteInvite(inviteId, {
        onSuccess: () => {
            $notyf.success('Leader invite cancelled.')
            removingInviteId.value = null
        },
        onError: (error: any) => {
            $notyf.error(error?.body?.error || error?.message || 'Failed to cancel invite.')
            removingInviteId.value = null
        },
    })
}

const removeLeader = (leaderId: number) => {
    if (!confirm('Remove this leader assignment?')) {
        return
    }

    removingLeaderId.value = leaderId

    deleteLeader(leaderId, {
        onSuccess: () => {
            $notyf.success('Leader removed successfully.')
            removingLeaderId.value = null
        },
        onError: (error: any) => {
            $notyf.error(error?.body?.error || error?.message || 'Failed to remove leader.')
            removingLeaderId.value = null
        },
    })
}

const inviteStatusLabel = (invite: any) => {
    if (invite.accepted) return 'Accepted'
    if (!invite.is_active) return 'Inactive'
    if (!invite.is_valid) return 'Expired'
    return 'Pending'
}

const inviteStatusClass = (invite: any) => {
    if (invite.accepted) return 'bg-green-600 text-white'
    if (!invite.is_active) return 'bg-gray-500 text-white'
    if (!invite.is_valid) return 'bg-red-600 text-white'
    return 'bg-blue-600 text-white'
}

const historyItems = computed(() => {
    const inviteHistory = allInvites.value.map((invite: any) => {
        const eventDate = invite.accepted ? invite.accepted_at : invite.added_at
        return {
            key: `invite-${invite.id}`,
            date: eventDate || invite.added_at,
            title: 'Leader Invite',
            subtitle: `${invite.target_user_name || 'Unknown user'} · ${invite.location_name}`,
            meta: `${invite.location_type} #${invite.location_id} · ${formatDate(eventDate || invite.added_at)}`,
            badgeLabel: inviteStatusLabel(invite),
            badgeClass: inviteStatusClass(invite),
        }
    })

    const leaderHistory = leadersSnapshot.value.map((leader: any) => ({
        key: `leader-${leader.id}`,
        date: leader.added_at,
        title: 'Leader Assignment',
        subtitle: `${leader.user_name} · ${leader.location_name}`,
        meta: `${leader.location_type} #${leader.location_id} · ${formatDate(leader.added_at)}`,
        badgeLabel: 'Active Leader',
        badgeClass: 'bg-green-600 text-white',
    }))

    return [...inviteHistory, ...leaderHistory].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
})

const tabItems = [
    {
        key: 'pending-invites',
        label: 'Pending Invites',
    },
    {
        key: 'current-leaders',
        label: 'Current Leaders',
    },
    {
        key: 'history',
        label: 'History',
    },
]
</script>
