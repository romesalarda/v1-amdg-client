<template>
  <div class="rounded-2xl border border-deep-navy/10 bg-white p-3">
    <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
      <NuxtLink
        v-for="step in steps"
        :key="step.key"
        :to="step.href"
        class="group rounded-xl border px-3 py-3 transition-all"
        :class="[
          activeStep === step.key
            ? 'border-deep-navy bg-deep-navy text-white'
            : 'border-deep-navy/10 bg-mist-blue text-deep-navy hover:border-blue-300',
        ]"
      >
        <p class="text-[10px] font-black uppercase tracking-[0.2em]" :class="activeStep === step.key ? 'text-blue-200' : 'text-deep-navy/55'">
          {{ step.kicker }}
        </p>
        <div class="mt-1 flex items-center justify-between">
          <p class="text-sm font-black uppercase tracking-wide">{{ step.label }}</p>
          <span
            v-if="step.key === 'cart'"
            class="rounded-full px-2 py-0.5 text-[10px] font-black"
            :class="activeStep === step.key ? 'bg-white/20 text-white' : 'bg-deep-navy text-white'"
          >
            {{ cartCount }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  eventId: string
  bookingReference: string
  activeStep: 'shop' | 'cart' | 'checkout'
  cartCount?: number
}>()

const cartCount = computed(() => props.cartCount || 0)

const steps = computed(() => {
  const base = `/events/${props.eventId}/b/${props.bookingReference}/shop`
  return [
    {
      key: 'shop' as const,
      label: 'Shop',
      kicker: 'Step 1',
      href: base,
    },
    {
      key: 'cart' as const,
      label: 'Cart',
      kicker: 'Step 2',
      href: `${base}/cart`,
    },
    {
      key: 'checkout' as const,
      label: 'Checkout',
      kicker: 'Step 3',
      href: `${base}/checkout`,
    },
  ]
})
</script>
