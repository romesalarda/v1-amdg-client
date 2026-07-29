<template>
  <div class="flex flex-col gap-4 select-none">
    <!-- Mode toggle: CHECK IN / CHECK OUT -->
    <div class="flex bg-slate-100 rounded-2xl p-1 gap-1">
      <button
        v-for="opt in actionOptions"
        :key="opt.value"
        class="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold tracking-wide rounded-xl transition-all duration-200"
        :class="
          currentAction === opt.value
            ? opt.value === 'CHECK_IN'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-amber-500 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700 hover:bg-white/70'
        "
        @click="$emit('update:action', opt.value)"
      >
        <UIcon :name="opt.icon" class="w-4 h-4" />
        {{ opt.label }}
      </button>
    </div>

    <!-- Camera viewport -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div class="relative aspect-square bg-slate-900">
        <!-- Live feed -->
        <ClientOnly>
          <QrcodeStream
            v-if="cameraActive"
            :paused="isPaused || isProcessing"
            :track="paintOutline"
            :constraints="{ facingMode: cameraFacing }"
            class="absolute inset-0 w-full h-full object-cover"
            @detect="onDetect"
            @error="onCameraError"
            @camera-on="cameraReady = true"
            @camera-off="cameraReady = false"
          />

          <template #fallback>
            <div class="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div class="text-center space-y-2 text-slate-500">
                <UIcon name="i-heroicons-camera" class="w-12 h-12 mx-auto" />
                <p class="text-xs uppercase tracking-widest">Loading camera…</p>
              </div>
            </div>
          </template>
        </ClientOnly>

        <!-- Camera-off overlay -->
        <Transition name="fade">
          <div
            v-if="!cameraActive"
            class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900 z-10"
          >
            <div class="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <UIcon name="i-heroicons-video-camera-slash" class="w-9 h-9 text-slate-500" />
            </div>
            <div class="text-center">
              <p class="text-slate-300 text-sm font-semibold">Camera deactivated</p>
              <p class="text-slate-500 text-xs mt-0.5">Use manual entry or re-enable below</p>
            </div>
            <button
              class="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
              @click="toggleCameraActive"
            >
              Enable Camera
            </button>
          </div>
        </Transition>

        <!-- Scanning guide corners -->
        <div v-if="cameraActive" class="absolute inset-0 pointer-events-none">
          <div class="absolute inset-10">
            <div class="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-indigo-400 rounded-tl-md" />
            <div class="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-indigo-400 rounded-tr-md" />
            <div class="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-indigo-400 rounded-bl-md" />
            <div class="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-indigo-400 rounded-br-md" />
          </div>
          <!-- Scan line -->
          <div
            v-if="cameraReady && !isProcessing"
            class="absolute inset-x-10 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-scan-line opacity-80"
          />
        </div>

        <!-- Processing overlay -->
        <Transition name="fade">
          <div
            v-if="isProcessing"
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20"
          >
            <div class="relative">
              <div class="w-14 h-14 rounded-full border-2 border-white/10" />
              <div class="absolute inset-0 w-14 h-14 border-2 border-t-indigo-400 rounded-full animate-spin" />
            </div>
            <p class="text-white text-xs font-bold uppercase tracking-widest">Verifying…</p>
          </div>
        </Transition>

        <!-- Scan result toast -->
        <Transition name="slide-up">
          <div
            v-if="lastResult || lastError"
            class="absolute bottom-0 inset-x-0 p-3 z-30"
          >
            <div
              v-if="lastResult"
              class="rounded-2xl px-4 py-3.5 flex items-start gap-3 shadow-sm border"
              :class="resultStyle(lastResult.response.scan_result)"
            >
              <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" :class="resultIconBg(lastResult.response.scan_result)">
                <UIcon :name="resultIcon(lastResult.response.scan_result)" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm leading-tight">{{ lastResult.response.attendee_display_id }}</p>
                <p class="text-xs mt-0.5 font-medium opacity-80">{{ lastResult.response.attendee_full_name }}</p>
                <p class="text-xs mt-0.5 opacity-70">{{ resultLabel(lastResult.response.scan_result) }}</p>
                <div v-if="lastResult.response.has_outstanding_payments" class="mt-1.5 flex items-center gap-1 text-xs font-semibold bg-rose-100 text-rose-600 rounded-lg px-2 py-0.5 w-fit border border-rose-200">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3" />
                  Outstanding payments
                </div>
              </div>
              <button class="ml-1 opacity-50 hover:opacity-100 transition-opacity" @click="$emit('clear-last')">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>

            <div
              v-else-if="lastError"
              class="rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3.5 flex items-start gap-3 shadow-sm"
            >
              <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div class="flex-1">
                <p class="font-bold text-sm">Scan Failed</p>
                <p class="text-xs opacity-70 mt-0.5">{{ lastError }}</p>
              </div>
              <button class="ml-1 opacity-50 hover:opacity-100 transition-opacity" @click="$emit('clear-last')">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </Transition>

        <!-- Top-right camera controls -->
        <div v-if="cameraActive" class="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            class="w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-sm"
            title="Flip camera"
            @click="toggleCamera"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          </button>
          <button
            class="w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-slate-200 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:bg-white transition-all shadow-sm"
            title="Deactivate camera"
            @click="toggleCameraActive"
          >
            <UIcon name="i-heroicons-video-camera-slash" class="w-4 h-4" />
          </button>
        </div>

        <!-- Camera error -->
        <div
          v-if="cameraError && cameraActive"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 text-center p-6 z-10"
        >
          <UIcon name="i-heroicons-no-symbol" class="w-12 h-12 text-rose-400" />
          <p class="text-sm font-bold text-white">Camera Unavailable</p>
          <p class="text-xs text-slate-400">{{ cameraError }}</p>
          <button
            class="mt-1 px-4 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 text-xs font-semibold transition-colors"
            @click="retryCameraError"
          >
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Scan stats strip -->
    <div class="grid grid-cols-3 gap-2">
      <div class="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-sm">
        <p class="text-2xl font-black text-slate-900">{{ scanCount }}</p>
        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Total</p>
      </div>
      <div class="bg-white border border-emerald-200 rounded-2xl p-3 text-center shadow-sm">
        <p class="text-2xl font-black text-emerald-600">{{ successCount }}</p>
        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Accepted</p>
      </div>
      <div class="bg-white border border-rose-200 rounded-2xl p-3 text-center shadow-sm">
        <p class="text-2xl font-black text-rose-500">{{ failureCount }}</p>
        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Rejected</p>
      </div>
    </div>

    <!-- Camera status bar -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span
          class="inline-block w-2 h-2 rounded-full"
          :class="cameraActive && cameraReady && !cameraError ? 'bg-emerald-500 animate-pulse' : cameraActive && !cameraReady ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'"
        />
        <span class="text-xs text-slate-500 font-medium">
          {{ cameraActive && cameraReady && !cameraError ? 'Camera live' : cameraActive && !cameraReady ? 'Starting…' : 'Camera off' }}
        </span>
      </div>
      <button
        class="text-xs font-semibold transition-colors"
        :class="cameraActive ? 'text-rose-500/70 hover:text-rose-500' : 'text-indigo-600/70 hover:text-indigo-600'"
        @click="toggleCameraActive"
      >
        {{ cameraActive ? 'Deactivate' : 'Activate' }} camera
      </button>
    </div>

    <!-- Manual entry -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3">Manual Entry</p>
      <form class="flex gap-2" @submit.prevent="handleManualSubmit">
        <input
          v-model="manualCode"
          placeholder="Ticket Code or Attendee ID"
          class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
          :disabled="isProcessing"
          autocomplete="off"
          spellcheck="false"
        />
        <button
          type="submit"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          :class="manualCode.trim() && !isProcessing ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm' : 'bg-slate-100 text-slate-400'"
          :disabled="!manualCode.trim() || isProcessing"
        >
          {{ isProcessing ? '…' : 'Submit' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScanResult, ScanAction } from '~/composables/attendee/useCheckInScanner'

interface Props {
  isProcessing: boolean
  isPaused: boolean
  lastResult: ScanResult | null
  lastError: string | null
  scanCount: number
  successCount: number
  failureCount: number
  currentAction: ScanAction
}

defineProps<Props>()

const emit = defineEmits<{
  detect: [barcodes: Array<{ rawValue: string }>]
  'manual-submit': [code: string]
  'update:action': [action: ScanAction]
  'clear-last': []
}>()

// ── Camera state ─────────────────────────────────────────────────────────────

const cameraReady = ref(false)
const cameraError = ref<string | null>(null)
const cameraFacing = ref<'environment' | 'user'>('environment')
const cameraActive = ref(true)

function toggleCamera() {
  cameraFacing.value = cameraFacing.value === 'environment' ? 'user' : 'environment'
}

function toggleCameraActive() {
  cameraActive.value = !cameraActive.value
  if (!cameraActive.value) {
    cameraReady.value = false
    cameraError.value = null
  }
}

function retryCameraError() {
  cameraError.value = null
  cameraActive.value = false
  nextTick(() => { cameraActive.value = true })
}

function onCameraError(err: Error) {
  cameraError.value = err?.message ?? 'Camera access denied'
  console.error('[CheckInScanner] Camera error:', err)
}

// ── Forwarding ───────────────────────────────────────────────────────────────

function onDetect(barcodes: Array<{ rawValue: string }>) {
  emit('detect', barcodes)
}

// ── Manual entry ─────────────────────────────────────────────────────────────

const manualCode = ref('')

function handleManualSubmit() {
  if (!manualCode.value.trim()) return
  emit('manual-submit', manualCode.value.trim())
  manualCode.value = ''
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const actionOptions: { value: ScanAction; label: string; icon: string }[] = [
  { value: 'CHECK_IN', label: 'Check In', icon: 'i-heroicons-arrow-right-circle' },
  { value: 'CHECK_OUT', label: 'Check Out', icon: 'i-heroicons-arrow-left-circle' },
]

function resultStyle(scanResult: string): string {
  if (scanResult === 'SUCCESS') return 'bg-emerald-50 border-emerald-200 text-emerald-700'
  if (scanResult === 'ALREADY_CHECKED_IN' || scanResult === 'ALREADY_CHECKED_OUT') return 'bg-amber-50 border-amber-200 text-amber-700'
  return 'bg-rose-50 border-rose-200 text-rose-700'
}

function resultIconBg(scanResult: string): string {
  if (scanResult === 'SUCCESS') return 'bg-emerald-100 text-emerald-600'
  if (scanResult === 'ALREADY_CHECKED_IN' || scanResult === 'ALREADY_CHECKED_OUT') return 'bg-amber-100 text-amber-600'
  return 'bg-rose-100 text-rose-600'
}

function resultIcon(scanResult: string): string {
  if (scanResult === 'SUCCESS') return 'i-heroicons-check-circle'
  if (scanResult === 'ALREADY_CHECKED_IN' || scanResult === 'ALREADY_CHECKED_OUT') return 'i-heroicons-arrow-path'
  return 'i-heroicons-x-circle'
}

function resultLabel(scanResult: string): string {
  const labels: Record<string, string> = {
    SUCCESS: 'Entry accepted',
    ALREADY_CHECKED_IN: 'Already checked in',
    ALREADY_CHECKED_OUT: 'Already checked out',
    INVALID_TICKET: 'Invalid ticket',
    CANCELLED_ATTENDEE: 'Attendee cancelled',
    CANCELLED_TICKET: 'Ticket cancelled',
    NOT_FOUND: 'Ticket not found',
    OUTSTANDING_PAYMENTS: 'Outstanding payments',
    ERROR: 'Server error',
  }
  return labels[scanResult] ?? scanResult
}

/**
 * Draw a green outline around detected QR codes on the camera canvas.
 */
function paintOutline(detectedCodes: any[], ctx: CanvasRenderingContext2D) {
  for (const code of detectedCodes) {
    const [first, ...rest] = code.cornerPoints
      ctx.strokeStyle = '#818cf8'
    ctx.lineWidth = 3
    ctx.shadowColor = '#93c5fd'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(first.x, first.y)
    for (const { x, y } of rest) ctx.lineTo(x, y)
    ctx.lineTo(first.x, first.y)
    ctx.closePath()
    ctx.stroke()
    ctx.shadowBlur = 0
  }
}
</script>

<style scoped>
@keyframes scan-line {
  0%   { top: 2.5rem; }
  50%  { top: calc(100% - 2.5rem); }
  100% { top: 2.5rem; }
}
.animate-scan-line {
  position: absolute;
  animation: scan-line 2.5s ease-in-out infinite;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
