import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { deleteVisit, getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'
import { parse, parseISO, format } from 'date-fns'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to view visits by date', () => {

    test.beforeEach(async ({ loginPage, homePage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_ONE)
        await homePage.checkOnPage('Manage prison visits - DPS')
    })

    test("Book a visit and view it on 'View visits by date page' ", async ({

        homePage,
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        additionalSupportPage,
        mainContactPage,
        bookingMethodPage,
        checkYourBookingPage,
        bookingConfirmationPage,
        visitByDatesPage

    }) => {
        test.slow()
        await homePage.selectBookOrChangeVisit()
        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber('A6036DZ')
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
        await bookingConfirmationPage.clickOnManagePrisonVisits()

        GlobalData.set('visitReference', visitReference)

        // Go to View Visits by date page & verfiy the above booking exists there.

        await homePage.clickOnVisitsByDate()
        await visitByDatesPage.headerOnPage('View visits by date')
        await visitByDatesPage.clickDateListLink()
        await visitByDatesPage.isBookedOnDateButtonVisible()
        const bookedDate = await visitByDatesPage.getBookedOnDate()
        const parsedDate = new Date()
        const bookingDate = parsedDate.toDateString()
        const formattedDate = format(bookingDate, 'd MMMM')
        const prisonerName = await visitByDatesPage.getPrisonerName()
        const prisonerNumber = await visitByDatesPage.getPrisonerNumber()
        expect(bookedDate).toContain(formattedDate + " at ")
        expect(prisonerName).toContain('Vsip_prisoner01, Do not use')
        expect(prisonerNumber).toContain('A6036DZ')

        console.log('Confirmation message:', visitReference)
        console.log("bookeddate:", bookedDate, "Parsed date:", parsedDate, "formattedDate:", formattedDate)

    })

    test.afterAll('Teardown test data', async ({ request }) => {
        let visitRef = GlobalData.getAll('visitReference')
        for (const visitId of visitRef) {
            await deleteVisit({ request }, visitId)
        }
        // Clear global data cache
        GlobalData.clear()
        console.log('Global data cache cleared.')
    })
})