import type {
  CheckoutRequest,
  AttendeeCheckoutRequest,
  AttendeeDraftRequest,
  AttendeePersonalInfoDraftRequest,
  AttendeeConsentDraftRequest,
  EventQuestionAnswerDraftRequest,
  PersonalInfoItemRequest,
  MedicalConditionItemRequest,
  ProductSelectionRequest,
} from '~/api/types.gen'
import type {
  AttendeeDraft,
  PersonalInfoDraft,
  PersonalInfoItemDraft,
  MedicalConditionItemDraft,
  ConsentDraft,
  EventQuestionAnswerDraft,
  ProductSelectionDraft,
} from '~/stores/registration'

const buildPersonalInfoItem = (item: PersonalInfoItemDraft): PersonalInfoItemRequest => ({
  id: item.id,
  details: item.details ?? null,
  notes: item.notes ?? null,
})

const buildMedicalConditionItem = (item: MedicalConditionItemDraft): MedicalConditionItemRequest => ({
  id: item.id,
  details: item.details ?? null,
  notes: item.notes ?? null,
  severity: item.severity ?? null,
})

const buildPersonalInfo = (info: PersonalInfoDraft | undefined): AttendeePersonalInfoDraftRequest | undefined => {
  if (!info) return undefined

  return {
    dietary_requirements: info.dietaryRequirements.map(buildPersonalInfoItem),
    medical_conditions: info.medicalConditions.map(buildMedicalConditionItem),
    accessibility_requirements: info.accessibilityRequirements.map(buildPersonalInfoItem),
    emergency_contact: info.emergencyContact
      ? {
          first_name: info.emergencyContact.first_name,
          last_name: info.emergencyContact.last_name,
          relationship: info.emergencyContact.relationship ?? 'other',
          phone_number: info.emergencyContact.phone_number,
          email: info.emergencyContact.email ?? null,
          primary_contact: info.emergencyContact.primary_contact ?? true,
        }
      : undefined,
  }
}

const buildConsents = (consents: ConsentDraft[]): AttendeeConsentDraftRequest[] =>
  consents.map((consent) => ({
    consent_id: consent.consentId,
    consent_given: consent.consentGiven,
  }))

const hasQuestionAnswerContent = (answer: EventQuestionAnswerDraft): boolean => {
  if (typeof answer.answerText === 'string' && answer.answerText.trim().length > 0) return true
  if (typeof answer.answerText === 'number') return true
  if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) return true
  if (answer.uploadResourceId) return true
  if (answer.uploadUrl) return true
  return false
}

const buildQuestionAnswers = (answers: EventQuestionAnswerDraft[]): EventQuestionAnswerDraftRequest[] =>
  answers
    .filter((answer) => hasQuestionAnswerContent(answer))
    .map((answer) => ({
      question_id: answer.questionId,
      answer_text: typeof answer.answerText === 'number' ? String(answer.answerText) : (answer.answerText ?? null),
      selected_option_ids: answer.selectedOptionIds,
      upload_resource_id: answer.uploadResourceId,
      upload_url: answer.uploadUrl,
    }))

const buildProductSelections = (selections: ProductSelectionDraft[] | undefined): ProductSelectionRequest[] | undefined => {
  if (!selections || selections.length === 0) return undefined

  return selections.map((selection) => ({
    package_product_id: selection.packageProductId,
    variant_id: selection.variantId,
    quantity: selection.quantity,
  }))
}

const buildAttendeeDraft = (attendee: AttendeeDraft): AttendeeDraftRequest => ({
  first_name: attendee.first_name,
  last_name: attendee.last_name,
  email: attendee.email ?? null,
  phone_number: attendee.phone_number ?? null,
  date_of_birth: attendee.date_of_birth,
  gender: attendee.gender ?? null,
  relationship_to_user: attendee.relationship_to_user ?? 'other',
  area_from: attendee.area_from ?? null,
  personal_info: buildPersonalInfo(attendee.personalInfo),
  consents: attendee.consents.length ? buildConsents(attendee.consents) : undefined,
  question_answers: attendee.questionAnswers.length ? buildQuestionAnswers(attendee.questionAnswers) : undefined,
})

const buildAttendeeCheckout = (attendee: AttendeeDraft): AttendeeCheckoutRequest => ({
  attendee: buildAttendeeDraft(attendee),
  package_id: attendee.packageId as number,
  product_selections: buildProductSelections(attendee.productSelections),
})

export const buildCheckoutPayload = (params: {
  bookingIntentId: string
  paymentMethodId: number
  attendees: AttendeeDraft[]
  stripePaymentIntentId?: string
}): CheckoutRequest => ({
  booking_intent_id: params.bookingIntentId,
  payment_method_id: params.paymentMethodId,
  stripe_payment_intent_id: params.stripePaymentIntentId,
  attendees: params.attendees.map(buildAttendeeCheckout),
})

export const createIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
