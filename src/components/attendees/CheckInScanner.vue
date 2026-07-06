<template>
  <div class="flex flex-col gap-4">
    <!-- Action toggle -->
    <div class="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
      <button
        v-for="opt in actionOptions"
        :key="opt.value"
        class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
        :class="
          currentAction === opt.value
            ? opt.value === 'CHECK_IN'
              ? 'bg-white shadow text-green-700'
              : 'bg-white shadow text-amber-700'
            : 'text-gray-500 hover:text-gray-700'
        "
        @click="$emit('update:action', opt.value)"
      >
        <UIcon :name="opt.icon" class="w-4 h-4" />
        {{ opt.label }}
      </button>
    </div>

    <!-- Camera viewport -->
    <div class="relative overflow-hidden rounded-2xl bg-black aspect-square">
      <!-- QrcodeStream -->
      <ClientOnly>
        <QrcodeStream
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
          <div class="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div class="text-center space-y-2 text-white/50">
              <UIcon name="i-heroicons-camera" class="w-12 h-12 mx-auto" />
              <p class="text-sm">Loading camera…</p>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Corner guides overlay -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute inset-8 border-2 border-white/30 rounded-lg">
          <!-- Corners -->
          <div class="absolute -top-px -left-px w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <div class="absolute -top-px -right-px w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <div class="absolute -bottom-px -left-px w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <div class="absolute -bottom-px -right-px w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
        </div>
        <!-- Scan line animation -->
        <div
          v-if="cameraReady && !isProcessing"
          class="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line"
        />
      </div>

      <!-- Processing spinner -->
      <Transition name="fade">
        <div
          v-if="isProcessing"
          class="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          <div class="flex flex-col items-center gap-2 text-white">
            <div class="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p class="text-sm font-medium">Processing…</p>
          </div>
        </div>
      </Transition>

      <!-- Result overlay -->
      <Transition name="slide-up">
        <div
          v-if="lastResult || lastError"
          class="absolute bottom-0 inset-x-0 p-3"
        >
          <!-- Success -->
          <div
            v-if="lastResult"
            class="rounded-xl px-4 py-3 flex items-start gap-3 shadow-lg"
            :class="
              lastResult.response.scan_result === 'SUCCESS'
                ? 'bg-green-600 text-white'
                : lastResult.response.scan_result === 'ALREADY_CHECKED_IN' || lastResult.response.scan_result === 'ALREADY_CHECKED_OUT'
                ? 'bg-amber-500 text-white'
                : 'bg-red-600 text-white'
            "
          >
            <UIcon
              :name="
                lastResult.response.scan_result === 'SUCCESS'
                  ? 'i-heroicons-check-circle'
                  : lastResult.response.scan_result === 'ALREADY_CHECKED_IN' || lastResult.response.scan_result === 'ALREADY_CHECKED_OUT'
                  ? 'i-heroicons-arrow-path'
                  : 'i-heroicons-x-circle'
              "
              class="w-5 h-5 flex-shrink-0 mt-0.5"
            />
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm leading-tight">{{ lastResult.response.attendee_display_id }}</p>
              <p class="text-xs opacity-90 mt-0.5">{{ resultLabel(lastResult.response.scan_result) }}</p>
              <div v-if="lastResult.response.has_outstanding_payments" class="mt-1 text-xs font-semibold flex items-center gap-1">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5" />
                Outstanding payments
              </div>
            </div>
            <button
              class="ml-auto text-white/70 hover:text-white transition-colors"
              title="Dismiss"
              @click="$emit('clear-last')"  
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Error -->
          <div
            v-else-if="lastError"
            class="rounded-xl bg-red-700 text-white px-4 py-3 flex items-start gap-3 shadow-lg"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-bold text-sm">Scan failed</p>
              <p class="text-xs opacity-90 mt-0.5">{{ lastError }}</p>
            </div>
            <button
              class="ml-auto text-white/70 hover:text-white transition-colors"
              title="Dismiss"
              @click="$emit('clear-last')"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- Top-right controls -->
      <div class="absolute top-3 right-3 flex flex-col gap-2">
        <button
          class="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          title="Switch camera"
          @click="toggleCamera"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
        </button>
      </div>

      <!-- Camera error -->
      <div
        v-if="cameraError"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900 text-white/70 text-center p-6"
      >
        <UIcon name="i-heroicons-no-symbol" class="w-12 h-12 text-red-400" />
        <p class="text-sm font-medium text-white">Camera unavailable</p>
        <p class="text-xs opacity-70">{{ cameraError }}</p>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-2">
      <div class="bg-white border border-deep-navy/10 rounded-xl p-3 text-center">
        <p class="text-2xl font-black text-deep-navy">{{ scanCount }}</p>
        <p class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total</p>
      </div>
      <div class="bg-white border border-green-200 rounded-xl p-3 text-center">
        <p class="text-2xl font-black text-green-600">{{ successCount }}</p>
        <p class="text-xs text-gray-400 uppercase tracking-wide font-semibold">OK</p>
      </div>
      <div class="bg-white border border-red-200 rounded-xl p-3 text-center">
        <p class="text-2xl font-black text-red-500">{{ failureCount }}</p>
        <p class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Failed</p>
      </div>
    </div>

    <!-- Manual entry -->
    <div>
      <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5">Manual entry</p>
      <form class="flex gap-2" @submit.prevent="handleManualSubmit">
        <UInput
          v-model="manualCode"
          placeholder="TKT-… or ATT-…"
          class="flex-1"
          size="sm"
          :disabled="isProcessing"
        />
        <UButton
          type="submit"
          color="primary"
          size="sm"
          :loading="isProcessing"
          :disabled="!manualCode.trim()"
        >
          Submit
        </UButton>
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

function toggleCamera() {
  cameraFacing.value = cameraFacing.value === 'environment' ? 'user' : 'environment'
}

function onCameraError(err: Error) {
  cameraError.value = err?.message ?? 'Camera access denied'
  console.error('[CheckInScanner] Camera error:', err)
}

// ── Forwarding ───────────────────────────────────────────────────────────────

function onDetect(barcodes: Array<{ rawValue: string }>) {
  emit('detect', barcodes)
}

// ── Manual entry ──────────────────────────────────────────────────────────────

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

function resultLabel(scanResult: string): string {
  const labels: Record<string, string> = {
    SUCCESS: 'Scan accepted',
    ALREADY_CHECKED_IN: 'Already checked in',
    ALREADY_CHECKED_OUT: 'Already checked out',
    INVALID_TICKET: 'Invalid ticket',
    CANCELLED_ATTENDEE: 'Attendee cancelled',
    CANCELLED_TICKET: 'Ticket cancelled',
    NOT_FOUND: 'Not found',
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
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(first.x, first.y)
    for (const { x, y } of rest) ctx.lineTo(x, y)
    ctx.lineTo(first.x, first.y)
    ctx.closePath()
    ctx.stroke()
  }
}
</script>

<style scoped>
/* Scan line animation */
@keyframes scan-line {
  0% { top: 2rem; }
  50% { top: calc(100% - 2rem); }
  100% { top: 2rem; }
}
.animate-scan-line {
  position: absolute;
  animation: scan-line 2.5s ease-in-out infinite;
}

/* Result overlay slide-up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Processing overlay fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
