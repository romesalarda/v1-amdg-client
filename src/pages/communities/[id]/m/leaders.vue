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
                            <div class="px-8 py-6 border-b-2 border-deep-navy/10">
                                <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Current Leaders</h2>
                                <p class="text-sm text-deep-navy/60 mt-2 font-medium">Active leader assignments in this organisation</p>
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
            <InviteLeaderModal :organisation-id="organisationId" :leaders="leaders" :pending-invites="pendingInvites" />
        </UModal>
    </CommunitiesManagementLayout>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/time'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationLeaders, useDeleteOrganisationLeader } from '~/composables/resources/organisation/organisationLeaders'
import {
    useOrganisationLeaderInvites,
    useDeleteOrganisationLeaderInvite,
} from '~/composables/resources/organisation/organisationLeaderInvites'
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

const organisationId = computed(() => Number(route.params.id))

const { data: organisationData } = useOrganisation(organisationId)
const organisation = computed(() => organisationData.value?.data)

const isInviteModalOpen = ref(false)
const showInviteHistory = ref(false)

const { data: leadersData, isLoading: isLoadingLeaders } = useOrganisationLeaders(computed(() => ({
    organisation: organisationId.value,
    page_size: 200,
})))

const leaders = computed(() => leadersData.value?.data?.results || [])

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

    const leaderHistory = leaders.value.map((leader: any) => ({
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