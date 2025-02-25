import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { loginAndNavigate } from '../support/commonMethods'
import { getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'
import Constants from '../setup/Constants'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Ensure that minors and restricted visitors are unable to make a booking.', () => {

    test.beforeEach(async ({ page }) => {
        await loginAndNavigate(page, UserType.USER_ONE)
    })
    test('Should not be able book a visit for minors or banned visitors', async ({

        homePage,
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,

    }) => {
        test.slow()

        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_WITH_NO_ADULT_VISITORS)
        await searchPage.selectPrisonerfromResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()
        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        expect(await selectorVisitorPage.notificationOnPage('There are no approved visitors for this prisoner. A booking cannot be made at this time.'))
        await selectorVisitorPage.clickOnBackToHomeBtn()
        await homePage.selectBookOrChangeVisit()
        await searchPage.enterPrisonerNumber(Constants.PRISONER_WITH_BANNED_VISITORS)
        await searchPage.selectPrisonerfromResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()
        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.bannedVisitorIsDisabled('Select Sammy Saunders')

    })
})
