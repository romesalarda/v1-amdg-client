<template>
  <div class="p-4 border border-deep-navy/10 rounded-xl bg-mist-blue/40 hover:bg-mist-blue/60 transition-colors">
    <div class="flex items-start justify-between gap-4">
      <!-- Avatar & User Info -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :class="avatarClass"
        >
          <span class="text-sm font-black" :class="avatarTextClass">
            {{ userInitials }}
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <!-- Email + status badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold text-navy-900 truncate">
              {{ invite.target_user_email }}
            </span>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="statusBadgeClass"
            >
              {{ statusLabel }}
            </span>
          </div>

          <!-- Full name -->
          <div v-if="invite.target_user_name" class="text-xs text-navy-500 truncate mt-0.5">
            {{ invite.target_user_name }}
          </div>

          <!-- Meta row -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-navy-400">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">person</span>
              Invited by {{ invite.invited_by_email }}
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">schedule</span>
              {{ formatDate(invite.added_at) }}
            </span>
          </div>

          <!-- Expiry -->
          <div
            v-if="invite.expires_at"
            class="flex items-center gap-1 mt-1 text-xs"
            :class="expirySoon ? 'text-amber-600 font-medium' : 'text-navy-400'"
          >
            <span class="material-symbols-outlined text-xs">timer</span>
            Expires {{ formatDate(invite.expires_at) }}
            <span v-if="expirySoon" class="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
              Soon
            </span>
          </div>

          <!-- Accepted at -->
          <div v-if="invite.accepted && invite.accepted_at" class="flex items-center gap-1 mt-1 text-xs text-emerald-600">
            <span class="material-symbols-outlined text-xs">check_circle</span>
            Accepted {{ formatDate(invite.accepted_at) }}
          </div>
        </div>
      </div>

      <!-- Revoke action -->
      <div v-if="canRevoke && invite.is_valid" class="flex-shrink-0">
        <button
          @click="$emit('revoke')"
          aria-label="Revoke invite"
          title="Revoke invite"
          class="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-base">cancel</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate, isExpiringSoon } from '~/utils/time'
import type { EventStaffInviteList } from '~/api/types.gen'

interface Props {
  invite: EventStaffInviteList & { accepted_at?: string | null }
  canRevoke?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canRevoke: false,
})

defineEmits<{
  (e: 'revoke'): void
}>()

const userInitials = computed(() => {
  const name = props.invite.target_user_name?.trim()
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }
  return props.invite.target_user_email?.substring(0, 2).toUpperCase() ?? '??'
})

const expirySoon = computed(() =>
  props.invite.expires_at ? isExpiringSoon(props.invite.expires_at) : false
)

const statusLabel = computed(() => {
  if (props.invite.accepted) return 'Accepted'
  if (!props.invite.is_active) return 'Inactive'
  if (!props.invite.is_valid) return 'Expired'
  return 'Pending'
})

const avatarClass = computed(() => {
  if (props.invite.accepted) return 'bg-emerald-100'
  if (!props.invite.is_valid) return 'bg-navy-100'
  return 'bg-primary/10'
})

const avatarTextClass = computed(() => {
  if (props.invite.accepted) return 'text-emerald-600'
  if (!props.invite.is_valid) return 'text-navy-400'
  return 'text-primary'
})

const statusBadgeClass = computed(() => {
  if (props.invite.accepted) return 'bg-emerald-100 text-emerald-700'
  if (!props.invite.is_valid) return 'bg-navy-100 text-navy-500'
  return 'bg-amber-100 text-amber-700'
})
</script>
