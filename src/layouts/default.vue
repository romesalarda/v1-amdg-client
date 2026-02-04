<template>
  <div class="min-h-screen bg-background-dark font-display text-white">
    <!-- Blueprint Grid Background -->
    <div class="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col min-h-screen">
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

<style>
.blueprint-grid {
  background-image: 
    linear-gradient(to right, rgba(236, 200, 19, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(236, 200, 19, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
