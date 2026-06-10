import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useQueryClient } from '@tanstack/vue-query'
import { workshopSchema, defaultWorkshopForm } from '~/schemas/workshops/workshop.schema'
import { WORKSHOPS_QUERY_KEY } from '~/composables/resources/workshops'
import { uploadMultipart } from '~/utils/upload'
import type { WorkshopFormData } from '~/schemas/workshops/workshop.schema'

export function useWorkshopForm(onSuccess?: (data: any) => void) {
  const queryClient = useQueryClient()
  const isSubmitting = ref(false)

  const {
    errors,
    resetForm,
    setValues,
    values,
    handleSubmit,
  } = useForm<WorkshopFormData>({
    validationSchema: toTypedSchema(workshopSchema),
    initialValues: defaultWorkshopForm(),
  })

  function loadForEdit(workshop: Partial<WorkshopFormData>) {
    setValues({
      ...defaultWorkshopForm(),
      ...workshop,
    })
  }

  function buildFormData(formValues: WorkshopFormData, imageFile?: File | null): FormData {
    const fd = new FormData()
    // Nullable optional fields that should be explicitly cleared when null
    const nullableFields = new Set([
      'capacity', 'duration_minutes', 'notes', 'what_to_expect', 'what_to_bring',
      'venue', 'room', 'registration_opens_at', 'registration_closes_at',
    ])
    for (const [key, value] of Object.entries(formValues)) {
      if (value === undefined) continue
      if (value === null) {
        // Send empty string only for explicitly nullable fields so DRF clears them
        if (nullableFields.has(key)) fd.append(key, '')
      } else {
        fd.append(key, String(value))
      }
    }
    if (imageFile) fd.append('landing_image', imageFile)
    return fd
  }

  async function submitCreate(imageFile?: File | null) {
    return handleSubmit(async (formValues) => {
      isSubmitting.value = true
      try {
        const fd = buildFormData(formValues, imageFile)
        const data = await uploadMultipart('/api/workshops/list/', fd, { method: 'POST' })
        queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
        onSuccess?.(data)
        resetForm()
      } finally {
        isSubmitting.value = false
      }
    })()
  }

  async function submitUpdate(workshopId: number, imageFile?: File | null) {
    return handleSubmit(async (formValues) => {
      isSubmitting.value = true
      try {
        const fd = buildFormData(formValues, imageFile)
        const data = await uploadMultipart(`/api/workshops/list/${workshopId}/`, fd, { method: 'PATCH' })
        queryClient.invalidateQueries({ queryKey: WORKSHOPS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: [...WORKSHOPS_QUERY_KEY, 'detail', workshopId] })
        onSuccess?.(data)
      } finally {
        isSubmitting.value = false
      }
    })()
  }

  return {
    errors,
    values,
    isSubmitting: computed(() => isSubmitting.value),
    loadForEdit,
    submitCreate,
    submitUpdate,
    resetForm,
    setValues,
  }
}
