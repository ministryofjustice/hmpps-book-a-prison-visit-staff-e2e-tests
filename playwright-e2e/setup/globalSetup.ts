import { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'
import Constants from './Constants'

async function globalSetup(config: FullConfig) {
  if (process.env.test_env) {
    dotenv.config({
      path: `.env.${process.env.test_env}`,
      override: true,
    })
  }

  // Add global constants here
  switch (process.env.test_env) {
    case 'dev':
      process.env.BASE_URL = Constants.DEV_BASE_URL
      process.env.HMPPS_AUTH_URL = Constants.DEV_HMPPS_AUTH_URL
      process.env.TEST_HELPER_API_URL = Constants.DEV_TEST_HELPER_API_URL
      break
    case 'staging':
      process.env.BASE_URL = Constants.STAGING_BASE_URL
      process.env.HMPPS_AUTH_URL = Constants.STAGING_HMPPS_AUTH_URL
      process.env.TEST_HELPER_API_URL = Constants.STAGING_TEST_HELPER_API_URL
      break
    default:
      throw new Error('Please set the test_env environment variable to either dev or staging')
  }
}

export default globalSetup
