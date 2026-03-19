<template>
    <div class="p-8" tabindex="0">
        <h2 class="text-xl font-black text-deep-navy uppercase tracking-tight">Invite Leaders</h2>
        <p class="text-sm text-deep-navy/60 mt-2 font-medium">
            Invite eligible members in your organisation to lead a location.
        </p>

        <div class="mt-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="location_type" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
                        Location Type
                    </label>
                    <select
                        id="location_type"
                        v-model="selectedLocationType"
                        class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    >
                        <option v-for="option in locationTypeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div>
                    <label for="location_id" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
                        Location
                    </label>
                    <select
                        id="location_id"
                        v-model.number="selectedLocationId"
                        class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    >
                        <option :value="null">Select a {{ selectedLocationType }}</option>
                        <option v-for="location in selectedLocations" :key="location.id" :value="location.id">
                            {{ location.label }}
                        </option>
                    </select>
                </div>
            </div>

            <div>
                <label for="candidate_search" class="block text-[10px] font-black text-deep-navy/50 mb-3 uppercase tracking-[0.2em]">
                    Search Candidate Users
                </label>
                <input
                    id="candidate_search"
                    v-model="candidateSearchInput"
                    type="text"
                    placeholder="Search by name, username, or email..."
                    :disabled="!selectedLocationId"
                    class="w-full px-4 py-4 bg-white border-2 border-deep-navy rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium disabled:opacity-60"
                />
                <p class="mt-2 text-xs text-deep-navy/50 font-medium">
                    {{ candidateSearchHelpText }}
                </p>
            </div>

            <div v-if="isLoadingCandidates" class="space-y-3">
                <USkeleton class="h-16 w-full" />
                <USkeleton class="h-16 w-full" />
            </div>

            <div v-else-if="candidateUsers.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
                <div
                    v-for="candidate in candidateUsers"
                    :key="candidate.id"
                    class="flex items-center justify-between p-5 bg-white border-2 border-deep-navy/10 rounded-xl"
                >
                    <div>
                        <p class="text-sm font-black text-deep-navy uppercase tracking-tight">
                            {{ candidate.full_name || candidate.username }}
                        </p>
                        <p class="text-xs text-deep-navy/60 font-medium">{{ candidate.email }}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <span
                            v-if="hasPendingInviteForCandidate(candidate.id)"
                            class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white"
                        >
                            Invited
                        </span>
                        <span
                            v-else-if="isAlreadyLeaderForLocation(candidate.id, selectedLocationId)"
                            class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-600 text-white"
                        >
                            Leader
                        </span>
                        <button
                            v-else
                            :disabled="invitingUserId === candidate.id || !selectedLocationId"
                            @click="inviteLeader(candidate.id)"
                            class="px-5 py-2 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {{ invitingUserId === candidate.id ? 'Inviting...' : 'Invite Leader' }}
                        </button>
                    </div>
                </div>
            </div>

            <div
                v-else-if="canSearchCandidates && debouncedCandidateSearch.length >= 2"
                class="text-center py-10 bg-deep-navy/5 border-2 border-dashed border-deep-navy/20 rounded-xl"
            >
                <p class="text-sm font-bold text-deep-navy/60">No eligible candidates found</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLeaderInvitation } from '~/composables/resources/organisation/useLeaderInvitation'

const props = defineProps<{
    organisationId: number
    leaders: any[]
    pendingInvites: any[]
}>()

const {
    locationTypeOptions,
    selectedLocationType,
    selectedLocationId,
    candidateSearchInput,
    debouncedCandidateSearch,
    selectedLocations,
    isLoadingCandidates,
    candidateUsers,
    canSearchCandidates,
    candidateSearchHelpText,
    invitingUserId,
    hasPendingInviteForCandidate,
    isAlreadyLeader,
    isAlreadyLeaderForLocation,
    inviteLeader,
} = useLeaderInvitation(computed(() => props.organisationId), computed(() => props.leaders), computed(() => props.pendingInvites))
</script>
