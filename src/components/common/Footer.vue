<template>
  <footer class="bg-deep-navy text-white pt-20 pb-10">
    <div class="max-container-fluid flex flex-col md:flex-row justify-between items-start gap-12">
      <!-- Brand Section -->
      <div class="max-w-xs">
        <span class="text-2xl font-black tracking-tighter uppercase mb-6 block">AMDG</span>
        <p class="text-[10px] text-white/40 leading-relaxed font-bold tracking-widest uppercase">
          Digital engine for the greater glory of God. Building connections across the kingdom.
        </p>
      </div>

      <!-- Navigation Columns -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-16 md:gap-32">
        <!-- Marketplace -->
        <div>
          <h4 class="font-black mb-6 uppercase tracking-[0.3em] text-[9px] text-white/30">Marketplace</h4>
          <ul class="space-y-4 text-[10px] font-bold tracking-widest uppercase text-white/60">
            <li><NuxtLink to="/events" class="hover:text-blue-300 transition-colors no-underline">Tickets</NuxtLink></li>
            <li><a href="#" class="hover:text-blue-300 transition-colors">Merch</a></li>
            <li><a href="#" class="hover:text-blue-300 transition-colors">Donate</a></li>
          </ul>
        </div>

        <!-- Organization -->
        <div>
          <h4 class="font-black mb-6 uppercase tracking-[0.3em] text-[9px] text-white/30">Organization</h4>
          <ul class="space-y-4 text-[10px] font-bold tracking-widest uppercase text-white/60">
            <li><NuxtLink to="/events" class="hover:text-blue-300 transition-colors no-underline">Events</NuxtLink></li>
            <li><NuxtLink to="/communities" class="hover:text-blue-300 transition-colors no-underline">Partners</NuxtLink></li>
            <li><a href="#" class="hover:text-blue-300 transition-colors">About</a></li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="font-black mb-6 uppercase tracking-[0.3em] text-[9px] text-white/30">Legal</h4>
          <ul class="space-y-4 text-[10px] font-bold tracking-widest uppercase text-white/60">
            <li><a href="#" class="hover:text-blue-300 transition-colors">Privacy Policy</a></li>
            <li><a href="#" class="hover:text-blue-300 transition-colors">Terms of Use</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="max-container-fluid mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
      <p>© {{ new Date().getFullYear() }} AMDG GLOBAL. ALL RIGHTS RESERVED.</p>
      <div class="flex space-x-12 mt-6 md:mt-0">
        <a href="#" class="hover:text-white transition-colors">Twitter</a>
        <a href="#" class="hover:text-white transition-colors">Instagram</a>
        <a href="#" class="hover:text-white transition-colors">LinkedIn</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
