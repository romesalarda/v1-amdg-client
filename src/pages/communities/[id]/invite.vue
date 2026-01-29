<script setup lang="ts">
import { useOrganisation } from '~/composables/resources/organisation/organisations'
import { useOrganisationMemberships, useCreateOrganisationMembership, useVerifyOrganisationMembershipWithCode } from '~/composables/resources/organisation/organisationMemberships'

import type { OrganisationDetail } from '~/api/types.gen'

import { useAuthStore } from '~/stores/auth'
import { resolveImageUrl, onImageError } from '~/utils/image'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useField } from 'vee-validate'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const route = useRoute()
const authStore = useAuthStore()
const { $notyf } = useNuxtApp()

const organisationId = computed(() => route.params.id as string)

useHead({
  title: `Join Community'`,
  meta: [
    { name: 'description', content: 'Join this organization with an acceptance code' }
  ]
})

// Fetch organization data
const { data: orgData, isLoading: orgLoading, isError: orgError } = useOrganisation(Number(organisationId.value))

const organisation = computed(() => orgData.value?.data)

// Check if user is already a member
const { data: membershipsData } = useOrganisationMemberships(computed(() => ({
  organisation: Number(organisationId.value),
  user: authStore.user?.id,
})))

const existingMembership = computed(() => {
  const memberships = membershipsData.value?.data?.results || []
  return memberships.find(m => m.user === authStore.user?.id)
})

const isMember = computed(() => !!existingMembership.value)
const isVerified = computed(() => existingMembership.value?.is_verified)

// Form validation
const validationSchema = toTypedSchema(
  z.object({
    code: z.string().min(1, 'Acceptance code is required'),
  })
)

const { handleSubmit, errors } = useForm({
  validationSchema,
})

const { value: code } = useField<string>('code')

// Pre-fill code from URL query parameter
onMounted(() => {
  const urlCode = route.query.code as string
  if (urlCode) {
    code.value = urlCode.toUpperCase()
  }
})

// Mutations
const { mutate: createMembership, isPending: creatingMembership } = useCreateOrganisationMembership()
const { mutate: verifyMembership, isPending: verifyingMembership } = useVerifyOrganisationMembershipWithCode()

const isSubmitting = computed(() => creatingMembership.value || verifyingMembership.value)

const onSubmit = handleSubmit((values) => {
  if (!organisation.value) return

  // If user already has membership but not verified, just verify it
  // if (existingMembership.value && !isVerified.value) {
  //   verifyWithCode(existingMembership.value.id, values.code)
  //   return
  // }

  // If no membership, create one first then verify
  if (!isMember.value) {
    createMembership({
      organisation: Number(organisationId.value),
      user: authStore.user!.id,
      access_code: values.code,
    }, {
      onSuccess: (response: any) => { // TODO: update schema to remove any
        const membershipId = response.data?.id
        if (membershipId) {
          $notyf?.success('Successfully joined the community!')
          setTimeout(() => {
            navigateTo(`/communities/${organisationId.value}`)
          }, 1500)
        } else {
          $notyf?.error('Your access code is invalid or has expired')
        }
      },
      onError: (error: any) => {
        $notyf?.error(error?.body?.error || error?.message || 'Failed to create membership')
      }
    })
  }
})

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Back Button -->
      <UButton 
        :to="`/communities/${organisationId}`" 
        icon="i-heroicons-arrow-left" 
        variant="ghost" 
        color="gray" 
        class="mb-6"
      >
        Back to Community
      </UButton>

      <!-- Loading State -->
      <div v-if="orgLoading" class="space-y-4">
        <USkeleton class="h-32 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-32" />
      </div>

      <!-- Error State -->
      <div v-else-if="orgError" class="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-10 w-10 text-red-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Failed to load community</h3>
        <p class="text-gray-600 mb-6">Please try again later</p>
        <UButton to="/communities" size="lg">
          Back to Communities
        </UButton>
      </div>

      <!-- Already Verified Member -->
      <div v-else-if="isMember && isVerified" class="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="mb-6" v-if="organisation?.logo">
          <img 
            :src="resolveImageUrl(organisation.logo)" 
            :alt="organisation.title"
            @error="onImageError"
            class="w-24 h-24 rounded-full object-cover mx-auto shadow-lg"
          />
        </div>
        
        <div class="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-heroicons-check-circle" class="h-12 w-12 text-green-600" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">You're already a member!</h3>
        <p class="text-gray-600 mb-6">You have full access to {{ organisation?.title }}</p>
        
        <UButton :to="`/communities/${organisationId}`" size="lg">
          Go to Community
        </UButton>
      </div>

      <!-- Join Form -->
      <div v-else-if="organisation" class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Organization Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
          <div class="mb-4" v-if="organisation.logo">
            <div class="w-24 h-24 mx-auto bg-white rounded-2xl p-3 shadow-lg">
              <img 
                :src="resolveImageUrl(organisation.logo)" 
                :alt="organisation.title"
                @error="onImageError"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
          <div v-else class="w-24 h-24 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <UIcon name="i-heroicons-building-office" class="w-12 h-12 text-white" />
          </div>
          
          <h1 class="text-3xl font-bold text-white mb-2">Join {{ organisation.title }}</h1>
          <p class="text-blue-100">
            Enter your acceptance code to join this community
          </p>
        </div>

        <!-- Acceptance Code Form -->
        <div class="p-8">
          <form @submit="onSubmit" class="space-y-6">
            <!-- Code Input -->
            <div>
              <label for="code" class="block text-sm font-semibold text-gray-900 mb-2">
                Acceptance Code
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UIcon name="i-heroicons-key" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  v-model="code"
                  type="text"
                  placeholder="Enter code (e.g., ABC123)"
                  class="w-full pl-12 pr-4 py-4 text-lg font-mono border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase transition-colors"
                  :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.code }"
                  :disabled="isSubmitting"
                  @input="(e) => code = (e.target as HTMLInputElement).value.toUpperCase()"
                />
              </div>
              <p v-if="errors.code" class="mt-2 text-sm text-red-600 flex items-center gap-1">
                <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
                {{ errors.code }}
              </p>
              <p v-else class="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                Codes are case-insensitive and will be automatically formatted
              </p>
            </div>

            <!-- Submit Button -->
            <UButton 
              type="submit" 
              :loading="isSubmitting"
              :disabled="isSubmitting"
              block
              size="xl"
              color="primary"
              class="text-lg font-semibold"
            >
              <UIcon v-if="!isSubmitting" name="i-heroicons-arrow-right-circle" class="w-5 h-5 mr-2" />
              {{ isMember ? 'Verify Code' : 'Join Community' }}
            </UButton>
          </form>

          <!-- Additional Info -->
          <div class="mt-8 pt-6 border-t border-gray-200 text-center">
            <p class="text-sm text-gray-600 mb-3">Don't have an acceptance code?</p>
            <UButton 
              :to="`/communities/${organisationId}`" 
              variant="ghost" 
              class="text-sm"
            >
              Back to Community Page
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
