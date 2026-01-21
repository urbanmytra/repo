import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 5173, // Render will override this with $PORT
    allowedHosts: [
      'project-bagajation.onrender.com',
      'www.urbanmytra.onrender.com',
      'urbanmytra.onrender.com',
      'www.urbanmytra.in',
      'urbanmytra.in'
    ]
  }
})
