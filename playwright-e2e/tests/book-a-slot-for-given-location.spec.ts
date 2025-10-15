import { test, expect } from '../fixtures/PageFixtures'
import Constants from '../setup/Constants'
import GlobalData from '../setup/GlobalData'
import { teardownTestData, loginAndNavigate } from '../support/commonMethods'
import { createSessionTemplate, getAccessToken, deleteTemplate } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

// Set up global data before all tests
test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to book slots for various locations within the prison', () => {

    test.beforeEach(async ({ page }) => {
        await loginAndNavigate(page, UserType.USER_FOUR)
    })

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
            0,
            1,
            "I-1-003",
            null,
            null,
            true,
            "Automation Tests",
            sessionEndTime
        )
        expect(templateStatus).toBe(201)
        expect(templateId).toBeTruthy()

        // Track created template
        const createdTemplates = GlobalData.get('createdTemplates') || []
        createdTemplates.push(templateId)
        GlobalData.set('createdTemplates', createdTemplates)

        // Booking flow
        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_FOUR)
        await searchPage.selectPrisonerfromResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()
        await visitTypePage.selectVisitType('open')
        await visitTypePage.continueToNextPage()

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
            "I-1-003",
            null,
            null,
            true,
            "Automation Tests",
            sessionEndTime
        )
        expect(templateStatus).toBe(201)
        expect(templateId).toBeTruthy()

        // Track created template
        const createdTemplates = GlobalData.get('createdTemplates') || []
        createdTemplates.push(templateId)
        GlobalData.set('createdTemplates', createdTemplates)

        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_FOUR)
        await searchPage.selectPrisonerfromResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()
        await visitTypePage.selectVisitType('closed')
        await visitTypePage.continueToNextPage()

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

    test("No slots are displayed as the prisoner doesn't match the location set", async ({
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        request,
        visitTypePage
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
            0,
            1,
            "IM-NOT-HERE",
            null,
            null,
            true,
            "Automation Tests",
            sessionEndTime
        )
        expect(templateStatus).toBe(201)
        expect(templateId).toBeTruthy()

        // ✅ Track created template
        const createdTemplates = GlobalData.get('createdTemplates') || []
        createdTemplates.push(templateId)
        GlobalData.set('createdTemplates', createdTemplates)
        console.log('🧠 Tracked new template:', templateId)
        console.log('📦 All tracked templates so far:', GlobalData.get('createdTemplates'))

        await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
        await searchPage.enterPrisonerNumber(Constants.PRISONER_FOUR)
        await searchPage.selectPrisonerfromResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()
        await visitTypePage.selectVisitType('open')
        await visitTypePage.continueToNextPage()

        expect(await selectDateTimePage.pageHasText(
            'There are no available visit times for this prisoner. This may be due to existing visits, non-associations or visitors who are banned.'
        ))
        await selectDateTimePage.signOut()
    })

    test.afterAll('Teardown test data', async ({ request }) => {
        await teardownTestData(request)

        // Delete created session templates
        const createdTemplates = GlobalData.get('createdTemplates') || []
        for (const templateId of createdTemplates) {
            const status = await deleteTemplate({ request }, templateId)
            console.log(`Deleted template ${templateId}, status: ${status}`)
        }

        GlobalData.clear()
        console.log('Global data cache cleared.')
    })
})
