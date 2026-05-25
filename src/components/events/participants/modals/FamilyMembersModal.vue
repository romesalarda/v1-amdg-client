<template>
  <UModal :model-value="modelValue" :ui="{ width: 'sm:max-w-5xl' }" @update:model-value="emit('update:modelValue', $event)">
    <div v-if="familyGroup" class="p-6">
      <div class="flex items-start justify-between mb-4 gap-4">
        <div class="flex-1 min-w-0">
          <h3 class="text-xl font-bold text-gray-900">Family Group</h3>
          <p class="text-sm text-gray-500">Edit the family name and update each member's relationship and head status.</p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div class="flex-1">
            <label class="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Family Name</label>
            <input
              v-model="editingFamilyName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <UButton
            color="primary"
            :loading="savingFamilyName || updateFamilyGroupMutation.isPending.value"
            :disabled="savingFamilyName || updateFamilyGroupMutation.isPending.value"
            @click="handleSaveFamilyName"
          >
            Save Name
          </UButton>
        </div>
      </div>

      <div v-if="familyMembersLoading" class="space-y-2">
        <div v-for="i in 5" :key="i" class="h-12 bg-gray-100 rounded animate-pulse" />
      </div>

      <div v-else-if="familyMembers.length === 0" class="py-10 text-center border border-dashed border-gray-200 rounded-xl">
        <UIcon name="i-heroicons-user-group" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">No family members found for this group.</p>
      </div>

      <div v-else class="border border-gray-200 rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="py-2.5 px-3 text-left font-semibold text-gray-700">Attendee</th>
              <th class="py-2.5 px-3 text-left font-semibold text-gray-700">Relationship</th>
              <th class="py-2.5 px-3 text-left font-semibold text-gray-700">Head</th>
              <th class="py-2.5 px-3 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="member in familyMembers"
              :key="member.id"
              class="border-b border-gray-100 last:border-b-0"
            >
              <td class="py-2.5 px-3">
                <div class="font-medium text-gray-900">{{ member.attendee_name }}</div>
                <div class="text-xs text-gray-500">Membership #{{ member.id }}</div>
              </td>
              <td class="py-2.5 px-3">
                <select
                  :value="member.relationship"
                  class="w-full max-w-[170px] px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  :disabled="updateFamilyAttendeeMutation.isPending.value"
                  @change="handleUpdateFamilyMemberRelationship(member, ($event.target as HTMLSelectElement).value as FamilyRelationship)"
                >
                  <option
                    v-for="option in familyRelationshipOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </td>
              <td class="py-2.5 px-3">
                <label class="inline-flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    :checked="Boolean(member.is_primary_guardian)"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                    :disabled="updateFamilyAttendeeMutation.isPending.value"
                    @change="handleToggleFamilyHead(member, ($event.target as HTMLInputElement).checked)"
                  />
                  Primary guardian
                </label>
              </td>
              <td class="py-2.5 px-3 text-right">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="red"
                  icon="i-heroicons-trash"
                  :disabled="deleteFamilyAttendeeMutation.isPending.value"
                  @click="handleRemoveFamilyMember(member)"
                >
                  Remove
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Total members: {{ totalFamilyMembers }}</span>
        <UButton
          variant="outline"
          color="gray"
          @click="emit('update:modelValue', false)"
        >
          Close
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { useFamilyGroupMembers, usePartialUpdateFamilyGroup } from '~/composables/resources/common/familyGroups'
import { usePartialUpdateFamilyAttendee, useDeleteFamilyAttendee } from '~/composables/resources/common/familyAttendees'
import type { FamilyGroupList, FamilyAttendee } from '~/api/types.gen'

type FamilyRelationship = FamilyAttendee['relationship']

const familyRelationshipOptions: Array<{ value: FamilyRelationship; label: string }> = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
]

const props = defineProps<{
  modelValue: boolean
  familyGroup: FamilyGroupList | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated'): void
}>()

const toast = useToast()

const editingFamilyName = ref('')
const savingFamilyName = ref(false)

const selectedFamilyGroupId = computed(() => props.familyGroup?.id || 0)
const { data: familyMembersData, isLoading: familyMembersLoading, refetch: refetchFamilyMembers } = useFamilyGroupMembers(selectedFamilyGroupId)

const updateFamilyGroupMutation = usePartialUpdateFamilyGroup()
const updateFamilyAttendeeMutation = usePartialUpdateFamilyAttendee()
const deleteFamilyAttendeeMutation = useDeleteFamilyAttendee()

const familyMembers = computed(() => {
  const payload = familyMembersData.value?.data as { results?: FamilyAttendee[] } | FamilyAttendee[] | undefined
  if (!payload) return [] as FamilyAttendee[]
  return Array.isArray(payload) ? payload : (payload.results || [])
})

const totalFamilyMembers = computed(() => {
  const payload = familyMembersData.value?.data as { count?: number } | FamilyAttendee[] | undefined
  if (!payload) return 0
  if (Array.isArray(payload)) return payload.length
  return payload.count ?? 0
})

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen && props.familyGroup) {
    editingFamilyName.value = props.familyGroup.family_name
    await refetchFamilyMembers()
  } else {
    editingFamilyName.value = ''
  }
})

async function handleSaveFamilyName() {
  if (!props.familyGroup) return

  const trimmedName = editingFamilyName.value.trim()
  if (!trimmedName) {
    toast.add({ title: 'Family name required', description: 'Please enter a valid family name.', color: 'orange' })
    return
  }

  if (trimmedName === props.familyGroup.family_name) return

  try {
    savingFamilyName.value = true
    await updateFamilyGroupMutation.mutateAsync({
      groupId: props.familyGroup.id,
      body: { family_name: trimmedName },
    })
    toast.add({ title: 'Family updated', description: 'Family name updated successfully.', color: 'green' })
    emit('updated')
  } catch (error) {
    toast.add({
      title: 'Failed to update family',
      description: error instanceof Error ? error.message : 'Unable to save family name.',
      color: 'red',
    })
  } finally {
    savingFamilyName.value = false
  }
}

async function handleUpdateFamilyMemberRelationship(member: FamilyAttendee, relationship: FamilyRelationship) {
  try {
    await updateFamilyAttendeeMutation.mutateAsync({ membershipId: member.id, body: { relationship } })
    toast.add({ title: 'Relationship updated', color: 'green' })
    await refetchFamilyMembers()
  } catch (error) {
    toast.add({
      title: 'Failed to update relationship',
      description: error instanceof Error ? error.message : 'Unable to update relationship.',
      color: 'red',
    })
  }
}

async function handleToggleFamilyHead(member: FamilyAttendee, isPrimaryGuardian: boolean) {
  try {
    await updateFamilyAttendeeMutation.mutateAsync({ membershipId: member.id, body: { is_primary_guardian: isPrimaryGuardian } })
    toast.add({ title: isPrimaryGuardian ? 'Head updated' : 'Head removed', color: 'green' })
    await refetchFamilyMembers()
  } catch (error) {
    toast.add({
      title: 'Failed to update head status',
      description: error instanceof Error ? error.message : 'Unable to update family head.',
      color: 'red',
    })
  }
}

async function handleRemoveFamilyMember(member: FamilyAttendee) {
  if (!confirm(`Remove ${member.attendee_name} from this family?`)) return

  try {
    await deleteFamilyAttendeeMutation.mutateAsync(member.id)
    toast.add({ title: 'Member removed', description: `${member.attendee_name} was removed from the family.`, color: 'green' })
    await Promise.all([refetchFamilyMembers()])
    emit('updated')
  } catch (error) {
    toast.add({
      title: 'Failed to remove member',
      description: error instanceof Error ? error.message : 'Unable to remove this member.',
      color: 'red',
    })
  }
}
</script>
