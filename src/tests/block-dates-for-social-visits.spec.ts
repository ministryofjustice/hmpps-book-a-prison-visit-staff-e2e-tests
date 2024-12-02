import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to block dates for social visits', () => {

    test.beforeEach(async ({ loginPage, homePage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_THREE)
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
    })

    test('Block a vist date', async ({
        homePage,
        blockVisitDatePage
    }) => {

        // Navigate to the Block Visit Dates page
        await homePage.clickOnBlockVisitDates()
        await blockVisitDatePage.checkOnPage('Manage prison visits - Block visit dates')
        expect(await blockVisitDatePage.headerOnPage('Block visit dates')).toBeTruthy

        // Block a specific date
        const blockDate = '25/11/2026'
        await blockVisitDatePage.enterDateToBlock(blockDate)
        await blockVisitDatePage.continueToNextPage()
        expect(await blockVisitDatePage.headerOnPage(`Are you sure you want to block visits on Wednesday 25 November 2026?`)).toBeTruthy

        // Confirm the block
        await blockVisitDatePage.confirmBlockDate()
        await blockVisitDatePage.continueToNextPage()
        expect(await blockVisitDatePage.confirmationMessage(`Visits are blocked for Wednesday 25 November 2026.`)).toBeTruthy

        await blockVisitDatePage.signOut()

    })

    test('Unblock a vist date', async ({

        homePage,
        blockVisitDatePage

    }) => {
        await homePage.clickOnBlockVisitDates()
        await blockVisitDatePage.checkOnPage('Manage prison visits - Block visit dates')
        expect(await blockVisitDatePage.headerOnPage('Block visit dates')).toBeTruthy
        await blockVisitDatePage.enterDateToBlock('25/11/2026')
        await blockVisitDatePage.continueToNextPage()
        expect(await blockVisitDatePage.errorMsg('The date entered is already blocked')).toBeTruthy
        await blockVisitDatePage.unBlockDate()
        expect(await blockVisitDatePage.confirmationMessage('Visits are unblocked for Wednesday 25 November 2026.')).toBeTruthy
        await blockVisitDatePage.signOut()
    })
})
