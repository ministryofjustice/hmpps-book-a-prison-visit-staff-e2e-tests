import { test, expect } from '../fixtures/PageFixtures'
import Constants from '../setup/Constants'
import GlobalData from '../setup/GlobalData'
import { createSessionTemplate, getAccessToken, deleteVisit } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'
import { loginAndNavigate, teardownTestData } from '../support/commonMethods'

// Set up global data before all tests
test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to book slots for various incentives', () => {

    // Use common login and navigation before each test
    test.beforeEach(async ({ page }) => {
        await loginAndNavigate(page, UserType.USER_FOUR)
    })

    // Test case: Book an open slot
    test("Book an open slot that matches prisoner's incentive", async ({
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
    }) => {
        test.slow()
        // Create a session template
        const sessionSlotTime = new Date()
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2)
        sessionSlotTime.setHours(9, 0, 0, 0)
        const sessionEndTime = new Date(sessionSlotTime)
        sessionEndTime.setHours(10, 0, 0, 0) // 1-hour slot

        const prisonCode = "DHI"
        const prisonerNumber = 'A8900DZ'
        const { status: templateStatus, templateId } = await createSessionTemplate(
            { request },
            sessionSlotTime,
            prisonCode,
            1,
            0,
            1,
            null,
            "STANDARD",
            "FEMALE_CLOSED",
            true,
            "Automation Tests",
            sessionEndTime
        )
        expect(templateStatus).toBe(201)
        expect(templateId).toBeTruthy()

        // Perform search and prisoner details validation    
        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(prisonerNumber)
        await searchPage.selectPrisonerfromResults()
        const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
        const prisonerIncentive = await prisonerDetailsPage.getPrisonerIncentive()
        expect(prisonerIncentive).toContain('Standard')
        expect(prisonerCat).toContain('Fem Closed')
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        // Select visitors and book a slot    
        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        // Additional support selection
        expect(await additionalSupportPage.checkOnPage('Is additional support needed for any of the visitors? - Manage prison visits - DPS'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        // Main contact selection
        await mainContactPage.checkOnPage('Who is the main contact for this booking? - Manage prison visits - DPS')
        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        // Booking method
        await bookingMethodPage.checkOnPage('How was this booking requested? - Manage prison visits - DPS')
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

        // Complete booking
        await checkYourBookingPage.checkOnPage('Check the visit details before booking - Manage prison visits - DPS')
        const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
        expect(mainContactNameOnDetails).toContain(mainContact)
        await checkYourBookingPage.selectSubmitBooking()
        await bookingConfirmationPage.checkOnPage('Booking confirmed - Manage prison visits - DPS')
        expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
        const visitReference = await bookingConfirmationPage.getReferenceNumber()
        await bookingConfirmationPage.signOut()

        // Store visit reference
        GlobalData.set('visitReference', visitReference)
        console.debug('Confirmation message:', visitReference)
    })

    // Test case: Book a closed slot
    test("Book a closed slot that matches prisoner's incentive", async ({
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        additionalSupportPage,
        mainContactPage,
        bookingMethodPage,
        checkYourBookingPage,
        bookingConfirmationPage,
        request
    }) => {
        test.slow()
        const sessionSlotTime = new Date()
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2)
        sessionSlotTime.setHours(9, 0, 0, 0)
        const sessionEndTime = new Date(sessionSlotTime)
        sessionEndTime.setHours(10, 0, 0, 0)

        const { status: templateStatus, templateId } = await createSessionTemplate(
            { request },
            sessionSlotTime,
            Constants.PRISON_TWO_CODE,
            1,
            1,
            0,
            null,
            "STANDARD",
            "FEMALE_CLOSED",
            false,
            "Automation Tests",
            sessionEndTime
        )
        expect(templateStatus).toBe(201)
        expect(templateId).toBeTruthy()

        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_THREE)
        await searchPage.selectPrisonerfromResults()
        const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
        const prisonerIncentive = await prisonerDetailsPage.getPrisonerIncentive()
        expect(prisonerIncentive).toContain('Standard')
        expect(prisonerCat).toContain('Fem Closed')
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        expect(await additionalSupportPage.checkOnPage('Is additional support needed for any of the visitors? - Manage prison visits - DPS'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        await mainContactPage.checkOnPage('Who is the main contact for this booking? - Manage prison visits - DPS')
        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        await bookingMethodPage.checkOnPage('How was this booking requested? - Manage prison visits - DPS')
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

        await checkYourBookingPage.checkOnPage('Check the visit details before booking - Manage prison visits - DPS')
        const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
        expect(mainContactNameOnDetails).toContain(mainContact)
        await checkYourBookingPage.selectSubmitBooking()
        await bookingConfirmationPage.checkOnPage('Booking confirmed - Manage prison visits - DPS')
        expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
        const visitReference = await bookingConfirmationPage.getReferenceNumber()
        await bookingConfirmationPage.signOut()

        GlobalData.set('visitReference', visitReference)
        console.debug('Confirmation message:', visitReference)
    })

    // Teardown after each test
    test.afterEach('Teardown test data', async ({ request }) => {
        const visitRefs = GlobalData.getAll('visitReference')
        for (const visitId of visitRefs) {
            try {
                await deleteVisit({ request }, visitId)
            } catch (error) {
                console.error(`Failed to delete visit ID ${visitId}:`, error)
            }
        }
    })

    // Clear global data cache
    test.afterAll(() => {
        GlobalData.clear()
        console.log('Global data cache cleared.')
    })
})
