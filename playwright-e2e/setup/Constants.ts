export default class Constants {
    static readonly STAGING_BASE_URL = `https://manage-prison-visits-staging.prison.service.justice.gov.uk`
    static readonly STAGING_HMPPS_AUTH_URL = `https://sign-in-dev.hmpps.service.justice.gov.uk/auth`
    static readonly STAGING_TEST_HELPER_API_URL = `https://hmpps-prison-visits-testing-helper-api-staging.prison.service.justice.gov.uk`

    static readonly DEV_BASE_URL = `https://manage-prison-visits-dev.prison.service.justice.gov.uk`
    static readonly DEV_HMPPS_AUTH_URL = `https://sign-in-dev.hmpps.service.justice.gov.uk/auth`
    static readonly DEV_TEST_HELPER_API_URL = `https://hmpps-prison-visits-testing-helper-api-dev.prison.service.justice.gov.uk`

    // Test data 

    static readonly PRISONER_ONE = "A6539DZ"
    static readonly PRISON_ONE_CODE = "HEI"
    static readonly PRISONER_TWO = "A6036DZ"
    static readonly PRISON_TWO_CODE = "DHI"
    static readonly PRISONER_THREE = "A8900DZ"
    static readonly PRISONER_FOUR = "A8899DZ"
    static readonly PRISONER_FIVE = "A6038DZ"
    static readonly PRISONER_SIX = "A6541DZ"
    static readonly PRISONER_WITH_NO_ADULT_VISITORS = "A6445DZ"
    static readonly PRISONER_WITH_BANNED_VISITORS = "A8416DZ"
    static readonly PRISONER_WITH_OPEN_SESSIONS = "A8897DZ"
    static readonly PRISONER_WITH_CLOSED_SESSIONS = "A8899DZ"
    static readonly PRISONER_WITH_ALERTS = "G1716GI"

}

