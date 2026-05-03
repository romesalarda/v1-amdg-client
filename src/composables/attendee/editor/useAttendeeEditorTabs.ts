import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface AttendeeEditorTab {
  id: string
  label: string
}

const ATTENDEE_EDITOR_TABS: AttendeeEditorTab[] = [
  { id: 'details', label: 'Details' },
  { id: 'booking', label: 'Booking' },
  { id: 'emergency', label: 'Emergency Contacts' },
  { id: 'consents', label: 'Consents' },
  { id: 'family', label: 'Family & Guardians' },
  { id: 'questions', label: 'Question Answers' },
  { id: 'orders', label: 'Orders' },
  { id: 'actions', label: 'Actions' },
]

export const useAttendeeEditorTabs = () => {
  const route = useRoute()
  const router = useRouter()

  const currentTab = ref((route.query.tab as string) || 'details')

  const changeTab = (tabId: string) => {
    currentTab.value = tabId
    router.replace({ query: { tab: tabId } })
  }

  return {
    currentTab,
    tabs: ATTENDEE_EDITOR_TABS,
    changeTab,
  }
}
