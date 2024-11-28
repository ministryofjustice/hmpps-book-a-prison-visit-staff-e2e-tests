import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { clearVisits, deleteVisit, getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
    GlobalData.set('authToken', await getAccessToken({ request }))
    GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should not be able to book visits for non-assocaition prisoners', () => {

    test.beforeEach(async ({ loginPage, homePage }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith(UserType.USER_THREE)
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')

    })

    test("No slots should be enabled to book a visit for a 'non-association' prisoners", async ({
        homePage,
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
        await homePage.clickOnChangeEstablishment()
        await homePage.selectEstablishment('Bristol (HMP)')
        await homePage.clickOnSubmitButton()

        await homePage.clickOnManagePrisonVisits()
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
        await homePage.selectBookOrChangeVisit()

        // Switching the URL to 'staging' because selecting 'Change Establishment' sets the environment to 'Dev',
        // and DSP does not have a 'Staging' environment.

        await homePage.navigateTo('/')
        await homePage.selectBookOrChangeVisit()
        await searchPage.checkOnPage('Manage prison visits - Search for a prisoner')

        await searchPage.enterPrisonerNumber('A6038DZ')
        await searchPage.selectPrisonerformResults()

        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.selectNonAssociationTimeSlot()
        await selectDateTimePage.continueToNextPage()

        expect(await additionalSupportPage.checkOnPage('Manage prison visits - Is additional support needed for any of the visitors?'))
        expect(await additionalSupportPage.headerOnPage('Is additional support needed for any of the visitors?'))
        await additionalSupportPage.selectNoAdditionalSupportRequired()
        await additionalSupportPage.continueToNextPage()

        await mainContactPage.checkOnPage('Manage prison visits - Who is the main contact for this booking?')
        expect(await mainContactPage.headerOnPage('Who is the main contact for this booking?'))
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
        const prisonerNum = await bookingConfirmationPage.getPrisonerNumber()

        GlobalData.set('visitReference', visitReference)
        GlobalData.set('prisonerNum', prisonerNum)
        console.log('Confirmation message:', visitReference)
        console.log('Prisoner number is:', prisonerNum)

        // Book a visit for a non-association prisoner - A6541DZ & A6038DZ are non-association prisoners

        await bookingConfirmationPage.clickOnManagePrisonVisits()
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
        await homePage.selectBookOrChangeVisit()
        await searchPage.enterPrisonerNumber('A6541DZ')
        await searchPage.selectPrisonerformResults()

        await prisonerDetailsPage.clickOnBookAPrisonVisit()

        expect(await selectorVisitorPage.checkOnPage('Manage prison visits - Select visitors from the prisoner’s approved visitor list'))
        await selectorVisitorPage.selectFirstVisitor()
        await selectorVisitorPage.continueToNextPage()

        expect(await selectDateTimePage.checkOnPage('Manage prison visits - Select date and time of visit'))
        expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
        await selectDateTimePage.assertLastSelectedDateTimeNotDisplayed()
        await selectDateTimePage.clearContext()
        await selectDateTimePage.signOut()

    })
})

test.afterAll('Teardown test data', async ({ request }) => {
    const prisonerNumRefs = GlobalData.getAll('prisonerNum')
    for (const priNum of prisonerNumRefs) {
        try {
            await clearVisits({ request }, priNum)
        } catch (error) {
            console.error(`Failed to clear visits for prisoner number: ${priNum}`, error)
        }
    }
})