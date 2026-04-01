// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = (import.meta.env.NUXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/$/, '')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      siteUrl
    }
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxt/image'
  ],

  app: {
    head: {
      title: 'Luxe Hair Salon & Spa',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover'
        },
        {
          name: 'description',
          content:
            'Interactive spa and salon menu reader with elegant vertical and book-style horizontal modes.'
        }
      ]
    }
  }
})