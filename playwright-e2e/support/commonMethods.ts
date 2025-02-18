import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import { UserType } from './UserType'

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
