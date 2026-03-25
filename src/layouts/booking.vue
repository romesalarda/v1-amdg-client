<template>
  <div class="min-h-screen bg-white font-display text-deep-navy">
    <div class="relative z-10 flex min-h-screen flex-col">
      <Navbar />
      <main class="flex-1">
        <slot />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '~/components/common/Navbar.vue'
import Footer from '~/components/common/Footer.vue'
</script>
