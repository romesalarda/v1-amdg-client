// Vue ECharts plugin for Nuxt 3
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // ECharts is imported on-demand in components
  // This plugin file ensures proper SSR compatibility
  if (import.meta.client === false) {
    // Client-side only initialization if needed
  }
})
