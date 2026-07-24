import { defineStore } from 'pinia'
import { healthRetrieve } from '~/api/sdk.gen'

const SESSION_KEY = 'amdg_backend_healthy'

export const useHealthStore = defineStore('health', () => {
  // null = unknown, true = healthy, false = unreachable
  const isHealthy = ref<boolean | null>(null)
  const isChecking = ref(false)

  /**
   * Reads the last known state from sessionStorage so we don't re-check on
   * every page navigation within the same browser session.
   */
  function loadCachedState() {
    const cached = sessionStorage.getItem(SESSION_KEY)
    if (cached === 'true') isHealthy.value = true
    else if (cached === 'false') isHealthy.value = false
  }

  function setCachedState(healthy: boolean) {
    sessionStorage.setItem(SESSION_KEY, String(healthy))
  }

  /**
   * Clears the cached session state so the next `checkHealth` always hits the
   * network (used when we detect a network error mid-session).
   */
  function invalidate() {
    sessionStorage.removeItem(SESSION_KEY)
    isHealthy.value = null
  }

  /**
   * Marks the backend as definitively unreachable (called by the network error
   * interceptor so other parts of the app can react synchronously).
   */
  function setUnhealthy() {
    sessionStorage.removeItem(SESSION_KEY)
    isHealthy.value = false
  }

  /**
   * Performs a single health check against /api/health/.
   * Returns true if the backend is reachable and healthy.
   */
  async function checkHealth(): Promise<boolean> {
    if (isChecking.value) return isHealthy.value ?? false
    isChecking.value = true

    try {
      const { data, error } = await healthRetrieve({ throwOnError: false })
      const healthy = !error && data?.status === 'healthy'
      isHealthy.value = healthy
      setCachedState(healthy)
      return healthy
    } catch {
      isHealthy.value = false
      setCachedState(false)
      return false
    } finally {
      isChecking.value = false
    }
  }

  return { isHealthy, isChecking, loadCachedState, invalidate, setUnhealthy, checkHealth }
})
