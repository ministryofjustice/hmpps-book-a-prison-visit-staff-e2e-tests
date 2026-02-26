import { test, expect } from '../fixtures/PageFixtures'
import {
  createApplication,
  getAccessToken,
  createVisit,
  createSessionTemplate,
  deleteTemplate,
} from '../support/testingHelperClient'
import { IApplication } from '../support/data/IApplication'
import GlobalData from '../setup/GlobalData'
import { teardownTestData, registerPrisonerForCleanup } from '../support/commonMethods'
import Constants from '../setup/Constants'
import { UserType } from '../support/UserType'
import prisonerDetails from '../support/data/fixtures/prisonerDetails.json'
import { format } from 'date-fns'

test.describe('Approve a requested visit', () => {
  test.beforeAll('Get access token', async ({ request }, testInfo) => {
    const token = await getAccessToken({ request })
    GlobalData.set('authToken', token)
    GlobalData.set('deviceName', testInfo.project.name)
  })

  test('Create visit via API and verify via Staff UI', async ({
    request,
    loginPage,
    homePage,
    requestedVisitsPage,
    visitDetailsPage,
  }, testInfo) => {
    test.slow()

    // register prisoner for clean up
    await registerPrisonerForCleanup(prisonerDetails.prisonerId)
    
    // ---------------- API FLOW ----------------
    // 1. Create session template
    const sessionSlotTime = new Date()
    sessionSlotTime.setDate(sessionSlotTime.getDate() + 3)
    sessionSlotTime.setHours(16, 25, 0, 0)

    const sessionEndTime = new Date(sessionSlotTime)
    sessionEndTime.setHours(18, 25, 0, 0) // hour slot

    const { status: templateStatus, templateId } = await createSessionTemplate(
      { request },
      sessionSlotTime,
      Constants.PRISON_ONE_CODE,
      1,
      0,
      1,
      null,
      null,
      null,
      false,
      'Automation Tests',
      sessionEndTime,
    )

    console.log('Template ID:', templateId)

    expect(templateStatus).toBe(201)
    expect(templateId).toBeTruthy()
    GlobalData.set('templateId', templateId)

    // 2. Create application
    const application: IApplication = {
      prisonCode: prisonerDetails.prisonCode,
      prisonerId: prisonerDetails.prisonerId,
      sessionDate: format(sessionSlotTime, 'yyyy-MM-dd'), // match template date
      sessionStart: '16:25:00', // match template start
      sessionEnd: '18:25:00', // match template end
      userType: 'STAFF',
      contactName: 'IC',
      visitors: [prisonerDetails.visitorId],
      visitRestriction: 'OPEN',
    }

    const createApplicationResponse = await createApplication({ request }, application)
    expect(createApplicationResponse.status).toBe(200)

    const applicationRef = createApplicationResponse.applicationRef
    expect(applicationRef).toBeTruthy()
    GlobalData.set('applicationReference', applicationRef)

    await testInfo.attach('Application created', {
      body: `Application reference: ${applicationRef}`,
      contentType: 'text/plain',
    })

    // 3. Book visit
    const createVisitResponse = await createVisit({ request }, applicationRef)
    expect(createVisitResponse.status).toBe(200)
    expect(createVisitResponse.visitRef).toBeTruthy()

    GlobalData.set('visitReference', createVisitResponse.visitRef)

    await testInfo.attach('Visit created', {
      body: `Visit reference: ${createVisitResponse.visitRef}`,
      contentType: 'text/plain',
    })

    // ---------------- UI FLOW ----------------
    await loginPage.navigateTo('/')
    await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
    await loginPage.signInWith(UserType.USER_ONE)

    await homePage.displayBookOrChangeaVisit()
    await homePage.checkOnPage('Manage prison visits - DPS')
    await homePage.clickOnRequestedVisits()
    expect(await requestedVisitsPage.checkOnPage('Requested visits - Manage prison visits - DPS'))
    await requestedVisitsPage.clickViewLinkForPrisoner(prisonerDetails.prisonerId)
    await visitDetailsPage.approveVisit()
    expect(await requestedVisitsPage.verifyAlertText('You approved the request and booked '))

    const visitReference = GlobalData.get('visitReference')
    expect(visitReference).toBeTruthy()
    await testInfo.attach('Visit searched in UI', {
      body: `Verified visit with reference: ${visitReference}`,
      contentType: 'text/plain',
    })
  })

  test.afterAll('Teardown', async ({ request }, testInfo) => {
    // Keep templateId safe
    const templateId = GlobalData.get('templateId')
    const authToken = GlobalData.get('authToken')

    // 1. Delete all visits first
    await teardownTestData(request)

    // 2. Delete the template if we have the templateId
    if (templateId) {
      GlobalData.set('authToken', authToken) // restore token
      const deleteStatus = await deleteTemplate({ request }, templateId)

      if (deleteStatus === 200) {
        await testInfo.attach('Template deleted', {
          body: `Deleted session template: ${templateId}`,
          contentType: 'text/plain',
        })
      } else {
        console.warn(`Template deletion failed (visits might still exist). Status: ${deleteStatus}`)
        await testInfo.attach('Template deletion skipped', {
          body: `Could not delete template ${templateId}, status: ${deleteStatus}`,
          contentType: 'text/plain',
        })
      }
    } else {
      console.warn('No template ID found, skipping template deletion.')
    }

    // 3. Clear global data at the very end
    GlobalData.clear()
    console.log('Global data cache cleared.')
  })
})
