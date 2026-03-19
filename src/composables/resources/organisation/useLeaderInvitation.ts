import { useDebounceFn } from '@vueuse/core'
import { formatDate } from '~/utils/time'
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationLeaders, useDeleteOrganisationLeader } from '~/composables/resources/organisation/organisationLeaders'
import {
    useOrganisationLeaderInvites,
    useCreateOrganisationLeaderInvite,
    useDeleteOrganisationLeaderInvite,
    useOrganisationLeaderCandidates,
    type LeaderCandidateUser,
} from '~/composables/resources/organisation/organisationLeaderInvites'
import { useLocationCountries } from '~/composables/resources/locations/locationCountries'
import { useLocationClusters } from '~/composables/resources/locations/locationClusters'
import { useLocationChapters } from '~/composables/resources/locations/locationChapters'
import { useLocationAreas } from '~/composables/resources/locations/locationAreas'

type LocationType = 'country' | 'cluster' | 'chapter' | 'area'

export function useLeaderInvitation(organisationId: ComputedRef<number>, leaders: ComputedRef<any[]>, pendingInvites: ComputedRef<any[]>) {
    const { $notyf } = useNuxtApp()

    const locationTypeOptions: Array<{ value: LocationType; label: string }> = [
        { value: 'area', label: 'Area' },
        { value: 'chapter', label: 'Chapter' },
        { value: 'cluster', label: 'Cluster' },
        { value: 'country', label: 'Country' },
    ]

    const selectedLocationType = ref<LocationType>('area')
    const selectedLocationId = ref<number | null>(null)

    const candidateSearchInput = ref('')
    const debouncedCandidateSearch = ref('')
    const updateDebouncedCandidateSearch = useDebounceFn((value: string) => {
        debouncedCandidateSearch.value = value.trim()
    }, 350)

    watch(candidateSearchInput, (value) => {
        updateDebouncedCandidateSearch(value)
    })

    watch(selectedLocationType, () => {
        selectedLocationId.value = null
        candidateSearchInput.value = ''
        debouncedCandidateSearch.value = ''
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

        const areas = areasData.value?.data?.results || []
        return areas.map((area: any) => ({
            id: area.id,
            label: area.area_name || `Area ${area.id}`,
        }))
    })

    const candidateParams = computed(() => {
        if (!selectedLocationId.value || debouncedCandidateSearch.value.length < 2) {
            return undefined
        }

        return {
            organisation: organisationId.value,
            search: debouncedCandidateSearch.value,
            location_type: selectedLocationType.value,
            location_id: selectedLocationId.value,
        }
    })

    const canSearchCandidates = computed(() => !!selectedLocationId.value)

    const {
        data: candidateResponse,
        isLoading: isLoadingCandidates,
        isError: isCandidateError,
    } = useOrganisationLeaderCandidates(candidateParams, computed(() => canSearchCandidates.value && debouncedCandidateSearch.value.length >= 2))

    const candidateUsers = computed<LeaderCandidateUser[]>(() => candidateResponse.value?.normalized?.results || [])

    const { mutate: createInvite } = useCreateOrganisationLeaderInvite()
    const invitingUserId = ref<number | null>(null)

    const hasPendingInviteForCandidate = (userId: number) => {
        return pendingInvites.value.some((invite: any) => invite.target_user === userId)
    }

    const isAlreadyLeader = (userId: number) => {
        return leaders.value.some((leader: any) => leader.user === userId)
    }

    const isAlreadyLeaderForLocation = (userId: number, locationId: number | null) => {
        if (!locationId) {
            return false
        }
        return leaders.value.some((leader: any) => leader.user === userId && leader.location === locationId)
    }

    const inviteLeader = (userId: number) => {
        if (!selectedLocationId.value) {
            $notyf.error('Please select a location before inviting leaders.')
            return
        }

        invitingUserId.value = userId

        createInvite({
            organisation: organisationId.value,
            target_user: userId,
            location_type: selectedLocationType.value,
            location_id: selectedLocationId.value,
        }, {
            onSuccess: () => {
                $notyf.success('Leader invite sent successfully.')
                invitingUserId.value = null
                candidateSearchInput.value = ''
                debouncedCandidateSearch.value = ''
            },
            onError: (error: any) => {
                $notyf.error(error?.body?.error || error?.message || 'Failed to send leader invite.')
                invitingUserId.value = null
            },
        })
    }

    const candidateSearchHelpText = computed(() => {
        if (!selectedLocationId.value) {
            return 'Choose a location before searching candidates.'
        }

        if (isCandidateError.value) {
            return 'Could not load candidates. You may not have permission for this organisation.'
        }

        return 'Candidates come from organisation-eligible users only.'
    })

    return {
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
    }
}
