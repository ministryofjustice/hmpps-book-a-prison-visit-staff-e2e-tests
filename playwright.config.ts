import { defineConfig, devices } from '@playwright/test'
import { config as dotenvConfig } from 'dotenv'
import ENV from './playwright-e2e/setup/env'

dotenvConfig()

export default defineConfig({
  globalSetup: './playwright-e2e/setup/globalSetup.ts',
  globalTimeout: 600_000, // 10 minutes
  timeout: 300_000, // 5 minutes per test
  testDir: './playwright-e2e/tests',
  fullyParallel: process.env.CI ? true : false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,

  reporter: process.env.CI
    ? [
        ['junit', { outputFile: 'results.xml' }],
        ['html', { open: 'never' }],
      ]
    : [
        ['html', { open: 'never' }],
        ['allure-playwright', { detail: true, outputFolder: 'allure-results' }],
      ],

  use: {
    baseURL: ENV.BASE_URL,
    navigationTimeout: 60_000,
    actionTimeout: 10_000,
    testIdAttribute: 'data-test',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    launchOptions: {
      args: ['--ignore-certificate-errors'],
    },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: './playwright/.auth/auth.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        storageState: './playwright/.auth/auth.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        storageState: './playwright/.auth/auth.json',
      },
      dependencies: ['setup'],
    },
  ],
})
