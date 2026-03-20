import { defineStore } from 'pinia'

type EmergencyContactDraft = {
  first_name: string
  last_name: string
  phone_number: string
  relationship?: 'parent' | 'sibling' | 'child' | 'spouse' | 'friend' | 'other'
  email?: string
  primary_contact?: boolean
}

type PersonalInfoItemDraft = {
  id: number
  details?: string | null
  notes?: string | null
}

type MedicalConditionItemDraft = PersonalInfoItemDraft & {
  severity?: 'mild' | 'moderate' | 'severe' | null
}

type PersonalInfoDraft = {
  dietaryRequirements: PersonalInfoItemDraft[]
  medicalConditions: MedicalConditionItemDraft[]
  accessibilityRequirements: PersonalInfoItemDraft[]
  emergencyContact: EmergencyContactDraft | null
  notes?: string
}

type ConsentDraft = {
  consentId: number
  consentGiven: boolean
}

type EventQuestionAnswerDraft = {
  questionId: string
  answerText?: string | null
  selectedOptionIds?: number[]
  uploadResourceId?: number
  uploadUrl?: string
}

type ProductSelectionDraft = {
  packageProductId: number
  variantId: string
  quantity: number
}

type AttendeeDraft = {
  attendeeId?: string
  first_name: string
  last_name: string
  email?: string
  phone_number?: string
  date_of_birth: string
  gender?: string
  relationship_to_user?: 'self' | 'spouse' | 'child' | 'friend' | 'parent' | 'sibling' | 'other'
  area_from?: number | null,
  area_from_name?: string | null,
  questionsComplete?: boolean
  personalInfo: PersonalInfoDraft
  packageId?: number
  consents: ConsentDraft[]
  questionAnswers: EventQuestionAnswerDraft[]
  productSelections?: ProductSelectionDraft[]
}

type RegistrationState = {
  eventId: string | null
  ticketCount: number
  registrarAttending: boolean
  bookingIntentId: string | null
  attendees: AttendeeDraft[]
  currentIndex: number
}

const createEmptyAttendee = (): AttendeeDraft => ({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  gender: '',
  relationship_to_user: undefined,
  area_from: null,
  area_from_name: null,
  questionsComplete: false,
  personalInfo: {
    dietaryRequirements: [],
    medicalConditions: [],
    accessibilityRequirements: [],
    emergencyContact: null,
  },
  consents: [],
  questionAnswers: [],
})

export const useRegistrationStore = defineStore('registration', {
  state: (): RegistrationState => ({
    eventId: null,
    ticketCount: 1,
    registrarAttending: true,
    bookingIntentId: null,
    attendees: [],
    currentIndex: 0,
  }),
  actions: {
    init(eventId: string, ticketCount: number, registrarAttending: boolean) {
      this.eventId = eventId
      this.ticketCount = Math.max(1, Number(ticketCount || 1))
      this.registrarAttending = registrarAttending
      this.currentIndex = 0
      this.attendees = Array.from({ length: this.ticketCount }, () => createEmptyAttendee())
      if (registrarAttending && this.attendees[0]) {
        this.attendees[0].relationship_to_user = 'self'
      }
    },
    reset() {
      this.eventId = null
      this.ticketCount = 1
      this.registrarAttending = true
      this.bookingIntentId = null
      this.attendees = []
      this.currentIndex = 0
    },
    setBookingIntentId(intentId: string) {
      this.bookingIntentId = intentId
    },
    setCurrentIndex(index: number) {
      this.currentIndex = Math.max(0, Math.min(index, this.attendees.length - 1))
    },
    updateAttendeeDraft(index: number, data: Partial<AttendeeDraft>) {
      if (!this.attendees[index]) return
      this.attendees[index] = { ...this.attendees[index], ...data }
    },
    setAttendeeId(index: number, attendeeId: string) {
      this.updateAttendeeDraft(index, { attendeeId })
    },
    setQuestionsComplete(index: number, complete: boolean) {
      this.updateAttendeeDraft(index, { questionsComplete: complete })
    },
    setPersonalInfo(index: number, info: PersonalInfoDraft) {
      this.updateAttendeeDraft(index, { personalInfo: info })
    },
    setAreaFrom(index: number, areaFrom: number | null, areaFromName: string | null) {
      this.updateAttendeeDraft(index, { area_from: areaFrom, area_from_name: areaFromName })
    },
    setPackageId(index: number, packageId: number) {
      this.updateAttendeeDraft(index, { packageId })
    },
    setProductSelections(index: number, selections: ProductSelectionDraft[]) {
      this.updateAttendeeDraft(index, { productSelections: selections })
    },
    setConsents(index: number, consents: ConsentDraft[]) {
      this.updateAttendeeDraft(index, { consents })
    },
    setQuestionAnswers(index: number, answers: EventQuestionAnswerDraft[]) {
      this.updateAttendeeDraft(index, { questionAnswers: answers })
    },
  },
})

export type {
  AttendeeDraft,
  ConsentDraft,
  PersonalInfoDraft,
  EmergencyContactDraft,
  PersonalInfoItemDraft,
  MedicalConditionItemDraft,
  EventQuestionAnswerDraft,
  ProductSelectionDraft,
}
