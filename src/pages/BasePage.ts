import { Page, Locator, expect } from '@playwright/test'
import GlobalData from '../setup/GlobalData'

let deviceName: string | undefined

export abstract class BasePage {
    protected readonly page: Page
    private readonly pageHeader: Locator

    constructor(page: Page) {
        this.page = page
        deviceName = GlobalData.get('deviceName')
        this.pageHeader = page.locator('h1', { hasText: 'Sign in' })
    }

    private async waitForPageToLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle')
    }
    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url)
        await this.waitForPageToLoad()
    }

    async checkOnPage(title: string): Promise<void> {
       const text =  await this.page.title()
        expect(text).toBe(title)
    }
}