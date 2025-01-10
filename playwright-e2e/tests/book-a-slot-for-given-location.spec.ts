import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { createSessionTemplate, getAccessToken, deleteVisit, } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

// Set up global data before all tests
test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to book slots for various locations within the prison', () => {
    // Common setup for each test
    test.beforeEach(async ({ loginPage, homePage }) => {

        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_FOUR)
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - DPS')
        await homePage.selectBookOrChangeVisit()
    })
    // Test case: Book an open slot
    test("Book an open slot for a given location", async ({
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        additionalSupportPage,
        mainContactPage,
        bookingMethodPage,
        checkYourBookingPage,
        bookingConfirmationPage,
        visitTypePage,
        request

    }) => {
        test.slow()
        // Create a session template
        const sessionSlotTime = new Date();
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2); // Add 2 days
        sessionSlotTime.setHours(9, 0, 0, 0); // Set to 9:00 AM
        const prisonCode = "DHI"
        const prisonerNumber = 'A8899DZ'
        let status = await createSessionTemplate({ request }, sessionSlotTime, prisonCode, 1, 0, 1, "I-1-003", null, null, true, "Automation Tests")
        expect(status).toBe(201)

        // Perform search and prisoner details validation    
        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(prisonerNumber)
        await searchPage.selectPrisonerformResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        // Select visitors and book a slot    
        expect(await selectorVisitorPage.checkOnPage('Select visitors from the prisoner’s approved visitor list - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()
        await visitTypePage.selectVisitType('open')
        await visitTypePage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        // Additional support selection
        expect(await additionalSupportPage.checkOnPage('Is additional support needed for any of the visitors? - Manage prison visits - DPS'))
        expect(await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        // Main contact selection
        await mainContactPage.checkOnPage('Who is the main contact for this booking? - Manage prison visits - DPS')
        expect(await mainContactPage.headerOnPage('Who is the main contact for this booking?'))
        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        // Booking method
        await bookingMethodPage.checkOnPage('How was this booking requested? - Manage prison visits - DPS')
        expect(await bookingMethodPage.headerOnPage('How was this booking requested?'))
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

        // Complete booking
        await checkYourBookingPage.checkOnPage('Check the visit details before booking - Manage prison visits - DPS')
        expect(await checkYourBookingPage.headerOnPage('Check the visit details before booking'))
        const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
        expect(mainContactNameOnDetails).toContain(mainContact)
        await checkYourBookingPage.selectSubmitBooking()
        await bookingConfirmationPage.checkOnPage('Booking confirmed - Manage prison visits - DPS')
        expect(await bookingConfirmationPage.headerOnPage('Booking confirmed'))
        expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
        const visitReference = await bookingConfirmationPage.getReferenceNumber()
        await bookingConfirmationPage.signOut()

        // Store visit reference
        GlobalData.set('visitReference', visitReference)
        console.debug('Confirmation message:', visitReference)

    })

    // Test case: Book a closed slot
    test("Book a closed slot that matches prisoner's location", async ({
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
        visitTypePage

    }) => {
        test.slow()
        // Create a session template
        const sessionSlotTime = new Date();
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2); // Add 2 days
        sessionSlotTime.setHours(9, 0, 0, 0); // Set to 9:00 AM
        const prisonCode = "DHI"
        const prisonerNumber = 'A8899DZ'
        let status = await createSessionTemplate({ request }, sessionSlotTime, prisonCode, 1, 1, 0, "I-1-003", null, null, true, "Automation Tests")
        expect(status).toBe(201)

        // Perform search and prisoner details validation        
        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(prisonerNumber)
        await searchPage.selectPrisonerformResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        // Select visitors and book a slot   
        expect(await selectorVisitorPage.checkOnPage('Select visitors from the prisoner’s approved visitor list - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()
        await visitTypePage.selectVisitType('closed')
        await visitTypePage.continueToNextPage()
        expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        // Additional support selection
        expect(await additionalSupportPage.checkOnPage('Is additional support needed for any of the visitors? - Manage prison visits - DPS'))
        expect(await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        // Main contact selection
        await mainContactPage.checkOnPage('Who is the main contact for this booking? - Manage prison visits - DPS')
        expect(await mainContactPage.headerOnPage('Who is the main contact for this booking?'))
        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        // Booking method
        await bookingMethodPage.checkOnPage('How was this booking requested? - Manage prison visits - DPS')
        expect(await bookingMethodPage.headerOnPage('How was this booking requested?'))
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

        // Complete Booking
        await checkYourBookingPage.checkOnPage('Check the visit details before booking - Manage prison visits - DPS')
        expect(await checkYourBookingPage.headerOnPage('Check the visit details before booking'))
        const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
        expect(mainContactNameOnDetails).toContain(mainContact)
        await checkYourBookingPage.selectSubmitBooking()
        await bookingConfirmationPage.checkOnPage('Booking confirmed - Manage prison visits - DPS')
        expect(await bookingConfirmationPage.headerOnPage('Booking confirmed'))
        expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
        const visitReference = await bookingConfirmationPage.getReferenceNumber()
        await bookingConfirmationPage.signOut()

        // Store visit reference
        GlobalData.set('visitReference', visitReference)
        console.debug('Confirmation message:', visitReference)

    })

    // Test case - No slots are displayed as prinsoner doesn't match the location template
    test("No slots are displayed as the prisoner doesn't match the location set", async ({
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        request,
        visitTypePage

    }) => {
        test.slow()
        // Create a session template
        const sessionSlotTime = new Date();
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2); // Add 2 days
        sessionSlotTime.setHours(9, 0, 0, 0); // Set to 9:00 AM
        const prisonCode = "DHI"
        const prisonerNumber = 'A8899DZ'
        let status = await createSessionTemplate({ request }, sessionSlotTime, prisonCode, 1, 0, 1, "IM-NOT-HERE", null, null, true, "Automation Tests")
        expect(status).toBe(201)
        console.log(sessionSlotTime)

        // Perform search and prisoner details validation     
        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(prisonerNumber)
        await searchPage.selectPrisonerformResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        // Select visitors and book a slot   
        expect(await selectorVisitorPage.checkOnPage('Select visitors from the prisoner’s approved visitor list - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()
        await visitTypePage.selectVisitType('open')
        await visitTypePage.continueToNextPage()

        // 9 am slot is not displayed as the prisoner doesn't match the location
        expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        expect(await selectDateTimePage.pageHasText('There are no available time slots for this prisoner.'))
        //Signout of the service 
        await selectDateTimePage.signOut()
    })

    // Teardown after each test
    test.afterEach('Teardown test data', async ({ request }) => {
        let visitRef = GlobalData.getAll('visitReference')
        for (const visitId of visitRef) {

            try {
                await deleteVisit({ request }, visitId)
            } catch (error) {
                console.debug('Failed to delete visit the ID ${visitId}:', error)
            }
        }
    })

    // Clear global data cache
    GlobalData.clear()
    console.log('Global data cache cleared.')
})

