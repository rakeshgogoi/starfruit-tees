import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Suppress error overlay caused by Vite scanning api/ directory.
    // Vercel serverless functions (api/*.js) use Node packages like
    // @neondatabase/serverless that Vite cannot resolve — this is expected.
    // Use `vercel dev` for full local dev with API routes.
    hmr: { overlay: false },
  },
})
