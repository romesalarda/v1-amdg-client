<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        :value="live.currently_inside"
        label="Currently Inside"
        icon="i-heroicons-building-office-2"
        icon-color="green"
      />
      <StatCard
        :value="live.checked_out"
        label="Checked Out"
        icon="i-heroicons-arrow-right-on-rectangle"
        icon-color="indigo"
      />
      <StatCard
        :value="live.never_arrived"
        label="Not Yet Arrived"
        icon="i-heroicons-clock"
        icon-color="amber"
      />
      <StatCard
        :value="`${live.percent_on_site.toFixed(1)}%`"
        label="Of Attendees On Site"
        icon="i-heroicons-users"
        icon-color="blue"
      />
    </div>

    <div>
      <div class="flex justify-between text-sm font-medium text-gray-700 mb-2">
        <span>Attendee Location Breakdown</span>
        <span>{{ live.total_attendees }} attendees (excl. cancelled)</span>
      </div>
      <div class="flex w-full h-4 rounded-full overflow-hidden bg-gray-200">
        <div class="bg-green-500" :style="{ width: `${live.percent_on_site}%` }" title="Inside" />
        <div class="bg-indigo-400" :style="{ width: `${live.percent_checked_out}%` }" title="Checked out" />
        <div class="bg-amber-400" :style="{ width: `${live.percent_never_arrived}%` }" title="Not arrived" />
      </div>
      <div class="flex gap-4 mt-2 text-xs text-gray-600">
        <span><span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />Inside</span>
        <span><span class="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-1" />Checked out</span>
        <span><span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />Not arrived</span>
      </div>
    </div>

    <div v-if="live.longest_inside.length">
      <div class="text-sm font-semibold text-gray-700 mb-2">Longest On Site</div>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">
            <th class="pb-2 pr-4">Attendee</th>
            <th class="pb-2 pr-4">ID</th>
            <th class="pb-2 pr-4">Checked In</th>
            <th class="pb-2 text-right">Time Inside</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="a in live.longest_inside" :key="a.attendee_id">
            <td class="py-2 pr-4 font-medium text-gray-800">{{ a.full_name }}</td>
            <td class="py-2 pr-4 text-xs text-gray-500">{{ a.attendee_display_id ?? '—' }}</td>
            <td class="py-2 pr-4 text-xs text-gray-500">{{ a.checked_in_at ? new Date(a.checked_in_at).toLocaleString() : '—' }}</td>
            <td class="py-2 text-right font-semibold text-gray-800">{{ formatDuration(a.minutes_inside) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckInLiveStats } from '~/api/types.gen'
import StatCard from '~/components/statistics/StatCard.vue'

defineProps<{ live: CheckInLiveStats }>()

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h ${m}m` : `${m}m`
}
</script>
