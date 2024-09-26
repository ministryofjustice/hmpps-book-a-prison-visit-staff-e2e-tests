import { expect, test } from '../../fixtures/PageFixtures'

test('test', async ({ loginPage }) => {
    await loginPage.navigateTo('/')
    await loginPage.checkOnPage('HMPPS Digital Services - Sign in')
    await loginPage.setAuthCookiesInStorage('playwright/.auth/auth.json')
})
