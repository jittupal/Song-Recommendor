import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Standard Vite Config for React
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
})