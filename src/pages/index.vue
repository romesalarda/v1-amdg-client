<template>
  <div class="bg-white text-[#181c20] selection:bg-[#bec5e5] selection:text-[#181c20]">
    <header class="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-10">
      <div class="flex items-start justify-between">
        <div class="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0B132B]/55 px-4 py-3 text-white shadow-[0_14px_34px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:gap-4 sm:px-5">
          <NuxtLink to="/" class="text-sm font-black tracking-[0.16em] no-underline sm:text-base">
            AMDG
          </NuxtLink>

          <div class="relative" ref="locationRoot">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100 transition-colors hover:bg-white/20"
              @click="isLocationOpen = !isLocationOpen"
            >
              <img src="/assets/images/uk.png" alt="UK" class="h-4 w-4 rounded-full object-cover" />
              <span>UK</span>
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              v-if="isLocationOpen"
              class="absolute left-0 top-[calc(100%+0.5rem)] min-w-[150px] overflow-hidden rounded-xl border border-white/20 bg-[#0B132B]/90 p-1 shadow-xl backdrop-blur-xl"
            >
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-blue-100 transition-colors hover:bg-white/10"
                @click="isLocationOpen = false"
              >
                <img src="/assets/images/uk.png" alt="UK" class="h-4 w-4 rounded-full object-cover" />
                United Kingdom
              </button>
            </div>
          </div>
        </div>

        <div class="inline-flex items-center rounded-2xl border border-white/15 bg-[#0B132B]/55 p-2 text-white shadow-[0_14px_34px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <NuxtLink
            to="/profile"
            class="group relative block rounded-full border border-white/30 p-[2px] transition-colors hover:border-white"
            aria-label="Go to profile"
          >
            <div class="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-[#dbe1ff] to-[#7b83a0]">
              <img
                v-if="profileImageUrl"
                :src="profileImageUrl"
                alt="Profile"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-xs font-black text-[#0B132B]">
                {{ profileInitials }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <section class="relative flex min-h-[820px] items-center justify-center overflow-hidden bg-[#0B132B] px-6 lg:px-12">
        <div class="absolute inset-0 z-0 overflow-hidden">
          <UiFlowingBackground position="absolute" :speed="3" :soft="8" :palette="4" />
          <div class="absolute inset-0"></div>
          <div class="absolute inset-0 opacity-25"></div>
        </div>

        <div class="relative z-10 mx-auto max-w-5xl text-center" data-reveal data-reveal-delay="0ms">
          <h1 class="mx-auto mb-8 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl">
            Elevating the <span class="italic text-[#dbe1ff]">Sacred Mission</span>
          </h1>
          <p class="mx-auto mb-12 max-w-2xl text-lg font-light leading-relaxed text-blue-100/90 md:text-xl">
            We believe administrative excellence is a profound form of stewardship. Empower your parish with tools built for the sanctity of the mission.
          </p>

          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <NuxtLink class="rounded-full bg-white px-10 py-5 text-sm font-bold tracking-wide text-[#0B132B] shadow-xl shadow-black/20 transition-all hover:bg-[#e5e8ed]" to="/register">
              Get Started
            </NuxtLink>
            <NuxtLink class="rounded-full border border-white/25 bg-white/10 px-10 py-5 text-sm font-bold tracking-wide text-white shadow-[0_8px_24px_rgba(24,28,32,0.06)] backdrop-blur-xl transition-all hover:bg-white/20" to="/my-dashboard">
              My Bookings
            </NuxtLink>
          </div>
        </div>
      </section>

      <section class="bg-white py-24">
        <div class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-20 px-6 lg:grid-cols-2 lg:px-12">
          <div class="relative" data-reveal data-reveal-delay="0ms">
            <div class="overflow-hidden rounded-[2rem] shadow-[0_8px_24px_rgba(24,28,32,0.06)] transition-transform duration-700 hover:-rotate-0 md:-rotate-2">
              <img
                class="h-64 w-full object-cover md:h-[500px]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa4BaR_5Nhf4JxVaIijAFMVgtqbH54u1t_ev_tPy7X40sgwAfideiKINe8LcOfpcMaPJIFoCD3hSN_GS5faZy8QYEzQ0B_b-v0a12rTdalSv_6wwud09bd6_cezKj3Rc_5W0s31TKM822FEOlQUb48_FKB_uPnS7bLcKMkBNtUDnZciC-e_WcLK2PR39r6mfeC7e7dD3SMQ4th6iYOZh940nKnxgjldR0-s7nL4RDDwtq68BQnqU--WRwMFcM6SKx-uKDxY64S7jY"
                alt="A diverse group of Catholic community members gathered in a warm sunlit parish hall"
              />
            </div>
            <div class="absolute -bottom-6 -right-6 max-w-[240px] rounded-[1.5rem] bg-[#0B132B] p-8 text-white shadow-[0_8px_24px_rgba(24,28,32,0.06)]" data-reveal data-reveal-delay="120ms">
              <p class="mb-2 text-3xl font-bold leading-none">500+</p>
              <p class="text-[10px] uppercase tracking-widest text-slate-400">Parishes trusted us</p>
            </div>
          </div>

          <div class="space-y-8" data-reveal data-reveal-delay="80ms">
            <h2 class="text-4xl font-bold leading-tight text-[#0B132B] md:text-5xl">Service Beyond Software</h2>
            <p class="text-lg leading-relaxed text-[#4f6073]">
              At AMDG, we don't just provide a dashboard; we offer a supportive partnership. Our platform is designed to handle the complexity of diocesan logistics so you can focus on the heart of your ministry.
            </p>
            <div class="flex items-start gap-4" data-reveal data-reveal-delay="140ms">
              <span class="mt-1 text-4xl text-[#131a33]">✦</span>
              <div>
                <h4 class="font-bold text-[#0B132B]">Mission-First Approach</h4>
                <p class="text-sm text-[#4f6073]">Every feature is prayerfully considered to ensure it serves the spiritual health of your flock.</p>
              </div>
            </div>
            <div class="flex items-start gap-4" data-reveal data-reveal-delay="220ms">
              <span class="mt-1 text-4xl text-[#131a33]">✦</span>
              <div>
                <h4 class="font-bold text-[#0B132B]">Concierge Support</h4>
                <p class="text-sm text-[#4f6073]">A dedicated team that understands parish life, available when you need them most.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-[#f1f4f9] py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-12">
          <div class="mb-20 text-center" data-reveal data-reveal-delay="0ms">
            <h2 class="mb-4 text-5xl font-extrabold tracking-tight text-[#0B132B]">Core Capabilities</h2>
            <div class="mx-auto h-1.5 w-24 rounded-full bg-[#131a33]"></div>
          </div>

          <div class="grid h-auto grid-cols-1 gap-8 md:grid-cols-12">
            <article class="group overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-[0_8px_24px_rgba(24,28,32,0.06)] transition-all duration-700 md:col-span-8 md:flex md:flex-col md:justify-between" data-reveal data-reveal-delay="40ms">
              <div class="max-w-md">
                <div class="mb-6 text-5xl text-[#131a33]">✦</div>
                <h3 class="mb-4 text-2xl font-bold text-[#0B132B]">Seamless Registration</h3>
                <p class="leading-relaxed text-[#4f6073]">Elegant, intuitive flows for your parishioners to join retreats, classes, and special liturgies without technical friction.</p>
              </div>
              <div class="mt-8 flex items-center gap-4">
                <NuxtLink class="text-xs font-bold uppercase tracking-widest text-[#0B132B] transition-transform duration-300 group-hover:translate-x-2" to="/events">Explore Feature</NuxtLink>
                <span class="text-sm text-[#131a33]">→</span>
              </div>
            </article>

            <article class="rounded-[2.5rem] bg-[#131a33] p-10 text-white shadow-[0_8px_24px_rgba(24,28,32,0.06)] md:col-span-4 md:flex md:flex-col md:justify-between" data-reveal data-reveal-delay="120ms">
              <div class="mb-6 text-5xl text-[#bec5e5]">✦</div>
              <div>
                <h3 class="mb-4 text-2xl font-bold">Secure Payments</h3>
                <p class="text-sm leading-relaxed text-slate-300">Ecclesiastical-grade security for tithes and event fees, ensuring complete peace of mind for every donor.</p>
              </div>
            </article>

            <article class="rounded-[2.5rem] bg-white p-10 shadow-[0_8px_24px_rgba(24,28,32,0.06)] md:col-span-4 md:flex md:flex-col md:justify-between" data-reveal data-reveal-delay="80ms">
              <div class="mb-6 text-5xl text-[#131a33]">✦</div>
              <div>
                <h3 class="mb-4 text-2xl font-bold text-[#0B132B]">Mission Analytics</h3>
                <p class="text-sm leading-relaxed text-[#4f6073]">Visualize growth and engagement within your parish with soulful, clarity-focused reporting.</p>
              </div>
            </article>

            <article class="rounded-[2.5rem] bg-white p-10 shadow-[0_8px_24px_rgba(24,28,32,0.06)] transition-all duration-700 md:col-span-8 md:flex md:flex-row md:items-center md:gap-10" data-reveal data-reveal-delay="160ms">
              <div class="flex-1">
                <div class="mb-6 text-5xl text-[#131a33]">✦</div>
                <h3 class="mb-4 text-2xl font-bold text-[#0B132B]">Unified Dashboard</h3>
                <p class="leading-relaxed text-[#4f6073]">One central source of truth for all events, volunteers, and bookings across your entire diocese network.</p>
              </div>
              <div class="mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-[#e5e8ed] md:mt-0 md:w-1/2">
                <img class="h-full w-full object-cover opacity-80 mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtx720gtMoogPH0VDJPIUcZrkGbSnvPb-BBJdjhyVA6yq7jMNxsTtiuVVJc-uMVy91HIMR7WkEiXYllbuyHMBlRjwuJs-1LD_MsUpgQoYC8DlRTf6Q3eiTP1ZiqeksiRqZr5CK95HkTnxNZ8SEX_6ba6q8gANbFxgfxnu10FE3GnvZ9D_vbDr0Pnq7XieJaHUDhfla-VbKNw9YNkAxBJTuhRWe0gT68AW6NDuJ61eT5ORkoFTQIarvniF90rtGSIag3KjPCKreIJk" alt="Clean modern data visualization dashboard showing community engagement metrics" />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-white py-32">
        <div class="mx-auto max-w-4xl px-6 text-center lg:px-12">
          <h2 class="mb-8 text-4xl font-bold tracking-tight text-[#0B132B]" data-reveal data-reveal-delay="0ms">Fellowship &amp; Mission</h2>
          <p class="mb-12 text-lg italic text-[#4f6073]" data-reveal data-reveal-delay="80ms">"Joining the AMDG network transformed how our diocese connects. The administrative burden vanished, allowing us to focus entirely on spiritual accompaniment."</p>
          <div class="flex flex-col items-center">
            <div class="mb-6 flex -space-x-4" data-reveal data-reveal-delay="120ms">
              <img class="h-16 w-16 rounded-full border-4 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALD2yJmG4EuTDRVmreYOFDrYuxbnjaRl30weerxxFs-tUXpGhC1l0oQPIAQGr-KRPzPWtU3iQZwcS7bBZV8l-UAx3w3XIYlhbBnpNmMxYQMdORc1nBB_e--XqLwIOXERY7ckhJdCKO_tN4X1V14jWOLatZS_5kQ4b7IlXAYrATMLKHHGM4C-H0YA30ZbHvgari2XUn6JMtNmFwugltj1pCykJMEdXxB4KvN0Qkyi6PZMEw2tSlt0AR1QDpc4jDQ62r7A0UG0UBawY" alt="Portrait of a smiling middle-aged man in business casual attire" />
              <img class="h-16 w-16 rounded-full border-4 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXqn9kYwKbicEKKuwzzNZggOCAV6k1wWkXyz_Owcr2QKSePFqqU3vIgWnMSSaUnl9TvllGVgGpHow0sHT20OOaHG3LyrqDIrhKLZMcu2SZxWofNzLW0SiaMenqvFbyFayker_2Eig5ihOLLZm-rEgqX6GklwMzD2hHiuMYyZlZdl1Po6zOdRUJIK3c6UEZi2b1pKzC66vtmwg9YSglvj2J3vip_IJY0xZxsdqTTeJkFAa0o_I2L3zdfBshLTR5noQ5IRWnGMui-yY" alt="Portrait of a young woman with a warm and friendly smile" />
              <img class="h-16 w-16 rounded-full border-4 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4o2D5xQMiec4ryHls5TCPrRScXvw72NPqzMAPP6LbaKRdNqt0F0zL9VdKGYGxwIQ0Ibf98MdHhwfDtowHUoeeLa4kcF5kicO9X6R4xnFSFQPZwMDmt1gHk6ubxRo-cz76hgQnPWnN8jM55WFOW9SxmyqSNEGEq1vO42o_wmpDxKjvICogAdamxMlrvKn88tWekbir6JQ_dY15h-pHFoEzL3Bs_F7H7eUaZ0dnCooqbzXul_Mj2bUmAyIGxPzEVjafChwgiz_4BXY" alt="Portrait of a man with spectacles and a kind professional look" />
              <img class="h-16 w-16 rounded-full border-4 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoeFMW-lZVGLwjxvYZBgXembEzPKe4CEwLiXGDkCu84dVCdCiWn72VIqH9ZwLqZ99O0zAT30SWdw9z_r46fSF6IeLgikbqPpUxZiLpIXIMrxRH8MLtzMhr_BLVK0QtisYaX8flHAH7EstIGyRAg9FdJZ129N9t1nES_Otu9viGbawTZtOEjGgsvbbLEdS8I2RYv-VX3SPc8NCEvuR657aM7_YyF4ZRqIrD2OQXBrd6v8ZCSTb_ZF0N9q09GA6M0rFn-mqibSw5q3g" alt="Portrait of a confident woman leader with soft lighting" />
            </div>
            <div class="text-sm font-bold uppercase tracking-widest text-[#131a33]" data-reveal data-reveal-delay="160ms">Rev. Thomas Miller</div>
            <div class="mt-1 text-xs text-[#4f6073]" data-reveal data-reveal-delay="200ms">Diocesan Coordinator</div>
          </div>

          <div class="hero-gradient mt-20 flex flex-col items-center justify-between gap-8 rounded-[3rem] p-10 text-white md:flex-row" data-reveal data-reveal-delay="240ms">
            <div class="text-left">
              <h3 class="text-2xl font-bold">Ready to streamline your mission?</h3>
              <p class="text-slate-400">Join over 500 parishes and 20 dioceses today.</p>
            </div>
            <NuxtLink class="rounded-full bg-white px-10 py-4 font-bold text-[#0B132B] transition-all hover:bg-slate-200" to="/register">
              Schedule a Demo
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMe } from '~/composables/resources/user/users'
import { useMyProfile } from '~/composables/resources/user/profiles'
import { resolveImageUrl } from '~/utils/image'

definePageMeta({
  layout: false,
})

useHead({
  title: 'AMDG - Elevating the Sacred Mission of Parish Management',
})

const revealObserver = ref<IntersectionObserver | null>(null)
const locationRoot = ref<HTMLElement | null>(null)
const isLocationOpen = ref(false)

const { data: userData } = useMe()
const { data: profileData } = useMyProfile()

const profileImageUrl = computed(() => {
  const profilePicture = profileData.value?.data?.profile_picture_url
  return profilePicture ? resolveImageUrl(profilePicture) : ''
})

const profileInitials = computed(() => {
  const displayName = userData.value?.data?.display_name
  if (!displayName) return 'AM'

  return displayName
    .split(' ')
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node
  if (!locationRoot.value?.contains(target)) {
    isLocationOpen.value = false
  }
}

onMounted(() => {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

  revealObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        const target = entry.target as HTMLElement
        target.classList.add('is-visible')
        revealObserver.value?.unobserve(target)
      })
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px',
    },
  )

  targets.forEach((target) => {
    revealObserver.value?.observe(target)
  })

  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  revealObserver.value?.disconnect()
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition-property: opacity, transform;
  transition-duration: 700ms;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
