import type { Ref } from 'vue'
import {
  useCreateBookingTicketType,
  usePartialUpdateBookingTicketType,
  useDeleteBookingTicketType,
} from '~/composables/resources/booking/bookingTicketTypes'
import Swal from 'sweetalert2'

export function useTicketTypeManagement(
  eventId: Ref<string>,
  event: Ref<any>,
  ticketTypes: Ref<any[]>,
  refetchTicketTypes: () => void,
  refetchPackages: () => void,
) {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const showTicketTypeModal = ref(false)
  const editingTicketType = ref<any>(null)
  const isManualModalOpen = ref(false)

  const createTicketTypeMutation = useCreateBookingTicketType()
  const updateTicketTypeMutation = usePartialUpdateBookingTicketType()
  const deleteTicketTypeMutation = useDeleteBookingTicketType()

  const openTicketTypeModal = (ticketType?: any) => {
    editingTicketType.value = ticketType || null
    showTicketTypeModal.value = true

    if (ticketType?.id) {
      isManualModalOpen.value = true
      router.replace({ query: { ...route.query, 'ticket-id': ticketType.id.toString() } })
    }
  }

  const closeTicketTypeModal = () => {
    showTicketTypeModal.value = false
    editingTicketType.value = null

    if (route.query['ticket-id']) {
      router.replace({ query: { ...route.query, 'ticket-id': undefined } })
    }
    isManualModalOpen.value = false
  }

  const handleTicketTypeSubmit = async (data: any) => {
    try {
      if (editingTicketType.value) {
        await updateTicketTypeMutation.mutateAsync({
          ticketTypeId: editingTicketType.value.id,
          body: {
            ...data,
            event: event.value?.data?.id,
          },
        })
        toast.add({ title: 'Ticket type updated', color: 'green' })
      } else {
        await createTicketTypeMutation.mutateAsync({
          ...data,
          event: event.value?.data?.id,
        })
        toast.add({ title: 'Ticket type created', color: 'green' })
      }

      closeTicketTypeModal()
      refetchTicketTypes()
    } catch (error) {
      toast.add({
        title: editingTicketType.value ? 'Failed to update ticket type' : 'Failed to create ticket type',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
      })
    }
  }

  const toggleTicketTypeStatus = async (ticketTypeId: number, isActive: boolean) => {
    try {
      await updateTicketTypeMutation.mutateAsync({
        ticketTypeId,
        body: { is_active: isActive },
      })
      toast.add({ title: 'Status updated', color: 'green' })
      refetchTicketTypes()
    } catch (error) {
      toast.add({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'An error occurred',
        color: 'red',
      })
    }
  }

  const removeTicketType = async (ticketTypeId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will remove the ticket type and all associated references.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteTicketTypeMutation.mutateAsync(ticketTypeId)
          toast.add({ title: 'Ticket type removed', color: 'green' })
          refetchTicketTypes()
          refetchPackages()
        } catch (error) {
          toast.add({
            title: 'Failed to remove ticket type',
            description: error instanceof Error ? error.message : 'An error occurred',
            color: 'red',
          })
        }
      }
    })
  }

  // URL param watcher — opens modal when ?ticket-id= is present on load
  watch(
    () => ({
      ticketId: route.query['ticket-id'],
      ticketsLoaded: ticketTypes.value.length > 0,
    }),
    ({ ticketId, ticketsLoaded }) => {
      if (isManualModalOpen.value) {
        isManualModalOpen.value = false
        return
      }
      if (ticketId && ticketsLoaded && !showTicketTypeModal.value) {
        const tktId = parseInt(ticketId as string, 10)
        if (!isNaN(tktId)) {
          const ticket = ticketTypes.value.find(t => t.id === tktId)
          if (ticket) openTicketTypeModal(ticket)
        }
      }
    },
  )

  return {
    showTicketTypeModal,
    editingTicketType,
    openTicketTypeModal,
    closeTicketTypeModal,
    handleTicketTypeSubmit,
    toggleTicketTypeStatus,
    removeTicketType,
  }
}
