import { test, expect } from '../fixtures/PageFixtures'
import Constants from '../setup/Constants'
import GlobalData from '../setup/GlobalData'
import { getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to book closed or an open sessions after changing the establishment', () => {

    test.beforeEach(async ({ loginPage, homePage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_FOUR)
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - DPS')
    })

    test('Book an OPEN session after changing the establishment ', async ({
        homePage,
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,

    }) => {
        test.slow()

        await homePage.clickOnChangeEstablishment()
        await homePage.selectEstablishment('Bristol (HMP)')
        await homePage.clickOnSubmitButton()
        await homePage.clickOnManagePrisonVisits()
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - DPS')
        await homePage.selectBookOrChangeVisit()

        // Switching the URL to 'staging' because selecting 'Change Establishment' sets the environment to 'Dev',
        // and DSP does not have a 'Staging' environment.

        await homePage.navigateTo('/')
        await homePage.selectBookOrChangeVisit()
        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_WITH_OPEN_SESSIONS)
        await searchPage.selectPrisonerfromResults()

        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        const restrictionType = await selectDateTimePage.getSessionCategory()
        expect(restrictionType).toContain('Open')
        await homePage.clickOnChangeEstablishment()
        await homePage.selectEstablishment('Drake Hall (HMP & YOI)')
        await homePage.clickOnSubmitButton()
        await homePage.navigateTo('/')
        await homePage.signOut()

    })

    test('Book a CLOSED session after changing the establishment ', async ({
        homePage,
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        visitTypePage

    }) => {
        test.slow()

        await homePage.clickOnChangeEstablishment()
        await homePage.selectEstablishment('Drake Hall (HMP & YOI)')
        await homePage.clickOnSubmitButton()
        await homePage.clickOnManagePrisonVisits()
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - DPS')
        await homePage.selectBookOrChangeVisit()

        // Switching the URL to 'staging' because selecting 'Change Establishment' sets the environment to 'Dev',
        // and DSP does not have a 'Staging' environment.

        await homePage.navigateTo('/')
        await homePage.selectBookOrChangeVisit()

        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_WITH_CLOSED_SESSIONS)
        await searchPage.selectPrisonerfromResults()

        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        await visitTypePage.selectVisitType('closed')
        await visitTypePage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        const restrictionType = await selectDateTimePage.getSessionCategory()
        expect(restrictionType).toContain('Closed')
    })

})
