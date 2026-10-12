import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      '@': path.resolve(import.meta.dirname, './')
    },
    deps: {
      inline: [/next/]
    }
  }
})
