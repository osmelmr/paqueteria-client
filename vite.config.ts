import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:4000',
      '/agencies': 'http://127.0.0.1:4000',
      '/guides': 'http://127.0.0.1:4000',
      '/package-entry': 'http://127.0.0.1:4000',
      '/packages': 'http://127.0.0.1:4000',
      '/locations': 'http://127.0.0.1:4000',
      '/provinces': 'http://127.0.0.1:4000',
      '/recipients': 'http://127.0.0.1:4000',
      '/statuses': 'http://127.0.0.1:4000',
      '/users': 'http://127.0.0.1:4000',
    },
  },
})
