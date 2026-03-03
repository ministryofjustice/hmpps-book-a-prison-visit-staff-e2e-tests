import { test, expect } from '../fixtures/PageFixtures'
import Constants from '../setup/Constants'
import GlobalData from '../setup/GlobalData'
import { createSessionTemplate, getAccessToken, deleteTemplate } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'
import { loginAndNavigate, teardownTestData, registerPrisonerForCleanup } from '../support/commonMethods'

test.describe('Staff should be able to book slots for various categories', () => {
  // Set up global data before each test
  test.beforeEach(
    'Get access token and store so it is available as global data',
    async ({ request, page }, testInfo) => {
      GlobalData.set('authToken', await getAccessToken({ request }))
      GlobalData.set('deviceName', testInfo.project.name)

      // Use common login and navigation before each test
      await loginAndNavigate(page, UserType.USER_FOUR)
    },
  )

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
    request,
  }) => {
    test.slow()
    // register prisoner for clean up
    await registerPrisonerForCleanup(Constants.PRISONER_THREE)

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
      null,
      null,
      'FEMALE_CLOSED',
      false,
      'Automation Tests',
      sessionEndTime,
    )
    expect(templateStatus).toBe(201)
    expect(templateId).toBeTruthy()

    // Track created template
    const createdTemplates = GlobalData.get('createdTemplates') || []
    createdTemplates.push(templateId)
    GlobalData.set('createdTemplates', createdTemplates)

    // Search for a prisoner
    await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
    await searchPage.enterPrisonerNumber(Constants.PRISONER_THREE)
    await searchPage.selectPrisonerfromResults()
    const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
    expect(prisonerCat).toContain('Fem Closed')
    await prisonerDetailsPage.clickOnBookAPrisonVisit()

    // Select visitor and time slot
    expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
    await selectorVisitorPage.selectFirstVisitor()
    await selectorVisitorPage.continueToNextPage()

    expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
    await selectDateTimePage.selectFirstAvailableSlot()
    await selectDateTimePage.continueToNextPage()

    // Additional support info
    expect(
      await additionalSupportPage.checkOnPage(
        'Is additional support needed for any of the visitors? - Manage prison visits - DPS',
      ),
    )
    await additionalSupportPage.selectNoAdditionalSupportRequired()
    await additionalSupportPage.continueToNextPage()

    // Main contact info
    await mainContactPage.checkOnPage('Who is the main contact for this booking? - Manage prison visits - DPS')
    await mainContactPage.selectMainContactForBooking()
    await mainContactPage.selectNoPhoneNumberProvided()
    const mainContact = await mainContactPage.getMainContactName()
    await mainContactPage.continueToNextPage()

    // Booking method
    await bookingMethodPage.checkOnPage('How was this booking requested? - Manage prison visits - DPS')
    await bookingMethodPage.selectBookingMethod()
    await bookingMethodPage.continueToNextPage()

    // Verify & confirm booking
    await checkYourBookingPage.checkOnPage('Check the visit details before booking - Manage prison visits - DPS')
    const mainContactNameOnDetails = await checkYourBookingPage.getMainContactName()
    expect(mainContactNameOnDetails).toContain(mainContact)
    await checkYourBookingPage.selectSubmitBooking()
    await bookingConfirmationPage.checkOnPage('Visit confirmed - Manage prison visits - DPS')
    expect(await bookingConfirmationPage.displayBookingConfirmation()).toBeTruthy()
    const visitReference = await bookingConfirmationPage.getReferenceNumber()
    await bookingConfirmationPage.signOut()

    // Store visit reference for teardown
    GlobalData.set('visitReference', visitReference)
    console.debug('Confirmation message:', visitReference)
  })

  test("Slots that do not match a prisoner's category are not displayed", async ({
    searchPage,
    prisonerDetailsPage,
    selectorVisitorPage,
    selectDateTimePage,
    request,
  }) => {
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
      null,
      null,
      'A_HIGH',
      false,
      'Automation Tests',
      sessionEndTime,
    )
    expect(templateStatus).toBe(201)
    expect(templateId).toBeTruthy()

    // Track created template
    const createdTemplates = GlobalData.get('createdTemplates') || []
    createdTemplates.push(templateId)
    GlobalData.set('createdTemplates', createdTemplates)

    // Search for prisoner
    await searchPage.checkOnPage('Search for a prisoner - Manage prison visits - DPS')
    await searchPage.enterPrisonerNumber(Constants.PRISONER_THREE)
    await searchPage.selectPrisonerfromResults()
    const prisonerCat = await prisonerDetailsPage.getPrisonerCategory()
    expect(prisonerCat).toContain('Fem Closed')
    await prisonerDetailsPage.clickOnBookAPrisonVisit()

    // Select visitor
    expect(await selectorVisitorPage.checkOnPage('Select visitors - Manage prison visits - DPS'))
    await selectorVisitorPage.selectFirstVisitor()
    await selectorVisitorPage.continueToNextPage()

    // Slot should not be displayed
    expect(await selectDateTimePage.checkOnPage('Select date and time of visit - Manage prison visits - DPS'))
    expect(await selectDateTimePage.getDisplayedSlots()).not.toContain(sessionSlotTime.toISOString())

    await selectDateTimePage.signOut()
  })

  // Teardown after each test
  test.afterEach('Teardown test data', async ({ request }) => {
    await teardownTestData(request)
  })

  // Delete created session templates and clear global cache
  test.afterAll('Delete created session templates and clear global cache', async ({ request }) => {
    const createdTemplates = GlobalData.get('createdTemplates') || []
    for (const templateId of createdTemplates) {
      const status = await deleteTemplate({ request }, templateId)
      console.log(`Deleted template ${templateId}, status: ${status}`)
    }

    GlobalData.clear()
    console.log('Global data cache cleared.')
  })
})
