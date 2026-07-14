import { format } from 'date-fns'
import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'
import { createSessionTemplate, deleteTemplate, getAccessToken } from '../support/testingHelperClient'
import { UserType } from '../support/UserType'
import Constants from '../setup/Constants'

test.beforeAll('Get access token and store so it is available as global data', async ({ request }, testInfo) => {
  GlobalData.set('authToken', await getAccessToken({ request }))
  GlobalData.set('deviceName', testInfo.project.name)
})

test.describe('Staff should be able to block dates for social visits', () => {
  // Set up test date for block
  const today = new Date()
  const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const blockDate = format(firstOfNextMonth, 'dd/MM/yyyy')
  const blockDateFormatted = format(firstOfNextMonth, 'EEEE d MMMM yyyy')

  test.beforeAll(async ({ request}) => {
    // Create a session template for the day to be blocked
    // to ensure the full day / single session screen is shown
    const sessionSlotTime = firstOfNextMonth
    sessionSlotTime.setHours(9, 0, 0, 0)
    const sessionEndTime = new Date(sessionSlotTime)
    sessionEndTime.setHours(10, 0, 0, 0)

    const { status: templateStatus, templateId } = await createSessionTemplate(
      { request },
      sessionSlotTime,
      Constants.PRISON_ONE_CODE,
      1,
      0,
      1,
      null,
      null,
      'FEMALE_CLOSED',
      false,
      'Automation Tests - date block',
      sessionEndTime,
    )
    expect(templateStatus).toBe(201)
    expect(templateId).toBeTruthy()

    // Track created template
    const createdTemplates = GlobalData.get('createdTemplates') || []
    createdTemplates.push(templateId)
    GlobalData.set('createdTemplates', createdTemplates)
  })

  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigateTo('/')
    await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
    await loginPage.signInWith(UserType.USER_THREE)
    await homePage.checkOnPage('Social visits - DPS')
  })

  test('Block a visit date', async ({ homePage, blockVisitDatePage }) => {
    // Navigate to the Block Visit Dates page
    await homePage.clickOnBlockVisitDates()
    await blockVisitDatePage.checkOnPage('Block visit dates or sessions - Social visits - DPS')
    expect(await blockVisitDatePage.headerOnPage('Block visit dates or sessions')).toBeTruthy

    // Block a specific date
    await blockVisitDatePage.enterDateToBlock(blockDate)
    await blockVisitDatePage.continueToNextPage()
    expect(
      await blockVisitDatePage.headerOnPage(`Are you sure you want to block visits on ${blockDateFormatted}?`),
    ).toBeTruthy

    // Full day or session block? Select full day
    expect(
      await blockVisitDatePage.headerOnPage(`What would you like to block on ${blockDateFormatted}?`),
    ).toBeTruthy
    await blockVisitDatePage.selectFullDay()
    await blockVisitDatePage.continueToNextPage()

    // Confirm the block
    await blockVisitDatePage.confirmBlockDate()
    await blockVisitDatePage.continueToNextPage()
    expect(await blockVisitDatePage.confirmationMessage(`Visits are blocked for ${blockDateFormatted}.`))
      .toBeTruthy

    await blockVisitDatePage.signOut()
  })
  
  test('Unblock a visit date', async ({ homePage, blockVisitDatePage }) => {
    // Navigate to Block Visit Dates page
    await homePage.clickOnBlockVisitDates()
    await blockVisitDatePage.checkOnPage('Block visit dates or sessions - Social visits - DPS')
    expect(await blockVisitDatePage.headerOnPage('Block visit dates or sessions')).toBeTruthy

    // Block the date and verify error message
    await blockVisitDatePage.enterDateToBlock(blockDate)
    await blockVisitDatePage.continueToNextPage()
    expect(await blockVisitDatePage.errorMsg('The full day is already blocked for the date entered')).toBeTruthy

    // Unblock the date and verify confirmation message
    await blockVisitDatePage.unBlockDate()
    expect(await blockVisitDatePage.confirmationMessage(`Visits are unblocked for ${blockDateFormatted}.`))
      .toBeTruthy

    // Sign out
    await blockVisitDatePage.signOut()
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
