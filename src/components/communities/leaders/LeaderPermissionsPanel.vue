<template>
  <!-- Backdrop -->
  <Transition name="leader-panel-fade">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/40 z-40"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Panel -->
  <Transition name="leader-panel-slide">
    <div
      v-if="open"
      class="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="min-w-0 flex-1 pr-4">
          <h3 class="text-xs font-black text-deep-navy uppercase tracking-widest">
            Leader Permissions
          </h3>
          <p class="text-sm font-bold text-deep-navy mt-0.5 truncate">
            {{ leader?.user_name || 'Unknown Leader' }}
          </p>
          <p class="text-[10px] font-bold text-deep-navy/50 uppercase tracking-wider mt-0.5">
            {{ leader?.location_type }} · {{ leader?.location_name }}
          </p>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          variant="ghost"
          color="gray"
          size="sm"
          @click="$emit('close')"
        />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="p-6 space-y-3 flex-1">
        <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      <!-- Error -->
      <div v-else-if="isError" class="flex-1 p-6 flex flex-col items-center justify-center">
        <UIcon name="i-heroicons-exclamation-circle" class="w-10 h-10 text-red-400 mb-2" />
        <p class="text-sm text-gray-600">Failed to load permissions</p>
      </div>

      <!-- Content -->
      <div v-else class="flex-1 overflow-y-auto flex flex-col">
        <!-- Permissions list -->
        <div class="flex-1">
          <!-- Empty state -->
          <div
            v-if="permissions.length === 0 && !showAddForm"
            class="px-6 py-12 text-center"
          >
            <UIcon name="i-heroicons-lock-closed" class="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p class="text-sm text-gray-500 font-medium">No permissions assigned</p>
            <p v-if="isController" class="text-xs text-gray-400 mt-1">
              Use the button below to grant permissions.
            </p>
          </div>

          <!-- Permission rows -->
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="perm in permissions"
              :key="perm.id"
              class="px-6 py-4 flex items-start justify-between gap-4"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-black text-deep-navy uppercase tracking-tight">
                  {{ permissionLabel(perm.permission_code) }}
                </p>
                <p v-if="perm.description" class="text-xs text-deep-navy/60 font-medium mt-0.5 truncate">
                  {{ perm.description }}
                </p>
                <!-- CRUD badges -->
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span
                    v-for="flag in crudBadges(perm)"
                    :key="flag.label"
                    :class="flag.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200 line-through'"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                  >
                    {{ flag.label }}
                  </span>
                </div>
              </div>

              <!-- Actions (controller only) -->
              <div v-if="isController" class="flex items-center gap-2 flex-shrink-0">
                <button
                  class="p-1.5 text-deep-navy/40 hover:text-deep-navy transition-colors rounded"
                  title="Edit permission"
                  @click="startEdit(perm)"
                >
                  <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                </button>
                <button
                  :disabled="deletingId === perm.id"
                  class="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded disabled:opacity-40"
                  title="Remove permission"
                  @click="deletePermission(perm.id)"
                >
                  <UIcon
                    :name="deletingId === perm.id ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'"
                    class="w-4 h-4"
                    :class="{ 'animate-spin': deletingId === perm.id }"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit form (when editing existing) -->
        <LeaderPermissionForm
          v-if="showAddForm || editingPermission"
          :leader-id="leader!.id"
          :existing-permission="editingPermission"
          :assigned-codes="assignedCodes"
          @submitted="onFormSubmitted"
          @cancelled="cancelForm"
        />

        <!-- Footer: add button -->
        <div
          v-if="isController && !showAddForm && !editingPermission"
          class="border-t border-gray-200 px-6 py-4 flex-shrink-0"
        >
          <button
            class="w-full px-5 py-2.5 border-2 border-deep-navy text-deep-navy hover:bg-deep-navy hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all"
            @click="showAddForm = true"
          >
            + Add Permission
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { LeaderList, LeaderPermission } from '~/api/types.gen'
import type { LeaderPermissionCode } from '~/composables/permissions/useCurrentLeaderPermissions'
import {
  useLeaderPermissions,
  useDeleteLeaderPermission,
} from '~/composables/resources/organisation/organisationLeaderPermissions'
import LeaderPermissionForm from './LeaderPermissionForm.vue'

interface Props {
  open: boolean
  leader: LeaderList | null
  organisationId: string
  isController: boolean
}

const props = defineProps<Props>()
defineEmits<{ close: [] }>()

const showAddForm = ref(false)
const editingPermission = ref<LeaderPermission | undefined>(undefined)
const deletingId = ref<number | null>(null)

// Reset form state when panel opens/closes or leader changes
watch(() => [props.open, props.leader?.id], () => {
  showAddForm.value = false
  editingPermission.value = undefined
  deletingId.value = null
})

const leaderId = computed(() => props.leader?.id ?? null)

const { data, isLoading, isError } = useLeaderPermissions(
  computed(() =>
    leaderId.value != null
      ? { leader: leaderId.value }
      : undefined,
  ),
)

const permissions = computed<LeaderPermission[]>(() => {
  const raw = data.value?.data
  if (Array.isArray(raw)) return raw
  if (raw && Array.isArray((raw as any).results)) return (raw as any).results
  return []
})

const assignedCodes = computed<LeaderPermissionCode[]>(() =>
  permissions.value.map((p) => p.permission_code as LeaderPermissionCode),
)

const PERMISSION_LABELS: Record<string, string> = {
  allow_event_approval: 'Event Approval',
  allow_manage_leaders: 'Manage Leaders',
  allow_manage_organisation: 'Manage Organisation',
  allow_membership_access: 'Membership Access',
  allow_organisation_sponsor: 'Organisation Sponsor',
  allow_policy_management: 'Policy Management',
  allow_data_management: 'Data Management',
  allow_review_access: 'Review Access',
  allow_monetary_access: 'Monetary Access',
  allow_landing_page_management: 'Landing Page Management',
}

function permissionLabel(code: string) {
  return PERMISSION_LABELS[code] ?? code
}

function crudBadges(perm: LeaderPermission) {
  return [
    { label: 'Create', active: perm.allow_create ?? false },
    { label: 'Read',   active: perm.allow_read   ?? false },
    { label: 'Update', active: perm.allow_update  ?? false },
    { label: 'Delete', active: perm.allow_delete  ?? false },
  ]
}

function startEdit(perm: LeaderPermission) {
  editingPermission.value = perm
  showAddForm.value = false
}

function cancelForm() {
  showAddForm.value = false
  editingPermission.value = undefined
}

function onFormSubmitted() {
  cancelForm()
}

const { mutate: doDelete } = useDeleteLeaderPermission()
const { $notyf } = useNuxtApp()

function deletePermission(permId: number) {
  if (!confirm('Remove this permission from the leader?')) return
  deletingId.value = permId
  doDelete(permId, {
    onSuccess: () => {
      $notyf?.success('Permission removed.')
      deletingId.value = null
    },
    onError: (err: any) => {
      $notyf?.error(err?.body?.error || 'Failed to remove permission.')
      deletingId.value = null
    },
  })
}
</script>

<style scoped>
.leader-panel-fade-enter-active,
.leader-panel-fade-leave-active {
  transition: opacity 0.2s ease;
}
.leader-panel-fade-enter-from,
.leader-panel-fade-leave-to {
  opacity: 0;
}

.leader-panel-slide-enter-active,
.leader-panel-slide-leave-active {
  transition: transform 0.25s ease;
}
.leader-panel-slide-enter-from,
.leader-panel-slide-leave-to {
  transform: translateX(100%);
}
</style>
