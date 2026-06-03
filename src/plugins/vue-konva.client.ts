import VueKonva from 'vue-konva'

// Client-only plugin: Konva requires browser APIs (canvas, window) so it must
// not run during SSR. The `.client.ts` suffix ensures Nuxt only loads this plugin
// on the client side.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueKonva)
})
