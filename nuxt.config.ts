// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  srcDir: 'src/',
  ssr: false,  // Disable SSR - run as SPA for simpler auth
  modules: ['@nuxt/ui', '@pinia/nuxt', '@hebilicious/vue-query-nuxt', 'nuxt-qrcode'],
  typescript: {
    strict: true,
    typeCheck: true
  },
  ui: {
    global: true
  },
  colorMode: {
    preference: 'light',
    fallback: 'light',
    dataValue: 'light',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:8000',
      stripeTestMode: import.meta.env.NUXT_PUBLIC_STRIPE_TEST_MODE === 'true',
      stripeTestPublishableKey: import.meta.env.NUXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY || ''
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
      content: [
        './src/components/**/*.{js,vue,ts}',
        './src/layouts/**/*.vue',
        './src/pages/**/*.vue',
        './src/plugins/**/*.{js,ts}',
        './src/app.vue'
      ],
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#fef9e7',
              100: '#fdf2c3',
              200: '#fce89b',
              300: '#fade73',
              400: '#f6d445',
              500: '#ecc813',
              600: '#d4b311',
              700: '#b8990e',
              800: '#9c800c',
              900: '#7a6309',
              950: '#4d3e06',
              DEFAULT: '#ecc813'
            },
            'background-dark': {
              DEFAULT: '#0a192f',
              50: '#e6e9ed',
              100: '#b8c2d1',
              200: '#8a9bb5',
              300: '#5c7499',
              400: '#2e4d7d',
              500: '#1a3051',
              600: '#0a192f',
              700: '#081425',
              800: '#060f1b',
              900: '#040a11'
            },
            'navy-accent': {
              DEFAULT: '#112240',
              50: '#e7eaf0',
              100: '#bec6d6',
              200: '#95a2bc',
              300: '#6c7ea2',
              400: '#435a88',
              500: '#2a3c5e',
              600: '#112240',
              700: '#0d1a33',
              800: '#091226',
              900: '#050a19'
            }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif']
          }
        }
      },
      safelist: [
        'bg-primary',
        'text-primary',
        'border-primary',
        'bg-primary-500',
        'text-primary-500',
        'border-primary-500',
        'bg-navy-accent',
        'bg-navy-accent-600',
        'bg-background-dark',
        'bg-background-dark-600',
        'text-background-dark-600',
        'hover:text-primary',
        'hover:text-primary-500',
        'hover:bg-primary/10',
        'hover:bg-primary-500/10',
        'hover:border-primary/60',
        'hover:border-primary-500/60',
        'border-primary/10',
        'border-primary/20',
        'border-primary-500/10',
        'border-primary-500/20',
        'border-primary-500/50',
        'text-primary/60',
        'text-primary/70',
        'text-primary-500/40',
        'text-primary-500/60',
        'text-primary-500/70',
        'bg-primary/20',
        'bg-primary-500/20',
        'bg-navy-accent-600/30',
        'from-primary-500/20',
        'to-background-dark-600/60'
      ]
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
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Roboto:wght@400;500;700;900&display=swap' }
      ]
    }
  }
})