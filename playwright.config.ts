import { defineConfig, devices } from '@playwright/test'
import { config as dotenvConfig } from 'dotenv'
import ENV from './src/setup/env'

dotenvConfig()

// if (!process.env.INTEG_USER_NAME || !process.env.INTEG_PASSWORD) {
//   throw new Error('INTEG_USER_NAME and INTEG_PASSWORD environment variables must be set')
// }

export default defineConfig({
  globalSetup: './src/setup/globalSetup.ts',
  globalTimeout: 60000 * 5,
  timeout: 60000,
  testDir: './src/tests',
  fullyParallel: false,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI ? 1 : undefined,
  workers: 1,

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
    navigationTimeout: 60000,
    actionTimeout: 10000,
    testIdAttribute: 'data-test',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',

    launchOptions: {
      args: ['--ignore-certificate-errors'],
    }
    // ,
    // httpCredentials: {
    //   username: process.env.INTEG_USER_NAME,
    //   password: process.env.INTEG_PASSWORD,
    // },
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
    /* Test against mobile viewports. */
    {
      name: 'mobile_iPhone13',
      use: { ...devices['iPhone 13 Pro Max'], storageState: './playwright/.auth/auth.json' },
      dependencies: ['setup'],
    },
    {
      name: 'mobile_nexus7',
      use: { ...devices['Nexus 7'], storageState: './playwright/.auth/auth.json' },
      dependencies: ['setup'],
    },
  ],
})
