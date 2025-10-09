import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite conexiones desde cualquier IP
    port: 5173,      // Puerto preferido (si está ocupado, Vite usará 5174, 5175, etc.)
    strictPort: false // Permite usar puertos alternativos si 5173 está ocupado
  }
})
