import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { deleteVisit, getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Display error messages', () => {

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
    })

    test('Error messages on the search page', async ({
        searchPage,
        homePage,
        loginPage
    }) => {
        await loginPage.signInWith(UserType.USER_ONE)
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
        await homePage.selectBookOrChangeVisit()
        await searchPage.clickOnSearch()
        const errorMessage = await searchPage.getErrorMessage()
        expect(errorMessage).toContain('You must enter at least 2 characters')
        await searchPage.clickOnSearchByBookingRef()
        await searchPage.headerOnPage('Search for a booking')
        await searchPage.clickOnSearch()
        const invalidRefError = await searchPage.getInvalidRefErrorMessage()
        expect(invalidRefError).toContain('Booking reference must be 8')
        await searchPage.signOut()
    })

    test('Error messages on view Visits by date page', async ({
        homePage,
        visitByDatesPage,
        loginPage
    }) => {
        await loginPage.signInWith(UserType.USER_ONE)
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
        await homePage.clickOnVisitsByDate()
        await visitByDatesPage.headerOnPage('View visits by date')
        await visitByDatesPage.clickOncViewAnotherDate()
        await visitByDatesPage.clickOncViewButton()
        const dateErrorMsg = await visitByDatesPage.getInvalidDateErrorMessage()
        expect(dateErrorMsg).toContain('Enter a valid date')
        await visitByDatesPage.signOut()
    })

    test("Error messages on 'select Open or Closed visit type page' ", async ({
        homePage,
        loginPage,
        searchPage,
        prisonerDetailsPage,
        selectorVisitorPage,
        visitTypePage,

    }) => {
        await loginPage.signInWith(UserType.USER_FOUR)
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
        await homePage.selectBookOrChangeVisit()
        await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
        await searchPage.enterPrisonerNumber('A8899DZ')
        await searchPage.selectPrisonerformResults()
        await prisonerDetailsPage.clickOnBookAPrisonVisit()
        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()
        await visitTypePage.headerOnPage("Check the prisoner's closed visit restrictions")
        await visitTypePage.continueToNextPage()
        const visitTypeErrorMsg = await visitTypePage.getVisitTypeErrorMessage()
        expect(visitTypeErrorMsg).toContain('No visit type selected')
        await visitTypePage.signOut()
    })
   
    test('Verify error messages on main contact page and then complete a booking ', async ({
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
        bookingConfirmationPage

    }) => {
        test.slow()

        await loginPage.signInWith(UserType.USER_ONE)
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
        await homePage.selectBookOrChangeVisit()

        await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')
        await searchPage.enterPrisonerNumber('A6036DZ')
        await searchPage.selectPrisonerformResults()

        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.selectFirstAvailableSlot()
        await selectDateTimePage.continueToNextPage()

        expect(await additionalSupportPage.checkOnPage('Manage prison visits - Is additional support needed for any of the visitors?'))
        expect(await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        await mainContactPage.checkOnPage('Manage prison visits - Who is the main contact for this booking?')
        expect(await mainContactPage.headerOnPage('Who is the main contact for this booking?'))
        await mainContactPage.continueToNextPage()
        const noContactErrorMsg = await mainContactPage.getNoContactErrorMsg()
        expect(noContactErrorMsg).toContain('No main contact selected')

        await mainContactPage.selectMainContactForBooking()
        await mainContactPage.selectNoPhoneNumberProvided()
        const mainContact = await mainContactPage.getMainContactName()
        await mainContactPage.continueToNextPage()

        await bookingMethodPage.checkOnPage('Manage prison visits - How was this booking requested?')
        expect(await bookingMethodPage.headerOnPage('How was this booking requested?'))
        await bookingMethodPage.selectBookingMethod()
        await bookingMethodPage.continueToNextPage()

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

        GlobalData.set('visitReference', visitReference)
        console.log('Confirmation message:', visitReference)

    })  

})

test.afterAll('Teardown test data', async ({ request }) => {
    let visitRef = GlobalData.getAll('visitReference')
    for (const visitId of visitRef) {
        await deleteVisit({ request }, visitId)
    }
})

