import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class HomePage extends BasePage {
    private readonly bookOrChangeaVisit: Locator

    constructor(page: Page) {
        super(page)
        this.bookOrChangeaVisit = page.locator('[href*="/search/prisober"]')
    }

    async displayBookOrChangeaVisit(): Promise<void> {
        await this.bookOrChangeaVisit.isVisible()
    }
}
