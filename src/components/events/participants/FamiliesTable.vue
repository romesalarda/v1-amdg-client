<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th
            class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            @click="emit('set-sorting', 'family_name')"
          >
            <div class="flex items-center gap-1">
              Family Name
              <UIcon
                v-if="currentSort === 'family_name'"
                :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
          <th class="py-3 px-4 font-semibold text-gray-700">Members</th>
          <th class="py-3 px-4 font-semibold text-gray-700">Scope</th>
          <th
            class="py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
            @click="emit('set-sorting', 'created_at')"
          >
            <div class="flex items-center gap-1">
              Created
              <UIcon
                v-if="currentSort === 'created_at'"
                :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-4 h-4"
              />
            </div>
          </th>
          <th class="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="group in familyGroups"
          :key="group.id"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <td class="py-3 px-4">
            <div class="font-semibold text-gray-900">{{ group.family_name }}</div>
            <div class="text-xs text-gray-500">Family ID #{{ group.id }}</div>
          </td>
          <td class="py-3 px-4">
            <UBadge color="blue" variant="soft" size="xs">
              {{ group.member_count }} {{ group.member_count === 1 ? 'member' : 'members' }}
            </UBadge>
          </td>
          <td class="py-3 px-4 text-xs text-gray-600">
            Event #{{ group.event || 'N/A' }}
          </td>
          <td class="py-3 px-4 text-gray-600 text-xs">
            {{ new Date(group.created_at).toLocaleString() }}
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center justify-end gap-1">
              <UButton
                size="xs"
                variant="ghost"
                color="gray"
                icon="i-heroicons-eye"
                @click="emit('open-family', group)"
              >
                Open
              </UButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { FamilyGroupList } from '~/api/types.gen'

defineProps<{
  familyGroups: FamilyGroupList[]
  currentSort: string
  sortDirection: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  (e: 'set-sorting', field: string): void
  (e: 'open-family', group: FamilyGroupList): void
}>()
</script>
