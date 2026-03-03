import { test, expect } from '../fixtures/PageFixtures'
import Constants from '../setup/Constants'
import GlobalData from '../setup/GlobalData'
import { teardownTestData, registerPrisonerForCleanup } from '../support/commonMethods'
import { excludeDate, getAccessToken, removeExcludeDate } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'
import { parse, format } from 'date-fns'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
  GlobalData.set('authToken', await getAccessToken({ request }))
  GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to view dates that have been excluded and amend reviews as required', () => {
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigateTo('/')
    await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
    await loginPage.signInWith(UserType.USER_THREE)
    await homePage.displayBookOrChangeaVisit()
    await homePage.checkOnPage('Manage prison visits - DPS')
    await homePage.clickOnChangeEstablishment()
    await homePage.selectEstablishment('Hewell (HMP)')
    await homePage.clickOnSubmitButton()
    await homePage.clickOnManagePrisonVisits()
    await homePage.displayBookOrChangeaVisit()
    await homePage.checkOnPage('Manage prison visits - DPS')
    await homePage.selectBookOrChangeVisit()

    // Switching the URL to 'staging' because selecting 'Change Establishment' sets the environment to 'Dev',
    // and DSP does not have a 'Staging' environment.
    await homePage.navigateTo('/')
    await homePage.selectBookOrChangeVisit()
  })

  test('Exclude the booking date once booked and review the reason for the notification.', async ({
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
    needReviewPage,
    homePage
  }) => {
    test.slow()
    // register prisoner for clean up
    await registerPrisonerForCleanup(Constants.PRISONER_TWO)

    await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
    await searchPage.enterPrisonerNumber(Constants.PRISONER_TWO)
    await searchPage.selectPrisonerfromResults()

    await prisonerDetailsPage.clickOnBookAPrisonVisit()

    expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
    await selectorVisitorPage.selectFirstVisitor()
    await selectorVisitorPage.continueToNextPage()

    expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
    expect(await selectDateTimePage.headerOnPage('Select date and time of visit'))
    await selectDateTimePage.selectFirstAvailableSlot()
    await selectDateTimePage.continueToNextPage()

    expect(
      await additionalSupportPage.checkOnPage(
        'Is additional support needed for any of the visitors? - Manage prison visits - DPS',
      ),
    )
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

    await bookingConfirmationPage.checkOnPage('Visit confirmed - Manage prison visits - DPS')
    expect(await bookingConfirmationPage.headerOnPage('Visit confirmed'))
    expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
    const visitReference = await bookingConfirmationPage.getReferenceNumber()
    const visitDate = await bookingConfirmationPage.getVisitBookedForDate()
    console.log('Visit Date is:', visitDate)

    // Fix: parse visitDate correctly and construct UTC-safe exclude date
    const parsedDate = parse(visitDate, 'EEEE d MMMM yyyy', new Date())
    const dateToExclude = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()))
    console.log('Corrected excludeDate:', dateToExclude.toISOString())

    // Add Exclude date event
    const status = await excludeDate({ request }, Constants.PRISON_ONE_CODE, dateToExclude)
    expect(status).toBe(201)

    await bookingConfirmationPage.clickOnManagePrisonVisits()
    await homePage.clickNeedReview()
    await needReviewPage.clickNeedReviewList()
    expect(await needReviewPage.reviewResonsListIsVisible()).toBe(true)
    // await needReviewPage.clickViewReasonLink()
    expect(await needReviewPage.reviewReasonsListContains('Time slot removed'))
    await bookingConfirmationPage.signOut()

    // Remove Exclude date event (optional cleanup)
    const removeExludeDatestatus = await removeExcludeDate({ request }, Constants.PRISON_ONE_CODE, dateToExclude)
    expect(removeExludeDatestatus).toBe(201)

    GlobalData.set('visitReference', visitReference)
    console.debug('Confirmation message:', visitReference)
  })

  test.afterAll('Teardown test data', async ({ request }) => {
    await teardownTestData(request)
  })
})
