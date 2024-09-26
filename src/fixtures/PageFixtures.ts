import { test as baseTest, expect } from '@playwright/test'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'

type PageFixtures = {
    loginPage: LoginPage
    homePage: HomePage
}

const test = baseTest.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page))
    }
})

export { test, expect }