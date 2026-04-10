import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // Pozwala na dostęp spoza kontenera
    port: 3000,         // Spójność z portem w docker-compose
    watch: {
      usePolling: true, // Kluczowe dla odświeżania na żywo w Dockerze na Windows
    },
  },
})