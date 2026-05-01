<template>
  <div
    v-if="visible"
    @click.self="emit('update:visible', false)"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div class="bg-white border border-deep-navy/10 rounded-2xl shadow-drawn overflow-hidden p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-navy-50">
        <span class="material-symbols-outlined text-primary text-2xl">school</span>
        <h3 class="text-base font-black text-primary dark:text-white uppercase tracking-widest">Booking Setup Guide</h3>
      </div>

      <div class="space-y-6 text-navy-900 dark:text-slate-200">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
          <div class="flex-1">
            <h4 class="font-bold text-primary mb-2">Booking Packages (Required)</h4>
            <p class="text-sm text-primary">
              Start by creating booking packages. These define your base pricing tiers and what attendees will purchase.
              For example: "Standard Registration", "Early Bird Special", or "VIP Package". Each package is linked to
              one or more ticket types and has a base price.
            </p>
            <p class="text-xs text-navy-500 mt-2 italic text-primary">
              💡 Tip: Create different packages for different registration periods or attendee categories.
            </p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
          <div class="flex-1">
            <h4 class="font-bold text-primary dark:text-white mb-2">Discounts (Optional)</h4>
            <p class="text-sm leading-relaxed text-navy-700 dark:text-slate-300 text-primary">
              Add discounts for special groups within each package. For instance, students might get 10% off the
              Standard Registration package, or event staff might get 20% off. You can define eligibility rules
              to automatically apply discounts based on attendee attributes like age, role, or organization.
            </p>
            <p class="text-xs text-navy-500 mt-2 italic text-primary">
              💡 Tip: Use eligibility rules to automatically validate who qualifies for each discount.
            </p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
          <div class="flex-1">
            <h4 class="font-bold text-primary dark:text-white mb-2">Ticket Types (Required)</h4>
            <p class="text-sm leading-relaxed text-navy-700 dark:text-slate-300 text-primary">
              Finally, create ticket types to define what access attendees get. These control authorization and scope.
              For example: "Single Day Pass" (one day only), "Full Event Pass" (all days), or "Workshop Pass" (workshops only).
              Ticket types have validity periods and define what parts of your event attendees can access.
            </p>
            <p class="text-xs text-navy-500 mt-2 italic text-primary">
              💡 Tip: Ticket types must be created before packages, as packages reference them.
            </p>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-blue-600 text-xl">info</span>
            <div class="text-sm">
              <p class="font-semibold text-blue-400 mb-1">Order Matters!</p>
              <p class="text-blue-800 text-xs leading-relaxed">
                Create <strong>Ticket Types</strong> first, then <strong>Packages</strong> (which reference ticket types),
                and finally <strong>Discounts</strong> (which apply to specific packages).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6 pt-4 border-t border-navy-50">
        <button
          @click="emit('update:visible', false)"
          class="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-navy-600 transition-all"
        >
          Got It!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()
</script>
