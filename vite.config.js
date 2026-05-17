import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fonts': path.resolve(__dirname, './Fonts'),
      '@sounds': path.resolve(__dirname, './Saund'),
      '@models': path.resolve(__dirname, './Models3D'),
      '@background': path.resolve(__dirname, './backgroud'),
    },
  },
})
