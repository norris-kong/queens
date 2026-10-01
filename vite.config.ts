import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works under any GitHub Pages sub-path.
  base: './',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
    coverage: {
      include: ['src/core/**/*.ts', 'tools/**/*.ts'],
      exclude: ['**/*.test.ts', 'tools/puzzleEditorPlugin.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
})
