import { defineConfig, devices } from '@playwright/test'
import { config as dotenvConfig } from 'dotenv'
import ENV from './src/setup/env'

dotenvConfig()

export default defineConfig({
  globalSetup: './src/setup/globalSetup.ts', // Setup script for initializing tests
  globalTimeout: 5 * 60_000, // 5 minutes
  timeout: 60_000, // 1 minute per test
  testDir: './src/tests', // Directory containing test files
  fullyParallel:  process.env.CI ? true : false, // Enable parallel only on CI
  forbidOnly: !!process.env.CI, // Forbid .only in CI
  retries: process.env.CI ? 1 : 0, // Retry failed tests once in CI
  workers:  process.env.CI ? 1 : 1, // 4 workers on CI, 1 worker locally

  reporter: process.env.CI
    ? [
      ['html', { open: 'never' }], // HTML report for CI
    ]
    : [
      ['html', { open: 'never' }], // HTML report locally
      ['allure-playwright', { detail: true, outputFolder: 'allure-results' }], // Allure for local use
    ],

  use: {
    baseURL: ENV.BASE_URL, // Base URL for application under test
    navigationTimeout: 60_000, // Timeout for navigation actions
    actionTimeout: 10_000, // Timeout for user actions (e.g., clicks)
    testIdAttribute: 'data-test', // Custom attribute for locating elements

    trace: 'on-first-retry', // Generate trace on the first retry
    screenshot: 'only-on-failure', // Capture screenshots only on failure
    video:'retain-on-failure',  // Capture screenshots only on failure

    launchOptions: {
      args: ['--ignore-certificate-errors'], // Ignore SSL issues
    }
  },

  projects: [
    {
      name: 'setup', // Pre-test setup tasks
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium', // Chromium tests
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Set viewport size
        storageState: './playwright/.auth/auth.json', // Use pre-authenticated state
      },
      dependencies: ['setup'], // Depends on setup project
    },
    {
      name: 'firefox', // Firefox tests
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }, // Set viewport size
        storageState: './playwright/.auth/auth.json',
      },
      dependencies: ['setup']
    },
    {
      name: 'webkit', // Safari tests
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }, // Set viewport size
        storageState: './playwright/.auth/auth.json',
      },
      dependencies: ['setup'],
    },
  ],
})
