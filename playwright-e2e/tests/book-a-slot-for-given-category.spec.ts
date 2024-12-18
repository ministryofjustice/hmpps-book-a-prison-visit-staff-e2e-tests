import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { createSessionTemplate, getAccessToken, deleteVisit, getSlotDataTestValue } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to book slots for various categories', () => {

    test.beforeEach(async ({ loginPage, homePage }) => {
        // Common steps for all tests
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_FOUR)
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
        await homePage.selectBookOrChangeVisit()
    })

    test("Book an open slot that matches prisoner's category", async ({
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
        let status = await createSessionTemplate({ request }, sessionSlotTime, prisonCode, 1, 0, 1, null, null, "FEMALE_CLOSED", false, "Automation Tests")
        expect(status).toBe(201)

        // Search for a prisoner 
        await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
        await searchPage.enterPrisonerNumber('A8900DZ')
        await searchPage.selectPrisonerformResults()

        const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
        expect(prisonerCat).toContain('Fem Closed')
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        // Select a visitor and time slot
        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        // Additional support info
        expect(await additionalSupportPage.checkOnPage('Manage prison visits - Is additional support needed for any of the visitors?'))
        expect(await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        // Main contanct info         
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

        // Verify & confirm booking
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

        // Set global data for teardown 
        GlobalData.set('visitReference', visitReference)
        console.debug('Confirmation message:', visitReference)

    })


    test("Slots that do not match a prisoner's category are not displayed", async ({

        request,
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage }, testInfo) => {
        GlobalData.set('authToken', await getAccessToken({ request }))
        GlobalData.set('deviceName', testInfo.project.name)

        //Create session template
        const sessionSlotTime = new Date();
        sessionSlotTime.setDate(sessionSlotTime.getDate() + 2); // Add 2 days
        sessionSlotTime.setHours(9, 0, 0, 0); // Set to 9:00 AM
        const prisonCode = "DHI"
        let status = await createSessionTemplate({ request }, sessionSlotTime, prisonCode, 1, 0, 1, null, null, 'A_HIGH', false, "Automation Tests")
        expect(status).toBe(201)

        // Search for a prisoner 
        await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
        await searchPage.enterPrisonerNumber('A8900DZ')
        await searchPage.selectPrisonerformResults()
        const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
        expect(prisonerCat).toContain('Fem Closed')
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        // Select a visitor and select a slot
        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        // 9 am slot is not displayed as the prisoner doesn't match the category   
        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        expect(await selectDateTimePage.getDisplayedSlots()).not.toContain(sessionSlotTime.toISOString())

        //Signout of the service 
        await selectDateTimePage.signOut()

    })

    // Teardown after tests
    test.afterAll('Teardown test data', async ({ request }) => {
        let visitRef = GlobalData.getAll('visitReference')
        for (const visitId of visitRef) {
            try {
                await deleteVisit({ request }, visitId)
            } catch (error) {
                console.error('Failed to delte visit the ID ${visitID}:', error)
            }
        }
    })

    // Clear global data cache
    GlobalData.clear()
    console.log('Global data cache cleared.')
})
