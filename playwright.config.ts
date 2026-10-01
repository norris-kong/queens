import { defineConfig, devices } from '@playwright/test'

const PREVIEW_PORT = 4317
const DEV_PORT = 4318
const EDITOR_SPEC = /editor\.spec\.ts/

// Game flows run against the production build, as deployed to GitHub Pages. The editor exists only
// on the dev server, so its flows run there.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}`,
    trace: 'retain-on-failure',
    // E2E_SLOW_MO=400 slows every action down by 400 ms, for watching a headed run.
    launchOptions: { slowMo: Number(process.env.E2E_SLOW_MO ?? 0) },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: EDITOR_SPEC },
    { name: 'phone', use: { ...devices['Pixel 7'] }, testIgnore: EDITOR_SPEC },
    {
      name: 'editor',
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${DEV_PORT}` },
      testMatch: EDITOR_SPEC,
    },
  ],
  webServer: [
    {
      command: `pnpm build && pnpm preview --port ${PREVIEW_PORT} --strictPort`,
      url: `http://localhost:${PREVIEW_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `pnpm dev --port ${DEV_PORT} --strictPort`,
      url: `http://localhost:${DEV_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
