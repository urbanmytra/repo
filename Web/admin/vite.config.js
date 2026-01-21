import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 5174, // Render overrides with $PORT
    allowedHosts: [
      'project-bagajation-admin.onrender.com',
      'urbanmytraadmin.onrender.com',
      'www.urbanmytraadmin.onrender.com',
      'www.admin.urbanmytra.in',
      'admin.urbanmytra.in',
      'urbanmytra.in'
    ]
  }
})
