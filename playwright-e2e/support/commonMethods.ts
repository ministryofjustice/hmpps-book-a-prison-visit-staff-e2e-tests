import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import { UserType } from './UserType'
import GlobalData from '../setup/GlobalData'
import { deleteVisit } from './testingHelperClient'
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

export const teardownTestData = async (request: APIRequestContext) => {
    try {
        let visitRef = GlobalData.getAll('visitReference');
        for (const visitId of visitRef) {
            await deleteVisit({ request }, visitId);
        }
    } finally {
        // Clear global data cache
        GlobalData.clear();
        console.log('Global data cache cleared.');
    }
}
