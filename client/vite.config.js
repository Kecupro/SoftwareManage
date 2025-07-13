import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  // define: {
  //   'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV !== 'production'),
  //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  // },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
