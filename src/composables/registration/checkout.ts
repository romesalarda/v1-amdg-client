import type {
  CheckoutRequest,
  CheckoutPreviewRequest,
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

export type BankTransferEvidenceInput = {
  transfer_id?: string
  evidence_file: File | Blob
  payer_name?: string
  payer_account_last4?: string
  amount_on_evidence?: string | number
}

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
  if (answer.uploadFile) return true
  return false
}

const buildQuestionAnswers = (answers: EventQuestionAnswerDraft[]): EventQuestionAnswerDraftRequest[] =>
  answers
    .filter((answer) => hasQuestionAnswerContent(answer))
    .map((answer) => {
      const payload: EventQuestionAnswerDraftRequest & { upload_file_key?: string } = {
        question_id: answer.questionId,
        answer_text: typeof answer.answerText === 'number' ? String(answer.answerText) : (answer.answerText ?? null),
        selected_option_ids: answer.selectedOptionIds,
        upload_resource_id: answer.uploadResourceId,
        upload_url: answer.uploadUrl,
      }

      // Preview and JSON validation paths need a non-empty upload marker
      // when a local file is attached but not uploaded yet.
      if (answer.uploadFile && !answer.uploadResourceId && !answer.uploadUrl) {
        payload.upload_file_key = '__multipart_pending__'
      }

      return payload
    })

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
  area_from: attendee.area_from ?? 0,
  personal_info: buildPersonalInfo(attendee.personalInfo),
  consents: attendee.consents.length ? buildConsents(attendee.consents) : undefined,
  question_answers: attendee.questionAnswers.length ? buildQuestionAnswers(attendee.questionAnswers) : undefined,
})

const resolveAttendeePackageId = (attendee: AttendeeDraft): number => {
  const legacyValue = (attendee as unknown as { package_id?: number | string | null }).package_id
  const candidate = attendee.packageId ?? legacyValue
  const parsed = Number(candidate)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    const attendeeName = [attendee.first_name, attendee.last_name].filter(Boolean).join(' ').trim() || 'Unknown attendee'
    throw new Error(`Package is required for ${attendeeName}.`)
  }

  return parsed
}

const buildAttendeeCheckout = (attendee: AttendeeDraft): AttendeeCheckoutRequest => ({
  attendee: buildAttendeeDraft(attendee),
  package_id: resolveAttendeePackageId(attendee),
  product_selections: buildProductSelections(attendee.productSelections),
})

export const buildCheckoutPayload = (params: {
  bookingIntentId: string
  paymentMethodId: number
  attendees: AttendeeDraft[]
  paymentId?: string
  stripePaymentIntentId?: string
  bankTransferEvidenceId?: string
}): CheckoutRequest => ({
  booking_intent_id: params.bookingIntentId,
  payment_method_id: params.paymentMethodId,
  payment_id: params.paymentId,
  stripe_payment_intent_id: params.stripePaymentIntentId,
  bank_transfer_evidence_id: params.bankTransferEvidenceId,
  attendees: params.attendees.map(buildAttendeeCheckout),
})

const appendFormDataValue = (formData: FormData, key: string, value: unknown): void => {
  if (value === undefined || value === null) return

  if (value instanceof Blob) {
    formData.append(key, value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormDataValue(formData, `${key}[${index}]`, item)
    })
    return
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
      appendFormDataValue(formData, `${key}[${childKey}]`, childValue)
    })
    return
  }

  formData.append(key, String(value))
}

export const toMultipartFormData = (payload: Record<string, unknown>): FormData => {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    appendFormDataValue(formData, key, value)
  })
  return formData
}

export const buildCheckoutMultipartPayload = (params: {
  bookingIntentId: string
  paymentMethodId: number
  attendees: AttendeeDraft[]
  paymentId?: string
  bankTransferEvidenceId?: string
  stripePaymentIntentId?: string
  bankTransferEvidence?: BankTransferEvidenceInput
}): FormData => {
  const formData = new FormData()
  const attendeesPayload = params.attendees.map(buildAttendeeCheckout)

  params.attendees.forEach((attendee, attendeeIndex) => {
    attendee.questionAnswers.forEach((answer, answerIndex) => {
      if (!answer.uploadFile) return

      const uploadKey = `question_uploads[${attendeeIndex}][${answer.questionId}]`
      const attendeePayload = attendeesPayload[attendeeIndex] as any
      const questionAnswers = attendeePayload?.attendee?.question_answers as any[] | undefined
      const questionAnswerPayload = questionAnswers?.[answerIndex]
      if (!questionAnswerPayload) return

      questionAnswerPayload.upload_file_key = uploadKey
      questionAnswerPayload.upload_resource_id = undefined
      questionAnswerPayload.upload_url = undefined
      formData.append(uploadKey, answer.uploadFile)
    })
  })

  formData.append('booking_intent_id', params.bookingIntentId)
  formData.append('payment_method_id', String(params.paymentMethodId))
  formData.append('attendees', JSON.stringify(attendeesPayload))

  if (params.paymentId) {
    formData.append('payment_id', params.paymentId)
  }

  if (params.bankTransferEvidenceId) {
    formData.append('bank_transfer_evidence_id', params.bankTransferEvidenceId)
  }

  if (params.stripePaymentIntentId) {
    formData.append('stripe_payment_intent_id', params.stripePaymentIntentId)
  }

  if (params.bankTransferEvidence) {
    if (params.bankTransferEvidence.transfer_id) {
      formData.append('bank_transfer_evidence[transfer_id]', params.bankTransferEvidence.transfer_id)
    }
    formData.append('bank_transfer_evidence[evidence_file]', params.bankTransferEvidence.evidence_file)
    if (params.bankTransferEvidence.payer_name) {
      formData.append('bank_transfer_evidence[payer_name]', params.bankTransferEvidence.payer_name)
    }
    if (params.bankTransferEvidence.payer_account_last4) {
      formData.append('bank_transfer_evidence[payer_account_last4]', params.bankTransferEvidence.payer_account_last4)
    }
    if (params.bankTransferEvidence.amount_on_evidence !== undefined) {
      formData.append('bank_transfer_evidence[amount_on_evidence]', String(params.bankTransferEvidence.amount_on_evidence))
    }
  }

  return formData
}

export const buildCheckoutPreviewPayload = (params: {
  bookingIntentId: string
  attendees: AttendeeDraft[]
}): CheckoutPreviewRequest => ({
  booking_intent_id: params.bookingIntentId,
  attendees: params.attendees.map(buildAttendeeCheckout),
})

export const createIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
