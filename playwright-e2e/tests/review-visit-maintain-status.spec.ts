import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { loginAndNavigate, teardownTestData } from '../support/commonMethods'
import { getAccessToken, releasePrisoner } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'
import Constants from '../setup/Constants'
test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('A visit is flagged for review when a prisoner is released after booking, allowing staff to take multiple actions', () => {

    test.beforeEach(async ({ page }) => {
        await loginAndNavigate(page, UserType.USER_TWO)
    })

    test('Do not modify a review, display an error if no reason is provided, and allow updates.', async ({

        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        additionalSupportPage,
        mainContactPage,
        bookingMethodPage,
        checkYourBookingPage,
        bookingConfirmationPage,
        request,
        homePage,
        needReviewPage,
        bookingDetailsPage,
        page,
        clearNotificationPage

    }) => {
        test.slow()

        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_ONE)
        await searchPage.selectPrisonerfromResults()

        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        expect(await additionalSupportPage.checkOnPage('Is additional support needed for any of the visitors? - Manage prison visits - DPS'))
        expect(await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        await mainContactPage.checkOnPage('Who is the main contact for this booking? - Manage prison visits - DPS')
        expect(await mainContactPage.headerOnPage('Who is the main contact for this booking?'))
        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        await bookingMethodPage.checkOnPage('How was this booking requested? - Manage prison visits - DPS')
        expect(await bookingMethodPage.headerOnPage('How was this booking requested?'))
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

        await checkYourBookingPage.checkOnPage('Check the visit details before booking - Manage prison visits - DPS')
        expect(await checkYourBookingPage.headerOnPage('Check the visit details before booking'))
        const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
        expect(mainContactNameOnDetails).toContain(mainContact)
        await checkYourBookingPage.selectSubmitBooking()

        await bookingConfirmationPage.checkOnPage('Booking confirmed - Manage prison visits - DPS')
        expect(await bookingConfirmationPage.headerOnPage('Booking confirmed'))
        expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
        const visitReference = await bookingConfirmationPage.getReferenceNumber()

        const res = await releasePrisoner({
            request,
            prisonCode: Constants.PRISON_ONE_CODE,
            prisonerCode: Constants.PRISONER_ONE,
            reason: "RELEASED",
        })
        expect(res.status).toBe(201)

        await page.waitForTimeout(3000)
        await bookingConfirmationPage.clickOnManagePrisonVisits()
        await homePage.clickNeedReview()
        await needReviewPage.clickNeedReviewList()
        expect(await needReviewPage.reviewResonsListIsVisible()).toBe(true)
        // await needReviewPage.clickViewReasonLink()
        expect(await needReviewPage.reviewReasonsListContains('Prisoner Released'))
        await needReviewPage.clickViewReasonLink()

        await bookingDetailsPage.clickOnDoNotChangeButton()

        expect(await clearNotificationPage.headerOnPage('Are you sure the visit does not need to be updated or cancelled?'))
        await clearNotificationPage.confirmDoNotChange()
        await clearNotificationPage.continueToNextPage()

        await bookingDetailsPage.doNotChangeBtnIsNotDisplayed()
        await bookingDetailsPage.signOut()

        GlobalData.set('visitReference', visitReference)
        console.log('Confirmation message:', visitReference)

    })

    test.afterAll('Teardown test data', async ({ request }) => {
        await teardownTestData(request);
    })

})
