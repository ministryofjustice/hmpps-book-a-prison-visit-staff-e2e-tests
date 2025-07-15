import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to review visits', () => {

    test.beforeEach(async ({ loginPage, homePage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_ONE)
        await homePage.checkOnPage('Manage prison visits - DPS')
        await homePage.clickNeedReview()
    })

    test('Needs review check list', async ({
        needReviewPage

    }) => {
        expect(await needReviewPage.checkOnPage('Visits that need review - Manage prison visits - DPS')).toBeTruthy
        await needReviewPage.clickNeedReviewList()
        // Display reasons for review checklist 
        expect(await needReviewPage.reviewResonsListIsVisible()).toBe(true)
    })

})
