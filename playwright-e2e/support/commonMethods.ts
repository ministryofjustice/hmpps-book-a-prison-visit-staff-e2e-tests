import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import { UserType } from './UserType'
import GlobalData from '../setup/GlobalData'
import { deleteVisit, clearVisits} from './testingHelperClient'
import { APIRequestContext } from '@playwright/test'

export const loginAndNavigate = async (page: any, userType: UserType) => {
    const loginPage = new LoginPage(page)
    const homePage = new HomePage(page)

    await loginPage.navigateTo('/')
    await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
    await loginPage.signInWith(userType)
    await homePage.displayBookOrChangeaVisit()
    await homePage.checkOnPage('Manage prison visits - DPS')
    await homePage.selectBookOrChangeVisit()
}

export const registerPrisonerForCleanup = (prisonerNumber: string) => {
  const prisoners: string[] = GlobalData.get('prisonerNumbers') || []

  if (!prisoners.includes(prisonerNumber)) {
    prisoners.push(prisonerNumber)
    GlobalData.set('prisonerNumbers', prisoners)
  }
}
export const teardownTestData = async (request: APIRequestContext) => {
  try {
    const prisoners: string[] = GlobalData.get('prisonerNumbers') || []

    for (const prisonerNumber of prisoners) {
      const status = await clearVisits({ request }, prisonerNumber)

      if (status !== 200 && status !== 204) {
        console.warn(`Clear visits failed for ${prisonerNumber} - status: ${status}`)
      } else {
        console.log(`Cleared visits for prisoner ${prisonerNumber}`)
      }
    }

  } finally {
    GlobalData.clear()
    console.log('Global data cache cleared.')
  }
}

