<template>
  <div class="min-h-screen bg-background-dark font-display text-white">
    <div class="fixed inset-0 pointer-events-none z-0 booking-grid"></div>
    <div class="fixed inset-0 pointer-events-none z-0 booking-vignette"></div>

    <div class="relative z-10 flex min-h-screen flex-col">
      <Navbar />
      <main class="flex-1 px-4 py-6 md:px-6 md:py-8">
        <div class="mx-auto w-full max-w-6xl rounded-2xl border border-[#ecc81333] bg-[#101826e6] p-4 shadow-[0_0_0_1px_rgba(236,200,19,0.08),0_20px_80px_rgba(0,0,0,0.45)] md:p-6">
          <slot />
        </div>
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '~/components/common/Navbar.vue'
import Footer from '~/components/common/Footer.vue'
</script>

<style scoped>
.booking-grid {
  background-image:
    linear-gradient(to right, rgba(236, 200, 19, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(236, 200, 19, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
}

.booking-vignette {
  background:
    radial-gradient(circle at 20% 20%, rgba(236, 200, 19, 0.14), transparent 35%),
    radial-gradient(circle at 80% 10%, rgba(35, 91, 173, 0.18), transparent 40%),
    radial-gradient(circle at 50% 100%, rgba(236, 200, 19, 0.08), transparent 50%);
}
</style>
