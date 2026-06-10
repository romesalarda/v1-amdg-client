import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { workshopSchema, defaultWorkshopForm } from '~/schemas/workshops/workshop.schema'
import { useCreateWorkshop, useUpdateWorkshop } from '~/composables/resources/workshops'
import type { WorkshopFormData } from '~/schemas/workshops/workshop.schema'

export function useWorkshopForm(onSuccess?: (data: any) => void) {
  const createMutation = useCreateWorkshop()
  const updateMutation = useUpdateWorkshop()

  const isSubmitting = computed(
    () => createMutation.isPending.value || updateMutation.isPending.value,
  )

  const {
    errors,
    validate,
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

  const submitCreate = handleSubmit(async (formValues) => {
    const result = await createMutation.mutateAsync(formValues)
    onSuccess?.(result.data)
    resetForm()
  })

  const submitUpdate = (workshopId: number) =>
    handleSubmit(async (formValues) => {
      const result = await updateMutation.mutateAsync({ id: workshopId, body: formValues })
      onSuccess?.(result.data)
    })()

  return {
    errors,
    values,
    isSubmitting,
    loadForEdit,
    submitCreate,
    submitUpdate,
    resetForm,
    setValues,
  }
}
