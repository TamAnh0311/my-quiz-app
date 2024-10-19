import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  build: {
    transpile: ['vuetify'],
  },
  css: [
    'vuetify/styles', 
  ],
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
    plugins: [
      vuetify({ autoImport: true }), 
    ],
  },
})
