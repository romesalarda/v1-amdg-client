import { ref } from 'vue'

/**
 * One-shot QR/barcode scan helper for filling a form value (e.g. an alternative sign-in identifier).
 * Wire `onDetect` / `onError` to `QrcodeStream`'s `@detect` / `@error` events.
 */
export function useQRScan(onScanned: (value: string) => void) {
  const isScanning = ref(false)
  const error = ref<string | null>(null)

  function open() {
    error.value = null
    isScanning.value = true
  }

  function close() {
    isScanning.value = false
  }

  function onDetect(barcodes: Array<{ rawValue: string }>) {
    const value = barcodes?.[0]?.rawValue?.trim()
    if (!value) return
    onScanned(value)
    close()
  }

  function onError(err: { name?: string; message?: string }) {
    if (err?.name === 'NotAllowedError') error.value = 'Camera permission was denied.'
    else if (err?.name === 'NotFoundError') error.value = 'No camera found on this device.'
    else if (err?.name === 'NotSecureContextError') error.value = 'Camera access requires HTTPS.'
    else error.value = err?.message || 'Unable to start the camera.'
  }

  return { isScanning, error, open, close, onDetect, onError }
}
