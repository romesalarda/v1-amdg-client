<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xs font-black text-primary uppercase tracking-widest">Consents</h3>
      <div class="flex gap-2">
        <UButton
          @click="$emit('mark-all-required-consents-as-given')"
          size="xs"
          color="green"
          variant="outline"
          icon="i-heroicons-check-circle"
        >
          Mark All Required
        </UButton>
        <UButton
          @click="$emit('set-show-add-consent-form', true)"
          size="xs"
          color="primary"
          icon="i-heroicons-plus"
        >
          Add Consent
        </UButton>
      </div>
    </div>

    <!-- Add Form -->
    <div v-if="showAddConsentForm" class="bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-200">
      <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Consent</h4>
      <form @submit.prevent="$emit('add-consent')" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Consent *</label>
          <select
            v-model="newConsent.consent"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option :value="null">Select consent...</option>
            <option
              v-for="consent in eventConsents"
              :key="consent.id"
              :value="consent.id"
            >
              {{ consent.title }} {{ consent.required ? '(Required)' : '' }}
            </option>
          </select>
        </div>
        <div class="flex items-center">
          <input
            v-model="newConsent.consent_given"
            type="checkbox"
            id="consent-given-new"
            class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
          />
          <label for="consent-given-new" class="ml-2 text-xs font-medium text-gray-700">Consent Given</label>
        </div>
        <div class="flex gap-2 pt-2">
          <UButton
            type="submit"
            :disabled="createConsentPending"
            size="sm"
            color="green"
          >
            {{ createConsentPending ? 'Adding...' : 'Add' }}
          </UButton>
          <UButton
            type="button"
            @click="$emit('cancel-add-consent')"
            size="sm"
            variant="ghost"
            color="gray"
          >
            Cancel
          </UButton>
        </div>
      </form>
    </div>

    <!-- List -->
    <div v-if="attendeeConsentsLoading" class="text-center py-8 text-gray-500 text-sm">
      Loading consents...
    </div>
    <div v-else-if="!attendeeConsents.length" class="text-center py-8 text-gray-500 text-sm">
      No consents recorded
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="consentRecord in attendeeConsents"
        :key="consentRecord.id"
        class="p-4 border border-gray-200 rounded-lg bg-gray-50/30"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h4 class="font-semibold text-gray-900 text-sm">{{ consentRecord.consent_details.title }}</h4>
              <UBadge v-if="consentRecord.consent_details.required" color="red" variant="soft" size="xs">
                Required
              </UBadge>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <UButton
                @click="$emit('toggle-consent-given', consentRecord)"
                :disabled="partialUpdateConsentPending"
                size="xs"
                :color="consentRecord.consent_given ? 'green' : 'gray'"
                variant="soft"
              >
                {{ consentRecord.consent_given ? 'Consent Given' : 'Consent Not Given' }}
              </UButton>
            </div>
            <p v-if="consentRecord.given_at" class="text-xs text-gray-600">
              Given: {{ new Date(consentRecord.given_at).toLocaleString() }}
            </p>
          </div>
          <UButton
            @click="$emit('delete-consent', consentRecord.id)"
            size="xs"
            color="red"
            variant="ghost"
            icon="i-heroicons-trash"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showAddConsentForm: boolean
  newConsent: { consent: number | null; consent_given: boolean }
  createConsentPending: boolean
  eventConsents: any[]
  attendeeConsentsLoading: boolean
  attendeeConsents: any[]
  partialUpdateConsentPending: boolean
}>()

defineEmits<{
  (event: 'set-show-add-consent-form', value: boolean): void
  (event: 'add-consent'): void
  (event: 'cancel-add-consent'): void
  (event: 'toggle-consent-given', consentRecord: any): void
  (event: 'delete-consent', id: number): void
  (event: 'mark-all-required-consents-as-given'): void
}>()
</script>
