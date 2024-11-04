import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class HomePage extends BasePage {
    private readonly bookOrChangeaVisit: Locator

    constructor(page: Page) {
        super(page)
        this.bookOrChangeaVisit = page.locator('[href*="/search/prisoner"]')
    }

    async displayBookOrChangeaVisit(): Promise<void> {
        await this.bookOrChangeaVisit.isVisible()
    }

    async selectBookOrChangeVisit(): Promise<void> {
        await this.bookOrChangeaVisit.click()
    }
}
