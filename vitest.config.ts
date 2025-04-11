import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      all: true,
      reportsDirectory: './coverage',
      reporter: ['text', 'json', 'html', 'lcov'],
    },
  },
})
