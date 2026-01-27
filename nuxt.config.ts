// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  srcDir: 'src/',
  ssr: false,  // Disable SSR - run as SPA for simpler auth
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@hebilicious/vue-query-nuxt'
  ],
  typescript: {
    strict: true,
    typeCheck: true
  },
  ui: {
    global: true
  },
  colorMode: {
    preference: 'light'
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:8000'
    }
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true
        },
        '/ws': {
          target: 'ws://localhost:8000',
          ws: true,
          changeOrigin: true
        }
      }
    }
  },
  tailwindcss: {
    config: {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['Merriweather', 'serif'] // "Timeless" feel
          }
        }
      }
    }
  },
  app: {
    baseURL: '/',
    head: {
      title: 'AMDG',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap' }
      ]
    }
  }
})
