import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port:  3005, // Usa el puerto de Render o el 3005 localmente
    host: true, // Permite acceder desde cualquier IP
   /*  headers: {
      "Content-Security-Policy": "default-src 'self'; img-src * data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    } */
  },
  preview: {
    port:  3000,
    host: true
  }
})
  