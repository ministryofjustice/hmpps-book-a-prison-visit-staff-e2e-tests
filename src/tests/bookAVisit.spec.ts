import { test, expect } from '../fixtures/PageFixtures'
import GlobalData from '../setup/GlobalData'

test.describe('Staff UI health check', () => {

    test.beforeEach(async ({ loginPage, }) => {
        await loginPage.navigateTo('/')
        await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
        await loginPage.signInWith('VSIP1_TST', 'Expired19')
    })

    test('Verify links', async ({ homePage }) => {
        await homePage.displayBookOrChangeaVisit()
        await homePage.checkOnPage('Manage prison visits - Manage prison visits')
    })

})

