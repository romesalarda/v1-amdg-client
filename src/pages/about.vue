<template>
  <div class="bg-white text-[#191c1e]">

    <!-- Hero Section -->
    <section class="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <UiFlowingBackground position="absolute" :speed="3" :soft="8" :palette="4" />

        <div class="absolute inset-0 bg-[#0B132B]/60"></div>
      </div>

      <div class="relative z-10 text-center px-6 md:px-16 max-w-4xl mx-auto">
        <span class="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em]">
          Ad Majorem Dei Gloriam
        </span>
        <h1 class="text-5xl md:text-7xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
          Uniting Hearts, <br>Igniting Faith.
        </h1>
        <p class="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          We are a digital sanctuary designed to empower the Catholic community through meaningful connections and world-class events.
        </p>
        <div class="flex flex-wrap justify-center gap-6">
          <a
            href="#mission"
            class="px-8 py-4 rounded-xl bg-white text-[#0B132B] text-sm font-bold uppercase tracking-wide hover:scale-105 transition-all shadow-xl"
          >Our Mission</a>
          <a
            href="#story"
            class="px-8 py-4 rounded-xl bg-transparent border-2 border-white/30 text-white text-sm font-bold uppercase tracking-wide hover:bg-white/10 transition-all"
          >Explore Our Story</a>
        </div>
      </div>

      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <span class="material-symbols-outlined text-white/50 text-4xl">keyboard_double_arrow_down</span>
      </div>
    </section>

    <!-- Our Mission (Bento Style) -->
    <section id="mission" class="py-24 px-6 md:px-16 max-w-[1280px] mx-auto" data-reveal>
      <div class="mb-16 text-center max-w-3xl mx-auto">
        <h2 class="text-4xl font-black text-[#0B132B] mb-4">A Mission Without Borders</h2>
        <div class="h-1.5 w-24 bg-[#00658d] mx-auto rounded-full mb-6"></div>
        <p class="text-[#4f6073] text-base leading-relaxed">
          AMDG serves as the bridge between tradition and the modern digital landscape, facilitating encounters that lead to spiritual growth and communal flourishing.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Main Bento Cell -->
        <div class="md:col-span-8 bg-gray-100 rounded-3xl p-10 flex flex-col justify-between group overflow-hidden relative border border-gray-200">
          <div class="relative z-10">
            <span class="material-symbols-outlined text-[#00658d] text-5xl mb-6 block" style="font-variation-settings: 'FILL' 1">church</span>
            <h3 class="text-3xl font-black text-[#0B132B] mb-4">Connect Communities</h3>
            <p class="text-[#4f6073] text-base max-w-md leading-relaxed">
              We believe that no parish is an island. Our platform unites disparate ministries into a single, vibrant ecosystem of faith-based engagement.
            </p>
          </div>
          <div class="absolute bottom-0 right-0 w-64 h-64 opacity-10 group-hover:opacity-20 transition-opacity translate-x-10 translate-y-10 pointer-events-none">
            <span class="material-symbols-outlined text-[200px] leading-none">hub</span>
          </div>
        </div>

        <!-- Small Bento Cell -->
        <div class="md:col-span-4 bg-[#00658d] text-white rounded-3xl p-10 flex flex-col items-center text-center justify-center hover:bg-[#005578] transition-colors">
          <span class="material-symbols-outlined text-5xl mb-6">event_available</span>
          <h4 class="text-lg font-black uppercase tracking-widest mb-2">Excellence in Events</h4>
          <p class="text-[10px] opacity-80 uppercase tracking-[0.2em] mb-6">Management Redefined</p>
          <div class="w-12 h-1 bg-white/30 rounded-full"></div>
        </div>

        <!-- Small Bento Cell 2 -->
        <div class="md:col-span-4 bg-[#0B132B] text-white rounded-3xl p-10 overflow-hidden relative group">
          <h4 class="text-lg font-black uppercase tracking-wide mb-4 relative z-10">Digital Stewardship</h4>
          <p class="text-base opacity-80 relative z-10 leading-relaxed">Leveraging modern tech for eternal truths.</p>
          <div class="absolute -bottom-4 -right-4 text-white/5 font-black text-8xl italic select-none">AMDG</div>
        </div>

        <!-- Wide Bento Cell -->
        <div class="md:col-span-8 bg-white rounded-3xl p-10 shadow-lg shadow-[#0B132B]/5 border border-gray-200 flex flex-col md:flex-row gap-8 items-center">
          <div class="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi38JP8VrXO_x2JAe0XRA3eqC-rzhXchI5SLgCULW_TAlasbKxD4iKJ4cbSLCwAgHBpmsB_M9kxwHEhU6VeSa_luhCPc0N1MZjPnCGDozPn-MPeuI_v2d6FZvHx9XDBaEMLSoRL6G5tZOc0JHiMbUu-PM345fNsPL1UZhcLYxcGVfNmIxCjI7PtleDADDH_pfZrdT3pVuJDBQoOtLBA-ot_Y_GLKYrVNv4MDAglEgJo6PVh51yNwxn76D4evgNHP5i-7UwZ__tyagQ"
              alt="Community gathering"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="w-full md:w-1/2">
            <h4 class="text-lg font-black text-[#0B132B] mb-3 uppercase tracking-wide">Empowering Leaders</h4>
            <p class="text-[#4f6073] text-base leading-relaxed">
              Providing ministry leaders with the tools they need to reach the next generation effectively and authentically.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Story Section -->
    <section id="story" class="py-24 bg-[#f2f4f6] overflow-hidden" data-reveal>
      <div class="px-6 md:px-16 max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <!-- Image Grid -->
        <div class="relative">
          <div class="absolute -top-12 -left-12 w-64 h-64 bg-[#00658d]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-12 -right-12 w-64 h-64 bg-[#0B132B]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 grid grid-cols-2 gap-4">
            <div class="space-y-4 pt-12">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjdLctze8d9piSEVuUn5FKJQ5AyK664PzFnvg4xvjgXayHxlzNQLzVXYaNBFHUALJ3-aGmBlZk5EozyIBZO2NlBD85vNETXV-atfxRmEfOfaKcM5JOWvZLCQZ9lAGr2qmI94rsQxtSWVzJdRGrB6Pd-Eni4_jntXZUlfLswTkPWYAu605c9pQlyuhEGAcy6YoBK7KUnhc4aIri-EtPc6_21ajMI3xW57cuySgVJZdbFsVyyg4SM_KpbutmMErQ8x3vZrEyUm3VVTZJ"
                alt="Technology"
                class="rounded-2xl shadow-xl w-full h-64 object-cover"
              />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBehgZ_4hqK8oSV_m3zBqw2xqogZzVI5bwukrlu5aN-nCrylmFnmY5YZi4lrSpz4wWV4jPT5BrtN1Uz1uXVTrY1IF0rjFuCQPuo3BmxoR1BZl7rOvYJJGeDHStJjxj9nB4db7e5LpmkRGvVL7_G0YXy1hgajb5NDHPCioTl3kJqemqXDWV0dd-0bQ453FpbiLTDRRwKkov_d3PZydmNkvMLTAUduPKyoe75zrdcSzsGahzlfA3xybU8wg7-O0_ukuecGEjkiHU6CM"
                alt="Collaboration"
                class="rounded-2xl shadow-xl w-full h-48 object-cover"
              />
            </div>
            <div class="space-y-4">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIIxFIY4CbP2o1q-41MAaYnCzyICLn0I5dWLlLYgvEJdrLJdCxxExhMlSXIEeNU0682UCqXH7q8J4Bxj-U19RhFNscdm633z3rbmTDdWa5UJqFa-0xh94ERVHTipimNIFawnjJ50pM3ZJoFRS8lpIPAmqIGKnNhoadsVqak7xAs011fcF4xfsbpYlHjmCVUPzsMFy9sZg2QTP9ylesj0Oc23oCFZ_p0euiLXls-C7Li1Z4EZQAC61SxwcoL0kpczkO_mUJuJPqZouh"
                alt="Event"
                class="rounded-2xl shadow-xl w-full h-48 object-cover"
              />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXHQYSgExdeGfuRS312Y-HaZhI3FBcczXlUoPtzlVLAh7nOSy1Rx-rllGm3wEqWlChCcrqMbEjQ6hP06vmp2u0Gb1sLr5bVk4qsLerxuhA8dYRSiDJ6tXPSSiO2GNg2ja0Sb3o5zMHFlSrqMBeFtI_SvFpTWJBCkMYfN-q_Z9Jz-0mZYPrK1a8FScM3dRzZE9UjHR6m_vMrb8t1ZiFWLkiJqBsrEPCk"
                alt="Community"
                class="rounded-2xl shadow-xl w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Text Content -->
        <div class="flex flex-col gap-6">
          <span class="text-[10px] text-[#00658d] font-black uppercase tracking-[0.2em]">Our Heritage</span>
          <h2 class="text-4xl font-black text-[#0B132B]">From Vision to Movement</h2>
          <p class="text-lg text-[#4f6073] leading-relaxed">
            AMDG was born out of a simple observation: the Church's message is eternal, but its digital tools were often antiquated. We started as a small group of technologists and theologians in 2022 who believed that the Catholic community deserved a world-class platform to manage its gatherings.
          </p>
          <p class="text-base text-[#4f6073]/80 leading-relaxed">
            Named after the Jesuit motto "Ad Majorem Dei Gloriam"—For the Greater Glory of God—we dedicate every line of code and every pixel to creating an experience that reflects the beauty and order of our faith.
          </p>
          <div class="flex items-center gap-6 mt-4">
            <div>
              <div class="text-3xl font-black text-[#0B132B]">500+</div>
              <div class="text-[10px] text-[#4f6073] font-black uppercase tracking-[0.15em]">Events Hosted</div>
            </div>
            <div class="h-10 w-px bg-gray-300"></div>
            <div>
              <div class="text-3xl font-black text-[#0B132B]">25k+</div>
              <div class="text-[10px] text-[#4f6073] font-black uppercase tracking-[0.15em]">Community Members</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team / Ministries Section -->
    <section class="py-24 px-6 md:px-16 max-w-[1280px] mx-auto" data-reveal>
      <div class="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div class="max-w-2xl">
          <h2 class="text-4xl font-black text-[#0B132B] mb-4">The Pillars of AMDG</h2>
          <p class="text-[#4f6073] text-base leading-relaxed">
            Our team is comprised of dedicated professionals from across the globe, united by a shared devotion to the Eucharist and excellence in service.
          </p>
        </div>
        <a href="#" class="group flex items-center gap-2 text-[#00658d] text-sm font-bold uppercase tracking-widest hover:translate-x-1 transition-transform">
          Join our Ministry
          <span class="material-symbols-outlined">arrow_right_alt</span>
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Ministry Card 1 -->
        <div class="group cursor-pointer">
          <div class="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZzWTK7ceWsDlICAd_KRfje5z88pQH5LuUP7zypgzl5a_D0lmSVEgSbnM1qDrvqtemKYbR1c5PMJROQT9yxISKFQhPewrXH8dbnuK4d2Hl4XeiyengfP3N4eGOxlOcwFqJlKxSccVkgVPBJinAUkPFg6y2LzRDeiuoDW7votxqkpfmnkPOxgOpnhdub1wrr6QY_SfkQ4-NSz1wY9jAYeERHaokJEAQxSWtJ_0OYKfedUauCnghBdfwntoUuRfpswPywbHUdJXTH781"
              alt="Development Team"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
              <p class="text-white text-sm leading-relaxed">Building the digital foundations for the Church's future.</p>
            </div>
          </div>
          <h4 class="text-base font-black text-[#0B132B] uppercase tracking-wide">Product &amp; Tech</h4>
          <p class="text-[10px] text-[#4f6073] font-black uppercase tracking-[0.2em] mt-1">The Architects</p>
        </div>

        <!-- Ministry Card 2 -->
        <div class="group cursor-pointer">
          <div class="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1jKIVzCP0T3HpaBuVgwTl5f-JBhhXb3GEpTqpXZvIV0ybrkRsUixwvopxre8R1v5bRopSM6DnIYKol_5rlCDyZ-uwSPDK46ew6JHUFwd3CwYa_gc59WtXPPp7BHrLwzv8r4rACfq8qGGetUyNJJXvHNNmmeBBUcgf1gWy8wG5JaqG2IpcQj_HjYQ-okrltiZPFfi92aHwUMBRbPAlEGE3yHF_6cQSLVGOFBvWYOou-RNPPno7cR2zLvBmNsVFRWfK0zSNfB"
              alt="Community Team"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
              <p class="text-white text-sm leading-relaxed">Ensuring every event feels like home for our users.</p>
            </div>
          </div>
          <h4 class="text-base font-black text-[#0B132B] uppercase tracking-wide">Community Growth</h4>
          <p class="text-[10px] text-[#4f6073] font-black uppercase tracking-[0.2em] mt-1">The Facilitators</p>
        </div>

        <!-- Ministry Card 3 -->
        <div class="group cursor-pointer">
          <div class="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBISxzj6H1cEOPb_70CLuizfDNdX7DX8021lENxg9VJtjZAY7fMn4D0NOftMv5PCOuq2UzoP9nytbdeuRBjwMOYSqjoSq0cFbAYX4hu2ljtXHhKUL0RBPGqdgmZNrUEalEK9pSJT_hH_vwHcuxujPT_SjMRdgEhmAe3Zp1vSfh6mqlERXqjnwSqdIKzvDg9ckvYdggBGIkhyaxCyaITwo3FbVjxsXctlZ0u3mE2rT09R_hhs_-k7pt1GOHrEOCUbv-ua4r5L8jhz5tA"
              alt="Design Team"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
              <p class="text-white text-sm leading-relaxed">Crafting beautiful interfaces that reflect divine order.</p>
            </div>
          </div>
          <h4 class="text-base font-black text-[#0B132B] uppercase tracking-wide">Experience Design</h4>
          <p class="text-[10px] text-[#4f6073] font-black uppercase tracking-[0.2em] mt-1">The Artisans</p>
        </div>

        <!-- Ministry Card 4 -->
        <div class="group cursor-pointer">
          <div class="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdvmuPtkHOQBg4mbbYOp5_NCjuLbsCfWaCLLxVxtRjvlwlgH-yCp_RVC45mmSZTTJulH9cu1J1-IXgP_k5kUcu6nOAEiEpeEGEPasAgiphNxatviSPeKBDHdF0N0sErQuFQtvvhfCcIVX5tRMUkgf5HdcL5_ZlZ6rGsTt6eU3w_Lm9XqlLcl4lGbpZ34oeuOMEWKP5_sDDumy0zf9nbm82Auzt5J1HSrhwn_FpBvD7GB_sYOl7CUzVd5MluXIRqgm7wnxEbYpn6udU"
              alt="Spiritual Advisors"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
              <p class="text-white text-sm leading-relaxed">Providing theological oversight for everything we build.</p>
            </div>
          </div>
          <h4 class="text-base font-black text-[#0B132B] uppercase tracking-wide">Faith &amp; Mission</h4>
          <p class="text-[10px] text-[#4f6073] font-black uppercase tracking-[0.2em] mt-1">The Stewards</p>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="py-24 px-6 md:px-16" data-reveal>
      <div class="max-w-[1280px] mx-auto bg-[#0B132B] rounded-[40px] p-12 md:p-24 overflow-hidden relative text-center">
        <div class="absolute inset-0 opacity-10 pointer-events-none">
          <div class="w-full h-full" style="background: radial-gradient(circle at center, #00658d 0%, transparent 70%)"></div>
        </div>
        <div class="relative z-10 max-w-2xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">Ready to grow your community?</h2>
          <p class="text-lg text-white/70 mb-12 leading-relaxed">
            Join the thousands of ministry leaders who are already using AMDG to transform their events into life-changing experiences.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink
              to="/register"
              class="px-10 py-5 bg-[#00658d] text-white text-sm font-bold uppercase tracking-wide rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[#00658d]/20"
            >
              Get Started Now
            </NuxtLink>
            <NuxtLink
              to="/events"
              class="px-10 py-5 bg-transparent border-2 border-white/20 text-white text-sm font-bold uppercase tracking-wide rounded-2xl hover:bg-white/5 transition-all"
            >
              Explore Events
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'booking',
})

useHead({
  title: 'About Us',
})

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
          entry.target.classList.remove('opacity-0', 'translate-y-8')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8')
    observer.observe(el)
  })
})
</script>