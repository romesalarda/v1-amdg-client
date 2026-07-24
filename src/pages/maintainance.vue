<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div class="absolute inset-0 z-0">
      <FlowingBackground :speed="2" :soft="8" :palette="4" position="absolute" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-950/60 to-slate-950/80" />
    </div>

    <div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div class="mb-8 flex items-center justify-center">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <UIcon name="i-heroicons-wrench-screwdriver" class="h-12 w-12 text-indigo-300" />
        </div>
      </div>

      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">AMDG Portal</p>
      <h1 class="mb-4 max-w-lg font-serif text-4xl leading-tight text-white sm:text-5xl">
        Urm, I promise I am working on it. Please wait a moment.
      </h1>
      <p class="mb-10 max-w-md text-base leading-relaxed text-slate-300/80">
        The server is temporarily unavailable. This service will be back..... idk when.
        This page will automatically reconnect when the service is restored.
      </p>

      <div class="mb-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
        <span
          class="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
          :class="statusDotClass"
        />
        <span class="text-sm text-slate-300">{{ statusText }}</span>
        <UIcon
          v-if="healthStore.isChecking"
          name="i-heroicons-arrow-path"
          class="h-4 w-4 animate-spin text-slate-400"
        />
      </div>

      <UButton
        variant="outline"
        color="white"
        size="md"
        :loading="healthStore.isChecking"
        :disabled="healthStore.isChecking"
        class="rounded-xl border-white/20 text-white hover:bg-white/10"
        @click="manualCheck"
      >
        Check again now
      </UButton>

      <p class="mt-8 text-xs text-slate-500">
        Next automatic check in {{ countdown }}s
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import FlowingBackground from '~/components/ui/flowingBackground.vue'

definePageMeta({ layout: false })

const healthStore = useHealthStore()
const router = useRouter()

const POLL_INTERVAL_MS = 30_000
let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
const countdown = ref(Math.round(POLL_INTERVAL_MS / 1000))

const statusText = computed(() => {
  if (healthStore.isChecking) return 'Checking connection...'
  if (healthStore.isHealthy === true) return 'Connection restored - redirecting...'
  if (healthStore.isHealthy === false) return 'Server unreachable'
  return 'Checking connection...'
})

const statusDotClass = computed(() => {
  if (healthStore.isHealthy === true) return 'bg-green-400'
  if (healthStore.isHealthy === false) return 'bg-red-400'
  return 'bg-yellow-400 animate-pulse'
})

async function runCheck() {
  const healthy = await healthStore.checkHealth()
  if (healthy) {
    stopTimers()
    await router.replace('/login')
  } else {
    resetCountdown()
  }
}

function resetCountdown() {
  countdown.value = Math.round(POLL_INTERVAL_MS / 1000)
}

function startTimers() {
  pollTimer = setInterval(runCheck, POLL_INTERVAL_MS)
  countdownTimer = setInterval(() => {
    countdown.value = Math.max(0, countdown.value - 1)
  }, 1000)
}

function stopTimers() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

async function manualCheck() {
  stopTimers()
  await runCheck()
  if (!healthStore.isHealthy) startTimers()
}

onMounted(async () => {
  healthStore.invalidate()
  await runCheck()
  if (!healthStore.isHealthy) startTimers()
})

onUnmounted(() => stopTimers())
</script>
