import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import {
  useAcceptOrganisationSponsorInviteByToken,
  useDeclineOrganisationSponsorInviteByToken,
  useOrganisationSponsorInvites,
} from '~/composables/resources/organisation/organisationSponsorInvites'
import { extractApiErrorMessage } from '~/utils/errors'

export type InviteItem = {
  invite_id: string
  event_name?: string
  email: string
  token: string
  accepted: boolean
  declined: boolean
  is_valid: boolean
  sent_at?: string
  responded_at?: string | null
}

export function useSponsorInvites(
  selectedEventId: Ref<string> | ComputedRef<string>,
) {
  const { $notyf } = useNuxtApp()

  const { data: invitesResponse, isLoading: isLoadingInvites } = useOrganisationSponsorInvites(computed(() => {
    if (!selectedEventId.value) return undefined
    return { event_id: selectedEventId.value, page_size: 100 }
  }))

  const eventInvites = computed<InviteItem[]>(() => invitesResponse.value?.invites as InviteItem[] || [])
  const pendingInvites = computed(() => eventInvites.value.filter(i => i.is_valid && !i.accepted && !i.declined))
  const acceptedInvites = computed(() => eventInvites.value.filter(i => i.accepted))

  const acceptInviteMutation = useAcceptOrganisationSponsorInviteByToken()
  const declineInviteMutation = useDeclineOrganisationSponsorInviteByToken()

  const isAcceptingToken = computed(() => acceptInviteMutation.isPending.value)
  const isDecliningToken = computed(() => declineInviteMutation.isPending.value)

  async function acceptInviteToken(token: string) {
    try {
      await acceptInviteMutation.mutateAsync(token)
      $notyf.success('Invite marked as accepted.')
    } catch (error) {
      $notyf.error(extractApiErrorMessage(error, 'Failed to accept invite.'))
    }
  }

  async function declineInviteToken(token: string) {
    try {
      await declineInviteMutation.mutateAsync(token)
      $notyf.success('Invite marked as declined.')
    } catch (error) {
      $notyf.error(extractApiErrorMessage(error, 'Failed to decline invite.'))
    }
  }

  function inviteBadgeLabel(invite: InviteItem): string {
    if (invite.accepted) return 'Accepted'
    if (invite.declined) return 'Declined'
    if (!invite.is_valid) return 'Expired'
    return 'Pending'
  }

  function inviteBadgeClass(invite: InviteItem): string {
    if (invite.accepted) return 'bg-green-600 text-white'
    if (invite.declined) return 'bg-red-600 text-white'
    if (!invite.is_valid) return 'bg-gray-500 text-white'
    return 'bg-blue-600 text-white'
  }

  return {
    isLoadingInvites,
    eventInvites,
    pendingInvites,
    acceptedInvites,
    isAcceptingToken,
    isDecliningToken,
    acceptInviteToken,
    declineInviteToken,
    inviteBadgeLabel,
    inviteBadgeClass,
  }
}
