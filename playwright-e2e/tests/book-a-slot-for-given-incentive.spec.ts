import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { createSessionTemplate, getAccessToken, deleteVisit, deleteTemplate, getSlotDataTestValue } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

// Set up global data before all tests
test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to book slots for various incentives', () => {
    // Common setup for each test
    test.beforeEach(async ({ loginPage, homePage }) => {

        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_FOUR)
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
        await homePage.selectBookOrChangeVisit()
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
        request

    }) => {
        test.slow()
        // Create a session template
        const sessionSlotTime = new Date();
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2); // Add 2 days
        sessionSlotTime.setHours(9, 0, 0, 0); // Set to 9:00 AM
        const prisonCode = "DHI"
        const prisonerNumber = 'A8900DZ'
        let status = await createSessionTemplate({ request }, sessionSlotTime, prisonCode, 1, 0, 1, null, "STANDARD", "FEMALE_CLOSED", true, "Automation Tests")
        expect(status).toBe(201)

        // Perform search and prisoner details validation    
        await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
        await searchPage.enterPrisonerNumber(prisonerNumber)
        await searchPage.selectPrisonerformResults()
        const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
        const prinsonerIncentive = await prisonerDetailsPage.getPrisonerIncentive()
        expect(prinsonerIncentive).toContain('Standard')
        expect(prisonerCat).toContain('Fem Closed')
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        // Select visitors and book a slot    
        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        // Additional support selection
        expect(await additionalSupportPage.checkOnPage('Manage prison visits - Is additional support needed for any of the visitors?'))
        expect(await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        // Main contact selection
        await mainContactPage.checkOnPage('Manage prison visits - Who is the main contact for this booking?')
        expect(await mainContactPage.headerOnPage('Who is the main contact for this booking?'))
        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        // Booking method
        await bookingMethodPage.checkOnPage('Manage prison visits - How was this booking requested?')
        expect(await bookingMethodPage.headerOnPage('How was this booking requested?'))
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

        // Complete booking
        await checkYourBookingPage.checkOnPage('Manage prison visits - Check the visit details before booking')
        expect(await checkYourBookingPage.headerOnPage('Check the visit details before booking'))
        const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
        expect(mainContactNameOnDetails).toContain(mainContact)
        await checkYourBookingPage.selectSubmitBooking()
        await bookingConfirmationPage.checkOnPage('Manage prison visits - Booking confirmed')
        expect(await bookingConfirmationPage.headerOnPage('Booking confirmed'))
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
        // Create a session template
        const sessionSlotTime = new Date();
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2); // Add 2 days
        sessionSlotTime.setHours(9, 0, 0, 0); // Set to 9:00 AM
        const prisonCode = "DHI"
        const prisonerNumber = 'A8900DZ'
        let status = await createSessionTemplate({ request }, sessionSlotTime, prisonCode, 1, 1, 0, null, "STANDARD", "FEMALE_CLOSED", false, "Automation Tests")
        expect(status).toBe(201)

        // Perform search and prisoner details validation        
        await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
        await searchPage.enterPrisonerNumber(prisonerNumber)
        await searchPage.selectPrisonerformResults()
        const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
        const prinsonerIncentive = await prisonerDetailsPage.getPrisonerIncentive()
        expect(prinsonerIncentive).toContain('Standard')
        expect(prisonerCat).toContain('Fem Closed')
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        // Select visitors and book a slot   
        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()
        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        // Additional support selection
        expect(await additionalSupportPage.checkOnPage('Manage prison visits - Is additional support needed for any of the visitors?'))
        expect(await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        // Main contact selection
        await mainContactPage.checkOnPage('Manage prison visits - Who is the main contact for this booking?')
        expect(await mainContactPage.headerOnPage('Who is the main contact for this booking?'))
        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        // Booking method
        await bookingMethodPage.checkOnPage('Manage prison visits - How was this booking requested?')
        expect(await bookingMethodPage.headerOnPage('How was this booking requested?'))
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

        // Complete Booking
        await checkYourBookingPage.checkOnPage('Manage prison visits - Check the visit details before booking')
        expect(await checkYourBookingPage.headerOnPage('Check the visit details before booking'))
        const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
        expect(mainContactNameOnDetails).toContain(mainContact)
        await checkYourBookingPage.selectSubmitBooking()
        await bookingConfirmationPage.checkOnPage('Manage prison visits - Booking confirmed')
        expect(await bookingConfirmationPage.headerOnPage('Booking confirmed'))
        expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
        const visitReference = await bookingConfirmationPage.getReferenceNumber()
        await bookingConfirmationPage.signOut()

        // Store visit reference
        GlobalData.set('visitReference', visitReference)
        console.debug('Confirmation message:', visitReference)

    })
    
    // Test case - Only valids slot that match the prisoner incentiver are visible 
    test("Only slots matching prisoner's incentive are displayed", async ({
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        request

    }) => {
        test.slow()
        // Create a session template
        const sessionSlotTime = new Date();
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2); // Add 2 days
        sessionSlotTime.setHours(9, 0, 0, 0); // Set to 9:00 AM
        const prisonCode = "DHI"
        const prisonerNumber = 'A8900DZ'
        let status = await createSessionTemplate({ request }, sessionSlotTime, prisonCode, 1, 0, 1, null, "ENHANCED", "FEMALE_CLOSED", false, "Automation Tests")
        expect(status).toBe(201)
        console.log(sessionSlotTime)

        // Perform search and prisoner details validation     
        await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
        await searchPage.enterPrisonerNumber(prisonerNumber)
        await searchPage.selectPrisonerformResults()
        const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
        const prinsonerIncentive = await prisonerDetailsPage.getPrisonerIncentive()
        expect(prinsonerIncentive).toContain('Standard')
        expect(prisonerCat).toContain('Fem Closed')
        await prisonerDetailsPage.clickOnBookAPrisonVisit()
        // Select visitors and book a slot   
        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        // 9 am slot is not displayed as the prisoner doesn't match the incentive  
        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        expect(await selectDateTimePage.getDisplayedSlots()).not.toContain(sessionSlotTime.toISOString())

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
                console.error('Failed to delete visit the ID ${visitId}:', error)
            }
        }
    })

    // Clear global data cache
    GlobalData.clear()
    console.log('Global data cache cleared.')
})

