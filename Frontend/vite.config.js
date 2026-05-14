import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',         // <--- DODAJ TO: Kluczowe dla poprawnego ładowania plików z Bucketa
  server: {
    host: true,         
    port: 3000,         
    watch: {
      usePolling: true, 
    },
  },
})