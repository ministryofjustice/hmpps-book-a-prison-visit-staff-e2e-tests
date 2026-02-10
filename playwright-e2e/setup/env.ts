type Environment = 'dev' | 'staging'

export default class ENV {

    // Environment selector

    private static readonly ENV: Environment =
        (process.env.ENVIRONMENT as Environment) ?? 'staging'

    // URLs per environment

    private static readonly URLS: Record<Environment, {
        BASE_URL: string
        HMPPS_AUTH_URL: string
        TEST_HELPER_API_URL: string
    }> = {
            dev: {
                BASE_URL: 'http://localhost:3000',
                HMPPS_AUTH_URL: 'https://sign-in-dev.hmpps.service.justice.gov.uk',
                TEST_HELPER_API_URL: 'https://test-helper-api-dev.hmpps.service.justice.gov.uk',
            },
            staging: {
                BASE_URL: 'https://manage-prison-visits-staging.prison.service.justice.gov.uk',
                HMPPS_AUTH_URL: 'https://sign-in-staging.hmpps.service.justice.gov.uk/auth',
                TEST_HELPER_API_URL: 'https://hmpps-prison-visits-testing-helper-api-staging.prison.service.justice.gov.uk',
            },

        }

    // Config with defaults

    public static readonly BASE_URL =
        process.env.BASE_URL ?? ENV.URLS[ENV.ENV].BASE_URL

    public static readonly HMPPS_AUTH_URL =
        process.env.HMPPS_AUTH_URL ?? ENV.URLS[ENV.ENV].HMPPS_AUTH_URL

    public static readonly TEST_HELPER_API_URL =
        process.env.TEST_HELPER_API_URL ?? ENV.URLS[ENV.ENV].TEST_HELPER_API_URL

    // Secrets

    private static required(name: string): string {
        const value = process.env[name]
        if (!value) {
            throw new Error(`Missing required environment variable: ${name}`)
        }
        return value
    }

    public static readonly PASSWORD = ENV.required('PASSWORD')
    public static readonly TESTING_CLIENT_ID = ENV.required('TESTING_CLIENT_ID')
    public static readonly TESTING_CLIENT_SECRET =
        ENV.required('TESTING_CLIENT_SECRET')

    // Users
    public static readonly USER_ONE = process.env.USER_ONE
    public static readonly USER_TWO = process.env.USER_TWO
    public static readonly USER_THREE = process.env.USER_THREE
    public static readonly USER_FOUR = process.env.USER_FOUR
}
