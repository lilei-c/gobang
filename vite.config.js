import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: 'gobang/dist/',
  plugins: [react(), splitVendorChunkPlugin()],
})
