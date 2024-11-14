import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class HomePage extends BasePage {
    private readonly bookOrChangeaVisit: Locator
    private readonly visitsByDateLink: Locator

    constructor(page: Page) {
        super(page)
        this.bookOrChangeaVisit = page.locator('[href*="/search/prisoner"]')
        this.visitsByDateLink = page.getByRole('link', { name: 'View visits by date' })
    }

    async displayBookOrChangeaVisit(): Promise<void> {
        await this.bookOrChangeaVisit.isVisible()
    }

    async selectBookOrChangeVisit(): Promise<void> {
        await this.bookOrChangeaVisit.click()
    }
    async clickOnVisitsByDate(): Promise<void> {
        await this.visitsByDateLink.click()
    }
}
