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
                      Connected account: {{ stripeConnectAccount.email }}
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

              <!-- Connected Accounts Manager -->
              <div class="mt-12 pt-8 border-t border-deep-navy/10">
                <h2 class="text-lg font-bold text-navy-900 mb-4">Your connected accounts</h2>

                <div v-if="accountsLoading" class="space-y-3">
                  <div class="h-20 rounded-2xl bg-mist-blue/70 animate-pulse" />
                  <div class="h-20 rounded-2xl bg-mist-blue/70 animate-pulse" />
                </div>

                <div v-else-if="accounts && accounts.length > 0" class="space-y-3">
                  <div
                    v-for="account in accounts"
                    :key="account.stripe_account_id"
                    class="rounded-2xl border p-4 transition-all hover:border-primary/30 hover:bg-primary/2"
                  >
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="font-semibold text-navy-900 truncate">{{ account.display_name }}</h3>
                          <span
                            v-if="account.is_primary"
                            class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary"
                          >
                            Primary
                          </span>
                          <span
                            v-if="!account.is_active"
                            class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600"
                          >
                            Inactive
                          </span>
                        </div>
                        <p class="text-xs text-navy-500">{{ account.stripe_account_id }}</p>
                        <p class="text-sm text-navy-600 mt-1">
                          <span
                            :class="{
                              'text-green-600': account.status === 'ACTIVE',
                              'text-amber-600': account.status === 'RESTRICTED',
                              'text-red-600': account.status === 'DISABLED',
                            }"
                          >
                            {{ account.status }}
                          </span>
                        </p>
                      </div>

                      <div class="flex items-center gap-2 flex-shrink-0">
                        <button
                          v-if="!account.is_primary && account.is_active"
                          type="button"
                          class="inline-flex items-center justify-center rounded-lg border border-deep-navy/10 bg-white p-2 text-navy-600 transition-all hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                          :disabled="setPrimaryMutation.isPending.value"
                          @click="setAccountAsPrimary(account.stripe_account_id)"
                          title="Set as primary"
                        >
                          <span class="material-symbols-outlined text-base">check_circle</span>
                        </button>

                        <button
                          type="button"
                          class="inline-flex items-center justify-center rounded-lg border border-deep-navy/10 bg-white p-2 text-navy-600 transition-all hover:bg-mist-blue disabled:opacity-50"
                          :disabled="updateAccountMutation.isPending.value"
                          @click="editAccount(account)"
                          title="Edit account"
                        >
                          <span class="material-symbols-outlined text-base">edit</span>
                        </button>

                        <button
                          type="button"
                          class="inline-flex items-center justify-center rounded-lg border border-deep-navy/10 bg-white p-2 text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
                          :disabled="deleteAccountMutation.isPending.value"
                          @click="deleteAccount(account)"
                          title="Delete account"
                        >
                          <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-navy-500">
                  <p>No connected Stripe accounts yet. Start onboarding above to add your first account.</p>
                </div>

                <button
                  v-if="accounts && accounts.length > 0"
                  type="button"
                  class="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/5 disabled:opacity-50"
                  :disabled="onboardingMutation.isPending.value"
                  @click="startNewAccountOnboarding"
                >
                  <span class="material-symbols-outlined text-base">add</span>
                  Add another account
                </button>
              </div>

              <!-- Edit/Add Account Modal -->
              <Teleport v-if="showAddAccountForm" to="body">
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div class="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
                    <h3 class="text-lg font-bold text-navy-900 mb-4">
                      {{ editingAccount ? 'Edit account' : 'Add account' }}
                    </h3>

                    <form @submit.prevent="saveAccountChanges" class="space-y-4">
                      <div>
                        <label class="block text-sm font-semibold text-navy-700 mb-1">Display name</label>
                        <input
                          v-model="accountFormData.display_name"
                          type="text"
                          class="w-full rounded-lg border border-deep-navy/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="E.g., Main account, Backup account"
                        />
                      </div>

                      <div class="flex items-center gap-2">
                        <input
                          v-model="accountFormData.is_active"
                          type="checkbox"
                          :id="`is_active_${editingAccount?.stripe_account_id}`"
                          class="rounded border-gray-300"
                        />
                        <label
                          :for="`is_active_${editingAccount?.stripe_account_id}`"
                          class="text-sm font-medium text-navy-700"
                        >
                          Active (can be used for payment methods)
                        </label>
                      </div>

                      <div class="flex gap-2 pt-4">
                        <button
                          type="button"
                          class="flex-1 rounded-lg border border-deep-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy-700 transition-all hover:bg-mist-blue"
                          @click="closeAccountForm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          class="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-navy-600 disabled:opacity-60"
                          :disabled="updateAccountMutation.isPending.value"
                        >
                          {{ updateAccountMutation.isPending.value ? 'Saving...' : 'Save' }}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Teleport>
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
import {
  useStripeConnectedAccounts,
  useUpdateStripeConnectedAccount,
  useSetPrimaryStripeAccount,
  useDeleteStripeConnectedAccount,
} from '~/composables/resources/payments/stripeConnectedAccounts'

definePageMeta({
  layout: false,
  middleware: ['auth', 'event-permission'],
  eventPermission: {
    category: 'PAYMENT_MANAGEMENT',
    action: 'read',
    deniedRedirect: '/403',
  }
})
const toast = useToast()
const route = useRoute()
const id = computed(() => String(route.params.id))

const { data: event } = useEvent(id)
const stripeConnectStatus = useStripeConnectStatus()
const onboardingMutation = useCreateStripeConnectOnboardingLink()

// Multi-account queries and mutations
const accountsQuery = useStripeConnectedAccounts()
const updateAccountMutation = useUpdateStripeConnectedAccount()
const setPrimaryMutation = useSetPrimaryStripeAccount()
const deleteAccountMutation = useDeleteStripeConnectedAccount()

const stripeConnectAccount = computed(() => stripeConnectStatus.data.value?.data)
const stripeConnectLoading = computed(() => stripeConnectStatus.isLoading.value || stripeConnectStatus.isFetching.value)

// Multi-account state
const accounts = computed(() => accountsQuery.data.value?.data?.results || [])
const accountsLoading = computed(() => accountsQuery.isLoading.value || accountsQuery.isFetching.value)
const showAddAccountForm = ref(false)
const editingAccount = ref<any>(null)
const accountFormData = ref({
  display_name: '',
  is_active: true,
})

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
  const response = await onboardingMutation.mutateAsync(false)
  const onboardingUrl = response?.data?.onboarding_url

  if (onboardingUrl) {
    // Refresh accounts after onboarding returns
    accountsQuery.refetch()
    await navigateTo(onboardingUrl, { external: true })
  }
}

const startNewAccountOnboarding = async () => {
  const response = await onboardingMutation.mutateAsync(true) // Pass true for force_new
  const onboardingUrl = response?.data?.onboarding_url

  if (onboardingUrl) {
    // Refresh accounts after onboarding returns
    accountsQuery.refetch()
    await navigateTo(onboardingUrl, { external: true })
  }
}

const editAccount = (account: any) => {
  editingAccount.value = account
  accountFormData.value = {
    display_name: account.display_name,
    is_active: account.is_active,
  }
  showAddAccountForm.value = true
}

const closeAccountForm = () => {
  showAddAccountForm.value = false
  editingAccount.value = null
  accountFormData.value = {
    display_name: '',
    is_active: true,
  }
}

const saveAccountChanges = async () => {
  if (!editingAccount.value?.stripe_account_id) return

  try {
    await updateAccountMutation.mutateAsync({
      stripeAccountId: editingAccount.value.stripe_account_id,
      body: {
        display_name: accountFormData.value.display_name,
        is_active: accountFormData.value.is_active,
      },
    })
    toast.add({
      title: 'Account updated',
      description: 'Your account settings have been saved.',
      color: 'green',
    })
    closeAccountForm()
  } catch (error) {
    console.error('Failed to update account:', error)
    toast.add({
      title: 'Failed to update account',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const setAccountAsPrimary = async (stripeAccountId: string) => {
  try {
    await setPrimaryMutation.mutateAsync(stripeAccountId)
    toast.add({
      title: 'Primary account updated',
      description: 'This account is now your primary account.',
      color: 'green',
    })
  } catch (error) {
    console.error('Failed to set primary account:', error)
    toast.add({
      title: 'Failed to set primary account',
      description: error instanceof Error ? error.message : 'An error occurred',
      color: 'red',
    })
  }
}

const deleteAccount = async (account: any) => {
  const isPrimary = account.is_primary
  const otherActiveExists = accounts.value.some(
    (a: any) => a.stripe_account_id !== account.stripe_account_id && a.is_active,
  )

  if (isPrimary && otherActiveExists) {
    toast.add({
      title: 'Cannot delete primary account',
      description: 'Set a different account as primary before deleting this one.',
      color: 'red',
    })
    return
  }

  const confirmMsg = `Permanently delete "${account.display_name}"? This cannot be undone.`
  if (confirm(confirmMsg)) {
    try {
      await deleteAccountMutation.mutateAsync(account.stripe_account_id)
      toast.add({
        title: 'Account deleted',
        description: 'The Stripe account has been removed.',
        color: 'green',
      })
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? (error instanceof Error ? error.message : 'An error occurred')
      toast.add({
        title: 'Failed to delete account',
        description: detail,
        color: 'red',
      })
    }
  }
}
</script>