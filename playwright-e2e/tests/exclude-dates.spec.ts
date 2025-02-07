import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { deleteVisit, excludeDate, getAccessToken, removeExcludeDate } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to view dates that have been excluded and amend reviews as required', () => {

    test.beforeEach(async ({ loginPage, homePage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_THREE)
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - DPS')
        await homePage.selectBookOrChangeVisit()
    })

    test('Exclude the booking date once booked and review the reason for the notification.', async ({

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
        needReviewPage,
        homePage,
        bookingDetailsPage

    }) => {
        test.slow()
        const prisonerNumber = "A6036DZ"
        const prisonCode = "HEI"

        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(prisonerNumber)
        await searchPage.selectPrisonerformResults()

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
        const visitDate = await bookingConfirmationPage.getVisitBookedForDate()
        const dateToExclude = new Date(visitDate)

        // Add Exclude date event
        const status = await excludeDate({ request }, prisonCode, dateToExclude)
        expect(status).toBe(201)

        await bookingConfirmationPage.clickOnManagePrisonVisits()
        await homePage.clickNeedReview()
        await needReviewPage.clickNeedReviewList()
        expect(await needReviewPage.reviewResonsListIsVisible()).toBe(true)
        await needReviewPage.clickViewReasonLink()
        expect(await bookingDetailsPage.notificationOnPage('A new visit time should be selected as the date is no longer available for social visits.'))
        await bookingConfirmationPage.signOut()

        // Remove Exclude date event

        const removeExludeDatestatus = await removeExcludeDate({ request }, prisonCode, dateToExclude)
        expect(removeExludeDatestatus).toBe(201)

        GlobalData.set('visitReference', visitReference)
        console.debug('Confirmation message:', visitReference)
        console.debug("Visit Date is:", visitDate)

    })

    test.afterAll('Teardown test data', async ({ request }) => {
        try {
            let visitRef = GlobalData.getAll('visitReference')
            for (const visitId of visitRef) {
                await deleteVisit({ request }, visitId)
            }
        } finally {
            // Clear global data cache
            GlobalData.clear()
            console.log('Global data cache cleared.')
        }
    })
})
