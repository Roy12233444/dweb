import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'


export default defineConfig({
  assetsInclude: ['**/*.glsl'],
  build: {
    rollupOptions: {
      plugins: [glsl()],
    }
  }
})
