import { BasePage } from "./BasePage"
import { Locator, Page } from "@playwright/test"

export default class PrisonerDetailsPage extends BasePage {
    private readonly bookAPrisonVisit: Locator

    constructor(page: Page) {
        super(page)
        this.bookAPrisonVisit = page.getByRole('button', { name: 'Book a prison visit' })
    }

    async clickOnBookAPrisonVisit(): Promise<void> {
        await this.bookAPrisonVisit.click()
    }

}
