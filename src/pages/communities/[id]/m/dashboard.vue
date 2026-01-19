<template>
  <CommunitiesManagementLayout :organisation-id="organisationId" :organisation="organisation">
    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <USkeleton v-for="i in 8" :key="i" class="h-32" />
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="organisation" class="space-y-8">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Members -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Members</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ organisation.memberships_count || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-green-600 font-medium">+12%</span>
            <span class="text-gray-600 ml-2">vs last month</span>
          </div>
        </div>

        <!-- Controllers -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Controllers</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ organisation.controllers_count || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-gray-600">Leadership team</span>
          </div>
        </div>

        <!-- Upcoming Events -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">8</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-calendar" class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-gray-600">Next 30 days</span>
          </div>
        </div>

        <!-- Pending Requests -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pending Requests</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">3</p>
            </div>
            <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-amber-600 font-medium">Needs review</span>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Activity -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="i in 5" :key="i" class="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-user-plus" class="w-5 h-5 text-gray-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">New member joined</p>
                  <p class="text-sm text-gray-600">John Doe joined the community</p>
                  <p class="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats by Location -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">By Location</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-400" />
                <span class="text-sm font-medium text-gray-900">Countries</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">4</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-map" class="w-5 h-5 text-gray-400" />
                <span class="text-sm font-medium text-gray-900">Areas</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">12</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-building-office" class="w-5 h-5 text-gray-400" />
                <span class="text-sm font-medium text-gray-900">Clusters</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">28</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-home" class="w-5 h-5 text-gray-400" />
                <span class="text-sm font-medium text-gray-900">Chapters</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">67</span>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Events by Area</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">London</span>
                  <span class="font-medium text-gray-900">24</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Manchester</span>
                  <span class="font-medium text-gray-900">18</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Birmingham</span>
                  <span class="font-medium text-gray-900">15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leadership Overview -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Leadership Overview</h2>
          <UButton 
            :to="`/communities/${organisationId}/m/invite`"
            size="sm"
            icon="i-heroicons-plus"
          >
            Manage Team
          </UButton>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-user" class="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Controller {{ i }}</p>
                <p class="text-xs text-gray-600">National Leader</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CommunitiesManagementLayout>
</template>

<script setup lang="ts">
import { useOrganisation } from '~/composables/resources/organisation/organisations'

definePageMeta({
  middleware: ['auth', 'organisation-controller'],
  layout: 'default',
})

const route = useRoute()
const organisationId = computed(() => route.params.id as string)

useHead({
  title: 'Management Dashboard',
})

// Fetch organization data
const { data: orgData, isLoading } = useOrganisation(computed(() => Number(organisationId.value)))
const organisation = computed(() => orgData.value?.data)
</script>