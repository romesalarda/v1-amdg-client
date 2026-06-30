<template>
  <div class="border-t-2 border-deep-navy/10 bg-deep-navy/[0.02] px-6 py-5 space-y-4">
    <h4 class="text-xs font-black text-deep-navy uppercase tracking-widest">
      {{ existingPermission ? 'Edit Permission' : 'Add Permission' }}
    </h4>

    <div>
      <label class="block text-[10px] font-black text-deep-navy/50 mb-1.5 uppercase tracking-[0.15em]">
        Permission Code
      </label>
      <select
        v-model="form.permission_code"
        :disabled="!!existingPermission"
        class="w-full px-3 py-2.5 border-2 border-deep-navy/20 rounded-xl text-xs font-bold text-deep-navy bg-white disabled:opacity-50"
      >
        <option value="" disabled>Select a permission…</option>
        <option
          v-for="opt in permissionOptions"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div>
      <label class="block text-[10px] font-black text-deep-navy/50 mb-1.5 uppercase tracking-[0.15em]">
        Description <span class="font-medium normal-case">(optional)</span>
      </label>
      <input
        v-model="form.description"
        type="text"
        placeholder="e.g. Can manage event approvals for this region"
        class="w-full px-3 py-2.5 border-2 border-deep-navy/20 rounded-xl text-xs font-medium text-deep-navy bg-white placeholder:text-deep-navy/30"
      />
    </div>

    <div>
      <p class="text-[10px] font-black text-deep-navy/50 mb-2 uppercase tracking-[0.15em]">
        CRUD Access
      </p>
      <div class="flex flex-wrap gap-4">
        <label
          v-for="flag in crudFlags"
          :key="flag.key"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            v-model="form[flag.key]"
            type="checkbox"
            class="rounded border-deep-navy/40 text-deep-navy focus:ring-deep-navy"
          />
          <span class="text-xs font-bold text-deep-navy uppercase tracking-wider">{{ flag.label }}</span>
        </label>
      </div>
    </div>

    <div class="flex gap-3 pt-1">
      <button
        :disabled="!canSubmit || isPending"
        class="px-5 py-2.5 bg-deep-navy text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:bg-deep-navy/90 disabled:opacity-40"
        @click="submit"
      >
        {{ isPending ? 'Saving…' : existingPermission ? 'Update' : 'Add Permission' }}
      </button>
      <button
        class="px-5 py-2.5 border-2 border-deep-navy/20 text-deep-navy rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:bg-deep-navy/5"
        @click="$emit('cancelled')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { LeaderPermission } from '~/api/types.gen'
import type { LeaderPermissionCode } from '~/composables/permissions/useCurrentLeaderPermissions'
import {
  useCreateLeaderPermission,
  useUpdateLeaderPermission,
} from '~/composables/resources/organisation/organisationLeaderPermissions'

interface Props {
  leaderId: number
  existingPermission?: LeaderPermission
  assignedCodes?: LeaderPermissionCode[]
}

const props = withDefaults(defineProps<Props>(), {
  existingPermission: undefined,
  assignedCodes: () => [],
})

const emit = defineEmits<{
  submitted: []
  cancelled: []
}>()

const PERMISSION_LABELS: Record<LeaderPermissionCode, string> = {
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

const ALL_CODES = Object.keys(PERMISSION_LABELS) as LeaderPermissionCode[]

const permissionOptions = computed(() =>
  ALL_CODES.map((code) => ({
    value: code,
    label: PERMISSION_LABELS[code],
    disabled: !props.existingPermission && props.assignedCodes.includes(code),
  })),
)

const crudFlags = [
  { key: 'allow_create' as const, label: 'Create' },
  { key: 'allow_read' as const, label: 'Read' },
  { key: 'allow_update' as const, label: 'Update' },
  { key: 'allow_delete' as const, label: 'Delete' },
]

type FormState = {
  permission_code: LeaderPermissionCode | ''
  description: string
  allow_create: boolean
  allow_read: boolean
  allow_update: boolean
  allow_delete: boolean
}

const form = reactive<FormState>({
  permission_code: '',
  description: '',
  allow_create: true,
  allow_read: true,
  allow_update: true,
  allow_delete: true,
})

// Populate form when editing an existing permission
watch(
  () => props.existingPermission,
  (perm) => {
    if (perm) {
      form.permission_code = perm.permission_code as LeaderPermissionCode
      form.description = perm.description ?? ''
      form.allow_create = perm.allow_create ?? true
      form.allow_read = perm.allow_read ?? true
      form.allow_update = perm.allow_update ?? true
      form.allow_delete = perm.allow_delete ?? true
    }
  },
  { immediate: true },
)

const canSubmit = computed(() => !!form.permission_code)

const { mutate: createPermission, isPending: isCreating } = useCreateLeaderPermission()
const { mutate: updatePermission, isPending: isUpdating } = useUpdateLeaderPermission()
const isPending = computed(() => isCreating.value || isUpdating.value)

const { $notyf } = useNuxtApp()

function submit() {
  if (!canSubmit.value || !form.permission_code) return

  const payload = {
    leader: props.leaderId,
    permission_code: form.permission_code,
    description: form.description || undefined,
    allow_create: form.allow_create,
    allow_read: form.allow_read,
    allow_update: form.allow_update,
    allow_delete: form.allow_delete,
  }

  if (props.existingPermission) {
    updatePermission(
      { permissionId: props.existingPermission.id, body: payload },
      {
        onSuccess: () => {
          $notyf?.success('Permission updated.')
          emit('submitted')
        },
        onError: (err: any) => {
          $notyf?.error(err?.body?.error || 'Failed to update permission.')
        },
      },
    )
  }
  else {
    createPermission(payload as any, {
      onSuccess: () => {
        $notyf?.success('Permission added.')
        emit('submitted')
      },
      onError: (err: any) => {
        $notyf?.error(err?.body?.error || 'Failed to add permission.')
      },
    })
  }
}
</script>
