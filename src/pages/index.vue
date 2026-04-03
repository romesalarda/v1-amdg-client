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
                src="/assets/images/landing-cover.jpg"
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
            <h2 class="mb-4 text-5xl font-extrabold tracking-tight text-[#0B132B]">Operational Snapshot</h2>
            <div class="mx-auto h-1.5 w-24 rounded-full bg-[#131a33]"></div>
          </div>

          <div class="grid h-auto grid-cols-1 gap-8 md:grid-cols-12">
            <article class="rounded-[2.2rem] bg-[#101b36] p-8 text-white shadow-[0_8px_24px_rgba(24,28,32,0.06)] md:col-span-5" data-reveal data-reveal-delay="40ms">
              <div class="mb-6 flex items-center justify-between">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200/80">Payments</p>
                <span class="rounded-full border border-blue-200/30 bg-blue-100/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-100">
                  Powered by Stripe
                </span>
              </div>
              <div class="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p class="text-[12px] text-blue-100/75">Gross revenue</p>
                  <p class="text-4xl font-black tracking-tight">£{{ formatMockCurrency(mockRevenueStat) }}</p>
                </div>
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <svg viewBox="0 0 24 24" class="h-6 w-6 text-blue-100" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </div>
              <div class="rounded-2xl bg-white/5 p-2">
                <v-chart :option="revenueMiniOption" :autoresize="true" class="h-44" />
              </div>
            </article>

            <article
              class="rounded-[2.2rem] bg-white p-8 shadow-[0_8px_24px_rgba(24,28,32,0.06)] md:col-span-7"
              data-reveal
              data-reveal-delay="120ms"
              @mouseenter="hoveredSnapshot = 'registrations'"
              @mouseleave="hoveredSnapshot = null"
            >
              <div class="mb-6 flex items-center justify-between">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6073]">Registrations</p>
                <span class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0B132B]">+18.2% this month</span>
              </div>
              <div class="mb-3 flex items-end justify-between">
                <p class="text-4xl font-black tracking-tight text-[#0B132B]">{{ mockRegistrationTotal }}</p>
                <p class="text-sm font-semibold text-[#4f6073]">Monthly trend</p>
              </div>
              <div class="rounded-2xl border border-[#dfe6f1] bg-[#f8fafc] p-3">
                <v-chart :option="registrationMiniOption" :autoresize="true" class="h-44" />
              </div>
            </article>

            <article
              class="rounded-[2.2rem] bg-white p-8 shadow-[0_8px_24px_rgba(24,28,32,0.06)] md:col-span-4"
              data-reveal
              data-reveal-delay="80ms"
              @mouseenter="hoveredSnapshot = 'checkin'"
              @mouseleave="hoveredSnapshot = null"
            >
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6073]">Check-in Rate</p>
              <div class="mt-5">
                <GaugeChart
                  :value="hoveredSnapshot === 'checkin' ? 94 : mockCheckinRate"
                  :max="100"
                  unit="%"
                  height="220px"
                />
              </div>
            </article>

            <article
              class="rounded-[2.2rem] bg-white p-8 shadow-[0_8px_24px_rgba(24,28,32,0.06)] md:col-span-8"
              data-reveal
              data-reveal-delay="160ms"
              @mouseenter="hoveredSnapshot = 'performance'"
              @mouseleave="hoveredSnapshot = null"
            >
              <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6073]">Performance Mix</p>
              <div class="rounded-2xl border border-[#dfe6f1] bg-[#f8fafc] p-3">
                <v-chart :option="performanceMixOption" :autoresize="true" class="h-44" />
              </div>
            </article>

            <article
              class="rounded-[2.2rem] bg-white p-8 shadow-[0_8px_24px_rgba(24,28,32,0.06)] md:col-span-6"
              data-reveal
              data-reveal-delay="200ms"
              @mouseenter="hoveredSnapshot = 'products'"
              @mouseleave="hoveredSnapshot = null"
            >
              <div class="mb-4 flex items-center justify-between">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6073]">Products</p>
                <span class="text-xs font-semibold text-[#4f6073]">Revenue by category</span>
              </div>
              <div class="rounded-2xl border border-[#dfe6f1] bg-[#f8fafc] p-3">
                <v-chart :option="productsRevenueOption" :autoresize="true" class="h-52" />
              </div>
            </article>

            <article
              class="rounded-[2.2rem] bg-white p-8 shadow-[0_8px_24px_rgba(24,28,32,0.06)] md:col-span-6"
              data-reveal
              data-reveal-delay="220ms"
              @mouseenter="hoveredSnapshot = 'attendees'"
              @mouseleave="hoveredSnapshot = null"
            >
              <div class="mb-4 flex items-center justify-between">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6073]">Attendees</p>
                <span class="text-xs font-semibold text-[#4f6073]">Demographics split</span>
              </div>
              <div class="rounded-2xl border border-[#dfe6f1] bg-[#f8fafc] p-3">
                <v-chart :option="attendeeDemographicsOption" :autoresize="true" class="h-52" />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-[#f8fafc] py-28">
        <div class="mx-auto max-w-7xl px-6 lg:px-12">
          <div class="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-reveal data-reveal-delay="0ms">
            <div>
              <p class="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#4f6073]">Global Presence</p>
              <h2 class="text-4xl font-black tracking-tight text-[#0B132B] md:text-5xl">Community Distribution Map</h2>
              <p class="mt-4 max-w-2xl text-sm leading-relaxed text-[#4f6073] md:text-base">
                Live attendee distribution by location level. Explore area, chapter, cluster, and country concentration at a glance.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="scope in locationDistributionLevels"
                :key="scope.value"
                type="button"
                class="rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] transition-colors"
                :class="distributionLevel === scope.value
                  ? 'border-[#5f6f87] bg-[#eef2f7] text-[#1f2b3d]'
                  : 'border-[#d8e0eb] bg-white text-[#5a677b] hover:border-[#9aa8be]'"
                @click="distributionLevel = scope.value"
              >
                {{ scope.label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6" data-reveal data-reveal-delay="100ms">
            <div class="overflow-hidden rounded-[2rem] border border-[#dfe6f1] bg-white p-4 shadow-[0_18px_40px_rgba(24,28,32,0.08)]">
              <div v-if="distributionPending" class="flex h-[420px] items-center justify-center text-sm font-semibold text-[#4f6073]">
                Loading distribution map...
              </div>
              <div v-else-if="distributionFeatures.length === 0" class="flex h-[420px] items-center justify-center text-sm font-semibold text-[#4f6073]">
                No mapped attendee locations available for this level.
              </div>
              <MapLibre
                v-else
                :map-style="mapStyle"
                :center="distributionMapCenter"
                :zoom="distributionMapZoom"
                :sources="distributionMapSources"
                :layers="distributionMapLayers"
              />
            </div>
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
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import { useMe } from '~/composables/resources/user/users'
import { useMyProfile } from '~/composables/resources/user/profiles'
import GaugeChart from '~/components/charts/GaugeChart.vue'
import MapLibre from '~/components/common/MapLibre.vue'
import { resolveImageUrl } from '~/utils/image'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
])

definePageMeta({
  layout: false,
})

useHead({
  title: 'AMDG - Elevating the Sacred Mission of Parish Management',
})

const revealObserver = ref<IntersectionObserver | null>(null)
const locationRoot = ref<HTMLElement | null>(null)
const isLocationOpen = ref(false)
const hoveredSnapshot = ref<'registrations' | 'checkin' | 'performance' | 'products' | 'attendees' | null>(null)
const mapStyle = 'https://demotiles.maplibre.org/style.json'
const distributionLevel = ref<'area' | 'chapter' | 'cluster' | 'country'>('area')

const locationDistributionLevels = [
  { value: 'area' as const, label: 'Area' },
  { value: 'chapter' as const, label: 'Chapter' },
  { value: 'cluster' as const, label: 'Cluster' },
  { value: 'country' as const, label: 'Country' },
]

const mockMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const mockRevenueGrossSeries = [18200, 19450, 20110, 22680, 24760, 25540, 26950, 28420, 30100, 32890, 34980, 37240]
const mockRevenueNetSeries = [17410, 18620, 19290, 21780, 23850, 24520, 25880, 27290, 28890, 31520, 33460, 35630]
const mockStripeFeeSeries = [790, 830, 820, 900, 910, 1020, 1070, 1130, 1210, 1370, 1520, 1610]
const mockRevenueHoverGrossSeries = [18820, 20340, 21210, 23100, 25540, 26210, 27980, 29640, 31890, 33940, 36510, 38990]
const mockRevenueHoverNetSeries = [17920, 19330, 20120, 22010, 24230, 24990, 26560, 28010, 30020, 32110, 34440, 36680]
const mockRevenueHoverStripeFeeSeries = [900, 1010, 1090, 1090, 1310, 1220, 1420, 1630, 1870, 1830, 2070, 2310]

const mockRegistrationSeries = [96, 104, 110, 124, 132, 149, 156, 170, 182, 196, 214, 232]
const mockRegistrationCumulativeSeries = mockRegistrationSeries.reduce<number[]>((acc, value, index) => {
  const previous = index === 0 ? 0 : acc[index - 1]
  acc.push(previous + value)
  return acc
}, [])
const mockRegistrationHoverSeries = [102, 112, 118, 136, 143, 161, 170, 188, 197, 221, 239, 258]
const mockRegistrationHoverCumulativeSeries = mockRegistrationHoverSeries.reduce<number[]>((acc, value, index) => {
  const previous = index === 0 ? 0 : acc[index - 1]
  acc.push(previous + value)
  return acc
}, [])

const mockCheckinsSeries = [61, 68, 72, 74, 79, 83, 87, 91]
const mockCapacitySeries = [96, 96, 96, 96, 96, 96, 96, 96]
const mockCheckinsHoverSeries = [64, 70, 75, 77, 82, 85, 89, 94]
const mockCapacityHoverSeries = [96, 98, 98, 98, 98, 98, 98, 100]
const mockPerformanceLabels = ['Bookings', 'Products', 'Donations', 'Sponsors']
const mockPerformanceValues = [71, 48, 29, 36]
const mockPerformanceHoverValues = [75, 56, 41, 44]
const mockProductsRevenue = [
  { label: 'Retreat Kits', value: 19480 },
  { label: 'Books', value: 12220 },
  { label: 'Tickets', value: 28760 },
  { label: 'Merch', value: 9680 },
  { label: 'Courses', value: 14110 },
]
const mockProductsHoverRevenue = [
  { label: 'Retreat Kits', value: 20840 },
  { label: 'Books', value: 13600 },
  { label: 'Tickets', value: 31410 },
  { label: 'Merch', value: 11490 },
  { label: 'Courses', value: 15820 },
]
const mockDemographics = [
  { label: '18-24', value: 186 },
  { label: '25-34', value: 314 },
  { label: '35-44', value: 267 },
  { label: '45-54', value: 196 },
  { label: '55+', value: 132 },
]
const mockDemographicsHover = [
  { label: '18-24', value: 203 },
  { label: '25-34', value: 292 },
  { label: '35-44', value: 285 },
  { label: '45-54', value: 214 },
  { label: '55+', value: 151 },
]

const mockRevenueStat = mockRevenueGrossSeries[mockRevenueGrossSeries.length - 1]
const mockRegistrationTotal = mockRegistrationCumulativeSeries[mockRegistrationCumulativeSeries.length - 1]
const mockCheckinRate = 91

const formatMockCurrency = (value: number) => value.toLocaleString('en-GB')

const revenueMiniOption = computed(() => {
  const grossSeries = hoveredSnapshot.value === 'registrations' ? mockRevenueHoverGrossSeries : mockRevenueGrossSeries
  const netSeries = hoveredSnapshot.value === 'registrations' ? mockRevenueHoverNetSeries : mockRevenueNetSeries
  const stripeFeeSeries = hoveredSnapshot.value === 'registrations' ? mockRevenueHoverStripeFeeSeries : mockStripeFeeSeries

  return {
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: '#dbe8ff', fontSize: 10 },
    },
    grid: { left: 40, right: 14, top: 28, bottom: 24, containLabel: false },
    xAxis: {
      type: 'category',
      data: mockMonths,
      axisLine: { lineStyle: { color: 'rgba(219,232,255,0.35)' } },
      axisLabel: { color: '#dbe8ff', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(219,232,255,0.16)' } },
      axisLabel: {
        color: '#dbe8ff',
        fontSize: 10,
        formatter: (value: number) => `£${Math.round(value / 1000)}k`,
      },
    },
    series: [
      {
        type: 'bar',
        name: 'Gross',
        data: grossSeries,
        barWidth: '36%',
        itemStyle: {
          color: '#6ca8ff',
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        type: 'line',
        name: 'Net',
        data: netSeries,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#f2f6ff', width: 2.2 },
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const gross = params.find((item) => item.seriesName === 'Gross')?.data ?? 0
        const net = params.find((item) => item.seriesName === 'Net')?.data ?? 0
        const idx = params?.[0]?.dataIndex ?? 0
        const fee = stripeFeeSeries[idx] ?? 0
        return [
          `${params?.[0]?.axisValue}`,
          `Gross: £${Number(gross).toLocaleString('en-GB')}`,
          `Net: £${Number(net).toLocaleString('en-GB')}`,
          `Stripe fee: £${Number(fee).toLocaleString('en-GB')}`,
        ].join('<br/>')
      },
    },
  }
})

const registrationMiniOption = computed(() => {
  const registrationSeries = hoveredSnapshot.value === 'registrations' ? mockRegistrationHoverSeries : mockRegistrationSeries
  const cumulativeSeries = hoveredSnapshot.value === 'registrations' ? mockRegistrationHoverCumulativeSeries : mockRegistrationCumulativeSeries

  return {
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: '#4f6073', fontSize: 10 },
    },
    grid: { left: 36, right: 16, top: 28, bottom: 22, containLabel: false },
    xAxis: {
      type: 'category',
      data: mockMonths,
      axisLine: { lineStyle: { color: '#cad6e6' } },
      axisLabel: { color: '#4f6073', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#4f6073', fontSize: 10 },
      splitLine: { lineStyle: { color: '#e7edf6' } },
    },
    series: [
      {
        name: 'New',
        type: 'line',
        data: registrationSeries,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#0B132B', width: 2.5 },
        areaStyle: {
          color: 'rgba(11, 19, 43, 0.12)',
        },
      },
      {
        name: 'Cumulative',
        type: 'line',
        data: cumulativeSeries,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#d4a72c', width: 2, type: 'dashed' },
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      formatter: (params: any[]) => {
        const rows = params.map((item) => `${item.seriesName}: ${Number(item.data).toLocaleString('en-GB')}`)
        return [`${params?.[0]?.axisValue}`, ...rows].join('<br/>')
      },
    },
  }
})

const performanceMixOption = computed(() => ({
  grid: { left: 48, right: 16, top: 12, bottom: 18, containLabel: false },
  xAxis: {
    type: 'value',
    max: 100,
    axisLabel: { color: '#4f6073', formatter: '{value}%' },
    splitLine: { lineStyle: { color: '#e7edf6' } },
  },
  yAxis: {
    type: 'category',
    data: mockPerformanceLabels,
    axisLabel: { color: '#0B132B', fontWeight: 600 },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: hoveredSnapshot.value === 'performance' ? mockPerformanceHoverValues : mockPerformanceValues,
      barWidth: 16,
      itemStyle: {
        color: '#0B132B',
        borderRadius: [0, 8, 8, 0],
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#0B132B',
        fontWeight: 700,
      },
    },
  ],
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any[]) => `${params[0].axisValue}: ${params[0].data}%`,
  },
}))

const productsRevenueOption = computed(() => ({
  grid: { left: 52, right: 16, top: 16, bottom: 24, containLabel: false },
  xAxis: {
    type: 'value',
    axisLabel: {
      color: '#4f6073',
      formatter: (value: number) => `£${Math.round(value / 1000)}k`,
    },
    splitLine: { lineStyle: { color: '#e7edf6' } },
  },
  yAxis: {
    type: 'category',
    data: (hoveredSnapshot.value === 'products' ? mockProductsHoverRevenue : mockProductsRevenue).map((item) => item.label),
    axisLabel: { color: '#0B132B', fontSize: 11 },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: (hoveredSnapshot.value === 'products' ? mockProductsHoverRevenue : mockProductsRevenue).map((item) => item.value),
      barWidth: 16,
      itemStyle: { color: '#1f3c88', borderRadius: [0, 8, 8, 0] },
    },
  ],
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any[]) => `${params[0].axisValue}: £${Number(params[0].data).toLocaleString('en-GB')}`,
  },
}))

const attendeeDemographicsOption = computed(() => ({
  legend: {
    bottom: 0,
    textStyle: { color: '#4f6073', fontSize: 10 },
  },
  series: [
    {
      type: 'pie',
      radius: ['44%', '72%'],
      center: ['50%', '42%'],
      itemStyle: {
        borderColor: '#ffffff',
        borderWidth: 2,
      },
      label: {
        color: '#0B132B',
        formatter: '{b}: {d}%',
      },
      data: (hoveredSnapshot.value === 'attendees' ? mockDemographicsHover : mockDemographics).map((item, index) => ({
        value: item.value,
        name: item.label,
        itemStyle: {
          color: ['#0B132B', '#1f3c88', '#2f5dab', '#5f84c2', '#95acd9'][index],
        },
      })),
    },
  ],
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
}))

type DistributionFeature = {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    label: string
    attendee_count: number
    level: string
  }
}

type DistributionResponse = {
  level: 'area' | 'chapter' | 'cluster' | 'country'
  total_attendees: number
  total_with_location: number
  total_without_location: number
  type: 'FeatureCollection'
  features: DistributionFeature[]
}

const { data: distributionData, pending: distributionPending } = useAsyncData(
  'home-location-distribution',
  async () => await $fetch<DistributionResponse>('/api/locations/statistics/distribution-map/', {
    query: {
      level: distributionLevel.value,
    },
  }),
  {
    default: () => ({
      level: 'area',
      total_attendees: 0,
      total_with_location: 0,
      total_without_location: 0,
      type: 'FeatureCollection',
      features: [],
    }),
    watch: [distributionLevel],
  },
)

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

const distributionFeatures = computed(() => {
  const features = distributionData.value?.features || []
  return [...features].sort((a, b) => b.properties.attendee_count - a.properties.attendee_count)
})

const distributionMapSources = computed(() => ([
  {
    name: 'distribution',
    data: {
      type: 'FeatureCollection',
      features: distributionFeatures.value,
    } as FeatureCollection<Geometry, GeoJsonProperties>,
  },
]))

const distributionMapLayers = computed(() => ([
  {
    id: 'distribution-circles',
    type: 'circle',
    source: 'distribution',
    paint: {
      'circle-color': '#34495e',
      'circle-radius': 7,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.74,
    },
  },
]))

const distributionMapCenter = computed<[number, number]>(() => {
  if (!distributionFeatures.value.length) return [0, 20]

  const totalLongitude = distributionFeatures.value.reduce((sum, feature) => sum + feature.geometry.coordinates[0], 0)
  const totalLatitude = distributionFeatures.value.reduce((sum, feature) => sum + feature.geometry.coordinates[1], 0)
  return [
    totalLongitude / distributionFeatures.value.length,
    totalLatitude / distributionFeatures.value.length,
  ]
})

const distributionMapZoom = computed(() => {
  const count = distributionFeatures.value.length
  if (count <= 1) return 3.2
  if (count <= 5) return 2.7
  return 1.8
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
