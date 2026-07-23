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
      '/auth': 'http://127.0.0.1:3000',
      '/guides': 'http://127.0.0.1:3000',
      '/packages': 'http://127.0.0.1:3000',
      '/locations': 'http://127.0.0.1:3000',
      '/provinces': 'http://127.0.0.1:3000',
      '/recipients': 'http://127.0.0.1:3000',
      '/statuses': 'http://127.0.0.1:3000',
    },
  },
})
