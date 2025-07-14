import { test, expect } from '../fixtures/PageFixtures'
import Constants from '../setup/Constants'
import GlobalData from '../setup/GlobalData'
import { teardownTestData } from '../support/commonMethods'
import { getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'
import { format, parse } from 'date-fns'

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

    test.skip('Book and verify visit on "View visits by date" page', async ({
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
        visitByDatesPage,
    }) => {
        test.slow()
        const visitRoomCaption = 'Visits Main Room'

        await homePage.selectBookOrChangeVisit()
        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_TWO)
        await searchPage.selectPrisonerfromResults()

        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS')
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS')
        await selectDateTimePage.headerOnPage('Select date and time of visit')
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        await additionalSupportPage.checkOnPage('Is additional support needed for any of the visitors? - Manage prison visits - DPS')
        await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?')
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        await mainContactPage.checkOnPage('Who is the main contact for this booking? - Manage prison visits - DPS')
        await mainContactPage.headerOnPage('Who is the main contact for this booking?')
        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        await bookingMethodPage.checkOnPage('How was this booking requested? - Manage prison visits - DPS')
        await bookingMethodPage.headerOnPage('How was this booking requested?')
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

        await checkYourBookingPage.checkOnPage('Check the visit details before booking - Manage prison visits - DPS')
        await checkYourBookingPage.headerOnPage('Check the visit details before booking')
        const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
        expect(mainContactNameOnDetails).toContain(mainContact)
        await checkYourBookingPage.selectSubmitBooking()

        await bookingConfirmationPage.checkOnPage('Booking confirmed - Manage prison visits - DPS')
        await bookingConfirmationPage.headerOnPage('Booking confirmed')
        expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
        const visitDate = await bookingConfirmationPage.getVisitBookedForDate()
        // console.log("Visit Date is:", visitDate)
        const parsedDate = parse(visitDate, 'EEEE dd MMMM yyyy', new Date())
        const formattedDateToEnter = format(parsedDate, 'dd/M/yyyy')
        // console.log("date to enter", formattedDateToEnter)
        const visitReference = await bookingConfirmationPage.getReferenceNumber()
        await bookingConfirmationPage.clickOnManagePrisonVisits()

        GlobalData.set('visitReference', visitReference)

        // Go to View Visits by date page & verify the above booking exists there.
        await homePage.clickOnVisitsByDate()
        await visitByDatesPage.headerOnPage('View visits by date')
        await visitByDatesPage.enterBookingDate(formattedDateToEnter)
        await visitByDatesPage.clickViewButton()

        const prisonerName = await visitByDatesPage.getPrisonerName()
        const prisonerNumber = await visitByDatesPage.getPrisonerNumber()
        const prisonRoomName = await visitByDatesPage.getPrisonerRoomName()
        const bookedOnDate = await visitByDatesPage.getBookedOnDate()
        // console.log("Booked on date is", bookedOnDate)
        const today = new Date()
        const expectedBookedOnDate = format(today, 'd MMMM')
        expect(bookedOnDate).toContain(`${expectedBookedOnDate} at `)
        expect(prisonerName).toContain('Vsip_prisoner01, Do not use')
        expect(prisonerNumber).toContain(Constants.PRISONER_TWO)
        expect(prisonRoomName).toContain(visitRoomCaption)

    })

    test.afterAll('Teardown test data', async ({ request }) => {
        await teardownTestData(request)
    })
})
