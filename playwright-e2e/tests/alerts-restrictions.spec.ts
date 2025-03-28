import { test, expect } from '../fixtures/PageFixtures'
import Constants from '../setup/Constants'
import GlobalData from '../setup/GlobalData'
import { teardownTestData } from '../support/commonMethods'
import { getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Display alerts and restrictions to a given prisnoer', () => {

    test.beforeEach(async ({ loginPage, homePage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_THREE)
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - DPS')
        await homePage.selectBookOrChangeVisit()
    })

    test('Display alerts and restrictions on the select visitor page', async ({

        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        // selectDateTimePage,
        // additionalSupportPage,
        // mainContactPage,
        // bookingMethodPage,
        // checkYourBookingPage,
        // bookingConfirmationPage

    }) => {
        test.slow()

        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_WITH_ALERTS)
        await searchPage.selectPrisonerfromResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()
        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        expect(await selectorVisitorPage.displayAlert('Domestic Violence Perpetrator'))
    })
})