// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  postcss: {
    plugins: {
      "postcss-mobile-forever": {
        viewportWidth: 750,
        maxDisplayWidth: 520,
        appSelector: ".app-inner-root",
        side: {
          selector1: ".footer",
        },
      }
    }
  }
})
