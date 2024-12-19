import { Page, Locator, expect } from '@playwright/test'
import GlobalData from '../setup/GlobalData'

let deviceName: string | undefined

export abstract class BasePage {
    protected readonly page: Page
    private readonly pageHeader: Locator
    protected readonly continueButton: Locator
    private readonly accountMenu: Locator
    private readonly yourAccountLink: Locator
    private readonly signOutLink: Locator
    private readonly submitButton : Locator

    constructor(page: Page) {
        this.page = page
        deviceName = GlobalData.get('deviceName')
        this.pageHeader = page.locator('h1')
        this.continueButton = page.getByRole('button', { name: 'Continue' })
        this.accountMenu = page.locator('[class$=connect-dps-common-header__user-menu-toggle]')
        this.signOutLink = page.getByRole('link', { name: 'Sign out' })
        this.yourAccountLink = page.getByRole('link', { name: 'Your account' })
        this.submitButton = page.getByRole('button', { name: 'Submit' })
    }

    private async waitForPageToLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle')
    }
    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url)
        await this.waitForPageToLoad()
    }
    async checkOnPage(title: string): Promise<void> {
        const text = await this.page.title()
        expect(text).toBe(title)
    }
    async headerOnPage(header: string): Promise<void> {
        const text = this.pageHeader
        expect(text).toHaveText(header)
    }
    async continueToNextPage(): Promise<void> {
        await this.continueButton.click()
    }
    async signOut(): Promise<void> {
        await this.accountMenu.click()
        await this.signOutLink.click()
    }

    async clickOnSubmitButton(): Promise<void> {
        await this.submitButton.click()
    }
    
    async pageHasText(textToVerify: string): Promise<boolean> {
        // Wait for the text to be visible on the page
        const isVisible = await this.page.locator(`text=${textToVerify}`).isVisible()
        // Return whether the text is visible
        return isVisible;
    }
}
