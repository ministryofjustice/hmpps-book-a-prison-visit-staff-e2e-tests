import exp from 'constants'
import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { deleteVisit, getAccessToken } from '../support/testingHelperClient'
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
        blockVisitDatepage
    }) => {
        test.slow()
        await homePage.clickOnBlockVisitDates()
        await blockVisitDatepage.checkOnPage('Manage prison visits - Block visit dates')
        expect(await blockVisitDatepage.headerOnPage('Block visit dates')).toBeTruthy
        await blockVisitDatepage.enterDateToBlock('25/11/2026')
        await blockVisitDatepage.continueToNextPage()
        expect(await blockVisitDatepage.headerOnPage('Are you sure you want to block visits on Wednesday 25 November 2026?')).toBeTruthy
        await blockVisitDatepage.confirmBlockDate()
        await blockVisitDatepage.continueToNextPage()
        expect(await blockVisitDatepage.confrmationMessage('Visits are blocked for Wednesday 25 November 2026.')).toBeTruthy
        await blockVisitDatepage.signOut()

    })

    test('Unblock a vist date', async ({

        homePage,
        blockVisitDatepage

    }) => {
        test.slow()
        await homePage.clickOnBlockVisitDates()
        await blockVisitDatepage.checkOnPage('Manage prison visits - Block visit dates')
        expect(await blockVisitDatepage.headerOnPage('Block visit dates')).toBeTruthy
        await blockVisitDatepage.enterDateToBlock('25/11/2026')
        await blockVisitDatepage.continueToNextPage()
        expect(await blockVisitDatepage.errorMsg('The date entered is already blocked')).toBeTruthy
        await blockVisitDatepage.unBlockDate()
        expect(await blockVisitDatepage.confrmationMessage('Visits are unblocked for Wednesday 25 November 2026.')).toBeTruthy
        await blockVisitDatepage.signOut()

    })
})

