import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { deleteVisit, getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Setup global data and access token', async ({ request }, testInfo) => {
    GlobalData.clear() // Ensure cache is clear before tests
    const authToken = await getAccessToken({ request })
    GlobalData.set('authToken', authToken)
    GlobalData.set('deviceName', testInfo.project.name)
    console.log('Global data initialized.')
})

test.describe('Error message validations', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
    })

    test('Error messages on the search page', async ({ searchPage, homePage, loginPage }) => {
        await test.step('Sign in and navigate to search page', async () => {
            await loginPage.signInWith(UserType.USER_ONE)
            await homePage.checkOnPage('Manage prison visits - Manage prison visits');
            await homePage.selectBookOrChangeVisit()
        })

        await test.step('Validate error for empty search', async () => {
            await searchPage.clickOnSearch()
            const errorMessage = await searchPage.getErrorMessage()
            expect(errorMessage).toContain('You must enter at least 2 characters')
        })

        await test.step('Validate error for invalid booking reference', async () => {
            await searchPage.clickOnSearchByBookingRef()
            await searchPage.headerOnPage('Search for a booking')
            await searchPage.clickOnSearch()
            const invalidRefError = await searchPage.getInvalidRefErrorMessage()
            expect(invalidRefError).toContain('Booking reference must be 8')
        })

        await searchPage.signOut()
    })

    test.skip('Error messages on "View Visits by Date" page', async ({ homePage, visitByDatesPage, loginPage }) => {
        await test.step('Sign in and navigate to Visits by Date page', async () => {
            await loginPage.signInWith(UserType.USER_ONE)
            await homePage.checkOnPage('Manage prison visits - Manage prison visits')
            await homePage.clickOnVisitsByDate()
        })

        await test.step('Validate invalid date error message', async () => {
            await visitByDatesPage.headerOnPage('View visits by date')
            await visitByDatesPage.clickViewAnotherDateButton()
            await visitByDatesPage.clickViewButton()
            const dateErrorMsg = await visitByDatesPage.getInvalidDateErrorMessage();
            expect(dateErrorMsg).toContain('Enter a valid date')
        })

        await visitByDatesPage.signOut()
    })

    test("Error messages on 'Select Visit Type' page", async ({ homePage, loginPage, searchPage, prisonerDetailsPage, selectorVisitorPage, visitTypePage }) => {
        await test.step('Sign in and navigate to Select Visit Type page', async () => {
            await loginPage.signInWith(UserType.USER_FOUR)
            await homePage.checkOnPage('Manage prison visits - Manage prison visits')
            await homePage.selectBookOrChangeVisit()
            await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
            await searchPage.enterPrisonerNumber('A8899DZ')
            await searchPage.selectPrisonerformResults()
            await prisonerDetailsPage.clickOnBookAPrisonVisit()
        })

        await test.step('Validate error for no visit type selected', async () => {
            await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list')
            await selectorVisitorPage.selectFirstVisitor()
            await selectorVisitorPage.continueToNextPage()
            await visitTypePage.headerOnPage("Check the prisoner's closed visit restrictions")
            await visitTypePage.continueToNextPage()
            const visitTypeErrorMsg = await visitTypePage.getVisitTypeErrorMessage()
            expect(visitTypeErrorMsg).toContain('No visit type selected')
        })

        await visitTypePage.signOut()
    })

    test('Main Contact page error and booking flow', async ({
        homePage,
        loginPage,
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        selectDateTimePage,
        additionalSupportPage,
        mainContactPage,
        bookingMethodPage,
        checkYourBookingPage,
        bookingConfirmationPage }) => {
        test.slow()

        await test.step('Sign in and navigate to booking flow', async () => {
            await loginPage.signInWith(UserType.USER_ONE)
            await homePage.checkOnPage('Manage prison visits - Manage prison visits')
            await homePage.selectBookOrChangeVisit()
            await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
            await searchPage.enterPrisonerNumber('A6036DZ')
            await searchPage.selectPrisonerformResults()
            await prisonerDetailsPage.clickOnBookAPrisonVisit()
        })

        await test.step('Complete booking flow with validations', async () => {
            await selectorVisitorPage.selectFirstVisitor()
            await selectorVisitorPage.continueToNextPage()
            await selectDateTimePage.selectFirstAvailableSlot()
            await selectDateTimePage.continueToNextPage()
            await additionalSupportPage.selectNoAdditionalSupportRequired()
            await additionalSupportPage.continueToNextPage()

            await mainContactPage.continueToNextPage()
            const noContactErrorMsg = await mainContactPage.getNoContactErrorMsg()
            expect(noContactErrorMsg).toContain('No main contact selected')

            await mainContactPage.selectMainContactForBooking()
            await mainContactPage.selectNoPhoneNumberProvided()
            const mainContact = await mainContactPage.getMainContactName()
            await mainContactPage.continueToNextPage()

            await bookingMethodPage.selectBookingMethod()
            await bookingMethodPage.continueToNextPage()

            const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
            expect(mainContactNameOnDetails).toContain(mainContact)
            await checkYourBookingPage.selectSubmitBooking()

            const visitReference = await bookingConfirmationPage.getReferenceNumber()
            GlobalData.set('visitReference', visitReference)
            console.log('Confirmation message:', visitReference)
        })
    })

    test.afterAll('Teardown test data', async ({ request }) => {
        const visitRefs = GlobalData.getAll('visitReference')
        for (const visitId of visitRefs) {
            try {
                await deleteVisit({ request }, visitId);
                console.log(`Visit with reference ${visitId} deleted.`)
            } catch (error) {
                console.error(`Failed to delete visit with reference ${visitId}:`, error)
            }
        }
        GlobalData.clear()
        console.log('Global data cache cleared.')
    })
})
