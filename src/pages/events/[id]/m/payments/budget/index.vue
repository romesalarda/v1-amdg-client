<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="space-y-6">
      <!-- Event Budget Statistics Panel -->
      <EventBudgetStatisticsPanel :event-id="id" />

      <!-- Tab Navigation -->
      <div class="bg-white border border-deep-navy/10 rounded-xl shadow-sm p-1.5">
        <div class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200',
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6">
        <div v-show="activeTab === 'proposals'">
          <ProposalsTab :event-id="id" />
        </div>
        <div v-show="activeTab === 'credits'">
          <CreditsTab :event-id="id" :event-pk="eventPk" />
        </div>
        <div v-show="activeTab === 'debits'">
          <DebitsTab :event-id="id" />
        </div>
      </section>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import EventBudgetStatisticsPanel from '~/components/events/payments/budget/EventBudgetStatisticsPanel.vue'
import ProposalsTab from '~/components/events/payments/budget/tabs/ProposalsTab.vue'
import CreditsTab from '~/components/events/payments/budget/tabs/CreditsTab.vue'
import DebitsTab from '~/components/events/payments/budget/tabs/DebitsTab.vue'
import { useEvent } from '~/composables/resources/events/events'
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PAYMENT_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  },
})

const route = useRoute()
const id = computed(() => String(route.params.id))
const { data: event } = useEvent(id)
const eventPk = computed(() => event.value?.data?.id ?? null)

const activeTab = ref<'proposals' | 'credits' | 'debits'>('proposals')

const tabs = [
  { id: 'proposals', label: 'Proposals', icon: 'receipt_long' },
  { id: 'credits', label: 'Costs (Credits)', icon: 'arrow_downward' },
  { id: 'debits', label: 'Income (Debits)', icon: 'arrow_upward' },
] as const
</script>
