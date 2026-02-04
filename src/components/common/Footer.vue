<template>
  <footer class="border-t border-primary/20 bg-background-dark py-16">
    <div class="max-w-7xl mx-auto px-6 lg:px-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <!-- Brand Section -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-3 mb-6">
            <div class="size-8 flex items-center justify-center border border-primary text-primary rounded-sm bg-navy-accent/30">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h2 class="text-xl font-bold tracking-widest text-primary">AMDG</h2>
          </div>
          <p class="text-white/50 max-w-sm leading-relaxed mb-8">
            Ad Maiorem Dei Gloriam. Designing the architectural framework for the modern Church's spiritual engagement.
          </p>
          <div class="flex gap-4">
            <a href="#" class="size-10 border border-primary/20 flex items-center justify-center rounded-sm text-primary hover:bg-primary hover:text-background-dark transition-all" aria-label="Website">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </a>
            <a href="#" class="size-10 border border-primary/20 flex items-center justify-center rounded-sm text-primary hover:bg-primary hover:text-background-dark transition-all" aria-label="Email">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
            <a href="#" class="size-10 border border-primary/20 flex items-center justify-center rounded-sm text-primary hover:bg-primary hover:text-background-dark transition-all" aria-label="RSS">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="6" cy="18" r="2"></circle>
                <path d="M4 4a16 16 0 0 1 16 16"></path>
                <path d="M4 11a9 9 0 0 1 9 9"></path>
              </svg>
            </a>
          </div>
        </div>

        <!-- Foundation Links -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-[0.3em] text-white mb-6">Foundation</h4>
          <ul class="flex flex-col gap-4">
            <li><a href="#" class="text-sm text-white/50 hover:text-primary transition-colors">Specifications</a></li>
            <li><a href="#" class="text-sm text-white/50 hover:text-primary transition-colors">Our History</a></li>
            <li><a href="#" class="text-sm text-white/50 hover:text-primary transition-colors">Theological Pillars</a></li>
            <li><a href="#" class="text-sm text-white/50 hover:text-primary transition-colors">Code of Conduct</a></li>
          </ul>
        </div>

        <!-- Network Links -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-[0.3em] text-white mb-6">Network</h4>
          <ul class="flex flex-col gap-4">
            <li><NuxtLink to="/events" class="text-sm text-white/50 hover:text-primary transition-colors no-underline">Parish Directory</NuxtLink></li>
            <li><a href="#" class="text-sm text-white/50 hover:text-primary transition-colors">Mission Map</a></li>
            <li><a href="#" class="text-sm text-white/50 hover:text-primary transition-colors">Technical Support</a></li>
            <li><a href="#" class="text-sm text-white/50 hover:text-primary transition-colors">Privacy Plan</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-[10px] uppercase tracking-[0.2em] text-white/40">
          © {{ new Date().getFullYear() }} AMDG Event Architectures. All Rights Reserved.
        </p>
        <div class="flex gap-8">
          <span class="text-[10px] uppercase tracking-[0.2em] text-primary/50">Build Ver: 1.1.0-NAVY</span>
          <span class="text-[10px] uppercase tracking-[0.2em] text-primary/50">Status: Sacred // Secure</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
