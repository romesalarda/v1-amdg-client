import { computed, ref, type Ref } from 'vue'
import { useToast } from '#ui/composables/useToast'
import { useAttendeeActions } from '~/composables/resources/attendee/attendeeActions'

export const useAttendeeActionsHistoryEditor = (
  attendeeId: Ref<string>,
  attendeeData: Ref<any>,
  eventData: Ref<any>,
) => {
  const toast = useToast()

  const attendeeActions = useAttendeeActions(computed(() => ({ attendee: attendeeId.value })))
  const actionTypeFilter = ref<string>('')
  const actionDateStart = ref<string>('')
  const actionDateEnd = ref<string>('')

  const filteredActions = computed(() => {
    let actions = attendeeActions.data.value?.data?.results || []

    if (actionTypeFilter.value) {
      actions = actions.filter((a: any) => a.action === actionTypeFilter.value)
    }
    if (actionDateStart.value) {
      actions = actions.filter((a: any) => new Date(a.performed_at) >= new Date(actionDateStart.value))
    }
    if (actionDateEnd.value) {
      actions = actions.filter((a: any) => new Date(a.performed_at) <= new Date(actionDateEnd.value))
    }

    return actions
  })

  const exportActionsToCSV = () => {
    const actions = filteredActions.value
    if (!actions.length) {
      toast.add({ title: 'Error', description: 'No actions to export', color: 'red' })
      return
    }

    const headers = ['Action', 'Attendee ID', 'Attendee Name', 'Event Title', 'Performed By', 'Performed At', 'Notes']
    const rows = actions.map((action: any) => [
      action.action_display || action.action,
      attendeeData.value?.attendee_display_id || '',
      attendeeData.value?.full_name || '',
      eventData.value?.title || '',
      action.performed_by_name || 'System',
      new Date(action.performed_at).toLocaleString(),
      action.notes || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendee-actions-${attendeeId.value}-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return {
    attendeeActions,
    actionTypeFilter,
    actionDateStart,
    actionDateEnd,
    filteredActions,
    exportActionsToCSV,
  }
}