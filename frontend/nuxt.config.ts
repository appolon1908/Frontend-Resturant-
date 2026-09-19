export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  experimental: {
    appManifest: false,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
    },
  },
  app: {
    pageTransition: { name: 'fade-slide', mode: 'out-in' },
    layoutTransition: { name: 'fade-slide', mode: 'out-in' },
    head: {
      title: 'Restaurant Booking',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  compatibilityDate: '2024-12-01',
})
