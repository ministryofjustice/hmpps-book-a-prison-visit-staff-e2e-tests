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
        await homePage.checkOnPage('Manage prison visits - DPS')
    })

    test('Block a vist date', async ({
        homePage,
        blockVisitDatePage
    }) => {

        // Navigate to the Block Visit Dates page
        await homePage.clickOnBlockVisitDates()
        await blockVisitDatePage.checkOnPage('Block visit dates - Manage prison visits - DPS')
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
    test('Unblock a visit date', async ({ homePage, blockVisitDatePage }) => {
        const blockedDate = '25/11/2026';
        // const confirmationMessage = `Visits are unblocked for Wednesday ${blockedDate}.`

        // Navigate to Block Visit Dates page
        await homePage.clickOnBlockVisitDates()
        await blockVisitDatePage.checkOnPage('Block visit dates - Manage prison visits - DPS')
        expect(await blockVisitDatePage.headerOnPage('Block visit dates')).toBeTruthy

        // Block the date and verify error message
        await blockVisitDatePage.enterDateToBlock(blockedDate)
        await blockVisitDatePage.continueToNextPage();
        expect(await blockVisitDatePage.errorMsg('The date entered is already blocked')).toBeTruthy

        // Unblock the date and verify confirmation message
        await blockVisitDatePage.unBlockDate()
        expect(await blockVisitDatePage.confirmationMessage('Visits are unblocked for Wednesday 25 November 2026.')).toBeTruthy

        // Sign out
        await blockVisitDatePage.signOut();
    })
})
