<template>
  <EventManagementLayout :event-id="id" :event="event?.data">
    <div class="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-12">
        <section class="lg:col-span-8 bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
          <div class="px-8 py-6 border-b border-navy-50 bg-gradient-to-r from-primary/5 to-white">
            <p class="text-[11px] font-black uppercase tracking-[0.35em] text-primary mb-2">Stripe Connect</p>
            <h1 class="text-2xl font-black text-navy-900">Connect your Stripe account</h1>
            <p class="mt-2 text-sm text-navy-500 max-w-2xl">
              This event requires an active connected Stripe account before Stripe payment methods can be saved.
              Complete onboarding in Stripe, then return here and the status will refresh automatically.
            </p>
          </div>

          <div class="p-8 space-y-6">
            <div v-if="stripeConnectLoading && !stripeConnectAccount" class="space-y-3">
              <div class="h-6 w-40 rounded-full bg-mist-blue/70 animate-pulse" />
              <div class="h-24 rounded-2xl bg-mist-blue/70 animate-pulse" />
            </div>

            <template v-else>
              <div class="rounded-2xl border p-5" :class="statusCardClass">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="material-symbols-outlined text-xl" :class="statusIconClass">account_balance_wallet</span>
                      <span class="text-sm font-black uppercase tracking-widest" :class="statusTextClass">{{ statusLabel }}</span>
                    </div>
                    <p class="text-sm text-navy-600">
                      {{ statusDescription }}
                    </p>
                    <p v-if="stripeConnectAccount?.stripe_account_id" class="mt-2 text-xs font-semibold text-navy-500">
                      Connected account: {{ stripeConnectAccount.stripe_account_id }}
                    </p>
                  </div>

                  <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" :class="statusPillClass">
                    {{ statusLabel }}
                  </span>
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl border border-deep-navy/10 bg-mist-blue/35 p-4">
                  <p class="text-[11px] font-black uppercase tracking-widest text-navy-400 mb-1">Charges</p>
                  <p class="text-sm font-semibold text-navy-900">
                    {{ stripeConnectAccount?.charges_enabled ? 'Enabled' : 'Not yet enabled' }}
                  </p>
                </div>
                <div class="rounded-2xl border border-deep-navy/10 bg-mist-blue/35 p-4">
                  <p class="text-[11px] font-black uppercase tracking-widest text-navy-400 mb-1">Payouts</p>
                  <p class="text-sm font-semibold text-navy-900">
                    {{ stripeConnectAccount?.payouts_enabled ? 'Enabled' : 'Not yet enabled' }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-all hover:bg-navy-600 disabled:opacity-60"
                  :disabled="onboardingMutation.isPending.value"
                  @click="startOnboarding"
                >
                  <span v-if="onboardingMutation.isPending.value" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  {{ stripeConnectAccount?.status === 'ACTIVE' ? 'Refresh Stripe onboarding' : 'Start Stripe onboarding' }}
                </button>

                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl border border-deep-navy/10 bg-white px-5 py-3 text-sm font-bold text-navy-700 transition-all hover:bg-mist-blue"
                  @click="navigateTo(`/events/${id}/m/payments`)">
                  Back to payments
                </button>
              </div>
            </template>
          </div>
        </section>

        <aside class="lg:col-span-4 space-y-4">
          <section class="rounded-2xl border border-deep-navy/10 bg-white shadow-drawn p-5">
            <h2 class="text-xs font-black uppercase tracking-widest text-primary mb-3">How it works</h2>
            <ol class="space-y-3 text-sm text-navy-600 list-decimal list-inside">
              <li>Click the connect button to open Stripe onboarding.</li>
              <li>Finish the account setup in Stripe.</li>
              <li>Return here and wait for the status to turn active.</li>
              <li>Go back to payment methods and save the Stripe method.</li>
            </ol>
          </section>

          <section class="rounded-2xl border border-deep-navy/10 bg-white shadow-drawn p-5">
            <h2 class="text-xs font-black uppercase tracking-widest text-primary mb-3">Auto refresh</h2>
            <p class="text-sm text-navy-600">
              This page refreshes the Stripe status automatically while it is open, so you do not need to reload manually after onboarding.
            </p>
          </section>
        </aside>
      </div>
    </div>
  </EventManagementLayout>
</template>

<script setup lang="ts">
import EventManagementLayout from '~/components/events/EventManagementLayout.vue'
import { useEvent } from '~/composables/resources/events/events'
import {
  useCreateStripeConnectOnboardingLink,
  useStripeConnectStatus,
} from '~/composables/resources/payments/stripeConnect'

definePageMeta({
  layout: false,
})

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data: event } = useEvent(id)
const stripeConnectStatus = useStripeConnectStatus()
const onboardingMutation = useCreateStripeConnectOnboardingLink()

const stripeConnectAccount = computed(() => stripeConnectStatus.data.value?.data)
const stripeConnectLoading = computed(() => stripeConnectStatus.isLoading.value || stripeConnectStatus.isFetching.value)

const statusLabel = computed(() => stripeConnectAccount.value?.status || 'Not created')
const statusDescription = computed(() => {
  const status = stripeConnectAccount.value?.status
  if (status === 'ACTIVE') {
    return 'Your Stripe account is ready. You can save Stripe payment methods now.'
  }
  if (status === 'RESTRICTED') {
    return 'Your account exists but needs more onboarding steps before it can be used for live payments.'
  }
  if (status === 'DISABLED') {
    return 'Stripe has marked this account as disabled. You may need to complete verification or contact Stripe support.'
  }
  return 'No active Stripe connected account is ready yet. Start onboarding to register the account your organisation will use.'
})

const statusCardClass = computed(() => {
  const status = stripeConnectAccount.value?.status
  if (status === 'ACTIVE') return 'border-green-200 bg-green-50/70'
  if (status === 'DISABLED') return 'border-red-200 bg-red-50/70'
  if (status === 'RESTRICTED') return 'border-amber-200 bg-amber-50/70'
  return 'border-primary/20 bg-primary/5'
})

const statusPillClass = computed(() => {
  const status = stripeConnectAccount.value?.status
  if (status === 'ACTIVE') return 'bg-green-100 text-green-700'
  if (status === 'DISABLED') return 'bg-red-100 text-red-700'
  if (status === 'RESTRICTED') return 'bg-amber-100 text-amber-700'
  return 'bg-primary/10 text-primary'
})

const statusTextClass = computed(() => {
  const status = stripeConnectAccount.value?.status
  if (status === 'ACTIVE') return 'text-green-700'
  if (status === 'DISABLED') return 'text-red-700'
  if (status === 'RESTRICTED') return 'text-amber-700'
  return 'text-primary'
})

const statusIconClass = computed(() => {
  const status = stripeConnectAccount.value?.status
  if (status === 'ACTIVE') return 'text-green-600'
  if (status === 'DISABLED') return 'text-red-600'
  if (status === 'RESTRICTED') return 'text-amber-600'
  return 'text-primary'
})

const startOnboarding = async () => {
  const response = await onboardingMutation.mutateAsync()
  const onboardingUrl = response?.data?.onboarding_url

  if (onboardingUrl) {
    await navigateTo(onboardingUrl, { external: true })
  }
}
</script>