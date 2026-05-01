<template>
  <div class="space-y-6">
    <!-- Booking Status Card -->
    <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="bg-primary px-6 py-4">
        <h3 class="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span class="material-symbols-outlined text-base">analytics</span>
          Booking Status
        </h3>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <p class="text-xs text-navy-500 mb-1">Ticket Types</p>
          <p class="text-2xl font-bold text-primary">{{ ticketTypesCount }}</p>
        </div>
        <div>
          <p class="text-xs text-navy-500 mb-1">Packages</p>
          <p class="text-2xl font-bold text-primary">{{ packagesCount }}</p>
        </div>
        <div>
          <p class="text-xs text-navy-500 mb-1">Active Discounts</p>
          <p class="text-2xl font-bold text-primary">{{ activeDiscountsCount }}</p>
        </div>
        <div>
          <p class="text-xs text-navy-500 mb-1">Sign-in Methods</p>
          <p class="text-2xl font-bold text-primary">{{ signInsCount }}</p>
        </div>
      </div>
    </section>

    <!-- Help Card -->
    <section class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden">
      <div class="px-6 py-4 border-b border-navy-50 flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-xl">lightbulb</span>
        <h3 class="text-[11px] font-black text-primary uppercase tracking-widest">Setup Tips</h3>
      </div>
      <div class="p-6 text-sm space-y-3 text-navy-600">
        <p>
          This page is for configuring your event's booking system. Follow the steps in order to set up your ticketing and registration options.
        </p>
        <p>
          <strong>Step 1:</strong> Create booking packages to define base pricing tiers (e.g., Standard, Early Bird).
        </p>
        <p>
          <strong>Step 2:</strong> Add discounts for special categories within packages (e.g., Students, Staff).
        </p>
        <p>
          <strong>Step 3:</strong> Define ticket types to control access scope (e.g., Single Day, Full Event, Workshop Pass).
        </p>
        <button
          @click="emit('show-guide')"
          class="flex items-center space-x-2 px-4 py-2 border-2 border-primary rounded-xl font-semibold text-xs hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <span class="material-symbols-outlined text-base">help</span>
          <span>Setup Guide</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ticketTypesCount: number
  packagesCount: number
  activeDiscountsCount: number
  signInsCount: number
}>()

const emit = defineEmits<{
  'show-guide': []
}>()
</script>
